# Authority × Time — the working decomposition of relational memory

**Status:** WORKING DECOMPOSITION, adopted by founder ruling after R12 (2026-09-06). Not a claim
that it exhausts the nature of human memory. Not a schema. Not a runtime change. Inputs to the
Episodic Phase 2 spec (`docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`, sequence step 5)
and to the whole memory review. Authorizes nothing at runtime.

**Replaces:** the four-type typology (episodic · semantic · pattern · state-responsive) carried in
Synthesis v0.1 R7 from source [22]. That typology is withdrawn as a supported universal
decomposition; it may be cited, attributed to its source, as one proposed framework (conceptual,
vendor-authored, unvalidated — `evidence/SOURCE_LEDGER.md` row 22).

**Ruling record:** `inquiries/R12_MEMORY_IDENTITY_TRANSFER_2026-09-06.md` §8 rows 1–4.

## 1 · The two axes

### Authority — who or what stands behind a remembered item

| Class | Meaning | Already in the repository as |
|---|---|---|
| member-stated | the member said it | verbatim turn content |
| member-marked | the member authored its salience | `is_breakthrough`, anchors, `return_preference` |
| observed | a witnessed event or act, not an inference | encounter / session records |
| system-inferred | MAIA's derivation from other material | derived atoms, pattern rows |
| practitioner-observed | a human practitioner's note, where a practice field exists | Co-Lab / practitioner scopes (bounded) |
| computed | a numeric or structural result of a defined procedure | spiral state, decay values |
| historical pattern | recurrence across time, itself an inference over observations | `pattern` memories |
| house-authored | Soullab's own vocabulary or framing offered to the member | Spiralogic reference, house prompts |

Minimum requirement: every remembered item carries its authority class. The line **member-marked
vs system-inferred** remains the line (Phase 2 discipline, unchanged).

### Time — when a remembered item is true, happened, or was believed

| Axis | Question it answers | Temporal Memory direction |
|---|---|---|
| event time | when did it happen? | episode `occurred_at` |
| valid time | when was it true? | assertion `valid_from` / `valid_to` |
| transaction time | when did the system record or learn it? | row timestamp |
| belief-at-record | what did MAIA believe at that point? | the discriminator query (5) |

These are the five predeclared Episodic Phase 2 acceptance queries in the session anchor, restated
as axes. Temporal recall names the axis it resolved on; ambiguity is clarified with the member,
never silently chosen.

## 2 · The evidence-beneath-derivation rule

Verbatim or primary evidence stays beneath derived interpretation wherever possible.

- A summary must not erase the evidence from which it was derived.
- A pattern must not replace the observations from which the pattern was inferred.
- A derived item without reachable evidence is an impression, and licenses *ask*, not *record* (U33).

## 3 · Present-member authority — operational form (R7b, precise)

**Member statement.** A present member statement overrides an old MAIA model *as the authoritative
account of the member's present self-report*. It does not rewrite history.

```text
HISTORICAL   "I never want to live in a city again."
PRESENT      "I've changed. I want to move to New York."
RESULT       historical statement remains true as history;
             present statement governs current orientation.
```

**MAIA impression.** MAIA's impression of a changed state does not override historical material.

```text
MAIA detects possible change
        ↓
does not overwrite
        ↓
asks / explores
        ↓
member confirms, rejects, nuances, or leaves unresolved
        ↓
record with provenance
```

Boundary: member authority over their present self-report is not omniscient factual authority
over external reality. Provenance stays intact. **detect → ask → record**, never
**infer → overwrite** — the Temporal Memory direction's Decision 3, now with an evidence basis
(R12 D13, D14: measured present state overrides clinicians' accumulated models; impressions
degrade prediction).

## 4 · Five design directions (spec inputs, founder-refined)

| | Direction | Rule |
|---|---|---|
| A | Preserve qualification | never derive "X believes Y" from a hedged statement without carrying the hedge; later correction, contradiction and qualification stay attached to derived memory |
| B | Change-sensitive retrieval | *when evidence of change, contradiction or staleness exists, change-sensitive retrieval outranks simple similarity*; similarity remains useful absent temporal conflict; the protection is against an old, highly similar statement continually defeating a newer changed position (Temporal Memory audit F2 becomes a safety question) |
| C | Detect implicit contradiction | a later statement need not say "I changed my mind"; detection creates a question, not a transition |
| D | Protect authorship of the self-record | MAIA may contribute interpretations and observations; derived material stays visibly derived — visible where appropriate · provenance-bearing · correctable · retractable · defeasible. *The system may contribute to the record; it may not silently become the author of the person.* |
| E | Memory is never leverage | "you said before…" establishes continuity, never obligation; past preference does not bind future preference; past vulnerability does not authorize present persuasion; past disclosure does not invite more disclosure; past intimacy does not create relational debt |

## 5 · What P8 now says (refined by ruling)

Memory should remain available to the person's present life and self-authored becoming without
allowing a historical model to define who they are now or who they ought to become. Historical
continuity may inform; it may not govern. Recurrence does not create identity ("this is who you
really are", "you always do this" are prohibited uses of remembered material). A present account
may contradict a historical pattern without being treated as inconsistency requiring correction.
**The open future is a design requirement.** Selective is not forgetful: relevance with restraint,
enough history for genuine continuity while remaining capable of meeting the person who is here now.

> Memory should allow a relationship to have a history without requiring a person to remain who
> they were when that history was made.

## 6 · What this does not do

- Does not change any table, loader, prompt, retrieval cut, decay function or consent gate.
- Does not close U29–U33; the amplifier evidence is model-output-side and unmeasured in a
  consented dyad.
- Does not claim the decomposition is complete. New authority classes or time axes are added by
  spec, with a witness, not by this note.
