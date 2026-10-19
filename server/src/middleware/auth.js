import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError, asyncHandler } from '../utils/httpError.js';

// Needs a valid login token. Puts the user on req.user.
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Please sign in to continue.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'This account no longer exists.');
  req.user = user;
  next();
});

// Use after protect. Only lets admins through.
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new HttpError(403, 'Only admins can do this.'));
  }
  next();
}
