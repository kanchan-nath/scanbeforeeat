import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'password',
      'password_hash',
      'passwordHash',
      'token',
      'session.cookie',
      'NVIDIA_API_KEY',
      '*.password',
      '*.password_hash',
      '*.apiKey',
      '*.token'
    ],
    censor: '[REDACTED]'
  },
  transport: env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard'
    }
  } : undefined
});

export default logger;
