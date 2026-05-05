export type UserRole = 'admin' | 'sales'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost'

export interface Lead {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  source: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type DealStage = 'prospect' | 'negotiation' | 'won' | 'lost'

export interface Deal {
  id: string
  leadId: string
  userId: string
  title: string
  value: number
  stage: DealStage
  expectedCloseDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type ActivityType = 'call' | 'meeting' | 'note' | 'follow-up'

export interface Activity {
  id: string
  leadId: string
  userId: string
  type: ActivityType
  title: string
  description: string
  date: string
  createdAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  pagination?: PaginationMeta
  token?: string
  user?: User
}

export interface DashboardStats {
  totalLeads: number
  totalDeals: number
  totalRevenue: number
  pipeline: number
  leadsByStatus: Record<LeadStatus, number>
  dealsByStage: Record<DealStage, number>
}

export interface AdminDashboardStats extends DashboardStats {
  totalUsers: number
  salesUsers: number
}
