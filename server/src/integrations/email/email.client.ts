import { Resend } from 'resend';
import { env } from '../../config/env';
import type { SendEmailPayload, SendEmailResult } from './email.types';
import { logger } from '../../utils/logger';

let cachedResend: Resend | null = null;

export class EmailClient {
  private resendOverride: Resend | null = null;

  constructor(customResend?: Resend) {
    if (customResend) {
      this.resendOverride = customResend;
    }
  }

  public isEnabled(): boolean {
    if (this.resendOverride) return true;
    return env.email.enabled && Boolean(env.email.apiKey);
  }

  private getClient(): Resend {
    if (this.resendOverride) {
      return this.resendOverride;
    }

    if (!cachedResend) {
      if (!env.email.apiKey) {
        throw new Error('Resend API key is not configured.');
      }
      cachedResend = new Resend(env.email.apiKey);
    }

    return cachedResend;
  }

  public async send(payload: SendEmailPayload): Promise<SendEmailResult> {
    if (!this.isEnabled()) {
      logger.info({ recipient: payload.to, subject: payload.subject }, '[EMAIL] Delivery skipped (EMAIL_ENABLED=false)');
      return { success: true, skipped: true };
    }

    try {
      const client = this.getClient();
      const response = await client.emails.send({
        from: env.email.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo,
      });

      if (response.error) {
        logger.error({ recipient: payload.to, error: response.error.message }, '[EMAIL] Provider error delivering email');
        return {
          success: false,
          error: response.error.message,
        };
      }

      const emailId = response.data?.id;
      logger.info({ emailId, recipient: payload.to }, '[EMAIL] Successfully dispatched email');
      return {
        success: true,
        id: emailId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown email dispatch error';
      logger.error({ err, recipient: payload.to }, '[EMAIL] Failed to dispatch email');
      return {
        success: false,
        error: message,
      };
    }
  }

  public static reset(): void {
    cachedResend = null;
  }
}

export const emailClient = new EmailClient();
