# Elara Technologies - Backend API

Professional production-ready backend for Elara Technologies Corporate Management System.

## 🚀 Tech Stack

- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) + bcrypt
- **Validation:** express-validator
- **Security:** helmet, cors, rate-limit, express-mongo-sanitize
- **Logging:** Winston + Morgan
- **Documentation:** Swagger/OpenAPI (planned)

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── projectController.js # Project management
│   ├── taskController.js    # Task management
│   ├── leaveController.js   # Leave management
│   └── payrollController.js # Payroll management
├── middleware/
│   ├── auth.js             # JWT authentication & authorization
│   ├── error.js            # Error handling middleware
│   └── asyncHandler.js     # Async error wrapper
├── models/
│   ├── User.js            # User schema
│   ├── Employee.js        # Employee details schema
│   ├── Project.js         # Project schema
│   ├── Task.js            # Task schema
│   ├── Leave.js           # Leave request schema
│   ├── Payroll.js         # Payroll schema
│   ├── Attendance.js      # Attendance schema
│   ├── Disciplinary.js    # Disciplinary records schema
│   ├── Offer.js           # Offers & promotions schema
│   ├── Announcement.js    # Announcements schema
│   └── CalendarEvent.js   # Calendar events schema
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── userRoutes.js      # User routes
│   ├── projectRoutes.js   # Project routes
│   ├── taskRoutes.js      # Task routes
│   ├── leaveRoutes.js     # Leave routes
│   └── payrollRoutes.js   # Payroll routes
├── utils/
│   ├── logger.js          # Winston logger configuration
│   └── errorResponse.js   # Custom error class
├── logs/                  # Log files (gitignored)
├── uploads/               # File uploads (gitignored)
├── .env                   # Environment variables (gitignored)
├── env.example           # Environment variables template
├── package.json          # Dependencies
└── server.js             # Main application entry point
```

## 🔧 Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elara_technologies
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📊 Database Models

### User Model
- Authentication & user management
- Roles: employee, manager, hr, admin, ceo
- Fields: email, password, name, role, department, position, etc.

### Employee Model
- Extended employee information
- Emergency contacts, bank details, documents
- Skills, education, work experience, certifications

### Project Model
- Project management
- Team members, milestones, documents
- Budget tracking, progress monitoring

### Task Model
- Task assignment and tracking
- Comments, attachments, subtasks
- Priority and status management

### Leave Model
- Leave requests and approvals
- Types: Sick, Vacation, Personal, Maternity, Paternity
- Automatic day calculation

### Payroll Model
- Salary processing
- Allowances, deductions, net pay calculation
- Payment tracking

### Attendance Model
- Daily attendance tracking
- Working hours calculation
- Overtime tracking

### Disciplinary Model
- Incident tracking
- Severity levels and actions
- Confidential records

### Offer Model
- Promotions and salary increases
- Bonus management
- Approval workflow

### Announcement Model
- Company-wide communications
- Department/role-specific targeting
- Read tracking

### CalendarEvent Model
- Event scheduling
- Meeting management
- Reminders and recurrence

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Register/Login** → Receive JWT token
2. **Token Storage** → Client stores in localStorage + httpOnly cookie
3. **Protected Routes** → Send token in Authorization header
4. **Token Verification** → Middleware validates token

### Authorization Levels

- **Public:** Login, Register
- **Private:** All authenticated users
- **Manager:** Team management
- **HR:** Employee management, leaves, payroll
- **Admin:** System administration, user management
- **CEO:** Full access to all resources

### Example Protected Route
```javascript
router.get('/users', protect, authorize('hr', 'admin', 'ceo'), getUsers);
```

## 📚 API Endpoints

### Authentication
```
POST   /api/v1/auth/register       # Register new user
POST   /api/v1/auth/login          # Login user
GET    /api/v1/auth/logout         # Logout user
GET    /api/v1/auth/me             # Get current user
PUT    /api/v1/auth/updatedetails  # Update user details
PUT    /api/v1/auth/updatepassword # Update password
```

### Users
```
GET    /api/v1/users              # Get all users (HR/Admin/CEO)
POST   /api/v1/users              # Create user (HR/Admin)
GET    /api/v1/users/stats        # Get user statistics
GET    /api/v1/users/:id          # Get single user
PUT    /api/v1/users/:id          # Update user (HR/Admin)
DELETE /api/v1/users/:id          # Delete user (Admin)
```

### Projects
```
GET    /api/v1/projects           # Get all projects
POST   /api/v1/projects           # Create project (Manager/Admin/CEO)
GET    /api/v1/projects/:id       # Get single project
PUT    /api/v1/projects/:id       # Update project (Manager/Admin)
DELETE /api/v1/projects/:id       # Delete project (Admin)
```

### Tasks
```
GET    /api/v1/tasks              # Get all tasks
POST   /api/v1/tasks              # Create task (Manager/Admin)
GET    /api/v1/tasks/:id          # Get single task
PUT    /api/v1/tasks/:id          # Update task
DELETE /api/v1/tasks/:id          # Delete task (Manager/Admin)
POST   /api/v1/tasks/:id/comments # Add comment to task
```

### Leaves
```
GET    /api/v1/leaves             # Get all leaves
POST   /api/v1/leaves             # Create leave request
GET    /api/v1/leaves/:id         # Get single leave
PUT    /api/v1/leaves/:id         # Update leave
PUT    /api/v1/leaves/:id/status  # Approve/Reject leave (Manager/HR/Admin)
DELETE /api/v1/leaves/:id         # Delete leave
```

### Payroll
```
GET    /api/v1/payroll            # Get all payroll records (HR/Admin/CEO)
POST   /api/v1/payroll            # Create payroll (HR/Admin)
GET    /api/v1/payroll/stats      # Get payroll statistics
GET    /api/v1/payroll/:id        # Get single payroll
PUT    /api/v1/payroll/:id        # Update payroll (HR/Admin)
PUT    /api/v1/payroll/:id/process # Process payroll (HR/Admin)
DELETE /api/v1/payroll/:id        # Delete payroll (Admin)
```

## 🔒 Security Features

### Implemented Security Measures

1. **Helmet.js** - Sets security HTTP headers
2. **CORS** - Configured cross-origin resource sharing
3. **Rate Limiting** - Prevents brute force attacks (100 requests/15min)
4. **MongoDB Sanitize** - Prevents NoSQL injection
5. **bcrypt** - Password hashing (12 rounds)
6. **JWT** - Secure token-based authentication
7. **httpOnly Cookies** - XSS protection
8. **Input Validation** - express-validator (planned)
9. **Error Handling** - No sensitive data exposure
10. **Logging** - Winston for audit trails

### Environment-based Security
```javascript
// Production-only features
- Secure cookies (HTTPS only)
- Strict CORS origins
- Minimal error details
- Request logging
```

## 📝 Error Handling

### Custom Error Response
```javascript
throw new ErrorResponse('Resource not found', 404);
```

### Error Types
- **400** - Bad Request / Validation Error
- **401** - Unauthorized / Invalid Token
- **403** - Forbidden / Insufficient Permissions
- **404** - Not Found
- **500** - Internal Server Error

### Response Format
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Logging

Logs are stored in `/logs` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled rejections

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas connection
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure proper CORS origins
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Enable error tracking (Sentry)
- [ ] Set up backups for MongoDB
- [ ] Configure CDN for static files
- [ ] Set up CI/CD pipeline

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name elara-api

# Monitor
pm2 monit

# Logs
pm2 logs elara-api
```

## 🔄 API Versioning

Current version: `v1`

Base URL: `http://localhost:5000/api/v1`

Future versions will be accessible via:
- `http://localhost:5000/api/v2`
- etc.

## 📈 Performance Optimization

- **Database Indexing** - All models have optimized indexes
- **Compression** - Gzip compression enabled
- **Pagination** - Implemented for list endpoints (planned)
- **Caching** - Redis integration (planned)
- **Query Optimization** - Lean queries, field selection

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details



