import express from 'express';
import {
    getLeaves,
    getLeave,
    createLeave,
    updateLeave,
    updateLeaveStatus,
    deleteLeave
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getLeaves)
    .post(createLeave);

router
    .route('/:id')
    .get(getLeave)
    .put(updateLeave)
    .delete(deleteLeave);

router.put('/:id/status', authorize('manager', 'hr', 'admin'), updateLeaveStatus);

export default router;






