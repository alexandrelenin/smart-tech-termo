---
phase: 06-docker-deploy
plan: "03"
subsystem: infra
tags: [docker, docker-compose, nginx, postgres, smoke-test]

requires:
  - phase: 06-docker-deploy
    provides: "Dockerfiles (api e nginx), nginx.conf e docker-compose.yml criados nos planos 06-01 e 06-02"

provides:
  - "Ambiente Docker validado: api, nginx e postgres sobem corretamente"
  - "GET /api/health retorna 200 no container"
  - "Frontend acessível em http://localhost:8095"
  - "Migrations Prisma aplicadas automaticamente no startup do container"

affects: [deploy, producao]

tech-stack:
  added: []
  patterns:
    - "DATABASE_URL sobrescrita no docker-compose para usar hostname interno (postgres:5432) em vez do .env local (localhost:5433)"
    - "Prisma generate com DATABASE_URL dummy no build — banco real fornecido apenas em runtime"

key-files:
  created: []
  modified:
    - Dockerfile.api
    - docker-compose.yml

key-decisions:
  - "DATABASE_URL dummy no Dockerfile.api: prisma.config.ts exige a variável mesmo durante build; valor dummy é suficiente para prisma generate (não conecta ao banco)"
  - "Override DATABASE_URL no docker-compose.yml: .env mantém localhost:5433 para dev local; serviço api usa postgres:5432 (rede interna Docker)"

patterns-established:
  - "Override de variáveis de ambiente no docker-compose para adaptar .env de dev ao contexto Docker"

requirements-completed:
  - DEPL-01
  - DEPL-02

duration: 3min
completed: 2026-04-22
---

# Phase 06: Docker + Deploy — Plano 03 Summary

**Smoke test Docker validado: api (Hono + Prisma), postgres e nginx sobem corretamente com migrations aplicadas, health check 200 e frontend acessivel na porta 8095**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-22T20:41:08Z
- **Completed:** 2026-04-22T20:44:24Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Build das imagens Docker (api e nginx) concluido sem erros
- Migrations Prisma aplicadas automaticamente no startup do container api
- `GET http://localhost:3001/api/health` retorna 200
- `GET http://localhost:8095` retorna 200
- `docker compose down` finaliza sem erros

## Task Commits

1. **Task 1: Verificar pre-requisitos do .env** — sem commit (verificacao apenas)
2. **Task 2: Build das imagens Docker** — `005df1d` (fix: Dockerfile.api com DATABASE_URL dummy)
3. **Task 3: Subir servicos e smoke test** — `97fec95` (fix: docker-compose DATABASE_URL hostname interno)

**Plan metadata:** (docs commit a seguir)

## Files Created/Modified

- `Dockerfile.api` — adicionado DATABASE_URL dummy para prisma generate no build
- `docker-compose.yml` — adicionado override de DATABASE_URL para postgres:5432 no servico api

## Decisions Made

- `prisma.config.ts` usa `env('DATABASE_URL')` que falha sem valor durante `docker build`. Solucao: passar `DATABASE_URL="postgresql://x:x@localhost:5432/x"` inline no RUN do Dockerfile, suficiente para o generate (nao conecta ao banco).
- `.env` local aponta `localhost:5433` para dev local. Dentro do Docker a rede interna usa hostname `postgres:5432`. Solucao: `environment.DATABASE_URL` no servico api do docker-compose sobrescreve o valor do `.env`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] prisma generate falha no build por DATABASE_URL ausente**
- **Found during:** Task 2 (Build das imagens Docker)
- **Issue:** `prisma.config.ts` chama `env('DATABASE_URL')` no carregamento do modulo; sem a variavel, `npx prisma generate` aborta com `PrismaConfigEnvError`
- **Fix:** Adicionado `DATABASE_URL="postgresql://x:x@localhost:5432/x"` inline no step `RUN npx prisma generate` do Dockerfile.api
- **Files modified:** `Dockerfile.api`
- **Verification:** Build concluiu com exit code 0; imagens api e nginx criadas
- **Committed in:** `005df1d`

**2. [Rule 1 - Bug] Container api nao conecta ao banco — DATABASE_URL aponta para localhost**
- **Found during:** Task 3 (Subir servicos e smoke test)
- **Issue:** `.env` tem `DATABASE_URL=postgresql://termo:termo@localhost:5433/termo`; dentro do Docker o banco e acessivel via `postgres:5432`, nao `localhost:5433`
- **Fix:** Adicionado `environment.DATABASE_URL: postgresql://termo:termo@postgres:5432/termo` no servico api do docker-compose.yml
- **Files modified:** `docker-compose.yml`
- **Verification:** Container api subiu, migrations aplicadas, `GET /api/health` retornou 200
- **Committed in:** `97fec95`

---

**Total deviations:** 2 auto-fixed (2 bugs de configuracao Docker)
**Impact on plan:** Ambas as correcoes necessarias para o smoke test funcionar. Sem escopo adicional.

## Issues Encountered

- Aviso `[Better Auth]: Social provider google is missing clientId or clientSecret` nos logs da api — esperado, Google OAuth e opcional para o smoke test basico (conforme plano).

## User Setup Required

Para usar Google OAuth em producao, adicionar ao `.env`:
```
GOOGLE_CLIENT_ID=<mesmo dos outros apps Smart Tech>
GOOGLE_CLIENT_SECRET=<mesmo dos outros apps Smart Tech>
```

## Next Phase Readiness

- Fase 6 completa: app containerizada e acessivel na porta 8095
- Ambiente pronto para deploy em producao
- Para producao: configurar GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env do servidor

---
*Phase: 06-docker-deploy*
*Completed: 2026-04-22*
