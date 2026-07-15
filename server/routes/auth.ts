import express from 'express';
import User from '../models/User';
const router = express.Router();

// User (lazy auth)
router.post('/login', async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await User.findOne({ phoneNumber });
  if (user) {
    res.json({ user });
  } else {
    const newUser = new User({ phoneNumber, role: 'user' });
    await newUser.save();
    res.json({ user: newUser });
  }
});

// Admin login
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  // Hardcoded for now based on requirements
  if (email === 'admin@nyewaparkiran.com' && password === 'admin123') {
    res.json({ success: true, token: 'dummy-admin-token-123' });
  } else {
    res.status(401).json({ success: false, error: 'Email atau password salah.' });
  }
});

export default router;
