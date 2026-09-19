# MAIA-MAVEN-T1A — J5 PREAMBLE NONCONFORMANCE / CANONICAL RECONCILIATION

**Status:** RECORDED · procedural defect corrected before PR publication
**Date:** 2026-09-17
**Subject:** `feature/maia-maven-t1a-repair-20260917`

## 1. What happened

Current canonical contains `680097e0c` — **docs(jarvis): require five-field lane preamble** —
committed 2026-09-17 at 16:04:39 EDT.

The T1-A J5 bounded repair charter/ruling was committed as `69fbeffa6` at 16:12:19 EDT, but the
repair branch had not fetched the intervening canonical commit. The lane therefore opened and
acted without the newly mandatory declarative preamble.

This is recorded as a **procedural nonconformance**. It is not rewritten as contemporaneous
compliance.

## 2. Why the substantive authority does not disappear

The canonical manual states that the five fields **do not create authority; they expose the
authority the lane already carries**, and that more-specific founder rulings continue to govern.

This repair already carried explicit founder R9–R11 authority over the exact defects admitted.
The missing preamble therefore did not manufacture implementation authority. It did, however,
make the lane's class, evidence subject, and stop boundary insufficiently visible while the work
was occurring.

## 3. Reconstructed mandatory preamble

```text
Class: Class A — memory handling / member sovereignty / consent boundary
Governing authority: MAIA-MAVEN-T1A J4 §§3,5–7 + founder rulings R9, R10, R11
Current gate: J5 bounded repair / technical evidence
Evidence subject: branch feature/maia-maven-t1a-repair-20260917; J5 correction base 2b3f6092; exact repair artifacts and tests named in MAIA-MAVEN-T1A_J5_REPAIR_EVIDENCE_2026-09-17.md
Stop boundary: no merge, deploy, J6 witness, legacy-consent reinterpretation, or capability widening beyond R9–R11
```

## 4. Classification consequence

This is **Class A**, not merely Class B. The migration/routing portions are structurally risky,
but the governing boundary is higher: the repair changes the rules by which persistent member
memory becomes eligible to return into MAIA's generative context.

Under the beta-phase Class A clause, founder approval arithmetic is presently sole
Founder-Steward authority, but that does not waive:

- exact candidate SHA;
- required CI on that SHA;
- rollback planning;
- explicit merge and production authorization;
- production provenance / runtime attestation.

The general R9–R11 repair ruling authorized the bounded repair. It is **not** converted here into
merge or deploy authorization for a later candidate SHA.

## 5. Canonical divergence discovered

After fetching current `clean-main-no-secrets`:

```text
common ancestor: 97c7d94634b8ce1cebfbd8c9f7e6b934d016f472
canonical head:   51d4060d71198ad5a36cfc6131dbfb9155617ba6
branch head:      127317e43c1af45fad2ca1ca3c586dd6cdcf9bad
canonical-only:   12 commits
branch-only:      11 commits
canonical paths:  10
branch paths:     44
overlapping paths: 0
```

The absence of path overlap removes a mechanical conflict but does not waive semantic
reconciliation. The preamble requirement itself is the semantic change this record addresses.

## 6. Required next act

Preserve ancestry: merge current canonical into the repair branch rather than rebasing away the
already-recorded evidence SHAs. Then rerun the decisive J5 evidence on the reconciled candidate.

Only the resulting post-reconciliation head may be proposed as the Class A PR candidate.

**No merge-to-canonical or production authority is granted by this record.**
