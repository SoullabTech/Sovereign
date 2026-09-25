# JARVIS · WRITERS-STUDIO-NEXT-01 / A1-LS1R1
## OUTSIDE-LOCK ACCEPTANCE-INSTRUMENT REPAIR + COMPLETE RE-WITNESS ONLY

**Status:** EXECUTABLE · INSTRUMENT REPAIR ONLY · PRODUCT CANDIDATE FROZEN  
**Issued:** 2026-09-25  
**Parent authority:** A1-LS1 packet SHA-256 `290883cd4106747e643c9e28f0536b480fe40efa07fa9121d4339c2e783a0334` plus A1-LS1-R3 amendment SHA-256 `d722648ead906ebfc52cdbdacf914ba4056f2a081d1b605fb26cbdcccefe5e29`.  
**Frozen product candidate:** `c723dc8cc9599e68b61f95d6be012ed53988e571` on `feature/ws-a1-ls1-authorship-safety-20260925`.  
**Candidate base:** `e886888416062c7fcbcf899040e3827bc8013835`.  
**Prior LS1 frozen instrument manifest:** `86d572539f7bf6dbeb768f7c98ab08cfb36d2c320aca9731322db4139a264b97`.  
**Prior evidence transport:** `ab0ca0b0` (historical evidence only; do not merge).

### 1. Founder adjudication carried forward
A1-LS1 is **SUBSTANTIVELY PASS · ONE ACCEPTANCE-INSTRUMENT REPAIR REQUIRED · CANDIDATE FROZEN · NOT YET ACCEPTED**.

The sole open proof defect is nondeterminism in the additive A3 witness for `M-A3-outside-lock-check`. The authoritative run killed 28/29 mutants; this mutant survived because the witness did not force the interleaving needed to distinguish an outside-lock comparison.

No product-code repair is authorized by LS1R1.
### 2. Candidate immutability
The exact product candidate `c723dc8cc9599e68b61f95d6be012ed53988e571` is byte-frozen.

LS1R1 MUST NOT:
- edit, amend, cherry-pick into, rebase or otherwise change candidate product/test code;
- add another product repair;
- merge or deploy;
- contact production;
- alter PC3, flagship, OBSERVATION-ADDRESS, Develop/Review, EA, schema or migrations.

Before and after the authoritative run, prove candidate HEAD identity and clean status. If the new instrument can pass only after a candidate/product change, STOP.
### 3. Authorized instrument repair
Modify only the LS1 acceptance-instrument layer in scratch.

Keep the existing A3 concurrency check `lockedComparisonSingleWinner` unchanged as an additional stress check.

Add a deterministic controlled-lock A3 check that:
1. opens its own database connection and acquires the relevant draft-row lock;
2. starts the target section save through the real candidate route;
3. establishes that the save is blocked waiting on that lock. If blocking cannot be established, result = **INSTRUMENT_FAILURE**, not pass/fail;
4. while holding the lock, applies the competing writer's change to that same section within the controlled transaction;
5. commits/releases the lock;
6. awaits the blocked save;
7. requires HTTP 409 / conflict;
8. verifies the competing writer's persisted section body remains preserved.

Record identities/status/digests only; no synthetic prose in evidence.
### 4. Mutant discrimination law
Run the same controlled-lock check against `M-A3-outside-lock-check`.

Required discrimination:
- **candidate:** comparison occurs after lock acquisition against current persisted body → digest mismatch → 409; competing state preserved;
- **outside-lock mutant:** stale body was captured before waiting on the lock → after release the mutant accepts 200 and overwrites competing state → mutant KILLED.

The check must force this ordering; scheduler luck is not evidence.

If candidate and mutant are not deterministically distinguished, STOP. Do not edit product code. Instrument practice may continue only before freeze.
### 5. Practice, freeze and authority
Practice runs remain non-evidence.

Once the repaired instrument reliably:
- passes on unchanged `c723dc8`;
- kills the outside-lock mutant for the intended law;
freeze the complete LS1 instrument set again.

Produce a new instrument manifest with filename, SHA-256 and byte count for every instrument/config fixture affecting results. Verify all frozen bytes before the authoritative run.

After freeze, any instrument edit invalidates the run and requires a new freeze plus complete re-witness.
### 6. Complete authoritative re-witness
On freshly verified unchanged `c723dc8`, rerun the COMPLETE acceptance programme, not a partial retest:

1. frozen LS0 regression matrix unchanged;
2. A1–A5 across all six synthetic flag configurations;
3. all 29 LS1 mutants, including the repaired outside-lock mutant witness;
4. candidate/mutant source integrity before and after;
5. repository typecheck and applicable unit/design/provider/no-Supabase gates;
6. migration sufficiency under the same LS0/LS1 law;
7. flag matrix;
8. teardown.

Required preserved standing:
- S1/S6/S7 historical defects absent;
- S2/S3/S8 remain RED/unchanged;
- S9 remains GREEN;
- frozen S4/S5 historical INSTRUMENT_FAILURE results remain interpreted under the R3 amendment and accepted S4 two-cause classification;
- A1–A5 GREEN in every configuration;
- **29/29 mutants KILLED**, each by an intended positive law;
- no scope escape, no new regression, candidate unchanged.
### 7. S4 classification carried forward
Frozen S4's INSTRUMENT_FAILURE has two accepted historical causes:
1. founder-authorized removal of its `Draft vN` observation anchor;
2. S4 raises only draft version without changing section body; under accepted R3 section-local concurrency, the body digest still matches and the save may return 200.

This is the same semantic succession already accepted for frozen S5. It does not reopen R2 or R3. Additive A2 remains the save-truth acceptance oracle.

Do not rewrite frozen LS0 evidence or instruments.
### 8. E1 and teardown
The existing idle synthetic E1 may be used for practice only if its integrity is re-established. The authoritative re-witness must begin from a fresh/cleanly reprovisioned E1 state under the existing migration-sufficiency law.

No production credentials/data/provider calls.

After evidence is packaged and hashed: stop app/stub/PostgreSQL, remove disposable DB data and raw token/log directories as governed by the prior packet, and record teardown.
### 9. Evidence custody
Create a fresh LS1R1 evidence package. Do not overwrite prior LS1 evidence.

Return candidate identity and proof unchanged; new frozen instrument manifest; controlled-lock candidate and mutant results; full LS0 matrix; A1–A5 six-configuration matrix; all 29 mutant outcomes; gates/tests/migration sufficiency/integrity; evidence manifest and record identities; fresh transport-only evidence branch/commit; teardown proof.

Transport is evidence/custody only and must not be merged as product implementation.

### 10. Stop
Stop if candidate differs from c723dc8cc9599e68b61f95d6be012ed53988e571; the lock check cannot prove waiting; candidate fails the new check; any mutant survives or is inconclusive; S2/S3/S8 change; S9 ceases GREEN; A1–A5 fail; integrity fails; or passing requires product mutation.

Otherwise package evidence, teardown E1 and stop at:

FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A1-LS1R1 COMPLETE RE-WITNESS

No merge, deployment, production probe, PC3 convergence or successor act is authorized.
