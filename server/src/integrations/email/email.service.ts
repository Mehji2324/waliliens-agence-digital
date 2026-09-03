import { emailClient, EmailClient } from './email.client';
import { env } from '../../config/env';
import type { BookingEmailData, SendEmailResult, EmailNotificationStatus } from './email.types';
import { renderBookingConfirmationEmail } from './templates/booking-confirmation';
import { renderBookingNotificationEmail } from './templates/booking-notification';

export class EmailService {
  private client: EmailClient;

  constructor(customClient?: EmailClient) {
    this.client = customClient || emailClient;
  }

  public setClient(client: EmailClient): void {
    this.client = client;
  }

  public async sendBookingConfirmation(data: BookingEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = renderBookingConfirmationEmail(data);

    try {
      const result = await this.client.send({
        to: data.clientEmail,
        subject,
        html,
        text,
        replyTo: env.email.notificationRecipient,
      });

      if (result.success && !result.skipped) {
        console.log(`[EMAIL] Booking confirmation sent: ${data.bookingId} -> ${data.clientEmail}`);
      } else if (!result.success) {
        console.warn(`[EMAIL] Failed to send client confirmation for ${data.bookingId}: ${result.error}`);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[EMAIL] Failed to send client confirmation for ${data.bookingId}:`, message);
      return { success: false, error: message };
    }
  }

  public async sendBookingNotification(data: BookingEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = renderBookingNotificationEmail(data);

    try {
      const recipient = env.email.notificationRecipient || 'hello@waliliens.com';
      const result = await this.client.send({
        to: recipient,
        subject,
        html,
        text,
        replyTo: data.clientEmail,
      });

      if (result.success && !result.skipped) {
        console.log(`[EMAIL] Internal notification sent: ${data.bookingId} -> ${recipient}`);
      } else if (!result.success) {
        console.warn(`[EMAIL] Failed to send internal notification for ${data.bookingId}: ${result.error}`);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[EMAIL] Failed to send internal notification for ${data.bookingId}:`, message);
      return { success: false, error: message };
    }
  }

  /**
   * Dispatches both client confirmation and internal notification in parallel.
   * Safe execution: errors in email dispatch are isolated and never disrupt the booking.
   */
  public async sendAllBookingEmails(data: BookingEmailData): Promise<EmailNotificationStatus> {
    const [clientRes, teamRes] = await Promise.allSettled([
      this.sendBookingConfirmation(data),
      this.sendBookingNotification(data),
    ]);

    let clientStatus: EmailNotificationStatus['client'] = 'failed';
    if (clientRes.status === 'fulfilled') {
      clientStatus = clientRes.value.skipped ? 'skipped' : clientRes.value.success ? 'sent' : 'failed';
    }

    let teamStatus: EmailNotificationStatus['team'] = 'failed';
    if (teamRes.status === 'fulfilled') {
      teamStatus = teamRes.value.skipped ? 'skipped' : teamRes.value.success ? 'sent' : 'failed';
    }

    return {
      client: clientStatus,
      team: teamStatus,
    };
  }
}

export const emailService = new EmailService();
