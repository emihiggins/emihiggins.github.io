---
title: claude-code-token-optimizer
date: 2026-08-06
status: shipped
summary: VS Code extension that finds where your Claude Code token spend goes.
stack:
  - TypeScript
  - VS Code Extension API
  - esbuild
  - Chart.js
links:
  - label: marketplace
    url: https://marketplace.visualstudio.com/items?itemName=side-quests.claude-code-token-optimizer
  - label: source
    url: https://github.com/emihiggins/ai-insights-ext
---

A session can spend real money without any obvious moment where a read was wasteful or
a search should have been scoped. Claude Code writes every turn to a local JSONL
transcript including full usage metadata — input tokens, output tokens, cache
reads/writes, tool calls, compactions — but surfaces none of it.

This extension reads those transcripts locally and answers two questions: where is the
money going, and what specifically should I do differently?

## Ten detectors

Each rule is one file, each carries its own token and cost estimate:

1. Context compactions
2. Context-pressure warnings before an auto-compaction
3. Broad or unscoped `grep` / `rg` / `find` searches
4. Uncapped `cat` / `git diff` / `git log` output dumps
5. Oversized or repeated reads of the same file
6. Reading a file back immediately after writing it
7. Redundant read-only inspection commands
8. Failed or interrupted tool calls whose output was billed and discarded
9. Low cache reuse — the signature of a volatile prompt prefix
10. High-input, low-output round trips

Findings roll up into recoverable-dollar totals by category, split into one-off fixes
versus habits, alongside a daily efficiency series (cache-reuse percentage, cost per
day, compactions) that is persisted so history survives transcript pruning.

## Decisions worth noting

The data layer has no `vscode` dependency — parser, model, pricing, rules, and
aggregation are pure TypeScript tested against fixtures and a temporary home directory
tree. That's what makes the rules engine testable at all.

Cost estimates are honest. Claude Code's local stats report `costUSD: 0`, so the
extension ships an editable rate table with cache reads at 0.1x and cache writes at
1.25–2x. The README says plainly that on an already-efficient setup recoverable waste
can legitimately be small. I didn't inflate the numbers.

Regression alerts require at least three active sessions and 20k tokens per comparison
window, so a quiet week doesn't trigger a false alarm.

Fully local. No telemetry, no external calls, zero runtime dependencies, 38 unit tests.
