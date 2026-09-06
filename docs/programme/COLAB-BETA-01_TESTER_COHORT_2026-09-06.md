# COLAB-BETA-01 · TESTER COHORT — lane record

```text
LANE      COLAB-BETA-01
OPENED BY founder, 2026-09-06
GOAL      A tester receives one invite, creates or signs into their Soullab
          account, lands in the exact Beta Co-Lab, and can interact with the
          group without seeing any other Co-Lab's material.
STATUS    R2 BUILT (steps 1–4 + review repairs) · steps 5–8 are founder acts
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

## 2a · R2 — four holes found in review of the first cut

The first cut made the API team-bound but left the promise breakable at four points. All four were
found by founder review of `561035861`, and all four are repaired here.

```text
A  the live Invite button never sent teamId
   InviteModal was instantiated without it while the sidebar held it one line away,
   so the UI still took the inference path — the original leak, alive in the exact
   flow this lane exists to repair. Modal is now team-bound; role fixed to 'member'.

B  a NEW invite now REQUIRES an explicit teamId (400 otherwise)
   inference survives only for pre-migration rows already in the table

C  membership was not permission
   the caller chooses the invited role, so a member — or a viewer — could invite
   someone in as an admin. Now owner/admin of THAT team, via canInviteToTeam().

D  a pending invite was matched on email alone
   any live token for that person could be recycled — a legacy row with no
   destination, or one for a different Co-Lab — refreshing only its expiry, so the
   returned link still pointed elsewhere. Identity is now (email, team_id), and the
   reused row's role is refreshed too.

E  the token was the only credential
   possession of a forwarded link plus ANY authenticated account consumed the
   invite. Acceptance now requires the signed-in member's email to match.

F  acceptance could report success without membership
   `joined: Boolean(destination)` proved only that a team id resolved, and
   addMemberToTeam() returns false for both a swallowed failure and an existing
   membership — so neither could answer the question. Membership is now OBSERVED
   via isTeamMember(), fail-closed, and established BEFORE the invite is consumed:
   a failure leaves the link usable instead of spending it on a half-finished join.

G  the new-account path had the same ordering defect
   it stamped accepted_at, then best-effort joined. Now: account → membership
   observed → invite consumed. The account is deliberately NOT rolled back on a
   join failure — a working account with an unspent invite beats destroying it.
```

Focused tests cover exactly these invariants — `app/api/team/invite/__tests__/teamBoundInvite.test.ts`,
7 passing: destination required and no row written without it; admin+ enforced against the named
team; the pending lookup scoped by `team_id = $2`; fail-closed on unobserved membership; and the
named team used rather than an inferred one. Not an invite-suite rewrite.

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
