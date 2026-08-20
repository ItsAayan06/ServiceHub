import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Category from '../models/Category.js';
import { generateToken } from '../utils/jwt.js';

// @desc Register user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name, email, password, phone,
      role: role === 'provider' ? 'provider' : 'user',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const token = generateToken(user._id);

    // Get provider data if role is provider
    let providerData = null;
    if (user.role === 'provider') {
      providerData = await Provider.findOne({ user: user._id }).populate('category');
    }

    res.json({
      success: true,
      token,
      user: user.toJSON(),
      provider: providerData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let providerData = null;
    if (user.role === 'provider') {
      providerData = await Provider.findOne({ user: user._id }).populate('category');
    }
    res.json({ success: true, user, provider: providerData });
  } catch (error) {
    next(error);
  }
};

// @desc Register as provider (complete profile)
export const registerProvider = async (req, res, next) => {
  try {
    const { categoryId, businessName, bio, experience, skills, services } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if provider profile already exists
    let provider = await Provider.findOne({ user: req.user._id });
    if (provider) {
      return res.status(400).json({ success: false, message: 'Provider profile already exists' });
    }

    provider = await Provider.create({
      user: req.user._id,
      category: categoryId,
      businessName,
      bio,
      experience: Number(experience) || 0,
      skills: typeof skills === 'string' ? JSON.parse(skills) : skills || [],
      services: typeof services === 'string' ? JSON.parse(services) : services || [],
    });

    // Update user role
    await User.findByIdAndUpdate(req.user._id, { role: 'provider' });

    // Update category provider count
    await Category.findByIdAndUpdate(categoryId, { $inc: { providerCount: 1 } });

    res.status(201).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};
