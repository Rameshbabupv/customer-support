# Quick Start Guide

## Prerequisites
- Node.js v18+
- npm

## Setup

```bash
# Install dependencies
npm install

# Initialize database and seed data
cd apps/api
npm run db:push
npm run db:seed
```

## Run Applications

```bash
# Terminal 1: API (port 4000)
cd apps/api && npm run dev

# Terminal 2: Client Portal (port 3000)
cd apps/client-portal && npm run dev

# Terminal 3: Internal Portal (port 3003)
cd apps/internal-portal && npm run dev
```

**Network access (for team testing):**
```bash
npm run dev -- --host
```

## URLs

| App | Local | Network |
|-----|-------|---------|
| API | http://localhost:4000 | http://YOUR_IP:4000 |
| Client Portal | http://localhost:3000 | http://YOUR_IP:3000 |
| Internal Portal | http://localhost:3003 | http://YOUR_IP:3003 |

## Test Users

**Password for all users:** `systech@123`

### Internal Portal (http://localhost:3003)

| Email | Role | Access |
|-------|------|--------|
| ramesh@systech.com | admin | Full access |
| mohan@systech.com | support | Ticket management |
| sakthi@systech.com | integrator | Integrations |
| jai@systech.com | support | Ticket management |
| priya@systech.com | support | Ticket management |

**Features:** Tickets (Kanban), Tenants (CRUD + products), Products (CRUD)

### Client Portal (http://localhost:3000)

Login requires: Email + Password + **Tenant Code**

**Acme Corp** (Tenant Code: auto-generated, check Internal Portal)

| Email | Role |
|-------|------|
| john@acme.com | user |
| jane@acme.com | user |
| kumar@acme.com | user |
| latha@acme.com | company_admin |
| deepa@acme.com | company_admin |

**TechCorp** (Tenant Code: auto-generated, check Internal Portal)

| Email | Role |
|-------|------|
| alex@techcorp.com | user |
| sara@techcorp.com | user |
| mike@techcorp.com | company_admin |

> **Note:** Tenant codes are auto-generated nanoid (e.g., `XK9Q2MZLP1`).
> View them in Internal Portal → Tenants page.

## Products (15 seeded)

HRM, Payroll, Attendance, Leave Management, Recruitment, Performance, Employee Self Service, Training & LMS, Asset Management, Expense Management, Project Management, Timesheet, Document Management, Onboarding, Exit Management

## Database

SQLite database at: `apps/api/src/db/data.db`

**Reset database:**
```bash
cd apps/api
rm -f src/db/data.db*
npm run db:push
npm run db:seed
```

## npm Scripts (from apps/api)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API server |
| `npm run db:push` | Push schema to SQLite |
| `npm run db:seed` | Seed sample data |

## API Endpoints

### Auth
- `POST /api/auth/signin` - Login
- `POST /api/auth/register` - Register (requires tenant code)

### Tenants (owner only)
- `GET /api/tenants` - List tenants
- `POST /api/tenants` - Create tenant (auto-generates nanoid code)
- `PATCH /api/tenants/:id` - Update tenant

### Products (owner only for mutations)
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `GET /api/products/tenant/:id` - Tenant's products
- `PUT /api/products/tenant/:id` - Update tenant's products

### Users (owner only)
- `GET /api/users/tenant/:id` - List tenant users
- `POST /api/users` - Create user (default password: systech@123)

### Tickets
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket
- `PATCH /api/tickets/:id` - Update ticket
