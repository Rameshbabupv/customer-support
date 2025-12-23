import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Tenant (Company)
export const tenants = sqliteTable('tenants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  subdomain: text('subdomain').unique(),
  isOwner: integer('is_owner', { mode: 'boolean' }).default(false),
  tier: text('tier', { enum: ['enterprise', 'business', 'starter'] }).default('starter'),
  gatekeeperEnabled: integer('gatekeeper_enabled', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// User
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', {
    enum: ['user', 'gatekeeper', 'company_admin', 'approver', 'integrator', 'support', 'ceo', 'admin']
  }).default('user'),
  tenantId: integer('tenant_id').references(() => tenants.id),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Product (our offerings - HRM, Payroll, etc.)
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Tenant-Product assignment (many-to-many)
export const tenantProducts = sqliteTable('tenant_products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Ticket
export const tickets = sqliteTable('tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['open', 'in_progress', 'resolved', 'closed']
  }).default('open'),
  clientPriority: integer('client_priority').default(3),
  clientSeverity: integer('client_severity').default(3),
  internalPriority: integer('internal_priority'),
  internalSeverity: integer('internal_severity'),
  productId: integer('product_id').references(() => products.id),
  userId: integer('user_id').references(() => users.id),
  assignedTo: integer('assigned_to').references(() => users.id),
  integratorId: integer('integrator_id').references(() => users.id),
  tenantId: integer('tenant_id').references(() => tenants.id),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Attachment
export const attachments = sqliteTable('attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticketId: integer('ticket_id').references(() => tickets.id),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Ticket Comment
export const ticketComments = sqliteTable('ticket_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticketId: integer('ticket_id').references(() => tickets.id),
  userId: integer('user_id').references(() => users.id),
  content: text('content').notNull(),
  isInternal: integer('is_internal', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Relations
export const ticketsRelations = relations(tickets, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tickets.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
}))

export const tenantsRelations = relations(tenants, ({ many }) => ({
  tickets: many(tickets),
  users: many(users),
  tenantProducts: many(tenantProducts),
}))

export const productsRelations = relations(products, ({ many }) => ({
  tenantProducts: many(tenantProducts),
}))

export const tenantProductsRelations = relations(tenantProducts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantProducts.tenantId],
    references: [tenants.id],
  }),
  product: one(products, {
    fields: [tenantProducts.productId],
    references: [products.id],
  }),
}))
