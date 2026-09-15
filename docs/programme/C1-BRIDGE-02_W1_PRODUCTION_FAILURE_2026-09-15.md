# C1-BRIDGE-02 · W1 PRODUCTION WITNESS · ⛔ FAIL

**Date** 2026-09-15 · **Runtime** `0f58a7f93` · **Base** `e57ca1baa` (production lineage)
**Lane** `JARVIS-MAIA-LONGITUDINAL-CONTINUITY-01` · L1 · `C1-BRIDGE-02`
**Disposition** ⛔ **W1 FAIL · W2 NOT RUN · W3 NOT RUN · `S` UNSPENT · NO TUNING · NO REPAIR**

---

## 1. Custody at the time of the witness

WITNESSED (verified in the deploy transcript, three ways — image · `printenv` · `Config.Env`):

```text
deployed commit    0f58a7f93
one-hop scorer     lib/maia/continuity/sessionRecovery.ts
                   diff e57ca1baa..0f58a7f9 → EMPTY (byte-identical)
behavioral delta   lib/maia/continuity/sessionBridge.ts (new)
                   lib/sovereign/maiaService.ts (bridge seam)
                   — and nothing else under lib/ app/ components/
Co-Lab gate        33 passed · 0 failed · 0 warned
```

## 2. What was observed

Production log, `session_1789491934651`, turn 42:

```text
🚦 Processing Profile: CORE | Turn 42 | Length: 41
🌉 [L1/bridge] recovered { count: 3, indices: [ 5, 15, 27 ], via: [ 38, 38, 38 ] }
🧵 [L1/CORE] recovered displaced exchanges { count: 3, indices: [ 5, 15, 27 ] }
🧭 [A6/CORE] session continuity { depth: 41, represented: 7, absent: 34, unit: 'completed exchanges' }
```

MAIA's reply cited "exchange 28" (= index 27, since the prompt renders `index + 1`) and
reproduced the marker phrase.

## 3. Verdict

**⛔ FAIL.** The acceptance law, precommitted before deployment, required the bridge to
recover **index 22** — the authoritative member-originated plant.

```text
W1 expected    bridge indices ∋ 22
W1 observed    bridge → [5, 15, 27]   via [38, 38, 38]
reply          reproduced the marker phrase
verdict        ⛔ FAIL
```

⭐⭐ **The correct answer does not rescue the witness.** MAIA was handed recovered material
that carried enough of the thread to reproduce the phrase, and she reproduced it verbatim from
the durable record — no hallucination occurred. But the acceptance test is about **provenance
correctness**, not about whether the member happened to be satisfied. A right answer reached
through an unauthorized path is exactly the outcome this lane exists to refuse. *Answer
correctness is incidental to this witness and cannot substitute for provenance correctness.*

**Founder adjudication on index 27, settled from the frozen corpus:** 27 is **NOT** a second
member-originated plant. The member text at 27 does not contain the marker tokens; **MAIA's
response at 27 does.** So the live bridge terminated on a MAIA echo of the marker, not on the
member's own naming of it — the precise condition the **N1** negative oracle exists to refuse
at function level.

## 4. What the `via` field establishes

`via: [38, 38, 38]` — all three recoveries hopped through active-prefix index **38**.

The frozen P1 oracle's positive path runs through the member's prior *failed retrieval attempt*,
which named the target and hops to **22**. Production selected a different hop entirely.

⭐ **The bridge architecture is ACTIVE and OPERATING in production.** It is not inert, not
bypassed, and not falling through to the opaque scorer. What failed is **live bridge
selection**: the hop it chose does not reproduce the authoritative P1 path.

## 5. ⚠️ ONE OBSERVATION THAT DOES NOT ALTER THE VERDICT, AND IS NOT OFFERED AS AN EXCUSE

WITNESSED, by direct read of the frozen artifact and of the served turn:

```text
frozen P1 probe (verbatim)   "can you remember the phrase I shared with you eralier"
W1 probe as served           "what was that phrase I mentioned earlier?"
```

**These are different probes with different token sets.** HOP 1 in `recoverViaBridge` selects
prefix exchanges by shared probe token, so a different probe can select a different hop by
construction.

⛔ **This does NOT overturn the FAIL, and must never be read as one.** Production was asked a
generic retrospective question of exactly the kind the deployed capability claims to serve, and
it did not recover the authoritative plant. That is the finding, and it stands.

⛔ **It is also NOT permission to re-run W1 with the frozen probe.** A witness re-served until
it agrees with its oracle is not a witness.

⭐ What it does establish is that the record must **not** claim that identical input produced
divergent results between the function-level oracle and production. It did not. Whether the
divergence is (a) probe-sensitivity in HOP 1, (b) a genuine defect in live bridge selection, or
(c) a corpus/oracle fidelity gap is **UNDETERMINED** — and deliberately left so.

Re-run of the frozen oracle at this SHA, for contrast only:

```text
P1  ✅ must recover 22 · got [22,24,5]
N1  ✅ must NOT recover 22 · got [5,13,14]
N2  ✅ must recover NOTHING · got []
```

*The function-level oracle passes on its own probe while production fails on another. Naming
that gap is the honest record; closing it is not authorized here.*

## 6. Turn 43 — recorded, explicitly NOT used

```text
🚦 Processing Profile: CORE | Turn 43 | Length: 25
🌉 [L1/bridge] abstained { reason: 'no-member-link-to-recent-context' }
🧭 [A6/CORE] session continuity { depth: 42, represented: 4, absent: 38, unit: 'completed exchanges' }
```

A separate, later turn. ⛔ **It must not be used to repair, soften, or reinterpret W1.** It is
noted here only so the log is recorded whole rather than selectively.

⚠️ It is **NOT** a W2 pass. W2 was not run and is not authorized. It does, incidentally,
show abstention and `represented: 4` with no `🧵` line following — but a witness not run under
its own procedure is not evidence, and this record does not treat it as any.

## 7. Standing

```text
W1                   ⛔ FAIL (recorded)
W2                   ⛔ NOT RUN · NOT AUTHORIZED
W3                   ⛔ NOT RUN · NOT AUTHORIZED
S (semantic probe)   ⛔ UNSPENT
production tuning    ⛔ NONE PERFORMED
repair               ⛔ NONE PERFORMED · NOT AUTHORIZED
root cause           ⛔ NOT INVESTIGATED (would be a repair lane; requires a founder act)
rollback             ⛔ NOT INDICATED BY THIS WITNESS ALONE — see below
runtime              0f58a7f93 REMAINS DEPLOYED, UNCHANGED
```

**On rollback.** The precommitted rollback triggers were: bridge-positive path cannot recover
its grounded target · opaque abstention falls through to unrelated retrieval · grounded one-hop
retrieval intercepted or broken. The first is **arguably met** and is a founder ruling, not
mine to take. Recorded against it: the one-hop scorer is byte-identical to the prior production
build, the bridge did operate rather than fall through, and no unrelated retrieval was served.
⛔ **No rollback performed. No recommendation smuggled in as a finding.**

## 8. The finding, stated once

⭐⭐ **The bridge architecture is live in production and selects a real member-grounded path —
but the path it selects is not the authoritative one, and it terminated on a MAIA echo of the
marker rather than the member's own naming of it.** The member received a correct phrase by a
route the acceptance law does not authorize.

*That MAIA nevertheless answered correctly is the most dangerous property of this failure, not
a mitigating one: it is the shape of a defect that would never have surfaced from member
satisfaction alone.*

---

## 9. ROLLBACK · AUTHORIZED BY FOUNDER RULING (2026-09-15)

The precommitted trigger **`bridge-positive path cannot recover its grounded target`** was met.

```text
W1                     ⛔ FAIL · durable at 60252820
0f58a7f93              ⛔ NOT PRODUCTION-ACCEPTED
rollback               ⭐ AUTHORIZED / INDICATED
rollback target        e57ca1baa  (⛔ not canonical · ⛔ not a newer branch)
W2 / W3                ⛔ remain unspent
S                      ⛔ remains unspent
repair investigation   ⛔ NOT AUTHORIZED
root-cause diagnosis   ⛔ NOT AUTHORIZED
W1 re-run after rollback ⛔ NOT REQUIRED — the failure is spent and recorded
```

⛔ **The probe difference does not change the disposition.** It may matter for a later
diagnosis of *why* the live bridge chose a different path; it does not make the deployed
behaviour acceptable. The capability was meant to serve a generic retrospective request, and
the first production witness showed its provenance can terminate on a MAIA echo while still
producing a satisfying answer.

### 9.1 Custody to verify after rollback (⚠️ manual — the script does not gate on it)

⚠️ `cmd_rollback` verifies only container health (`deploy-production.sh:778`). It reads the
`:previous` image's `git.commit` label and **logs it without gating on it**, so a wrong
`:previous` would be restored and still reported as success. The label must therefore be
pre-checked, and these three facts confirmed by hand afterwards:

```text
running commit      e57ca1baa
bridge integration  ABSENT — `grep -rl "L1/bridge" .next/server` inside the container
                    must return NOTHING (positive proof the code is not in the image,
                    not merely that it did not log)
one-hop scorer      unchanged (byte-identical across the whole episode; it was never
                    modified by the bridge deploy — §1)
```

### 9.2 ⚠️ Tag state created by the rollback itself

`cmd_rollback` re-tags the failed build as `:previous` on success
(`deploy-production.sh:783`):

```text
:current   e57ca1baa   restored
:previous  0f58a7f93   THE FAILED BUILD
```

⛔ **A second `rollback` would roll FORWARD into the failed build.** Recorded so the recovery
primitive does not become the next trap.

## 10. ⭐⭐ THE DISTINCTION THIS LANE CARRIES FORWARD

**The bridge MECHANISM is not disproven. Its production SELECTION LAW is.**

The frozen P1 established that a lawful member-grounded path to `22` exists. Production
established that under another ordinary opaque formulation, live selection can choose a
different path terminating in **assistant-carried material**. Those are different claims and
must not be collapsed: rolling back the integration is not a finding that a bridge cannot be
built.

⭐⭐ **A provenance defect that produces a wrong answer announces itself. A provenance defect
that produces the RIGHT answer can become invisible infrastructure.** That is why this witness
existed, and why member satisfaction was never permitted to discharge it.

The selection law is the next architectural question. ⛔ It belongs to a separately authorized
repair/investigation act, and is not opened here.

---

## 11. ROLLBACK · EXECUTED AND VERIFIED (2026-09-15T20:27Z)

```text
running commit      e57ca1baa                              ✅ WITNESSED (printenv)
bridge integration  grep -rl "L1/bridge" .next/server → (empty)   ✅ WITNESSED
one-hop scorer      unchanged — byte-identical throughout; never modified by the
                    bridge deploy (§1) and therefore unaffected by its removal
```

⚠️ **The scripted rollback primitive FAILED and had to be bypassed.**
`scripts/deploy-production.sh rollback` reported `Rollback complete!` while production
continued to serve `0f58a7f93` with the bridge live. Root cause: compose starts
`maia-sovereign:prod`, which `cmd_rollback` never retags; and its only provenance readout
(`git.commit` label) is never set, so the failure printed as blank fields rather than as an
error.

⭐⭐ **This was PREDICTED IN WRITING on 2026-09-14** and routed out unrepaired —
`docs/programme/ROLLBACK_IMAGE_ALIAS_MISMATCH_FINDING_2026-09-14.md`. Today's production
witness is recorded as an **addendum to that finding**, which moves it from ENTAILED to
WITNESSED. ⛔ No repair lane opened; `scripts/` unmodified.

Restore was performed by hand, verifying image identity from each image's **baked
`GIT_COMMIT` env** rather than the absent label:

```bash
docker tag maia-sovereign:e57ca1baa maia-sovereign:prod
docker compose -f docker-compose.production.yml up -d --no-deps maia
```

⭐ **ONE CONSEQUENCE FOR THIS LANE'S OWN RECORD, STATED PLAINLY.** Between the failed scripted
rollback (20:25:45Z) and the manual restore (20:27:38Z), production continued serving
`0f58a7f93` — code that had already been ruled ⛔ NOT PRODUCTION-ACCEPTED. ⛔ That window is
recorded, not minimised: an authorized rollback was believed complete while it had not
occurred. *A recovery primitive that cannot report its own failure converts a governed
rollback into an unnoticed continuation.*

## 12. FINAL STANDING

```text
W1                     ⛔ FAIL · durable at 60252820
0f58a7f93              ⛔ NOT PRODUCTION-ACCEPTED · NO LONGER DEPLOYED
production runtime     e57ca1baa · bridge ABSENT · verified
W2 / W3                ⛔ unspent
S                      ⛔ unspent
repair · root cause    ⛔ not authorized, not begun
rollback primitive     ⚠️ DEFECTIVE · witnessed · routed out · unrepaired
```

### 11a · Independent image-ID census corroborating the restore

Founder-run, read-only, after the manual restore:

```text
running container   image_id sha256:0ad57611d747…   GIT_COMMIT=e57ca1baa
:prod               0ad57611d747…  tags ["current","e57ca1baa","prod"]
:current            0ad57611d747…  (same image)
:previous           a954f9a52ad6…  tags ["0f58a7f93","broken","previous"]
```

⭐ `:prod`, `:current` and `:e57ca1baa` resolve to **one image ID**, and it is the image the
container runs. This corroborates §11 at image-ID level, which is stronger than the `printenv`
check alone. The rejected build is correctly parked under `:previous`/`:broken`.

⚠️ **`:previous` is `0f58a7f93`** — a second `rollback` would roll FORWARD into the rejected
build (and would not touch `:prod` anyway). ⛔ Do not run it.

⭐⭐ **The census also confirms Defect B empirically**: every one of the five local images
reports `commit=<no value>`. ⛔ **No image in the store carries a `git.commit` label at all**,
so a search for *"the image whose label is `e57ca1baa`"* can never succeed.
`maia-sovereign:e57ca1baa` is a **TAG**, not a label. Image identity must be established from
the baked `GIT_COMMIT` env or the SHA tag — which is what the restore used, and why it worked.
