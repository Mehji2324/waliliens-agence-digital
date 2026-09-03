import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Attaches a unique request ID to every incoming request.
 * - Reads X-Request-ID header if already set by a proxy/load balancer.
 * - Falls back to a freshly generated UUID v4.
 * - Reflects the ID back in the response headers for client-side correlation.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const existing = req.headers['x-request-id'];
  const id = Array.isArray(existing) ? existing[0] : (existing ?? randomUUID());
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}
