import { Router } from 'express';

import { register, login, getMe } from '../controllers/authController';
import { getLeads, getLead, createLead, updateLead, deleteLead } from '../controllers/leadController';
import { getDeals, getDealsByLead, createDeal, updateDeal, deleteDeal, getPipeline } from '../controllers/dealController';
import { getActivities, getActivity, createActivity, deleteActivity } from '../controllers/activityController';
import { getAllUsers, getUserWithLeads, getDashboardStats, getAllLeads } from '../controllers/adminController';

import { authenticate, authorize } from '../middleware/auth';
import {
  validate,
  registerValidator,
  loginValidator,
  createLeadValidator,
  updateLeadValidator,
  createDealValidator,
  updateDealValidator,
  createActivityValidator,
  paginationValidator,
} from '../middleware/validators';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────

router.post('/auth/register', registerValidator, validate, register);
router.post('/auth/login', loginValidator, validate, login);
router.get('/auth/me', authenticate, getMe);

// ─── Leads ────────────────────────────────────────────────────────────────────

router.get('/leads', authenticate, paginationValidator, validate, getLeads);
router.get('/leads/:id', authenticate, getLead);
router.post('/leads', authenticate, createLeadValidator, validate, createLead);
router.put('/leads/:id', authenticate, updateLeadValidator, validate, updateLead);
router.delete('/leads/:id', authenticate, deleteLead);

// ─── Deals ────────────────────────────────────────────────────────────────────

// NOTE: /pipeline must be registered BEFORE /:id to avoid route ambiguity
router.get('/deals/pipeline', authenticate, getPipeline);
router.get('/deals/lead/:leadId', authenticate, getDealsByLead);
router.get('/deals', authenticate, getDeals);
router.post('/deals', authenticate, createDealValidator, validate, createDeal);
router.put('/deals/:id', authenticate, updateDealValidator, validate, updateDeal);
router.delete('/deals/:id', authenticate, deleteDeal);

// ─── Activities ───────────────────────────────────────────────────────────────

router.get('/activities', authenticate, getActivities);
router.get('/activities/:id', authenticate, getActivity);
router.post('/activities', authenticate, createActivityValidator, validate, createActivity);
router.delete('/activities/:id', authenticate, deleteActivity);

// ─── Admin (admin role only) ──────────────────────────────────────────────────

router.get('/admin/stats', authenticate, authorize('admin'), getDashboardStats);
router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);
router.get('/admin/users/:id', authenticate, authorize('admin'), getUserWithLeads);
router.get('/admin/leads', authenticate, authorize('admin'), getAllLeads);

export default router;
