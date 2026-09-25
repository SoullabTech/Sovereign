# JARVIS · WRITERS-STUDIO-NEXT-01 / A1-LS1-R3 AMENDMENT
## SECTION-LOCAL CONFLICT PRECONDITION + FROZEN-SCENARIO INTERPRETATION

**Status:** EXECUTABLE AMENDMENT · MODIFIES A1-LS1 ONLY AS STATED  
**Issued:** 2026-09-25  
**Parent packet:** `WRITERS-STUDIO-NEXT-01_A1-LS1_EXECUTION_PACKET_2026-09-25.md` · SHA-256 `290883cd4106747e643c9e28f0536b480fe40efa07fa9121d4339c2e783a0334` · 12,371 bytes.  
**Exact base remains:** `e886888416062c7fcbcf899040e3827bc8013835`.  
All parent-packet law remains unchanged except where this amendment explicitly supersedes its interpretation of R3/frozen S5 and frozen S4.

### 1. R3 conflict semantics
Accept section-local optimistic concurrency as the minimum semantics required by LS1 conflict containment.

A section save succeeds when, under the existing transaction/locking boundary:
1. submitted draft base version matches current draft version; OR
2. the persisted body of the specific section being saved is byte-equivalent to the body state that client last observed.

If neither holds, that section conflicts.

A draft-wide version change caused by section A must not by itself make an otherwise unchanged section B conflict.
### 2. Observed-body digest law
The client sends SHA-256 of the **section body bytes exactly as the context route delivered them**.

The client does not receive the stored heading prefix. Server comparison therefore:
- reads the currently stored section text under the same transaction/lock;
- applies the same canonical split used to derive the body delivered by context (`splitStoredSection` or its exact governing equivalent);
- computes SHA-256 over that resulting body with **no normalization**;
- compares it to the client's last-observed-body digest.

No whitespace, Unicode, punctuation, Markdown or semantic normalization is authorized.

After a successful save of that section, the client's observed state becomes the exact body it successfully saved and its digest is advanced accordingly.

The digest is only a concurrency precondition. It is not displayed, not a writer-facing version, not new manuscript identity, and must not be persisted as new canonical metadata merely for LS1.

If a client does not supply a valid observed-body digest, absence must not weaken concurrency protection: fall back to the existing draft-version precondition.
### 3. Atomicity and safety
The section-body comparison must occur inside the same existing locked transaction that decides and performs the save. Do not compute the authoritative comparison outside the lock.

The repair must preserve:
- no silent same-section overwrite;
- no cross-section false conflict merely because draft version advanced;
- conflicted section remains unresolved and visible;
- unrelated section can save;
- no conflict resolution UX.

No schema change is authorized.
### 4. Frozen S5 interpretation superseded
Frozen LS0 S5 remains immutable and MUST run unchanged.

Its original scenario manufactured stale draft version by editing a **different section** and expected the old draft-wide 409. Under the accepted R3 law, that exact 409 precondition is expected not to arise when the section being saved itself remains unchanged.

Therefore frozen S5 may report `INSTRUMENT_FAILURE` / inability to reach its historical first-409 precondition as an **expected historical-regression consequence**, not candidate acceptance and not a stop by itself.

For R3, additive A3 is the acceptance oracle. It must prove:
- different-section concurrency: A changes elsewhere; stale-version B with matching observed-body digest saves;
- same-section concurrency: A changes elsewhere; stale observed A fails with conflict;
- while A remains conflicted/marked, later B saves;
- whole-draft Needs attention remains until A is resolved by a later authorized mechanism (not LS1).

Parent §5/§11 are superseded only to this extent for S5.
### 5. Frozen S4 interpretation superseded
Frozen LS0 S4 remains immutable and MUST run unchanged.

Founder-authorized R2 removes live `Draft vN`. Frozen S4 uses that historical footer text as an observation anchor. If removal prevents the frozen S4 instrument from locating its old target and it reports `INSTRUMENT_FAILURE`, that is an expected historical-regression consequence.

It is neither acceptance nor a stop by itself.

Additive A2 is the acceptance oracle for save truth and must prove the complete parent-packet A2 law: Saved from successful initial load; Unsaved/Saving/Saved transitions; whole-draft off-chapter failure/conflict truth; no false Saved; and Draft vN absent.

Parent §5/§11 are superseded only to this extent for S4.
### 6. A3 mandatory mutants
In addition to parent-packet mutants, A3 must kill at minimum:
1. **draft-wide-only** — ignore observed-body digest and retain old global conflict behavior;
2. **same-section-overwrite** — permit stale same-section save despite digest mismatch;
3. **outside-lock-check** — make authoritative digest comparison outside the locked transaction;
4. **missing-digest-bypass** — absent/invalid digest permits save despite stale draft version;
5. **conflict-disappears** — B saves but unresolved A conflict/marker is cleared or hidden;
6. **unrelated-blocked** — A conflict still prevents safe B save.

Each mutant must fail the intended positive law, not merely crash the instrument.
### 7. Evidence record requirements
Record separately:
- frozen S4 result and why its historical anchor is no longer authoritative;
- frozen S5 result and why its historical 409 precondition changed;
- additive A2 positive/mutant evidence;
- additive A3 positive/mutant evidence;
- exact client/server paths changed for digest carriage/comparison;
- exact digest input bytes definition (body as delivered by context);
- proof authoritative comparison occurs under lock;
- proof no schema/migration was added;
- proof no resolution UI was introduced.

Do not rewrite LS0 evidence or its immutable instruments. This amendment changes only how those historical predicates are interpreted on the LS1 candidate.

### 8. Stop
R3 may begin only after this amendment's exact bytes are verified by the builder.

All other A1-LS1 stop conditions and exclusions remain binding.

Final stop remains:
**FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A1-LS1 CANDIDATE ONLY**
