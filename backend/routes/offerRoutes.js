import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getOffers, createOffer, updateOffer, deleteOffer, sendOffer, acceptOffer, declineOffer } from '../controllers/offerController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(authorize('hr', 'admin', 'ceo'), getOffers)
    .post(authorize('hr', 'admin', 'ceo'), createOffer);

router.route('/:id')
    .put(authorize('hr', 'admin', 'ceo'), updateOffer)
    .delete(authorize('hr', 'admin', 'ceo'), deleteOffer);

router.post('/:id/send', authorize('hr', 'admin', 'ceo'), sendOffer);
router.post('/:id/accept', authorize('hr', 'admin', 'ceo'), acceptOffer);
router.post('/:id/decline', authorize('hr', 'admin', 'ceo'), declineOffer);

export default router;


