# MAIA-MAVEN-T1A — J5 POST-CANONICAL RECONCILIATION

**Status:** ✅ RECONCILED / TECHNICAL EVIDENCE RETAINED · Class A · merge/deploy held
**Date:** 2026-09-17
**Canonical reconciled:** `clean-main-no-secrets` @ `51d4060d71198ad5a36cfc6131dbfb9155617ba6`
**Canonical merge commit:** `dc2c8cea6d5c690885d0b39ddb7300b72cf0f7a8`
**Repair implementation:** `278f048ad8feec39904d12e4544e720116481c5a`
**Prior J5 repair evidence:** `127317e43c1af45fad2ca1ca3c586dd6cdcf9bad`

```text
Class: Class A — memory handling / member sovereignty / consent boundary
Governing authority: MAIA-MAVEN-T1A J4 §§3,5–7 + founder rulings R9, R10, R11 + Representation Authority Law
Current gate: J5 technical evidence / PR publication readiness
Evidence subject: canonically reconciled repair tree rooted at merge commit dc2c8cea; exact tests, type gates and migration witness below
Stop boundary: no merge, deploy, J6 witness, legacy-consent reinterpretation, or capability widening; post-migration rollback to old app is prohibited until separately governed
```

---

## 1. Canonical movement reconciled without rewriting evidence history

The repair lane was originally based at the common ancestor:

`97c7d94634b8ce1cebfbd8c9f7e6b934d016f472`

At reconciliation:

```text
canonical head:      51d4060d71198ad5a36cfc6131dbfb9155617ba6
branch head:         127317e43c1af45fad2ca1ca3c586dd6cdcf9bad
canonical-only:      12 commits
branch-only:         11 commits
canonical paths:     10
branch paths:        44
overlapping paths:   0
```

The canonical side was documentary / constitutional: JARVIS manual designation and preamble law,
Representation Authority canon, and its J10/J11 transfer lineage. No repair runtime path was
modified by canonical movement.

Rather than rebase and invalidate the already-recorded evidence SHAs, current canonical was merged
into the repair branch with an ordinary two-parent merge:

`dc2c8cea6d5c690885d0b39ddb7300b72cf0f7a8`

Parents:

- `da1e04a9cc3de2fbd203607238ce87a0734ec549` — repair lane including preamble nonconformance record;
- `51d4060d71198ad5a36cfc6131dbfb9155617ba6` — current canonical.

No merge conflict occurred.

---

## 2. Five-field preamble reconciliation

Canonical commit `680097e0c` made the lane preamble mandatory at 16:04:39 EDT. The repair lane
opened at 16:12:19 EDT on stale canonical and therefore missed it.

That nonconformance is preserved in:

`MAIA-MAVEN-T1A_J5_PREAMBLE_NONCONFORMANCE_2026-09-17.md`

It is not rewritten as contemporaneous compliance. The canonical manual states that the preamble
is declarative and does not create authority; the R9–R11 founder act supplied the substantive
repair authority. Publication now carries the required declaration and the lane is correctly
classified **Class A**.

---

## 3. Representation Authority Law reconciliation

Current canon added `docs/canon/REPRESENTATION_AUTHORITY_LAW.md`. The R10 repair creates and uses
an authority-bearing representation, so the law's defeater was applied explicitly.

### 3.1 `return_authority` — AUTHORITATIVE

**SUBSTITUTION:** hold the atom and member preference constant. Change
`return_authority` from `member_explicit` to `legacy_ambiguous` or `default_private`.
The atom's ambient eligibility changes. Therefore the representation is authority-bearing.

**GRANT:** founder R10 explicitly grants ambient return only after a separate member act. The
runtime act that carries this grant is `set_return_preference`; formation itself does not.

**ATTESTATION:** all of the following can become red:

1. database CHECK rejects values outside `legacy_ambiguous | default_private | member_explicit`;
2. migration/default test fails if legacy or future authority defaults drift;
3. gesture test fails if `set_return_preference` stops stamping `member_explicit` in the same UPDATE;
4. loader test fails if ambient eligibility stops requiring `member_explicit`;
5. source-authority falsifier fails if any second runtime writer starts minting `member_explicit`;
6. source-authority falsifier fails if either production atom INSERT stops forming
   `default_private` or starts minting `member_explicit`;
7. constitutional verifier scripts report preference and authority jointly rather than treating
   preference as self-authorizing.

Grant + attestation therefore both exist.

### 3.2 `return_preference` — not sufficient authority by itself

The preference remains meaningful member/domain state, but its value alone no longer determines
ambient eligibility. This is the exact repair required by the Representation Authority Law:
table membership or a stored label does not manufacture crossing authority.

### 3.3 Keep phrase representations

`detectKeepIntent()` may alter a doorway — UNDERSTAND/FACILITATE — but cannot commit persistent
material. The unresolved deictic sidecar parser now fails closed rather than allowing phrase
classification to decide the referent. Thus changing a phrase match may change assistance, but
it cannot independently create the authoritative Keep crossing.

---

## 4. Decisive evidence rerun after canonical merge

### 4.1 J5 + repair suite

Executed on the canonically merged tree, including the new representation-authority writer
falsifier:

```text
Test Suites: 12 passed, 12 total
Tests:       155 passed, 155 total
Snapshots:   0 total
```

The additional test makes the R10 grant boundary mechanically auditable:

- only `lib/psyche/portfolio.ts` may mutate `return_authority` to `member_explicit`;
- the only two runtime `member_memory_atoms` INSERTs are the portfolio writer and practitioner
  observation writer;
- both INSERTs must contain `default_private` and must not contain `member_explicit`.

### 4.2 Ship TypeScript gate

```text
program files: 4371
errors:        229 (baseline 239)
new diagnostics: 1
```

The sole new diagnostic remains unrelated and was present on the exact untouched repair base:

`app/wisdom-keepers/sacred-texts/page.tsx:207` — invalid `"contemplative"` tone union member.

Repair-attributable ship diagnostics: **0**.

### 4.3 Scripts TypeScript gate

```text
repository diagnostics: 38
changed witness diagnostics: 0
```

The untouched repair base carried 40; this lane removed two nullable-pool diagnostics from the
rewritten durability receipt and introduced none.

### 4.4 Mechanical hygiene

`git diff --check` — PASS.

The prior disposable PostgreSQL 14.19 migration witness remains applicable because canonical
movement had zero overlap with the migration or runtime repair paths. It demonstrated legacy
ambiguity, private future defaults, and explicit-member promotion exactly as recorded in
`MAIA-MAVEN-T1A_J5_REPAIR_EVIDENCE_2026-09-17.md`.

A PostgreSQL 16 / deployed-database witness remains explicitly unclaimed.

---

## 5. Class A rollback / deployment hold

The migration is additive, but an important asymmetric rollback condition exists:

- **Before the migration is applied:** reverting the eventual PR is an ordinary code/document
  rollback; no database semantics have changed.
- **After the migration is applied:** rolling the application back to the old image is **not a
  safe rollback**. Old loaders do not consult `return_authority` and could again admit historical
  `contextual_doorway` rows whose authority is now explicitly ambiguous.

Therefore:

> ⛔ **No production deploy is authorized until a post-migration rollback procedure is separately
> specified and witnessed.**

A lawful production rollback must preserve the new fail-closed authority boundary. It may be a
forward rollback artifact retaining the R10 loader gate or another explicitly governed mechanism;
it may not simply restore the pre-R10 application image after schema application.

This deployment hold does not prevent creating a PR or collecting CI evidence. It does prevent
claiming production readiness.

---

## 6. Gate standing after reconciliation

```text
Class ..................................... A — memory / member sovereignty
R9 exact-referent repair .................. ✅ TECHNICAL PASS
R10 KEEP ≠ REOPEN repair .................. ✅ TECHNICAL PASS
R11 T1-A scope ............................ ✅ PRESERVED — Press Keep READ only
Representation Authority reconciliation .. ✅ GRANT + ATTESTATION present
Post-canonical J5 tests ................... ✅ 12/12 · 155/155
Ship TypeScript regressions ............... ✅ 0 attributable
Changed script diagnostics ................ ✅ 0
Migration semantics ....................... ✅ disposable PG14.19 witness
PostgreSQL 16/deployed DB witness ........ ⚠️ OWED before deployment claim
Post-migration rollback witness ........... ⛔ OWED before deploy authorization
Production ................................. UNTOUCHED
J6 founder witness ......................... ⛔ NOT PERFORMED
Merge ...................................... ⛔ NOT AUTHORIZED by this record
Deploy ..................................... ⛔ NOT AUTHORIZED
```

**Next lawful act:** publish a **draft Class A PR** against current canonical and collect CI on the
exact candidate head. A PR is an adjudication surface, not merge permission. J6 founder witness
remains a separate human act after the candidate has a stable evidence surface.
