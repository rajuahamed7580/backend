import { Router } from 'express';
import customUrlController from './customUrl.controller.js';
import authenticate, { optionalAuthenticate } from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/role.middleware.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import {
  createCustomUrlValidationSchema,
  updateCustomUrlValidationSchema
} from './customUrl.validation.js';

const router = Router();

// Public resolution endpoint for /:country/:state/:city/:username
router.get(
  '/resolve/:country/:state/:city/:username',
  optionalAuthenticate,
  customUrlController.resolveCustomUrl
);

// Admin management routes
router.get('/', authenticate, authorize('admin'), customUrlController.getAllCustomUrls);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createCustomUrlValidationSchema),
  customUrlController.createCustomUrl
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(updateCustomUrlValidationSchema),
  customUrlController.updateCustomUrl
);

router.delete('/:id', authenticate, authorize('admin'), customUrlController.deleteCustomUrl);

export default router;
