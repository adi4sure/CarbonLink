import EcoAction from '../models/EcoAction.js';
import { verifyEcoAction } from '../services/verificationService.js';
import { mintCredits } from '../services/creditService.js';

/**
 * POST /api/eco-actions/:id/verify
 */
export const triggerVerification = async (req, res, next) => {
  try {
    const action = await EcoAction.findById(req.params.id);

    if (!action) {
      return res.status(404).json({ success: false, message: 'Eco-action not found' });
    }

    if (String(action.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (action.verification?.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Action already verified' });
    }

    // Set status to in_review
    action.verification = { ...(action.verification || {}), status: 'in_review' };
    await action.save();

    // Run AI verification
    const result = await verifyEcoAction(action);

    // Update action with results
    action.verification = {
      status: result.status,
      score: result.score,
      notes: result.notes,
      verifiedAt: result.verifiedAt,
      verifiedBy: result.verifiedBy,
    };
    action.co2Estimate = result.co2Estimate;
    await action.save();

    // If approved, mint credits
    let mintResult = null;
    if (result.status === 'approved') {
      action.creditsIssued = true;
      await action.save();
      mintResult = await mintCredits(action, String(action.user));
    }

    res.status(200).json({
      success: true,
      data: {
        action,
        verification: result,
        credits: mintResult ? { amount: result.co2Estimate, txHash: mintResult.transaction.txHash } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/verification/:id
 */
export const getVerificationStatus = async (req, res, next) => {
  try {
    const action = await EcoAction.findById(req.params.id);

    if (!action) {
      return res.status(404).json({ success: false, message: 'Eco-action not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        verification: action.verification,
        co2Estimate: action.co2Estimate,
        type: action.type,
        quantity: action.quantity,
      },
    });
  } catch (error) {
    next(error);
  }
};
