# WS2-ENCOUNTER-01 · E2-C — Encounter cognition binding

**Status: DESIGN, FOR FOUNDER RULING. No model code. Nothing wired.**
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

## 4 — Standing

⛔ Not authorized: writing any of §3 · E3 surface · keeping · PT-5 · WS2-08B · hierarchy ·
intention authority · Restore · lineage · `living_works.stage` · deployment.

Owed to the founder: a ruling on **§2's central claim** — that the structured-inference seam
is shared *transport and provenance* while DEVELOP's epistemology lives above it in
`render.ts`, and that sharing the former imports none of the latter.

One consequence worth naming before it is ruled on: under `sovereign` or `local_only` the
seam refuses today, so **on a fully sovereign deployment Encounter would not speak at all**
until a local provider can honour a structured contract. That is the honest outcome rather
than a defect — but it is a product fact, not only an infrastructure one, and it belongs in
the ruling rather than in a later surprise.

> The cognition path may perceive. The Encounter screen determines what may be said. The
> writer determines whether anything said becomes part of their continuing relationship with
> the Work.
