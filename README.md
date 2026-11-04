# WALILIENS

WALILIENS is a digital and AI studio website with a React frontend, an Express API, and PostgreSQL-backed project, service, contact, booking, and admin data.

- **Production site:** [https://waliliens.com](https://waliliens.com) — configured deployment domain; verify DNS and deployment status before sharing externally.
- **Deployment runbook:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Content verification list:** [CONTENT_TODO.md](CONTENT_TODO.md)

## Architecture

```text
Browser
  └── React 19 + TypeScript + Vite (src/)
        └── /api/* ──> Express 5 + TypeScript (server/src/)
                           └── PostgreSQL (Drizzle ORM)
```

- `src/app/routes.tsx` defines public and admin routes. Pages and reusable UI are under `src/pages/` and `src/components/`.
- Project and service views fetch from `/api/projects` and `/api/services`; the API reads the PostgreSQL database. Seed snapshots under `server/src/db/*seed-data.ts` are used only by the explicit database seed command.
- `src/data/projects.ts` and `src/data/services.ts` are development-only API fallbacks. They are activated only when `VITE_ENABLE_MOCK_API=true` in Vite development mode; production builds never use them.
- Contact, booking, authentication, and admin API clients live under `src/services/api/`.
- The frontend build is served as static assets; Nginx proxies `/api/*` to the backend in the documented VPS deployment.
- Production Nginx serves only ACME challenges until a Let's Encrypt certificate is present; it then redirects HTTP to HTTPS and serves the app/API over TLS.

## Requirements

- Node.js 20 or newer (the deployment containers use Node 20)
- npm
- PostgreSQL 16 for a full local backend

## Local setup

1. Install frontend and backend dependencies:

   ```bash
   npm install
   npm install --prefix server
   ```

2. Configure the frontend and backend:

   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

   For local development, the frontend API URL can remain empty; Vite proxies `/api` to `http://localhost:4000`. Set `VITE_ENABLE_MOCK_API=true` only if you want local project/service data when the API is unavailable.

3. Set `DATABASE_URL` in `server/.env` to a running PostgreSQL database. Apply the schema and insert the initial project/service records:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Start the API and frontend in separate terminals:

   ```bash
   npm run server:dev
   npm run dev
   ```

   Open the Vite URL printed in the frontend terminal (normally `http://localhost:5173`).

Optional Google Calendar and Resend integrations are disabled by default. Follow [server/docs/GOOGLE_CALENDAR_SETUP.md](server/docs/GOOGLE_CALENDAR_SETUP.md) and [server/docs/EMAIL_SETUP.md](server/docs/EMAIL_SETUP.md) before enabling them. Never expose server secrets as `VITE_*` variables.

## Environment variables

### Frontend (`.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Optional API origin. Leave blank for same-origin `/api/*` requests (Vite proxy locally, Nginx in deployment). Do not append `/api`. |
| `VITE_ENABLE_MOCK_API` | Development fallback for projects and services; effective only in Vite development mode. |
| `VITE_SENTRY_DSN` | Optional Sentry diagnostics configuration. Optional tracking remains blocked until consent. |
| `VITE_TELEMETRY_KEY` | Reserved optional telemetry configuration; currently unused by the frontend. |

### Backend (`server/.env`)

Copy all backend configuration keys and comments from [server/.env.example](server/.env.example). The main settings are:

| Variable | Purpose |
| --- | --- |
| `PORT`, `NODE_ENV`, `CLIENT_URL`, `TRUST_PROXY` | HTTP/runtime, allowed frontend origin, and reverse-proxy behavior. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | Admin identity and session signing; required in production. |
| `GOOGLE_CALENDAR_ENABLED`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` | Optional booking availability and event integration. |
| `EMAIL_ENABLED`, `RESEND_API_KEY`, `EMAIL_FROM`, `BOOKING_NOTIFICATION_EMAIL` | Optional transactional email delivery. |
| `RATE_LIMIT_WINDOW_MINUTES`, `RATE_LIMIT_MAX_REQUESTS` | API rate limiting. |
| `BOOKING_DURATION_MINUTES`, `BOOKING_TIMEZONE`, `BOOKING_START_HOUR`, `BOOKING_END_HOUR`, `BOOKING_MIN_NOTICE_MINUTES` | Booking schedule configuration. |
| `SENTRY_DSN` | Optional server-side error reporting. |

Treat `.env` files as secrets; commit only the example files.

## Scripts

Run from the repository root unless noted:

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server. |
| `npm run build` | Type-check and build the frontend into `dist/`. |
| `npm run preview` | Preview the production frontend build. |
| `npm run lint` | Run Oxlint on the frontend. |
| `npm run test:frontend` | Run frontend Vitest tests. |
| `npm run test:server` | Run server Vitest tests. |
| `npm test` | Run frontend and server test suites. |
| `npm run test:e2e` | Run Playwright browser tests. |
| `npm run server:dev` | Start the API in watch mode. |
| `npm run server:build` | Compile the API into `server/dist/`. |
| `npm run server:start` | Start the compiled API. |
| `npm run server:typecheck` | Type-check the API without emitting output. |
| `npm run db:generate` | Generate Drizzle migrations. |
| `npm run db:migrate` | Apply generated migrations. |
| `npm run db:push` | Push the current Drizzle schema to PostgreSQL (local setup). |
| `npm run db:seed` | Insert/update initial project and service rows. |

## Production deployment

See the [VPS deployment and operations guide](docs/DEPLOYMENT.md) for Docker, Nginx, TLS, environment setup, database migration, and operational checks. The documented production hostname is [waliliens.com](https://waliliens.com); confirm it resolves to the intended deployment before relying on it.
