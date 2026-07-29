import { z } from 'zod';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import type { ClassBooking, GymClass } from '@prisma/client';

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function serializeClass(c: GymClass, bookings: ClassBooking[]) {
  return {
    id: c.id,
    name: c.name,
    category: c.category,
    trainerId: c.trainerId,
    day: c.day,
    startTime: c.startTime,
    durationMin: c.durationMin,
    capacity: c.capacity,
    bookedIds: bookings.filter((b) => b.status === 'BOOKED').map((b) => b.memberId),
    waitlistIds: bookings.filter((b) => b.status === 'WAITLISTED').map((b) => b.memberId),
    attendedIds: bookings.filter((b) => b.attended).map((b) => b.memberId),
  };
}

async function loadClassSerialized(id: string) {
  const gymClass = await prisma.gymClass.findUnique({ where: { id }, include: { bookings: true } });
  if (!gymClass) throw notFound('Clase no encontrada.');
  const { bookings, ...rest } = gymClass;
  return serializeClass(rest, bookings);
}

async function findScheduleConflict(trainerId: string, day: string, startTime: string, durationMin: number, excludeId?: string) {
  const candidates = await prisma.gymClass.findMany({
    where: { trainerId, day, id: excludeId ? { not: excludeId } : undefined },
  });
  const start = toMinutes(startTime);
  const end = start + durationMin;
  return candidates.find((c) => {
    const otherStart = toMinutes(c.startTime);
    const otherEnd = otherStart + c.durationMin;
    return start < otherEnd && otherStart < end;
  });
}

const classSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  trainerId: z.string().min(1),
  day: z.string().min(1),
  startTime: z.string().min(1),
  durationMin: z.number().int().positive(),
  capacity: z.number().int().positive(),
});

const memberIdSchema = z.object({ memberId: z.string().min(1) });

function assertSelfMember(req: Request, memberId: string) {
  if (req.auth!.role === 'MEMBER' && req.auth!.memberId !== memberId) {
    throw forbidden();
  }
}

export async function list(_req: Request, res: Response) {
  const classes = await prisma.gymClass.findMany({ include: { bookings: true }, orderBy: { createdAt: 'asc' } });
  res.json(classes.map(({ bookings, ...c }) => serializeClass(c, bookings)));
}

export async function create(req: Request, res: Response) {
  const body = classSchema.parse(req.body);
  const trainerExists = await prisma.trainer.findUnique({ where: { id: body.trainerId } });
  if (!trainerExists) throw badRequest('El entrenador seleccionado no existe.');

  const clash = await findScheduleConflict(body.trainerId, body.day, body.startTime, body.durationMin);
  if (clash) {
    throw conflict(`El entrenador ya tiene "${clash.name}" el ${clash.day} a las ${clash.startTime}.`);
  }

  const gymClass = await prisma.gymClass.create({ data: body });
  res.status(201).json(serializeClass(gymClass, []));
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const body = classSchema.parse(req.body);

  const existing = await prisma.gymClass.findUnique({ where: { id }, include: { bookings: true } });
  if (!existing) throw notFound('Clase no encontrada.');

  const clash = await findScheduleConflict(body.trainerId, body.day, body.startTime, body.durationMin, id);
  if (clash) {
    throw conflict(`El entrenador ya tiene "${clash.name}" el ${clash.day} a las ${clash.startTime}.`);
  }

  const bookedCount = existing.bookings.filter((b) => b.status === 'BOOKED').length;
  if (body.capacity < bookedCount) {
    throw conflict(`El cupo no puede ser menor a los ${bookedCount} miembros ya inscritos.`);
  }

  const gymClass = await prisma.gymClass.update({ where: { id }, data: body });
  res.json(serializeClass(gymClass, existing.bookings));
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.gymClass.findUnique({ where: { id } });
  if (!existing) throw notFound('Clase no encontrada.');
  await prisma.gymClass.delete({ where: { id } });
  res.status(204).end();
}

export async function toggleBooking(req: Request, res: Response) {
  const { id: classId } = req.params;
  const { memberId } = memberIdSchema.parse(req.body);
  assertSelfMember(req, memberId);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.classBooking.findUnique({ where: { classId_memberId: { classId, memberId } } });

    if (existing?.status === 'BOOKED') {
      await tx.classBooking.delete({ where: { id: existing.id } });
      const nextWaitlisted = await tx.classBooking.findFirst({
        where: { classId, status: 'WAITLISTED' },
        orderBy: { createdAt: 'asc' },
      });
      if (nextWaitlisted) {
        await tx.classBooking.update({ where: { id: nextWaitlisted.id }, data: { status: 'BOOKED' } });
      }
      return;
    }

    const gymClass = await tx.gymClass.findUniqueOrThrow({ where: { id: classId } });
    const bookedCount = await tx.classBooking.count({ where: { classId, status: 'BOOKED' } });
    if (bookedCount >= gymClass.capacity) return;

    if (existing) {
      await tx.classBooking.update({ where: { id: existing.id }, data: { status: 'BOOKED' } });
    } else {
      await tx.classBooking.create({ data: { classId, memberId, status: 'BOOKED' } });
    }
  });

  res.json(await loadClassSerialized(classId));
}

export async function joinWaitlist(req: Request, res: Response) {
  const { id: classId } = req.params;
  const { memberId } = memberIdSchema.parse(req.body);
  assertSelfMember(req, memberId);

  const existing = await prisma.classBooking.findUnique({ where: { classId_memberId: { classId, memberId } } });
  if (!existing) {
    await prisma.classBooking.create({ data: { classId, memberId, status: 'WAITLISTED' } });
  }
  res.json(await loadClassSerialized(classId));
}

export async function leaveWaitlist(req: Request, res: Response) {
  const { id: classId } = req.params;
  const { memberId } = memberIdSchema.parse(req.body);
  assertSelfMember(req, memberId);

  await prisma.classBooking.deleteMany({ where: { classId, memberId, status: 'WAITLISTED' } });
  res.json(await loadClassSerialized(classId));
}

export async function toggleAttendance(req: Request, res: Response) {
  const { id: classId } = req.params;
  const { memberId } = memberIdSchema.parse(req.body);

  const booking = await prisma.classBooking.findUnique({ where: { classId_memberId: { classId, memberId } } });
  if (!booking) throw notFound('El miembro no está inscrito en esta clase.');

  const alreadyAttended = booking.attended;
  await prisma.classBooking.update({ where: { id: booking.id }, data: { attended: !alreadyAttended } });

  const member = await prisma.member.findUniqueOrThrow({ where: { id: memberId } });
  const nextCount = Math.max(0, member.checkInCount + (alreadyAttended ? -1 : 1));
  await prisma.member.update({ where: { id: memberId }, data: { checkInCount: nextCount } });

  res.json(await loadClassSerialized(classId));
}
