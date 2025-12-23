import { Router } from 'express'
import { nanoid } from 'nanoid'
import { db } from '../db/index.js'
import { tenants, users } from '../db/schema.js'
import { eq, count } from 'drizzle-orm'
import { authenticate, requireOwner } from '../middleware/auth.js'

export const tenantRoutes = Router()

// All tenant routes require authentication
tenantRoutes.use(authenticate)

// List all tenants (owner only)
tenantRoutes.get('/', requireOwner, async (req, res) => {
  try {
    const results = await db.select().from(tenants)
      .where(eq(tenants.isOwner, false)) // Don't list owner tenant

    res.json({ tenants: results })
  } catch (error) {
    console.error('List tenants error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single tenant
tenantRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { tenantId, isOwner } = req.user!

    // Non-owners can only see their own tenant
    if (!isOwner && tenantId !== parseInt(id)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const [tenant] = await db.select().from(tenants)
      .where(eq(tenants.id, parseInt(id)))
      .limit(1)

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' })
    }

    // Get user count
    const [userCount] = await db.select({ count: count() }).from(users)
      .where(eq(users.tenantId, tenant.id))

    res.json({ tenant, userCount: userCount.count })
  } catch (error) {
    console.error('Get tenant error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create tenant (owner only)
tenantRoutes.post('/', requireOwner, async (req, res) => {
  try {
    const { name, tier } = req.body
    const tenantCode = nanoid(10).toUpperCase() // e.g., "XK9Q2MZLP1"

    const [tenant] = await db.insert(tenants).values({
      name,
      subdomain: tenantCode,
      tier,
      isOwner: false,
    }).returning()

    res.status(201).json({ tenant })
  } catch (error) {
    console.error('Create tenant error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update tenant (owner only)
tenantRoutes.patch('/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params
    const { name, tier, gatekeeperEnabled } = req.body

    const [tenant] = await db.update(tenants)
      .set({ name, tier, gatekeeperEnabled })
      .where(eq(tenants.id, parseInt(id)))
      .returning()

    res.json({ tenant })
  } catch (error) {
    console.error('Update tenant error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
