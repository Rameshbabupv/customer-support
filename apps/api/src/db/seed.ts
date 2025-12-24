import { db } from './index.js'
import { tenants, users, products, tenantProducts, epics, features, devTasks, taskAssignments } from './schema.js'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const PASSWORD = 'systech@123'

async function seed() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  // === TENANTS ===

  const [ownerTenant] = await db.insert(tenants).values({
    name: 'Systech-erp.ai',
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

  console.log('Created tenants: Systech-erp.ai, Acme Corp, TechCorp')

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

  const createdProducts: { id: number; name: string }[] = []
  for (const p of productList) {
    const [prod] = await db.insert(products).values(p).returning()
    createdProducts.push({ id: prod.id, name: prod.name })
  }
  console.log(`Created ${productList.length} products`)

  // Helper function to find product by name
  const findProduct = (name: string) => {
    const product = createdProducts.find(p => p.name === name)
    if (!product) throw new Error(`Product not found: ${name}`)
    return product.id
  }

  // Assign products to tenants
  // Systech-erp.ai (Owner): All products
  const ownerProductAssignments = createdProducts.map(p => ({
    tenantId: ownerTenant.id,
    productId: p.id,
  }))
  await db.insert(tenantProducts).values(ownerProductAssignments)

  // Acme Corp (Enterprise): CRM Sales, CRM Service, HRM v2, Finance v2, EXIM
  await db.insert(tenantProducts).values([
    { tenantId: acmeTenant.id, productId: findProduct('CRM Sales') },
    { tenantId: acmeTenant.id, productId: findProduct('CRM Service') },
    { tenantId: acmeTenant.id, productId: findProduct('HRM v2') },
    { tenantId: acmeTenant.id, productId: findProduct('Finance v2') },
    { tenantId: acmeTenant.id, productId: findProduct('EXIM') },
  ])

  // TechCorp (Business): MMS v2, TMS, HRM v2
  await db.insert(tenantProducts).values([
    { tenantId: techcorpTenant.id, productId: findProduct('MMS v2') },
    { tenantId: techcorpTenant.id, productId: findProduct('TMS') },
    { tenantId: techcorpTenant.id, productId: findProduct('HRM v2') },
  ])
  console.log('Assigned products to tenants')

  // === INTERNAL USERS (Systech-erp.ai - Owner) ===

  const internalUsers = [
    { email: 'ramesh@systech.com', name: 'Ramesh', role: 'admin' },
    { email: 'mohan@systech.com', name: 'Mohan', role: 'support' },
    { email: 'sakthi@systech.com', name: 'Sakthi', role: 'integrator' },
    { email: 'jai@systech.com', name: 'Jai', role: 'developer' },
    { email: 'priya@systech.com', name: 'Priya', role: 'developer' },
  ]

  const createdInternalUsers: any[] = []
  for (const u of internalUsers) {
    const [user] = await db.insert(users).values({
      email: u.email,
      passwordHash,
      name: u.name,
      role: u.role as any,
      tenantId: ownerTenant.id,
    }).returning()
    createdInternalUsers.push(user)
  }
  console.log('Created 5 internal users (2 developers)')

  const jaiId = createdInternalUsers.find(u => u.email === 'jai@systech.com')?.id
  const priyaId = createdInternalUsers.find(u => u.email === 'priya@systech.com')?.id

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

  // === DEV TASKS (Internal Development) ===

  // Epic 1: CRM Sales Enhancement
  const [crmEpic] = await db.insert(epics).values({
    productId: findProduct('CRM Sales'),
    title: 'Lead Management & Pipeline Improvements',
    description: 'Enhance lead tracking, scoring, and pipeline visualization',
    status: 'in_progress',
    priority: 1,
  }).returning()

  // Feature 1.1: Lead Scoring Engine
  const [leadScoringFeature] = await db.insert(features).values({
    epicId: crmEpic.id,
    title: 'Automated Lead Scoring',
    description: 'AI-based lead scoring based on engagement and demographics',
    status: 'in_progress',
    priority: 1,
  }).returning()

  // Tasks for Lead Scoring
  const [task1] = await db.insert(devTasks).values({
    featureId: leadScoringFeature.id,
    title: 'Design scoring algorithm',
    description: 'Define scoring rules and weightage for different attributes',
    type: 'task',
    status: 'done',
    priority: 1,
  }).returning()

  const [task2] = await db.insert(devTasks).values({
    featureId: leadScoringFeature.id,
    title: 'Implement scoring API endpoint',
    description: 'Create POST /api/leads/:id/score endpoint',
    type: 'task',
    status: 'in_progress',
    priority: 1,
  }).returning()

  const [task3] = await db.insert(devTasks).values({
    featureId: leadScoringFeature.id,
    title: 'Build scoring dashboard UI',
    description: 'Display lead scores in the CRM dashboard with color coding',
    type: 'task',
    status: 'todo',
    priority: 2,
  }).returning()

  // Assign tasks to developers
  await db.insert(taskAssignments).values([
    { taskId: task1.id, userId: jaiId },
    { taskId: task2.id, userId: jaiId },
    { taskId: task3.id, userId: priyaId },
  ])

  // Feature 1.2: Pipeline Visualization
  const [pipelineFeature] = await db.insert(features).values({
    epicId: crmEpic.id,
    title: 'Visual Pipeline Board',
    description: 'Kanban-style pipeline view with drag-drop',
    status: 'planned',
    priority: 2,
  }).returning()

  const [task4] = await db.insert(devTasks).values({
    featureId: pipelineFeature.id,
    title: 'Design pipeline stages',
    description: 'Define default stages and custom stage configuration',
    type: 'task',
    status: 'todo',
    priority: 2,
  }).returning()

  const [task5] = await db.insert(devTasks).values({
    featureId: pipelineFeature.id,
    title: 'Implement drag-drop library',
    description: 'Integrate react-beautiful-dnd for pipeline board',
    type: 'task',
    status: 'todo',
    priority: 2,
  }).returning()

  await db.insert(taskAssignments).values([
    { taskId: task4.id, userId: priyaId },
    { taskId: task5.id, userId: jaiId },
    { taskId: task5.id, userId: priyaId }, // Joint work
  ])

  // Epic 2: HRM v2 Attendance Module
  const [hrmEpic] = await db.insert(epics).values({
    productId: findProduct('HRM v2'),
    title: 'Biometric Attendance Integration',
    description: 'Integrate with multiple biometric devices and build attendance reports',
    status: 'backlog',
    priority: 3,
  }).returning()

  const [biometricFeature] = await db.insert(features).values({
    epicId: hrmEpic.id,
    title: 'Multi-device Biometric Sync',
    description: 'Support for ZKTeco, eSSL, and Anviz devices',
    status: 'backlog',
    priority: 3,
  }).returning()

  const [task6] = await db.insert(devTasks).values({
    featureId: biometricFeature.id,
    title: 'Research device APIs',
    description: 'Document API specifications for all 3 device types',
    type: 'task',
    status: 'todo',
    priority: 3,
  }).returning()

  await db.insert(taskAssignments).values([
    { taskId: task6.id, userId: jaiId },
  ])

  // Bug task
  const [bugTask] = await db.insert(devTasks).values({
    featureId: leadScoringFeature.id,
    title: 'Fix lead score calculation for null values',
    description: 'Handle null demographics gracefully without breaking scoring',
    type: 'bug',
    status: 'review',
    priority: 1,
  }).returning()

  await db.insert(taskAssignments).values([
    { taskId: bugTask.id, userId: priyaId },
  ])

  console.log('Created 2 epics, 3 features, 7 tasks with assignments')

  // === SUMMARY ===

  console.log('\n✅ Seed complete!')
  console.log('\n📋 All users password: systech@123')
  console.log('\n┌─────────────────────────────────────────────────────────┐')
  console.log('│ INTERNAL PORTAL (http://localhost:3001)                 │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log('│ ramesh@systech.com    admin                             │')
  console.log('│ mohan@systech.com     support                           │')
  console.log('│ sakthi@systech.com    integrator                        │')
  console.log('│ jai@systech.com       developer (has 4 assigned tasks)  │')
  console.log('│ priya@systech.com     developer (has 5 assigned tasks)  │')
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
