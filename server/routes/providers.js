import express from 'express';
import {
  getProviders, getProviderById, updateProviderProfile, getMyProviderProfile
} from '../controllers/providerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getProviders);
router.get('/me', protect, authorize('provider', 'admin'), getMyProviderProfile);
router.get('/:id', getProviderById);
router.put('/me', protect, authorize('provider'), updateProviderProfile);

// Upload gallery image
router.post('/me/gallery', protect, authorize('provider'), upload.single('image'), async (req, res, next) => {
  try {
    const { Provider } = await import('../models/Provider.js');
    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      { $push: { gallery: req.file.path } },
      { new: true }
    );
    res.json({ success: true, gallery: provider.gallery });
  } catch (error) { next(error); }
});

export default router;
