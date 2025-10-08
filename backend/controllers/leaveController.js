import Leave from '../models/Leave.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all leaves
// @route   GET /api/v1/leaves
// @access  Private
export const getLeaves = asyncHandler(async (req, res, next) => {
    const { status, type, employee } = req.query;
    let query = {};
    
    // If employee, only show their leaves
    if (req.user.role === 'employee') {
        query.employee = req.user.id;
    } else {
        if (employee) query.employee = employee;
    }
    
    if (status) query.status = status;
    if (type) query.type = type;

    const leaves = await Leave.find(query)
        .populate('employee', 'name email department')
        .populate('approvedBy', 'name email')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves
    });
});

// @desc    Get single leave
// @route   GET /api/v1/leaves/:id
// @access  Private
export const getLeave = asyncHandler(async (req, res, next) => {
    const leave = await Leave.findById(req.params.id)
        .populate('employee', 'name email department position')
        .populate('approvedBy', 'name email');

    if (!leave) {
        return next(new ErrorResponse(`Leave not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: leave
    });
});

// @desc    Create leave request
// @route   POST /api/v1/leaves
// @access  Private
export const createLeave = asyncHandler(async (req, res, next) => {
    req.body.employee = req.user.id;
    
    const leave = await Leave.create(req.body);

    res.status(201).json({
        success: true,
        data: leave
    });
});

// @desc    Update leave
// @route   PUT /api/v1/leaves/:id
// @access  Private
export const updateLeave = asyncHandler(async (req, res, next) => {
    let leave = await Leave.findById(req.params.id);

    if (!leave) {
        return next(new ErrorResponse(`Leave not found with id of ${req.params.id}`, 404));
    }

    leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: leave
    });
});

// @desc    Approve/Reject leave
// @route   PUT /api/v1/leaves/:id/status
// @access  Private/Manager/HR/Admin
export const updateLeaveStatus = asyncHandler(async (req, res, next) => {
    const { status, rejectionReason } = req.body;
    
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
        return next(new ErrorResponse(`Leave not found with id of ${req.params.id}`, 404));
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedAt = Date.now();
    
    if (status === 'Rejected' && rejectionReason) {
        leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    res.status(200).json({
        success: true,
        data: leave
    });
});

// @desc    Delete leave
// @route   DELETE /api/v1/leaves/:id
// @access  Private
export const deleteLeave = asyncHandler(async (req, res, next) => {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
        return next(new ErrorResponse(`Leave not found with id of ${req.params.id}`, 404));
    }

    // Only allow deletion if it's the owner or admin/hr
    if (leave.employee.toString() !== req.user.id && !['admin', 'hr'].includes(req.user.role)) {
        return next(new ErrorResponse('Not authorized to delete this leave', 403));
    }

    await leave.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});






