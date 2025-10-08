import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Sick Leave', 'Vacation', 'Personal', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'],
        required: true
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide end date']
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    documents: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    numberOfDays: {
        type: Number,
        min: 0.5
    }
}, {
    timestamps: true
});

// Indexes
LeaveSchema.index({ employee: 1 });
LeaveSchema.index({ status: 1 });
LeaveSchema.index({ startDate: 1 });

// Calculate number of days before saving
LeaveSchema.pre('save', function(next) {
    if (this.startDate && this.endDate) {
        const timeDiff = this.endDate.getTime() - this.startDate.getTime();
        this.numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    }
    next();
});

export default mongoose.model('Leave', LeaveSchema);






