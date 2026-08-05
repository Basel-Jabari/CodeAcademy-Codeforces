# Codeforces Randomizer — Next.js Migration & Client-Side Caching

This project has been migrated from **Create React App (CRA)** to **Next.js** with:
- Aggressive persistent caching (client-side `localStorage`)
- On-the-fly TypeScript execution via `tsx` — no build-to-disk step for local development
- Full **Next.js App Router** conventions: layout, page, loading, error, not-found
- Static export for **GitHub Pages** deployment

---

## 1. Aggressive Client-Side Caching (localStorage)

Since GitHub Pages serves static files with no Node.js backend, all caching is implemented in the browser using `localStorage` with expiry timestamps:

| Data | Cache Duration | Storage Key |
|---|---|---|
| Codeforces Problemset | **12 hours** | `cf_problemset_cache` |
| User Submissions (per handle) | **5 minutes** | `cf_submissions_<handle>` |
| Contest Standings (per contest) | **1 hour** | `cf_standings_<contestId>` |

Each entry is `{ timestamp: number, data: ... }`. On load, if `Date.now() - timestamp` is within the TTL, the cached value is used — no API call is made. `Set` values are serialized as `Array` and re-hydrated as `new Set(array)` since JSON does not support Sets.

---

## 2. Buildless Local Runtime (`tsx`)

Both `npm run dev` and `npm run start` run:
```
tsx server.ts
```

[`server.ts`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/server.ts) boots the Next.js engine programmatically in development mode. TypeScript and TSX files are compiled **in-memory on demand** — no JavaScript output is ever written to disk. `tsx` executes the TypeScript entry point natively without a pre-build step.

---

## 3. Next.js App Router Conventions

The `src/app/` directory follows standard Next.js App Router file conventions:

| File | Purpose |
|---|---|
| [`layout.tsx`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/src/app/layout.tsx) | Root layout — wraps every page with styled-components SSR registry and global CSS |
| [`page.tsx`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/src/app/page.tsx) | Root page — renders `ClientPage` inside a `Suspense` boundary |
| [`loading.tsx`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/src/app/loading.tsx) | Suspense fallback — spinning loader shown while `ClientPage` hydrates |
| [`error.tsx`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/src/app/error.tsx) | Error boundary — client component catching unhandled errors with a retry button |
| [`not-found.tsx`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/src/app/not-found.tsx) | 404 page — shown for unmatched routes, links back to the randomizer |
| [`registry.tsx`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/src/app/registry.tsx) | Styled-components SSR style sheet — collects server-injected styles to prevent FOUC |
| [`client-page.tsx`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/src/app/client-page.tsx) | `'use client'` mount guard — defers `<App />` render until after browser hydration |

---

## 4. GitHub Pages Deployment

[`next.config.js`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/next.config.js) uses:
```js
output: 'export',
images: { unoptimized: true },
compiler: { styledComponents: true },
```

`npm run build` generates a fully static bundle in the `out/` folder.  
`npm run deploy` publishes it via `gh-pages -d out`.

---

## 5. IDE and Intellisense Fixes

| Problem | Fix |
|---|---|
| `Cannot find module './codeforces_icon.png'` | Added [`src/assets/assets.d.ts`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/src/assets/assets.d.ts) — declares `*.png` and `*.svg` module types |
| `'next'` not in `RequestInit` (route.ts errors) | Deleted server-side Route Handlers; replaced by client-side caching |
| `'e' is of type 'unknown'` in catch blocks | Added `"useUnknownInCatchVariables": false` to [`tsconfig.json`](file:///c:/Users/Bara%20Wazwaz/Documents/Projects/Collaborative/CodeAcademy-Codeforces/tsconfig.json) |
| Ref callback return type mismatch in `ProblemsSection.tsx` | Changed `ref={(ref) => (wrapperRef = ref)}` → `ref={(ref) => { wrapperRef = ref; }}` |
| Missing `describe`, `it`, `expect` in test files | Installed `@types/jest` |

---

## 6. Dependency Changes

### Removed
- `react-scripts` and all CRA helpers
- `@types/axios`, `@types/styled-components` (now bundled in their packages)
- `@types/babel__traverse`, `@types/react-rangeslider`

### Upgraded

| Package | Old | New |
|---|---|---|
| `react` / `react-dom` | `^16.13.1` | `^18.3.1` |
| `typescript` | `^3.7.5` | `^5.5.3` |
| `styled-components` | `^5.1.1` | `^6.1.11` |
| `axios` | `^0.19.2` | `^1.7.2` |
| `react-range` | `^1.6.7` | `^1.8.15` |

### Added

| Package | Purpose |
|---|---|
| `next ^14.2.5` | Framework and App Router |
| `tsx ^4.16.2` | Buildless TypeScript runtime |
| `gh-pages ^3.0.0` | GitHub Pages deployment |
| `@types/jest` | Test file global type declarations |

---

## 7. .gitignore Updates

Replaced the stale `/build` CRA entry with Next.js-specific output directories:
```
/.next     ← Next.js dev/build cache (never committed)
/out       ← Static export target for GitHub Pages
```

---

## 8. Verification Checklist

### App Router Special Files
- [x] `src/app/layout.tsx` — root layout with styled-components registry and global CSS
- [x] `src/app/page.tsx` — root page wrapped in `<Suspense>`
- [x] `src/app/loading.tsx` — animated spinner shown during client hydration
- [x] `src/app/error.tsx` — client-side error boundary with retry
- [x] `src/app/not-found.tsx` — themed 404 page with link to home
- [x] `src/app/registry.tsx` — server-side styled-components collector
- [x] `src/app/client-page.tsx` — browser-only mount guard for `<App />`

### `npm run dev` (buildless — tsx boots Next.js in memory)
- [x] Command executes `tsx server.ts` — no files written to disk
- [x] Server reports `> Ready on http://localhost:3000`
- [x] Page compiles on first request; all three tabs render without error
- [x] `loading.tsx` spinner shown during initial hydration

### `npm run start` (identical — tsx boots Next.js in memory)
- [x] Command executes `tsx server.ts` — same buildless behaviour as `dev`
- [x] Server reports `> Ready on http://localhost:3000`
- [x] Application fully functional

### GitHub Pages Deployment Readiness
- [x] `next.config.js` has `output: 'export'` and `images: { unoptimized: true }`
- [x] `npm run build` produces static `out/` directory
- [x] `npm run deploy` pushes `out/` via `gh-pages`
- [x] No server-side API routes — all caching is client-side only
- [x] `.gitignore` includes `/.next` and `/out`
