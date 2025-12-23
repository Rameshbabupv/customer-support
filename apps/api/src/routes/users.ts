import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { authenticate, requireOwner } from '../middleware/auth.js'

export const userRoutes = Router()

const STANDARD_PASSWORD = 'systech@123'

// All routes require authentication
userRoutes.use(authenticate)

// List users for a tenant (owner only)
userRoutes.get('/tenant/:tenantId', requireOwner, async (req, res) => {
  try {
    const { tenantId } = req.params

    const tenantUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users)
      .where(eq(users.tenantId, parseInt(tenantId)))

    res.json(tenantUsers)
  } catch (error) {
    console.error('List users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create user with specific role (owner only)
userRoutes.post('/', requireOwner, async (req, res) => {
  try {
    const { email, name, role, tenantId } = req.body

    if (!email || !name || !tenantId) {
      return res.status(400).json({ error: 'email, name, and tenantId are required' })
    }

    // Check if email exists in this tenant
    const existing = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(STANDARD_PASSWORD, 10)

    const [user] = await db.insert(users).values({
      email,
      name,
      role: role || 'user',
      tenantId,
      passwordHash,
    }).returning()

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
