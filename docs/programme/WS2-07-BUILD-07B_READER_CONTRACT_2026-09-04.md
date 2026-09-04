# WS2-07 · BUILD-07B — Developmental Reader Contract and Falsifiers

> **Spec only. Nothing here is implemented.** This document records the founder's adjudication of
> the seven open rulings (A1–A7) raised by the reader boundary census, fixes the BUILD-07B
> contract those rulings produce, and derives the falsifiers a BUILD-07B implementation would be
> witnessed against. It authorizes **no reader, no model call, no prompt or tool contract, no
> route, no surface, no persistence, no TypeScript file, and no BUILD-07C+**. Whether BUILD-07B
> implementation opens is a separate ruling, taken on this exact document.

```text
LANE               JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
UNIT               BUILD-07B DEVELOPMENTAL READER
STATE              BUILD-07B OPEN · CONTRACT + FALSIFIERS FILED · IMPLEMENTATION UNAUTHORIZED
ADJUDICATED        founder, 2026-09-04 — A1–A7 (§1), ruling text recorded in substance
CENSUS             docs/programme/WS2-07-BUILD-07B_READER_BOUNDARY_CENSUS_2026-09-04.md
                   (canonical @ 543f43708, PR #1186)
GOVERNED BY        WS2-07-UNDERSTAND_DEVELOPMENTAL_READING_SEMANTICS.md (§2, §3, §4, §5)
                   WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md (INV-0 … INV-25)
                   BUILD-07A substrate on canonical: lib/manuscript/development/*
AUTHORIZES         nothing beyond this record
NEXT               founder ruling on whether BUILD-07B implementation opens, taken on this
                   contract and this falsifier set exactly
```

**The unit's constitutional job, in one sentence (founder):** *MAIA may read frozen evidence, say
what she noticed, and state exactly what that noticing does not establish. She may not yet turn
that noticing into a developmental observation about the Work.*

---

## 1 · The rulings — A1–A7 (founder, 2026-09-04)

### A1 · May read vs may notice — the reader may draft what it noticed

BUILD-07B returns **reader-claim drafts**, not merely references. Each draft carries `text`, a
non-empty list of `EvidenceRef`, and a non-empty list of `DevelopmentalNonConclusion`. It carries
no durable id, no phenomenon, no interpretation, no possibility, no severity, no persistence, and
no observation identity.

The split that makes this lawful: `doesNotEstablish` belongs to 07B because it describes the
evidentiary limits of the *act of reading*; free-form `uncertainty?` belongs to 07C, where a
`DevelopmentalObservation` exists and has identity and evidence to inherit. **No automatic
promotion.** 07C must bind, classify and mint identity; a 07B draft is never an observation
merely because it has text and refs. DECIDE keeps observation as the required base of the
eventual reading (INV-13); 07B produces the material for it, not the thing.

### A2 · Lens — required commissioning input

Every 07B read is commissioned under **exactly one** canonical Developmental Lens:
`Structure · Development · Continuity · Arc · Voice · Coherence · Reader`. Lens belongs to the
request because it states the editorial question being asked (UNDERSTAND §4: lens = editorial
function). Phenomenon remains 07C classification (phenomenon = what the reading notices; DECIDE
INV-12).

```text
07B INPUT      commissionedLens
07B CLAIM      no lens field
07C            the observation receives the commissioned lens
               and independently classifies phenomenon
```

07B does not infer a lens from its own output.

### A3 · Bodies and ceiling — yes to bodies; 60,000 code points; no section-count ceiling

```text
frozen topology / authored-structure metadata   may cover the whole commissioned Work
recovered body prose                            at most 60,000 Unicode code points per invocation
section-count ceiling                           NONE
source                                          only sections captured at BODY depth in the
                                                request's DevelopmentalEvidence
truncation                                      NEVER
automatic neighbouring context                  NEVER
over ceiling                                    refuse whole, before any model call
```

This is **not** an inheritance of the StructureReader's 8-section / 60k regime (UNDERSTAND §2
rejected inheritance by inertia). 60,000 is freshly ratified as the conservative v1 prose ceiling;
the eight-section restriction is rejected because section count measures writing style, not
context consumed. The unit is Unicode code points, consistent with 07A's exact prose addressing
(`evidenceRef.ts:44-48`; `codePointLength`, `draftSections.ts:356`) — never bytes, never silent
UTF-16. Changing 60,000 requires evidence and another ruling. *The ceiling is a finding, not a
knob.*

### A4 · Read-request — no autonomous expansion in v1

The commissioned scope is final for that reader invocation. The reader may not ask the host to
widen what it sees. When coverage is insufficient, three states stay distinct:

```text
some lawful claims remain                       → claims + doesNotEstablish
the commissioned question cannot be read at all → typed refusal
nothing worth noticing after a sufficient read  → typed none
```

A larger read is a **new capture and a new commissioned act**, initiated outside the reader
(INV-18 per-reading scope; INV-19 no re-anchoring). A "request another read" protocol may be added
later; it will never turn a model tool call into authority to enlarge manuscript access.

### A5 · Headings — no special heading channel in v1

Headings are authored text. A heading may cross the 07B boundary **only** if it is recoverable
through the same immutable evidence state as other prose. 07A's frozen topology carries section
ids and not headings, so headings not recoverable through the immutable revision are **absent**
in v1. Forbidden: live draft heading fetch; current `manuscript_draft_sections` heading;
`HeadedSection` as a shortcut; re-reading current rows at model time. If headings prove necessary
and are not recoverable, that is a future evidence-substrate amendment, not a hole 07B fills
(INV-7b).

### A6 · Gate direction — the one-way seam, made structural

```text
developmental reader / renderer      MAY IMPORT   development/evidenceRef
                                                  development/readState
                                                  development/resolve
07B host validator                   MAY ALSO IMPORT   development/bind

MODEL-FACING READER MAY GET PROSE ONLY FROM       development/resolve

MAY NOT import or call               development/capture · LiveDraftState / LiveWork ·
                                     draft loaders · manuscript DB loaders ·
                                     structure-row loaders · ask/* · routes ·
                                     current manuscript prose in any form

REVERSE, ABSOLUTE                    lib/manuscript/development/** MUST NOT import
                                     reader / model / lib/ai / prompt machinery
```

Two module-graph falsifiers follow: *evidence cannot act* (already on canonical,
`development/__tests__/evidenceCannotAct.test.ts`) and *reader cannot bypass evidence* (new). The
census named unrestricted `runStructured(messages)` as the principal bypass; this seam is the
answer.

### A7 · Non-conclusions — closed, non-empty vocabulary

`doesNotEstablish` is a non-empty tuple of closed values, never free prose — the
`EvidenceNonConclusion` mechanism (`structure/evidence.ts:23-29`, `:46`) applied to development.
Ratified v1 vocabulary:

```text
outside-coverage             material not read cannot support this claim
across-unread-span           absence / continuity across an unread interval is not established
whole-work-pattern           local or partial evidence does not establish a whole-Work pattern
authored-structure-relation  division / hierarchy / structural relation is not established
                             unless frozen member-authored structure was supplied
chronology                   temporal continuity or ordering is not established merely from
                             section position or incomplete textual coverage
author-intent                the evidence does not establish why the author did or omitted something
reader-effect                the evidence does not establish an actual reader effect; 07C may
                             later offer a contestable interpretation about possible effect
editorial-consequence        the evidence does not establish defect, importance, priority, or
                             that anything should change
```

Every claim draft carries at least one. *A non-conclusion is not MAIA feeling unsure. It is a
structural statement about what authority the evidence does not grant.*

---

## 2 · The contract — object family

Stated as the types an implementation must satisfy. **No file carries these yet.** Names are
binding; field order is not. Anything not listed is absent by construction.

```ts
// ── vocabularies (closed) ──────────────────────────────────────────────────
type DevelopmentalLens =
  | 'structure' | 'development' | 'continuity' | 'arc' | 'voice' | 'coherence' | 'reader';

type DevelopmentalNonConclusion =
  | 'outside-coverage' | 'across-unread-span' | 'whole-work-pattern'
  | 'authored-structure-relation' | 'chronology' | 'author-intent'
  | 'reader-effect' | 'editorial-consequence';

const DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 60_000;   // A3 — changed only by ruling

// ── request (07B input) ────────────────────────────────────────────────────
interface DevelopmentalReaderRequest {
  commissionedLens: DevelopmentalLens;                      // A2 — exactly one, required
  evidence: DevelopmentalEvidence;                          // 07A — readState + coverage; no prose
  /**
   * Whole-section prose, each value produced by recoverEvidence({kind:'section', sectionId},
   * evidence.readState, revisionContent) — resolve.ts:86 — and nothing else. Only sections whose
   * coverage is 'body' in THIS evidence object. Passage-level recovery is not a request input.
   */
  recovered: readonly Extract<Recovered, { kind: 'text' }>[];
  // structure: NOT A FIELD. Read from evidence.readState.structureContext only (A5, A6).
  // headings:  NOT A FIELD (A5).
}
// host precondition, before any model call: Σ codePointLength(recovered[i].text) ≤ 60_000

// ── result (07B output) ────────────────────────────────────────────────────
type DevelopmentalReaderResult =
  | { outcome: 'claims';  claims: NonEmptyArray<ReaderClaimDraft>; reader: ReaderIdentity }
  | { outcome: 'none';    reader: ReaderIdentity }
  | { outcome: 'refused'; refusal: DevelopmentalReaderRefusal; detail: string; index: number | null };

interface ReaderClaimDraft {
  text: string;                                             // non-empty; what was noticed
  refs: NonEmptyArray<EvidenceRef>;                         // 07A vocabulary; bound by the host
  doesNotEstablish: NonEmptyArray<DevelopmentalNonConclusion>;   // A7
}

// ReaderIdentity = Omit<ReaderProvenance, 'frozenAt'>  (readerProvenance.ts:24)
//   provider 'anthropic' · model = StructuredResult.provenance.model (the model ACTUALLY SENT)
//   promptHash = sha256(system + '\0' + JSON(tools)) · readerVersion 'DEVELOPMENTAL-READER-01'
//   frozenAt is 07C's — stamped by a store this unit does not have

// ── refusals (typed, closed) ───────────────────────────────────────────────
type DevelopmentalReaderRefusal =
  // request — checked by the host BEFORE the seam is reached
  | 'invalid_lens'                     // not exactly one canonical lens
  | 'ceiling_exceeded'                 // Σ code points > 60,000; refused whole, never trimmed
  | 'recovered_not_body_coverage'      // a recovered section is not 'body' in evidence.coverage
  | 'recovered_not_in_read_state'      // a recovered section id is absent from readState
  | 'recovered_integrity_failure'      // recovered text does not digest to readState.sections[id].digest
  // seam — passed through, never fallen back from (types.ts:100-117)
  | 'structured_inference_unavailable' | 'provider_unavailable'
  | 'invalid_inference_mode' | 'not_configured'
  // model output — checked by the host AFTER the seam, before anything is returned
  | 'malformed_output'                 // no tool call, wrong tool, unparsable input
  | 'foreign_field'                    // any field outside the contract (maiaReader.ts:636-642 pattern)
  | 'read_request_attempted'           // the model asked for more — A4
  | 'empty_claim_text'
  | 'claim_unbindable'                 // bindEvidence refused; detail carries the BindRefusal; index = claim
  | 'non_conclusion_missing'           // empty doesNotEstablish
  | 'non_conclusion_unknown';          // value outside the closed vocabulary
```

**Absent by construction** (a field that does not exist cannot be populated — the 07A / DECIDE
method): `id` · `observationKey` · `lens` on a claim · `phenomenon` · `interpretation` ·
`questions` · `possibilities` · `uncertainty` · `severity` · `priority` · `score` · `confidence` ·
`rank` · any persistence · any manuscript mutation · any headings · any structure rows ·
any `request_sections` tool.

**The seam, as the contract fixes it.** One tool, answering through a tool is mandatory
(`toolChoice: { type: 'any' }`), the model pinned by the caller and echoed by the seam, the
completion `long-running`. The tool's `input_schema` names exactly `claims[]` with the three
`ReaderClaimDraft` fields, plus a `none` form; nothing else. The prompt states the commissioned
lens, renders each recovered section **with its address** (`sectionId`, position in the frozen
topology, code-point length), renders the frozen structure context when present (unit ids,
parents, positions, the member's own `kind`/`title` words, section memberships), renders the
coverage so the model knows what it did *not* read, and restates the non-conclusion vocabulary
verbatim. Prompt wording, tool schema text and renderer format are **implementation** and are
not fixed here; what they must and must not contain is.

**What the host loop is** (so 07B is not confused with 07C):

```text
07B HOST                    validate request → render → runStructured → parse → bind every ref
                            (bindEvidence against request.evidence) → return Result
07B DOES NOT                capture · recover · mint identity · classify phenomenon ·
                            persist · stamp frozenAt · surface anything
CAPTURE + RECOVER           the CALLER's act, outside the reader (07A functions; a new capture
                            is a new commissioned act — A4)
07C                         takes a Result of outcome 'claims', binds again if it wishes, assigns
                            lens from the commission, classifies phenomenon, mints
                            (readingId, observationKey), freezes with provenance.frozenAt
```

---

## 3 · Falsifiers — derived from census Q9 and rulings A1–A7

Each is stated so that a BUILD-07B implementation either satisfies it or does not. Each records
exactly one of `PASS` · `FAIL` · `UNABLE TO EXERCISE`; `UNABLE TO EXERCISE` is never promoted.
The method column names the witness kind: **G** module-graph test (static, over source),
**U** pure unit test (no database, no network), **W** witness script against a UTF-8 scratch
database (the 07A pattern), **X** exercised with the model seam **refusing** (no live model call is
required to PASS any falsifier below — the boundary is provable with the seam in `sovereign`
mode returning `structured_inference_unavailable`).

| # | Falsifier | Derived from | Method |
|---|---|---|---|
| **F1** | Every character of prose in a rendered request originates from a `Recovered{kind:'text'}` value that `recoverEvidence` produced under `request.evidence.readState`. Rendering a request whose recovered text was altered by one code point, or supplied from `LiveDraftState`, is refused `recovered_integrity_failure`. | A6 · Q9 RECOVER | U |
| **F2** | *Evidence cannot act, still.* `lib/manuscript/development/**` imports nothing from the reader module, `lib/ai`, `lib/maia`, `lib/oracle`, any model SDK, or any prompt machinery. The existing gate stays green with the reader present in the tree. | A6 | G |
| **F3** | *Reader cannot bypass evidence.* The reader / renderer module graph imports from `development/evidenceRef`, `development/readState`, `development/resolve`, `lib/ai/structured` and nothing that yields manuscript text: not `development/capture`, not `draftSections` loaders, not `lib/db`, not `structure/maiaReader`, not `structure/evidence` (`HeadedSection`), not `ask/*`, not `app/**`. The host validator may additionally import `development/bind`. Negative control: adding one such import turns the gate red. | A6 · A5 · Q6 | G |
| **F4** | A request without exactly one canonical lens is refused `invalid_lens` before the seam; a `ReaderClaimDraft` has no `lens` field and a model output carrying one is refused `foreign_field`. | A2 | U |
| **F5** | Σ `codePointLength(recovered[i].text)` > 60,000 is refused `ceiling_exceeded` before the seam; exactly 60,000 passes; the measure is code points (a request of 60,000 astral characters passes; the same text measured in UTF-16 units would exceed). Nothing is truncated and no section is dropped to fit. | A3 | U |
| **F6** | A recovered section whose coverage in `request.evidence` is `'position'` (or absent) is refused `recovered_not_body_coverage` / `recovered_not_in_read_state`; a recovered section from a *different* evidence object (different `inputFingerprint`) is refused by digest. Neighbouring sections are never added by the host. | A3 · A4 · INV-8 | U |
| **F7** | The request has no structure field; structural context reaches the prompt only from `evidence.readState.structureContext`. With `structureContext` absent, a claim carrying a structural ref is refused `claim_unbindable` (`structure_not_supplied`), and the whole result is refused, not the claim dropped. | A5 · A6 · INV-16a | U |
| **F8** | Every claim's every ref is proven by `bindEvidence(refs, request.evidence)`; one unbindable ref anywhere refuses the whole result `claim_unbindable` with the claim index and the `BindRefusal`. A result is never returned with the bindable subset. | A1 · Q9 BIND | U |
| **F9** | Every claim carries ≥ 1 `DevelopmentalNonConclusion` from the closed vocabulary; an empty tuple is `non_conclusion_missing`; a value outside the eight is `non_conclusion_unknown`; free prose in that field is `foreign_field`. | A7 | U |
| **F10** | The result type carries none of: `id`, `observationKey`, `phenomenon`, `interpretation`, `questions`, `possibilities`, `uncertainty`, `severity`, `priority`, `score`, `confidence`, `rank`. A model output carrying any of them is refused `foreign_field`. Asserted over the tool `input_schema` and over the parser. | A1 · DECIDE INV-14/15 | G + U |
| **F11** | `claims` with an empty array and `none` with claims are both unconstructible by type; a refusal is a third outcome and is never reported as `none`; `none` carries `reader` identity like `claims` does. | A4 · INV-0 · INV-23 | U |
| **F12** | The tool contract exposes no `request_sections` (or any second) tool; a model output that asks for more sections, in any form, is refused `read_request_attempted` and widens nothing. | A4 | G + U |
| **F13** | A missing tool call, a text-only answer, or unparsable tool input is refused `malformed_output`; it is never coerced into `none`. | Q9 MODEL OUTPUT | U |
| **F14** | Under `sovereign` / `local_only` inference mode the result is `refused` with the seam's own refusal; no fallback provider, no text model, no retry with a different model. | Q9 SEAM | X |
| **F15** | The rendered request contains no heading text and the reader module cannot obtain one (F3); the frozen structure context's `title`/`kind` words — the member's own labels, frozen at capture — are the only labels that may appear. | A5 | U + G |
| **F16** | The reader module writes to no table, names no apply / adopt / checkpoint / restore path, and makes no network call except through `runStructured`. | Q9 · 07A gate pattern | G |
| **F17** | Every non-refused result carries `ReaderIdentity` with `readerVersion = 'DEVELOPMENTAL-READER-01'`, `promptHash` over system + tools together, and `model` taken from `StructuredResult.provenance.model` — never from the request's default. Changing one character of the prompt or the tool schema changes `promptHash`. | INV-25 · Q5 | U |
| **F18** | A `ReaderClaimDraft` cannot be passed where a `DevelopmentalObservation` will be required: it has no `BoundEvidence` (unforgeable, `bind.ts:39-56`) and no identity. Demonstrated by type: a draft literal does not satisfy a type requiring `evidence: BoundEvidence`. | A1 · DECIDE §2 | G (type-level) |
| **F19** | The reader is stateless across invocations: two requests under different `inputFingerprint`s share nothing; no reader-side cache of prose or claims exists. | A4 · INV-18 | G + U |
| **F20** | Rendering is deterministic: the same request renders to byte-identical messages, so `promptHash` + request digest identify what the model was shown. | INV-25 | U |

**Falsifiers that need a live model to be *meaningful* but not to PASS** — F8, F9, F10, F12, F13
are exercised with fixture model outputs in U. A live-model witness (sovereign mode off, real
provider) is a **separate, later act** with its own authorization; nothing in this contract
requires it to close BUILD-07B's structural falsifiers, and no live-model run may be used to
"prove" a falsifier that fixtures show failing.

---

## 4 · Outcomes — the six a BUILD-07B witness must adjudicate

```text
O1  Boundary integrity      Prose reaches the model only through development/resolve under the
                            request's frozen state; the two module-graph gates are green and
                            their negative controls red.                           F1 F2 F3 F15 F16
O2  Commission discipline   Exactly one lens; scope final; 60,000 code-point ceiling refused
                            whole; no neighbouring context; no read-request.       F4 F5 F6 F12 F19
O3  Claim accountability    Every claim binds to the evidence it was read from and states what it
                            does not establish, in the closed vocabulary.          F7 F8 F9
O4  Sub-observation         Nothing 07C-shaped exists in the result; a draft cannot stand in for
                            an observation.                                        F10 F18
O5  Refusal discipline      claims / none / refused are three distinct, typed outcomes; nothing
                            degrades to none; the seam's refusals surface unchanged.  F11 F13 F14
O6  Provenance              Identity, version, prompt hash and the resolved model are on every
                            non-refused result; rendering is deterministic.        F17 F20
```

All six are recorded `PASS` / `FAIL`. Terminal states for the unit, when it is built and
witnessed: `CLOSED / ACCEPTED` · `CLOSED / REFUSED` (a FAIL that a ruling declines to repair
inside the unit) · no generic DONE.

---

## 5 · What is deliberately left to implementation

Not fixed here, and not to be fixed by inference from this document:

```text
prompt wording · tool schema text · renderer format · the request digest algorithm ·
how the non-conclusion vocabulary is explained to the model ·
max tokens · thinking configuration (the structure reader's ruling not to configure it stands
until a 07B ruling says otherwise) · where the host loop lives (a lib module; never a route in 07B)
```

## 6 · What this document does not do

```text
no TypeScript file · no test file · no prompt · no tool contract text · no renderer
no model call · no route · no surface · no schema · no persistence
no DevelopmentalReading · no observation · no phenomenon · no identity
no authorization of BUILD-07B implementation · no opening of BUILD-07C
no change to the 60,000 ceiling, the lens list, or the non-conclusion vocabulary — each is a ruling
```
