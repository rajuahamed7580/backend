import { z } from 'zod';

export const createPostValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(3),
    slug: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    displayName: z.string({ required_error: 'Display name is required' }).min(2),
    age: z.number().optional(),
    gender: z.string().optional(),
    ethnicity: z.string().optional(),
    height: z.string().optional(),
    bodyType: z.string().optional(),
    serviceType: z.array(z.string()).optional(),
    mainImage: z.string().optional(),
    images: z
      .array(
        z.object({
          url: z.string().url('Image must be a valid URL'),
          public_id: z.string().optional(),
          caption: z.string().optional(),
          order: z.number().optional(),
          isMain: z.boolean().optional()
        })
      )
      .optional(),
    location: z
      .object({
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        address: z.string().optional(),
        zipCode: z.string().optional(),
        formattedLocation: z.string().optional()
      })
      .optional(),
    contact: z
      .object({
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        disclaimer: z.string().optional()
      })
      .optional(),
    donations: z.string().optional(),
    paymentMethods: z.array(z.string()).optional(),
    attributes: z
      .object({
        eyes: z.string().optional(),
        hair: z.string().optional(),
        hairLength: z.string().optional(),
        grooming: z.string().optional(),
        chest: z.string().optional(),
        piercings: z.boolean().optional(),
        tattoos: z.boolean().optional(),
        smoke: z.boolean().optional(),
        customAttributes: z
          .array(
            z.object({
              key: z.string(),
              value: z.string()
            })
          )
          .optional()
      })
      .optional(),
    aboutSection: z
      .object({
        notice: z.string().optional(),
        warnings: z.string().optional(),
        noList: z.array(z.string()).optional(),
        content: z.string().optional()
      })
      .optional(),
    scheduleSection: z
      .object({
        workingHours: z.string().optional(),
        workingDays: z.array(z.string()).optional(),
        notice: z.string().optional(),
        customSchedule: z.any().optional()
      })
      .optional(),
    screeningSection: z
      .object({
        requirements: z.string().optional(),
        depositRequired: z.boolean().optional(),
        depositAmount: z.string().optional(),
        instructions: z.string().optional()
      })
      .optional()
  })
});

export const updatePostValidationSchema = z.object({
  body: createPostValidationSchema.shape.body.partial()
});
