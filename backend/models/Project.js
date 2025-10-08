import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a project name'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a project description']
    },
    department: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Planning'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    actualEndDate: {
        type: Date
    },
    budget: {
        allocated: Number,
        spent: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    projectManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamMembers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String,
        joinedDate: {
            type: Date,
            default: Date.now
        }
    }],
    milestones: [{
        title: String,
        description: String,
        dueDate: Date,
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending'
        },
        completedDate: Date
    }],
    documents: [{
        fileName: String,
        fileUrl: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ department: 1 });
ProjectSchema.index({ projectManager: 1 });

// Virtual for team size
ProjectSchema.virtual('teamSize').get(function() {
    return this.teamMembers.length;
});

export default mongoose.model('Project', ProjectSchema);






