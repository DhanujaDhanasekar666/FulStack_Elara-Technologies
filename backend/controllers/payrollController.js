import Payroll from '../models/Payroll.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all payroll records
// @route   GET /api/v1/payroll
// @access  Private/HR/Admin/CEO
export const getPayrolls = asyncHandler(async (req, res, next) => {
    // Handle demo users - return mock data
    if (req.user.id && req.user.id.startsWith('demo-')) {
        const mockPayrolls = [
            {
                _id: 'payroll-1',
                employee: {
                    _id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    department: req.user.department,
                    position: req.user.position
                },
                period: { month: 9, year: 2025 },
                salary: { baseSalary: 50000, bonus: 5000, overtime: 0, allowances: { houseRent: 0, transport: 0, medical: 0, other: 0 } },
                deductions: { tax: 5000, insurance: 1000, providentFund: 6000, loan: 0, other: 0 },
                netPay: 48000,
                status: 'Paid',
                processedBy: { _id: req.user.id, name: req.user.name, email: req.user.email },
                processedAt: new Date('2025-09-30'),
                createdAt: new Date('2025-09-30'),
                updatedAt: new Date('2025-09-30')
            },
            {
                _id: 'payroll-2',
                employee: {
                    _id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    department: req.user.department,
                    position: req.user.position
                },
                period: { month: 10, year: 2025 },
                salary: { baseSalary: 50000, bonus: 0, overtime: 0, allowances: { houseRent: 0, transport: 0, medical: 0, other: 0 } },
                deductions: { tax: 5000, insurance: 1000, providentFund: 6000, loan: 0, other: 0 },
                netPay: 44000,
                status: 'Pending',
                processedBy: { _id: req.user.id, name: req.user.name, email: req.user.email },
                processedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        return res.status(200).json({
            success: true,
            count: mockPayrolls.length,
            data: mockPayrolls
        });
    }

    // For real users, query database
    const { status, employee, month, year } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (employee) query.employee = employee;
    if (month) query['period.month'] = parseInt(month);
    if (year) query['period.year'] = parseInt(year);

    const payrolls = await Payroll.find(query)
        .populate('employee', 'name email department position')
        .populate('processedBy', 'name email')
        .sort('-period.year -period.month');

    res.status(200).json({
        success: true,
        count: payrolls.length,
        data: payrolls
    });
});

// @desc    Get single payroll
// @route   GET /api/v1/payroll/:id
// @access  Private
export const getPayroll = asyncHandler(async (req, res, next) => {
    const payroll = await Payroll.findById(req.params.id)
        .populate('employee', 'name email department position employeeId')
        .populate('processedBy', 'name email');

    if (!payroll) {
        return next(new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404));
    }

    // Employees can only see their own payroll
    if (req.user.role === 'employee' && payroll.employee._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this payroll', 403));
    }

    res.status(200).json({
        success: true,
        data: payroll
    });
});

// @desc    Create payroll
// @route   POST /api/v1/payroll
// @access  Private/HR/Admin/CEO
export const createPayroll = asyncHandler(async (req, res, next) => {
    // Handle demo users - create a mock payroll object instead of saving to DB
    if (req.user.id && req.user.id.startsWith('demo-')) {
        const mockPayroll = {
            _id: `payroll-${Date.now()}`,
            employee: {
                _id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                department: req.user.department,
                position: req.user.position
            },
            period: req.body.period,
            salary: req.body.salary,
            deductions: req.body.deductions,
            netPay: req.body.netPay,
            status: req.body.status || 'Pending',
            notes: req.body.notes,
            processedBy: {
                _id: req.user.id,
                name: req.user.name,
                email: req.user.email
            },
            processedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return res.status(201).json({
            success: true,
            data: mockPayroll
        });
    }

    // For real users, save to database
    const payroll = await Payroll.create(req.body);

    res.status(201).json({
        success: true,
        data: payroll
    });
});

// @desc    Update payroll
// @route   PUT /api/v1/payroll/:id
// @access  Private/HR/Admin
export const updatePayroll = asyncHandler(async (req, res, next) => {
    let payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
        return next(new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404));
    }

    payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: payroll
    });
});

// @desc    Process payroll
// @route   PUT /api/v1/payroll/:id/process
// @access  Private/HR/Admin
export const processPayroll = asyncHandler(async (req, res, next) => {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
        return next(new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404));
    }

    payroll.status = 'Processed';
    payroll.processedBy = req.user.id;
    payroll.processedAt = Date.now();

    await payroll.save();

    res.status(200).json({
        success: true,
        data: payroll
    });
});

// @desc    Delete payroll
// @route   DELETE /api/v1/payroll/:id
// @access  Private/Admin
export const deletePayroll = asyncHandler(async (req, res, next) => {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
        return next(new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404));
    }

    await payroll.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get payroll statistics
// @route   GET /api/v1/payroll/stats
// @access  Private/HR/Admin/CEO
export const getPayrollStats = asyncHandler(async (req, res, next) => {
    const { month, year } = req.query;
    let matchQuery = {};
    
    if (month) matchQuery['period.month'] = parseInt(month);
    if (year) matchQuery['period.year'] = parseInt(year);

    const stats = await Payroll.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                totalNetPay: { $sum: '$netPay' },
                totalBaseSalary: { $sum: '$salary.baseSalary' },
                totalBonus: { $sum: '$salary.bonus' },
                totalDeductions: { 
                    $sum: { 
                        $add: [
                            '$deductions.tax',
                            '$deductions.insurance',
                            '$deductions.providentFund',
                            '$deductions.loan',
                            '$deductions.other'
                        ]
                    }
                },
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats[0] || {}
    });
});






