import { Router } from 'express';
import { changePassword, login, me } from '../controllers/auth.controller.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(login));
authRouter.get('/me', requireAuth, asyncHandler(me));
authRouter.patch('/password', requireAuth, asyncHandler(changePassword));
