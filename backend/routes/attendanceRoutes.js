import express from 'express';
import {
    getAttendance,
    getAttendanceRecord,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceStats,
    checkIn,
    checkOut
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for employees to check in/out
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);

// Protected routes
router.use(protect);

// Get attendance statistics
router.get('/stats', getAttendanceStats);

// CRUD routes
router.route('/')
    .get(getAttendance)
    .post(createAttendance);

router.route('/:id')
    .get(getAttendanceRecord)
    .put(updateAttendance)
    .delete(authorize('manager', 'hr', 'admin'), deleteAttendance);

export default router;
