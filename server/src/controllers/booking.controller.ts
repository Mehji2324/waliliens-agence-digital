import type { Request, Response } from 'express';
import { bookingService } from '../services/booking.service';
import { ok } from '../types/api';

export async function getBookingSlots(req: Request, res: Response): Promise<void> {
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  const slots = await bookingService.getAvailableSlots(date);

  res.status(200).json(ok(slots, req.requestId));
}

export async function reserveBookingSlot(req: Request, res: Response): Promise<void> {
  const confirmation = await bookingService.reserveSlot(req.body);

  res.status(200).json(ok(confirmation, req.requestId));
}
