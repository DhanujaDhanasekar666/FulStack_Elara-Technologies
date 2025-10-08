import express from 'express';
import {
    getCompanyOverview,
    getRevenueGrowth,
    getEmployeeGrowth,
    getProjectStatus,
    getDepartmentDistribution,
    getTaskTrends,
    getAttendanceTrends,
    getPayrollSummary,
    getKPI
} from '../controllers/analyticsController.js';

const router = express.Router();

import { protect, authorize } from '../middleware/auth.js';

// Protect all routes
router.use(protect);

// All analytics routes require CEO, HR, or Admin access
router.use(authorize('ceo', 'hr', 'admin'));

// Analytics routes
router.get('/overview', getCompanyOverview);
router.get('/revenue-growth', getRevenueGrowth);
router.get('/employee-growth', getEmployeeGrowth);
router.get('/project-status', getProjectStatus);
router.get('/department-distribution', getDepartmentDistribution);
router.get('/task-trends', getTaskTrends);
router.get('/attendance-trends', getAttendanceTrends);
router.get('/payroll-summary', getPayrollSummary);
router.get('/kpi', getKPI);

export default router;
