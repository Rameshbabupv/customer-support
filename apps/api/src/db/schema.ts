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
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// User
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', {
    enum: ['user', 'gatekeeper', 'company_admin', 'approver', 'integrator', 'support', 'ceo', 'admin', 'developer']
  }).default('user'),
  tenantId: integer('tenant_id').references(() => tenants.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
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

// User-Product assignment (many-to-many)
export const userProducts = sqliteTable('user_products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
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

// Epic (Internal development planning)
export const epics = sqliteTable('epics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['backlog', 'planned', 'in_progress', 'completed', 'cancelled']
  }).default('backlog'),
  priority: integer('priority').default(3),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Feature (Part of an Epic)
export const features = sqliteTable('features', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  epicId: integer('epic_id').references(() => epics.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['backlog', 'planned', 'in_progress', 'completed', 'cancelled']
  }).default('backlog'),
  priority: integer('priority').default(3),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Dev Task (Task or Bug within a Feature)
export const devTasks = sqliteTable('dev_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  featureId: integer('feature_id').references(() => features.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type', {
    enum: ['task', 'bug']
  }).default('task'),
  status: text('status', {
    enum: ['todo', 'in_progress', 'review', 'done']
  }).default('todo'),
  priority: integer('priority').default(3),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Task Assignment (many-to-many: tasks ↔ developers)
export const taskAssignments = sqliteTable('task_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => devTasks.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Support Ticket to Dev Task link (many-to-many)
export const supportTicketTasks = sqliteTable('support_ticket_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticketId: integer('ticket_id').references(() => tickets.id).notNull(),
  taskId: integer('task_id').references(() => devTasks.id).notNull(),
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
  userProducts: many(userProducts),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  userProducts: many(userProducts),
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

export const userProductsRelations = relations(userProducts, ({ one }) => ({
  user: one(users, {
    fields: [userProducts.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [userProducts.productId],
    references: [products.id],
  }),
}))
