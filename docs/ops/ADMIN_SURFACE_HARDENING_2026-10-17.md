# Admin surface — exposure found, closed, and what the record must say

**Date:** 2026-10-17 · **Host:** minisforum (production)

## What was true before

`/api/admin/*` and `/labtools/admin/*` were reachable from the public internet.
The Caddyfile contained a complete restriction block — written, correct, and
**entirely commented out** since it was authored. Nobody had enabled it.

`admin_access_log` shows sustained external probing from 2026-09-02 to
2026-10-16: eight distinct addresses in `185.177.72.0/24` plus `38.248.90.244`
and `32.219.7.166`, hitting `/api/admin/auth` and
`/api/admin/monitoring/system`.

**No external address ever authenticated.** A query filtering `via <> 'denied'`
and excluding LAN, Docker and loopback ranges returned zero rows. Exposed and
holding, not breached.

## What was done

`Caddyfile:436-450` uncommented and amended:

- matcher extended from `/api/admin/*` to `/api/admin/* /labtools/admin/*`
- allowlist `100.64.0.0/10` (Tailscale) + `192.168.4.0/24` (LAN) + `127.0.0.1/32`
- non-matching peers receive **403**

Verified both directions, which is the part that matters: the Mac Studio on LAN
loads the admin page; an iPhone on cellular with WiFi off receives `Forbidden`.
A restriction proven only to permit is not proven.

Rollback point: `Caddyfile.pre-admin-restrict-20261017T230200Z`.

## Four findings worth more than the fix

**1. `.env.production` is not authoritative for any variable also listed under
`environment:` in the compose file.** `docker-compose.production.yml:150` has
`LABTOOLS_ADMIN_PASSWORD: ${LABTOOLS_ADMIN_PASSWORD:-}`. An `environment:` entry
overrides `env_file:`, and `${...}` is interpolated from the shell or `.env` —
not from `.env.production`. Editing the obvious file changed nothing the
container reads. Same defect class as the 2026-09-03 `GIT_COMMIT=unknown`
incident: a value configured in the expected place, silently overridden by
interpolation at `up` time from a different source.

**2. Admin password logins are not audited at all.** `POST /api/admin/auth`
compares against the env var inline and returns; it never calls
`checkAdminAuth`, so neither success nor failure reaches `admin_access_log`.
Only the `GET` session-check audits. **Consequence for anyone reading that
table: absence of rows is not evidence that no login was attempted.** A
conclusion was drawn from that absence during this session and was wrong.

**3. The `header_up X-Forwarded-For {remote_host}` lines are load-bearing
security, and Caddy's own warning argues for deleting them.** `caddy validate`
reports them "unnecessary" because the default passes headers through — but the
default *appends* the peer to any client-supplied value, and the app reads
`x-forwarded-for.split(',')[0]`. With the default, a request carrying a forged
`X-Forwarded-For` would have its forged value read first. The explicit
`header_up` *replaces* the header, which is what prevents that.
**Running `caddy fmt --overwrite` or "fixing" these warnings creates the
spoofing vulnerability.**

**4. The admin session token conveys no authority.** `POST /api/admin/auth`
returns `base64("admin:<timestamp>:<uuid>")` — unsigned, unstored, verified by
nothing. The client stores the password and sends it as `x-admin-password` on
every request. The token is decorative, which misleads anyone reasoning about
the auth model. The same 401 response also returns `attemptsRemaining`, telling
an unauthenticated caller how to pace around the 5-attempt lockout.

## Still open

- `/api/admin/reset-member-password` resets a member password using
  `ADMIN_RESET_SECRET` without member-session verification, and accepts
  six-character passwords. It is behind the network block now; that bought time,
  not a fix.
- Rate limiting lives in a process-local `Map` — it resets on every container
  swap and does not exist across instances.
- `auditLog()` swallows its own errors (`catch {}`, `lib/admin/adminAuth.ts`).
  The tradeoff is deliberate — audit must never block access — but a broken
  audit log is currently invisible forever. One `console.error` preserves the
  property and removes the blind spot.
- The shared password remains a founder-equivalent path for anyone on the
  trusted network.

## A note on the LAN entry

`192.168.4.0/24` is correct today and was wrong yesterday: minisforum moved from
`192.168.0.104` to `192.168.4.38` without rebooting, because the DHCP server
changed underneath it. Pin the host with a reservation, or this line becomes a
tripwire. CLAUDE.md still asserts `192.168.0.104` as the expected address.
