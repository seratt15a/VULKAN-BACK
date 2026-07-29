import jwt from 'jsonwebtoken';

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error('JWT_SECRET no está definido en el entorno.');
  })();

export type Role = 'MEMBER' | 'TRAINER' | 'ADMIN' | 'RECEPTION';

export interface AuthTokenPayload {
  userId: string;
  role: Role;
  memberId?: string;
  trainerId?: string;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as AuthTokenPayload;
}
