---
phase: 03-terms-crud
plan: 01
status: done
completed_at: 2026-04-22T20:00:00
retroactive: true
---

# Retroactive Summary — server/routes/terms.ts

## O que foi feito

- `server/routes/terms.ts` criado com 4 rotas:
  - `GET /` — lista termos do usuário autenticado (filtra por ownerId)
  - `GET /:id` — busca por ID (verifica ownership, 404 se não pertencer ao user)
  - `POST /` — upsert por id (cria ou atualiza)
  - `DELETE /:id` — remove (verifica ownership)
- Toda rota valida sessão via `auth.api.getSession()`, retorna 401 se não autenticado

## Arquivos criados

- `server/routes/terms.ts`
