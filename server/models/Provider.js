import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  startTime: String,
  endTime: String,
  isAvailable: { type: Boolean, default: true },
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  unit: { type: String, enum: ['hour', 'job', 'visit'], default: 'job' },
  duration: Number, // in minutes
});

const providerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  skills: [String],
  bio: { type: String, maxlength: 500 },
  experience: { type: Number, default: 0 }, // years
  services: [serviceSchema],
  availability: [availabilitySlotSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  serviceArea: { type: Number, default: 20 }, // km radius
  documents: [{
    name: String,
    url: String,
  }],
  gallery: [String],
}, { timestamps: true });

export default mongoose.model('Provider', providerSchema);
