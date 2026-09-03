import type { ApiResponse, ApiError } from '../../types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
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
