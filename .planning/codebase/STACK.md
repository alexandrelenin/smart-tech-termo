# Technology Stack
_Generated: 2026-04-22_

## Summary

Frontend-only React 19 application bundled with Vite 6. TypeScript is used throughout with strict ES2022 target. There is no backend or test framework — the lint script runs only `tsc --noEmit`. The planned migration (per CLAUDE.md) will introduce a Hono + Node.js backend with Prisma and Better Auth.

## Languages

**Primary:**
- TypeScript ~5.8.2 — all source files (`App.tsx`, `types.ts`, `services/gemini.ts`, components)

**Markup/Style:**
- HTML — `index.html` entry point
- Tailwind (inline classes via React) — no separate CSS framework config detected; styles are applied via className strings in JSX

## Runtime

**Environment:**
- Node.js v22.22.0 (system runtime, used for build tooling only — no server yet)

**Package Manager:**
- npm 11.10.0
- Lockfile: not detected in root (not checked in or not generated)

## Frameworks

**Core:**
- React 19.2.3 (`react`, `react-dom`) — UI framework
- `react-jsx` transform used (no explicit React import needed in JSX files)

**Build/Dev:**
- Vite 6.2.0 — dev server (port 3000, host 0.0.0.0) and production bundler
- `@vitejs/plugin-react` 5.0.0 — React Fast Refresh and JSX transform

**Testing:**
- None — no test framework installed or configured

## Key Dependencies

**Production:**
- `@google/genai` ^1.34.0 — Gemini AI SDK; used in `services/gemini.ts` for text improvement (`improveDescription`) and conclusion generation (`generateSummary`). Model: `gemini-3-flash-preview`
- `@heroicons/react` ^2.2.0 — SVG icon set used in UI components

**Dev:**
- `typescript` ~5.8.2 — type checking only (`noEmit: true`); transpilation is handled by Vite/esbuild
- `@types/node` ^22.14.0 — Node type definitions (needed for `path` module in `vite.config.ts`)

## TypeScript Configuration

File: `tsconfig.json`

- `target`: ES2022
- `module`: ESNext, `moduleResolution`: bundler
- `jsx`: react-jsx
- `allowJs`: true
- `isolatedModules`: true
- `noEmit`: true (tsc is type-check only)
- Path alias: `@/*` → `./*` (project root)
- `experimentalDecorators`: true, `useDefineForClassFields`: false

## Build Configuration

File: `vite.config.ts`

- Dev server: port 3000, host 0.0.0.0
- `define` block injects `GEMINI_API_KEY` from `.env` as `process.env.API_KEY` and `process.env.GEMINI_API_KEY` at build time — **API key is currently bundled into the client build**
- Path alias `@` → project root (mirrors tsconfig)

## Scripts

```bash
npm run dev       # vite dev server
npm run build     # vite build (production)
npm run preview   # vite preview
npm run lint      # tsc --noEmit (type check only, no ESLint)
```

## Persistence

- **localStorage** — key `smart_tech_reports_db` — all term data stored client-side
- No database, no backend, no ORM

## Planned Stack Additions (per CLAUDE.md — not yet implemented)

| Addition | Package |
|---|---|
| Backend framework | `hono` + `@hono/node-server` |
| Auth | `better-auth` |
| ORM | `prisma` + `@prisma/client` + `@prisma/adapter-pg` |
| DB driver | `pg` (PostgreSQL) |
| Server runner | `tsx` (watch mode) |
| Database | PostgreSQL 15 (Docker) |

## Gaps / Unknowns

- No ESLint or Prettier config — only `tsc --noEmit` is used for linting
- No lockfile detected (possible `package-lock.json` present but not observed)
- No `.nvmrc` or `.node-version` pinning Node version
- No test framework whatsoever
- TypeScript `strict` mode not explicitly enabled in tsconfig (no `"strict": true`)
