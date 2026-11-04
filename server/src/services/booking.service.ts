import { z } from 'zod';
import type { BookingSlot } from '../types/domain';
import { ValidationError } from '../utils/http-errors';
import { env } from '../config/env';
import {
  GoogleCalendarBookingProvider,
  getTodayDateString,
  type IBookingProvider,
} from '../integrations/google-calendar/google-calendar.provider';
import type { EmailNotificationStatus } from '../integrations/email/email.types';

export const bookingReserveSchema = z.object({
  slotId: z.string().trim().min(1, { message: 'slotId is required' }),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
    .refine(
      (dateStr) => {
        const todayStr = getTodayDateString(env.booking.timezone);
        return dateStr >= todayStr;
      },
      { message: 'Cannot book consultation dates in the past' }
    ),
  time: z.string().trim().min(1, { message: 'time is required' }),
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'A valid email address is required' })
    .max(255, { message: 'Email cannot exceed 255 characters' }),
  company: z.string().trim().max(100).optional().default(''),
  projectScope: z.string().trim().max(2000).optional().default(''),
  timezone: z.string().trim().max(50).optional().default(env.booking.timezone),
});

export interface BookingConfirmation {
  bookingId: string;
  status: 'confirmed';
  durationMinutes: number;
  scheduledTime: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  slotId: string;
  meetingUrl: string;
  provider: 'google_calendar' | 'database' | 'mock';
  emailNotification?: EmailNotificationStatus;
  message: string;
}

export class BookingService {
  private provider: IBookingProvider;

  constructor(provider?: IBookingProvider) {
    this.provider = provider || new GoogleCalendarBookingProvider();
  }

  public setProvider(provider: IBookingProvider): void {
    this.provider = provider;
  }

  public getProvider(): IBookingProvider {
    return this.provider;
  }

  public async getAvailableSlots(date?: string): Promise<BookingSlot[]> {
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ValidationError('Invalid date format. Expected YYYY-MM-DD.');
      }
      const todayStr = getTodayDateString(env.booking.timezone);
      if (date < todayStr) {
        throw new ValidationError('Cannot query consultation availability for past dates.');
      }
    }

    return this.provider.getAvailableSlots(date);
  }

  public async reserveSlot(rawInput: unknown): Promise<BookingConfirmation> {
    const parseResult = bookingReserveSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parseResult.error.issues) {
        const pathKey = issue.path.join('.') || 'body';
        if (!details[pathKey]) details[pathKey] = [];
        details[pathKey].push(issue.message);
      }
      throw new ValidationError('Booking reservation validation failed.', details);
    }

    return this.provider.reserveSlot(parseResult.data);
  }
}

export const bookingService = new BookingService();
