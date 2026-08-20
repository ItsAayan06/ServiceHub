import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import { io, connectedUsers } from '../index.js';

// Send real-time notification
const sendNotification = async (userId, notification) => {
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
  // Save notification to DB
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { $each: [notification], $position: 0 } }
  });
};

// @desc Create booking
export const createBooking = async (req, res, next) => {
  try {
    const { providerId, serviceIndex, scheduledDate, scheduledTime, address, notes, location } = req.body;

    const provider = await Provider.findById(providerId).populate('user');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (!provider.isApproved) {
      return res.status(400).json({ success: false, message: 'Provider is not approved yet' });
    }

    const service = provider.services[serviceIndex];
    if (!service) {
      return res.status(400).json({ success: false, message: 'Service not found' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      provider: providerId,
      service: { name: service.name, price: service.price, unit: service.unit },
      category: provider.category,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      address,
      notes,
      location,
      totalAmount: service.price,
      statusHistory: [{ status: 'pending', note: 'Booking created' }],
    });

    await booking.populate(['user', { path: 'provider', populate: 'user' }]);

    // Notify provider
    await sendNotification(provider.user._id, {
      message: `New booking request from ${req.user.name}`,
      type: 'booking',
      bookingId: booking._id,
    });

    // Real-time emit to provider
    const providerSocketId = connectedUsers.get(provider.user._id.toString());
    if (providerSocketId) {
      io.to(providerSocketId).emit('new_booking', booking);
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc Get user's bookings
export const getUserBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate({ path: 'provider', populate: [{ path: 'user', select: 'name avatar phone' }, { path: 'category', select: 'name icon' }] })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({ success: true, bookings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc Get provider's bookings
export const getProviderBookings = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { provider: provider._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'name avatar phone address')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({ success: true, bookings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc Update booking status
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name' } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const provider = await Provider.findOne({ user: req.user._id });

    // Validate ownership
    const isProvider = provider && booking.provider._id.toString() === provider._id.toString();
    const isUser = booking.user._id.toString() === req.user._id.toString();

    if (!isProvider && !isUser && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Validate status transitions
    const allowedTransitions = {
      pending: ['accepted', 'rejected', 'cancelled'],
      accepted: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
    };

    if (allowedTransitions[booking.status] && !allowedTransitions[booking.status].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot change from ${booking.status} to ${status}` });
    }

    booking.status = status;
    booking.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    if (cancellationReason) booking.cancellationReason = cancellationReason;

    if (status === 'completed') {
      await Provider.findByIdAndUpdate(booking.provider._id, {
        $inc: { totalEarnings: booking.totalAmount, completedJobs: 1 },
      });
    }

    await booking.save();

    // Notify user
    const notifyUserId = isProvider ? booking.user._id : booking.provider.user._id;
    const notifyMsg = isProvider
      ? `Your booking has been ${status} by ${booking.provider.user.name}`
      : `Booking ${status} by ${booking.user.name}`;

    await sendNotification(notifyUserId, {
      message: notifyMsg,
      type: 'booking',
      bookingId: booking._id,
    });

    // Real-time emit
    const notifySocketId = connectedUsers.get(notifyUserId.toString());
    if (notifySocketId) {
      io.to(notifySocketId).emit('booking_status_update', { bookingId: booking._id, status, booking });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc Get single booking
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name avatar phone')
      .populate({ path: 'provider', populate: [{ path: 'user', select: 'name avatar phone' }, 'category'] })
      .populate('category', 'name icon');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc Get provider earnings stats
export const getProviderStats = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const [total, pending, completed, inProgress] = await Promise.all([
      Booking.countDocuments({ provider: provider._id }),
      Booking.countDocuments({ provider: provider._id, status: 'pending' }),
      Booking.countDocuments({ provider: provider._id, status: 'completed' }),
      Booking.countDocuments({ provider: provider._id, status: 'in_progress' }),
    ]);

    // Monthly earnings
    const monthlyEarnings = await Booking.aggregate([
      { $match: { provider: provider._id, status: 'completed' } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          earnings: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      stats: {
        total, pending, completed, inProgress,
        totalEarnings: provider.totalEarnings,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        monthlyEarnings,
      },
    });
  } catch (error) {
    next(error);
  }
};
