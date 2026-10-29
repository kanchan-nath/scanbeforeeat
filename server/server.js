import { app } from './app.js';
import { env } from './config/env.js';
import { testConnection, pool } from './config/database.js';
import { runMigrations } from '../database/migrate.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    logger.info('Initializing ScanBeforeEat server...');

    // 1. Verify Database Connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to establish initial MySQL database connection. Exiting.');
      process.exit(1);
    }
    logger.info('Database connection established successfully');

    // 2. Run migrations
    await runMigrations();

    // 3. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 ScanBeforeEat PWA server running at ${env.APP_BASE_URL} (Port: ${env.PORT}) [${env.NODE_ENV}]`);
      console.log(`\n======================================================`);
      console.log(`🥗 ScanBeforeEat AI Food Intelligence Platform`);
      console.log(`📱 Web URL: ${env.APP_BASE_URL}`);
      console.log(`🔌 Health check: ${env.APP_BASE_URL}/api/v1/health`);
      console.log(`======================================================\n`);
    });

    // 4. Graceful Shutdown
    const shutdown = async (signal) => {
      logger.info({ signal }, 'Graceful shutdown initiated');
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await pool.end();
          logger.info('Database pool closed');
          process.exit(0);
        } catch (err) {
          logger.error({ err: err.message }, 'Error closing database pool');
          process.exit(1);
        }
      });

      // Force close if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.fatal({ err: err.message, stack: err.stack }, 'Fatal startup failure');
    process.exit(1);
  }
}

startServer();
