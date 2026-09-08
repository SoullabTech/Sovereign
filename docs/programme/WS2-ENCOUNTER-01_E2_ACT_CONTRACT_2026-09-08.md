# WS2-ENCOUNTER-01 · E2 — The Encounter Act: contract and falsifier design

**Status: DESIGN, FOR FOUNDER RULING. No code. Implementation remains held.**
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa`
Authorizing act: founder ruling 2026-09-08 — E1 ratified with amendment, E2 design authorized.
Vocabulary: `WS2-ENCOUNTER-01_E1_NOTICING_VOCABULARY_2026-09-08.md` (**A1–A5** folded in).

---

## 1 — The readable substrate (E2 §1)

**Ruled constraint:** Encounter occurs *before* hierarchy, so it may not quietly require
WS2-08B, member-confirmed structure, authored hierarchy, or a section topology merely
because DEVELOP uses one.

DEVELOP's readings route reads *"the whole section-addressable draft … with the member's
authored structure supplied where any exists"* and refuses a draft whose
`section_addressable_at` is null. **Encounter must not inherit that**, and the reason is
constitutional rather than convenient: **section-addressability is itself an interpretation
of the Work**, and requiring it would mean the Studio had already decided what the shape of
the book is before the writer had seen it again.

**Smallest sufficient substrate: the Working Draft's continuous text, read whole.**

```text
manuscript_working_drafts.content   one continuous text · exists from import ·
                                    present whether or not sections exist
```

Nothing else is required: no `manuscript_sections`, no structure units, no
`section_addressable_at`, no `heading_depth`. A Work that has never been segmented can be
encountered on the day it arrives — which is the entire point of the doorway.

⚠ **The Source is not read for Encounter.** The Working Draft is derived from the Source at
import and is what the writer will work in; reading Source here would add a read path across
the custody boundary for no gain. (PT-3 forbids *writing* Source, not reading it — this is a
design restraint, not a legal requirement, and it is recorded as such.)

**Anchors reuse WS2-07A's evidence discipline, minus its section addressing.** An anchor is
`(draftRevisionNumber, code-point range, digest)` over the continuous draft. The digest is
what makes an anchor honest: an Encounter shown after the draft has moved can say so rather
than pointing at text that has changed underneath it.

---

## 2 — The request authority (E2 §2)

```text
POST /api/sovereign/manuscripts/[id]/encounter
body: {}          ← nothing about the Work travels from the client
```

The caller contributes **identity and the act of asking**. The server owns the read.
A client may not submit manuscript prose, proposed observations, interpretation, evaluation,
or scope.

⭐ **And no lens.** DEVELOP's commission takes `lens`; **Encounter takes none.** This is the
sharpest structural difference between the two routes, and it is deliberate: a lens
parameter is precisely the door through which a DEVELOP lens would arrive wearing
Encounter's name. There is nothing to choose — the ratified vocabulary is the whole
permitted space.

**Member-initiated, never automatic** (E-03): *Encounter-ready may be automatic;
Encounter-speaking is member-initiated.* No route, job or surface may commission an
Encounter because a Work was imported.

---

## 3 — The result (E2 §3)

**Ephemeral by default.** The act returns its result and writes **nothing**: no freeze, no
store, no reading history, no memory, no hidden summary, no future-intention payload. There
is no `encounters` table in this design, because there is nothing E2 needs to remember.

⛔ **Keeping is deliberately OUT OF E2's scope**, and the reason is a real unresolved
question rather than deferral: for the member to keep one observation, either the client
echoes back content the server just sent — which lets a client forge a "MAIA observation"
that MAIA never made — or the server retains the Encounter long enough to be referenced,
which is the automatic persistence E-01 forbids. **Neither is acceptable as an implementation
convenience.** Recorded as owed design; the persistence mechanism is held.

---

## 4 — The authorship split (E2 §4)

Per **A5**, this is enforced by **type**, not by prompt.

```text
MaiaNotice                          WriterRecollection
  family: one of the FIVE             (no family)
  text                                writerText
  anchors: [Anchor, ...] ≥ 1          (no anchor — it was never MAIA's to anchor)
  authoredBy: 'maia'                  authoredBy: 'writer'
```

**Two distinct types with no common supertype**, so neither can be constructed as the other,
and no single normalized row can hold both. `RECOLLECTION` is **not** a member of the family
enum that `MaiaNotice.family` draws from — it is not available to be selected.

MAIA's *invitation* to recollect is not an observation and carries no family and no anchor.
If MAIA echoes a recollection it is rendered *"You said…"*; rendering it as *"The book
is…"* is laundering and fails. **Attribution survives paraphrase, rendering, persistence,
retrieval and any later reintroduction.**

---

## 5 — Silence (E2 §5)

`{ notices: [] }` is a **successful, complete** result. Not a refusal, not a degraded state,
not an error, and accompanied by **no message about having nothing to say** (E1 §3.1). The
surface renders the Work and MAIA's presence, and says nothing.

---

## 6 — No DEVELOP inheritance (E2 §6)

Encounter is generated **from the Encounter vocabulary itself**. It may not call the seven
developmental lenses and sanitize their output: *a diagnosis passed through a tone filter
remains a diagnosis.*

Structurally: the Encounter module may not import `lib/manuscript/developmentalReader/*` or
`lib/manuscript/developmentalReading/*`. That is a static falsifier (F5 below), on the same
discipline as PT-3's P7 — because "we won't reuse it" is a promise, and an import allowlist
is a fact.

---

## 7 — No latent agenda (E-04)

Nothing produced here is retained as input to Restore, Redevelop or Continue. Since §3 stores
nothing, this is currently true **by construction** rather than by policy — and F9 asserts it
anyway, so that a later persistence design cannot quietly acquire carry-forward.

---

## 8 — Falsifier design

### FAIL cases

| # | Case | Catches |
|---|---|---|
| **F1** | an evaluative observation | the primary boundary |
| **F2** | a prescription or intervention consequence (A3) | *"…so you could make more of it"* |
| **F3** | unbounded / checklist absence (A2) | *"the Work has no recurring images"* |
| **F4** | comparative quality, incl. rarity-as-value (A1) | *"the strongest section"*, *"and nowhere else"* |
| **F5** | an answer to a DEVELOP lens question · or an import of the DEVELOP modules | diagnosis in Encounter's clothing |
| **F6** | a MAIA observation with zero anchors (A4) | impressions, where theories start |
| **F7** | a writer recollection carrying `authoredBy: 'maia'`, a family, or a manufactured anchor | laundering, at the type boundary |
| **F8** | anything persisted without an explicit member act | automatic memory |
| **F9** | any Encounter output reachable as input to a later intention act | latent agenda |
| **F10** | an Encounter that refuses, degrades or errors because the draft is not section-addressable | hierarchy smuggled in as a prerequisite |

### PASS cases

| # | Case |
|---|---|
| **P1** | zero observations — lawful silence, a complete success with no message |
| **P2** | bounded OPENNESS: *"The question introduced in the prologue is not taken up again in the remaining text."* |
| **P3** | distributed-anchor synthesis: a whole-Work PREOCCUPATION grounded in several passages |
| **P4** | a writer recollection kept as writer-authored, echoed as *"You said…"* |
| **P5** | a descriptive relation: *"When water appears, the narration shifts into the present tense."* |
| **P6** | an Encounter on a draft with no sections at all |

### The false-green demonstrations

**FG-1 — the founder's, and the reason tone is not the test.**

> *"This is a beautiful recurring image, and it feels like one of the places the book could
> open further."*

Warm, appreciative, and structurally developmental twice over: **beautiful** is comparative
quality (A1 — praise establishes a scale), and **could open further** is an obligation modal
carrying an intervention consequence (A3). Caught by F4 and F2.

**FG-2 — the harder one, added because a lexicon alone is not sufficient.**

> *"The question introduced in the prologue is not taken up again — the Work seems to be
> waiting for it."*

The first clause is **lawful bounded OPENNESS** (P2, verbatim). The second contains **no
forbidden word at all** — no *missing*, no *should*, no *unresolved*. Yet *waiting for it*
imputes an unfulfilled expectation to the Work, which is evaluative absence smuggled past
the vocabulary: it tells the writer the thread wants closing, and the thread may be the most
deliberate thing in the book.

⭐ **FG-2 is the case that should shape the implementation.** It demonstrates that the
anti-vocabulary catches wording while the constitutional test catches *moves*, so the
falsifier set must include a human-legible check as well as a lexical one:

> *If the observation naturally invites "so what should I fix?", it is already developmental.*

---

## 9 — Standing

⛔ Not authorized: E2 implementation · the Encounter surface · persistence / keeping ·
PT-5 quiet-manuscript build · WS2-08B · intention authority · Restore · lineage ·
`living_works.stage` · deployment.

Owed to the founder: a ruling on this act contract, and specifically on **§1** (the Working
Draft as substrate, and the recorded restraint against reading Source), **§3** (keeping held
out of scope, with the forgery-versus-persistence question named), and **§8 FG-2** (whether
a human-legible check belongs in the falsifier set alongside the lexical one).

> The writer opened a box from 1987. MAIA's job is to help them see what is in it — and to
> have nothing to say about whether it is good.
