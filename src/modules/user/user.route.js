import { Router } from 'express';
import userController from './user.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/role.middleware.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { createUserValidationSchema, updateUserValidationSchema } from './user.validation.js';

const router = Router();

// Protect all user routes for authenticated users
router.use(authenticate);

// Admin only routes
router.post('/', authorize('admin'), validateRequest(createUserValidationSchema), userController.createUser);
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', authorize('admin'), validateRequest(updateUserValidationSchema), userController.updateUser);
router.patch('/:id/block', authorize('admin'), userController.blockUser);
router.patch('/:id/unblock', authorize('admin'), userController.unblockUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

export default router;
