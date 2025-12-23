import { Router } from 'express'
import { db } from '../db/index.js'
import { products, tenantProducts } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { authenticate, requireOwner } from '../middleware/auth.js'

export const productRoutes = Router()

// All routes require authentication
productRoutes.use(authenticate)

// List all products (for dropdown)
productRoutes.get('/', async (req, res) => {
  try {
    const allProducts = await db.select().from(products).orderBy(products.name)
    res.json(allProducts)
  } catch (error) {
    console.error('List products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new product (owner only)
productRoutes.post('/', requireOwner, async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' })
    }

    const [product] = await db.insert(products).values({
      name,
      description,
    }).returning()

    res.status(201).json(product)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Product already exists' })
    }
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Assign products to tenant (owner only)
productRoutes.post('/assign', requireOwner, async (req, res) => {
  try {
    const { tenantId, productIds } = req.body

    if (!tenantId || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'tenantId and productIds array required' })
    }

    // Insert all assignments
    const assignments = productIds.map((productId: number) => ({
      tenantId,
      productId,
    }))

    await db.insert(tenantProducts).values(assignments)

    res.status(201).json({ message: 'Products assigned', count: productIds.length })
  } catch (error) {
    console.error('Assign products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get products for a tenant
productRoutes.get('/tenant/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params

    const assigned = await db.query.tenantProducts.findMany({
      where: eq(tenantProducts.tenantId, parseInt(tenantId)),
      with: {
        product: true,
      },
    })

    const productList = assigned.map((tp: any) => tp.product)
    res.json(productList)
  } catch (error) {
    console.error('Get tenant products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
