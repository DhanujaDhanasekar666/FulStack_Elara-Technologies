import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, approvePromotion, rejectPromotion, schedulePromotion } from '../controllers/promotionController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(authorize('hr', 'admin', 'ceo'), getPromotions)
    .post(authorize('hr', 'admin', 'ceo'), createPromotion);

router.route('/:id')
    .put(authorize('hr', 'admin', 'ceo'), updatePromotion)
    .delete(authorize('hr', 'admin', 'ceo'), deletePromotion);

router.post('/:id/approve', authorize('hr', 'admin', 'ceo'), approvePromotion);
router.post('/:id/reject', authorize('hr', 'admin', 'ceo'), rejectPromotion);
router.post('/:id/schedule', authorize('hr', 'admin', 'ceo'), schedulePromotion);

export default router;


