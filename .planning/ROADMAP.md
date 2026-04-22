# Roadmap: smart-tech-termo

## Overview

Migração do app de frontend-only (localStorage) para uma aplicação full-stack com backend Hono, autenticação Better Auth, persistência PostgreSQL e deploy Docker. O trabalho segue a sequência natural: infraestrutura de servidor → autenticação → API de dados → proxy IA → migração do frontend → containerização.

## Milestones

- 🚧 **v1.0 Backend + Auth + Persistência** — Fases 1-6 (em andamento)

## Phases

### 🚧 v1.0 Backend + Auth + Persistência (Em andamento)

**Milestone Goal:** Transformar o app frontend-only em uma aplicação full-stack segura, com persistência por usuário autenticado e deploy via Docker.

#### Fase 1: Backend Foundation

**Goal**: Servidor Hono rodando com Prisma conectado ao PostgreSQL
**Depends on**: Nada (primeira fase)
**Requirements**: BACK-01
**Success Criteria** (o que deve ser VERDADE):
  1. `npx tsx watch server/index.ts` inicia sem erros
  2. `GET /api/health` retorna 200
  3. `npx prisma migrate dev` aplica o schema sem erros
  4. PrismaClient conecta ao banco PostgreSQL local

**Plans:** 3 planos

Plans:
- [ ] 01-01-PLAN.md — Instalar dependências do servidor, criar .env e .gitignore
- [ ] 01-02-PLAN.md — Criar server/index.ts, server/prisma.ts e prisma/schema.prisma
- [ ] 01-03-PLAN.md — [BLOCKING] Rodar migrate dev e verificar healthcheck do servidor

#### Fase 2: Autenticação Better Auth

**Goal**: Login com email/senha e Google OAuth funcionando, sessão persistente
**Depends on**: Fase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (o que deve ser VERDADE):
  1. `POST /api/auth/sign-up/email` cria usuário no banco
  2. `POST /api/auth/sign-in/email` retorna sessão válida
  3. Login com Google OAuth redireciona e cria sessão
  4. Sessão persiste após refresh do browser
  5. `GET /api/auth/session` retorna dados do usuário autenticado

Plans:
- [ ] 02-01: Instalar `better-auth` e criar `server/auth.ts` com email+Google configurados
- [ ] 02-02: Registrar rotas de auth no Hono (`/api/auth/*`) e testar endpoints
- [ ] 02-03: Criar `src/lib/auth-client.ts` e `src/components/AuthGuard.tsx` no frontend

#### Fase 3: API de Termos (CRUD)

**Goal**: CRUD completo de termos filtrado por usuário autenticado
**Depends on**: Fase 2
**Requirements**: BACK-02, BACK-03, BACK-04, BACK-05, AUTH-04
**Success Criteria** (o que deve ser VERDADE):
  1. `POST /api/terms` cria termo com `ownerId` do usuário logado
  2. `GET /api/terms` retorna apenas termos do usuário autenticado
  3. `GET /api/terms/:id` retorna 404 se o termo pertence a outro usuário
  4. `DELETE /api/terms/:id` remove apenas termos do próprio usuário
  5. Requisição sem sessão válida recebe 401

Plans:
- [ ] 03-01: Criar `server/routes/terms.ts` com GET list, GET by id, POST upsert, DELETE
- [ ] 03-02: Registrar rotas no `server/index.ts` e testar com autenticação

#### Fase 4: Proxy Gemini

**Goal**: Chamadas Gemini roteadas pelo backend, chave não exposta no cliente
**Depends on**: Fase 2
**Requirements**: GEM-01, GEM-02, GEM-03
**Success Criteria** (o que deve ser VERDADE):
  1. `GEMINI_API_KEY` não aparece no bundle do frontend (verificar via DevTools)
  2. `POST /api/gemini/improve` retorna texto melhorado
  3. `POST /api/gemini/summary` retorna conclusão gerada
  4. Rota rejeita request sem sessão (401)

Plans:
- [ ] 04-01: Criar `server/routes/gemini.ts` movendo a lógica de `services/gemini.ts`
- [ ] 04-02: Registrar rotas e remover `services/gemini.ts` do frontend

#### Fase 5: Migração do Frontend

**Goal**: Frontend usa API REST em vez de localStorage, com AuthGuard ativo
**Depends on**: Fases 3 e 4
**Requirements**: (integração de todos os requisitos anteriores no cliente)
**Success Criteria** (o que deve ser VERDADE):
  1. Usuário não autenticado é redirecionado para tela de login
  2. Salvar termo chama `POST /api/terms` (não localStorage)
  3. Lista de termos carrega de `GET /api/terms`
  4. Melhoria de texto chama `POST /api/gemini/improve`
  5. `localStorage` não é mais usado para dados de termos

Plans:
- [ ] 05-01: Substituir todas as chamadas `localStorage` em `App.tsx` por `fetch('/api/terms/...')`
- [ ] 05-02: Substituir chamadas `services/gemini.ts` por `fetch('/api/gemini/...')`
- [ ] 05-03: Integrar `AuthGuard` no `App.tsx` e testar fluxo completo

#### Fase 6: Docker + Deploy

**Goal**: App containerizada e acessível na porta 8095
**Depends on**: Fase 5
**Requirements**: DEPL-01, DEPL-02
**Success Criteria** (o que deve ser VERDADE):
  1. `docker compose up` inicia postgres, api e nginx sem erros
  2. App responde em `http://localhost:8095`
  3. Login, criação e listagem de termos funcionam no ambiente Docker
  4. Dados persistem em `~/data/smart-tech-termo/postgres`

Plans:
- [ ] 06-01: Criar `Dockerfile.api`, `Dockerfile.nginx` e `nginx.conf`
- [ ] 06-02: Criar `docker-compose.yml` com serviços postgres, api, nginx
- [ ] 06-03: Testar build e smoke test completo no Docker

## Progress

| Fase | Planos Completos | Status | Concluída |
|------|------------------|--------|-----------|
| 1. Backend Foundation | 0/3 | Em planejamento | - |
| 2. Autenticação Better Auth | 0/3 | Não iniciada | - |
| 3. API de Termos | 0/2 | Não iniciada | - |
| 4. Proxy Gemini | 0/2 | Não iniciada | - |
| 5. Migração do Frontend | 0/3 | Não iniciada | - |
| 6. Docker + Deploy | 0/3 | Não iniciada | - |
