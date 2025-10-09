import mongoose from 'mongoose';

const ApprovalSchema = new mongoose.Schema({
    role: { type: String, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    at: Date
}, { _id: false });

const CompSchema = new mongoose.Schema({
    base: { type: Number, required: true },
    variable: { type: Number, default: 0 }
}, { _id: false });

const PromotionSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    current: {
        role: String,
        grade: String,
        comp: CompSchema
    },
    proposed: {
        role: { type: String, required: true },
        grade: String,
        comp: CompSchema,
        effectiveDate: { type: Date }
    },
    reason: { type: String, trim: true },
    attachments: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'in_review', 'approved', 'rejected', 'scheduled'], default: 'draft', index: true },
    approvals: { type: [ApprovalSchema], default: [] },
    audit: { type: [{ action: String, by: { type: mongoose.Schema.ObjectId, ref: 'User' }, at: Date, meta: Object }], default: [] },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Promotion', PromotionSchema);


