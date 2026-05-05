import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { activities, leads } from '../models/store';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ActivityType } from '../types';

// ─── GET /api/activities ──────────────────────────────────────────────────────

export const getActivities = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { leadId, type } = req.query as Record<string, string>;

    let filtered =
      req.user?.role === 'admin'
        ? [...activities]
        : activities.filter((a) => a.userId === req.user?.id);

    if (leadId) {
      filtered = filtered.filter((a) => a.leadId === leadId);
    }
    if (type) {
      filtered = filtered.filter((a) => a.type === type);
    }

    // Sort most recent first
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({ success: true, data: filtered, total: filtered.length });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/activities/:id ──────────────────────────────────────────────────

export const getActivity = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const activity = activities.find((a) => a.id === req.params.id);
    if (!activity) throw new AppError('Activity not found', 404);

    if (req.user?.role !== 'admin' && activity.userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/activities ─────────────────────────────────────────────────────

export const createActivity = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { leadId, type, title, description, date } = req.body as {
      leadId: string;
      type: ActivityType;
      title: string;
      description?: string;
      date?: string;
    };

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new AppError('Lead not found', 404);

    if (req.user?.role !== 'admin' && lead.userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    const now = new Date().toISOString();
    const activity = {
      id: uuidv4(),
      leadId,
      userId: req.user!.id,
      type,
      title: title.trim(),
      description: description?.trim() || '',
      date: date || now,
      createdAt: now,
    };

    activities.push(activity);
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/activities/:id ───────────────────────────────────────────────

export const deleteActivity = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const idx = activities.findIndex((a) => a.id === req.params.id);
    if (idx === -1) throw new AppError('Activity not found', 404);

    if (req.user?.role !== 'admin' && activities[idx].userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    activities.splice(idx, 1);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (err) {
    next(err);
  }
};
