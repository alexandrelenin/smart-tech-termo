# External Integrations
_Generated: 2026-04-22_

## Summary

The only active external integration is the Google Gemini AI API, called directly from the frontend via `@google/genai`. The API key is injected at build time by Vite and exposed in the client bundle — this is a known security issue targeted for remediation. There is no authentication provider, no database service, and no third-party service beyond Gemini.

## APIs & External Services

**Google Gemini AI:**
- Purpose: Improve `softwareDescription` text quality and generate formal conclusion paragraphs for license delivery terms
- SDK: `@google/genai` ^1.34.0
- Client instantiation: `new GoogleGenAI({ apiKey: process.env.API_KEY })` in `services/gemini.ts`
- Model used: `gemini-3-flash-preview`
- Functions exposed:
  - `improveDescription(text, type)` — rewrites objective or observations fields in formal Portuguese
  - `generateSummary(items)` — generates a formal conclusion paragraph from license items
- Auth: API key via env var `GEMINI_API_KEY`
- **Security issue:** Key is baked into the Vite client bundle via `define` in `vite.config.ts`; visible in browser

## Data Storage

**Databases:**
- None currently. All data stored in browser `localStorage` under key `smart_tech_reports_db`

**File Storage:**
- None — PDF export uses `window.print()` (browser print dialog), no server-side file generation

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None — no authentication exists in the current implementation
- Access is unrestricted; anyone with the URL can read/write all stored terms

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- `console.error` only, in `services/gemini.ts` catch blocks

## CI/CD & Deployment

**Hosting:**
- Not configured — no deployment pipeline, no Dockerfile, no docker-compose yet

**CI Pipeline:**
- None

## Environment Variables

**Currently used:**

| Variable | Where consumed | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `vite.config.ts` → injected as `process.env.API_KEY` + `process.env.GEMINI_API_KEY` | Gemini SDK authentication |

**Planned (per CLAUDE.md — not yet implemented):**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Better Auth base URL |
| `BETTER_AUTH_SECRET` | Better Auth signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GEMINI_API_KEY` | Stays — moves to backend only |

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

## Planned Integrations (per CLAUDE.md — not yet implemented)

| Integration | Purpose |
|---|---|
| Google OAuth (via Better Auth) | Social login |
| Better Auth email/password | Local auth |
| PostgreSQL 15 | Persistent term storage |
| Hono backend | API layer; proxies Gemini calls (removes key from frontend) |

## Gaps / Unknowns

- `GEMINI_API_KEY` is currently exposed in the frontend bundle — this is the primary security gap
- No `.env.example` or documented env var list exists in the repository
- No error reporting service (no Sentry, Datadog, etc.)
- Google OAuth credentials are shared with other Smart Tech apps (`smarttech`, `Smart-tech-reports-v2`) but not yet wired here
