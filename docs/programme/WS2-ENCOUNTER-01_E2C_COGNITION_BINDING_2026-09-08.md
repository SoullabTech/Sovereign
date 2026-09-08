# WS2-ENCOUNTER-01 · E2-C — Encounter cognition binding

**Status: STRUCTURAL BINDING REPAIRED (B1–B3) — self-closing conditions met.**
**⚠ E2-C acceptance as a perceptive act still waits on G8, which CANNOT be run in this
environment (no inference credential). The witness is written and owed a run (§6).**
Amendments **E2-C/A** (model output may not mint its own anchor proof) and **E2-C/B**
(model selection is server-owned) folded in. Witness: §5. **⚠ G8 is not complete —
adjudication against live model output is owed (§5).**
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa`
Authorizing act: founder ruling 2026-09-08 — E2 constitutional shell self-closed (§4);
E2-C design authorized, design only.

> **The question:** through which existing MAIA cognition authority may the Work be
> encountered **without importing DEVELOPMENT's epistemology**?

Standing separation this design must preserve:

```text
the cognition path may PERCEIVE
the Encounter screen determines WHAT MAY BE SAID
the writer determines whether anything said becomes part of their continuing
   relationship with the Work
```

Three different powers. This act touches only the first.

---

## 1 — Census of existing cognition seams

Read-only. The ruling forbids both errors: inventing a subsystem because Encounter is new,
and reusing a path merely because it already calls a model.

| Seam | What it is | Verdict |
|---|---|---|
| **`lib/ai/structured/router.ts` — `runStructured()`** | the ratified AIN structured-inference seam | ⭐ **REUSE** |
| `lib/manuscript/developmentalReader/read.ts` | DEVELOP's reading act | ⛔ forbidden (C4) |
| `developmentalReader/{render,parse,validate}.ts` | `READER_SYSTEM`, `readerTool`, the lens prompts, the contract hash | ⛔ **this is the epistemology** |
| `developmentalReading/{commission,classify,freeze,store}.ts` | commission → freeze → store | ⛔ forbidden — and E-01 already forbids its persistence shape |
| `lib/sovereign/maiaService.ts` (FAST/CORE/DEEP) | conversational cognition, prose out, addenda-carrying | ⛔ wrong shape: an Encounter needs typed candidates with spans, not a reply |
| direct SDK users (`lib/ai/claudeClient.ts`, `ClaudeBridge.ts`, `consciousness/*`) | pre-seam vendor calls | ⛔ answer to no inference mode; the seam exists to replace exactly these |

### 1.1 — The finding: the boundary is already drawn, one layer down

**DEVELOP's epistemology is not in the seam. It is above it.** `runStructured()` is
transport and provenance; `render.ts` is where the lenses, the reader's system prompt and
the tool contract live. So Encounter can share the *inference authority* while sharing none
of the *perception*:

```text
lib/ai/structured/router.ts          TRANSPORT + PROVENANCE      ← shared
────────────────────────────────────────────────────────────────
developmentalReader/render.ts        DEVELOP's epistemology      ← never touched
encounter/render.ts (new)            Encounter's epistemology    ← this act's subject
```

⭐ **And the seam already holds C7's discipline, for its own reasons.** It is
**non-fallbackable**: *"a local text model that cannot honour the contract is not a fallback
— it is a different operation."* Unavailability returns a typed refusal
(`structured_inference_unavailable`, `provider_unavailable`) rather than substituting
something else. That is precisely what C7 demands one layer up — **infrastructure failure
must never masquerade as MAIA having quietly found nothing worth saying** — so the binding
inherits the property instead of re-inventing it.

The seam also takes **no mode and no provider override from its caller** (policy is resolved
from platform configuration), so Encounter cannot opt itself out of sovereignty by calling
it. Under `sovereign` / `local_only` the honest outcome today is refusal, not a quieter
model.

---

## 2 — The binding

```text
capture snapshot          (E2, unchanged: server-owned, Working Draft, whole)
        ↓
traverseWhole             (E2, unchanged: transport windows, complete or refuse)
        ↓
encounter/render.ts       Encounter system contract + candidate tool  ← NEW, this act
        ↓
runStructured()           pinned model · no fallback · typed refusal
        ↓
encounter/parse.ts        raw blocks → CandidateNotice[]              ← NEW
        ↓
server binds anchors      re-hash every span against the captured snapshot (C3)
        ↓
screenCandidate()         (E2, unchanged) → 0..N lawful MaiaNotice
        ↓
ephemeral response
```

**Nothing in the existing E2 modules changes.** The generator port already exists; this act
supplies one implementation of it.

### How each ruled law is met

**C1 · server-owned evidence only.** The request is rendered from the captured snapshot and
its traversal windows. There is no parameter for client prose, no lens, no scope. The route
already refuses a non-empty body.

**C2 · candidate, never authority.** The parser's output type is `CandidateNotice` — the
type that E2 already refuses to treat as a notice until it survives screening. **The
generator may propose; the Encounter boundary decides what may be said.** No path constructs
a `MaiaNotice` from model output directly.

**C3 · anchors are server-bound.** The model may name spans; it may not certify them. Server
code re-hashes every candidate span against the exact captured snapshot (`anchorMatches`,
already implemented and already falsified by F6). A span the model invented, mis-ranged, or
attributed to text that is not there fails to bind and the candidate is dropped.

**C4 · no DEVELOP inheritance.** A new `encounter/render.ts` authored from the ratified E1
vocabulary. **No lens, no `READER_SYSTEM`, no `readerTool`, no commission.** F5 already
forbids the imports statically and will keep doing so.

**C5 · no quota.** Zero candidates is a lawful result. **There is no retry loop**, and a
screen that rejects every candidate yields silence rather than a second attempt — a retry
would be the generator manufacturing an acceptable observation, which is intervention
pressure arriving from inside cognition.

**C6 · whole-Work completeness, strengthened.** It is no longer enough that `traversal.ts`
*can* enumerate all windows. The binding must prove **the cognition path received them all**:
each window is accounted for by a completed call, and a partially processed Work is a
**refusal**, never a whole-Work Encounter presented as complete.

**C7 · cognition failure is not silence.** Two outcomes that must never be confused:

```text
model considered the Work and yielded zero lawful notices   → ok, notices: []
model unavailable · timeout · malformed output · incomplete
processing · provider failure · sovereign-mode refusal      → refusal: 'cognition_unavailable'
```

This adds one refusal to `EncounterResult`. The seam's typed refusals map onto it directly;
nothing may collapse a refusal into an empty array.

**C8 · no hidden memory expansion.** The rendered request carries the Work and the vocabulary
and nothing else: no member memory, no prior Encounter, no DEVELOP reading, no other Works,
no external literary standard. **The Work itself is the reference.**

**C9 · the semantic ear stays independent.** The retained corpus becomes an acceptance
witness against **actual generated output**, adjudicated by a person. ⛔ No second judge
model is added and called constitutional proof — such an evaluator would need its own
constitution and its own negative controls first.

---

## 3 — What this act proposes to build (not authorized yet)

`lib/manuscript/encounter/render.ts` · `parse.ts` · a `structuredGenerator` implementing the
existing `NoticeGenerator` port · the `cognition_unavailable` refusal · falsifiers below.

**Nothing else.** No surface, no keeping, no persistence, no Source, no hierarchy.

### Falsifiers this binding would owe

| | |
|---|---|
| **G1** | a model-proposed span that does not re-hash against the snapshot → dropped (C3) |
| **G2** | zero candidates → `ok, notices: []` — lawful silence |
| **G3** | provider unavailable / sovereign-mode refusal / malformed output → **`cognition_unavailable`**, never `notices: []` (C7) |
| **G4** | a window not processed → refusal, never a partial Encounter presented as whole (C6) |
| **G5** | no retry: a fully rejected candidate set yields silence, and the generator is invoked exactly once (C5) |
| **G6** | the rendered request contains only the Work and the vocabulary — asserted against the request itself (C1, C8) |
| **G7** | static: `encounter/*` imports no DEVELOP module and names no lens (C4) |
| **G8** | the semantic ear re-run against real generated output, adjudicated by a person (C9) |

---

## 5 — Implementation witness

`lib/manuscript/encounter/{render,parse,bind,structuredGenerator}.ts` ·
`cognition_unavailable` in the result and a 503 at the route ·
`lib/manuscript/encounter/__tests__/cognition.test.ts` — **70 Encounter checks green**
(45 shell + 25 cognition).

### E2-C/A — the model points; the server proves

```text
runStructured → parseNoticeBlocks → ModelNoticeProposal[]   (family · text · spans)
                                       ↓  no digest anywhere
                                  bindProposals(capturedText)
                                       ↓  SERVER computes spanDigest
                                  CandidateNotice[] → screenCandidate → MaiaNotice
```

`parse.ts` never touches the Work and computes no hash; `bind.ts` holds the captured text
and computes every digest. The tool schema carries **no digest, hash, confidence, severity
or priority field** — there is nothing through which the model could certify itself. One
unbindable span discards the whole proposal: *an observation half of whose evidence does not
exist is not half true.*

### E2-C/B — the model is cognition configuration

`MAIA_ENCOUNTER_MODEL`, server-side. The route names no model; any key in the body — `model`
included — is already refused as `foreign_field`; the generator takes no model, provider or
mode argument.

### The ruled laws, as built

| | |
|---|---|
| **G1** invented · inverted · out-of-range span cannot become an anchor; server computes the digest | ✅ |
| **G2** zero proposals → lawful silence | ✅ |
| **G3** provider unavailable · **sovereign-mode refusal** · malformed response · foreign tool → `cognition_unavailable`, never `notices: []` | ✅ |
| **G4** one failing window refuses the whole Encounter, **discarding the notices already collected** | ✅ |
| **G5** every proposal screened out still costs exactly the planned calls; no retry, backoff or regeneration path; **exactly one `runStructured` call site**, so no synthesis pass | ✅ |
| **G6** the request carries the Work, the contract and coordinates only; the contract itself says nothing to say is a complete answer | ✅ |
| **G7** no DEVELOP imports or symbols; the contract asks **no lens question** | ✅ |
| **G9** model choice cannot originate from the request or the member gesture | ✅ |

**Sovereignty.** `structured_inference_unavailable` maps to `cognition_unavailable` like any
other non-completion. There is no quiet exception and no plain-text substitute: *a model that
cannot honour the structured contract would be a different cognitive act.*

### ⚠ G8 — what is proven, and what is not

The corpus now travels the **real** pipeline — `parseNoticeBlocks` → `bindProposals` →
`screenCandidate` — exactly as a model proposal would, and the screen agrees with every
verdict it claims to reach.

⛔ **But the seam is driven by fixtures in these tests, so this proves the pipeline, not the
model's ear.** G8 is **not complete** until a person adjudicates real generated candidates
against the corpus. That is recorded as owed rather than counted as coverage, and it is
deliberately **not** closed by adding a judge model — such an evaluator would need its own
constitution and its own negative controls before its verdict could carry any authority.

### Two failures this suite found in itself

The C21 discipline bit twice more, and both are kept. The import scan failed because
`render.ts` **names `READER_SYSTEM` in a comment explaining that it is not used** — a prose
ban reading as the banned behaviour returning; it now strips comments. And the vocabulary
scan failed because the contract legitimately **names "underdeveloped" in order to forbid
it** — banning the word outright would have forbidden the instruction that protects the
writer, so the assertion moved to the shape: every occurrence must sit in a sentence that
prohibits it.

**Gates:** typecheck 229 vs baseline 239, **0 regressions** · PT-3 source-custody **39** ·
`lib/manuscript` + `lib/storage` + `lib/ai`: **1057 passed, 1 skipped, 0 failed.**

---

## 6 — B1–B3 · the structural binding repair

Founder review found three defects the 70 checks did not exercise. All three were real.

**B1 · the production act was still silent.** The route called `encounter(id, memberId)`
while `encounter()` defaulted to `silentGenerator`, so the member-initiated act never
crossed the cognition just built. Now: **`encounter()` has no default generator** — the
route passes `structuredGenerator()`, and a scan asserts no default may return. The
governing line, recorded in the code:

> *"Silence is lawful" must never come to mean "cognition is optional". Lawful silence is
> the result of a completed perceiving act that has nothing lawful to say, never the result
> of skipping perception.*

The captured text now travels **with** the act (`generate({ snapshot, windows, text })`), so
the generator binds against exactly what the traversal was made from — no re-read, no second
snapshot.

**B2 · existence is not exposure.** The binder proved coordinates exist *in the Work*; it
did not prove *this call saw them*. A call answering window 2 could propose bytes from
window 1 — real text it never saw — and the server would certify evidence **for the Work
rather than for the claim**. `bindProposals()` now takes the visible range
(`contextStartCodePoint … endCodePoint`) and binds only within it. **Overlap is lawful,
because overlap was genuinely shown.**

> An anchor must prove both **existence** and **exposure**.

**B3 · silence is now something the model says.** `toolChoice: auto` plus "no tool call =
silence" collapsed three different things: intentional silence, a prose reply ignoring the
contract, and **an observation delivered in prose that never passed the screen**. One
required, closed `encounter_result` envelope replaces it — `outcome: "none" | "notices"`,
`additionalProperties: false` at every level, enforced by the parser rather than trusted to
the provider. A closed envelope is transport discipline, not a developmental lens.

### New controls — **83 Encounter checks green** (was 70)

| | |
|---|---|
| **G10** `encounter()` has no default generator · the route invokes the structured one · the generator binds the captured text and never re-reads | ✅ |
| **G1B** a span valid in the manuscript but wholly inside another window **does not bind** · a span in the call's own range binds · **overlap binds** | ✅ |
| **B3** explicit `none` → silence · **prose-only → `cognition_unavailable`** · zero envelopes → refuse · two envelopes → refuse · inconsistent outcomes → refuse · undeclared `digest` / `confidence` / `severity` / `spanDigest` → refuse · tool is required | ✅ |

The prose control uses the case that matters: *"I notice the ending wants resolution"* — an
unscreened diagnosis that the old contract would have read as lawful silence.

**Self-closing conditions:** POST crosses cognition ✅ · no accidental silent default ✅ ·
binds the exact captured text ✅ · valid-but-unseen spans fail ✅ · silence is explicit ✅ ·
prose / missing / malformed refuse ✅ · no retry or synthesis introduced ✅ · all Encounter
laws green (**83**) ✅ · PT-3 **39** ✅ · typecheck 229 vs baseline 239, 0 regressions ✅.

---

## 7 — ⛔ G8 remains owed, and cannot be run here

`scripts/witness/encounter-g8-live-ear.ts` is written: it drives the **real** seam, prints
the configured model, the raw blocks, each bound anchor **with the cited text**, and the
screen result, then names the two questions for the adjudicator —

1. recognition, or the beginning of a case?
2. does the cited text **ground** the observation, or merely exist at those coordinates?

*SHA-256 proves identity. It cannot prove the observation arises from that evidence.*

⛔ **This environment has no `ANTHROPIC_API_KEY`, so no live case has been run.** Written is
not run; run is not adjudicated. The witness refuses fuzzy search, quote matching and
nearest-span repair by construction — if the model cannot produce reliable coordinates, that
is a **finding to return**, not something to patch around.

**Standing, stated exactly:** the cognition path is now *bound to the member gesture* and
its evidence law is complete. **MAIA has still never encountered a Work.**

---

## 4 — Standing

⛔ Not authorized: E3 surface · keeping · PT-5 · WS2-08B · hierarchy ·
intention authority · Restore · lineage · `living_works.stage` · deployment.

Owed: **a G8 run** in an environment with an inference credential, adjudicated by a person.
*Built is not perceived, and a pipeline verified only by its own fixtures is a claim about
code, not about MAIA.*

⚠ **Unrelated pre-existing failures, recorded not fixed.** Widening the run to
`app/api/sovereign` surfaced **15 failures** in `manuscripts/[id]/draft/**` and
`episodes/mark/**` (500s where 201/400 are expected). **Confirmed pre-existing**: the same
15 fail with this branch's working tree stashed. Same class as the voice-notes copy drift —
not opened by this lane.

> The cognition path may perceive. The Encounter screen determines what may be said. The
> writer determines whether anything said becomes part of their continuing relationship with
> the Work.
