import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/http-errors';

export interface AdminUserPayload {
  sub: string;
  email: string;
  role: 'admin';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminUserPayload;
    }
  }
}

export function requireAdminAuth(req: Request, _res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[env.admin.cookieName];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return next(new UnauthorizedError('Admin authentication required. Please log in.'));
  }

  try {
    const decoded = jwt.verify(token, env.admin.sessionSecret) as AdminUserPayload;
    if (!decoded || !decoded.email) {
      return next(new UnauthorizedError('Invalid or expired admin session.'));
    }

    req.admin = decoded;
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired admin session.'));
  }
}
