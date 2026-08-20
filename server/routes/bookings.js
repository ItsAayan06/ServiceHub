import express from 'express';
import {
  createBooking, getUserBookings, getProviderBookings,
  updateBookingStatus, getBookingById, getProviderStats
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('user'), createBooking);
router.get('/my', protect, getUserBookings);
router.get('/provider', protect, authorize('provider'), getProviderBookings);
router.get('/provider/stats', protect, authorize('provider'), getProviderStats);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);

export default router;
