# Project structure & AI rules
#
# Copy this file to `hint.md` at the repo root for local AI sessions.
# `hint.md` is gitignored so machine-local notes stay private; keep this
# example updated when the layout changes.

## Architecture (inspired by nm-commercial-api)

Thin **views** live under `features/*/views` and `app/`.
Business logic lives under `lib/*/domain`.
Shared types live under `lib/models`.
Shared presentational primitives live under `lib/ui`.

```
src/
  index.tsx                 # CRA entry only — keep thin
  app/                      # app shell (Home, chrome)
    layout/                 # header, footer, tabs, snackbar
  features/                 # one folder per product surface
    randomizer/views/
    cross-analysis/views/
    contest-builder/views/
    expression/views/       # shared tag-expression UI
  lib/                      # reusable domain + infra
    models/                 # Problem, TagExpression, …
    expression/domain/      # parse + evaluate tag trees
    problems/domain/        # pick/filter problems, static tag list
    codeforces/domain/      # Codeforces HTTP helpers
    storage/domain/         # localStorage + persistent React state
    export/domain/          # excel / json downloads
    util/                   # pure helpers (sort, …)
    ui/common/              # OutlineButton, Row, …
    theme/
  assets/
```

Mirror nm-commercial’s rule: **views stay thin; domain owns behavior**.

| nm-commercial-api | this repo |
|---|---|
| `app*/views/` | `features/<name>/views/` + `app/` |
| `lib*/domain/` | `lib/<name>/domain/` |
| `lib*/models/` | `lib/models/` (+ domain-local types if needed) |
| `libutil` / shared UI | `lib/ui`, `lib/util`, `lib/theme` |
| `tests/test_<domain>.py` | `*.test.ts(x)` next to the domain module |

## Rules for adding a feature

1. **Pick the feature folder** under `features/`. Put React screens/controls in `views/`.
2. **Put logic in `lib/<domain>/domain/`** — filtering, API calls, parsing, persistence. Do not grow fat components.
3. **Shared types** go in `lib/models/`. Do not redefine Problem/TagNode in views.
4. **Codeforces HTTP** goes through `lib/codeforces/domain/` only. Do not scatter `axios` calls in views.
5. **Persistence** goes through `lib/storage/domain/` (`saveState` / `usePersistentState`). Use a clear key prefix per feature (`randomizer.`, `crossAnalysis.`, `contestBuilder.`).
6. **Shared buttons/text styles** go in `lib/ui/`. Feature-specific controls stay in that feature’s `views/`.
7. **Imports**: prefer paths that make the layer obvious (`../../../lib/...`). Do not invent deep cross-feature imports of private view internals — extract to `lib/` or `features/expression` instead.
8. **Tests**: colocate `*.test.ts(x)` with the domain module you change. Always cover new parsing/filter behavior.
9. **Entry**: keep `src/index.tsx` and `src/app/App.tsx` thin. Wire new tabs in `src/app/Home.tsx`.
10. **Do not** reintroduce `src/components/` or `src/services/` — those folders are retired.

## Commands

```bash
npm start
npm test -- --watchAll=false
npm run build
```

## PR hygiene

- One concern per PR when possible (structure, feature, fix).
- Do not commit `hint.md` (gitignored). Update `hint.example.md` when structure rules change.
