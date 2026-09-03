import type { Request, Response } from 'express';
import { servicesService } from '../services/services.service';
import { ok } from '../types/api';
import { NotFoundError } from '../utils/http-errors';

export async function getServices(req: Request, res: Response): Promise<void> {
  const services = await servicesService.getAll();
  res.status(200).json(ok(services, req.requestId));
}

export async function getServiceById(req: Request, res: Response): Promise<void> {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  if (!id) {
    throw new NotFoundError('Service ID is required.');
  }

  const service = await servicesService.getById(id);

  if (!service) {
    throw new NotFoundError(`Service with ID "${id}" was not found.`);
  }

  res.status(200).json(ok(service, req.requestId));
}
