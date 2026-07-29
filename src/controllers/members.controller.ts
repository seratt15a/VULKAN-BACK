import { z } from 'zod';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { memberInclude, serializeMember } from '../lib/serializers.js';
import { parseDateStr } from '../lib/dates.js';
import { conflict, forbidden, notFound } from '../lib/errors.js';

const emergencyContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
  relationship: z.string(),
});

const createMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().min(1),
  plan: z.string().min(1),
  status: z.string().min(1),
  joinDate: z.string(),
  nextPaymentDate: z.string(),
  monthlyFee: z.number(),
  checkIns: z.number().default(0),
  trainerId: z.string().optional(),
  currentStreakDays: z.number().default(0),
  weightGoalKg: z.number(),
  emergencyContact: emergencyContactSchema,
});

const patchMemberSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
  joinDate: z.string().optional(),
  nextPaymentDate: z.string().optional(),
  monthlyFee: z.number().optional(),
  checkIns: z.number().optional(),
  trainerId: z.string().optional(),
  currentStreakDays: z.number().optional(),
  weightGoalKg: z.number().optional(),
  emergencyContact: emergencyContactSchema.optional(),
  freezeRequest: z.object({ reason: z.string(), requestedAt: z.string() }).nullable().optional(),
});

const measurementSchema = z.object({
  date: z.string(),
  bodyFatPercent: z.number(),
  waistCm: z.number(),
  chestCm: z.number(),
  armCm: z.number(),
});

const photoSchema = z.object({
  date: z.string(),
  url: z.string().min(1),
  note: z.string().optional(),
});

async function assertEmailAvailable(email: string, excludeId?: string) {
  const existing = await prisma.member.findFirst({
    where: { email: { equals: email.trim().toLowerCase() }, id: excludeId ? { not: excludeId } : undefined },
  });
  if (existing) {
    throw conflict(`Ya existe un miembro con el correo ${email}.`);
  }
}

function assertSelfOrStaff(req: Request, memberId: string) {
  const role = req.auth!.role;
  if (role === 'ADMIN' || role === 'RECEPTION') return;
  if (role === 'MEMBER' && req.auth!.memberId === memberId) return;
  throw forbidden();
}

export async function list(_req: Request, res: Response) {
  const members = await prisma.member.findMany({ include: memberInclude, orderBy: { createdAt: 'asc' } });
  res.json(members.map(serializeMember));
}

export async function create(req: Request, res: Response) {
  const body = createMemberSchema.parse(req.body);
  await assertEmailAvailable(body.email);

  const member = await prisma.member.create({
    data: {
      name: body.name,
      email: body.email.trim().toLowerCase(),
      avatar: body.avatar,
      plan: body.plan,
      status: body.status,
      joinDate: parseDateStr(body.joinDate),
      nextPaymentDate: parseDateStr(body.nextPaymentDate),
      monthlyFee: body.monthlyFee,
      checkInCount: body.checkIns,
      trainerId: body.trainerId || null,
      currentStreakDays: body.currentStreakDays,
      weightGoalKg: body.weightGoalKg,
      emergencyContactName: body.emergencyContact.name,
      emergencyContactPhone: body.emergencyContact.phone,
      emergencyContactRelationship: body.emergencyContact.relationship,
    },
    include: memberInclude,
  });
  res.status(201).json(serializeMember(member));
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  assertSelfOrStaff(req, id);
  const body = patchMemberSchema.parse(req.body);

  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) throw notFound('Miembro no encontrado.');

  if (body.email) {
    await assertEmailAvailable(body.email, id);
  }

  const member = await prisma.member.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email?.trim().toLowerCase(),
      avatar: body.avatar,
      plan: body.plan,
      status: body.status,
      joinDate: body.joinDate ? parseDateStr(body.joinDate) : undefined,
      nextPaymentDate: body.nextPaymentDate ? parseDateStr(body.nextPaymentDate) : undefined,
      monthlyFee: body.monthlyFee,
      checkInCount: body.checkIns,
      trainerId: body.trainerId,
      currentStreakDays: body.currentStreakDays,
      weightGoalKg: body.weightGoalKg,
      emergencyContactName: body.emergencyContact?.name,
      emergencyContactPhone: body.emergencyContact?.phone,
      emergencyContactRelationship: body.emergencyContact?.relationship,
      ...(body.freezeRequest !== undefined
        ? {
            freezeReason: body.freezeRequest ? body.freezeRequest.reason : null,
            freezeRequestedAt: body.freezeRequest ? parseDateStr(body.freezeRequest.requestedAt) : null,
          }
        : {}),
    },
    include: memberInclude,
  });
  res.json(serializeMember(member));
}

export async function remove(_req: Request, res: Response) {
  const { id } = _req.params;
  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) throw notFound('Miembro no encontrado.');
  // ClassBooking rows cascade-delete automatically (onDelete: Cascade), so this
  // never leaves a "ghost seat" behind in any class's roster.
  await prisma.member.delete({ where: { id } });
  res.status(204).end();
}

export async function upsertMeasurement(req: Request, res: Response) {
  const { id } = req.params;
  const body = measurementSchema.parse(req.body);
  const date = parseDateStr(body.date);

  await prisma.bodyMeasurement.upsert({
    where: { memberId_date: { memberId: id, date } },
    update: { bodyFatPercent: body.bodyFatPercent, waistCm: body.waistCm, chestCm: body.chestCm, armCm: body.armCm },
    create: { memberId: id, date, bodyFatPercent: body.bodyFatPercent, waistCm: body.waistCm, chestCm: body.chestCm, armCm: body.armCm },
  });

  const member = await prisma.member.findUniqueOrThrow({ where: { id }, include: memberInclude });
  res.json(serializeMember(member));
}

export async function addPhoto(req: Request, res: Response) {
  const { id } = req.params;
  assertSelfOrStaff(req, id);
  const body = photoSchema.parse(req.body);

  await prisma.progressPhoto.create({
    data: { memberId: id, date: parseDateStr(body.date), url: body.url, note: body.note },
  });

  const member = await prisma.member.findUniqueOrThrow({ where: { id }, include: memberInclude });
  res.status(201).json(serializeMember(member));
}

export async function deletePhoto(req: Request, res: Response) {
  const { id } = req.params;
  assertSelfOrStaff(req, id);
  const { url, date } = z.object({ url: z.string(), date: z.string() }).parse(req.body);

  const photo = await prisma.progressPhoto.findFirst({ where: { memberId: id, url, date: parseDateStr(date) } });
  if (!photo) throw notFound('Foto no encontrada.');
  await prisma.progressPhoto.delete({ where: { id: photo.id } });

  const member = await prisma.member.findUniqueOrThrow({ where: { id }, include: memberInclude });
  res.json(serializeMember(member));
}
