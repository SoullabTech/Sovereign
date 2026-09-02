# WS2-07 · DECIDE — the DevelopmentalReading object

```text
LANE        JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01 · DECIDE
INPUTS      FIND       canonical @ cc9788e4f   WS2-07A_…_CENSUS
            UNDERSTAND canonical @ 5670163e6   WS2-07B_…_SEMANTICS
AUTHORIZES  nothing to be built
DATE        2026-09-02
```

⛔ **No table, migration, route, prompt, surface, reader, or TypeScript file is created here.**
The shapes below are written in TypeScript because it is the least ambiguous notation available
for a shape, **not because a file is being specified.** Field names are proposals; the
**invariants are the deliverable.**

> **A numbering note.** This document is filed under the flow stage `DECIDE` rather than a letter,
> because `07A`/`07B`/`07C` are already ambiguous in the lane — see its collision note. Under the
> provisional resolution, the lettered `07A–07H` are build units inside BUILD, and this document
> precedes all of them.

---

## 1 · The reading

```ts
DevelopmentalReading {
  id                  // durable, server-minted, outlives the response
  workId
  outcome             // 'reading' | 'none'
  scopeMode           // 'structure-independent' | 'structure-aware'
  scope               // what was asked about
  readState           // what the Work was when she read it
  coverage            // what she actually read, per section
  observations[]      // may be empty only when outcome is 'none'
  provenance          // who read, which version, under which contract
}
```

Six decisions are load-bearing. Each is stated as an invariant that an implementation either
satisfies or does not.

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

**INV-4 · The pair is never reissued.** An observation key, once used in a reading, is never
reassigned within that reading — including after a correction that removes the observation. A
reference that resolves to a *different* observation than it did yesterday is worse than one that
resolves to nothing.

---

## 3 · EvidenceRef — what it points to

**INV-5 · An `EvidenceRef` points at a draft section by its stable identity, never at a character
offset in prose, and never at a heading string.**

```ts
EvidenceRef {
  sectionId        // manuscript_draft_sections.id — the identity the Work already uses
  quote?           // an exact substring, for display and for re-finding
}
```

Three consequences, in the order they matter:

**Section identity is the only durable address the Work has.** Positions renumber when a section
is inserted; headings are edited; character offsets move on every keystroke. The draft section id
is what 05A, 05B and 6A all already address, and adding a fourth addressing scheme for
developmental evidence would create the divergence 07A found between proposal-internal and
canonical unit identity.

**A quote is evidence for a human, not an address for a machine.** It is optional, it may fail to
re-find after an edit, and **failing to re-find is a finding, not an error to paper over** — it
means the passage the observation rested on has changed. An implementation that silently
fuzzy-matches a moved quote has invented evidence.

**INV-6 · A ref carries no version of its own.** Versioning lives on the reading (§4), once. Per-ref
versions would let one observation claim currency its own reading cannot support.

---

## 4 · readState — what the Work was when she read it

**INV-7 · A reading freezes what the Work was, using the fingerprints the system already has.**

```ts
readState {
  sectionTopologyHash      // ordered stable section ids — the HARD gate
  interpretationInputHash  // headings + supplied bodies — a SOFT signal
  structureFingerprint?    // canonicalFingerprint(), present iff scopeMode is structure-aware
}
```

The hard/soft split is inherited from 6A rather than redesigned: **a changed topology means the
reading is no longer about this book; a rewritten body is something the member is told about, not
a reason to refuse their reading.** `structureFingerprint` is `canonicalFingerprint()`, which
already digests every field of the authored structure — a count would miss a renamed division or
a section moved between divisions.

---

## 5 · Coverage — at the granularity the claim is made at

07B requires that coverage be reported at the granularity of the claim. That is a constraint on
what must be **derivable**, and it is satisfied by recording depth per section rather than a
percentage.

```ts
coverage {
  sections: Map<sectionId, 'heading' | 'body'>   // what depth was actually read
  ceilingRefused?: ReadScopeReport               // if a bounded read was refused, say so
}
```

**INV-8 · Every section an observation's evidence names must appear in `coverage` at `'body'`
depth.** An observation resting on prose she did not read is not evidence-grounded, and this makes
that unconstructible rather than discouraged.

**INV-9 · An observation's unread span is derivable and must be presentable.** An observation
spanning positions 18–47 whose coverage holds bodies for 18, 19 and 47 has an unread span of
20–46. That is computable from `coverage` plus the observation's evidence, so it is **not stored**
— storing it would let it disagree with the coverage it summarises.

> **The failure this prevents.** A structural reading of 40% of a chapter that says so is
> trustworthy. A *developmental* reading of 40% that presents itself as whole is a claim about a
> Work the reader never saw.

---

## 6 · Lens and phenomenon — held apart structurally

07B ruled these are two independent lists related many-to-many. The object must not quietly
reintroduce a mapping.

```ts
DevelopmentalObservation {
  key                 // reading-internal; see INV-2
  lens                // the editorial question being asked
  phenomenon          // what the reading noticed
  evidenceRefs        // NonEmptyArray<EvidenceRef>
  observation         // required — what the evidence shows
  interpretation?     // optional — what it may mean
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
no `Phenomenon` object between evidence and observation. 07B settled this; the object must not
reopen it by giving phenomena their own identity or their own evidence.

⛔ **Neither the lens set nor the phenomenon set is frozen here.** The seven lenses stand as
canon; which phenomena are detectable is a BUILD question, downstream of what evidence can
actually be established.

---

## 7 · The epistemic layers, encoded

**INV-13 · `observation` is required; `interpretation`, `possibilities` and `uncertainty` are
optional.** An observation that stops at evidence and observation is complete and honest. A
required interpretation field manufactures interpretation to fill it.

**INV-14 · Authority moves upward only, and the encoding enforces it.**

```text
possibilities   present only if interpretation is present
interpretation  present only if observation is present
observation     present only if evidenceRefs is non-empty (by type)
```

A possibility rests on an interpretation; an interpretation rests on an observation; an
observation rests on evidence. **A possibility with no interpretation is a recommendation with its
reasoning removed** — the reader cannot see what it answers.

**INV-15 · `possibilities` is a set, and the set must leave no-change legitimate.** 07B's
obligation is structural rather than lexical: the rule binds the option set, not the wording, and
**a single possibility cannot satisfy it** — one option is not a choice. This is why the field is
plural.

⛔ **No `severity`, `priority`, `confidence`, `score` or `rank` field.** 07B's prohibitions are
enforced by absence: a field that exists will be populated, and a schema with a severity column
has already decided that MAIA rates the Work.

---

## 8 · Scope — structure-aware and structure-independent

**INV-16 · `scopeMode` is declared on the reading, and structure-aware is available only where the
member has authored structure.** Where none exists, structure-aware reading is **ABSENT, not
degraded**: the reading is structure-independent, and it may not reason from the proposal or from
draft section order as though either were a member declaration.

**INV-17 · A structure-aware observation carries `divisionRef`, and it names a canonical unit.**

```ts
divisionRef {
  unitId    // manuscript_structure_units.id — a member-authored division
}
```

Not a proposal id, not a reviewed unit key. This is the direct answer to 07A's F2: the reading
reasons about what the member declared the Work to be.

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

**INV-21 · Supersession is scoped to what actually moved**, because the hard/soft split from §4
carries through:

```text
topology moved      → the whole reading is superseded. It is about a different book
bodies moved        → prose-dependent observations are superseded; the member is TOLD,
                      and the reading is not withdrawn
structure moved     → structure-AWARE observations are superseded.
                      Structure-INDEPENDENT observations in the same reading are NOT
```

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

**INV-25 · Every reading records what read it, under which contract.**

```ts
provenance {
  readerVersion      // e.g. a DEVELOPMENTAL-READER-01 constant
  promptContractHash // hash over the contract, so a changed prompt is visible
  readAt
}
```

Inherited from `readerProvenance.ts` + `promptContractHash()` rather than reinvented — the lane
names this triad as the pattern Stage 7 inherits, and a second provenance vocabulary would make
"which reader said this" unanswerable across two systems.

---

## 12 · The invariants, collected

```text
INV-1   reading identity is minted, not derived from content
INV-2   an observation is addressed as (readingId, observationKey)
INV-3   observation identity outlives the response and the surface
INV-4   an observation key is never reissued within a reading
INV-5   EvidenceRef points at a draft section id; quote is optional and non-authoritative
INV-6   an EvidenceRef carries no version of its own
INV-7   a reading freezes topology + input hashes, and structure fingerprint when structure-aware
INV-8   every section named by evidence appears in coverage at body depth
INV-9   an observation's unread span is derivable and presentable, never stored
INV-10  lens and phenomenon are separate, neither derivable from the other
INV-11  one observation is one (lens, phenomenon) pairing
INV-12  phenomenon classifies the observation; it is not a layer beneath it
INV-13  observation required; interpretation, possibilities, uncertainty optional
INV-14  authority upward only: possibility ⊂ interpretation ⊂ observation ⊂ evidence
INV-15  possibilities is a set that leaves no-change legitimate; one option is not a choice
INV-16  scopeMode declared; structure-aware absent, not degraded, without authored structure
INV-17  a structure-aware observation names a canonical unit, never a proposal unit
INV-18  scope is per-reading, never per-session
INV-19  a reading is never re-anchored
INV-20  staleness is three-state: current · superseded · unmeasured
INV-21  supersession is scoped to what moved
INV-22  a superseded reading is retained and never silently withdrawn
INV-23  'none' is a complete result, not an error
INV-24  a 'none' reading carries full coverage and provenance
INV-25  every reading records reader version, prompt contract hash, and read time
```

**Falsifiable by construction.** INV-8, INV-11, INV-14 and INV-15 can each be violated by a
shape that type-checks, which is why they are stated as invariants rather than left to the field
list. INV-2, INV-3 and INV-19 cannot be repaired downstream if the first implementation gets them
wrong.

---

## 13 · What this document does not do

```text
no table · no migration · no route · no prompt · no surface · no reader
no TypeScript file · no frozen lens enum · no frozen phenomenon list
no context regime — what a developmental reader may receive is still open (07B §2)
no repair of FIND's F1, F2 or F3
no authorization of BUILD
```

**BUILD opens on its own authorization.** Under the lane's provisional resolution its first unit
is `07A DEVELOPMENTAL EVIDENCE` — what MAIA can establish mechanically — and the lane already
says defining what evidence *is* belongs there, downstream of this object rather than inside it.
