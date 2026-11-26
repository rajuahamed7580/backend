import Post from './post.model.js';
import Comment from '../comment/comment.model.js';
import CustomUrl from '../customUrl/customUrl.model.js';
import AppError from '../../utils/AppError.js';
import { uploadBufferToStorage } from '../../utils/cloudinary.js';

class PostService {
  // Helper to generate a unique slug
  async generateUniqueSlug(title, existingId = null) {
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special characters
      .replace(/[\s_-]+/g, '-') // swap spaces and underscores for single dash
      .replace(/^-+|-+$/g, ''); // remove leading/trailing dash

    if (!baseSlug) {
      baseSlug = 'profile-' + Date.now();
    }

    let slug = baseSlug;
    let count = 1;

    while (true) {
      const existing = await Post.findOne({ slug });
      if (!existing || (existingId && existing._id.toString() === existingId.toString())) {
        break;
      }
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

  async createPost(payload, userId) {
    const slug = payload.slug
      ? await this.generateUniqueSlug(payload.slug)
      : await this.generateUniqueSlug(payload.title);

    const postData = {
      ...payload,
      slug,
      user: userId
    };

    const post = await Post.create(postData);
    return post;
  }

  async getAllPosts(query = {}, user = null) {
    const {
      search,
      category,
      status,
      city,
      state,
      isFeatured,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const filter = {};

    // Public users can only see published posts. Admins can filter by any status.
    const isAdmin = user && user.role === 'admin';
    if (!isAdmin) {
      filter.status = 'published';
    } else if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (city) {
      filter['location.city'] = { $regex: new RegExp(city, 'i') };
    }

    if (state) {
      filter['location.state'] = { $regex: new RegExp(state, 'i') };
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const itemsPerPage = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * itemsPerPage;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .select(
          'title slug displayName mainImage images category status location donations paymentMethods averageRating totalReviews isFeatured createdAt bumpedAt'
        )
        .populate('user', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(itemsPerPage),
      Post.countDocuments(filter)
    ]);

    const postIds = posts.map((p) => p._id);
    const activeUrls = await CustomUrl.find({
      post: { $in: postIds },
      isActive: true
    })
      .sort({ createdAt: 1 })
      .select('post country state city username');

    const urlMap = new Map();
    for (const entry of activeUrls) {
      const key = entry.post.toString();
      const path = `/${entry.country}/${entry.state}/${entry.city}/${entry.username}`;
      if (!urlMap.has(key)) urlMap.set(key, []);
      urlMap.get(key).push(path);
    }

    const postsWithUrls = posts.map((p) => {
      const obj = p.toObject();
      obj.customUrls = urlMap.get(p._id.toString()) || [];
      return obj;
    });

    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      posts: postsWithUrls,
      meta: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages
      }
    };
  }

  async getPostById(postId, user = null) {
    const post = await Post.findById(postId).populate('user', 'name email');
    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    const isAdmin = user && user.role === 'admin';
    const isOwner = user && user._id.toString() === post.user?._id?.toString();

    if (!isAdmin && !isOwner && post.status !== 'published') {
      throw new AppError(404, 'Post is not available.');
    }

    const activeUrls = await CustomUrl.find({
      post: post._id,
      isActive: true
    })
      .sort({ createdAt: 1 })
      .select('country state city username');

    const postObj = post.toObject();
    postObj.customUrls = activeUrls.map(
      (entry) => `/${entry.country}/${entry.state}/${entry.city}/${entry.username}`
    );

    return postObj;
  }

  // Get single post by slug, returning ONLY ONE complete post with approved reviews and adjacent navigation
  async getPostBySlug(slug, user = null) {
    const post = await Post.findOne({ slug }).populate('user', 'name email');
    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    const isAdmin = user && user.role === 'admin';
    const isOwner = user && user._id.toString() === post.user?._id?.toString();

    if (!isAdmin && !isOwner && post.status !== 'published') {
      throw new AppError(404, 'Post is not available.');
    }

    // Retrieve approved comments for this single post
    const approvedComments = await Comment.find({
      post: post._id,
      isApproved: true
    }).sort({ createdAt: -1 });

    // Find previous and next published posts for navigation
    const [prevPost, nextPost] = await Promise.all([
      Post.findOne({
        status: 'published',
        createdAt: { $lt: post.createdAt }
      })
        .sort({ createdAt: -1 })
        .select('title slug displayName mainImage'),
      Post.findOne({
        status: 'published',
        createdAt: { $gt: post.createdAt }
      })
        .sort({ createdAt: 1 })
        .select('title slug displayName mainImage')
    ]);

    return {
      post,
      reviews: approvedComments,
      reviewCount: approvedComments.length,
      navigation: {
        previous: prevPost ? { title: prevPost.title, slug: prevPost.slug, displayName: prevPost.displayName } : null,
        next: nextPost ? { title: nextPost.title, slug: nextPost.slug, displayName: nextPost.displayName } : null
      }
    };
  }

  async updatePost(postId, payload, user) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = post.user.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError(403, 'You do not have permission to modify this post.');
    }

    if (payload.slug && payload.slug !== post.slug) {
      payload.slug = await this.generateUniqueSlug(payload.slug, post._id);
    } else if (payload.title && !payload.slug) {
      // Optional: keep existing slug unless requested
    }

    Object.assign(post, payload);
    await post.save();
    return post;
  }

  async deletePost(postId, user) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = post.user.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError(403, 'You do not have permission to delete this post.');
    }

    // Delete post, its related comments, and any custom URLs
    await Promise.all([
      Post.findByIdAndDelete(postId),
      Comment.deleteMany({ post: postId }),
      CustomUrl.deleteMany({ post: postId })
    ]);

    return post;
  }

  async publishPost(postId, user) {
    return this.updatePost(postId, { status: 'published' }, user);
  }

  async archivePost(postId, user) {
    return this.updatePost(postId, { status: 'archived' }, user);
  }

  async uploadImagesStandalone(files) {
    if (!files || files.length === 0) {
      throw new AppError(400, 'Please select at least one image file.');
    }

    const uploadPromises = files.map((file) =>
      uploadBufferToStorage(file.buffer, file.originalname, {
        folder: 'privatedelights/uploads'
      })
    );

    const uploadedResults = await Promise.all(uploadPromises);

    return uploadedResults.map((result, idx) => ({
      url: result.url,
      public_id: result.public_id,
      caption: '',
      order: idx,
      isMain: idx === 0,
      storage: result.storage
    }));
  }

  async uploadPostImages(postId, files, user) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = post.user.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError(403, 'You do not have permission to upload images for this post.');
    }

    if (!files || files.length === 0) {
      throw new AppError(400, 'Please select at least one image file.');
    }

    const uploadPromises = files.map((file) =>
      uploadBufferToStorage(file.buffer, file.originalname, {
        folder: `privatedelights/posts/${post.slug || post._id}`
      })
    );

    const uploadedResults = await Promise.all(uploadPromises);

    const newImages = uploadedResults.map((result, idx) => ({
      url: result.url,
      public_id: result.public_id,
      caption: '',
      order: post.images.length + idx,
      isMain: post.images.length === 0 && idx === 0
    }));

    post.images.push(...newImages);
    if (!post.mainImage && newImages.length > 0) {
      post.mainImage = newImages[0].url;
    }

    await post.save();
    return post;
  }

  // Recalculates average rating and total reviews count from approved comments
  async recalculatePostRatings(postId) {
    const stats = await Comment.aggregate([
      { $match: { post: postId, isApproved: true } },
      {
        $group: {
          _id: '$post',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Post.findByIdAndUpdate(postId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      await Post.findByIdAndUpdate(postId, {
        averageRating: 5.0,
        totalReviews: 0
      });
    }
  }
}

export default new PostService();
