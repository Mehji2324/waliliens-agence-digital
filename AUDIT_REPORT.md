# Final pre-launch audit

**Scope:** security, correctness, accessibility, performance, deployment, and documentation.
**Outcome:** no known Critical or High findings remain. The remaining code findings are deferred because a safe remediation needs broader design or toolchain changes; owner-specific launch work is listed separately.

## Findings remaining

| Severity | Finding | Evidence / impact | Recommended action |
|---|---|---|---|
| Medium | Admin logout does not revoke an already-copied JWT. | Logout clears the browser cookie ([admin.controller.ts](./server/src/controllers/admin.controller.ts#L62)); API authentication accepts and verifies a signed token ([admin-auth.ts](./server/src/middleware/admin-auth.ts#L21)). A copied token therefore remains usable until expiry (configured for up to 24 hours). | Add token revocation/session versioning or shorten the accepted session lifetime. |
| Medium | Four moderate advisories remain in backend development tooling. | `drizzle-kit` brings deprecated `@esbuild-kit/*` packages and `esbuild <=0.24.2` into the development/build dependency tree. Production dependency audit and production image install report zero vulnerabilities. `npm audit fix --force` proposes a breaking downgrade to `drizzle-kit@0.18.1`, so it was not applied. | Plan a compatible Drizzle Kit/toolchain migration and rerun the full audit. Keep build tooling off production runtime images. |
| Medium | Legal and privacy notices still contain owner-specific placeholders. | `[À COMPLÉTER]` remains in [LegalPage.tsx](./src/pages/Legal/LegalPage.tsx#L5); `[TO BE COMPLETED]` remains in [PrivacyPage.tsx](./src/pages/Privacy/PrivacyPage.tsx#L4). | Verify and fill in publisher/company, contact, retention, hosting, and regulator details before launch. Related unverified portfolio and marketing claims are tracked in [CONTENT_TODO.md](./CONTENT_TODO.md). |
| Low | Lint passes with existing React lint warnings. | Warnings include state updates in effects, Fast Refresh export boundaries, and a missing hook dependency; no lint errors were reported. | Triage warnings individually and address any confirmed behavioral issue. |

## Fixed

| Original finding | Remediation |
|---|---|
| **High — HTTP exposed admin credentials and API traffic to interception.** | Nginx now serves only the health endpoint and ACME challenge while certificates are absent; other HTTP requests fail closed. After certificate provisioning it enables HTTPS, redirects HTTP to the canonical HTTPS origin, and applies security headers/HSTS. Certbot setup and renewal steps are documented in [DEPLOYMENT.md](./docs/DEPLOYMENT.md). |
| **High — Backend Docker build omitted Drizzle migrations.** | The backend build now copies migrations into the builder and runtime image. Both Docker images build successfully. |
| **Medium — PostgreSQL Compose settings were missing from the root environment template.** | Added the database name/user and an explicitly-required password field with a strong-secret generation instruction to `.env.example`. |
| **Correctness — E2E checks were stale.** | Updated contact/booking consent handling, the booking route, and admin/contact API mocks to match the current app. All four Playwright flows pass. |

## Deferred (with reason)

| Finding | Reason and suggested plan |
|---|---|
| Admin logout does not revoke a copied JWT. | A correct fix needs persistent session revocation or session-version checking across all API instances, plus migration, expiry/cleanup behavior, and tests. Do not use an in-memory denylist. Design a durable admin-session strategy, implement it with a schema migration, then test logout with both cookie and bearer-token sessions. |
| Four moderate advisories in backend development tooling. | The vulnerable dependency chain is nested under Drizzle Kit; `npm audit fix --force` proposes a breaking downgrade. Evaluate a compatible Drizzle Kit release or replace the deprecated loader/toolchain, then regenerate the lockfile and verify schema generation, migrations, typecheck, and build. |
| Existing React lint warnings (Low). | Left unchanged as requested. Triage effects/dependency warnings separately and fix only after verifying behavior. |

## Manual actions required

- [ ] **Production database and secrets:** provision PostgreSQL with persistent storage and backups. Copy `.env.example` to `.env`, generate `POSTGRES_PASSWORD` using `openssl rand -base64 32`, and configure `server/.env` with the production `DATABASE_URL`, a unique `SESSION_SECRET`, `ADMIN_EMAIL`, a hash generated with `npm run admin:hash --prefix server`, and `TRUST_PROXY=true`. Apply migrations and verify backup/restore before accepting traffic.
- [ ] **Resend email (if enabled):** verify the sending domain in Resend, publish the exact SPF/DKIM records Resend provides, configure `RESEND_API_KEY` and sender details in `server/.env`, then send and receive a production test message. Otherwise explicitly keep email disabled.
- [ ] **Google Calendar (if enabled):** configure the production OAuth client and authorized redirect URI, complete the owner authorization flow to obtain a refresh token, set the corresponding `GOOGLE_*` values in `server/.env`, and verify event creation/update/cancellation against the intended calendar. Otherwise explicitly keep calendar integration disabled.
- [ ] **Legal/privacy details:** replace every `[À COMPLÉTER]` / `[TO BE COMPLETED]` placeholder with verified publisher/company registration, publication director, host, privacy contact, retention, processor/transfer, and regulator details; have the responsible owner review the notices before launch.
- [ ] **Portfolio and marketing claims:** verify client permission, project artwork, testimonials, awards, performance metrics, and service guarantees in [CONTENT_TODO.md](./CONTENT_TODO.md); provide evidence or replace/remove each unsupported claim.
- [ ] **Production DNS and TLS:** point `waliliens.com` and `www.waliliens.com` to the VPS, open inbound ports 80/443, follow [DEPLOYMENT.md](./docs/DEPLOYMENT.md) to issue and renew the real certificate, and verify externally that HTTP redirects to HTTPS and security headers are present.
- [ ] **Accessibility/performance sign-off:** run Lighthouse and axe against the deployed site with its production API and keyboard/screen-reader checks; record measured results. This audit did not run Lighthouse or certify WCAG conformance.

## Launch readiness verdict

**NO-GO for public production launch until the required manual actions above are complete and verified.** No Critical or High code finding is known, and the application builds and tests pass, but production database/secrets, provider credentials, legal content, DNS/certificate issuance, and deployed accessibility/performance checks remain unverified.

## Lighthouse-style before/after findings

These are source/build-based comparisons, **not Lighthouse scores**. A browser Lighthouse run and WCAG certification were not performed.

| Area | Before | After |
|---|---|---|
| Keyboard access | No consistent skip link/focus treatment and modal keyboard handling was incomplete. | Skip-to-content link and visible focus indicators are present; modal focus trapping, Escape handling, and focus restoration are implemented. Forms expose labels and validation state to assistive technology. |
| Motion and contrast | Reduced-motion handling and contrast were incomplete. Neutral text measured 4.32:1 and violet text 4.84:1 on the page background. | Reduced-motion preferences are respected across motion effects; custom cursor/audio are disabled for touch where applicable and sound is opt-in. Updated neutral and violet text measure 8.12:1 and 7.53:1, respectively. |
| JavaScript payload | Framer Motion feature chunk: 153.60 kB raw / 49.28 kB gzip. Homepage module: 32.76 / 9.09 kB. | Framer Motion feature chunk: 107.64 / 36.16 kB (about 30% smaller raw and 27% smaller gzip). Current homepage module: 26.40 / 7.47 kB. HeroCanvas and ScrollPinStory are separately lazy-loaded; ScrollPinStory defers work until near the viewport. |
| Image delivery | Remote/placeholder imagery and eager work increased third-party/network dependence. | Portfolio artwork is local and optimized; image dimensions and lazy loading are applied on relevant content. |

Latest production build's largest JavaScript chunks:

| Chunk | Raw | Gzip |
|---|---:|---:|
| React | 181.75 kB | 57.16 kB |
| Shared application entry | 130.09 kB | 41.94 kB |
| Framer Motion features | 107.64 kB | 36.16 kB |

These chunk sizes are build outputs only; actual Core Web Vitals and Lighthouse scores depend on the deployed server, network, device, and API.

## Validation performed

| Check | Result |
|---|---|
| Frontend lint | Passed with warnings noted above. |
| Frontend production build | Passed. |
| Frontend tests | 14 tests passed. |
| Backend typecheck/build | Passed. |
| Backend tests | 60 tests passed. |
| Playwright E2E | 4 tests passed, including contact, booking, and admin flows. |
| Frontend/backend Docker builds | Passed. |
| Docker Compose config | Passed using `.env.example`. Production secrets and host-specific values still need to be set. |
| Nginx configuration | Bootstrap and TLS configurations passed `nginx -t` in the built container; TLS syntax was exercised with an ephemeral self-signed certificate. No real certificate issuance, public DNS, or external renewal was tested. |
| Dependency audits | Frontend: zero vulnerabilities. Backend production dependencies: zero vulnerabilities. Backend full development tree: four Moderate advisories described above; no Critical/High advisory remains. |
| `git diff --check` | Reports trailing blank lines at EOF in `server/src/routes/booking.routes.ts`, `contact.routes.ts`, and `index.ts`; these are pre-existing unrelated changes and were left untouched. |
