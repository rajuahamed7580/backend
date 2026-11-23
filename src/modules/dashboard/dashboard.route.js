import { Router } from 'express';
import dashboardController from './dashboard.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/role.middleware.js';

const router = Router();

// Protect all dashboard routes for admin only
router.use(authenticate, authorize('admin'));

router.get('/stats', dashboardController.getOverviewStats);
router.get('/analytics', dashboardController.getAnalytics);

export default router;
