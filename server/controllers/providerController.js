import Provider from '../models/Provider.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// @desc Get all providers (with filters)
export const getProviders = async (req, res, next) => {
  try {
    const { category, search, minRating, maxPrice, lat, lng, radius = 50, page = 1, limit = 12 } = req.query;

    // Build provider query
    const providerQuery = { isApproved: true };
    if (category) providerQuery.category = category;
    if (minRating) providerQuery.rating = { $gte: Number(minRating) };

    // Build user query for search
    let userIds = null;
    if (search) {
      const users = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'provider',
      }).select('_id');
      userIds = users.map(u => u._id);
    }

    if (userIds) providerQuery.user = { $in: userIds };

    let providers = await Provider.find(providerQuery)
      .populate('user', 'name avatar phone location address')
      .populate('category', 'name icon slug')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Distance filtering if lat/lng provided
    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const radiusKm = Number(radius);

      providers = providers.filter(p => {
        const coords = p.user?.location?.coordinates;
        if (!coords || (coords[0] === 0 && coords[1] === 0)) return true;
        const dist = getDistanceKm(userLat, userLng, coords[1], coords[0]);
        p._doc = { ...p._doc, distance: Math.round(dist * 10) / 10 };
        return dist <= radiusKm;
      });

      providers.sort((a, b) => (a._doc?.distance || 999) - (b._doc?.distance || 999));
    }

    const total = await Provider.countDocuments(providerQuery);

    res.json({ success: true, providers, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc Get single provider
export const getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('user', 'name avatar phone address location')
      .populate('category', 'name icon slug');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc Update provider profile
export const updateProviderProfile = async (req, res, next) => {
  try {
    const { businessName, bio, experience, skills, services, availability, serviceArea } = req.body;

    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      {
        businessName,
        bio,
        experience: Number(experience),
        skills: typeof skills === 'string' ? JSON.parse(skills) : skills,
        services: typeof services === 'string' ? JSON.parse(services) : services,
        availability: typeof availability === 'string' ? JSON.parse(availability) : availability,
        serviceArea: Number(serviceArea),
      },
      { new: true, runValidators: true }
    ).populate('category', 'name icon');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc Get provider profile (own)
export const getMyProviderProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id })
      .populate('user', 'name avatar phone address')
      .populate('category', 'name icon slug');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// Haversine formula to calculate distance
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function toRad(deg) { return deg * (Math.PI / 180); }
