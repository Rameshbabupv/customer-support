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
  sourceIdeaId: integer('source_idea_id').references(() => ideas.id), // SPARK: Lineage tracking
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
  sprintId: integer('sprint_id'), // null = backlog, set = assigned to sprint
  title: text('title').notNull(),
  description: text('description'),
  type: text('type', {
    enum: ['task', 'bug']
  }).default('task'),
  status: text('status', {
    enum: ['todo', 'in_progress', 'review', 'done']
  }).default('todo'),
  priority: integer('priority').default(3),
  storyPoints: integer('story_points'), // Fibonacci: 1,2,3,5,8,13
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

// ========================================
// SPRINT PLANNING
// ========================================

// Sprint (2-week iteration)
export const sprints = sqliteTable('sprints', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // e.g., "Jan-I-26", "Feb-II-26"
  goal: text('goal'), // Sprint goal description
  startDate: text('start_date').notNull(), // ISO date string
  endDate: text('end_date').notNull(), // ISO date (2 weeks from start)
  status: text('status', {
    enum: ['planning', 'active', 'completed', 'cancelled']
  }).default('planning'),
  velocity: integer('velocity'), // Auto-calculated on completion (sum of completed story points)
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Sprint Retrospective
export const sprintRetros = sqliteTable('sprint_retros', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sprintId: integer('sprint_id').references(() => sprints.id).notNull(),
  wentWell: text('went_well'), // What went well
  improvements: text('improvements'), // What to improve
  actionItems: text('action_items'), // Action items for next sprint
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Sprint Capacity (per developer per sprint)
export const sprintCapacity = sqliteTable('sprint_capacity', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sprintId: integer('sprint_id').references(() => sprints.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  availablePoints: integer('available_points').default(20), // Story points capacity
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// ========================================
// SPARK: Idea Management Feature
// ========================================

// Team (for idea visibility)
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  name: text('name').notNull(),
  productId: integer('product_id').references(() => products.id), // Optional: team can be product-based
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Team Members (many-to-many: users ↔ teams)
export const teamMembers = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role', { enum: ['member', 'lead'] }).default('member'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Idea (SPARK core entity)
export const ideas = sqliteTable('ideas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['inbox', 'discussing', 'vetted', 'in_progress', 'shipped', 'archived']
  }).default('inbox'),
  visibility: text('visibility', {
    enum: ['private', 'team', 'public']
  }).default('private'),
  teamId: integer('team_id').references(() => teams.id), // Required if visibility='team'
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
  publishedAt: text('published_at'), // When first shared (private → team/public)
  voteCount: integer('vote_count').default(0),
  commentCount: integer('comment_count').default(0),
})

// Idea Comments
export const ideaComments = sqliteTable('idea_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ideaId: integer('idea_id').references(() => ideas.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  comment: text('comment').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// Idea Reactions
export const ideaReactions = sqliteTable('idea_reactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ideaId: integer('idea_id').references(() => ideas.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  reaction: text('reaction', {
    enum: ['thumbs_up', 'heart', 'fire']
  }).notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Idea-Product link (which products are affected by this idea)
export const ideaProducts = sqliteTable('idea_products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ideaId: integer('idea_id').references(() => ideas.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Idea-Ticket link (lineage: which tickets came from this idea)
export const ideaTickets = sqliteTable('idea_tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ideaId: integer('idea_id').references(() => ideas.id).notNull(),
  ticketId: integer('ticket_id').references(() => tickets.id).notNull(),
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

// SPARK Relations
export const teamsRelations = relations(teams, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [teams.tenantId],
    references: [tenants.id],
  }),
  product: one(products, {
    fields: [teams.productId],
    references: [products.id],
  }),
  members: many(teamMembers),
  ideas: many(ideas),
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}))

export const ideasRelations = relations(ideas, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [ideas.tenantId],
    references: [tenants.id],
  }),
  team: one(teams, {
    fields: [ideas.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [ideas.createdBy],
    references: [users.id],
  }),
  comments: many(ideaComments),
  reactions: many(ideaReactions),
  products: many(ideaProducts),
  tickets: many(ideaTickets),
}))

export const ideaCommentsRelations = relations(ideaComments, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaComments.ideaId],
    references: [ideas.id],
  }),
  user: one(users, {
    fields: [ideaComments.userId],
    references: [users.id],
  }),
}))

export const ideaReactionsRelations = relations(ideaReactions, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaReactions.ideaId],
    references: [ideas.id],
  }),
  user: one(users, {
    fields: [ideaReactions.userId],
    references: [users.id],
  }),
}))

export const ideaProductsRelations = relations(ideaProducts, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaProducts.ideaId],
    references: [ideas.id],
  }),
  product: one(products, {
    fields: [ideaProducts.productId],
    references: [products.id],
  }),
}))

export const ideaTicketsRelations = relations(ideaTickets, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaTickets.ideaId],
    references: [ideas.id],
  }),
  ticket: one(tickets, {
    fields: [ideaTickets.ticketId],
    references: [tickets.id],
  }),
}))

// Sprint Relations
export const sprintsRelations = relations(sprints, ({ many, one }) => ({
  tasks: many(devTasks),
  capacities: many(sprintCapacity),
  retro: one(sprintRetros),
}))

export const sprintRetrosRelations = relations(sprintRetros, ({ one }) => ({
  sprint: one(sprints, {
    fields: [sprintRetros.sprintId],
    references: [sprints.id],
  }),
}))

export const sprintCapacityRelations = relations(sprintCapacity, ({ one }) => ({
  sprint: one(sprints, {
    fields: [sprintCapacity.sprintId],
    references: [sprints.id],
  }),
  user: one(users, {
    fields: [sprintCapacity.userId],
    references: [users.id],
  }),
}))

export const devTasksRelations = relations(devTasks, ({ one, many }) => ({
  feature: one(features, {
    fields: [devTasks.featureId],
    references: [features.id],
  }),
  sprint: one(sprints, {
    fields: [devTasks.sprintId],
    references: [sprints.id],
  }),
  assignments: many(taskAssignments),
}))
