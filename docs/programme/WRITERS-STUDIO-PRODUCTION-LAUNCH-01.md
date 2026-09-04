# WRITERS-STUDIO-PRODUCTION-LAUNCH-01

> **PARKED · NOT EXECUTABLE.** This document defines the launch lane before it exists. It
> authorizes **no code, no schema, no route, no deploy, no invitation, no marketing claim**. It
> may define the release triggers; it may not begin launch work because it exists. Entry into
> this lane requires its trigger to be satisfied **on canonical** and a founder act recording
> that entry here.

```text
LANE               WRITERS-STUDIO-PRODUCTION-LAUNCH-01
STATE              PARKED · NOT EXECUTABLE
OPENED             2026-09-03 (defined, not entered)
ENTERED            —
GOVERNS            product release of Writer's Studio at soullab.life/writers-studio
DOES NOT GOVERN    capability development (Stages 7–15 run through their own lanes)
NORMATIVE          docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md — Amendment 5 (A5.1–A5.5)
CAPABILITY         docs/programme/DEVELOPMENTAL_EDITOR_CAPABILITY.md
ROADMAP            docs/programme/WRITERS_STUDIO_ROADMAP_STAGE_6_TO_15.md (Release milestones)
LIVE STATE         docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md (Release signal)
```

## Triggers — read mechanically from the Programme Board, never inferred

```text
PRIVATE BETA         Stage 7 DONE / PROVED
                     + Stage 8 CLOSED / ACCEPTED

PUBLIC 1.0           Stages 7–10 CLOSED / ACCEPTED
                     + current CAPABILITY MANDATE CENSUS attached to the release record
                     + release acceptance (founder artifact)

FRUITION             Stage 15 CLOSED
                     + Core Capability Mandate actually satisfied per the A4 census
                     (not a release trigger — recorded so no release is mistaken for it)
```

⛔ A stage reads DONE / CLOSED / ACCEPTED only when the Programme Board says so from canonical
evidence. Session narration, a green suite, or a merged branch is not a trigger.

## Launch-lane entry condition — distinct from the Amendment 5 thresholds

```text
LAUNCH-LANE ENTRY CONDITION   a production candidate is identified by exact SHA
```

The Amendment 5 threshold says **when the product is constitutionally eligible** for a release.
The entry condition says **which executable artifact the launch walk will actually judge**. They
are different things and are never merged into one: naming a candidate SHA is not a capability
milestone, and reaching a milestone does not name a candidate. This lane is entered only when
both hold, and the entry record below names the SHA.

## Mission — private beta

> Private beta asks whether a real writer can enter a real Work, write, develop it with MAIA,
> revise safely, leave, return, and remain unmistakably the author throughout.

## What this lane will contain when entered

No major new product architecture. The route `app/writers-studio` already exists on canonical with
a Work-centered home, a canvas, and a review page. This lane's job is to witness, in production,
that what is behind that route is coherent enough to invite other writers into — and to record
the boundary of what it delivers.

| Launch area | Gate |
|---|---|
| URL | `/writers-studio` canonical; no parallel route |
| Authentication | member identity verified |
| Identity continuity | the same member is recognized as the same author across sessions and devices; no Work attaches to the wrong person |
| Authorization | intended beta / public population only; founder-gated surfaces stay gated |
| Create Work | production witness |
| Open existing Work | production witness |
| Writing | manuscript-scale composition feels reliable; production witness |
| Save / autosave | every save and autosave lands; no silent loss; conflict and reconnect behave as designed |
| Leave / return | production witness after days, not minutes |
| Structure | production witness; member-declared, no chapter schema |
| Developmental reading | MAIA reads the Work developmentally, grounded in exact passages; observation ≠ authority (programme invariant) |
| Developmental dialogue | the writer can discuss an observation and leave it unresolved without anything changing in the Work |
| Explicit author decision | accept / reject / hold is a visible writer act; nothing MAIA notices becomes the Work without one |
| Revision / history | production witness; compare and restore as writer acts |
| Large manuscript | real *Elemental Alchemy*-scale witness (211pp) |
| Desktop usability | the primary writing surface works as a place to write for hours, not minutes |
| Mobile / tablet usability | usable where promised, unclaimed where not |
| Error handling | no silent loss; failure states visible |
| Observability | failures distinguishable in logs by member-safe identifiers only |
| Backup / recovery | proven on the production database, not asserted |
| Deployment | exact SHA; running `GIT_COMMIT` == released SHA (`docs/ops/IMMUTABLE_SHA_DEPLOY.md`) |
| Rollback | demonstrated once against the released image |
| UX | founder felt-gate (A1.10): *did I forget the software and feel like I was writing my book?* |
| Beta users | a real human episode per Master Brief §22–23 creative-episode classes |

## Sequence when entered

```text
DEPLOY (exact SHA, provenance verified)
   ↓
FOUNDER WALK (felt-gate recorded)
   ↓
3–5 INTERNAL USERS
   ↓
10–20 PRIVATE BETA WRITERS  ·  six acceptances: Arrive · Write · Structure ·
                              Develop · Revise safely · Return
   ↓
FIX ONLY LAUNCH-BLOCKING DEFECTS (capability work goes back to its stage lane)
   ↓
PUBLIC ACCESS  ·  release record per A5.3 published with the census attached
```

## What this lane must never do

- Declare Writer's Studio complete, successful, or at fruition. **A4.21 stands.** Every release
  record states its capability boundary and lists the ABSENT and PARTIAL census rows by name.
- Absorb capability work. A missing capability discovered at launch returns to its stage lane; it
  does not become a launch task.
- Weaken a gate to reach a date: P12-style founder gates, consent boundaries, Sanctuary, the
  authority chain `SOURCE → MAIA MAY NOTICE → WRITER MAY RECOGNIZE → WRITER MAY DECIDE → WORK MAY CHANGE`.
- Claim Stages 11–15. They are post-1.0 expansion and remain binding scope.

## Entry record

```text
(empty — the lane has not been entered)
PRODUCTION CANDIDATE SHA   —
```
