import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: String,
  icon: String, // emoji or icon name
  image: String,
  isActive: { type: Boolean, default: true },
  providerCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
