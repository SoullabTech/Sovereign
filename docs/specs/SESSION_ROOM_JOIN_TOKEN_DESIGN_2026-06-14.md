# Session Room — Client Join Token + Reveal Gate (locked design)

- **Status**: Design locked for review — no code yet. 2026-06-14.
- **Parent**: `SESSION_ROOM_VIDEO_SPEC_2026-06-14.md`, `SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md`
- **Principle (Kelly)**: the consent architecture carries the sovereignty claim — the authentication model matters as much as the ledger. This is where the constitution becomes code.
- **Confirmed**: `scribe_sessions.client_id` exists on prod (uuid); `practitioner_clients` has a PK, so `session_join_tokens.client_id → practitioner_clients(id)` is a valid FK.

## 1. The client join token — what it is and isn't

Not a login. Not a session. A scoped, single-purpose invitation token.

- **Bound to**: `session_id`, `client_id`, `agreement_version`.
- **Can only**: view the agreement, accept, refuse.
- **Cannot**: reach practitioner notes, transcripts, summaries, or session history. The client surface returns only the agreement statements + minimal session/practitioner display.
- **Expires**: `min(created_at + 7 days, session start)`. Operationally also invalid once `room_state != 'pre'`.
- **Auto-invalidates** (revocation by binding wherever possible, so there's nothing to forget to revoke):
  - agreement version changes → token's `agreement_version` no longer matches `scribe_sessions.agreement_version` ⇒ stale ⇒ invalid. New version ⇒ new token.
  - client accepts or refuses → token marked terminal (a single decision).
  - session cancelled → session state ⇒ invalid.

## 2. Token format & storage — decision A (recommend)

Opaque, DB-backed, hashed — not a JWT.

- 32 random bytes → base64url. The raw token appears only in the join link.
- Store only `sha256(token)` in the DB (like an API key); never the raw token.
- Rationale: revocation, binding, and audit all require server state anyway (the reveal gate already consults the ledger). Opaque tokens are simpler to reason about for a consent gate and need no JWT secret — sovereign, no external dependency.

New table (migration addition):

```
session_join_tokens(
  id                uuid pk default gen_random_uuid(),
  session_id        uuid not null references scribe_sessions(id) on delete cascade,
  client_id         uuid not null references practitioner_clients(id) on delete cascade,
  agreement_version text not null,
  token_hash        text not null unique,
  status            text not null default 'active' check (status in ('active','used','refused','revoked')),
  expires_at        timestamptz not null,
  created_at        timestamptz not null default now(),
  decided_at        timestamptz
)
-- indexes: unique(token_hash); (session_id, agreement_version)
```

## 3. Minting — decision B (recommend)

Minted at agreement-set time, bound to the current `(session_id, client_id, agreement_version)`. A new version mints a fresh token and sets prior `active` tokens for the session to `revoked`. Requires a `client_id` assigned to the session (else 409 — assign a client first). The practitioner route returns the join link to share. This makes "new version ⇒ new token" automatic and atomic (extends the practitioner route built previously — additive).

## 4. Reveal gate — the ledger is the only source of truth (Kelly)

Authorization to return `video_link` is **always** the ledger query, on every request:

> the latest client event for the current `agreement_version` must equal `accept`.

`video_link_reveal_allowed` stays a denormalized, fail-closed cache/mirror — never the authority. The decision is a pure function `isClientConsentActive(events, currentVersion): boolean` over the consent ledger; routes are thin IO wrappers around it.

## 5. Refusal is terminal (Kelly)

`accept` and `refuse` are peers — there is no "maybe later." On refuse: record the `refuse` event, mark the token terminal, notify the practitioner, return no link, session stays unjoined. To request consent again the practitioner must revise the agreement (new version ⇒ new token). This structurally prevents "ask again until yes."

## 6. Endpoints (client, token-authenticated)

- `GET /api/session/join/[token]` — validate; return agreement statements + minimal display + decision state; include `videoLink` only if `isClientConsentActive` (else null). No notes/history.
- `POST /api/session/join/[token]/accept` — validate (active, unexpired, version matches current, `room_state='pre'`); write client `accept` event (`actor_id=client_id`); set `consent_client_at=NOW()`, `video_link_reveal_allowed=true` (cache), token `status='used'`; return the link.
- `POST /api/session/join/[token]/refuse` — write client `refuse` event; token `status='refused'`; notify practitioner; no link.

## 7. Behavioral proof — decision C (recommend) makes these runnable now

Extract the reveal + token-validation decisions as **pure functions** (no DB), so the security model is unit-tested without needing the migration applied locally. Kelly's required set:

```
1. no token                         → 401
2. valid token, no consent          → 403
3. refusal recorded                 → 403
4. acceptance recorded              → 200 + video link
5. old accepted token (old version) → 403   (stale binding)
6. new version, no accept yet       → 403
```

These turn the consent model from documented into enforceable. The HTTP routes stay thin wrappers over the tested pure functions.

## Decisions to confirm

- **A** — opaque DB-backed hashed token (not JWT).
- **B** — mint at agreement-set; new version ⇒ new token; requires `client_id`.
- **C** — reveal + token validation as pure functions; routes thin; the 6 tests run against them now (no DB dependency).
- **D** — new `session_join_tokens` table (migration addition).

## Build order after confirmation

migration addition (`session_join_tokens`) → pure decision functions + the 6 behavioral tests → the three client routes → extend the practitioner route to mint the token.
