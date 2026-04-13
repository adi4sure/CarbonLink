import { Router } from 'express';
import { getVerificationStatus } from '../controllers/verificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/:id', protect, getVerificationStatus);

export default router;
