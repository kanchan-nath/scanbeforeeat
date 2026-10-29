import rateLimit from 'express-rate-limit';

// Global API rate limit
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again in a minute.'
  }
});

// Authentication rate limiter (login / register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
  }
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many password reset requests. Please wait an hour before requesting again.'
  }
});

// Expensive AI Analysis limiter
export const aiAnalysisLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 20,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    // Key by authenticated userId if available, else by IP
    return req.session?.userId ? `user_${req.session.userId}` : (req.ip || 'unknown');
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI analysis quota limit reached for this session. Please wait a few minutes before submitting another scan.'
  }
});

// External Product / Barcode lookup limiter
export const barcodeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many product lookups. Please slow down.'
  }
});
