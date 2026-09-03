import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/http-errors';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl || req.path}`));
}
