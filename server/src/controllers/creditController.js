import { Credit, Transaction } from '../models/Credit.js';
import User from '../models/User.js';
import { getUserCreditSummary, transferCredits } from '../services/creditService.js';

/**
 * GET /api/credits
 */
export const getCredits = async (req, res, next) => {
  try {
    const summary = await getUserCreditSummary(req.user._id);

    const credits = await Credit.find({ owner: req.user._id })
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        summary,
        credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/credits/transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const allTx = await Transaction.find({});
    // Filter for transactions involving this user
    const transactions = allTx
      .filter(tx => String(tx.from) === String(userId) || String(tx.to) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/credits/transfer
 */
export const transfer = async (req, res, next) => {
  try {
    const { toEmail, amount } = req.body;

    if (!toEmail || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide recipient email and valid amount' });
    }

    const recipient = await User.findOne({ email: toEmail });
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    if (String(recipient._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });
    }

    const transaction = await transferCredits(req.user._id, recipient._id, amount);

    res.status(200).json({
      success: true,
      data: transaction,
      message: `Successfully transferred ${amount} CLC to ${recipient.name}`,
    });
  } catch (error) {
    if (error.message === 'Insufficient credit balance') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
