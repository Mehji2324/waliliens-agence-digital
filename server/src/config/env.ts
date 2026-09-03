import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try multiple candidate locations for .env (current working dir, server dir, or parent dir)
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

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[config] Required environment variable "${key}" is not set.`);
    }
    return fallback ?? '';
  }
  return value;
}

function requireInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    console.warn(`[config] "${key}" is not a valid integer, using fallback: ${fallback}`);
    return fallback;
  }
  return parsed;
}

function parseBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  return raw.toLowerCase() === 'true' || raw === '1';
}

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN ?? '';
const googleCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

const hasGoogleCredentials = Boolean(googleClientId && googleClientSecret && googleRefreshToken);
const googleCalendarExplicit = process.env.GOOGLE_CALENDAR_ENABLED !== undefined
  ? parseBool('GOOGLE_CALENDAR_ENABLED', true)
  : hasGoogleCredentials;

const resendApiKey = process.env.RESEND_API_KEY ?? '';
const emailFrom = process.env.EMAIL_FROM || 'Waliliens <hello@waliliens.com>';
const bookingNotificationEmail = process.env.BOOKING_NOTIFICATION_EMAIL || 'hello@waliliens.com';
const emailEnabled = parseBool('EMAIL_ENABLED', Boolean(resendApiKey));

// Default dev bcrypt hash for "WaliliensAdmin2026!"
const defaultAdminHash = '$2b$10$wK52r1r7jVl0n5h5u1P4O.Wp6rL3o9f2z7m5y1v8x0t4u3q2s1a9e';

export const env = {
  port: requireInt('PORT', 4000),
  nodeEnv: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  clientUrl: requireEnv('CLIENT_URL', 'http://localhost:5173'),
  databaseUrl: process.env.DATABASE_URL ?? '',
  rateLimit: {
    windowMinutes: requireInt('RATE_LIMIT_WINDOW_MINUTES', 15),
    maxRequests: requireInt('RATE_LIMIT_MAX_REQUESTS', 10),
  },
  // Google Calendar Integration Config (Phase 5)
  googleCalendar: {
    enabled: googleCalendarExplicit,
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    refreshToken: googleRefreshToken,
    calendarId: googleCalendarId,
    hasCredentials: hasGoogleCredentials,
  },
  // Booking Rules & Availability Config
  booking: {
    durationMinutes: requireInt('BOOKING_DURATION_MINUTES', 30),
    timezone: process.env.BOOKING_TIMEZONE || 'Africa/Casablanca',
    startHour: requireInt('BOOKING_START_HOUR', 10),
    endHour: requireInt('BOOKING_END_HOUR', 18),
    minNoticeMinutes: requireInt('BOOKING_MIN_NOTICE_MINUTES', 120),
  },
  // Email Integration Config (Phase 6 - Resend)
  email: {
    apiKey: resendApiKey,
    from: emailFrom,
    notificationRecipient: bookingNotificationEmail,
    enabled: emailEnabled && Boolean(resendApiKey),
    isConfigured: Boolean(resendApiKey),
  },
  // Admin Authentication Config (Phase 7)
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@waliliens.com',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || defaultAdminHash,
    sessionSecret: process.env.SESSION_SECRET || 'waliliens_secure_session_secret_change_in_production_2026',
    cookieName: 'walili_admin_session',
    tokenExpiryHours: 24,
  },
} as const;

export const isDev = env.nodeEnv === 'development';
export const isProd = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';
