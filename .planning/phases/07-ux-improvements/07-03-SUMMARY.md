---
phase: 07-ux-improvements
plan: "03"
subsystem: frontend
tags: [ux, sidebar, novo-termo, historico, accessibility]
dependency_graph:
  requires: []
  provides: [novo-termo-button, historico-carregar-improved]
  affects: [App.tsx]
tech_stack:
  added: []
  patterns: [heroicons-outline, tailwind-inline-classes]
key_files:
  created: []
  modified:
    - App.tsx
decisions:
  - "Novo Termo resets to { ...initialData, id: Date.now().toString() } — consistent with existing pattern for client-side IDs before server save"
  - "ArrowDownTrayIcon chosen over ArrowPathIcon for load-into-editor semantic (download/load vs refresh)"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-23"
  tasks_completed: 2
  files_changed: 1
---

# Phase 7 Plan 03: Novo Termo Button + Histórico Carregar Fix Summary

Botão "Novo Termo" adicionado à sidebar do editor e botão de carregar do Histórico aprimorado com ícone semântico, label de texto e aria-label.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add "Novo Termo" button to sidebar | 265179c | App.tsx |
| 2 | Fix Histórico "carregar" button — ArrowDownTrayIcon + text + aria-label | 1be9411 | App.tsx |

## Changes Made

### Task 1 — Botão "Novo Termo" na sidebar

Inserido imediatamente acima do botão "Salvar no Histórico" na `<aside>` do editor:

- Estilo `bg-red-600 hover:bg-red-500` com `active:scale-95` — mesma linguagem visual dos CTAs primários
- `PlusIcon` (já importado) à esquerda do label
- `onClick` chama `setData({ ...initialData, id: Date.now().toString() })` — reseta o editor para dados iniciais com novo ID único
- Posição correta: `</nav>` → Novo Termo → Salvar no Histórico

### Task 2 — Botão de carregar no Histórico

Substituição do botão icon-only `ArrowPathIcon + p-3`:

- `ArrowPathIcon` trocado por `ArrowDownTrayIcon` — semântica de "carregar no editor" em vez de "atualizar"
- `<span>` com label "Carregar" adicionado ao lado do ícone
- `aria-label="Carregar este termo no editor"` declarado no elemento button
- Padding alterado de `p-3` (icon-only) para `px-3 py-2` com `flex items-center gap-2`
- `setData(report)` no onClick preservado sem alteração
- `ArrowPathIcon` mantido no import — ainda usado em spinners de loading (salvar, download, carregar termos)

## Deviations from Plan

None — plano executado exatamente como escrito.

## Known Stubs

None — sem stubs. Ambas as mudanças são puramente visuais/interativas sobre lógica existente e funcional.

## Threat Flags

None — sem novas superfícies de segurança introduzidas. Mudanças são client-only, sem novos network calls.

## Self-Check: PASSED

- App.tsx: FOUND
- 07-03-SUMMARY.md: FOUND
- Commit 265179c (Task 1): FOUND
- Commit 1be9411 (Task 2): FOUND
