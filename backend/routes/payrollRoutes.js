import express from 'express';
import {
    getPayrolls,
    getPayroll,
    createPayroll,
    updatePayroll,
    processPayroll,
    deletePayroll,
    getPayrollStats
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('hr', 'admin', 'ceo'), getPayrollStats);

router
    .route('/')
    .get(authorize('hr', 'admin', 'ceo'), getPayrolls)
    .post(authorize('hr', 'admin', 'ceo'), createPayroll);

router
    .route('/:id')
    .get(getPayroll)
    .put(authorize('hr', 'admin', 'ceo'), updatePayroll)
    .delete(authorize('admin', 'ceo'), deletePayroll);

router.put('/:id/process', authorize('hr', 'admin', 'ceo'), processPayroll);

export default router;






