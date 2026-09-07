# MAIL-04c — Google Connector Authority Containment

Code: `bf2cb8bc`. **Not yet deployed. Not yet witnessed. Not accepted.**

## The defect, in one line

MAIL-03 established that a caller may not choose a **destination**. The Google
connector had the same defect on the other axis — the **sending identity** —
and that axis is worse. A chosen destination buys a mail-bomb; a chosen identity
buys someone else's account.

## What was reachable

| Route | Defect |
|---|---|
| `test/gmail-send` | POST took the recipient from the body, no authentication, sent as a fixed Gmail identity |
| `gmail/send` POST | `userId` from the body selected **whose OAuth credentials to spend** |
| `gmail/send` GET | `?userId=` enumerated which accounts had Gmail connected, and their addresses |
| `auth/google/disconnect` | `userId` from the body **deleted that member's credentials** — destructive, unauthenticated |
| `auth/google/status` | `?userId=` enumerated connection state for any account |
| `auth/google/callback` | `state` was read as identity, so the caller named the account receiving the tokens |

The 401 in `gmail/send` gated on whether Gmail was *connected* — a configuration
check wearing the costume of an admission check.

## Step 5 · the keying question, answered before the key was touched

```
rows | email_keyed | uuid_keyed
   3 |           0 |          3
```

`google_calendar_credentials.user_id` is `text`, so it could have held either.
All three live connections are **UUID-keyed**. `getMemberIdFromRequest` returns
a member UUID, so session-derivation aligns with what is stored and **no
existing connection is stranded**.

This also confirms the test route never wrote a row — its `soullab1@gmail.com`
identity would have appeared as `email_keyed`. Consistent with the production
`GET` probe reporting `not_connected`.

The storage key is therefore **unchanged**. Containment is that the caller may
not *choose* the key, not that the key is different.

## The doctrine this produced

The census exposed two email planes, and the earlier rule only covered one:

```
PLATFORM MAIL           Soullab sends its own messages.
                        The destination is constrained — a caller may not aim it.

MEMBER-DELEGATED MAIL   A member composes from their own connected account.
                        Choosing the recipient is the ENTIRE FEATURE.
```

So "a caller may never choose a destination" was too strong. The invariant that
covers both:

> **A caller may choose a destination only when they hold verified authority for
> the sending act — and may NEVER choose another actor's sending identity.**

## OAuth state is a transaction, not an identity

`state` is a CSRF and transaction-binding instrument. It was being used as
identity. Now: 256 bits of opaque nothing in the URL, the member binding in
`google_oauth_state`, 10-minute expiry, and redemption as one atomic `UPDATE` so
a replayed callback cannot store tokens twice.

Replay, expiry and forgery are reported **distinctly** rather than as a boolean.
A replay is a security event; an expiry is usually someone who left a tab open.
They must not look alike in the logs.

## Deploy requirements

**This needs the FULL deploy path, not the quick `maia`-only one** — migration
`20260907000001_google_oauth_state.sql` must run.

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/deploy-production.sh deploy "$(git rev-parse --short origin/clean-main-no-secrets)"'
```

## Witness — required before acceptance

Green tests are not evidence about production; MAIL-03 established that.

**Authority (the containment):**
- [ ] `POST /api/gmail/send` unauthenticated → **401**, nothing sent
- [ ] `POST /api/auth/google/disconnect` unauthenticated with a real member's id in the body → **401**, and that member's row **still present**
- [ ] `GET /api/auth/google/status?userId=<other member>` unauthenticated → **401**, no connection state disclosed

**Function (the rightful member, on web AND iOS):**
- [ ] a signed-in member sees their true connection status
- [ ] connect completes end to end and stores credentials under **their own** id
- [ ] a signed-in member sends from their own Gmail to a recipient they choose
- [ ] disconnect removes **their** row and no other

**Non-regression:**
- [ ] all three existing connections still report connected after deploy

The iOS check matters specifically: these routes now require a verified session,
and the two components calling them moved from raw `fetch` to `apiFetch` for
that reason. Without it they work on web and fail silently in the WebView.

## Not in this act

No MAIL-05 guards, no transport change, no SMTP activation, no Proton or DNS
work, no MAIL-03 revisiting, no connector refactor beyond authority.

One typecheck casualty was fixed rather than baselined: `AvoidanceBreaker`
initialised an optional-typed state to `null`, latent until this lane's imports
pulled the file into the program.
