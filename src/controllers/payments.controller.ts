import { z } from 'zod';
import type { Payment } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { parseDateStr, toDateStr } from '../lib/dates.js';
import { notFound } from '../lib/errors.js';

function serializePayment(p: Payment) {
  return { id: p.id, memberId: p.memberId, amount: p.amount, date: toDateStr(p.date), plan: p.plan, status: p.status };
}

const createSchema = z.object({
  memberId: z.string().min(1),
  amount: z.number(),
  date: z.string(),
  plan: z.string().min(1),
  status: z.string().min(1),
});

const patchSchema = createSchema.partial();

export async function list(_req: Request, res: Response) {
  const payments = await prisma.payment.findMany({ orderBy: { date: 'desc' } });
  res.json(payments.map(serializePayment));
}

export async function create(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const payment = await prisma.payment.create({
    data: { ...body, date: parseDateStr(body.date) },
  });
  res.status(201).json(serializePayment(payment));
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const body = patchSchema.parse(req.body);
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw notFound('Pago no encontrado.');

  const payment = await prisma.payment.update({
    where: { id },
    data: { ...body, date: body.date ? parseDateStr(body.date) : undefined },
  });
  res.json(serializePayment(payment));
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw notFound('Pago no encontrado.');
  await prisma.payment.delete({ where: { id } });
  res.status(204).end();
}
