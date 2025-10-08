import express from 'express';
import {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword,
    logout
} from '../controllers/authController.js';
import { demoLogin, demoGetMe } from '../controllers/demoAuthController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Demo routes (work without MongoDB)
router.post('/demo/login', demoLogin);
router.get('/demo/me', demoGetMe);

// Regular routes (require MongoDB)
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

export default router;




