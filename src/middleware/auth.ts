import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type AuthTokenPayload, type Role } from '../lib/jwt.js';
import { unauthorized, forbidden } from '../lib/errors.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw unauthorized('Falta el token de autenticación.');
  }
  const token = header.slice('Bearer '.length);
  try {
    req.auth = verifyToken(token);
  } catch {
    throw unauthorized('Token inválido o expirado.');
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw unauthorized();
    }
    if (!roles.includes(req.auth.role)) {
      throw forbidden();
    }
    next();
  };
}
