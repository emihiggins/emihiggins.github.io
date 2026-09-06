---
title: agent-recap
date: 2026-09-06
status: active
kind: oss
summary: Reads the session state Claude Code, Cursor and Copilot already keep on disk and writes one page telling you where you left off.
stack:
  - Python
  - Ollama
  - SQLite
  - sqlite-vec
  - launchd
links:
  - label: source
    url: https://github.com/emihiggins/agents-recap
---

Six AI sessions going across two terminals and a Cursor window, and no way to tell
which one still has work in it. The information exists — Claude Code, Cursor and VS
Code Copilot Chat all keep session state on disk — but none of them show it to you,
and certainly not across tools.

`agent-recap` reads all three read-only, works out where each project actually stands,
and writes one HTML page. It leads with what's blocking you: an agent parked on a
permission prompt for 48 minutes gets a banner, because that's the single most useful
thing the tool can tell you.

Everything runs locally against Ollama — `qwen3:8b` for summaries, `nomic-embed-text`
for embeddings. No API keys, no network calls.

The page: a waiting-on-you banner, then one card per project with its recap, a suggested
next step, git state and any unfinished work. Sample data.

![An agent-recap page showing a waiting-on-you banner above five project cards](/images/agent-recap/recap.png)

## Reading other tools' data

Claude Code lives in `~/.claude`; Cursor keeps composer sessions in its global
`state.vscdb`; Copilot Chat is in VS Code's `workspaceStorage`, in two different
formats. Each project directory contributes its git state.

Cursor and VS Code are usually running while this executes, so every connection is
opened with `mode=ro`, and the test suite asserts that writes and DDL are rejected
against the live databases. None of this storage is documented or stable, so each
source has a schema probe that reports through `agent-recap doctor` — drift should look
like a broken reader, not a quiet "no sessions found".

## Reported work versus inferred work

The card separates work an agent *reported* from work the tool *inferred*, and never
blends them. Cursor's todo list and Copilot's `manage_todo_list` are authoritative.

Claude Code has neither — its task tools go unused in practice and its plan documents
have no checkboxes. So plan steps get extracted from the `Build order`, `Next steps`
and `Phase N` sections of `~/.claude/plans/<slug>.md` and judged against files on disk:
every file the step names exists means done, a missing file means outstanding, and a
step naming no files is outstanding and marked `unverified`.

That last case is why this isn't a model call. With file evidence an 8B model adds
nothing over the check itself; without it, the model was marking plainly-unstarted work
as finished. The whole point is not forgetting things, so unknown resolves to *shown*.
Only steps confirmed unfinished are allowed to influence the recap text — feeding
unverified steps to the summarizer made it narrate completed work as still in progress.

## Memory

Sessions are chunked into SQLite + sqlite-vec so you can ask about them later:
`agent-recap ask "what was I doing with the rates API?"`, answered with citations.

Raw transcripts are deliberately not embedded — Claude Code alone is ~200 MB of mostly
tool output. Each session yields a handful of chunks instead: a summary, the last
message from each side, open todos, and any plan document. The plan documents turn out
to be the most valuable material, since they hold the decisions and the rationale.

Expiry is tiered rather than age-based, because a project you paused two months ago may
be exactly the one with unfinished work. Pinned and has-an-open-todo never expire; a
project whose directory is gone drops immediately however recent it is.

Excerpts are scrubbed before storage, before the model, and before rendering — API
keys, tokens, JWTs, private key blocks, `KEY=value` assignments. Field names survive so
the recap still reads sensibly. This matters more for the store than the page, since the
store outlives the session that produced it.

## Speed

Summarizing is the slow part, so each session is fingerprinted on its content and
unchanged sessions reuse their cached recap and skip re-embedding. Cold run over 36
sessions is ~50s; a warm run with nothing changed makes no model calls at all;
`--no-llm` does 67 sessions over 90 days in ~3.5s.

Sessions are grouped by project, not by session, because "where did I leave off on X"
is a question about a project. Here that turned 38 sessions into 18 projects.

76 tests. macOS only — every storage path it reads is macOS-specific.
