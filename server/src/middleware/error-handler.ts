import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/http-errors';
import { isDev } from '../config/env';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const reqId = req.requestId || (req.headers['x-request-id'] as string) || undefined;

  // Handle Operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        ...(reqId ? { requestId: reqId } : {}),
      },
    });
    return;
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const pathKey = issue.path.join('.') || 'body';
      if (!details[pathKey]) {
        details[pathKey] = [];
      }
      details[pathKey].push(issue.message);
    }

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload.',
        details,
        ...(reqId ? { requestId: reqId } : {}),
      },
    });
    return;
  }

  // Handle Bad JSON syntax error from express.json()
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body.',
        ...(reqId ? { requestId: reqId } : {}),
      },
    });
    return;
  }

  // Unexpected Internal Errors
  console.error(`[Unhandled Error] [${reqId || 'no-id'}]`, err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.',
      ...(isDev ? { debug: err.message } : {}),
      ...(reqId ? { requestId: reqId } : {}),
    },
  });
}
