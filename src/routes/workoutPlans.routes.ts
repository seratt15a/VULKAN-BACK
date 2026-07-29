import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as plans from '../controllers/workoutPlans.controller.js';

export const workoutPlansRouter = Router();

workoutPlansRouter.use(requireAuth);

workoutPlansRouter.get('/', asyncHandler(plans.list));
workoutPlansRouter.post('/', requireRole('TRAINER', 'ADMIN'), asyncHandler(plans.create));
workoutPlansRouter.patch('/:id', requireRole('TRAINER', 'ADMIN'), asyncHandler(plans.update));
workoutPlansRouter.delete('/:id', requireRole('TRAINER', 'ADMIN'), asyncHandler(plans.remove));
