import rateLimit from 'express-rate-limit';

// Public, unauthenticated endpoints that accept arbitrary input from anyone
// on the internet — limited per IP to keep them from being spammed by bots.
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos y vuelve a intentar.' },
});

// Looser limit for login, mainly to slow down password-guessing rather than
// block legitimate repeated attempts.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Espera unos minutos.' },
});

// Forgot-password sends an email each time it matches an account, so it gets
// the tightest limit to avoid using it to spam someone's inbox.
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en una hora.' },
});
