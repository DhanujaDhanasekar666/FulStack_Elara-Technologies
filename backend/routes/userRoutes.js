import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserStats
} from '../controllers/userController.js';
import { demoGetEmployees, demoAddEmployee } from '../controllers/demoDataController.js';
import { protect, authorize, authorizeHierarchy } from '../middleware/auth.js';

const router = express.Router();

// Demo routes (work without MongoDB)
router.get('/demo', demoGetEmployees);
router.post('/demo', demoAddEmployee);

router.use(protect);

router.get('/stats', authorize('hr', 'admin', 'ceo'), getUserStats);

router
    .route('/')
    .get(authorize('hr', 'admin', 'ceo', 'manager'), getUsers)
    .post(authorize('hr', 'admin', 'ceo'), createUser);

router
    .route('/:id')
    .get(getUser)
    .put(authorizeHierarchy, updateUser)
    .delete(authorizeHierarchy, deleteUser);

export default router;




