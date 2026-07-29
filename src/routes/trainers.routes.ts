import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as trainers from '../controllers/trainers.controller.js';

export const trainersRouter = Router();

trainersRouter.use(requireAuth);

trainersRouter.get('/', asyncHandler(trainers.list));
trainersRouter.post('/', requireRole('ADMIN'), asyncHandler(trainers.create));
trainersRouter.patch('/:id', asyncHandler(trainers.update));
trainersRouter.delete('/:id', requireRole('ADMIN'), asyncHandler(trainers.remove));
trainersRouter.post('/:id/reassign-classes', requireRole('ADMIN'), asyncHandler(trainers.reassignClasses));
