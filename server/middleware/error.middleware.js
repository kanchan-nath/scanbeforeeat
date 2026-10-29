import { logger } from '../utils/logger.js';

export function errorMiddleware(err, req, res, next) {
  const correlationId = req.id || 'unknown';

  logger.error(
    {
      err: err.message,
      stack: err.stack,
      correlationId,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    },
    'Unhandled request error'
  );

  // If response has already started streaming, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);

  // Return clean, safe response without exposing stack traces or internals
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500
      ? 'An unexpected error occurred while processing your request. Please try again.'
      : err.message,
    correlationId
  });
}

export default errorMiddleware;
