import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as payments from '../controllers/payments.controller.js';

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

paymentsRouter.get('/', asyncHandler(payments.list));
paymentsRouter.post('/', requireRole('ADMIN', 'RECEPTION'), asyncHandler(payments.create));
paymentsRouter.patch('/:id', requireRole('ADMIN', 'RECEPTION'), asyncHandler(payments.update));
paymentsRouter.delete('/:id', requireRole('ADMIN', 'RECEPTION'), asyncHandler(payments.remove));
