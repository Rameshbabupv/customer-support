# SPARK Feature Implementation Plan

## Overview

**SPARK** - Signature idea management feature where users can:
- Capture ideas without project constraints
- Keep ideas private initially, then share with team/public
- Vet and discuss ideas collaboratively
- Convert vetted ideas to tickets across multiple projects
- Admins see ALL sparks regardless of visibility

## Key Differentiators
- **Privacy Levels**: private → team → public
- **Admin Oversight**: Ramesh/Systech see all sparks
- **Cross-Project**: One idea → many tickets in different projects
- **Lineage Tracking**: Always know ticket origin

---

## Phase 1: Database Schema & Core API (Week 1)

### Database Schema
- [ ] Create `ideas` table with fields:
  - id, tenant_id, title, description
  - status: 'inbox' | 'discussing' | 'vetted' | 'in_progress' | 'shipped' | 'archived'
  - visibility: 'private' | 'team' | 'public'
  - team_id (nullable)
  - created_by, created_at, updated_at
  - published_at (nullable)
  - vote_count, comment_count (default 0)

- [ ] Create `teams` table (if not exists):
  - id, tenant_id, name
  - product_id (nullable)
  - created_at, updated_at

- [ ] Create `team_members` table:
  - id, team_id, user_id, role
  - created_at

- [ ] Create `idea_comments` table:
  - id, idea_id, user_id, comment
  - created_at, updated_at

- [ ] Create `idea_reactions` table:
  - id, idea_id, user_id
  - reaction: '👍' | '❤️' | '🔥'
  - created_at

- [ ] Create `idea_products` table (linking):
  - id, idea_id, product_id
  - created_at

- [ ] Create `idea_tickets` table (lineage):
  - id, idea_id, ticket_id
  - created_at

- [ ] Add `source_idea_id` to `tickets` table (nullable)

- [ ] Run migration: `npx prisma migrate dev --name add_spark_feature`

### API Endpoints - Core CRUD
- [ ] POST /api/ideas - Create idea
  - Validate: title, description required
  - Default: visibility='private', status='inbox'
  - Return created idea with user info

- [ ] GET /api/ideas - List ideas (with visibility filtering)
  - Query params: status, visibility, team_id
  - Filter based on user permissions (see Security section)
  - Include: creator info, vote_count, comment_count
  - Pagination support

- [ ] GET /api/ideas/:id - Get single idea
  - Check visibility permissions
  - Include: comments, reactions, linked products/tickets

- [ ] PATCH /api/ideas/:id - Update idea
  - Only creator or admin can update
  - Allow: title, description, status, visibility, team_id
  - Track visibility changes (set published_at on first share)

- [ ] DELETE /api/ideas/:id - Delete idea
  - Only creator or admin can delete
  - Soft delete (set deleted_at)

### API Endpoints - Visibility & Teams
- [ ] GET /api/teams - List user's teams
  - Return teams user is member of
  - Include member count

- [ ] POST /api/teams - Create team (admin/product-owner only)
  - Fields: name, product_id (optional)

- [ ] POST /api/teams/:id/members - Add team member
  - Team lead or admin only

### Security & Permissions
- [ ] Create `canViewIdea(idea, user)` helper:
  - Admin/Systech tenant → always true
  - Public ideas → true
  - Private ideas → only creator
  - Team ideas → check team membership

- [ ] Create `canEditIdea(idea, user)` helper:
  - Creator or admin only

- [ ] Create `canChangeVisibility(idea, user)` helper:
  - Creator can promote (private → team → public)
  - Admin can change any
  - Team lead can make team ideas public

- [ ] Add middleware: `requireIdeaAccess`
  - Use in all idea endpoints
  - Check visibility permissions

### Testing
- [ ] Test idea CRUD operations
- [ ] Test visibility filters (private/team/public)
- [ ] Test admin can see all ideas
- [ ] Test team member can see team ideas
- [ ] Test creator can change visibility
- [ ] Test non-member cannot see private/team ideas

---

## Phase 2: Collaboration Features (Week 2)

### Comments
- [ ] POST /api/ideas/:id/comments - Add comment
  - Only visible to those who can see idea
  - Increment idea.comment_count

- [ ] GET /api/ideas/:id/comments - List comments
  - Include user info
  - Ordered by created_at

- [ ] PATCH /api/ideas/:id/comments/:commentId - Edit comment
  - Only comment author or admin

- [ ] DELETE /api/ideas/:id/comments/:commentId - Delete comment
  - Only comment author or admin
  - Decrement idea.comment_count

### Reactions
- [ ] POST /api/ideas/:id/reactions - Toggle reaction
  - Body: { reaction: '👍' | '❤️' | '🔥' }
  - If exists, remove; else add
  - Update idea.vote_count

- [ ] GET /api/ideas/:id/reactions - List reactions
  - Group by reaction type
  - Include user info

### Activity Feed
- [ ] GET /api/ideas/:id/activity - Get idea activity
  - Comments, reactions, status changes, visibility changes
  - Ordered by time (newest first)

### Testing
- [ ] Test adding/editing/deleting comments
- [ ] Test reactions toggle
- [ ] Test comment_count increments correctly
- [ ] Test vote_count updates
- [ ] Test activity feed shows all events

---

## Phase 3: Idea → Ticket Conversion (Week 3)

### Promotion Flow
- [ ] POST /api/ideas/:id/convert - Convert idea to tickets
  - Body: { product_ids: string[], ticket_data: {...} }
  - Creates ticket(s) with source_idea_id
  - Creates idea_tickets records
  - Creates idea_products records
  - Updates idea.status to 'in_progress'
  - Return created ticket IDs

- [ ] GET /api/ideas/:id/tickets - Get tickets from idea
  - Show lineage: which tickets came from this idea
  - Include ticket status, product info

### Lineage Tracking
- [ ] GET /api/tickets/:id/source-idea - Get originating idea
  - Show idea details if source_idea_id exists
  - Check visibility permissions

- [ ] Add idea info to ticket detail view
  - Show "Originated from Idea #123" badge
  - Link back to idea

### Testing
- [ ] Test converting idea to single ticket
- [ ] Test converting idea to multiple tickets (cross-project)
- [ ] Test lineage tracking (ticket → idea)
- [ ] Test idea_products records created
- [ ] Test status updates to 'in_progress'

---

## Phase 4: Frontend UI (Week 4)

### Ideas List Page (`/ideas`)
- [ ] Create `app/ideas/page.tsx`
  - Tab filters: All | My Ideas | Team | Private
  - Status filter: Inbox | Discussing | Vetted | In Progress | Shipped
  - Cards showing: title, status, visibility badge, vote count, comment count
  - Click → detail view

- [ ] Create visibility badge component
  - 🔒 Private | 👥 Team Name | 🌐 Public
  - Color coded

### Create Idea Modal
- [ ] Create `components/CreateIdeaModal.tsx`
  - Fields: title, description
  - Visibility selector:
    - Radio: Private | Team | Public
    - Team dropdown (if visibility=team)
  - Save as Draft or Publish button

### Idea Detail Page (`/ideas/:id`)
- [ ] Create `app/ideas/[id]/page.tsx`
  - Show: title, description, status, visibility
  - Creator info, created date
  - Edit/Delete buttons (if permissions)
  - Change visibility dropdown (if permissions)
  - Status progression UI

- [ ] Comments section
  - List comments with user avatars
  - Add comment textarea
  - Edit/delete own comments

- [ ] Reactions bar
  - 👍 ❤️ 🔥 with counts
  - Click to toggle

- [ ] Convert to Ticket section (if vetted)
  - "Convert to Ticket" button
  - Modal: select products, ticket template
  - Show linked tickets after conversion

### Admin Dashboard Enhancement
- [ ] Add "All Sparks" view (admin only)
  - See all ideas regardless of visibility
  - Filter by visibility, team, status
  - Analytics: trending ideas, top contributors

### Testing
- [ ] Test create idea flow
- [ ] Test visibility selection works
- [ ] Test viewing private/team/public ideas
- [ ] Test comments CRUD
- [ ] Test reactions toggle
- [ ] Test convert to ticket flow
- [ ] Test admin can see all ideas

---

## Phase 5: Advanced Features (Week 5+)

### AI Enhancements
- [ ] Duplicate detection
  - On create, check similar titles/descriptions
  - Suggest: "Similar idea exists: #123"

- [ ] Auto-tagging
  - Extract keywords from description
  - Tag: enhancement, bug, feature, etc.

- [ ] Impact analysis
  - Suggest which products might be affected
  - Pre-select products for conversion

### Notifications
- [ ] Notify team when idea shared with them
- [ ] Notify creator when idea gets comments/reactions
- [ ] Notify admin on high-voted ideas

### Analytics
- [ ] Idea funnel: inbox → shipped
- [ ] Conversion rate: ideas → tickets
- [ ] Top contributors (most ideas)
- [ ] Top teams (most ideas)
- [ ] ROI tracking (ideas that shipped)

### Mobile/Email Integration
- [ ] Email to idea (forward@domain.com)
- [ ] Mobile voice capture
- [ ] Slack/Teams integration

---

## Acceptance Criteria

### Phase 1 Complete When:
- ✓ User can create idea (private by default)
- ✓ User can list their own ideas
- ✓ User can change visibility (private → team → public)
- ✓ Admin can see ALL ideas
- ✓ Team members can see team ideas
- ✓ Non-members cannot see private/team ideas

### Phase 2 Complete When:
- ✓ Users can comment on ideas they can see
- ✓ Users can react (👍 ❤️ 🔥) to ideas
- ✓ Comment/vote counts update correctly
- ✓ Activity feed shows all interactions

### Phase 3 Complete When:
- ✓ Vetted ideas can be converted to tickets
- ✓ One idea can create tickets in multiple products
- ✓ Tickets show source idea (lineage)
- ✓ Idea shows generated tickets

### Phase 4 Complete When:
- ✓ Ideas list page works with filters
- ✓ Create idea modal with visibility selection
- ✓ Idea detail page shows all info
- ✓ Comments and reactions functional
- ✓ Convert to ticket UI works
- ✓ Admin dashboard shows all sparks

### Phase 5 Complete When:
- ✓ AI features reduce duplicate ideas
- ✓ Notifications keep users engaged
- ✓ Analytics provide insights
- ✓ External integrations capture ideas

---

## Review Section

_This section will be updated as we complete each phase with summaries of changes made and any relevant notes._

---

## Next Steps

1. Review this plan with the team
2. Confirm Phase 1 approach
3. Begin database schema implementation
4. Create beads tickets for each phase (optional)
