# HybridX Design System

> "The operating system for plant breeders."
>
> Inspired by Linear, Apple, Notion, Arc Browser, and Aesop. Minimal, elegant, spacious, typography-first, fast.

---

## Table of Contents

1. [Typography](#1-typography)
2. [Spacing System](#2-spacing-system)
3. [Grid & Layout](#3-grid--layout)
4. [Color System](#4-color-system)
5. [Motion](#5-motion)
6. [Accessibility](#6-accessibility)
7. [Component Behavior](#7-component-behavior)
8. [Interaction Rules](#8-interaction-rules)
9. [Dark Mode / Light Mode](#9-dark-mode--light-mode)
10. [Icons](#10-icons)
11. [Charts](#11-charts)
12. [Tables](#12-tables)
13. [Cards](#13-cards)
14. [Forms](#14-forms)
15. [Navigation](#15-navigation)
16. [Search](#16-search)
17. [Filters](#17-filters)
18. [Modals & Drawers](#18-modals--drawers)
19. [Keyboard Shortcuts](#19-keyboard-shortcuts)
20. [Loading States](#20-loading-states)
21. [Empty States](#21-empty-states)
22. [Error States](#22-error-states)

---

## 1. Typography

### Font Stack

HybridX uses two typefaces from [Fontshare](https://www.fontshare.com/):

| Role | Font | Weight Range | Fallback |
|------|------|-------------|----------|
| Headings | Satoshi | 300–900 | system-ui, sans-serif |
| Body | Inter | 400–700 | system-ui, sans-serif |
| Mono | JetBrains Mono | 400–700 | monospace |

Satoshi carries the brand: geometric, sharp, confident — like a breeder's ledger. Inter provides hyper-readable body copy at every size.

### Type Scale

All sizes use `clamp()` for fluid responsive sizing. Values are based on a 1.25 major-third scale with custom tuning for readability.

```css
/* Heading scale — Satoshi */
h1, .h1 {
  font-family: var(--font-satoshi), system-ui, sans-serif;
  font-size: clamp(2rem, 1.5rem + 1.5vw, 3.5rem);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

h2, .h2 {
  font-family: var(--font-satoshi), system-ui, sans-serif;
  font-size: clamp(1.5rem, 1.2rem + 0.9vw, 2.25rem);
  line-height: 1.2;
  font-weight: 650;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

h3, .h3 {
  font-family: var(--font-satoshi), system-ui, sans-serif;
  font-size: clamp(1.25rem, 1.1rem + 0.5vw, 1.75rem);
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

h4, .h4 {
  font-family: var(--font-satoshi), system-ui, sans-serif;
  font-size: clamp(1.1rem, 1rem + 0.3vw, 1.375rem);
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.015em;
}

h5, .h5 {
  font-family: var(--font-satoshi), system-ui, sans-serif;
  font-size: clamp(1rem, 0.95rem + 0.15vw, 1.125rem);
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: -0.01em;
}

h6, .h6 {
  font-family: var(--font-satoshi), system-ui, sans-serif;
  font-size: clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem);
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: -0.005em;
}
```

| Token | Size (clamp) | Line Height | Weight | Use |
|-------|-------------|-------------|--------|-----|
| `h1` | `clamp(2rem, 1.5rem + 1.5vw, 3.5rem)` | 1.1 | 700 | Page title |
| `h2` | `clamp(1.5rem, 1.2rem + 0.9vw, 2.25rem)` | 1.2 | 650 | Section heading |
| `h3` | `clamp(1.25rem, 1.1rem + 0.5vw, 1.75rem)` | 1.25 | 600 | Card title |
| `h4` | `clamp(1.1rem, 1rem + 0.3vw, 1.375rem)` | 1.3 | 600 | Subsection |
| `h5` | `clamp(1rem, 0.95rem + 0.15vw, 1.125rem)` | 1.4 | 600 | Group heading |
| `h6` | `clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem)` | 1.4 | 600 | Small heading |
| `body` | `clamp(0.875rem, 0.85rem + 0.1vw, 1rem)` | 1.6 | 400 | Body text |
| `body-sm` | `clamp(0.8125rem, 0.8rem + 0.05vw, 0.875rem)` | 1.5 | 400 | Secondary text |
| `small` | `clamp(0.75rem, 0.725rem + 0.075vw, 0.8125rem)` | 1.4 | 400 | Labels, metadata |
| `caption` | `clamp(0.6875rem, 0.65rem + 0.1vw, 0.75rem)` | 1.3 | 450 | Captions, footnotes |
| `mono` | `clamp(0.8125rem, 0.8rem + 0.05vw, 0.875rem)` | 1.5 | 400 | Code, IDs, data |

### Text Utilities

```css
/* Heading balance — prevents orphaned words on headings */
.text-balance {
  text-wrap: balance;
}

/* Pretty — avoids jagged right edge on longer text */
.text-pretty {
  text-wrap: pretty;
}

/* Truncation */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### Implementation

Import fonts in `layout.tsx` using next/font with CSS variable support:

```tsx
import localFont from "next/font/local"

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
})

const inter = localFont({
  src: "../../public/fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
})
```

Set `font-family` via `@theme inline` in `globals.css`:

```css
@theme inline {
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-heading: var(--font-satoshi), system-ui, sans-serif;
}
```

---

## 2. Spacing System

### Base Unit

The spacing system uses a **4px base grid** (0.25rem).

### Spacing Scale

| Token | Value | rem | Typical Use |
|-------|-------|-----|-------------|
| `space-0.5` | 2px | 0.125rem | Micro gaps |
| `space-1` | 4px | 0.25rem | Base unit, icon gap |
| `space-2` | 8px | 0.5rem | Tight padding, label gap |
| `space-3` | 12px | 0.75rem | Input padding, small inset |
| `space-4` | 16px | 1rem | Body gap, card inset |
| `space-5` | 20px | 1.25rem | Section gap, button padding |
| `space-6` | 24px | 1.5rem | Card padding, form group |
| `space-8` | 32px | 2rem | Section margin, modal padding |
| `space-10` | 40px | 2.5rem | Page section margin |
| `space-12` | 48px | 3rem | Major section break |
| `space-16` | 64px | 4rem | Page padding |
| `space-20` | 80px | 5rem | Hero spacing |
| `space-24` | 96px | 6rem | Large page sections |
| `space-32` | 128px | 8rem | Viewport padding |

### Section Spacing

```css
/* Vertical rhythm between major sections */
.section-gap {
  margin-top: clamp(2rem, 1.5rem + 2vw, 4rem);
  margin-bottom: clamp(2rem, 1.5rem + 2vw, 4rem);
}

/* Gap between content rows in a card */
.card-content-gap {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 16px */
}

/* Form field spacing */
.form-field-gap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* 8px */
}
```

### Padding Conventions

| Component | Padding |
|-----------|---------|
| Card body | 24px (`space-6`) |
| Modal body | 32px (`space-8`) |
| Sidebar item | 8px 12px |
| Button | 8px 16px (sm), 12px 24px (default), 16px 32px (lg) |
| Input | 8px 12px |
| Table cell | 12px 16px |
| Page wrapper | 32px (`space-8`) horizontal, 32px top |

---

## 3. Grid & Layout

### Grid System

12-column CSS Grid with named template areas for page shells.

```css
.page-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "sidebar main";
  min-height: 100dvh;
}

.content-layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}
```

### Container Max-Widths

| Variant | Width | Use |
|---------|-------|-----|
| `container-content` | 1200px | Main content area |
| `container-full` | 1440px | Dashboard analytics, full-width tables |
| `container-narrow` | 720px | Forms, detail views |

### Breakpoints

| Name | Width | Tailwind |
|------|-------|----------|
| `xs` | 480px | — |
| `sm` | 640px | `sm:` |
| `md` | 768px | `md:` |
| `lg` | 1024px | `lg:` |
| `xl` | 1280px | `xl:` |
| `2xl` | 1536px | `2xl:` |

### Column Layout Patterns

```
Full width:          [1–12]
Halves:              [1–6] [7–12]
Thirds:              [1–4] [5–8] [9–12]
Two-thirds + third:  [1–8] [9–12]
Quarter + three:     [1–3] [4–12]
Sidebar + content:   [1–3] [4–12]
```

### Named Template Areas

```css
/* Dashboard shell */
.dashboard-grid {
  display: grid;
  grid-template-areas:
    "header  header"
    "sidebar main";
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: auto 1fr;
}

/* Section with aside */
.section-with-aside {
  display: grid;
  grid-template-areas:
    "title   title  title"
    "content .      aside";
  grid-template-columns: 1fr 1.5rem 360px;
}
```

---

## 4. Color System

HybridX uses **OKLCH** exclusively for perceptually uniform color across light and dark modes. The primary color is a botanical green that reflects the plant-breeding domain.

### Light Mode Tokens

```css
:root {
  /* Base */
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.13 0 0);

  /* Card */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0 0);

  /* Popover */
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.13 0 0);

  /* Primary — botanical green */
  --primary: oklch(0.45 0.13 162.5);
  --primary-foreground: oklch(0.98 0 0);

  /* Secondary */
  --secondary: oklch(0.94 0.01 160);
  --secondary-foreground: oklch(0.25 0.06 160);

  /* Muted */
  --muted: oklch(0.955 0 0);
  --muted-foreground: oklch(0.55 0.005 160);

  /* Accent */
  --accent: oklch(0.94 0.01 160);
  --accent-foreground: oklch(0.25 0.06 160);

  /* Destructive */
  --destructive: oklch(0.58 0.22 25);
  --destructive-foreground: oklch(0.98 0 0);

  /* Borders & Inputs */
  --border: oklch(0.91 0.005 160);
  --input: oklch(0.91 0.005 160);
  --ring: oklch(0.45 0.13 162.5);

  /* Sidebar */
  --sidebar: oklch(0.97 0.003 160);
  --sidebar-foreground: oklch(0.18 0.02 160);
  --sidebar-primary: oklch(0.45 0.13 162.5);
  --sidebar-primary-foreground: oklch(0.98 0 0);
  --sidebar-accent: oklch(0.91 0.01 160);
  --sidebar-accent-foreground: oklch(0.25 0.06 160);
  --sidebar-border: oklch(0.89 0.008 160);
  --sidebar-ring: oklch(0.45 0.13 162.5);

  /* Chart */
  --chart-1: oklch(0.45 0.13 162.5);
  --chart-2: oklch(0.6 0.12 200);
  --chart-3: oklch(0.55 0.15 280);
  --chart-4: oklch(0.7 0.15 85);
  --chart-5: oklch(0.65 0.14 45);

  /* Border radius */
  --radius: 0.625rem;
}
```

### Dark Mode Tokens

```css
.dark {
  /* Base */
  --background: oklch(0.12 0.005 160);
  --foreground: oklch(0.95 0.005 160);

  /* Card */
  --card: oklch(0.16 0.008 160);
  --card-foreground: oklch(0.95 0.005 160);

  /* Popover */
  --popover: oklch(0.16 0.008 160);
  --popover-foreground: oklch(0.95 0.005 160);

  /* Primary — botanical green, lighter in dark mode */
  --primary: oklch(0.62 0.14 162.5);
  --primary-foreground: oklch(0.12 0.005 160);

  /* Secondary */
  --secondary: oklch(0.22 0.01 160);
  --secondary-foreground: oklch(0.9 0.01 160);

  /* Muted */
  --muted: oklch(0.18 0.008 160);
  --muted-foreground: oklch(0.6 0.01 160);

  /* Accent */
  --accent: oklch(0.22 0.01 160);
  --accent-foreground: oklch(0.9 0.01 160);

  /* Destructive */
  --destructive: oklch(0.65 0.2 25);
  --destructive-foreground: oklch(0.98 0 0);

  /* Borders & Inputs */
  --border: oklch(0.22 0.01 160);
  --input: oklch(0.25 0.015 160);
  --ring: oklch(0.62 0.14 162.5);

  /* Sidebar — dark mode with green tint */
  --sidebar: oklch(0.09 0.008 160);
  --sidebar-foreground: oklch(0.88 0.01 160);
  --sidebar-primary: oklch(0.62 0.14 162.5);
  --sidebar-primary-foreground: oklch(0.12 0.005 160);
  --sidebar-accent: oklch(0.16 0.01 160);
  --sidebar-accent-foreground: oklch(0.9 0.01 160);
  --sidebar-border: oklch(0.18 0.01 160);
  --sidebar-ring: oklch(0.62 0.14 162.5);

  /* Chart — slightly brighter for dark backgrounds */
  --chart-1: oklch(0.62 0.14 162.5);
  --chart-2: oklch(0.7 0.12 200);
  --chart-3: oklch(0.65 0.15 280);
  --chart-4: oklch(0.75 0.15 85);
  --chart-5: oklch(0.72 0.14 45);
}
```

### Status Colors

These are semantic and do not change between modes (though they should meet contrast against both backgrounds).

```css
/* Status */
--success: oklch(0.55 0.15 150);
--warning: oklch(0.7 0.15 85);
--error: oklch(0.58 0.22 25);
--info: oklch(0.55 0.12 240);
```

Use via `data-status` attributes or utility classes:

```css
.status-dot--success    { background: var(--success); }
.status-dot--warning    { background: var(--warning); }
.status-dot--error      { background: var(--error); }
.status-dot--info       { background: var(--info); }
```

### Disposition Colors

Used for plant disposition badges and kanban cards in the breeding workflow:

| Disposition | Token | Light Mode |
|-------------|-------|------------|
| SELECTED | `--disp-selected` | `oklch(0.55 0.15 150)` |
| KEPT | `--disp-kept` | `oklch(0.5 0.12 220)` |
| CULLED | `--disp-culled` | `oklch(0.58 0.22 25)` |
| SOLD | `--disp-sold` | `oklch(0.65 0.15 70)` |
| GIFTED | `--disp-gifted` | `oklch(0.55 0.13 300)` |
| DEAD | `--disp-dead` | `oklch(0.55 0.005 0)` |

```css
.badge--disposition {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.25rem;
}

.badge--selected { background: oklch(0.55 0.15 150 / 0.15); color: oklch(0.35 0.12 150); }
.badge--kept     { background: oklch(0.5 0.12 220 / 0.15); color: oklch(0.3 0.1 220); }
.badge--culled   { background: oklch(0.58 0.22 25 / 0.15); color: oklch(0.45 0.2 25); }
.badge--sold     { background: oklch(0.65 0.15 70 / 0.15); color: oklch(0.45 0.12 70); }
.badge--gifted   { background: oklch(0.55 0.13 300 / 0.15); color: oklch(0.35 0.1 300); }
.badge--dead     { background: oklch(0.55 0.005 0 / 0.15); color: oklch(0.4 0 0); }
```

### Species Color Palette System

Each species in HybridX gets an automatically assigned color palette from a curated set. These are used for charts, badges, and timeline dots to distinguish species visually.

```css
--species-rose:       oklch(0.55 0.18 355);
--species-lavender:   oklch(0.55 0.15 285);
--species-sky:        oklch(0.55 0.12 240);
--species-teal:       oklch(0.55 0.12 190);
--species-mint:       oklch(0.55 0.13 162.5);
--species-fern:       oklch(0.5 0.14 140);
--species-sunflower:  oklch(0.65 0.15 85);
--species-apricot:    oklch(0.6 0.15 55);
--species-coral:      oklch(0.55 0.18 25);
--species-plum:       oklch(0.45 0.14 310);

.species-color--rose      { --species-color: var(--species-rose); }
.species-color--lavender  { --species-color: var(--species-lavender); }
.species-color--sky       { --species-color: var(--species-sky); }
.species-color--teal      { --species-color: var(--species-teal); }
.species-color--mint      { --species-color: var(--species-mint); }
.species-color--fern      { --species-color: var(--species-fern); }
.species-color--sunflower { --species-color: var(--species-sunflower); }
.species-color--apricot   { --species-color: var(--species-apricot); }
.species-color--coral     { --species-color: var(--species-coral); }
.species-color--plum      { --species-color: var(--species-plum); }
```

### Contrast Ratio Validation

| Token Pair | Light Mode (target) | Dark Mode (target) |
|-----------|---------------------|--------------------|
| `--foreground` on `--background` | 12:1 ✓ (≥4.5:1) | 12:1 ✓ |
| `--muted-foreground` on `--background` | 6:1 ✓ (≥4.5:1) | 7:1 ✓ |
| `--primary` on `--primary-foreground` | 5:1 ✓ (≥3:1 large) | 5:1 ✓ |
| `--card-foreground` on `--card` | 12:1 ✓ | 12:1 ✓ |
| `--destructive` on `--destructive-foreground` | 5.5:1 ✓ | 5:1 ✓ |
| `--sidebar-foreground` on `--sidebar` | 8:1 ✓ | 11:1 ✓ |

All token pairs meet WCAG AA (4.5:1 for body text, 3:1 for large text).

---

## 5. Motion

### Duration Tokens

```css
--duration-50:   50ms;
--duration-100:  100ms;
--duration-150:  150ms;
--duration-200:  200ms;
--duration-300:  300ms;
--duration-400:  400ms;
--duration-500:  500ms;
```

### Easing Curves

```css
--ease-out-quart: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);
--ease-out-expo:  cubic-bezier(0.19, 1, 0.22, 1);
```

### Animation Guidelines

- Micro-interactions (hover, focus, button press): 100–150ms, ease-out-quart.
- Component transitions (modals, drawers, toasts): 200–300ms, ease-out-quart.
- Page transitions: 300–400ms, fade + subtle slide.
- No animation should exceed 500ms for a single step.
- Never animate purely decorative elements that cause layout shift.

### Page Transitions

```tsx
// Framer Motion variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}
```

Wrap page content in `<motion.div>`:

```tsx
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
>
  {children}
</motion.div>
```

### Sidebar Animation

```tsx
const sidebarVariants = {
  expanded: {
    width: 280,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  collapsed: {
    width: 64,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const labelVariants = {
  expanded: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.15 } },
  collapsed: { opacity: 0, x: -8, transition: { duration: 0.1 } },
}
```

### Modal Animation

```tsx
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
}
```

### Drawer Animation

```tsx
const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}
```

### Stagger Timing for Lists

```tsx
const listContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
}

const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}
```

### Reduced Motion Preference

```css
/* CSS: disable all animations when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```tsx
// Framer Motion: respect reduced motion globally
const MotionProvider = ({ children }) => (
  <MotionConfig reducedMotion="user">
    {children}
  </MotionConfig>
)
```

Use `useReducedMotion()` hook from Framer Motion for imperative checks:

```tsx
import { useReducedMotion } from "framer-motion"

const shouldReduceMotion = useReducedMotion()
const duration = shouldReduceMotion ? 0.01 : 0.25
```

---

## 6. Accessibility

### Contrast Ratios

| Text Size | Minimum Contrast | WCAG Level |
|-----------|-----------------|------------|
| Body text (<18px / <14pt bold) | 4.5:1 | AA |
| Large text (≥18px / ≥14pt bold) | 3:1 | AA |
| UI components & graphical objects | 3:1 | AA |

### Focus Indicators

```css
/* Global focus-visible ring */
:focus-visible {
  outline: none;
  ring: 2px solid var(--ring);
  ring-offset: 2px;
}

/* DO NOT show focus ring on mouse click — only keyboard */
:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}
```

```tsx
// Radix UI primitives handle focus-visible natively.
// For custom interactive elements, use:
<button
  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  // ...
/>
```

### Skip to Content

Place this as the first focusable element in `layout.tsx`:

```tsx
// In layout.tsx, immediately after <body>
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-lg focus:ring-2 focus:ring-ring"
>
  Skip to content
</a>

// Main content wrapper
<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

### Screen Reader Patterns

```tsx
// Visually hidden but accessible to screen readers
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Live region for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>
```

```tsx
// Icon buttons require aria-label
<button aria-label="Close panel" onClick={onClose}>
  <X size={16} />
</button>

// Loading states
<button aria-disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? <Spinner /> : "Save"}
</button>

// Status announcements
<div role="status" aria-live="polite">
  {items.length} plants loaded
</div>
```

### Keyboard Navigation

| Pattern | Behavior |
|---------|----------|
| Tabs | Left/Right arrows to switch, Home/End for first/last |
| Accordion | Enter/Space to toggle, Tab between items |
| Modal | Focus trap: Tab cycles within modal, Shift+Tab reverse, ESC closes |
| Dropdown | Enter opens, arrows navigate, Enter selects, ESC closes |
| Command palette | Arrows navigate, Enter selects, ESC closes |
| List/Table | Arrow keys, Home/End |
| Tooltip | Appears on focus, disappears on blur |

### Reduced Motion

- Always check `prefers-reduced-motion: reduce` via CSS and JS.
- When reduced motion is preferred, set all animation durations to `0.01ms`.
- Framer Motion `MotionConfig` with `reducedMotion="user"` handles this automatically.
- Page transitions become instant fades (no slide).
- Sidebar collapses without width animation.
- List items appear all at once instead of staggered.

---

## 7. Component Behavior

### Modal (via Radix Dialog)

| Property | Value |
|----------|-------|
| Trigger | Button or element with `asChild` |
| Sizes | `sm` (400px), `md` (480px default), `lg` (640px for forms), `xl` (800px for full content) |
| Positioning | Centered vertically and horizontally |
| Backdrop | Overlay with `bg-background/80 backdrop-blur-sm` |
| Backdrop click | Closes modal |
| ESC key | Closes modal |
| Focus trap | Traps focus within modal; Tab cycles through focusable elements |
| Body scroll lock | Locks body scroll on open; restores on close |
| Animation | Fade + scale (see Motion section) |
| Close button | Top-right corner with `X` icon |
| Accessibility | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` referencing title |

```tsx
// Implementation pattern
<Modal open={open} onOpenChange={setOpen}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
      <ModalDescription>Optional description</ModalDescription>
    </ModalHeader>
    <ModalBody>{children}</ModalBody>
    <ModalFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleAction}>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Drawer (via Vaul)

| Property | Value |
|----------|-------|
| Trigger | Button or element |
| Widths | `sm` (400px side panel), `md` (600px detail view) |
| Positioning | Slides from the right edge |
| Overlay | Semi-transparent backdrop |
| Backdrop click | Closes drawer |
| ESC key | Closes drawer |
| Animation | Slides from right (translateX from 100% to 0) |
| Body scroll lock | Locked while drawer is open |
| Close button | Top-right corner |

```tsx
<Drawer direction="right" open={open} onOpenChange={setOpen}>
  <DrawerOverlay />
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Detail</DrawerTitle>
      <DrawerClose />
    </DrawerHeader>
    <DrawerBody>{children}</DrawerBody>
  </DrawerContent>
</Drawer>
```

### Dropdown Menu (via Radix)

| Property | Value |
|----------|-------|
| Trigger | Click on target element |
| Close trigger | Click outside, ESC key, or item select |
| Positioning | Below trigger, aligned left (or right for edge) |
| Radio items | For single-select options |
| Checkbox items | For multi-select options |
| Separator | Between logical groups |
| Animation | Fade in, 150ms |
| Max height | Scrollable after 8 items |

### Tooltip (via Radix Tooltip)

| Property | Value |
|----------|-------|
| Trigger | Hover or focus on target |
| Delay | 500ms before showing |
| Dismiss | Mouseleave or blur |
| Positioning | Above target by default, adjusts to viewport |
| Max width | 260px |
| Content | Short, descriptive text only — no interactive elements |
| Animation | Fade in, 150ms |

```tsx
<TooltipProvider delayDuration={500}>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent side="top" align="center">
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Toast (via Sonner)

| Property | Value |
|----------|-------|
| Library | `sonner` (`toast` from `sonner`) |
| Position | Top-right |
| Auto-dismiss | 4 seconds |
| Stackable | Multiple toasts stack vertically |
| Types | `toast("message")`, `toast.success()`, `toast.error()`, `toast.info()`, `toast.loading()` → update with `toast.dismiss()` |
| Dismiss | Click on toast or wait for auto-dismiss |
| Action | Optional action button (e.g., "Undo") |
| Close button | Optional `X` button via `toast("message", { closeButton: true })` |

```tsx
// In layout.tsx, add Toaster once:
import { Toaster } from "sonner"

<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    className: "toast-default",
  }}
/>
```

### Tabs (via Radix Tabs)

| Property | Value |
|----------|-------|
| Switch | Click on tab header |
| Animation | Underline slides to active tab (CSS transition `left` + `width`) |
| Keyboard | Left/Right arrows to navigate between tabs |
| Orientation | Horizontal (default), vertical (for sidebar-style) |
| Activation | Manual (click to switch) — not automatic on focus |

```css
.tab-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--primary);
  transition: left var(--duration-200) var(--ease-out-quart),
              width var(--duration-200) var(--ease-out-quart);
}
```

### Accordion (via Radix Accordion)

| Property | Value |
|----------|-------|
| Type | Single (one open at a time by default) or Multiple |
| Trigger | Click header to toggle |
| Chevron | Rotates 180° when open |
| Animation | Content expands/collapses with height animation |
| Keyboard | Enter/Space to toggle, Tab between items |

```css
.accordion-chevron {
  transition: transform var(--duration-200) var(--ease-out-quart);
}

.accordion-chevron[data-state="open"] {
  transform: rotate(180deg);
}
```

### Popover (via Radix Popover)

| Property | Value |
|----------|-------|
| Trigger | Click |
| Close | Click outside, ESC key |
| Portal | Rendered to `<body>` via Radix Portal |
| Positioning | Below trigger, adjusts to viewport |
| Padding | 16px inside popover |
| Animation | Fade in, 150ms |

### Command Palette (via cmdk)

| Property | Value |
|----------|-------|
| Open | `Cmd+K` or `Ctrl+K` |
| Close | ESC, click outside |
| Search | Fuzzy search via `cmdk` built-in |
| Navigation | Arrow keys, Enter to select |
| Groups | Categories with section labels |
| Filter | `cmdk` automatically filters by input |
| Animation | Fade + scale like modal, 200ms |

```tsx
import { Command } from "cmdk"

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search or jump to..." />
  <CommandList>
    <CommandGroup heading="Navigation">
      <CommandItem onSelect={() => router.push("/dashboard")}>
        <LayoutDashboard size={16} />
        Dashboard
        <CommandShortcut>⌘D</CommandShortcut>
      </CommandItem>
      <CommandItem onSelect={() => router.push("/plants")}>
        <Leaf size={16} />
        Plants
        <CommandShortcut>⌘E</CommandShortcut>
      </CommandItem>
    </CommandGroup>
    <CommandGroup heading="Actions">
      <CommandItem onSelect={handleNewPlant}>
        <Plus size={16} />
        New Plant
        <CommandShortcut>⌘N</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>
```

---

## 8. Interaction Rules

### Hover States

```css
/* All clickable elements show a hover state */
button:not(:disabled):hover,
a:not(:disabled):hover,
[role="button"]:not(:disabled):hover {
  /* Consistent hover: subtle background change */
}

/* Card hover */
.card:hover {
  border-color: var(--border);
  /* Use a slightly brighter/darker border instead of shadow */
}

/* Row hover in tables */
.tr:hover {
  background: var(--muted);
}
```

### Active / Pressed States

```css
button:active:not(:disabled),
a:active:not(:disabled) {
  transform: scale(0.97);
  /* Duration: 100ms */
}
```

### Loading States

```tsx
// Button loading — spinner replaces or precedes text
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? (
    <>
      <Spinner className="animate-spin" />
      <span className="sr-only">Loading...</span>
    </>
  ) : (
    "Save"
  )}
</button>
```

Skeleton components — use for cards, tables, and forms:

```tsx
// Skeleton base
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      aria-hidden="true"
    />
  )
}

// Card skeleton
function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}
```

### Empty States

Every list view must have an empty state with:

1. An illustration or icon (using Lucide, sized 48–64px)
2. A title (e.g., "No plants yet")
3. A description (e.g., "Add your first plant to start tracking your breeding program.")
4. A CTA button that guides the user to the next action

```tsx
function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="mb-6 rounded-full bg-muted p-4">
        <Icon size={48} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
```

### Error States

```tsx
function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-destructive/30 rounded-lg p-6 bg-destructive/5">
      <div className="flex items-start gap-4">
        <AlertTriangle size={20} className="text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">Something went wrong</h4>
          <p className="text-sm text-muted-foreground">{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Optimistic Updates

```tsx
// Pattern: update cache immediately, revert on error
const mutation = useMutation({
  mutationFn: deletePlant,
  onMutate: async (plantId) => {
    await queryClient.cancelQueries({ queryKey: ["plants"] })
    const previous = queryClient.getQueryData(["plants"])
    queryClient.setQueryData(["plants"], (old) =>
      old?.filter((p) => p.id !== plantId)
    )
    return { previous }
  },
  onError: (err, plantId, context) => {
    queryClient.setQueryData(["plants"], context.previous)
    toast.error("Failed to delete plant")
  },
})
```

### Touch Targets

All interactive elements must have a minimum touch target of **44×44px** for mobile.

```tsx
// Icon buttons on mobile
<button
  className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
  aria-label="Close"
>
  <X size={16} />
</button>
```

---

## 9. Dark Mode / Light Mode

### Strategy

Use `next-themes` with the `class` strategy (adds a `.dark` class to `<html>`).

```tsx
// In layout.tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange={false}
>
  {children}
</ThemeProvider>
```

### Behaviors

| Property | Value |
|----------|-------|
| Default | Follow system preference (`defaultTheme="system"`) |
| Toggle location | Sidebar footer |
| Transition | Smooth 300ms on `background` and `color` via CSS `transition` |
| Persistence | Stored in `localStorage` via `next-themes` |

### CSS Transition

```css
/* Apply smooth transition on theme change */
html {
  transition: background-color 300ms ease,
              color 300ms ease;
}

/* But not on page load — use next-themes to suppress initial transition */
html.no-transition *,
html.no-transition *::before,
html.no-transition *::after {
  transition: none !important;
}
```

### Toggle Component

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>
    </button>
  )
}
```

---

## 10. Icons

### Library

Use **Lucide** icons throughout (`lucide-react`).

### Sizing

| Context | Size | Stroke Width |
|---------|------|-------------|
| Inline with text | 16px | 1.5 |
| Default (buttons, menu items) | 20px | 1.5 |
| Large (empty states, featured icons) | 24px | 1.5 |
| Bold (navigation active) | 20px | 2 |

```tsx
// Inline icon with text
<span className="inline-flex items-center gap-1.5">
  <Leaf size={16} strokeWidth={1.5} />
  Plant name
</span>

// Button icon
<Button>
  <Plus size={20} strokeWidth={1.5} />
  Add Plant
</Button>
```

### Conventions

- Use `strokeWidth={1.5}` as default (Lucide default is 2; we use 1.5 for a more refined look).
- Use `strokeWidth={2}` for nav items in active state and bold emphasis contexts.
- Always add `aria-hidden="true"` on decorative icons.
- Always add `aria-label` on standalone icon buttons.
- Never mix icon sizes within the same component group.

---

## 11. Charts

### Library

Use **Recharts** for all charting.

### Style Guidelines

```tsx
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"

// Base chart component — no gridlines, clean typography
function HybridXChart({ data, children }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="" vertical={false} horizontal={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          dx={-4}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "none",
            fontSize: 13,
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        {children}
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Chart Colors

| Token | Usage |
|-------|-------|
| `--chart-1` | Primary data series |
| `--chart-2` | Secondary data series |
| `--chart-3` | Tertiary data series |
| `--chart-4` | Comparison data |
| `--chart-5` | Additional data |

### Rules

- No gridlines where possible. If needed for readability, use faint dashed lines.
- Tooltips on hover with clean card styling (no shadow, border only).
- All chart containers must use `ResponsiveContainer` with `width="100%"`.
- Minimum chart height: 240px. Default: 320px. Dashboard hero charts: 400px.
- Pie charts: use `label` sparingly, prefer a legend.
- Legends: positioned at bottom, 12px font, muted-foreground.

---

## 12. Tables

### Structure

```css
.table-container {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--table-header, var(--background));
  border-bottom: 1px solid var(--border);
  user-select: none;
  cursor: default;
}

/* Sortable column */
th[aria-sort] {
  cursor: pointer;
}

th[aria-sort]:hover {
  color: var(--foreground);
}

td {
  padding: 12px 16px;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border);
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: var(--muted);
}
```

### Sortable Columns

```tsx
function SortableHeader({ label, sortKey, currentSort, onSort }: SortableHeaderProps) {
  const isActive = currentSort.key === sortKey

  return (
    <th
      aria-sort={
        isActive
          ? currentSort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
      onClick={() =>
        onSort({
          key: sortKey,
          direction:
            isActive && currentSort.direction === "asc" ? "desc" : "asc",
        })
      }
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {isActive && (
          <ChevronUp
            size={12}
            className={currentSort.direction === "desc" ? "rotate-180" : ""}
          />
        )}
      </span>
    </th>
  )
}
```

### Virtualized Tables

For datasets exceeding 100 rows, use virtual scrolling. The TanStack Virtual adapter ensures only visible rows render.

```tsx
import { useVirtualizer } from "@tanstack/react-virtual"

// Implementation pattern in the table component
const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 48,
  overscan: 10,
})
```

### Responsive: Card Layout on Mobile

```css
@media (max-width: 640px) {
  /* Hide table, show card layout */
  .table-container table {
    display: none;
  }

  .table-container .mobile-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}

.mobile-cards {
  display: none;
}
```

---

## 13. Cards

### Base Card

```css
.card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  background: var(--card);
  transition: border-color var(--duration-150) var(--ease-out-quart);
}

.card:hover {
  border-color: var(--ring);
}
```

### Card Anatomy

```tsx
function Card({ children, ...props }: CardProps) {
  return (
    <div className="border border-border rounded-lg p-6 bg-card" {...props}>
      {children}
    </div>
  )
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between mb-4">{children}</div>
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-heading text-base font-semibold">{children}</h3>
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">{children}</div>
}
```

### Rules

- Border only — no box-shadow, no elevation.
- No nested cards.
- Cards in a grid use `display: grid` with `gap` for spacing.
- Hover changes border color subtly (to `var(--ring)` or a slightly lighter/darker border).
- Clickable cards: entire card is clickable, indicated by hover border change and optional cursor style.

---

## 14. Forms

### Input

```css
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
input[type="date"],
input[type="search"],
textarea,
select {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--foreground);
  background: var(--background);
  border: 1px solid var(--input);
  border-radius: 8px;
  transition: border-color var(--duration-150) var(--ease-out-quart),
              box-shadow var(--duration-150) var(--ease-out-quart);
}

input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: none;
  border-color: var(--ring);
  box-shadow: 0 0 0 2px var(--ring);
}

input::placeholder,
textarea::placeholder {
  color: var(--muted-foreground);
}
```

### Textarea

```css
textarea {
  height: auto;
  min-height: 80px;
  resize: vertical;
}
```

### Field Layout

```tsx
function FormField({ label, error, helper, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={children.props.id}>{label}</Label>
      {children}
      {helper && !error && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">{error}</p>
      )}
    </div>
  )
}
```

### Label

```css
label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--foreground);
  line-height: 1.5;
}
```

### Select

Uses Radix Select for custom styled `<select>`:

```tsx
<Select>
  <SelectTrigger className="h-10 px-3 rounded-lg border border-input bg-background text-sm">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox & Radio

Use Radix Checkbox and Radio Group:

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>
```

### Form Spacing

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* 24px between fields */
}

.form-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
}
```

---

## 15. Navigation

### Sidebar

| Property | Value |
|----------|-------|
| Default width | 280px |
| Collapsed width | 64px (icon-only) |
| Position | Fixed left |
| Background | `var(--sidebar)` |
| Border right | `1px solid var(--sidebar-border)` |
| Transition | Width animates at 250ms (see Motion section) |

### Sidebar Anatomy

```
┌─────────────┐
│ Logo        │  ← 48px height, brand mark
├─────────────┤
│ Search      │  ← Cmd+K trigger
├─────────────┤
│ Nav Section │  ← Section label + items
│ Item 1      │  ← Active state: green left bar
│   Item 1a   │  ← Sub-item (indented)
├─────────────┤
│ Nav Section │
│ Item 2      │
├─────────────┤
│             │
│   (spacer)  │
│             │
├─────────────┤
│ Theme       │  ← Light/Dark toggle
│ User menu   │  ← Avatar + name
└─────────────┘
```

### Nav Item Active State

```css
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--sidebar-foreground);
  transition: background var(--duration-150) var(--ease-out-quart),
              color var(--duration-150) var(--ease-out-quart);
}

.nav-item:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

.nav-item--active {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

/* Left bar indicator */
.nav-item--active::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 2px 2px 0;
  background: var(--sidebar-primary);
}
```

### Collapsible Behavior

```tsx
function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-12 px-4">
        {collapsed ? <LogoIcon size={24} /> : <LogoFull />}
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.href} item={item} collapsed={collapsed} />
      ))}

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)}>
        <PanelLeftClose size={16} />
      </button>
    </motion.aside>
  )
}
```

### Breadcrumbs

```tsx
function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <Fragment key={item.href || item.label}>
          {i > 0 && <ChevronRight size={14} className="text-muted-foreground/50" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
```

---

## 16. Search

### Command Palette Search

Search is built on `cmdk` and triggered by `Cmd+K`. See Command Palette in Component Behavior.

### Fuzzy Matching

`cmdk` provides built-in fuzzy matching via its `Command.Input` filter. No additional configuration needed.

### Recent Searches

```tsx
// Store recent searches in localStorage
const [recentSearches, setRecentSearches] = useState<string[]>([])

function addToRecent(query: string) {
  setRecentSearches((prev) => {
    const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
    return updated
  })
}
```

### Category Filters

Group search results by type using `Command.Group`:

```tsx
<CommandGroup heading="Plants">
  {plants.map((plant) => (
    <CommandItem key={plant.id}>
      <Leaf size={16} />
      {plant.name}
      <span className="text-xs text-muted-foreground ml-auto">{plant.id}</span>
    </CommandItem>
  ))}
</CommandGroup>

<CommandGroup heading="Species">
  {species.map((s) => (
    <CommandItem key={s.id}>
      <Flower2 size={16} />
      {s.name}
    </CommandItem>
  ))}
</CommandGroup>
```

---

## 17. Filters

### Horizontal Filter Bar

```tsx
function FilterBar() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <SelectFilter label="Species" options={speciesOptions} />
      <SelectFilter label="Status" options={statusOptions} />
      <SelectFilter label="Generation" options={generationOptions} />
      <DateRangeFilter />
      <ActiveFilters />
    </div>
  )
}
```

### Active Filter Tags

```tsx
function ActiveFilters({ filters, onRemove, onClear }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
        >
          {filter.label}: {filter.value}
          <button onClick={() => onRemove(filter.id)} className="hover:text-primary/70">
            <X size={12} />
          </button>
        </span>
      ))}
      {filters.length > 0 && (
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
```

### Save Filter Presets

```tsx
// Save current filter state as a named preset
function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem("filterPresets")
    return saved ? JSON.parse(saved) : []
  })

  const savePreset = (name: string, filters: Filter[]) => {
    const newPreset = { id: nanoid(), name, filters }
    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem("filterPresets", JSON.stringify(updated))
  }

  return { presets, savePreset, loadPreset }
}
```

---

## 18. Modals & Drawers

### Modal Sizes

| Variant | Max Width | Use Case |
|---------|-----------|----------|
| `sm` | 400px | Confirmations, quick actions |
| `md` | 480px | Default — edit single item, short form |
| `lg` | 640px | Complex forms, multi-field edit |
| `xl` | 800px | Full content views, data tables |

### Drawer Sizes

| Variant | Width | Use Case |
|---------|-------|----------|
| `sm` | 400px | Side panels, quick detail, metadata |
| `md` | 600px | Detail views, activity feed, comments |

### Responsive Modals

On mobile (<640px), modals become full-screen sheets that slide up from the bottom (using `vaul`).

```tsx
function ResponsiveModal({ children, ...props }) {
  // Vaul automatically handles mobile vs desktop
  return (
    <Drawer.Root {...props}>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
```

### Modal / Drawer Usage Rules

- Use a **modal** when the user must complete or dismiss the content before continuing.
- Use a **drawer** when content is supplementary or reference — the user may want to see it alongside the main page.
- Never stack modals. If a secondary action is needed, close the first modal before opening the second.
- A drawer may contain a modal (e.g., confirm delete).

---

## 19. Keyboard Shortcuts

### Shortcut Registry

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Cmd+K` | Open command palette | Global |
| `Cmd+N` | Create new (plant, cross, etc.) | Global |
| `Cmd+S` | Save current form | Form |
| `Cmd+/` | Show shortcuts help | Global |
| `Cmd+E` | Focus search | Global |
| `Cmd+D` | Navigate to dashboard | Global |
| `Cmd+1` | Navigate to Plants | Global |
| `Cmd+2` | Navigate to Crosses | Global |
| `Cmd+3` | Navigate to Seedlings | Global |
| `Cmd+4` | Navigate to Species | Global |
| `Cmd+5` | Navigate to Evaluation | Global |
| `Cmd+6` | Navigate to Analytics | Global |
| `Cmd+7` | Navigate to Search | Global |
| `Cmd+8` | Navigate to Calendar | Global |
| `Cmd+9` | Navigate to Notes | Global |
| `Escape` | Close modal/drawer/palette | Contextual |
| `?` | Show shortcuts help | Global |

### Implementation

```tsx
function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === "k") {
        e.preventDefault()
        toggleCommandPalette()
      }
      if (mod && e.key === "n") {
        e.preventDefault()
        createNew()
      }
      if (mod && e.key === "s" && isFormActive) {
        e.preventDefault()
        saveForm()
      }
      if (e.key === "Escape") {
        closeOverlay()
      }
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])
}
```

### Shortcuts Help Dialog

Triggered by `Cmd+/` or `?`. Renders a modal listing all shortcuts grouped by category.

```tsx
function ShortcutsHelp() {
  return (
    <Modal open={open} onOpenChange={setOpen} size="md">
      <ModalHeader>
        <ModalTitle>Keyboard Shortcuts</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ShortcutGroup title="Global">
          <Shortcut keys={["⌘", "K"]} action="Command palette" />
          <Shortcut keys={["⌘", "N"]} action="New" />
          <Shortcut keys={["⌘", "D"]} action="Dashboard" />
          <Shortcut keys={["⌘", "E"]} action="Search plants" />
          <Shortcut keys={["?"]} action="Shortcuts help" />
          <Shortcut keys={["Esc"]} action="Close" />
        </ShortcutGroup>
        <ShortcutGroup title="Navigation">
          <Shortcut keys={["⌘", "1"]} action="Plants" />
          <Shortcut keys={["⌘", "2"]} action="Crosses" />
          <Shortcut keys={["⌘", "3"]} action="Seedlings" />
          <Shortcut keys={["⌘", "4"]} action="Species" />
          <Shortcut keys={["⌘", "5"]} action="Evaluation" />
          <Shortcut keys={["⌘", "6"]} action="Analytics" />
        </ShortcutGroup>
      </ModalBody>
    </Modal>
  )
}
```

---

## 20. Loading States

### Skeleton Components

```tsx
// Generic skeleton
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      aria-hidden="true"
    />
  )
}

// Page skeleton
function PageSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={5} cols={4} />
    </div>
  )
}

// Table skeleton
function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="border rounded-lg">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b last:border-b-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
```

### Spinner for Action Buttons

```tsx
// In button, when loading:
<span className="animate-spin">
  <Loader2 size={16} />
</span>
```

### Progress Bar for Page Transitions

```tsx
// Global progress bar component
function RouteProgressBar() {
  const { isLoading } = useNavigation()
  const progress = useIsFetching()

  if (!isLoading && !progress) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
      <div className="h-full bg-primary animate-pulse" style={{ width: "30%" }} />
    </div>
  )
}
```

### Suspense Boundaries

```tsx
// In layout.tsx or page.tsx
<Suspense
  fallback={
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-muted-foreground" />
    </div>
  }
>
  <PlantList />
</Suspense>
```

---

## 21. Empty States

Each feature has its own empty state with a contextual icon, title, description, and CTA.

### Plant List

```tsx
<EmptyState
  icon={Leaf}
  title="No plants yet"
  description="Add your first plant to start tracking your breeding program."
  action={<Button onClick={handleAddPlant}>Add Plant</Button>}
/>
```

### Crosses

```tsx
<EmptyState
  icon={GitMerge}
  title="No crosses recorded"
  description="Record your first cross to begin tracking parent combinations and offspring."
  action={<Button onClick={handleNewCross}>New Cross</Button>}
/>
```

### Seedlings

```tsx
<EmptyState
  icon={Sprout}
  title="No seedlings"
  description="Seedlings appear when seeds germinate. Start by adding seeds or recording a cross."
  action={<Button onClick={handleAddSeeds}>Add Seeds</Button>}
/>
```

### Species

```tsx
<EmptyState
  icon={Flower2}
  title="No species configured"
  description="Add species to define breeding parameters, color palettes, and generation labels."
  action={<Button onClick={handleAddSpecies}>Add Species</Button>}
/>
```

### Search Results

```tsx
<EmptyState
  icon={Search}
  title="No results found"
  description="Try adjusting your search terms or filters."
/>
```

### Evaluation

```tsx
<EmptyState
  icon={Star}
  title="No evaluations yet"
  description="Select plants to evaluate and record traits, ratings, and observations."
  action={<Button onClick={handleStartEvaluation}>Start Evaluation</Button>}
/>
```

### Analytics

```tsx
<EmptyState
  icon={BarChart3}
  title="No data to analyze"
  description="Add plants and record crosses to see analytics about your breeding program."
/>
```

### Notes

```tsx
<EmptyState
  icon={FileText}
  title="No notes"
  description="Write your first observation or breeding note."
  action={<Button onClick={handleNewNote}>New Note</Button>}
/>
```

---

## 22. Error States

### Error Boundary

```tsx
import { ErrorBoundary } from "react-error-boundary"

function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error(error)}
    >
      {children}
    </ErrorBoundary>
  )
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-4">
        <AlertTriangle size={48} className="text-destructive" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={resetErrorBoundary}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    </div>
  )
}
```

### Data Fetching Error

```tsx
function usePlantList() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["plants"],
    queryFn: fetchPlants,
  })

  if (error) {
    return (
      <ErrorCard
        message="Failed to load plants. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  // ...
}
```

### Fallback to Cached Data

```tsx
// React Query stale-while-revalidate pattern
const { data, error, isLoading } = useQuery({
  queryKey: ["plants"],
  queryFn: fetchPlants,
  staleTime: 30_000,
  gcTime: 5 * 60 * 1000,
})

// If we have stale data, show it with a refresh indicator
if (error && data) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-md bg-warning/10 text-warning text-sm">
        <AlertTriangle size={14} />
        Showing cached data. Updates may be delayed.
        <button onClick={() => refetch()} className="underline ml-auto">Retry</button>
      </div>
      <PlantTable data={data} />
    </div>
  )
}
```

### Form Error

```tsx
// Form submission error — show as toast + inline field errors
const mutation = useMutation({
  mutationFn: createPlant,
  onError: (error) => {
    toast.error(error.message || "Failed to save. Please try again.")
  },
})
```

---

## Appendix A: Token Reference

### CSS Custom Properties

| Property | Light | Dark |
|----------|-------|------|
| `--background` | `oklch(0.985 0 0)` | `oklch(0.12 0.005 160)` |
| `--foreground` | `oklch(0.13 0 0)` | `oklch(0.95 0.005 160)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.16 0.008 160)` |
| `--card-foreground` | `oklch(0.13 0 0)` | `oklch(0.95 0.005 160)` |
| `--primary` | `oklch(0.45 0.13 162.5)` | `oklch(0.62 0.14 162.5)` |
| `--primary-foreground` | `oklch(0.98 0 0)` | `oklch(0.12 0.005 160)` |
| `--secondary` | `oklch(0.94 0.01 160)` | `oklch(0.22 0.01 160)` |
| `--secondary-foreground` | `oklch(0.25 0.06 160)` | `oklch(0.9 0.01 160)` |
| `--muted` | `oklch(0.955 0 0)` | `oklch(0.18 0.008 160)` |
| `--muted-foreground` | `oklch(0.55 0.005 160)` | `oklch(0.6 0.01 160)` |
| `--accent` | `oklch(0.94 0.01 160)` | `oklch(0.22 0.01 160)` |
| `--accent-foreground` | `oklch(0.25 0.06 160)` | `oklch(0.9 0.01 160)` |
| `--destructive` | `oklch(0.58 0.22 25)` | `oklch(0.65 0.2 25)` |
| `--destructive-foreground` | `oklch(0.98 0 0)` | `oklch(0.98 0 0)` |
| `--border` | `oklch(0.91 0.005 160)` | `oklch(0.22 0.01 160)` |
| `--input` | `oklch(0.91 0.005 160)` | `oklch(0.25 0.015 160)` |
| `--ring` | `oklch(0.45 0.13 162.5)` | `oklch(0.62 0.14 162.5)` |
| `--sidebar` | `oklch(0.97 0.003 160)` | `oklch(0.09 0.008 160)` |
| `--sidebar-foreground` | `oklch(0.18 0.02 160)` | `oklch(0.88 0.01 160)` |
| `--chart-1` | `oklch(0.45 0.13 162.5)` | `oklch(0.62 0.14 162.5)` |
| `--chart-2` | `oklch(0.6 0.12 200)` | `oklch(0.7 0.12 200)` |
| `--chart-3` | `oklch(0.55 0.15 280)` | `oklch(0.65 0.15 280)` |
| `--chart-4` | `oklch(0.7 0.15 85)` | `oklch(0.75 0.15 85)` |
| `--chart-5` | `oklch(0.65 0.14 45)` | `oklch(0.72 0.14 45)` |

### Spacing Reference

```css
--space-0-5: 2px;
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
--space-20:  80px;
--space-24:  96px;
--space-32:  128px;
```

### Motion Reference

```css
--duration-50:   50ms;
--duration-100:  100ms;
--duration-150:  150ms;
--duration-200:  200ms;
--duration-300:  300ms;
--duration-400:  400ms;
--duration-500:  500ms;

--ease-out-quart: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);
--ease-out-expo:  cubic-bezier(0.19, 1, 0.22, 1);
```

---

## Appendix B: Implementation Checklist

- [ ] Font files hosted in `public/fonts/` (Satoshi Variable, Inter Variable)
- [ ] `layout.tsx` loads fonts and sets CSS variables
- [ ] `globals.css` defines all OKLCH tokens for both `.light` and `.dark`
- [ ] `ThemeProvider` wraps app with `attribute="class"`
- [ ] shadcn/ui components customized to use design tokens
- [ ] Sidebar navigation component with collapsible state
- [ ] Command palette with `cmdk` bound to `Cmd+K`
- [ ] Keyboard shortcut hook (`useKeyboardShortcuts`)
- [ ] Skeleton components for all feature areas
- [ ] Empty state components for every list view
- [ ] Error boundary wrapping page-level content
- [ ] `sonner` Toaster added to root layout
- [ ] Framer Motion `MotionConfig` with reduced-motion support
- [ ] Skip-to-content link as first focusable element
- [ ] Focus-visible indicators on all interactive elements
- [ ] Table sorting and virtualization
- [ ] Filter bar with presets
- [ ] Responsive modal/drawer handling via `vaul`
- [ ] Breadcrumbs on content pages

---

*HybridX Design System v1.0 — "The operating system for plant breeders."*
