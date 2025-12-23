import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db/index.js'
import { users, tenants } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { generateToken } from '../middleware/auth.js'

export const authRoutes = Router()

// Sign up
authRoutes.post('/signup', async (req, res) => {
  try {
    const { email, password, name, tenantId } = req.body

    // Check if user exists
    const existing = await db.select().from(users)
      .where(and(eq(users.email, email), eq(users.tenantId, tenantId)))
      .limit(1)

    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Get tenant
    const tenant = await db.select().from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1)

    if (tenant.length === 0) {
      return res.status(400).json({ error: 'Invalid tenant' })
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10)
    const [user] = await db.insert(users).values({
      email,
      passwordHash,
      name,
      tenantId,
      role: 'user',
    }).returning()

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId!,
      isOwner: tenant[0].isOwner!,
      role: user.role!,
    })

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sign in
authRoutes.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const [user] = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Get tenant
    const [tenant] = await db.select().from(tenants)
      .where(eq(tenants.id, user.tenantId!))
      .limit(1)

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId!,
      isOwner: tenant?.isOwner ?? false,
      role: user.role!,
    })

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isOwner: tenant?.isOwner ?? false },
      token,
    })
  } catch (error) {
    console.error('Signin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get current user
authRoutes.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' })
  }

  try {
    const jwt = await import('jsonwebtoken')
    const token = authHeader.split(' ')[1]
    const payload = jwt.default.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-prod') as any

    const [user] = await db.select().from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})
