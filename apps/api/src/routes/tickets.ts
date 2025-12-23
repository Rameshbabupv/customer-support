import { Router } from 'express'
import { db } from '../db/index.js'
import { tickets, attachments, ticketComments } from '../db/schema.js'
import { eq, and, desc } from 'drizzle-orm'
import { authenticate, requireOwner } from '../middleware/auth.js'

export const ticketRoutes = Router()

// All ticket routes require authentication
ticketRoutes.use(authenticate)

// Create ticket
ticketRoutes.post('/', async (req, res) => {
  try {
    const { title, description, productId, clientPriority, clientSeverity } = req.body
    const { userId, tenantId } = req.user!

    const [ticket] = await db.insert(tickets).values({
      title,
      description,
      productId,
      clientPriority,
      clientSeverity,
      userId,
      tenantId,
      status: 'open',
    }).returning()

    res.status(201).json({ ticket })
  } catch (error) {
    console.error('Create ticket error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// List tickets (scoped by tenant, or all if owner)
ticketRoutes.get('/', async (req, res) => {
  try {
    const { tenantId, isOwner, userId, role } = req.user!
    const { status, assignedTo } = req.query

    let query = db.select().from(tickets)

    // Scope by tenant unless owner
    if (!isOwner) {
      query = query.where(eq(tickets.tenantId, tenantId))

      // Regular users only see their own tickets
      if (role === 'user') {
        query = query.where(eq(tickets.userId, userId))
      }
    }

    const results = await query.orderBy(desc(tickets.createdAt))
    res.json({ tickets: results })
  } catch (error) {
    console.error('List tickets error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single ticket
ticketRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { tenantId, isOwner } = req.user!

    const [ticket] = await db.select().from(tickets)
      .where(eq(tickets.id, parseInt(id)))
      .limit(1)

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Check access
    if (!isOwner && ticket.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Get attachments
    const ticketAttachments = await db.select().from(attachments)
      .where(eq(attachments.ticketId, ticket.id))

    // Get comments
    const comments = await db.select().from(ticketComments)
      .where(eq(ticketComments.ticketId, ticket.id))
      .orderBy(ticketComments.createdAt)

    res.json({ ticket, attachments: ticketAttachments, comments })
  } catch (error) {
    console.error('Get ticket error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update ticket (status, priority, assignment)
ticketRoutes.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, internalPriority, internalSeverity, assignedTo } = req.body
    const { tenantId, isOwner, role } = req.user!

    const [ticket] = await db.select().from(tickets)
      .where(eq(tickets.id, parseInt(id)))
      .limit(1)

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Check access
    if (!isOwner && ticket.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Only support/integrator/admin can set internal fields
    const canSetInternal = isOwner || ['support', 'integrator', 'admin', 'ceo'].includes(role)

    const updateData: any = { updatedAt: new Date().toISOString() }
    if (status) updateData.status = status
    if (canSetInternal && internalPriority) updateData.internalPriority = internalPriority
    if (canSetInternal && internalSeverity) updateData.internalSeverity = internalSeverity
    if (canSetInternal && assignedTo) updateData.assignedTo = assignedTo

    const [updated] = await db.update(tickets)
      .set(updateData)
      .where(eq(tickets.id, parseInt(id)))
      .returning()

    res.json({ ticket: updated })
  } catch (error) {
    console.error('Update ticket error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add comment
ticketRoutes.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params
    const { content, isInternal } = req.body
    const { userId, isOwner, role } = req.user!

    // Only owner-side users can add internal notes
    const canAddInternal = isOwner || ['support', 'integrator', 'admin', 'ceo'].includes(role)

    const [comment] = await db.insert(ticketComments).values({
      ticketId: parseInt(id),
      userId,
      content,
      isInternal: canAddInternal ? isInternal : false,
    }).returning()

    res.status(201).json({ comment })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
