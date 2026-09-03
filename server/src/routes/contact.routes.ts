import { Router } from 'express';
import { submitContact } from '../controllers/contact.controller';
import { asyncHandler } from '../utils/async-handler';

export const contactRouter = Router();

contactRouter.post('/', asyncHandler(submitContact));
