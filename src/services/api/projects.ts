import { apiClient } from './client';
import { PROJECTS } from '../../data/projects';
import type { Project, ApiResponse } from '../../types';

// Mock fallback is only allowed when VITE_ENABLE_MOCK_API=true (dev-only).
// In production builds it is never set, so mock data never leaks to users.
const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_API === 'true';

export const projectsService = {
  async getAll(): Promise<ApiResponse<Project[]>> {
    try {
      const res = await apiClient.get<Project[]>('/api/projects');
      if (res.isMock || !res.data || !Array.isArray(res.data)) {
        if (mockEnabled) return { data: PROJECTS, status: 200, isMock: true };
      }
      return res;
    } catch {
      if (mockEnabled) return { data: PROJECTS, status: 200, isMock: true };
      throw new Error('Failed to load projects.');
    }
  },

  async getById(id: string): Promise<ApiResponse<Project | null>> {
    try {
      const res = await apiClient.get<Project>(`/api/projects/${id}`);
      if (res.isMock || !res.data) {
        if (mockEnabled) {
          const found = PROJECTS.find((p) => p.id === id) || null;
          return { data: found, status: found ? 200 : 404, isMock: true };
        }
      }
      return res;
    } catch {
      if (mockEnabled) {
        const found = PROJECTS.find((p) => p.id === id) || null;
        return { data: found, status: found ? 200 : 404, isMock: true };
      }
      throw new Error(`Failed to load project ${id}.`);
    }
  },
};
