import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as auditLog from '../controllers/auditLog.controller.js';

export const auditLogRouter = Router();

auditLogRouter.use(requireAuth);

auditLogRouter.get('/', requireRole('ADMIN'), asyncHandler(auditLog.list));
auditLogRouter.post('/', asyncHandler(auditLog.create));
