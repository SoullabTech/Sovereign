# Co-Lab release gate: its principals are stale (DRAFT finding, 30 Oct 2026)

**Status:** finding and options only. **No code or data was changed.** Evidence is from read-only, count-and-name queries against production on 2026-10-30, after the Writer act on `d1697e9e`.

## What failed
`scripts/verify-constitution-colab.ts` aborted before running any check: `Could not load one or more principals. kelly=MISSING, jondi=ok, nathan=MISSING`. That is an instrument precondition failure, not a boundary result. It was already true in the pre-act dump.

## Why
The gate hard-codes three principals and requires each to hold an `owner` row in `studio_team_members` for a personal Co-Lab named after them (`checkOwnCoLab(kelly,'Kelly')`, `…(nathan,'Nathan')`).

| Principal in the gate | What production holds now |
|---|---|
| `info` (as "Kelly") | An older secondary account. Its only team is `[Legacy 2026-10-21] Kelly's Co-Lab`, no members row. **The primary account is `Kelly`**, which owns **Team Soullab** and **Soullab Founding Circle** (owner rows present). |
| `Jondi` | Owns `Jondi's Co-Lab` (owner row present) plus a legacy one. Loads fine. |
| `nathan` | Only `[Legacy 2026-10-21] Nathan Kane's Co-Lab`, no members row. No active Co-Lab. |

On 2026-10-21, 80 of the 83 `studio_teams` were relabelled `[Legacy …]` and their owner rows removed from `studio_team_members` (80 teams keep `owner_id` but have no matching owner row). Three active teams remain: `Jondi's Co-Lab`, `Team Soullab`, `Soullab Founding Circle`. `studio_team_members` now holds 7 rows. The gate was last recorded passing on 2026-09-14, before that change.

## Why this is not a one-line fix
- Pointing `Kelly` at the right username still fails `checkOwnCoLab`, which expects a Co-Lab *named* "Kelly". Her active teams are named "Team Soullab" and "Soullab Founding Circle".
- There is no active third principal. Substituting a username or relaxing the lookup to `studio_teams.owner_id` would make Nathan load against an **archived team with no members**, and the isolation checks would then pass **vacuously**. A gate that passes because the thing it guards is empty is worse than a gate that refuses.
- Section 10 ("new tester sees own Co-Lab, not Team Soullab") assumes the pre-Oct-21 model.

## Options (a founder decision; none taken)
1. **Redesign the gate to the current model** as a governed change: principals Kelly (Team Soullab, Founding Circle) and Jondi (Jondi's Co-Lab); Nathan removed or replaced; sections re-derived from the three active teams; vacuity guards (a check must prove its subject is non-empty); the deploy gates' check-count floor (`MIN_COLAB_CHECKS=31`) reviewed alongside. Needs its own proof with defeat candidates.
2. **Fix only the account lookup now** (Kelly→`Kelly`, expected fragment `Soullab`) and keep Nathan as an explicitly reported SKIP. Faster, but it lowers coverage and the floor of 31 would need a recorded decision.
3. **Leave the gate unrun** and treat Co-Lab as unverified until option 1. Members stay un-invited (the gate is mandatory before invites).

## Recommendation
Option 1, scoped small: re-derive the principals and add the vacuity guards, and leave the checks' meaning alone. Until then the gate is **UNRUN, not passed**. Do not describe production as Co-Lab-verified.

## Not done
No gate edit, no team or membership change, no production write, no invitation.
