import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave', 'Holiday', 'Weekend'],
        default: 'Present'
    },
    workingHours: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        enum: ['Office', 'Remote', 'Client Site'],
        default: 'Office'
    },
    notes: {
        type: String
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });

// Calculate working hours when checkout is recorded
AttendanceSchema.pre('save', function(next) {
    if (this.checkIn && this.checkOut) {
        const diff = this.checkOut.getTime() - this.checkIn.getTime();
        const hours = diff / (1000 * 60 * 60);
        this.workingHours = Math.round(hours * 100) / 100;
        
        // Calculate overtime (assuming 8 hours is standard)
        if (hours > 8) {
            this.overtime = Math.round((hours - 8) * 100) / 100;
        }
    }
    next();
});

export default mongoose.model('Attendance', AttendanceSchema);






