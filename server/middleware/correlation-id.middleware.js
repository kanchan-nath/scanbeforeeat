import crypto from 'crypto';

export function correlationIdMiddleware(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.id = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);
  next();
}

export default correlationIdMiddleware;
