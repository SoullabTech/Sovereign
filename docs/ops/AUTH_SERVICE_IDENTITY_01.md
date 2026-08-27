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

Unrevoked non-browser sessions, split by whether they are actually usable.
`validateSession` requires `revoked = FALSE` **and** `expires_at > NOW()`;
sessions default to 30 days. Only the first column is a security number.

```
                        usable   expired   members
node                         2        21         4
App/2513 (iOS, a member)     1         0         1
(null user agent)            0        11        10
Bun/1.3.2                    0         4         2
curl/8.7.1 + 7.88.1          0         3         3
Dalvik (Android)             0         7         2
App/750, App/2501 (iOS)      0         4         4
```

**The real surface is two `node` sessions.** The 44 unrevoked non-browser rows
reduce to 3 usable, one of which is a member on the iOS app. The rest is
untidiness, not exposure — including the `Bun/1.3.2` session revoked on a beta
tester, which had expired eleven days earlier.

This correction matters more than the finding. The first pass here counted
`revoked = FALSE` as "live credential" and reported a fleet of them across ten
accounts. Adding one predicate the auth code already enforced cut it to two.

Two already revoked on the confirmed rows: a `Bun/1.3.2` session on a beta
tester (`bfafb928…`, one-shot, LAN IP), and both sessions on the fixture member
`isolation_test_exp` (`deadbeef-0000-4000-8000-000000000001`) — one `node`,
created 2026-08-17, two months after the fixture itself.

That last detail is the one that makes this structural rather than housekeeping:
the practice is not only borrowing real members' identities, it is
**accumulating principals** — a fixture created for one test became a standing
credential holder.

The `members` table holds at least ten synthetic rows, from three generators:
`isolation_test_exp` and `_2` … `_8` (2026-06-24),
`a1-synthetic-witness-20260812T224213Z` (2026-08-12), and
`fieldwalk_proof3_20260731` (2026-07-31). None is referenced anywhere in the
repo.

"At least" is load-bearing. The first census matched usernames against
`test|synthetic|fixture|witness|_exp` and missed `fieldwalk_proof3` entirely —
wrong name, and it carries an email so the emailless predicate missed it too.
**A name-pattern census of synthetic members is structurally under-inclusive**:
it can only find the conventions you already know. The behavioural definition
does not have that failure mode — a member that has sessions but has never had
a browser session:

```sql
SELECT m.username, m.created_at::date, count(s.id) AS sessions
FROM members m JOIN auth_sessions s ON s.member_id = m.id
GROUP BY 1,2
HAVING count(s.id) FILTER (WHERE s.user_agent ILIKE 'Mozilla%') = 0
ORDER BY 2;
```

It also holds **`maia_bot`** (2026-03-20) — a service principal that already
exists, implemented as a member. That is the defect and its precedent in one
row: the convention is established, not accidental, so a repair replaces a
convention rather than introducing a concept.

Not synthetic, caught by the same emailless predicate and listed here so a later
sweep does not mistake them: `jeremy` (2026-02-10), and the null-agent sessions
belonging to `nathan` and `Tara` (2026-01-24), which predate user-agent capture
and are ordinary early sign-ins.

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
- `revoked = FALSE` was read as "usable," omitting the `expires_at > NOW()` half
  that `validateSession` enforces. That inflated a two-session finding into a
  fleet. **Reproduce the predicate the code actually uses; do not approximate
  it.** An inflated security number spends attention that a real one needs.
- An earlier route census matched on syntax rather than behavior and missed the
  same class of defect expressed differently.

**Predicates on nullable columns get `coalesce` by default, not on inspection.**
A census that under-reports is worse than none: it produces a coverage claim
that isn't true.

## Open reads (all non-destructive)

- ~~The two usable `node` sessions~~ RESOLVED 2026-08-27. Neither was tooling
  on a tester's account: `fieldwalk_proof3_20260731` (a synthetic member,
  127.0.0.1, one-shot) and `Kelly` (the founder's own account, from the Mac
  Studio, one-shot). "Scripts still minting sessions today" was the founder's
  own tooling authenticating as the founder. Both one-shot, neither in flight.
- What creates `node` sessions at all — 23 exist across 4 members.
- Whether anything counts `members` rows for a metric, given nine are synthetic.
- Whether `living_field_affinities` aggregates across members.
