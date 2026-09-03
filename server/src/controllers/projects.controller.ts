import type { Request, Response } from 'express';
import { projectsService } from '../services/projects.service';
import { ok } from '../types/api';
import { NotFoundError } from '../utils/http-errors';

export async function getProjects(req: Request, res: Response): Promise<void> {
  const projects = await projectsService.getAll();
  res.status(200).json(ok(projects, req.requestId));
}

export async function getProjectById(req: Request, res: Response): Promise<void> {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  if (!id) {
    throw new NotFoundError('Project ID is required.');
  }

  const project = await projectsService.getById(id);

  if (!project) {
    throw new NotFoundError(`Project with ID "${id}" was not found.`);
  }

  res.status(200).json(ok(project, req.requestId));
}
