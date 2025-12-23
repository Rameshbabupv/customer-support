// Tenant
export interface Tenant {
  id: number
  name: string
  subdomain?: string
  isOwner: boolean
  tier: 'enterprise' | 'business' | 'starter'
  gatekeeperEnabled: boolean
  createdAt: string
}

// User
export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  tenantId: number
  createdAt: string
}

export type UserRole =
  | 'user'
  | 'gatekeeper'
  | 'company_admin'
  | 'approver'
  | 'integrator'
  | 'support'
  | 'ceo'
  | 'admin'

// Ticket
export interface Ticket {
  id: number
  title: string
  description?: string
  status: TicketStatus
  clientPriority: number
  clientSeverity: number
  internalPriority?: number
  internalSeverity?: number
  productId?: number
  userId: number
  assignedTo?: number
  integratorId?: number
  tenantId: number
  createdAt: string
  updatedAt: string
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

// Attachment
export interface Attachment {
  id: number
  ticketId: number
  fileUrl: string
  fileName: string
  fileSize?: number
  createdAt: string
}

// Comment
export interface TicketComment {
  id: number
  ticketId: number
  userId: number
  content: string
  isInternal: boolean
  createdAt: string
}

// Auth
export interface AuthResponse {
  user: User
  token: string
}

export interface JWTPayload {
  userId: number
  tenantId: number
  isOwner: boolean
  role: string
}
