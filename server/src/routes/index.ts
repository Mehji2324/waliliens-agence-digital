import { Router } from 'express';
import { projectsRouter } from './projects.routes';
import { servicesRouter } from './services.routes';
import { contactRouter } from './contact.routes';
import { bookingRouter } from './booking.routes';
import { adminRouter } from './admin.routes';
import { checkDatabaseConnection } from '../db';
import { asyncHandler } from '../utils/async-handler';

export const apiRouter = Router();

// ─── Liveness Probe ─────────────────────────────────────────────────────────
// Confirms the process is alive. Lightweight — no external dependencies checked.
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'waliliens-api',
    timestamp: new Date().toISOString(),
  });
});

// ─── Readiness Probe ─────────────────────────────────────────────────────────
// Confirms critical dependencies are connected and ready to serve traffic.
apiRouter.get(
  '/health/ready',
  asyncHandler(async (_req, res) => {
    const dbStatus = await checkDatabaseConnection();

    const isReady = dbStatus.connected;
    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      status: isReady ? 'ready' : 'not_ready',
      service: 'waliliens-api',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus.connected ? 'connected' : 'disconnected',
          ...(dbStatus.latencyMs !== undefined ? { latencyMs: dbStatus.latencyMs } : {}),
          ...(dbStatus.error ? { error: dbStatus.error } : {}),
        },
      },
    });
  })
);

// Domain routes
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/services', servicesRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/booking', bookingRouter);
apiRouter.use('/admin', adminRouter);

