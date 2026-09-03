import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env, isDev } from './config/env';
import { requestId } from './middleware/request-id';
import { notFound } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';
import { apiRouter } from './routes';

export const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration — configured with client whitelist and credentials enabled
const allowedOrigins = [
  env.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || isDev) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Logging
if (isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request ID tracking
app.use(requestId);

// Root health redirect / greeting
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Waliliens Studio API',
    version: '1.0.0',
    status: 'online',
    health: '/api/health',
  });
});

// API Routes mounting
app.use('/api', apiRouter);

// 404 Not Found Middleware for unmatched routes
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);
