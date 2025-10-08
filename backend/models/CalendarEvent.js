import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an event title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    type: {
        type: String,
        enum: ['meeting', 'deadline', 'holiday', 'training', 'conference', 'other'],
        default: 'meeting'
    },
    date: {
        type: Date,
        required: [true, 'Please add an event date']
    },
    time: {
        type: String,
        default: 'All Day'
    },
    duration: {
        type: Number, // Duration in minutes
        default: 60
    },
    location: {
        type: String,
        maxlength: [200, 'Location cannot be more than 200 characters']
    },
    createdBy: {
        type: String,
        required: [true, 'Please specify who created this event']
    },
    createdByRole: {
        type: String,
        enum: ['ceo', 'hr', 'admin', 'manager'],
        required: [true, 'Please specify the creator role']
    },
    attendees: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['invited', 'accepted', 'declined', 'tentative'],
            default: 'invited'
        }
    }],
    notifyRoles: [{
        type: String,
        enum: ['all', 'ceo', 'hr', 'admin', 'manager', 'employee']
    }],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    isAllDay: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    reminders: [{
        type: {
            type: String,
            enum: ['email', 'notification', 'sms']
        },
        minutesBefore: {
            type: Number,
            default: 15
        }
    }]
}, {
    timestamps: true
});

// Indexes for efficient queries
calendarEventSchema.index({ date: 1 });
calendarEventSchema.index({ createdByRole: 1 });
calendarEventSchema.index({ type: 1 });
calendarEventSchema.index({ status: 1 });
calendarEventSchema.index({ notifyRoles: 1 });

// Virtual for formatted date
calendarEventSchema.virtual('formattedDate').get(function() {
    return this.date.toLocaleDateString();
});

// Virtual for formatted time
calendarEventSchema.virtual('formattedTime').get(function() {
    if (this.isAllDay) return 'All Day';
    return this.time;
});

export default mongoose.model('CalendarEvent', calendarEventSchema);