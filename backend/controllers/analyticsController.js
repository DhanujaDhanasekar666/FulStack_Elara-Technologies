import { asyncHandler } from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';
import CalendarEvent from '../models/CalendarEvent.js';

// @desc    Get company overview statistics
// @route   GET /api/v1/analytics/overview
// @access  Private (CEO, HR, Admin)
export const getCompanyOverview = asyncHandler(async (req, res, next) => {
    // Get current date for calculations
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = new Date(currentYear, currentMonth - 1, 1);
    const thisMonth = new Date(currentYear, currentMonth, 1);
    
    // Employee Statistics
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const newEmployeesThisMonth = await Employee.countDocuments({
        status: 'active',
        joinDate: { $gte: thisMonth }
    });
    
    // Project Statistics
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const projectsInPlanning = await Project.countDocuments({ status: 'planning' });
    
    // Task Statistics
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    
    // Payroll Statistics (Current Month)
    const currentMonthPayroll = await Payroll.aggregate([
        {
            $match: {
                period: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
                status: 'processed'
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$netPay' },
                totalBaseSalary: { $sum: '$baseSalary' },
                totalBonus: { $sum: '$bonus' },
                totalDeductions: { $sum: '$deductions' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    const monthlyRevenue = currentMonthPayroll[0]?.totalRevenue || 0;
    
    // Leave Statistics
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    
    // Attendance Statistics (This Month)
    const attendanceStats = await Attendance.aggregate([
        {
            $match: {
                date: { $gte: thisMonth }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const attendanceData = {
        present: 0,
        absent: 0,
        late: 0,
        'half-day': 0
    };
    
    attendanceStats.forEach(stat => {
        attendanceData[stat._id] = stat.count;
    });
    
    // Calculate attendance percentage
    const totalAttendanceRecords = Object.values(attendanceData).reduce((a, b) => a + b, 0);
    const attendancePercentage = totalAttendanceRecords > 0 
        ? Math.round(((attendanceData.present + attendanceData.late) / totalAttendanceRecords) * 100)
        : 0;
    
    res.status(200).json({
        success: true,
        data: {
            employees: {
                total: totalEmployees,
                newThisMonth: newEmployeesThisMonth,
                growthRate: totalEmployees > 0 ? Math.round((newEmployeesThisMonth / totalEmployees) * 100) : 0
            },
            projects: {
                total: totalProjects,
                active: activeProjects,
                completed: completedProjects,
                planning: projectsInPlanning,
                completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
            },
            tasks: {
                total: totalTasks,
                completed: completedTasks,
                inProgress: inProgressTasks,
                pending: pendingTasks,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
            },
            payroll: {
                monthlyRevenue: Math.round(monthlyRevenue),
                totalBaseSalary: currentMonthPayroll[0]?.totalBaseSalary || 0,
                totalBonus: currentMonthPayroll[0]?.totalBonus || 0,
                totalDeductions: currentMonthPayroll[0]?.totalDeductions || 0,
                employeesPaid: currentMonthPayroll[0]?.count || 0
            },
            leaves: {
                pending: pendingLeaves,
                approved: approvedLeaves,
                total: pendingLeaves + approvedLeaves
            },
            attendance: {
                ...attendanceData,
                percentage: attendancePercentage,
                total: totalAttendanceRecords
            }
        }
    });
});

// @desc    Get revenue growth data (last 12 months)
// @route   GET /api/v1/analytics/revenue-growth
// @access  Private (CEO, HR, Admin)
export const getRevenueGrowth = asyncHandler(async (req, res, next) => {
    const currentDate = new Date();
    const months = [];
    const revenueData = [];
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        months.push(monthLabel);
        
        // Get payroll data for this month
        const monthlyPayroll = await Payroll.aggregate([
            {
                $match: {
                    period: monthStr,
                    status: 'processed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$netPay' }
                }
            }
        ]);
        
        revenueData.push(monthlyPayroll[0]?.totalRevenue || 0);
    }
    
    res.status(200).json({
        success: true,
        data: {
            labels: months,
            revenue: revenueData
        }
    });
});

// @desc    Get employee growth data (last 12 months)
// @route   GET /api/v1/analytics/employee-growth
// @access  Private (CEO, HR, Admin)
export const getEmployeeGrowth = asyncHandler(async (req, res, next) => {
    const currentDate = new Date();
    const months = [];
    const employeeData = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        months.push(monthLabel);
        
        // Count employees who joined by this month
        const employeeCount = await Employee.countDocuments({
            status: 'active',
            joinDate: { $lt: nextMonth }
        });
        
        employeeData.push(employeeCount);
    }
    
    res.status(200).json({
        success: true,
        data: {
            labels: months,
            employees: employeeData
        }
    });
});

// @desc    Get project status distribution
// @route   GET /api/v1/analytics/project-status
// @access  Private (CEO, HR, Admin)
export const getProjectStatus = asyncHandler(async (req, res, next) => {
    const projectStats = await Project.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const statusData = {
        active: 0,
        completed: 0,
        planning: 0,
        'on-hold': 0
    };
    
    projectStats.forEach(stat => {
        statusData[stat._id] = stat.count;
    });
    
    res.status(200).json({
        success: true,
        data: {
            labels: ['Active', 'Completed', 'Planning', 'On Hold'],
            values: [statusData.active, statusData.completed, statusData.planning, statusData['on-hold']],
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        }
    });
});

// @desc    Get department-wise employee distribution
// @route   GET /api/v1/analytics/department-distribution
// @access  Private (CEO, HR, Admin)
export const getDepartmentDistribution = asyncHandler(async (req, res, next) => {
    const departmentStats = await Employee.aggregate([
        {
            $match: { status: 'active' }
        },
        {
            $group: {
                _id: '$department',
                count: { $sum: 1 },
                avgSalary: { $avg: '$salary' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
    
    const labels = departmentStats.map(dept => dept._id);
    const values = departmentStats.map(dept => dept.count);
    const avgSalaries = departmentStats.map(dept => Math.round(dept.avgSalary || 0));
    
    res.status(200).json({
        success: true,
        data: {
            labels,
            values,
            avgSalaries,
            colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6']
        }
    });
});

// @desc    Get task completion trends (last 8 weeks)
// @route   GET /api/v1/analytics/task-trends
// @access  Private (CEO, HR, Admin)
export const getTaskTrends = asyncHandler(async (req, res, next) => {
    const currentDate = new Date();
    const weeks = [];
    const completedTasks = [];
    const totalTasks = [];
    
    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekLabel = `Week ${8 - i}`;
        weeks.push(weekLabel);
        
        // Count tasks created in this week
        const weekTotalTasks = await Task.countDocuments({
            createdAt: { $gte: weekStart, $lte: weekEnd }
        });
        
        // Count tasks completed in this week
        const weekCompletedTasks = await Task.countDocuments({
            status: 'completed',
            updatedAt: { $gte: weekStart, $lte: weekEnd }
        });
        
        totalTasks.push(weekTotalTasks);
        completedTasks.push(weekCompletedTasks);
    }
    
    res.status(200).json({
        success: true,
        data: {
            labels: weeks,
            completed: completedTasks,
            total: totalTasks
        }
    });
});

// @desc    Get attendance trends (last 30 days)
// @route   GET /api/v1/analytics/attendance-trends
// @access  Private (CEO, HR, Admin)
export const getAttendanceTrends = asyncHandler(async (req, res, next) => {
    const currentDate = new Date();
    const days = [];
    const attendanceRates = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        days.push(dayLabel);
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Get attendance for this day
        const totalAttendance = await Attendance.countDocuments({
            date: { $gte: dayStart, $lte: dayEnd }
        });
        
        const presentAttendance = await Attendance.countDocuments({
            date: { $gte: dayStart, $lte: dayEnd },
            status: { $in: ['present', 'late'] }
        });
        
        const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;
        attendanceRates.push(attendanceRate);
    }
    
    res.status(200).json({
        success: true,
        data: {
            labels: days,
            attendanceRates
        }
    });
});

// @desc    Get payroll summary by department
// @route   GET /api/v1/analytics/payroll-summary
// @access  Private (CEO, HR, Admin)
export const getPayrollSummary = asyncHandler(async (req, res, next) => {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const payrollSummary = await Payroll.aggregate([
        {
            $match: {
                period: currentMonth,
                status: 'processed'
            }
        },
        {
            $lookup: {
                from: 'employees',
                localField: 'employee',
                foreignField: '_id',
                as: 'employeeInfo'
            }
        },
        {
            $unwind: '$employeeInfo'
        },
        {
            $group: {
                _id: '$employeeInfo.department',
                totalPayout: { $sum: '$netPay' },
                avgSalary: { $avg: '$baseSalary' },
                totalBonus: { $sum: '$bonus' },
                employeeCount: { $sum: 1 }
            }
        },
        {
            $sort: { totalPayout: -1 }
        }
    ]);
    
    res.status(200).json({
        success: true,
        data: payrollSummary
    });
});

// @desc    Get key performance indicators
// @route   GET /api/v1/analytics/kpi
// @access  Private (CEO, HR, Admin)
export const getKPI = asyncHandler(async (req, res, next) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = new Date(currentYear, currentMonth - 1, 1);
    const thisMonth = new Date(currentYear, currentMonth, 1);
    
    // Employee satisfaction (based on attendance rate)
    const totalAttendanceThisMonth = await Attendance.countDocuments({
        date: { $gte: thisMonth }
    });
    const presentAttendanceThisMonth = await Attendance.countDocuments({
        date: { $gte: thisMonth },
        status: { $in: ['present', 'late'] }
    });
    
    const employeeSatisfaction = totalAttendanceThisMonth > 0 
        ? Math.round((presentAttendanceThisMonth / totalAttendanceThisMonth) * 100)
        : 0;
    
    // Project completion rate
    const totalProjects = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    // Task efficiency (completed vs total)
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const taskEfficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Employee retention (active employees)
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const totalEmployees = await Employee.countDocuments();
    const employeeRetention = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;
    
    res.status(200).json({
        success: true,
        data: {
            employeeSatisfaction,
            projectCompletionRate,
            taskEfficiency,
            employeeRetention,
            overallScore: Math.round((employeeSatisfaction + projectCompletionRate + taskEfficiency + employeeRetention) / 4)
        }
    });
});
