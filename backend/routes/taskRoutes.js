import express from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    addComment
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getTasks)
    .post(authorize('manager', 'admin', 'ceo'), createTask);

router
    .route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(authorize('manager', 'admin'), deleteTask);

router.post('/:id/comments', addComment);

export default router;






