import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { AdminService } from './admin.service';
import { bookingsRepository } from '../repositories/bookings.repository';
import { contactsRepository } from '../repositories/contacts.repository';
import { emailService } from '../integrations/email/email.service';
import { GoogleCalendarBookingProvider } from '../integrations/google-calendar/google-calendar.provider';
import { UnauthorizedError, ConflictError } from '../utils/http-errors';

describe('Phase 7: Admin Service & Booking Management', () => {
  let adminService: AdminService;
  let mockCalendarProvider: {
    cancelEvent: ReturnType<typeof vi.fn>;
    updateCalendarEvent: ReturnType<typeof vi.fn>;
    getAvailableSlots: ReturnType<typeof vi.fn>;
    generateCandidateSlots: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCalendarProvider = {
      cancelEvent: vi.fn().mockResolvedValue(undefined),
      updateCalendarEvent: vi.fn().mockResolvedValue({ eventId: 'g-event-1', meetingUrl: 'https://meet.google.com/new-meet' }),
      getAvailableSlots: vi.fn(),
      generateCandidateSlots: vi.fn(),
    };

    adminService = new AdminService(mockCalendarProvider as unknown as GoogleCalendarBookingProvider);
  });

  describe('Admin Authentication', () => {
    it('authenticates admin with valid credentials and returns JWT token', async () => {
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const res = await adminService.login('admin@waliliens.com', 'WaliliensAdmin2026!');
      expect(res.token).toBeDefined();
      expect(typeof res.token).toBe('string');
      expect(res.email).toBe('admin@waliliens.com');
      expect(res.expiresInHours).toBe(24);
    });

    it('rejects invalid email with UnauthorizedError', async () => {
      await expect(
        adminService.login('hacker@unknown.com', 'somePassword')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('rejects invalid password with UnauthorizedError', async () => {
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        adminService.login('admin@waliliens.com', 'wrongPassword')
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Booking Cancellation Workflow', () => {
    const activeBooking = {
      id: 'bk-db-1',
      bookingId: 'BK_ABC123',
      slotId: '2026-10-25-slot-1',
      date: '2026-10-25',
      startTime: '10:00',
      endTime: '10:30',
      durationMinutes: 30,
      name: 'John Connor',
      email: 'john@resistance.io',
      company: 'Tech Resistance',
      projectScope: 'Defense AI architecture',
      timezone: 'Africa/Casablanca',
      status: 'confirmed' as const,
      googleEventId: 'ge_12345',
      googleCalendarId: 'primary',
      meetingUrl: 'https://meet.google.com/test-meet',
      notes: null,
      cancelledAt: null,
      rescheduledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('cancels active booking, removes Google Calendar event, and sends cancellation emails', async () => {
      vi.spyOn(bookingsRepository, 'findByIdOrBookingId').mockResolvedValue(activeBooking);
      vi.spyOn(bookingsRepository, 'updateBookingStatus').mockResolvedValue({
        ...activeBooking,
        status: 'cancelled',
        cancelledAt: new Date(),
      });
      const emailSpy = vi.spyOn(emailService, 'sendAllCancellationEmails').mockResolvedValue({
        client: 'sent',
        team: 'sent',
      });

      const result = await adminService.cancelBooking('BK_ABC123', {
        reason: 'Client requested postponement',
        adminEmail: 'admin@waliliens.com',
      });

      expect(result.status).toBe('cancelled');
      expect(mockCalendarProvider.cancelEvent).toHaveBeenCalledWith('ge_12345');
      expect(emailSpy).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictError when attempting to cancel an already cancelled booking', async () => {
      vi.spyOn(bookingsRepository, 'findByIdOrBookingId').mockResolvedValue({
        ...activeBooking,
        status: 'cancelled',
      });

      await expect(
        adminService.cancelBooking('BK_ABC123', { adminEmail: 'admin@waliliens.com' })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('Booking Rescheduling Workflow', () => {
    const activeBooking = {
      id: 'bk-db-2',
      bookingId: 'BK_XYZ789',
      slotId: '2026-10-25-slot-1',
      date: '2026-10-25',
      startTime: '10:00',
      endTime: '10:30',
      durationMinutes: 30,
      name: 'Marcus Wright',
      email: 'marcus@skynet.com',
      company: 'Cyberdyne Systems',
      projectScope: 'Cyborg UI & WebGL',
      timezone: 'Africa/Casablanca',
      status: 'confirmed' as const,
      googleEventId: 'ge_99999',
      googleCalendarId: 'primary',
      meetingUrl: 'https://meet.google.com/old-meet',
      notes: null,
      cancelledAt: null,
      rescheduledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('reschedules booking to an available slot, updates Google Calendar, and sends reschedule emails', async () => {
      vi.spyOn(bookingsRepository, 'findByIdOrBookingId').mockResolvedValue(activeBooking);

      mockCalendarProvider.getAvailableSlots.mockResolvedValue([
        { id: '2026-10-26-slot-3', date: '2026-10-26', time: '11:00 AM Casablanca', available: true },
      ]);

      mockCalendarProvider.generateCandidateSlots.mockReturnValue([
        {
          slotId: '2026-10-26-slot-3',
          date: '2026-10-26',
          timeLabel: '11:00 AM Casablanca',
          startTime: '11:00',
          endTime: '11:30',
          startIso: '2026-10-26T11:00:00.000Z',
          endIso: '2026-10-26T11:30:00.000Z',
        },
      ]);

      vi.spyOn(bookingsRepository, 'rescheduleBooking').mockResolvedValue({
        ...activeBooking,
        slotId: '2026-10-26-slot-3',
        date: '2026-10-26',
        startTime: '11:00',
        endTime: '11:30',
        rescheduledAt: new Date(),
      });

      const emailSpy = vi.spyOn(emailService, 'sendAllRescheduleEmails').mockResolvedValue({
        client: 'sent',
        team: 'sent',
      });

      const result = await adminService.rescheduleBooking('BK_XYZ789', {
        newDate: '2026-10-26',
        newSlotId: '2026-10-26-slot-3',
        adminEmail: 'admin@waliliens.com',
      });

      expect(result.date).toBe('2026-10-26');
      expect(result.startTime).toBe('11:00');
      expect(mockCalendarProvider.updateCalendarEvent).toHaveBeenCalledTimes(1);
      expect(emailSpy).toHaveBeenCalledTimes(1);
    });

    it('rejects rescheduling to an unavailable or busy slot', async () => {
      vi.spyOn(bookingsRepository, 'findByIdOrBookingId').mockResolvedValue(activeBooking);

      mockCalendarProvider.getAvailableSlots.mockResolvedValue([
        { id: '2026-10-26-slot-3', date: '2026-10-26', time: '11:00 AM Casablanca', available: false },
      ]);

      await expect(
        adminService.rescheduleBooking('BK_XYZ789', {
          newDate: '2026-10-26',
          newSlotId: '2026-10-26-slot-3',
          adminEmail: 'admin@waliliens.com',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('Contacts Management & Metrics', () => {
    it('updates contact submission status to processed', async () => {
      vi.spyOn(contactsRepository, 'updateStatus').mockResolvedValue({
        id: 'c-1',
        name: 'Sarah',
        email: 'sarah@test.com',
        company: 'Test Co',
        budget: '$10k-$20k',
        timeline: '1 Month',
        services: ['Branding'],
        message: 'Need design work',
        status: 'processed',
        notes: 'Called client',
        receivedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await adminService.updateContactStatus('c-1', 'processed', {
        notes: 'Called client',
        adminEmail: 'admin@waliliens.com',
      });

      expect(res.status).toBe('processed');
    });

    it('aggregates dashboard metrics correctly', async () => {
      vi.spyOn(bookingsRepository, 'getAdminStats').mockResolvedValue({
        totalBookings: 10,
        confirmedBookings: 7,
        cancelledBookings: 2,
        completedBookings: 1,
        upcomingCalls: 4,
        todayCalls: 2,
        thisWeekCalls: 5,
      });

      vi.spyOn(bookingsRepository, 'findAllPaginated').mockResolvedValue({
        bookings: [],
        total: 0,
        page: 1,
        limit: 8,
        totalPages: 1,
      });

      vi.spyOn(contactsRepository, 'findAllPaginated').mockResolvedValue({
        contacts: [],
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 1,
      });

      const dashboard = await adminService.getDashboardData();
      expect(dashboard.stats.totalBookings).toBe(10);
      expect(dashboard.stats.confirmedBookings).toBe(7);
      expect(dashboard.stats.cancelledBookings).toBe(2);
      expect(dashboard.stats.upcomingCalls).toBe(4);
    });
  });
});
