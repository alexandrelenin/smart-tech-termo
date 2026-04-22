---
phase: 06-docker-deploy
verified: 2026-04-22T21:00:00Z
status: human_needed
score: 2/4 must-haves verified (2 require human)
overrides_applied: 0
human_verification:
  - test: "Login, criação e listagem de termos no ambiente Docker"
    expected: "Usuário consegue logar, criar um termo e vê-lo na lista — tudo via http://localhost:8095"
    why_human: "Fluxo de autenticação e persistência exige browser com sessão ativa; não testável com curl"
  - test: "Dados persistem após docker compose down && docker compose up"
    expected: "Termo criado antes do down continua visível após reinício dos containers"
    why_human: "Exige ciclo completo de escrita → reinício → leitura; requer interação manual"
---

# Phase 6: Docker + Deploy — Verification Report

**Phase Goal:** App containerizada e acessível na porta 8095
**Verified:** 2026-04-22
**Status:** human_needed
**Re-verification:** No — verificacao inicial

## Goal Achievement

### Observable Truths

| #  | Truth                                                                | Status           | Evidence                                                                                              |
|----|----------------------------------------------------------------------|------------------|-------------------------------------------------------------------------------------------------------|
| 1  | `docker compose up` inicia postgres, api e nginx sem erros           | VERIFIED         | Smoke test confirmado (commit c563669); logs no 06-03-SUMMARY.md documentam startup limpo            |
| 2  | App responde em `http://localhost:8095`                              | VERIFIED         | `GET http://localhost:8095` retornou 200 no smoke test (06-03-SUMMARY.md)                            |
| 3  | Login, criação e listagem de termos funcionam no ambiente Docker     | ? NEEDS HUMAN    | Fluxo completo de auth + CRUD requer browser; não testável via grep ou curl                           |
| 4  | Dados persistem em `~/data/smart-tech-termo/postgres`                | ? NEEDS HUMAN    | Volume mapeado corretamente (`~/data/smart-tech-termo/postgres:/var/lib/postgresql/data`), mas persistência real requer ciclo down/up com dados |

**Score:** 2/4 truths verified (2 requerem verificação humana)

### Required Artifacts

| Artifact            | Expected                                    | Status     | Details                                                                                    |
|---------------------|---------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| `Dockerfile.api`    | Build da imagem Node/Hono com Prisma        | VERIFIED   | 19 linhas; node:20-alpine, prisma generate com DATABASE_URL dummy, CMD com migrate+tsx     |
| `Dockerfile.nginx`  | Build multi-stage: Vite + nginx Alpine      | VERIFIED   | Multi-stage correto; copia dist para /usr/share/nginx/html; expoe porta 80                 |
| `docker-compose.yml`| 3 servicos: postgres, api, nginx            | VERIFIED   | postgres:15-alpine, api (Dockerfile.api), nginx (Dockerfile.nginx); porta 8095:80          |
| `nginx.conf`        | Proxy /api/ → api:3001, SPA fallback        | VERIFIED   | `proxy_pass http://api:3001/api/`; `try_files $uri $uri/ /index.html`; gzip habilitado     |

### Key Link Verification

| From            | To              | Via                                    | Status   | Details                                                         |
|-----------------|-----------------|----------------------------------------|----------|-----------------------------------------------------------------|
| nginx (porta 80)| api (porta 3001)| `proxy_pass http://api:3001/api/`      | VERIFIED | nginx.conf linha 28                                             |
| nginx           | frontend build  | COPY --from=build /app/dist            | VERIFIED | Dockerfile.nginx etapa 2                                        |
| api             | postgres        | DATABASE_URL postgres:5432 (override)  | VERIFIED | docker-compose.yml environment.DATABASE_URL (commit 97fec95)   |
| docker          | porta 8095      | `ports: ["8095:80"]` no servico nginx  | VERIFIED | docker-compose.yml linha 27                                     |

### Data-Flow Trace (Level 4)

Nao aplicavel para artefatos de infraestrutura (Dockerfiles, docker-compose, nginx.conf). Os containers sao validados por smoke test documentado.

### Behavioral Spot-Checks

| Behavior                            | Verificado via                        | Resultado documentado       | Status   |
|-------------------------------------|---------------------------------------|-----------------------------|----------|
| `docker compose build` sem erros    | commit 005df1d + 06-03-SUMMARY.md     | exit code 0                 | PASS     |
| `GET http://localhost:3001/api/health` retorna 200 | 06-03-SUMMARY.md smoke test | "retorna 200"         | PASS     |
| `GET http://localhost:8095` retorna 200 | 06-03-SUMMARY.md smoke test       | "retorna 200"               | PASS     |
| `docker compose down` finaliza sem erros | 06-03-SUMMARY.md              | "finaliza sem erros"        | PASS     |
| Login/CRUD no browser               | Nao testado                           | Requer verificacao humana   | ? SKIP   |
| Persistencia apos reinicio          | Nao testado                           | Requer verificacao humana   | ? SKIP   |

### Requirements Coverage

| Requisito | Plano fonte | Descricao                                                          | Status    | Evidencia                                                                    |
|-----------|-------------|---------------------------------------------------------------------|-----------|------------------------------------------------------------------------------|
| DEPL-01   | 06-03-PLAN  | App roda em Docker Compose com servicos: postgres, api, nginx       | SATISFIED | docker-compose.yml tem os 3 servicos; smoke test confirma startup             |
| DEPL-02   | 06-03-PLAN  | App acessivel na porta 8095 via nginx (proxy reverso para api)      | SATISFIED | `ports: ["8095:80"]` + `proxy_pass http://api:3001/api/`; smoke test 200     |

### Anti-Patterns Found

| Arquivo          | Linha | Padrao                                                        | Severidade | Impacto                                                                                                   |
|------------------|-------|---------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------|
| `vite.config.ts` | 14-15 | `GEMINI_API_KEY` injetada no bundle via `define` do Vite      | BLOCKER    | A chave de API fica literalmente embutida no JS compilado pelo `Dockerfile.nginx`. Contradiz GEM-01 e a decisao arquitetural em CLAUDE.md. O proxy `server/routes/gemini.ts` existe mas e contornado pelo bundle. |
| `docker-compose.yml` | 11 | `ports: "5433:5432"` expe porta do Postgres no host          | WARNING    | Acesso direto ao banco de fora do Docker em producao. Aceitavel em dev. |
| `docker-compose.yml` | 22 | `ports: "3001:3001"` expe porta da API no host                | WARNING    | Contorna nginx em producao. Aceitavel em dev. |
| `docker-compose.yml` | 21 | `depends_on: [postgres]` sem healthcheck                     | WARNING    | Nao aguarda Postgres estar pronto para conexoes; `migrate deploy` pode falhar no primeiro boot. Sem `restart: on-failure`. |

**Nota sobre o anti-padrao BLOCKER:** O `vite.config.ts` com `define: { 'process.env.GEMINI_API_KEY': ... }` e um residuo da fase pre-migracao. GEM-01 foi declarado completo na Fase 4, mas o arquivo `vite.config.ts` nao foi atualizado para remover o `define` block. O `Dockerfile.nginx` executa `npm run build` (Vite), o que resulta na chave sendo baked no bundle distribuido. Isso NAO afeta DEPL-01 nem DEPL-02 diretamente — o app funciona — mas viola GEM-01 (requisito de Fase 4 que o review de codigo ja identificou em CR-01).

### Human Verification Required

#### 1. Login, criacao e listagem de termos no ambiente Docker

**Test:** Rodar `docker compose up -d`, abrir `http://localhost:8095` no browser, criar uma conta (email/senha), fazer login, criar um termo com dados de teste, verificar se o termo aparece na lista.
**Expected:** Fluxo completo funciona sem erros; termo salvo aparece na lista.
**Why human:** Fluxo de autenticacao requer interacao com browser. Sessao, cookies e redirecionamento do AuthGuard nao sao verificaveis via curl.

#### 2. Dados persistem apos reinicio dos containers

**Test:** Apos criar um termo, rodar `docker compose down && docker compose up -d`, abrir `http://localhost:8095` e verificar se o termo criado ainda aparece.
**Expected:** Volume `~/data/smart-tech-termo/postgres` preserva os dados entre reinicios.
**Why human:** Persistencia real requer ciclo completo de escrita, parada e reinicio com verificacao no browser.

### Gaps Summary

Nao ha gaps bloqueando DEPL-01 e DEPL-02 — ambos os requisitos estao satisfeitos. Os artefatos Docker existem, sao substanciais, e o smoke test documentado confirma funcionamento na porta 8095.

Dois itens pendentes de verificacao humana:
1. Fluxo funcional completo (login + CRUD) no ambiente Docker.
2. Persistencia real de dados apos reinicio dos containers.

Anti-padrao BLOCKER identificado: `vite.config.ts` ainda expoe `GEMINI_API_KEY` no bundle frontend. Este e um residuo de GEM-01 (Fase 4) nao corrigido — o code review (06-REVIEW.md, CR-01) ja documentou isso. Nao bloqueia o goal de DEPL, mas representa uma falha de seguranca no artefato final gerado por esta fase.

---

_Verified: 2026-04-22_
_Verifier: Claude (gsd-verifier)_
