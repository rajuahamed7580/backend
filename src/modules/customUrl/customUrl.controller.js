import customUrlService from './customUrl.service.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';

class CustomUrlController {
  createCustomUrl = catchAsync(async (req, res) => {
    const result = await customUrlService.createCustomUrl(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Custom profile URL created successfully',
      data: result
    });
  });

  getAllCustomUrls = catchAsync(async (req, res) => {
    const result = await customUrlService.getAllCustomUrls(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Custom profile URLs retrieved successfully',
      meta: result.meta,
      data: result.items
    });
  });

  updateCustomUrl = catchAsync(async (req, res) => {
    const result = await customUrlService.updateCustomUrl(req.params.id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Custom profile URL updated successfully',
      data: result
    });
  });

  deleteCustomUrl = catchAsync(async (req, res) => {
    const result = await customUrlService.deleteCustomUrl(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Custom profile URL deleted successfully',
      data: result
    });
  });

  resolveCustomUrl = catchAsync(async (req, res) => {
    const result = await customUrlService.resolveByPath(req.params, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Profile resolved successfully',
      data: result
    });
  });
}

export default new CustomUrlController();
