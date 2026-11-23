import Comment from './comment.model.js';
import Post from '../post/post.model.js';
import AppError from '../../utils/AppError.js';

class CommentGeneratorService {
  constructor() {
    this.reviewerUsernames = [
      'fast-lane',
      'Harry31',
      'david-bronx',
      'taboo',
      'bllm414me',
      'andy-and-anand013',
      'ferzen',
      'Bryan-West',
      'Johnnie855',
      'WD90',
      'cali_gentleman',
      'metro_traveler',
      'steve_la',
      'downtown_vip',
      'pacific_oasis',
      'robert_k',
      'elite_critic',
      'sunset_rider',
      'golden_state99',
      'norwalk_regular'
    ];

    this.sampleReviewPhrases = [
      'Amazing experience! Very sweet, attentive, and looked even better than her photos.',
      'A true professional. Welcoming vibe, punctual, and genuine conversationalist.',
      'One of the best visits I have had in a long time. Will definitely be booking again.',
      'Incredible time! Exactly as described, warm energy and unmatched hospitality.',
      'Super easy screening process and very communicative. Highly recommended!',
      'Had an unforgettable appointment. Everything was relaxed, safe, and top tier.',
      'Very genuine and accommodating. Clean location, stunning presence, and 10/10 service.',
      'Second time seeing her and she never disappoints. Always polite, stunning, and attentive.',
      'Great communication from start to finish. Everything went smoothly and exceeded expectations.',
      'Absolute sweetheart with great energy. Don’t hesitate to book if you have the chance!'
    ];

    this.months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }

  getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  generateRandomStats() {
    const reviewsCount = Math.floor(Math.random() * 25) + 3;
    const year = 2020 + Math.floor(Math.random() * 5);
    const month = this.getRandomElement(this.months);
    const day = Math.floor(Math.random() * 28) + 1;
    return `${reviewsCount} Reviews • Joined: ${month} ${day}, ${year}`;
  }

  generateRandomVisitDate() {
    const month = this.getRandomElement(this.months);
    const year = 2025;
    return `Visit Date: ${month} ${year}`;
  }

  async generateSampleComments(postId, limit) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError(404, 'Target post not found for comment generation.');
    }

    const count = parseInt(limit, 10);
    if (isNaN(count) || count < 1 || count > 50) {
      throw new AppError(400, 'Comment generation limit must be a number between 1 and 50.');
    }

    // Retrieve existing comments to prevent duplicate comments
    const existingComments = await Comment.find({ post: postId }).select('comment reviewerName');
    const existingTexts = new Set(existingComments.map((c) => c.comment.trim()));

    const commentsToInsert = [];
    const usedReviewers = new Set();

    let attempts = 0;
    while (commentsToInsert.length < count && attempts < 150) {
      attempts++;
      const reviewerBase = this.getRandomElement(this.reviewerUsernames);
      const reviewerName = usedReviewers.has(reviewerBase)
        ? `${reviewerBase}_${Math.floor(Math.random() * 900) + 100}`
        : reviewerBase;

      usedReviewers.add(reviewerName);

      const phrase = this.getRandomElement(this.sampleReviewPhrases);
      // Combine with a personalized touch to avoid exact text collision
      const uniqueCommentText = existingTexts.has(phrase)
        ? `${phrase} (${reviewerName})`
        : phrase;

      if (existingTexts.has(uniqueCommentText)) {
        continue;
      }

      existingTexts.add(uniqueCommentText);

      // Ratings are predominantly 5 or 4
      const rating = Math.random() > 0.15 ? 5 : 4;

      commentsToInsert.push({
        post: postId,
        user: null,
        reviewerName,
        comment: uniqueCommentText,
        rating,
        reviewerStats: this.generateRandomStats(),
        visitDate: this.generateRandomVisitDate(),
        isVerifiedMember: Math.random() > 0.2, // 80% verified member
        isGenerated: true,
        isApproved: false // Generated comments stay unapproved until reviewed by admin
      });
    }

    const insertedComments = await Comment.insertMany(commentsToInsert);

    return {
      requestedCount: count,
      generatedCount: insertedComments.length,
      postId,
      postTitle: post.title,
      summary: `Successfully generated ${insertedComments.length} sample reviews in unpublished (draft) state for post "${post.title}".`,
      comments: insertedComments
    };
  }
}

export default new CommentGeneratorService();
