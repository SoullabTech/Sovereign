# SPM-FC-01 — COMBINED D9 + F5 FALSIFICATION CONTRACT

**Synthesis only. Constructed from evidence already earned. ⛔ No census. ⛔ No schema. ⛔ No
migration. ⛔ No FK, route or UI design. ⛔ No repair. ⛔ No implementation. ⛔ No SPM runtime.**

**This contract does not authorize implementation.** It is the object to be attacked.

---

## 0 · PROVENANCE MODEL — multi-source by construction

There is no single SHA under which all of this evidence originated, and this contract does not
pretend otherwise. **Every invariant names the evidence act that earned it.**

| source | binding | what it earned |
|---|---|---|
| **D9 census** | `a5834c94:docs/programme/SPM-D9_REPRESENTATION-BOUNDARY-CENSUS_2026-09-17.md`, itself bound to census SHA `8b80ec21` | the specimen field; what the organism enforces vs assumes |
| **D9-A adjudication** | `a5834c94:SPM-D9-A_ADJUDICATION_2026-09-17.md` · `a5834c94:SPM-D9A_REPRESENTATION-BOUNDARY-ADJUDICATION_2026-09-17.md` | survived / falsified / newly required; the standing⊥warrant hypothesis; P1–P13 positive capabilities |
| **D9-B falsification** | `a5834c94:SPM-D9B_REPRESENTATION-BOUNDARY-FALSIFICATION_2026-09-17.md` | Model T run at full strength; B3 collapse; B4 surviving discriminator; B9, B10 corrections |
| **D9-C discriminator** | `a5834c94:SPM-D9C_REPRESENTATION-DISCRIMINATOR_2026-09-17.md`, executed at `4b4b9b55` | Outcome A — one live representation warrant, audience-indexed, cascading |
| **F5-A / F5-B / F5-C** | subject `7ee173db`; records at `fd65054f`, `a4b4df31`, `76702850` | erasure architecture census; authority & truthfulness trace; custody graph |
| **F5 adjudication** | subject `a5834c94`; record committed `1a721c37` | TRACE COMPLETE · ERASURE CONFORMANCE FAIL / STOP; orphaned-authority invariant |
| **F5-R1 reconciliation** | `98d42f4e` | governs every quantitative claim below |

### 0.1 · Anti-laundering rule, binding on this document

This contract **may not** attribute to "D9 + F5" jointly what one lane earned alone. Where an
invariant is carried by one source, it says so and no more. Where two sources converge, the
convergence is named as convergence, not as a single proof.

Three recurring attributions, stated once:

- **D9 earned the authority/warrant architecture.** It says nothing about erasure.
- **F5 exposed the erasure/custody architecture.** It says nothing about representation warrants,
  except where D9-C's result is applied to an F5 finding — and that application is named at I-24.
- **R1 reconciled the quantitative substrate only.** It earned no law. It governs which numbers
  may be quoted.

### 0.2 · Quantitative discipline (F5-R1 `98d42f4e`, binding)

**Usable, exactly reproduced:**

```
governed entries      43        governed distinct names    42
CASCADE              161        RESTRICT                    24
FK-linked tables     243        intersection with governed   1
33 governed tables carry a text-typed identity column against members.id uuid
```

**⛔ Not usable as exact — historical adjudication figures R1 did not reproduce:**

```
242 FK-linked tables (R1: 243) · 43 NO ACTION (R1: 47) · 30 SET NULL (R1: 32)
```

Where this contract needs those classes it names the class, never the count.

---

## 1 · THE TWO STANDING CONSTRAINTS

Both are prior to every invariant and both may be used to defeat a proposed invariant.

### 1.1 · D9's positive constraint — sovereignty must not impoverish

> **A boundary model that refuses a supported member act is wrong, not safe.**

Earned by: D9-A §7 (P1–P13) and D9-B §6, which ran positive controls as aggressively as
over-authorization attacks and recorded **FALSE REFUSAL = 0**.

MAIA's legitimate memory, synthesis, challenge, interpretation and relational depth are **protected
interests under this contract**, not residue left over after constraints. An invariant that would
make P1–P13 impossible is falsified by that fact alone.

### 1.2 · F5's restraint — erasure is not universal physical deletion

> **Every governed information class requires an explicit, truthful disposition whose continuing
> authority and participation can be explained. Deletion of everything is neither required nor
> sufficient.**

Earned by: F5 adjudication `1a721c37` §2 and §6, which names retained, erased, blocked, anonymized
and transformed as legitimate dispositions, and F5-C `76702850`, which found classes (vault bytes,
receipts, audit records) whose survival may be correct.

---

## 2 · THE CONTRACT

Each invariant carries six fields. **Adversarial case** is the case that would break it; **PASS**
and **FAIL** are observable outcomes of running that case.

---

### DOMAIN 1 — IDENTITY / AUTHORITY

#### I-1 · Deletion authority is the subject's, and is not supplied by the caller

1. **Law.** The subject of a destructive act is resolved from verified server-side identity. A
   caller-supplied identifier may be accepted only so a disagreement can be refused before the act.
2. **Evidence.** F5-B `a4b4df31` §1.2 (`delete-my-memory`: the caller-supplied `userId` *is* the
   deletion subject, compared with nothing) · F5-B §2 (account closure refuses a disagreeing body
   `memberId` with 403 before any lookup) · F5-A `fd65054f` §2.3 (sanctuary purge eligibility read
   from persisted state, never from the body).
3. **Prohibited.** `caller asserts subject → system acts on that subject`.
4. **Adversarial case.** An authenticated member names another member's identifier in a destructive
   request.
5. **PASS.** Refusal before any read of the named subject's material, with no disclosure of whether
   that subject exists.
6. **FAIL.** The act proceeds against the named subject, or the refusal reveals the subject's
   existence.

#### I-2 · A confirmation phrase is not an authorization control

1. **Law.** A fixed, publicly-known confirmation string may establish deliberateness. It may never
   establish authority.
2. **Evidence.** F5-B §1.2 (`DELETE ALL MY CONSCIOUSNESS DATA` as the only barrier) · F5-B §2
   (account closure states this distinction in source for `confirmUsername`).
3. **Prohibited.** `knows the phrase → holds the authority`.
4. **Adversarial case.** Remove all session resolution; retain the phrase.
5. **PASS.** The act is refused.
6. **FAIL.** The act proceeds.

#### I-3 · Authority may not arrive by lexical or structural adjacency

1. **Law.** A surface's authority must be declared for that surface. Protection inherited from a
   neighbouring name, prefix, directory or gated parent is not a declaration.
2. **Evidence.** F5-B §1.1 — `/api/sovereignty/delete-my-memory` is authenticated by exactly one
   access-matrix rule, `{ prefix: '/api/sovereign' }`, matching because *sovereignty* begins with
   *sovereign*. F5-B §3.1 — a gated Lab Tools page confers nothing on the ungated route beneath it.
   Convergent with D9-C §2, which rejected nine candidate specimens for placing authorization on
   the material or nowhere.
3. **Prohibited.** `adjacent locus is protected → this locus is protected`.
4. **Adversarial case.** Rename the neighbouring surface, or remove the parent gate, and re-ask
   whether the surface is still authorized.
5. **PASS.** Authorization is unchanged, because it was declared here for this surface.
6. **FAIL.** Authorization disappears, revealing it was never this surface's.

---

### DOMAIN 2 — PROVENANCE

#### I-4 · Provenance is minted by the writer, never supplied by the caller

1. **Law.** The claim about *who authored* a stored item is fixed by the writing path, not passed in.
2. **Evidence.** D9-B `a5834c94` B9 — both writers of member-standing atom storage hardcode
   `generated_by`; `keepSource` **throws** on `practitioner_observation`; the practitioner path mints
   `generated_by = 'practitioner-observation'` with `crossing_allowed = false`. Two writers, each
   structurally refusing the other's provenance class.
3. **Prohibited.** `caller names the provenance → storage records it`.
4. **Adversarial case.** Route MAIA-authored text through a member-provenance writer.
5. **PASS.** Structurally refused by the writer.
6. **FAIL.** MAIA-authored text acquires member provenance.

> ⚠️ **Fragility carried, not resolved.** D9-B records that B9's survival *"is contingent on
> absence, not on a guard"* — the `session_excerpt` laundering path is blocked because its tables do
> not exist, not because a rule refuses it. **This is the single most fragile positive result in the
> D9 evidence base**, and an attack on this contract should start here.

#### I-5 · Provenance must survive the transformation that carries the material

1. **Law.** Where material is transformed, the record of who authored it must be recoverable at the
   transformed object, not only in the chain that produced it.
2. **Evidence.** D9-A adjudication §2 — `manuscript_draft_sections` has no authorship column: the
   organism can prove *that* the member authorized wording and cannot say, from the book, *whose
   wording it is.* D9-A §7 P7 — *"not-rewritten and not-represented are different, and D9-B must not
   accept the second as the first."*
3. **Prohibited.** `no rewrite occurred → provenance is intact`.
4. **Adversarial case.** Read the transformed artifact alone and ask who authored a given passage.
5. **PASS.** Answerable from the artifact.
6. **FAIL.** Answerable only by reconstructing the authorization chain — or not at all.

---

### DOMAIN 3 — EVIDENCE vs MEANING

#### I-6 · An interpretation's owner is not derived from the owner of the material it reads

1. **Law.** Who holds standing over a meaning is an independent fact from who authored the evidence.
2. **Evidence.** D9-A §1 — `developmental_observation_standing_events`: append-only, CAS, UNSET is
   zero events, **owner not derived from the reading's owner**. Recorded as ENFORCED.
3. **Prohibited.** `MAIA read the member's material → the resulting meaning is the member's`.
4. **Adversarial case.** Produce an interpretation from member-authored evidence and check whose
   standing the store records.
5. **PASS.** Standing is an independent recorded fact, UNSET until an act sets it.
6. **FAIL.** Standing is inferred from the evidence's ownership.

#### I-7 · A refusal is not an occasion to disclose

1. **Law.** A refusal must not reveal what it is refusing about.
2. **Evidence.** D9-A §6.2 C5 — `minted` excluded from the refusal arm **by type**;
   `reading_unknown` conflates *not yours* with *does not exist*. Convergent with F5-A §2.1
   (erasure answers `not_found` without confirming the id exists) and F5-A §2.3 (non-disclosing 404).
3. **Prohibited.** `refusing → naming the object, owner, or grounds`.
4. **Adversarial case.** Request an object belonging to another sovereign and compare the refusal
   with the refusal for a non-existent object.
5. **PASS.** Indistinguishable.
6. **FAIL.** Distinguishable.

---

### DOMAIN 4 — EPISTEMIC STANDING

#### I-8 · Standing and warrant are independent axes

1. **Law.** Standing answers *how well is this known, and on whose authority*; warrant answers *may
   this be placed here, now, for this purpose*. **No quantity of standing produces a warrant. No
   warrant improves standing.**
2. **Evidence.** D9-A §6.1 (the hypothesis) · D9-B §7.3 (Model T survives B4 only by positing a
   capability bound to actor, resource, **purpose**, time and use-count — *recorded as capitulation,
   not redundancy*) · D9-C §7 Outcome A.
3. **Prohibited.** `standing is high enough → the crossing is permitted`.
4. **Adversarial case.** Hold material at maximal standing — member-authored, present, valid,
   lawfully held — and request a crossing for which no warrant was granted.
5. **PASS.** Refused.
6. **FAIL.** Permitted on the strength of standing.

> ⚠️ **Counter-evidence that must travel with this invariant.** D9-B B10 found
> `epistemicFraming()` live and member-facing, whose stated design is *"Proportions authority to the
> quality of the knowledge"* — the terminal-ladder shape, in the organism's own words. D9-B rules
> this **not a counterexample** (it governs how strongly a claim is *worded*, not whether it may
> cross) and simultaneously records it as **Model T's strongest affirmative evidence**. The
> candidate sentence *"MAIA can become more confident in her own interpretation without that
> interpretation becoming more authoritative as a representation of the human"* is **directly
> contradicted in design intent** by that function and remains **unconstitutionalized**.

#### I-9 · Monotonicity is not claimed

1. **Law.** Standing is not asserted to be monotonic. A model requiring it is not this one.
2. **Evidence.** D9-A §8.2 — the founder's correction, applied; monotonicity explicitly withdrawn.
3. **Prohibited.** Deriving any consequence from *standing only ever increases*.
4. **Adversarial case.** Find an invariant here whose force depends on monotonic standing.
5. **PASS.** None exists.
6. **FAIL.** One does, and it inherits an unclaimed premise.

---

### DOMAIN 5 — CIRCULATION / COMPUTATIONAL PARTICIPATION

#### I-10 · Participation authority is indexed by consumer, not held as a property of material

1. **Law.** Permission for material to participate in a computation must name the consumer,
   purpose or room. A single boolean on the member carries no such dimension.
2. **Evidence.** D9-B FA-1 (P-1 purpose travel) — `roomComposition.ts` composes cross-session
   exchanges and memory atoms **directly, bypassing `PRODUCER_REGISTRY` and
   `not_registered_for_room`**, gated by one boolean on `members`. D9-A §3.3 — *purpose/consumer as
   a dimension of consent* listed under **newly required**. Convergent with F5-C `76702850` §2.4,
   which found `conversational_recall_enabled` and `episodic_recall_enabled` enforced at retrieval
   and dimensionless.
3. **Prohibited.** `permitted to participate once → permitted to participate everywhere`.
4. **Adversarial case.** Grant participation for room A and observe whether the material reaches
   room B without a further act.
5. **PASS.** Refused at B.
6. **FAIL.** Reaches B — the confirmed FA-1 condition.

#### I-11 · A declared non-participation control must be read by the path it governs

1. **Law.** A column expressing withholding is not a control until a retrieval path consults it.
2. **Evidence.** F5-C §2.4 — `developmental_memories.visibility` and `share_scope` are declared and
   **no located memory-retrieval path filters on either**; `declined_at` has **no reader anywhere**.
   Convergent with D9-C §6 (`shared_text` written and never read).
3. **Prohibited.** `the column exists → the withholding is effective`.
4. **Adversarial case.** Set the control to its most restrictive value and observe retrieval.
5. **PASS.** Retrieval changes.
6. **FAIL.** Retrieval is unchanged — the control is decorative.

---

### DOMAIN 6 — CORRECTION AND TEMPORAL SUCCESSION

#### I-12 · Withdrawal is warrant-side, not standing-side

1. **Law.** A member taking something back removes permission; it does not falsify the historical
   record that the thing was once held or believed.
2. **Evidence.** D9-A §6.2 C3 · D9-A §1 (`refusedReason = 'withdrawn_by_member'`; *"Correction is
   not temporary disagreement."*) · D9-A §7 P13 (`valid_to` with the row retained; `'revoked'` =
   *evidence remains*). Convergent with F5-A §2.5 (circle withdrawal tombstones: content nulled,
   the fact of the act retained).
3. **Prohibited.** `member withdraws → the historical record is rewritten or destroyed`.
4. **Adversarial case.** Withdraw, then ask what was believed before the withdrawal.
5. **PASS.** Answerable; permission is gone.
6. **FAIL.** Unanswerable, or permission survives.

#### I-13 · Withdrawn material may not silently reacquire present influence

1. **Law.** A withdrawal must not be defeated by a fallback, a cache, a re-derivation or a replay.
2. **Evidence.** D9-A §6.1 / D9-B B6 — the **T-6 vector fallback**, recorded as STRUCTURALLY
   POSSIBLE and **not observed**. Condemned by the model (D9-B FA-2). Convergent with F5-A §2.1
   (manuscript erasure refuses reinstatement) and the FR-18 precedent.
3. **Prohibited.** `withdrawn → returned by a fallback, cache, re-derivation or replay`.
4. **Adversarial case.** Withdraw, then exercise every retrieval path including fallbacks.
5. **PASS.** The material does not return by any path.
6. **FAIL.** It returns by any path — withdrawal defeated without a member act.

#### I-14 · Repetition is not confirmation

1. **Law.** System retrieval frequency may affect salience. It may never substitute for a member act.
2. **Evidence.** D9-A §2 — **INVERTED** in the organism: Cut-1 gives `recall_count` (system
   retrieval) max 0.10 against `confirmed_by_user` max 0.0225, **≈4.4× the wrong way**. D9-B B7
   records the loop as partial and not observed.
3. **Prohibited.** `retrieved often → treated as confirmed`.
4. **Adversarial case.** Retrieve unconfirmed material repeatedly and compare its standing with
   member-confirmed material.
5. **PASS.** Standing unchanged by retrieval.
6. **FAIL.** Retrieval confers standing — the current measured condition.

---

### DOMAIN 7 — ADOPTION

#### I-15 · Persistence is not adoption

1. **Law.** That material was stored is not that the member took it up.
2. **Evidence.** D9-A §2 — **INVERTED at the atoms loader**:
   `member_response_status IS DISTINCT FROM 'rejected'` treats never-confirmed and confirmed
   identically; *persisting is surfacing.* D9-A §7 P5 — `confirmed`/`modified` have **no runtime
   writer** for atoms.
3. **Prohibited.** `stored and not rejected → adopted`.
4. **Adversarial case.** Store material the member has never responded to and observe whether it
   surfaces as theirs.
5. **PASS.** It does not.
6. **FAIL.** It does — the current condition.

#### I-16 · A warrant binds to one exact object, not to a conviction

1. **Law.** An authorization names one exact version. Changing the wording voids it. Strengthening
   belief does not extend it.
2. **Evidence.** D9-A §5.2 E4 · D9-A §3.4 (`manuscript_revision_authorizations`) · D9-A §6.2 C1
   (`ask_authorization_acts` — six-way binding, expiry in the claim predicate).
3. **Prohibited.** `authorized this idea → authorized this new wording of it`.
4. **Adversarial case.** Alter the wording and re-present it under the existing authorization.
5. **PASS.** Refused.
6. **FAIL.** Permitted.

#### I-17 · Warrants do not compose

1. **Law.** A warrant for one crossing is not a warrant for a second crossing of the same material.
2. **Evidence.** D9-A §6.2 C2 — T-8: the offer records the **reading** warrant and there is no
   second field for representing.
3. **Prohibited.** `permitted to read → permitted to represent`.
4. **Adversarial case.** Exercise a granted reading warrant, then attempt representation under it.
5. **PASS.** A second act is required.
6. **FAIL.** The first warrant carries.

---

### DOMAIN 8 — REPRESENTATION AND PURPOSE / AUDIENCE SCOPE

#### I-18 · Some crossings require authority not reducible to the standing of the material

1. **Law.** At least one class of representation crossing requires its own warrant, held on the
   relationship rather than on the material and indexed by audience.
2. **Evidence.** D9-C §7 **Outcome A**, on the Circles specimen: identical material, identical
   provenance, identical present standing, **identical wording**, permitted into one circle and
   refused into another on `circle_memberships.consent_mode`. Outcome B excluded by the cascade.
3. **Prohibited.** `material is lawfully held → it may be represented to any audience`.
4. **Adversarial case.** Hold audience, material, provenance and standing fixed; vary only the
   membership-held authorization.
5. **PASS.** Representation varies.
6. **FAIL.** Representation is unchanged — the warrant is not doing work.

> ⚠️ **Three qualifications that travel with I-18 and may not be dropped when it is quoted.**
> **(a)** The specimen is **executable and routed but not member-reachable** — Circle routes are
> founder-allowlisted and fail closed (D9-C §5). **(b)** The warrant is **granted by default**
> (`consent_mode DEFAULT 'manual'`), so it supports *separable and revocable* and **not**
> *affirmatively granted* (D9-C §4). **(c)** In the specimen **the member is the speaker and MAIA
> is not** (D9-C §7.1).

#### I-19 · ⛔ GAP — MAIA-as-speaker representation is NOT constitutionalized

1. **Law.** ***None stated.*** The general proposition *every representation of a person requires
   an independent purpose-bound warrant* is **not earned**.
2. **Evidence of the gap.** D9-C §7.1 records four cases as **STILL UNEVIDENCED**: MAIA speaking
   about the member to the member; MAIA characterizing the member; first-person representation
   (K2 unchanged); external-human representation (no seam found). D9-B §10 withdrew the claim that
   representation is separately governed for member-facing speech (B5b: insufficient).
3. **Prohibited.** Completing this domain by intuition, or quoting I-18 as though it covered it.
4. **Adversarial case.** Any attack that assumes this law exists.
5. **PASS.** The attack finds the gap marked and unfilled.
6. **FAIL.** A later reading treats I-18 as general.

> **This is the largest declared hole in the contract and it is left open deliberately.** D9-C's
> own words: *"The arrow D9-C was opened to prevent — one purpose-bound capability exists → all
> human representation requires that architecture — is still not earned."*

---

### DOMAIN 9 — PLURALITY / MULTI-SOVEREIGN CONTRIBUTION

#### I-20 · One sovereign's act may not destroy another's record

1. **Law.** Where material implicates more than one sovereign, an erasure or withdrawal act
   resolves toward refusal or tombstone, never toward destroying the other party's record.
2. **Evidence.** F5-A `fd65054f` §6 — every located multi-sovereign boundary resolves this way:
   manuscript erasure refuses `declared_in_other_works`; circle withdrawal tombstones; an unowned
   session cannot be purged. **No counter-example was found.**
3. **Prohibited.** `one party erases → the other party's record is destroyed`.
4. **Adversarial case.** Erase material that a second sovereign's record depends on.
5. **PASS.** Refusal, or a tombstone preserving the other's record.
6. **FAIL.** Silent destruction of the second party's record.

#### I-21 · Multi-sovereign stake must be visible to the mechanism that disposes of the material

1. **Law.** A column expressing another sovereign's stake is not a protection unless a disposition
   path reads it.
2. **Evidence.** F5-C `76702850` §5 — 18 member-bound loci carry a multi-sovereign marker; **4 are
   counted by account closure and 14 are named by no located erasure path**;
   `developmental_memories` carries `visibility` and `share_scope` that **no retrieval path reads**.
3. **Prohibited.** `the stake is recorded → the stake is honoured`.
4. **Adversarial case.** Dispose of a locus carrying a multi-sovereign marker and observe whether
   the marker changed the disposition.
5. **PASS.** It did.
6. **FAIL.** It did not — the current condition for 14 of 18.

---

### DOMAIN 10 — RETENTION AND ERASURE

#### I-22 · Every governed class has an explicit disposition

1. **Law.** For each governed information class the system states which of *erased · retained ·
   blocked · anonymized · transformed* applies, and why. Survival by omission is not a disposition.
2. **Evidence.** F5 adjudication `1a721c37` §2 and §6 · F5-C §2.1 — account closure inspects **35**
   of 302 member-bound baseline loci; **267 are named by no located erasure path** · F5-R1
   `98d42f4e` §5.1 — the governed set and the FK graph are **effectively disjoint** (243 FK-linked,
   42 governed names, **intersection 1**), so neither mechanism is a check on the other.
3. **Prohibited.** `no rule names it → it is retained`.
4. **Adversarial case.** Name any governed class and ask for its disposition and the reason.
5. **PASS.** Both are answerable from the governed process.
6. **FAIL.** The answer must be reconstructed from incidental FK behaviour.

#### I-23 · Erasure orchestration must be able to account for what it will cause

1. **Law.** The governed process explains the complete resulting disposition. Implicit database
   behaviour is not itself a violation; **unaccountable** implicit behaviour is.
2. **Evidence.** F5 adjudication §2, with R1-governed figures: **161 CASCADE** and **24 RESTRICT**
   constraints to `members(id)` are declared in the migration source, and the route enumerates **43
   entries over 42 names**. R1 §5: of those 42, **1** carries an FK at all, and **33 carry a
   text-typed identity column against `members.id uuid`**, where a foreign key is **not declarable**
   rather than merely undeclared. *(NO ACTION and SET NULL classes exist and are real; R1 rejected
   their exact counts, so they are named as classes only.)*
3. **Prohibited.** `preflight passed → the transaction will complete`.
4. **Adversarial case.** Run erasure for a member holding material in an unenumerated
   RESTRICT-bearing store.
5. **PASS.** A governed refusal naming the retained class.
6. **FAIL.** An FK error, rollback, and a generic failure carrying no governed explanation.

#### I-24 · Deletion may not convert revocable member authority into irrevocable surviving authority

1. **Law.** Erasure must not leave an operative representation standing under a warrant its
   erased holder can no longer exercise.
2. **Evidence.** ⭐ **This is the one invariant that requires both lanes, and the join is named.**
   **D9-C `a5834c94` §3.1** earned that `circle_memberships.consent_mode` is an audience-indexed
   representation warrant whose withdrawal **stops existing representations while the material,
   provenance, wording and standing are unchanged.** **F5-C `76702850` §5** earned that
   `circle_memberships` and the shared-artifact stores are among the 14 multi-sovereign loci no
   located erasure path names. **The F5 adjudication `1a721c37` §3** joined them and drew the
   consequence. Neither lane reaches it alone: D9 never asked what deletion does to a warrant, and
   F5 had no concept of a warrant until D9-C supplied one.
3. **Prohibited.** `representation survives → warrant survives → warrant-holder erased → revocation
   impossible`.
4. **Adversarial case.** Erase a member who holds an audience-indexed warrant over a live
   representation, then attempt the ordinary revocation act.
5. **PASS.** Either the representation ceases, or the warrant is transferred to an exercisable
   authority, or erasure refuses — **and the outcome is stated**.
6. **FAIL.** The representation remains operative and no party can withdraw it.

> ⛔ **This invariant does not choose among delete, revoke, anonymize, or retain-as-history.** It
> forbids exactly one outcome: stranding.

#### I-25 · An erasure promise must be observed, not attempted

1. **Law.** Where erasure is promised, absence is confirmed rather than assumed.
2. **Evidence.** F5-C §3.4 — `destroyVaultBytes` unlinks, then `stat`s to confirm absence and
   **throws if the path survives**, and refuses an out-of-root path loudly rather than reporting
   success. Its best-effort sibling `deleteVaultBytes` is named in source as right for cleanup and
   **wrong for custody**. Convergent with F5-A §2.1 (`custody_incomplete` returned rather than a
   success the system cannot keep).
3. **Prohibited.** `the delete call returned → the material is gone`.
4. **Adversarial case.** Make the underlying store silently refuse the removal.
5. **PASS.** The failure surfaces.
6. **FAIL.** Success is reported over surviving material.

---

### DOMAIN 11 — DERIVATION / LINEAGE

#### I-26 · Derived material must name the material it came from

1. **Law.** Where a derived artifact persists, the record must establish which source material it
   was computed from.
2. **Evidence.** F5-C `76702850` §4 — of eleven derived or interpretive loci, **7 carry no source
   reference at all** and **3 carry only a `session_id`**, which names a container rather than the
   material. Convergent with D9-B B9, which found `developmental_memories` carries **no
   `createdBy`/`generatedBy`** (census A-4).
3. **Prohibited.** `the source was erased → the derivative is unidentifiable as its product`.
4. **Adversarial case.** Erase a source and ask what was computed from it.
5. **PASS.** Answerable from the record.
6. **FAIL.** Unanswerable — the current condition for 7 of 11.

#### I-27 · Valid inputs do not make a derived synthesis a member claim

1. **Law.** Lawful access to member material does not convert what MAIA derives from it into
   something the member said.
2. **Evidence.** D9-B B9 — **PROPOSITION SURVIVES FALSIFICATION**; no executable path was found by
   which derived synthesis becomes a member claim.
3. **Prohibited.** `derived from member material → carries member standing`.
4. **Adversarial case.** Drive derived synthesis into a member-standing store.
5. **PASS.** Structurally refused.
6. **FAIL.** It acquires member standing.

> ⚠️ Inherits I-4's fragility note: **survival rests on absence, not on a guard.**

#### I-28 · Co-location is not a lineage mechanism

1. **Law.** Where a derivative lives on the row it derives from, erasure of the source necessarily
   erases it — but that is a property of storage layout, not evidence that lineage is governed.
2. **Evidence.** F5-C §3.3 — all 8 member-bound embedding columns are **columns on the
   member-bound row**; no external vector store was located. F5-C §4 names this explicitly as
   co-location rather than a lineage mechanism. Convergent with the F5 adjudication §5, which
   records the absence of an active `mem0` importer.
3. **Prohibited.** `embeddings are erased with their rows → lineage is solved`.
4. **Adversarial case.** Move any derivative off its source row.
5. **PASS.** A lineage record is required and present.
6. **FAIL.** The derivative becomes unreachable from its source with nothing recording the link.

---

### DOMAIN 12 — MEMBER-VISIBLE TRUTH

#### I-29 · A refusal or partial-retention outcome is not complete until the member receives it

1. **Law.** The member must receive the governed reason and an unambiguous account of whether
   anything changed. Server-side knowledge of the reason is not delivery of it.
2. **Evidence.** F5 adjudication `1a721c37` §4 — the governed 409 carries a truthful message,
   retained content, `accountChanged: false` and a next step, and the client handles `res.ok` only.
   Convergent with F5-B `a4b4df31` §2, which reads the same refusal payload from the server side.
3. **Prohibited.** `the server knows why → the refusal is complete`.
4. **Adversarial case.** Trigger the refusal and observe what the member receives.
5. **PASS.** Reason and change-state both rendered.
6. **FAIL.** Spinner, silence, or a generic failure — the current condition.

#### I-30 · Failure may never present as completion

1. **Law.** A path that did not perform an act may not report that it did.
2. **Evidence.** F5-B §1.4 — `delete-my-memory`'s catch branch returns
   `success: true · 'processed successfully' · 'your request has been queued'` when **nothing is
   queued**; F5-B §3 — the sole caller branches on `result.success` and renders *"All your
   consciousness data has been permanently and completely deleted."* Contrasted in F5-A §2.1 and
   §2.4, where two other paths do the opposite.
3. **Prohibited.** `the operation failed → the member is told it succeeded`.
4. **Adversarial case.** Make the underlying operation throw.
5. **PASS.** The member is told it did not happen.
6. **FAIL.** The member is told it did.

#### I-31 · Declared scope may not exceed executable scope

1. **Law.** What a surface tells the member it will do must be what it can do.
2. **Evidence.** F5-B §3 — divergence in **breadth** (*all data across all systems* vs five tables),
   **certainty** (*permanently and completely deleted* asserted from a branch the failure path
   reaches) and **subject** (a hardcoded non-member literal). F5-C §2.2 — **all five target tables
   are absent from the entire canonical schema surface**, baseline and migrations both.
3. **Prohibited.** `the copy promises it → the promise is governed`.
4. **Adversarial case.** Compare every member-facing claim against the operation's reach.
5. **PASS.** Claim ≤ reach.
6. **FAIL.** Claim > reach — independent of whether the surface has ever been used.

---

### DOMAIN 13 — MANIFESTABILITY

#### I-32 · The outcome must be explainable from the governed process, not reconstructed afterward

1. **Law.** After a governed act, the system can state what happened from the mechanism that
   performed it — not by inspecting the database's incidental behaviour after the fact.
2. **Evidence.** F5 adjudication §2 and §6 (Manifestability) · F5-R1 §5.1 — the governed set and
   the FK graph are **disjoint (intersection 1)**, so the union rather than either alone is the real
   disposition surface, and neither can explain the other.
3. **Prohibited.** `we can work out afterward what happened → the process accounted for it`.
4. **Adversarial case.** Perform a governed act and produce its complete disposition **without
   querying the resulting state**.
5. **PASS.** Producible.
6. **FAIL.** Producible only by observing what the database did.

#### I-33 · Traceability is a property of the record, not of a query

1. **Law.** Where an act must be accountable, the record must carry it. A counterfactual that
   reconstructs today's answer does not confer historical traceability.
2. **Evidence.** ⛔ **Not earned by D9 or F5.** Carried from the ratified temporal-memory law
   (`TEMPORAL-MEMORY-RECONCILIATION-01` ACT 1 ruling, Clause 2, and the Cut-1 traceability closure)
   which established *reconstructible ≠ traceable* on a different lane and a different question.
3. **Prohibited.** `we could recompute it → it was traceable`.
4. **Adversarial case.** Ask what a governed act excluded or disposed of on a specific past
   occasion.
5. **PASS.** Answerable from the record of that occasion.
6. **FAIL.** Answerable only by re-running against current state.

> ⚠️ **Provenance warning, stated rather than smoothed.** I-33 is **not** D9 or F5 evidence. It is
> included because Domain 13 is incoherent without it and because the law is ratified elsewhere in
> this programme. **An adjudicator may strike I-33 as out-of-lane without disturbing I-1…I-32.**

---

## 3 · DECLARED GAPS — do not complete by intuition

| # | Gap | Source |
|---|---|---|
| G1 | **MAIA-as-speaker representation is unevidenced.** Four cases remain empty. | D9-C §7.1 |
| G2 | **I-4 / I-27 survive on absence, not on a guard.** The laundering path is blocked by a missing table. | D9-B B9 |
| G3 | **The `epistemicFraming` contradiction is unresolved.** One candidate sentence is contradicted in design intent. | D9-B B10 |
| G4 | **The I-18 specimen is not member-reachable** and its warrant is granted by default. | D9-C §4, §5 |
| G5 | **K2 unchanged** — `refuseBorrowedFirstPerson` remains shadow-only. | D9-A §4, D9-C §2 |
| G6 | **No `PROVEN RETAINED` classification was ever assignable** — it requires runtime evidence. | F5-C §8 |
| G7 | **Three adjudication figures were not exactly reproduced** and may not be quoted as exact. | F5-R1 §3 |
| G8 | **Every F5 standing is repository reachability.** Runtime exercise is UNWITNESSED throughout. | F5-A/B/C |
| G9 | **I-33 is out-of-lane** and may be struck. | §2, Domain 13 |

---

## 4 · WHAT THIS CONTRACT DOES NOT DO

It does not propose a schema, a foreign key, a cascade, a route, a UI, an erasure table, a
disposition registry, a lineage column, or a repair of any kind. It names no implementation and
recommends none. It does not authorize SPM implementation. It does not close D9 or F5, whose
standings are unchanged: **D9 CLOSED · F5 TRACE COMPLETE · F5 ERASURE CONFORMANCE FAIL / STOP ·
SPM CLOSED · REPAIR NOT AUTHORIZED.**

---

## 5 · STANDING

```
SPM-FC-01        DELIVERED — ⛔ NOT ADJUDICATED, ⛔ NOT RATIFIED
Invariants       33 across 13 domains
Earned by D9 alone       I-4 · I-5 · I-6 · I-7(part) · I-8 · I-9 · I-14 · I-15 · I-16 · I-17 · I-18 · I-27
Earned by F5 alone       I-1 · I-2 · I-3 · I-10(part) · I-11 · I-20 · I-21 · I-22 · I-23 · I-25 · I-26 · I-28 · I-29 · I-30 · I-31 · I-32
Requires BOTH, join named I-24
Convergent (each lane independently) I-7 · I-10 · I-12 · I-13
Quantitative substrate   governed by F5-R1 98d42f4e
Out-of-lane, strikable   I-33
Declared gaps            9
Laws stated without evidence   0
Domains left deliberately unfilled   1 (I-19)

Mutation NONE · Schema UNTOUCHED · Production UNTOUCHED
Implementation NOT AUTHORIZED
NEXT — adversarial adjudication: provenance audit · constitutional review ·
       falsification against each I-n's adversarial case · PASS / FAIL
```


**STOP.**
