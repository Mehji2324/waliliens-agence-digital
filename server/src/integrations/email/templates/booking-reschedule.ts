import type { BookingEmailData } from '../email.types';
import { escapeHtml } from './booking-confirmation';

export interface BookingRescheduleData extends BookingEmailData {
  previousDate?: string;
  previousTime?: string;
}

export function renderClientRescheduleEmail(data: BookingRescheduleData): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(data.clientName);
  const safeDate = escapeHtml(data.date);
  const safeTime = escapeHtml(data.time);
  const safeTimezone = escapeHtml(data.timezone);
  const safeBookingId = escapeHtml(data.bookingId);
  const safePrevDate = data.previousDate ? escapeHtml(data.previousDate) : '';
  const safePrevTime = data.previousTime ? escapeHtml(data.previousTime) : '';
  const safeMeetingUrl = data.meetingUrl;

  const subject = 'Your Waliliens Discovery Call Has Been Rescheduled';

  const text = `
WALILIENS STUDIO
Discovery Session Rescheduled
────────────────────────────────────────────────────

Hi ${data.clientName},

Your 30-minute discovery call with Waliliens has been rescheduled to a new date and time.

NEW SCHEDULE:
• New Date:     ${data.date}
• New Time:     ${data.time} (${data.timezone})
• Duration:     30 Minutes
• Booking ID:   ${data.bookingId}
${data.previousDate ? `• Previous:     ${data.previousDate} at ${data.previousTime}\n` : ''}
GOOGLE MEET LINK:
${data.meetingUrl}

Your Google Calendar invitation has been updated automatically.

We look forward to speaking with you.

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
            <td style="padding: 36px 36px 20px 36px; text-align: left; border-bottom: 1px solid #1F2937; background: linear-gradient(180deg, #111827 0%, #0B0F19 100%);">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #00F0FF; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                ▲ WALILIENS STUDIO // SCHEDULE UPDATE
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                Call Rescheduled
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #D1D5DB;">
                Hi <strong style="color: #FFFFFF;">${safeName}</strong>,
              </p>
              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.6; color: #9CA3AF;">
                Your discovery call has been rescheduled. Your Google Calendar invitation has been updated automatically with the new meeting slot.
              </p>

              <!-- Session Credentials Card -->
              <table role="presentation" width="100%" style="background-color: #030712; border: 1px solid #1F2937; border-radius: 14px; margin-bottom: 28px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; width: 35%; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    NEW DATE
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-size: 14px; font-weight: 700; color: #00F0FF;">
                    ${safeDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    NEW TIME
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-size: 14px; font-weight: 700; color: #FFFFFF;">
                    ${safeTime} <span style="font-size: 12px; color: #9CA3AF; font-weight: 400;">(${safeTimezone})</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    DURATION
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-size: 14px; color: #E5E7EB;">
                    30 Minutes
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    BOOKING ID
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #8B5CF6; font-weight: 700;">
                    ${safeBookingId}
                  </td>
                </tr>
                ${
                  safePrevDate
                    ? `<tr>
                  <td style="padding: 16px 20px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    PREVIOUS TIME
                  </td>
                  <td style="padding: 16px 20px; font-size: 13px; color: #9CA3AF; text-decoration: line-through;">
                    ${safePrevDate} at ${safePrevTime}
                  </td>
                </tr>`
                    : ''
                }
              </table>

              <!-- Google Meet Action Button -->
              <table role="presentation" width="100%" style="margin: 32px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${safeMeetingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #00F0FF 0%, #00A3FF 100%); color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 9999px; letter-spacing: 0.5px; box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);">
                      JOIN GOOGLE MEET
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <a href="${safeMeetingUrl}" style="color: #6B7280; font-size: 12px; word-break: break-all; text-decoration: underline;">
                      ${safeMeetingUrl}
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

export function renderTeamRescheduleNotification(data: BookingRescheduleData): {
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
  const safeMeetingUrl = data.meetingUrl;

  const subject = `Booking Rescheduled — ${safeName} (${safeBookingId})`;

  const text = `
BOOKING RESCHEDULED
Waliliens Operations Notice
────────────────────────────────────────────────────

Booking [${data.bookingId}] with ${data.clientName} (${data.clientEmail}) has been rescheduled.

NEW TIME: ${data.date} at ${data.time} (${data.timezone})
MEETING: ${data.meetingUrl}
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
    <h2 style="color: #00F0FF; margin-top: 0;">● Booking Rescheduled</h2>
    <p style="color: #D1D5DB;">Booking <strong>${safeBookingId}</strong> for <strong>${safeName}</strong> (<a href="mailto:${safeEmail}" style="color: #00F0FF;">${safeEmail}</a>) was rescheduled.</p>
    <p style="color: #10B981; font-weight: bold;">New Time: ${safeDate} at ${safeTime} (${safeTimezone})</p>
    <p><a href="${safeMeetingUrl}" style="color: #8B5CF6;">Join Google Meet</a></p>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
}
