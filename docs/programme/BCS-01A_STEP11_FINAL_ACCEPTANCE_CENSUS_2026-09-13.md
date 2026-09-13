# BCS-01A · Step 11 — Final P1–P12 Acceptance Census

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `5502c4bb`
**Kind:** ⭐ read-only acceptance adjudication · ⛔ no build authorization added
**Verified for this census:** clean tree at `5502c4bb`; full suite re-run against a fresh
disposable PostgreSQL 16.13 database → **10 suites · 122 tests · 122 passed**

> Adjudicated, not transcribed: each row is checked against the committed witness **and** the
> mutation that demonstrated the instrument could detect its violation.

---

## 1 · Ledger

| | Obligation | Disposition | Exercised by | Falsifier |
|---|---|---|---|---|
| **P1** | commissioned scope | **PROVED** | Step 4 A | Step 6 M7 |
| **P2** | frozen Work state | **PROVED** | Step 4 A · Step 7 A | Step 7 M1 |
| **P3** | current-consent contraction | **PROVED** ⚠️ ceiling | Step 2 W-P3 · **Step 7 D** (real material path) | Step 2 M-cache · Step 7 M3 |
| **P4** | durable execution | **PROVED** | Step 4 C/D/E/F | Step 4 M1–M5 |
| **P5** | expired-claim recovery | **PROVED** | Step 5 A–K | Step 5 M1–M7 |
| **P6** | checkpoint resume | **PROVED** | Step 6 · `['s1','s2','s2','s3']` | Step 6 M1–M8 |
| **P7** | cancellation act ≠ state | **PROVED** | Step 2 W-P7 · Step 4 G | Step 2 M2 · Step 4 M2 |
| **P8** | frozen input lineage | **PROVED** | Step 7 A/B/C · **F′** commit-time re-verification | Step 7 M1/M5/M10/**M11** |
| **P9** | three-state currency | **PROVED** | Step 2 W-P9 · Step 7 H/I/J/K | Step 2 M-null · Step 7 M7/M8 |
| **P10** | no automatic recomputation | **PROVED** | Step 2 W-P10 (spy queue + fresh-commission positive control) · Step 7 K | Step 2 M-enqueue · Step 7 M9 |
| **P11** | output classified by material type | ⭐ **PROVED** | **Step 10** · 1 admitted observation, 4 refusals, F-J2.3 invariance | Step 10 F11-A…E |
| **P12** | CMT boundary for outputs | ⭐ **PROVED** | **Step 10** · positive arm `member.atoms` ADMITTED · recurrence arm refused at type + runtime | Step 10 F12-A…D |

```text
12 materially exercised · 0 not yet exercised · 0 failed · 0 contract challenges
```

⭐ **No obligation is green by absence alone.** P11 and P12 moved from `NOT YET EXERCISED` only
because their subjects now exist: a durable recurrence observation, and a boundary with **both**
arms demonstrated.

---

## 2 · Recorded ceilings — what PROVED does not extend to

**P3** holds for the recurrence acquisition path. ⛔ It does not establish that every
material-crossing path in MAIA is wired through `permitCrossing`.

**P8/P9** rest on a **fixture `FrozenSectionProvider`**. ⛔ Production Work-table integration is
not proved.

**P11** proves classification for one material kind produced by one lawful mechanism. ⛔ It is not
a general output framework, and no second material kind exists.

**P12** proves the boundary discriminates **at the participation seam**. ⛔ It does not prove
anything about a served response — CMT-01 M3 is untouched, and no live contribution was made or
authorized.

⭐ The P12 negative arm rests on **provenance truthfulness**: `system.writer_pursued_observation`
is the closest registered neighbour — system-authored, Writer's Studio-scoped — and still cannot
carry this material, because its declared provenance is *MAIA's own earlier words returned to the
turn*. ⛔ Not on the absence of the word "recurrence".

---

## 3 · Acceptance rule, applied

```text
P1–P12 materially exercised                              ✅
no obligation green by absence alone                     ✅
every required mutant demonstrated bad before its RED    ✅  (R2; four repairs recorded)
project integration gates green before merge             ⛔ OWED — cannot run here
```

### ⭐ Verdict

> **BCS-01A · CONSTITUTIONAL ACCEPTANCE COMPLETE.**
> **FINAL PASS WITHHELD** pending `npm run typecheck` and `npm run test` on a checkout that can
> run them.

⛔ This is not a formality. The acceptance rule names the project gates explicitly, and this
environment has no `node_modules` — so the gates are **unrun**, not passing. ⭐ A census that
declared PASS here would be the same error class the lane has refused throughout: **reporting an
obligation as satisfied because its subject was unavailable.**

### What a final PASS will mean

> The bounded-cognition contract survived **one** recurrence proving flow.

⛔ It will not authorize: production · a second cognition flow · architectural generalization ·
CMT-01 M3 · automatic member-wide sweeps · general recurrence discovery · producer registration.

---

## 4 · Method findings carried out of this lane

Recorded as programme method (BCS-M1 family), not as new canon:

```text
R1   instrument the prohibited RELATION, not the vocabulary
R2   a known-bad must be shown bad before its RED counts
M8   schema checks catch stored shape; they never catch derivations or API behaviour
C21  strip comments before scanning — a file documenting its own compliance
     must not read as the banned behaviour returning        (3 occurrences)
⭐   an assertion against a constant is only as strong as that constant's
     independence from the code under test                   (new, Step 10)
⭐   a negative control loses discriminatory power when its lawful positive
     neighbour becomes unreachable                           (FR-J4 · RB-6 · P12)
```

⭐ **Four instrument repairs** were made during the lane — three narrowings of the coverage
prohibition and one invariance repair — each after a mutation exposed the instrument rather than
the implementation. ⚠️ **That count is itself a finding**: instruments in this lane failed more
often than implementations did.

## 5 · Standing

```text
STEPS 2–10             CLOSED
SUITE                  10 suites · 122 / 122 (re-run for this census)
P1–P12                 PROVED
CONSTITUTIONAL         ACCEPTANCE COMPLETE
FINAL PASS             WITHHELD — project gates owed
CONTRACT CHALLENGE     NONE
CODE WRITTEN           NONE by this act
```

> **Absence can prove that a forbidden path is missing. It cannot prove that a required
> relationship works.** Both halves are now demonstrated for all twelve.
