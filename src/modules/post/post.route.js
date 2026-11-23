import { Router } from 'express';
import postController from './post.controller.js';
import authenticate, { optionalAuthenticate } from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/role.middleware.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';
import { createPostValidationSchema, updatePostValidationSchema } from './post.validation.js';

const router = Router();

// Public / Guest accessible routes (with optional auth detection)
router.get('/', optionalAuthenticate, postController.getAllPosts);
router.get('/slug/:slug', optionalAuthenticate, postController.getPostBySlug);
router.get('/:id', optionalAuthenticate, postController.getPostById);

// Protected routes (Admin or Post Owners)
router.post(
  '/upload',
  authenticate,
  authorize('admin', 'user'),
  upload.array('images', 10),
  postController.uploadStandalone
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'user'),
  validateRequest(createPostValidationSchema),
  postController.createPost
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'user'),
  validateRequest(updatePostValidationSchema),
  postController.updatePost
);

router.delete('/:id', authenticate, authorize('admin', 'user'), postController.deletePost);

router.patch('/:id/publish', authenticate, authorize('admin', 'user'), postController.publishPost);

router.patch('/:id/archive', authenticate, authorize('admin', 'user'), postController.archivePost);

router.post(
  '/:id/upload-images',
  authenticate,
  authorize('admin', 'user'),
  upload.array('images', 10),
  postController.uploadImages
);

export default router;
