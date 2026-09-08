# WS2-ENCOUNTER-01 · E2 — The Encounter Act: contract and falsifier design

**Status: CONSTITUTIONAL SHELL CLOSED (founder self-closing condition met, 2026-09-08).**
Request-authority repair landed (§11). Cognition binding is a separate act:
`WS2-ENCOUNTER-01_E2C_COGNITION_BINDING_2026-09-08.md`.
Four amendments folded in below (**B1–B4**), plus the ruled additions F11–F13 and the
two evidence classes. Implementation witness: §10.
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

## 9A — Amendments (founder, 2026-09-08)

**B1 · §1 ratified, with the distinction stated.**

```text
Source          answers: what did the writer ENTRUST?
Working Draft   answers: what is the Work NOW?
```

Encounter is an encounter with the Work now, not a forensic rereading of custody — which
matters most for the case the thesis is built around: an older Source may correctly describe
what arrived years ago while no longer describing the Work the writer is presently returning
to. **Source restraint ratified with the document's precision preserved: PT-3 does not
prohibit reading Source; this act simply has no reason to cross that boundary.** No Working
Draft is a refusal, never a silent Source fallback — a fallback would change the object being
encountered without telling the writer.

**B2 · §1A — "read whole" must mean whole.** *Encounter may computationally partition the
text, but it may not silently sample the Work and present partial observation as whole-Work
attention.* Windows are **transport mechanics**, never sections, chapters, units or inferred
hierarchy. If the full Work cannot be processed, **refuse honestly rather than sampling
invisibly** (F12).

**B3 · §1B — anchor the snapshot, and the digest is the authority.** A revision counter is
useful provenance but cannot on its own claim the text is unchanged. `EncounterSnapshot`
carries `wholeDraftDigest`; each `Anchor` carries its own `spanDigest`; a distributed
observation carries several anchors against the same snapshot. If the draft moves while an
Encounter is open, its anchors identify themselves as **stale** rather than relocating onto
new prose (F13).

**B4 · §3 — Keeping remains held, but the record must not constitutionalize a false
dichotomy.** The contract framed the space as *client echo (forgery) or server persistence*.
Founder correction: there is at least a third architecture —

```text
MAIA notice → server signs an opaque, self-authenticating receipt → response stays
ephemeral → member explicitly chooses Keep → receipt returned → server verifies
provenance → only then is the named thing persisted
```

A cryptographically verifiable receipt is **not** the caller-selected authority token S4
rejected: it would not claim authority because its type shape looks convincing; its
provenance would be externally verifiable. **Not authorized here.** Recorded instead:
*Keeping requires a later provenance-preserving design that permits an explicit member act
without requiring automatic server persistence. The mechanism remains open.* For E2: **no
Keep.**

**P4 amended** accordingly — E2 proves authorship preservation, not persistence, and does not
pretend to a capability it intentionally does not contain.

**§8 · two evidence classes, ratified.** Class **A** executable structural falsifiers; class
**B** the semantic ear — a retained adversarial corpus adjudicated by a person. The ear must
not collapse into *"we told the model not to evaluate"*, nor become a regex pretending to
understand expectation. If anyone later automates it with a model, classifier or judge, **that
evaluator needs its own negative controls before its verdict can carry release authority.**
The adjudication question: *does this merely help the writer recognize what is present, or has
it begun establishing what the Work wants, lacks, owes, should do, does to a reader, or ought
to become?* **If uncertain, Encounter loses.**

---

## 10 — Implementation witness

`lib/manuscript/encounter/{contract,vocabulary,traversal,read,semanticEar}.ts` ·
`app/api/sovereign/manuscripts/[id]/encounter/route.ts` ·
`lib/manuscript/encounter/__tests__/encounter.test.ts` — **28 passed.**

**The generator is a port.** Notices are proposed by an injected `NoticeGenerator` and every
proposal is screened before it can become a `MaiaNotice`. The default generator is **silent**,
so the act's lawful floor — an Encounter that says nothing — is also its default. Wiring a
model-backed generator is a separate act: the constitutional work is the screen, and the
screen does not care what proposed the text.

**Failing closed toward silence.** An unlawful proposal is **dropped** — not repaired, and
never reported. Telling the writer something was withheld would make the system's silence
into information about their book.

**One structural rule earned its place.** *Imputed volition* — wanting, waiting, needing or
trying predicated of the Work — is mechanically detectable and is exactly FG-2's move, so it
became a screen rule rather than being left to the ear.

| | |
|---|---|
| **F1–F5** evaluative · prescription · unbounded absence · comparative quality · DEVELOP-lens answer and DEVELOP imports | ✅ |
| **F6–F7** unanchored · span digest mismatch · recollection-as-notice · no common supertype | ✅ |
| **F8–F9** the act issues only `SELECT`; nothing in the module writes; **only the route may reach the act** | ✅ |
| **F10–F13** no hierarchy · refusal not Source fallback · whole traversal incl. astral code points · stale-anchor honesty | ✅ |
| **P1–P6** silence · bounded OPENNESS · distributed anchors · recollection stays writer-authored · descriptive relation · a draft with no sections | ✅ |

**Two of my own tests failed first, and both failures were mine.** F9's directory walk
excluded every path containing "encounter" — including its own route — so it passed on an
empty offender list, proving nothing; it now excludes the module directory only. And the
semantic-ear entry I had marked *not structurally caught* contained the word **absence**, so
the screen caught it after all: the honest-limit assertion failed because I had **understated**
the instrument. Both are recorded rather than quietly fixed, because a test that passes
without observing anything is the exact failure this lane exists to notice.

The corpus now carries a genuine residue — *"…and then the book turns elsewhere, as though it
had been set down"* — no forbidden lexeme, no volition verb, no comparison, and still
unlawful, because it frames a bounded non-return as an abandonment.

**Gates:** typecheck 229 vs baseline 239, **0 regressions** · PT-3 source-custody gate
**39 passed** (floor intact) · Encounter **28 passed**.

---

## 11 — Request-authority repair (self-closing)

Founder review held closure on one defect: the route **documented** an empty-body contract
and never read the body, so `{ lens }`, `{ scope }`, `{ text }` or `{ observation }` was
**ignored rather than refused**. No forgery path existed — and that is not the standard:

> **Inadmissible must mean refused, not ignored.** A constitutional rule that is merely
> unused is a rule the next refactor can quietly honour differently.

`readEmptyGesture()` now validates **before the Work is read**. No body and `{}` are the same
act; everything else is a typed 400 — `foreign_field` · `invalid_body` · `malformed` — and a
foreign field is never partially honoured.

**17 route-boundary controls, at the HTTP handler rather than the helper:** no body ✅ · `{}` ✅ ·
lens · scope · client prose · proposed observation · any other field → `foreign_field` ·
array · null · string · number · boolean → `invalid_body` · malformed JSON → `malformed` ·
**and the strongest one — none of the refused inputs reaches Working Draft capture**, plus
401 short-circuits before the body is even considered.

Self-closing conditions: enforcement ✅ · all foreign/non-object/malformed refuse ✅ · refusal
precedes capture ✅ · Encounter checks green (**28 + 17 = 45**) ✅ · PT-3 gate **39** ✅ ·
no Source, hierarchy, persistence, cognition or surface added ✅. Typecheck 229 vs baseline
239, 0 regressions.

---

## 9 — Standing

⛔ Not authorized: the Encounter surface · persistence / keeping ·
PT-5 quiet-manuscript build · WS2-08B · intention authority · Restore · lineage ·
`living_works.stage` · deployment.

Owed to the founder: review of the implementation witness (§10) before **E3** opens.

> The writer opened a box from 1987. MAIA's job is to help them see what is in it — and to
> have nothing to say about whether it is good.
