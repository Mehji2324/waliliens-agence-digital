import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService, bookingReserveSchema } from './booking.service';
import type { IBookingProvider } from '../integrations/google-calendar/google-calendar.provider';
import { ValidationError } from '../utils/http-errors';

describe('BookingService & bookingReserveSchema Validation', () => {
  let bookingService: BookingService;
  let mockProvider: {
    getAvailableSlots: ReturnType<typeof vi.fn>;
    reserveSlot: ReturnType<typeof vi.fn>;
  };

  const getFutureDate = (daysAhead = 3): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  beforeEach(() => {
    mockProvider = {
      getAvailableSlots: vi.fn().mockResolvedValue([]),
      reserveSlot: vi.fn().mockResolvedValue({
        bookingId: 'BK_123',
        status: 'confirmed',
        durationMinutes: 30,
        scheduledTime: '10:00 AM',
        date: getFutureDate(3),
        startTime: '10:00',
        endTime: '10:30',
        timezone: 'Africa/Casablanca',
        slotId: `slot_${getFutureDate(3)}_1000`,
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        provider: 'google_calendar',
        message: 'Your discovery call is scheduled.',
      }),
    };
    bookingService = new BookingService(mockProvider as unknown as IBookingProvider);
  });

  describe('bookingReserveSchema', () => {
    it('accepts a fully valid reservation payload', () => {
      const futureDate = getFutureDate(5);
      const validPayload = {
        slotId: `slot_${futureDate}_1000`,
        date: futureDate,
        time: '10:00',
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne.io',
        company: 'Resistance Ops',
        projectScope: 'Autonomous AI workflow deployment',
        timezone: 'Africa/Casablanca',
      };

      const result = bookingReserveSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects past dates', () => {
      const pastPayload = {
        slotId: 'slot_2020-01-01_1000',
        date: '2020-01-01',
        time: '10:00',
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne.io',
      };

      const result = bookingReserveSchema.safeParse(pastPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('past'))).toBe(true);
      }
    });

    it('rejects invalid date format', () => {
      const invalidDatePayload = {
        slotId: 'slot_invalid',
        date: '15/10/2026',
        time: '10:00',
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne.io',
      };

      const result = bookingReserveSchema.safeParse(invalidDatePayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('date'))).toBe(true);
      }
    });

    it('rejects names shorter than 2 characters', () => {
      const futureDate = getFutureDate(2);
      const invalidNamePayload = {
        slotId: `slot_${futureDate}_1000`,
        date: futureDate,
        time: '10:00',
        name: 'S',
        email: 'sarah@cyberdyne.io',
      };

      const result = bookingReserveSchema.safeParse(invalidNamePayload);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email addresses', () => {
      const futureDate = getFutureDate(2);
      const invalidEmailPayload = {
        slotId: `slot_${futureDate}_1000`,
        date: futureDate,
        time: '10:00',
        name: 'Sarah Connor',
        email: 'not-an-email',
      };

      const result = bookingReserveSchema.safeParse(invalidEmailPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('BookingService.getAvailableSlots', () => {
    it('queries provider for valid future date', async () => {
      const futureDate = getFutureDate(4);
      await bookingService.getAvailableSlots(futureDate);
      expect(mockProvider.getAvailableSlots).toHaveBeenCalledWith(futureDate);
    });

    it('throws ValidationError when date format is invalid', async () => {
      await expect(bookingService.getAvailableSlots('invalid-date')).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError when querying past date', async () => {
      await expect(bookingService.getAvailableSlots('2020-01-01')).rejects.toThrow(ValidationError);
    });
  });

  describe('BookingService.reserveSlot', () => {
    it('delegates to provider when input is valid', async () => {
      const futureDate = getFutureDate(2);
      const payload = {
        slotId: `slot_${futureDate}_1000`,
        date: futureDate,
        time: '10:00',
        name: 'Alex Rivera',
        email: 'alex@waliliens.com',
      };

      const result = await bookingService.reserveSlot(payload);
      expect(mockProvider.reserveSlot).toHaveBeenCalled();
      expect(result.bookingId).toBe('BK_123');
    });

    it('throws ValidationError with field error details on invalid payload', async () => {
      await expect(bookingService.reserveSlot({})).rejects.toThrow(ValidationError);
    });
  });
});
