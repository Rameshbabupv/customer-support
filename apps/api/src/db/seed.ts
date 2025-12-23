import { db } from './index.js'
import { tenants, users } from './schema.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Seeding database...')

  // Create owner tenant (us)
  const [ownerTenant] = await db.insert(tenants).values({
    name: 'SysTech',
    subdomain: 'systech',
    isOwner: true,
    tier: 'enterprise',
  }).returning()
  console.log('Created owner tenant:', ownerTenant.name)

  // Create client tenant
  const [clientTenant] = await db.insert(tenants).values({
    name: 'Acme Corp',
    subdomain: 'acme',
    isOwner: false,
    tier: 'enterprise',
  }).returning()
  console.log('Created client tenant:', clientTenant.name)

  // Create owner admin user
  const adminHash = await bcrypt.hash('admin123', 10)
  const [adminUser] = await db.insert(users).values({
    email: 'admin@systech.com',
    passwordHash: adminHash,
    name: 'Admin User',
    role: 'admin',
    tenantId: ownerTenant.id,
  }).returning()
  console.log('Created admin user:', adminUser.email)

  // Create support user
  const supportHash = await bcrypt.hash('support123', 10)
  const [supportUser] = await db.insert(users).values({
    email: 'support@systech.com',
    passwordHash: supportHash,
    name: 'Support Agent',
    role: 'support',
    tenantId: ownerTenant.id,
  }).returning()
  console.log('Created support user:', supportUser.email)

  // Create client user
  const userHash = await bcrypt.hash('user123', 10)
  const [clientUser] = await db.insert(users).values({
    email: 'john@acme.com',
    passwordHash: userHash,
    name: 'John Doe',
    role: 'user',
    tenantId: clientTenant.id,
  }).returning()
  console.log('Created client user:', clientUser.email)

  // Create client admin
  const clientAdminHash = await bcrypt.hash('admin123', 10)
  const [clientAdmin] = await db.insert(users).values({
    email: 'admin@acme.com',
    passwordHash: clientAdminHash,
    name: 'Acme Admin',
    role: 'company_admin',
    tenantId: clientTenant.id,
  }).returning()
  console.log('Created client admin:', clientAdmin.email)

  console.log('\n✅ Seed complete!')
  console.log('\nTest credentials:')
  console.log('  Owner Admin: admin@systech.com / admin123')
  console.log('  Support: support@systech.com / support123')
  console.log('  Client User: john@acme.com / user123')
  console.log('  Client Admin: admin@acme.com / admin123')
}

seed().catch(console.error)
