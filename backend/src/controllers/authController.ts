import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { users } from '../models/store';
import { UserRole } from '../types';
import { signToken } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: string;
    };

    const existing = users.find((u) => u.email === email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      id: uuidv4(),
      name: name.trim(),
      email,
      password: hashedPassword,
      role: (role === 'admin' ? 'admin' : 'sales') as UserRole,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    const token = signToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = signToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export const getMe = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = users.find((u) => u.id === req.user?.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
