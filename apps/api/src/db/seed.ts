import { db } from './index.js'
import { tenants, users, products, tenantProducts } from './schema.js'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const PASSWORD = 'systech@123'

async function seed() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  // === TENANTS ===

  const [ownerTenant] = await db.insert(tenants).values({
    name: 'SysTech',
    subdomain: 'SYSTECH',  // Owner keeps fixed code
    isOwner: true,
    tier: 'enterprise',
  }).returning()

  const [acmeTenant] = await db.insert(tenants).values({
    name: 'Acme Corp',
    subdomain: nanoid(10).toUpperCase(),
    isOwner: false,
    tier: 'enterprise',
  }).returning()

  const [techcorpTenant] = await db.insert(tenants).values({
    name: 'TechCorp',
    subdomain: nanoid(10).toUpperCase(),
    isOwner: false,
    tier: 'business',
  }).returning()

  console.log('Created tenants: SysTech, Acme Corp, TechCorp')

  // === PRODUCTS (Our Offerings) ===

  const productList = [
    { name: 'HRM', description: 'Human Resource Management System' },
    { name: 'Payroll', description: 'Payroll & Compensation Management' },
    { name: 'Attendance', description: 'Time & Attendance Tracking' },
    { name: 'Leave Management', description: 'Leave Request & Approval System' },
    { name: 'Recruitment', description: 'Applicant Tracking & Hiring' },
    { name: 'Performance', description: 'Performance Review & Appraisal' },
  ]

  const createdProducts: number[] = []
  for (const p of productList) {
    const [prod] = await db.insert(products).values(p).returning()
    createdProducts.push(prod.id)
  }
  console.log('Created 6 products: HRM, Payroll, Attendance, Leave, Recruitment, Performance')

  // Assign products to tenants
  // Acme Corp: HRM, Payroll, Attendance
  await db.insert(tenantProducts).values([
    { tenantId: acmeTenant.id, productId: createdProducts[0] },
    { tenantId: acmeTenant.id, productId: createdProducts[1] },
    { tenantId: acmeTenant.id, productId: createdProducts[2] },
  ])

  // TechCorp: HRM, Leave Management
  await db.insert(tenantProducts).values([
    { tenantId: techcorpTenant.id, productId: createdProducts[0] },
    { tenantId: techcorpTenant.id, productId: createdProducts[3] },
  ])
  console.log('Assigned products to tenants')

  // === INTERNAL USERS (SysTech - Owner) ===

  const internalUsers = [
    { email: 'ramesh@systech.com', name: 'Ramesh', role: 'admin' },
    { email: 'mohan@systech.com', name: 'Mohan', role: 'support' },
    { email: 'sakthi@systech.com', name: 'Sakthi', role: 'integrator' },
    { email: 'jai@systech.com', name: 'Jai', role: 'support' },
    { email: 'priya@systech.com', name: 'Priya', role: 'support' },
  ]

  for (const u of internalUsers) {
    await db.insert(users).values({
      email: u.email,
      passwordHash,
      name: u.name,
      role: u.role as any,
      tenantId: ownerTenant.id,
    })
  }
  console.log('Created 5 internal users')

  // === CLIENT USERS (Acme Corp) ===

  const acmeUsers = [
    { email: 'john@acme.com', name: 'John Doe', role: 'user' },
    { email: 'jane@acme.com', name: 'Jane Smith', role: 'user' },
    { email: 'kumar@acme.com', name: 'Kumar', role: 'user' },
    { email: 'latha@acme.com', name: 'Latha', role: 'company_admin' },
    { email: 'deepa@acme.com', name: 'Deepa', role: 'company_admin' },
  ]

  for (const u of acmeUsers) {
    await db.insert(users).values({
      email: u.email,
      passwordHash,
      name: u.name,
      role: u.role as any,
      tenantId: acmeTenant.id,
    })
  }
  console.log('Created 5 Acme Corp users')

  // === CLIENT USERS (TechCorp) ===

  const techcorpUsers = [
    { email: 'alex@techcorp.com', name: 'Alex', role: 'user' },
    { email: 'sara@techcorp.com', name: 'Sara', role: 'user' },
    { email: 'mike@techcorp.com', name: 'Mike', role: 'company_admin' },
  ]

  for (const u of techcorpUsers) {
    await db.insert(users).values({
      email: u.email,
      passwordHash,
      name: u.name,
      role: u.role as any,
      tenantId: techcorpTenant.id,
    })
  }
  console.log('Created 3 TechCorp users')

  // === SUMMARY ===

  console.log('\n✅ Seed complete!')
  console.log('\n📋 All users password: systech@123')
  console.log('\n┌─────────────────────────────────────────────────────────┐')
  console.log('│ INTERNAL PORTAL (http://localhost:3001)                 │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log('│ ramesh@systech.com    admin                             │')
  console.log('│ mohan@systech.com     support                           │')
  console.log('│ sakthi@systech.com    integrator                        │')
  console.log('│ jai@systech.com       support (dev)                     │')
  console.log('│ priya@systech.com     support (dev)                     │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log('│ CLIENT PORTAL (http://localhost:3000)                   │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log('│ Acme Corp:                                              │')
  console.log('│   john@acme.com       user                              │')
  console.log('│   jane@acme.com       user                              │')
  console.log('│   kumar@acme.com      user                              │')
  console.log('│   latha@acme.com      company_admin                     │')
  console.log('│   deepa@acme.com      company_admin                     │')
  console.log('│ TechCorp:                                               │')
  console.log('│   alex@techcorp.com   user                              │')
  console.log('│   sara@techcorp.com   user                              │')
  console.log('│   mike@techcorp.com   company_admin                     │')
  console.log('└─────────────────────────────────────────────────────────┘')
}

seed().catch(console.error)
