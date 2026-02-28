# CLAUDE.md — GymTrack Project Rules

## Project Overview

GymTrack — gym tracking web application (Next.js frontend + NestJS backend, 2 separate repos).
Two fullstack developers work in vertical slices. Each developer owns their feature end-to-end (API + UI).

---

## Architecture Rules

### Repository Structure

- **gymtrack-api**: NestJS + Prisma + Supabase (backend)
- **gymtrack-web**: Next.js 14 App Router + FSD + shadcn/ui (frontend)
- Types are auto-generated from Swagger via `orval` — never write API types manually

### Backend (gymtrack-api)

- **Framework**: NestJS with domain modules (`src/modules/<feature>/`)
- **Database**: Prisma ORM + Supabase (PostgreSQL)
- **Auth**: JWT (15min access + 7d refresh tokens), Passport strategies
- **Validation**: Zod schemas via `ZodValidationPipe`
- **Response shape**: All responses wrapped via `ResponseTransformInterceptor` → `{ data, meta }`

### Frontend (gymtrack-web)

- **Framework**: Next.js 14 with App Router
- **Architecture**: Feature-Sliced Design (FSD) — strict layer imports:
  ```
  app → pages → widgets → features → entities → shared
  ```
  A layer can only import from layers BELOW it. Never import UP.
- **State**: Zustand for client state, React Query (TanStack Query) for server state
- **Styling**: Tailwind CSS + shadcn/ui components (in `shared/ui/`)
- **Forms**: React Hook Form + Zod validation

---

## Code Standards

### TypeScript

- Strict mode enabled — no `any` types unless absolutely necessary and commented why
- Use `interface` for object shapes, `type` for unions/intersections
- All functions must have explicit return types (except React components and hooks)
- Use `unknown` instead of `any` for uncertain types, then narrow with type guards
- Prefer `const` over `let`, never use `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`) — no manual null checks

### Naming Conventions

- **Files**: kebab-case (`workout-logger.tsx`, `create-workout.dto.ts`)
- **Components**: PascalCase (`WorkoutLogger`, `SetRow`)
- **Functions/variables**: camelCase (`getWorkouts`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SETS_PER_EXERCISE`, `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`WorkoutSet`, `ExerciseFilter`)
- **Enums**: PascalCase name, UPPER_SNAKE_CASE values (`enum MuscleGroup { CHEST, BACK }`)
- **Database tables**: snake_case (Prisma `@@map`)
- **API endpoints**: kebab-case (`/user-exercises`, `/workout-templates`)
- **Boolean variables**: prefix with `is`, `has`, `can`, `should` (`isLoading`, `hasAccess`)

### Backend Specific

- Every controller method must have Swagger decorators (`@ApiOperation`, `@ApiResponse`, `@ApiParam`)
- Every DTO must use Zod schemas for validation
- Use `@CurrentUser()` decorator to get authenticated user — never access `req.user` directly
- All database queries via Prisma — no raw SQL unless justified in comment
- Service methods should be small and focused — extract to sub-services if >50 lines
- Always use transactions for multi-table writes (`prisma.$transaction()`)
- Error handling: throw NestJS `HttpException` subclasses, not generic `Error`
- Pagination: always cursor-based (not offset) for lists
- Sensitive data (passwords, tokens): never log, never return in responses

### Frontend Specific

- Components must be functional — no class components
- Use `'use client'` directive only when needed (state, effects, browser APIs)
- Server Components by default — push `'use client'` as deep as possible
- Max component file length: 200 lines — extract sub-components if longer
- Every page must have loading skeleton (`loading.tsx`) and error boundary (`error.tsx`)
- Images: always use `next/image` with explicit `width`/`height` or `fill`
- No inline styles — use Tailwind classes only
- Prefer `cn()` utility for conditional class merging (from `shared/lib/cn.ts`)
- Use React Query for all API calls — no `useEffect` + `fetch` patterns
- Mutations must use optimistic updates where appropriate (workout sets, likes)
- All user-facing text must be translatable (prepare for i18n — no hardcoded strings in JSX)

### FSD Layer Rules

- **`shared/`**: No business logic. Only: UI primitives (shadcn), utils, hooks, api-client, config
- **`entities/`**: Business objects. GET queries, types, display components. No mutations
- **`features/`**: User actions. Mutations (POST/PATCH/DELETE), action buttons/forms
- **`widgets/`**: Composite UI blocks. Can have own state (Zustand store in `model/`). Compose entities + features
- **`pages/`**: Page-level composition of widgets. Minimal logic
- **`app/`**: Next.js routing only. Import page components from `pages/` layer
- Every slice must have `index.ts` barrel export — import only through public API

---

## Git & PR Rules

### Branch Naming

```
feat/<slice-name>       — new feature (feat/workout-logger)
fix/<description>       — bug fix (fix/rest-timer-overflow)
refactor/<scope>        — refactoring (refactor/exercise-entity)
chore/<scope>           — tooling, deps (chore/update-prisma)
```

### Commit Messages (Conventional Commits)

```
feat(workout): add set logging with optimistic UI
fix(auth): handle expired refresh token edge case
refactor(exercises): extract filter logic to custom hook
chore(deps): bump prisma to 6.x
test(programs): add e2e for quick-build flow
docs(api): add swagger decorators to calendar module
```

- Scope in parentheses must match module/feature name
- Description must be lowercase, imperative mood, <72 chars
- Body (optional): explain WHY, not WHAT

### Pull Request Rules

- PR title follows same Conventional Commits format
- Every PR must have description with: **What** (summary), **Why** (context), **How** (approach)
- PR must pass all CI checks before review
- No PRs >500 lines changed (split into smaller PRs)
- Self-review checklist before requesting review:
  - [ ] No `console.log` left (use proper logger on backend)
  - [ ] No commented-out code
  - [ ] No `TODO` without linked issue
  - [ ] New API endpoints have Swagger decorators
  - [ ] New UI components have loading/error states
  - [ ] No hardcoded values (use constants/env)

---

## Security Rules

- Never commit secrets, API keys, or tokens — use `.env` and GitHub Secrets
- All user input must be validated (Zod on both frontend and backend)
- No `dangerouslySetInnerHTML` without sanitization
- No `eval()`, `Function()` constructor, or dynamic `import()` with user input
- SQL injection: Prisma parameterizes by default — never use `$queryRawUnsafe` with user input
- XSS: React escapes by default — don't bypass it
- CORS: explicitly whitelist allowed origins
- File uploads: validate MIME type, limit size (5MB avatar, 10MB photos)
- Rate limiting on all public endpoints
- RLS policies in Supabase must be tested

---

## Performance Rules

- No N+1 queries — use Prisma `include` / `select` to fetch related data in one query
- Paginate all list endpoints — never return unbounded arrays
- Frontend: lazy load heavy components (`dynamic()` from Next.js)
- Images: always optimize, use WebP, set proper cache headers
- Bundle: monitor with `@next/bundle-analyzer` — no single chunk >200KB
- API responses: return only necessary fields (use Prisma `select`, not full objects)
- Indexes: every foreign key and frequently filtered column must have a DB index

---

## Testing Rules

- Backend: unit tests for services (`*.spec.ts`), e2e for critical flows
- Frontend: e2e with Playwright for user journeys
- Test file colocation: `__tests__/` next to the code it tests
- Test naming: `describe('WorkoutService')` → `it('should detect PR when weight exceeds record')`
- No mocking of Prisma in unit tests — use test database with seeds
- Minimum: every API endpoint must have at least one happy-path test

---

## Review Focus Areas

When reviewing code, prioritize checking:

1. **Security**: Input validation, auth guards, data exposure
2. **FSD violations**: Wrong layer imports, business logic in wrong layer
3. **Type safety**: No `any`, proper nullability, exhaustive switches
4. **Performance**: N+1 queries, missing pagination, unbounded data
5. **Error handling**: Missing try/catch, generic error messages, no user feedback
6. **Naming**: Unclear variable/function names, inconsistent conventions
7. **Dead code**: Unused imports, unreachable branches, commented-out code
8. **Hardcoded values**: Magic numbers, strings that should be constants/env
9. **Missing Swagger**: New endpoints without `@Api*` decorators
10. **Missing loading/error states**: New pages without skeletons or boundaries
