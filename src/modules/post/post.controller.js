import postService from './post.service.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';

class PostController {
  createPost = catchAsync(async (req, res) => {
    const result = await postService.createPost(req.body, req.user._id);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Post created successfully',
      data: result
    });
  });

  getAllPosts = catchAsync(async (req, res) => {
    const result = await postService.getAllPosts(req.query, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Posts retrieved successfully',
      meta: result.meta,
      data: result.posts
    });
  });

  getPostById = catchAsync(async (req, res) => {
    const result = await postService.getPostById(req.params.id, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Post retrieved successfully',
      data: result
    });
  });

  getPostBySlug = catchAsync(async (req, res) => {
    const result = await postService.getPostBySlug(req.params.slug, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Post details retrieved successfully',
      data: result
    });
  });

  updatePost = catchAsync(async (req, res) => {
    const result = await postService.updatePost(req.params.id, req.body, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Post updated successfully',
      data: result
    });
  });

  deletePost = catchAsync(async (req, res) => {
    const result = await postService.deletePost(req.params.id, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Post deleted successfully',
      data: result
    });
  });

  publishPost = catchAsync(async (req, res) => {
    const result = await postService.publishPost(req.params.id, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Post published successfully',
      data: result
    });
  });

  archivePost = catchAsync(async (req, res) => {
    const result = await postService.archivePost(req.params.id, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Post archived successfully',
      data: result
    });
  });

  uploadImages = catchAsync(async (req, res) => {
    const result = await postService.uploadPostImages(req.params.id, req.files, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Images uploaded successfully',
      data: result
    });
  });

  uploadStandalone = catchAsync(async (req, res) => {
    const result = await postService.uploadImagesStandalone(req.files);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Images uploaded successfully',
      data: result
    });
  });
}

export default new PostController();
