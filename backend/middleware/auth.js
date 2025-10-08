import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if this is a demo user
        if (decoded.id && decoded.id.startsWith('demo-')) {
            // For demo users, create a user object from the token
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                name: decoded.name || 'Demo User',
                department: decoded.department || 'General',
                position: decoded.position || 'Employee',
                status: 'Active',
                username: decoded.username || 'demo'
            };
            return next();
        }

        // Get user from token (for real users)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Check if user is active
        if (req.user.status !== 'Active') {
            return next(new ErrorResponse('Your account is not active', 403));
        }

        // Check if user changed password after token was issued
        if (req.user.changedPasswordAfter(decoded.iat)) {
            return next(new ErrorResponse('Password recently changed. Please log in again', 401));
        }

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role '${req.user.role}' is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};

// Role hierarchy levels (higher number = higher authority)
const ROLE_HIERARCHY = {
    'employee': 1,
    'manager': 2,
    'hr': 3,
    'admin': 4,
    'ceo': 5
};

// Get role hierarchy level
const getRoleLevel = (role) => {
    return ROLE_HIERARCHY[role] || 0;
};

// Check if user can manage another user based on role hierarchy
export const authorizeHierarchy = asyncHandler(async (req, res, next) => {
    const targetUserId = req.params.id;
    const currentUserRole = req.user.role;
    const currentUserLevel = getRoleLevel(currentUserRole);
    
    // Get the target user to check their role
    const targetUser = await User.findById(targetUserId);
    
    if (!targetUser) {
        return next(new ErrorResponse('Target user not found', 404));
    }
    
    const targetUserRole = targetUser.role;
    const targetUserLevel = getRoleLevel(targetUserRole);
    
    // CEO can manage everyone
    if (currentUserRole === 'ceo') {
        return next();
    }
    
    // Admin can manage everyone except CEO
    if (currentUserRole === 'admin' && targetUserRole !== 'ceo') {
        return next();
    }
    
    // HR can manage employees and managers, but not admin or CEO
    if (currentUserRole === 'hr' && !['admin', 'ceo'].includes(targetUserRole)) {
        return next();
    }
    
    // Manager can only manage employees
    if (currentUserRole === 'manager' && targetUserRole === 'employee') {
        return next();
    }
    
    // Users can edit their own profile (but not delete themselves)
    if (req.method !== 'DELETE' && req.user.id === targetUserId) {
        return next();
    }
    
    // If none of the above conditions are met, deny access
    return next(
        new ErrorResponse(
            `${currentUserRole} cannot manage ${targetUserRole}. Insufficient privileges.`,
            403
        )
    );
});

// Check if user is the owner or has higher privileges
export const checkOwnership = (resourceField = 'employee') => {
    return async (req, res, next) => {
        const resourceId = req.params.id;
        
        // Admin, CEO, and HR can access all resources
        if (['admin', 'ceo', 'hr'].includes(req.user.role)) {
            return next();
        }

        // For manager, check if the resource belongs to their team
        if (req.user.role === 'manager') {
            // This logic can be expanded based on team structure
            return next();
        }

        // For employee, check if they own the resource
        const resource = await mongoose.model(req.baseUrl.split('/').pop())
            .findById(resourceId);

        if (!resource) {
            return next(new ErrorResponse('Resource not found', 404));
        }

        if (resource[resourceField].toString() !== req.user.id) {
            return next(
                new ErrorResponse('Not authorized to access this resource', 403)
            );
        }

        next();
    };
};




