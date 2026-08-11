# JARVIS Desktop Alpha — capability floor (DRAFT FOR FOUNDER RULING)

**Date:** 2026-08-11 · **Status:** proposal only. **This does not define the floor.**
Defining it is product direction — founder judgment, not a lane's.

**Question being answered:** *At the end of seven days of actually living with JARVIS Desktop,
what must JARVIS have done for us to say the Alpha was real?*

**Governing test** (Builder OS roadmap): *Does this increase our ability to build, maintain,
improve, or safely extend member-facing capability?* — with the named failure mode:
*"AIN is perfectly governed, but nobody is shipping MAIA improvements."*

So the Alpha is real if, after seven days, **the founder's cognitive burden in running the AIN
development ecosystem measurably dropped.** Not if the architecture impressed anyone.

---

## The fork this draft exposes

Writing the floor honestly splits it in two, and **choosing between them very nearly picks the
lineage.** That is why it must be ruled, not assumed.

### Floor 1 — "JARVIS shows me the truth and lets me act on it"
*JARVIS as the founder's governance surface. Satisfiable by **B** + a bounded donor delta.*

### Floor 2 — "JARVIS does bounded work for me and shows its evidence"
*JARVIS as an operator console over a runtime. Requires **A**'s runs/evidence/dispositions.*

The question underneath: **is a week of *seeing truthfully and acting* enough to call the Alpha
real — or must JARVIS have actually done work on your behalf?** If seeing is enough, B is likely
sufficient. If JARVIS must *do*, no bounded delta gets B there, and the answer is A or BLOCKED.

---

## Floor 1 — candidate items (each testable on day 7)

| # | Item | Day-7 test |
|---|---|---|
| F1 | **Arrival answers "what needs me?"** — decisions only the founder can make, visible in seconds, without reading a transcript | Count of times a stale claim / queued lane / collision was learned *from Desktop* rather than by asking a session. Must be > 0, and ideally the usual path. |
| F2 | **Governance acts happen here** — `recover` / `reconcile` / `close` on stale claims, with reason + confirmation | ≥1 real governance act performed from Desktop instead of the CLI |
| F3 | **It tells the truth about itself, including which JARVIS it is** | The version/commit Desktop reports matches the artifact actually running. *(This is where the source-binding condition becomes a floor item rather than an abstraction.)* |
| F4 | **Cheap questions cost nothing** — deterministic capabilities answered with zero model calls | N C0 invocations across the week, zero model spend |
| F5 | **It survives a week unattended** — no rebuild, no worktree surgery, no "which window am I looking at" | Zero maintenance interventions; one unambiguous JARVIS |

⚠️ F5 is not hygiene. Tonight produced two identically-titled JARVIS windows from different
lineages — a week of that is a week of doubting every reading.

## Floor 2 — adds

| # | Item | Day-7 test |
|---|---|---|
| F6 | **JARVIS executed bounded work I did not have to run myself** | ≥1 run submitted, executed, and verified without opening Claude Code |
| F7 | **Its evidence was good enough to trust the result** | Per-citation evidence inspected at least once and found sufficient |
| F8 | **A run was refused or paused correctly** | ≥1 correct refusal — ⚠️ today this collides with **Unit 21**, whose defect makes the happy path *falsely* pause |

⛔ F8 makes Unit 21 an Alpha blocker **only under Floor 2.** Under Floor 1 it is not on the path.
That alone shows how much the floor choice decides.

---

## Explicitly NOT in either floor

MAIA↔JARVIS bridge · CL1-E2E · founder-presence authentication · O-1 Observer daily surface ·
lineage convergence · retirement of either lineage · parity gates.

Each may be valuable. None is required for a week to be worth living.

---

## What I recommend ruling

1. **Choose Floor 1 or Floor 2.** Everything downstream is arithmetic once this is fixed.
2. My read, offered as input and not as the answer: **Floor 1 is the honest Alpha.** Floor 2
   describes a JARVIS that is genuinely better — but it requires A, which has never been built or
   signed as a standalone JARVIS, and it drags Unit 21 onto the critical path. Floor 1 is a week
   you can start now; Floor 2 is a week that starts after new product work, which is what
   *recover Desktop, don't rebuild* exists to prevent.
3. Note the cost of choosing Floor 1: it is the smaller JARVIS, and it risks a week that proves
   *observation* rather than *agency*. If living with a governance surface for seven days would not
   change your judgment about anything, Floor 1 is not worth the week and the honest answer is to
   do the A-side work rather than stage a cheap Alpha.
