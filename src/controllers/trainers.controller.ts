import { z } from 'zod';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeTrainer } from '../lib/serializers.js';
import { conflict, forbidden, notFound } from '../lib/errors.js';

const createTrainerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().min(1),
  specialty: z.string().min(1),
  bio: z.string().default(''),
});

const patchTrainerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
});

async function assertEmailAvailable(email: string, excludeId?: string) {
  const existing = await prisma.trainer.findFirst({
    where: { email: { equals: email.trim().toLowerCase() }, id: excludeId ? { not: excludeId } : undefined },
  });
  if (existing) {
    throw conflict(`Ya existe un entrenador con el correo ${email}.`);
  }
}

function assertSelfOrAdmin(req: Request, trainerId: string) {
  const role = req.auth!.role;
  if (role === 'ADMIN') return;
  if (role === 'TRAINER' && req.auth!.trainerId === trainerId) return;
  throw forbidden();
}

async function withActiveStudents(trainers: Awaited<ReturnType<typeof prisma.trainer.findMany>>) {
  const counts = await prisma.member.groupBy({ by: ['trainerId'], _count: true });
  const countByTrainer = new Map(counts.map((c) => [c.trainerId, c._count]));
  return trainers.map((t) => serializeTrainer(t, countByTrainer.get(t.id) ?? 0));
}

export async function list(_req: Request, res: Response) {
  const trainers = await prisma.trainer.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(await withActiveStudents(trainers));
}

export async function create(req: Request, res: Response) {
  const body = createTrainerSchema.parse(req.body);
  await assertEmailAvailable(body.email);
  const trainer = await prisma.trainer.create({
    data: { ...body, email: body.email.trim().toLowerCase() },
  });
  res.status(201).json(serializeTrainer(trainer, 0));
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  assertSelfOrAdmin(req, id);
  const body = patchTrainerSchema.parse(req.body);

  const existing = await prisma.trainer.findUnique({ where: { id } });
  if (!existing) throw notFound('Entrenador no encontrado.');
  if (body.email) await assertEmailAvailable(body.email, id);

  const trainer = await prisma.trainer.update({
    where: { id },
    data: { ...body, email: body.email?.trim().toLowerCase() },
  });
  const activeStudents = await prisma.member.count({ where: { trainerId: id } });
  res.json(serializeTrainer(trainer, activeStudents));
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.trainer.findUnique({ where: { id } });
  if (!existing) throw notFound('Entrenador no encontrado.');

  const assignedClasses = await prisma.gymClass.count({ where: { trainerId: id } });
  if (assignedClasses > 0) {
    throw conflict('Este entrenador tiene clases asignadas. Reasigna sus clases antes de eliminarlo.');
  }

  await prisma.trainer.delete({ where: { id } });
  res.status(204).end();
}

export async function reassignClasses(req: Request, res: Response) {
  const { id } = req.params;
  const { toTrainerId } = z.object({ toTrainerId: z.string().min(1) }).parse(req.body);

  const target = await prisma.trainer.findUnique({ where: { id: toTrainerId } });
  if (!target) throw notFound('Entrenador destino no encontrado.');

  await prisma.gymClass.updateMany({ where: { trainerId: id }, data: { trainerId: toTrainerId } });
  res.status(204).end();
}
