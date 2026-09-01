# AIN-STRUCTURED-INFERENCE-SEAM-01 — structured inference, returned for adjudication

**Base:** canonical `7ed38723ee3cbc02a10be57006136d21b4fce7d4`.
**Branch:** `claude/structured-inference-seam-01` — a **new lane**, deliberately
not the 02c feature branch, so this infrastructure is never entangled in
Writer's Studio history.

**Neither reader was migrated.** The seam and its evidence are returned first, as
the mandate directs. No Writer's Studio file, Ask storage, manuscript schema or
structure behaviour was touched. No paid reading was run — every provider call in
the tests is a capturing stub.

## What was built — three files

```
lib/ai/structured/types.ts                      provider-neutral vocabulary · no SDK
lib/ai/structured/router.ts                     the ruling · no SDK, not even lazily by static import
lib/ai/structured/anthropicStructuredAdapter.ts the ONLY vendor-facing file
```

Plus one allowlist entry, under **`approved`** — the category the guard reserves
for "SovereignRouter-backed adapters" — **not** `grandfathered`.

## The ruling, implemented

```
primary                → pinned model, executed exactly, no fallback
                         provider failure → REFUSE (provider_unavailable)

sovereign / local_only → structured_inference_unavailable
                         never a quiet call to Anthropic behind the mode
                         never a degraded local text answer
```

`LOCAL_STRUCTURED_PROVIDER` is a named constant currently `null`, so the day a
local structured provider exists that is the single line which changes and the
refusal stops being reachable. No model policy runs on a structured request:
`selectClaudeModel` is unreachable from both new modules, asserted by test.

## Request equivalence — proved against recorded call sites

Neither caller exists on canonical, so their call sites are recorded **verbatim**
in the test file from `b9a84619`, SHA named, and the seam is proved to reproduce
them exactly.

**maiaReader** — 11 assertions: exact key set (`max_tokens · messages · model ·
system · tool_choice · tools`), pinned model, exact max tokens (32 000), exact
system prompt, tool contract verbatim including JSON schema, `tool_choice: {type:
'any'}`, the single user message, **streaming via `messages.stream()` +
`finalMessage()`**, the `tool_use` block reaching the caller's parser intact, a
**missing** tool call staying detectable rather than coerced into a reading, and
usage plus resolved-model provenance.

*Streaming was nearly missed.* The reader does not call `messages.create` — it
streams and consumes the message whole, because a long reading with adaptive
thinking can outrun a non-streaming HTTP timeout. That is part of the request's
meaning, so `stream` is expressed in the neutral request rather than decided by
the adapter.

**askReader** — 5 assertions: exact key set (`max_tokens · messages · model ·
system`) with **no `tools` key present at all** (absent, not `undefined`),
ordered multi-turn roles preserved unflattened, pinned model and max tokens
(1 200), non-streaming `create`, and answer text with resolved-model provenance.

## Proofs

```
lib/ai/structured                31 passed (21 equivalence · 10 isolation)
check:no-direct-anthropic        GREEN · approved: 2 files
typecheck no-regression          PASS · 231 vs baseline 239 · baseline not re-recorded
modelService · sovereignRouter · claudeClient · types   byte-identical to canonical
changed paths                    lib/ai/structured/** + the allowlist only
```

Every gate probed and shown capable of failing, all reverted:

- adapter delisted from the allowlist → guard **RED** naming it;
- router made to fall back on failure and in sovereign mode → **4 tests fail**;
- neutral types made to import the SDK → isolation test fails.

### One correction worth recording

The first run of probe 1 produced **no output**, and the earlier green was green
for the wrong reason: `check-no-direct-anthropic` scans `git ls-files`, so an
**untracked** file is invisible to it. Until the new files were staged the guard
had never actually seen the adapter. Re-run with them tracked, the guard reports
`approved: 2` and goes red on delisting.

This is a real property of the guard worth knowing beyond this lane: **a new
direct import is unguarded until it is tracked**, so a lane that runs the check
before `git add` can believe it passed something it never ran.

## For adjudication before migration

1. **The ruling as implemented** — `primary` executes and refuses; `sovereign` /
   `local_only` refuse outright rather than reaching past the mode. This is a
   deliberate governance *correction*: the current direct imports answer to no
   inference mode at all, so migrating the readers will make them refusable in
   sovereign mode where today they would simply call Anthropic. **That is a
   behaviour change at the policy layer, intended, and it is the thing to
   confirm.**
2. **Where mode comes from.** `modelService` reads `MAIA_INFERENCE_MODE` and
   skips the sovereign path entirely when unset. This seam takes `mode` as an
   argument and has no default. Whether structured callers should read the same
   env var, or be given a mode by their caller, is unresolved and deliberately
   not decided here.
3. **`stream` in a neutral vocabulary.** Justified above as request meaning, not
   transport — worth confirming, since a future provider may not stream.

## Then, and only then

```
adjudicate seam → converge into 02c → migrate maiaReader (prove equivalence)
→ migrate askReader (prove equivalence) → check:no-direct-anthropic GREEN there
→ apply migrations → FIRST real persisted Ask conversation
```
