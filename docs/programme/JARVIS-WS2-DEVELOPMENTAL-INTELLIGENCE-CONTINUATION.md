# JARVIS — WS2 DEVELOPMENTAL INTELLIGENCE CONTINUATION

**Kind**: parent procedural flow. It carries authority recorded elsewhere; it does not create authority.

> Governing records are referenced, never restated. Where this file and a governing
> record disagree, the governing record wins and this file is the defect.

---

## Governing records

```text
ROADMAP     WS2-DEVELOPMENTAL_INTELLIGENCE_ROADMAP_2026-09-08.md
INSTRUMENT  WS2-DEVELOPMENTAL_INTELLIGENCE_AUDIT_2026-09-08.md
PASS B      WS2-DEVELOPMENTAL_INTELLIGENCE_AUDIT_PASS_B_2026-09-08.md
PHASE 0     WS2-PHASE0_RE-FROZEN_2026-09-08.md
```

---

## Current child

```text
Phase 1.5 · SEL-0 Selection Falsifier
Production Discovery

authority  3ddaf66b3
           docs/programme/WS2-SEL-0_PRODUCTION_DISCOVERY_MISSION_2026-09-08.md
branch     jarvis/ws2-sel0-production-discovery-2026-09-08
tip        64f3c96132ae348af684a1afd7e494152c2f246c
```

The tip adds a pointer-only `Placement` header to the mission and changes nothing
beneath it. A session taking this work up should open from **the branch tip**, not
from the bare base SHA, or the placement pointers are not present.

---

## Current gate

```text
C0  BLOCKED — production access unavailable in this environment
```

Recorded so the block is not rediscovered as a fresh finding:

```text
ssh binary / keys / config     ABSENT
192.168.0.104:22 · :5432       UNREACHABLE   (LAN host; session is a cloud container)
docker socket                  ABSENT
DATABASE_URL                   UNSET
prod DSN in checked-in env     none (templates only)
committed production snapshot  none — and one would not discharge the mission,
                               which requires production state
```

This is an environmental block, not a missing authority. It clears by running the
child flow from a host with production terminal access; nothing else changes.

**Consequence for the sequence.** Phase 1.5 cannot close here, so F-7 cannot open,
so Phase 2 and beyond cannot open. The chain is blocked at its first link.

---

## Sequence

Order per roadmap §3. This list is a pointer to that order, not a second copy of it.

```text
Phase 1.5
  → F-7
  → Phase 2
  → Phase 3
  → ...
  → Phase 10
```

---

## Per-phase rule

```text
read authority
establish opening conditions
execute smallest authorized act
run frozen gate
record result
PASS              → continue
FAIL / missing authority → STOP
```

### Never, to keep the flow moving

```text
weaken or change a frozen threshold
weaken an acceptance criterion or acceptance floor
weaken a constitutional constraint
change a benchmark rule
break or relax a blinding rule
```

A gate that cannot be passed as written is a STOP and a founder question, never a
gate to be re-specified. Reaching a numbered phase boundary is not itself a reason
to stop; a gate saying no is.

---

## Cross-phase authority

```text
STATUS   RATIFIED — founder act, 2026-09-08
```

Provenance, kept rather than erased: the wording below was first drafted as
proposed language, not uttered as a founder act, and was recorded here as `PROPOSED
— NOT YET RATIFIED` for exactly that reason. In this programme a proposed text
adopted by echo and a founder act are not interchangeable. It became authority by
explicit founder act on 2026-09-08, and the record of how it did so is retained.

Ratified text, verbatim:

> I authorize the WS2 Developmental Intelligence continuation flow to proceed
> through successive roadmap phases during this run whenever all predeclared gates
> and opening conditions for the next phase are satisfied. This does not authorize
> weakening or changing frozen thresholds, acceptance criteria, constitutional
> constraints, benchmark rules, or blinding. It does not authorize merge or
> production deploy unless separately authorized. If a new founder ruling is
> required, stop and return it to me.

---

## Founder rulings — staged for the two Step-0 boundaries

Founder acts, 2026-09-08, recorded verbatim. Both were ruled **in advance** of the
boundaries they govern, so the executing session does not stall waiting for a relay.
Neither is a discovery detail; each is visible before the freeze by design, because
every downstream digest pins whatever was decided.

**Write boundary** — if the mission's no-write rule appears to conflict with Step 0's
freeze:

> Production remains strictly read-only. Repository writes on this Jarvis branch are
> authorized only to freeze the manifests and record their digests required by SEL-0
> Step 0. No production write, PR, merge, or deploy is authorized.

**Native surface** — if production exposes an existing score or prior-selection
signal (audit §4 forbids deciding this silently):

> SEL-0 tests the selector as deployed. Manifest C includes any lawful pre-snapshot
> score or prior-selection signal that the deployed selector ordinarily has
> available, and the allowlist names it explicitly before Manifest C freezes. No
> benchmark-created or post-snapshot signal may enter.

⚠️ **The native-surface ruling turns on consumption, not existence.** If a signal
exists in the store but the deployed selector does not actually consume it, it does
not enter Manifest C merely because it is there. That is an empirical question about
the reader path, to be established rather than assumed.

---

## Productization obligation — founder act, 2026-09-08

> Developmental Intelligence research, falsifiers, and benchmarks exist to establish or
> test capabilities of Writer's Studio. A successful benchmark implementation does not
> satisfy a roadmap requirement unless the capability it validates is either already
> present in the actual Studio runtime or is explicitly carried forward as an
> implementation requirement for that runtime.
>
> No evaluation-only substitute may be treated as evidence that Writer's Studio
> possesses the corresponding capability.
>
> Where discovery shows that a required capability does not presently exist in the
> deployed Studio path, record that as a product gap. Do not silently invent an
> evaluation-only implementation and treat the gap as closed.

```text
BENCHMARK PASSES  ≠  STUDIO HAS THE CAPABILITY
```

unless an actual Studio runtime path can be named.

### The destination is the Studio

> Every Developmental Intelligence phase must state which Writer's Studio capability it
> establishes, falsifies, specifies, or ships.

| Phase | Studio capability |
|---|---|
| SEL-0 | MAIA knows **what to raise first** |
| F-7 | MAIA knows **what she is permitted to infer or raise** |
| Phase 2 | MAIA can conduct **one excellent developmental session** |
| Phase 3 | MAIA respects **scope and competence boundaries** |
| Phase 4 | MAIA develops **persistent Work understanding** |
| Phase 5 | Write and Develop have **lawful continuity** |
| Phase 6 | Development happens as **conversation** |
| Phase 7 | MAIA can reason across the **whole Work** |
| Phase 8 | best model/configuration for the actual capability |
| Phase 9 | developmental intelligence **preserves the writer's voice** |
| Phase 10 | it works for **other writers and other Works** |

**Governance infrastructure is not the Studio.** Manifests, snapshots, digests, blinding,
`N >= 40`, nulls, seeds, PASS/FAIL thresholds and cross-machine verification exist so we
cannot fool ourselves. The writer should never need to know they exist. F-7 exclusion
records sit between the two: internal constitutional infrastructure, not a feature.

---

## Standing

```text
PARENT FLOW            RECORDED
CROSS-PHASE AUTHORITY  RATIFIED — founder act, 2026-09-08
PRODUCTIZATION OBLIG.  RATIFIED — founder act, 2026-09-08
PHASE 1.5              PRODUCTION DISCOVERY CLOSED · 81d79b941
  MANIFESTS A/B/C      FROZEN · 81d79b941
  EXCLUDED SET         FROZEN · 81d79b941
  corpus 26 · excluded 7 · lawful N   19
  Outcome              B — N 19 < floor 40
  top-k instrument     DISCHARGED / MUST NOT RUN
  selector contract    INSPECTED — no comparative-selection output in deployed path
  product gap          OPEN — Studio lacks developmental selection
  SEL-0 role           PRE-BUILD ACCEPTANCE STANDARD (redesignated 2026-09-08)
  Manifest C status    frozen production-surface evidence · NOT the input contract
  selector contract    Q1–Q6 INCORPORATED · Q7–Q8 RETURNED · NOT RATIFIED
  R1 · R2 · R3         NOT OPENED
  THRESHOLD            UNSET
  FOUNDER RANKING      NOT STARTED
  MAIA RANKING         NOT STARTED
  MANIFEST B           NOT OPENED
  SELECTOR             NOT IMPLEMENTED
  FOUNDER BLIND        INTACT
F-7                    NOT OPEN (opening condition is Phase 1.5 closed)
PHASE 2 AND BEYOND     NOT OPEN
PR / MERGE / DEPLOY    NOT AUTHORIZED
```

**Next executable act**: founder ruling on selector-contract questions Q7 and Q8, in
`sel-0/SEL-0_REDESIGNATION_AND_SELECTOR_CONTRACT_2026-09-08.md`. Production discovery is
CLOSED and is no longer the next act.

**Historical note, kept rather than rewritten.** Earlier in this file the next act was the
production-discovery child, and the manifests were unfrozen with `N` undetermined. That was
true when written and is false now. The line above supersedes it; the earlier records and
the `C0 BLOCKED` section are retained as the state at their time.

