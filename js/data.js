// Sample data for demonstration - Direct JavaScript (no modules)
const sampleData = {
    employees: [
        { id: 1, employeeId: "EMP001", name: "John Doe", email: "john.doe@elara.tech", department: "Engineering", position: "Software Engineer", status: "Active", role: "employee" },
        { id: 2, employeeId: "EMP002", name: "Jane Smith", email: "jane.smith@elara.tech", department: "Marketing", position: "Marketing Manager", status: "Active", role: "manager" },
        { id: 3, employeeId: "EMP003", name: "Mike Johnson", email: "mike.johnson@elara.tech", department: "Sales", position: "Sales Representative", status: "Active", role: "employee" },
        { id: 4, employeeId: "EMP004", name: "Emily Davis", email: "emily.davis@elara.tech", department: "HR", position: "HR Specialist", status: "Active", role: "hr" },
        { id: 5, employeeId: "EMP005", name: "Chris Wilson", email: "chris.wilson@elara.tech", department: "Finance", position: "Financial Analyst", status: "Inactive", role: "employee" }
    ],
    projects: [
        { id: 1, name: "Website Redesign", department: "Engineering", status: "In Progress", progress: 65 },
        { id: 2, name: "Marketing Campaign", department: "Marketing", status: "Planning", progress: 30 },
        { id: 3, name: "Sales Training", department: "Sales", status: "Completed", progress: 100 },
        { id: 4, name: "HR System Update", department: "HR", status: "In Progress", progress: 45 }
    ],
    tasks: [
        { id: 1, title: "Update user interface", assignee: "John Doe", dueDate: "2024-01-20", status: "pending", priority: "high" },
        { id: 2, title: "Review marketing materials", assignee: "Jane Smith", dueDate: "2024-01-18", status: "completed", priority: "medium" },
        { id: 3, title: "Prepare sales report", assignee: "Mike Johnson", dueDate: "2024-01-22", status: "in-progress", priority: "high" },
        { id: 4, title: "Conduct interviews", assignee: "Emily Davis", dueDate: "2024-01-25", status: "pending", priority: "low" }
    ],
    leaveRequests: [
        { id: 1, employee: "John Doe", type: "Vacation", startDate: "2024-02-01", endDate: "2024-02-05", days: 5, status: "pending", reason: "Family vacation" },
        { id: 2, employee: "Jane Smith", type: "Sick Leave", startDate: "2024-01-15", endDate: "2024-01-16", days: 2, status: "approved", reason: "Medical appointment" },
        { id: 3, employee: "Mike Johnson", type: "Personal", startDate: "2024-01-30", endDate: "2024-01-30", days: 1, status: "rejected", reason: "Personal matters" }
    ],
    disciplinaryRecords: [
        { id: 1, employee: "Chris Wilson", type: "Warning", date: "2024-01-10", reason: "Late arrival", action: "Verbal warning issued" },
        { id: 2, employee: "John Doe", type: "Notice", date: "2024-01-05", reason: "Missed deadline", action: "Performance improvement plan" }
    ],
    offers: [
        { id: 1, candidate: "Alice Brown", position: "Senior Developer", department: "Engineering", salary: "₹9,50,000", status: "pending" },
        { id: 2, candidate: "Bob Green", position: "Marketing Specialist", department: "Marketing", salary: "₹6,50,000", status: "accepted" }
    ],
    payroll: [
        { id: 1, employee: "John Doe", baseSalary: 75000, bonus: 5000, deductions: 8000, netPay: 72000, period: "January 2024", status: "processed" },
        { id: 2, employee: "Jane Smith", baseSalary: 68000, bonus: 3000, deductions: 7500, netPay: 63500, period: "January 2024", status: "processed" },
        { id: 3, employee: "Mike Johnson", baseSalary: 62000, bonus: 2000, deductions: 6800, netPay: 57200, period: "January 2024", status: "pending" }
    ],
    announcements: [
        { id: 1, title: "Company Meeting", content: "All-hands meeting scheduled for next Friday at 2 PM in the main conference room.", date: "2025-10-15", priority: "high" },
        { id: 2, title: "New Employee Welcome", content: "Please welcome our new team members joining us this week.", date: "2025-10-12", priority: "medium" },
        { id: 3, title: "System Maintenance", content: "Scheduled maintenance on Sunday from 2 AM to 6 AM. Systems will be unavailable.", date: "2025-10-10", priority: "high" },
        { id: 4, title: "Q4 Planning Session", content: "Quarterly planning meeting scheduled for October 20th at 10 AM.", date: "2025-10-08", priority: "medium" },
        { id: 5, title: "Team Building Event", content: "Annual team building event planned for October 25th. RSVP required.", date: "2025-10-05", priority: "low" },
        { id: 6, title: "Performance Reviews", content: "Annual performance reviews begin next week. Schedule your meeting with HR.", date: "2025-10-03", priority: "high" }
    ],

    // Chart Data for Company Overview
    chartData: {
        // Revenue Growth Over Time (Monthly)
        revenueGrowth: {
            labels: ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025'],
            data: [120000, 135000, 142000, 158000, 167000, 175000, 189000, 201000, 218000, 235000],
            target: [130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000, 210000, 220000]
        },
        
        // Project Status Distribution
        projectStatus: {
            labels: ['Completed', 'In Progress', 'Planning', 'On Hold'],
            data: [45, 32, 18, 5],
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
        },
        
        // Employee Performance Metrics
        employeeMetrics: {
            labels: ['Productivity', 'Satisfaction', 'Retention', 'Training', 'Innovation'],
            data: [85, 78, 92, 73, 81],
            maxValue: 100
        },
        
        // Department Budget Allocation
        budgetAllocation: {
            labels: ['Engineering', 'Marketing', 'Sales', 'HR', 'Operations', 'R&D'],
            data: [35, 20, 15, 10, 12, 8],
            colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1']
        },
        
        // Monthly Task Completion Rate
        taskCompletion: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            completed: [89, 92, 87, 94],
            pending: [11, 8, 13, 6],
            overdue: [3, 2, 4, 1]
        },
        
        // Company Growth Timeline (Quarterly)
        companyGrowth: {
            labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025'],
            employees: [45, 52, 58, 63, 68, 75, 82],
            revenue: [450000, 520000, 580000, 630000, 680000, 750000, 820000],
            projects: [12, 15, 18, 21, 24, 28, 32]
        },
        
        // Customer Satisfaction Trends
        customerSatisfaction: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            satisfaction: [4.2, 4.3, 4.1, 4.4, 4.5, 4.6, 4.4, 4.7, 4.8, 4.9],
            responses: [156, 142, 178, 165, 189, 201, 187, 223, 245, 267]
        },
        
        // Technology Stack Usage
        techStack: {
            labels: ['React/Next.js', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
            usage: [95, 88, 75, 82, 65, 92, 78, 45],
            colors: ['#61dafb', '#339933', '#3776ab', '#47a248', '#336791', '#ff9900', '#2496ed', '#326ce5']
        }
    },

    calendarEvents: [
        { id: 1, title: "Team Standup", date: "2025-10-08", time: "09:00 AM", type: "meeting", description: "Daily team synchronization meeting" },
        { id: 2, title: "Project Review", date: "2025-10-10", time: "02:00 PM", type: "meeting", description: "Quarterly project review and planning" },
        { id: 3, title: "Training Session", date: "2025-10-12", time: "10:00 AM", type: "meeting", description: "New employee onboarding training" },
        { id: 4, title: "Company Holiday", date: "2025-10-15", time: "All Day", type: "holiday", description: "National holiday - office closed" },
        { id: 5, title: "Client Meeting", date: "2025-10-18", time: "03:00 PM", type: "meeting", description: "Important client presentation" },
        { id: 6, title: "Deadline: Q4 Report", date: "2025-10-25", time: "05:00 PM", type: "deadline", description: "Submit quarterly financial report" }
    ]
};

// Role-based menu items
const menuItems = {
    ceo: [
        { id: "home", name: "Home", icon: "fas fa-home" },
        { id: "overview", name: "Company Overview", icon: "fas fa-chart-line" },
        { id: "employees", name: "Employees", icon: "fas fa-users" },
        { id: "projects", name: "Projects", icon: "fas fa-project-diagram" },
        { id: "reports", name: "Reports", icon: "fas fa-chart-bar" },
        { id: "payroll", name: "Payroll", icon: "fas fa-money-bill-wave" }
    ],
    hr: [
        { id: "home", name: "Home", icon: "fas fa-home" },
        { id: "employees", name: "Employees", icon: "fas fa-users" },
        { id: "disciplinary", name: "Disciplinary Records", icon: "fas fa-exclamation-triangle" },
        { id: "promotions", name: "Promotions", icon: "fas fa-level-up-alt" },
        { id: "payroll", name: "Payroll", icon: "fas fa-money-bill-wave" }
    ],
    admin: [
        { id: "home", name: "Home", icon: "fas fa-home" },
        { id: "employees", name: "Employees", icon: "fas fa-users" },
        { id: "projects", name: "Projects", icon: "fas fa-project-diagram" },
        { id: "tasks", name: "Tasks", icon: "fas fa-tasks" },
        { id: "payroll", name: "Payroll", icon: "fas fa-money-bill-wave" }
    ],
    manager: [
        { id: "home", name: "Home", icon: "fas fa-home" },
        { id: "projects", name: "Projects", icon: "fas fa-project-diagram" },
        { id: "tasks", name: "Tasks", icon: "fas fa-tasks" },
        { id: "leaves", name: "Leave Requests", icon: "fas fa-calendar-times" },
        { id: "employees", name: "Team Members", icon: "fas fa-users" },
        { id: "reports", name: "Reports", icon: "fas fa-chart-bar" },
        { id: "attendance", name: "Attendance", icon: "fas fa-clock" }
    ],
    employee: [
        { id: "home", name: "Home", icon: "fas fa-home" },
        { id: "tasks", name: "My Tasks", icon: "fas fa-tasks" },
        { id: "leaves", name: "Leave Requests", icon: "fas fa-calendar-times" },
        { id: "attendance", name: "My Attendance", icon: "fas fa-clock" },
        { id: "projects", name: "Projects", icon: "fas fa-project-diagram" }
    ]
};

console.log('✅ Data loaded successfully');
