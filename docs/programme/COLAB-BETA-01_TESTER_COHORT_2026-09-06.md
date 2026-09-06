# COLAB-BETA-01 · TESTER COHORT — lane record

```text
LANE      COLAB-BETA-01
OPENED BY founder, 2026-09-06
GOAL      A tester receives one invite, creates or signs into their Soullab
          account, lands in the exact Beta Co-Lab, and can interact with the
          group without seeing any other Co-Lab's material.
STATUS    FIRST CUT BUILT (steps 1–4) · steps 5–8 are founder acts
```

## 0 · What was already true

The isolation boundary is green. Founder-run in production on runtime `ca5fdff44`:

```text
Co-Lab verifier   33 passed · 0 failed · 0 warned
```

Channels, DMs, roles, workspace switching, member lists, MAIA-on-request reflection and admin
controls exist. This lane does not build group collaboration. It repairs the door.

## 1 · The census — invitation plumbing was split in two

Verified against canonical, not taken from description:

```text
team_invites            email · role · token · accepted_at · accepted_by — NO team_id
studio_team_invites     team_id · email · role · token — no email path

/api/team/invite               sends the email; created rows carried NO destination
  → resolveTeamIdForInviter()  falls back to the OLDEST studio_team
/api/studio/teams/[id]/members writes studio_team_invites, then
                               `// TODO: Send invite email with link containing token`
/team/invite/[token]           accepts ONLY team_invites tokens
```

Two consequences, both live:

- **A studio-created invite is unusable.** Its token is in `studio_team_invites`; the acceptance
  route reads `team_invites`, so the link 404s. The team-bound half never had a door.
- **Signed-in acceptance joined nothing.** `PUT /team/invite/[token]` stamped `accepted_at` and
  returned. The invite was consumed and the member belonged to no Co-Lab.

The new-account path (`register`) did add membership — but through
`resolveTeamIdForInviter(invite.invited_by)`, whose fallback is the oldest team. For a new cohort
that is the original shared workspace: the exact leak this lane exists to prevent.

## 2 · First cut (built)

```text
migration  20260906000002_team_invites_team_bound.sql
           team_invites.team_id → studio_teams(id) ON DELETE CASCADE, nullable, indexed
           additive; legacy rows keep NULL and still resolve by inference

/api/team/invite            accepts an explicit `teamId` and `role`, persists both
                            AUTHORIZATION: the inviter must already be a member of that
                            team (403 otherwise) — naming a team is not permission to
                            add people to it
/team/invite/[token] PUT    reads team_id + role; adds membership on acceptance;
                            response now reports { teamId, joined }
.../register                joins the team the INVITE names, not the inviter's oldest;
                            preserves the invited role
```

Inference survives only for `team_id IS NULL` rows, so existing links do not dead-end.

## 3 · Not done, and why

- `/api/studio/teams/[id]/members` still does not send email. The canonical beta path is now
  `/api/team/invite` with an explicit `teamId`, which does the whole job; unifying the two invite
  tables is a larger change than the night before a cohort arrives.
- No production proof yet. Nothing here is witnessed: these are `M`-class claims (merge program),
  not `R`-class.

## 4 · Remaining steps — founder acts

```text
5  prove accept → membership → switcher → channel access, in production
6  re-run the Co-Lab verifier in production (0 failed) AFTER the migration
7  create the Beta Co-Lab — MAIA Beta Co-Lab
   #welcome (announcements) · #general · #feedback · #bugs
   testers enter as members; founder remains owner/admin
   MAIA stays invoked, never an ambient participant
8  pilot with 2 people before inviting the full cohort
```

## 5 · Scope ruling — DEVELOP is not in the tester surface

Writer's Studio DEVELOP carries the BUILD-07F standing controls, whose acceptance walk has never
run and whose `standing_events = 0` boundary is what keeps that walk's options open. A curious
tester would create the first standing event before the walk. The controls are gated default-off
(`NEXT_PUBLIC_WS_STANDING_ENABLED`) on the beta-readiness branch; that gate stops the controls
rendering, not a POST. Until 07F is resolved, DEVELOP stays out of the tester surface.

## 6 · Sovereignty checks (answered, not passed)

- **Uncertainty preserved:** an invite that resolves to no team reports `joined: false` rather than
  appearing to succeed. An accepted invite that joined nothing is the failure this replaces.
- **Provenance:** the destination is stored on the invite, so where a member came from is a record,
  not an inference re-derived later from whoever invited them.
- **New responsibility:** invitations can now place a person in a named group, so the route
  authorizes the inviter against that group. Without that check, any signed-in member could inject
  people into any Co-Lab.
