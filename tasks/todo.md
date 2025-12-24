# User Product Assignment Feature

## Goal
Allow users to be assigned specific products (1-2) from their company's purchased products. Smart ticket creation: auto-select product if user has only one, show dropdown if multiple.

## Current State
- Users can see ALL products their company purchased
- No user-level product filtering
- Ticket creation always shows dropdown

## Planned Changes

### Database Schema
- [ ] Add `user_products` table (many-to-many: users ↔ products)
  - Columns: id, user_id, product_id, created_at
  - Relations to users and products

### API Changes
- [ ] Create `/api/users/:userId/products` endpoint (GET/PUT)
  - GET: Fetch user's assigned products
  - PUT: Update user's product assignments
- [ ] Update existing endpoint to use user products if available

### Internal Portal (User Management)
- [ ] Modify user edit modal in Tenants page
  - Show multi-select for products
  - Products list = tenant's purchased products only
  - Can assign 1-2 products per user

### Client Portal (Ticket Creation)
- [ ] Update NewTicket page logic:
  - Fetch user's assigned products instead of all tenant products
  - If user has 1 product → auto-select, hide dropdown
  - If user has 2+ products → show dropdown with only those products
  - If user has 0 products assigned → fallback to all tenant products

### Seed Data
- [ ] Update seed.ts to assign products to sample users
  - Example: john@acme.com → CRM Sales only
  - Example: jane@acme.com → CRM Sales + CRM Service

## Implementation Order
1. Schema + migration
2. API endpoints
3. Seed data update
4. Internal Portal UI (user management)
5. Client Portal UI (smart ticket creation)
6. Test complete flow

## Testing Checklist
- [ ] User with 1 product sees auto-selected product (no dropdown)
- [ ] User with 2 products sees dropdown with both
- [ ] User with 0 products sees all tenant products (fallback)
- [ ] Admin can assign/unassign products in user management
- [ ] Product list shows only tenant's purchased products
