# Technologies

## Technology Principles
- The application must be deployable to GitHub Pages using static export only.
- Prefer solutions in the following order:
    1. Static-export-compatible Next.js features
    2. Browser-native APIs
    3. React APIs
    4. Third-party libraries
- Introduce third-party libraries only when they provide a clear benefit over existing solutions.

## Dependencies
- Prefer browser-native and Next.js functionality over external packages.
- Do not introduce a dependency for functionality that can be implemented cleanly with existing project code.
- Every new dependency should have a clear benefit that outweighs its maintenance cost.

## Scripts
Scripts are grouped by purpose using the `<category>:<action>` naming convention.

### Application (`app:`)
- `app:dev` — Starts the application in development mode using `tsx server.ts`. No production build artifacts are generated.
- `app:start` — Builds the application (`next build`) and starts the production server (`next start`). Intended only for production builds.
- `app:deploy` — Builds the static export and publishes the generated `out/` directory to GitHub Pages using `gh-pages`.

### Code Quality (`code:`)
- `code:lint` — Runs ESLint and automatically applies fixable issues.
- `code:format` — Runs Prettier and formats the project.
- `code:prepare` — Runs both `code:lint` and `code:format`. Intended to be executed before pushing changes.

### Dependencies (`depend:`)
- `depend:install` — Installs all project dependencies (`npm install`).
- `depend:clean` — Removes `node_modules` and `package-lock.json`, then performs a clean installation.
- `depend:audit` — Audits project dependencies for known vulnerabilities and general dependency health.

> [!NOTE]
> The `out/` directory contains the generated static export used for deployment to GitHub Pages. It is produced only during production builds and deployments (e.g. `app:start` and `app:deploy`), is ignored by Git, and must never be committed to source control.

## Linter and Formatter
- Use ESLint and Prettier for linting and formatting.
- Must have configuration files in the root of the project (`.eslintrc.json`, `.prettierrc.json`).
- Configurations should be easy to understand and modify.
- Configurations should enforce the import order rule (see Imports section).

## Project Structure
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
        layout.tsx        (optional)
        page.tsx
        error.tsx         (optional)
        not-found.tsx     (optional)
        loading.tsx       (optional)
        global.css        (optional)
    ...
  components/             # Reusable UI components
    <ComponentName>/
        <ComponentName>.tsx
        <ComponentName>.module.css
        index.ts
  utils/                  # Pure utility/helper functions (no API calls)
    <FeatureName>/
        <FeatureModule>.ts
        ...
  types/                  # TypeScript type and interface definitions
    <ModelName>.ts
    ...
  services/               # External API calls and data-fetching logic
    <ServiceModule>.ts
    ...
package.json
tsconfig.json
.eslintrc.json
.prettierrc.json
.gitignore
server.ts
LICENSE
README.md
conventions.md
```

## Architecture Principles
- Keep components small and focused (single responsibility).
- Prefer composition over inheritance.
- Avoid deep component nesting.
- Separate concerns:
  - Files:
    - UI → `.tsx`
    - Logic → `.ts`
    - Styles → `.module.css`
  - Directories:
    - Pages and layouts → `app/`
    - Shared UI → `components/`
    - Utilities → `utils/`
    - External APIs → `services/`
    - Shared types → `types/`
- Keep modules cohesive and minimize cross-directory dependencies.
- Keep shared components generic and free of feature-specific business logic.

## Static Export and Deployment Constraints
- Do not use middleware.
- Do not use Route Handlers.
- Do not rely on runtime servers.
- Do not depend on request-specific rendering.
- Pages must be prerenderable.

# Code Practices

## General Principles
- Prefer simple, maintainable solutions over clever implementations.
- Prioritize readability over brevity.
- Be consistent with existing project conventions.
- Minimize unnecessary abstraction.

## Components
- Should be modular, reusable, and focused on a single responsibility.
- Prefer composition over configuration.
- Components should receive data through props rather than importing application state directly whenever practical.
- Use functional components (`export default function ComponentName() {}`).
- Components should be imported through their local `index.ts` barrel.
- Barrel files (`index.ts`) should only re-export components and styles intended to be exposed.
- Components should have a co-located `.module.css` file when styling is required.
- Avoid inline styles except for runtime-computed values (e.g. CSS custom properties).
- Do not use Tailwind CSS.
- Do not use `styled-components`.
- Responsive design and cross-device compatibility are required.

## State Management
- Prefer local component state.
- Lift state only when required.
- Use Context sparingly.
- Avoid global state unless multiple unrelated parts of the application require shared mutable state.

## Data Fetching
- Prefer Server Components for build-time rendering. Avoid Server Components that depend on request-specific data or dynamic rendering.
- Client Components should fetch data only when runtime interaction requires it.
- Centralize API communication inside `services/`, keeping components focused on presentation rather than transport details.

## Imports
- Import order:
    1. Next.js, then React
    2. Third-party packages
    3. Internal imports (Types and CSS)
- Alphabetize imports within each group.
- Always use the `@/` path alias for internal imports.
- Avoid circular dependencies.
- Never use relative imports (outside of barrel files).
- Components must be imported from outside their directory only via their local `index.ts` barrel.
- Components should use default exports.
- Never import directly from `app/`. Shared UI belongs in `components/`.

## Testing
- Automated testing is optional for this project.
- Manual verification is the primary testing approach.

## Naming
- Directories: kebab-case
- Typescript Files: PascalCase
- CSS Files: kebab-case
- Functions: camelCase
- Components: PascalCase
- Interfaces: PascalCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE only for true constants
- CSS classes: camelCase
- Routes: kebab-case

## TypeScript Guidelines
- Always use TypeScript.
- Never use `any`; prefer `unknown` with proper narrowing.
- Prefer type inference for local variables.
- Explicitly type exported functions, public APIs, and complex return values.
- Use `interface` for object shapes.
- Use `type` for unions, intersections, and primitive aliases.
- Prefer `readonly` when mutation is not intended.
- Prefer immutable data structures where practical.
- Type `catch` errors as `unknown`.

## Error Handling
- Surface errors immediately during development.
- Handle expected errors gracefully.
- Avoid silently swallowing exceptions.
- Display user-friendly error states instead of crashing the UI.

## Performance
- Prefer static rendering whenever possible.
- Avoid unnecessary re-renders.
- When used, optimize images, assets, fonts and links for static delivery.
- Avoid premature optimization. Memoize only when there is measurable benefit.
- Keep bundle size small by avoiding unnecessary dependencies.

## Comments
- Code should be self-explanatory whenever possible.
- Use comments to explain *why*, not *what*.
- Remove obsolete comments when updating code.
