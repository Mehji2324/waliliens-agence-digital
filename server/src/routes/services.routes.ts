import { Router } from 'express';
import { getServices, getServiceById } from '../controllers/services.controller';
import { asyncHandler } from '../utils/async-handler';

export const servicesRouter = Router();

servicesRouter.get('/', asyncHandler(getServices));
servicesRouter.get('/:id', asyncHandler(getServiceById));
