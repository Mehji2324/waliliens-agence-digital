import { servicesRepository } from '../repositories/services.repository';

export const servicesService = {
  getAll: () => servicesRepository.findAll(),
  getById: (id: string) => servicesRepository.findById(id),
};
