import CustomUrl from './customUrl.model.js';
import Post from '../post/post.model.js';
import Comment from '../comment/comment.model.js';
import AppError from '../../utils/AppError.js';

function buildNormalizedPath({ country, state, city, username }) {
  return [country, state, city, username]
    .map((segment) => String(segment || '').trim().toLowerCase())
    .join('/');
}

class CustomUrlService {
  async createCustomUrl(payload) {
    const post = await Post.findById(payload.post);
    if (!post) {
      throw new AppError(404, 'Selected post does not exist.');
    }

    const normalizedPath = buildNormalizedPath(payload);
    const existing = await CustomUrl.findOne({ normalizedPath });
    if (existing) {
      throw new AppError(409, `The URL path /${payload.country}/${payload.state}/${payload.city}/${payload.username} is already in use.`);
    }

    const created = await CustomUrl.create({
      post: post._id,
      country: payload.country.trim(),
      state: payload.state.trim(),
      city: payload.city.trim(),
      username: payload.username.trim(),
      normalizedPath,
      shortTitle: payload.shortTitle?.trim() || '',
      isActive: payload.isActive !== undefined ? payload.isActive : true
    });

    return created.populate('post', 'title slug displayName mainImage status location');
  }

  async getAllCustomUrls(query = {}) {
    const {
      search,
      postId,
      isActive,
      page = 1,
      limit = 20
    } = query;

    const filter = {};

    if (postId) {
      filter.post = postId;
    }

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      const matchingPosts = await Post.find({
        $or: [{ title: regex }, { displayName: regex }, { slug: regex }]
      }).select('_id');

      const matchingPostIds = matchingPosts.map((p) => p._id);

      filter.$or = [
        { country: regex },
        { state: regex },
        { city: regex },
        { username: regex },
        { normalizedPath: regex },
        { shortTitle: regex },
        ...(matchingPostIds.length > 0 ? [{ post: { $in: matchingPostIds } }] : [])
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const itemsPerPage = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * itemsPerPage;

    const [items, total] = await Promise.all([
      CustomUrl.find(filter)
        .populate('post', 'title slug displayName mainImage status location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),
      CustomUrl.countDocuments(filter)
    ]);

    return {
      items,
      meta: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages: Math.ceil(total / itemsPerPage)
      }
    };
  }

  async updateCustomUrl(id, payload) {
    const existing = await CustomUrl.findById(id);
    if (!existing) {
      throw new AppError(404, 'Custom URL not found.');
    }

    if (payload.post) {
      const post = await Post.findById(payload.post);
      if (!post) {
        throw new AppError(404, 'Selected post does not exist.');
      }
      existing.post = post._id;
    }

    if (payload.country !== undefined) existing.country = payload.country.trim();
    if (payload.state !== undefined) existing.state = payload.state.trim();
    if (payload.city !== undefined) existing.city = payload.city.trim();
    if (payload.username !== undefined) existing.username = payload.username.trim();
    if (payload.shortTitle !== undefined) existing.shortTitle = payload.shortTitle.trim();
    if (payload.isActive !== undefined) existing.isActive = payload.isActive;

    const nextNormalizedPath = buildNormalizedPath(existing);
    if (nextNormalizedPath !== existing.normalizedPath) {
      const conflict = await CustomUrl.findOne({
        normalizedPath: nextNormalizedPath,
        _id: { $ne: existing._id }
      });
      if (conflict) {
        throw new AppError(
          409,
          `The URL path /${existing.country}/${existing.state}/${existing.city}/${existing.username} is already in use.`
        );
      }
      existing.normalizedPath = nextNormalizedPath;
    }

    await existing.save();
    return existing.populate('post', 'title slug displayName mainImage status location');
  }

  async deleteCustomUrl(id) {
    const deleted = await CustomUrl.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError(404, 'Custom URL not found.');
    }
    return deleted;
  }

  async resolveByPath({ country, state, city, username }, user = null) {
    const normalizedPath = buildNormalizedPath({ country, state, city, username });
    const customUrl = await CustomUrl.findOne({ normalizedPath, isActive: true });

    if (!customUrl) {
      throw new AppError(404, 'Profile URL not found.');
    }

    const post = await Post.findById(customUrl.post).populate('user', 'name email');
    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    const isAdmin = user && user.role === 'admin';
    const isOwner = user && user._id.toString() === post.user?._id?.toString();

    if (!isAdmin && !isOwner && post.status !== 'published') {
      throw new AppError(404, 'Post is not available.');
    }

    const approvedComments = await Comment.find({
      post: post._id,
      isApproved: true
    }).sort({ createdAt: -1 });

    const [prevEntry, nextEntry] = await Promise.all([
      CustomUrl.findOne({
        isActive: true,
        _id: { $ne: customUrl._id },
        createdAt: { $lt: customUrl.createdAt }
      })
        .sort({ createdAt: -1 })
        .populate('post', 'title displayName status'),
      CustomUrl.findOne({
        isActive: true,
        _id: { $ne: customUrl._id },
        createdAt: { $gt: customUrl.createdAt }
      })
        .sort({ createdAt: 1 })
        .populate('post', 'title displayName status')
    ]);

    const formatNav = (entry) => {
      if (!entry || !entry.post || entry.post.status !== 'published') return null;
      return {
        title: entry.post.title,
        displayName: entry.post.displayName,
        path: `/${entry.country}/${entry.state}/${entry.city}/${entry.username}`
      };
    };

    return {
      post,
      customUrl,
      reviews: approvedComments,
      reviewCount: approvedComments.length,
      navigation: {
        previous: formatNav(prevEntry),
        next: formatNav(nextEntry)
      }
    };
  }
}

export default new CustomUrlService();
