import { Router } from 'express';
import { getBookingSlots, reserveBookingSlot } from '../controllers/booking.controller';
import { asyncHandler } from '../utils/async-handler';

export const bookingRouter = Router();

bookingRouter.get('/slots', asyncHandler(getBookingSlots));
bookingRouter.post('/reserve', asyncHandler(reserveBookingSlot));
