import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as classes from '../controllers/classes.controller.js';

export const classesRouter = Router();

classesRouter.use(requireAuth);

classesRouter.get('/', asyncHandler(classes.list));
classesRouter.post('/', requireRole('ADMIN'), asyncHandler(classes.create));
classesRouter.patch('/:id', requireRole('ADMIN'), asyncHandler(classes.update));
classesRouter.delete('/:id', requireRole('ADMIN'), asyncHandler(classes.remove));
classesRouter.post('/:id/toggle-booking', requireRole('MEMBER'), asyncHandler(classes.toggleBooking));
classesRouter.post('/:id/waitlist/join', requireRole('MEMBER'), asyncHandler(classes.joinWaitlist));
classesRouter.post('/:id/waitlist/leave', requireRole('MEMBER'), asyncHandler(classes.leaveWaitlist));
classesRouter.post('/:id/toggle-attendance', requireRole('ADMIN', 'TRAINER'), asyncHandler(classes.toggleAttendance));
