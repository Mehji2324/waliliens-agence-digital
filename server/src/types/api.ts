// Standardized API response envelope used by all endpoints
export interface ApiSuccess<T> {
  success: true;
  data: T;
  requestId?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  requestId?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Helper builders — used in controllers to ensure consistent shape
export function ok<T>(data: T, requestId?: string): ApiSuccess<T> {
  return requestId
    ? { success: true, data, requestId }
    : { success: true, data };
}

export function fail(
  code: string,
  message: string,
  requestId?: string,
  details?: Record<string, string[]>
): ApiError {
  const err: ApiError = {
    success: false,
    error: { code, message },
  };
  if (details) err.error.details = details;
  if (requestId) err.requestId = requestId;
  return err;
}
