import express from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getProjects)
    .post(authorize('manager', 'admin', 'ceo'), createProject);

router
    .route('/:id')
    .get(getProject)
    .put(authorize('manager', 'admin', 'ceo'), updateProject)
    .delete(authorize('manager', 'admin', 'ceo'), deleteProject);

export default router;






