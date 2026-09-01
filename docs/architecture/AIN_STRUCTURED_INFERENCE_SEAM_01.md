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

---

# CLOSEOUT — three rulings applied

Applied to `3b098666`. Neither reader migrated; no Writer's Studio file touched;
no paid reading run. Each ruling has a falsifying test and was probed by
reverting it, all reverted.

## 1 · Mode policy — the caller does not choose

```ts
runStructured(request)          // production: one argument, no mode
```

Policy is resolved in `lib/ai/structured/policy.ts` from platform configuration:

```
MAIA_INFERENCE_MODE unset   → primary       (zero behaviour change for today's callers)
primary / sovereign / local_only → passed through
anything else               → invalid_inference_mode · REFUSED, never defaulted
```

**Unset means primary, for structured requests only.** The plain-text seam treats
unset as "skip the sovereign path — zero behaviour change"; for the two
structured callers that exist today the equivalent of zero behaviour change *is*
a pinned Anthropic call with no fallback, because that is exactly what they do
now. So the governance correction lands **only where someone has explicitly asked
for it**, and an explicitly sovereign deployment becomes actually sovereign.

**An invalid mode refuses rather than defaulting** — defaulting a typo would
silently select the most permissive policy and turn a sovereign deployment into a
primary one.

The test seam is `__runStructuredWithPolicyForTest`, named so a production caller
reaching for it is visible in review. `runStructured.length === 1` is asserted.

## 2 · Transport is not semantics

`stream` is **removed** from `StructuredRequest`. In its place, a provider-neutral
execution requirement:

```ts
execution?: { completion: 'ordinary' | 'long-running' }   // omitted means ordinary
```

The Anthropic adapter maps it, and the mapping is its own business:

```
ordinary      → messages.create()
long-running  → messages.stream(...).finalMessage()
```

`maiaReader` is `long-running`; Ask is ordinary (omits the field entirely). Proved:
the requirement never appears in the wire params, and both mechanisms return an
**identical** neutral `StructuredResult` — asserted by comparing two runs of the
same reply body across the two paths.

The distinction matters because the reader does not consume a stream as part of
its cognition; it consumes one completed message. A future provider may honour
the same requirement by long-polling or by simply not having the timeout.

## 3 · Gate evidence discipline — recorded, checker unchanged

`docs/ops/GATE_EVIDENCE_DISCIPLINE.md`:

> New source files must be tracked before a repo-wide gate's result counts as
> evidence about them.

The checker was **not** modified: `git ls-files` is the right corpus, and
scanning untracked files would make the guard depend on working-tree litter. The
defect was in the procedure for producing evidence.

The doc also records the generalisation, which is the part worth keeping: *a gate
you have not seen fail is a gate you have not verified is watching* — the absence
of a probe failure was the finding here, not a passing check.

## Closeout gates — all run with new source files TRACKED

```
lib/ai/structured                43 passed (24 equivalence · 9 mode policy · 10 isolation)
check:no-direct-anthropic        GREEN · approved: 2 · probed RED by delisting
typecheck no-regression          PASS · baseline not re-recorded
modelService · sovereignRouter · claudeClient · types   byte-identical to canonical
changed paths                    lib/ai/structured/** · allowlist · two docs
```

Probes, all reverted: caller allowed to name the mode again → 2 fail; invalid
mode defaulted to primary → 2 fail; `long-running` ignored → 2 fail; adapter
delisted from the allowlist → guard RED naming it.

## Preserved, unchanged by this closeout

Pinned caller model · exact system and messages · exact tool schema and
`tool_choice` · exact max-token limits · missing tool call detectable ·
role-preserving Ask history · `tools` key **absent** for Ask · `stop_reason` and
usage · structured inference non-fallbackable · plain-text stack byte-identical.

---

# FINAL SOVEREIGNTY CLOSE — the second door is gone

Applied to `2f4b3b9b`. Neither reader migrated; no Writer's Studio file touched;
no paid reading run. Every `2f4b3b9b` behaviour is unchanged.

## The defect

`router.ts` exported `__runStructuredWithPolicyForTest(req, { mode, provider })`,
which bypassed `resolveStructuredMode()` and routed on the supplied mode. So the
claim was not yet structurally true — it was *"the caller cannot choose the mode,
unless it imports the function whose name asks it not to."* A name is a
convention; this seam exists to make sovereignty a property.

## The close

`router.ts` now exports exactly two things:

```
LOCAL_STRUCTURED_PROVIDER   a null constant, not a path
runStructured(request)      the only routing entry point
```

`route(req, mode)` is private and takes no provider. Tests reach the provider by
**mocking the adapter module** and the mode by **setting the platform variable** —
neither of which ships as a callable routing path.

## The structural gate, and a false pass it replaced

`modePolicy.test.ts` asserts, with comments stripped first:

- the exported symbol set is exactly `['LOCAL_STRUCTURED_PROVIDER', 'runStructured']`;
- there is no `export {` block and no `export *` re-surfacing a private path;
- no exported signature mentions `InferenceMode`, a `mode` parameter, or a
  provider override;
- `__runStructuredWithPolicyForTest` — and any `ForTest` — is absent from the code;
- `policy.ts` resolves a mode and cannot execute anything (no `execute`, no
  `StructuredProvider`).

**Comments are stripped for a reason found here.** The previous assertion
`expect(src).toContain('__runStructuredWithPolicyForTest')` kept passing *after*
the export was removed, because the new doc comment explains the removal by name.
It was a false pass on prose. Any source-level gate in this seam strips comments
before matching.

**Probed three ways, all reverted:**

```
same named seam reintroduced      → 2 tests fail
DIFFERENTLY named mode-accepting export (runStructuredIn)  → gate fails
private route re-surfaced via `export { route }`           → gate fails
```

The second and third matter: the gate is not name-based, so it cannot be walked
past by choosing a friendlier identifier or a different export form.

## Closeout gates — new source files TRACKED

```
lib/ai/structured                45 passed (4 suites)
check:no-direct-anthropic        GREEN · approved: 2
typecheck no-regression          PASS · baseline not re-recorded
modelService · sovereignRouter · claudeClient · types   byte-identical to canonical
changed paths                    lib/ai/structured/** · allowlist · two docs
```

## Unchanged from `2f4b3b9b`

Unset structured mode → primary · invalid mode → refusal · sovereign/local_only →
unavailable without a local structured provider · caller-pinned model ·
non-fallbackable · `ordinary` vs `long-running` execution requirement · exact
tool and message semantics · plain-text stack untouched.
