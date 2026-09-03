import type { BookingEmailData } from '../email.types';
import { escapeHtml } from './booking-confirmation';

export function renderBookingNotificationEmail(data: BookingEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(data.clientName);
  const safeEmail = escapeHtml(data.clientEmail);
  const safeCompany = data.company ? escapeHtml(data.company) : 'Not Specified';
  const safeScope = data.projectScope ? escapeHtml(data.projectScope) : 'General architectural consultation';
  const safeBookingId = escapeHtml(data.bookingId);
  const safeDate = escapeHtml(data.date);
  const safeTime = escapeHtml(data.time);
  const safeTimezone = escapeHtml(data.timezone);
  const safeMeetingUrl = data.meetingUrl;

  const subject = `New Discovery Call Booking — ${safeName}`;

  const text = `
NEW DISCOVERY CALL BOOKED
Waliliens Terminal Notification
────────────────────────────────────────────────────

A new consultation has been booked on the platform.

CLIENT INFORMATION:
• Name:         ${data.clientName}
• Email:        ${data.clientEmail}
• Company:      ${data.company || 'Not Specified'}
• Booking ID:   ${data.bookingId}

SCHEDULE:
• Date:         ${data.date}
• Time:         ${data.time} (${data.timezone})
• Duration:     ${data.durationMinutes} Minutes

PROJECT SCOPE:
${data.projectScope || 'General consultation & technical architecture discussion.'}

GOOGLE MEET LINK:
${data.meetingUrl}

────────────────────────────────────────────────────
Waliliens Studio Operations
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
            <td style="padding: 32px 36px 20px 36px; text-align: left; border-bottom: 1px solid #1F2937; background: linear-gradient(180deg, #18181B 0%, #0B0F19 100%);">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #10B981; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                ● INTERNAL NOTIFICATION // NEW BOOKING
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                Discovery Call with ${safeName}
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 36px;">
              
              <!-- Client & Booking Card -->
              <table role="presentation" width="100%" style="background-color: #030712; border: 1px solid #1F2937; border-radius: 14px; margin-bottom: 24px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; width: 35%; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">
                    CLIENT NAME
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-size: 14px; font-weight: 700; color: #FFFFFF;">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">
                    EMAIL
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-size: 14px; color: #00F0FF;">
                    <a href="mailto:${safeEmail}" style="color: #00F0FF; text-decoration: none;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">
                    COMPANY
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-size: 14px; color: #E5E7EB;">
                    ${safeCompany}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">
                    SCHEDULED TIME
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-size: 14px; font-weight: 700; color: #10B981;">
                    ${safeDate} at ${safeTime} (${safeTimezone})
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase;">
                    BOOKING ID
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #8B5CF6; font-weight: 700;">
                    ${safeBookingId}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; vertical-align: top;">
                    PROJECT SCOPE
                  </td>
                  <td style="padding: 14px 18px; font-size: 13px; color: #D1D5DB; line-height: 1.5;">
                    ${safeScope}
                  </td>
                </tr>
              </table>

              <!-- Google Meet CTA -->
              <table role="presentation" width="100%" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${safeMeetingUrl}" target="_blank" style="display: inline-block; background: #10B981; color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 9999px; letter-spacing: 0.5px;">
                      OPEN GOOGLE MEET
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
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
            <td style="padding: 20px 36px; background-color: #030712; border-top: 1px solid #1F2937; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6B7280;">
                Waliliens Studio Operations & Automated Dispatch
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
