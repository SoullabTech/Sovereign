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
