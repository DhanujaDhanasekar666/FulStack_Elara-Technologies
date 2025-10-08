import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res, next) => {
    const { status, priority, assignedTo } = req.query;
    let query = {};
    
    // If employee, only show their tasks
    if (req.user.role === 'employee') {
        query.assignedTo = req.user.id;
    } else {
        if (assignedTo) query.assignedTo = assignedTo;
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email')
        .populate('projectId', 'name')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
export const getTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.id)
        .populate('assignedTo', 'name email position')
        .populate('assignedBy', 'name email')
        .populate('projectId', 'name department')
        .populate('comments.userId', 'name email');

    if (!task) {
        return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: task
    });
});

// @desc    Create task
// @route   POST /api/v1/tasks
// @access  Private/Manager/Admin
export const createTask = asyncHandler(async (req, res, next) => {
    req.body.assignedBy = req.user.id;
    
    const task = await Task.create(req.body);

    res.status(201).json({
        success: true,
        data: task
    });
});

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res, next) => {
    let task = await Task.findById(req.params.id);

    if (!task) {
        return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: task
    });
});

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private/Admin/Manager
export const deleteTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    await task.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Add comment to task
// @route   POST /api/v1/tasks/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    task.comments.push({
        userId: req.user.id,
        comment: req.body.comment
    });

    await task.save();

    res.status(200).json({
        success: true,
        data: task
    });
});






