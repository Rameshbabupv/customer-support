import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { eq } from 'drizzle-orm'
import * as schema from '../apps/api/src/db/schema.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '../apps/api/src/db/data.db')

const client = createClient({ url: `file:${dbPath}` })
const db = drizzle(client, { schema })

async function syncBeadsTickets() {
  // Get SysTech tenant and Tasklets product
  const [tenant] = await db.select().from(schema.tenants).where(eq(schema.tenants.name, 'SysTech')).limit(1)
  const [product] = await db.select().from(schema.products).where(eq(schema.products.name, 'Tasklets')).limit(1)
  const [internalClient] = await db.select().from(schema.clients).where(eq(schema.clients.name, 'Internal')).limit(1)

  if (!tenant || !product) {
    console.error('Missing tenant or Tasklets product')
    return
  }

  // Use Internal client or first client
  let clientId = internalClient?.id
  if (!clientId) {
    const [anyClient] = await db.select().from(schema.clients).limit(1)
    clientId = anyClient?.id
  }

  if (!clientId) {
    console.error('No client found')
    return
  }

  const beadsTickets = [
    {
      beadsId: 'customer-support-dto',
      title: 'SQLite Backup & Data Migration Script',
      description: `Create intelligent SQLite backup that reads data and inserts according to current architecture.

Requirements:
- NOT a raw dump/restore - must be schema-aware
- Read existing SQLite data programmatically
- Map to current schema (handle any schema drift)
- Preserve all content without data loss
- Development-friendly: can restore to fresh DB

Approach:
- Export each table to JSON/TypeScript objects
- Validate against current Drizzle schema
- Import script that uses Drizzle ORM (not raw SQL)
- Handle foreign key relationships correctly`,
      clientPriority: 1,
    },
    {
      beadsId: 'customer-support-bw9',
      title: 'PostgreSQL Migration with Stored Procedures',
      description: `Migrate from SQLite to PostgreSQL with backend optimizations.

Scope:
- Switch Drizzle adapter from SQLite to PostgreSQL
- Implement stored procedures for heavy operations
- Connection pooling setup
- Migration scripts (Drizzle migrate)

Stored Procedures Candidates:
- Bulk ticket operations
- Report aggregations
- Search/filtering with complex joins
- Audit log writes

Environment:
- Local: Docker PostgreSQL
- Prod: Managed PostgreSQL (Supabase/Neon/RDS)`,
      clientPriority: 1,
    },
    {
      beadsId: 'customer-support-bxx',
      title: 'AWS Access & Auto Deploy Setup with Karti',
      description: `Work with Karti to:
- Get AWS access credentials/IAM setup
- Configure auto-deploy pipeline for Tasklets
- CI/CD setup (GitHub Actions → AWS)
- Environment configuration (staging/prod)`,
      clientPriority: 2,
    },
    {
      beadsId: 'customer-support-vn0',
      title: "Deploy Tasklets on Venkatesh's Machine",
      description: `Local deployment of Tasklets app on Venkatesh's machine:
- Environment setup (Node, pnpm, dependencies)
- Database initialization
- App configuration
- Verify all features working`,
      clientPriority: 2,
    },
  ]

  for (const ticket of beadsTickets) {
    // Check if already exists (by title match)
    const [existing] = await db.select().from(schema.tickets)
      .where(eq(schema.tickets.title, ticket.title)).limit(1)

    if (existing) {
      console.log(`Ticket already exists: ${ticket.title}`)
      continue
    }

    await db.insert(schema.tickets).values({
      tenantId: tenant.id,
      clientId,
      productId: product.id,
      title: ticket.title,
      description: ticket.description,
      clientPriority: ticket.clientPriority,
      status: 'open',
    })
    console.log(`Created ticket: ${ticket.title}`)
  }

  console.log('Done!')
}

syncBeadsTickets().catch(console.error)
