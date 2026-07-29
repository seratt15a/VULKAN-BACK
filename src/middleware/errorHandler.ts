import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../lib/errors.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Datos inválidos.', details: err.flatten() });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'campo';
      res.status(409).json({ error: `Ya existe un registro con ese valor de ${fields}.` });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ error: 'Uno de los identificadores referenciados no existe (por ejemplo, miembro o entrenador).' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'El registro no fue encontrado.' });
      return;
    }
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}
