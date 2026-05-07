# smart-tech-termo — Emissor de Termos de Entrega de Licenças

## O que é este projeto

Sistema interno da Smart Tech para criação e gestão de termos de entrega de licenças de software. Gera documentos formais de entrega com dados do contratante, contratada, licenças (alunos/servidores), responsável técnico e credenciais de acesso. Usa IA (Gemini) para melhorar textos e gerar conclusões.

## Estado atual (abril 2026)

**Frontend-only, dados em localStorage.** Sem backend, sem banco de dados.

Stack atual:
- React 19 + Vite + TypeScript
- `@heroicons/react` para ícones
- `@google/genai` — melhoria de texto e geração de resumo via Gemini
- **Persistência: `localStorage`** com chave `smart_tech_reports_db`
- **Sem autenticação**

Arquivos:
- `App.tsx` — componente principal com toda a lógica (396 linhas)
- `components/ReportPreview.tsx` — preview do termo para impressão/PDF
- `components/SmartTechLogo.tsx` — logo SVG da empresa
- `services/gemini.ts` — `improveDescription()` e `generateSummary()` via Gemini
- `types.ts` — interfaces `ReportData`, `LicenseItem`, `Entity`

### Funcionalidades existentes
- Formulário com abas (Geral, Contratante, Contratada, Licenças, Técnico, Instalação)
- Preview do termo com layout formal
- Salvar/carregar múltiplos termos (localStorage)
- Geração de PDF via `window.print()`
- IA: melhora descrições e gera conclusão formal

## Decisões arquiteturais (não reabrir)

1. **localStorage → PostgreSQL** — termos salvos no banco.
2. **Backend: Hono + Node.js** — mesmo padrão do `smarttech` e `Smart-tech-reports-v2`.
3. **Auth: Better Auth** — Google OAuth + email/password. Mesmas credenciais Google dos outros apps.
4. **Gemini API mantida** — mover do frontend para o backend (não expor API key no cliente).
5. **Sem monorepo** — projeto permanece independente.
6. **Runtime: Node.js**.

## O que implementar (nesta ordem)

### 1. Criar backend Hono

Estrutura a criar:
```
server/
  index.ts      ← entry point Hono
  auth.ts       ← Better Auth
  prisma.ts     ← PrismaClient
  routes/
    terms.ts    ← CRUD de termos
    gemini.ts   ← proxy para Gemini API (protege a key)
```

Instalar:
```bash
npm install hono @hono/node-server better-auth @prisma/client @prisma/adapter-pg prisma dotenv
npm install -D tsx
```

### 2. Criar schema Prisma

Baseado em `types.ts`, criar `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Term {
  id              String   @id
  ownerId         String   // referência ao user do Better Auth
  reportNumber    String
  processRef      String?
  pregaoRef       String?
  contractRef     String?
  date            String
  contratante     Json     // Entity serializada
  contratada      Json     // Entity serializada
  softwareDescription String
  items           Json     // LicenseItem[]
  techResponsible Json     // { name, rg }
  installation    Json     // { environment, restrictedTo, accessLink }
  credentials     Json     // { username, password, city }
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("terms")
}
```

Rodar `npx better-auth generate` para adicionar tabelas de auth, depois `npx prisma migrate dev`.

### 3. Configurar Better Auth

Criar `server/auth.ts` — **idêntico ao dos outros apps**:
```ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './prisma.js'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})
```

### 4. Rotas de termos

```ts
// server/routes/terms.ts
// GET /api/terms       — lista termos do usuário autenticado
// GET /api/terms/:id   — busca por ID (verifica ownerId)
// POST /api/terms      — criar/atualizar (upsert por id)
// DELETE /api/terms/:id
```

Padrão: toda rota filtra por `ownerId === session.user.id`.

### 5. Proxy Gemini no backend

Criar `server/routes/gemini.ts`:

```ts
// POST /api/gemini/improve  — { text, type: 'objective' | 'observations' }
// POST /api/gemini/summary  — { items: LicenseItem[] }
```

Move a lógica de `services/gemini.ts` para o backend. O `GEMINI_API_KEY` fica apenas em variável de ambiente do servidor.

### 6. Substituir localStorage e Gemini no frontend

Em `App.tsx`:
- Trocar todas as chamadas `localStorage.getItem/setItem` por `fetch('/api/terms/...')`
- Trocar chamadas de `services/gemini.ts` por `fetch('/api/gemini/improve')` e `fetch('/api/gemini/summary')`
- Adicionar `AuthGuard` (mesmo padrão dos outros apps)

Criar `src/lib/auth-client.ts`:
```ts
import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({ baseURL: '/api/auth' })
```

### 7. Docker Compose

Criar `docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: termo
      POSTGRES_PASSWORD: termo
      POSTGRES_DB: termo
    volumes:
      - ~/data/smart-tech-termo/postgres:/var/lib/postgresql/data
    networks: [internal]

  api:
    build: { context: ., dockerfile: Dockerfile.api }
    env_file: .env
    depends_on: [postgres]
    networks: [internal]

  nginx:
    build: { context: ., dockerfile: Dockerfile.nginx }
    ports: ["8095:80"]
    depends_on: [api]
    networks: [internal]

networks:
  internal:
```

Porta: **8095** (já reservada no REGISTRY da desklime).

### 8. Variáveis de ambiente

```
DATABASE_URL=postgresql://termo:termo@postgres:5432/termo
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=<openssl rand -base64 32>
GOOGLE_CLIENT_ID=<mesmo dos outros apps>
GOOGLE_CLIENT_SECRET=<mesmo dos outros apps>
GEMINI_API_KEY=<existente>
```

### 9. Dockerfiles e nginx.conf

Criar `Dockerfile.api`, `Dockerfile.nginx` e `nginx.conf` **idênticos ao smarttech** — só mudar o nome do container se necessário.

## Como rodar localmente

```bash
# Banco
docker compose up postgres -d

# Backend
npx tsx watch server/index.ts

# Frontend
npm run dev
```

Adicionar ao `package.json`:
```json
"scripts": {
  "dev:server": "tsx watch server/index.ts",
  "build": "vite build"
}
```

## Mapa de portas dos 3 apps

| App | Porta |
|---|---|
| smart-tech-termo | **8095** |
| Smart-tech-reports-v2 | **8094** |
| smarttech (propostas) | **8093** |

## Arquivos a criar/modificar

| Ação | Arquivo |
|---|---|
| Criar | `server/index.ts` |
| Criar | `server/auth.ts` |
| Criar | `server/prisma.ts` |
| Criar | `server/routes/terms.ts` |
| Criar | `server/routes/gemini.ts` |
| Criar | `prisma/schema.prisma` |
| Criar | `src/lib/auth-client.ts` |
| Criar | `src/components/AuthGuard.tsx` |
| Criar | `docker-compose.yml` |
| Criar | `Dockerfile.api` |
| Criar | `Dockerfile.nginx` |
| Criar | `nginx.conf` |
| Modificar | `App.tsx` — trocar localStorage por API calls, Gemini por proxy backend |
| Deletar | `services/gemini.ts` (lógica migrada para backend) |
