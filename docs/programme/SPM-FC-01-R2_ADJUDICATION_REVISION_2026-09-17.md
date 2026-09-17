# SPM-FC-01-R2 — ADJUDICATION REVISION OVERLAY

**Standing: CANDIDATE R2 · ⛔ NOT RATIFIED · ⛔ IMPLEMENTATION NOT AUTHORIZED**

**Base contract:** `SPM-FC-01_COMBINED_D9_F5_FALSIFICATION_CONTRACT_2026-09-17.md` @ `99d6f918d7b88d4a7a674ad004261d0f2baa0c20`

**Adjudication:** `SPM-FC-01_ADJUDICATION_2026-09-17.md` @ `7d89daa6619942ac60c2ac450d9e4ab35d5d15af`

**Purpose:** apply only the ten scope corrections and standing-classification correction ordered by
adjudication. No new evidence. No new invariant. No implementation design.

---

## 0 · REVISION SEMANTICS

This file is a **normative replacement overlay**, chosen deliberately so the attacked base object
remains immutable and so adjudication drift is mechanically small.

Until ratification, `99d6f918` remains the delivered but unratified object and this R2 is only a
candidate correction.

If R2 is ratified:

1. every base clause **not named in this overlay remains verbatim and unchanged**;
2. the ten clauses named below are replaced in full by the six-field versions in this overlay;
3. the base standing block is replaced by §12 of this overlay;
4. I-19 remains a declared GAP clause, not an invariant;
5. I-33 remains an imported prior ratified law, not a D9/F5-earned invariant;
6. where base and overlay conflict, this overlay governs only the named replacement locus.

A later consolidated ratified contract may be produced mechanically from base + ratified overlay.
That clerical consolidation must prove zero drift outside the named replacement loci.

---

## 1 · I-1 REPLACEMENT — MEMBER-INITIATED DESTRUCTIVE SUBJECT AUTHORITY

#### I-1 · A member's sovereign destructive act is bound to the verified member subject

1. **Law.** For a member-initiated destructive act presented as that member's sovereign act, the
   subject is resolved from verified server-side identity. A caller-supplied target may be used only
   to detect and refuse disagreement. Any delegated destructive act requires its own explicit
   authority chain; caller assertion alone never supplies it.
2. **Evidence.** F5-B `a4b4df31` §1.2 (`delete-my-memory`: caller-supplied `userId` *is* the deletion
   subject, compared with nothing) · F5-B §2 (account closure refuses a disagreeing body `memberId`
   with 403 before any lookup) · F5-A `fd65054f` §2.3 (sanctuary purge eligibility read from
   persisted state, never from the body).
3. **Prohibited.** `member asserts another subject → system treats the assertion as sovereign
   deletion authority`.
4. **Adversarial case.** An authenticated member names another member's identifier in a destructive
   request presented as self-erasure.
5. **PASS.** Refusal before any read of the named subject's material, with no disclosure of whether
   that subject exists. A separately governed delegated path, if one exists, is adjudicated under
   its own authority chain rather than under this self-erasure warrant.
6. **FAIL.** The self-erasure act proceeds against the named subject, or the refusal reveals the
   subject's existence, or caller assertion substitutes for a delegated authority chain.

---

## 2 · I-3 REPLACEMENT — INTENTIONAL AUTHORITY SCOPE

#### I-3 · Authority may not arrive by accidental lexical or structural adjacency

1. **Law.** Authority must come from a rule whose declared scope intentionally includes the
   surface. An accidental lexical-prefix match, neighboring name, or gate on a different surface
   does not confer authority. A deliberately declared namespace rule may govern its named
   descendants.
2. **Evidence.** F5-B §1.1 — `/api/sovereignty/delete-my-memory` is authenticated by exactly one
   access-matrix rule, `{ prefix: '/api/sovereign' }`, matching because *sovereignty* begins with
   *sovereign*. F5-B §3.1 — a gated Lab Tools page confers nothing on the route beneath it.
   Convergent with D9-C §2, which rejected candidate specimens where authorization lived at the
   wrong locus or nowhere.
3. **Prohibited.** `adjacent or accidentally prefix-matched locus is protected → this locus is
   intentionally authorized`.
4. **Adversarial case.** Change the adjacent name without changing the policy declaration and ask
   whether the target remains covered; separately test a child route under a policy explicitly
   declared to govern that namespace.
5. **PASS.** Accidental coverage disappears as an authority claim; intentionally declared namespace
   coverage remains valid for its named descendants.
6. **FAIL.** A coincidence is treated as declaration, or an explicitly declared namespace rule is
   rejected merely because it is hierarchical.

---

## 3 · I-4 REPLACEMENT — TRUSTED PROVENANCE VS DECLARED ATTRIBUTION

#### I-4 · Trusted provenance is minted or verified at the writing boundary

1. **Law.** System-trusted provenance for the immediate stored artifact is minted or verified by
   the writing boundary, not accepted as trusted merely because the caller supplied it.
   Caller-declared attribution may be stored as declared metadata, but it does not become trusted
   provenance without an explicit verification or adoption act.
2. **Evidence.** D9-B `a5834c94` B9 — both writers of member-standing atom storage hardcode
   `generated_by`; `keepSource` **throws** on `practitioner_observation`; the practitioner path mints
   `generated_by = 'practitioner-observation'` with `crossing_allowed = false`. Two writers each
   structurally refuse the other's trusted provenance class.
3. **Prohibited.** `caller supplies trusted provenance value → system records it as trusted without
   verification`.
4. **Adversarial case.** Route MAIA-authored text through a member-provenance writer while also
   testing a legitimate imported attribution carried only as caller-declared metadata.
5. **PASS.** MAIA text cannot acquire member provenance; declared import metadata can be preserved
   without being promoted to trusted authorship.
6. **FAIL.** Caller assertion mints trusted member provenance, or the boundary destroys legitimate
   declared attribution merely because it came from the caller.

> ⚠️ **Fragility preserved.** D9-B B9 still records that part of the positive result rests on
> absence rather than an explicit guard. R2 narrows the law; it does not pretend the current
> organism enforces the law everywhere.

---

## 4 · I-7 REPLACEMENT — NON-DISCLOSING REFUSAL WITH GOVERNED TRUTH

#### I-7 · A refusal must not leak protected facts, and must not become opaque to the entitled member

1. **Law.** A refusal must not disclose protected existence, ownership, or material the caller lacks
   authority to know. Where the caller is entitled to the governed outcome of their own act, the
   refusal must still provide the truthful reason and change-state required by I-29 without leaking
   protected facts about another subject.
2. **Evidence.** D9-A §6.2 C5 — `minted` excluded from the refusal arm by type;
   `reading_unknown` conflates *not yours* with *does not exist*. Convergent with F5-A §2.1 and
   §2.3 non-disclosing `not_found` behavior. F5 adjudication `1a721c37` §4 and I-29 establish the
   distinct member-visible truth obligation for the member's own governed erasure outcome.
3. **Prohibited.** `refusal → leak protected object/owner facts`, and also
   `non-disclosure → hide the entitled member's governed outcome`.
4. **Adversarial case.** Compare the response to an unauthorized request for another sovereign's
   object with a non-existent object; separately trigger a governed refusal of the member's own act.
5. **PASS.** The unauthorized pair is non-disclosing, while the entitled member receives the
   truthful governed reason and whether anything changed.
6. **FAIL.** The refusal distinguishes another sovereign's existing object from a nonexistent one,
   or the system uses secrecy as a reason to hide the entitled member's own governed outcome.

---

## 5 · I-10 REPLACEMENT — EXECUTABLE PARTICIPATION SCOPE

#### I-10 · Participation authority carries an explicit executable scope

1. **Law.** Permission for material to participate in a computation carries an explicit executable
   scope over consumer, purpose, room, or a deliberately defined wildcard covering them. A bare
   control whose governed semantics do not identify or resolve that scope is insufficient.
2. **Evidence.** D9-B FA-1 — `roomComposition.ts` composes cross-session exchanges and memory atoms
   directly, bypassing `PRODUCER_REGISTRY` and `not_registered_for_room`, gated by one boolean on
   `members`. D9-A §3.3 names purpose/consumer as a newly required consent dimension. Convergent
   with F5-C `76702850` §2.4, which found recall booleans enforced at retrieval but without a
   per-consumer dimension.
3. **Prohibited.** `permission with unresolved scope → permission everywhere`.
4. **Adversarial case.** Grant a room-A authorization and attempt participation in room B; then test
   a deliberately defined global authorization whose governed semantics explicitly include both.
5. **PASS.** A room-A-only warrant refuses B; a valid explicit wildcard works only across the scope
   it declares.
6. **FAIL.** Scope silently expands, or an explicitly governed global scope is rejected merely
   because it is represented compactly.

---

## 6 · I-16 REPLACEMENT — OBJECT-BOUND VS CLASS-SCOPED WARRANTS

#### I-16 · A warrant travels only as far as its declared object and transformation scope

1. **Law.** An object- or version-bound authorization does not travel to changed wording or a
   changed object unless its declared scope explicitly permits that transformation. Strengthening
   belief never enlarges the warrant. A class-, relationship-, or audience-scoped warrant may cover
   multiple objects only to the extent its own declared scope says so.
2. **Evidence.** D9-A §5.2 E4 · D9-A §3.4 (`manuscript_revision_authorizations`) · D9-A §6.2 C1
   (`ask_authorization_acts` — six-way binding, expiry in the claim predicate). D9-C §3–§7 provides
   the counter-shape that prevents universalizing exact-version binding: the Circles warrant lives
   on member × audience rather than one exact artifact version.
3. **Prohibited.** `authorized this object/idea → implicitly authorized changed wording`, and
   `relationship warrant exists → its scope silently exceeds the relationship terms`.
4. **Adversarial case.** Alter wording under an exact-object authorization; separately exercise a
   relationship/audience warrant across two objects that are both explicitly within its scope.
5. **PASS.** Changed wording is refused under the object-bound warrant; the relationship warrant
   works across only the objects its scope permits.
6. **FAIL.** Exact authorization silently travels, or a legitimate explicitly class-scoped warrant
   is forced into exact-version semantics it never declared.

---

## 7 · I-20 REPLACEMENT — MULTI-SOVEREIGN INTEREST

#### I-20 · One sovereign's act may not silently destroy another sovereign's governed record or stake

1. **Law.** One sovereign's erasure or withdrawal act may not silently destroy another sovereign's
   independently governed record or stake. Refusal and tombstone are valid dispositions, but
   another explicit disposition may pass if it preserves the other sovereign's governed interest
   and states truthfully what changed.
2. **Evidence.** F5-A `fd65054f` §6 — every located multi-sovereign boundary resolves toward refusal
   or tombstone: manuscript erasure refuses `declared_in_other_works`; circle withdrawal tombstones;
   an unowned session cannot be purged. **No counter-example was found.**
3. **Prohibited.** `one sovereign acts → another sovereign's independently governed record/stake is
   silently destroyed`.
4. **Adversarial case.** Erase material that a second sovereign's governed record depends on and
   inspect the second sovereign's resulting record/stake.
5. **PASS.** The second sovereign's governed interest is preserved through refusal, tombstone, or
   another explicit truthful disposition.
6. **FAIL.** The first sovereign's act silently destroys the second sovereign's governed interest.

---

## 8 · I-25 REPLACEMENT — ERASURE COMPLETION EVIDENCE

#### I-25 · An erasure promise requires storage-sufficient evidence of completion

1. **Law.** Where erasure is promised, completion is established by evidence sufficient to the
   storage mechanism; successful invocation of a delete attempt alone is not proof. If completion
   is still owed, the system records that owed state and does not report completed erasure.
2. **Evidence.** F5-C §3.4 — `destroyVaultBytes` unlinks, then `stat`s to confirm absence and throws
   if the path survives; its best-effort sibling `deleteVaultBytes` is named as right for cleanup
   and **wrong for custody**. Convergent with F5-A §2.1, where `custody_incomplete` is returned
   rather than a success the system cannot keep.
3. **Prohibited.** `delete invocation returned → erasure is complete`.
4. **Adversarial case.** Make the underlying store silently refuse removal, or make an asynchronous
   erasure remain owed after the initiating act returns.
5. **PASS.** The failure or durable owed state surfaces; completed erasure is reported only when the
   storage mechanism supplies sufficient completion evidence.
6. **FAIL.** Success is reported over surviving material or over an unrecorded outstanding erasure
   obligation.

---

## 9 · I-26 REPLACEMENT — GOVERNED LINEAGE AND GOVERNED DE-LINKING

#### I-26 · Source-dependent governance requires lineage unless de-linking is itself the disposition

1. **Law.** Where a persistent derivative remains governed in relation to source material, the
   record carries enough lineage to explain and enforce source-dependent authority and disposition.
   If lineage is deliberately destroyed by an explicit anonymization or de-linking disposition,
   that loss of traceability is itself governed and may not later be represented as source-traceable.
2. **Evidence.** F5-C `76702850` §4 — of eleven derived or interpretive loci, **7 carry no source
   reference at all** and **3 carry only a `session_id`**, which names a container rather than the
   material. Convergent with D9-B B9, which found `developmental_memories` carries no
   `createdBy`/`generatedBy`. Standing Constraint 1.2 independently preserves anonymized and
   transformed dispositions as legitimate when explicit.
3. **Prohibited.** `source-dependent derivative persists without lineage → its authority/disposition
   can still be governed`, and `explicitly de-linked derivative → later claimed as source-traceable`.
4. **Adversarial case.** Erase or withdraw a source and ask which still-source-dependent derivatives
   must change; separately inspect a derivative deliberately anonymized/de-linked by governed act.
5. **PASS.** Source-dependent derivatives are identifiable enough to enforce disposition; a
   deliberately de-linked derivative is recorded as such and is not falsely presented as traceable.
6. **FAIL.** Source-dependent derivatives become ungovernable because lineage is missing, or
   intentional de-linking is later laundered back into a traceability claim.

---

## 10 · I-32 REPLACEMENT — MANIFESTABILITY WITH GOVERNED VERIFICATION

#### I-32 · The outcome is manifest from governed plan, execution and verification — not forensic reconstruction

1. **Law.** The complete disposition is explainable from the governed plan plus the mechanism's
   recorded execution and verification. Verification may inspect resulting state when that
   inspection is itself part of the governed mechanism. What may not substitute for manifestability
   is forensic reconstruction from incidental final state after an unaccounted act.
2. **Evidence.** F5 adjudication §2 and §6 (Manifestability) · F5-R1 §5.1 — the governed set and
   the FK graph are effectively disjoint (intersection 1), so neither alone explains the complete
   disposition and incidental FK behavior cannot stand in for governed accounting.
3. **Prohibited.** `we can discover afterward what incidental behavior occurred → the act was
   governed and manifest`.
4. **Adversarial case.** Perform the act, then require a complete disposition manifest using only
   its governed plan, recorded execution, and governed verification evidence.
5. **PASS.** The complete disposition is producible from those governed records, including any
   verification observations the mechanism intentionally captured.
6. **FAIL.** The answer depends on post-hoc discovery of ungoverned incidental behavior.

---

## 11 · CLASSIFICATION OF I-19 AND I-33

### I-19 — DECLARED GAP, NOT AN INVARIANT

I-19 remains exactly the base contract's warning that MAIA-as-speaker representation is not
constitutionalized. Its six fields remain useful as a falsification sentinel, but **Law: none
stated** means it is not counted among invariant laws.

### I-33 — IMPORTED PRIOR RATIFIED LAW, NOT D9/F5-EARNED

I-33 remains available to Domain 13 because *reconstructible ≠ traceable* is already ratified on the
temporal-memory lane. It is an imported dependency and does not enter the D9/F5 local invariant
count.

---

## 12 · REPLACEMENT STANDING

If this R2 is ratified, the base contract's §5 standing block is replaced by:

```text
SPM-FC-01-R2     CANDIDATE — ⛔ NOT RATIFIED
Numbered clauses 33 across 13 domains
Locally earned D9/F5 invariant laws  31
Declared GAP clause                  I-19
Imported prior ratified law          I-33

Earned by D9 alone       I-4 · I-5 · I-6 · I-7(part) · I-8 · I-9 · I-14 · I-15 · I-16 · I-17 · I-18 · I-27
Earned by F5 alone       I-1 · I-2 · I-3 · I-10(part) · I-11 · I-20 · I-21 · I-22 · I-23 · I-25 · I-26 · I-28 · I-29 · I-30 · I-31 · I-32
Requires BOTH, join named I-24
Convergent (each lane independently) I-7 · I-10 · I-12 · I-13
Quantitative substrate   governed by F5-R1 98d42f4e
Imported prior law       I-33 — temporal-memory lane
Declared gaps            9, including I-19 as the domain-level gap sentinel
Laws stated without evidence   0 locally
Domains left deliberately unfilled   1 (MAIA-as-speaker representation)

Mutation NONE · Schema UNTOUCHED · Production UNTOUCHED
Implementation NOT AUTHORIZED
NEXT — bounded R2 re-adjudication of standing + ten replaced clauses + three collision tests
```

The D9/F5 attribution lists intentionally remain the same identifiers as the base contract. R2
changes their **scope**, not the evidence act that earned them.

---

## 13 · REQUIRED R2 RE-ADJUDICATION

Do not reopen the 21 clauses passed unchanged unless this overlay changed a shared definition they
use. Re-test exactly:

```text
classification / count
I-1 · I-3 · I-4 · I-7 · I-10 · I-16 · I-20 · I-25 · I-26 · I-32
I-7 × I-29
I-16 × I-18
I-26 × Standing Constraint 1.2
```

Acceptance requires:

1. each replacement remains supported by its cited evidence;
2. each replacement removes the identified overreach without weakening the protected interest;
3. all six fields remain mutually coherent;
4. the three prior collisions are dissolved rather than merely reworded;
5. no unchanged clause or source binding drifts.

---

## 14 · STANDING NOW

```text
BASE 99d6f918                  UNCHANGED · UNRATIFIED
ADJUDICATION 7d89daa6          RETURN FOR R2
R2 OVERLAY                     DELIVERED CANDIDATE · NOT RATIFIED
IMPLEMENTATION                 CLOSED
REPAIR                         NOT AUTHORIZED
NEXT                           BOUNDED R2 RE-ADJUDICATION
```

**STOP.**