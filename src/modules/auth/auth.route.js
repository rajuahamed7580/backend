import { Router } from 'express';
import authController from './auth.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { registerValidationSchema, loginValidationSchema } from './auth.validation.js';
import authenticate from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validateRequest(registerValidationSchema), authController.register);
router.post('/login', validateRequest(loginValidationSchema), authController.login);
router.get('/me', authenticate, authController.getMe);

export default router;
