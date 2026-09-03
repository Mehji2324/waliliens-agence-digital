# Email Notifications & Calendar Confirmation Setup (Resend)

This guide walks through configuring transactional email confirmations and internal booking notifications for the Waliliens studio booking engine using **Resend**.

---

## 1. Create a Resend Account

1. Navigate to [https://resend.com](https://resend.com) and create an account.
2. Complete your organization setup.

---

## 2. Generate an API Key

1. Go to **API Keys** in your Resend Dashboard.
2. Click **Create API Key**.
3. Set **Name:** `Waliliens Server`.
4. Set **Permission:** `Full Access` (or `Sending Access`).
5. Copy the generated key (`re_xxxxxxxxxxxxxxxxxxxx`).

---

## 3. Verify Sending Domain

1. In the Resend Dashboard, navigate to **Domains**.
2. Click **Add Domain** and enter your custom domain (e.g. `waliliens.com`).
3. Add the provided DNS records (DKIM, SPF, MX) to your domain registrar (e.g., Cloudflare, Namecheap).
4. Once verified, you can send from addresses such as `hello@waliliens.com` or `bookings@waliliens.com`.

> **Testing without a domain:** During initial sandbox testing, you can use Resend's default onboarding address `onboarding@resend.dev` to send test emails to your registered account email.

---

## 4. Configure Environment Variables

Update `server/.env` with your email settings:

```env
# Email Notifications (Phase 6 - Resend)
EMAIL_ENABLED=true
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Waliliens Studio <hello@waliliens.com>
BOOKING_NOTIFICATION_EMAIL=team@waliliens.com
```

### Environment Variable Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `EMAIL_ENABLED` | Toggle email dispatch (`true` / `false`). In development, setting `false` skips delivery cleanly. | `false` |
| `RESEND_API_KEY` | Your secret Resend API key. Server-side only. | `re_xxxx...` |
| `EMAIL_FROM` | Sender display name and verified email address. | `Waliliens <hello@yourdomain.com>` |
| `BOOKING_NOTIFICATION_EMAIL` | Internal team mailbox where new booking alerts are sent. | `team@yourdomain.com` |

---

## 5. Development Mode & Safe Disabling

When developing locally without live Resend credentials:
```env
EMAIL_ENABLED=false
```
The application will:
- Process bookings normally.
- Generate Google Calendar events and authentic Google Meet links.
- Persist bookings into PostgreSQL.
- Log `[EMAIL] Delivery skipped (EMAIL_ENABLED=false)` without throwing any errors or interrupting the user flow.

---

## 6. Email Delivery Architecture

Upon a successful booking reservation (`POST /api/booking/reserve`):
1. **Client Confirmation**:
   - Sent to the client's email address.
   - Includes full session schedule, 30-minute duration, timezone, booking ID, client details, and a high-visibility "Join Google Meet" CTA button.
   - Formatted in both responsive HTML and fallback plain text with HTML character escaping.
2. **Internal Team Notification**:
   - Sent to `BOOKING_NOTIFICATION_EMAIL`.
   - Contains client contact info, submitted project brief/scope, booking ID, and direct meeting link.
3. **Resilience**:
   - Dispatched in parallel via `Promise.allSettled`.
   - An email delivery issue (e.g., recipient inbox full or network error) is logged on the server and will **never** roll back or invalidate a confirmed booking.
