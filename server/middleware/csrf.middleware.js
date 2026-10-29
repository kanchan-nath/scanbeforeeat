import crypto from 'crypto';

/**
 * Ensures the session contains a cryptographic CSRF token
 */
export function ensureCsrfToken(req) {
  if (!req.session) {
    return null;
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

/**
 * Validates CSRF token on mutating HTTP methods
 */
export function csrfMiddleware(req, res, next) {
  // Always ensure token is populated in session
  const serverToken = ensureCsrfToken(req);

  // Safe HTTP methods don't require CSRF validation
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF check for test environment if explicitly set
  if (process.env.NODE_ENV === 'test' && req.headers['x-skip-csrf-test'] === 'true') {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'] || req.body?._csrf;

  if (!serverToken || !clientToken || clientToken !== serverToken) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      correlationId: req.id
    });
  }

  next();
}

export default csrfMiddleware;
