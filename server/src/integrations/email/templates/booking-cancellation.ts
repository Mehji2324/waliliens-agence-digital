import type { BookingEmailData } from '../email.types';
import { escapeHtml } from './booking-confirmation';

export interface BookingCancellationData extends BookingEmailData {
  reason?: string;
}

export function renderClientCancellationEmail(data: BookingCancellationData): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(data.clientName);
  const safeDate = escapeHtml(data.date);
  const safeTime = escapeHtml(data.time);
  const safeTimezone = escapeHtml(data.timezone);
  const safeBookingId = escapeHtml(data.bookingId);
  const safeReason = data.reason ? escapeHtml(data.reason) : 'Administrative schedule adjustment';

  const subject = 'Your Waliliens Discovery Call Has Been Cancelled';

  const text = `
WALILIENS STUDIO
Discovery Session Cancellation Notice
────────────────────────────────────────────────────

Hi ${data.clientName},

Your scheduled 30-minute discovery consultation on ${data.date} at ${data.time} (${data.timezone}) has been cancelled.

CANCELLATION DETAILS:
• Booking ID:   ${data.bookingId}
• Original Time: ${data.date} at ${data.time} (${data.timezone})
• Reason / Note: ${data.reason || 'Administrative schedule adjustment'}

If you would like to reschedule or book a new time slot that works better for your schedule, please visit:
https://waliliens.com/booking

────────────────────────────────────────────────────
Waliliens — Digital experiences engineered with precision.
https://waliliens.com
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F3F4F6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0B0F19; border: 1px solid #1F2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: left; border-bottom: 1px solid #1F2937; background: linear-gradient(180deg, #1F1212 0%, #0B0F19 100%);">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #F43F5E; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                ● SESSION NOTICE // CANCELLED
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                Discovery Call Cancelled
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #D1D5DB;">
                Hi <strong style="color: #FFFFFF;">${safeName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #9CA3AF;">
                Your scheduled 30-minute discovery call has been cancelled in our calendar.
              </p>

              <!-- Cancellation Card -->
              <table role="presentation" width="100%" style="background-color: #030712; border: 1px solid #1F2937; border-radius: 14px; margin-bottom: 28px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; width: 35%; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">
                    BOOKING ID
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-size: 13px; font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #8B5CF6;">
                    ${safeBookingId}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">
                    ORIGINAL TIME
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-size: 14px; color: #F3F4F6; text-decoration: line-through;">
                    ${safeDate} at ${safeTime} (${safeTimezone})
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">
                    NOTE / REASON
                  </td>
                  <td style="padding: 14px 18px; font-size: 13px; color: #D1D5DB;">
                    ${safeReason}
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #9CA3AF; text-align: center;">
                Would you like to choose a different date or time that fits your calendar?
              </p>

              <!-- Rebook CTA -->
              <table role="presentation" width="100%" style="margin: 0 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="https://waliliens.com/booking" target="_blank" style="display: inline-block; background: #374151; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 9999px; letter-spacing: 0.5px;">
                      SCHEDULE A NEW CALL
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #030712; border-top: 1px solid #1F2937; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #FFFFFF; letter-spacing: 1px;">
                WALILIENS STUDIO
              </p>
              <p style="margin: 0; font-size: 11px; color: #6B7280;">
                Digital products & AI experiences engineered with precision.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, html, text };
}

export function renderTeamCancellationNotification(data: BookingCancellationData): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(data.clientName);
  const safeEmail = escapeHtml(data.clientEmail);
  const safeDate = escapeHtml(data.date);
  const safeTime = escapeHtml(data.time);
  const safeTimezone = escapeHtml(data.timezone);
  const safeBookingId = escapeHtml(data.bookingId);

  const subject = `Booking Cancelled — ${safeName} (${safeBookingId})`;

  const text = `
BOOKING CANCELLED
Waliliens Operations Notice
────────────────────────────────────────────────────

Booking [${data.bookingId}] with ${data.clientName} (${data.clientEmail}) has been cancelled.

Originally scheduled: ${data.date} at ${data.time} (${data.timezone}).
Calendar event has been removed from Google Calendar.
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #F3F4F6;">
  <div style="padding: 30px 15px; max-width: 580px; margin: 0 auto; background: #0B0F19; border: 1px solid #1F2937; border-radius: 16px;">
    <h2 style="color: #F43F5E; margin-top: 0;">● Booking Cancelled</h2>
    <p style="color: #D1D5DB;">Booking <strong>${safeBookingId}</strong> for <strong>${safeName}</strong> (<a href="mailto:${safeEmail}" style="color: #00F0FF;">${safeEmail}</a>) was cancelled.</p>
    <p style="color: #9CA3AF;">Original slot: ${safeDate} at ${safeTime} (${safeTimezone})</p>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
}
