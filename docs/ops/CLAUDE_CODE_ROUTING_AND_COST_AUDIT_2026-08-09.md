# Claude Code Routing & Cost Audit — 2026-08-09

**Scope:** Audit only. No configuration was changed. Evidence is the deployed state on the Mac Studio
(`~/.zshrc`, `~/.claude/**`, repo `lib/ai/*`), not design documents.

**Question asked:** Is Kimi K4 actually absorbing Claude Code work, and if not, where does the money go?

---

## Verdict

**Claude Code does not pass through any AIN/MAIA model router. It calls the Anthropic API directly.
Kimi has never handled a single Claude Code request — not as fallback, not as worker.**

Hypothesis 3 from the framing ("Claude Code itself is bypassing your AIN model router") is confirmed.
Hypotheses 1, 2 and 4 are moot: there is no router in the path to select from.

Secondary finding, and the more important one for cost: **86% of spend is context re-ingestion
(cache read + cache write), not generation.** A model swap would not have fixed this.

---

## Evidence 1 — the Claude Code path

`~/.zshrc` lines 3–12 explicitly *unset* every routing override at every shell start:

```
unset ANTHROPIC_BASE_URL
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_MODEL
unset ANTHROPIC_DEFAULT_{SONNET,OPUS,HAIKU}_MODEL
unset CLAUDE_CODE_SUBAGENT_MODEL
```

Line 70 then exports a live `ANTHROPIC_API_KEY=sk-ant-…`. Every local-routing line is commented out:

- L68–69 `ANTHROPIC_BASE_URL=http://localhost:11434` / `AUTH_TOKEN=ollama` — **commented**
- L72–76 `maia-coder` / `deepseek-r1:8b` model overrides — **commented**

Confirmed live: `env | grep ANTHROPIC` shows no `BASE_URL` and no `AUTH_TOKEN`.
Neither `~/.claude/settings.json` nor the project settings define an `env` block or model override.

```
Claude Code request → api.anthropic.com     (100% of requests, always)
```

There is no branch. The `maia-cloud` guard function (L87–102) and `maia-cloud-now` alias (L105) blank
`BASE_URL`/`AUTH_TOKEN` before launching `claude` — but since `.zshrc` already unset them, those
wrappers are **no-ops**. They preserve a decision ritual that stopped having a mechanism behind it.

Ollama *is* running (`127.0.0.1:11434`) and the `kimi` CLI *is* installed
(`~/.nvm/versions/node/v22.22.3/bin/kimi`) — but nothing routes to either. They are parked capacity.
`kimi-test` (L109) is a separate CLI you invoke by hand; it shares no session, context or config with
Claude Code.

## Evidence 2 — what Kimi is actually wired to

Kimi in this repo is a **MAIA product feature**, not a coding model:

| File | Role |
|---|---|
| `lib/ai/kimiClient.ts` | `api.moonshot.ai/v1`, model **`kimi-k2.5`** (not K4), gated on `MOONSHOT_API_KEY` |
| `lib/ai/modelService.ts` | health check + availability |
| `lib/library/LibraryService.ts` | library distillation |
| `app/api/library/ask-jeeves/route.ts` | "Ask Jeeves" member-facing library research |
| `app/admin/platform-overview/page.tsx` | labels it *"Moonshot/Kimi — library distillation, backstage only"* |

The repo's own admin copy says **backstage only**. That is accurate. Kimi serves MAIA runtime
inference for library synthesis; it has no relationship to the Claude Code development loop.

## Evidence 3 — where the money went

Parsed 665 Claude Code transcripts (`~/.claude/projects/**/*.jsonl`), last 30 days.

| model | reqs | in | output | cache read | cache write |
|---|---|---|---|---|---|
| claude-opus-5 | 35,541 | 0.26M | 35.9M | **8,935M** | 396M |
| claude-fable-5 | 34,197 | 4.84M | 40.1M | **8,053M** | 351M |
| claude-opus-4-8 | 24,059 | 1.88M | 44.4M | **6,507M** | 344M |
| claude-sonnet-5 | 3,477 | 0.19M | 2.3M | 1,378M | 34M |
| claude-haiku-4-5 | 39 | ~0 | 0.01M | 1M | 0.2M |

**Non-Anthropic model IDs observed: none.** 97,313 requests, all `claude-*`.

Cost attribution (API list price):

| driver | tokens | share of cost |
|---|---|---|
| cache **read** | 24,874 M | **54.1%** |
| cache **write** | 1,125 M | **31.9%** |
| output | 123 M | 13.9% |
| fresh input | 7 M | 0.1% |

⚠️ **Estimate caveat:** list-price arithmetic totals ~$48k for 30 days, against a reported ~$2,000
bill. The gap means these requests were served under a subscription plan, not metered API. **Treat
the dollar figures as relative attribution only, not as a bill.** The token counts and the
proportions are real; the absolute dollars are not.

Concentration: `-Users-soullab-MAIA-SOVEREIGN` is 71,105 of 97,313 requests and **20,056 M cache-read
tokens** — the overwhelming majority. Worktrees and subagents are rounding errors by comparison
(subagents: 455 M cache read).

Peak days: 2026-08-03, 08-02, 07-22, 07-23, 07-27 — each roughly 2–3× a median day.

---

## What this means

1. **The savings never had a path to materialize.** Kimi was never eligible for a Claude Code request,
   so no reason-code analysis is needed — the answer is structural, not selective.

2. **Work allocation would not have moved the needle much either.** The proposed split (Kimi does
   labor, Claude does judgment) targets *output* tokens — 13.9% of cost. The 86% is the cost of
   *carrying* a large session context turn after turn. Handing repo exploration to a cheaper model
   only helps if it also stops that context from being re-read on every subsequent Claude turn.

3. **The real lever is session shape, not model choice.** ~24.9 B cache-read tokens across 97 k
   requests ≈ **256 k tokens re-read per request on average**. That is near-full-window sessions,
   sustained. The drivers: very long single sessions, `CLAUDE.md` + `MEMORY.md` + orientation docs
   loaded every turn, and large tool results entering the window.

4. **`maia-cloud`'s "thinking or typing?" prompt is now theater.** It asks the right question and then
   routes to the cloud either way. Whatever gets decided next, that gap should close — a guard that
   cannot enforce is worse than no guard, because it reads as a control.

---

## What was NOT established

- **Why** any given request was expensive at the turn level — this audit attributes cost by model and
  by day, not by individual session or task. Per-session attribution is possible from the same
  transcripts and has not been done.
- Whether the ~$2,000 figure covers this same 30-day window or a calendar month.
- Whether `MOONSHOT_API_KEY` is currently funded (the route has an explicit "account requires funding"
  error path, suggesting it has run dry before).
- The `kimi-k2.5` vs "K4" naming discrepancy — the deployed client pins `kimi-k2.5`.

## Recommended next step (not taken)

Per-session cost attribution over the same transcripts: rank sessions by cache-read tokens, and
identify what those sessions had in common (duration, files touched, subagent count, context reloads).
That names the actual expensive behavior, which model choice cannot.
