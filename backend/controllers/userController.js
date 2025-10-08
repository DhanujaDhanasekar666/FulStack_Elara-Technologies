import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin/HR/CEO
export const getUsers = asyncHandler(async (req, res, next) => {
    const { department, role, status, search } = req.query;
    
    let query = {};
    
    if (department) query.department = department;
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query)
        .select('-password')
        .populate('managerId', 'name email')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('managerId', 'name email department');

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Get employee details if exists
    const employee = await Employee.findOne({ userId: req.params.id });

    res.status(200).json({
        success: true,
        data: { ...user.toObject(), employeeDetails: employee }
    });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin/HR
export const createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin/HR
export const updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Don't allow password update through this route
    delete req.body.password;

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get user statistics
// @route   GET /api/v1/users/stats
// @access  Private/Admin/HR/CEO
export const getUserStats = asyncHandler(async (req, res, next) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const onLeave = await User.countDocuments({ status: 'On Leave' });
    
    const usersByDepartment = await User.aggregate([
        {
            $group: {
                _id: '$department',
                count: { $sum: 1 }
            }
        }
    ]);

    const usersByRole = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            total: totalUsers,
            active: activeUsers,
            onLeave,
            byDepartment: usersByDepartment,
            byRole: usersByRole
        }
    });
});






