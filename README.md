# Customer Support

Simple, multi-tenant customer support ticketing system.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      TWO WORKFLOWS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SUPPORT TICKETS            2. FEATURE REQUESTS          │
│  ──────────────────            ────────────────────         │
│  User → Gatekeeper →           Anyone → CEO Quote →         │
│  Integrator → Support          Approver → Dev Sprint        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Tailwind |
| Backend | Node/Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Files | S3/MinIO |
| Issues | Beads (bd) |

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:migrate

# Run dev server
npm run dev
```

## Project Structure

```
/src
  /api          # Express routes
  /models       # Data models
  /middleware   # Auth, tenant
  /services     # Business logic
/client         # React app
/docs           # Documentation
/.beads         # Issue tracking
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [Product](docs/product.md) | Personas, user stories, roadmap |
| [Architecture](docs/architecture.md) | Flows, roles, SLA, data models |
| [API](docs/api.md) | Endpoints reference |
| [AGENTS.md](AGENTS.md) | Agent workflow (beads) |

## Issue Tracking

Uses [beads](https://github.com/steveyegge/beads) for issue tracking.

```bash
bd ready          # Available work
bd show <id>      # View issue
bd update <id> --status in_progress
bd close <id>
```

## License

Proprietary
