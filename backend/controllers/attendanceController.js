import Attendance from '../models/Attendance.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get all attendance records
// @route   GET /api/v1/attendance
// @access  Private
export const getAttendance = asyncHandler(async (req, res, next) => {
    const { employee, date, status, location, startDate, endDate } = req.query;
    let query = {};
    
    // If employee, only show their attendance
    if (req.user.role === 'employee') {
        query.employee = req.user.id;
    } else {
        if (employee) query.employee = employee;
    }
    
    if (date) {
        const targetDate = new Date(date);
        query.date = {
            $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            $lte: new Date(targetDate.setHours(23, 59, 59, 999))
        };
    }
    
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    if (status) query.status = status;
    if (location) query.location = location;

    const attendance = await Attendance.find(query)
        .populate('employee', 'name email employeeId department')
        .populate('approvedBy', 'name email')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: attendance.length,
        data: attendance
    });
});

// @desc    Get single attendance record
// @route   GET /api/v1/attendance/:id
// @access  Private
export const getAttendanceRecord = asyncHandler(async (req, res, next) => {
    const attendance = await Attendance.findById(req.params.id)
        .populate('employee', 'name email employeeId department position')
        .populate('approvedBy', 'name email');

    if (!attendance) {
        return res.status(404).json({ 
            success: false, 
            error: `Attendance record not found with id of ${req.params.id}` 
        });
    }

    // Check if user can access this record
    if (req.user.role === 'employee' && attendance.employee._id.toString() !== req.user.id) {
        return res.status(403).json({ 
            success: false, 
            error: 'Not authorized to access this attendance record' 
        });
    }

    res.status(200).json({
        success: true,
        data: attendance
    });
});

// @desc    Create new attendance record
// @route   POST /api/v1/attendance
// @access  Private
export const createAttendance = asyncHandler(async (req, res, next) => {
    const { employee, date, checkIn, checkOut, status, location, notes } = req.body;
    
    // If employee, they can only create their own attendance
    const employeeId = req.user.role === 'employee' ? req.user.id : employee;
    
    if (!employeeId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Employee ID is required' 
        });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
        employee: employeeId,
        date: {
            $gte: new Date(date).setHours(0, 0, 0, 0),
            $lte: new Date(date).setHours(23, 59, 59, 999)
        }
    });

    if (existingAttendance) {
        return res.status(400).json({ 
            success: false, 
            error: 'Attendance record already exists for this date' 
        });
    }

    const attendance = await Attendance.create({
        employee: employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : new Date(),
        checkOut: checkOut ? new Date(checkOut) : null,
        status: status || 'Present',
        location: location || 'Office',
        notes: notes || ''
    });

    await attendance.populate('employee', 'name email employeeId department');

    res.status(201).json({
        success: true,
        data: attendance
    });
});

// @desc    Update attendance record
// @route   PUT /api/v1/attendance/:id
// @access  Private
export const updateAttendance = asyncHandler(async (req, res, next) => {
    let attendance = await Attendance.findById(req.params.id)
        .populate('employee', 'name email employeeId department');

    if (!attendance) {
        return res.status(404).json({ 
            success: false, 
            error: `Attendance record not found with id of ${req.params.id}` 
        });
    }

    // Check if user can update this record
    if (req.user.role === 'employee' && attendance.employee._id.toString() !== req.user.id) {
        return res.status(403).json({ 
            success: false, 
            error: 'Not authorized to update this attendance record' 
        });
    }

    // Update fields
    const { checkIn, checkOut, status, location, notes } = req.body;
    
    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) attendance.checkOut = new Date(checkOut);
    if (status) attendance.status = status;
    if (location) attendance.location = location;
    if (notes !== undefined) attendance.notes = notes;

    // If manager/admin is updating, mark as approved
    if (req.user.role !== 'employee') {
        attendance.approvedBy = req.user.id;
    }

    await attendance.save();

    res.status(200).json({
        success: true,
        data: attendance
    });
});

// @desc    Delete attendance record
// @route   DELETE /api/v1/attendance/:id
// @access  Private (Manager, HR, Admin only)
export const deleteAttendance = asyncHandler(async (req, res, next) => {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
        return res.status(404).json({ 
            success: false, 
            error: `Attendance record not found with id of ${req.params.id}` 
        });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Attendance record deleted successfully'
    });
});

// @desc    Get attendance statistics
// @route   GET /api/v1/attendance/stats
// @access  Private
export const getAttendanceStats = asyncHandler(async (req, res, next) => {
    const { employee, startDate, endDate } = req.query;
    
    let query = {};
    
    // If employee, only show their stats
    if (req.user.role === 'employee') {
        query.employee = req.user.id;
    } else if (employee) {
        query.employee = employee;
    }
    
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else {
        // Default to current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        query.date = {
            $gte: startOfMonth,
            $lte: endOfMonth
        };
    }

    const attendance = await Attendance.find(query)
        .populate('employee', 'name email employeeId department');

    const stats = {
        totalDays: attendance.length,
        presentDays: attendance.filter(a => a.status === 'Present').length,
        lateDays: attendance.filter(a => a.status === 'Late').length,
        absentDays: attendance.filter(a => a.status === 'Absent').length,
        halfDays: attendance.filter(a => a.status === 'Half Day').length,
        totalWorkingHours: attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0),
        totalOvertime: attendance.reduce((sum, a) => sum + (a.overtime || 0), 0),
        attendanceRate: attendance.length > 0 ? 
            Math.round((attendance.filter(a => a.status === 'Present' || a.status === 'Late').length / attendance.length) * 100) : 0
    };

    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Check in/out for current day
// @route   POST /api/v1/attendance/checkin
// @route   POST /api/v1/attendance/checkout
// @access  Private (Employee only)
export const checkIn = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'employee') {
        return res.status(403).json({ 
            success: false, 
            error: 'Only employees can check in' 
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
        employee: req.user.id,
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });

    if (existingAttendance && existingAttendance.checkIn) {
        return res.status(400).json({ 
            success: false, 
            error: 'Already checked in today' 
        });
    }

    let attendance;
    if (existingAttendance) {
        // Update existing record
        attendance = existingAttendance;
        attendance.checkIn = new Date();
        attendance.status = 'Present';
        await attendance.save();
    } else {
        // Create new record
        attendance = await Attendance.create({
            employee: req.user.id,
            date: new Date(),
            checkIn: new Date(),
            status: 'Present',
            location: req.body.location || 'Office'
        });
    }

    await attendance.populate('employee', 'name email employeeId department');

    res.status(200).json({
        success: true,
        data: attendance,
        message: 'Checked in successfully'
    });
});

export const checkOut = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'employee') {
        return res.status(403).json({ 
            success: false, 
            error: 'Only employees can check out' 
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's attendance record
    const attendance = await Attendance.findOne({
        employee: req.user.id,
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });

    if (!attendance) {
        return res.status(400).json({ 
            success: false, 
            error: 'No check-in record found for today' 
        });
    }

    if (attendance.checkOut) {
        return res.status(400).json({ 
            success: false, 
            error: 'Already checked out today' 
        });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    await attendance.populate('employee', 'name email employeeId department');

    res.status(200).json({
        success: true,
        data: attendance,
        message: 'Checked out successfully'
    });
});
