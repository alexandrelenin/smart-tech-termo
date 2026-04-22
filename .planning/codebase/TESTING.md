# Testing Patterns

_Generated: 2026-04-22_

## Summary

There is no test infrastructure in this project. No test framework is installed, no test files exist, and no test scripts are defined in `package.json`. The only quality gate is TypeScript compilation via `tsc --noEmit` (aliased as `npm run lint`).

## Test Framework

**Runner:** None installed.

**Assertion library:** None.

**Test-related scripts in `package.json`:**
```bash
npm run lint   # runs: tsc --noEmit (type-check only, not a test suite)
```

No `test`, `test:watch`, or `coverage` scripts exist.

## Test File Organization

No test files are present in the repository. A search for `*.test.*` and `*.spec.*` returns zero results.

## What Is Tested

Nothing is tested by automated tests.

**Type-checking only:** `tsc --noEmit` validates TypeScript types at build time. This catches type errors in:
- `types.ts` interfaces (`LicenseItem`, `Entity`, `ReportData`)
- Component prop shapes (where typed — `ReportPreview`, `SmartTechLogo`)
- Service function signatures (`services/gemini.ts`)

Type checking does NOT cover components with `any`-typed props (`Input`, `NavItem` in `App.tsx`).

## Coverage Gaps

**All application logic is untested:**

- `handleUpdate` path-based nested state mutation (`App.tsx` line 85) — complex string-path reducer with no tests
- `updateItem` license item field update (`App.tsx` line 99)
- `saveToDatabase` upsert logic — finds by `id`, inserts at front or replaces (`App.tsx` lines 106–117)
- `downloadPDF` + fallback to `window.print()` (`App.tsx` lines 119–138)
- `improveDescription` Gemini API call and error fallback (`services/gemini.ts`)
- `generateSummary` Gemini API call and error fallback (`services/gemini.ts`)
- `ReportPreview` rendering — all document sections render correctly from `ReportData`
- `localStorage` read/parse on mount including malformed JSON path (`App.tsx` lines 78–83)

**High-risk untested areas:**

| Area | File | Risk |
|------|------|------|
| `handleUpdate` dot-path mutation | `App.tsx:85` | Silent data corruption on wrong path string |
| `saveToDatabase` upsert | `App.tsx:106` | Duplicate or lost records in localStorage |
| Gemini error fallback | `services/gemini.ts:13,31` | Silent failures returning stale text |
| `downloadPDF` html2pdf integration | `App.tsx:119` | PDF generation silently falls back to print |

## Testing Patterns

None established. No mocking patterns, no fixture patterns, no async test patterns are in use.

## Recommendations for Adding Tests

When a test framework is introduced, prioritize:

1. **Unit: `handleUpdate`** — pure function behavior; test nested path resolution with `'contratante.name'`, `'credentials.city'`, etc.
2. **Unit: `saveToDatabase`** — test insert (new id), update (existing id), and position (new item goes to front)
3. **Unit: `services/gemini.ts`** — mock `@google/genai`, verify fallback to original text on error
4. **Integration: `ReportPreview`** — render with a fixture `ReportData` and assert key document fields appear

Suggested framework for this stack: **Vitest** (compatible with Vite, no config overhead) + **@testing-library/react** for component rendering.

## Gaps / Unknowns

- No decision has been made on a test framework
- No coverage targets exist
- E2E testing (Playwright, Cypress) is entirely absent
- The `html2pdf` global dependency (`// @ts-ignore` in `App.tsx:131`) is not typed and would require special mocking in any test environment
