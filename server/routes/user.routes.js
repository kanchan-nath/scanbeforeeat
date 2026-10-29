import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { csrfMiddleware } from '../middleware/csrf.middleware.js';
import { pool } from '../config/database.js';
import { userRepository } from '../repositories/user.repository.js';

const router = Router();

router.use(requireAuth);

router.get('/preferences', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT allergens_json, dietary_tags_json FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );

    const pref = rows[0] || {};
    return res.json({
      success: true,
      preferences: {
        allergens: pref.allergens_json
          ? (typeof pref.allergens_json === 'string' ? JSON.parse(pref.allergens_json) : pref.allergens_json)
          : [],
        dietaryTags: pref.dietary_tags_json
          ? (typeof pref.dietary_tags_json === 'string' ? JSON.parse(pref.dietary_tags_json) : pref.dietary_tags_json)
          : []
      }
    });
  } catch (err) {
    next(err);
  }
});

router.put('/preferences', csrfMiddleware, async (req, res, next) => {
  try {
    const { allergens = [], dietaryTags = [] } = req.body;

    await pool.execute(
      `INSERT INTO user_preferences (user_id, allergens_json, dietary_tags_json)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         allergens_json = VALUES(allergens_json),
         dietary_tags_json = VALUES(dietary_tags_json)`,
      [req.user.id, JSON.stringify(allergens), JSON.stringify(dietaryTags)]
    );

    return res.json({
      success: true,
      message: 'Dietary preferences updated successfully.'
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/me', csrfMiddleware, async (req, res, next) => {
  try {
    const { displayName } = req.body;
    if (!displayName || displayName.trim().length === 0) {
      return res.status(422).json({ success: false, error: 'Display name cannot be empty.' });
    }

    await userRepository.updateProfile(req.user.id, { displayName: displayName.trim() });
    return res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    next(err);
  }
});

export default router;
