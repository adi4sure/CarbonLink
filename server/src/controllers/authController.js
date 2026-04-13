import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Remove password from output
  const userData = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete userData.password;
  // Remove internal methods
  delete userData.comparePassword;
  delete userData.isModified;
  delete userData.save;
  delete userData.deleteOne;
  delete userData.toString;
  delete userData.toObject;
  delete userData.toJSON;

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'eco_actor' });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user (JSON DB doesn't hide password, so findOne works)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const userData = user ? (typeof user.toObject === 'function' ? user.toObject() : { ...user }) : null;
    if (userData) {
      delete userData.password;
      delete userData.comparePassword;
      delete userData.isModified;
      delete userData.save;
      delete userData.deleteOne;
      delete userData.toString;
      delete userData.toObject;
      delete userData.toJSON;
    }
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/me
 */
export const updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'avatar'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/google
 * Login or register via Google One Tap / Sign-In
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your_google_client_id_here') {
      return res.status(500).json({ success: false, message: 'Google OAuth is not configured on the server. Set GOOGLE_CLIENT_ID in .env' });
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by googleId or email
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      // Link Google if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user (no password needed for Google users)
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        role: 'eco_actor',
        isVerified: true,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
};
