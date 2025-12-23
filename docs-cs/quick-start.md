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

### Internal Portal (Owner Side)

| Email | Role | Access |
|-------|------|--------|
| ramesh@systech.com | admin | Full access, tenant management |
| mohan@systech.com | support | Ticket triage, internal priority |
| sakthi@systech.com | integrator | Cross-tenant visibility |

### Client Portal (Acme Corp)

| Email | Role | Access |
|-------|------|--------|
| john@acme.com | user | Create/view own tickets |
| jane@acme.com | user | Create/view own tickets |
| latha@acme.com | company_admin | View all tenant tickets |

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
