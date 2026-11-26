import { z } from 'zod';

const RESERVED_COUNTRY_SEGMENTS = new Set(['posts', 'api', 'admin', '_next', 'favicon.ico']);

const segmentSchema = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(80, `${label} must be 80 characters or fewer`)
    .regex(
      /^[A-Za-z0-9._-]+$/,
      `${label} can only contain letters, numbers, hyphens (-), underscores (_), and dots (.)`
    );

export const createCustomUrlValidationSchema = z.object({
  body: z.object({
    post: z.string({ required_error: 'Post is required' }).trim().min(1, 'Post is required'),
    country: segmentSchema('Country').refine(
      (val) => !RESERVED_COUNTRY_SEGMENTS.has(val.toLowerCase()),
      'This country path segment is reserved'
    ),
    state: segmentSchema('State'),
    city: segmentSchema('City'),
    username: segmentSchema('Username'),
    shortTitle: z.string().trim().max(160).optional(),
    isActive: z.boolean().optional()
  })
});

export const updateCustomUrlValidationSchema = z.object({
  body: createCustomUrlValidationSchema.shape.body.partial()
});
