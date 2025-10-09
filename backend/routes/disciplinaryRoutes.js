import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getActions,
    getAction,
    createAction,
    updateAction,
    deleteAction
} from '../controllers/disciplinaryController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// HR/Admin/CEO can list/create/update; Admin/CEO can delete
router
    .route('/')
    .get(authorize('hr', 'admin', 'ceo'), getActions)
    .post(authorize('hr', 'admin', 'ceo'), createAction);

router
    .route('/:id')
    .get(authorize('hr', 'admin', 'ceo'), getAction)
    .put(authorize('hr', 'admin', 'ceo'), updateAction)
    .delete(authorize('hr', 'admin', 'ceo'), deleteAction);

export default router;


