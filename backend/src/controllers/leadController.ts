import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { leads, deals, activities } from '../models/store';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { LeadStatus } from '../types';
import { paginate, parsePagination } from '../utils/helpers';

// ─── GET /api/leads ───────────────────────────────────────────────────────────

export const getLeads = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const {
      search,
      status,
      source,
      page,
      limit,
    } = req.query as Record<string, string>;

    // Role-based scoping: sales users only see their own leads
    let filtered =
      req.user?.role === 'admin'
        ? [...leads]
        : leads.filter((l) => l.userId === req.user?.id);

    // Search across name, email, company
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (status) {
      filtered = filtered.filter((l) => l.status === status);
    }

    // Source filter
    if (source) {
      filtered = filtered.filter(
        (l) => l.source.toLowerCase() === source.toLowerCase()
      );
    }

    // Sort newest first
    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const { page: pageNum, limit: limitNum } = parsePagination(page, limit);
    const { data, total, pages } = paginate(filtered, pageNum, limitNum);

    res.json({
      success: true,
      data,
      pagination: { total, page: pageNum, limit: limitNum, pages },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/leads/:id ───────────────────────────────────────────────────────

export const getLead = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const lead = leads.find((l) => l.id === req.params.id);
    if (!lead) throw new AppError('Lead not found', 404);

    if (req.user?.role !== 'admin' && lead.userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    // Attach related records
    const leadDeals = deals.filter((d) => d.leadId === lead.id);
    const leadActivities = activities
      .filter((a) => a.leadId === lead.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: { ...lead, deals: leadDeals, activities: leadActivities },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/leads ──────────────────────────────────────────────────────────

export const createLead = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body as {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      status?: LeadStatus;
      source?: string;
      notes?: string;
    };

    const now = new Date().toISOString();
    const lead = {
      id: uuidv4(),
      userId: req.user!.id,
      name: name.trim(),
      email,
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      status: (status || 'new') as LeadStatus,
      source: source?.trim() || '',
      notes: notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    leads.push(lead);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/leads/:id ───────────────────────────────────────────────────────

export const updateLead = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const idx = leads.findIndex((l) => l.id === req.params.id);
    if (idx === -1) throw new AppError('Lead not found', 404);

    if (req.user?.role !== 'admin' && leads[idx].userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    const { name, email, phone, company, status, source, notes } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
      status?: LeadStatus;
      source?: string;
      notes?: string;
    };

    leads[idx] = {
      ...leads[idx],
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(company !== undefined && { company: company.trim() }),
      ...(status !== undefined && { status }),
      ...(source !== undefined && { source: source.trim() }),
      ...(notes !== undefined && { notes: notes.trim() }),
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: leads[idx] });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/leads/:id ────────────────────────────────────────────────────

export const deleteLead = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const idx = leads.findIndex((l) => l.id === req.params.id);
    if (idx === -1) throw new AppError('Lead not found', 404);

    if (req.user?.role !== 'admin' && leads[idx].userId !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    const leadId = leads[idx].id;

    // Cascade-delete related deals and activities
    const dealIndices = deals
      .map((d, i) => (d.leadId === leadId ? i : -1))
      .filter((i) => i !== -1)
      .reverse();
    dealIndices.forEach((i) => deals.splice(i, 1));

    const activityIndices = activities
      .map((a, i) => (a.leadId === leadId ? i : -1))
      .filter((i) => i !== -1)
      .reverse();
    activityIndices.forEach((i) => activities.splice(i, 1));

    leads.splice(idx, 1);

    res.json({ success: true, message: 'Lead and related records deleted' });
  } catch (err) {
    next(err);
  }
};
