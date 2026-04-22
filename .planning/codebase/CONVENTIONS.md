# Coding Conventions

_Generated: 2026-04-22_

## Summary

This is a small, frontend-only React 19 + TypeScript project with no linting toolchain beyond `tsc --noEmit`. All styling is done via Tailwind CSS utility classes applied inline. Conventions are largely consistent across the codebase, but type safety has notable gaps (use of `any` in component props and service signatures).

## Naming Conventions

**Files:**
- React components: PascalCase with `.tsx` extension — `ReportPreview.tsx`, `SmartTechLogo.tsx`
- Services: camelCase with `.ts` extension — `gemini.ts`
- Types: lowercase singular — `types.ts`
- Entry point: lowercase — `index.tsx`, `App.tsx` (App is the exception, following React convention)

**Components:**
- Named as PascalCase matching the file name — `App`, `ReportPreview`, `SmartTechLogo`
- Inline sub-components (defined inside a parent component) also use PascalCase — `NavItem` (inside `App.tsx`, line 140), `Footer` (inside `ReportPreview.tsx`, line 7)

**Functions:**
- Event handlers: `handle` prefix — `handleUpdate`, `handleUpdate`
- Action functions: verb-noun camelCase — `saveToDatabase`, `downloadPDF`, `updateItem`, `generateSummary`, `improveDescription`
- Utility/helper components defined as `const` arrow functions with PascalCase — `Input`, `NavItem`, `Footer`

**Variables:**
- State variables: camelCase noun or noun phrase — `data`, `savedReports`, `showPreview`, `activeTab`, `saveStatus`, `isDownloading`
- Constants: `SCREAMING_SNAKE_CASE` for module-level — `DB_KEY`, `initialData`
- Refs: camelCase with `Ref` suffix — `reportRef`
- Object fields in types: camelCase — `reportNumber`, `processRef`, `techResponsible`

## TypeScript Usage

**Strict mode:** Not enabled. `tsconfig.json` does not set `"strict": true`.

**Component typing:**
- Functional components typed with `React.FC` — `const App: React.FC = () =>`, `const SmartTechLogo: React.FC<{ className?: string; light?: boolean }>`
- Props with known shapes use inline type literals — `React.FC<{ data: ReportData }>`
- Internal sub-components typed with `any` for props — `const NavItem = ({ active, onClick, icon, label }: any)`, `const Input = ({ ... }: any)` (`App.tsx` lines 140, 383)

**Service typing:**
- Return types explicitly annotated on exported functions — `Promise<string>`
- Parameters typed with known interfaces where appropriate, but `generateSummary` uses `any[]` (`services/gemini.ts` line 26)

**Type suppression:**
- `// @ts-ignore` used once in `App.tsx` line 131 to bypass missing type for the `html2pdf` global

**Interface definitions** in `types.ts`:
- `LicenseItem`, `Entity`, `ReportData` — all fields explicitly typed as `string` or nested interface
- No union types, generics, or enums used anywhere

**Path alias:**
- `@/*` maps to project root (`tsconfig.json` + `vite.config.ts`) — used in imports as `'./types'`, `'./components/ReportPreview'` (relative paths used in practice, not the alias)

## Component Patterns

**All components are functional.** No class components.

**Hooks used:**
- `useState` — all state management
- `useEffect` — single use in `App.tsx` for loading localStorage on mount
- `useRef` — for the print/PDF target element

**Sub-component pattern:** Utility components (`Input`, `NavItem`) are defined at the bottom of `App.tsx` as `const` arrow functions, not exported, keeping them co-located with their only consumer.

**Conditional rendering:** Exclusive tab views rendered with `{activeTab === 'X' && (<div>...</div>)}` pattern throughout `App.tsx`.

**Early return pattern:** `App` uses an early return to render the preview mode entirely before the main editor JSX (`App.tsx` line 150).

**Props passing:** Data flows strictly downward — `App` owns all state, passes `data: ReportData` to `ReportPreview` as a single prop.

## Import / Export Patterns

**Import order (observed, not enforced):**
1. React and React hooks — `import React, { useState, useEffect, useRef } from 'react'`
2. Third-party libraries — `@heroicons/react`, `@google/genai`
3. Local types — `import { LicenseItem, ReportData } from './types'`
4. Local components — `import ReportPreview from './components/ReportPreview'`

**Export style:**
- All components use `export default` at the bottom of the file
- Services use named exports — `export const improveDescription`, `export const generateSummary`
- `types.ts` uses named exports for interfaces — `export interface`

**No barrel files** (`index.ts` re-exports) — each module imported directly by path.

**Relative imports** used throughout; the `@/` alias is configured but not actually used in source files.

## Styling

**Tailwind CSS** via utility classes applied directly to JSX elements. No CSS modules, no styled-components, no global CSS files (beyond what Vite injects).

**Color palette in use:**
- Editor UI: dark theme — `bg-[#080808]`, `bg-black`, `border-white/5`, `text-white/40`
- Accent: `red-600`, `red-500`, `blue-600`
- Preview/print: light theme — `bg-white`, `text-slate-800`, `bg-slate-50`

**Arbitrary values** used frequently — `text-[9px]`, `text-[10px]`, `tracking-[0.2em]`, `rounded-[32px]`

## Error Handling

All async functions (`improveDescription`, `generateSummary`, `downloadPDF`) use `try/catch` with a fallback:
- Gemini functions return the original input text on error
- `downloadPDF` falls back to `window.print()` if `html2pdf` throws
- `localStorage` parsing in `useEffect` catches JSON parse errors with `console.error`

No global error boundary is present.

## Comments

Sparse inline comments used to explain non-obvious logic:
- `// @ts-ignore` with no explanation (`App.tsx` line 131)
- `// Fixed item mapping...`, `// Access response.text directly...` in `services/gemini.ts`
- JSX section comments as `{/* Section Name */}` in `ReportPreview.tsx`

No JSDoc annotations anywhere in the codebase.

## Gaps / Unknowns

- No ESLint or Prettier configured — formatting is unenforced and relies on developer discipline
- `any` used for component prop types in `Input` and `NavItem`; this will need typed interfaces when these components are extracted or reused
- The `@/` path alias is set up but unused — imports use relative paths
- No formatting standards are documented or enforced beyond TypeScript compilation
