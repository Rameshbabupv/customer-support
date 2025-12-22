# Architecture

## Stack
- **Frontend:** React + Tailwind
- **Backend:** Node/Express
- **DB:** PostgreSQL
- **Auth:** JWT + bcrypt
- **Files:** S3/MinIO (screenshots)

## Multi-tenancy
- Column-based isolation (`tenant_id` on all tables)
- Tenant resolved via subdomain or header
- Per-tenant config (gatekeeper, tier)

## Ticket Flow

```
CLIENT SIDE                           OUR SIDE
─────────────────────────────────────────────────────
User creates ticket
    ↓
[Gatekeeper vets] (if enabled)
    ↓
    ──────── Ticket Submitted ────────►
                                      Integrator triages
                                          ↓
                                      Sets internal priority/severity
                                          ↓
                                      Support Team resolves
```

## Feature Request Flow

```
CLIENT SIDE                           OUR SIDE
─────────────────────────────────────────────────────
Anyone creates Feature Request
    │
    ──────── Request ─────────────────► CEO reviews
                                           │
                                       Creates Quote
                                       (scope + price + timeline)
                                           │
    ◄──────── Quote Sent ─────────────────┘
    │
Approver reviews
    │
    ├─► Revision requested ───────────► CEO revises
    │       ◄─────────────────────────────┘
    │         (back & forth)
    │
    ├─► Rejected → End
    │
    └─► Approved
            │
            ──────── Approved ────────► Creates Beads Epic
                                           │
                                       Dev/Support Sprint
                                           │
                                       Delivery
```

**Visibility Matrix:**

| Stage | Our Side | Client Side |
|-------|----------|-------------|
| Draft | CEO only | Requester only |
| Quoted | CEO only | Approver + Contact |
| Revision | CEO only | Approver + Contact |
| Approved | CEO + Dev Team | Approver + Contact |

**Access Control:** Explicit whitelist via `FeatureRequestAccess` table.

## Roles

| Role | Side | Permissions |
|------|------|-------------|
| `user` | Client | Create/view own tickets, request features |
| `gatekeeper` | Client | Vet/approve tickets before submission |
| `company_admin` | Client | Manage company users, view all company tickets |
| `approver` | Client | Approve/reject quotes for feature requests |
| `integrator` | Our side | Triage tickets, set internal priority/severity |
| `support` | Our side | Handle/resolve tickets |
| `ceo` | Our side | View all feature requests, create/revise quotes |
| `admin` | Our side | Full system access |

## Customer Tiers

| Tier | Gatekeeper | SLA Multiplier |
|------|------------|----------------|
| `enterprise` | Optional | 1x (fastest) |
| `business` | Optional | 1.5x |
| `starter` | Disabled | 2x |

## SLA Matrix (Enterprise baseline)

| Level | Severity | Priority | Response | Resolution |
|-------|----------|----------|----------|------------|
| S1/P1 | Critical - System down | Business blocked | 1 hr | 4 hrs |
| S2/P2 | High - Major feature broken | Major impact | 4 hrs | 24 hrs |
| S3/P3 | Medium - Feature degraded | Workaround exists | 8 hrs | 72 hrs |
| S4/P4 | Low - Minor/cosmetic | Enhancement | 24 hrs | 1 week |

**SLA by tier:** Multiply response/resolution by tier multiplier.

**SLA clock starts:** When integrator triages (not submission).

## Folder Structure
```
/src
  /api          # Express routes
  /models       # Sequelize/Prisma models
  /middleware   # Auth, tenant resolution
  /services     # Business logic
  /utils        # Helpers
/client         # React app
/migrations     # DB migrations
```

## Data Models

### Tenant
`id, name, subdomain, tier (enterprise|business|starter), gatekeeper_enabled, created_at`

### User
`id, email, password_hash, role, tenant_id, created_at`

### Product
`id, name, tenant_id, created_at`

### Ticket
`id, title, description, product_id, status, user_id, tenant_id, created_at, updated_at`
- `client_priority (1-4)` - Client-reported
- `client_severity (1-4)` - Client-reported
- `internal_priority (1-4)` - Set by integrator
- `internal_severity (1-4)` - Set by integrator
- `assigned_to` - Support user
- `integrator_id` - Who triaged

### Attachment
`id, ticket_id, file_url, file_name, created_at`

### CompanyContact
`id, tenant_id, integrator_id, sales_person, notes, created_at`

### FeatureRequest
`id, title, description, requester_id, tenant_id, status, created_at, updated_at`
- Status: `draft | quoted | pending_approval | revision | approved | rejected`
- `beads_epic_id` - Linked epic after approval

### Quote
`id, feature_request_id, version, scope, price, timeline, created_by, created_at`
- Version increments on each revision

### QuoteComment
`id, quote_id, user_id, comment, created_at`
- Negotiation thread between CEO and approver

### FeatureRequestAccess
`id, feature_request_id, user_id, created_at`
- Explicit whitelist for visibility
