# AUTH-IDENTITY-ORIGIN-01 — what created member B?

**Status:** Part B (source + git history) complete. Part A (database chronology) instrument
written, not run. No writes anywhere. Authorizes nothing.
**Date:** 2026-08-24

---

## 0. Correction: my "FALSIFIED" verdict was wrong

`MEMBER_IDENTITY_CONSOLIDATION_PLAN.md` §4.10 recorded **FALSIFIED — Google sign-in created B**,
on the evidence that B's `oauth_accounts` row post-dates B's member row by 171 days.

**That verdict rested on an assumption I did not check: that member creation and linkage
insertion are atomic.** They are not. They are two separate un-transacted statements in the same
route. Once that assumption fails, the timestamp gap stops being evidence against minting and
becomes *the thing to explain* — and the explanation is below.

The linkage evidence in §4.10 remains factually correct. The inference drawn from it does not.

---

## 1. Part B — the username generator (decisive)

B's username is `soullab13cab`: email local-part `soullab1` + `3cab`, exactly four hex characters.

| path | suffix it generates | matches `3cab`? |
|---|---|---|
| `app/api/auth/signin/google/callback` | `crypto.randomBytes(2).toString('hex')` → **4 hex** | **YES** |
| `app/api/auth/signin/apple/callback` | `crypto.randomBytes(2).toString('hex')` → 4 hex | yes (see §4) |
| `app/api/auth/google/native-callback` | `crypto.randomBytes(2).toString('hex')` → 4 hex | yes (see §4) |
| `app/api/auth/apple/native-callback` | `crypto.randomBytes(2).toString('hex')` → 4 hex | yes (see §4) |
| `app/api/members/enter` | `Math.floor(1000 + Math.random()*9000)` → 4 **decimal** | **no** — `3cab` is not decimal |
| `app/api/now-what/register` | bare local-part, numeric suffix only on collision | no |

Only the OAuth callback family produces this shape. The email/password path is excluded
arithmetically.

## 2. The source state at the moment B was created

Git history was shallow in the working clone (171 commits, earliest 2026-08-13) and was deepened
to the full 5190 commits back to 2025-11-23, so the February source state is directly readable.

Commit in effect at 2026-02-03 18:05:28Z: **`2e4803af7`**. Its
`app/api/auth/signin/google/callback/route.ts` does, in order:

1. abort if the `oauth_accounts` table is missing;
2. look up `oauth_accounts` by `provider_user_id`;
3. else look up `members WHERE email = $1` — **exact match** — and link if found;
4. else **INSERT a new member** with `username = <local-part> + randomBytes(2).hex`,
   `passkey = 'GOOGLE-' + randomBytes(6).hex.toUpperCase()`, `onboarded = false`;
5. then INSERT into `oauth_accounts (member_id, provider, provider_user_id, email,
   **profile_data**, created_at)`.

**There is no transaction anywhere in the route, and it never writes `last_sign_in`.**

## 3. Why the linkage is missing — the timestamp gap explained

| when (UTC) | what |
|---|---|
| 2026-01-17 02:47 | Google/Apple OAuth callback added — already inserts `profile_data` |
| 2026-01-17 | migration `20260117000003_oauth_providers.sql` creates `oauth_accounts` — **with no `profile_data` column** |
| **2026-02-03 18:05:28** | **member B created** |
| 2026-02-03 21:12 | migration `20260203000005_oauth_profile_data.sql` (`ADD COLUMN profile_data`) first committed |

B was created **3 h 06 m before the `profile_data` migration existed in git at all**. At that
moment the callback's linkage INSERT named a column the table did not have. With no transaction
wrapping the two statements, the consequence is exact:

```
member INSERT        -> COMMITTED
oauth_accounts INSERT -> throws: column "profile_data" does not exist
route                -> errors out
result               -> a member exists with NO linkage, NO onboarding, NO last_sign_in
```

That is B, in every observable particular: created at that timestamp, OAuth-shaped username,
`onboarded = false`, `last_sign_in = NULL`, and no `oauth_accounts` row until a *later*
successful sign-in inserted a fresh one on 2026-07-24. The database-wide floor of 2026-07-06 for
*any* linkage is consistent: no OAuth linkage could succeed until the schema caught up.

## 4. Status of the claim — what is proven and what is not

```
PROVEN        B's username matches the OAuth callback generator and no other path's.
PROVEN        That callback existed on 2026-02-03, minted members, and inserted a
              profile_data column that the table did not yet have.
PROVEN        No transaction wraps member creation and linkage insertion.
PROVEN        The callback never writes last_sign_in — matching B's NULL.
STRONGLY      B was minted by an OAuth callback whose linkage INSERT then failed, leaving
SUPPORTED     the member committed and unlinked.
NOT PROVEN    That it was the GOOGLE callback specifically rather than APPLE or a native
              callback — all four share the generator. B's later linkage is google and its
              email is a Google address, which favours Google but does not settle it.
NOT PROVEN    That the January OAuth code was deployed to production by 2026-02-03. Git
              proves the code existed; it does not prove what was running.
UNKNOWN       Whether the failing INSERT is recorded anywhere (logs from February).
```

**Part A settles the first NOT PROVEN cheaply**: every minting path stamps a distinct passkey
prefix, so B's own `passkey` names its creator. `scripts/witness/identity-origin-read.sql` reads
it, and predicts that other `GOOGLE-`/`APPLE-` stamped members created before 2026-07-06 will
*also* lack a linkage. If they do, the mechanism is confirmed at cohort level rather than from a
single case.

## 5. Why A was not matched — the identity model, not a bug

The callback *does* consult verified email as identity evidence, at step 3. It found nothing
because it searched for `soullab1@gmail.com` and A's email is `kelly@soullab.life`.

**One human with two email addresses becomes two members.** No code misbehaved at that step.
The defect is that a `members` row is keyed to a single email string, with no notion of a durable
person holding several verified identifiers. That is problem 2 in the four-problem split, and it
is not fixed by fixing the failed INSERT.

## 6. Two prospective defects, both fixable without touching history

1. **Non-atomic account creation.** Member INSERT and linkage INSERT are separate un-transacted
   statements. Any failure of the second orphans the first. Wrapping the pair in one transaction
   makes the failure mode impossible going forward.
2. **Identity keyed on a single email string.** A verified identifier arriving for a person the
   system already knows under a different address mints a second person.

Neither repair requires moving a single row of A's or B's history. That is the ordering already
ruled: close the minting defect first; leave A and B intact until reconciliation has its own
design.

## 7. Held

No merge. No rebinding. No OAuth relinking. No portrait movement. No collision survivor choice.
No session cleanup. The two unexplained portrait owners remain unexplained and unchased.
