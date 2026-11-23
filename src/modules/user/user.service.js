import User from './user.model.js';
import AppError from '../../utils/AppError.js';
import bcrypt from 'bcryptjs';

class UserService {
  async createUser(payload) {
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists.');
    }
    const user = await User.create(payload);
    return user;
  }

  async getAllUsers(query = {}) {
    const { search, role, isBlock, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isBlock !== undefined) {
      filter.isBlock = isBlock === 'true' || isBlock === true;
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const itemsPerPage = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * itemsPerPage;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(itemsPerPage),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      users,
      meta: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages
      }
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
    return user;
  }

  async updateUser(userId, payload) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    if (payload.email && payload.email !== user.email) {
      const emailExists = await User.findOne({ email: payload.email });
      if (emailExists) {
        throw new AppError(409, 'Email is already taken by another account.');
      }
      user.email = payload.email;
    }

    if (payload.name) user.name = payload.name;
    if (payload.role) user.role = payload.role;
    if (payload.isBlock !== undefined) user.isBlock = payload.isBlock;

    if (payload.password) {
      user.password = payload.password; // pre-save hook will hash it
    }

    await user.save();
    return user;
  }

  async blockUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
    user.isBlock = true;
    await user.save();
    return user;
  }

  async unblockUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
    user.isBlock = false;
    await user.save();
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
    await User.findByIdAndDelete(userId);
    return user;
  }
}

export default new UserService();
