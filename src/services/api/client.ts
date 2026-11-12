import type { ApiResponse, ApiError } from '../../types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Endpoints in this app already carry '/api/...' as their prefix.
    // - Default (empty string): relative requests go to /api/... on the same origin.
    //   Works both with the Vite proxy in dev and behind Nginx in production.
    // - Absolute VITE_API_URL (e.g. "https://api.example.com"): the explicit
    //   origin is used; the /api prefix in the endpoint path is preserved so
    //   the full URL becomes "https://api.example.com/api/...".
    this.baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
      : '';
  }


  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const base = this.baseUrl; // '' or 'https://api.example.com'
      // endpoint always starts with '/api/...' — concatenate directly
      const url = `${base}${endpoint}`;
      const headers = new Headers(options.headers);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const apiError: ApiError = {
          code: errorJson?.error?.code || errorJson?.code || 'HTTP_ERROR',
          message: errorJson?.error?.message || errorJson?.message || `Request failed with status ${response.status}`,
          details: errorJson?.error?.details || errorJson?.details,
        };
        throw apiError;
      }

      const json = await response.json();
      // Extract from standardized envelope if present: { success: true, data: T }
      const payload: T = json && typeof json === 'object' && 'data' in json && json.data !== undefined
        ? json.data
        : (json as T);

      return {
        success: json?.success !== undefined ? json.success : response.ok,
        data: payload,
        status: response.status,
        message: json?.message,
      };
    } catch (error) {
      if ((error as ApiError).code) {
        throw error as ApiError;
      }

      const apiError: ApiError = {
        code: 'NETWORK_ERROR',
        message: (error as Error).message || 'Unable to connect to the backend server.',
      };
      throw apiError;
    }
  }

  public get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
