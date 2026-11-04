import { emailClient, EmailClient } from './email.client';
import { env } from '../../config/env';
import type { BookingEmailData, SendEmailResult, EmailNotificationStatus } from './email.types';
import { renderBookingConfirmationEmail } from './templates/booking-confirmation';
import { renderBookingNotificationEmail } from './templates/booking-notification';
import {
  renderClientCancellationEmail,
  renderTeamCancellationNotification,
  type BookingCancellationData,
} from './templates/booking-cancellation';
import {
  renderClientRescheduleEmail,
  renderTeamRescheduleNotification,
  type BookingRescheduleData,
} from './templates/booking-reschedule';
import { logger } from '../../utils/logger';

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
        logger.info({ bookingId: data.bookingId, clientEmail: data.clientEmail }, '[EMAIL] Booking confirmation sent');
      } else if (!result.success) {
        logger.warn({ bookingId: data.bookingId, error: result.error }, '[EMAIL] Failed to send client confirmation');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err, bookingId: data.bookingId }, '[EMAIL] Failed to send client confirmation');
      return { success: false, error: message };
    }
  }

  public async sendBookingNotification(data: BookingEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = renderBookingNotificationEmail(data);

    try {
      const recipient = env.email.notificationRecipient || 'waliliens.ai@gmail.com';
      const result = await this.client.send({
        to: recipient,
        subject,
        html,
        text,
        replyTo: data.clientEmail,
      });

      if (result.success && !result.skipped) {
        logger.info({ bookingId: data.bookingId, recipient }, '[EMAIL] Internal notification sent');
      } else if (!result.success) {
        logger.warn({ bookingId: data.bookingId, error: result.error }, '[EMAIL] Failed to send internal notification');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err, bookingId: data.bookingId }, '[EMAIL] Failed to send internal notification');
      return { success: false, error: message };
    }
  }

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

    return { client: clientStatus, team: teamStatus };
  }

  public async sendBookingCancellation(data: BookingCancellationData): Promise<SendEmailResult> {
    const { subject, html, text } = renderClientCancellationEmail(data);

    try {
      const result = await this.client.send({
        to: data.clientEmail,
        subject,
        html,
        text,
        replyTo: env.email.notificationRecipient,
      });

      if (result.success && !result.skipped) {
        logger.info({ bookingId: data.bookingId, clientEmail: data.clientEmail }, '[EMAIL] Cancellation email sent');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err, bookingId: data.bookingId }, '[EMAIL] Failed to send cancellation email');
      return { success: false, error: message };
    }
  }

  public async sendTeamCancellation(data: BookingCancellationData): Promise<SendEmailResult> {
    const { subject, html, text } = renderTeamCancellationNotification(data);

    try {
      const recipient = env.email.notificationRecipient || 'waliliens.ai@gmail.com';
      const result = await this.client.send({
        to: recipient,
        subject,
        html,
        text,
        replyTo: data.clientEmail,
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err, bookingId: data.bookingId }, '[EMAIL] Failed to send team cancellation');
      return { success: false, error: message };
    }
  }

  public async sendAllCancellationEmails(data: BookingCancellationData): Promise<EmailNotificationStatus> {
    const [clientRes, teamRes] = await Promise.allSettled([
      this.sendBookingCancellation(data),
      this.sendTeamCancellation(data),
    ]);

    let clientStatus: EmailNotificationStatus['client'] = 'failed';
    if (clientRes.status === 'fulfilled') {
      clientStatus = clientRes.value.skipped ? 'skipped' : clientRes.value.success ? 'sent' : 'failed';
    }

    let teamStatus: EmailNotificationStatus['team'] = 'failed';
    if (teamRes.status === 'fulfilled') {
      teamStatus = teamRes.value.skipped ? 'skipped' : teamRes.value.success ? 'sent' : 'failed';
    }

    return { client: clientStatus, team: teamStatus };
  }

  public async sendBookingReschedule(data: BookingRescheduleData): Promise<SendEmailResult> {
    const { subject, html, text } = renderClientRescheduleEmail(data);

    try {
      const result = await this.client.send({
        to: data.clientEmail,
        subject,
        html,
        text,
        replyTo: env.email.notificationRecipient,
      });

      if (result.success && !result.skipped) {
        logger.info({ bookingId: data.bookingId, clientEmail: data.clientEmail }, '[EMAIL] Reschedule email sent');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err, bookingId: data.bookingId }, '[EMAIL] Failed to send reschedule email');
      return { success: false, error: message };
    }
  }

  public async sendTeamReschedule(data: BookingRescheduleData): Promise<SendEmailResult> {
    const { subject, html, text } = renderTeamRescheduleNotification(data);

    try {
      const recipient = env.email.notificationRecipient || 'waliliens.ai@gmail.com';
      const result = await this.client.send({
        to: recipient,
        subject,
        html,
        text,
        replyTo: data.clientEmail,
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err, bookingId: data.bookingId }, '[EMAIL] Failed to send team reschedule');
      return { success: false, error: message };
    }
  }

  public async sendAllRescheduleEmails(data: BookingRescheduleData): Promise<EmailNotificationStatus> {
    const [clientRes, teamRes] = await Promise.allSettled([
      this.sendBookingReschedule(data),
      this.sendTeamReschedule(data),
    ]);

    let clientStatus: EmailNotificationStatus['client'] = 'failed';
    if (clientRes.status === 'fulfilled') {
      clientStatus = clientRes.value.skipped ? 'skipped' : clientRes.value.success ? 'sent' : 'failed';
    }

    let teamStatus: EmailNotificationStatus['team'] = 'failed';
    if (teamRes.status === 'fulfilled') {
      teamStatus = teamRes.value.skipped ? 'skipped' : teamRes.value.success ? 'sent' : 'failed';
    }

    return { client: clientStatus, team: teamStatus };
  }
}

export const emailService = new EmailService();
