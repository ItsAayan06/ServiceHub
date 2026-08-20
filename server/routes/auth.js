import express from 'express';
import { register, login, getMe, registerProvider } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/provider/setup', protect, registerProvider);

export default router;
