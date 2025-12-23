# Quick Start Guide



## Prerequisites
- Node.js v18+
- npm

## Setup

```bash
# Install dependencies
npm install

# Initialize database and seed data
npm run db:push
npm run db:seed
```

## Run Applications

```bash
# Terminal 1: API (port 4000)
npm run dev:api

# Terminal 2: Client Portal (port 3000)
npm run dev:client

# Terminal 3: Internal Portal (port 3001)
npm run dev:internal
```

## URLs

| App | URL |
|-----|-----|
| API | http://localhost:4000 |
| Client Portal | http://localhost:3000 |
| Internal Portal | http://localhost:3001 |

## Test Users

**Password for all users:** `systech@123`

### Internal Portal (http://localhost:3001)

| Email | Role |
|-------|------|
| ramesh@systech.com | admin |
| mohan@systech.com | support |
| sakthi@systech.com | integrator |
| jai@systech.com | support (dev) |
| priya@systech.com | support (dev) |

### Client Portal (http://localhost:3000)

**Acme Corp** (enterprise tier)

| Email | Role |
|-------|------|
| john@acme.com | user |
| jane@acme.com | user |
| kumar@acme.com | user |
| latha@acme.com | company_admin |
| deepa@acme.com | company_admin |

**TechCorp** (business tier)

| Email | Role |
|-------|------|
| alex@techcorp.com | user |
| sara@techcorp.com | user |
| mike@techcorp.com | company_admin |

## Database

SQLite database at: `apps/api/src/db/data.db`

Reset database:
```bash
rm apps/api/src/db/data.db
npm run db:push
npm run db:seed
```

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:api` | Start API server |
| `npm run dev:client` | Start client portal |
| `npm run dev:internal` | Start internal portal |
| `npm run db:push` | Push schema to SQLite |
| `npm run db:seed` | Seed sample data |
