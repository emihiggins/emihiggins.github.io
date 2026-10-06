---
title: Junctra
date: 2026-10-01
status: active
kind: side
summary: One AI session, stitched across models — a conversation moves between a local model and cloud models, even mid-reply.
stack:
  - OpenAI-compatible API
  - Gemma
  - Claude
links:
  - label: demo
    url: https://junctra.ai/#demo
---

Most turns in a chat conversation don't need a frontier model, but moving one
conversation between a local model and a cloud model usually means losing context,
breaking the stream, or paying for the history twice.

Junctra is a proxy that lets a single conversation move between models — a local model
on a Mac and frontier models in the cloud — turn by turn, or even in the middle of a
reply. The history, prompt caches and live stream carry over, so the conversation never
notices the switch.

- **97%** cheaper per session than cloud-only
- **99%** of a long conversation read from cache on the next turn
- **0.8 s** median handoff in the middle of a reply

[Watch the demo →](https://junctra.ai/#demo)
