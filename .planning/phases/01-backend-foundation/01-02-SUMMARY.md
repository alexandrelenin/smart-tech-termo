---
phase: 01-backend-foundation
plan: "02"
subsystem: server-core
tags: [hono, prisma, postgresql, server, schema]
dependency_graph:
  requires: [server-deps, env-config]
  provides: [hono-server, prisma-client, term-schema]
  affects: [server/routes/terms.ts, server/routes/gemini.ts, server/auth.ts]
tech_stack:
  added:
    - prisma.config.ts (Prisma 7 configuration)
    - PrismaPg driver adapter pattern
  patterns:
    - PrismaClient singleton via globalThis
    - Prisma 7 config-based datasource (prisma.config.ts)
    - Hono serve() with fetch adapter
key_files:
  created:
    - server/prisma.ts
    - server/index.ts
    - prisma/schema.prisma
    - prisma.config.ts
decisions:
  - "Prisma 7 remove o campo url do datasource em schema.prisma — movido para prisma.config.ts com defineConfig/env()"
  - "PrismaClient em Prisma 7 requer driver adapter explícito (PrismaPg) — não aceita mais conexão implícita via env"
  - "prisma.config.ts criado na raiz com dotenv/config para carregar DATABASE_URL em comandos CLI"
metrics:
  duration: "~5 minutos"
  completed: "2026-04-22"
  tasks_completed: 2
  files_changed: 4
---

# Phase 1 Plan 02: Servidor Hono, PrismaClient e Schema Term Summary

Entry point Hono na porta 3001 com GET /api/health, singleton PrismaClient com adapter PrismaPg, e schema Prisma com model Term espelhando todos os campos de ReportData.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar server/prisma.ts e prisma/schema.prisma | a0cd574 | server/prisma.ts, prisma/schema.prisma |
| 1-fix | Adaptar para Prisma 7 (desvio Rule 1) | e3dbd00 | prisma/schema.prisma, server/prisma.ts, prisma.config.ts |
| 2 | Criar server/index.ts com Hono e /api/health | e3e491e | server/index.ts |

## What Was Built

### server/prisma.ts

Singleton PrismaClient com padrão `globalThis` para evitar múltiplas conexões em desenvolvimento. Usa `PrismaPg` adapter (requisito do Prisma 7).

### prisma/schema.prisma

Model `Term` com todos os campos de `ReportData`:

| Campo | Tipo | Observação |
|-------|------|------------|
| id | String @id | PK |
| ownerId | String | referência ao user do Better Auth |
| reportNumber | String | |
| processRef | String? | opcional |
| pregaoRef | String? | opcional |
| contractRef | String? | opcional |
| date | String | |
| contratante | Json | Entity serializada |
| contratada | Json | Entity serializada |
| softwareDescription | String | |
| items | Json | LicenseItem[] serializado |
| techResponsible | Json | { name, rg } |
| installation | Json | { environment, restrictedTo, accessLink } |
| credentials | Json | { username, password, city } |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### prisma.config.ts

Arquivo de configuração Prisma 7 na raiz. Usa `defineConfig` + `env('DATABASE_URL')`. Requerido porque o Prisma 7 removeu o campo `url` do datasource em `schema.prisma`.

### server/index.ts

Entry point Hono:
- `import 'dotenv/config'` na primeira linha
- GET `/api/health` retorna `{ status: 'ok', timestamp: ISO string }`
- Porta 3001 (via `process.env.PORT ?? 3001`)
- `serve({ fetch: app.fetch, port: PORT })`
- Nenhum segredo hardcodado

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prisma 7 quebra compatibilidade com url no datasource**
- **Found during:** Task 1 — `npx prisma validate` falhou com erro P1012
- **Issue:** Prisma 7.8.0 removeu suporte ao campo `url` no datasource de `schema.prisma`. O plano foi escrito com sintaxe Prisma 6.
- **Fix:**
  1. Removido `url = env("DATABASE_URL")` do datasource em `schema.prisma`
  2. Criado `prisma.config.ts` na raiz com `defineConfig({ datasource: { url: env('DATABASE_URL') } })`
  3. Atualizado `server/prisma.ts` para usar `PrismaPg` adapter explícito (Prisma 7 também requer adapter explícito para PostgreSQL)
- **Files modified:** `prisma/schema.prisma`, `server/prisma.ts`, `prisma.config.ts` (novo)
- **Commit:** e3dbd00

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|-----------|
| T-01-05 | DATABASE_URL em prisma.config.ts via env() — nunca hardcodada no schema |
| T-01-06 | GET /api/health retorna apenas { status, timestamp } — sem informações internas |
| T-01-07 | console.log imprime apenas URL do servidor — sem segredos |
| T-01-08 | Singleton PrismaClient evita múltiplas conexões em dev |

## Known Stubs

None — este plano cria infraestrutura de servidor, não lógica de negócio.

## Threat Flags

None — nenhuma nova superfície de rede além do healthcheck planejado.

## Self-Check: PASSED

- server/index.ts: FOUND
- server/prisma.ts: FOUND
- prisma/schema.prisma: FOUND
- prisma.config.ts: FOUND
- Commit a0cd574: FOUND (feat: criar server/prisma.ts e prisma/schema.prisma)
- Commit e3dbd00: FOUND (fix: adaptar para Prisma 7)
- Commit e3e491e: FOUND (feat: criar server/index.ts)
- npx prisma validate: PASSED (com DATABASE_URL placeholder)
- tsc --noEmit server/index.ts: PASSED (sem erros)
- Nenhum segredo hardcodado em server/index.ts: CONFIRMED
