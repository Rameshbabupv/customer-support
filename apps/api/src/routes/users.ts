import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db/index.js'
import { users, userProducts } from '../db/schema.js'
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
      isActive: users.isActive,
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

// Update user (owner only)
userRoutes.patch('/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params
    const { name, role } = req.body

    const updateData: any = {}
    if (name) updateData.name = name
    if (role) updateData.role = role

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Toggle user active status (owner only)
userRoutes.patch('/:id/toggle', requireOwner, async (req, res) => {
  try {
    const { id } = req.params
    const uid = parseInt(id)

    // Get current status
    const [current] = await db.select().from(users).where(eq(users.id, uid)).limit(1)
    if (!current) {
      return res.status(404).json({ error: 'User not found' })
    }

    const newStatus = !current.isActive

    const [user] = await db.update(users)
      .set({ isActive: newStatus })
      .where(eq(users.id, uid))
      .returning()

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    })
  } catch (error) {
    console.error('Toggle user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's assigned products
userRoutes.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params
    const userId = parseInt(id)

    const assigned = await db.query.userProducts.findMany({
      where: eq(userProducts.userId, userId),
      with: {
        product: true,
      },
    })

    const productList = assigned.map((up: any) => up.product)
    res.json(productList)
  } catch (error) {
    console.error('Get user products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user's assigned products (owner only)
userRoutes.put('/:id/products', requireOwner, async (req, res) => {
  try {
    const { id } = req.params
    const { productIds } = req.body
    const userId = parseInt(id)

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array' })
    }

    // Delete existing assignments
    await db.delete(userProducts).where(eq(userProducts.userId, userId))

    // Create new assignments
    if (productIds.length > 0) {
      const values = productIds.map((productId: number) => ({
        userId,
        productId,
      }))
      await db.insert(userProducts).values(values)
    }

    // Return updated list
    const assigned = await db.query.userProducts.findMany({
      where: eq(userProducts.userId, userId),
      with: {
        product: true,
      },
    })

    const productList = assigned.map((up: any) => up.product)
    res.json(productList)
  } catch (error) {
    console.error('Update user products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
