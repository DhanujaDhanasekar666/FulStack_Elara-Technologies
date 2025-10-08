// Demo Authentication Controller for when MongoDB is not available
import jwt from 'jsonwebtoken';

// Demo users for testing
const demoUsers = {
    'ceo@elaratech.com': { 
        password: 'CEO@123456', 
        role: 'CEO', 
        name: 'John CEO',
        _id: 'demo-ceo-001',
        department: 'Executive',
        position: 'Chief Executive Officer'
    },
    'hr@elaratech.com': { 
        password: 'HR@123456', 
        role: 'HR', 
        name: 'Jane HR',
        _id: 'demo-hr-001',
        department: 'Human Resources',
        position: 'HR Manager'
    },
    'admin@elaratech.com': { 
        password: 'Admin@123456', 
        role: 'Admin', 
        name: 'Admin User',
        _id: 'demo-admin-001',
        department: 'IT',
        position: 'System Administrator'
    },
    'manager@elaratech.com': { 
        password: 'Manager@123456', 
        role: 'Manager', 
        name: 'Mike Manager',
        _id: 'demo-manager-001',
        department: 'Operations',
        position: 'Operations Manager'
    },
    'employee@elaratech.com': { 
        password: 'Employee@123456', 
        role: 'Employee', 
        name: 'Sam Employee',
        _id: 'demo-employee-001',
        department: 'Development',
        position: 'Software Developer'
    }
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            email: user.email,
            role: user.role 
        },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Demo login function with email suffix support
export const demoLogin = (req, res) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide an email and password'
        });
    }

    // Extract role from email suffix (e.g., john.smith.ceo@company.com)
    const emailParts = email.split('@')[0]; // Get part before @
    const parts = emailParts.split('.');
    
    let role = 'employee'; // default role
    let username = emailParts;
    
    // Check if email has role suffix
    const validRoles = ['ceo', 'hr', 'admin', 'manager', 'employee'];
    const lastPart = parts[parts.length - 1].toLowerCase();
    
    if (validRoles.includes(lastPart)) {
        role = lastPart;
        username = parts.slice(0, -1).join('.'); // Remove role suffix to get username
    }
    
    // Check if password matches role-based pattern (simple demo validation)
    const expectedPassword = `${role}123`;
    if (password !== expectedPassword) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Convert username to display name (e.g., john.smith -> John Smith)
    const displayName = username.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');

    const departments = {
        ceo: 'Executive',
        admin: 'IT',
        hr: 'Human Resources',
        manager: 'Engineering',
        employee: 'Engineering'
    };
    
    const positions = {
        ceo: 'Chief Executive Officer',
        admin: 'System Administrator',
        hr: 'HR Manager',
        manager: 'Project Manager',
        employee: 'Software Engineer'
    };

    const demoUser = {
        _id: `demo-${role}-${Math.floor(Math.random() * 1000)}`,
        email: email,
        name: displayName,
        role: role,
        department: departments[role] || 'General',
        position: positions[role] || 'Employee',
        username: username
    };

    // Generate token
    const token = generateToken(demoUser);
    
    res.status(200).json({
        success: true,
        token,
        user: demoUser
    });
};

// Demo get me function
export const demoGetMe = (req, res) => {
    // Extract user info from token (simplified for demo)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
        const demoUser = Object.values(demoUsers).find(user => user._id === decoded.id);
        
        if (!demoUser) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: demoUser._id,
                email: decoded.email,
                name: demoUser.name,
                role: demoUser.role,
                department: demoUser.department,
                position: demoUser.position
            }
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
};

export default { demoLogin, demoGetMe };
