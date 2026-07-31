import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import * as signupRequests from '../controllers/signupRequests.controller.js';

export const signupRequestsRouter = Router();

// Public: anyone can submit a signup request from the marketing/signup page.
signupRequestsRouter.post('/', publicFormLimiter, asyncHandler(signupRequests.create));
// Public: confirms the email address behind a pending signup request.
signupRequestsRouter.post('/verify', publicFormLimiter, asyncHandler(signupRequests.verify));

signupRequestsRouter.get('/', requireAuth, requireRole('ADMIN'), asyncHandler(signupRequests.list));
signupRequestsRouter.post('/:id/approve', requireAuth, requireRole('ADMIN'), asyncHandler(signupRequests.approve));
signupRequestsRouter.post('/:id/reject', requireAuth, requireRole('ADMIN'), asyncHandler(signupRequests.reject));
