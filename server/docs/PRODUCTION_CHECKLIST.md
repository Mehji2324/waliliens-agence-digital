# Production Checklist — Waliliens API

This document lists **every manual step** required before the first production deployment.
Work through each section in order; each item must be ✓ before going live.

---

## 1. Secrets & Core Variables

### 1.1 SESSION_SECRET

Generate a cryptographically strong secret (minimum 32 characters):

```bash
openssl rand -base64 48
```

Copy the output and add it to `server/.env`:

```env
SESSION_SECRET=<paste output here>
```

> **Security rule**: never reuse this value across environments. Rotating it invalidates all existing admin sessions.

---

### 1.2 Admin Credentials

**Step 1** — Choose a strong admin password (≥ 16 characters, mixed case + symbols).

**Step 2** — Generate its bcrypt hash:

```bash
cd server
npm run admin:hash -- "YourChosenPassword!"
```

**Step 3** — Copy the printed hash and the email into `server/.env`:

```env
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=<paste hash here>
```

> **Security rule**: the plaintext password is never stored anywhere. Only the hash goes in `.env`.

---

### 1.3 CLIENT_URL

Set the public-facing frontend URL (used for CORS and CSRF origin checks):

```env
CLIENT_URL=https://waliliens.com
```

---

### 1.4 Trust Proxy (Nginx)

If the server runs behind Nginx or any reverse proxy, enable this so rate limiting uses the real client IP:

```env
TRUST_PROXY=true
```

---

## 2. PostgreSQL Database

### 2.1 Provision the database

Create a dedicated PostgreSQL database and user:

```sql
CREATE DATABASE waliliens;
CREATE USER waliliens_app WITH ENCRYPTED PASSWORD 'choose-a-strong-password';
GRANT ALL PRIVILEGES ON DATABASE waliliens TO waliliens_app;
```

### 2.2 Set DATABASE_URL

```env
DATABASE_URL=postgresql://waliliens_app:<password>@<host>:5432/waliliens
```

### 2.3 Run migrations

```bash
cd server
npm run db:migrate
```

---

## 3. Google Calendar & Meet

> Skip this section if you do not want Google Calendar booking integration.
> Set `GOOGLE_CALENDAR_ENABLED=false` in that case.

### 3.1 Create a Google Cloud project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (e.g. "Waliliens Studio").
3. Enable the **Google Calendar API** for the project.

### 3.2 Create OAuth 2.0 credentials

1. Go to **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Add `http://localhost` (and your production domain) as authorized redirect URIs.
5. Download the credentials JSON — extract `client_id` and `client_secret`.

### 3.3 Generate the refresh token

Use the Google OAuth Playground or a local script to exchange for a long-lived refresh token:

```bash
# One-time interactive exchange — follow the prompts
npx --yes google-auth-library-token-generator \
  --client-id <GOOGLE_CLIENT_ID> \
  --client-secret <GOOGLE_CLIENT_SECRET> \
  --scope https://www.googleapis.com/auth/calendar
```

Copy the `refresh_token` from the response.

### 3.4 Set environment variables

```env
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CLIENT_ID=<client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<client_secret>
GOOGLE_REFRESH_TOKEN=<refresh_token>
GOOGLE_CALENDAR_ID=primary
```

> **Important**: the server will refuse to start in production if `GOOGLE_CALENDAR_ENABLED=true` and any of the three credential variables is missing.

---

## 4. Resend — Transactional Email

> Skip this section if you do not need email notifications.
> Set `EMAIL_ENABLED=false` in that case.

### 4.1 Register and verify your domain

1. Create an account at [https://resend.com](https://resend.com).
2. Go to **Domains → Add Domain** and enter your sending domain (e.g. `waliliens.com`).
3. Add the DNS records Resend shows you — typically:
   - **SPF** TXT record on `@` or `mail`
   - **DKIM** TXT record (two entries)
   - **DMARC** TXT record on `_dmarc` (recommended)
4. Click **Verify** and wait for DNS propagation (up to 48 hours; often minutes).

### 4.2 Create an API key

1. Go to **API Keys → Create API Key**.
2. Choose **Sending access** scoped to the verified domain.
3. Copy the key — it is shown only once.

### 4.3 Set environment variables

```env
EMAIL_ENABLED=true
RESEND_API_KEY=re_live_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Waliliens <hello@yourdomain.com>
BOOKING_NOTIFICATION_EMAIL=waliliens.ai@gmail.com
```

> **Important**: `EMAIL_FROM` must use the domain you verified in step 4.1 — Resend
> cannot send from `gmail.com` addresses. Booking notifications and replies are
> routed to the platform inbox `waliliens.ai@gmail.com` via `BOOKING_NOTIFICATION_EMAIL`.
> The server will refuse to start in production if `EMAIL_ENABLED=true` and `RESEND_API_KEY` is missing.

---

## 5. NODE_ENV

**This is the most important flag.** Setting it to `production` activates:

- Batch startup validation (all missing variables reported at once, server aborts).
- Secure (`Secure`) and `SameSite=Strict` cookies.
- Structured `morgan` access logs.
- No dev-only fallback secrets.

```env
NODE_ENV=production
```

---

## 6. Final Pre-Launch Checklist

Run through each item before opening traffic:

- [ ] `SESSION_SECRET` is set and ≥ 32 characters (`openssl rand -base64 48`)
- [ ] `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` are set (generated with `npm run admin:hash`)
- [ ] `CLIENT_URL` matches the production frontend domain
- [ ] `DATABASE_URL` points to the production database; `npm run db:migrate` has been run
- [ ] `NODE_ENV=production`
- [ ] `TRUST_PROXY=true` if behind Nginx / load balancer
- [ ] Google Calendar: all three credential variables set, or `GOOGLE_CALENDAR_ENABLED=false`
- [ ] Email: `RESEND_API_KEY` set and domain verified (SPF + DKIM), or `EMAIL_ENABLED=false`
- [ ] `.env` is **not** committed to version control (confirm it is in `.gitignore`)
- [ ] Server starts without errors: `npm run start` — watch for any `[config] FATAL` messages
- [ ] Admin login works at `/admin/login`
- [ ] Health check responds: `GET /api/health` → `{ "status": "ok" }`
- [ ] Readiness probe responds: `GET /api/health/ready` → `{ "status": "ready" }`
