import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authRouter } from './routes/auth.routes.js';
import { membersRouter } from './routes/members.routes.js';
import { trainersRouter } from './routes/trainers.routes.js';
import { classesRouter } from './routes/classes.routes.js';
import { paymentsRouter } from './routes/payments.routes.js';
import { sessionPackagesRouter } from './routes/sessionPackages.routes.js';
import { workoutPlansRouter } from './routes/workoutPlans.routes.js';
import { checkInsRouter } from './routes/checkIns.routes.js';
import { signupRequestsRouter } from './routes/signupRequests.routes.js';
import { auditLogRouter } from './routes/auditLog.routes.js';
import { contactRouter } from './routes/contact.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Railway sits behind a reverse proxy; without this, every request looks
// like it comes from the same IP, which breaks per-IP rate limiting below.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/members', membersRouter);
app.use('/trainers', trainersRouter);
app.use('/classes', classesRouter);
app.use('/payments', paymentsRouter);
app.use('/session-packages', sessionPackagesRouter);
app.use('/workout-plans', workoutPlansRouter);
app.use('/check-ins', checkInsRouter);
app.use('/signup-requests', signupRequestsRouter);
app.use('/audit-log', auditLogRouter);
app.use('/contact', contactRouter);

app.use(errorHandler);
