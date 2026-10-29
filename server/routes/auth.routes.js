import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfMiddleware } from '../middleware/csrf.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rate-limit.middleware.js';
import {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  forgotPasswordSchema
} from '../schemas/auth.schema.js';

const router = Router();

// CSRF token retrieval
router.get('/csrf-token', authController.getCsrfToken);

// Authentication
router.post(
  '/register',
  authLimiter,
  csrfMiddleware,
  validateBody(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  csrfMiddleware,
  validateBody(loginSchema),
  authController.login
);

router.post('/logout', authController.logout);

// Current user profile
router.get('/me', authController.getMe);

// Password reset
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

// Authenticated user actions
router.post(
  '/change-password',
  requireAuth,
  csrfMiddleware,
  validateBody(updatePasswordSchema),
  authController.changePassword
);

router.delete(
  '/delete-account',
  requireAuth,
  csrfMiddleware,
  authController.deleteAccount
);

router.get(
  '/export',
  requireAuth,
  authController.exportData
);

export default router;
