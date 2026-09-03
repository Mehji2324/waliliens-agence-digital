import { Resend } from 'resend';
import { env } from '../../config/env';
import type { SendEmailPayload, SendEmailResult } from './email.types';

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
      console.log(`[EMAIL] Delivery skipped (EMAIL_ENABLED=false) for recipient: ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to} — Subject: "${payload.subject}"`);
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
        console.error(`[EMAIL] Provider error delivering email to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}:`, response.error.message);
        return {
          success: false,
          error: response.error.message,
        };
      }

      const emailId = response.data?.id;
      console.log(`[EMAIL] Successfully dispatched email [${emailId}] to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`);
      return {
        success: true,
        id: emailId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown email dispatch error';
      console.error(`[EMAIL] Failed to dispatch email to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}:`, message);
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
