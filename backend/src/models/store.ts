import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, Lead, Deal, Activity } from '../types';

// ─── Seed helpers ─────────────────────────────────────────────────────────────

const now = new Date().toISOString();
const past = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();

const adminPw = bcrypt.hashSync('admin123', 10);
const salesPw = bcrypt.hashSync('sales123', 10);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users: User[] = [
  {
    id: uuidv4(),
    name: 'Admin User',
    email: 'admin@crm.com',
    password: adminPw,
    role: 'admin',
    createdAt: past(30),
  },
  {
    id: uuidv4(),
    name: 'Sarah Johnson',
    email: 'sarah@crm.com',
    password: salesPw,
    role: 'sales',
    createdAt: past(20),
  },
  {
    id: uuidv4(),
    name: 'Mark Williams',
    email: 'mark@crm.com',
    password: salesPw,
    role: 'sales',
    createdAt: past(15),
  },
];

// ─── Leads ────────────────────────────────────────────────────────────────────

export const leads: Lead[] = [
  {
    id: uuidv4(),
    userId: users[1].id,
    name: 'John Smith',
    email: 'john@techcorp.com',
    phone: '+1-555-0101',
    company: 'TechCorp Inc.',
    status: 'qualified',
    source: 'LinkedIn',
    notes: 'Interested in enterprise plan. Budget confirmed ~$50k.',
    createdAt: past(10),
    updatedAt: past(5),
  },
  {
    id: uuidv4(),
    userId: users[1].id,
    name: 'Emma Davis',
    email: 'emma@startupxyz.com',
    phone: '+1-555-0102',
    company: 'StartupXYZ',
    status: 'contacted',
    source: 'Cold Email',
    notes: 'Follow up needed next week',
    createdAt: past(8),
    updatedAt: past(3),
  },
  {
    id: uuidv4(),
    userId: users[1].id,
    name: 'Michael Chen',
    email: 'mchen@globalfirm.com',
    phone: '+1-555-0103',
    company: 'Global Firm LLC',
    status: 'proposal',
    source: 'Referral',
    notes: 'Sent proposal on Monday. Awaiting sign-off.',
    createdAt: past(7),
    updatedAt: past(2),
  },
  {
    id: uuidv4(),
    userId: users[2].id,
    name: 'Priya Patel',
    email: 'priya@innovate.io',
    phone: '+1-555-0104',
    company: 'Innovate.io',
    status: 'new',
    source: 'Website',
    notes: 'Filled out contact form.',
    createdAt: past(3),
    updatedAt: past(1),
  },
  {
    id: uuidv4(),
    userId: users[2].id,
    name: 'Carlos Ruiz',
    email: 'carlos@retailco.com',
    phone: '+1-555-0105',
    company: 'RetailCo',
    status: 'converted',
    source: 'Trade Show',
    notes: 'Closed! Annual plan signed.',
    createdAt: past(20),
    updatedAt: past(2),
  },
];

// ─── Deals ────────────────────────────────────────────────────────────────────

export const deals: Deal[] = [
  {
    id: uuidv4(),
    leadId: leads[0].id,
    userId: users[1].id,
    title: 'Enterprise License Deal',
    value: 50000,
    stage: 'negotiation',
    expectedCloseDate: '2024-12-31',
    notes: 'Pending legal review',
    createdAt: past(5),
    updatedAt: past(1),
  },
  {
    id: uuidv4(),
    leadId: leads[2].id,
    userId: users[1].id,
    title: 'Annual Subscription',
    value: 12000,
    stage: 'prospect',
    expectedCloseDate: '2024-11-30',
    notes: 'Initial discussion done',
    createdAt: past(3),
    updatedAt: past(1),
  },
  {
    id: uuidv4(),
    leadId: leads[4].id,
    userId: users[2].id,
    title: 'Retail Platform Setup',
    value: 18500,
    stage: 'won',
    expectedCloseDate: '2024-10-15',
    notes: 'Signed and invoiced.',
    createdAt: past(15),
    updatedAt: past(2),
  },
  {
    id: uuidv4(),
    leadId: leads[3].id,
    userId: users[2].id,
    title: 'Starter Package',
    value: 3000,
    stage: 'prospect',
    expectedCloseDate: '2024-12-15',
    notes: 'Exploring needs',
    createdAt: past(2),
    updatedAt: past(1),
  },
];

// ─── Activities ───────────────────────────────────────────────────────────────

export const activities: Activity[] = [
  {
    id: uuidv4(),
    leadId: leads[0].id,
    userId: users[1].id,
    type: 'call',
    title: 'Discovery Call',
    description: 'Discussed product requirements and budget',
    date: past(9),
    createdAt: past(9),
  },
  {
    id: uuidv4(),
    leadId: leads[0].id,
    userId: users[1].id,
    type: 'meeting',
    title: 'Product Demo',
    description: 'Showed enterprise features to stakeholders',
    date: past(6),
    createdAt: past(6),
  },
  {
    id: uuidv4(),
    leadId: leads[0].id,
    userId: users[1].id,
    type: 'note',
    title: 'Legal review pending',
    description: 'Sent contract to their legal team for review',
    date: past(2),
    createdAt: past(2),
  },
  {
    id: uuidv4(),
    leadId: leads[1].id,
    userId: users[1].id,
    type: 'follow-up',
    title: 'Follow-up reminder',
    description: 'Client requested callback next Tuesday',
    date: past(1),
    createdAt: past(1),
  },
  {
    id: uuidv4(),
    leadId: leads[4].id,
    userId: users[2].id,
    type: 'meeting',
    title: 'Kick-off Meeting',
    description: 'Onboarding session with RetailCo team',
    date: past(3),
    createdAt: past(3),
  },
];
