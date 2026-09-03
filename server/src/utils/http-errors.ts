/**
 * Base application error class.
 * All custom errors extend this so the error handler can distinguish
 * operational errors from unexpected bugs.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — Request body or query parameters failed validation */
export class ValidationError extends AppError {
  constructor(message = 'Invalid request.', details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/** 401 — Authentication required or invalid session */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 — Forbidden action */
export class ForbiddenError extends AppError {
  constructor(message = 'Permission denied.') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 404 — Requested resource does not exist */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(message, 404, 'NOT_FOUND');
  }
}

/** 409 — Conflict (e.g. duplicate booking, duplicate submission) */
export class ConflictError extends AppError {
  constructor(message = 'Conflict with existing resource.') {
    super(message, 409, 'CONFLICT');
  }
}

/** 422 — Request is syntactically valid but semantically unprocessable */
export class UnprocessableError extends AppError {
  constructor(message = 'Unable to process request.') {
    super(message, 422, 'UNPROCESSABLE_ENTITY');
  }
}

/** 429 — Too many requests */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/** 503 — External provider (booking, email) is unavailable */
export class ExternalServiceError extends AppError {
  constructor(message = 'An external service is currently unavailable.') {
    super(message, 503, 'EXTERNAL_SERVICE_ERROR');
  }
}
