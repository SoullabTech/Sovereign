# DEEP-STAGE-1-PARTICIPATION-CENSUS

```text
LANE      DEEP-STAGE-1-PARTICIPATION-CENSUS
BASE      clean-main-no-secrets @ e854ecc49
MODE      READ ONLY · no code changed · no Cut 1B authorization
OPENED    2026-09-05 · founder brief
```

## 0. Why this lane exists

**Prerequisite to scoping Cut 1B.** Governing question:

> Does DEEP stage 1 have a real structured participation seam?

Allowed findings: `EXISTING SEAM` · `NO EXISTING SEAM` · `AMBIGUOUS`.

Invariant carried from the brief: **do not fabricate a prompt seam merely to make DEEP
symmetrical with FAST and CORE.** Then STOP and adjudicate.

## 1. Finding

```text
EXISTING SEAM
```

And more of one than the programme believed. DEEP stage 1 has a typed input contract, a
structured decision point that already consumes it, and three prompt builders that already
receive it — and largely ignore it.

## 2. The correction this census forces

**The whole-organism census was wrong about DEEP stage 1, and I wrote the error.**

`MAIA_WHOLE_ORGANISM_CENSUS_01.md` §12 states the local consciousness draft has *"no
addenda by construction"* because it *"weaves templates, it does not read a system prompt."*
That claim came from a pre-existing source comment at `lib/sovereign/maiaService.ts:2337`,
quoted as evidence rather than traced. It is not accurate.

Worse, Cut 1A then **propagated it into canonical code**. `maiaService.ts:2358`, introduced
by `18330ba54`:

> DEEP stage 1 (the local consciousness draft) has NO prompt seam by construction — it
> weaves templates rather than reading a system prompt

That comment is wrong. Stage 1 builds prompts — three of them, one per phase.

Nothing about Cut 1A's *behaviour* is affected: the shadow emit, the zero-diff claim against
`consultationRecallAddenda`, and `applied: false` are all still correct. What is wrong is the
comment's stated *reason*, and the architectural belief the programme built on top of it —
including the roadmap's assumption that Cut 1B would need a new mechanism for DEEP.

This is the second time in this programme that quoting a source comment instead of tracing
produced a false architectural claim. The first was caught inside the census; this one
reached canonical code and a founder roadmap.

## 3. The seam, as it actually exists

### 3.1 A typed input contract

`ConsciousnessContext` (`lib/consciousness/consciousness-layer-wrapper.ts:23`):

```ts
sessionId · userId · conversationHistory
currentDepth: ConsciousnessDepth
elementalResonance: ElementalResonance[]
observerLevel: number            // 1-7
temporalWindow: 'present' | 'past_integration' | 'future_sensing' | 'eternal'
metaAwareness: boolean
```

This is a structured participation channel, not a prompt string. It already exists, is
already constructed by `maiaService` (`:2230`), and **already carries elemental material**.

### 3.2 A structured decision point that consumes it

`processConsciousnessEvolution` (`:527`) selects the phase:

```ts
if (context.metaAwareness || metaTriggers.length > 0)     → processWithMetaConsciousness
if (hasTemporalPatterns || context.observerLevel >= 4)    → processWithTemporalWindows
otherwise                                                  → processWithRecursiveObserver
```

**This is a discernment decision made from structured context, not from text.** It is the
closest thing in the codebase to what Cut 1B is trying to build — and it already runs.

### 3.3 Three prompt builders, already receiving the context

| Builder | Takes `context` | Reads `context.` |
|---|---|---|
| `buildObserverPrompt` | yes | **0 times** |
| `buildTemporalPrompt` | yes | 1 |
| `buildTemporalSynthesisPrompt` | no | 0 |
| `buildMetaConsciousnessPrompt` | yes | 1 |

`buildObserverPrompt` accepts the full structured context and never reads it; its template
interpolates only `input` and `level`. **The seam is not merely present — it is present and
unused.**

### 3.4 Elemental material already reaches stage 1, and is discarded

`elementalResonance` enters via context and leaves unchanged as `elementalActivations` in the
response (`:146`). It is a pass-through. Stage 1 receives elemental input and does nothing
with it — the same pattern the whole-organism census found four times elsewhere.

## 4. Consequence for Cut 1B

**Scope decreases.** Cut 1B does not require a new cognition mechanism for DEEP. Two
candidate routes exist, both real, neither fabricated:

**Route A — structured, via `ConsciousnessContext`.** Add orientation as a typed field. It
could then legitimately inform *phase selection* at `:527` — a discernment decision, not a
text append. This is the route that matches what Cut 1B actually wants, and it is the only
route in the whole organism where orientation could change *what kind of cognition runs*
rather than what text the model sees.

**Route B — textual, via the builders that already take context.** Have
`buildObserverPrompt` read the context it already accepts. Closer to the FAST/CORE pattern,
smaller, and weaker: it makes orientation another string rather than a participant.

Not adjudicated here. Recorded so the decision is made on evidence.

## 5. The invariant, checked

> do not fabricate a prompt seam merely to make DEEP symmetrical with FAST and CORE

**Satisfied without effort.** No fabrication is required or tempting, because a real seam
exists. The risk the invariant was written against has not materialised — but the reason it
has not is the opposite of what was assumed: not that DEEP must stay asymmetric, but that
DEEP was never as asymmetric as the record claimed.

## 6. Evidence class

```text
SOURCE ONLY at e854ecc49 · no runtime probe · no production access
```

Every claim above is from the call graph and the type declarations. Whether these phases
fire in the ratios the code implies is unwitnessed.

## 7. Recommended follow-up, not taken

`maiaService.ts:2337` and `:2358` both assert the false claim, and `:2358` was introduced by
Cut 1A. Correcting them is a comment-only change to canonical code and is **not made here** —
this lane is read-only. It should ride with whichever cut next touches that file, per the
standing rule that obligations travel with the work that discharges them.

## 8. State

```text
FINDING              EXISTING SEAM
CUT 1B SCOPE         does NOT require new DEEP mechanism
ROUTE                A (structured) or B (textual) — NOT adjudicated
ELEMENTAL CENSUS     still parked — this result does not open it
CUT 1B               CLOSED
STOP + ADJUDICATE
```
