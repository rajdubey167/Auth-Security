import User from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Password validation
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter.' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number.' });
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one special character (!@#$...).' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Full name is required.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'user',
      isVerified: false
    });

    if (user) {
      // Generate verification token
      const verifyToken = user.getEmailVerificationToken();
      await user.save();

      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
      const message = `Welcome to our platform! Please verify your email by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.`;
      const html = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
          <!-- Logo -->
          <div style="margin-bottom: 28px;">
            <span style="font-size: 18px; font-weight: 700; color: #111827;">🔐 AuthSystem</span>
          </div>

          <!-- Heading -->
          <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #111827;">Welcome to AuthSystem!</h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
            Hi ${name.split(' ')[0]},<br><br>
            We're excited to have you on board. Before you can log in and access your dashboard, we just need to verify your email address.
          </p>

          <!-- Button -->
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 28px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.01em;">
            Verify Email Address
          </a>

          <!-- Expiry note -->
          <p style="margin: 24px 0 0; font-size: 13px; color: '#9ca3af'; line-height: 1.6;">
            ⏱ This verification link expires in <strong style="color: #374151;">24 hours</strong>.
          </p>

          <!-- Divider -->
          <div style="margin: 24px 0; border-top: 1px solid #f3f4f6;"></div>

          <!-- Fallback link -->
          <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${verifyUrl}" style="color: #6b7280; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Please verify your email',
          message,
          html
        });
      } catch (err) {
        console.error('Verification email failed to send', err);
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in.' });
      }

      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Public (Graceful fail)
export const getProfile = async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(200).json(null);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(200).json(null);
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    return res.status(200).json(null);
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  const { email, name, googleId } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true
      });

      // Send Welcome email
      const html = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
          <!-- Logo -->
          <div style="margin-bottom: 28px;">
            <span style="font-size: 18px; font-weight: 700; color: #111827;">🔐 AuthSystem</span>
          </div>

          <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #111827;">Welcome to AuthSystem!</h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
            Hi ${name.split(' ')[0]},<br><br>
            Your account has been successfully created using Google Sign-In. Since you used Google, your email is already verified and you're all set to go!
          </p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; padding: 12px 28px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Go to Dashboard
          </a>
        </div>
      `;
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to AuthSystem!',
          message: 'Welcome to AuthSystem! Your account was created successfully via Google.',
          html
        });
      } catch (err) {
        console.error('Welcome email failed to send', err);
      }
    }
    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'There is no user with that email' });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `You requested a password reset for your AuthSystem account. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 10 minutes. If you didn't request this, you can safely ignore this email.`;

  const html = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
      <!-- Logo -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 28px;">
        <div style="width: 28px; height: 28px; background: #111827; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <span style="font-size: 15px; font-weight: 700; color: #111827;">AuthSystem</span>
      </div>

      <!-- Heading -->
      <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #111827;">Reset your password</h2>
      <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
        We received a request to reset the password for your account. Click the button below to choose a new password.
      </p>

      <!-- Button -->
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.01em;">
        Reset Password
      </a>

      <!-- Expiry note -->
      <p style="margin: 24px 0 0; font-size: 13px; color: '#9ca3af'; line-height: 1.6;">
        ⏱ This link will expire in <strong style="color: #374151;">10 minutes</strong>.
      </p>

      <!-- Divider -->
      <div style="margin: 24px 0; border-top: 1px solid #f3f4f6;"></div>

      <!-- Fallback link -->
      <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #6b7280; word-break: break-all;">${resetUrl}</a>
      </p>

      <p style="margin: 16px 0 0; font-size: 12px; color: #d1d5db;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset your AuthSystem password',
      message,
      html,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: 'Email could not be sent' });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Server-side password strength validation (same rules as signup)
  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter.' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number.' });
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one special character (!@#$...).' });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  generateToken(res, user._id);
  res.status(200).json({ success: true, message: 'Password reset successfully' });
};

// @desc    Verify Email
// @route   GET /api/auth/verifyemail/:verifytoken
// @access  Public
export const verifyEmail = async (req, res) => {
  const rawToken = req.params.verifytoken;
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  console.log('Verifying Token:', { rawToken, hashedToken });

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    console.log('Verification failed: User not found or token expired');
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  generateToken(res, user._id);
  res.status(200).json({ success: true, message: 'Email verified successfully' });
};
