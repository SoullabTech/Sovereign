# WRITERS-STUDIO-OBSERVATION-IDENTITY-01 / I1B — PRELIMINARY FALSIFICATION

STATUS: PRELIMINARY SUBSTRATE EVIDENCE
⛔ **NOT an `APPROVED` review · NOT a DS-03 attestation · NOT admissible under §VII/§IX**
**Date**: 2026-09-22 · **Lane**: Writer's Studio. ⛔ **Not an I5 act.**

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Result — ALL EXPECTATIONS MET on a disposable shadow

Two databases identical but for the validator function
(`shadow_a` old `6dfaa24f…` · `shadow_b` new `7f46c494…`; both carry the same
2 triggers on `developmental_readings`).

| # | case | OLD | NEW | required |
|---|---|---|---|---|
| **II-A** | legacy old-reader write vs OLD validator | **ACCEPT** | n/a | baseline |
| **II-B** | ⭐ the **same** write vs NEW validator | n/a | **ACCEPT** | ACCEPT |
| III | canonical identity-bearing write | n/a | **ACCEPT** | ACCEPT |
| F1 | partial identity group (2 of 4) | n/a | **REFUSE** | REFUSE |
| F2 | undeclared key | **REFUSE** | **REFUSE** | REFUSE |
| F3 | complete identity, `position: null` | n/a | **ACCEPT** | ACCEPT |
| F5a | malformed `basisFingerprint` | n/a | **REFUSE** | REFUSE |
| F5b | `admissionIndex` ≠ ordinal−1 | n/a | **REFUSE** | REFUSE |

⭐ **II-A is what makes II-B evidence rather than vacuity.** An earlier harness run
had the baseline REFUSE — `outcome='reading'` additionally requires non-null
`classifier_provenance` — and that run was scored **instrument failure, not
evidence**. A fixture the old validator rejects proves nothing about the migration.

## 2. Why the compatibility holds, mechanically

The new validator widens the key allowlist by exactly four —
`observationId · admissionIndex · basisFingerprint · position` — and then gates on

```
identity_field_count NOT IN (0, 4)  →  EXCEPTION
```

**`0` is explicitly lawful.** The legacy shape carries none of the four, counts 0,
and passes untouched. The compatibility is structural, not incidental — ⭐ and it was
still *tested* rather than inferred, which is what §II demanded.

`position` may be JSON `null` (lawful structural-only) or an object with **exactly**
`sectionPosition` + `codePointStart`, both non-negative integers. So **F3 holds: no
positional fact is invented to satisfy the validator.**

## 3. ⛔ WHAT THIS IS NOT — the §IX gaps, named

Every one of these is a **defeat condition** under §IX and **none is discharged**:

- ⛔ **The old-reader write shape is CONSTRUCTED, not witnessed.** §II requires the
  exact shape the currently serving production reader emits. Mine satisfies the old
  validator; that is not the same claim.
- ⛔ **The old validator is REPOSITORY-DERIVED** (from `20260904000002`), ⛔ not read
  from production's `pg_proc`. §I requires the exact production definition.
- ⛔ **Trigger attachment is witnessed only in the shadow.** Repository evidence says
  `20260904000001` attaches `developmental_readings_observations`; §I forbids
  inferring attachment and requires a production witness. *Function replacement ≠
  trigger creation* — and this migration contains **0** trigger statements.
- ⛔ `member_manuscripts` is a **one-column stub**, not production schema.
- ⛔ **§V transaction-boundary review NOT DONE.** Observed only: the file owns
  `BEGIN;` L20 … `COMMIT;` L172, which overrides the runner's intended boundary.
- ⛔ **§VII / §VIII attestations NOT PRODUCED.** No custody record, no ordered-set
  binding, no prefix attestation.
- ⛔ Production identity, ledger state and pending set **NOT READ** — unavailable here.

## 4. §VI prefix collision — classified, and retirable

`20260921000001` is shared by the pending migration and
`20260921000001_epistemic_join_persistence.sql`. The runner keys ledger identity on
**exact filename + checksum** (`scripts/apply-migrations.sh:101-104`), so:
**NO LEDGER-IDENTITY COLLISION.** The remaining concern is execution
ordering / failure-prefix semantics only. ⛔ Do not spend review effort treating the
two as interchangeable.

## 5. Harness

`tests/constitutional/writers-studio-observation-identity/i1b-old-reader-compatibility-harness.sh`
— committed so the review can re-run it against **production-witnessed** inputs
rather than repository-derived ones. Shadow cluster destroyed; residue zero.

## 6. Standing

preliminary falsification **8/8 on a repository-derived substrate** · old-reader
compatibility **INDICATED, ⛔ NOT ESTABLISHED** · §I bindings **OWED** ·
§V **NOT DONE** · §VII/§VIII **NOT PRODUCED** · review **NOT APPROVED** ·
deployment **STILL BLOCKED** · ⛔ no production read · ⛔ no migration executed ·
⛔ I5 untouched · ⛔ not R4 · ⛔ not `--apply` · ⛔ not I5-P1.
