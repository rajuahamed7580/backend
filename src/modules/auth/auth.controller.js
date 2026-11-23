import authService from './auth.service.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';

class AuthController {
  register = catchAsync(async (req, res) => {
    const result = await authService.register(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User registered successfully',
      data: result
    });
  });

  login = catchAsync(async (req, res) => {
    const result = await authService.login(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User logged in successfully',
      data: result
    });
  });

  getMe = catchAsync(async (req, res) => {
    const result = await authService.getMe(req.user._id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User profile retrieved successfully',
      data: result
    });
  });
}

export default new AuthController();
