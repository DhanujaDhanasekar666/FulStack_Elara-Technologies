import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Salary Increase', 'Promotion', 'Bonus', 'Transfer', 'Role Change'],
        required: true
    },
    currentPosition: {
        type: String
    },
    newPosition: {
        type: String
    },
    currentSalary: {
        type: Number
    },
    newSalary: {
        type: Number
    },
    salaryIncreasePercentage: {
        type: Number
    },
    bonusAmount: {
        type: Number
    },
    effectiveDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    benefits: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Accepted', 'Declined'],
        default: 'Pending'
    },
    proposedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    acceptedAt: {
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
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes
OfferSchema.index({ employee: 1 });
OfferSchema.index({ status: 1 });
OfferSchema.index({ type: 1 });

// Calculate salary increase percentage
OfferSchema.pre('save', function(next) {
    if (this.type === 'Salary Increase' && this.currentSalary && this.newSalary) {
        this.salaryIncreasePercentage = Math.round(
            ((this.newSalary - this.currentSalary) / this.currentSalary) * 100 * 100
        ) / 100;
    }
    next();
});

export default mongoose.model('Offer', OfferSchema);






