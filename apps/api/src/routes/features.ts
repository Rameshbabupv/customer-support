import { Router } from 'express'
import { db } from '../db/index.js'
import { features } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import { authenticate, requireInternal } from '../middleware/auth.js'

export const featureRoutes = Router()

// All feature routes require authentication
featureRoutes.use(authenticate)

// Create feature (owner only)
featureRoutes.post('/', requireInternal, async (req, res) => {
  try {
    const { tenantId } = req.user!
    const { epicId, title, description, priority } = req.body

    if (!epicId || !title) {
      return res.status(400).json({ error: 'epicId and title are required' })
    }

    const [feature] = await db.insert(features).values({
      tenantId,
      epicId,
      title,
      description,
      priority: priority || 3,
      status: 'backlog',
    }).returning()

    res.status(201).json({ feature })
  } catch (error) {
    console.error('Create feature error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get features by epic (owner only)
featureRoutes.get('/', requireInternal, async (req, res) => {
  try {
    const { epicId } = req.query

    if (!epicId) {
      return res.status(400).json({ error: 'epicId query parameter is required' })
    }

    const results = await db.select().from(features)
      .where(eq(features.epicId, parseInt(epicId as string)))
      .orderBy(desc(features.createdAt))

    res.json({ features: results })
  } catch (error) {
    console.error('Get features error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update feature (owner only)
featureRoutes.patch('/:id', requireInternal, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, priority } = req.body

    const [feature] = await db.select().from(features)
      .where(eq(features.id, parseInt(id)))
      .limit(1)

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' })
    }

    const updateData: any = { updatedAt: new Date().toISOString() }
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status) updateData.status = status
    if (priority !== undefined) updateData.priority = priority

    const [updated] = await db.update(features)
      .set(updateData)
      .where(eq(features.id, parseInt(id)))
      .returning()

    res.json({ feature: updated })
  } catch (error) {
    console.error('Update feature error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Close feature with resolution (owner only)
featureRoutes.patch('/:id/close', requireInternal, async (req, res) => {
  try {
    const { id } = req.params
    const { resolution, resolutionNote } = req.body

    const validResolutions = ['completed', 'duplicate', 'wont_do', 'moved', 'invalid', 'obsolete']
    if (!resolution || !validResolutions.includes(resolution)) {
      return res.status(400).json({
        error: 'Valid resolution required',
        validResolutions
      })
    }

    const [feature] = await db.select().from(features)
      .where(eq(features.id, parseInt(id)))
      .limit(1)

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' })
    }

    const [updated] = await db.update(features)
      .set({
        status: 'cancelled',
        resolution,
        resolutionNote: resolutionNote || null,
        closedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(features.id, parseInt(id)))
      .returning()

    res.json({ feature: updated })
  } catch (error) {
    console.error('Close feature error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
