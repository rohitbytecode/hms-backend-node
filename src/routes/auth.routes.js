import express from 'express';
import * as authController from '../controllers/authcontroller.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/send-otp', otpLimiter,authController.sendOTP);
router.post('/verify-otp', authController.validateOTP);

// Include protect middleware for /me route
import { protect } from '../middleware/authmiddleware.js';

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'hms-backend-node',
    time: new Date().toISOString()
  });
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

export default router;