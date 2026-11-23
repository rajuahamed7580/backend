import dashboardService from './dashboard.service.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';

class DashboardController {
  getOverviewStats = catchAsync(async (req, res) => {
    const result = await dashboardService.getOverviewStats();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Dashboard overview statistics retrieved successfully',
      data: result
    });
  });

  getAnalytics = catchAsync(async (req, res) => {
    const result = await dashboardService.getAnalytics();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: result
    });
  });
}

export default new DashboardController();
