# Technologies

## Priority
1. Works on Github Pages
2. NextJS
3. React (Only if there is no NextJS alternative)

## TypeScript Guidelines
- Always use TypeScript.
- Never allow `any`.
- Always end statements with semicolon.
- Prefer type inference.
- Prefer to use interfaces over types when possible.

## Scripts
- `app:`
    - `app:start` — builds the app (`next build`) and starts it in production (`next start`). Only use this for production.
    - `app:dev` — runs the app in development mode buildlessly via `tsx server.ts`. No output is written to disk.
    - `app:deploy` — builds the app via `next build --output-path out/` and publishes the `out/` directory to GitHub Pages via `gh-pages`.
- `code:`
    - `code:lint` — runs ESLint and applies auto-fixes.
    - `code:format` — runs Prettier and applies formatting.
    - `code:prepare` — runs both `code:lint` and `code:format` before a push.
- `deps:`
    - `deps:install` — installs all dependencies (`npm install`).
    - `deps:clean` — removes `node_modules` and `package-lock.json`, then re-installs.
    - `deps:audit` — checks the health and security of all dependencies.

> [!NOTE]
> The `out/` directory is the static export target and is listed in `.gitignore`. It is only produced by `npm run build` (i.e. `app:start` or `app:deploy`). It is never committed to source control.

## Linter and Formatter
- Use ESLint and Prettier for linting and formatting.
- Must have configuration files in the root of the project (`.eslintrc.json`, `.prettierrc.json`).
- Configurations should be easy to understand and modify.
- Configurations should enforce the import order rule (see Imports section).

# Architecture

## File Structure

```
.git/
.next/
node_modules/
src/
  app/                    # App Router pages and layouts
    layout.tsx
    page.tsx
    error.tsx             (optional)
    not-found.tsx         (optional)
    loading.tsx           (optional)
    global.css            (optional)
    <RouteName>/
        layout.tsx
        page.tsx
        error.tsx         (optional)
        not-found.tsx     (optional)
        loading.tsx       (optional)
        global.css        (optional)
    ...
  components/             # Reusable UI components
    <ComponentName>.tsx         # Component logic and markup
    <ComponentName>.module.css  # Component-scoped styles (CSS Modules)
  utils/                  # Pure utility/helper functions (no API calls)
    <FeatureName>/
        <FeatureModule>.ts
        ...
  types/                  # TypeScript type and interface definitions
    <ModelName>.ts
    ...
  services/               # Codeforces API calls and data-fetching logic
    <ServiceModule>.ts
    ...
package.json
tsconfig.json
.eslintrc.json
.prettierrc.json
.gitignore
server.ts
LICENSE
conventions.md
README.md
```

## Principles
- Keep components small and focused (single responsibility).
- Prefer composition over inheritance.
- Avoid deep component nesting.
- Use TypeScript for type safety.
- Separate concerns (UI → `.tsx`, styles → `.module.css`, logic → `utils/` or `services/`).

# Code Practices

## Components
- Should be modular and reusable.
- Should follow the single responsibility principle.
- Should be functional components using `export default function <ComponentName>()` syntax.
- Must have a co-located `<ComponentName>.module.css` file for all styles.
- Never use inline styles or `styled-components`.
- React is only permitted when there is no NextJS-native alternative (e.g. `react-range` for the dual-thumb slider).

## Styles
- All styles live in a `<ComponentName>.module.css` file placed next to the component.
- Import the CSS Module at the top of the component file: `import styles from './<ComponentName>.module.css';`.
- Apply classes via `className={styles.className}`.
- For dynamic class combinations use template literals or a utility like `clsx` if needed.
- Do not use Tailwind CSS.
- Do not use `styled-components`.
- Do not use inline `style={{...}}` props for anything other than truly runtime-dynamic values (e.g. CSS custom properties).

## Imports
- Always organize imports in the following order:
    1. NextJS imports (`next/...`)
    2. React imports (`react`, `react/...`)
    3. Third-party imports (e.g. `axios`, `react-range`)
    4. Local imports (`@/...`)
- Always use the NextJS `@/` path alias (not relative `../../` paths).
- Example:
  ```ts
  import Image from 'next/image';
  import Link from 'next/link';

  import { useState, useRef } from 'react';

  import { Range } from 'react-range';

  import { getProblemUrl } from '@/services/problemLink';
  import styles from './ProblemCard.module.css';
  ```

## TypeScript
- Never use `any` — prefer `unknown` with type narrowing.
- Always type function parameters and return values explicitly when inference is insufficient.
- Use `interface` for object shapes; use `type` only for unions, intersections, or aliasing primitives.
- `catch` blocks must type the error as `unknown` and narrow before use.
