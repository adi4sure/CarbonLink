import { Credit, Transaction, Listing } from '../models/Credit.js';
import User from '../models/User.js';
import { generateTxHash } from '../utils/hashGenerator.js';

/**
 * GET /api/marketplace
 */
export const getListings = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, actionType } = req.query;

    let listings = await Listing.find({ status: 'active' });

    // Apply filters manually
    if (minPrice) listings = listings.filter(l => l.pricePerKg >= parseFloat(minPrice));
    if (maxPrice) listings = listings.filter(l => l.pricePerKg <= parseFloat(maxPrice));
    if (actionType) listings = listings.filter(l => l.actionType === actionType);

    // Sort by newest
    listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Attach seller info
    for (const listing of listings) {
      const seller = await User.findById(listing.seller);
      if (seller) {
        listing.seller = { _id: seller._id, name: seller.name, email: seller.email, avatar: seller.avatar };
      }
    }

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/marketplace/:id
 */
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    const seller = await User.findById(listing.seller);
    if (seller) {
      listing.seller = { _id: seller._id, name: seller.name, email: seller.email, avatar: seller.avatar };
    }
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/marketplace
 */
export const createListing = async (req, res, next) => {
  try {
    const { amount, pricePerKg, description, actionType } = req.body;

    if (!amount || !pricePerKg || amount <= 0 || pricePerKg <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid amount and price' });
    }

    const seller = await User.findById(req.user._id);
    if (seller.creditBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient credit balance to list' });
    }

    const totalPrice = Math.round(amount * pricePerKg * 100) / 100;

    const listing = await Listing.create({
      seller: req.user._id,
      amount,
      pricePerKg,
      totalPrice,
      description: description || `${amount} kg CO₂ credits for sale`,
      actionType: actionType || 'general',
    });

    // Reserve credits
    await User.findByIdAndUpdate(req.user._id, { $inc: { creditBalance: -amount } });

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/marketplace/:id/buy
 */
export const buyListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Listing is no longer available' });
    }

    if (String(listing.seller) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot buy your own listing' });
    }

    const txHash = generateTxHash();
    const sellerId = typeof listing.seller === 'object' ? listing.seller._id : listing.seller;

    const transaction = await Transaction.create({
      type: 'purchase',
      from: req.user._id,
      to: sellerId,
      amount: listing.amount,
      price: listing.totalPrice,
      txHash,
      listingId: listing._id,
    });

    await Transaction.create({
      type: 'sale',
      from: sellerId,
      to: req.user._id,
      amount: listing.amount,
      price: listing.totalPrice,
      txHash,
      listingId: listing._id,
    });

    // Transfer credits to buyer
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { creditBalance: listing.amount, totalCo2Offset: listing.amount },
    });

    // Record earnings for seller
    await User.findByIdAndUpdate(sellerId, {
      $inc: { totalEarnings: listing.totalPrice },
    });

    // Update listing status
    listing.status = 'sold';
    await listing.save();

    res.status(200).json({
      success: true,
      data: transaction,
      message: `Successfully purchased ${listing.amount} CLC for $${listing.totalPrice}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/marketplace/:id
 */
export const cancelListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const sellerId = typeof listing.seller === 'object' ? listing.seller._id : listing.seller;
    if (String(sellerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Can only cancel active listings' });
    }

    // Return credits to seller
    await User.findByIdAndUpdate(req.user._id, { $inc: { creditBalance: listing.amount } });

    listing.status = 'cancelled';
    await listing.save();

    res.status(200).json({ success: true, message: 'Listing cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
