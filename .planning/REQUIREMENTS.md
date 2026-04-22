# Requirements: smart-tech-termo

**Defined:** 2026-04-22
**Core Value:** Usuário autenticado cria, salva e imprime termos de entrega de licença de forma rápida e segura.

## v1.0 Requirements

Requisitos para o milestone v1.0 — Backend + Auth + Persistência.

### Backend

- [ ] **BACK-01**: Sistema tem servidor Hono+Node.js respondendo na porta 3001
- [ ] **BACK-02**: Usuário autenticado pode criar ou atualizar um termo (upsert por ID)
- [ ] **BACK-03**: Usuário autenticado pode listar todos os seus termos
- [ ] **BACK-04**: Usuário autenticado pode buscar um termo específico por ID
- [ ] **BACK-05**: Usuário autenticado pode deletar um termo seu

### Autenticação

- [ ] **AUTH-01**: Usuário pode criar conta com email e senha
- [ ] **AUTH-02**: Usuário pode fazer login com conta Google (OAuth)
- [ ] **AUTH-03**: Sessão do usuário persiste entre recarregamentos do browser
- [ ] **AUTH-04**: Toda rota de termos filtra por `ownerId === session.user.id` (isolamento por usuário)

### Gemini (Proxy)

- [ ] **GEM-01**: Chave `GEMINI_API_KEY` existe apenas como variável de ambiente do servidor
- [ ] **GEM-02**: Usuário pode melhorar descrição de texto via `POST /api/gemini/improve`
- [ ] **GEM-03**: Usuário pode gerar conclusão/resumo via `POST /api/gemini/summary`

### Deploy

- [ ] **DEPL-01**: App roda em Docker Compose com serviços: postgres, api, nginx
- [ ] **DEPL-02**: App está acessível na porta 8095 via nginx (proxy reverso para api)

## Fora do Escopo (v1.0)

| Feature | Razão |
|---------|-------|
| Compartilhamento de termos entre usuários | Não é necessário — uso interno individual |
| Notificações por email | Fora do escopo desta versão |
| 2FA / MFA | Better Auth suporta, mas não é necessário agora |
| API pública / webhooks | App interno, sem necessidade |
| Mobile app | Web-first |

## Traceabilidade

| Requisito | Fase | Status |
|-----------|------|--------|
| BACK-01 | Fase 1 | Pendente |
| BACK-02 | Fase 3 | Pendente |
| BACK-03 | Fase 3 | Pendente |
| BACK-04 | Fase 3 | Pendente |
| BACK-05 | Fase 3 | Pendente |
| AUTH-01 | Fase 2 | Pendente |
| AUTH-02 | Fase 2 | Pendente |
| AUTH-03 | Fase 2 | Pendente |
| AUTH-04 | Fase 3 | Pendente |
| GEM-01 | Fase 4 | Pendente |
| GEM-02 | Fase 4 | Pendente |
| GEM-03 | Fase 4 | Pendente |
| DEPL-01 | Fase 6 | Pendente |
| DEPL-02 | Fase 6 | Pendente |

**Cobertura:**
- Requisitos v1.0: 14 total
- Mapeados para fases: 14
- Sem mapeamento: 0 ✓

---
*Requirements defined: 2026-04-22*
*Last updated: 2026-04-22 — definição inicial milestone v1.0*
