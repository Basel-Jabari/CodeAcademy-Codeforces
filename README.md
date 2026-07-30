# Codeforces X PPU Code Academy

Browser tools for [**PPU Code Academy**](<https://linktr.ee/PPUCodeAcademy12>), built on the public Codeforces API.

Pick practice problems by tag logic, cross-check a group of people against a list of problems, and assemble a full custom contest - all client-side, no account or login required.

![React](https://img.shields.io/badge/React-16.13-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3.7-3178c6?logo=typescript&logoColor=white)
![styled-components](https://img.shields.io/badge/styled--components-5.1-db7093?logo=styled-components&logoColor=white)
![Codeforces API](https://img.shields.io/badge/Codeforces-public%20API-1f8acb)

---

## Contents

- [Quick start](#quick-start)
- [The three tabs](#the-three-tabs)
  - [Problem Randomizer](#1-problem-randomizer)
  - [Users-Problems Cross Analysis](#2-users-problems-cross-analysis)
  - [Contest Builder](#3-contest-builder)
- [Tag expression language](#tag-expression-language)
- [Input formats](#input-formats)
- [Data, APIs, and storage](#data-apis-and-storage)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [Credits](#credits)

---

## Quick start

**Requirements:** Node.js and npm. Any modern Node version works - the `--openssl-legacy-provider`
flag is already baked into the scripts for Node 17+ (see [Troubleshooting](#troubleshooting)).

```bash
npm install
npm start          # http://localhost:3000
```

Production build and deploy to GitHub Pages:

```bash
npm run build      # outputs to build/
npm run deploy     # gh-pages -d build
```

---

## The three tabs

### 1. Problem Randomizer

Pull a random problem that matches a tag expression and a rating window.

1. **Build a tag expression** - drag operators (`AND` / `OR` / `XOR` / `NOT`) and tags from the
   palette, or type the expression directly in the text field (see
   [Tag expression language](#tag-expression-language)). The tree and the text stay in sync.
2. **Set the rating range** - drag the slider handles, or click either number to type an exact
   value. Range is **800–3500** in steps of **100**.
3. **Exclude solved problems (optional)** - paste or upload a list of handles under
   *Participant handles*. Any problem already **Accepted** by any of those handles is skipped.
4. Press **Randomize**.

Results stack up in the **Picked problems** list (newest first) and survive a page reload -
they're kept in `localStorage`. **Clear** empties the list.

> If your expression contains no tags at all, a random tag is injected so you still get a
> meaningful problem instead of the entire problemset.

---

### 2. Users-Problems Cross Analysis

Cross-check any set of Codeforces handles against any set of problems, and get five different
views of the same data.

**Inputs**

| Input | Accepts |
|---|---|
| **Import from contest link** | One or more **public** contest/gym URLs or numeric ids, separated by spaces, commas, or new lines. Pulls the **problem list only** - no participants. |
| **Handles for cross analysis** | Handles separated by commas/whitespace, or an uploaded `.txt` / `.csv` / `.tsv` file. |
| **Problems** | Problem URLs, `2240B`-style ids, or an uploaded list. |

Press **Check**. Handles are verified against Codeforces first - anything that doesn't exist stays
in the input box and is reported, so a single typo never silently skews the tables.

**Every cell is one of three statuses:** `Accepted`, `Tried, not accepted`, or `Did not try`.

**The five tables**

| # | Table | Rows × Columns | Each cell holds |
|---|---|---|---|
| 1 | By handle - status per problem | handles × problems | that person's status |
| 2 | By status - names | statuses × problems | who is in that status (A→Z) |
| 3 | By status - counts | statuses × problems | how many people |
| 4 | By handle - problems per status | handles × statuses | that person's problem list |
| 5 | Totals per person | handles × statuses | how many problems |

Each table keeps its **own** row and column order - dragging or sorting one never disturbs the
others. Grab any row header or column header to drag it into place, use **Sort rows** (handles
A→Z) and **Sort columns** (problems by contest then letter) where the table's shape allows it, and
**Delete** a handle or problem straight from its header.

**Filtering**

- **Filter handles** - search box, show all / hide all, one checkbox per handle.
- **Filter problems** - same, plus **problem groups**:
  - Importing a contest automatically creates a group named after that contest and puts its
    problems inside it. Import several contests and you get several groups.
  - Each group has its own checkbox that shows/hides every problem inside it at once
    (it renders as indeterminate when only part of the group is visible).
  - Drag any problem between groups, or out into **Ungrouped**. Press **+ New group** to make
    your own, then rename it inline; **Ungroup** dissolves a group and keeps its problems.
  - If a problem you already added shows up in a newly imported contest, it moves into that
    contest's group instead of being duplicated.

**Export** - *Export all tables* downloads `problem-status-tables.xls`, one sheet per table,
honouring whatever the filters are currently showing.

---

### 3. Contest Builder

Assemble a custom contest from several independent randomizer rules.

**Each problem slot** is a self-contained randomizer: its own tag expression, rating range,
exclude-by-handle list, and a count of how many problems to pull (0–50). Slots can be:

- **Renamed** - give a slot a meaningful name; otherwise it's numbered by its position.
- **Duplicated** - clones the whole configuration and drops the copy right below.
- **Folded** - collapse a configured slot down to a one-line summary.
- **Reordered** - drag the ⠿ handle. Slot order is read fresh on every **Generate**, so
  rearranging slots never disturbs a table you already generated.

Press **Generate** (under the last slot) to build the contest. No problem is ever used twice
across the whole contest, and any slot that matched nothing is listed in the failure report
rather than silently dropped.

**The results table**

- Columns: *Codeforces id*, *Title*, *Rating*, *Tags*, *Count solved by*.
- **Click a column header** to sort by it; click again to flip ascending/descending. Only one
  column sorts at a time - clicking another column replaces the previous sort.
- **Drag a column header** to move that column left or right.
- **Drag a row** by its `#` handle to place it manually. This clears the active sort, since a
  hand-picked order and a computed sort can't both be true at once.
- **Shuffle order** randomizes the running order without changing which problems were picked.
- Row numbers always reflect the current visual order.

---

## Tag expression language

The palette and the text field are two views of the same expression tree, so you can start by
dragging and finish by typing (or the other way round).

**Operators**

| Operator | Meaning | Text forms |
|---|---|---|
| `AND` | every child must match | `AND`, `&`, `&&`, `+`, `,` |
| `OR` | at least one child matches | `OR`, `\|`, `\|\|` |
| `XOR` | exactly one child matches | `XOR`, `^` |
| `NOT` | its single child must **not** match | `NOT`, `!`, `~` |

Precedence is `AND` > `XOR` > `OR`; use `( )` or `[ ]` to group explicitly. Nesting is unlimited.

**Root mode** - one prefix decides how extra tags are treated:

| Mode | Behaviour |
|---|---|
| `LOOSE:` *(default)* | the expression must match; the problem may carry other tags too |
| `STRICT:` | the expression must match **and** the problem may carry no tag outside it |

**Examples**

| Expression | Matches |
|---|---|
| `LOOSE: dp AND implementation AND (graphs OR number theory) AND NOT geometry` | a dp + implementation problem that is also graph-theory or number-theory, but never geometry |
| `STRICT: greedy, sortings` | problems tagged **exactly** greedy and sortings, nothing else |
| `dp ^ greedy` | dp or greedy, but not both |
| `!interactive & binary search` | binary search, excluding interactive problems |

Tag names come from the 33 official Codeforces tags in `src/services/data.ts`; multi-word tags
such as `dfs and similar` are matched as a single tag, not as `dfs AND similar`. Unknown words are
rejected with a message instead of being silently ignored, and self-defeating expressions (a tag
that is both required and excluded in the same group) raise a contradiction warning.

---

## Input formats

**Handles** - separated by commas, semicolons, or whitespace; deduplicated case-insensitively.
Uploads accept `.txt`, `.csv`, and `.tsv`.

**Problems** - any of these work, mixed freely, one per line or comma-separated:

```text
2240A
2240 A
https://codeforces.com/contest/2240/problem/A
https://codeforces.com/problemset/problem/2240/A
https://codeforces.com/gym/102644/problem/B
```

**Contest links** - public contests and gyms, as URLs or bare ids, several at a time:

```text
https://codeforces.com/contest/2040, https://codeforces.com/gym/102644
2043
```

All problem links rendered by the app point at the in-contest page
(`codeforces.com/contest/{id}/problem/{index}`, or `/gym/...` for gyms).

---

## Data, APIs, and storage

**Endpoints used** - all public, all unauthenticated:

| Endpoint | Used for |
|---|---|
| `problemset.problems` | the full problemset and its `solvedCount` statistics |
| `user.status` | a handle's submission history (paged, 10 000 per request) |
| `contest.standings` | the problem list of a public contest or gym |

**Rate limiting** - Codeforces allows roughly one request every two seconds per client, so every
call in the app funnels through a single global gate (`waitForCodeforcesApiSlot` in
`src/services/submissions.ts`) that spaces requests **2100 ms** apart. Large cross-analysis runs
are therefore slow by design; the progress note under the buttons tells you which problem is
currently loading.

**Caching** - the problemset is fetched once per session and reused; each handle's submission
history is cached in memory after its first fetch.

**Storage** - the only persisted state is the Randomizer's picked-problem history, under the
`problemsList` key in `localStorage`. Nothing is sent anywhere except to `codeforces.com`.

---

## Project structure

```text
src/
├── components/
│   ├── home/               # tab container, snackbar wiring
│   ├── tabs/               # TabBar
│   ├── randomizer/         # Problem Randomizer tab
│   ├── problem-check/      # Users-Problems Cross Analysis tab
│   ├── contest-builder/    # Contest Builder tab
│   ├── expression/         # tag expression tree builder (drag & drop)
│   ├── problems-section/   # picked-problem cards
│   ├── slider/             # rating range slider
│   ├── common/             # OutlineButton, Row, ProblemLinkText
│   ├── header/ footer/ snackbar/ ...
├── services/
│   ├── data.ts             # tag list, rating bounds
│   ├── problems.ts         # problemset fetch/cache, filtering, random picks
│   ├── submissions.ts      # handle parsing/verification, status matrix, rate limiter
│   ├── tagExpression.ts    # expression tree CRUD, evaluation, serialization
│   ├── expressionParser.ts # text → expression tree
│   ├── problemLink.ts      # problem id/URL parsing and link building
│   ├── contestImport.ts    # public contest/gym problem import
│   ├── handleList.ts       # handle list parsing and file upload
│   ├── tableSort.ts        # sort + drag-reorder helpers
│   ├── excelExport.ts      # multi-sheet .xls export
│   └── storage.ts          # localStorage for the randomizer history
├── models/                 # Problem, ProblemStatistics, TagExpression
├── assets/ theme.ts        # logos, icons, font, colour palette
└── App.tsx index.tsx
```

---

## Scripts

| Script | What it does |
|---|---|
| `npm start` | dev server on port 3000 |
| `npm run build` | production build into `build/` |
| `npm test` | Create React App test runner |
| `npm run deploy` | build, then publish `build/` to the `gh-pages` branch |

---

## Troubleshooting

**`error:0308010C:digital envelope routines::unsupported` on start or build**
Already handled - both scripts pass `--openssl-legacy-provider`. This is needed because
`react-scripts@3.4.1` ships webpack 4, which hashes with an algorithm OpenSSL 3 (Node 17+)
disabled by default. If you run `react-scripts` directly, add the flag yourself.

**Everything feels slow / requests appear to hang**
That's the 2100 ms Codeforces rate gate. A cross-analysis of *N* problems makes at least
*N* requests, so it takes at least `2.1 × N` seconds. The loading note shows current progress.

**"handle not found on Codeforces"**
The handle is verified through the API before it can enter the tables. Check the spelling - the
rejected entries are left in the input box for exactly this reason.

**A contest link won't import**
Only public contests and gyms are supported. Private and group contests
(`codeforces.com/group/.../contest/...`) are rejected by design.

---

## Limitations

- Public Codeforces data only - there is no login, and no private or group contest support.
- `contest.standings` imports **problems only**; participant lists are never fetched.
- *Count attempted* is not exposed by `problemset.problems`, so only `solvedCount` is shown.
- Gym copies of a problem may not share ids with the main problemset, so solves on one copy
  won't necessarily line up with the other.

---

## Credits

Built on [Codeforces Randomizer](https://github.com/KarimElghamry/Codeforces-Randomizer) by
**Karim Elghamry**.

[CodeAcademy-Codeforces](https://github.com/Basel-Jabari/Codeforces-Randomizer) -
**Basel Al-Jabari**, **Bara Wazwaz**, **Mohammed Al-Shareef**,
for [PPU Code Academy](<https://linktr.ee/PPUCodeAcademy12>).

Problem data courtesy of the [Codeforces API](https://codeforces.com/apiHelp).
