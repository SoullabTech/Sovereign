# SPM-FC-01-R4 — FOUR-CLAUSE EVIDENCE-SCOPE CORRECTION

**Standing:** CANDIDATE R4 · ⛔ NOT RATIFIED · ⛔ IMPLEMENTATION NOT AUTHORIZED

**Canonical predecessor:** R3 `9d0539b3f813aeed947d6fb83b49aefd76c19e3b`

**Independent return:** `SPM-FC-01-R3_ADVERSARIAL_REVIEW_2026-09-17.md` @ `8bc78b9b5`

**R2 overlay preserved unchanged:** `f40d4134adc62fdbdd5e8be1199b685f5577973b`

**Purpose:** correct exactly I-12, I-14, I-15 and I-17. No new evidence. No new invariant. No
implementation design. R3's removal of the overbroad closing synthesis remains intact.

---

## 0 · REVISION SEMANTICS

R4 is a replacement overlay over the R3-corrected base plus the already-adjudicated R2 overlay.

If R4 is ratified:

1. R3's corrected base remains the base object;
2. all ten R2 replacements remain unchanged;
3. I-12, I-14, I-15 and I-17 are replaced by §§1–4 below;
4. the standing/accounting is replaced by §5 below;
5. every other clause remains exactly as previously adjudicated;
6. the MAIA-as-speaker representation gap remains open.

---

## 1 · I-12 REPLACEMENT — WITHDRAWAL PRESERVES HISTORY WHILE REMOVING PRESENT EFFECT

#### I-12 · Withdrawal may change present standing or authority without rewriting history

1. **Law.** A withdrawal must be able to remove the present effect that the member is withdrawing —
   including present standing, participation, or authority as applicable — without falsifying or
   destroying the historical fact that the prior state, claim, or act existed. Withdrawal is not
   universally assigned to the warrant axis; the affected axis is determined by what was withdrawn.
2. **Evidence.** D9A §2.10 and §8.2 — present standing is explicitly non-monotonic: `valid_to`,
   `withdrawn_by_member`, `'revoked'` and `'held_lightly'` preserve evidence while removing present
   effect. D9-B B6 classifies the T-6 fallback as a **material-validity failure**, not a warrant
   failure: the baseline respects `valid_to`; the fallback drops it and can restore influence.
   Convergent with F5-A §2.5, where circle withdrawal tombstones content while retaining the fact of
   the act.
3. **Prohibited.** `withdrawal → historical erasure`, and `one withdrawal axis → silently treated as
   every withdrawal axis`.
4. **Adversarial case.** Withdraw a current assertion and separately revoke a use/crossing authority;
   then inspect both historical record and present effect.
5. **PASS.** The prior fact remains recoverable; the withdrawn present standing or authority no
   longer operates; each act changes the axis it actually governs.
6. **FAIL.** History is rewritten or destroyed, present effect survives, or the system substitutes a
   different axis for the one the member withdrew.

---

## 2 · I-14 REPLACEMENT — REPETITION MAY BUY SALIENCE, NOT MEMBER CONFIRMATION

#### I-14 · System repetition is not member confirmation

1. **Law.** System retrieval frequency may affect salience or ranking. It may not be represented as
   a member confirmation, adoption, or statement, and on the current evidence it does not by itself
   confer member standing.
2. **Evidence.** D9A §2.3 and D9-B B7 — `recall_count`, incremented by system retrieval without a
   member act, contributes up to `0.10`, while `confirmed_by_user` contributes up to `0.0225` in the
   measured scorer (≈4.4:1). D9-B nevertheless found **no path by which that scoring increase
   becomes member standing** and classified the condition as a **ranking defect, not an authority
   defect**. Production occupancy of `recall_count` remains unknown.
3. **Prohibited.** `retrieved often → member confirmed/adopted/said it`, or `machine recurrence →
   member standing` without a member act.
4. **Adversarial case.** Increase system retrieval while holding member participation constant and
   inspect both ranking/salience and member standing/attribution.
5. **PASS.** Ranking may move; member confirmation, attribution, and standing do not move merely
   because retrieval repeated.
6. **FAIL.** Repetition is used as evidence that the member confirmed/adopted a claim, or an
   executable path is shown where repetition alone confers member standing. **The current D9-B
   evidence does not establish that FAIL as already occurring.**

---

## 3 · I-15 REPLACEMENT — PERSISTENCE ALONE DOES NOT IMPLY ADOPTION

#### I-15 · Persistence confers only the member dispositions explicitly carried by the persistence act

1. **Law.** Persistence alone does not imply adoption. A persistence gesture may simultaneously
   constitute an adoption, return, or surfacing decision only when that meaning is explicitly part
   of the member act. Where material is persisted pending a later decision, persistence confers no
   adoption by itself.
2. **Evidence.** D9-B B8 — **PERSISTENCE / ADOPTION: contradictory semantics confirmed, not
   normalized.** In Writer's Studio, persisted proposal material confers nothing until a separate
   authorization row exists. In conversational memory, keeping an atom writes `return_preference`
   at keep time, so the member's keep gesture already carries the surfacing disposition. D9-B's
   exact conclusion: persistence ≠ adoption remains **UNRESOLVED as a global property**; the
   fused/separated distinction explains the two sites without calling either one authority leakage.
3. **Prohibited.** `stored → adopted` where no such disposition was part of the member act, and
   `persistence and adoption occur in one explicit gesture → therefore adoption is invalid`.
4. **Adversarial case.** Compare a persisted object stored with an explicit return/adoption
   disposition against one staged only for later decision.
5. **PASS.** Downstream authority follows the member act: the explicit fused disposition operates;
   the merely staged object acquires no unstated adoption.
6. **FAIL.** Bare persistence supplies a decision the member did not make, or an explicit fused
   member act is falsely refused merely because persistence and adoption occurred together.

---

## 4 · I-17 REPLACEMENT — AUTHORITY DOES NOT SILENTLY EXPAND BEYOND DECLARED SCOPE

#### I-17 · An authorization does not silently compose into a use outside its declared scope

1. **Law.** An authorization does not silently expand beyond its declared purpose, consumer,
   audience, object, or act scope. A reading authorization therefore does not by itself prove
   representation authority unless its declared scope includes that use. Whether MAIA-as-speaker
   representation requires a distinct second member act remains an explicit evidence gap.
2. **Evidence.** D9-B B4 establishes one live purpose-bound consumable authorization. D9-B B5b and
   §9 R1 explicitly leave member-facing representation independently governed **UNRESOLVED**; only
   convention exists on the live MAIA-to-member path. D9-C §7–§7.2 establishes one narrow genuine
   human-audience representation warrant while preserving MAIA-as-speaker as **STILL UNEVIDENCED**.
   The earlier T-8 observation — a reading warrant with no second representation field — cannot by
   absence alone establish that a second act is universally required.
3. **Prohibited.** `authorized for use A → silently authorized for use B` merely because the same
   material is involved.
4. **Adversarial case.** Exercise an authorization, then attempt a later use whose purpose/audience/
   act differs; separately test a later use explicitly included inside the original authorization's
   declared scope.
5. **PASS.** The later use proceeds only when it is inside the original declared scope or another
   valid authority supports it. No distinct second act is demanded merely by intuition.
6. **FAIL.** The system infers the later authority from adjacency alone, or this contract requires a
   second member act for MAIA-as-speaker representation despite the evidence gap.

---

## 5 · REPLACEMENT ACCOUNTING

R4 changes clause scope, not the evidence-source attribution of the four identifiers.

```text
31  locally earned D9/F5 invariant laws
 1  declared GAP clause — I-19
 1  imported prior ratified law — I-33
---
33  numbered clauses across 13 domains

17  locally earned laws unchanged from the first adjudication
10  corrected by R2
 4  corrected by R4: I-12 · I-14 · I-15 · I-17
---
31  locally earned laws
```

The 17 unchanged locally earned laws are:

```text
I-2 · I-5 · I-6 · I-8 · I-9 · I-11 · I-13 · I-18 · I-21 · I-22 · I-23 · I-24 ·
I-27 · I-28 · I-29 · I-30 · I-31
```

The ten R2 replacements remain:

```text
I-1 · I-3 · I-4 · I-7 · I-10 · I-16 · I-20 · I-25 · I-26 · I-32
```

Source attribution remains:

```text
I-12   convergent D9 + F5 at the historical/present-effect distinction
I-14   D9
I-15   D9
I-17   D9, bounded by the D9-C representation gap
```

---

## 6 · REQUIRED BOUNDED RE-ADJUDICATION

Re-test exactly:

```text
I-12 × I-9 × D9-B B6
I-14 × D9-B B7
I-15 × D9-B B8 × positive-control/non-impoverishment
I-17 × D9-B B5b × D9-C §7.1
R3 closing-synthesis deletion × all four corrected clauses
classification / count
anti-laundering / no new evidence
```

Acceptance requires the four replacements to remove the overclaims without inventing a new
architecture, closing an open gap, or weakening the protected member interest.

---

## 7 · STANDING

```text
R3 9d0539b3f                  HISTORICAL CANDIDATE · closing-synthesis deletion retained
R3 ADVERSARIAL REVIEW 8bc78b9b5  RETURN ON I-12/I-14/I-15/I-17
R4                             CANDIDATE · NOT RATIFIED
IMPLEMENTATION                 CLOSED
SCHEMA / ROUTE / UI / MIGRATION NOT AUTHORIZED
NEXT                           bounded R4 re-adjudication
```

**STOP.**
