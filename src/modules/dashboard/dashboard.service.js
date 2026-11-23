import Post from '../post/post.model.js';
import User from '../user/user.model.js';
import Comment from '../comment/comment.model.js';

class DashboardService {
  async getOverviewStats() {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalUsers,
      blockedUsers,
      adminUsers,
      totalComments,
      approvedComments,
      pendingComments,
      generatedComments,
      ratingAggregate,
      recentPosts,
      pendingReviews,
      recentUsers
    ] = await Promise.all([
      // Posts
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Post.countDocuments({ status: 'archived' }),

      // Users
      User.countDocuments(),
      User.countDocuments({ isBlock: true }),
      User.countDocuments({ role: 'admin' }),

      // Comments
      Comment.countDocuments(),
      Comment.countDocuments({ isApproved: true }),
      Comment.countDocuments({ isApproved: false }),
      Comment.countDocuments({ isGenerated: true }),

      // Overall average rating
      Comment.aggregate([
        { $match: { isApproved: true } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),

      // Recent Posts
      Post.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug displayName status mainImage category totalReviews averageRating createdAt'),

      // Pending Reviews for admin approval
      Comment.find({ isApproved: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('post', 'title slug displayName')
        .select('reviewerName rating comment isGenerated createdAt post'),

      // Recent Users
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role isBlock createdAt')
    ]);

    const averageRating = ratingAggregate.length > 0
      ? Math.round(ratingAggregate[0].avgRating * 10) / 10
      : 5.0;

    return {
      stats: {
        posts: {
          total: totalPosts,
          published: publishedPosts,
          draft: draftPosts,
          archived: archivedPosts
        },
        users: {
          total: totalUsers,
          active: totalUsers - blockedUsers,
          blocked: blockedUsers,
          admins: adminUsers
        },
        comments: {
          total: totalComments,
          approved: approvedComments,
          pending: pendingComments,
          generated: generatedComments
        },
        ratings: {
          average: averageRating
        }
      },
      recentActivity: {
        recentPosts,
        pendingReviews,
        recentUsers
      }
    };
  }

  async getAnalytics() {
    const [categoryDistribution, locationDistribution, ratingDistribution] = await Promise.all([
      Post.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Post.aggregate([
        {
          $group: {
            _id: {
              state: '$location.state',
              city: '$location.city'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Comment.aggregate([
        { $match: { isApproved: true } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ])
    ]);

    return {
      categoryDistribution: categoryDistribution.map((item) => ({
        category: item._id || 'Uncategorized',
        count: item.count
      })),
      locationDistribution: locationDistribution.map((item) => ({
        state: item._id.state || 'Unknown',
        city: item._id.city || 'Unknown',
        count: item.count
      })),
      ratingDistribution: ratingDistribution.map((item) => ({
        rating: item._id,
        count: item.count
      }))
    };
  }
}

export default new DashboardService();
