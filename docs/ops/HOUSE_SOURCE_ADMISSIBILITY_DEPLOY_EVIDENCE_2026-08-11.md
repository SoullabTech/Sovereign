# House Source Admissibility — Integration & Deployment Evidence Record

**Date:** 2026-08-11
**Unit:** `house-source-admissibility-integrate-deploy`
**Governed claim:** Builder OS session `s-3d5b01a7` (write, no override, no recovery, no concurrency change)
**Candidate branch:** `feature/house-source-admissibility`
**Status at time of writing:** **NOT INTEGRATED · NOT DEPLOYED — held at governance gate (§6).**

This record exists because the prior evidence record lived only in a session scratchpad under
`/private/tmp` and is **no longer recoverable**. Everything below is re-derived from Git, the
test suite, a disposable-database proof, and read-only production queries performed on
2026-08-11. Narrative material from the prior session that could not be independently
re-derived is marked **UNAVAILABLE** rather than reconstructed.

---

## 1. Preserved corrections (carried forward verbatim in substance)

### 1.1 The migration tree is NOT byte-identical to `bc9359931`

**Preserved and independently re-verified.** `git diff --name-status bc9359931 18d744825`:

| Change | Path |
|---|---|
| `M` | `database/migrations/20260812000001_house_source_admissibility.sql` |
| `A` | `docs/architecture/ORIENTATION_AWARE_RETRIEVAL_PHASE1_2_FINDINGS_2026-08-11.md` |
| `A` | `docs/architecture/WISDOM_CORPUS_D3_PROVENANCE_AUDIT_2026-08-11.md` |

The authorized divergence was exactly:

- **one D2 Maya citation removed** from the migration header — the removed line was
  `--         docs/architecture/WISDOM_CORPUS_D2_CONVERSATION_WITH_MAYA_PROVENANCE_2026-08-11.md`
- **two non-Maya evidence documents added** (the two `A` rows above)

Re-verified 2026-08-11: the migration header now cites only D4 and D3. `grep -in 'maya\|D2'`
over the migration returns **NONE**; over all implementation files returns **NONE**.

### 1.2 D3 is the Books-folder provenance audit, not the excluded D2 document

**Preserved.** `WISDOM_CORPUS_D3_PROVENANCE_AUDIT_2026-08-11.md` contains incidental Maya
references **because a mis-titled conversation transcript is itself part of the provenance
finding** — D3 §rows 191–194 list `conversation-Maya-2025-10-30*.md` as
`MAIA CONVERSATION / TRANSCRIPT`, house-owned, **EXCLUDE RECOMMENDED**, and D3 line 104 names
this as *precisely why the Maya problem got through*. These are findings **about** mis-titled
transcripts, not Maya-scoped provenance adjudication.

**D3 inclusion is therefore not D2 inclusion.** The D2 document
(`WISDOM_CORPUS_D2_CONVERSATION_WITH_MAYA_PROVENANCE_2026-08-11.md`) is **absent from the tree
entirely** and absent from the evidence commit.

### 1.3 UNAVAILABLE material

The prior scratchpad record's narrative sections (rationale prose, session-by-session
reasoning, any proof output not re-derivable from Git or re-runnable tests) are
**UNAVAILABLE**. No attempt has been made to reconstruct them. Nothing in this document is
inferred from memory of that record; every claim below is re-derived and re-runnable.

---

## 2. Git truth (re-established 2026-08-11, not inherited)

```
PR BASE LINEAGE          5767d5d41 → bc9359931 → <correction> → <evidence>
REMOTE BASE PRESERVED    bc9359931  (NOT rewritten, NOT force-pushed)
MERGE BASE WITH TRUNK    5767d5d41
IMPL COMMIT CONTENT      af0833b4b  reproduced byte-identically (see §2.1)
EVIDENCE COMMIT CONTENT  18d744825  reproduced byte-identically (see §2.1)
WORKTREE CLEAN           yes (0 dirty)
```

**Resolved — PR #1027 head was stale.** The open PR pointed at `bc9359931`, the tree *before*
the authorized correction; merging it as it stood would have landed the withdrawn D2 citation
and omitted two evidence documents.

The correction was published **by ordinary fast-forward on top of `bc9359931`**, per founder
ruling 2026-08-11. Force-push was **not authorized and not used**: the pre-correction artifact
is a known, superseded — not foreign — state, and preserving it keeps the actual transition
visible to review rather than erasing it from history.

An earlier local lineage (`af0833b4b → 18d744825 → dad06f347`) had been re-authored from trunk
rather than appended to the remote head, making it a *sibling* of `bc9359931` and therefore
unpushable without force. That lineage was **abandoned in favour of the append-only shape**;
its content was carried across intact and is preserved at tag `safety/pre-ff-dad06f347`.

### 2.1 Content equivalence to the proven tree

The published tree was produced by checking out the proven tree wholesale onto `bc9359931`,
then applying only the D2 dependency repairs of §2.2. All six implementation files are
**byte-identical** to the independently proven tree; no implementation content was changed
while review was being resumed.

### 2.2 Withdrawn-D2 dependency repair (founder ruling 2026-08-11)

The acceptance condition is **authoritative dependencies on withdrawn D2 = 0**, while
documentary references to its withdrawal remain permitted. Five repairs were applied. Each
replaced a dependency with surviving in-tree evidence, or rewrote the claim to rest only on
surviving evidence. **D2 was not recreated and no provenance was invented.**

| # | Location | Was | Now rests on |
|---|---|---|---|
| 1 | spec header | D2 listed among *"Proofs this rests on"* | D4 + **D3** + ORIENTATION, plus an explicit withdrawal note |
| 2 | spec §4 heading | *"the D2 exclusions"* | *"the transcript exclusions"* |
| 3 | spec §4 body | `admission_basis` instructed to cite *"the D2 proof"* — would have written a citation to a nonexistent document into production rows | **D3**, which classifies all four as `MAIA CONVERSATION / TRANSCRIPT` and records **EXCLUDE RECOMMENDED** for each |
| 4 | D4 header | *"**Upstream:** WISDOM_CORPUS_D2…"* | states the upstream pass's document was withdrawn; §8 is **self-evidenced** (the four sources were re-read from production in that pass and the rows are reproduced inline), provenance proper belongs to **D3** |
| 5 | D4 §9 | *"D2 §A records them"* as the checksum record | the four ids + checksums recorded in **spec §4**, which is in-tree |

Repair 3 was the materially consequential one: left unrepaired it would have baked a citation
to a withdrawn document into `admission_basis` values in the production database.

**Permitted documentary mentions retained** (D2 named as a historical incident, never as
authority): D4 §7 folder-placement analogy, D4 §8 heading and analysis — which explicitly
assigns the evidentiary burden to D3 — D4 §10 status-column label, and the two removal records
in this document at §1.1 and §6.

⚠️ **Scan-coverage correction.** An earlier count in this record reported *"0 dangling
citations"* and a later scan reported *4 D2 references*. Both were incomplete: the first
scanned only implementation files for `docs/…`-shaped paths; the second matched only the full
`WISDOM_CORPUS_D2` filename and so missed bare `D2` prose references, two of which were
genuine authoritative dependencies (repairs 3 and 5). The audit above is by **classification**,
not by string match, and supersedes both.

### Commit purity

`af0833b4b` — **6 implementation files, 0 unrelated:**

```
app/api/founder/library-admissions/route.ts
database/migrations/20260812000001_house_source_admissibility.sql
docs/canon/HOUSE_SOURCE_ADMISSION.md
lib/library/LibraryService.ts
lib/library/__tests__/admissibility.test.ts
lib/library/admissibility.ts
```

`18d744825` — **4 evidence documents:**

```
docs/architecture/ORIENTATION_AWARE_RETRIEVAL_PHASE1_2_FINDINGS_2026-08-11.md   (ORIENTATION findings)
docs/architecture/WISDOM_CORPUS_D3_PROVENANCE_AUDIT_2026-08-11.md               (D3 provenance audit)
docs/architecture/WISDOM_CORPUS_D4_RATIFICATION_PROOF_2026-08-11.md             (D4 evidence)
docs/specs/HOUSE_SOURCE_ADMISSIBILITY_RECORD_PLAN_2026-08-11.md                 (governing spec)
```

D2 Maya-scoped document: **absent.**

### Citation resolution

Every document path cited by the implementation resolves to a file that exists in the
post-integration tree:

```
DANGLING CITATIONS      0   (8/8 cited paths resolve)
D2 MIGRATION REFERENCES 0
```

---

## 3. Ownership boundary (§4) — SECURITY / OWNERSHIP BOUNDARY

`PLATFORM_ONLY_PREDICATE` (`lib/library/LibraryService.ts:193`):

```sql
AND s.practitioner_member_id IS NULL
AND s.vault_file_id IS NULL
AND s.field_slug IS NULL
```

**Scope — applied unconditionally, not opt-in.** It is interpolated into both retrieval
paths: `semanticSearch()` (`LibraryService.ts:434`) and `fullTextSearch()`
(`LibraryService.ts:515`). Because `search()` falls through to full-text when semantic returns
nothing, gating both identically is load-bearing; the code marks this explicitly. Every caller
of `search()` **and** `searchAdmitted()` therefore inherits the boundary.

**This predicate does not exist on trunk `5767d5d41`.** Verified:
`git show 5767d5d41:lib/library/LibraryService.ts | grep -E 'PLATFORM_ONLY_PREDICATE|practitioner_member_id|vault_file_id|field_slug'`
returns nothing. **This unit introduces the ownership boundary.** It is a behavioural no-op
against today's production data (see §4) but closes a real prospective hole.

**Classification:** SECURITY / OWNERSHIP BOUNDARY — a safety invariant, distinct from the
admission gate, which is a caller-supplied compositional *scope*.

### Caller assertion

```
CALLERS OF searchAdmitted()   0 live callers
                              (only a doc-comment mention at lib/library/admissibility.ts:9)
CALLERS OF search()           app/api/oracle/conversation/route.ts:1024   (retired lane, ~zero traffic)
                              app/api/library/ask-jeeves/route.ts
                              app/api/library/search/route.ts
                              lib/consciousness/LibraryOfAlexandria.ts:48
CALLERS INHERITING THE PREDICATE   all of the above (via semanticSearch/fullTextSearch)
UNEXPECTED SWITCH             NO — no existing live caller has switched to searchAdmitted()
```

`searchAdmitted()` is a separately named entry point rather than a flag on `search()`,
deliberately: a member path cannot reach unadmitted material by omission — it would have to
call a different method by name.

---

## 4. Production baseline (§5) — read-only, 2026-08-11

Queried against `maia-postgres` on minisforum. **No production data was mutated.**

```
TOTAL library_sources             2228
review_status DISTRIBUTION        uploaded | 2228   (uniform)
PRACTITIONER-OWNED                0
VAULT-BACKED                      0
FIELD-SCOPED                      0
library_source_admissions         ABSENT (migration not yet applied)
CURRENT ADMISSION ROW COUNT       n/a — table does not exist
```

**§5 hard gate: PASSES.** The zero-non-platform-row property still holds, so the
"predicate is currently a behavioural no-op" analysis remains valid. This property is
time-sensitive and **must be re-checked immediately before deployment (§12).**

---

## 5. Proofs

### Jest (§7)

```
lib/library/__tests__/admissibility.test.ts
18 passed, 18 total   (Test Suites: 1 passed)
```

Includes the release-blocker case *"semantic AND full-text fallback are gated identically"*,
*"an unrecognised scope fails closed rather than widening eligibility"*, *"automation cannot
self-admit"*, *"derives admitted_by from the session and REJECTS a body-supplied value"*, and
*"is the only writer of the table in the repo"*.

### Governed typecheck (§7)

```
TYPECHECK CURRENT    231 errors  (program files 4035)
TYPECHECK BASELINE   239 errors  (baseline files 3965)
DELTA                -8 errors fixed, 6 identities gone, 0 reduced
NEW REGRESSIONS      0
RESULT               ✅ No TypeScript regressions
```

**Not re-baselined.** The 8-error improvement was left unrecorded, per instruction.

### Migration + gate proof (§8, §9)

Re-run 2026-08-11 against a **disposable local database** built from this migration's genuine
prerequisites (`members`, `library_sources` with `checksum` + the three ownership columns,
`library_chunks`) rather than the full historical migration corpus — permitted because
unrelated pre-existing migration debt is not this unit's to carry. **No production database
was touched.**

Script: `scripts/verify-house-source-admissibility.sh` — committed with this record, standalone
and re-runnable (`bash scripts/verify-house-source-admissibility.sh`); it creates and drops its
own disposable database.
Result: **42 assertions, 42 PASS, 0 FAIL.**

| § | Proof | Result |
|---|---|---|
| 8.1 | Prereq guard refuses to run without `library_sources.checksum` | PASS |
| 8.2 | Migration applies | PASS |
| 8.3 | Migration re-applies safely (idempotent) | PASS |
| 8.4 | Both required indexes present; gate index partial on `admitted` | PASS |
| 8.5 | `admitted_requires_actor` constraint; UNIQUE; ≥5 CHECKs | PASS |
| 8.6 | Admitted row without actor/time is REJECTED | PASS |
| 8.7 | Empty/whitespace `admission_basis` is REJECTED | PASS |
| 8.9 | Duplicate `(source_id, scope, version)` REJECTED; `version 0` REJECTED; unknown scope / state / use_constraint all REJECTED | PASS |
| 8.10 | FK `ON DELETE RESTRICT` — deleting a source with admission history REJECTED | PASS |
| 9.A | Admitted house source is retrievable through the gate | PASS |
| 9.B | Source with no admission row is NOT retrievable (fails closed) | PASS |
| 9.C | Append-only supersession: later `excluded` supersedes; v1 stays permanently legible; v3 re-admits; highest version governs | PASS |
| 9.D | Checksum invalidation: content change makes prior admission inert automatically | PASS |
| 9.E | Scope specificity: admission does not leak to a different scope | PASS |
| **9.F** | **OWNERSHIP BEATS ADMISSION** — practitioner-owned, vault-backed, and field-scoped sources each **deliberately admitted**, each **still excluded** from platform-only retrieval; gate returns the house source only | **PASS** |
| 9.G | Ownership-change invalidation: an admitted source that becomes practitioner-owned is excluded | PASS |
| 9.H | Unrestricted `search()` path remains ownership-bounded (no bypass) | PASS |

**The key invariant holds:** a source cannot become platform-readable merely because it is
admitted, if its ownership scope forbids platform retrieval.

---

## 6. Covenant classification (§6) — **BLOCKED**

Determined against the current `docs/GOVERNANCE_MENTOR_COVENANT.md`, not inherited from the
automated label.

The diff meets **Class B — Structural Risk** on its face (database schema/migration;
authentication/authorization on the founder route).

It **independently meets Class A — Sacred Boundaries**, which covers *"anything touching:
consent, privacy, retention, member sovereignty"*, and whose §12 Doctrine Lock states that
**"consent and privacy boundaries"** are *"not modifiable by MAIA and require Class A
review."* `PLATFORM_ONLY_PREDICATE` **is** a privacy boundary: it is the rule deciding whether
practitioner-private, vault-backed, and practitioner-field-scoped material may be read through
house-wide platform retrieval — and this unit *creates* that boundary where trunk has none.
That it tightens rather than loosens does not remove it from the class; the Doctrine Lock is
scoped by domain, not direction.

**Determination: CLASS A governs** (Class A is the higher gate and subsumes the Class B
triggers also present).

```
CLASS A GATE   Founder-Steward + 2 Council votes + 1 Mentor verification
CLASS B GATE   Founder-Steward OR Release Steward + 1 Mentor + rollback plan
```

**Authority present on PR #1027:**

```
labels     [class-b]        ← automated label only; evidence that automation applied a label,
                              NOT founder classification authority
reviews    []               ← ZERO reviews
covenant-signoff label      ABSENT
state      OPEN
mergeable  MERGEABLE        ← GitHub permits the merge; the covenant does not
```

**No approval exists under *either* classification.** The A-vs-B determination therefore does
not need to be contested to reach the outcome — the gate is unmet on both readings.

On `covenant-signoff`: it is defined as a temporary bootstrap bridge that satisfies the
*approval* requirement when no independent second steward exists. By its own terms it
**"does not bridge classification or rollback."** It is not self-appliable — it is an explicit,
logged single-operator sign-off, and this session is not an operator. It was not applied, and
applying it here would be manufacturing approval.

**STOP — GOVERNANCE SIGNOFF REQUIRED.**

---

## 7. What remains, in order, once authority is granted

1. ~~Resolve the stale PR head~~ — **DONE.** Published by fast-forward on `bc9359931`; PR
   #1027 now points at the corrected tree. No force used.
2. **Obtain Class A covenant signoff** on the exact published SHA. Until then nothing below
   proceeds.
3. **Reconcile trunk drift.** Trunk moved `5767d5d41 → 3954fbfab` (PR #1028,
   `fix/relational-context-live-recall`) *after* this artifact was proven. Deliberately **not**
   rebased into the branch during publication — correcting an artifact under review and
   integrating it onto current trunk are separate edges, and mixing them would have obscured
   the correction. The integration unit reconciles this **after** the signed-off SHA is known,
   and must re-prove that the signed-off tree remains semantically intact. Verified at
   publication time: the new trunk work touches **no** Library/admissibility file.
4. **Re-run §5** immediately before deploy — practitioner / vault / field must still be 0/0/0.
   If any is non-zero: **STOP, classification G.**
5. Integrate through the normal governed merge path.
4. Deploy the exact integrated immutable SHA via
   `scripts/deploy-production.sh deploy <SHA>` (migration-aware path; the quick
   `deploy-maia` path does **not** run migrations and is wrong for this unit).
5. Production schema proof, behavioural proof, non-interference re-query, caller assertion
   against the deployed SHA, smoke checks.

**Known pre-existing baseline for step 5:** `/api/library/ask-jeeves` returned **503 before**
any of this work. An unchanged 503 there is **not** a deployment regression — but it must be
reported accurately rather than omitted.

**Rollback plan (Class B requirement, recorded here for the gate):** revert the merge commit;
the migration creates one new table and two indexes and alters nothing existing, so
`DROP TABLE library_source_admissions` is a complete schema rollback. No existing row,
column, or `review_status` value is modified by this migration.

---

## 8. Confirmed non-interference properties

- The migration **creates** `library_source_admissions`; it does not alter `library_sources`.
- `review_status` is deliberately untouched — it remains the practitioner-side ratification
  lifecycle. This table is the house-side authority. The two governance systems stay separate.
- No production data was read/written by this session beyond read-only `SELECT count(*)` and
  `to_regclass` queries.
