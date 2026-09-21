# WS-OBSERVATION-FIRST-01 · SUBSTRATE CENSUS

**READ-ONLY. Repository truth only — ⛔ no live or shadow database was read.**
⛔ **This census opens no lane, proposes no design, and authorizes nothing.**

Commissioned 2026-09-20 to answer one question: *does an observation exist as a
first-class object, or only as a stepping stone to replacement wording?*

---

## ⭐⭐ VERDICT — THE PREMISE OF MY OWN RECOMMENDATION WAS WRONG

I recommended *"invert the primitive — make the observation first-class and the
proposal derived."* ⛔ **That work is largely already done.**

`DevelopmentalObservation` is a genuinely first-class, well-built object, and it
is **live**. What is broken is **one handoff**, in one callback, and the
substrate on both sides of it already exists.

**The lane is small. It was worth looking before building.**

---

## 1 · What exists, and whether it is reachable

| object | home | reachable? |
|---|---|---|
| `DevelopmentalObservation` | `developmentalReading/contract.ts` | ✅ **live** — commissioned, frozen, stored, rendered |
| `proposal_chain_insights` (table) | `20260914000005_editorial_ontology.sql` | ✅ exists · ✅ read into cognition · ❌ **never written** |
| `EditorialInsight` (object) | `editorialWorkspace/store.ts` | ❌ **unreachable** |
| `DevelopmentalDirection` | `editorialWorkspace/store.ts` | ✅ live, both authors |
| `ProposalVersion` | `proposalChain/store.ts` | ✅ live |

**Caller counts, measured** (excluding the module itself and its tests):

```
createInsight            → 0
readInsights             → 0
openChainWithInsight     → 0      (the single "hit" is a COMMENT in another file)
createMaiaDirection      → 1
createMaiaDirectionWithExecutor → 2
```

---

## 2 · ⭐ `DevelopmentalObservation` is better than the flow that consumes it

```ts
interface DevelopmentalObservation {
  key: string;                 // stable for the life of the reading
  lens: DevelopmentalLens;     // the question it was commissioned under
  phenomenon?: DevelopmentalPhenomenon;   // ⭐ OPTIONAL, and the reason is law
  evidenceRefs: NonEmptyArray<EvidenceRef>;
  observation: string;         // the reader's claim, VERBATIM
  doesNotEstablish: NonEmptyArray<DevelopmentalNonConclusion>;   // ⭐⭐
  structureDependency: StructureDependency;
}
```

Two things in it are exactly the developmental-editor discipline, already
encoded:

- ⭐ **`phenomenon` is optional, and its absence never invalidates the
  observation.** *"Observation has ontological priority over classification —
  the taxonomy may describe a developmental observation, but it may neither
  manufacture one nor veto one."*
- ⭐⭐ **`doesNotEstablish` is NON-EMPTY and REQUIRED.** Every noticing must
  declare what it does not prove. **This is the constraint that a developmental
  editor carries in their head and that MAIA is required to carry in the type.**

The phenomenon vocabulary is closed and earned: `recurrence ·
unresolved-thread · register-shift · prospective-reference ·
re-explanation-first-mention · movement · term-drift · positional-asymmetry`.

⭐ And the migration already refused the failure I was worried about, in its own
words: *"An Insight on a chain with ZERO versions is lawful — which is precisely
how **'I noticed this, and I would leave it'** exists without manufacturing a
Suggestion. **A system whose only expressive act is replacement will always find
something to replace.**"*

---

## 3 · ⭐⭐ THE DEFECT — one callback, and it explains 2026-09-19 exactly

`re-explanation-first-mention` is the phenomenon label in the founder's own
screenshot of the incident (`01 · re-explanation / first-mention`). **The
2026-09-19 rewrite began inside a correct, disciplined observation.**

The handoff is `InsightReading.tsx` → *"Revise this passage"* →
`reviseInsightPassage` (`RebuildStudioClient.tsx:957`). What crosses it:

```
✅ passage        sectionId · range · exact text      → holdPassage()
✅ authorNotes    the writer's own intention text     → the editorial draft
```

What does **not** cross it:

```
❌ o.observation        MAIA's own noticing
❌ o.lens               the question it was commissioned under
❌ o.phenomenon         what kind of noticing it was
❌ o.doesNotEstablish   ⭐⭐ WHAT IT DOES NOT ESTABLISH
❌ o.evidenceRefs       what it was grounded in
```

**The editorial thread opens knowing only which characters and what the writer
typed.**

⭐⭐ **So the mechanism of the incident is now fully accounted for.** MAIA
noticed something narrow and declared its limits. The writer opened it to work
on. The editorial thread inherited **none of that** — so MAIA re-derived, from
an unconstrained start, what the passage needed. With no observation to serve
and no declared non-conclusion to respect, the largest available act was the one
she took.

> ⭐ **The observation is the constraint. Dropping it at the handoff is what let
> the proposal expand to fill the passage.**

⚠️ The four laws landed on 2026-09-20 (change-scope · read-scope · voice ·
sequence) **bound the blast radius of this defect. ⛔ They do not repair it.** A
proposal can now be small, in the writer's vocabulary, and discussed first — and
still be answering a question nobody asked, because the question was dropped one
screen earlier.

---

## 4 · ⭐ BOTH ENDS ARE BUILT. THE MIDDLE IS UNCONNECTED.

This is the census's most useful finding:

- **Receiving end** — `assembly.ts` already reads `proposal_chain_insights` into
  `system.writer_editorial_history`, so an Insight on the chain would reach
  MAIA's cognition today with correct provenance.
- **Sending end** — `openChainWithInsight(memberId, input, observation)` already
  exists: one atomic act, chain + first Insight, documented against the exact
  failure of a half-written open, deliberately no `ok:false` path.
- **Middle** — nothing calls it.

⛔ **The census names this and does not propose using it.** Whether the
observation should travel as an `Insight`, as a Direction, as a new object, or
not at all is a design act with its own ruling.

---

## 5 · ⚠️ Questions owed before any design act

1. **Does the observation travel as an `Insight`?** It is MAIA-authored by CHECK
   constraint (`author = 'maia'`), which fits — but an Insight is a free-text
   `observation` column and would **drop `lens`, `phenomenon`,
   `doesNotEstablish` and `evidenceRefs` on the way in**. ⛔ Carrying the
   observation while losing its limits would repeat the defect one layer down.
2. **Is `doesNotEstablish` binding on MAIA, or only visible to the writer?** The
   strong reading — *a proposal may not depend on what its originating
   observation declared it does not establish* — is a real constraint and a real
   ruling. ⛔ Not assumed here.
3. **What happens when the observation is superseded?** `o.state` already
   carries `current | superseded`, and the editorial thread has no equivalent.
4. **Can a writer open an editorial thread from an observation without
   committing to revise it?** Today the button is *"Revise this passage"* —
   ⭐ the verb decides the act before the conversation starts.
5. **`readInsights` has 0 callers**, so even if Insights existed nothing would
   display them to the writer.

---

## 6 · ⛔ What this census did NOT establish

- ⛔ No claim about production data. Repository truth only.
- ⛔ No claim that the four 2026-09-20 laws are sufficient, or insufficient, for
  anything beyond the bounds they assert.
- ⛔ No design. ⛔ No preferred implementation. ⛔ No migration.
- ⚠️ `EditorialThreadView`, `InsightReading` and `RebuildStudioClient` were read
  **at this checkout**. The founder's screenshot shows a *Develop* view whose
  copy (*"MAIA found 17 places to explore"*, *"Let's find what this work wants
  to become"*) **does not appear in this tree** — so a surface exists that this
  census has not seen, and its handoff may differ.

**Standing: CENSUS COMPLETE · READ-ONLY · OBSERVATION SUBSTRATE ✅ LIVE AND WELL
BUILT · `EditorialInsight` ❌ UNREACHABLE (0 callers) · HANDOFF DEFECT ✅ NAMED
AND UNREPAIRED · ⛔ DESIGN NOT OPENED · ⛔ NO CODE CHANGED · PRODUCTION
UNTOUCHED.**

> ⭐⭐ *I recommended inverting the primitive. The primitive was already
> inverted, once, in a lane that built it properly — and then one callback
> handed the passage forward without it. The expensive lane was not needed. The
> cheap one had not been looked for.*
