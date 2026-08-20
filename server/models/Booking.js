import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  service: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: String,
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    pincode: String,
  },
  location: {
    type: { type: String},
    
  },
  notes: { type: String, maxlength: 500 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String,
  }],
  cancellationReason: String,
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentId: String,
  isReviewed: { type: Boolean, default: false },
  otp: String, // OTP for service start verification
}, { timestamps: true });

bookingSchema.index({ location: '2dsphere' });

export default mongoose.model('Booking', bookingSchema);
