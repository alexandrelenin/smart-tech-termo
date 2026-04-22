---
phase: 01-backend-foundation
plan: "01"
subsystem: dependencies
tags: [setup, dependencies, environment, security]
dependency_graph:
  requires: []
  provides: [server-deps, env-config]
  affects: [server/index.ts, server/auth.ts, server/prisma.ts]
tech_stack:
  added:
    - hono@4.12.14
    - "@hono/node-server@2.0.0"
    - better-auth@1.6.7
    - "@prisma/client@7.8.0"
    - "@prisma/adapter-pg@7.8.0"
    - prisma@7.8.0
    - dotenv@17.4.2
    - tsx@4.21.0 (devDependency)
  patterns:
    - script dev:server via tsx watch
key_files:
  modified:
    - package.json
    - .gitignore
decisions:
  - "Usar tsx watch para hot-reload do servidor em desenvolvimento (equivalente ao padrão dos outros apps Smart Tech)"
  - ".env não commitado — .gitignore protege todos os padrões: .env, .env.local, .env.*.local"
metrics:
  duration: "~2 minutos"
  completed: "2026-04-22"
  tasks_completed: 2
  files_changed: 2
---

# Phase 1 Plan 01: Dependências do Servidor e Ambiente Summary

Instalação de todos os pacotes Node.js do servidor (Hono + Better Auth + Prisma + dotenv + tsx) e configuração do ambiente local com .env e .gitignore atualizado.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Instalar dependências do servidor e atualizar scripts | e2ebdf6 | package.json, package-lock.json |
| 2 | Criar .env e proteger com .gitignore | f71017b | .gitignore |

## What Was Built

### Packages Installed

| Package | Version | Role |
|---------|---------|------|
| hono | ^4.12.14 | Framework HTTP do servidor |
| @hono/node-server | ^2.0.0 | Adapter Node.js para Hono |
| better-auth | ^1.6.7 | Autenticação (Google OAuth + email/senha) |
| @prisma/client | ^7.8.0 | ORM — cliente gerado |
| @prisma/adapter-pg | ^7.8.0 | Adapter PostgreSQL para Prisma |
| prisma | ^7.8.0 | CLI Prisma para migrações |
| dotenv | ^17.4.2 | Carrega variáveis de ambiente do .env |
| tsx | ^4.21.0 (dev) | Executa TypeScript em Node.js sem compilar |

### Script Added to package.json

```
"dev:server": "tsx watch server/index.ts"
```

### Environment Variables Configured (.env)

- `DATABASE_URL` — connection string PostgreSQL local
- `BETTER_AUTH_URL` — URL base do servidor de auth
- `BETTER_AUTH_SECRET` — segredo de sessão (placeholder para substituir com openssl rand -base64 32)
- `GOOGLE_CLIENT_ID` — vazio (preencher com credenciais dos outros apps Smart Tech)
- `GOOGLE_CLIENT_SECRET` — vazio (preencher com credenciais dos outros apps Smart Tech)
- `GEMINI_API_KEY` — vazio (preencher com chave existente)

### .gitignore Protection

Adicionadas regras `.env`, `.env.local`, `.env.*.local` — git status confirma que .env não é rastreado.

## Deviations from Plan

None - plan executed exactly as written.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|-----------|
| T-01-01 | .gitignore inclui .env — verificado com git status |
| T-01-02 | Placeholder no BETTER_AUTH_SECRET instrui substituição via openssl |
| T-01-03 | GEMINI_API_KEY vazio no .env — será preenchido pelo desenvolvedor, nunca exposto no cliente |

## Known Stubs

None — este plano configura infraestrutura, não lógica de aplicação.

## Threat Flags

None — nenhuma nova superfície de rede ou autenticação introduzida neste plano.

## Self-Check: PASSED

- package.json modified: FOUND (commit e2ebdf6)
- .gitignore modified: FOUND (commit f71017b)
- node_modules/hono: EXISTS
- .env created: EXISTS (not tracked by git)
- `node -e "require('hono')"`: OK
- `node -e "require('@hono/node-server')"`: OK
- `npx prisma --version`: 7.8.0
- `git status`: clean working tree
