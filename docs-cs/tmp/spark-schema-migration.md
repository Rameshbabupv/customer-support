# SPARK Schema Migration Summary

**Date**: 2024-12-24
**Status**: ✅ Completed

## Overview

Successfully added database schema for SPARK feature (Idea Management System) to the customer support application.

## Tables Created

### 1. `teams`
- **Purpose**: Organize users into teams for idea visibility control
- **Columns**:
  - id, tenant_id, name
  - product_id (optional - team can be product-based)
  - created_at, updated_at

### 2. `team_members`
- **Purpose**: Many-to-many relationship between users and teams
- **Columns**:
  - id, team_id, user_id
  - role (member | lead)
  - created_at

### 3. `ideas` (Core SPARK entity)
- **Purpose**: Store ideas with privacy levels and status tracking
- **Columns**:
  - id, tenant_id, title, description
  - status: inbox | discussing | vetted | in_progress | shipped | archived
  - visibility: private | team | public
  - team_id (required if visibility='team')
  - created_by, created_at, updated_at
  - published_at (when first shared)
  - vote_count, comment_count

### 4. `idea_comments`
- **Purpose**: Comments on ideas for collaborative discussion
- **Columns**:
  - id, idea_id, user_id, comment
  - created_at, updated_at

### 5. `idea_reactions`
- **Purpose**: Emoji reactions (👍 ❤️ 🔥) for quick feedback
- **Columns**:
  - id, idea_id, user_id
  - reaction: thumbs_up | heart | fire
  - created_at

### 6. `idea_products`
- **Purpose**: Link ideas to products they affect (many-to-many)
- **Columns**:
  - id, idea_id, product_id
  - created_at

### 7. `idea_tickets`
- **Purpose**: Track which tickets were generated from an idea (lineage)
- **Columns**:
  - id, idea_id, ticket_id
  - created_at

## Modified Tables

### `tickets`
- **Added**: `source_idea_id` (nullable)
- **Purpose**: Backward link from ticket to originating idea
- **Foreign Key**: References `ideas.id`

## Relationships

All Drizzle ORM relations have been defined:
- teams ↔ tenants, products, members, ideas
- team_members ↔ teams, users
- ideas ↔ tenant, team, creator, comments, reactions, products, tickets
- idea_comments ↔ ideas, users
- idea_reactions ↔ ideas, users
- idea_products ↔ ideas, products
- idea_tickets ↔ ideas, tickets

## Database Commands

```bash
# Schema location
apps/api/src/db/schema.ts

# Push schema to database
cd apps/api
npm run db:push

# Database file
apps/api/src/db/data.db
```

## Verification

```sql
-- List all tables
sqlite3 src/db/data.db ".tables"

-- Check ideas table schema
sqlite3 src/db/data.db ".schema ideas"

-- Verify source_idea_id in tickets
sqlite3 src/db/data.db ".schema tickets" | grep source
```

## Next Steps

Phase 1 continues with:
1. ✓ Database schema (DONE)
2. Create API endpoints for ideas CRUD
3. Create security/permission helpers
4. Create teams API endpoints
5. Add tests for permissions

## Files Changed

- `apps/api/src/db/schema.ts` - Added 7 new tables, modified tickets table, added relations
- Database: `apps/api/src/db/data.db` - Schema pushed successfully

## Key Features Enabled

1. **Privacy Levels**: private → team → public visibility flow
2. **Admin Oversight**: Schema supports admin seeing all ideas
3. **Cross-Project**: idea_products table enables one idea → many products
4. **Lineage Tracking**: idea_tickets + source_idea_id enable full traceability
5. **Collaboration**: Comments and reactions for team discussion
6. **Status Progression**: inbox → discussing → vetted → in_progress → shipped
