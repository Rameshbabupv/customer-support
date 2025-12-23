# Tenant Onboarding

**Status:** Completed
**Date:** 2025-12-22

## Summary
Single form to onboard new client: company info + products + admin user

## What was built

### API Endpoints
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `PATCH /api/products/:id` - Update product
- `POST /api/products/assign` - Assign products to tenant
- `GET /api/products/tenant/:id` - Get tenant's products
- `PUT /api/products/tenant/:id` - Update tenant's products
- `GET /api/users/tenant/:id` - List tenant users
- `POST /api/users` - Create user with standard password

### Schema Changes
- `products` table (global offerings)
- `tenantProducts` junction table (many-to-many)
- Tenant code auto-generated using nanoid (10-char uppercase)

### Internal Portal UI
1. **Tenants page** - Tenant name is clickable link to edit
2. **Add Tenant modal** - Company info + products + admin user
3. **Edit Tenant modal** - Update info + manage products
4. **Products page** - CRUD for product catalog

### UX Improvements
- Required fields: red when empty, green when filled
- Helper text under each field
- Email verification note with default password

## Products Seeded (15)
HRM, Payroll, Attendance, Leave Management, Recruitment, Performance, Employee Self Service, Training & LMS, Asset Management, Expense Management, Project Management, Timesheet, Document Management, Onboarding, Exit Management

## Files Changed
- `apps/api/src/db/schema.ts` - tenantProducts table
- `apps/api/src/routes/products.ts` - new
- `apps/api/src/routes/users.ts` - new
- `apps/api/src/routes/tenants.ts` - nanoid generation
- `apps/api/src/db/seed.ts` - 15 products
- `apps/internal-portal/src/pages/Tenants.tsx` - edit modal
- `apps/internal-portal/src/pages/Products.tsx` - new
- `apps/internal-portal/src/components/Sidebar.tsx` - products nav
- `apps/internal-portal/src/App.tsx` - products route
