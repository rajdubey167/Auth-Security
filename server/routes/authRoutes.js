import express from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, logout, getProfile, googleAuth, forgotPassword, resetPassword, verifyEmail } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Basic rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/google', googleAuth);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verifyemail/:verifytoken', verifyEmail);

router.get('/profile', getProfile);

// Admin only route example
router.get('/admin', protect, admin, (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

export default router;
