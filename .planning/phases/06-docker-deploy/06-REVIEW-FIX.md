---
phase: 06-docker-deploy
fixed_at: 2026-04-22T00:00:00Z
findings_in_scope: 4
fixed: 4
skipped: 0
iteration: 1
status: all_fixed
---

# Phase 6: Code Review Fix Report

**Fixed:** 2026-04-22
**Scope:** critical + warning
**Status:** all_fixed

## Fixes Applied

### CR-01: GEMINI_API_KEY baked into frontend bundle — FIXED

**File:** `vite.config.ts`

Removed the `define` block that substituted `GEMINI_API_KEY` into the compiled Vite bundle:

```ts
// Removed:
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
},
```

The `loadEnv` call is retained (needed by Vite internally) but no env vars are injected into the client bundle. The backend proxy at `/api/gemini/*` is the sole path to Gemini.

Also moved `tsx` from `devDependencies` to `dependencies` in `package.json` so `npm install --omit=dev` (WR-01 fix) does not break the server CMD.

### WR-01: `npm install` installing devDeps into API image — FIXED

**File:** `Dockerfile.api`

Changed `RUN npm install` to `RUN npm install --omit=dev`. `tsx` was moved to `dependencies` (see CR-01 note above) to ensure the server CMD still works.

### WR-02: `depends_on` not waiting for Postgres readiness — FIXED

**File:** `docker-compose.yml`

Added `healthcheck` to the `postgres` service and updated `api.depends_on` to use `condition: service_healthy`:

```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U termo -d termo"]
    interval: 5s
    timeout: 5s
    retries: 10

api:
  depends_on:
    postgres:
      condition: service_healthy
```

### WR-03: No restart policy on API service — FIXED

**File:** `docker-compose.yml`

Added `restart: on-failure` to the `api` service so Docker restarts it if `prisma migrate deploy` fails on first boot due to transient connectivity issues.

---

## Skipped (Info — out of scope)

- **IN-01**: Postgres port 5433 exposed to host — intentionally left for dev convenience
- **IN-02**: API port 3001 exposed to host — intentionally left for dev convenience

---

_Fixed: 2026-04-22_
_Fixer: Claude (gsd-code-fixer)_
