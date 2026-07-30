import { Router } from 'express';
import { changePassword, forgotPassword, login, me } from '../controllers/auth.controller.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { forgotPasswordLimiter, loginLimiter } from '../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, asyncHandler(login));
authRouter.get('/me', requireAuth, asyncHandler(me));
authRouter.patch('/password', requireAuth, asyncHandler(changePassword));
authRouter.post('/forgot-password', forgotPasswordLimiter, asyncHandler(forgotPassword));
