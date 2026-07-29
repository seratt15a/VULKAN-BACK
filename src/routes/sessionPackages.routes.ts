import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as packages from '../controllers/sessionPackages.controller.js';

export const sessionPackagesRouter = Router();

sessionPackagesRouter.use(requireAuth);

sessionPackagesRouter.get('/', asyncHandler(packages.list));
sessionPackagesRouter.post('/', requireRole('ADMIN'), asyncHandler(packages.create));
sessionPackagesRouter.patch('/:id', requireRole('ADMIN'), asyncHandler(packages.update));
sessionPackagesRouter.delete('/:id', requireRole('ADMIN'), asyncHandler(packages.remove));
sessionPackagesRouter.post('/:id/use', requireRole('ADMIN'), asyncHandler(packages.useSession));
