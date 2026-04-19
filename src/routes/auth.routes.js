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

router.put('/me', protect, async (req, res) => {
  try {
    const { phno } = req.body;

    if (!phno || !/^\d{10}$/.test(phno.replace(/\D/g, ''))) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required.' });
    }

    const cleanPhone = phno.replace(/\D/g, '');

    const existing = await User.findOne({ phno: cleanPhone, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This phone number is already registered.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { phno: cleanPhone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;