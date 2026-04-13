import { Router } from 'express';
import { getEcoActions, getEcoAction, createEcoAction, deleteEcoAction } from '../controllers/ecoActionController.js';
import { triggerVerification } from '../controllers/verificationController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(protect); // All eco-action routes need auth

router.get('/', getEcoActions);
router.get('/:id', getEcoAction);
router.post('/', upload.array('photos', 5), createEcoAction);
router.delete('/:id', deleteEcoAction);
router.post('/:id/verify', triggerVerification);

export default router;
