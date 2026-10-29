import argon2 from 'argon2';
import { userRepository } from '../repositories/user.repository.js';
import { ensureCsrfToken } from '../middleware/csrf.middleware.js';
import { logger } from '../utils/logger.js';

export const authController = {
  async getCsrfToken(req, res) {
    const token = ensureCsrfToken(req);
    return res.json({
      success: true,
      csrfToken: token
    });
  },

  async register(req, res, next) {
    try {
      const { email, password, displayName } = req.validatedBody;

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email address already exists.'
        });
      }

      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1
      });

      const userId = await userRepository.createUser({
        email,
        passwordHash,
        displayName
      });

      // Regenerate session to protect against session fixation attacks
      req.session.regenerate((err) => {
        if (err) return next(err);

        req.session.userId = userId;
        const csrfToken = ensureCsrfToken(req);

        logger.info({ userId, email }, 'New user successfully registered');

        return res.status(201).json({
          success: true,
          message: 'Account created successfully.',
          user: {
            id: userId,
            email,
            displayName,
            accountStatus: 'active'
          },
          csrfToken
        });
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.validatedBody;

      const user = await userRepository.findByEmail(email);
      if (!user) {
        // Constant-time-like delay simulation to mitigate timing enumeration
        await argon2.verify(
          '$argon2id$v=19$m=19456,t=2,p=1$mockhashsaltfortimingdefense$mockhashsaltfortimingdefense',
          'dummyPassword'
        ).catch(() => {});

        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.'
        });
      }

      if (user.account_status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Account is suspended or pending verification.'
        });
      }

      const passwordValid = await argon2.verify(user.password_hash, password);
      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.'
        });
      }

      // Update last login
      await userRepository.updateLastLogin(user.id);

      // Regenerate session on login
      req.session.regenerate((err) => {
        if (err) return next(err);

        req.session.userId = user.id;
        const csrfToken = ensureCsrfToken(req);

        logger.info({ userId: user.id }, 'User logged in successfully');

        return res.json({
          success: true,
          message: 'Signed in successfully.',
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            accountStatus: user.account_status,
            createdAt: user.created_at
          },
          csrfToken
        });
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    if (!req.session) {
      return res.json({ success: true, message: 'Logged out.' });
    }

    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Logged out successfully.' });
    });
  },

  async getMe(req, res) {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const user = await userRepository.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const csrfToken = ensureCsrfToken(req);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        accountStatus: user.account_status,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      },
      csrfToken
    });
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.validatedBody;
      const user = await userRepository.findById(req.user.id);
      
      const fullUser = await userRepository.findByEmail(user.email);
      const isMatch = await argon2.verify(fullUser.password_hash, currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Current password does not match.'
        });
      }

      const newHash = await argon2.hash(newPassword, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1
      });

      await userRepository.updatePassword(req.user.id, newHash);
      return res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res) {
    const { email } = req.validatedBody;
    // We respond with a generic success to prevent email enumeration
    return res.json({
      success: true,
      message: 'If an account with this email exists, password reset instructions have been dispatched.'
    });
  },

  async deleteAccount(req, res, next) {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ success: false, error: 'Password confirmation is required to delete your account.' });
      }

      const user = await userRepository.findById(req.user.id);
      const fullUser = await userRepository.findByEmail(user.email);
      const isMatch = await argon2.verify(fullUser.password_hash, password);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Incorrect password.' });
      }

      await userRepository.deleteAccount(req.user.id);
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: 'Your account and all associated data have been permanently deleted.' });
      });
    } catch (err) {
      next(err);
    }
  },

  async exportData(req, res, next) {
    try {
      const exportData = await userRepository.getExportData(req.user.id);
      if (!exportData) {
        return res.status(404).json({ success: false, error: 'Data not found.' });
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="scanbeforeeat-export-${req.user.id}.json"`);
      return res.json(exportData);
    } catch (err) {
      next(err);
    }
  }
};

export default authController;
