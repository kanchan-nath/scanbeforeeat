import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { MySQLSessionStore } from './middleware/session-store.js';
import { correlationIdMiddleware } from './middleware/correlation-id.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rate-limit.middleware.js';

import authRoutes from './routes/auth.routes.js';
import scanRoutes from './routes/scan.routes.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.join(__dirname, '..', 'client');

export const app = express();

// Disable x-powered-by
app.disable('x-powered-by');

// Trust first proxy hop
app.set('trust proxy', 1);

// 1. Correlation ID Header
app.use(correlationIdMiddleware);

// 2. Helmet Security Headers with customized CSP for PWA, Tesseract.js, ZXing, and fonts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'wasm-unsafe-eval'",
          "'unsafe-eval'",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
          "blob:"
        ],
        workerSrc: ["'self'", "blob:", "https://cdn.jsdelivr.net", "https://unpkg.com"],
        connectSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://world.openfoodfacts.org",
          "https://tessdata.projectnaptha.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com"
        ],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  })
);

// 3. Body Parsing with bounded size limits
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));
app.use(cookieParser());

// 4. MySQL-backed Sessions
app.use(
  session({
    store: new MySQLSessionStore(),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sbe.sid',
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  })
);

// 5. Health Check Endpoint (does not leak credentials or internal state)
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// 6. Global API Rate Limiter
app.use('/api/', apiLimiter);

// 7. Mount Versioned REST API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/scans', scanRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);

// 8. Serve Client Static Assets (PWA Shell, CSS, JS, Manifest)
app.use(express.static(clientDir, {
  maxAge: env.NODE_ENV === 'production' ? '1h' : '0',
  etag: true
}));

// Fallback for SPA/PWA client routing
app.get('{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      correlationId: req.id
    });
  }
  res.sendFile(path.join(clientDir, 'index.html'));
});

// 9. Global Error Handling
app.use(errorMiddleware);

export default app;
