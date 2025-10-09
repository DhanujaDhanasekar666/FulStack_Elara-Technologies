import Promotion from '../models/Promotion.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getPromotions = asyncHandler(async (req, res) => {
    const promos = await Promotion.find().populate('employee', 'name email employeeId department role').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: promos.length, data: promos });
});

export const createPromotion = asyncHandler(async (req, res, next) => {
    req.body.createdBy = req.user.id;
    const promo = await Promotion.create(req.body);
    res.status(201).json({ success: true, data: promo });
});

export const updatePromotion = asyncHandler(async (req, res, next) => {
    const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promo) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.status(200).json({ success: true, data: promo });
});

export const approvePromotion = asyncHandler(async (req, res, next) => {
    let promo = await Promotion.findById(req.params.id);
    if (!promo) return res.status(404).json({ success: false, error: 'Promotion not found' });

    // Reflect promotion on the employee record
    const updates = {};
    if (promo.proposed?.role) updates.role = promo.proposed.role;
    if (promo.proposed?.grade) updates.grade = promo.proposed.grade;
    if (promo.proposed?.comp?.base != null) updates.baseSalary = promo.proposed.comp.base;
    if (promo.proposed?.comp?.variable != null) updates.variablePay = promo.proposed.comp.variable;
    if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(promo.employee, { $set: updates }, { new: true });
    }

    promo = await Promotion.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!promo) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.status(200).json({ success: true, data: promo });
});

export const rejectPromotion = asyncHandler(async (req, res, next) => {
    const promo = await Promotion.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!promo) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.status(200).json({ success: true, data: promo });
});

export const schedulePromotion = asyncHandler(async (req, res, next) => {
    const promo = await Promotion.findByIdAndUpdate(req.params.id, { status: 'scheduled', 'proposed.effectiveDate': req.body.effectiveDate }, { new: true });
    if (!promo) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.status(200).json({ success: true, data: promo });
});

export const deletePromotion = asyncHandler(async (req, res, next) => {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) return res.status(404).json({ success: false, error: 'Promotion not found' });
    await promo.deleteOne();
    res.status(200).json({ success: true, data: {} });
});


