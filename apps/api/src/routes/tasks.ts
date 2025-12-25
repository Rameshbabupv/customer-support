import { Router } from 'express'
import { db } from '../db/index.js'
import { devTasks, taskAssignments, supportTicketTasks, tickets } from '../db/schema.js'
import { eq, desc, inArray } from 'drizzle-orm'
import { authenticate, requireOwner } from '../middleware/auth.js'

export const taskRoutes = Router()

// All task routes require authentication
taskRoutes.use(authenticate)

// Create task (owner only)
taskRoutes.post('/', requireOwner, async (req, res) => {
  try {
    const { featureId, title, description, type, priority, assignees } = req.body

    if (!featureId || !title) {
      return res.status(400).json({ error: 'featureId and title are required' })
    }

    const [task] = await db.insert(devTasks).values({
      featureId,
      title,
      description,
      type: type || 'task',
      priority: priority || 3,
      status: 'todo',
    }).returning()

    // Assign developers if provided
    if (assignees && Array.isArray(assignees) && assignees.length > 0) {
      for (const userId of assignees) {
        await db.insert(taskAssignments).values({
          taskId: task.id,
          userId,
        })
      }
    }

    res.status(201).json({ task })
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get my tasks (for developers)
taskRoutes.get('/my-tasks', async (req, res) => {
  try {
    const { userId, role } = req.user!

    // Get task IDs assigned to this user
    const assignments = await db.select().from(taskAssignments)
      .where(eq(taskAssignments.userId, userId))

    if (assignments.length === 0) {
      return res.json({ tasks: [] })
    }

    const taskIds = assignments.map(a => a.taskId)
    const tasks = await db.select().from(devTasks)
      .where(inArray(devTasks.id, taskIds))
      .orderBy(desc(devTasks.createdAt))

    res.json({ tasks })
  } catch (error) {
    console.error('Get my tasks error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get tasks by product (for dashboard - owner only)
taskRoutes.get('/by-product/:productId', requireOwner, async (req, res) => {
  try {
    const { productId } = req.params

    // This requires a join through epics → features → tasks
    // For simplicity, we'll query all tasks and filter
    // In production, use a proper join query
    const allTasks = await db.select().from(devTasks)

    res.json({ tasks: allTasks })
  } catch (error) {
    console.error('Get tasks by product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update task (owner or assigned developer)
taskRoutes.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, priority, type } = req.body
    const { userId, isOwner } = req.user!

    const [task] = await db.select().from(devTasks)
      .where(eq(devTasks.id, parseInt(id)))
      .limit(1)

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Check access: owner or assigned developer
    if (!isOwner) {
      const assignments = await db.select().from(taskAssignments)
        .where(eq(taskAssignments.taskId, parseInt(id)))

      const userAssignment = assignments.find(a => a.userId === userId)
      if (!userAssignment) {
        return res.status(403).json({ error: 'Forbidden: Not assigned to this task' })
      }
    }

    const updateData: any = { updatedAt: new Date().toISOString() }
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (type) updateData.type = type
    if (req.body.storyPoints !== undefined) updateData.storyPoints = req.body.storyPoints
    if (req.body.sprintId !== undefined) updateData.sprintId = req.body.sprintId

    const [updated] = await db.update(devTasks)
      .set(updateData)
      .where(eq(devTasks.id, parseInt(id)))
      .returning()

    res.json({ task: updated })
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Assign developers to task (owner only)
taskRoutes.post('/:id/assign', requireOwner, async (req, res) => {
  try {
    const { id } = req.params
    const { userIds } = req.body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' })
    }

    const [task] = await db.select().from(devTasks)
      .where(eq(devTasks.id, parseInt(id)))
      .limit(1)

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Remove existing assignments
    await db.delete(taskAssignments)
      .where(eq(taskAssignments.taskId, parseInt(id)))

    // Add new assignments
    for (const userId of userIds) {
      await db.insert(taskAssignments).values({
        taskId: parseInt(id),
        userId,
      })
    }

    res.json({ success: true, message: 'Developers assigned successfully' })
  } catch (error) {
    console.error('Assign task error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Spawn task from support ticket (owner only)
taskRoutes.post('/spawn-from-ticket/:ticketId', requireOwner, async (req, res) => {
  try {
    const { ticketId } = req.params
    const { featureId, title, description, type } = req.body

    if (!featureId) {
      return res.status(400).json({ error: 'featureId is required' })
    }

    // Verify ticket exists
    const [ticket] = await db.select().from(tickets)
      .where(eq(tickets.id, parseInt(ticketId)))
      .limit(1)

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Create dev task
    const [task] = await db.insert(devTasks).values({
      featureId,
      title: title || `Bug from ticket: ${ticket.title}`,
      description: description || ticket.description || '',
      type: type || 'bug',
      status: 'todo',
      priority: 3,
    }).returning()

    // Link ticket to task
    await db.insert(supportTicketTasks).values({
      ticketId: parseInt(ticketId),
      taskId: task.id,
    })

    res.status(201).json({ task })
  } catch (error) {
    console.error('Spawn task from ticket error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Assign task to sprint (owner only)
taskRoutes.patch('/:id/sprint', requireOwner, async (req, res) => {
  try {
    const { id } = req.params
    const { sprintId } = req.body // null to move to backlog

    const [task] = await db.select().from(devTasks)
      .where(eq(devTasks.id, parseInt(id)))
      .limit(1)

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const [updated] = await db.update(devTasks)
      .set({ sprintId: sprintId ?? null, updatedAt: new Date().toISOString() })
      .where(eq(devTasks.id, parseInt(id)))
      .returning()

    res.json({ task: updated })
  } catch (error) {
    console.error('Assign sprint error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Set story points (owner only)
taskRoutes.patch('/:id/points', requireOwner, async (req, res) => {
  try {
    const { id } = req.params
    const { storyPoints } = req.body

    // Validate Fibonacci
    const validPoints = [1, 2, 3, 5, 8, 13]
    if (storyPoints !== null && !validPoints.includes(storyPoints)) {
      return res.status(400).json({ error: 'Story points must be Fibonacci: 1, 2, 3, 5, 8, or 13' })
    }

    const [task] = await db.select().from(devTasks)
      .where(eq(devTasks.id, parseInt(id)))
      .limit(1)

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const [updated] = await db.update(devTasks)
      .set({ storyPoints, updatedAt: new Date().toISOString() })
      .where(eq(devTasks.id, parseInt(id)))
      .returning()

    res.json({ task: updated })
  } catch (error) {
    console.error('Set points error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
