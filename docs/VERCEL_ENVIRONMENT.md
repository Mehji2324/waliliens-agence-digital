# Vercel environment variables

Configure Preview and Production values separately in Vercel. Do not copy
production database credentials into Preview. Use a separate preview database
if database-backed preview tests are required.

## Required for a production API

| Variable | Preview | Production | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Separate preview database if testing persistence | Production PostgreSQL URL | Use a pooled/serverless connection URL where the provider offers one. |
| `CLIENT_URL` | Exact preview origin | Public production frontend origin | Must be an absolute URL. |
| `ADMIN_EMAIL` | Optional for frontend/API smoke test; required to test login | Admin account email | |
| `ADMIN_PASSWORD_HASH` | Optional for smoke test; required to test login | Hash generated with `npm run admin:hash -- "<password>"` | Store the hash, never the plain password. |
| `SESSION_SECRET` | Unique preview secret, at least 32 characters | Unique production secret, at least 32 characters | Generate independently for each environment. |

In Production, `NODE_ENV=production` is supplied by Vercel. Do not override it.
The server validates the five required values above at startup in production.

## Optional integrations

Configure these only when enabling the matching feature. Keep integration
credentials distinct between Preview and Production.

| Variables | Preview | Production | Notes |
| --- | --- | --- | --- |
| `GOOGLE_CALENDAR_ENABLED`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` | Optional; use a dedicated test calendar to test booking integration | Optional; use the intended production calendar | If enabled, client ID, client secret, and refresh token are required. |
| `EMAIL_ENABLED`, `RESEND_API_KEY`, `EMAIL_FROM`, `BOOKING_NOTIFICATION_EMAIL` | Optional; use a Resend test/sandbox setup and non-customer recipients | Optional; enable after sender-domain verification | `RESEND_API_KEY` is required when email is enabled. |
| `SENTRY_DSN` | Optional preview project/environment | Optional production project/environment | Diagnostics only. |

## Operational settings

The following have safe defaults and can be set separately by environment:

`RATE_LIMIT_WINDOW_MINUTES`, `RATE_LIMIT_MAX_REQUESTS`,
`BOOKING_DURATION_MINUTES`, `BOOKING_TIMEZONE`, `BOOKING_START_HOUR`,
`BOOKING_END_HOUR`, `BOOKING_MIN_NOTICE_MINUTES`, and `TRUST_PROXY`.

Run Drizzle migrations as a deliberate release operation against the intended
database. This application does not run migrations automatically at function
startup. Never point Preview at Production to test migrations or write flows.
