import { db } from './index.js'
import { tenants, users } from './schema.js'
import bcrypt from 'bcryptjs'

const PASSWORD = 'systech@123'

async function seed() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  // === TENANTS ===

  // Owner tenant (SysTech - us)
  const [ownerTenant] = await db.insert(tenants).values({
    name: 'SysTech',
    subdomain: 'systech',
    isOwner: true,
    tier: 'enterprise',
  }).returning()
  console.log('Created owner tenant:', ownerTenant.name)

  // Client tenant (Acme Corp)
  const [clientTenant] = await db.insert(tenants).values({
    name: 'Acme Corp',
    subdomain: 'acme',
    isOwner: false,
    tier: 'enterprise',
  }).returning()
  console.log('Created client tenant:', clientTenant.name)

  // === INTERNAL USERS (Owner Side) ===

  await db.insert(users).values({
    email: 'ramesh@systech.com',
    passwordHash,
    name: 'Ramesh',
    role: 'admin',
    tenantId: ownerTenant.id,
  })
  console.log('Created internal user: ramesh@systech.com (admin)')

  await db.insert(users).values({
    email: 'mohan@systech.com',
    passwordHash,
    name: 'Mohan',
    role: 'support',
    tenantId: ownerTenant.id,
  })
  console.log('Created internal user: mohan@systech.com (support)')

  await db.insert(users).values({
    email: 'sakthi@systech.com',
    passwordHash,
    name: 'Sakthi',
    role: 'integrator',
    tenantId: ownerTenant.id,
  })
  console.log('Created internal user: sakthi@systech.com (integrator)')

  // === CLIENT USERS (Acme Corp) ===

  await db.insert(users).values({
    email: 'john@acme.com',
    passwordHash,
    name: 'John Doe',
    role: 'user',
    tenantId: clientTenant.id,
  })
  console.log('Created client user: john@acme.com (user)')

  await db.insert(users).values({
    email: 'jane@acme.com',
    passwordHash,
    name: 'Jane Smith',
    role: 'user',
    tenantId: clientTenant.id,
  })
  console.log('Created client user: jane@acme.com (user)')

  await db.insert(users).values({
    email: 'latha@acme.com',
    passwordHash,
    name: 'Latha',
    role: 'company_admin',
    tenantId: clientTenant.id,
  })
  console.log('Created client user: latha@acme.com (company_admin)')

  console.log('\n✅ Seed complete!')
  console.log('\n📋 All users password: systech@123')
  console.log('\nInternal Portal (http://localhost:3001):')
  console.log('  ramesh@systech.com  (admin)')
  console.log('  mohan@systech.com   (support)')
  console.log('  sakthi@systech.com  (integrator)')
  console.log('\nClient Portal (http://localhost:3000):')
  console.log('  john@acme.com       (user)')
  console.log('  jane@acme.com       (user)')
  console.log('  latha@acme.com      (company_admin)')
}

seed().catch(console.error)
