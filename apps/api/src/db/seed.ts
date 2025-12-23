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
    // Legacy Products
    { name: 'CRM (legacy)', description: 'Customer Relationship Management - Marketing, lead generation, deal conversion' },
    { name: 'SDMS (legacy)', description: 'Supply & Distribution Management - Multi-location distributors (automobile, industrial, FMCG, food)' },
    { name: 'MMS (legacy)', description: 'Manufacturing Management System - Discrete manufacturing (machinery, fabrication, foundry, dies & moulds)' },
    { name: 'HTMS (legacy)', description: 'Home Textile Management System - Made-ups and home textile manufacturing' },
    { name: 'SMS (legacy)', description: 'Spinning Management System - Cotton to yarn conversion (first stage of textile supply chain)' },
    { name: 'HRM (legacy)', description: 'Human Resource Management - Recruitment to retirement, payroll, attendance, leave management' },
    { name: 'Finance (legacy)', description: 'Financial Management - Standalone and integrated finance module for all business metrics' },
    { name: 'Custom', description: 'Custom-made legacy applications for exclusive businesses and customers' },

    // New/v2 Products
    { name: 'CRM Sales', description: 'Customer Relationship Management v2 - Pre-sale customer engagement' },
    { name: 'CRM Service', description: 'Customer Relationship Management v2 - Post-sale customer support and service' },
    { name: 'SDMS v2', description: 'Supply & Distribution Management System - New version with enhanced features' },
    { name: 'MMS v2', description: 'Manufacturing Management System - New version with enhanced features' },
    { name: 'TMS', description: 'Textile Management System - Comprehensive solution for spinning, processing, weaving, knitting, apparel' },
    { name: 'HRM v2', description: 'Human Resource Management - New version with enhanced features' },
    { name: 'Finance v2', description: 'Financial Management - New version with enhanced features' },
    { name: 'EXIM', description: 'Export & Import Management - For businesses involved in international trade' },
  ]

  const createdProducts: number[] = []
  for (const p of productList) {
    const [prod] = await db.insert(products).values(p).returning()
    createdProducts.push(prod.id)
  }
  console.log(`Created ${productList.length} products`)

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
