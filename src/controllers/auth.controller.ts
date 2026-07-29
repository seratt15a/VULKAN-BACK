import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { unauthorized } from '../lib/errors.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function sessionFromUser(user: {
  role: string;
  name: string | null;
  avatar: string | null;
  member: { id: string; name: string; avatar: string } | null;
  trainer: { id: string; name: string; avatar: string } | null;
}) {
  return {
    role: user.role.toLowerCase(),
    name: user.member?.name ?? user.trainer?.name ?? user.name ?? '',
    avatar: user.member?.avatar ?? user.trainer?.avatar ?? user.avatar ?? '',
    memberId: user.member?.id,
    trainerId: user.trainer?.id,
  };
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { member: true, trainer: true },
  });

  if (!user) {
    throw unauthorized('Correo o contraseña incorrectos.');
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    throw unauthorized('Correo o contraseña incorrectos.');
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    memberId: user.member?.id,
    trainerId: user.trainer?.id,
  });

  res.json({ token, session: sessionFromUser(user) });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.auth!.userId },
    include: { member: true, trainer: true },
  });
  res.json({ session: sessionFromUser(user) });
}
