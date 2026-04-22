# smart-tech-termo

## What This Is

Sistema interno da Smart Tech para criação e gestão de termos de entrega de licenças de software. Gera documentos formais com dados do contratante, contratada, licenças (alunos/servidores), responsável técnico e credenciais de acesso. Usa IA (Gemini) para melhorar textos e gerar conclusões.

## Core Value

Usuário autenticado cria, salva e imprime termos de entrega de licença de forma rápida e segura.

## Current Milestone: v1.0 Backend + Auth + Persistência

**Goal:** Migrar do localStorage para PostgreSQL com backend Hono, autenticação Better Auth e proxy Gemini no servidor.

**Target features:**
- Backend Hono + Node.js com API REST
- Autenticação via Better Auth (Google OAuth + email/senha)
- Persistência de termos em PostgreSQL (por usuário autenticado)
- Proxy Gemini no backend (chave não exposta no cliente)
- Migração do frontend: localStorage → API calls, AuthGuard
- Deploy via Docker Compose na porta 8095

## Requirements

### Validated

✓ Formulário com abas (Geral, Contratante, Contratada, Licenças, Técnico, Instalação) — existente
✓ Preview do termo com layout formal para impressão/PDF — existente
✓ IA para melhoria de descrições e geração de conclusão — existente

### Active

- [ ] BACK-01: Sistema tem backend Hono+Node.js servindo API REST
- [ ] BACK-02: Usuário pode salvar/atualizar termos no banco PostgreSQL
- [ ] BACK-03: Usuário pode listar todos os seus termos
- [ ] BACK-04: Usuário pode buscar um termo por ID
- [ ] BACK-05: Usuário pode deletar um termo
- [ ] AUTH-01: Usuário pode fazer login com email e senha
- [ ] AUTH-02: Usuário pode fazer login com Google OAuth
- [ ] AUTH-03: Sessão persiste entre recarregamentos do browser
- [ ] AUTH-04: Apenas o dono do termo pode visualizá-lo, editá-lo ou deletá-lo
- [ ] GEM-01: Chave da API Gemini fica apenas no servidor (não exposta no cliente)
- [ ] GEM-02: Usuário pode melhorar textos via proxy do backend
- [ ] GEM-03: Usuário pode gerar resumo/conclusão via proxy do backend
- [ ] DEPL-01: App roda em Docker Compose com PostgreSQL
- [ ] DEPL-02: App está acessível na porta 8095 via nginx

### Out of Scope

- Monorepo — projeto permanece independente
- Runtime Bun — usar Node.js (mesmo padrão dos outros apps)
- Compartilhamento de termos entre usuários — não é necessário agora
- Notificações por email — fora do escopo desta versão

## Context

**Stack atual (frontend-only):**
- React 19 + Vite + TypeScript
- `@heroicons/react`
- `@google/genai` (Gemini)
- Persistência: `localStorage` com chave `smart_tech_reports_db`

**Referência de outros apps Smart Tech:**
- `smarttech` (propostas) — porta 8093, usa Hono + Better Auth + Prisma
- `Smart-tech-reports-v2` — porta 8094, mesmo padrão

**Porta reservada:** 8095 (REGISTRY da desklime)

## Constraints

- **Stack**: Hono + Node.js + Better Auth + Prisma + PostgreSQL — mesmo padrão dos outros apps
- **Auth**: Google OAuth — mesmas credenciais Google dos outros apps Smart Tech
- **Deploy**: Docker Compose + nginx — mesmo padrão de infraestrutura
- **Porta**: 8095 — reservada no REGISTRY

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| localStorage → PostgreSQL | Persistência por usuário, multi-dispositivo, segurança | — Pending |
| Backend Hono + Node.js | Padrão dos outros apps (smarttech, reports-v2) | — Pending |
| Better Auth | Mesmo padrão, reutiliza credenciais Google configuradas | — Pending |
| Gemini no backend | Não expor GEMINI_API_KEY no cliente | — Pending |
| Sem monorepo | Projeto independente, simples de manter | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 — Milestone v1.0 iniciado*
