/**
 * Database Seeder — run with: node seed.js
 * Seeds: categories, admin user, demo user, demo provider
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/servicehub';

// ─── Schemas (inline for portability) ───────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  phone: String, role: { type: String, default: 'user' },
  avatar: String, address: Object, location: Object, isActive: { type: Boolean, default: true },
  notifications: Array,
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, description: String,
  icon: String, image: String, isActive: { type: Boolean, default: true }, providerCount: { type: Number, default: 0 },
}, { timestamps: true });

const providerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  businessName: String, skills: [String], bio: String, experience: Number,
  services: Array, availability: Array, rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }, totalEarnings: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 }, isApproved: { type: Boolean, default: false },
  isOnline: Boolean, serviceArea: Number,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Provider = mongoose.models.Provider || mongoose.model('Provider', providerSchema);

const CATEGORIES = [
  { name: 'Electrician', slug: 'electrician', icon: '⚡', description: 'Electrical wiring, repairs & installations' },
  { name: 'Plumber', slug: 'plumber', icon: '🔧', description: 'Pipe fitting, leakage repairs & installations' },
  { name: 'AC Repair', slug: 'ac-repair', icon: '❄️', description: 'Air conditioner service, repair & installation' },
  { name: 'Cleaning', slug: 'cleaning', icon: '🧹', description: 'Home & office deep cleaning services' },
  { name: 'Carpenter', slug: 'carpenter', icon: '🪚', description: 'Furniture repair, woodwork & installations' },
  { name: 'Painter', slug: 'painter', icon: '🎨', description: 'Interior & exterior painting services' },
  { name: 'Gardener', slug: 'gardener', icon: '🌿', description: 'Garden maintenance & landscaping' },
  { name: 'Security', slug: 'security', icon: '🔒', description: 'CCTV, locks & security system installation' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Provider.deleteMany({});
    console.log('🗑  Cleared existing data');

    // Seed categories
    const categories = await Category.insertMany(CATEGORIES);
    console.log(`✅ Created ${categories.length} categories`);

    // Hash password
    const pass = await bcrypt.hash('demo123', 12);

    // Admin user
    const admin = await User.create({
      name: 'Admin User', email: 'admin@demo.com', password: pass,
      phone: '+91 9000000001', role: 'admin',
      address: { street: '1 Admin Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    });
    console.log('✅ Created admin:', admin.email);

    // Demo customer
    const customer = await User.create({
      name: 'Rahul Sharma', email: 'user@demo.com', password: pass,
      phone: '+91 9876543210', role: 'user',
      address: { street: '42 Park Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400002' },
      location: { type: 'Point', coordinates: [72.8856, 19.0523] },
    });
    console.log('✅ Created user:', customer.email);

    // Demo providers
    const providerUsers = [
      { name: 'Suresh Electricals', email: 'provider@demo.com', phone: '+91 9988776655', cat: 'electrician',
        bio: 'Expert electrician with 8 years of experience in residential and commercial wiring.', exp: 8,
        skills: ['Wiring', 'Panel Installation', 'Fault Detection', 'LED Lighting'],
        services: [
          { name: 'Basic Electrical Repair', price: 299, unit: 'job', duration: 60 },
          { name: 'Fan Installation', price: 199, unit: 'job', duration: 30 },
          { name: 'Full House Wiring', price: 4999, unit: 'job', duration: 480 },
        ],
        rating: 4.7, reviewCount: 42, completedJobs: 156, totalEarnings: 78000,
        location: [72.8856, 19.0600],
      },
      { name: 'Amit Plumbing Works', email: 'plumber@demo.com', phone: '+91 9977665544', cat: 'plumber',
        bio: 'Professional plumber specializing in leak repairs and bathroom fittings.', exp: 6,
        skills: ['Leak Repair', 'Pipe Fitting', 'Bathroom Installation', 'Drain Cleaning'],
        services: [
          { name: 'Leak Detection & Repair', price: 399, unit: 'job', duration: 90 },
          { name: 'Tap/Faucet Replacement', price: 249, unit: 'job', duration: 45 },
          { name: 'Bathroom Fitting', price: 2999, unit: 'job', duration: 360 },
        ],
        rating: 4.5, reviewCount: 28, completedJobs: 89, totalEarnings: 52000,
        location: [72.8900, 19.0480],
      },
      { name: 'Cool Air Services', email: 'ac@demo.com', phone: '+91 9966554433', cat: 'ac-repair',
        bio: 'Certified AC technician for all brands. Servicing, repairs and installation.', exp: 5,
        skills: ['AC Servicing', 'Gas Refilling', 'Compressor Repair', 'Installation'],
        services: [
          { name: 'AC Service & Cleaning', price: 599, unit: 'job', duration: 90 },
          { name: 'Gas Refilling', price: 1299, unit: 'job', duration: 60 },
          { name: 'AC Installation', price: 1999, unit: 'job', duration: 180 },
        ],
        rating: 4.8, reviewCount: 61, completedJobs: 234, totalEarnings: 145000,
        location: [72.8750, 19.0700],
      },
      { name: 'CleanPro Services', email: 'clean@demo.com', phone: '+91 9955443322', cat: 'cleaning',
        bio: 'Professional home and office cleaning with eco-friendly products.', exp: 4,
        skills: ['Deep Cleaning', 'Sofa Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitization'],
        services: [
          { name: '1BHK Deep Cleaning', price: 1299, unit: 'job', duration: 240 },
          { name: '2BHK Deep Cleaning', price: 1899, unit: 'job', duration: 360 },
          { name: 'Office Cleaning (per 1000sqft)', price: 999, unit: 'job', duration: 180 },
        ],
        rating: 4.6, reviewCount: 35, completedJobs: 112, totalEarnings: 67000,
        location: [72.8800, 19.0550],
      },
    ];

    for (const pd of providerUsers) {
      const catDoc = categories.find(c => c.slug === pd.cat);
      const userDoc = await User.create({
        name: pd.name, email: pd.email, password: pass, phone: pd.phone, role: 'provider',
        address: { city: 'Mumbai', state: 'Maharashtra' },
        location: { type: 'Point', coordinates: pd.location },
      });
      await Provider.create({
        user: userDoc._id, category: catDoc._id,
        businessName: pd.name, bio: pd.bio, experience: pd.exp,
        skills: pd.skills, services: pd.services,
        rating: pd.rating, reviewCount: pd.reviewCount,
        completedJobs: pd.completedJobs, totalEarnings: pd.totalEarnings,
        isApproved: true, serviceArea: 30,
        availability: [
          { day: 'Mon', startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 'Tue', startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 'Wed', startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 'Thu', startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 'Fri', startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 'Sat', startTime: '10:00', endTime: '16:00', isAvailable: true },
          { day: 'Sun', startTime: '10:00', endTime: '14:00', isAvailable: false },
        ],
      });
      await Category.findByIdAndUpdate(catDoc._id, { $inc: { providerCount: 1 } });
      console.log(`✅ Created provider: ${pd.email}`);
    }

    console.log('\n🎉 Seeding complete!\n');
    console.log('Demo Credentials:');
    console.log('─────────────────────────────────');
    console.log('Admin:    admin@demo.com    / demo123');
    console.log('User:     user@demo.com     / demo123');
    console.log('Provider: provider@demo.com / demo123');
    console.log('─────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
