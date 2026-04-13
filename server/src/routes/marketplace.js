import { Router } from 'express';
import { getListings, getListing, createListing, buyListing, cancelListing } from '../controllers/marketplaceController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getListings); // Public: browse listings
router.get('/:id', getListing); // Public: view single listing

// Protected routes
router.post('/', protect, createListing);
router.post('/:id/buy', protect, buyListing);
router.delete('/:id', protect, cancelListing);

export default router;
