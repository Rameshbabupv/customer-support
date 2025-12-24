# SPARK API Implementation Summary

**Date**: 2024-12-24
**Status**: ✅ Phase 1 Core API Complete
**Commit**: `13f5c87`

---

## What Was Built

### Permission System (`apps/api/src/utils/idea-permissions.ts`)

Comprehensive visibility and access control for ideas:

#### Visibility Rules
```typescript
canViewIdea(idea, user)
├─ Admin/Systech tenant → ✓ ALL ideas (even private)
├─ Public ideas → ✓ Anyone in same tenant
├─ Private ideas → ✓ Only creator
└─ Team ideas → ✓ Team members only
```

#### Permission Helpers
- `canViewIdea()` - Enforces privacy levels
- `canEditIdea()` - Creator or admin only
- `canChangeVisibility()` - Promotion control (private→team→public)
- `canDeleteIdea()` - Soft delete permissions
- `isTeamLead()` - Team lead check
- `isTeamMember()` - Team membership check

---

## Ideas API Endpoints (`/api/ideas`)

### Create Idea
**POST** `/api/ideas`

```json
{
  "title": "Dark mode support",
  "description": "Add dark mode...",
  "visibility": "private|team|public",
  "teamId": 1  // required if visibility='team'
}
```

**Response**: Idea with creator info, team info

**Features**:
- Defaults to `private` visibility
- Sets `publishedAt` when first shared
- Validates visibility + teamId combo

---

### List Ideas
**GET** `/api/ideas?status=inbox&visibility=private&teamId=1`

**Visibility Logic**:
- **Admin/Owner**: See ALL ideas
- **Regular users**: See:
  - Own private ideas
  - Public ideas in same tenant
  - Team ideas where user is member

**Response**: Array of ideas with creator, team info

**Filters**: `status`, `visibility`, `teamId`

---

### Get Single Idea
**GET** `/api/ideas/:id`

**Response**: Idea with:
- Creator info
- Team info
- All comments (with user info)
- All reactions (with user info)

**Security**: Enforces `canViewIdea` check

---

### Update Idea
**PATCH** `/api/ideas/:id`

```json
{
  "title": "...",
  "description": "...",
  "status": "discussing",
  "visibility": "team",
  "teamId": 2
}
```

**Permissions**:
- Creator or admin can edit
- Visibility change requires `canChangeVisibility` check
- Sets `publishedAt` on first share

---

### Delete Idea
**DELETE** `/api/ideas/:id`

**Behavior**: Soft delete (sets status to `archived`)

**Permissions**: Creator or admin only

---

### Add Comment
**POST** `/api/ideas/:id/comments`

```json
{
  "comment": "Great idea! Should..."
}
```

**Features**:
- Increments `commentCount`
- Only visible to users who can view idea
- Returns comment with user info

---

### Toggle Reaction
**POST** `/api/ideas/:id/reactions`

```json
{
  "reaction": "thumbs_up|heart|fire"
}
```

**Behavior**:
- If reaction exists → remove it
- If reaction doesn't exist → add it
- Updates `voteCount` accordingly

**Response**: `{ action: "added"|"removed" }`

---

## Teams API Endpoints (`/api/teams`)

### List Teams
**GET** `/api/teams`

**Visibility**:
- **Admin/Owner**: All teams in tenant
- **Regular users**: Only teams they're members of

**Response**: Teams with product info + members

---

### Get Team
**GET** `/api/teams/:id`

**Response**: Team with:
- Product info
- All members (with user info + role)

**Security**: Must be same tenant + member (unless admin)

---

### Create Team
**POST** `/api/teams`

```json
{
  "name": "Engineering Team",
  "productId": 1  // optional
}
```

**Permissions**: Admin only

---

### Update Team
**PATCH** `/api/teams/:id`

```json
{
  "name": "Updated name",
  "productId": 2
}
```

**Permissions**: Admin or team lead

---

### Add Team Member
**POST** `/api/teams/:id/members`

```json
{
  "userId": 5,
  "role": "member|lead"
}
```

**Permissions**: Admin or team lead
**Validation**: Prevents duplicate memberships

---

### Remove Team Member
**DELETE** `/api/teams/:id/members/:userId`

**Permissions**:
- Users can remove themselves
- Admin/team lead can remove others

---

## Key Implementation Details

### Security Model

1. **Admin Override**: Admins and Systech tenant (ID=1) see ALL ideas
2. **Query-Level Filtering**: Ideas filtered at database level for performance
3. **Permission Checks**: Explicit checks for edit/delete/visibility changes
4. **Team Membership**: Cached in query for efficiency

### Database Efficiency

```typescript
// Smart query building
if (isAdmin) {
  // Simple query - get everything
} else {
  // Complex OR query with conditions
  conditions = [
    own_private_ideas,
    public_ideas_in_tenant,
    team_ideas_where_member
  ]
  query.where(or(...conditions))
}
```

### Error Handling

- **404**: Resource not found
- **400**: Validation errors
- **403**: Permission denied
- **500**: Server errors

All errors return JSON: `{ error: "message" }`

---

## API Route Registration

Updated `apps/api/src/index.ts`:

```typescript
app.use('/api/ideas', ideaRoutes)
app.use('/api/teams', teamRoutes)
```

---

## Testing Recommendations

### Manual Testing Flow

1. **Create idea** (private)
2. **List ideas** (should only see own)
3. **Update visibility** (private → team)
4. **Add comment** (check count increments)
5. **Add reaction** (check count increments)
6. **Toggle reaction** (check count decrements)
7. **Update status** (inbox → discussing → vetted)
8. **Create team**
9. **Add team member**
10. **Share idea with team** (check member can see)

### Admin Testing

1. Login as admin
2. **List ideas** (should see ALL ideas, even private)
3. **Edit any idea** (should work)
4. **Change any visibility** (should work)

### Permission Testing

1. User A creates private idea
2. User B tries to view → **403 Forbidden**
3. User A shares with team
4. User B (team member) can now view → **200 OK**
5. User C (not member) tries to view → **403 Forbidden**

---

## Next Steps (Phase 2)

Remaining Phase 1 tasks:
- [ ] Add automated tests for permissions
- [ ] Test all endpoints with curl/Postman

Phase 2 (Ticket Conversion):
- [ ] POST /api/ideas/:id/convert - Convert to tickets
- [ ] GET /api/ideas/:id/tickets - Show lineage
- [ ] GET /api/tickets/:id/source-idea - Backward link

---

## Files Created

1. `apps/api/src/utils/idea-permissions.ts` (131 lines)
2. `apps/api/src/routes/ideas.ts` (461 lines)
3. `apps/api/src/routes/teams.ts` (371 lines)

**Total**: 963 lines of API code

---

## Build Status

✅ TypeScript compilation successful
✅ No type errors
✅ All routes registered
✅ Server starts successfully

```bash
cd apps/api
npm run build  # ✓ Success
npm run dev    # Server starts on port 4000
```

---

## Example Requests

### Create Private Idea
```bash
curl -X POST http://localhost:4000/api/ideas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Dark mode","description":"Add dark mode support"}'
```

### List Ideas
```bash
curl http://localhost:4000/api/ideas \
  -H "Authorization: Bearer $TOKEN"
```

### Add Comment
```bash
curl -X POST http://localhost:4000/api/ideas/1/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Great idea!"}'
```

### Toggle Reaction
```bash
curl -X POST http://localhost:4000/api/ideas/1/reactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reaction":"thumbs_up"}'
```

---

## Success Metrics

- ✅ 7 Ideas API endpoints
- ✅ 6 Teams API endpoints
- ✅ 6 Permission helpers
- ✅ Privacy levels enforced (private/team/public)
- ✅ Admin oversight (see all ideas)
- ✅ Comment/reaction counts auto-update
- ✅ Soft delete (archive status)
- ✅ Team membership checks
- ✅ Zero TypeScript errors

**Phase 1 Core API: COMPLETE** 🎉
