import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';
import AppError from '../../utils/AppError.js';
import config from '../../config/index.js';

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async register(payload) {
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists.');
    }

    // Role default is user, only allowed to be admin if explicitly intended or permitted
    const newUser = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'user'
    });

    const token = this.generateToken(newUser);

    return {
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isBlock: newUser.isBlock,
        createdAt: newUser.createdAt
      },
      token
    };
  }

  async login(payload) {
    const user = await User.findOne({ email: payload.email }).select('+password');
    if (!user) {
      throw new AppError(401, 'Invalid email or password.');
    }

    if (user.isBlock) {
      throw new AppError(403, 'Your account has been blocked. Please contact support.');
    }

    const isMatch = await user.comparePassword(payload.password);
    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password.');
    }

    const token = this.generateToken(user);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlock: user.isBlock,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
    return user;
  }
}

export default new AuthService();
