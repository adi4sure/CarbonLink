import { Router } from 'express';
import { register, login, getMe, updateMe, googleAuth } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
