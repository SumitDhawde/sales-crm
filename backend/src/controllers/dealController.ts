import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { deals, leads } from '../models/store';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { DealStage } from '../types';

// ─── GET /api/deals ───────────────────────────────────────────────────────────

export const getDeals = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { stage, leadId } = req.query as Record<string, string>;

    let filtered =
      req.user?.role === 'admin'
        ? [...deals]
        : deals.filter((d) => d.userId === req.user?.id);

    if (stage) {
      filtered = filtered.filter((d) => d.stage === stage);
    }
    if (leadId) {
      filtered = filtered.filter((d) => d.leadId === leadId);
    }

    // Sort newest first
    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({ success: true, data: filtered, total: filtered.length });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/deals/pipeline ──────────────────────────────────────────────────

export const getPipeline = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userDeals =
      req.user?.role === 'admin'
        ? [...deals]
        : deals.filter((d) => d.userId === req.user?.id);

    const stages: DealStage[] = ['prospect', 'negotiation', 'won', 'lost'];

    const pipeline = stages.reduce<Record<DealStage, typeof deals>>((acc, stage) => {
      acc[stage] = userDeals.filter((d) => d.stage === stage);
      return acc;
    }, {} as Record<DealStage, typeof deals>);

    const stats = {
      totalDeals: userDeals.length,
      totalValue: userDeals.reduce((s, d) => s + d.value, 0),
      wonValue: pipeline.won.reduce((s, d) => s + d.value, 0),
      lostValue: pipeline.lost.reduce((s, d) => s + d.value, 0),
      activeValue:
        pipeline.prospect.reduce((s, d) => s + d.value, 0) +
        pipeline.negotiation.reduce((s, d) => s + d.value, 0),
      winRate:
        userDeals.length > 0
          ? Math.round(
              ((pipeline.won.length /
                (pipeline.won.length + pipeline.lost.length || 1)) *
                100)
            )
          : 0,
    };

    res.json({ success: true, data: { pipeline, stats } });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/deals/lead/:leadId ──────────────────────────────────────────────

export const getDealsByLead = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const lead = leads.find((l) => l.id === req.params.leadId);
    if (!lead) throw new AppError('Lead not found', 404);

    if (req.user?.role !== 'admin' && lead.userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    const data = deals.filter((d) => d.leadId === req.params.leadId);
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/deals ──────────────────────────────────────────────────────────

export const createDeal = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { leadId, title, value, stage, expectedCloseDate, notes } = req.body as {
      leadId: string;
      title: string;
      value: number;
      stage?: DealStage;
      expectedCloseDate?: string;
      notes?: string;
    };

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new AppError('Lead not found', 404);

    if (req.user?.role !== 'admin' && lead.userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    const now = new Date().toISOString();
    const deal = {
      id: uuidv4(),
      leadId,
      userId: req.user!.id,
      title: title.trim(),
      value: parseFloat(String(value)),
      stage: (stage || 'prospect') as DealStage,
      expectedCloseDate: expectedCloseDate || '',
      notes: notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    deals.push(deal);
    res.status(201).json({ success: true, data: deal });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/deals/:id ───────────────────────────────────────────────────────

export const updateDeal = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const idx = deals.findIndex((d) => d.id === req.params.id);
    if (idx === -1) throw new AppError('Deal not found', 404);

    if (req.user?.role !== 'admin' && deals[idx].userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    const { title, value, stage, expectedCloseDate, notes } = req.body as {
      title?: string;
      value?: number;
      stage?: DealStage;
      expectedCloseDate?: string;
      notes?: string;
    };

    deals[idx] = {
      ...deals[idx],
      ...(title !== undefined && { title: title.trim() }),
      ...(value !== undefined && { value: parseFloat(String(value)) }),
      ...(stage !== undefined && { stage }),
      ...(expectedCloseDate !== undefined && { expectedCloseDate }),
      ...(notes !== undefined && { notes: notes.trim() }),
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: deals[idx] });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/deals/:id ────────────────────────────────────────────────────

export const deleteDeal = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const idx = deals.findIndex((d) => d.id === req.params.id);
    if (idx === -1) throw new AppError('Deal not found', 404);

    if (req.user?.role !== 'admin' && deals[idx].userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    deals.splice(idx, 1);
    res.json({ success: true, message: 'Deal deleted' });
  } catch (err) {
    next(err);
  }
};
