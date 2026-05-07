# smart-tech-termo

## What This Is

Sistema interno da Smart Tech para criação e gestão de termos de entrega de licenças de software. Gera documentos formais com dados do contratante, contratada, licenças (alunos/servidores), responsável técnico e credenciais de acesso. Usa IA (Gemini) para melhorar textos e gerar conclusões.

## Core Value

Usuário autenticado cria, salva e imprime termos de entrega de licença de forma rápida e segura.

## Current State (Post-v1.0)

**Shipped:** v1.0 Backend + Auth + Persistência (2026-05-07)

Aplicação full-stack em produção:
- Backend Hono + Node.js servindo API REST
- Autenticação Better Auth (email/senha + Google OAuth)
- Persistência PostgreSQL (Prisma) por `ownerId`
- Proxy Gemini no backend (`GEMINI_API_KEY` apenas no servidor)
- Frontend React 19 + Vite com `AuthGuard` ativo
- Deploy Docker Compose (postgres + api + nginx) na porta 8095
- Acessível em `https://smart-tech-termos.institutosintonia.com.br` (Cloudflare tunnel)

**Validated requirements:** 17/17 (14 originais + 3 UX adicionados na Fase 7).
**UAT Fase 7:** 3/3 passou.

Detalhes em [.planning/milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) e [.planning/milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md).

## Next Milestone Goals

_Ainda não planejado. Use `/gsd-new-milestone` para iniciar v1.1._

Candidatos identificados durante v1.0 (não priorizados):
- Remover sample data hardcoded em `initialData` (App.tsx) — substituir por demo seed opcional
- Considerar 2FA / MFA via Better Auth
- Compartilhamento de termos entre usuários (roles/permissões)
- Notificações por email

## Constraints

- **Stack**: Hono + Node.js + Better Auth + Prisma + PostgreSQL — mesmo padrão de `smarttech` e `Smart-tech-reports-v2`
- **Auth**: Google OAuth — mesmas credenciais dos outros apps Smart Tech
- **Deploy**: Docker Compose + nginx — desklime (10.0.0.227) via Cloudflare tunnel
- **Porta**: 8095 — reservada no REGISTRY desklime

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| localStorage → PostgreSQL | Persistência por usuário, multi-dispositivo, segurança | ✓ Shipped (v1.0) |
| Backend Hono + Node.js | Padrão dos outros apps (smarttech, reports-v2) | ✓ Shipped (v1.0) |
| Better Auth | Mesmo padrão, reutiliza credenciais Google | ✓ Shipped (v1.0) |
| Gemini no backend | Não expor GEMINI_API_KEY no cliente | ✓ Shipped (v1.0) |
| Sem monorepo | Projeto independente, simples de manter | ✓ Good |
| `BETTER_AUTH_URL` aponta para domínio público | OAuth callback precisa do hostname externo | ✓ Shipped (v1.0) |
| `emptyData` separado de `initialData` | "Novo Termo" deve produzir form em branco, não restaurar sample data | ✓ Shipped (v1.0 Fase 7) |

## Evolution

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Update Current State with shipped version
4. Set Next Milestone Goals

---
*Last updated: 2026-05-07 — Milestone v1.0 shipped*
