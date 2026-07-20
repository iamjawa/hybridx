# HybridX v1.0 — Premium Product Polish Sprint

## Implementation Plan

**Target:** Turn a competent CRUD application into a premium professional breeding workstation ("Adobe Lightroom meets a botanical research notebook").

**Non-goals:** No rewrites, no schema changes, no new features, no dependency additions.

---

## Priority Overview

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 2 | Critical bugs / broken workflows |
| **P1** | 6 | Major perception and UX issues |
| **P2** | 8 | Professional polish improvements |
| **P3** | 5 | Nice-to-have enhancements |

---

## P0 — Critical Bugs & Broken Workflows

### P0.1 — Broken import template downloads
- **Issue:** `import/client.tsx:288-289` links to `/templates/rose-template.csv` and `/templates/general-template.csv` that 404
- **Fix:** Create CSV template files at `public/templates/`
- **Files:** `public/templates/rose-template.csv` (create), `public/templates/general-template.csv` (create)
- **User impact:** Blocked workflow — users can't see expected CSV format

### P0.2 — Plant edit dialog status enum mismatch
- **Issue:** `plants/[id]/client.tsx:374-384` uses INACTIVE/ARCHIVED; Prisma schema uses DORMANT/DECEASED/RETIRED/SOLD/GIFTED. Create form at `plants/client.tsx:152-164` uses correct values — detail page edit dialog is wrong.
- **Fix:** Replace status options in edit dialog with actual schema values
- **Files:** `src/app/(dashboard)/plants/[id]/client.tsx`
- **User impact:** Data corruption risk — setting invalid status values

---

## P1 — Major Perception & UX Issues

### P1.1 — Typography: Satoshi heading font not loaded
- **Issue:** DESIGN.md specifies Satoshi for headings + Inter for body. Only Inter is loaded at `layout.tsx:6`. The Satoshi font file does not exist on disk.
- **Fix:** Download Satoshi Variable font, load via `next/font/local`, configure CSS variables, apply to headings
- **Files:** `public/fonts/Satoshi-Variable.woff2` (download), `src/app/layout.tsx`, `src/app/globals.css`
- **User impact:** No typographic hierarchy — all text looks the same, no premium feel

### P1.2 — Color system: generic neutrals instead of botanical green
- **Issue:** `globals.css` uses neutral black-on-white (`oklch(0.205 0 0)` primary). DESIGN.md specifies botanical green (`oklch(0.45 0.13 162.5)`) with green-tinted neutrals.
- **Fix:** Replace all CSS variables with the DESIGN.md color palette (light + dark). Verify contrast ratios.
- **Files:** `src/app/globals.css`
- **User impact:** App looks generic, doesn't communicate "plant breeding"
- **Risk:** High visual change — test every page for regressions

### P1.3 — No page transitions / motion system
- **Issue:** Zero motion in the app. DESIGN.md §5 specifies page transitions, sidebar animation, modal animations, list stagger.
- **Fix:** Add Framer Motion page transitions to dashboard layout, modal/dialog animations, sidebar collapse animation, list stagger. Add `prefers-reduced-motion` support.
- **Files:** `src/app/(dashboard)/layout.tsx`, `src/components/ui/sidebar.tsx`, `src/app/(dashboard)/dashboard/client.tsx` (list stagger)
- **User impact:** Static feel — doesn't feel premium or polished

### P1.4 — No search debounce
- **Issue:** Every keystroke on search inputs fires a server round-trip (plants, crosses, seeds, seedlings, species, global search)
- **Fix:** Create a `useDebounce` hook. Apply 250ms debounce to all search inputs. Preserve existing search logic.
- **Files:** `src/hooks/use-debounce.ts` (create), then edit all search handlers
- **User impact:** Laggy typing, excessive server load

### P1.5 — No command palette (Cmd+K)
- **Issue:** DESIGN.md §16 specifies Cmd+K command palette. `cmdk` is already in dependencies but unused.
- **Fix:** Implement `CommandPalette` component using `cmdk`. Register global `Cmd+K` listener. Add search across entities + navigation + quick actions.
- **Files:** `src/components/command-palette.tsx` (create), `src/components/providers.tsx` (mount)
- **User impact:** Power users expect keyboard-driven navigation

### P1.6 — No keyboard shortcuts
- **Issue:** No keyboard shortcuts anywhere
- **Fix:** Add global shortcuts: `n` (new plant), `c` (new cross), `p` (search plants), `e` (evaluation), `Cmd+K` (palette). Add shortcut hints in tooltips/sidebar.
- **Files:** `src/hooks/use-keyboard-shortcuts.ts` (create), integrate with existing components
- **User impact:** Slows down power users who work with keyboard

---

## P2 — Professional Polish Improvements

### P2.1 — Inconsistent page headers
- **Issue:** Some pages use `PageHeader` component, others use manual `h1` + `p`
- **Fix:** Standardize on `PageHeader` across all list pages
- **Files:** `dashboard/page.tsx`, `plants/client.tsx`, `crosses/client.tsx`, `seeds/client.tsx`, `seedlings/client.tsx`, `species/client.tsx`, `goals/client.tsx`, `evaluation/client.tsx`, `search/client.tsx`
- **User impact:** Visual inconsistency between pages

### P2.2 — Inconsistent empty states
- **Issue:** Some pages use plain text "No X yet" instead of `EmptyState` component
- **Fix:** Replace plain-text empty states with full `EmptyState` (icon + title + description + CTA)
- **Files:** `dashboard/client.tsx` (activity timeline), `plants/[id]/client.tsx` (notes, breeding history, offspring), all other detail pages
- **User impact:** Some empty states don't guide the user

### P2.3 — Missing breadcrumbs on detail pages
- **Issue:** Only plant detail has breadcrumbs (`plants/[id]/client.tsx:97`). All other detail pages missing them.
- **Fix:** Add `Breadcrumbs` to cross, seed, seedling, species, goal detail pages
- **Files:** Detail page client components
- **User impact:** No navigation context when drilling into entities

### P2.4 — Missing not-found page in dashboard
- **Issue:** No `not-found.tsx` in `(dashboard)` route group. Root not-found exists but links to `/dashboard` which may redirect.
- **Fix:** Create `src/app/(dashboard)/not-found.tsx`
- **Files:** `src/app/(dashboard)/not-found.tsx` (create)
- **User impact:** Generic browser error for missing entities

### P2.5 — Hand-rolled dashboard chart
- **Issue:** Dashboard "Crosses by Month" uses divs with inline height styles instead of Recharts (which is already a dependency)
- **Fix:** Replace with Recharts `BarChart` with tooltips, responsive container, proper a11y
- **Files:** `src/app/(dashboard)/dashboard/client.tsx`
- **User impact:** Chart lacks tooltips, responsive sizing, accessibility

### P2.6 — Native range slider in onboarding
- **Issue:** Onboarding goal-weighting uses unstyled `<input type="range">` (`onboarding/client.tsx:217-226`)
- **Fix:** Style or replace with a custom slider. Radix Slider is already a dependency (`@radix-ui/react-slider`).
- **Files:** `src/app/(dashboard)/onboarding/client.tsx`
- **User impact:** Looks unfinished, inconsistent across browsers

### P2.7 — Settings page is too sparse
- **Issue:** Only has data export — no account/profile settings, no preferences
- **Fix:** Add profile display (name, email), theme preference indicator. Keep simple — don't overbuild.
- **Files:** `src/app/(dashboard)/settings/client.tsx`
- **User impact:** Settings feels like a placeholder

### P2.8 — No autofocus on auth forms
- **Issue:** Login form and signup form don't autofocus the first field
- **Fix:** Add `autoFocus` to email input on login, name input on signup
- **Files:** `src/app/(auth)/login/form.tsx`, `src/app/(auth)/signup/page.tsx`
- **User impact:** Small friction on every login/signup

---

## P3 — Nice-to-Have Enhancements

### P3.1 — Search highlight matches
- **Issue:** Search results show entity names but don't highlight matched text
- **Fix:** Add `<mark>` or highlight styling around matched query text in results
- **Files:** `src/app/(dashboard)/search/client.tsx`

### P3.2 — Escape clears search
- **Issue:** Pressing Escape on a focused search input doesn't clear it
- **Fix:** Add onKeyDown handler for Escape key on all search inputs
- **Files:** All search input handlers

### P3.3 — Dashboard metric deduplication
- **Issue:** Stat cards and Collection Overview grid show overlapping data
- **Fix:** Remove Collection Overview grid, keep stat cards + add "Need Attention" section
- **Files:** `src/app/(dashboard)/dashboard/client.tsx`

### P3.4 — Loading state on pagination
- **Issue:** Pagination clicks show no loading indicator
- **Fix:** Add subtle opacity/spinner during page transitions
- **Files:** `src/components/ui/pagination-bar.tsx`

### P3.5 — Scroll to top on pagination
- **Issue:** Changing page doesn't scroll to top of list
- **Fix:** Add `window.scrollTo({ top: 0, behavior: 'smooth' })` on page change
- **Files:** Pagination handlers across all list pages

---

## Execution Order

```
Phase 0 → Phase 1 (Typography → Color → Motion)
        → Phase 2 (Templates → Status fix)
        → Phase 3 (Search debounce)
        → Phase 4 (Headers → Empty states → Breadcrumbs → NotFound)
        → Phase 5 (Command palette → Keyboard shortcuts)
        → Phase 6 (Dashboard chart → Metrics)
        → Phase 7 (Profile improvements)
        → Phase 8 (Accessibility)
        → Phase 9 (Testing)
```

## Files Modified (estimated)

| Phase | Files Changed | Risk Level |
|-------|---------------|------------|
| 1.1 Typography | 2 files + 1 download | Low |
| 1.2 Color | 1 file | High (visual) |
| 1.3 Motion | 3 files | Medium |
| 2 Fixes | 3 files | Low |
| 3 Search | 8 files + 1 new | Low |
| 4 Consistency | 12 files | Low |
| 5 Navigation | 3 files + 2 new | Medium |
| 6 Dashboard | 2 files | Medium |
| 7 Profiles | 4 files | Low |
| 8 Accessibility | 6 files | Low |

## Testing Strategy

After each phase:
1. `npm run lint` — no new lint errors
2. `npx tsc --noEmit` — no type errors
3. Manual check of affected routes (visual inspection)
4. Verify existing functionality preserved

After all phases:
1. Full build (`npm run build`) — green
2. Manual CRUD verification (plants, crosses, seeds)
3. Auth flow verification
4. Responsive check (390px, 768px, 1440px)
5. Keyboard navigation check
