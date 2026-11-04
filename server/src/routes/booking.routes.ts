import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getBookingSlots, reserveBookingSlot } from '../controllers/booking.controller';
import { asyncHandler } from '../utils/async-handler';

export const bookingRouter = Router();

// Rate limiter for booking reservations — prevents slot flooding
const bookingReserveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 booking attempts per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many booking attempts. Please try again in 1 hour.',
    },
  },
});

bookingRouter.get('/slots', asyncHandler(getBookingSlots));
bookingRouter.post('/reserve', bookingReserveLimiter, asyncHandler(reserveBookingSlot));

