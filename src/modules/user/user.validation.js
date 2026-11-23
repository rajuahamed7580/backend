import { z } from 'zod';

export const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2),
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(6),
    role: z.enum(['admin', 'user']).optional(),
    isBlock: z.boolean().optional()
  })
});

export const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['admin', 'user']).optional(),
    isBlock: z.boolean().optional()
  })
});
