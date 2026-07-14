import express from 'express';
import User from '../models/User';
const router = express.Router();

// Mock Auth logic for lazy auth, mainly handled in confirm reservation for users
// But for staff login we can have a route
router.post('/login', async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await User.findOne({ phoneNumber });
  if (user) {
    res.json({ user });
  } else {
    // Usually wouldn't create admin/staff dynamically but fine for mock
    const newUser = new User({ phoneNumber, role: 'user' });
    await newUser.save();
    res.json({ user: newUser });
  }
});

export default router;
