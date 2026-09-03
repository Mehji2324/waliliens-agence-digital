import { apiClient } from './client';
import { PROJECTS } from '../../data/projects';
import type { Project, ApiResponse } from '../../types';

export const projectsService = {
  async getAll(): Promise<ApiResponse<Project[]>> {
    try {
      const res = await apiClient.get<Project[]>('/api/projects');
      if (res.isMock || !res.data || !Array.isArray(res.data)) {
        return { data: PROJECTS, status: 200, isMock: true };
      }
      return res;
    } catch {
      return { data: PROJECTS, status: 200, isMock: true };
    }
  },

  async getById(id: string): Promise<ApiResponse<Project | null>> {
    try {
      const res = await apiClient.get<Project>(`/api/projects/${id}`);
      if (res.isMock || !res.data) {
        const found = PROJECTS.find((p) => p.id === id) || null;
        return { data: found, status: found ? 200 : 404, isMock: true };
      }
      return res;
    } catch {
      const found = PROJECTS.find((p) => p.id === id) || null;
      return { data: found, status: found ? 200 : 404, isMock: true };
    }
  },
};
