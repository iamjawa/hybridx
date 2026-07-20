# HybridX Product Bible

> **A living document** — Every behavioural rule, data constraint, UI invariant, and domain definition. If it's not here, it doesn't exist yet.

---

## Table of Contents

1. [Domain Model](#1-domain-model)
2. [Enum Reference](#2-enum-reference)
3. [Entity Behavioural Rules](#3-entity-behavioural-rules)
4. [Trait System](#4-trait-system)
5. [UI Rendering Rules](#5-ui-rendering-rules)
6. [Form System](#6-form-system)
7. [CRUD Completeness](#7-crud-completeness)
8. [State Machines](#8-state-machines)
9. [Naming Conventions](#9-naming-conventions)
10. [UX Rules](#10-ux-rules)
11. [Current Integrity Report](#11-current-integrity-report)
12. [Development Guardrails](#12-development-guardrails)

---

## 1. Domain Model

### Entities

| Entity | Purpose | Key Relations |
|--------|---------|---------------|
| **User** | A breeder or admin account | hasMany: Plant, Cross, Seedling, Evaluation, Goal |
| **Species** | A plant species (e.g. Rosa hybrida) | hasMany: Plant, Cross, Seedling, TraitDefinition, Seed, Goal |
| **TraitDefinition** | A measurable characteristic defined per species | belongsTo: Species; hasMany: TraitValue |
| **TraitValue** | A specific measurement/observation for a trait on a plant or seedling | belongsTo: TraitDefinition, Plant or Seedling |
| **Plant** | An adult breeding parent plant | belongsTo: Species, User; hasMany: TraitValue, Image, GoalScore |
| **Cross** | A planned pollination between two plants | hasMany: Seed, Seedling, Pollination |
| **Pollination** | A single pollination event within a cross | belongsTo: Cross |
| **Seed** | A seed batch harvested from a cross | belongsTo: Cross, Species; hasMany: Seedling |
| **Seedling** | A young plant grown from a seed | belongsTo: Cross, Seed, Species; hasMany: TraitValue, Evaluation, GoalScore |
| **Evaluation** | A scored assessment of a seedling | belongsTo: Seedling; hasMany: scores (JSON) |
| **BreedingGoal** | A defined breeding objective with weighted criteria | hasMany: GoalScore |
| **BreedingGoalScore** | A computed match score between a goal and an entity | belongsTo: Goal, Plant or Seedling or Cross |
| **Image** | A photo of a plant or seedling | belongsTo: Plant or Seedling |
| **Location** | A physical location (bed, bench, greenhouse) | belongsTo: Species; hasMany: Plant, Seedling |
| **Note** | A free-text note attached to a plant | belongsTo: Plant |
| **Task** | A to-do item for a plant or cross | belongsTo: Plant or Cross, User |
| **Document** | An uploaded file related to a plant | belongsTo: Plant |
| **Feedback** | User-submitted feedback | belongsTo: User |
| **WeatherRecord** | Daily weather data | standalone |

### Entity Relationships (Simplified)

```
User
 ├── Plant ──┬── Species
 │            ├── TraitValue ─── TraitDefinition
 │            ├── Image
 │            ├── BreedingGoalScore ─── BreedingGoal
 │            └── Location
 │
 ├── Cross ──┬── SeedParent (Plant)
 │           ├── PollenParent (Plant)
 │           ├── Species
 │           ├── Seedling ──┬── Seed
 │           │               ├── TraitValue
 │           │               ├── Evaluation
 │           │               └── BreedingGoalScore
 │           └── Seed ──────┬── Seedling
 │                           └── Species
 │
 ├── BreedingGoal ──── BreedingGoalScore ──── Plant|Seedling|Cross
 └── Species ──── TraitDefinition ──── TraitValue
```

---

## 2. Enum Reference

### Role
| Value | Description | UI Label |
|-------|-------------|----------|
| `ADMIN` | System administrator | Admin |
| `BREEDER` | Standard user | Breeder |
| `VIEWER` | Read-only access | Viewer |

### PlantStatus
| Value | Description | UI Label | Badge Color |
|-------|-------------|----------|-------------|
| `ACTIVE` | Currently growing | Active | green |
| `DORMANT` | Resting/dormant | Dormant | blue |
| `DECEASED` | Died | Deceased | red |
| `RETIRED` | No longer used | Retired | amber |
| `SOLD` | Sold to another grower | Sold | purple |
| `GIFTED` | Given away | Gifted | purple |

### Disposition
| Value | Description | UI Label | Badge Color |
|-------|-------------|----------|-------------|
| `SELECTED` | Outstanding, will be parent | Selected | emerald |
| `KEPT` | Good, worth monitoring | Kept | blue |
| `CULLED` | Removed from programme | Culled | red |
| `SOLD` | Sold | Sold | amber |
| `GIFTED` | Given away | Gifted | purple |
| `DEAD` | Died | Dead | neutral |

### PollinationMethod
| Value | Label |
|-------|-------|
| `MANUAL` | Manual |
| `OPEN` | Open Pollination |
| `BAG` | Bagged |
| `CAGE` | Caged |
| `ISOLATION` | Isolation |

### SeedStage
| Value | Label |
|-------|-------|
| `HARVESTED` | Harvested |
| `CLEANED` | Cleaned |
| `STORED` | Stored |
| `STRATIFYING` | Stratifying |
| `COLD_STRATIFYING` | Cold Stratifying |
| `WARM_STRATIFYING` | Warm Stratifying |
| `GERMINATING` | Germinating |
| `GERMINATED` | Germinated |
| `FAILED` | Failed |

### EvaluationType (TraitDefinition.type)
| Value | Label | Input Control | Target Value Type |
|-------|-------|---------------|-------------------|
| `NUMERIC` | Numeric | `<input type="number">` | number |
| `BOOLEAN` | Yes/No | `<Checkbox>` or `<Select>` (Yes/No) | "true" / "false" |
| `TEXT` | Text | `<input type="text">` | string |
| `SCALE_1_5` | Scale 1-5 | rating buttons 1-5 | number 1-5 |
| `SCALE_1_10` | Scale 1-10 | rating buttons 1-10 | number 1-10 |
| `PERCENTAGE` | Percentage | number input with % suffix | number 0-100 |
| `YES_NO` | Yes/No | `<Select>` (Yes/No) | "Yes" / "No" |

> **RULE:** `YES_NO` and `NUMERIC` must be available in the species trait creation UI. Currently they are missing from the type selector.

---

## 3. Entity Behavioural Rules

### 3.1 Plant

**Create:**
- `name` is required (min 1 char)
- `status` defaults to ACTIVE
- Can be created without species, parents, or location
- Should be able to set TraitValue on creation — currently NOT possible

**Read:**
- Each plant shows all fields, images, trait values, cross history
- Trait values display correctly by type (SCALE → bar, BOOLEAN → Yes/No label, TEXT → text)
- **BUG:** BOOLEAN trait values shown as "true"/"false" text instead of "Yes"/"No"

**Update:**
- Name, description, status, species, etc. editable via edit dialog
- Status transitions must respect enum — UI provides correct options (DORMANT/DECEASED/RETIRED/SOLD/GIFTED)
- **GAP:** No UI to edit TraitValue on individual plants

**Delete:**
- Soft delete (sets `deletedAt`)
- Confirmation dialog required
- Related images, notes cascade

### 3.2 Cross

**Create:**
- seedParentId and pollenParentId are optional (!)
- A cross can exist without parents — this is a valid state for bulk-created crosses
- `method` defaults to MANUAL

**Read:**
- Shows both parents, cross number, method, dates
- Shows seeds from this cross, seedlings from this cross

**Update:**
- Edit dialog allows changing parents, method, dates, notes

**Delete:**
- Soft delete (sets `deletedAt`)
- Confirmation required

### 3.3 Seed

**Create:**
- Can be created without a crossId — standalone seed batches
- `stage` defaults to HARVESTED
- `totalCount` defaults to 0
- **BUG:** stage filter should only accept UPPERCASE values — fixed with `.toUpperCase()`

**Read:**
- Shows batch number, stage, counts, species, cross info

**Update:**
- Stage advance via quick-action buttons
- **BUG:** Stage filter UI shows "All stages" SelectItem with value "all" but `handleStageFilter("")` is called instead of null — this is fine since the server ignores empty strings

**Delete:**
- Soft delete (sets `deletedAt`)
- Cascades to seedlings

### 3.4 Seedling

**Create:**
- `seedlingId` is required (unique)
- `year` is required
- Can be created without cross, seed, or species

**Read:**
- Shows seedlingId, cross info, disposition, trait values
- **BUG:** No SCALE type check — any numeric TraitValue renders as a bar chart
- **BUG:** BOOLEAN trait values shown as text

**Update:**
- Disposition, notes, health scores editable
- **GAP:** No UI to edit TraitValue

**Delete:**
- Soft delete (sets `deletedAt`)

### 3.5 Evaluation

**Read:**
- **CRITICAL ISSUE:** Evaluation system is completely decoupled from TraitDefinition system
- Evaluation criteria are HARDCODED (vigour, flowerForm, fragrance, diseaseResistance, novelty)
- Evaluation system does NOT read TraitDefinitions from the species
- ALL inputs are `<input type="number">` regardless of trait type
- Evaluations store scores as JSON, not as TraitValue records

### 3.6 BreedingGoal

**Create:**
- `name` is required
- Criteria require: traitName, targetValue, weight, type, operator
- **BUG:** When type is BOOLEAN, target value should be a select (Yes/No) but is a free-text input
- **BUG:** When type is BOOLEAN, operators "contains"/"gte"/"lte" don't make sense — should force "equals"
- **BUG:** Type selector uses different values than TraitDefinition type selector (uses NUMERIC instead of PERCENTAGE)

**Read:**
- Shows criteria with weight percentages and Progress bars

**Matching:**
- `scoreCriterion()` correctly handles all types including BOOLEAN
- `extractValue()` checks traitValues first, then falls back to entity fields

### 3.7 Species

**Create:**
- `name` and `slug` are required, both unique
- Generation labels default to ["F1", "F2", "F3", "F4", "F5", "BC1", "BC2"]

**Read:**
- Shows traits grouped by category
- Seeds, plants, crosses appear as related entities

**Trait Management:**
- Can create traits for a species
- Trait type selector missing NUMERIC and YES_NO options

---

## 4. Trait System

### 4.1 The Two Parallel Systems

HybridX has two independent evaluation/tracking systems that DO NOT communicate:

**System A — TraitValue (for plants & seedlings)**
- Model: `TraitValue` with `value: Json`, linked to `TraitDefinition` which has a `type: EvaluationType`
- UI: Read-only display on plant/[id] and seedling/[id] pages
- **GAP:** No create/update UI anywhere
- **GAP:** No server action to create/update TraitValue records

**System B — Evaluation (for seedlings only)**
- Model: `Evaluation` with `scores: Json` (arbitrary key-value pairs)
- UI: Evaluation page + Quick Evaluation page
- **ISSUE:** Completely hardcoded criteria, not linked to TraitDefinition

**Impact:** A user can define a species's traits (TraitDefinition), but there's no way to enter trait values for individual plants. The evaluation system uses separate hardcoded fields.

### 4.2 Rendering Rules by Type

When displaying a TraitValue, the component MUST check `trait.type`:

| EvaluationType | Display Component | Value Format |
|----------------|-------------------|--------------|
| `BOOLEAN` | Badge/Tag: "Yes" or "No" | `true` → "Yes", `false` → "No" |
| `YES_NO` | Badge/Tag: "Yes" or "No" | Same as BOOLEAN |
| `TEXT` | Plain text | `String(value)` |
| `SCALE_1_5` | Bar/rating display: 1-5 | `Number(value)` |
| `SCALE_1_10` | Bar/rating display: 1-10 | `Number(value)` |
| `NUMERIC` | Formatted number | `Number(value)` |
| `PERCENTAGE` | Formatted percentage | `Number(value)` + "%" suffix |

### 4.3 Type Compatibility with Goal Operators

| Type | Valid Operators | Invalid Operators |
|------|----------------|-------------------|
| `BOOLEAN` | equals | contains, gte, lte |
| `YES_NO` | equals | contains, gte, lte |
| `TEXT` | equals, contains | gte, lte |
| `SCALE_1_5` | equals, gte, lte | contains |
| `SCALE_1_10` | equals, gte, lte | contains |
| `NUMERIC` | equals, gte, lte | contains |
| `PERCENTAGE` | equals, gte, lte | contains |

---

## 5. UI Rendering Rules

### 5.1 Page Header Everywhere

Every page MUST have:
- a `<PageHeader>` component with `title` and `description`
- **Current state:** Some pages use it, most replicate it manually — rendered output is identical

### 5.2 Loading States

Every async action MUST show loading state:
- Buttons: spinner + disabled during action
- Lists: skeleton loader on initial load
- **Current gaps:** Pagination changes don't show loading state; search results don't show loading state

### 5.3 Empty States

Every list view MUST have `<EmptyState>`:
- Icon
- Title
- Description
- CTA button
- **Current state:** All list pages already use EmptyState correctly

### 5.4 Not Found

Every `[id]` detail page MUST handle missing entities:
- Return `notFound()` from `next/navigation`
- **Current state:** All detail pages use `notFound()` — correct

### 5.5 Breadcrumbs

Every detail page MUST show breadcrumbs:
- Format: `[Entity List] > [Entity Name]`
- **Current state:** All 6 detail pages have breadcrumbs

### 5.6 Delete Confirmation

Every delete action MUST use `<ConfirmDialog>`:
- Title: "Delete [entity]?"
- Description explaining consequences
- **Current state:** Done on plants, seeds, goals, crosses. Need to verify all.

---

## 6. Form System

### 6.1 Input Type Rules by Schema Type

| Prisma Field Type | UI Control |
|-------------------|------------|
| `String` | `<Input type="text">` |
| `Int` | `<Input type="number">` |
| `Float` | `<Input type="number" step="0.1">` |
| `Boolean` | `<Checkbox>` |
| `DateTime` | `<Input type="date">` |
| Enum field | `<Select>` with all enum options |
| `Json` | Dynamic form based on schema |

### 6.2 Zod Validation Rules

- Every server action must validate input with Zod
- Zod errors must be caught and returned as user-friendly messages
- **Current state:** All create actions validate via Zod schemas; update actions are inconsistent

### 6.3 Missing Validations

| Location | Issue |
|----------|-------|
| `createGoal` criteria input | BOOLEAN type allows any target value string |
| `createCross` | seedParentId/pollenParentId not validated to exist |
| `updateSpecies` | No Zod validation at all |

---

## 7. CRUD Completeness

### 7.1 Per-Entity CRUD Matrix

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Plant | ✅ List page dialog | ✅  Detail page | ✅ Edit dialog | ✅ Confirm dialog |
| Cross | ✅ List page dialog | ✅ Detail page | ⚠️ Edit dialog exists | ✅ Confirm dialog |
| Seed | ✅ List page dialog | ✅ Detail page | ⚠️ Stage advance only, no edit dialog | ✅ Confirm dialog |
| Seedling | ✅ New page | ✅ Detail page | ⚠️ BATCH disposition only | ❌ No delete UI on list |
| Species | ✅ List page dialog | ✅ Detail page | ⚠️ Edit in detail dialog | ❌ No delete on detail page |
| Goal | ✅ List page dialog | ✅ Detail page | ⚠️ Edit dialog (name/desc/active only, not criteria) | ✅ Confirm dialog |
| Evaluation | ✅ Dialog on eval page | ✅ On seedling detail | ❌ No edit | ❌ No delete |
| TraitDefinition | ✅ Species detail | ✅ Species detail | ❌ No edit (delete only) | ✅ Delete button |
| TraitValue | ❌ **No UI** | ⚠️ Read-only on plant/seedling detail | ❌ No UI | ❌ No UI |
| Image | ❌ No upload UI | ✅ On plant/seedling detail | ❌ No UI | ❌ No UI |
| Note | ❌ No UI (schema exists) | ❌ | ❌ | ❌ |
| Task | ❌ No UI (schema exists) | ❌ | ❌ | ❌ |
| Document | ❌ No UI (schema exists) | ❌ | ❌ | ❌ |

### 7.2 Missing Feature Summary

1. **No TraitValue editor** — TraitDefinition exists, but no way to set values on plants/seedlings
2. **Evaluation system is hardcoded** — Not connected to TraitDefinition
3. **No image upload UI** — Schema supports images, no upload mechanism
4. **No notes UI** — Note model exists, no UI anywhere
5. **No task management UI** — Task model exists, no UI anywhere
6. **No document upload UI** — Document model exists, no UI anywhere
7. **No seedling delete on list page** — Only batch disposition exists
8. **No species delete on detail page** — Must go through list page
9. **No evaluation editing** — Once saved, cannot be changed
10. **No evaluation delete** — Mistakes cannot be undone

---

## 8. State Machines

### 8.1 Seed Stage Transitions

A seed batch progresses through these stages (order is enforced):

```
HARVESTED → CLEANED → STORED → STRATIFYING → GERMINATING → GERMINATED
                               → COLD_STRATIFYING  → GERMINATING → GERMINATED
                               → WARM_STRATIFYING   → GERMINATING → GERMINATED
                                                         
Any stage → FAILED (at any point)
```

- Stage advancement is one-directional (cannot go backwards)
- "Failed" is a terminal state
- UI currently allows advancement to any stage via Select, not sequential

### 8.2 Plant Status Transitions

```
ACTIVE ↔ DORMANT (bidirectional)
ACTIVE → DECEASED, RETIRED, SOLD, GIFTED (terminal for that plant)
DORMANT → DECEASED, RETIRED, SOLD, GIFTED
```

- Status is NOT a lifecycle — it's a current state label
- All transitions are valid via edit dialog
- Only `ACTIVE` and `DORMANT` are non-terminal (plant is still alive and owned)

### 8.3 Seedling Disposition

```
disposition: null (unassigned) → SELECTED, KEPT, CULLED, SOLD, GIFTED, DEAD
```

- Disposition is optional
- No reverse transitions enforced
- Can be set via batch disposition UI only

---

## 9. Naming Conventions

### 9.1 File Naming

| Pattern | Example | Rule |
|---------|---------|------|
| Page files | `page.tsx` | Next.js App Router page |
| Client component | `client.tsx` | Client component colocated with page |
| Server action | `entity.ts` in `src/server/actions/` | One file per entity |
| UI component | `kebab-case.tsx` in `src/components/ui/` | Reusable, not entity-specific |

### 9.2 Variable Naming

| Concept | Convention | Example |
|---------|------------|---------|
| Entity IDs | `camelCase + Id` | `speciesId`, `seedParentId` |
| Page collections | `[entity]s` | `seeds`, `plants` |
| Single entity | `[entity]` | `seed`, `plant` |
| Filter state | `[field]Filter` | `stageFilter`, `speciesFilter` |
| Form state | `form` | form state object |
| Loading state | `saving` / `loading` | boolean for async operations |

### 9.3 Route Naming

| Route | Entity | Pattern |
|-------|--------|---------|
| `/plants` | List | Plural |
| `/plants/[id]` | Detail | `/[id]` |
| `/plants/new` | Create | `/new` |
| `/crosses/planner` | Special | Feature name |

### 9.4 URL Parameter Naming

| Parameter | Used For | Convention |
|-----------|----------|------------|
| `?search=` | Text search | lowercase |
| `?stage=` | Seed stage filter | UPPERCASE (mapped from URL) |
| `?status=` | Plant status filter | UPPERCASE (mapped from URL) |
| `?speciesId=` | Species filter | lowercase |

---

## 10. UX Rules

### 10.1 The Golden Rule

> Every user action must produce feedback within 200ms.

| Action | Feedback |
|--------|----------|
| Click a button | Visual state change (scale/color) within 100ms |
| Submit a form | Toast within 200ms of completion |
| Delete something | Confirmation dialog first, then toast |
| Search | Results within 250ms (debounced) |
| Error | Toast with explanation, NOT technical details |

### 10.2 Card Clickability

- All entity cards in list views must be fully clickable (link wrapping entire card)
- **Exception:** Cards with action buttons inside should not link — use separate click handlers

### 10.3 Enum Display

All enum values must be displayed via a LABEL constant, never raw UPPERCASE:

- ✅ `SEED_STAGE_LABELS[stage]` → "Stratifying"
- ❌ `stage` → "STRATIFYING"

### 10.4 Filter Persistence

Filters in URL query params must survive page refresh:

- ✅ Seeds: `?stage=STRATIFYING` restores filter
- ✅ Plants: `?status=ACTIVE` restores filter
- **BUG:** Legacy `/seeds?stage=stratifying` (lowercase) now handled via `.toUpperCase()`

### 10.5 Confirmation Before Destruction

All destructive actions must show ConfirmDialog with:
1. Title: "Delete [entity]?"
2. Description explaining what will happen
3. Cancel button
4. Confirm button (styled destructive)

---

## 11. Current Integrity Report

### 11.1 Bugs Found & Fixed

| ID | Issue | Severity | File | Status |
|----|-------|----------|------|--------|
| B1 | Lowercase enum filter crashes Prisma | **Critical** | `server/actions/seeds.ts:25`, `server/actions/plants.ts:23` | ✅ Fixed: `.toUpperCase()` |
| B2 | BOOLEAN traits show raw "true"/"false" text | **Medium** | `plants/[id]/client.tsx`, `seedlings/[id]/client.tsx` | Open |
| B3 | seedling/[id] shows bar for any numeric TraitValue without SCALE check | **Medium** | `seedlings/[id]/client.tsx:219-223` | Open |
| B4 | Goal criterion types missing NUMERIC and YES_NO | **Medium** | `species/[id]/client.tsx` | Open |
| B5 | Goal criteria don't respect type for targetValue input | **Medium** | `goals/client.tsx:122` | Open |
| B6 | Goal criteria show invalid operators for BOOLEAN type | **Low** | `goals/client.tsx:135-142` | Open |

### 11.2 Critical Gaps

| ID | Gap | Impact | 
|----|-----|--------|
| G1 | No TraitValue create/update UI | Users define traits but cannot record values |
| G2 | Evaluation system hardcoded, not linked to TraitDefinition | Species-specific traits ignored in evaluations |
| G3 | No image upload | Photos can't be added |
| G4 | No notes UI | Notes can't be created |
| G5 | No task management | Tasks exist in schema only |
| G6 | No document upload | Documents can't be attached |

### 11.3 Minor Issues

| ID | Issue |
|----|-------|
| M1 | Zod validation missing on update actions |
| M2 | No seedling delete button on list page |
| M3 | No species delete UI on detail page |
| M4 | Evaluation pages show all seedlings, not filtered by unevaluated only |
| M5 | Pagination doesn't show loading state during page change |

---

## 12. Development Guardrails

### 12.1 Every New Feature Must

1. Have a Zod validation schema in `src/lib/validations.ts`
2. Use the correct input type based on the field's Prisma type
3. Handle loading state for async operations
4. Handle empty state for list views
5. Handle not-found for detail views
6. Handle error state with user-friendly messages
7. Use enum label constants for display, never raw values

### 12.2 Every Enum Must Have

1. A label map in `src/lib/constants.ts`
2. A color map if used for badges
3. Matching options in every `<Select>` that references it
4. A `.toUpperCase()` guard before passing to Prisma

### 12.3 Trait System Rules

1. `EvaluationType` enum is the single source of truth for trait types
2. Every trait type must have a matching UI control defined in this bible
3. The species trait creation UI must offer ALL 7 types, not a subset
4. Goal criteria type selector must match the species trait type selector
5. Evaluation pages must read trait definitions from the seedling's species

### 12.4 No `any` Without Explicit Type

Exception: Server action params that wrap Prisma where clauses
Exception: Dynamic JSON data

### 12.5 API Consistency

- All server actions return `ActionResult` type
- All server actions catch errors with try-catch
- All server actions that modify data call `auditLog()`
- All server actions that modify data call `trackEvent()`
- All server actions that modify data call `revalidatePath()` for affected routes
