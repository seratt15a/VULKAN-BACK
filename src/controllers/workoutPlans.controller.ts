import { z } from 'zod';
import type { Exercise, WorkoutPlan } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { toDateStr } from '../lib/dates.js';
import { notFound } from '../lib/errors.js';

function serializePlan(wp: WorkoutPlan, exercises: Exercise[]) {
  return {
    id: wp.id,
    memberId: wp.memberId,
    trainerId: wp.trainerId,
    title: wp.title,
    createdAt: toDateStr(wp.createdAt),
    exercises: [...exercises]
      .sort((a, b) => a.position - b.position)
      .map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, notes: e.notes ?? undefined, libraryKey: e.libraryKey ?? undefined })),
  };
}

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive(),
  reps: z.string().min(1),
  notes: z.string().optional(),
  libraryKey: z.string().optional(),
});

const createSchema = z.object({
  memberId: z.string().min(1),
  trainerId: z.string().min(1),
  title: z.string().min(1),
  exercises: z.array(exerciseSchema),
});

const patchSchema = z.object({
  title: z.string().optional(),
  exercises: z.array(exerciseSchema).optional(),
});

export async function list(_req: Request, res: Response) {
  const plans = await prisma.workoutPlan.findMany({ include: { exercises: true }, orderBy: { createdAt: 'asc' } });
  res.json(plans.map(({ exercises, ...wp }) => serializePlan(wp, exercises)));
}

export async function create(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const plan = await prisma.workoutPlan.create({
    data: {
      memberId: body.memberId,
      trainerId: body.trainerId,
      title: body.title,
      exercises: {
        create: body.exercises.map((e, i) => ({ ...e, position: i })),
      },
    },
    include: { exercises: true },
  });
  res.status(201).json(serializePlan(plan, plan.exercises));
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const body = patchSchema.parse(req.body);
  const existing = await prisma.workoutPlan.findUnique({ where: { id } });
  if (!existing) throw notFound('Rutina no encontrada.');

  const plan = await prisma.$transaction(async (tx) => {
    if (body.exercises) {
      await tx.exercise.deleteMany({ where: { workoutPlanId: id } });
    }
    return tx.workoutPlan.update({
      where: { id },
      data: {
        title: body.title,
        ...(body.exercises
          ? { exercises: { create: body.exercises.map((e, i) => ({ ...e, position: i })) } }
          : {}),
      },
      include: { exercises: true },
    });
  });
  res.json(serializePlan(plan, plan.exercises));
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.workoutPlan.findUnique({ where: { id } });
  if (!existing) throw notFound('Rutina no encontrada.');
  await prisma.workoutPlan.delete({ where: { id } });
  res.status(204).end();
}
