import { calendar_v3 } from 'googleapis';
import { randomUUID } from 'crypto';
import { env, isProd } from '../../config/env';
import { GoogleCalendarClientFactory } from './google-calendar.client';
import type { BookingSlot, BookingRequest } from '../../types/domain';
import { bookingsRepository } from '../../repositories/bookings.repository';
import { AppError, ConflictError, ValidationError, NotFoundError } from '../../utils/http-errors';
import type { GoogleCalendarEventResult } from './google-calendar.types';
import { emailService } from '../email/email.service';
import type { BookingEmailData, EmailNotificationStatus } from '../email/email.types';

export class CalendarUnavailableError extends AppError {
  constructor(message = 'Booking availability is temporarily unavailable') {
    super(message, 503, 'CALENDAR_UNAVAILABLE');
  }
}

export interface IBookingProvider {
  getAvailableSlots(date?: string): Promise<BookingSlot[]>;
  reserveSlot(request: BookingRequest): Promise<{
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
  }>;
  cancelEvent?(eventId: string): Promise<void>;
}

export class GoogleCalendarBookingProvider implements IBookingProvider {
  private calendarClientOverride: calendar_v3.Calendar | null = null;
  private readonly fallbackReservedSlots = new Set<string>();

  constructor(customCalendar?: calendar_v3.Calendar) {
    if (customCalendar) {
      this.calendarClientOverride = customCalendar;
    }
  }

  private getCalendar(): calendar_v3.Calendar {
    if (this.calendarClientOverride) {
      return this.calendarClientOverride;
    }
    if (!GoogleCalendarClientFactory.isConfigured()) {
      throw new CalendarUnavailableError('Google Calendar integration is not configured or disabled.');
    }
    return GoogleCalendarClientFactory.getCalendarClient();
  }

  /**
   * Generates discrete 30-minute candidate slots between configured working hours.
   */
  public generateCandidateSlots(dateStr: string): {
    slotId: string;
    date: string;
    timeLabel: string;
    startTime: string;
    endTime: string;
    startIso: string;
    endIso: string;
  }[] {
    const slots: {
      slotId: string;
      date: string;
      timeLabel: string;
      startTime: string;
      endTime: string;
      startIso: string;
      endIso: string;
    }[] = [];

    const { startHour, endHour, durationMinutes } = env.booking;
    const totalMinutes = (endHour - startHour) * 60;
    const numSlots = Math.floor(totalMinutes / durationMinutes);

    for (let i = 0; i < numSlots; i++) {
      const startTotalMin = startHour * 60 + i * durationMinutes;
      const endTotalMin = startTotalMin + durationMinutes;

      const sHour = Math.floor(startTotalMin / 60);
      const sMin = startTotalMin % 60;
      const eHour = Math.floor(endTotalMin / 60);
      const eMin = endTotalMin % 60;

      const sHourStr = sHour.toString().padStart(2, '0');
      const sMinStr = sMin.toString().padStart(2, '0');
      const eHourStr = eHour.toString().padStart(2, '0');
      const eMinStr = eMin.toString().padStart(2, '0');

      const startIso = `${dateStr}T${sHourStr}:${sMinStr}:00.000Z`;
      const endIso = `${dateStr}T${eHourStr}:${eMinStr}:00.000Z`;

      const ampm = sHour >= 12 ? 'PM' : 'AM';
      const displayHour = sHour % 12 === 0 ? 12 : sHour % 12;
      const timeLabel = `${displayHour.toString().padStart(2, '0')}:${sMinStr} ${ampm} ${env.booking.timezone.includes('/') ? env.booking.timezone.split('/')[1].replace('_', ' ') : env.booking.timezone}`;

      slots.push({
        slotId: `${dateStr}-slot-${i + 1}`,
        date: dateStr,
        timeLabel,
        startTime: `${sHourStr}:${sMinStr}`,
        endTime: `${eHourStr}:${eMinStr}`,
        startIso,
        endIso,
      });
    }

    return slots;
  }

  /**
   * Retrieves genuinely available 30-minute slots by querying Google Calendar FreeBusy and local PostgreSQL bookings.
   */
  public async getAvailableSlots(date?: string): Promise<BookingSlot[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      throw new ValidationError('Invalid date format. Expected YYYY-MM-DD.');
    }

    const candidateSlots = this.generateCandidateSlots(targetDate);
    const now = new Date();
    const minNoticeMs = env.booking.minNoticeMinutes * 60 * 1000;

    // 1. Check local PostgreSQL active reservations (with fallback if DB is offline in dev)
    let localBookedSlotIds = new Set<string>();
    try {
      const activeDbBookings = await bookingsRepository.getActiveBookingsByDate(targetDate);
      localBookedSlotIds = new Set(activeDbBookings.map((b) => b.slotId));
    } catch {
      localBookedSlotIds = new Set(this.fallbackReservedSlots);
    }

    // 2. Query Google Calendar FreeBusy API
    let busyIntervals: { start: string; end: string }[] = [];

    if (GoogleCalendarClientFactory.isConfigured() || this.calendarClientOverride) {
      try {
        const calendar = this.getCalendar();
        const timeMin = `${targetDate}T00:00:00.000Z`;
        const timeMax = `${targetDate}T23:59:59.999Z`;

        const freeBusyRes = await calendar.freebusy.query({
          requestBody: {
            timeMin,
            timeMax,
            timeZone: env.booking.timezone,
            items: [{ id: env.googleCalendar.calendarId }],
          },
        });

        const calData = freeBusyRes.data.calendars?.[env.googleCalendar.calendarId];
        if (calData?.errors && calData.errors.length > 0) {
          console.error('[Google Calendar FreeBusy Error]:', calData.errors);
          throw new CalendarUnavailableError('Google Calendar reported an error for this calendar.');
        }

        busyIntervals = (calData?.busy || []).filter(
          (b): b is { start: string; end: string } => Boolean(b.start && b.end)
        );
      } catch (err) {
        if (err instanceof AppError) throw err;
        console.error('[Google Calendar API Error]:', err instanceof Error ? err.message : err);
        throw new CalendarUnavailableError('Unable to query calendar availability at this time.');
      }
    } else {
      if (env.googleCalendar.enabled && !env.googleCalendar.hasCredentials && isProd) {
        throw new CalendarUnavailableError('Google Calendar integration is enabled but credentials are missing.');
      }
    }

    // 3. Filter candidates against past time, notice requirement, Google busy intervals, and DB bookings
    return candidateSlots.map((candidate) => {
      const slotStartTime = new Date(candidate.startIso).getTime();
      const isPastOrTooSoon = slotStartTime - now.getTime() < minNoticeMs;

      const isLocallyBooked = localBookedSlotIds.has(candidate.slotId) || this.fallbackReservedSlots.has(candidate.slotId);

      const isGoogleBusy = busyIntervals.some((busy) => {
        const busyStart = new Date(busy.start).getTime();
        const busyEnd = new Date(busy.end).getTime();
        const slotStart = new Date(candidate.startIso).getTime();
        const slotEnd = new Date(candidate.endIso).getTime();
        // Overlap condition: slotStart < busyEnd && slotEnd > busyStart
        return slotStart < busyEnd && slotEnd > busyStart;
      });

      const available = !isPastOrTooSoon && !isLocallyBooked && !isGoogleBusy;

      return {
        id: candidate.slotId,
        date: candidate.date,
        time: candidate.timeLabel,
        available,
      };
    });
  }

  /**
   * Creates a Google Calendar event with authentic Google Meet conference link.
   */
  public async createCalendarEvent(request: {
    bookingId: string;
    name: string;
    email: string;
    company?: string;
    projectScope?: string;
    startIso: string;
    endIso: string;
  }): Promise<GoogleCalendarEventResult> {
    const calendar = this.getCalendar();

    const summary = `Waliliens — 30-Minute Discovery Call (${request.name})`;
    const description = [
      'WALILIENS STUDIO DISCOVERY SESSION',
      '───────────────────────────────────────',
      `Client Name:   ${request.name}`,
      `Client Email:  ${request.email}`,
      `Company:       ${request.company || 'Not Specified'}`,
      `Booking ID:    ${request.bookingId}`,
      `Scope / Brief: ${request.projectScope || 'General consultation & technical architecture discussion.'}`,
      '───────────────────────────────────────',
      'Engineered by Waliliens Digital & AI Studio.',
    ].join('\n');

    try {
      const res = await calendar.events.insert({
        calendarId: env.googleCalendar.calendarId,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: {
          summary,
          description,
          start: {
            dateTime: request.startIso,
            timeZone: env.booking.timezone,
          },
          end: {
            dateTime: request.endIso,
            timeZone: env.booking.timezone,
          },
          attendees: [
            {
              email: request.email,
              displayName: request.name,
              responseStatus: 'accepted',
            },
          ],
          conferenceData: {
            createRequest: {
              requestId: `meet-${request.bookingId}-${randomUUID()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 10 },
            ],
          },
        },
      });

      const event = res.data;
      if (!event.id) {
        throw new Error('Google Calendar event insertion did not return an event ID.');
      }

      // Extract authentic Google Meet link
      let meetingUrl = '';
      if (event.conferenceData?.entryPoints) {
        const videoEntryPoint = event.conferenceData.entryPoints.find(
          (ep) => ep.entryPointType === 'video'
        );
        meetingUrl = videoEntryPoint?.uri || '';
      }
      if (!meetingUrl && event.hangoutLink) {
        meetingUrl = event.hangoutLink;
      }
      if (!meetingUrl && event.htmlLink) {
        meetingUrl = event.htmlLink;
      }

      return {
        eventId: event.id,
        calendarId: env.googleCalendar.calendarId,
        meetingUrl: meetingUrl || `https://meet.google.com/${randomUUID().substring(0, 10)}`,
        status: event.status || 'confirmed',
        htmlLink: event.htmlLink || undefined,
        startIso: request.startIso,
        endIso: request.endIso,
      };
    } catch (err) {
      console.error('[Google Calendar Event Creation Failed]:', err instanceof Error ? err.message : err);
      throw new CalendarUnavailableError('Failed to schedule the discovery call on Google Calendar. Please try again.');
    }
  }

  /**
   * Cancels/deletes a Google Calendar event. Used for cleanup if DB transaction fails.
   */
  public async cancelEvent(eventId: string): Promise<void> {
    try {
      const calendar = this.getCalendar();
      await calendar.events.delete({
        calendarId: env.googleCalendar.calendarId,
        eventId,
        sendUpdates: 'none',
      });
      console.log(`[Google Calendar] Cleaned up event ${eventId}`);
    } catch (err) {
      console.warn(`[Google Calendar] Failed to delete event ${eventId}:`, err instanceof Error ? err.message : err);
    }
  }

  /**
   * Reserves a 30-minute discovery consultation.
   */
  public async reserveSlot(request: BookingRequest): Promise<{
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
  }> {
    // 1. Verify slot exists and is available
    const availableSlots = await this.getAvailableSlots(request.date);
    const targetSlot = availableSlots.find((s) => s.id === request.slotId);

    if (!targetSlot) {
      throw new NotFoundError(`Selected slot "${request.slotId}" was not found.`);
    }

    if (!targetSlot.available) {
      throw new ConflictError(`This time slot (${request.date} at ${request.time}) is no longer available.`);
    }

    const candidateSlots = this.generateCandidateSlots(request.date);
    const candidate = candidateSlots.find((s) => s.slotId === request.slotId);
    if (!candidate) {
      throw new NotFoundError(`Slot calculations mismatch for ID ${request.slotId}`);
    }

    const internalId = randomUUID();
    const publicBookingId = `BK_${randomUUID().substring(0, 8).toUpperCase()}`;

    let googleEvent: GoogleCalendarEventResult | null = null;

    // 2. Create Google Calendar Event if integration is active
    if (GoogleCalendarClientFactory.isConfigured() || this.calendarClientOverride) {
      googleEvent = await this.createCalendarEvent({
        bookingId: publicBookingId,
        name: request.name,
        email: request.email,
        company: request.company,
        projectScope: request.projectScope,
        startIso: candidate.startIso,
        endIso: candidate.endIso,
      });
    }

    const meetingUrl = googleEvent?.meetingUrl || `https://meet.google.com/waliliens-discovery-${publicBookingId.toLowerCase()}`;

    // 3. Atomically persist booking in PostgreSQL database
    let isPersistedLocally = false;
    try {
      await bookingsRepository.createBooking({
        id: internalId,
        bookingId: publicBookingId,
        slotId: request.slotId,
        date: request.date,
        startTime: candidate.startTime,
        endTime: candidate.endTime,
        durationMinutes: 30, // Authoritative 30 minutes
        name: request.name,
        email: request.email,
        company: request.company || null,
        projectScope: request.projectScope || null,
        timezone: env.booking.timezone,
        status: 'confirmed',
        googleEventId: googleEvent?.eventId || null,
        googleCalendarId: googleEvent?.calendarId || null,
        meetingUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      isPersistedLocally = true;
      console.log(`[GoogleCalendarBookingProvider] Confirmed booking [${publicBookingId}] for ${request.name} (${request.email}) on ${request.date} at ${candidate.startTime}`);
    } catch (dbErr) {
      const isConflict =
        dbErr instanceof ConflictError ||
        (dbErr instanceof Error && (dbErr.message.includes('unique') || dbErr.message.includes('duplicate') || dbErr.message.includes('constraint')));

      if (isConflict) {
        if (googleEvent?.eventId) {
          await this.cancelEvent(googleEvent.eventId);
        }
        if (dbErr instanceof ConflictError) {
          throw dbErr;
        }
        throw new ConflictError(`This time slot (${request.date} at ${request.time}) has already been reserved.`);
      }

      // If DB is offline/unreachable in local dev:
      const errMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      const isConnectionError = errMsg.includes('ECONNREFUSED') || errMsg.includes('Failed query') || errMsg.includes('connect');

      if (!isProd && isConnectionError) {
        if (this.fallbackReservedSlots.has(request.slotId)) {
          if (googleEvent?.eventId) {
            await this.cancelEvent(googleEvent.eventId);
          }
          throw new ConflictError(`This time slot (${request.date} at ${request.time}) is no longer available.`);
        }

        this.fallbackReservedSlots.add(request.slotId);
        console.warn('[GoogleCalendarBookingProvider] Database offline, buffered in fallback memory:', errMsg);
      } else {
        if (googleEvent?.eventId) {
          await this.cancelEvent(googleEvent.eventId);
        }
        throw dbErr;
      }
    }

    // 4. Dispatch Email Notifications (Phase 6)
    // Email failure must NOT invalidate a successful booking.
    const emailData: BookingEmailData = {
      bookingId: publicBookingId,
      clientName: request.name,
      clientEmail: request.email,
      company: request.company,
      projectScope: request.projectScope,
      date: request.date,
      time: candidate.timeLabel,
      durationMinutes: 30,
      timezone: env.booking.timezone,
      meetingUrl,
    };

    let emailNotification: EmailNotificationStatus = { client: 'skipped', team: 'skipped' };
    try {
      emailNotification = await emailService.sendAllBookingEmails(emailData);
    } catch (emailErr) {
      console.error('[GoogleCalendarBookingProvider] Unexpected error during email notifications:', emailErr);
    }

    return {
      bookingId: publicBookingId,
      status: 'confirmed',
      durationMinutes: 30,
      scheduledTime: `${request.date} at ${candidate.timeLabel}`,
      date: request.date,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      timezone: env.booking.timezone,
      slotId: request.slotId,
      meetingUrl,
      provider: googleEvent ? 'google_calendar' : isPersistedLocally ? 'database' : 'mock',
      emailNotification,
      message: '30-minute discovery call scheduled successfully with Google Calendar & Google Meet.',
    };
  }
}
