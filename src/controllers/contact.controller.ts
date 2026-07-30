import { z } from 'zod';
import type { Request, Response } from 'express';
import { ApiError } from '../lib/errors.js';
import { sendContactMessage } from '../lib/mailer.js';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

export async function create(req: Request, res: Response) {
  const body = contactSchema.parse(req.body);

  const sent = await sendContactMessage(body);
  if (!sent) {
    throw new ApiError(502, 'No se pudo enviar tu mensaje. Intenta de nuevo más tarde o escríbenos directamente.');
  }

  res.status(204).end();
}
