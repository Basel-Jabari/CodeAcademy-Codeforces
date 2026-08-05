# Codeforces X PPU Code Academy

A set of free browser tools for [**PPU Code Academy**](https://linktr.ee/PPUCodeAcademy12) that help
you find practice problems, track how a group is doing, and put together a full contest.

**Open it here: [basel-jabari.github.io/CodeAcademy-Codeforces](https://basel-jabari.github.io/CodeAcademy-Codeforces/)**

Nothing to install, and no account or login. Just open the page and start.

---

## Contents

- [What you can do](#what-you-can-do)
- [Problem Randomizer](#problem-randomizer)
- [Users–Problems Cross Analysis](#usersproblems-cross-analysis)
- [Contest Builder](#contest-builder)
- [Writing tag rules](#writing-tag-rules)
- [How to enter handles and problems](#how-to-enter-handles-and-problems)
- [Good to know](#good-to-know)
- [Credits](#credits)
- [Contributors](#contributors)

---

## What you can do

The site has three tabs. Each one does a different job:

| Tab | Use it to |
|---|---|
| **Problem Randomizer** | Get a random problem that matches the topics and difficulty you want |
| **Users–Problems Cross Analysis** | See who solved what, across a whole group of people and a whole list of problems |
| **Contest Builder** | Put together a full contest, problem by problem |

---

## Problem Randomizer

Use this when you want something to practise but do not want to pick it yourself.

1. **Choose the topics.** Drag topics and connectors into the box, or type the rule in the text
   field. Both stay in sync, so you can start by dragging and finish by typing.
   See [Writing tag rules](#writing-tag-rules).
2. **Choose the difficulty.** Drag the two ends of the slider, or click either number and type it.
   The range goes from **800** to **3500**.
3. **Skip problems people already solved (optional).** Paste a list of Codeforces handles under
   *Participant handles*, or upload a file. Any problem already solved by any of them is skipped.
4. **Press Randomize.**

Every problem you get is added to the **Picked problems** list, newest first. The list stays
after you reload the page. Press **Clear** to empty it.

> If your rule has no topics in it at all, one random topic is added for you, so you get a
> sensible problem instead of something from the entire archive.

---

## Users–Problems Cross Analysis

Use this to check a group of people against a list of problems. Great for tracking a training
group, a class, or a team.

### Step 1 — Add the problems

You can either:

- **Paste a contest link** in *Import from contest link*. This brings in the problems of that
  contest. You can paste several links at once. It brings in problems only, never the people who
  took part.
- **Paste the problems yourself** in the *Problems* box, or upload a file.

### Step 2 — Add the people

Paste the Codeforces handles in the *Handles* box, or upload a file.

### Step 3 — Press Check

Handles are checked against Codeforces first. If one does not exist, it is reported and left in
the box so you can fix the spelling. A single typo will never quietly ruin your tables.

### What you get

Every person and problem gets one of three results:

- **Accepted** — solved it
- **Tried, not accepted** — attempted it but did not solve it
- **Did not try** — never submitted

You then get five tables, all showing the same information in different shapes:

| Table | Shows |
|---|---|
| By handle — status per problem | What each person did on each problem |
| By status — names | Who is in each result, for each problem |
| By status — counts | How many people are in each result, for each problem |
| By handle — problems per status | Each person's problems, split by result |
| Totals per person | How many problems each person solved, tried, or skipped |

### Arranging the tables

- **Drag** any row or column header to move it. Each table keeps its own arrangement, so changing
  one never disturbs the others.
- **Sort rows** puts people in alphabetical order; **Sort columns** puts problems in contest order.
- **Delete** removes a person or a problem straight from its header.

### Hiding what you do not need

- **Filter handles** — search, show all, hide all, or tick people one by one.
- **Filter problems** — the same, plus **groups**. Importing a contest automatically creates a
  group named after it. You can tick a whole group at once, drag problems between groups, create
  your own group with **+ New group**, rename it, or dissolve it with **Ungroup**. If a problem you
  already added appears in a contest you import later, it moves into that contest's group instead
  of appearing twice.

### Saving your work

**Export all tables** downloads a spreadsheet with one sheet per table. It exports exactly what
you can see, so anything you hid stays hidden.

---

## Contest Builder

Use this to build a contest where each problem follows its own rule. For example: an easy
implementation problem, then a medium graph problem, then a hard one on any topic.

### Building it

Each problem in the contest is a **slot** with its own settings: its own topics, its own difficulty
range, its own list of people whose solved problems should be skipped, and how many problems to
pick from it (up to 50).

For each slot you can:

- **Rename** it, to give it a meaningful name instead of a number
- **Duplicate** it, to copy all its settings and place the copy underneath
- **Fold** it, to collapse it into a single summary line once you are happy with it
- **Reorder** it, by dragging the handle on its left

Press **Generate** under the last slot to build the contest.

No problem is ever used twice in the same contest. If a slot cannot find anything that fits, it is
listed in a short report rather than being quietly skipped, so you always know what to loosen.

### The results table

The table shows each problem's **Codeforces id**, **title**, **difficulty**, **topics**, and **how
many people solved it**.

- **Click a column heading** to sort by it. Click again to reverse the order.
- **Drag a column heading** to move that column left or right.
- **Drag a row** by its number to place it exactly where you want. Doing this clears the sorting,
  since a hand-picked order and an automatic sort cannot both apply at once.
- **Shuffle order** mixes up the running order without changing which problems were chosen.

---

## Writing tag rules

A tag rule decides which topics a problem must have. You can build it by dragging, or type it out.

### Connectors

| Connector | Meaning | You can also type |
|---|---|---|
| **AND** | every part must match | `&`, `&&`, `+`, `,` |
| **OR** | at least one part must match | `\|`, `\|\|` |
| **XOR** | exactly one part must match | `^` |
| **NOT** | this part must **not** match | `!`, `~` |
| **OPTIONAL** | this part is allowed, but not required | — |

`AND` is applied before `XOR`, and `XOR` before `OR`. Use brackets to make the order explicit.
You can nest brackets as deeply as you like.

### Strict or loose

Start the rule with one of these to decide what happens to topics you did not mention:

| Start with | Meaning |
|---|---|
| `LOOSE:` *(the default)* | the rule must match, and the problem may have other topics too |
| `STRICT:` | the rule must match, and the problem may have **no** other topics |

`OPTIONAL` matters most with `STRICT`, where it lets you allow an extra topic without requiring it.

### Examples

| Rule | Finds |
|---|---|
| `LOOSE: dp AND implementation AND (graphs OR number theory) AND NOT geometry` | a dp and implementation problem that is also about graphs or number theory, but never geometry |
| `STRICT: greedy, sortings` | problems tagged greedy and sortings and nothing else |
| `dp ^ greedy` | dp or greedy, but not both |
| `!interactive & binary search` | binary search problems, without interactive ones |

Topic names are the official Codeforces ones. Names made of several words, such as
`dfs and similar`, count as one topic. If you type something that is not a real topic, you get a
clear message instead of a silently wrong result. If a rule contradicts itself, by requiring and
excluding the same topic, you get a warning.

---

## How to enter handles and problems

**Handles** can be separated by commas, semicolons, spaces, or new lines. Repeats are removed
automatically. You can also upload a `.txt`, `.csv`, or `.tsv` file.

**Problems** can be written in any of these ways, mixed together freely:

```text
2240A
2240 A
https://codeforces.com/contest/2240/problem/A
https://codeforces.com/problemset/problem/2240/A
https://codeforces.com/gym/102644/problem/B
```

**Contest links** can be full links or just the number, several at a time:

```text
https://codeforces.com/contest/2040, https://codeforces.com/gym/102644
2043
```

---

## Good to know

**Why is it slow sometimes?**
Codeforces only allows about one request every two seconds. Checking many problems or many people
takes time because of that limit, not because something is stuck. The note under the buttons tells
you what it is loading right now.

**"Handle not found on Codeforces"**
That handle does not exist. Check the spelling. Rejected handles are deliberately left in the box
so you can correct them.

**A contest link will not import**
Only public contests and gyms work. Private and group contests are not supported.

**Is my data sent anywhere?**
No. Everything runs in your browser, and the only site it talks to is Codeforces itself.

**Other things worth knowing**
- Only public Codeforces information is used, so there is no login.
- Importing a contest brings in its problems only, never the list of people who took part.
- A problem that exists both in a gym and in the main archive may not share the same id, so solves
  on one copy do not always line up with the other.

---

## Credits

Built on [Codeforces Randomizer](https://github.com/KarimElghamry/Codeforces-Randomizer) by
**Karim Elghamry**.

Problem data comes from [Codeforces](https://codeforces.com/).

Made for [**PPU Code Academy**](https://linktr.ee/PPUCodeAcademy12) at
[Palestine Polytechnic University](https://ppu.edu/).

---

## Contributors

- **[Basel Al-Jabari](https://github.com/Basel-Jabari)**
- **[Bara Wazwaz](https://github.com/BaraWazwaz)**
- **[Mohammed Al-Shareef](https://github.com/MMohammedShareeff)**

Found a problem, or have an idea? Please
[open an issue](https://github.com/Basel-Jabari/CodeAcademy-Codeforces/issues).
