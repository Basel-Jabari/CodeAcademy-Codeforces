# Codeforces Randomizer

A simple browser tool for Codeforces.

- Pick a random problem by topic and rating
- Skip problems your people already solved
- Build status tables for a list of people and problems

No login. No API key.

Original project: https://github.com/KarimElghamry/Codeforces-Randomizer

---

## Features

### 1. Random problem

1. Click tags (example: `dp`, `graphs`)
2. Choose a rating range (800–3500)
3. Press **Randomize**
4. Click a result card to open the problem on Codeforces

History stays in your browser. Press **Clear** to remove it.

**Tag modes**

| Mode | Meaning |
|---|---|
| `AND` | Problem has **all** selected tags |
| `OR` | Problem has **at least one** selected tag |
| `ONLY` | Problem has **only** these tags |
| `NOT` | Problem has **none** of these tags |

---

### 2. Skip solved problems (Randomize only)

This is the **first** handles box (above Randomize).

If you add handles there, Randomize will not suggest a problem that any of them already
got **Accepted (OK)** on.

- Type handles, or upload a `.txt` / `.csv` / `.tsv` file
- Every non-empty cell becomes a handle
- Leave empty if you do not want this filter

This list is **only for Randomize**. The tables below use another list.

---

### 3. Problem status tables

At the bottom of the page. Uses its **own** handles box.

1. Enter handles (or upload)
2. Enter problems / links / ids like `2240A` (or upload)
3. Press **Check**

A handle is only added when Codeforces really has that account. Check asks Codeforces
first, and:

- handles that exist → added to the tables and removed from the box
- handles that are wrong, or do not exist on Codeforces → **stay in the box** with a message

Problems work the same way: valid ones move to the tables, invalid ones stay in the box.

**Filters**

- **Filter handles** and **Filter problems** buttons open a small panel
- Search box on top, then a checkbox for every item (sorted: handles A → Z, problems by
  contest number then letter)
- Uncheck to hide an item from every table, from every count, and from the export
- **Show all** / **Hide all** to change everything at once

The header pills show how many handles and problems are shown, and the total when a
filter hides something.

After Check you get **5 tables**:

| # | Table | Rows | Columns | Cells |
|---|---|---|---|---|
| 1 | By handle — status per problem | People | Problems | Accepted / Tried / Did not try |
| 2 | By status — names | Accepted / Tried / Did not try | Problems | Names (or a fun empty message on screen) |
| 3 | By status — counts | Same statuses | Problems | Count of people (`0` if empty) |
| 4 | By handle — problems per status | People | Statuses | Problem ids for that person |
| 5 | Totals per person | People | Statuses | How many in each status |

**Sort**

- Sort **columns** (problems): by contest number, then letter
- Sort **rows** (people): A → Z
- Names inside a cell are always A → Z, problem ids inside a cell are always sorted
- No sort button for status labels (you can still drag them)

**Drag**

Every table has its **own** order. Dragging a header or a row in table 1 does not move
anything in the other tables.

- Drag problem headers to reorder that table's columns
- Drag people rows to reorder that table's rows
- Drag status rows / status columns to reorder them in that table

**Delete**

- Delete a problem → removed from all tables
- Delete a person → removed from all tables

**Export all tables**

One Excel file (`.xls`) with **5 sheets** (pages), in the same order as the screen.

In the export file, empty cells are `none` (not the on-screen fun messages).

Each column is sized to its longest cell, so you should not need to widen anything by
hand. Only the rows and columns that are currently shown are exported.

---

### Limits

The app only sees **public** Codeforces history. It cannot see Gym solves, private groups,
hidden activity, other accounts, or Gym copies of a problem.

---

## How to run

```bash
npm install
npm start
```

Open http://localhost:3000

```bash
npm run build
npm run deploy
```

---

## Credits

Based on: https://github.com/KarimElghamry/Codeforces-Randomizer
