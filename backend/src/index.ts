import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

// ─── Bootstrap ────────────────────────────────────────────────────────────────

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate limiting ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests — please try again later.',
  },
});

// Stricter limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts — please try again in 15 minutes.',
  },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api', routes);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║       Sales CRM API  🚀               ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  URL  : http://localhost:${PORT}        ║`);
  console.log(`║  ENV  : ${(process.env.NODE_ENV || 'development').padEnd(27)}║`);
  console.log('╠══════════════════════════════════════╣');
  console.log('║  Seed credentials:                   ║');
  console.log('║  admin@crm.com  /  admin123          ║');
  console.log('║  sarah@crm.com  /  sales123          ║');
  console.log('║  mark@crm.com   /  sales123          ║');
  console.log('╚══════════════════════════════════════╝\n');
});

export default app;
