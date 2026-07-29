import { z } from 'zod';
import type { CheckInRecord } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { toDateStr } from '../lib/dates.js';
import { notFound } from '../lib/errors.js';

function serializeCheckIn(c: CheckInRecord) {
  return { id: c.id, memberId: c.memberId, date: toDateStr(c.date), time: c.time };
}

const createSchema = z.object({ memberId: z.string().min(1) });

export async function list(_req: Request, res: Response) {
  const checkIns = await prisma.checkInRecord.findMany({ orderBy: { id: 'asc' } });
  res.json(checkIns.map(serializeCheckIn));
}

export async function create(req: Request, res: Response) {
  const { memberId } = createSchema.parse(req.body);
  const now = new Date();

  const checkIn = await prisma.$transaction(async (tx) => {
    const record = await tx.checkInRecord.create({
      data: {
        memberId,
        date: new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`),
        time: now.toTimeString().slice(0, 5),
      },
    });
    await tx.member.update({ where: { id: memberId }, data: { checkInCount: { increment: 1 } } });
    return record;
  });

  res.status(201).json(serializeCheckIn(checkIn));
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.checkInRecord.findUnique({ where: { id } });
  if (!existing) throw notFound('Check-in no encontrado.');

  await prisma.$transaction(async (tx) => {
    await tx.checkInRecord.delete({ where: { id } });
    const member = await tx.member.findUniqueOrThrow({ where: { id: existing.memberId } });
    await tx.member.update({
      where: { id: existing.memberId },
      data: { checkInCount: Math.max(0, member.checkInCount - 1) },
    });
  });

  res.status(204).end();
}
