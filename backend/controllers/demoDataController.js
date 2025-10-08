// Demo Data Controller for when MongoDB is not available
import jwt from 'jsonwebtoken';

// Demo employees data
const demoEmployees = [
    {
        _id: 'emp-001',
        name: 'John CEO',
        email: 'ceo@elaratech.com',
        department: 'Executive',
        position: 'Chief Executive Officer',
        role: 'CEO',
        status: 'Active',
        employeeId: 'EMP001',
        joinDate: '2020-01-01',
        salary: 150000
    },
    {
        _id: 'emp-002',
        name: 'Jane HR',
        email: 'hr@elaratech.com',
        department: 'Human Resources',
        position: 'HR Manager',
        role: 'HR',
        status: 'Active',
        employeeId: 'EMP002',
        joinDate: '2020-02-01',
        salary: 80000
    },
    {
        _id: 'emp-003',
        name: 'Admin User',
        email: 'admin@elaratech.com',
        department: 'IT',
        position: 'System Administrator',
        role: 'Admin',
        status: 'Active',
        employeeId: 'EMP003',
        joinDate: '2020-03-01',
        salary: 75000
    }
];

// Verify demo token
const verifyDemoToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
        return decoded;
    } catch (error) {
        return null;
    }
};

// Get all employees (demo)
export const demoGetEmployees = (req, res) => {
    res.status(200).json({
        success: true,
        count: demoEmployees.length,
        data: demoEmployees
    });
};

// Add employee (demo)
export const demoAddEmployee = (req, res) => {
    const { name, email, department, position, role } = req.body;
    
    if (!name || !email || !department || !position) {
        return res.status(400).json({
            success: false,
            error: 'Please provide all required fields'
        });
    }

    const newEmployee = {
        _id: 'emp-' + Date.now(),
        name,
        email,
        department,
        position,
        role: role || 'Employee',
        status: 'Active',
        employeeId: 'EMP' + String(demoEmployees.length + 1).padStart(3, '0'),
        joinDate: new Date().toISOString().split('T')[0],
        salary: 50000
    };

    demoEmployees.push(newEmployee);

    res.status(201).json({
        success: true,
        data: newEmployee
    });
};

export default { demoGetEmployees, demoAddEmployee };

