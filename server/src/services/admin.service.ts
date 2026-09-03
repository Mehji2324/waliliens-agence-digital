import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { bookingsRepository, type BookingFilterOptions, type PaginatedBookingsResult, type AdminBookingStats } from '../repositories/bookings.repository';
import { contactsRepository, type ContactFilterOptions, type PaginatedContactsResult } from '../repositories/contacts.repository';
import { adminAuditRepository } from '../repositories/admin-audit.repository';
import { GoogleCalendarBookingProvider } from '../integrations/google-calendar/google-calendar.provider';
import { emailService } from '../integrations/email/email.service';
import type { BookingCancellationData } from '../integrations/email/templates/booking-cancellation';
import type { BookingRescheduleData } from '../integrations/email/templates/booking-reschedule';
import { UnauthorizedError, NotFoundError, ConflictError, ValidationError } from '../utils/http-errors';
import type { SelectBooking, SelectContactSubmission } from '../db/schema';

export class AdminService {
  private calendarProvider: GoogleCalendarBookingProvider;

  constructor(calendarProvider?: GoogleCalendarBookingProvider) {
    this.calendarProvider = calendarProvider || new GoogleCalendarBookingProvider();
  }

  public setCalendarProvider(provider: GoogleCalendarBookingProvider): void {
    this.calendarProvider = provider;
  }

  /**
   * Authenticates admin user with bcrypt password verification and issues JWT session.
   */
  public async login(
    email: string,
    password: string,
    ipAddress?: string
  ): Promise<{ token: string; email: string; expiresInHours: number }> {
    const isEmailMatch = email.toLowerCase().trim() === env.admin.email.toLowerCase().trim();

    if (!isEmailMatch) {
      await adminAuditRepository.log({
        action: 'login_failed',
        targetType: 'auth',
        adminEmail: email,
        details: { reason: 'Email mismatch' },
        ipAddress,
      });
      throw new UnauthorizedError('Invalid admin email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, env.admin.passwordHash);
    if (!isPasswordValid) {
      await adminAuditRepository.log({
        action: 'login_failed',
        targetType: 'auth',
        adminEmail: email,
        details: { reason: 'Password mismatch' },
        ipAddress,
      });
      throw new UnauthorizedError('Invalid admin email or password.');
    }

    const token = jwt.sign(
      { sub: 'admin-primary', email: env.admin.email, role: 'admin' },
      env.admin.sessionSecret,
      { expiresIn: `${env.admin.tokenExpiryHours}h` }
    );

    await adminAuditRepository.log({
      action: 'login_success',
      targetType: 'auth',
      adminEmail: env.admin.email,
      ipAddress,
    });

    console.log(`[ADMIN AUTH] Admin session initiated for ${env.admin.email} (IP: ${ipAddress || 'unknown'})`);

    return {
      token,
      email: env.admin.email,
      expiresInHours: env.admin.tokenExpiryHours,
    };
  }

  /**
   * Returns paginated bookings with flexible searching and status filters.
   */
  public async getBookings(options: BookingFilterOptions): Promise<PaginatedBookingsResult> {
    return bookingsRepository.findAllPaginated(options);
  }

  /**
   * Returns full booking details by ID or Public Booking ID.
   */
  public async getBookingById(id: string): Promise<SelectBooking> {
    const booking = await bookingsRepository.findByIdOrBookingId(id);
    if (!booking) {
      throw new NotFoundError(`Booking "${id}" not found.`);
    }
    return booking;
  }

  /**
   * Cancels a booking, updates Google Calendar, notifies client & team via email, and logs audit record.
   */
  public async cancelBooking(
    id: string,
    params: { reason?: string; adminEmail: string; ipAddress?: string }
  ): Promise<SelectBooking> {
    const booking = await this.getBookingById(id);

    if (booking.status === 'cancelled') {
      throw new ConflictError(`Booking [${booking.bookingId}] is already cancelled.`);
    }

    // 1. Cancel Google Calendar event if it exists
    if (booking.googleEventId) {
      await this.calendarProvider.cancelEvent(booking.googleEventId);
    }

    // 2. Update local database status
    const cancelledAt = new Date();
    const updated = await bookingsRepository.updateBookingStatus(booking.id, 'cancelled', {
      cancelledAt,
      notes: params.reason ? `Cancelled by admin: ${params.reason}` : 'Cancelled by admin',
    });

    if (!updated) {
      throw new NotFoundError(`Failed to update booking "${id}".`);
    }

    // 3. Dispatch cancellation email notifications (client + internal team)
    const emailData: BookingCancellationData = {
      bookingId: booking.bookingId,
      clientName: booking.name,
      clientEmail: booking.email,
      company: booking.company || undefined,
      projectScope: booking.projectScope || undefined,
      date: booking.date,
      time: booking.startTime,
      durationMinutes: booking.durationMinutes,
      timezone: booking.timezone,
      meetingUrl: booking.meetingUrl || '',
      reason: params.reason,
    };

    try {
      await emailService.sendAllCancellationEmails(emailData);
    } catch (emailErr) {
      console.error(`[ADMIN] Unexpected error dispatching cancellation email for ${booking.bookingId}:`, emailErr);
    }

    // 4. Audit Log
    await adminAuditRepository.log({
      action: 'booking_cancelled',
      targetType: 'booking',
      targetId: booking.bookingId,
      adminEmail: params.adminEmail,
      details: { reason: params.reason || 'None provided' },
      ipAddress: params.ipAddress,
    });

    console.log(`[ADMIN] Cancelled booking [${booking.bookingId}] for ${booking.name} (${booking.email})`);
    return updated;
  }

  /**
   * Reschedules an existing booking to a new date and time slot.
   */
  public async rescheduleBooking(
    id: string,
    params: {
      newDate: string;
      newSlotId: string;
      adminEmail: string;
      ipAddress?: string;
    }
  ): Promise<SelectBooking> {
    const booking = await this.getBookingById(id);

    if (booking.status === 'cancelled') {
      throw new ConflictError(`Cannot reschedule a cancelled booking. Please create a new reservation.`);
    }

    // 1. Validate target date & time slot availability
    const availableSlots = await this.calendarProvider.getAvailableSlots(params.newDate);
    const targetSlot = availableSlots.find((s) => s.id === params.newSlotId);

    if (!targetSlot) {
      throw new NotFoundError(`Selected slot "${params.newSlotId}" does not exist on ${params.newDate}.`);
    }

    if (!targetSlot.available) {
      throw new ConflictError(`The selected time slot on ${params.newDate} (${targetSlot.time}) is not available.`);
    }

    const candidateSlots = this.calendarProvider.generateCandidateSlots(params.newDate);
    const candidate = candidateSlots.find((s) => s.slotId === params.newSlotId);
    if (!candidate) {
      throw new ValidationError(`Calculation error for slot ${params.newSlotId}`);
    }

    const previousDate = booking.date;
    const previousTime = booking.startTime;

    // 2. Update Google Calendar event (or recreate if needed)
    let meetingUrl = booking.meetingUrl || '';
    if (booking.googleEventId) {
      const gRes = await this.calendarProvider.updateCalendarEvent({
        eventId: booking.googleEventId,
        startIso: candidate.startIso,
        endIso: candidate.endIso,
        summary: `Waliliens — 30-Minute Discovery Call (${booking.name}) [RESCHEDULED]`,
      });
      if (gRes.meetingUrl) {
        meetingUrl = gRes.meetingUrl;
      }
    }

    // 3. Atomically update DB record
    const updated = await bookingsRepository.rescheduleBooking(booking.id, {
      slotId: params.newSlotId,
      date: params.newDate,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      meetingUrl,
      notes: `Rescheduled by admin from ${previousDate} ${previousTime} to ${params.newDate} ${candidate.startTime}`,
    });

    if (!updated) {
      throw new NotFoundError(`Failed to update booking "${id}".`);
    }

    // 4. Send Reschedule Emails (Client + Team)
    const emailData: BookingRescheduleData = {
      bookingId: booking.bookingId,
      clientName: booking.name,
      clientEmail: booking.email,
      company: booking.company || undefined,
      projectScope: booking.projectScope || undefined,
      date: params.newDate,
      time: candidate.timeLabel,
      durationMinutes: 30,
      timezone: booking.timezone,
      meetingUrl,
      previousDate,
      previousTime,
    };

    try {
      await emailService.sendAllRescheduleEmails(emailData);
    } catch (emailErr) {
      console.error(`[ADMIN] Unexpected error dispatching reschedule email for ${booking.bookingId}:`, emailErr);
    }

    // 5. Audit Log
    await adminAuditRepository.log({
      action: 'booking_rescheduled',
      targetType: 'booking',
      targetId: booking.bookingId,
      adminEmail: params.adminEmail,
      details: {
        from: `${previousDate} ${previousTime}`,
        to: `${params.newDate} ${candidate.startTime}`,
      },
      ipAddress: params.ipAddress,
    });

    console.log(`[ADMIN] Rescheduled booking [${booking.bookingId}] to ${params.newDate} at ${candidate.startTime}`);
    return updated;
  }

  /**
   * Returns paginated contact / brief submissions.
   */
  public async getContacts(options: ContactFilterOptions): Promise<PaginatedContactsResult> {
    return contactsRepository.findAllPaginated(options);
  }

  /**
   * Returns contact brief details.
   */
  public async getContactById(id: string): Promise<SelectContactSubmission> {
    const contact = await contactsRepository.findById(id);
    if (!contact) {
      throw new NotFoundError(`Contact submission "${id}" not found.`);
    }
    return contact;
  }

  /**
   * Updates contact brief status and notes.
   */
  public async updateContactStatus(
    id: string,
    status: 'new' | 'processed' | 'archived',
    params: { notes?: string; adminEmail: string; ipAddress?: string }
  ): Promise<SelectContactSubmission> {
    const updated = await contactsRepository.updateStatus(id, status, params.notes);
    if (!updated) {
      throw new NotFoundError(`Contact submission "${id}" not found.`);
    }

    await adminAuditRepository.log({
      action: 'contact_status_updated',
      targetType: 'contact',
      targetId: id,
      adminEmail: params.adminEmail,
      details: { newStatus: status, notes: params.notes },
      ipAddress: params.ipAddress,
    });

    return updated;
  }

  /**
   * Returns dashboard overview statistics and upcoming discovery calls.
   */
  public async getDashboardData(): Promise<{
    stats: AdminBookingStats;
    upcomingBookings: SelectBooking[];
    recentContacts: SelectContactSubmission[];
  }> {
    const stats = await bookingsRepository.getAdminStats();
    const bookingsRes = await bookingsRepository.findAllPaginated({
      status: 'confirmed',
      limit: 8,
    });
    const contactsRes = await contactsRepository.findAllPaginated({
      limit: 5,
    });

    return {
      stats,
      upcomingBookings: bookingsRes.bookings,
      recentContacts: contactsRes.contacts,
    };
  }
}

export const adminService = new AdminService();
