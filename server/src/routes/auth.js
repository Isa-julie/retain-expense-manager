import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils/httpError.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Sign up. The role is NEVER read from the request: everyone who signs up is a "user".
// Admins are created with `npm run seed`.
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name) throw new HttpError(400, 'Please enter your name.');
    if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Please enter a valid email address.');
    if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters.');
    if (await User.exists({ email })) throw new HttpError(409, 'An account with this email already exists.');

    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user), user: user.toPublic() });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findOne({ email }).select('+password');
    // Same message for "no such email" and "wrong password" so we don't reveal which emails exist.
    if (!user || !(await user.matchPassword(password))) {
      throw new HttpError(401, 'Email or password is incorrect.');
    }
    res.json({ token: signToken(user), user: user.toPublic() });
  })
);

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

export default router;
