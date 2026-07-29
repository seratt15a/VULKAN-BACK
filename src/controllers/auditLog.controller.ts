import { z } from 'zod';
import type { AuditLogEntry } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

function serialize(e: AuditLogEntry) {
  return { id: e.id, timestamp: e.timestamp.toISOString(), actor: e.actor, action: e.action };
}

const createSchema = z.object({ actor: z.string().min(1), action: z.string().min(1) });

export async function list(_req: Request, res: Response) {
  const entries = await prisma.auditLogEntry.findMany({ orderBy: { timestamp: 'desc' } });
  res.json(entries.map(serialize));
}

export async function create(req: Request, res: Response) {
  const body = createSchema.parse(req.body);
  const entry = await prisma.auditLogEntry.create({ data: body });
  res.status(201).json(serialize(entry));
}
