import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * CSRF protection via Origin/Referer header check.
 *
 * For state-changing admin endpoints (POST/PATCH/PUT/DELETE), we verify the
 * request's Origin (or Referer fallback) matches the known CLIENT_URL.
 * This pairs with sameSite:'strict' cookies as a defence-in-depth layer.
 *
 * Safe methods (GET, HEAD, OPTIONS) are always allowed.
 */
export function csrfOriginCheck(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers['origin'];
  const referer = req.headers['referer'];

  const allowed = [
    env.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  const sourceUrl = origin ?? referer ?? '';

  const isAllowed = allowed.some((allowedOrigin) => sourceUrl.startsWith(allowedOrigin));

  if (!isAllowed) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'CSRF check failed: request origin not permitted.',
      },
    });
    return;
  }

  return next();
}
