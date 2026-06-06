import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Attendance from '../models/Attendance.js';
import Disciplinary from '../models/Disciplinary.js';
import Announcement from '../models/Announcement.js';
import CalendarEvent from '../models/CalendarEvent.js';

// Sample data from frontend
const sampleData = {
    users: [
        { name: 'John CEO', email: 'ceo@elaratech.com', password: 'Ceo@123456', role: 'ceo', employeeId: 'CEO001', department: 'Executive', position: 'Chief Executive Officer' },
        { name: 'Sarah HR', email: 'hr@elaratech.com', password: 'Hr@123456', role: 'hr', employeeId: 'HR001', department: 'Human Resources', position: 'HR Director' },
        { name: 'Mike Admin', email: 'admin@elaratech.com', password: 'Admin@123456', role: 'admin', employeeId: 'ADM001', department: 'Administration', position: 'System Administrator' },
        { name: 'Lisa Manager', email: 'manager@elaratech.com', password: 'Manager@123456', role: 'manager', employeeId: 'MGR001', department: 'Engineering', position: 'Engineering Manager' },
        { name: 'Tom Employee', email: 'employee@elaratech.com', password: 'Employee@123456', role: 'employee', employeeId: 'EMP999', department: 'Engineering', position: 'Software Developer' }
    ],
    
    employees: [
        { employeeId: 'EMP001', name: 'John Smith', department: 'Engineering', position: 'Senior Developer', email: 'john.smith@elaratech.com', phone: '+1-555-0101', status: 'active', joinDate: '2023-01-15', salary: 85000 },
        { employeeId: 'EMP002', name: 'Sarah Johnson', department: 'Marketing', position: 'Marketing Manager', email: 'sarah.johnson@elaratech.com', phone: '+1-555-0102', status: 'active', joinDate: '2023-02-20', salary: 75000 },
        { employeeId: 'EMP003', name: 'Mike Davis', department: 'Sales', position: 'Sales Representative', email: 'mike.davis@elaratech.com', phone: '+1-555-0103', status: 'active', joinDate: '2023-03-10', salary: 65000 },
        { employeeId: 'EMP004', name: 'Emily Brown', department: 'HR', position: 'HR Specialist', email: 'emily.brown@elaratech.com', phone: '+1-555-0104', status: 'active', joinDate: '2023-04-05', salary: 60000 },
        { employeeId: 'EMP005', name: 'David Wilson', department: 'Engineering', position: 'Junior Developer', email: 'david.wilson@elaratech.com', phone: '+1-555-0105', status: 'active', joinDate: '2023-05-12', salary: 55000 },
        { employeeId: 'EMP006', name: 'Lisa Anderson', department: 'Finance', position: 'Accountant', email: 'lisa.anderson@elaratech.com', phone: '+1-555-0106', status: 'active', joinDate: '2023-06-18', salary: 58000 },
        { employeeId: 'EMP007', name: 'Robert Taylor', department: 'Operations', position: 'Operations Manager', email: 'robert.taylor@elaratech.com', phone: '+1-555-0107', status: 'active', joinDate: '2023-07-22', salary: 70000 },
        { employeeId: 'EMP008', name: 'Jennifer Martinez', department: 'Design', position: 'UI/UX Designer', email: 'jennifer.martinez@elaratech.com', phone: '+1-555-0108', status: 'active', joinDate: '2023-08-14', salary: 62000 }
    ],
    
    projects: [
        { name: 'E-commerce Platform', department: 'Engineering', status: 'active', progress: 75, startDate: '2024-01-01', endDate: '2024-06-30', budget: 150000, description: 'Building a modern e-commerce platform' },
        { name: 'Mobile App Development', department: 'Engineering', status: 'active', progress: 60, startDate: '2024-02-15', endDate: '2024-08-15', budget: 120000, description: 'Cross-platform mobile application' },
        { name: 'Marketing Campaign Q2', department: 'Marketing', status: 'completed', progress: 100, startDate: '2024-04-01', endDate: '2024-06-30', budget: 50000, description: 'Q2 digital marketing campaign' },
        { name: 'HR System Upgrade', department: 'HR', status: 'planning', progress: 25, startDate: '2024-07-01', endDate: '2024-12-31', budget: 80000, description: 'Upgrading HR management system' },
        { name: 'Data Analytics Dashboard', department: 'Engineering', status: 'active', progress: 45, startDate: '2024-03-01', endDate: '2024-09-30', budget: 100000, description: 'Business intelligence dashboard' }
    ],
    
    tasks: [
        { title: 'Design Database Schema', assignee: 'John Smith', project: 'E-commerce Platform', dueDate: '2024-11-15', status: 'in-progress', priority: 'high', description: 'Create comprehensive database design' },
        { title: 'Implement User Authentication', assignee: 'David Wilson', project: 'E-commerce Platform', dueDate: '2024-11-20', status: 'pending', priority: 'high', description: 'Build secure authentication system' },
        { title: 'Create Marketing Materials', assignee: 'Sarah Johnson', project: 'Marketing Campaign Q2', dueDate: '2024-10-30', status: 'completed', priority: 'medium', description: 'Design promotional materials' },
        { title: 'Setup CI/CD Pipeline', assignee: 'John Smith', project: 'Mobile App Development', dueDate: '2024-11-25', status: 'pending', priority: 'medium', description: 'Automate deployment process' },
        { title: 'User Interface Design', assignee: 'Jennifer Martinez', project: 'Data Analytics Dashboard', dueDate: '2024-12-01', status: 'in-progress', priority: 'high', description: 'Design intuitive dashboard UI' }
    ],
    
    leaveRequests: [
        { employeeId: 'EMP001', employeeName: 'John Smith', type: 'vacation', startDate: '2024-11-20', endDate: '2024-11-22', days: 3, reason: 'Family vacation', status: 'pending', appliedDate: '2024-10-15' },
        { employeeId: 'EMP002', employeeName: 'Sarah Johnson', type: 'sick', startDate: '2024-10-25', endDate: '2024-10-25', days: 1, reason: 'Medical appointment', status: 'approved', appliedDate: '2024-10-20' },
        { employeeId: 'EMP003', employeeName: 'Mike Davis', type: 'personal', startDate: '2024-11-10', endDate: '2024-11-12', days: 3, reason: 'Personal matters', status: 'rejected', appliedDate: '2024-10-28' },
        { employeeId: 'EMP004', employeeName: 'Emily Brown', type: 'vacation', startDate: '2024-12-20', endDate: '2024-12-30', days: 10, reason: 'Year-end holidays', status: 'pending', appliedDate: '2024-11-01' }
    ],
    
    announcements: [
        { title: 'Company Meeting', content: 'All-hands meeting scheduled for next Friday at 2 PM in the main conference room.', date: '2024-10-15', priority: 'high', type: 'announcement', createdBy: 'John CEO' },
        { title: 'New Employee Welcome', content: 'Please welcome our new team members joining us this week.', date: '2024-10-12', priority: 'medium', type: 'announcement', createdBy: 'Sarah HR' },
        { title: 'System Maintenance', content: 'Scheduled maintenance on Sunday from 2 AM to 6 AM. Systems will be unavailable.', date: '2024-10-10', priority: 'high', type: 'announcement', createdBy: 'Mike Admin' },
        { title: 'Holiday Schedule', content: 'Please note the updated holiday schedule for the remainder of the year.', date: '2024-10-08', priority: 'medium', type: 'announcement', createdBy: 'Sarah HR' }
    ],
    
    calendarEvents: [
        { title: 'Team Standup', date: '2025-10-08', time: '09:00 AM', type: 'meeting', description: 'Daily team synchronization meeting', createdBy: 'John CEO', createdByRole: 'ceo' },
        { title: 'Project Review', date: '2025-10-10', time: '02:00 PM', type: 'meeting', description: 'Quarterly project review and planning', createdBy: 'Sarah HR', createdByRole: 'hr' },
        { title: 'Training Session', date: '2025-10-12', time: '10:00 AM', type: 'meeting', description: 'New employee onboarding training', createdBy: 'Sarah HR', createdByRole: 'hr' },
        { title: 'Company Holiday', date: '2025-10-15', time: 'All Day', type: 'holiday', description: 'National holiday - office closed', createdBy: 'Mike Admin', createdByRole: 'admin' },
        { title: 'Client Meeting', date: '2025-10-18', time: '03:00 PM', type: 'meeting', description: 'Important client presentation', createdBy: 'John CEO', createdByRole: 'ceo' }
    ]
};

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elara_technologies');
        console.log('✅ MongoDB Connected for seeding');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Clear existing data
const clearData = async () => {
    try {
        await User.deleteMany({});
        await Employee.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Leave.deleteMany({});
        await Payroll.deleteMany({});
        await Attendance.deleteMany({});
        await Disciplinary.deleteMany({});
        await Announcement.deleteMany({});
        await CalendarEvent.deleteMany({});
        console.log('🗑️  Existing data cleared');
    } catch (error) {
        console.error('❌ Error clearing data:', error.message);
    }
};

// Seed Users
const seedUsers = async () => {
    try {
        const users = [];
        for (const userData of sampleData.users) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`👤 User ${userData.email} already exists, skipping`);
                users.push(existingUser);
                continue;
            }
            
            const newUser = await User.create({
                ...userData,
                password: userData.password
            });
            
            users.push(newUser);
            console.log(`✅ Created user: ${userData.email}`);
        }
        
        console.log('👥 Users seeding completed');
        return users;
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
    }
};

// Seed Employees
const seedEmployees = async (users) => {
    try {
        const employees = [];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Employee@123456', salt);

        for (const empData of sampleData.employees) {
            // Find or create corresponding user first
            let user = await User.findOne({ email: empData.email });
            if (!user) {
                // Determine role
                let role = 'employee';
                if (empData.position.toLowerCase().includes('manager')) {
                    role = 'manager';
                } else if (empData.department.toLowerCase() === 'hr') {
                    role = 'hr';
                }

                user = await User.create({
                    name: empData.name,
                    email: empData.email,
                    password: hashedPassword,
                    role: role,
                    department: empData.department,
                    position: empData.position,
                    employeeId: empData.employeeId,
                    phone: empData.phone,
                    status: empData.status === 'active' ? 'Active' : 'Resigned',
                    joiningDate: new Date(empData.joinDate)
                });
                console.log(`✅ Created associated user for employee: ${empData.email}`);
            }

            // Check if employee already exists
            let employee = await Employee.findOne({ userId: user._id });
            if (!employee) {
                employee = await Employee.create({
                    userId: user._id,
                    skills: ['JavaScript', 'HTML', 'CSS', 'Project Management'],
                    education: [{
                        degree: 'Bachelor of Science',
                        institution: 'State University',
                        yearOfCompletion: 2020,
                        grade: 'A'
                    }]
                });
                console.log(`✅ Created employee profile for: ${empData.email}`);
            } else {
                console.log(`👨‍💼 Employee profile for ${empData.email} already exists, skipping`);
            }

            const employeeWithSalary = employee.toObject();
            employeeWithSalary.salary = empData.salary;
            employeeWithSalary.employeeId = empData.employeeId;
            employees.push(employeeWithSalary);
        }

        console.log('👨‍💼 Employees seeding completed');
        return employees;
    } catch (error) {
        console.error('❌ Error seeding employees:', error.message);
    }
};

// Seed Projects
const seedProjects = async () => {
    try {
        const manager = await User.findOne({ role: 'manager' }) || await User.findOne({ role: 'ceo' });
        const projects = sampleData.projects.map(proj => {
            let status = 'Planning';
            if (proj.status === 'active') status = 'In Progress';
            else if (proj.status === 'planning') status = 'Planning';
            else if (proj.status === 'completed') status = 'Completed';
            
            return {
                name: proj.name,
                description: proj.description || proj.name,
                department: proj.department,
                status: status,
                startDate: new Date(proj.startDate),
                endDate: new Date(proj.endDate),
                budget: {
                    allocated: proj.budget || 50000,
                    spent: 0
                },
                projectManager: manager ? manager._id : null
            };
        });
        await Project.insertMany(projects);
        console.log('📋 Projects seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding projects:', error.message);
    }
};

// Seed Tasks
const seedTasks = async () => {
    try {
        const manager = await User.findOne({ role: 'manager' }) || await User.findOne({ role: 'ceo' });
        const employee = await User.findOne({ role: 'employee' });
        
        const tasks = [];
        for (const taskData of sampleData.tasks) {
            // Find assignee user by name
            const assigneeUser = await User.findOne({ name: taskData.assignee }) || employee;
            
            let status = 'Pending';
            if (taskData.status === 'in-progress') status = 'In Progress';
            else if (taskData.status === 'completed') status = 'Completed';
            else if (taskData.status === 'pending') status = 'Pending';
            
            let priority = 'Medium';
            if (taskData.priority === 'high') priority = 'High';
            else if (taskData.priority === 'medium') priority = 'Medium';
            else if (taskData.priority === 'low') priority = 'Low';
            else if (taskData.priority === 'urgent') priority = 'Urgent';

            // Find project if any
            const project = await Project.findOne({ name: taskData.project });

            tasks.push({
                title: taskData.title,
                description: taskData.description || taskData.title,
                projectId: project ? project._id : null,
                assignedTo: assigneeUser ? assigneeUser._id : null,
                assignedBy: manager ? manager._id : null,
                status,
                priority,
                dueDate: new Date(taskData.dueDate)
            });
        }
        await Task.insertMany(tasks);
        console.log('✅ Tasks seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding tasks:', error.message);
    }
};

// Seed Leave Requests
const seedLeaveRequests = async (employees) => {
    try {
        const leaveRequests = [];
        for (const leaveData of sampleData.leaveRequests) {
            const employee = employees.find(emp => emp.employeeId === leaveData.employeeId);
            if (!employee) continue;

            let type = 'Personal';
            if (leaveData.type === 'vacation') type = 'Vacation';
            else if (leaveData.type === 'sick') type = 'Sick Leave';
            else if (leaveData.type === 'personal') type = 'Personal';

            let status = 'Pending';
            if (leaveData.status === 'approved') status = 'Approved';
            else if (leaveData.status === 'rejected') status = 'Rejected';
            else if (leaveData.status === 'pending') status = 'Pending';
            
            leaveRequests.push({
                employee: employee.userId,
                type: type,
                startDate: new Date(leaveData.startDate),
                endDate: new Date(leaveData.endDate),
                reason: leaveData.reason,
                status: status,
                numberOfDays: leaveData.days
            });
        }
        
        await Leave.insertMany(leaveRequests);
        console.log('🏖️  Leave requests seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding leave requests:', error.message);
    }
};

// Seed Announcements
const seedAnnouncements = async () => {
    try {
        const announcements = sampleData.announcements.map(ann => ({
            ...ann,
            date: new Date(ann.date)
        }));
        
        await Announcement.insertMany(announcements);
        console.log('📢 Announcements seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding announcements:', error.message);
    }
};

// Seed Calendar Events
const seedCalendarEvents = async () => {
    try {
        const events = sampleData.calendarEvents.map(event => ({
            ...event,
            date: new Date(event.date),
            notifyRoles: ['all'] // Default notification to all roles
        }));
        
        await CalendarEvent.insertMany(events);
        console.log('📅 Calendar events seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding calendar events:', error.message);
    }
};

// Generate sample payroll data
const seedPayroll = async (employees) => {
    try {
        const payrollData = [];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        const currentYear = currentDate.getFullYear();
        
        for (const employee of employees) {
            if (employee.salary) {
                const baseSalary = employee.salary;
                const bonus = Math.floor(Math.random() * 5000); // Random bonus 0-5000
                const tax = Math.floor(baseSalary * 0.08); // 8% tax
                const insurance = Math.floor(baseSalary * 0.02); // 2% insurance
                const deductionsTotal = tax + insurance;
                const netPay = baseSalary + bonus - deductionsTotal;
                
                payrollData.push({
                    employee: employee.userId, // User ObjectId
                    period: {
                        month: currentMonth,
                        year: currentYear
                    },
                    salary: {
                        baseSalary,
                        bonus,
                        overtime: 0,
                        allowances: {
                            houseRent: 0,
                            transport: 0,
                            medical: 0,
                            other: 0
                        }
                    },
                    deductions: {
                        tax,
                        insurance,
                        providentFund: 0,
                        loan: 0,
                        other: 0
                    },
                    netPay,
                    status: 'Processed',
                    processedAt: new Date(),
                    paymentMethod: 'Bank Transfer'
                });
            }
        }
        
        await Payroll.insertMany(payrollData);
        console.log('💰 Payroll data seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding payroll:', error.message);
    }
};

// Generate sample attendance data
const seedAttendance = async (employees) => {
    try {
        const attendanceData = [];
        const today = new Date();
        
        // Generate attendance for last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            for (const employee of employees) {
                const statuses = ['Present', 'Late', 'Half Day'];
                const weights = [0.85, 0.1, 0.05]; // 85% present, 10% late, 5% half-day
                
                let status = 'Present';
                const random = Math.random();
                let cumulative = 0;
                
                for (let j = 0; j < statuses.length; j++) {
                    cumulative += weights[j];
                    if (random <= cumulative) {
                        status = statuses[j];
                        break;
                    }
                }
                
                const baseCheckIn = new Date(date);
                baseCheckIn.setHours(9, 0, 0, 0); // 9:00 AM base time
                
                if (status === 'Late') {
                    baseCheckIn.setMinutes(baseCheckIn.getMinutes() + Math.floor(Math.random() * 60) + 15); // 15-75 minutes late
                }
                
                const checkIn = baseCheckIn;
                
                const baseCheckOut = new Date(checkIn);
                baseCheckOut.setHours(baseCheckOut.getHours() + (status === 'Half Day' ? 4 : 8)); // 4 or 8 hours
                const checkOut = baseCheckOut;
                
                const diff = checkOut.getTime() - checkIn.getTime();
                const workingHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
                
                attendanceData.push({
                    employee: employee.userId, // User ObjectId
                    date: new Date(date),
                    status,
                    checkIn,
                    checkOut,
                    workingHours,
                    location: 'Office'
                });
            }
        }
        
        await Attendance.insertMany(attendanceData);
        console.log('⏰ Attendance data seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding attendance:', error.message);
    }
};

// Main seeding function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        await connectDB();
        
        // Only clear data if explicitly requested
        const shouldClearData = process.argv.includes('--clear');
        if (shouldClearData) {
            await clearData();
        } else {
            console.log('📊 Preserving existing data (use --clear to reset)');
        }
        
        const users = await seedUsers();
        const employees = await seedEmployees(users);
        
        await seedProjects();
        await seedTasks();
        await seedLeaveRequests(employees);
        await seedAnnouncements();
        await seedCalendarEvents();
        await seedPayroll(employees);
        await seedAttendance(employees);
        
        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Seeded Data Summary:');
        console.log(`👥 Users: ${sampleData.users.length}`);
        console.log(`👨‍💼 Employees: ${sampleData.employees.length}`);
        console.log(`📋 Projects: ${sampleData.projects.length}`);
        console.log(`✅ Tasks: ${sampleData.tasks.length}`);
        console.log(`🏖️  Leave Requests: ${sampleData.leaveRequests.length}`);
        console.log(`📢 Announcements: ${sampleData.announcements.length}`);
        console.log(`📅 Calendar Events: ${sampleData.calendarEvents.length}`);
        console.log(`💰 Payroll Records: ${sampleData.employees.length}`);
        console.log(`⏰ Attendance Records: ~${sampleData.employees.length * 22} (30 days)`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase();
}

export { seedDatabase, sampleData };
