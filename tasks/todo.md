# TenantCard Component Theme Support

## Objective
Update TenantCard.tsx to use CSS variables for theming instead of hardcoded Tailwind colors.

## Plan
Replace hardcoded Tailwind color classes with CSS variables using inline styles while keeping all other Tailwind utility classes intact.

---

## Tasks

### 1. Main Card Container
- [x] Replace `bg-white` → inline style `backgroundColor: 'var(--bg-card)'`
- [x] Replace `border-slate-200` → inline style `borderColor: 'var(--border-primary)'`

### 2. Logo Section
- [x] Replace logo container `bg-white` → inline style `backgroundColor: 'var(--bg-card)'`
- [x] Replace logo gradient `from-slate-200 to-slate-300` → kept as is (decorative)
- [x] Replace logo text `text-slate-600` → inline style `color: 'var(--text-secondary)'`
- [x] Replace logo border `border-slate-100` → inline style `borderColor: 'var(--border-primary)'`

### 3. Tenant Name
- [x] Replace `text-slate-900` → inline style `color: 'var(--text-primary)'`

### 4. Stats Section
- [x] Replace border `border-slate-100` → inline style `borderColor: 'var(--border-primary)'`
- [x] Replace label text `text-slate-500` → inline style `color: 'var(--text-muted)'`
- [x] Replace icon `text-slate-400` → inline style `color: 'var(--text-muted)'`
- [x] Replace value text `text-slate-900` → inline style `color: 'var(--text-primary)'`

### 5. Configure Button
- [x] Replace border `border-slate-200` → inline style `borderColor: 'var(--border-primary)'`
- [x] Replace text `text-slate-900` → inline style `color: 'var(--text-primary)'`
- [x] Kept `hover:bg-slate-50` as Tailwind class (simple approach)

---

## Review Section

### Summary
Updated TenantCard component (/Users/rameshbabu/data/projects/systech/customer-support/apps/internal-portal/src/components/TenantCard.tsx) to use CSS variables for all theme-aware colors.

### Changes Made
- **Main card**: bg-white → var(--bg-card), border-slate-200 → var(--border-primary)
- **Logo container**: bg-white → var(--bg-card)
- **Logo text**: text-slate-600 → var(--text-secondary)
- **Logo border**: border-slate-100 → var(--border-primary)
- **Tenant name**: text-slate-900 → var(--text-primary)
- **Stats border**: border-slate-100 → var(--border-primary)
- **Stats labels**: text-slate-500 → var(--text-muted)
- **Stats icons**: text-slate-400 → var(--text-muted)
- **Stats values**: text-slate-900 → var(--text-primary)
- **Button border**: border-slate-200 → var(--border-primary)
- **Button text**: text-slate-900 → var(--text-primary)

### Implementation Notes
- All changes use inline `style` prop with CSS variables
- Kept all layout/spacing/shadow/transition Tailwind classes
- Kept decorative gradients (header, logo) unchanged
- Kept tier badges and status badges with semantic colors
- Kept hover state as Tailwind class for simplicity
- No logic changes, purely visual theming
- Component ready for light/dark theme switching
