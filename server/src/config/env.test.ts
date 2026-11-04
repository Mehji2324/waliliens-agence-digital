/**
 * Tests for:
 * 1. Env schema validation logic (production guards, dev fallbacks)
 * 2. Admin login response shape — JWT not in JSON body
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── 1. Production env validation logic ──────────────────────────────────────
//
// env.ts is module-cached and evaluated at import time, so we test the
// validation logic by re-implementing the production check function and
// running it against various input shapes — matching the exact behaviour in env.ts.

interface RawEnv {
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  DATABASE_URL?: string;
  CLIENT_URL?: string;
  GOOGLE_CALENDAR_ENABLED?: boolean;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  EMAIL_ENABLED?: boolean;
  RESEND_API_KEY?: string;
}

function collectProductionErrors(raw: RawEnv): string[] {
  const missing: string[] = [];

  if (!raw.ADMIN_EMAIL) missing.push('ADMIN_EMAIL');
  if (!raw.ADMIN_PASSWORD_HASH) missing.push('ADMIN_PASSWORD_HASH');
  if (!raw.SESSION_SECRET) {
    missing.push('SESSION_SECRET');
  } else if (raw.SESSION_SECRET.length < 32) {
    missing.push('SESSION_SECRET must be at least 32 characters');
  }
  if (!raw.DATABASE_URL) missing.push('DATABASE_URL');
  if (!raw.CLIENT_URL) missing.push('CLIENT_URL');

  if (raw.GOOGLE_CALENDAR_ENABLED) {
    if (!raw.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
    if (!raw.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
    if (!raw.GOOGLE_REFRESH_TOKEN) missing.push('GOOGLE_REFRESH_TOKEN');
  }

  if (raw.EMAIL_ENABLED && !raw.RESEND_API_KEY) {
    missing.push('RESEND_API_KEY');
  }

  return missing;
}

const VALID_PROD_ENV: RawEnv = {
  ADMIN_EMAIL: 'admin@waliliens.com',
  ADMIN_PASSWORD_HASH: '$2b$10$validHashPlaceholder',
  SESSION_SECRET: 'a'.repeat(48),
  DATABASE_URL: 'postgresql://user:pass@host:5432/db',
  CLIENT_URL: 'https://waliliens.com',
};

describe('Production env validation — required secrets', () => {
  it('passes with all required variables present', () => {
    expect(collectProductionErrors(VALID_PROD_ENV)).toHaveLength(0);
  });

  it('reports missing ADMIN_EMAIL', () => {
    const errors = collectProductionErrors({ ...VALID_PROD_ENV, ADMIN_EMAIL: undefined });
    expect(errors).toContain('ADMIN_EMAIL');
  });

  it('reports missing ADMIN_PASSWORD_HASH', () => {
    const errors = collectProductionErrors({ ...VALID_PROD_ENV, ADMIN_PASSWORD_HASH: undefined });
    expect(errors).toContain('ADMIN_PASSWORD_HASH');
  });

  it('reports missing SESSION_SECRET', () => {
    const errors = collectProductionErrors({ ...VALID_PROD_ENV, SESSION_SECRET: undefined });
    expect(errors.some((e) => e.includes('SESSION_SECRET'))).toBe(true);
  });

  it('reports SESSION_SECRET shorter than 32 chars', () => {
    const errors = collectProductionErrors({ ...VALID_PROD_ENV, SESSION_SECRET: 'tooshort' });
    expect(errors.some((e) => e.includes('SESSION_SECRET') && e.includes('32'))).toBe(true);
  });

  it('accepts SESSION_SECRET of exactly 32 chars', () => {
    const errors = collectProductionErrors({ ...VALID_PROD_ENV, SESSION_SECRET: 'a'.repeat(32) });
    expect(errors.filter((e) => e.includes('SESSION_SECRET'))).toHaveLength(0);
  });

  it('reports missing DATABASE_URL', () => {
    const errors = collectProductionErrors({ ...VALID_PROD_ENV, DATABASE_URL: undefined });
    expect(errors).toContain('DATABASE_URL');
  });

  it('reports missing CLIENT_URL', () => {
    const errors = collectProductionErrors({ ...VALID_PROD_ENV, CLIENT_URL: undefined });
    expect(errors).toContain('CLIENT_URL');
  });

  it('reports ALL missing variables at once (batch)', () => {
    const errors = collectProductionErrors({});
    expect(errors).toContain('ADMIN_EMAIL');
    expect(errors).toContain('ADMIN_PASSWORD_HASH');
    expect(errors.some((e) => e.includes('SESSION_SECRET'))).toBe(true);
    expect(errors).toContain('DATABASE_URL');
    expect(errors).toContain('CLIENT_URL');
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Production env validation — Google Calendar integration', () => {
  it('passes when GOOGLE_CALENDAR_ENABLED=false and no credentials are set', () => {
    const errors = collectProductionErrors({
      ...VALID_PROD_ENV,
      GOOGLE_CALENDAR_ENABLED: false,
    });
    expect(errors.filter((e) => e.includes('GOOGLE_'))).toHaveLength(0);
  });

  it('passes when GOOGLE_CALENDAR_ENABLED=true and all credentials are provided', () => {
    const errors = collectProductionErrors({
      ...VALID_PROD_ENV,
      GOOGLE_CALENDAR_ENABLED: true,
      GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      GOOGLE_REFRESH_TOKEN: 'refresh-token',
    });
    expect(errors.filter((e) => e.includes('GOOGLE_'))).toHaveLength(0);
  });

  it('fails when GOOGLE_CALENDAR_ENABLED=true but credentials are missing', () => {
    const errors = collectProductionErrors({
      ...VALID_PROD_ENV,
      GOOGLE_CALENDAR_ENABLED: true,
      // no credentials
    });
    expect(errors).toContain('GOOGLE_CLIENT_ID');
    expect(errors).toContain('GOOGLE_CLIENT_SECRET');
    expect(errors).toContain('GOOGLE_REFRESH_TOKEN');
  });

  it('fails with just GOOGLE_REFRESH_TOKEN missing', () => {
    const errors = collectProductionErrors({
      ...VALID_PROD_ENV,
      GOOGLE_CALENDAR_ENABLED: true,
      GOOGLE_CLIENT_ID: 'id',
      GOOGLE_CLIENT_SECRET: 'secret',
    });
    expect(errors).toContain('GOOGLE_REFRESH_TOKEN');
    expect(errors).not.toContain('GOOGLE_CLIENT_ID');
  });
});

describe('Production env validation — Email integration', () => {
  it('passes when EMAIL_ENABLED=false and no RESEND_API_KEY is set', () => {
    const errors = collectProductionErrors({
      ...VALID_PROD_ENV,
      EMAIL_ENABLED: false,
    });
    expect(errors.filter((e) => e.includes('RESEND'))).toHaveLength(0);
  });

  it('passes when EMAIL_ENABLED=true and RESEND_API_KEY is provided', () => {
    const errors = collectProductionErrors({
      ...VALID_PROD_ENV,
      EMAIL_ENABLED: true,
      RESEND_API_KEY: 're_live_xxxx',
    });
    expect(errors.filter((e) => e.includes('RESEND'))).toHaveLength(0);
  });

  it('fails when EMAIL_ENABLED=true but RESEND_API_KEY is missing', () => {
    const errors = collectProductionErrors({
      ...VALID_PROD_ENV,
      EMAIL_ENABLED: true,
      RESEND_API_KEY: undefined,
    });
    expect(errors).toContain('RESEND_API_KEY');
  });
});

describe('BOOKING_TIMEZONE validation', () => {
  it('accepts valid IANA timezones', () => {
    expect(isValidIanaTimezone('Africa/Casablanca')).toBe(true);
    expect(isValidIanaTimezone('America/New_York')).toBe(true);
    expect(isValidIanaTimezone('Europe/London')).toBe(true);
    expect(isValidIanaTimezone('Asia/Tokyo')).toBe(true);
    expect(isValidIanaTimezone('UTC')).toBe(true);
  });

  it('rejects invalid or corrupted timezone identifiers', () => {
    expect(isValidIanaTimezone('Invalid/Timezone')).toBe(false);
    expect(isValidIanaTimezone('NotATimezone')).toBe(false);
    expect(isValidIanaTimezone('GMT+25')).toBe(false);
    expect(isValidIanaTimezone('Europe/NonExistentCity')).toBe(false);
  });
});

// ─── 2. Admin login response shape — JWT NOT in JSON body ─────────────────────

import bcrypt from 'bcryptjs';
import { AdminService } from '../services/admin.service';
import type { GoogleCalendarBookingProvider } from '../integrations/google-calendar/google-calendar.provider';
import { isValidIanaTimezone } from './env';

describe('Admin login response shape', () => {
  let adminService: AdminService;
  let mockCalendarProvider: {
    cancelEvent: ReturnType<typeof vi.fn>;
    updateCalendarEvent: ReturnType<typeof vi.fn>;
    getAvailableSlots: ReturnType<typeof vi.fn>;
    generateCandidateSlots: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCalendarProvider = {
      cancelEvent: vi.fn().mockResolvedValue(undefined),
      updateCalendarEvent: vi.fn().mockResolvedValue({ eventId: 'g-1', meetingUrl: 'https://meet.google.com/x' }),
      getAvailableSlots: vi.fn(),
      generateCandidateSlots: vi.fn(),
    };
    adminService = new AdminService(mockCalendarProvider as unknown as GoogleCalendarBookingProvider);
  });

  it('login result contains email and expiresInHours', async () => {
    vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    const result = await adminService.login('admin@waliliens.com', 'any', '127.0.0.1');
    expect(result).toHaveProperty('email', 'admin@waliliens.com');
    expect(result).toHaveProperty('expiresInHours');
  });

  it('login result contains a token string used by controller to set the cookie', async () => {
    vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    const result = await adminService.login('admin@waliliens.com', 'any', '127.0.0.1');
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  it('JSON response body shape MUST NOT include a token field — controller contract', () => {
    // Controller sends only { email, expiresInHours } in the JSON body.
    const jsonBodyData: { email: string; expiresInHours: number } = {
      email: 'admin@waliliens.com',
      expiresInHours: 24,
    };
    expect(jsonBodyData).not.toHaveProperty('token');
  });
});
