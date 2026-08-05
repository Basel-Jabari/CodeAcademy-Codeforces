# Codeforces X PPU Code Academy

Browser-based competitive programming tools built on the public [Codeforces API](https://codeforces.com/apiHelp) for **PPU Code Academy**.

Rebuilt on **Next.js 14** (App Router) with client-side persistent caching and static export for **GitHub Pages**.

---

## Features

- **Problem Randomizer**: Pick random problems filtered by tag expressions (AND / OR / NOT trees), rating range, and solver handle exclusion.
- **Cross Analysis**: Compare problem status (`Accepted`, `Attempted`, `Untried`) across multiple Codeforces handles simultaneously.
- **Contest Builder**: Generate custom virtual contests with slot-by-slot tag expression constraints, rating boundaries, and automatic problem count enforcement. Import official Codeforces contests or public Gyms directly.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Client Components)
- **Runtime**: `tsx` (on-the-fly TypeScript execution in development; no compilation step to disk)
- **Styling**: `styled-components` v6 with Next.js SSR style registry
- **State Management**: `localStorage` mirrored state hooks (`usePersistentState`)
- **Deployment**: Static HTML Export (`output: 'export'`) hosted on GitHub Pages via `gh-pages`

---

## Aggressive Client-Side Caching

Because the Codeforces public API imposes strict rate limits (maximum 1 request per 2 seconds), all data fetching layer functions implement transparent `localStorage` TTL caching:

| Resource | Cache Key | Duration |
|---|---|---|
| Whole Problemset | `cf_problemset_cache` | **12 hours** |
| Handle Submissions | `cf_submissions_<handle>` | **5 minutes** |
| Contest Standings | `cf_standings_<contestId>` | **1 hour** |

If a valid cache entry exists, requests return instantly from memory / `localStorage` without sending any network request to Codeforces.

---

## Getting Started

### Prerequisites

- Node.js 18+
- `npm`

### Installation

```bash
git clone https://github.com/Basel-Jabari/Codeforces-Randomizer.git
cd Codeforces-Randomizer
npm install
```

### Local Development

Run the development server via `tsx` (TypeScript executed directly on-the-fly):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (GitHub Pages)

Export the static bundle and publish to GitHub Pages:

```bash
npm run deploy
```

This runs `next build` (generating the `out/` static directory) followed by `gh-pages -d out`.

---

## License

[ISC License](LICENSE)
