/**
 * Centralised, typed environment configuration for the Waliliens API.
 *
 * All variables are validated with Zod at process start. In production every
 * required secret must be present; missing variables are reported all at once
 * rather than one-by-one so a single deploy can catch every gap. In
 * development and test mode, safe runtime fallbacks are used with a warning.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { z } from 'zod';

// ── Load .env file (try multiple candidate paths) ─────────────────────────────
const candidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '../..', '.env'),
];
for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const nodeEnvRaw = process.env.NODE_ENV ?? 'development';
const isProdEnv = nodeEnvRaw === 'production';
const isTestEnv = nodeEnvRaw === 'test';

/** Coerce "true" / "1" → true, anything else → false */
const boolStr = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1');

/** Parse a string as a positive integer */
const intStr = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return fallback;
      const n = parseInt(v, 10);
      return isNaN(n) ? fallback : n;
    });

/** Helper: treat empty string / whitespace-only as undefined */
const optionalString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().min(1).optional()
);

const optionalUrl = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().url().optional()
);

const optionalEmail = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().email().optional()
);

/** Validates that a string is a valid IANA timezone identifier supported by the runtime */
export function isValidIanaTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a given Date instant (or now) as 'YYYY-MM-DD' in a specified IANA timezone.
 */
export function getTodayDateString(timeZone: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

export const ianaTimezone = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z
    .string()
    .min(1)
    .refine(isValidIanaTimezone, {
      message: 'Invalid IANA timezone identifier (e.g. "Africa/Casablanca", "America/New_York", "UTC")',
    })
    .optional()
);

// ── Schema definition ─────────────────────────────────────────────────────────

/**
 * Every key is validated here. Required secrets use optional helpers so that an
 * empty string in dev/test is treated as undefined rather than failing raw schema parsing.
 * Production requiredness and cross-field refinements are enforced below.
 */
const rawSchema = z.object({
  // ── Core ────────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: intStr(4000),
  CLIENT_URL: optionalUrl,
  DATABASE_URL: optionalString,
  TRUST_PROXY: boolStr,

  // ── Rate limiting ────────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MINUTES: intStr(15),
  RATE_LIMIT_MAX_REQUESTS: intStr(10),

  // ── Admin secrets ────────────────────────────────────────────────────────────
  ADMIN_EMAIL: optionalEmail,
  ADMIN_PASSWORD_HASH: optionalString,
  SESSION_SECRET: optionalString,

  // ── Google Calendar ──────────────────────────────────────────────────────────
  GOOGLE_CALENDAR_ENABLED: boolStr,
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  GOOGLE_REFRESH_TOKEN: optionalString,
  GOOGLE_CALENDAR_ID: optionalString,

  // ── Booking rules ────────────────────────────────────────────────────────────
  BOOKING_DURATION_MINUTES: intStr(30),
  BOOKING_TIMEZONE: ianaTimezone,
  BOOKING_START_HOUR: intStr(10),
  BOOKING_END_HOUR: intStr(18),
  BOOKING_MIN_NOTICE_MINUTES: intStr(120),

  // ── Email / Resend ───────────────────────────────────────────────────────────
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  BOOKING_NOTIFICATION_EMAIL: optionalEmail,
  EMAIL_ENABLED: boolStr,

  // ── Monitoring / Sentry ──────────────────────────────────────────────────────
  SENTRY_DSN: optionalString,
});

// ── Parse raw env ─────────────────────────────────────────────────────────────

const parsed = rawSchema.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map(
    (i) => `  • ${i.path.join('.')}: ${i.message}`
  );
  throw new Error(
    `[config] Environment variable schema errors:\n${lines.join('\n')}\n` +
      'Fix the above before starting the server.'
  );
}

const raw = parsed.data;

// ── Production-only required field check ─────────────────────────────────────
// We collect ALL missing variables and report them together.

if (isProdEnv) {
  const missing: string[] = [];

  // Core secrets
  if (!raw.ADMIN_EMAIL) missing.push('ADMIN_EMAIL (admin login email)');
  if (!raw.ADMIN_PASSWORD_HASH) missing.push('ADMIN_PASSWORD_HASH (run: npm run admin:hash -- "<password>")');
  if (!raw.SESSION_SECRET) {
    missing.push('SESSION_SECRET (run: openssl rand -base64 48)');
  } else if (raw.SESSION_SECRET.length < 32) {
    missing.push('SESSION_SECRET must be at least 32 characters (run: openssl rand -base64 48)');
  }
  if (!raw.DATABASE_URL) missing.push('DATABASE_URL (PostgreSQL connection string)');
  if (!raw.CLIENT_URL) missing.push('CLIENT_URL (public frontend URL, e.g. https://waliliens.com)');

  // Integration: Google Calendar
  if (raw.GOOGLE_CALENDAR_ENABLED) {
    if (!raw.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID (required when GOOGLE_CALENDAR_ENABLED=true)');
    if (!raw.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET (required when GOOGLE_CALENDAR_ENABLED=true)');
    if (!raw.GOOGLE_REFRESH_TOKEN) missing.push('GOOGLE_REFRESH_TOKEN (required when GOOGLE_CALENDAR_ENABLED=true)');
  }

  // Integration: Email
  if (raw.EMAIL_ENABLED && !raw.RESEND_API_KEY) {
    missing.push('RESEND_API_KEY (required when EMAIL_ENABLED=true)');
  }

  if (missing.length > 0) {
    throw new Error(
      `[config] FATAL — cannot start in production. The following environment variables are missing or invalid:\n\n` +
        missing.map((m) => `  ✗ ${m}`).join('\n') +
        '\n\nSee server/docs/PRODUCTION_CHECKLIST.md for setup instructions.'
    );
  }
}

// ── Dev/test fallbacks (with warnings) ───────────────────────────────────────

function devFallback(key: string, value: string | undefined, generate: () => string): string {
  if (value) return value;
  if (isProdEnv) return ''; // already guarded above
  const fallback = generate();
  if (!isTestEnv) {
    console.warn(
      `[config] WARNING: "${key}" is not set. ` +
        `Using a runtime fallback (${nodeEnvRaw} only). Set it before deploying to production.`
    );
  }
  return fallback;
}

const sessionSecret = devFallback(
  'SESSION_SECRET',
  raw.SESSION_SECRET && raw.SESSION_SECRET.length >= 32 ? raw.SESSION_SECRET : undefined,
  () => crypto.randomBytes(32).toString('hex')
);

const adminEmail = devFallback('ADMIN_EMAIL', raw.ADMIN_EMAIL, () => 'admin@waliliens.com');

// Empty string → bcrypt.compare will always fail → no login without a real hash
const adminPasswordHash = devFallback('ADMIN_PASSWORD_HASH', raw.ADMIN_PASSWORD_HASH, () => '');

// ── Google Calendar computed values ──────────────────────────────────────────

const hasGoogleCredentials = Boolean(
  raw.GOOGLE_CLIENT_ID && raw.GOOGLE_CLIENT_SECRET && raw.GOOGLE_REFRESH_TOKEN
);

// GOOGLE_CALENDAR_ENABLED defaults to true only if all three credentials exist
const googleCalendarEnabled =
  process.env.GOOGLE_CALENDAR_ENABLED !== undefined
    ? raw.GOOGLE_CALENDAR_ENABLED
    : hasGoogleCredentials;

// ── Email computed values ─────────────────────────────────────────────────────

const resendApiKey = raw.RESEND_API_KEY ?? '';
const emailConfigured = Boolean(resendApiKey);

// EMAIL_ENABLED defaults to true only when a key is present
const emailEnabled =
  process.env.EMAIL_ENABLED !== undefined
    ? raw.EMAIL_ENABLED && emailConfigured
    : emailConfigured;

// ── Exported config object ────────────────────────────────────────────────────

export const env = {
  port: raw.PORT,
  nodeEnv: raw.NODE_ENV,
  clientUrl: raw.CLIENT_URL ?? 'http://localhost:5173',
  databaseUrl: raw.DATABASE_URL ?? '',
  trustProxy: raw.TRUST_PROXY,

  rateLimit: {
    windowMinutes: raw.RATE_LIMIT_WINDOW_MINUTES,
    maxRequests: raw.RATE_LIMIT_MAX_REQUESTS,
  },

  googleCalendar: {
    enabled: googleCalendarEnabled,
    clientId: raw.GOOGLE_CLIENT_ID ?? '',
    clientSecret: raw.GOOGLE_CLIENT_SECRET ?? '',
    refreshToken: raw.GOOGLE_REFRESH_TOKEN ?? '',
    calendarId: raw.GOOGLE_CALENDAR_ID ?? 'primary',
    hasCredentials: hasGoogleCredentials,
  },

  booking: {
    durationMinutes: raw.BOOKING_DURATION_MINUTES,
    timezone: raw.BOOKING_TIMEZONE ?? 'Africa/Casablanca',
    startHour: raw.BOOKING_START_HOUR,
    endHour: raw.BOOKING_END_HOUR,
    minNoticeMinutes: raw.BOOKING_MIN_NOTICE_MINUTES,
  },

  email: {
    apiKey: resendApiKey,
    from: raw.EMAIL_FROM ?? 'Waliliens <waliliens.ai@gmail.com>',
    notificationRecipient: raw.BOOKING_NOTIFICATION_EMAIL ?? 'waliliens.ai@gmail.com',
    enabled: emailEnabled,
    isConfigured: emailConfigured,
  },

  admin: {
    email: adminEmail,
    passwordHash: adminPasswordHash,
    sessionSecret,
    cookieName: 'walili_admin_session',
    tokenExpiryHours: 24,
  },

  sentry: {
    dsn: raw.SENTRY_DSN ?? '',
    enabled: Boolean(raw.SENTRY_DSN),
  },
} as const;

export const isDev = env.nodeEnv === 'development';
export const isProd = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';
