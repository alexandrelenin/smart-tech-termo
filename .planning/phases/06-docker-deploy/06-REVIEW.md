---
phase: 06-docker-deploy
reviewed: 2026-04-22T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - Dockerfile.api
  - docker-compose.yml
  - Dockerfile.nginx
  - nginx.conf
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-22
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Review covers the four Docker/deployment files introduced in phase 06. The configuration is functionally sound for local development but has one critical security issue (GEMINI_API_KEY leaked into the frontend bundle via `vite.config.ts` `define` block), three warnings around production-readiness (missing healthcheck, `npm install` in API image, `depends_on` without condition), and two info-level items. The nginx reverse proxy and multi-stage frontend build are correctly structured.

---

## Critical Issues

### CR-01: GEMINI_API_KEY baked into frontend bundle at build time

**File:** `Dockerfile.nginx:9`
**Issue:** `Dockerfile.nginx` runs `npm run build` which invokes Vite. `vite.config.ts` contains:
```ts
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```
This substitutes the literal key value into the compiled JS bundle at build time. Anyone who downloads the app JS can extract the key. This contradicts the explicit architectural decision in CLAUDE.md: "Gemini API mantida — mover do frontend para o backend (não expor API key no cliente)." The backend proxy in `server/routes/gemini.ts` exists precisely to prevent this, but `vite.config.ts` still embeds the key.

**Fix:** Remove the `define` block for `GEMINI_API_KEY` from `vite.config.ts` so the key is never passed to the build context:
```ts
// vite.config.ts — remove these two lines from define:
// 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
// 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
```
Also ensure `Dockerfile.nginx` does not receive `GEMINI_API_KEY` as a build arg. The Vite build context should have no access to that variable.

---

## Warnings

### WR-01: `npm install` installs devDependencies into the API image

**File:** `Dockerfile.api:6`
**Issue:** `RUN npm install` installs all dependencies including devDependencies (e.g., `tsx`, Vite, Vitest). In production the image should only contain runtime dependencies, reducing attack surface and image size.

**Fix:**
```dockerfile
RUN npm install --omit=dev
```
If `tsx` is needed at runtime to execute `server/index.ts`, either keep it or (better) compile TypeScript with `tsc` and run plain `node dist/server/index.js` in CMD to avoid shipping a TS compiler in production.

### WR-02: `depends_on` does not wait for Postgres to be ready to accept connections

**File:** `docker-compose.yml:21`
**Issue:** `depends_on: [postgres]` only waits for the Postgres *container* to start, not for the Postgres *server* inside it to be ready to accept connections. The `api` container's `CMD` runs `npx prisma migrate deploy` immediately, which will fail with a connection error if Postgres hasn't finished initializing (common on first boot when initdb runs).

**Fix:** Add a healthcheck to the `postgres` service and use `condition: service_healthy` on the `api` dependency:
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: termo
    POSTGRES_PASSWORD: termo
    POSTGRES_DB: termo
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U termo -d termo"]
    interval: 5s
    timeout: 5s
    retries: 10
  volumes:
    - ~/data/smart-tech-termo/postgres:/var/lib/postgresql/data
  networks: [internal]

api:
  ...
  depends_on:
    postgres:
      condition: service_healthy
```

### WR-03: `migrate deploy` runs in the same process as the server with no retry

**File:** `Dockerfile.api:18`
**Issue:** `CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx server/index.ts"]` means if the migration fails (e.g., transient DB connection error), the entire container exits. With no restart policy in `docker-compose.yml`, the `api` service stays down permanently after a single failure on first boot.

**Fix:** Add a restart policy to the `api` service so Docker restarts it on failure, giving Postgres time to become ready (or apply the healthcheck fix from WR-02 which is the cleaner solution):
```yaml
api:
  ...
  restart: on-failure
```

---

## Info

### IN-01: Postgres port 5433 exposed to host in docker-compose

**File:** `docker-compose.yml:11`
**Issue:** `ports: - "5433:5432"` exposes the database port on the host. This is convenient for local development (`psql -p 5433 ...`) but should be removed or commented out before deploying to production to prevent direct database access from outside Docker.

**Fix:** Remove or gate behind a comment for production use:
```yaml
# ports:
#   - "5433:5432"  # dev only — remove in production
```

### IN-02: API port 3001 exposed to host in docker-compose

**File:** `docker-compose.yml:22`
**Issue:** `ports: - "3001:3001"` exposes the backend API directly on the host, bypassing nginx entirely. In production all traffic should route through nginx on port 8095. Exposing 3001 allows unauthenticated direct access that skips any nginx-level controls.

**Fix:** Remove the port mapping from `api` in production; keep it only for local dev if needed:
```yaml
# ports:
#   - "3001:3001"  # dev only
```
Traffic from nginx to api stays on the internal Docker network via `proxy_pass http://api:3001/api/`.

---

_Reviewed: 2026-04-22_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
