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

export const env = {
  port: requireInt('PORT', 4000),
  nodeEnv: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  clientUrl: requireEnv('CLIENT_URL', 'http://localhost:5173'),
  databaseUrl: process.env.DATABASE_URL ?? '',
  rateLimit: {
    windowMinutes: requireInt('RATE_LIMIT_WINDOW_MINUTES', 15),
    maxRequests: requireInt('RATE_LIMIT_MAX_REQUESTS', 10),
  },
  // Google Calendar Integration Config
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
} as const;

export const isDev = env.nodeEnv === 'development';
export const isProd = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';
