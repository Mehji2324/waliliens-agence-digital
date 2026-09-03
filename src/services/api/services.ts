import { apiClient } from './client';
import { SERVICES } from '../../data/services';
import type { Service, ApiResponse } from '../../types';

export const servicesService = {
  async getAll(): Promise<ApiResponse<Service[]>> {
    try {
      const res = await apiClient.get<Service[]>('/api/services');
      if (res.isMock || !res.data || !Array.isArray(res.data)) {
        return { data: SERVICES, status: 200, isMock: true };
      }
      return res;
    } catch {
      return { data: SERVICES, status: 200, isMock: true };
    }
  },

  async getById(id: string): Promise<ApiResponse<Service | null>> {
    try {
      const res = await apiClient.get<Service>(`/api/services/${id}`);
      if (res.isMock || !res.data) {
        const found = SERVICES.find((s) => s.id === id) || null;
        return { data: found, status: found ? 200 : 404, isMock: true };
      }
      return res;
    } catch {
      const found = SERVICES.find((s) => s.id === id) || null;
      return { data: found, status: found ? 200 : 404, isMock: true };
    }
  },
};
