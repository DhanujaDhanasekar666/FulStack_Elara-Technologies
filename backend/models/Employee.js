import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        email: String
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String
    },
    documents: [{
        type: {
            type: String,
            enum: ['Resume', 'ID Proof', 'Address Proof', 'Education', 'Experience', 'Other']
        },
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    skills: [String],
    education: [{
        degree: String,
        institution: String,
        yearOfCompletion: Number,
        grade: String
    }],
    workExperience: [{
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String
    }],
    certifications: [{
        name: String,
        issuingOrganization: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String
    }],
    performanceReviews: [{
        reviewDate: Date,
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String,
        goals: [String]
    }]
}, {
    timestamps: true
});

// Indexes
EmployeeSchema.index({ userId: 1 });

export default mongoose.model('Employee', EmployeeSchema);






