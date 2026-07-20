# HybridX User Guide

## 1. Getting Started

### Account Creation

1. Go to the HybridX landing page
2. Click "Get Started"
3. Enter your name, email, and password
4. Check your email for a verification link (click it)
5. Log in

### Onboarding Wizard

After your first login, the onboarding wizard walks you through:

1. **Species** — Add the species you breed (e.g. Rosa, Solanum lycopersicum)
2. **First Plant** — Register a plant you already have
3. **First Cross** — Plan a cross between two plants
4. **First Goal** — Set a breeding objective with weighted traits

You can skip any step and come back later.

### First Steps

Once onboarded, you land on the Dashboard. From here:

- **Add plants** using the Plants page
- **Plan a cross** using the Cross Planner
- **Record seeds** from a completed cross
- **Evaluate seedlings** as they grow

---

## 2. Plants

### Adding a Plant

1. Go to **Plants** in the sidebar
2. Click **Add Plant**
3. Fill in:
   - Name (required)
   - Species (required)
   - Variety / cultivar
   - Source / origin
   - Notes
4. Optionally paste an image URL
5. Click **Save**

### Editing a Plant

1. Click the plant name to open its detail page
2. Click **Edit** (pencil icon)
3. Update any fields
4. Click **Save**

### Viewing Plants

- The **Plant List** shows all your plants in a sortable table
- Click a plant to see its full profile: crosses, seed batches, offspring, and pedigree
- The **Pedigree Explorer** visualises parent-child relationships

### Plant Images

- Images are URL-based — paste a link from any image hosting service
- The image appears on the plant's detail page and labels

### Notes

- Free-text notes can be added to any plant
- Use notes to track observations, location, purchase dates, or anything else

---

## 3. Crosses

### Planning a Cross

1. Go to **Crosses** in the sidebar
2. Click **Plan Cross**
3. Select the **Seed Parent** (female)
4. Select the **Pollen Parent** (male)
5. Add optional tags, notes, or a target trait
6. Click **Save**

The cross appears in your cross list with status "Planned".

### Cross Planner Tool

Use the **Cross Planner** to compare two parents side by side:

- See trait scores for each parent
- View trait overlap
- Identify complementary characteristics

### Recording Pollination

When you make the cross:

1. Open the cross detail page
2. Change status from **Planned** to **Pollinated**
3. Record the pollination date

### Harvesting

When seeds are ready:

1. Open the cross detail page
2. Change status to **Harvested**
3. Click **Create Seed Batch** to move seeds into the seed lifecycle

---

## 4. Seeds

### Seed Batch Lifecycle

Each seed batch tracks seeds from a single pollination through these stages:

1. **Harvested** — Seeds collected from the seed parent
2. **Cleaned** — Separated from chaff and debris
3. **Stored** — In controlled conditions
4. **Stratified** — Cold/warm treatment applied
5. **Germinated** — Sprouted
6. **Active** — Seedlings growing

### Creating a Seed Batch

From a harvested cross, click **Create Seed Batch** and fill in:

- Batch name
- Number of seeds
- Harvest date

### Updating Status

Open a seed batch and click **Update Status** to move it through the lifecycle. Each stage can have a date and notes.

### Stratification

Record stratification details:

- **Type** — Cold or warm
- **Duration** — Number of days
- **Start date**
- **Medium** (e.g. moist sand, paper towel)

### Germination

When seeds sprout:

1. Update the batch to **Germinated**
2. Record the **Germination Rate** (percentage)
3. From a germinated batch, create seedlings

---

## 5. Seedlings

### Creating Seedlings

From a germinated seed batch:

1. Open the seed batch
2. Click **Create Seedlings**
3. Enter the number of seedlings
4. Optionally name each one
5. Click **Save**

### Managing Seedlings

- **Seedling List** — View all seedlings in a table
- **Filter** by status, species, or evaluation score
- **Click** a seedling to see its full evaluation history

### Seedling Dispositions

Assign a disposition to each seedling:

| Disposition | Meaning |
|-------------|---------|
| **Selected** | Outstanding — will be a future breeding parent |
| **Kept** | Good — worth monitoring |
| **Culled** | Does not meet objectives |
| **Sold/Gifted** | Distributed to others |
| **Dead** | Lost |

---

## 6. Quick Evaluation Mode

Quick Evaluation is a keyboard-driven interface for scoring seedlings rapidly.

### Entering Quick Mode

1. Go to **Seedlings**
2. Select the seedlings you want to evaluate
3. Click **Quick Evaluate**

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1`–`5` | Score the current trait (1 = poor, 5 = excellent) |
| `Tab` | Move to the next field |
| `Shift+Tab` | Move to the previous field |
| `Enter` | Save the current seedling and move to the next |
| `Escape` | Cancel and return to seedling list |

### Scoring

- Traits are scored on a 1–5 scale
- The current trait field is highlighted
- Scores update live as you type
- Incomplete evaluations are saved as drafts

---

## 7. Breeding Goals

### Creating a Goal

1. Go to **Goals** in the sidebar
2. Click **Create Goal**
3. Give it a name (e.g. "Fragrant Red Rose")
4. Select the species
5. Add the traits that matter for this goal
6. Assign a **weight** (importance) to each trait (1–10)

### Weighting Criteria

- Higher weight = more important
- Example: if fragrance (10) matters more than petal count (3), the matching algorithm prioritises fragrance

### Running Goal Matching

1. Open a goal
2. Click **Find Matches**
3. Choose whether to search **Plants** or **Seedlings**
4. HybridX scores each candidate against your goal
5. Results are ranked by match percentage

### Interpreting Results

- **Match %** — How well the candidate aligns with your weighted criteria
- **Trait scores** — Individual scores for each trait in the goal
- **Gaps** — Where the candidate falls short

---

## 8. Import/Export

### CSV Import

The Import page lets you bring existing plants into HybridX from a spreadsheet.

1. Go to **Import** in the sidebar
2. Click **Download Template** to get a sample CSV
3. Populate it with your plant data (name, species, variety, notes)
4. Upload the file
5. **Map columns** — tell HybridX which columns in your file correspond to name, species, etc.
6. **Review validation** — check for errors, duplicates, or missing fields
7. Click **Import**

### Exporting Data

1. Go to **Plants**, **Crosses**, or **Seedlings**
2. Click **Export**
3. A CSV file downloads with your data

---

## 9. QR Labels

### Generating a Label

1. Open any plant detail page
2. Click **Label**
3. A QR label appears with the plant name and a scannable code

### Printing

1. From the label preview, click **Print**
2. Use standard label paper or plain paper
3. The label includes the plant name, species, and QR code

### Scanning

1. Open the camera on your phone
2. Point at the QR code
3. The plant detail page opens on your phone's browser
4. View care notes, pedigree, and evaluation history on mobile

### Garden Use

Print labels for your physical garden. Attach them to pots, beds, or stakes. Scan during rounds to pull up plant details instantly.
