import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../modules/user/user.model.js';

export const authenticate = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError(401, 'You are not authenticated! Please log in to gain access.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError(401, 'Your session has expired. Please log in again.');
    }
    throw new AppError(401, 'Invalid authentication token.');
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new AppError(401, 'The user belonging to this token no longer exists.');
  }

  if (currentUser.isBlock) {
    throw new AppError(403, 'Your account has been blocked. Please contact support.');
  }

  req.user = currentUser;
  next();
});

export const optionalAuthenticate = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && !currentUser.isBlock) {
      req.user = currentUser;
    }
  } catch (error) {
    // If token invalid in optional auth, proceed as guest
  }

  next();
});

export default authenticate;
