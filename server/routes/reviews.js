import express from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create review
router.post('/', protect, authorize('user'), async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    if (booking.isReviewed)
      return res.status(400).json({ success: false, message: 'Already reviewed' });

    const review = await Review.create({
      user: req.user._id,
      provider: booking.provider,
      booking: bookingId,
      rating: Number(rating),
      comment,
    });

    await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });
    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, review });
  } catch (error) { next(error); }
});

// Get reviews for a provider
router.get('/provider/:providerId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Review.countDocuments({ provider: req.params.providerId });
    res.json({ success: true, reviews, total });
  } catch (error) { next(error); }
});

// Provider responds to review
router.put('/:id/respond', protect, authorize('provider'), async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { response: { comment: req.body.comment, respondedAt: new Date() } },
      { new: true }
    ).populate('user', 'name avatar');
    res.json({ success: true, review });
  } catch (error) { next(error); }
});

export default router;
