import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleCalendarBookingProvider } from './google-calendar.provider';
import { bookingsRepository } from '../../repositories/bookings.repository';
import { emailService } from '../email/email.service';
import { env } from '../../config/env';
import type { calendar_v3 } from 'googleapis';

describe('GoogleCalendarBookingProvider', () => {
  let provider: GoogleCalendarBookingProvider;
  let mockCalendar: {
    freebusy: {
      query: ReturnType<typeof vi.fn>;
    };
    events: {
      insert: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T09:00:00Z'));
    vi.clearAllMocks();

    mockCalendar = {
      freebusy: {
        query: vi.fn(),
      },
      events: {
        insert: vi.fn(),
        delete: vi.fn(),
      },
    };

    provider = new GoogleCalendarBookingProvider(mockCalendar as unknown as calendar_v3.Calendar);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Slot Generation & FreeBusy Filtering', () => {
    it('generates 30-minute candidate slots between working hours (10:00 - 18:00)', () => {
      const slots = provider.generateCandidateSlots('2026-10-15');
      // 10:00 to 18:00 = 8 hours = 16 30-minute slots
      expect(slots).toHaveLength(16);
      expect(slots[0].startTime).toBe('10:00');
      expect(slots[0].endTime).toBe('10:30');
      expect(slots[0].startIso).toBe('2026-10-15T09:00:00.000Z');
      expect(slots[0].endIso).toBe('2026-10-15T09:30:00.000Z');
      expect(slots[15].startTime).toBe('17:30');
      expect(slots[15].endTime).toBe('18:00');
    });

    it('filters out busy periods returned by Google Calendar FreeBusy API', async () => {
      const targetDate = '2026-10-15';

      // Mock Google FreeBusy: 13:00 to 14:00 local time in Africa/Casablanca (UTC+1) is 12:00 to 13:00 UTC
      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: {
            primary: {
              busy: [
                {
                  start: `${targetDate}T12:00:00.000Z`,
                  end: `${targetDate}T13:00:00.000Z`,
                },
              ],
            },
          },
        },
      });

      // Mock DB: no local bookings
      vi.spyOn(bookingsRepository, 'getActiveBookingsByDate').mockResolvedValue([]);

      const availableSlots = await provider.getAvailableSlots(targetDate);
      expect(availableSlots).toHaveLength(16);

      // Slot 7 is 13:00-13:30, Slot 8 is 13:30-14:00 -> both should be unavailable
      const slot1300 = availableSlots.find((s) => s.id === `${targetDate}-slot-7`);
      const slot1330 = availableSlots.find((s) => s.id === `${targetDate}-slot-8`);
      const slot1000 = availableSlots.find((s) => s.id === `${targetDate}-slot-1`);

      expect(slot1300?.available).toBe(false);
      expect(slot1330?.available).toBe(false);
      expect(slot1000?.available).toBe(true);
    });

    it('correctly maps UTC busy periods from Google Calendar to the business timezone (Africa/Casablanca, UTC+1)', async () => {
      const targetDate = '2026-10-15';

      // In Africa/Casablanca (UTC+1 on Oct 15, 2026), 10:00 AM local time corresponds to 09:00 UTC.
      // A busy period in Google Calendar from 09:00:00Z to 09:30:00Z represents 10:00 AM local time.
      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: {
            primary: {
              busy: [
                {
                  start: `${targetDate}T09:00:00.000Z`,
                  end: `${targetDate}T09:30:00.000Z`,
                },
              ],
            },
          },
        },
      });

      vi.spyOn(bookingsRepository, 'getActiveBookingsByDate').mockResolvedValue([]);

      const availableSlots = await provider.getAvailableSlots(targetDate);

      // The 10:00 AM Casablanca slot (09:00 UTC) must be unavailable
      const slot1000 = availableSlots.find((s) => s.id === `${targetDate}-slot-1`);
      // The 11:00 AM Casablanca slot (10:00 UTC, slot-3) must be available
      const slot1100 = availableSlots.find((s) => s.id === `${targetDate}-slot-3`);

      expect(slot1000?.available).toBe(false);
      expect(slot1100?.available).toBe(true);
    });

    it('correctly maps UTC busy periods when business timezone has DST shift (America/New_York, UTC-4)', async () => {
      const targetDate = '2026-10-15';
      const originalTimezone = env.booking.timezone;
      env.booking.timezone = 'America/New_York';

      try {
        // In America/New_York (EDT, UTC-4 on Oct 15, 2026), 10:00 AM local time corresponds to 14:00 UTC.
        // A busy period from 14:00:00Z to 14:30:00Z represents 10:00 AM local time.
        mockCalendar.freebusy.query.mockResolvedValue({
          data: {
            calendars: {
              primary: {
                busy: [
                  {
                    start: `${targetDate}T14:00:00.000Z`,
                    end: `${targetDate}T14:30:00.000Z`,
                  },
                ],
              },
            },
          },
        });

        vi.spyOn(bookingsRepository, 'getActiveBookingsByDate').mockResolvedValue([]);

        const availableSlots = await provider.getAvailableSlots(targetDate);

        // The 10:00 AM New York slot (14:00 UTC) must be unavailable
        const slot1000 = availableSlots.find((s) => s.id === `${targetDate}-slot-1`);
        // The 10:30 AM New York slot (14:30 UTC, slot-2) must be available
        const slot1030 = availableSlots.find((s) => s.id === `${targetDate}-slot-2`);

        expect(slot1000?.available).toBe(false);
        expect(slot1030?.available).toBe(true);
      } finally {
        env.booking.timezone = originalTimezone;
      }
    });

    it('filters out slots already booked in local PostgreSQL database', async () => {
      const targetDate = '2026-10-15';

      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: { primary: { busy: [] } },
        },
      });

      // Mock DB: slot-2 is already booked
      vi.spyOn(bookingsRepository, 'getActiveBookingsByDate').mockResolvedValue([
        {
          id: 'b-1',
          bookingId: 'BK_TEST123',
          slotId: `${targetDate}-slot-2`,
          date: targetDate,
          startTime: '10:30',
          endTime: '11:00',
          durationMinutes: 30,
          name: 'Jane Doe',
          email: 'jane@example.com',
          company: null,
          projectScope: null,
          timezone: 'UTC',
          status: 'confirmed',
          googleEventId: 'ge-1',
          googleCalendarId: 'primary',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const availableSlots = await provider.getAvailableSlots(targetDate);
      const slot2 = availableSlots.find((s) => s.id === `${targetDate}-slot-2`);
      const slot1 = availableSlots.find((s) => s.id === `${targetDate}-slot-1`);

      expect(slot2?.available).toBe(false);
      expect(slot1?.available).toBe(true);
    });
  });

  describe('Booking Creation & Google Meet Link Generation', () => {
    it('creates Google Calendar event with authentic Meet URL, persists to DB, and triggers emails', async () => {
      const targetDate = '2026-10-15';

      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: { primary: { busy: [] } },
        },
      });

      mockCalendar.events.insert.mockResolvedValue({
        data: {
          id: 'google-event-xyz-789',
          status: 'confirmed',
          hangoutLink: 'https://meet.google.com/wal-disc-123',
          conferenceData: {
            entryPoints: [
              {
                entryPointType: 'video',
                uri: 'https://meet.google.com/wal-disc-123',
              },
            ],
          },
        },
      });

      vi.spyOn(bookingsRepository, 'getActiveBookingsByDate').mockResolvedValue([]);
      const createBookingSpy = vi.spyOn(bookingsRepository, 'createBooking').mockResolvedValue({
        id: 'db-id-1',
        bookingId: 'BK_ABC123',
        slotId: `${targetDate}-slot-1`,
        date: targetDate,
        startTime: '10:00',
        endTime: '10:30',
        durationMinutes: 30,
        name: 'Alex Rivera',
        email: 'alex@waliliens.com',
        company: 'Vortex Labs',
        projectScope: 'Web3 Spatial interface',
        timezone: 'Africa/Casablanca',
        status: 'confirmed',
        googleEventId: 'google-event-xyz-789',
        googleCalendarId: 'primary',
        meetingUrl: 'https://meet.google.com/wal-disc-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const emailSpy = vi.spyOn(emailService, 'sendAllBookingEmails').mockResolvedValue({
        client: 'sent',
        team: 'sent',
      });

      const result = await provider.reserveSlot({
        slotId: `${targetDate}-slot-1`,
        date: targetDate,
        time: '10:00 AM',
        name: 'Alex Rivera',
        email: 'alex@waliliens.com',
        company: 'Vortex Labs',
        projectScope: 'Web3 Spatial interface',
        timezone: 'Africa/Casablanca',
      });

      expect(result.status).toBe('confirmed');
      expect(result.durationMinutes).toBe(30);
      expect(result.meetingUrl).toBe('https://meet.google.com/wal-disc-123');
      expect(result.emailNotification).toEqual({ client: 'sent', team: 'sent' });
      expect(mockCalendar.events.insert).toHaveBeenCalledTimes(1);
      expect(mockCalendar.events.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarId: 'primary',
          requestBody: expect.objectContaining({
            summary: expect.stringContaining('Alex Rivera'),
            start: {
              dateTime: `${targetDate}T09:00:00.000Z`,
              timeZone: 'Africa/Casablanca',
            },
            end: {
              dateTime: `${targetDate}T09:30:00.000Z`,
              timeZone: 'Africa/Casablanca',
            },
          }),
        })
      );
      expect(createBookingSpy).toHaveBeenCalledTimes(1);
      expect(emailSpy).toHaveBeenCalledTimes(1);
    });

    it('persists booking successfully even if email notifications fail', async () => {
      const targetDate = '2026-10-15';

      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: { primary: { busy: [] } },
        },
      });

      mockCalendar.events.insert.mockResolvedValue({
        data: {
          id: 'google-event-xyz-789',
          status: 'confirmed',
          hangoutLink: 'https://meet.google.com/wal-disc-123',
        },
      });

      vi.spyOn(bookingsRepository, 'getActiveBookingsByDate').mockResolvedValue([]);
      vi.spyOn(bookingsRepository, 'createBooking').mockResolvedValue({
        id: 'db-id-1',
        bookingId: 'BK_ABC123',
        slotId: `${targetDate}-slot-1`,
        date: targetDate,
        startTime: '10:00',
        endTime: '10:30',
        durationMinutes: 30,
        name: 'Alex Rivera',
        email: 'alex@waliliens.com',
        company: null,
        projectScope: null,
        timezone: 'Africa/Casablanca',
        status: 'confirmed',
        googleEventId: 'google-event-xyz-789',
        googleCalendarId: 'primary',
        meetingUrl: 'https://meet.google.com/wal-disc-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(emailService, 'sendAllBookingEmails').mockResolvedValue({
        client: 'failed',
        team: 'failed',
      });

      const result = await provider.reserveSlot({
        slotId: `${targetDate}-slot-1`,
        date: targetDate,
        time: '10:00 AM',
        name: 'Alex Rivera',
        email: 'alex@waliliens.com',
        company: '',
        projectScope: '',
        timezone: 'Africa/Casablanca',
      });

      expect(result.status).toBe('confirmed');
      expect(result.emailNotification).toEqual({ client: 'failed', team: 'failed' });
    });

    it('cleans up Google Calendar event if local DB insertion fails with conflict and does NOT send emails', async () => {
      const targetDate = '2026-10-15';

      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: { primary: { busy: [] } },
        },
      });

      mockCalendar.events.insert.mockResolvedValue({
        data: {
          id: 'orphan-event-123',
          conferenceData: {
            entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/test-url' }],
          },
        },
      });

      mockCalendar.events.delete.mockResolvedValue({});

      vi.spyOn(bookingsRepository, 'getActiveBookingsByDate').mockResolvedValue([]);
      vi.spyOn(bookingsRepository, 'createBooking').mockRejectedValue(new Error('Unique constraint violated'));
      const emailSpy = vi.spyOn(emailService, 'sendAllBookingEmails');

      await expect(
        provider.reserveSlot({
          slotId: `${targetDate}-slot-1`,
          date: targetDate,
          time: '10:00 AM',
          name: 'Alex Rivera',
          email: 'alex@waliliens.com',
          company: '',
          projectScope: '',
          timezone: 'UTC',
        })
      ).rejects.toThrow();

      // Verifies that cleanup was attempted and no email was sent
      expect(mockCalendar.events.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'orphan-event-123',
        })
      );
      expect(emailSpy).not.toHaveBeenCalled();
    });
  });
});
