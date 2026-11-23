import Comment from './comment.model.js';
import Post from '../post/post.model.js';
import postService from '../post/post.service.js';
import commentGeneratorService from './commentGenerator.service.js';
import AppError from '../../utils/AppError.js';

class CommentService {
  async createComment(payload, userId = null) {
    const post = await Post.findById(payload.postId);
    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    const commentData = {
      post: payload.postId,
      user: userId,
      reviewerName: payload.reviewerName,
      comment: payload.comment,
      rating: payload.rating,
      visitDate: payload.visitDate || `Visit Date: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      reviewerStats: payload.reviewerStats || '1 Review • Joined Recently',
      isVerifiedMember: Boolean(userId),
      isGenerated: false,
      isApproved: false // Requires admin moderation before public display
    };

    const newComment = await Comment.create(commentData);
    return newComment;
  }

  async getCommentsByPost(postId, query = {}, user = null) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', isApproved, isGenerated } = query;

    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    const filter = { post: postId };

    const isAdmin = user && user.role === 'admin';
    if (!isAdmin) {
      filter.isApproved = true;
    } else {
      if (isApproved !== undefined) {
        filter.isApproved = isApproved === 'true' || isApproved === true;
      }
      if (isGenerated !== undefined) {
        filter.isGenerated = isGenerated === 'true' || isGenerated === true;
      }
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const itemsPerPage = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * itemsPerPage;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [comments, total] = await Promise.all([
      Comment.find(filter).sort(sort).skip(skip).limit(itemsPerPage),
      Comment.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      comments,
      meta: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages
      }
    };
  }

  async getAllComments(query = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isApproved,
      isGenerated,
      postId,
      search
    } = query;

    const filter = {};

    if (postId) {
      filter.post = postId;
    }

    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true' || isApproved === true;
    }

    if (isGenerated !== undefined) {
      filter.isGenerated = isGenerated === 'true' || isGenerated === true;
    }

    if (search) {
      filter.$or = [
        { reviewerName: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const itemsPerPage = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * itemsPerPage;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('post', 'title slug displayName')
        .populate('user', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(itemsPerPage),
      Comment.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      comments,
      meta: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages
      }
    };
  }

  async getCommentById(commentId) {
    const comment = await Comment.findById(commentId)
      .populate('post', 'title slug displayName')
      .populate('user', 'name email');

    if (!comment) {
      throw new AppError(404, 'Comment not found.');
    }
    return comment;
  }

  async updateComment(commentId, payload, user) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError(404, 'Comment not found.');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = comment.user && comment.user.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError(403, 'You do not have permission to edit this comment.');
    }

    if (payload.reviewerName) comment.reviewerName = payload.reviewerName;
    if (payload.comment) comment.comment = payload.comment;
    if (payload.rating !== undefined) comment.rating = payload.rating;
    if (payload.visitDate) comment.visitDate = payload.visitDate;

    // Only admin can modify approval status or add provider response
    if (isAdmin) {
      if (payload.isApproved !== undefined) comment.isApproved = payload.isApproved;
      if (payload.providerResponse) {
        comment.providerResponse = {
          text: payload.providerResponse.text || '',
          respondedAt: new Date()
        };
      }
    }

    await comment.save();

    // Recalculate post rating
    await postService.recalculatePostRatings(comment.post);

    return comment;
  }

  async approveComment(commentId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError(404, 'Comment not found.');
    }

    comment.isApproved = true;
    await comment.save();

    // Recalculate post rating
    await postService.recalculatePostRatings(comment.post);

    return comment;
  }

  async rejectComment(commentId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError(404, 'Comment not found.');
    }

    comment.isApproved = false;
    await comment.save();

    // Recalculate post rating
    await postService.recalculatePostRatings(comment.post);

    return comment;
  }

  async deleteComment(commentId, user) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError(404, 'Comment not found.');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = comment.user && comment.user.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError(403, 'You do not have permission to delete this comment.');
    }

    const postId = comment.post;
    await Comment.findByIdAndDelete(commentId);

    // Recalculate post rating
    await postService.recalculatePostRatings(postId);

    return comment;
  }

  async generateComments(postId, limit) {
    return await commentGeneratorService.generateSampleComments(postId, limit);
  }
}

export default new CommentService();
