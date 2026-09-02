# WS2-07 · DECIDE — the DevelopmentalReading object

```text
LANE        JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01 · DECIDE
INPUTS      FIND       canonical @ cc9788e4f   WS2-07-FIND_…_CENSUS
            UNDERSTAND canonical @ 5670163e6   WS2-07-UNDERSTAND_…_SEMANTICS
AUTHORIZES  nothing to be built
DATE        2026-09-02
```

⛔ **No table, migration, route, prompt, surface, reader, or TypeScript file is created here.**
The shapes below are written in TypeScript because it is the least ambiguous notation available
for a shape, **not because a file is being specified.** Field names are proposals; the
**invariants are the deliverable.**

> **Numbering.** Ratified 2026-09-02: flow stages are named by word (`FIND · UNDERSTAND · DECIDE
> · BUILD · PROVE · DONE`); `07A`–`07H` are reserved for BUILD units and written `BUILD-07A` where
> prose could be ambiguous. This document is DECIDE, and precedes every build unit.

---

## 1 · The reading

```ts
type DevelopmentalReading = {
  id                  // durable, server-minted, outlives the response
  workId
  scope               // what was asked about
  structureContext?   // authoritative structure supplied to this reading, if any
  readState           // what the Work was when she read it
  coverage            // what she actually read, per section
  provenance          // who read, which version, under which contract
} & (
  | { outcome: 'reading'; observations: NonEmptyArray<DevelopmentalObservation> }
  | { outcome: 'none';    observations: readonly [] }
)
```

**INV-0 · The outcome discriminates the observations, in both directions.** A `'reading'` with no
observations and a `'none'` carrying observations are both unconstructible. Prose saying
"observations may be empty only when outcome is `none`" leaves the second case open; a union
closes both. A refusal remains a different result entirely — see §10.

The decisions below are load-bearing. Each is stated as an invariant that an implementation
either satisfies or does not.

---

## 2 · Identity — of the reading, and of every observation

### The reading

**INV-1 · A reading's identity is minted before it is returned, and does not depend on its
content.** Not a hash of the reading, not a slug, not a position in a list. A content-derived id
changes when the content is corrected and collides when two readings agree.

### The observation

**INV-2 · An observation is durably addressable as a pair.**

```text
(readingId, observationKey)
```

`observationKey` is reading-internal and stable for the life of the reading: `o1`, `o7`. The pair
is the durable address; the key alone names nothing.

This is not a new invention — it is the **ratified 6A provenance pattern**, which addresses a
reviewed unit as `(adopted_from_proposal_id, adopted_from_review_unit_key)` precisely because unit
keys are proposal-internal. Reusing it means a later authored act refers to an observation the
same way canonical structure already refers to a reviewed unit.

**INV-3 · An observation's identity outlives the response that produced it and the surface that
displayed it.** The lane's §3 constraint, restated as the acceptance condition: if the only way to
name an observation is to still be holding the payload it arrived in, INV-3 is not satisfied and
no downstream stage can repair it.

**INV-4 · A frozen reading is never corrected in place.** A correction is a **new reading with a
new `readingId`**; the prior reading remains recoverable. Within any one reading, keys are
therefore stable by construction and never reissued.

The first draft spoke of "a correction that removes an observation", which implied editing a
frozen record — contradicting the lane, which freezes the persisted reading. Immutability makes
the key rule trivial rather than a discipline to maintain: a reference that resolved to one
observation yesterday cannot resolve to a different one today, because the reading it names
cannot change.

---

## 3 · EvidenceRef — what it points to

⛔ **DECIDE does not define `EvidenceRef`.** The lane reserves that for **BUILD-07A**, and the
first draft froze it as `{ sectionId, quote? }` — a scope collision, and too narrow besides: this
document permits heading-, topology- and structure-derived evidence, and a section-only reference
cannot name an authored-structure relation. `divisionRef` is contextual metadata about an
observation, not evidence provenance, and cannot stand in for it.

**INV-5 · What an `EvidenceRef` must be, whatever its concrete variants turn out to be:**

```text
TYPED           the kind of evidence is part of the reference, not inferred from
                which optional fields happen to be populated
DURABLE         it addresses something with a stable identity, never a character
                offset in live prose and never a heading string
RECOVERABLE     it resolves through its reading's frozen state (§4), so what the
                observation rested on can still be shown
EXPRESSIVE      it can name textual evidence AND authored-structure evidence
```

**Deferred to BUILD-07A:** the concrete reference variants, their locator fields, and quote
policy — whether a quote is carried, and what a failed re-find means operationally.

**INV-6 · A ref carries no version of its own.** Versioning lives on the reading (§4), once.
Per-ref versions would let one observation claim currency its own reading cannot support.

**Why "durable" excludes what it excludes.** Positions renumber when a section is inserted;
headings are edited; character offsets move on every keystroke. Draft section identity is what
05A, 05B and 6A all already address, and a fourth addressing scheme for developmental evidence
would recreate the divergence FIND recorded between proposal-internal and canonical unit
identity.

---

## 4 · readState — what the Work was when she read it

**INV-7 · A reading freezes what the Work was, using the fingerprints the system already has.**

**INV-7a · A reading freezes the exact state of every section it covered, per section — not only
an aggregate.**

```ts
readState {
  sections: Map<sectionId, SectionState>  // the state actually read, per section
  sectionTopology                         // the ordered section ids as read
  inputFingerprint                        // over the exact inputs used for THIS reading
  structureFingerprint?                   // present iff structureContext was supplied
}
```

**Why per-section state is required, and an aggregate hash is not enough.** A `sectionId` resolves
to *today's* section. After an edit it no longer resolves to what MAIA read. An aggregate hash can
prove **that** something changed; it cannot recover **what she read**, and an observation whose
evidence cannot be recovered is an assertion the author cannot check.

**INV-7b · `SectionState` and `structureContext` must RESOLVE to the exact immutable state read,
not merely detect that it changed.**

A bare content digest satisfies comparison and **not** recoverability: it proves the live text
differs from what was read, while being unable to reconstruct what was read. Recoverability
requires either an immutable revision identity, or a digest under a guarantee that the retained
content remains retrievable by it. The same holds for authored structure —
`structureFingerprint` detects change, but unless `structureContext` is itself frozen or points
at a durable immutable snapshot, a superseded structure-dependent observation cannot show the
author the structure it actually reasoned from.

**Which mechanism provides that is BUILD-07A work.** What DECIDE fixes is that a mechanism which
only compares does not satisfy the invariant.

An `EvidenceRef` therefore resolves *through its reading's frozen state*, never through the live
section.

```text
reading.readState
  section A → exact state read
  section B → exact state read
EvidenceRef → section B
            → resolved through THAT reading's frozen state
```

This preserves INV-6 — the ref still carries no version, because the reading carries it — and it
is what makes the scoped supersession in §9 computable rather than merely stated.

**Two different operations, named apart.** Conflating them is how "resolves through frozen state"
and "may fail after an edit" both appeared true of one thing:

```text
HISTORICAL DISPLAY    show what the observation rested on
                      → resolves against the reading's frozen state
                      → must always succeed, or the reading was never recoverable

CURRENT LOCATION      find that same passage in the Work as it stands now
                      → may fail
                      → failure is a SUPERSESSION SIGNAL, not an error
```

An implementation that silently fuzzy-matches a moved passage to keep the second operation
succeeding has invented evidence for the first.

⛔ **`inputFingerprint` is deliberately not named `interpretationInputHash`.** That is a
StructureReader-specific hash over headings plus supplied bodies, and UNDERSTAND §2 declined to
adopt that regime automatically. The requirement here is *a fingerprint of the exact inputs
actually used for this developmental reading*. BUILD may prove an existing implementation has
exactly those semantics and reuse it — but reusing the **name** before proving the **semantics**
turns inheritance into accidental coupling.

`structureFingerprint` is `canonicalFingerprint()`, which already digests every field of the
authored structure; a count would miss a renamed division or a section moved between divisions.

---

## 5 · Coverage — at the granularity the claim is made at

UNDERSTAND requires that coverage be reported at the granularity of the claim. That is a constraint on
what must be **derivable**, and it is satisfied by recording depth per section rather than a
percentage.

```ts
coverage {
  sections: Map<sectionId, ReadDepth>   // what depth was actually read
}
```

**INV-8 · Every evidence reference must be backed by coverage at at least the depth that evidence
requires. Evidence derived from prose requires body depth.**

Not every developmental observation rests on prose. Evidence may be heading-derived,
topology-derived, or structure-derived, and UNDERSTAND did not rule that a developmental
observation requires prose — an observation that a division's sections are ordered oddly needs
structure, not paragraphs. Requiring body depth universally would have made whole classes of
honest observation unconstructible.

What is forbidden is the mismatch: **a prose-derived claim resting on prose she did not read.**

⛔ **A refusal is not coverage.** The first draft carried `ceilingRefused?: ReadScopeReport` on a
successful reading. `ReadScopeReport` belongs to the StructureReader regime that UNDERSTAND §2
explicitly declined to adopt, and a refusal is a different outcome from a reading — not a field
inside one.

**INV-9 · An observation's unread span is derivable and must be presentable.** An observation
spanning positions 18–47 whose coverage holds bodies for 18, 19 and 47 has an unread span of
20–46. That is computable from `coverage` plus the observation's evidence, so it is **not stored**
— storing it would let it disagree with the coverage it summarises.

> **The failure this prevents.** A structural reading of 40% of a chapter that says so is
> trustworthy. A *developmental* reading of 40% that presents itself as whole is a claim about a
> Work the reader never saw.

---

## 6 · Lens and phenomenon — held apart structurally

UNDERSTAND ruled these are two independent lists related many-to-many. The object must not quietly
reintroduce a mapping.

```ts
DevelopmentalObservation {
  key                 // reading-internal; see INV-2
  lens                // the editorial question being asked
  phenomenon          // what the reading noticed
  evidenceRefs        // NonEmptyArray<EvidenceRef>
  observation         // required — what the evidence shows
  interpretation?     // optional — what it may mean
  questions?          // optional — what MAIA is asking the author; see INV-13a
  possibilities?      // optional — what the author might consider
  uncertainty?        // optional — what the reading could not settle
  divisionRef?        // required iff this observation is structure-aware
}
```

**INV-10 · `lens` and `phenomenon` are separate fields, and neither is derivable from the other.**
A single field, or a lens enum whose members are phenomena, collapses the ruling.

**INV-11 · One observation is one (lens, phenomenon) pairing.** The same phenomenon seen through
two lenses is **two observations**, because they ask different questions and may reach different
answers — `recurrence × Structure` asks whether the repetition belongs; `recurrence × Development`
asks whether it advances. Merging them would force one answer to be discarded.

**INV-12 · `phenomenon` is a classification of the observation, not a layer beneath it.** There is
no `Phenomenon` object between evidence and observation. UNDERSTAND settled this; the object must not
reopen it by giving phenomena their own identity or their own evidence.

⛔ **Neither the lens set nor the phenomenon set is frozen here.** The seven lenses stand as
canon; which phenomena are detectable is a BUILD question, downstream of what evidence can
actually be established.

---

## 7 · The epistemic layers, encoded

**INV-13 · `observation` is required; `interpretation`, `possibilities` and `uncertainty` are
optional.** An observation that stops at evidence and observation is complete and honest. A
required interpretation field manufactures interpretation to fill it.

**INV-13a · Questions attach to an observation, and inherit its evidence and its address.**

The lane requires both `questions[]` on the reading and an optional `question` on an observation.
The first draft carried `possibilities?` and no representation for the QUESTION half of the
canonical `QUESTION / POSSIBILITY` layer at all. DECIDE rules where they live:

```text
questions attach to an OBSERVATION
  → inherit its evidenceRefs
  → inherit its durable (readingId, observationKey) address
  → may arise from the observation OR from its uncertainty
  → do NOT require an interpretation to exist
```

A question may be the honest end of a reading that reached no interpretation — *"is this
deliberate?"* rests on an observation and needs nothing above it. That is why questions are
exempt from the containment rule below while possibilities are not.

⛔ **A reading-level `questions[]` is a DERIVED presentation, never a second authoritative copy.**
Two stored lists diverge, and the divergence is invisible until someone answers a question that
no longer matches the observation it came from.

**INV-14 · Authority moves upward only, and the encoding enforces it.**

```text
possibilities   present only if interpretation is present
interpretation  present only if observation is present
observation     present only if evidenceRefs is non-empty (by type)

questions       rest on the observation, not on the interpretation — see INV-13a
```

A possibility rests on an interpretation; an interpretation rests on an observation; an
observation rests on evidence. **A possibility with no interpretation is a recommendation with its
reasoning removed** — the reader cannot see what it answers.

**INV-15 · `possibilities` must leave no-change legitimate, and must never imply that
intervention is required.** UNDERSTAND's obligation is structural rather than lexical: it binds
what the set as a whole conveys, not the wording of any sentence.

⛔ **It does not require a second possibility to be manufactured.** One genuine possibility plus
the author's standing freedom to do nothing is already sovereign; inventing a second option so a
rule is satisfied produces filler, and filler is a worse failure than brevity. The field is plural
because a reading may offer several — not because it must.

⛔ **No `severity`, `priority`, `confidence`, `score` or `rank` field.** UNDERSTAND's prohibitions are
enforced by absence: a field that exists will be populated, and a schema with a severity column
has already decided that MAIA rates the Work.

---

## 8 · Scope — structure-aware and structure-independent

**INV-16 · Structure-dependence is a property of the OBSERVATION, not of the reading.**

A reading may carry `structureContext` when authoritative structure was supplied to it; each
observation declares whether it actually depends on that structure. The two are different facts
and were previously conflated:

```text
structureDependency
  ├─ independent
  └─ authored-structure
       → non-empty recoverable structural evidence
       → may concern ONE unit, SEVERAL units, or WHOLE TOPOLOGY
```

⛔ **Not a boolean plus a singular ref.** `dependsOnStructure: boolean` with `divisionRef?`
admits `false + divisionRef` and `true + no divisionRef` however firmly the prose says "required
iff" — and a single `unitId` cannot express a relationship *between* two divisions, a sequence
*across* several, or a whole-topology claim. §9 supersedes on exactly that last dependency, so a
representation that cannot name it makes its own supersession rule uncomputable.

A discriminated relation makes the invalid states unconstructible instead of merely discouraged.
**The concrete structural-reference variants are BUILD-07A work**, alongside the rest of
`EvidenceRef`.

**This was a contradiction in the first draft.** A reading-level `scopeMode` cannot coexist with
scoped supersession (§9), which explicitly preserves structure-independent observations while
superseding structure-aware ones in the same reading. It also breaks UNDERSTAND's Arc ruling:
local arc is structure-independent while whole-Work arc is structure-aware, and both may be
observed in one reading.

**INV-16a · A structure-dependent observation may only exist where authoritative structure was
supplied.** Where it was not, such observations are **ABSENT, not degraded** — they may not
reason from the proposal, and may not treat draft section order as a member declaration of
division order.

**INV-17 · Structural evidence names member-authored structure — a canonical unit, a set of them,
or the authored topology — never a proposal id and never a reviewed unit key.**

This is the direct answer to FIND's F2: the reading reasons about what the member declared the
Work to be, not about MAIA's own earlier perception of it.

**INV-18 · Scope is per-reading, not per-session.** A reading is commissioned for a purpose and
its scope derives from that purpose. There is no standing grant and no accumulation across turns.

---

## 9 · What happens when the Work changes after a reading is frozen

The sharpest question in this document, and the one an implementation is most likely to get wrong
by being helpful.

**INV-19 · A reading is never re-anchored.** An observation made against one state of the Work
does not survive that state changing by being re-pointed at the new one. Re-pointing is
manufacturing evidence for a claim that was never made about the current Work.

**INV-20 · Staleness is three-state, never two.**

```text
CURRENT      the fingerprints still match
SUPERSEDED   a fingerprint has moved — say WHICH
UNMEASURED   the comparison could not be made
```

This is the `ask/staleness.ts` pattern, and the third state is the load-bearing one: **a surface
that cannot say "I do not know" will say "no."** Reusing the existing shape also means one
staleness vocabulary across the Studio rather than two that drift.

**INV-21 · Supersession is scoped to what actually moved, and it is scoped per observation.**

```text
a section's state changed  → observations whose evidence depends on THAT section's
                             frozen state are superseded. Others are not

authored structure changed → observations whose structureDependency is authored-
                             structure are superseded.
                             Structure-independent observations in the same reading
                             are NOT

topology changed           → the whole reading is superseded ONLY where the reading
                             itself made a whole-topology claim. Otherwise supersede
                             the observations that actually depended on the topology
```

**The first draft was too coarse here.** It said a changed topology supersedes the whole reading,
which undoes the principle it was meant to express: inserting an unrelated section elsewhere in
the Work should not invalidate a local observation whose evidence never depended on the ordering.
Per-section frozen state (§4) is what makes this computable — without it, only the coarse rule is
available.

⛔ The phrase *"it is about a different book"* is withdrawn. **A changed topology is a changed
state of the Work, not a different Work.** The stronger phrasing smuggled in a judgment that would
justify discarding readings wholesale.

**INV-22 · A superseded reading is retained, not deleted, and never silently withdrawn.** It is
the record of what was true when the author read it, and an author act may refer back to it —
including an act that says *"I revised because of this."* Deleting it destroys the thing a later
declaration would point at, which is the durable-identity constraint arriving one layer up.

---

## 10 · `none` — a complete result

**INV-23 · `outcome: 'none'` is a complete reading and must be constructible with full coverage
and provenance.** It is not an error, not an empty list, and not a failure to be retried.

The distinction that must survive:

```text
outcome 'none'    she read, at this coverage, and found nothing worth the author's attention
a refusal         she could not read — scope ceiling, missing draft, changed topology
```

**INV-24 · A `none` reading carries the same coverage and provenance as any other**, because the
member's question is *"did you actually look?"* and coverage is the only honest answer. A `none`
with no coverage is indistinguishable from a reading that never ran.

---

## 11 · Provenance

**INV-25 · A reading records what read it, under which contract: at minimum provider, resolved
model, reader version, prompt/contract hash, and a server-stamped freeze time.**

**The whole existing vocabulary, not a narrowed one.** `ReaderProvenance` already carries five
fields, and the first draft kept three:

```ts
provenance {
  provider           // the platform-resolved provider
  model              // THE RESOLVED MODEL ACTUALLY USED, never a default's name
  promptHash         // over the system prompt and the tool contract, together
  readerVersion      // e.g. a DEVELOPMENTAL-READER-01 constant
  frozenAt           // ISO-8601, stamped SERVER-SIDE at the write
}
```

Dropping `provider` and `model` would have been the costly omission. The resolved model is what
makes *"which reader said this"* answerable after a model changes underneath the same reader
version — and a developmental reading is exactly the artifact someone will later want to ask that
about. `frozenAt` is stamped by the store, not supplied by the caller, for the same reason the
structure store does it: a caller-supplied timestamp is a claim, not a record.

---

## 12 · The invariants, collected

```text
INV-0   outcome discriminates observations both ways: 'reading' is non-empty,
        'none' is empty; neither other combination is constructible
INV-1   reading identity is minted, not derived from content
INV-2   an observation is addressed as (readingId, observationKey)
INV-3   observation identity outlives the response and the surface
INV-4   a frozen reading is never corrected in place; a correction is a new reading
INV-5   an EvidenceRef is typed, durable, recoverable through the reading's frozen
        state, and able to name textual AND authored-structure evidence.
        Concrete variants and quote policy are BUILD-07A
INV-6   an EvidenceRef carries no version of its own
INV-7   a reading freezes topology, input fingerprint, and structure fingerprint when supplied
INV-7a  a reading freezes the exact state of every section it covered, per section
INV-7b  SectionState and structureContext must RESOLVE to the state read, not only
        detect that it changed; a bare digest compares but does not recover
INV-8   evidence must be backed by coverage at the depth THAT evidence requires;
        prose-derived evidence requires body depth
INV-9   an observation's unread span is derivable and presentable, never stored
INV-10  lens and phenomenon are separate, neither derivable from the other
INV-11  one observation is one (lens, phenomenon) pairing
INV-12  phenomenon classifies the observation; it is not a layer beneath it
INV-13  observation required; interpretation, questions, possibilities, uncertainty optional
INV-13a questions attach to an observation, inherit its evidence and address, and do
        not require an interpretation; a reading-level list is derived, never stored
INV-14  authority upward only: possibility ⊂ interpretation ⊂ observation ⊂ evidence
INV-15  possibilities must leave no-change legitimate; a second option is never manufactured
INV-16  structure-dependence is a property of the OBSERVATION, not of the reading,
        and is a discriminated relation — never a boolean plus a singular ref
INV-16a structure-dependent observations exist only where authoritative structure was supplied;
        absent, not degraded
INV-17  structural evidence names member-authored structure — one unit, several, or
        the authored topology — never a proposal id or reviewed unit key
INV-18  scope is per-reading, never per-session
INV-19  a reading is never re-anchored
INV-20  staleness is three-state: current · superseded · unmeasured
INV-21  supersession is scoped to what moved, per observation
INV-22  a superseded reading is retained and never silently withdrawn
INV-23  'none' is a complete result, not an error
INV-24  a 'none' reading carries full coverage and provenance
INV-25  provenance records at minimum provider, resolved model, reader version,
        prompt/contract hash, and a server-stamped freeze time
```

**Falsifiable by construction.** INV-8, INV-11, INV-14 and INV-15 can each be violated by a shape
that type-checks, which is why they are stated as invariants rather than left to the field list.
INV-2, INV-3, INV-7a, INV-7b and INV-19 cannot be repaired downstream if the first implementation
gets them wrong — and INV-7b is the one whose absence would be discovered latest, when someone
first tries to show an author the evidence behind an old observation and finds the system can
only report that it changed.

---

## 13 · What this document does not do

```text
no table · no migration · no route · no prompt · no surface · no reader
no TypeScript file · no frozen lens enum · no frozen phenomenon list
no context regime — what a developmental reader may receive is still open (UNDERSTAND §2)
no definition of EvidenceRef, its variants, or quote policy — BUILD-07A
no naming of SectionState, the recoverability mechanism, or the fingerprint implementation
no concrete structural-reference variants
no repair of FIND's F1, F2 or F3
no authorization of BUILD
```

**BUILD opens on its own authorization.** Its first unit is `BUILD-07A DEVELOPMENTAL EVIDENCE` —
what MAIA can establish mechanically — and the lane already says defining what evidence *is*
belongs there, downstream of this object rather than inside it. Naming what a `SectionState`
actually is (§4) belongs there too.
