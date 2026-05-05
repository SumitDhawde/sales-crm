import { Response, NextFunction } from 'express';
import { users, leads, deals, activities } from '../models/store';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { LeadStatus, DealStage } from '../types';

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

export const getAllUsers = (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      leadsCount: leads.filter((l) => l.userId === u.id).length,
      dealsCount: deals.filter((d) => d.userId === u.id).length,
      activitiesCount: activities.filter((a) => a.userId === u.id).length,
      wonDealsValue: deals
        .filter((d) => d.userId === u.id && d.stage === 'won')
        .reduce((s, d) => s + d.value, 0),
    }));

    res.json({ success: true, data, total: data.length });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────

export const getUserWithLeads = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) throw new AppError('User not found', 404);

    const userLeads = leads
      .filter((l) => l.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const userDeals = deals.filter((d) => d.userId === user.id);

    const userActivities = activities
      .filter((a) => a.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = {
      totalLeads: userLeads.length,
      totalDeals: userDeals.length,
      totalActivities: userActivities.length,
      wonDealsValue: userDeals
        .filter((d) => d.stage === 'won')
        .reduce((s, d) => s + d.value, 0),
      pipelineValue: userDeals
        .filter((d) => d.stage === 'prospect' || d.stage === 'negotiation')
        .reduce((s, d) => s + d.value, 0),
    };

    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
        leads: userLeads,
        deals: userDeals,
        activities: userActivities,
        stats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────

export const getDashboardStats = (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const leadStatuses: LeadStatus[] = [
      'new',
      'contacted',
      'qualified',
      'proposal',
      'converted',
      'lost',
    ];
    const dealStages: DealStage[] = ['prospect', 'negotiation', 'won', 'lost'];

    const leadsByStatus = leadStatuses.reduce<Record<string, number>>((acc, s) => {
      acc[s] = leads.filter((l) => l.status === s).length;
      return acc;
    }, {});

    const dealsByStage = dealStages.reduce<Record<string, number>>((acc, s) => {
      acc[s] = deals.filter((d) => d.stage === s).length;
      return acc;
    }, {});

    const wonDeals = deals.filter((d) => d.stage === 'won');
    const activeDeals = deals.filter(
      (d) => d.stage === 'prospect' || d.stage === 'negotiation'
    );

    const stats = {
      totalUsers: users.length,
      salesUsers: users.filter((u) => u.role === 'sales').length,
      totalLeads: leads.length,
      totalDeals: deals.length,
      totalActivities: activities.length,
      totalRevenue: wonDeals.reduce((s, d) => s + d.value, 0),
      pipeline: activeDeals.reduce((s, d) => s + d.value, 0),
      winRate:
        deals.length > 0
          ? Math.round(
              (wonDeals.length /
                (wonDeals.length + deals.filter((d) => d.stage === 'lost').length || 1)) *
                100
            )
          : 0,
      leadsByStatus,
      dealsByStage,
      recentLeads: leads
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(({ id, name, email, company, status, createdAt }) => ({
          id, name, email, company, status, createdAt,
        })),
      topSalespeople: users
        .filter((u) => u.role === 'sales')
        .map((u) => ({
          id: u.id,
          name: u.name,
          wonDealsValue: deals
            .filter((d) => d.userId === u.id && d.stage === 'won')
            .reduce((s, d) => s + d.value, 0),
          leadsCount: leads.filter((l) => l.userId === u.id).length,
        }))
        .sort((a, b) => b.wonDealsValue - a.wonDealsValue),
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/leads ─────────────────────────────────────────────────────

export const getAllLeads = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { search, status, userId } = req.query as Record<string, string>;

    let filtered = [...leads];

    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q)
      );
    }
    if (status) filtered = filtered.filter((l) => l.status === status);
    if (userId) filtered = filtered.filter((l) => l.userId === userId);

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Attach owner name
    const enriched = filtered.map((l) => {
      const owner = users.find((u) => u.id === l.userId);
      return { ...l, ownerName: owner?.name || 'Unknown' };
    });

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (err) {
    next(err);
  }
};
