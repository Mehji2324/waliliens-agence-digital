# Admin Dashboard & Booking Management Setup

This guide documents the architecture, configuration, and security workflows for the **Waliliens Studio Admin Portal**.

---

## 1. Generating an Admin Password Hash

Admin authentication uses **bcrypt** password hashing. Never store a plaintext password in `.env` or repository files.

### Generate a new bcrypt hash using Node.js / tsx:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourSecurePasswordHere!', 10).then(console.log);"
```
Copy the resulting hash (e.g., `$2b$10$wK52r1r7jVl0n5h5u1P4O...`).

---

## 2. Environment Configuration

Add the following variables to `server/.env`:

```env
# Admin Authentication & Studio Dashboard (Phase 7)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=$2b$10$wK52r1r7jVl0n5h5u1P4O.Wp6rL3o9f2z7m5y1v8x0t4u3q2s1a9e
SESSION_SECRET=your_super_secret_session_key_for_signing_jwt_cookies
```

### Environment Variable Reference

| Variable | Description | Default (Dev) |
| :--- | :--- | :--- |
| `ADMIN_EMAIL` | Authorized admin email address | `admin@waliliens.com` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | `WaliliensAdmin2026!` default hash |
| `SESSION_SECRET` | Secret key used to sign and verify JWT session tokens | Auto-fallback in dev |

---

## 3. Admin Authentication Flow

1. **Login (`POST /api/admin/login`)**:
   - Validates email and compares password against `ADMIN_PASSWORD_HASH` using `bcrypt.compare`.
   - Generates a signed JWT payload (`{ sub: 'admin-primary', email, role: 'admin' }`) with 24-hour expiration.
   - Sets an HTTP-only, secure, `SameSite=Lax` cookie named `walili_admin_session`.
   - Returns authentication payload for frontend state initialization.
   - Protected against brute force by an Express rate limiter (maximum 10 attempts per 15 minutes).
2. **Session Verification (`GET /api/admin/me`)**:
   - Validates the `walili_admin_session` cookie via `requireAdminAuth` middleware.
   - Unauthenticated requests receive HTTP `401 Unauthorized`.
3. **Logout (`POST /api/admin/logout`)**:
   - Clears the session cookie.
   - Frontend redirects to `/admin/login`.

---

## 4. Admin Features & Workflows

### 4.1. Dashboard (`/admin`)
- **Key Metrics**: Upcoming calls, This Week's calls, Total reservations, Active Confirmed, and Cancelled counts.
- **Agenda**: Upcoming 30-minute discovery calls with direct "Join Google Meet" CTA buttons and link to detailed dossiers.
- **Briefs Overview**: Latest project inquiries submitted through the contact form.

### 4.2. Bookings Management (`/admin/bookings`)
- **Search & Filters**: Search across client name, email, company, and booking ID (`BK_...`); filter by status (`confirmed`, `cancelled`, `completed`) or specific date.
- **Server-Side Pagination**: Efficient pagination prevents memory overhead.
- **Cancellation**:
  1. Prompts for an optional reason/note.
  2. Deletes the Google Calendar event via `googleCalendarProvider.cancelEvent(googleEventId)`.
  3. Updates PostgreSQL record to `status: 'cancelled'`, setting `cancelledAt: new Date()`.
  4. Dispatches professional cancellation emails to the client and internal studio team via Resend.
  5. Audit log entry recorded in `admin_audit_logs`.
- **Rescheduling**:
  1. Interactive date picker loads real-time 30-minute availability from Google Calendar FreeBusy and DB.
  2. Selecting an available slot patches the Google Calendar event (`updateCalendarEvent`) while preserving the Google Meet conference.
  3. Updates PostgreSQL record (`slotId`, `date`, `startTime`, `endTime`, `rescheduledAt`).
  4. Dispatches updated confirmation emails to the client and team.
  5. Audit log entry recorded in `admin_audit_logs`.

### 4.3. Client Briefs & Contacts (`/admin/contacts`)
- Lists incoming client proposals with budget, timeline, requested services, and detailed message.
- Status management: `new` ➔ `processed` ➔ `archived`.
- Internal notes tracking.

---

## 5. Security & Hardening Checklist

- [x] **No Plaintext Passwords**: Password verification uses bcrypt hashing.
- [x] **No Tokens in LocalStorage**: Authentication tokens are stored exclusively in HTTP-only cookies.
- [x] **Strict Server-Side Authorization**: Frontend route redirection is coupled with mandatory backend `requireAdminAuth` checks on all administrative endpoints.
- [x] **Audit Trail**: Sensitive actions (`login`, `booking_cancelled`, `booking_rescheduled`, `contact_status_updated`) are recorded in the database audit log.
- [x] **Input Validation**: All admin requests are validated with strict Zod schemas.
- [x] **HTML Escaping**: User inputs in email notifications are sanitized against XSS injection.
