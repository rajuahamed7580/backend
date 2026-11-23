import commentService from './comment.service.js';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';

class CommentController {
  createComment = catchAsync(async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const result = await commentService.createComment(req.body, userId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Comment submitted successfully. It will appear publicly after approval.',
      data: result
    });
  });

  getCommentsByPost = catchAsync(async (req, res) => {
    const result = await commentService.getCommentsByPost(req.params.postId, req.query, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Post comments retrieved successfully',
      meta: result.meta,
      data: result.comments
    });
  });

  getAllComments = catchAsync(async (req, res) => {
    const result = await commentService.getAllComments(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comments retrieved successfully',
      meta: result.meta,
      data: result.comments
    });
  });

  getCommentById = catchAsync(async (req, res) => {
    const result = await commentService.getCommentById(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comment retrieved successfully',
      data: result
    });
  });

  updateComment = catchAsync(async (req, res) => {
    const result = await commentService.updateComment(req.params.id, req.body, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comment updated successfully',
      data: result
    });
  });

  deleteComment = catchAsync(async (req, res) => {
    const result = await commentService.deleteComment(req.params.id, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comment deleted successfully',
      data: result
    });
  });

  approveComment = catchAsync(async (req, res) => {
    const result = await commentService.approveComment(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comment approved successfully',
      data: result
    });
  });

  rejectComment = catchAsync(async (req, res) => {
    const result = await commentService.rejectComment(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Comment rejected successfully',
      data: result
    });
  });

  generateComments = catchAsync(async (req, res) => {
    const { postId, limit } = req.body;
    const result = await commentService.generateComments(postId, limit);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: result.summary,
      data: result
    });
  });
}

export default new CommentController();
