import { app } from './app';
import { env } from './config/env';
import { getPool } from './db';
import { logger } from './utils/logger';

const server = app.listen(env.port, () => {
  logger.info(
    {
      port: env.port,
      env: env.nodeEnv,
      api: `http://localhost:${env.port}/api`,
      health: `http://localhost:${env.port}/api/health`,
    },
    `Waliliens Studio API online on port ${env.port} (${env.nodeEnv})`
  );
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info({ signal }, `Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    try {
      await getPool().end();
      logger.info('Database pool closed. Exiting process cleanly.');
    } catch (err) {
      logger.error({ err }, 'Error closing database pool during shutdown');
    } finally {
      process.exit(0);
    }
  });

  // Force shutdown if taking longer than 15 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 15000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
