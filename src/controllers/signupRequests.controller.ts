import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import type { SignupRequest } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { toDateStr } from '../lib/dates.js';
import { conflict, notFound } from '../lib/errors.js';

function serialize(r: SignupRequest) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    planInterest: r.planInterest,
    requestedAt: toDateStr(r.requestedAt),
    status: r.status,
  };
}

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  planInterest: z.string().min(1),
});

const planFee: Record<string, number> = { Básico: 29, Pro: 49, Élite: 89 };

export async function list(_req: Request, res: Response) {
  const requests = await prisma.signupRequest.findMany({ orderBy: { requestedAt: 'desc' } });
  res.json(requests.map(serialize));
}

export async function create(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const request = await prisma.signupRequest.create({ data: body });
  res.status(201).json(serialize(request));
}

export async function approve(req: Request, res: Response) {
  const { id } = req.params;
  const { trainerId } = z.object({ trainerId: z.string().min(1) }).parse(req.body);

  const request = await prisma.signupRequest.findUnique({ where: { id } });
  if (!request) throw notFound('Solicitud no encontrada.');

  const emailTaken = await prisma.member.findFirst({ where: { email: request.email.trim().toLowerCase() } });
  if (emailTaken) {
    throw conflict(`Ya existe un miembro con el correo ${request.email}.`);
  }

  const tempPassword = crypto.randomBytes(6).toString('base64url');
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const today = new Date().toISOString().slice(0, 10);

  const member = await prisma.$transaction(async (tx) => {
    const created = await tx.member.create({
      data: {
        name: request.name,
        email: request.email.trim().toLowerCase(),
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(request.name)}&backgroundColor=e8112a`,
        plan: request.planInterest,
        status: 'activa',
        joinDate: new Date(`${today}T00:00:00.000Z`),
        nextPaymentDate: new Date(`${today}T00:00:00.000Z`),
        monthlyFee: planFee[request.planInterest] ?? 29,
        trainerId,
        weightGoalKg: 70,
      },
    });
    await tx.user.create({
      data: { email: created.email, passwordHash, role: 'MEMBER', memberId: created.id },
    });
    await tx.signupRequest.update({ where: { id }, data: { status: 'aprobado' } });
    return created;
  });

  res.json({ memberId: member.id, temporaryPassword: tempPassword });
}

export async function reject(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.signupRequest.findUnique({ where: { id } });
  if (!existing) throw notFound('Solicitud no encontrada.');
  await prisma.signupRequest.update({ where: { id }, data: { status: 'rechazado' } });
  res.status(204).end();
}
