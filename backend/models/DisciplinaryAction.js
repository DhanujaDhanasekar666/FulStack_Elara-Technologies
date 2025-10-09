import mongoose from 'mongoose';

const DisciplinaryActionSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Employee is required']
        },
        type: {
            type: String,
            enum: ['warning', 'suspension', 'termination', 'probation', 'notice'],
            required: [true, 'Action type is required']
        },
        reason: {
            type: String,
            required: [true, 'Reason is required'],
            trim: true
        },
        action: {
            type: String,
            required: [true, 'Action details are required'],
            trim: true
        },
        status: {
            type: String,
            enum: ['open', 'in_review', 'closed'],
            default: 'open'
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Issuer is required']
        },
        issuedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            trim: true
        },
        attachments: [{
            name: String,
            url: String
        }]
    },
    {
        timestamps: true
    }
);

DisciplinaryActionSchema.index({ employee: 1, issuedAt: -1 });

const DisciplinaryAction = mongoose.model('DisciplinaryAction', DisciplinaryActionSchema);
export default DisciplinaryAction;


