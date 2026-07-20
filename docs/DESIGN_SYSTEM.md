# HybridX Design System

## Design Philosophy

HybridX should feel like a breeder's daily companion — not a database. Every pixel should serve the core workflow: track, evaluate, select, repeat.

Inspiration: Apple, Linear, Notion. Anti-pattern: enterprise agriculture software.

## Typography

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `h1` | 24px (1.5rem) | 600 | 1.2 | Page titles |
| `h2` | 18px (1.125rem) | 600 | 1.3 | Section headings |
| `h3` | 15px (0.9375rem) | 600 | 1.4 | Card titles |
| `body` | 14px (0.875rem) | 400 | 1.5 | Default body text |
| `body-sm` | 13px (0.8125rem) | 400 | 1.5 | Secondary text |
| `caption` | 12px (0.75rem) | 500 | 1.4 | Labels, badges, timestamps |
| `mono` | 13px (0.8125rem) | 400 | 1.5 | Code, IDs, seedling numbers |

Font family: Inter (via next/font), system font stack fallback.

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight icon gaps |
| `space-2` | 8px | Badge gaps, inline spacing |
| `space-3` | 12px | Form field gaps, button-to-text |
| `space-4` | 16px | Card padding, grid gaps |
| `space-5` | 20px | Section spacing within cards |
| `space-6` | 24px | Between page sections |
| `space-8` | 32px | Between major sections |
| `space-10` | 40px | Page padding, empty state spacing |

## Layout

- **Page padding**: `p-6` (24px) inside main content area
- **Card padding**: `p-5` (20px) standard, `p-4` (16px) compact
- **Card header**: `pt-5 px-5 pb-0` — no bottom padding on header
- **Card content**: `px-5 pb-5` — no top padding when following header
- **Grid gaps**: `gap-4` (16px) default, `gap-3` (12px) tight
- **Section spacing**: `space-y-8` (32px) between major sections
- **Form spacing**: `space-y-4` (16px) between form fields

## Components

### PageHeader

Standard page header pattern:

```tsx
<PageHeader
  title="Plants"
  description={`${total} plants in your collection`}
  actions={[<Button key="add">Add Plant</Button>]}
/>
```

- Title: h1
- Description: body-sm, muted
- Actions: right-aligned button group
- Bottom border: optional, via `border` prop

### Card

Standard card patterns:

- **List card**: Clickable card with title, subtitle, badges, optional actions
- **Stat card**: Icon + value + label, linked to entity page
- **Detail card**: Section header with content body

### EmptyState

```tsx
<EmptyState
  icon={Leaf}
  title="No plants yet"
  description="Add your first plant to start tracking your collection."
  action={<Button>Add Plant</Button>}
/>
```

### LoadingState

Use the skeleton components from `components/ui/loading-skeleton.tsx`:
- `PageSkeleton` — list pages with search + grid
- `DashboardSkeleton` — dashboard layout
- `DetailSkeleton` — detail pages with sidebar
- `CardGridSkeleton` — grid of card placeholders

### ErrorState

```tsx
<ErrorPage error={error} reset={reset} label="plants" />
```

### ConfirmDialog

```tsx
<ConfirmDialog
  title="Delete plant?"
  description="This will permanently remove Gemini and all associated data. This action cannot be undone."
  onConfirm={handleDelete}
>
  <Button variant="destructive">Delete</Button>
</ConfirmDialog>
```

### FormField

Standard form field wrapper:
- Label (caption weight)
- Input/Select/Textarea
- Error message (destructive text, caption)
- Helper text (muted, caption)

### SearchBar

```tsx
<SearchBar
  value={search}
  onChange={handleSearch}
  placeholder="Search plants..."
/>
```

### FilterBar

```tsx
<FilterBar>
  <SelectFilter ... />
  <SelectFilter ... />
</FilterBar>
```

### Breadcrumbs

```tsx
<Breadcrumbs items={[
  { label: "Plants", href: "/plants" },
  { label: "Gemini" },
]} />
```

### Badge

- `secondary` — entity type badges
- `outline` — status, metadata badges
- Color variants for disposition, stage, scores

## Color

Use Tailwind's OKLCH color system via `globals.css`. Prefer semantic tokens:
- `primary` — primary actions, active states
- `muted` — secondary text, backgrounds
- `destructive` — delete, errors
- `emerald` — success, selected, germinated
- `amber` — warnings, pending, stratifying
- `blue` — info, cold stratification, pollen
- `rose` — evaluations, attention items
- `purple` — breeder line, selected keepers

## Motion

- Transitions: `transition-colors` for hover effects
- Animations: `animate-pulse` for loading skeletons
- No unnecessary animations — keep it snappy
- Respect `prefers-reduced-motion`

## Responsive

Breakpoints:
- `sm`: 640px — mobile landscape
- `md`: 768px — tablet
- `lg`: 1024px — desktop
- `xl`: 1280px — wide desktop

Card grids: 1 col mobile → 2 col tablet → 3 col desktop
Sidebar: collapsible on mobile (via shadcn sidebar)
