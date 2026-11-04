import { projectsRepository } from '../repositories/projects.repository';

export const projectsService = {
  getAll: () => projectsRepository.findAll(),
  getById: (id: string) => projectsRepository.findById(id),
};
