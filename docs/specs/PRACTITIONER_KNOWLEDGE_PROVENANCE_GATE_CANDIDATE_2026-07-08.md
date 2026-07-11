# Practitioner-Knowledge Provenance Gate — B′ (CANDIDATE)

**Date:** 2026-07-08
**Status:** CANDIDATE governance pattern — **not a constitutional primitive.** Demonstrated once (against the §14 Larry decision, grounded in prior canon). Standing: *carry into implementation as a hypothesis.* Broader constitutional standing is earned **only if the same provenance structure simplifies unrelated stewardship problems across different practitioner domains** (physician / therapist / clergy / attorney Studios). If each domain needs a different structure, this is Larry-specific, not a pattern — that is the falsifier.
**Origin:** resolves "Option B′" from `docs/canon/CONTINUITY_CONTEXTUALITY_PATTERN_CANDIDATE_2026-07-08.md` §14. The §6 test excluded Option B (unpublished client-derived recognitions) *as written* because it fails `MAIA_MEMORY_CANON:61`'s consent-gate. B′ is the repair: not "add a consent gate," but **classify provenance, then route to the appropriate stewardship rule** — because "client-derived" is not one kind of thing.

## 0. Reconciliation first (grep done 2026-07-08 — do NOT invent parallel vocabulary)

This spec **specializes existing canon**; it introduces no new primitives. Every gate question maps to a term already load-bearing in the repo:

| B′ gate question | Existing canonical home |
|---|---|
| **Origin** — where did this recognition first emerge? | *Source provenance* — `ECOLOGY_OF_MIRRORS.md` ("traceable to origin, not fabricated/inferred"); *write event* — ADR-013 ("who authored, when, from what write event") |
| **Custody** — who has legitimate authority over its transmission? | *Consent / custody* — `DEVELOPMENTAL_ECOLOGY_CANDIDATE.md`; the sealed **`lib/caseload/`** subsystem (CaseMemoryService, CaseStore) is the current custody boundary |
| **Transformation** — has it become an authored teaching independent of any client? | *Authorship* rung — `ECOLOGY_OF_MIRRORS.md`; *authority from write event* (a new authored teaching is a new write event, author = Larry) |
| **Consent** — what permissions govern inclusion? | *consent-gated* — `MAIA_MEMORY_CANON:61`; *consent status, share-scope* meta-memory fields — `MAIA_MEMORY_CANON:36` |
| **Representation** — how may it be expressed in the Studio? | *Offering* rung — `ECOLOGY_OF_MIRRORS.md`; *Living Field Mirror Invariant* (never synthesis) |

**Enforcement location (given, not chosen):** ADR-013 — *"Context Assembly enforces AIN OS boundaries (consent, provenance, ephemerality) before the model is reached."* The gate is a **Context Assembly admissibility filter** over caseload-derived material, not a per-Studio reimplementation.

## 1. The provenance classifier

"Client-derived recognition" is a spectrum, not a category. Four classes, each with a different rule (default = **deny admission to the Studio field**; a recognition must be *classified up* into admissibility):

| # | Recognition | Provenance | Admissible to Studio field? |
|---|---|---|---|
| 1 | Universal principle Larry independently developed, later observed to recur | Larry's practice | **Yes** — authored by Larry; no client is its origin |
| 2 | Technique Larry developed, tested, and teaches publicly | Larry's authored work | **Yes** — clean write event, published |
| 3 | Pattern abstracted across many clients but *first recognized inside* confidential encounters | **Mixed** | **Only via B′** — requires transformation + consent governance |
| 4 | A framing that clearly emerged from one particular client's experience | Client relationship | **No** (absent that client's explicit consent) — custody is the client's |

Classes 1–2 were always admissible (this is Option A). Class 4 is excluded (this is what §6 correctly caught). **Class 3 is the only genuinely contested case — and the whole reason B′ must exist.**

## 2. The gate (ordered — origin determines jurisdiction)

For any Class-3 candidate, in order. Failing any step → **not admissible** (stays in `lib/caseload/`, sealed):

1. **Origin.** Establish source provenance and the write event. If untraceable → deny (fabricated/inferred material has no provenance; `ECOLOGY_OF_MIRRORS`).
2. **Custody.** Identify who holds legitimate transmission authority. Default custody of client-encounter material is the **client's**, not Larry's — this is the finding §14 turned on.
3. **Transformation (the load-bearing test — the one genuinely new contribution of B′).** State it as a *constitutional question about authorship, not privacy*:
   > **Has this recognition become part of the practitioner's own authored body of work?**
   This reframes admissibility from *"can someone identify the client?"* (privacy) to *"has this become authored knowledge?"* (authorship). A recognition can satisfy privacy and still fail authorship — those are different standards, and authorship is the higher one. If **yes**: Larry is the write-event author, provenance stays inspectable, it enters under existing governance. If **no**: it remains in custodial space and cannot cross Context Assembly.

   **Anti-laundering guard (added — the failure mode authorship introduces that privacy did not):** authorship centers the practitioner, which is right — but it must not become a bare *declaration* by the interested party. Larry benefits from admitting the recognition, so "I have authored this now" cannot be self-certifying. The objective test authorship must still pass is **de-individuation**, not merely de-identification: the pattern must no longer encode a specific person's particular experience. A story lightly generalized and then declared "authored" is authorship-laundering, and the client's custody (step 2) is the backstop — *authority does not transfer by the interested party's say-so* (`provenance ≠ authority`; `writable ≠ admissible`). So: **authorship is the frame; de-individuation is the gate authorship must clear.** Passing both → Class 3 rises to Class 1 via a new authored write event. Failing de-individuation → collapses to Class 4, stays sealed, regardless of any authorship claim.
4. **Consent.** If transformation is incomplete, `MAIA_MEMORY_CANON:61` governs: *distilled + anonymized + **consent-gated.*** Absent client consent, deny. (Consent status + share-scope live in meta-memory, `:36`.)
5. **Representation.** If admitted, how it may surface is bounded by the *Living Field Mirror Invariant* — reflected/offered, **never synthesized** into a claim about a present member.

## 3. Implementation — grounded in the caseload audit (2026-07-08)

### 3.0 Ground truth (verified against migrations + code, not assumed)
- **Table:** `case_memories` (base: `20260107000001_practitioner_caseload.sql`).
- **The seal, as it actually exists, is three things:** (a) every read is scoped `WHERE case_id = $1 AND practitioner_id = $2`; (b) a DB CHECK constraint `case_memories_maia_held` (migration `20260626000002`): `authorship = 'practitioner_authored' OR crossing_allowed = FALSE`; (c) **no caller wires `case_memories` into field/sovereign context** — grep-confirmed zero references in `app/api/sovereign/`. So there is **no live leak**; the gate is *pre-emptive*, and must be in place *before* anyone builds a case→field wire.
- **Columns that already exist:** `authorship` ∈ {`practitioner_authored`,`maia_inferred`,`maia_suggested`}, `crossing_allowed` BOOLEAN DEFAULT FALSE, `source_note_id`, `source_consultation_id`, `significance`.
- **Absent (B′ must add):** consent status, share-scope, **de-individuation flag**, write-event author/timestamp metadata, and an **append-only admissibility ledger** (today `crossing_allowed` is a mutable boolean → flipping it *mutates origin*, violating §2's immutability invariant).

### 3.1 The load-bearing finding: the existing constraint and B′ are on **different axes**
The shipped `authorship` field answers *"did the practitioner or MAIA originate this representation?"* It does **not** answer *"is a specific client's experience still encoded?"* Those are orthogonal:

- `case_memories_maia_held` gates on **origin-of-authorship** (practitioner vs MAIA). It permanently holds MAIA-originated rows — good — but it lets any `practitioner_authored` row set `crossing_allowed = TRUE` **with no de-individuation check.**
- B′'s transformation test gates on **client-entanglement** (individuated vs de-individuated).

⟹ **`practitioner_authored` is necessary but NOT sufficient for B′.** A memory can be practitioner-authored (passes the DB constraint) and still encode one client's experience (fails B′). This is exactly the authorship-laundering vector from §2 — and it is *latent* in the shipped schema today: the constraint trusts the label. It is not yet exploitable (no case→field wire), which is precisely why B′'s second axis must land *before* the wire.

### 3.2 Convergence (encouraging, but calibrate it)
Migration `20260626000002` was authored **before** this conversation and independently arrived at B′'s core — *authorship gates crossing* — and its own header comment (lines 11–14) even names the continuation B′ proposes: *"a future steward authorization workflow… an authorized_crossings table with a separate write path. Do not silently bypass it."* That is §2's append-only ledger, foreseen. **Calibration:** this is convergence *within one author's ecosystem*, so it is evidence of internal coherence, not external validation. It raises confidence; it is not a second independent mind confirming the design.

### 3.3 Implementation steps
1. **Do not drop `case_memories_maia_held`.** Build *on top* of it. It correctly holds MAIA-originated rows; B′ adds the second axis for `practitioner_authored` rows.
2. **Add the de-individuation axis — as a review *event*, not a stored boolean.** De-individuation is the *outcome of an accountable review* (who judged it, on what basis, when), recorded in the append-only ledger (step 3), not a flag asserted on the row. Crossing eligibility = `authorship='practitioner_authored'` **AND** an approving crossing event exists **AND** consent-satisfied. See `AUTHORIZED_CROSSINGS_IMPLEMENTATION_PLAN_2026-07-08.md` for the executable form.
3. **Add the append-only admissibility ledger** the migration comment anticipated: `case_memory_admissibility_events(memory_id, event_type, decided_by, reason, decided_at)`. Admissibility is **derived** from the latest event; the `case_memories` origin row is never mutated (satisfies §2). This replaces flipping `crossing_allowed` in place.
4. **Add consent + share-scope** fields (absent today); `practitioner_cases.privacy_mode` governs case *visibility*, not memory *crossing* — do not overload it.
5. **Enforce at the assembly seam, before the model** (ADR-013): the case→field wire, *if ever built*, must pass through a filter — candidate location `app/api/sovereign/app/maia/list/route.ts` / `MemoryOrchestrator.formatForPrompt()` — admitting a case-derived row only if the derived admissibility = approved. Default deny; unclassified excluded.
6. **The transformation is a new authored write event**, author = practitioner, recorded in the ledger — never a silent promotion. *Writable ≠ admissible* (`authority-from-write-event`).

**Rung note.** Rung 4 is still ahead and unchanged: the first time the gate **refuses a *wanted* crossing** — the practitioner says *"I wish this were available"* and the system answers *"not yet"* because de-individuation hasn't occurred. A rule that refuses a *desirable* capability when conditions aren't met is governing, not documenting. What the audit *did* move: the design is no longer purely reasoned — it is now grounded in, and constrained by, a shipped artifact whose gap it correctly identified. That is rung 3, observed (not reasoned) — the strongest standing anything in today's tower has reached.

## 4. Standing & promotion (per the runner's discipline)

- **Now:** candidate governance pattern. One demonstration (§14). Justified to carry into implementation as a hypothesis.
- **Promotion to constitutional standing** requires the *same* Origin→Custody→Transformation→Consent→Representation structure to **simplify** stewardship in ≥1 unrelated domain (physician/therapist/clergy/attorney) without per-domain redesign. Cross-domain simplification is the evidence; elegance is not.
- **Falsifier:** if physician or clergy Studios need a materially different structure, B′ is Larry-specific and does not generalize. Seek that disconfirmation actively — it is worth more than three domains where it happens to fit.

## 5. Open (hold)

1. Who adjudicates the **transformation** test operationally — Larry alone, or Larry + a steward? (Ties to the Studio Steward jurisdiction bound: a steward must not read client data — so a steward likely *cannot* adjudicate Class-3 crossings; only Larry can. Cross-check `STUDIO_STEWARD_MODEL_2026-07-08.md` §3.A.)
2. Is "de-individuated vs de-identified" sharply decidable, or a gradient that itself needs a gate?
3. Does any *non-practitioner* Studio surface this same Class-3 problem — or is it specific to relationship-formed knowledge?
