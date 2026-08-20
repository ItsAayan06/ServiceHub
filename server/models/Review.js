import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  images: [String],
  response: { // Provider response
    comment: String,
    respondedAt: Date,
  },
}, { timestamps: true });

// Update provider rating after review
reviewSchema.post('save', async function () {
  const Provider = mongoose.model('Provider');
  const reviews = await mongoose.model('Review').find({ provider: this.provider });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Provider.findByIdAndUpdate(this.provider, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  });
});

export default mongoose.model('Review', reviewSchema);
