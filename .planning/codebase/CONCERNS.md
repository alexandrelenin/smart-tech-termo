# CONCERNS
_Generated: 2026-04-22_

## Summary

The app is currently a frontend-only tool with no authentication, no authorization, and a Gemini API key exposed through Vite's `define` mechanism in the built JS bundle. Data is stored in `localStorage` with no isolation between users or browsers. All of these concerns are resolved by the planned v1.0 migration, but there are specific risks in the transition itself that must be managed carefully.

---

## Security Concerns

### CRITICAL — Gemini API Key Exposed in Client Bundle

- **Risk:** `vite.config.ts` inlines `GEMINI_API_KEY` as a build-time constant via `define: { 'process.env.API_KEY': ... }`. The key ends up in the compiled JS bundle shipped to every browser visitor.
- **Files:** `vite.config.ts` (lines 13–16), `services/gemini.ts` (line 5)
- **Impact:** Anyone can inspect the bundle, extract the key, and consume Gemini quota at Smart Tech's expense.
- **Fix:** Move Gemini calls to `server/routes/gemini.ts` (planned). Remove the `define` block from `vite.config.ts` entirely after migration.

### HIGH — No Authentication or Authorization

- **Risk:** The app has no login gate. Anyone who can reach the URL can create, read, or delete any term stored in that browser's `localStorage`. There is no concept of ownership.
- **Files:** `App.tsx` (entire file — no auth checks)
- **Impact:** Shared-machine or multi-user scenarios are completely insecure. With the upcoming backend, any API endpoint left unprotected would expose all users' terms.
- **Fix:** `AuthGuard` component + Better Auth session check on every API route (planned in CLAUDE.md §6 and §4).

### HIGH — Credentials Stored and Displayed in Plaintext

- **Risk:** The `credentials.password` field is stored as plaintext in `localStorage` (key `smart_tech_reports_db`) and rendered without masking in the preview PDF (`components/ReportPreview.tsx` line 165). After migration, it will be stored as plaintext JSON in PostgreSQL (`credentials Json` column in the `Term` model).
- **Files:** `types.ts` (line 32), `components/ReportPreview.tsx` (line 165), `App.tsx` (line 336 — "Senha Padrão" input with `type="text"`)
- **Impact:** These are access credentials to municipal government systems. Plaintext storage and display in documents is a data handling risk.
- **Mitigation (short-term):** The input field should be `type="password"`. PDF display of the password is intentional (delivery document), but storage should at minimum acknowledge this is a deliberate design choice.
- **Note:** This is a domain decision — the PDF intentionally shows the password to the client. Confirm this is acceptable, or add a disclaimer field.

### MEDIUM — No CSRF Protection on Planned API

- **Risk:** The planned Hono backend has no CSRF protection mentioned in CLAUDE.md. Cookie-based sessions (Better Auth default) are CSRF-vulnerable without a mitigation strategy.
- **Files:** Not yet created — `server/routes/terms.ts`, `server/routes/gemini.ts`
- **Fix:** Better Auth includes CSRF protection by default for its own routes. Confirm it is enabled for custom routes too, or use `SameSite=Strict` cookies.

### LOW — External CDN Dependencies with No SRI

- **Risk:** `index.html` loads two external scripts without Subresource Integrity (SRI) hashes: Tailwind CSS from `cdn.tailwindcss.com` (line 11) and `html2pdf.bundle.min.js` from `cdnjs.cloudflare.com` (line 12). A compromised CDN could inject arbitrary code.
- **Files:** `index.html` (lines 11–12)
- **Fix:** Add `integrity` and `crossorigin` attributes, or — preferred — bundle Tailwind and html2pdf via npm during the build migration.

---

## Technical Debt

### Tailwind Loaded from CDN Instead of Being Bundled

- **Issue:** `index.html` loads Tailwind via `<script src="https://cdn.tailwindcss.com">`. This is the play/development mode of Tailwind — it ships the entire Tailwind runtime (hundreds of KB) to the browser at runtime, is not treeshakeable, and is explicitly not recommended for production by Tailwind's own docs.
- **Files:** `index.html` (line 11)
- **Impact:** Larger page weight, no purging of unused classes, runtime overhead on first paint.
- **Fix:** Install `tailwindcss` as a dev dependency and configure via `vite.config.ts` during the migration build phase.

### html2pdf Loaded from CDN with Runtime `@ts-ignore`

- **Issue:** `html2pdf.js` is loaded via CDN script tag (`index.html` line 12) and accessed as a global with `// @ts-ignore` at `App.tsx` line 131. There is no type safety or bundling.
- **Files:** `App.tsx` (lines 130–133), `index.html` (line 12)
- **Impact:** Build errors would be silenced; the fallback (`window.print()`) masks failures silently.
- **Fix:** `npm install html2pdf.js` and import it properly, or replace with a native `window.print()` flow (already present as fallback).

### `any` Types Throughout Core Logic

- **Issue:** Multiple uses of untyped `any` defeat TypeScript's value:
  - `App.tsx` line 85: `handleUpdate(path: string, value: any)` — the path-based deep-update function has no type safety.
  - `App.tsx` lines 89, 140, 383: `current: any`, `NavItem` props, `Input` props.
  - `services/gemini.ts` line 26: `generateSummary(items: any[])` — should accept `LicenseItem[]`.
- **Files:** `App.tsx`, `services/gemini.ts`
- **Impact:** Refactoring errors during migration (e.g., renaming fields in `ReportData`) will not be caught at compile time.
- **Fix:** Type `Input` and `NavItem` properly. Replace `any[]` with `LicenseItem[]` in `generateSummary`. The deep-update helper should use a typed approach or be replaced by field-specific setters.

### ID Generation via `Date.now()`

- **Issue:** New terms get `id: Date.now().toString()` (`App.tsx` line 19). This is the initial static value; new reports opened from scratch reuse this same ID unless the user explicitly changes it.
- **Files:** `App.tsx` (line 19)
- **Impact:** Two terms created in the same second will collide. After migration to PostgreSQL, the backend must generate IDs (UUID or CUID) server-side and not trust client-provided IDs as canonical.
- **Fix:** Backend generates IDs on `POST /api/terms`. Frontend stops setting `id` on creation, receives it from the API response.

### `handleUpdate` Path-Based Deep Mutation

- **Issue:** `handleUpdate` in `App.tsx` (lines 85–97) uses a string path like `'credentials.city'` and a dynamic shallow-clone loop to update nested state. This is fragile — any typo in a path string is a silent runtime bug, and adding new nested fields requires no compile-time check.
- **Files:** `App.tsx` (lines 85–97)
- **Impact:** During migration, any rename of `ReportData` fields will require a manual audit of all `handleUpdate('...')` call sites.
- **Fix:** Consider replacing with explicit field-level setters or a form library (React Hook Form) during the frontend migration phase.

### `saveToDatabase` Uses Fake Delay to Simulate Async

- **Issue:** `saveToDatabase` (`App.tsx` lines 106–117) does synchronous `localStorage.setItem` but wraps the status update in a `setTimeout(..., 800)` to fake a loading spinner. This is misleading UI behavior.
- **Files:** `App.tsx` (lines 106–117)
- **Impact:** Low — cosmetic. But the pattern will need to be replaced with real async handling (promise-based fetch) during migration, and the fake delay must be removed.

### Gemini Model Name Appears Incorrect

- **Issue:** `services/gemini.ts` calls `model: 'gemini-3-flash-preview'` (lines 14, 35). As of the model's knowledge cutoff, the correct model identifiers are `gemini-1.5-flash` or `gemini-2.0-flash`. `gemini-3-flash-preview` may not exist or may refer to a future/internal model name.
- **Files:** `services/gemini.ts` (lines 14, 35)
- **Impact:** Gemini calls may silently fail or use a fallback model. The `catch` block returns the original text, masking the error.
- **Fix:** Verify the correct model ID against the Gemini API docs before implementing the backend proxy.

---

## Migration Risks

### Risk: localStorage Data Lost Without Migration Path

- **Problem:** The planned migration switches from `localStorage` (`smart_tech_reports_db`) to PostgreSQL, but there is no data migration strategy defined. Existing terms in users' browsers will be abandoned.
- **Impact:** Internal users lose previously saved terms on the first login after deploy.
- **Recommendation:** Add a one-time migration script or a UI prompt on first login: "We found N terms in local storage. Import them?" — call `POST /api/terms` for each, then clear localStorage.

### Risk: Fixed Item IDs Break Flexible License Structure

- **Problem:** `App.tsx` hardcodes item lookup by `id === 'alunos-id'` and `id === 'servidores-id'` (lines 171–172, 263, 295). The schema in `types.ts` and the planned Prisma model (`items Json`) do not enforce these IDs. If a user creates a term without these specific IDs, the Licenças tab renders empty inputs.
- **Files:** `App.tsx` (lines 171–172), `types.ts`
- **Impact:** Adding a third license category (e.g., "Gestores") would require changing hardcoded lookups throughout `App.tsx`.
- **Fix:** Render the license list dynamically without hardcoded ID lookups. Validate that items always have the expected categories on the backend.

### Risk: `contratada` Data Is Hardcoded to Smart Tech

- **Problem:** `initialData` in `App.tsx` (lines 33–38) hardcodes Smart Tech's own CNPJ, address, representative, and CPF. These are Smart Tech's own legal details, which are fixed. However, they live in `ReportData.contratada` and are stored/loaded as if they were user-editable fields.
- **Files:** `App.tsx` (lines 33–38)
- **Impact:** A user could accidentally edit and save incorrect company details. After migration, if contratada data is stored per-term in PostgreSQL, it could drift. Consider hardcoding these in the PDF template (`ReportPreview.tsx`) rather than treating them as editable form data.

### Risk: No Input Validation Before API Calls

- **Problem:** There is currently no form validation. Empty required fields (e.g., `reportNumber`, `date`, CNPJ) are silently accepted and saved. After migration, the backend will need validation, and the frontend has no validation layer to provide user feedback before hitting the API.
- **Files:** `App.tsx` (entire form — no validation logic present)
- **Impact:** Invalid terms will be sent to `POST /api/terms` and either rejected (causing unhandled errors) or stored with missing data.
- **Fix:** Add frontend validation (at minimum, required field checks) before the save action. Backend should validate with Zod on the Hono route.

### Risk: No Error Handling for API Calls (Post-Migration)

- **Problem:** The current `saveToDatabase` has no error handling because `localStorage` never fails. The migration plan (CLAUDE.md §6) replaces this with `fetch('/api/terms/...')` calls, but no error handling strategy is defined. Network failures, 401s, and 500s will need to be surfaced to the user.
- **Files:** `App.tsx` (lines 106–117 — to be replaced)
- **Impact:** Silent data loss if a save request fails post-migration.
- **Fix:** Wrap all fetch calls in try/catch, set a dedicated `saveStatus: 'error'` state, and display an error message in the UI.

### Risk: Frontend Still References `process.env.API_KEY` After Migration

- **Problem:** After moving Gemini to the backend, `services/gemini.ts` and `vite.config.ts` must be fully cleaned up. If `process.env.API_KEY` remains in the define block, it will expose whatever value is present in `.env` at build time — even if it's a placeholder.
- **Files:** `vite.config.ts` (lines 13–16), `services/gemini.ts`
- **Fix:** Delete `services/gemini.ts` (confirmed in CLAUDE.md), remove the `define` block from `vite.config.ts`, and ensure `.env` does not contain `GEMINI_API_KEY` in frontend build context.

### Risk: `pregaoRef` Not in Licenças Tab — Field Placement Mismatch

- **Problem:** `data.pregaoRef` is a top-level protocol field but is edited in the "Conformidade" tab (distinct from "Geral"). The "Geral" tab grid has a `processRef` field but no `pregaoRef` input (line 208 — only 4 of the 5 protocol-level fields appear there). This is an inconsistency that may confuse users during data entry.
- **Files:** `App.tsx` (lines 204–211, 213–237)
- **Impact:** Low severity UX issue, but it means the tab navigation does not follow a clear information hierarchy. Could cause confusion when building the API payload.

---

## Gaps / Unknowns

### `.env` File Status Unknown

- There is no `.env` or `.env.example` committed to the repo. The `.gitignore` does not include `.env` patterns, meaning an `.env` file could accidentally be committed. The `GEMINI_API_KEY` is required at build time but its current location is undocumented.
- **Recommendation:** Add `.env` and `.env.local` to `.gitignore`. Commit a `.env.example` with all required variable names (no values).

### `tsconfig.json` Not Reviewed for Strictness

- TypeScript strict mode settings are unknown. Given the use of `any` throughout the codebase, it is likely that `strict: true` is not enabled or is partially disabled.
- **Files:** `tsconfig.json`
- **Recommendation:** Enable `strict: true` before adding the backend, to catch type issues early.

### No Tests Exist

- There are no test files in the project. No test runner is configured (`package.json` scripts: `dev`, `build`, `preview`, `lint` only).
- **Impact:** Refactoring `App.tsx` during migration (localStorage → API) and adding the backend will have zero regression protection.
- **Recommendation:** Add at minimum unit tests for `services/gemini.ts` backend equivalents and integration tests for the Hono routes before or during the migration.

### `html2pdf.js` Version Pinned on CDN but Not in `package.json`

- Version `0.10.1` is hardcoded in the CDN URL (`index.html` line 12) but the package is not in `package.json`. When migrating to a bundled setup, the installed version must be confirmed to match the API used.

### Vite Proxy for Local Dev Not Configured

- After the backend is added (port 3001), `vite.config.ts` will need a `proxy` config to forward `/api/*` requests to `localhost:3001` in dev mode. This is not mentioned in CLAUDE.md and is easy to overlook.
- **Files:** `vite.config.ts`
- **Recommendation:** Add `server.proxy: { '/api': 'http://localhost:3001' }` as part of the backend setup phase.

### `index.tsx` Entry Point Not Reviewed

- The root entry file `index.tsx` was not examined. It may contain global providers or error boundaries that affect the auth integration.

---

*Concerns audit: 2026-04-22*
