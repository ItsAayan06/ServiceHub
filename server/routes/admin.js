import express from 'express';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';
import Category from '../models/Category.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// Dashboard analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const [totalUsers, totalProviders, totalBookings, pendingProviders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Provider.countDocuments(),
      Booking.countDocuments(),
      Provider.countDocuments({ isApproved: false }),
    ]);

    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers, totalProviders, totalBookings,
        pendingProviders, totalRevenue,
        bookingsByStatus, monthlyBookings,
      }
    });
  } catch (error) { next(error); }
});

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: 'i' };

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (error) { next(error); }
});

// Toggle user active status
router.put('/users/:id/toggle', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

// Get all providers (including unapproved)
router.get('/providers', async (req, res, next) => {
  try {
    const { approved, page = 1, limit = 20 } = req.query;
    const query = {};
    if (approved !== undefined) query.isApproved = approved === 'true';

    const providers = await Provider.find(query)
      .populate('user', 'name email avatar phone')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Provider.countDocuments(query);
    res.json({ success: true, providers, total });
  } catch (error) { next(error); }
});

// Approve/reject provider
router.put('/providers/:id/approve', async (req, res, next) => {
  try {
    const { approved } = req.body;
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { isApproved: approved },
      { new: true }
    ).populate('user', 'name email');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.json({ success: true, provider });
  } catch (error) { next(error); }
});

// Get all bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const bookings = await Booking.find(query)
      .populate('user', 'name avatar')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name avatar' } })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(query);
    res.json({ success: true, bookings, total });
  } catch (error) { next(error); }
});

export default router;
