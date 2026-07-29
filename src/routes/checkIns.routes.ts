import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as checkIns from '../controllers/checkIns.controller.js';

export const checkInsRouter = Router();

checkInsRouter.use(requireAuth);

checkInsRouter.get('/', requireRole('ADMIN', 'RECEPTION'), asyncHandler(checkIns.list));
checkInsRouter.post('/', requireRole('ADMIN', 'RECEPTION'), asyncHandler(checkIns.create));
checkInsRouter.delete('/:id', requireRole('ADMIN', 'RECEPTION'), asyncHandler(checkIns.remove));
