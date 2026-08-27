# AUTH-SERVICE-IDENTITY-01 — scripts authenticate as members

**Status:** RECORDED — not opened. No repair authorized.
**Observed:** 2026-08-27, while diagnosing a beta tester's sign-in
**Class:** identity attribution (adjacent to AUTH-BOUNDARY, not part of it)

---

## The observation

There is no service principal. Ops tooling authenticates by creating a row in
`auth_sessions` under a real `member_id`. Downstream, a script and the person
whose account it borrowed are indistinguishable — same id, same session table,
same authority, same attribution in every table keyed on `user_id`.

Every row a script wrote is, to the system, that member's own activity.

## Evidence (production, 2026-08-27)

Unrevoked sessions whose user agent is not a browser:

```
node             23 sessions   4 members   2026-03-15 → 2026-08-27 (still minting)
(null or empty)  11 sessions  10 members   ← widest member spread
Bun/1.3.2         4 sessions   2 members
curl/8.7.1        2 sessions   2 members
curl/7.88.1       1 session    1 member
```

Two already revoked on the confirmed rows: a `Bun/1.3.2` session on a beta
tester (`bfafb928…`, one-shot, LAN IP), and both sessions on the fixture member
`isolation_test_exp` (`deadbeef-0000-4000-8000-000000000001`) — one `node`,
created 2026-08-17, two months after the fixture itself.

That last detail is the one that makes this structural rather than housekeeping:
the practice is not only borrowing real members' identities, it is
**accumulating principals** — a fixture created for one test became a standing
credential holder.

## Attribution damage, observed

The fixture member carries real corpus:

```
agent_runs 16 · conversation_memory_uses 11 · conversation_turns 8
breakthrough_moments 2 · living_field_affinities 4 · member_memory_atoms 1
```

Bounded: it appears in no roster surface (`studio_people`, `team_channel_members`,
`practitioners`, `stellium_clients` are all empty for it), so nothing a member
can see is affected. But those turns and breakthroughs are inside the production
corpus and count toward any aggregate computed over it. `living_field_affinities`
needs a separate read: if that surface aggregates across members rather than
scoping per member, a fixture is contributing to a shared field.

## Why this is not AUTH-BOUNDARY

The boundary units asked whether a caller can *name* an identity it does not
hold. Here the caller genuinely holds the credential — it was issued correctly.
The defect is that the credential *should not have been a member's*. Same
surface, different question, and folding them would blur both.

## What a repair would have to do

Sketch only; not a plan, and not authorized.

1. A service principal distinct from `members`, with its own table or an
   explicit non-member kind on the session.
2. Ops tooling authenticates as that principal, never as a person.
3. Writes attributable to a service are marked as such, so corpus aggregates
   can exclude them without guessing from user agent strings.
4. Existing script sessions are retired only after their creators are found —
   revoking a live `node` session mid-job breaks whatever depends on it.

## Method note carried out of this session

Two filters here silently excluded rows they appeared to cover:

- `user_agent NOT ILIKE 'Mozilla%'` dropped every NULL-agent session, because
  `NULL NOT ILIKE …` is NULL, not TRUE. It reported one session for a member
  that had two, and hid the 11-session / 10-member null class entirely.
- An earlier route census matched on syntax rather than behavior and missed the
  same class of defect expressed differently.

**Predicates on nullable columns get `coalesce` by default, not on inspection.**
A census that under-reports is worse than none: it produces a coverage claim
that isn't true.

## Open reads (all non-destructive)

- Per-row detail on the 11 null-agent sessions: `one_shot = (last_active_at =
  created_at)` plus IP separates residue from a person on an unfingerprinted
  client. Revoking the latter is a real lockout.
- What creates `node` sessions, and whether any is in flight.
- Whether `living_field_affinities` aggregates across members.
