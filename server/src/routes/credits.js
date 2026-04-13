import { Router } from 'express';
import { getCredits, getTransactions, transfer } from '../controllers/creditController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getCredits);
router.get('/transactions', getTransactions);
router.post('/transfer', transfer);

export default router;
