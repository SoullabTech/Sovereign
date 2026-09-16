# GESTALT-STANDING-SHADOW-01 — S0–S3 Record

**Base:** `823d040d377d3b55cbd7c65c1b94ce1864e82f6f`
**Lane:** `chore/gestalt-standing-shadow-01-20260916`
**Authority:** shadow-only; no member-facing or cognition influence

## S0 — bound

Isolated worktree: `/private/tmp/gestalt-standing-shadow-01`.
The broad fetch first encountered an unrelated stale remote-tracking lock; no repair was attempted in this lane. Canonical was bound by an explicit fetch of `clean-main-no-secrets` only.

## S1 — pure types

Implemented under `lib/maia/gestaltStandingShadow/`:
- immutable evidence/authorship objects;
- typed semantic + standing relations;
- assembly-time `ResolvedStanding`;
- disposable `GestaltProjection`;
- structured `ResponseClaim` / `ClaimAdmission`.

Standing-changing `ADOPTS` is deliberately distinct from semantic `ADOPTED_AS`.

## S2 — deterministic resolver

`StandingResolver` contains no model call, no database write, and no mutable truth verdict. It computes cognition-use standing from evidence + applicable relations + scope + as-of time.
## S3 — frozen falsifiers

Targeted Jest witness:

```text
PASS lib/maia/gestaltStandingShadow/__tests__/standingResolver.test.ts
10 passed · 0 failed
```

Covered F1–F10:
Silver Cedar established meaning; repetition laundering; adoption; correction; contradiction; developmental return; present freedom; evidence descent; process scope; centrality ≠ authority.

The implementation passed the frozen tests without weakening them.

## Zero-influence construction

Nothing in `lib/maia/gestaltStandingShadow/` is imported by MAIA serving code. No route, prompt, provider call, persistence path, or member surface has changed.

Live shadow work, if admitted later, will execute out-of-band over read-only transcript snapshots rather than inside the member request path.