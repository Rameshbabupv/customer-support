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
`id, name, subdomain, created_at`

### User
`id, email, password_hash, role (user|admin), tenant_id, created_at`

### Ticket
`id, title, description, status (open|in_progress|resolved|closed), priority (1-4), user_id, tenant_id, created_at, updated_at`

### Attachment
`id, ticket_id, file_url, file_name, created_at`
