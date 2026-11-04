import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitContact } from '../controllers/contact.controller';
import { asyncHandler } from '../utils/async-handler';

export const contactRouter = Router();

// Rate limiter for contact form — prevents spam submissions
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 contact submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many contact submissions. Please try again later.',
    },
  },
});

contactRouter.post('/', contactLimiter, asyncHandler(submitContact));

