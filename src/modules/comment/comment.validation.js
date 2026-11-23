import { z } from 'zod';

export const createCommentValidationSchema = z.object({
  body: z.object({
    postId: z.string({ required_error: 'postId is required' }),
    reviewerName: z.string({ required_error: 'reviewerName is required' }).min(2),
    comment: z.string({ required_error: 'comment is required' }).min(3),
    rating: z.number({ required_error: 'rating is required' }).min(1).max(5),
    visitDate: z.string().optional(),
    reviewerStats: z.string().optional()
  })
});

export const updateCommentValidationSchema = z.object({
  body: z.object({
    reviewerName: z.string().min(2).optional(),
    comment: z.string().min(3).optional(),
    rating: z.number().min(1).max(5).optional(),
    visitDate: z.string().optional(),
    isApproved: z.boolean().optional(),
    providerResponse: z
      .object({
        text: z.string().optional(),
        respondedAt: z.string().optional()
      })
      .optional()
  })
});

export const generateCommentsValidationSchema = z.object({
  body: z.object({
    postId: z.string({ required_error: 'postId is required' }),
    limit: z.number({ required_error: 'limit is required' }).min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50')
  })
});
