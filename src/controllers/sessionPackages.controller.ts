import { z } from 'zod';
import type { SessionPackage } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { parseDateStr, toDateStr } from '../lib/dates.js';
import { notFound } from '../lib/errors.js';

function serializePackage(p: SessionPackage) {
  return {
    id: p.id,
    memberId: p.memberId,
    totalSessions: p.totalSessions,
    usedSessions: p.usedSessions,
    purchaseDate: toDateStr(p.purchaseDate),
    expirationDate: toDateStr(p.expirationDate),
    price: p.price,
  };
}

const createSchema = z.object({
  memberId: z.string().min(1),
  totalSessions: z.number().int().positive(),
  usedSessions: z.number().int().min(0).default(0),
  purchaseDate: z.string(),
  expirationDate: z.string(),
  price: z.number(),
});

const patchSchema = createSchema.partial();

export async function list(_req: Request, res: Response) {
  const packages = await prisma.sessionPackage.findMany({ orderBy: { purchaseDate: 'desc' } });
  res.json(packages.map(serializePackage));
}

export async function create(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const pkg = await prisma.sessionPackage.create({
    data: { ...body, purchaseDate: parseDateStr(body.purchaseDate), expirationDate: parseDateStr(body.expirationDate) },
  });
  res.status(201).json(serializePackage(pkg));
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const body = patchSchema.parse(req.body);
  const existing = await prisma.sessionPackage.findUnique({ where: { id } });
  if (!existing) throw notFound('Paquete no encontrado.');

  const pkg = await prisma.sessionPackage.update({
    where: { id },
    data: {
      ...body,
      purchaseDate: body.purchaseDate ? parseDateStr(body.purchaseDate) : undefined,
      expirationDate: body.expirationDate ? parseDateStr(body.expirationDate) : undefined,
    },
  });
  res.json(serializePackage(pkg));
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.sessionPackage.findUnique({ where: { id } });
  if (!existing) throw notFound('Paquete no encontrado.');
  await prisma.sessionPackage.delete({ where: { id } });
  res.status(204).end();
}

export async function useSession(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.sessionPackage.findUnique({ where: { id } });
  if (!existing) throw notFound('Paquete no encontrado.');

  const pkg =
    existing.usedSessions < existing.totalSessions
      ? await prisma.sessionPackage.update({ where: { id }, data: { usedSessions: existing.usedSessions + 1 } })
      : existing;
  res.json(serializePackage(pkg));
}
