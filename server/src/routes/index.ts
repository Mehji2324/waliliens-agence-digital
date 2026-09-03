import { Router } from 'express';
import { projectsRouter } from './projects.routes';
import { servicesRouter } from './services.routes';
import { contactRouter } from './contact.routes';
import { bookingRouter } from './booking.routes';
import { adminRouter } from './admin.routes';
import { checkDatabaseConnection } from '../db';
import { asyncHandler } from '../utils/async-handler';

export const apiRouter = Router();

// Health check endpoint with database availability check
apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const dbStatus = await checkDatabaseConnection();

    res.status(200).json({
      success: true,
      message: 'Waliliens API is running',
      database: dbStatus.connected ? 'connected' : 'disconnected',
      ...(dbStatus.latencyMs !== undefined ? { latencyMs: dbStatus.latencyMs } : {}),
    });
  })
);

// Domain routes
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/services', servicesRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/booking', bookingRouter);
apiRouter.use('/admin', adminRouter);
