import { asyncHandler } from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import DisciplinaryAction from '../models/DisciplinaryAction.js';

// @desc    Get all disciplinary actions (HR/Admin/CEO)
// @route   GET /api/v1/disciplinary
// @access  Private
export const getActions = asyncHandler(async (req, res, next) => {
    const query = {};
    if (req.query.employee) query.employee = req.query.employee;
    if (req.query.status) query.status = req.query.status;

    const actions = await DisciplinaryAction.find(query)
        .populate('employee', 'name email department role employeeId')
        .populate('issuedBy', 'name email role');

    res.status(200).json({ success: true, count: actions.length, data: actions });
});

// @desc    Get single disciplinary action
// @route   GET /api/v1/disciplinary/:id
// @access  Private
export const getAction = asyncHandler(async (req, res, next) => {
    const action = await DisciplinaryAction.findById(req.params.id)
        .populate('employee', 'name email department role employeeId')
        .populate('issuedBy', 'name email role');
    if (!action) return next(new ErrorResponse('Disciplinary action not found', 404));
    res.status(200).json({ success: true, data: action });
});

// @desc    Create disciplinary action (HR/Admin/CEO)
// @route   POST /api/v1/disciplinary
// @access  Private
export const createAction = asyncHandler(async (req, res, next) => {
    const payload = {
        employee: req.body.employee,
        type: req.body.type,
        reason: req.body.reason,
        action: req.body.action,
        status: req.body.status || 'open',
        notes: req.body.notes,
        attachments: req.body.attachments || [],
        issuedBy: req.user._id || req.user.id
    };

    const created = await DisciplinaryAction.create(payload);
    res.status(201).json({ success: true, data: created });
});

// @desc    Update disciplinary action (HR/Admin/CEO)
// @route   PUT /api/v1/disciplinary/:id
// @access  Private
export const updateAction = asyncHandler(async (req, res, next) => {
    const updates = { ...req.body };
    delete updates.issuedBy; // Immutable

    const updated = await DisciplinaryAction.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    if (!updated) return next(new ErrorResponse('Disciplinary action not found', 404));
    res.status(200).json({ success: true, data: updated });
});

// @desc    Delete disciplinary action (Admin/CEO)
// @route   DELETE /api/v1/disciplinary/:id
// @access  Private
export const deleteAction = asyncHandler(async (req, res, next) => {
    const action = await DisciplinaryAction.findById(req.params.id);
    if (!action) return next(new ErrorResponse('Disciplinary action not found', 404));
    await action.deleteOne();
    res.status(200).json({ success: true, data: {} });
});


