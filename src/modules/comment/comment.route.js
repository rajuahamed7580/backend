import { Router } from 'express';
import commentController from './comment.controller.js';
import authenticate, { optionalAuthenticate } from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/role.middleware.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import {
  createCommentValidationSchema,
  updateCommentValidationSchema,
  generateCommentsValidationSchema
} from './comment.validation.js';

const router = Router();

// Public / Guest comment submission (optional token if user is signed in)
router.post(
  '/',
  optionalAuthenticate,
  validateRequest(createCommentValidationSchema),
  commentController.createComment
);

// Get comments for a specific post (public gets approved, admin can see all)
router.get('/post/:postId', optionalAuthenticate, commentController.getCommentsByPost);

// Admin-only: Random review generator
router.post(
  '/generate',
  authenticate,
  authorize('admin'),
  validateRequest(generateCommentsValidationSchema),
  commentController.generateComments
);

// Admin comment moderation & management
router.get('/', authenticate, authorize('admin'), commentController.getAllComments);
router.get('/:id', authenticate, commentController.getCommentById);
router.patch(
  '/:id',
  authenticate,
  validateRequest(updateCommentValidationSchema),
  commentController.updateComment
);
router.delete('/:id', authenticate, commentController.deleteComment);
router.patch('/:id/approve', authenticate, authorize('admin'), commentController.approveComment);
router.patch('/:id/reject', authenticate, authorize('admin'), commentController.rejectComment);

export default router;
