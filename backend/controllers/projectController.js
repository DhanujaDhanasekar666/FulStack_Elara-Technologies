import Project from '../models/Project.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all projects
// @route   GET /api/v1/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res, next) => {
    const { status, department, search } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) query.name = { $regex: search, $options: 'i' };

    const projects = await Project.find(query)
        .populate('projectManager', 'name email')
        .populate('teamMembers.userId', 'name email')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
    });
});

// @desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Private
export const getProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
        .populate('projectManager', 'name email department')
        .populate('teamMembers.userId', 'name email position');

    if (!project) {
        return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: project
    });
});

// @desc    Create project
// @route   POST /api/v1/projects
// @access  Private/Manager/Admin/CEO
export const createProject = asyncHandler(async (req, res, next) => {
    req.body.projectManager = req.user.id;
    
    const project = await Project.create(req.body);

    res.status(201).json({
        success: true,
        data: project
    });
});

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private/Manager/Admin
export const updateProject = asyncHandler(async (req, res, next) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: project
    });
});

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    await project.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});






