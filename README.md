# Codeforces Randomizer

A simple browser tool for Codeforces.

- Pick a random problem with a tag expression you build yourself
- Skip problems your people already solved
- Build status tables for a list of people and problems

No login. No API key.

Original project: https://github.com/KarimElghamry/Codeforces-Randomizer

---

## The page

The screen is split in two halves:

| Side | What it does |
|---|---|
| **Left — Randomizer** | tag expression, rating, handles, Randomize, picked problems |
| **Right — Analyzer** | problem status tables for a list of people |

On a narrow screen (or a phone) the two halves stack, randomizer first.

---

## Features

### 1. Random problem

1. Build a tag expression (see below)
2. Choose a rating range (800–3500)
3. Press **Randomize**
4. Click a result card to open the problem on Codeforces

History stays in your browser. Press **Clear** to remove it.

If you leave the expression empty, Randomize picks one random tag for you.

---

### 2. Tag expression

Instead of one global mode, tags live in **blocks** you can nest freely:

```
dp AND implementation AND (graphs OR number theory) AND (NOT geometry)
```

**Blocks**

| Level | Options | Meaning |
|---|---|---|
| Root | `STRICT` | match the expression; the problem may not carry any other tags |
| Root | `LOOSE` | match the expression; other tags are fine |
| Nested | `AND` | every item inside must match |
| Nested | `OR` | at least one item inside must match |
| Nested | `XOR` | exactly one item inside may match |
| Nested | `NOT` | the single item inside must not match |

`dp XOR greedy` keeps problems that have `dp` without `greedy`, or `greedy` without
`dp`, and drops the ones that have both.

Root children are joined with AND. `NOT` takes exactly one child.

**Writing it by hand**

The box above the palette is editable:

```
STRICT: dp AND implementation AND (graphs OR number theory) AND (NOT geometry)
```

- Start with `STRICT:` or `LOOSE:` (default is `LOOSE` if you omit it)
- Press **Enter** (or **Apply**) to use it, **Esc** (or **Cancel**) to go back
- Brackets nest as deep as you like
- `AND` binds tighter than `XOR`, and `XOR` tighter than `OR`
- `&` `|` `^` `!` also work as `AND` `OR` `XOR` `NOT`
- Tag names with spaces are fine — `dfs and similar` is one tag

The box always shows the current expression, so building with blocks updates the text and
typing updates the blocks.

**How to build with blocks**

- Switch root between **STRICT** and **LOOSE** on the root card
- **Drag** `AND` / `OR` / `XOR` / `NOT` from the palette into any block
- **Drag** or **click** a tag from the searchable A→Z list
- Blocks do **not** offer their own type buttons — pick the type from the palette above
- **Drag** a block by its grip (`⣿`) to move it
- `×` removes a tag or a whole block

**Load example** fills in the expression above; **Clear expression** empties it.

A block cannot be dropped inside itself, and if one group both requires and excludes the
same tag you get a warning instead of an empty result.

Because any expression is possible, the app downloads the problemset once per visit and
does the filtering in your browser.

---

### 3. Skip solved problems (Randomize only)

This is the handles box on the **left** side.

If you add handles there, Randomize will not suggest a problem that any of them already
got **Accepted (OK)** on.

- Type handles, or upload a `.txt` / `.csv` / `.tsv` file
- Every non-empty cell becomes a handle
- Leave empty if you do not want this filter

This list is **only for Randomize**. The analyzer uses another list.

---

### 4. Problem status tables (Analyzer)

The right half of the page. Uses its **own** handles box.

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
