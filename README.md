# Elara Technologies - Corporate Management System

A modern, professional corporate management system with role-based access control, built with vanilla JavaScript and Node.js.

## 🚀 Quick Start

### Frontend Only (Demo Mode)
```bash
cd /home/saikrishna/dh_fi
python3 -m http.server 5500
```
Open: http://localhost:5500

### With Backend API
```bash
# Terminal 1: Frontend
python3 -m http.server 5500

# Terminal 2: Backend
cd backend
npm run dev
```

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| CEO | ceo@elaratech.com | Ceo@123456 |
| HR | hr@elaratech.com | Hr@123456 |
| Admin | admin@elaratech.com | Admin@123456 |
| Manager | manager@elaratech.com | Manager@123456 |
| Employee | employee@elaratech.com | Employee@123456 |

## 🎯 Features

- **Role-Based Access Control** - Different dashboards for each role
- **Employee Management** - Add, view, edit, delete employees
- **Project Management** - Track projects with progress indicators
- **Task Management** - Assign and track tasks
- **Leave Management** - Request, approve, reject leave requests
- **Attendance Tracking** - Monitor employee attendance
- **Payroll Management** - Process and manage payroll
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Works on all devices

## 🛠️ Backend Setup (Optional)

```bash
# Install MongoDB
sudo apt install mongodb
sudo systemctl start mongodb

# Setup database
cd backend
node setup.js

# Start server
npm run dev
```

## 📁 Project Structure

```
/
├── index.html              # Main application
├── css/                    # Stylesheets
│   ├── theme.css          # Theme variables
│   ├── styles.css         # Main styles
│   ├── modals.css         # Modal styles
│   ├── animations.css     # Animations
│   └── responsive.css     # Responsive design
├── js/                     # JavaScript
│   ├── app.js             # Main application logic
│   ├── data.js            # Sample data
│   ├── calendar.js        # Calendar functionality
│   ├── modals.js          # Modal components
│   └── api/               # API integration
└── backend/               # Node.js backend
    ├── server.js          # Express server
    ├── models/            # Database models
    ├── controllers/       # Route controllers
    ├── routes/            # API routes
    └── middleware/        # Custom middleware
```

## 🎨 Technology Stack

**Frontend:**
- Vanilla JavaScript (ES6+)
- CSS3 with CSS Variables
- Font Awesome Icons
- Responsive Grid Layout

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt Password Hashing

## 🌟 Key Features

- **Professional UI** - Modern, clean design with smooth animations
- **Secure Authentication** - JWT-based with password hashing
- **Role-Based Permissions** - Different access levels for each role
- **Real-time Updates** - Dynamic content loading
- **Error Handling** - Comprehensive error management
- **Logging System** - Built-in logging for debugging

---

Built with ❤️ for modern corporate management needs.