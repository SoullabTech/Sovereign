# AIN Delegation — Proving Case Outcome (`proving-case-add-fn`)

**Date:** 2026-08-09 · **Unit:** MVJ Non-Claude Closed-Loop Proof, Units 1–4 ·
**Referenced by:** `docs/ops/AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md` §8 (this is that promised record).

## Headline

**CLOSED-LOOP PROOF: NOT YET PROVEN.**

Every stage of the loop except the worker step is now built and independently proven.
The worker step — a non-Claude model successfully performing the bounded implementation —
failed twice, for two different worker-side reasons, on the same trivial task. Per the
authorizing directive, that is the cap: two genuine attempts, then stop and report, no
third attempt, no silent switch to another model.

```text
packet → isolated worktree → Builder WRITE ownership → [WORKER: FAILED ×2] → verification → persist → release
                                                              ▲
                                                    the loop breaks here
```

## Unit 1 — local-lane compatibility

**Root cause (reproduced, not assumed):** this Claude Code build (`2.1.226`) does not
recognize `maia-coder` as a known model id, so it falls back to assuming a 200k context
window and errors out — *before Ollama is ever contacted*. Confirmed independently:
a direct `POST /api/generate` to Ollama with `model: maia-coder` returned normally
(`"OK"`). **The model and Ollama were never the problem; the harness's model-recognition
was.**

**Fix:** `~/bin/maia-code` now exports `CLAUDE_CODE_MAX_CONTEXT_TOKENS=65536` before
exec'ing `claude`. Same mechanism `kimi-cc` already uses for its models — not a new
pattern. Value matches the Modelfile's actual configured `num_ctx` (`ollama show
maia-coder --modelfile` → `PARAMETER num_ctx 65536`), not the base model's theoretical
262144-token maximum, which Ollama will not serve regardless of what is claimed.

**Proof:** `maia-code -p "reply with exactly the word OK and nothing else"` → `OK`, exit 0,
in an isolated throwaway repo. Scope: the fix lives inside `maia-code`'s own subshell only
— plain `claude` (Anthropic) carries zero `ANTHROPIC_*` overrides, confirmed by direct env
inspection immediately after.

## Unit 2 — the existing non-Claude proving case

Packet used unmodified: `~/.claude/ain-delegation/packets/proving-case-add-fn.json`
(`add(a,b)`, two files, `node ... test.js` verification, no production contact).

**A pre-existing complication, resolved honestly, not glossed over.** The worktree
already contained files matching the acceptance criteria from an earlier, unattributed
attempt. Their provenance could not be established (the only log for that attempt was a
single line, `"maia-coder" is not a model this version of Claude Code recognizes...
Execution error"` — inconsistent with the files having been produced by a completed
delegate run). Per the discipline this whole program exists to enforce — a result is not
evidence unless the tested artifact is identifiable — those files were cleared
(`git clean -fd`, scoped exactly to the packet's `allowed_files` directory) before any
attempt counted here.

### Attempt A — worker refusal

Local worker ran, correctly restated the exact required file contents in prose, then
stopped:

> *"I understand that I cannot use the Bash tool due to permission restrictions... you'll
> need to create these files manually."*

No permission restriction of that kind exists in this harness — `maia-code` inherits the
full tool surface unmodified. The model reasoned correctly about the task and declined to
call the Write tool. **Classification: worker failure** (tool-calling), not
infrastructure, not scope, not harness.

### A genuine infrastructure defect found and fixed en route

Independent of the worker's behavior, `ain-delegate.sh`'s result-computation used
`head -n -1` — a GNU coreutils extension. macOS/BSD `head` rejects it outright
(`illegal line count -- -1`), which fed garbage into the final `jq --argjson`
construction and **silently prevented any local-lane result from ever being persisted on
this machine, for any worker outcome, ever** — this is very likely why `results/` has
been empty since the delegation control plane was built earlier the same day. Fixed:
`git diff --name-only` replaces the fragile `--stat | head -n -1 | awk` chain. No
stat-line parsing left to break. Verified against a fresh throwaway repo before reuse.

### Attempt B — autocompact thrashing

With the persistence bug fixed, ran again cleanly. This time the worker did not refuse —
it hit a different failure:

> *"Autocompact is thrashing: the context refilled to the limit within 3 turns of the
> previous compact, 3 times in a row..."*

380 seconds elapsed; zero files written. **Classification: worker failure** (a different
failure mode from Attempt A — not a repeat, i.e. these are two *materially different*
attempts, not thrashing on one approach).

**Cap reached.** Two genuine attempts, two distinct worker-side failures, zero successful
code production. Per the directive: stop, do not retry a third time, do not silently
substitute Kimi, report honestly.

### Unresolved

Whether `maia-coder`'s tool-calling defect is the Modelfile's `TEMPLATE {{ .Prompt }}`
raw-passthrough issue already suspected in `LOCAL_MODEL_ROUTING_INVENTORY_2026-08-09.md`
§3, or the autocompact/context-thrashing behavior, or both, was **not** diagnosed further
— that diagnosis is out of this unit's authorized scope (*"do not redesign `maia-coder`"*).
What is now certain, where it was previously only suspected: **local-lane tool-calling is
unreliable for even a two-file mechanical task**, evidenced twice, not once.

## Unit 3 — worktree + Builder ownership convergence

Two previously separate mechanisms — `ain-worktree-claim.sh` (physical worktree) and
`session.mjs` (Builder WRITE ownership) — are now one path. `_run_lane` registers
ownership immediately after the physical worktree is confirmed and before any worker
runs; a refusal here (contention or a genuine collision) stops delegation before a worker
is ever invoked.

**A real defect found while wiring this, not by inspection:** the session id returned by
`session.mjs open` was captured via `2>&1`, merging its diagnostic stderr lines into the
same variable — so `builder_session_id` was being written as a multi-line diagnostic blob
instead of a bare id, which made `session.mjs close` unable to resolve it later (`no such
session: [builder/session] opened s-...`). Fixed: the id is the last line of the merged
output (verified against `cmdOpen`'s own print order — diagnostics via `console.error`,
then the bare id via `console.log`, always last).

**Proof:** `delegate-workspace-convergence-proof.mjs`, 20/20 — exactly one physical
worktree + exactly one Builder claim converge from a single delegate run; re-running the
same unit reuses the claim rather than duplicating it; a rival unit targeting the same
worktree is refused by name, not by crash; release clears both halves together, and only
after release can a new unit claim the same worktree. A deterministic stub worker was
used here — this proof is about workspace governance, not about worker output, and using
a real (slow, currently-failing) worker would not have changed what it's proving.

## Unit 4 — structured deterministic verification

`scripts/builder/run-check.mjs` — one PASS, one synthetic controlled FAIL, structurally
distinguished by `exit_code`/`status` alone; a check with alarming-looking stdout that
exits 0 still reads PASS, and one with reassuring-looking stdout that exits nonzero still
reads FAIL — nothing here interprets text to decide. Output is capped (4000 chars,
truncation stated explicitly) so verification cannot re-flood the context it exists to
protect. Sanity-checked against the real `npm run typecheck` gate: PASS, 15.5s.

**Proof:** `run-check-proof.mjs`, 15/15.

## What this proves, precisely

| Stage | Status |
|---|---|
| Compact work packet exists, unmodified, reused | ✅ |
| Isolated worktree created/reclaimed | ✅ |
| Builder WRITE ownership registered, refusable, releasable | ✅ (20/20) |
| **Non-Claude worker performs the bounded implementation** | **❌ 0/2** |
| Independent deterministic verification (structural, not LLM-read) | ✅ (15/15) |
| Result persisted to the existing contract, non-empty for the first time | ✅ (mechanism proven; content reflects a failed run, honestly) |
| Workspace/claim release | ✅ (20/20) |

**184 (Horizon III) + 15 (run-check) + 20 (convergence) = 219 proof assertions, 0 failed,
0 regressions.** All of it verifies the *scaffolding*. The scaffolding is not the proof
the directive asked for — the proof is a worker completing real work inside it, and that
did not happen.

## What is NOT claimed

Minimum Viable JARVIS execution is **not** claimed. The directive is explicit that this
statement must not be softened if unsupported, and it is not supported: the one thing the
whole apparatus exists to enable — a non-Claude worker independently producing verified
code — has not yet occurred.

## Recommended next step (not taken here — requires separate authorization)

Retry `proving-case-add-fn` through the Kimi lane (`ain-delegate.sh kimi
proving-case-add-fn`), which has independent, prior, verified tool-calling competence
(its escalation contract has already been observed firing correctly on a real boundary).
This is a worker-selection decision the directive reserves, not one this unit makes
unilaterally.
