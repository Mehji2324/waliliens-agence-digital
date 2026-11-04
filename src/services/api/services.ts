import { apiClient } from './client';
import { SERVICES } from '../../data/services';
import type { Service, ApiResponse } from '../../types';

// Mock fallback is only allowed when VITE_ENABLE_MOCK_API=true (dev-only).
// In production builds it is never set, so mock data never leaks to users.
const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_API === 'true';

export const servicesService = {
  async getAll(): Promise<ApiResponse<Service[]>> {
    try {
      const res = await apiClient.get<Service[]>('/api/services');
      if (res.isMock || !res.data || !Array.isArray(res.data)) {
        if (mockEnabled) return { data: SERVICES, status: 200, isMock: true };
      }
      return res;
    } catch {
      if (mockEnabled) return { data: SERVICES, status: 200, isMock: true };
      throw new Error('Failed to load services.');
    }
  },

  async getById(id: string): Promise<ApiResponse<Service | null>> {
    try {
      const res = await apiClient.get<Service>(`/api/services/${id}`);
      if (res.isMock || !res.data) {
        if (mockEnabled) {
          const found = SERVICES.find((s) => s.id === id) || null;
          return { data: found, status: found ? 200 : 404, isMock: true };
        }
      }
      return res;
    } catch {
      if (mockEnabled) {
        const found = SERVICES.find((s) => s.id === id) || null;
        return { data: found, status: found ? 200 : 404, isMock: true };
      }
      throw new Error(`Failed to load service ${id}.`);
    }
  },
};
