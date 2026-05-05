import { UserRole } from '../types';
import jwt from 'jsonwebtoken';

// ─── JWT ──────────────────────────────────────────────────────────────────────

export const signToken = (id: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, role }, secret, { expiresIn } as jwt.SignOptions);
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginate = <T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; total: number; pages: number } => {
  const total = items.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return { data, total, pages };
};

// ─── Query parsing ────────────────────────────────────────────────────────────

export const parsePagination = (
  rawPage?: string,
  rawLimit?: string
): { page: number; limit: number } => ({
  page: Math.max(1, parseInt(rawPage || '1', 10) || 1),
  limit: Math.min(100, Math.max(1, parseInt(rawLimit || '10', 10) || 10)),
});
