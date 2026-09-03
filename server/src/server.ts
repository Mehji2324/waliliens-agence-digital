import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.log(`
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ▲ WALILIENS STUDIO API ENGINE                         │
│   Status:  Online & Ready                               │
│   Port:    ${env.port.toString().padEnd(45)}│
│   Env:     ${env.nodeEnv.padEnd(45)}│
│   API:     http://localhost:${env.port}/api                    │
│   Health:  http://localhost:${env.port}/api/health             │
│                                                         │
└─────────────────────────────────────────────────────────┘
  `);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`[Server] Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    console.log('[Server] HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  // Force shutdown if taking longer than 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
