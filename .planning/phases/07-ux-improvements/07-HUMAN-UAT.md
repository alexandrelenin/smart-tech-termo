---
status: complete
phase: 07-ux-improvements
source: [07-VERIFICATION.md]
started: 2026-04-23
updated: 2026-05-07
---

## Current Test

[testing complete]

## Tests

### 1. Contraste da tela de login
expected: Tela de login renderiza com fundo escuro #080808, card #111111, botão vermelho, sem elementos brancos ou claros fora do botão Google
result: pass

### 2. Logo Google SVG colorido
expected: Botão Google exibe o "G" com 4 cores (azul, verde, amarelo, vermelho) à esquerda do texto "Entrar com Google"
result: pass

### 3a. Botão Novo Termo (fix d47a956)
expected: Clicar em "Novo Termo" reseta o editor para campos em branco
result: issue
reported: "clico em novo e os dados voltam para o original (sample data Prefeitura de Ipanema). em nenhum caso vejo os dados em branco"
severity: major
root_cause: "initialData (App.tsx:16-65) contém sample data hardcoded; setData({...initialData}) restaurava os defaults em vez de limpar."
fix: "App.tsx — adicionado constante emptyData com strings vazias; botão Novo Termo agora usa setData({...emptyData, id: Date.now().toString()})"

### 3b. Botão Novo Termo (re-test após fix emptyData)
expected: Clicar em "Novo Termo" limpa TODOS os campos do editor (formulário em branco) e navega para aba Protocolo
result: pass
note: "Campo 'Data de Emissão' permanece preenchido com a data atual — comportamento intencional (default UX)."

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Novo Termo deve apresentar formulário em branco"
  status: fixed
  reason: "initialData continha sample data; criado emptyData separado e usado no botão Novo Termo"
  severity: major
  test: 3
  artifacts: ["App.tsx"]
  missing: []
