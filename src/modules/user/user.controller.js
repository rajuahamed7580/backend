import userService from './user.service.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';

class UserController {
  createUser = catchAsync(async (req, res) => {
    const result = await userService.createUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User created successfully',
      data: result
    });
  });

  getAllUsers = catchAsync(async (req, res) => {
    const result = await userService.getAllUsers(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Users retrieved successfully',
      meta: result.meta,
      data: result.users
    });
  });

  getUserById = catchAsync(async (req, res) => {
    const result = await userService.getUserById(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User retrieved successfully',
      data: result
    });
  });

  updateUser = catchAsync(async (req, res) => {
    const result = await userService.updateUser(req.params.id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User updated successfully',
      data: result
    });
  });

  blockUser = catchAsync(async (req, res) => {
    const result = await userService.blockUser(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User blocked successfully',
      data: result
    });
  });

  unblockUser = catchAsync(async (req, res) => {
    const result = await userService.unblockUser(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User unblocked successfully',
      data: result
    });
  });

  deleteUser = catchAsync(async (req, res) => {
    const result = await userService.deleteUser(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User deleted successfully',
      data: result
    });
  });
}

export default new UserController();
