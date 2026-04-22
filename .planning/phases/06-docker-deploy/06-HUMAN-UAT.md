---
status: partial
phase: 06-docker-deploy
source: [06-VERIFICATION.md]
started: 2026-04-22T00:00:00Z
updated: 2026-04-22T00:00:00Z
---

## Current Test

[aguardando verificação humana]

## Tests

### 1. Login + CRUD completo no Docker
expected: Abrir http://localhost:8095, criar conta, fazer login, criar e listar termos — fluxo completo sem erros.
result: [pending]

### 2. Persistência após reinício
expected: Criar termo, `docker compose down && docker compose up -d`, verificar que o termo persiste. Dados preservados em `~/data/smart-tech-termo/postgres`.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
