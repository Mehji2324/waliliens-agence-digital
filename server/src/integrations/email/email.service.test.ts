import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from './email.service';
import { EmailClient } from './email.client';
import { renderBookingConfirmationEmail, escapeHtml } from './templates/booking-confirmation';
import { renderBookingNotificationEmail } from './templates/booking-notification';
import type { BookingEmailData } from './email.types';
import type { Resend } from 'resend';

describe('Phase 6: Email Integration & Notification System', () => {
  const sampleBooking: BookingEmailData = {
    bookingId: 'BK_TEST999',
    clientName: 'Sarah Connor',
    clientEmail: 'sarah@cyberdyne.io',
    company: 'Cyberdyne Systems',
    projectScope: 'Neural network defense UI & WebGL interface',
    date: '2026-10-25',
    time: '10:00 AM Casablanca',
    durationMinutes: 30,
    timezone: 'Africa/Casablanca',
    meetingUrl: 'https://meet.google.com/xyz-uvwx-rst',
  };

  describe('HTML Sanitization & Template Rendering', () => {
    it('escapes dangerous HTML characters in client-supplied inputs', () => {
      const maliciousInput = '<script>alert("xss")</script> & "quotes" \'single\'';
      const sanitized = escapeHtml(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
      expect(sanitized).toContain('&#039;');
    });

    it('renders client confirmation email with complete session details and Google Meet CTA', () => {
      const { subject, html, text } = renderBookingConfirmationEmail(sampleBooking);

      expect(subject).toBe('Your Waliliens Discovery Call is Confirmed');
      expect(html).toContain('Sarah Connor');
      expect(html).toContain('2026-10-25');
      expect(html).toContain('Cyberdyne Systems');
      expect(html).toContain('30 Minutes');
      expect(html).toContain('BK_TEST999');
      expect(html).toContain('https://meet.google.com/xyz-uvwx-rst');
      expect(html).toContain('JOIN GOOGLE MEET');
      expect(text).toContain('https://meet.google.com/xyz-uvwx-rst');
    });

    it('renders internal team notification email with client data and scope', () => {
      const { subject, html, text } = renderBookingNotificationEmail(sampleBooking);

      expect(subject).toBe('New Discovery Call Booking — Sarah Connor');
      expect(html).toContain('sarah@cyberdyne.io');
      expect(html).toContain('Cyberdyne Systems');
      expect(html).toContain('Neural network defense UI &amp; WebGL interface');
      expect(html).toContain('BK_TEST999');
      expect(html).toContain('https://meet.google.com/xyz-uvwx-rst');
      expect(text).toContain('sarah@cyberdyne.io');
    });
  });

  describe('EmailClient & Disabled Mode', () => {
    it('skips email delivery gracefully when disabled without throwing', async () => {
      const client = new EmailClient();
      vi.spyOn(client, 'isEnabled').mockReturnValue(false);

      const result = await client.send({
        to: 'sarah@cyberdyne.io',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test',
      });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
    });

    it('handles provider delivery errors gracefully', async () => {
      const mockResend = {
        emails: {
          send: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid API key or domain unverified' },
          }),
        },
      } as unknown as Resend;

      const client = new EmailClient(mockResend);
      const result = await client.send({
        to: 'sarah@cyberdyne.io',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key or domain unverified');
    });
  });

  describe('EmailService Dispatching', () => {
    let mockEmailClient: EmailClient;
    let emailService: EmailService;

    beforeEach(() => {
      mockEmailClient = new EmailClient();
      emailService = new EmailService(mockEmailClient);
    });

    it('dispatches client confirmation and internal notification successfully', async () => {
      vi.spyOn(mockEmailClient, 'send').mockResolvedValue({
        success: true,
        id: 'msg_resend_123',
      });

      const status = await emailService.sendAllBookingEmails(sampleBooking);
      expect(status.client).toBe('sent');
      expect(status.team).toBe('sent');
      expect(mockEmailClient.send).toHaveBeenCalledTimes(2);
    });

    it('handles partial email failures safely without throwing', async () => {
      vi.spyOn(mockEmailClient, 'send')
        .mockResolvedValueOnce({ success: true, id: 'msg_client_ok' })
        .mockResolvedValueOnce({ success: false, error: 'Internal mailbox full' });

      const status = await emailService.sendAllBookingEmails(sampleBooking);
      expect(status.client).toBe('sent');
      expect(status.team).toBe('failed');
    });
  });
});
