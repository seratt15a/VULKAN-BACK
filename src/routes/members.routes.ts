import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as members from '../controllers/members.controller.js';

export const membersRouter = Router();

membersRouter.use(requireAuth);

membersRouter.get('/', asyncHandler(members.list));
membersRouter.post('/', requireRole('ADMIN'), asyncHandler(members.create));
membersRouter.patch('/:id', asyncHandler(members.update));
membersRouter.delete('/:id', requireRole('ADMIN'), asyncHandler(members.remove));
membersRouter.put('/:id/measurements', requireRole('ADMIN', 'TRAINER'), asyncHandler(members.upsertMeasurement));
membersRouter.post('/:id/photos', asyncHandler(members.addPhoto));
membersRouter.delete('/:id/photos', asyncHandler(members.deletePhoto));
