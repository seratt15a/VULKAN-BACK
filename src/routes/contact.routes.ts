import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import * as contact from '../controllers/contact.controller.js';

export const contactRouter = Router();

// Public: the marketing landing page's contact form has no auth of its own.
contactRouter.post('/', publicFormLimiter, asyncHandler(contact.create));
