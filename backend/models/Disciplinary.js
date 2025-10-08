import mongoose from 'mongoose';

const DisciplinarySchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issue: {
        type: String,
        required: [true, 'Please describe the issue'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Attendance', 'Performance', 'Conduct', 'Policy Violation', 'Safety', 'Other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Resolved', 'Escalated', 'Closed'],
        default: 'Pending'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedDate: {
        type: Date,
        default: Date.now
    },
    action: {
        type: String,
        enum: ['Warning', 'Written Warning', 'Suspension', 'Termination', 'Training', 'No Action'],
    },
    actionDate: {
        type: Date
    },
    actionTakenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    documents: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notes: [{
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        note: String,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    followUpDate: {
        type: Date
    },
    isConfidential: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
DisciplinarySchema.index({ employee: 1 });
DisciplinarySchema.index({ status: 1 });
DisciplinarySchema.index({ severity: 1 });

export default mongoose.model('Disciplinary', DisciplinarySchema);






