import mongoose from 'mongoose';

const ApprovalSchema = new mongoose.Schema({
    role: { type: String, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    at: Date
}, { _id: false });

const OfferSchema = new mongoose.Schema({
    candidateName: { type: String, required: true, trim: true },
    candidateEmail: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, required: true, trim: true },
    grade: { type: String, trim: true },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    comp: {
        base: { type: Number, required: true },
        variable: { type: Number, default: 0 },
        joiningBonus: { type: Number, default: 0 },
        perks: { type: String, default: '' }
    },
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'declined', 'expired', 'withdrawn'], default: 'draft', index: true },
    approvals: { type: [ApprovalSchema], default: [] },
    validUntil: { type: Date },
    letterUrl: { type: String },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Offer', OfferSchema);

