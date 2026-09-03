import { Router } from 'express';
import { getProjects, getProjectById } from '../controllers/projects.controller';
import { asyncHandler } from '../utils/async-handler';

export const projectsRouter = Router();

projectsRouter.get('/', asyncHandler(getProjects));
projectsRouter.get('/:id', asyncHandler(getProjectById));
