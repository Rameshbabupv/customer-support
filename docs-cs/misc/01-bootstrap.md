# Work Tracking Bootstrap Guide

For Claude Code to set up work tracking in new projects.

---

## 1. Create Directory Structure

```bash
mkdir -p docs-{project}/work/{01-epics,02-features,03-tasks,04-bugs,05-hotfixes,06-spikes,07-chores,08-customer-issues,09-team-inbox,10-releases,templates}

# Add z-archived to each
for dir in docs-{project}/work/0*; do mkdir -p "$dir/z-archived"; done

# Add team folders
mkdir -p docs-{project}/work/09-team-inbox/{person1,person2,person3}

# Supporting directories
mkdir -p docs-{project}/{architecture,handoffs,knowledge,misc,product,testing}
```

---

## 2. Directory Purposes

| Directory | Purpose | Contains |
|-----------|---------|----------|
| `01-epics/` | Large initiatives, containers | High-level goals, links to features |
| `02-features/` | User-facing deliverables | Grouped functionality, links to tasks |
| `03-tasks/` | Technical work units | Specific implementation items |
| `04-bugs/` | Defects, normal priority | Bug reports with reproduction steps |
| `05-hotfixes/` | Prod defects, urgent | Bypasses normal queue |
| `06-spikes/` | Research/investigation | Timeboxed exploration |
| `07-chores/` | Tech debt | No direct user value |
| `08-customer-issues/` | Customer-reported issues | Triage queue |
| `09-team-inbox/` | Team notes per person | Raw input, ideas, blockers |
| `10-releases/` | Release notes | Customer-facing changelogs per version |
| `z-archived/` | Completed items | Inside each directory |

---

## 3. Item Definitions

### Epic
- Large body of work spanning multiple sprints
- Contains multiple features
- Example: "Employee Lifecycle", "Payroll System"

```markdown
---
type: epic
tags:
  - status/active
  - priority/p1
  - domain-tag
---
# Epic Title

Description.

## Features
- [[feature-1]]
- [[feature-2]]
```

### Feature
- User-facing deliverable capability
- Belongs to one epic
- Contains multiple tasks

```markdown
---
type: feature
epic: "[[parent-epic]]"
tags:
  - status/active
  - priority/p1
  - area-tag
---
# Feature Title

Parent: [[parent-epic]]

## Covers
- ComponentA
- ComponentB

## Tasks
- [[task-1]]
- [[task-2]]

## Bugs
- [[bug-1]]
```

### Task
- Technical work unit
- Belongs to one feature
- Assignable to one person

```markdown
---
type: task
feature: "[[parent-feature]]"
assignee: person-name
bd-id: beads-id-if-exists
blocked-by: "[[blocking-task]]"
blocks: "[[dependent-task]]"
sprint: "2024-W52"
tags:
  - status/open
  - priority/p2
  - frontend
  - backend
---
# Task Title

Feature: [[parent-feature]]

Description of what to implement.

## Definition of Done
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Docs updated (if applicable)
- [ ] Deployed to staging
```

### Bug
- Defect in existing functionality
- Has reproduction steps
- Links to feature it affects

```markdown
---
type: bug
feature: "[[affected-feature]]"
assignee:
bd-id:
blocked-by:
blocks:
tags:
  - status/open
  - priority/p1
  - frontend
  - backend
---
# Bug Title

Feature: [[affected-feature]]

## Problem
What's broken.

## Steps to Reproduce
1. Step 1
2. Step 2

## Expected vs Actual

## Definition of Done
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tests added/updated
- [ ] Code reviewed
- [ ] Deployed to staging
```

### Hotfix
- Production defect requiring immediate attention
- Bypasses normal prioritization

```markdown
---
type: hotfix
feature: "[[affected-feature]]"
assignee:
bd-id:
tags:
  - status/open
  - priority/p0
  - urgent
  - prod
---
# Hotfix Title

Feature: [[affected-feature]]

## Impact
Who/what is affected in production.

## Fix
```

### Spike
- Timeboxed research/investigation
- Produces knowledge, not code

```markdown
---
type: spike
feature: "[[related-feature]]"
timebox: 4h
assignee:
bd-id:
tags:
  - status/open
  - priority/p2
  - research
---
# Spike Title

## Question
What we need to learn.

## Findings
```

### Chore
- Tech debt, refactoring
- No direct user value

```markdown
---
type: chore
feature: "[[related-feature]]"
assignee:
bd-id:
tags:
  - status/open
  - priority/p3
  - tech-debt
---
# Chore Title

## Why
Why this matters.

## Scope
What to clean up.
```

### Customer Issue
- Customer-reported problem
- Requires triage before development

```markdown
---
type: customer-issue
feature: "[[affected-feature]]"
customer: customer-name
company: company-name
severity: critical|high|medium|low
assignee:
bd-id:
tags:
  - status/triage-pending
  - priority/p1
  - customer
---
# Customer Issue Title

## Customer Information
- **Name**:
- **Company**:
- **Email**:

## Problem
What the customer reported.

## Steps to Reproduce
1. Step 1
2. Step 2

## Business Impact
How critical, how many users affected.

## Resolution
```

---

## 4. Tags

### Status
- `#status/backlog` - Not started
- `#status/active` - Current sprint/focus
- `#status/in-progress` - Being worked on
- `#status/blocked` - Waiting on something
- `#status/review` - Code review pending
- `#status/testing` - QA validation pending
- `#status/deployed` - In production
- `#status/done` - Completed
- `#status/wont-fix` - Intentionally closed without fix
- `#status/triage-pending` - Customer issue awaiting validation

### Priority
- `#priority/p0` - Critical/emergency
- `#priority/p1` - High
- `#priority/p2` - Medium (default)
- `#priority/p3` - Low
- `#priority/p4` - Backlog

### Team
- `#frontend` - React/UI work
- `#backend` - API/server work
- `#database` - Schema/migration
- `#devops` - Infra/deployment

### Assignee (frontmatter field)
```yaml
assignee: person-name
```

### Dependencies (frontmatter fields)
```yaml
blocked-by: "[[blocking-item]]"   # This item waits for blocking-item
blocks: "[[dependent-item]]"      # dependent-item waits for this item
```

### Sprint (frontmatter field, optional)
```yaml
sprint: "2024-W52"   # ISO week format
```

---

## 5. Linking Convention

- Epic → Feature: `## Features` section with `[[feature-name]]`
- Feature → Epic: `epic: "[[epic-name]]"` in frontmatter + `Parent: [[epic-name]]` in body
- Task/Bug → Feature: `feature: "[[feature-name]]"` in frontmatter
- Feature → Tasks/Bugs: `## Tasks` and `## Bugs` sections
- Dependencies: `blocked-by` and `blocks` in frontmatter

Bidirectional = navigable in Obsidian graph.

---

## 6. Files to Create

### guide.md (in work/)
Copy from existing project or create with directory table + tag reference.

### Templates (in work/templates/)
- `epic-template.md`
- `feature-template.md`
- `task-template.md`
- `bug-template.md`
- `hotfix-template.md`
- `spike-template.md`
- `chore-template.md`
- `customer-issue-template.md`
- `team-inbox-note.md`
- `release-notes-template.md`

### Index Pages (in each work/ subdirectory)
Each directory should have a `_index.md` with:
- Purpose of the directory
- Dataview query showing contents
- Links to related areas

Example `_index.md`:
```markdown
---
type: index
---
# Tasks

Technical work units assigned to developers.

## Open Tasks
```dataview
TABLE assignee, status, priority FROM "work/03-tasks"
WHERE type = "task" AND !contains(file.path, "z-archived")
SORT priority ASC
```

## Related
- [[_index|Features]] - Parent items
- [[_index|Bugs]] - Related defects
```

---

## 7. Git Setup

```bash
cd docs-{project}
git init
git add .
git commit -m "feat: Initialize work tracking structure"
```

---

## 8. Deriving Epics/Features from Code

1. List main pages/modules: `ls src/pages/` or equivalent
2. Group by domain (Employee, Attendance, Payroll, etc.)
3. Each domain = Epic
4. Each logical grouping of pages = Feature
5. Create epic files with feature links
6. Create feature files with page lists

---

## 9. Integration with bd (beads)

### Two-Layer Architecture
- **bd (beads)** = Claude Code execution layer (quick session start, work tracking)
- **Obsidian** = Team visibility layer (BA, testers, stakeholders can see progress)

### Frontmatter Integration
```yaml
bd-id: project-xxx  # Link Obsidian file to bd issue
```

### Sync Logic (for Claude Code to implement)

When syncing bd issues to Obsidian, follow this logic:

#### 1. Get issue data from bd
```bash
bd show <issue-id> --json
```
Returns array with one element. Extract fields: `title`, `issue_type`, `status`, `priority`, `description`, `labels`, `assignee`.

#### 2. Map issue type to directory
| bd type | Obsidian directory |
|---------|-------------------|
| epic | `01-epics/` |
| feature, story | `02-features/` |
| task | `03-tasks/` |
| bug | `04-bugs/` |
| hotfix | `05-hotfixes/` |
| spike | `06-spikes/` |
| chore | `07-chores/` |

#### 3. Map status to tag
| bd status | Obsidian tag |
|-----------|-------------|
| open | `#status/backlog` |
| in_progress | `#status/in-progress` |
| blocked | `#status/blocked` |
| done, closed | `#status/done` |

#### 4. Map priority to tag
| bd priority | Obsidian tag |
|-------------|-------------|
| 0, P0 | `#priority/p0` |
| 1, P1 | `#priority/p1` |
| 2, P2 | `#priority/p2` |
| 3, P3 | `#priority/p3` |
| 4, P4 | `#priority/p4` |

#### 5. Generate filename
Convert title to kebab-case: lowercase, replace non-alphanumeric with hyphens.

#### 6. Generate markdown
```markdown
---
type: <issue_type>
bd-id: <issue-id>
tags:
  - <status-tag>
  - <priority-tag>
  - <area-tags from labels: frontend, backend, etc>
assignee: <if present>
---

# <title>

<description>
```

#### 7. Sync operations
- **create**: Generate new file in appropriate directory
- **update**: Find existing file by `bd-id` in frontmatter, update status tag
- **close**: Update status tag to `#status/done`
- **sync-all**: Iterate `bd list --status=open`, update each

### Domain Labels
Use consistent labels to map tasks to domain epics:

| Domain | Label |
|--------|-------|
| Employee management | `employee` |
| Attendance/Time | `time-attendance` |
| Leave management | `leave` |
| Payroll/Compensation | `payroll` |
| Configuration/Masters | `masters` |
| Customer support | `customer` |
| Biometric integration | `biometric` |

### Workflow

1. **Session Start**: `bd ready` or `bd list --status=open`
2. **During Work**: `bd update <id> --status=in_progress`
3. **After bd operations**: Sync to Obsidian (Claude Code handles this)
4. **Session End**:
   - `bd close <id>` for completed work
   - `bd sync --from-main` to sync with team
   - Sync all open issues to Obsidian

---

## 10. File Naming Conventions

### Standard Format
Use kebab-case: `employee-onboarding-flow.md`

### Optional: ID Prefixes
For larger projects, prevent naming collisions with prefixes:

| Format | Example | Use Case |
|--------|---------|----------|
| Date prefix | `2024-12-22-payroll-fix.md` | Time-based tracking |
| Type prefix | `BUG-001-login-error.md` | Sequential IDs |
| bd-id prefix | `beads-abc-login-error.md` | Match bd issue ID |

Choose one convention and apply consistently.

---

## 11. Cross-Project Structure

### Options

| Approach | Pros | Cons |
|----------|------|------|
| **A: Monorepo vault** - One `docs/` for all projects | Single source of truth, cross-project linking | Larger, potential conflicts |
| **B: Per-project vault** - Each project has `docs-{project}/` | Isolation, simpler | No cross-linking, duplication |
| **C: Hybrid** - Shared `docs-shared/` + per-project | Best of both | More complex structure |

### Recommendation
**Option C (Hybrid)** for teams with multiple projects:
```
docs-shared/           # Company-wide
├── 01-epics/          # Cross-project initiatives
├── 09-team-inbox/     # Shared team notes
└── knowledge/         # Shared documentation

docs-{project}/        # Project-specific
├── work/              # Project work items
├── architecture/      # Project architecture
└── testing/           # Project test plans
```

---

## 12. Obsidian Plugins & Dashboards

### Recommended Plugins
- **Dataview** - Query and display work items dynamically
- **Kanban** - Visual board per feature or sprint
- **Calendar** - View items by date/sprint

### Dataview Dashboard Examples

#### All Open P1 Items
```dataview
TABLE status, assignee, feature FROM "work"
WHERE contains(tags, "priority/p1") AND !contains(tags, "status/done")
SORT file.mtime DESC
```

#### My Tasks
```dataview
TABLE status, priority, feature FROM "work"
WHERE assignee = "your-name" AND !contains(tags, "status/done")
SORT priority ASC
```

#### Blocked Items
```dataview
TABLE blocked-by, assignee FROM "work"
WHERE contains(tags, "status/blocked")
```

#### Recently Updated
```dataview
TABLE status, type FROM "work"
WHERE !contains(file.path, "z-archived")
SORT file.mtime DESC
LIMIT 10
```

#### Unprocessed Team Inbox
```dataview
LIST FROM "work/09-team-inbox"
WHERE !contains(file.path, "z-archived")
SORT file.ctime DESC
```

### Kanban Board Setup
1. Install Kanban plugin
2. Create `work/kanban-board.md`
3. Configure columns: Backlog | In Progress | Review | Done
4. Drag items between columns (updates frontmatter automatically)
