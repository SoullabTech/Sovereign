# Semantic Memory Surfaceability Diagnostic — 2026-05-23

## Finding

```
121 atoms exist for the observed member.
0 surfaceable.
Cause: return_preference = 'member_pulled' for all atoms.
Result: MEMORY_HEALTH 'low' is accurate — not broken, consent-sealed.
Open question: no visible graduation pathway from sealed memory to consented contextual return.
```

## What the data showed

Queried `member_memory_atoms` for member `ce284751-e457-42f6-89b6-bc07d0876682`:

| field | value |
|---|---|
| total atoms | 121 |
| status | all `active` |
| return_preference | all `member_pulled` |
| surfaceable by loader | 0 |
| atom creation window | 2026-05-21 13:29–13:30 (one minute — bulk ingest, not organic formation) |
| atoms written since | 0 |

The ambient loader (`lib/maia/memoryAtomsLoader.ts`) requires `return_preference IN ('contextual_doorway', 'ritual_review_opt_in')`. Every atom for this member is `member_pulled`, which the loader explicitly excludes. The consent gate is working as designed.

## What this is not

Not a query failure. Not a schema error. Not a pipeline crash. `MEMORY_HEALTH: 'low'` is the system reporting accurately — the semantic layer is present but consent-sealed against ambient surfacing.

## Two open questions

**1. Is organic atom formation live on the canonical path?**

The 121 atoms were written in a single minute — almost certainly a bulk ingest or migration, not conversational formation. No atoms have been written since that window despite ongoing production traffic. Questions to resolve:

- Is the atom writer wired to `/api/sovereign/app/maia/list`?
- Are atoms formed from live conversation turns, or only from import/batch processes?
- If the formation pipeline is unwired from the canonical route, the atom pool is frozen.

**2. Is there a graduation pathway?**

`member_pulled` is the correct sovereignty default — atoms should not surface ambientally without the member's consent. But without a pathway to graduate an atom to `contextual_doorway` or `ritual_review_opt_in`, the consent gate is permanently closed by default for every member.

The graduation logic does not need to be automatic or ambient. It needs to be:
- Member-initiated, or
- Triggered by a consented condition the member has set

## Product implication

MAIA needs a member-facing mechanism that functions as:

> "May I remember and bring this back when it seems relevant?"

That question is the bridge between sovereignty and felt continuity. Not ambient surveillance. Not dead archive. Consented return.

Without it, the semantic memory layer is architecturally correct and experientially absent. The member has memory stored on their behalf that MAIA cannot reach — not because something broke, but because no one has built the door.

## Do not change the loader

The loader filter is correct. `member_pulled` exclusion is the consent gate working as designed. The fix is not to loosen the query — it is to build the graduation path and the member-facing mechanism that populates it.

## Status — resolved 2026-05-23

- [x] Confirm whether organic atom formation is wired to `/api/sovereign/app/maia/list`
      → Portfolio is member-explicit by design. Atoms form when members keep material,
        not from automatic inference. The canonical route does not write atoms — correct.
- [x] Identify where `return_preference` can currently be updated
      → `POST /api/psyche/portfolio/atoms/[id]/gesture` with `{ kind: 'set_return_preference', preference: '...' }`
      → Also available in bulk via `/maia/keep-capture` page (`allowReturnForAllKept`).
- [x] Design the consent/graduation interaction
      → Two-step keep-time consent: keep creates atom (`member_pulled`); second explicit
        choice authorizes return (`contextual_doorway`). No default ambient graduation.
- [x] Implement member-facing "May I bring this back?" mechanism
      → `components/psyche/KeepAffordance.tsx` — keep-time consent prompt ships in
        commit `74b401383`. Per-atom and bulk controls in `app/maia/keep-capture/page.tsx`.

## Proof loop result — 2026-05-23

First confirmed production turn with semantic memory live:

```
atoms loaded: { count: 8 }
PROMPT_BLOCK_CHARS: 8590   (floor was ~7334 with 0 atoms)
sem: ok
base_degraded: false
MEMORY_HEALTH: low         (accurate — conv/ep/dev layers not yet built)
```

`MEMORY_HEALTH: low` is not failure. It is honest reporting: semantic layer is live,
deeper layers (episodic, developmental, patterns) remain unbuilt. The consent architecture
works end-to-end: keep → allow return → atom surfaces → prompt carries it.

See also: `docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md`, `lib/maia/memoryAtomsLoader.ts`
