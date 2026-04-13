import EcoAction from '../models/EcoAction.js';
import { storeProofPhotos } from '../services/ipfsService.js';
import { calculateCo2Offset } from '../utils/co2Calculator.js';

/**
 * GET /api/eco-actions
 */
export const getEcoActions = async (req, res, next) => {
  try {
    const actions = await EcoAction.find({ user: req.user._id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: actions.length,
      data: actions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/eco-actions/:id
 */
export const getEcoAction = async (req, res, next) => {
  try {
    const action = await EcoAction.findById(req.params.id);

    if (!action) {
      return res.status(404).json({ success: false, message: 'Eco-action not found' });
    }

    if (String(action.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/eco-actions
 */
export const createEcoAction = async (req, res, next) => {
  try {
    const { type, quantity, description, lat, lng } = req.body;

    if (!type || !quantity || !description) {
      return res.status(400).json({ success: false, message: 'Please provide type, quantity, and description' });
    }

    let proof = {
      photos: [],
      gps: { lat: parseFloat(lat) || null, lng: parseFloat(lng) || null },
      timestamp: new Date().toISOString(),
    };

    if (req.files && req.files.length > 0) {
      const { ipfsHash, urls } = await storeProofPhotos(req.files);
      proof.photos = urls;
      proof.ipfsHash = ipfsHash;
    }

    const co2Estimate = calculateCo2Offset(type, parseFloat(quantity));

    const action = await EcoAction.create({
      user: req.user._id,
      type,
      quantity: parseFloat(quantity),
      description,
      proof,
      co2Estimate,
      verification: { status: 'pending' },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/eco-actions/:id
 */
export const deleteEcoAction = async (req, res, next) => {
  try {
    const action = await EcoAction.findById(req.params.id);

    if (!action) {
      return res.status(404).json({ success: false, message: 'Eco-action not found' });
    }

    if (String(action.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (action.verification?.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot delete an approved action' });
    }

    await action.deleteOne();
    res.status(200).json({ success: true, message: 'Eco-action deleted' });
  } catch (error) {
    next(error);
  }
};
