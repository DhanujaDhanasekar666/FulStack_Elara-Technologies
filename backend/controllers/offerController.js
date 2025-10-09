import Offer from '../models/Offer.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getOffers = asyncHandler(async (req, res) => {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: offers.length, data: offers });
});

export const createOffer = asyncHandler(async (req, res, next) => {
    req.body.createdBy = req.user.id;
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, data: offer });
});

export const updateOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
});

export const sendOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offer.findByIdAndUpdate(req.params.id, { status: 'sent' }, { new: true });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
});

export const acceptOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offer.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
});

export const declineOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offer.findByIdAndUpdate(req.params.id, { status: 'declined' }, { new: true });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
});

export const deleteOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    await offer.deleteOne();
    res.status(200).json({ success: true, data: {} });
});


