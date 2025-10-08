import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add content'],
        maxlength: [2000, 'Content cannot be more than 2000 characters']
    },
    type: {
        type: String,
        enum: ['announcement', 'event', 'alert', 'info'],
        default: 'announcement'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    createdBy: {
        type: String,
        required: [true, 'Please specify who created this announcement']
    },
    targetRoles: [{
        type: String,
        enum: ['all', 'ceo', 'hr', 'admin', 'manager', 'employee']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date
    },
    readBy: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ targetRoles: 1 });

export default mongoose.model('Announcement', announcementSchema);