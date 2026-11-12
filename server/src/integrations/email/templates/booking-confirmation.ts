import type { BookingEmailData } from '../email.types';

export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderBookingConfirmationEmail(data: BookingEmailData, clientUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(data.clientName);
  const safeCompany = data.company ? escapeHtml(data.company) : '';
  const safeScope = data.projectScope ? escapeHtml(data.projectScope) : '';
  const safeBookingId = escapeHtml(data.bookingId);
  const safeDate = escapeHtml(data.date);
  const safeTime = escapeHtml(data.time);
  const safeTimezone = escapeHtml(data.timezone);
  const safeMeetingUrl = data.meetingUrl;
  const safeClientUrl = escapeHtml(clientUrl);

  const subject = 'Your Waliliens Discovery Call is Confirmed';

  const text = `
WALILIENS STUDIO
Discovery Session Confirmation
────────────────────────────────────────────────────

Hi ${data.clientName},

Your 30-minute discovery consultation with Waliliens has been confirmed.

SESSION DETAILS:
• Date:        ${data.date}
• Time:        ${data.time} (${data.timezone})
• Duration:    ${data.durationMinutes} Minutes
• Booking ID:  ${data.bookingId}
${data.company ? `• Company:     ${data.company}\n` : ''}${data.projectScope ? `• Scope:       ${data.projectScope}\n` : ''}
GOOGLE MEET LINK:
${data.meetingUrl}

A Google Calendar invitation with automatic calendar reminders has been sent to ${data.clientEmail}.

We look forward to discussing your technical architecture and design goals.

────────────────────────────────────────────────────
Waliliens — Digital experiences engineered with precision.
${clientUrl}
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
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0B0F19; border: 1px solid #1F2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: left; border-bottom: 1px solid #1F2937; background: linear-gradient(180deg, #111827 0%, #0B0F19 100%);">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #00F0FF; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                ▲ WALILIENS STUDIO // DISCOVERY SESSION
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                Discovery Call Confirmed
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
                Your 30-minute architectural strategy session with Waliliens senior partners has been reserved. A calendar invitation has also been sent to your email.
              </p>

              <!-- Session Credentials Card -->
              <table role="presentation" width="100%" style="background-color: #030712; border: 1px solid #1F2937; border-radius: 14px; margin-bottom: 28px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; width: 35%; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    DATE
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-size: 14px; font-weight: 700; color: #00F0FF;">
                    ${safeDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    TIME
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
                  safeCompany
                    ? `<tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                    COMPANY
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #111827; font-size: 14px; color: #E5E7EB;">
                    ${safeCompany}
                  </td>
                </tr>`
                    : ''
                }
                ${
                  safeScope
                    ? `<tr>
                  <td style="padding: 16px 20px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
                    PROJECT SCOPE
                  </td>
                  <td style="padding: 16px 20px; font-size: 13px; color: #D1D5DB; line-height: 1.5;">
                    ${safeScope}
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

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #9CA3AF; text-align: center;">
                Need to reschedule? Simply reply directly to this email or accept/decline your Google Calendar invitation.
              </p>
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
              <p style="margin: 8px 0 0; font-size: 11px;">
                <a href="${safeClientUrl}" style="color: #9CA3AF;">${safeClientUrl}</a>
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
