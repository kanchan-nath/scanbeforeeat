import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().trim().max(100).optional().default('')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters long')
    .max(100)
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name cannot be empty').max(100)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address')
});
