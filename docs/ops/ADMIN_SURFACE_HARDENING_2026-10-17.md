# Admin surface — exposure found, closed, and what the record must say

**Date:** 2026-10-17 · **Host:** minisforum (production)

**Evidence scope:** This is the operator's dated October 17 account, carried forward
from commit `097c1b86d2eed1ad428eff11b3aa947a459e37fc` with the
authentication-evidence correction below. It is **not** a fresh probe of the
currently deployed Caddy configuration, nor a definitive breach assessment.

## What was true before

`/api/admin/*` and `/labtools/admin/*` were reachable from the public internet.
The Caddyfile contained a complete restriction block — written, correct, and
**entirely commented out** since it was authored. Nobody had enabled it.

`admin_access_log` shows sustained external probing from 2026-09-02 to
2026-10-16: eight distinct addresses in `185.177.72.0/24` plus `38.248.90.244`
and `32.219.7.166`, hitting `/api/admin/auth` and
`/api/admin/monitoring/system`.

**No successful external authentication was observed in the queried audit rows.**
A query filtering `via <> 'denied'` and excluding LAN, Docker and loopback
ranges returned zero rows. **That result cannot establish that no external
password login succeeded:** the password-authentication POST does not write to
`admin_access_log` (finding 2 below). Treat the surface as exposed, with no
successful external authentication established by this limited log query;
do **not** classify it as unbreached without independent authentication and
post-login activity evidence.

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

**3. Forwarded-IP trust needs a configuration-specific witness.** The
deployed Caddy change retained explicit
`header_up X-Forwarded-For {remote_host}` rules, which overwrite the upstream
header; the application reads `x-forwarded-for.split(',')[0]`. The original
incident account called these rules indispensable because it assumed default
Caddy would append an untrusted client-supplied header. **That inference is
not established by this evidence.** Caddy's documented default is to ignore
incoming untrusted `X-Forwarded-*` values when proxying, with different trust
behavior possible when `trusted_proxies` is configured.
See [Caddy reverse_proxy header defaults](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy#defaults).

`caddy fmt --overwrite` is a **formatter**, not a command that removes
`header_up` directives; the prior claim that formatting itself introduces a
spoofing vulnerability was incorrect.
See [Caddy's `fmt` command](https://caddyserver.com/docs/command-line#caddy-fmt).
Do not remove the current explicit override solely to silence a warning,
either: before changing trusted-proxy/header policy, independently inspect
the actual deployed Caddy version, adapted configuration, upstream route and
backend parsing, then test spoofed forwarded headers through the real
authorized network path. A validation warning alone proves neither safety
nor exploitability.

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
