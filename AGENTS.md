# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` with Next.js App Router under `src/app/` (pages, API routes), UI in `src/components/`, utilities in `src/lib/`, types in `src/types/`.
- Database: Prisma schema in `prisma/` (PostgreSQL in production). Local DB is managed via Prisma.
- Static assets: `public/`. Scripts and ops notes: `scripts/`.

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js dev server with Turbopack.
- `npm run build`: Regenerate Prisma client and build the app.
- `npm start`: Run the production build locally.
- `npm run lint`: Lint with Next + TypeScript rules.
- DB setup (local): `npx prisma db push` then seed via `curl -X POST http://localhost:3000/api/seed`.
- Inspect DB: `npx prisma studio`.

## Coding Style & Naming Conventions
- TypeScript strict; prefer explicit types on public functions.
- Components: PascalCase files in `src/components/` (e.g., `SpotCard.tsx`).
- Routes and API: lowercase segment folders in `src/app/.../route.ts`.
- Vars/functions: camelCase; constants: UPPER_SNAKE_CASE.
- Use ESLint config (`next/core-web-vitals`, TS). Run `npm run lint` before PRs.

## Testing Guidelines
- No test runner is configured yet. If adding tests, prefer Vitest or Jest with `*.test.ts(x)` next to source or under `src/`.
- Aim for critical API and store coverage (`src/app/api/**`, `src/lib/stores/**`). Add minimal fixtures and avoid network calls.

## Commit & Pull Request Guidelines
- Commits: imperative mood, concise summary (e.g., "Fix Prisma build cache path"). Group related changes.
- PRs must include: purpose/summary, screenshots for UI, steps to reproduce/verify, linked issue, and notes on schema or env changes.
- If Prisma schema changes: include migration steps (`npx prisma db push`) and confirm seed impact.

## Security & Configuration Tips
- Configure env vars in `.env` (see `.env.example`). Do not commit secrets.
- Protect data-collection endpoint with `DATA_COLLECTION_SECRET` (Authorization: `Bearer <secret>`).
- External APIs (Google Maps, Gurunavi, Hotpepper) are optional; guard calls and handle missing keys gracefully.

