import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import * as contact from '../controllers/contact.controller.js';

export const contactRouter = Router();

// Public: the marketing landing page's contact form has no auth of its own.
contactRouter.post('/', asyncHandler(contact.create));
