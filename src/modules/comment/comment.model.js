import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post reference is required'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewerName: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true
    },
    comment: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviewerStats: {
      type: String,
      default: '' // e.g. "12 Reviews • Joined: Oct 2024"
    },
    visitDate: {
      type: String,
      default: '' // e.g. "Visit Date: April 2025"
    },
    isVerifiedMember: {
      type: Boolean,
      default: false
    },
    providerResponse: {
      text: { type: String, default: '' },
      respondedAt: { type: Date, default: null }
    },
    isGenerated: {
      type: Boolean,
      default: false,
      index: true
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
