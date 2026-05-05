import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

// ─── Augment Express Request ──────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

// ─── JWT payload shape ────────────────────────────────────────────────────────

interface JwtPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// ─── authenticate ─────────────────────────────────────────────────────────────

/**
 * Validates the Bearer JWT in the Authorization header.
 * Attaches `req.user = { id, role }` on success.
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'secret';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }
};

// ─── authorize ────────────────────────────────────────────────────────────────

/**
 * Role-based guard. Call after `authenticate`.
 * Usage: router.get('/admin/...', authenticate, authorize('admin'), handler)
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access forbidden: insufficient permissions' });
      return;
    }
    next();
  };
};
