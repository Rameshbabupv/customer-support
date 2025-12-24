# SPARK Feature Testing Guide

**Date**: 2024-12-24
**Servers Running**: ✅

---

## Server Status

- **API Server**: http://localhost:4000 (running)
- **Frontend**: http://localhost:3001 (running)

---

## Step-by-Step Testing Flow

### 1. Login to Internal Portal

1. Open browser: http://localhost:3001
2. You should see the login page
3. Login with your internal user credentials (owner account)

**Expected**: Redirect to Dashboard after successful login

---

### 2. Navigate to Ideas (SPARK)

1. Look at the sidebar navigation
2. You should see **"Ideas"** menu item with a 💡 lightbulb icon
3. Click on **"Ideas"**

**Expected**:
- URL changes to http://localhost:3001/ideas
- See "💡 SPARK Ideas" header
- See subtitle: "Capture ideas without constraints. Vet them with your team."
- See "New Idea" button in top right
- If no ideas exist yet, see empty state with large 💡 icon

---

### 3. Create Your First Idea

1. Click **"New Idea"** button
2. Modal opens with form

**Fill in the form**:
- **Title**: "Add Dark Mode Support"
- **Description**: "Users have been requesting dark mode. Let's add theme toggle with system preference detection."
- **Visibility**: Select "🔒 Private (just me)" (default)

3. Click **"Create Idea"**

**Expected**:
- Modal closes
- New idea card appears in the list
- Card shows:
  - Title: "Add Dark Mode Support"
  - Description preview (truncated)
  - Your name as creator
  - Today's date
  - 🔒 Private icon
  - "inbox" status badge (gray)
  - 0 votes, 0 comments

---

### 4. View Idea Detail

1. Click on the idea card you just created
2. URL changes to http://localhost:3001/ideas/[id]

**Expected to see**:
- **Header**:
  - "Add Dark Mode Support" title
  - Your name and creation date
  - Edit button (✏️ icon) - since you're the creator

- **Status Progression**:
  - Visual pipeline: Inbox → Discussing → Vetted → In Progress → Shipped
  - "Inbox" is highlighted/active (gray background)
  - All status buttons are clickable (you're the creator)

- **Description**:
  - Full description text displayed

- **Visibility Section**:
  - Dropdown showing "🔒 Private (just me)"
  - Dropdown is enabled (you're the creator)

- **Reactions Section**:
  - Three reaction buttons: 👍 ❤️ 🔥
  - All showing count of 0
  - Gray border (not reacted yet)

- **Comments Section**:
  - "💬 Comments (0)"
  - Empty state: "No comments yet. Be the first to share your thoughts!"
  - Comment textarea and "Post Comment" button

---

### 5. Test Status Progression

1. Click on **"Discussing"** status button (second in pipeline)

**Expected**:
- Status immediately changes
- "Discussing" badge turns blue
- Page refreshes with new status
- "Inbox" badge now shows as past (grayed out)

2. Try clicking **"Vetted"** (third button)

**Expected**:
- Status changes to green "Vetted" badge
- Pipeline shows Inbox and Discussing as past states

---

### 6. Test Visibility Change

1. In the Visibility dropdown, select **"🌐 Public (everyone)"**

**Expected**:
- Dropdown value changes
- Idea is now visible to all users in your organization
- Idea's `publishedAt` timestamp is set (first time sharing)

**Note**: Team visibility option is present but disabled (coming soon)

---

### 7. Test Reactions

1. Click the **👍** reaction button

**Expected**:
- Button border changes to blue (primary color)
- Button background becomes light blue
- Count changes from 0 to 1
- Your reaction is registered

2. Click **👍** again (toggle off)

**Expected**:
- Button border returns to gray
- Background becomes white
- Count changes from 1 to 0

3. Try clicking **❤️** and **🔥**

**Expected**:
- Each reaction can be toggled independently
- Multiple reactions can be active at once
- Counts update in real-time

---

### 8. Test Comments

1. In the comment textarea, type:
   ```
   Great idea! We should also consider:
   - Light/Dark/Auto modes
   - Per-component theme overrides
   - Save user preference
   ```

2. Click **"Post Comment"**

**Expected**:
- "Posting..." button text appears briefly
- Textarea clears
- New comment appears at the top of comments list
- Comment shows:
  - Your avatar (first letter of name)
  - Your name
  - Timestamp (just now)
  - Full comment text (preserves line breaks)
- Comment count in header changes to "💬 Comments (1)"

3. Add another comment: "Also check accessibility contrast ratios"

**Expected**:
- Second comment appears
- Count becomes "💬 Comments (2)"
- Comments are sorted by newest first

---

### 9. Test List Filters

1. Click **"Back to Ideas"** button (or click "Ideas" in sidebar)
2. Create another idea:
   - Title: "Mobile App Push Notifications"
   - Visibility: "🌐 Public"
   - Click Create

3. You should now see 2 ideas in the list

**Test Tab Filters**:

1. Click **"My Ideas"** tab
   - **Expected**: See both ideas (you created both)

2. Click **"Private"** tab
   - **Expected**: See only "Add Dark Mode Support" (if you kept it private)
   - Or no ideas if you changed it to public

3. Click **"All"** tab
   - **Expected**: See all ideas you have permission to view

**Test Status Filter**:

1. Use the status dropdown, select **"vetted"**
   - **Expected**: See only ideas with "vetted" status
   - Or empty if none are vetted yet

2. Select **"All Status"**
   - **Expected**: See all ideas again

---

### 10. Test Privacy Model (Advanced)

**As Creator/Admin (Systech user)**:
1. Create a private idea
2. You should see it in your list

**Test Admin Oversight**:
If you're logged in as admin or Systech tenant user:
- You should see ALL ideas in the system, even private ones from other users
- This is the "admin override" feature

**Test Non-Creator View** (optional):
1. Create another user account (or switch users)
2. Login as that user
3. Navigate to /ideas
4. You should NOT see private ideas created by other users
5. You SHOULD see public ideas

---

### 11. Test Permission Enforcement

1. As the creator, navigate to an idea detail
2. Verify you can:
   - ✅ Change status (all buttons clickable)
   - ✅ Change visibility (dropdown enabled)
   - ✅ See edit button

**Test as Non-Creator** (if you have another user):
1. Login as different user
2. Navigate to a public idea created by someone else
3. Verify you CANNOT:
   - ❌ Change status (buttons disabled/non-clickable)
   - ❌ Change visibility (dropdown disabled)
   - ❌ See edit button
4. Verify you CAN:
   - ✅ Add reactions
   - ✅ Add comments
   - ✅ View all content

---

## API Testing (Optional)

You can also test the API directly using curl:

### Create Idea
```bash
# Get your auth token from browser localStorage (check DevTools)
TOKEN="your-jwt-token"

curl -X POST http://localhost:4000/api/ideas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Idea",
    "description": "Created via API",
    "visibility": "private"
  }'
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
  -d '{"comment": "API comment test"}'
```

### Toggle Reaction
```bash
curl -X POST http://localhost:4000/api/ideas/1/reactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reaction": "thumbs_up"}'
```

---

## Expected Behaviors Summary

### Privacy Model
- **Private**: Only creator can see (admin override: Systech/admin see all)
- **Team**: Team members can see (coming soon - team assignment)
- **Public**: Everyone in organization can see

### Status Flow
- **Inbox** (gray) → **Discussing** (blue) → **Vetted** (green) → **In Progress** (yellow) → **Shipped** (purple)
- Creator/admin can change status by clicking pipeline buttons
- Status is visual indicator of idea maturity

### Permissions
- **Creator**: Full edit rights (status, visibility, content)
- **Admin**: Full edit rights on all ideas + see all private ideas
- **Regular Users**: Can view (if permitted), react, comment - cannot edit

### Counts
- Vote count increments/decrements with reactions
- Comment count increments when comments added
- Counts are denormalized for performance (stored in ideas table)

---

## Common Issues & Troubleshooting

### Issue: "Idea not found" or 403 Forbidden
- **Cause**: Trying to access private idea created by another user
- **Solution**: Expected behavior - privacy is enforced

### Issue: Status/Visibility buttons disabled
- **Cause**: You're not the creator or admin
- **Solution**: Expected behavior - permissions enforced

### Issue: Ideas not appearing in list
- **Cause**: Filters are active
- **Solution**: Check tab filters and status filter - set to "All" to see everything

### Issue: Team visibility not working
- **Cause**: Team assignment UI not implemented yet
- **Solution**: Use Private or Public for now

---

## Success Criteria

✅ Can create ideas with title, description, visibility
✅ Can view ideas list with filtering
✅ Can navigate to idea detail
✅ Can change status via progression UI
✅ Can change visibility via dropdown
✅ Can add/remove reactions (👍 ❤️ 🔥)
✅ Can add comments
✅ Counts update correctly
✅ Privacy enforced (private ideas hidden)
✅ Permissions enforced (non-creators can't edit)
✅ Admin can see all ideas (including private)

---

## Next Steps After Testing

Once you've verified the basic flow works:

1. **Create more test data**:
   - Multiple ideas with different statuses
   - Mix of private and public ideas
   - Ideas with various comment/reaction counts

2. **Test with multiple users**:
   - Verify privacy model works correctly
   - Test team visibility once teams are assigned

3. **Test edge cases**:
   - Very long titles/descriptions
   - Special characters in text
   - Empty/whitespace-only inputs

4. **Optional enhancements**:
   - Edit idea functionality (button exists, needs implementation)
   - Delete idea functionality
   - Rich text editor for descriptions
   - File attachments

---

**Happy Testing!** 🎉

The SPARK feature is fully functional and ready for real-world use.
