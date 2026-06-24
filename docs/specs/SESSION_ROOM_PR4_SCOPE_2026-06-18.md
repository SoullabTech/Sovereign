# Session Room — PR4 Scope: Sovereign 1:1 Room UI

**Date:** 2026-06-18
**Branch base for truth:** `clean-main-no-secrets @ 17d653e83` (prod)
**Status:** SCOPE / PLAN ONLY — no implementation code in this PR's authoring.
**Predecessors (LIVE on prod, do not re-litigate):** self-hosted LiveKit SFU (`docker-compose.production.yml` `livekit` service, TURN 3478), `wss://livekit.soullab.life` (valid TLS), client room-token mint `POST /api/session/join/[token]/room-token` (PR3 — accept → valid LiveKit JWT, Sanctuary-aware grants, rate-limited, fail-closed).

**Boundary (verbatim brief):** *"Build sovereign 1:1, not Zoom."*

**Goal:** make the deployed LiveKit foundation usable from Session Room / Sovereign Lobby for a 1:1 call — local + one remote participant, mute/unmute, camera on/off, leave — preserving every consent/Sanctuary gate already in place.

---

## 0. Truth findings (read against prod, not the working tree)

The Mac Studio working tree is on a stale feature branch predating the LiveKit merge. Everything below was read via `git show origin/clean-main-no-secrets:<path>`.

- **Client room-token endpoint response shape** (`app/api/session/join/[token]/room-token/route.ts`, POST):
  ```json
  { "ok": true, "roomToken": "<jwt>", "room": "<sessionId>", "identity": "client:<clientId>", "url": "<LIVEKIT_WS_URL>", "expiresInSeconds": 900 }
  ```
  Request body: **none** (token is the URL path param; identity is server-derived). Fail-closed 503 if `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET`/`LIVEKIT_WS_URL` unset; 401 invalid link; 403 no-consent/stale/terminal; 429 rate-limited. **The WS URL ships in the token response** (`url` = `process.env.LIVEKIT_WS_URL`).
- **`mintRoomToken`** (`lib/session/livekitToken.ts`): HS256 JWT via Node `crypto` (no external mint dep). Grant: `room` (= session id), `roomJoin:true`, `canPublish:true`, `canSubscribe:true`, `canPublishData:false`, `canPublishSources = publishSources(sanctuary)`. `publishSources(sanctuary)` → `['camera','microphone']` under Sanctuary, else `+ 'screen_share'`. **No `roomAdmin`/`roomCreate`.** TTL default 900s (join window; the live connection persists past it).
- **`authorizeClientRoomJoin`** (`lib/session/ClientConsent.ts`): the single gate. On allow returns `{ status:200, authorization: { room: sessionId, identity: 'client:'+clientId, role: 'client' } }`. `RoomRole = 'client' | 'practitioner' | 'scribe'` is declared, but **only the `client` role is constructed anywhere.** No `authorizePractitionerRoomJoin` exists.
- **Client entry** (`app/session/join/[token]/JoinClient.tsx`): fetches `GET /api/session/join/[token]` → on `state==='accepted'` renders `<SovereignLobby agreement retention videoLink />`. **It does not call the room-token endpoint yet.**
- **Lobby "Enter"** (`components/session/SovereignLobby.tsx`): `provider === 'soullab'` ⇒ `isExternalProvider=false`. `enter()` for the soullab path just `setEntered(true)` and renders the placeholder *"the live Session Room opens here in the next release"* (the entered-state block, gated by `externalLinkUsable`). **This placeholder is the exact PR4 swap point.** External providers still `window.open(safeLink)` — that branch stays untouched.
- **Practitioner entry** (`app/studio/session-room/page.tsx`): the only video affordance is an `<a href={videoRoomUrl}>Open Video Call</a>` (line ~878–887), shown only when an **external** `video_room_url` is configured in Studio Settings (fetched from `/api/studio/settings?key=video_room_url`). **There is no LiveKit join, no room-token mint, no `sessionId→roomName` binding on the practitioner side.** This is confirmed-missing and is the largest PR4 work item.
- **`livekit-client` is NOT a dependency.** `git show …:package.json | grep -i livekit` → none. No `@livekit/*` at all. PR4 must add `livekit-client`.
- **Capacitor:** `app/studio/session-room` IS in `MOBILE_EXCLUDED_DIRS` (`scripts/capacitor-patch-routes.sh`). `app/session/join/[token]` is NOT in the dir list, but its `page.tsx` carries a `force-dynamic`/dynamic-route note and is caught by the auto-detector (`hide_incompatible_pages`). Any **new** room route must be verified excluded.
- **The implementation-plan file named in the brief (`SESSION_ROOM_PHASE3_IMPLEMENTATION_PLAN_2026-06-15.md`) does not exist on prod.** The governing docs are `SESSION_ROOM_VIDEO_SPEC_2026-06-14.md` (§7 roadmap Phase 3, §12 LiveKit-first) and `SESSION_ROOM_PHASE3_PR2_NOTES_2026-06-15.md` (which defers room/multi-device/cellular proofs + webhook lifecycle to "a separate gate"/PR5). This scope doc is the PR4 plan that was missing.

---

## 1. Files to be touched

### Created
| Path | Why |
|---|---|
| `components/session/SovereignRoom.tsx` | The 1:1 room UI. Client component using `livekit-client`: connect with `{ url, roomToken }`, attach local + one remote `<video>`/`<audio>`, controls (mute/unmute, camera on/off, leave), connection-state + Sanctuary banner. Pure presentational + SDK glue; reads no consent storage. |
| `app/api/session/[sessionId]/practitioner-room-token/route.ts` | **The missing practitioner mint path.** Authenticated practitioner (Studio session, `apiFetch`/`x-member-id`) → verify they own the session (`practitioner_clients` / session record) → mint a token with `room = sessionId`, `identity = practitioner:<practitionerId>`, `role='practitioner'`, `sanctuary` from the same accepted agreement. Mirrors PR3's fail-closed + rate-limit + server-derived-identity discipline. **Same room name (= session id) as the client** — that binding is what puts both people in one room. |
| `lib/session/livekitToken.test.ts` additions OR a new `practitionerRoomToken.test.ts` | Unit-cover the practitioner mint authorization (owns-session allow; not-owner 403; unconfigured 503) the way `ClientConsent.test.ts`/`livekitToken.test.ts` cover the client path. |

### Modified
| Path | Why |
|---|---|
| `package.json` | Add `livekit-client` (client SDK only; **not** `@livekit/server-sdk` — minting stays on Node `crypto` per PR3). Pin a version. |
| `components/session/SovereignLobby.tsx` | Replace the `soullab` **entered** placeholder branch with `<SovereignRoom .../>`. On `enter()` for the soullab path: stop the preview stream, `POST /api/session/join/[token]/room-token`, then mount the room with the returned `{ url, roomToken, room, identity }`. External-provider branch unchanged. The Lobby already holds the accepted agreement + `retention.sanctuary` to pass through as display state. Lobby needs the join `token` passed in (today it only gets `agreement/retention/videoLink`). |
| `app/session/join/[token]/JoinClient.tsx` | Pass the `token` (and, if cleaner, a typed callback) into `<SovereignLobby>` so the Lobby can call the room-token endpoint. No change to the gate/decision logic. |
| `app/studio/session-room/page.tsx` | Add an **"Enter sovereign room"** affordance for the LiveKit/soullab path, alongside (not replacing) the existing external "Open Video Call". On click: `POST /api/session/[sessionId]/practitioner-room-token`, then mount `<SovereignRoom>` with the response. Gate visibility on a known `sessionId` + soullab provider. |
| `scripts/capacitor-patch-routes.sh` | Confirm/ensure the new practitioner room API route + any new room page are excluded from iOS static export (the practitioner page dir is already excluded; the new force-dynamic API route should be caught by auto-detection — verify and, if needed, add explicitly). |
| `.env.production` / `docker-compose.production.yml` / `Dockerfile` | **Only if** the browser needs the WS URL from env rather than the token response. See Blocker #4 — current plan does **not** require a new `NEXT_PUBLIC_*` var because the token response already carries `url`. If we choose an env var instead, the full NEXT_PUBLIC build-time wiring sequence (ARG/ENV + compose build-arg + rebuild) applies. **Recommended: no new env var; use `url` from the response.** |

---

## 2. Exact route + token flow (both sides; the room-name binding)

**Room-name binding (the crux):** LiveKit room name **= session id** on BOTH sides. Client gets it from PR3 (`authorizeClientRoomJoin` → `room: sessionId`); the new practitioner endpoint must mint with the identical `room = sessionId`. Same room name + two distinct server-derived identities (`client:<id>`, `practitioner:<id>`) = a 2-person room. Identity is **never** taken from the request body on either side (anti-spoof, per `ClientConsent.ts`).

### Client side (extends PR3 — minimal)
1. `JoinClient` loads `GET /api/session/join/[token]` → `state==='accepted'` → render Lobby (already live).
2. Lobby preview/device-check (already live; opt-in getUserMedia).
3. User clicks **Enter** (soullab path) → Lobby `POST /api/session/join/[token]/room-token` (no body).
4. Response `{ roomToken, room, url, identity }` → mount `<SovereignRoom url roomToken sanctuary={retention.sanctuary} />`.
5. SDK `room.connect(url, roomToken)` → publish camera+mic (subject to grant) → subscribe remote.

### Practitioner side (NEW — the real PR4 build)
1. Practitioner in `app/studio/session-room` with a selected booking/session (`sessionId` known).
2. Clicks **Enter sovereign room** → `POST /api/session/[sessionId]/practitioner-room-token` (authenticated via Studio session / `x-member-id`).
3. Route: verify practitioner owns this session (relationship/session record) → derive `identity='practitioner:'+practitionerId`, `role='practitioner'`, `room=sessionId`, `sanctuary` from the session's accepted agreement → `mintRoomToken(...)` → return `{ roomToken, room, url, identity, expiresInSeconds }` (same shape as PR3 for a shared client mount).
4. Mount `<SovereignRoom>` with the response. Both sides now share `room === sessionId`.

**Grants:** reuse `publishSources(sanctuary)`. Practitioner grant should match the client's least-privilege shape (no `roomAdmin`/`roomCreate`; mid-session `RemoveParticipant` is server-side and explicitly PR5, not PR4).

---

## 3. What gets wired (the 6 in-scope behaviors)

1. **Client-side room UI using `livekit-client`** — `SovereignRoom.tsx` (new dep added).
2. **From Lobby / Session Room "Enter," call the room-token endpoint** — Lobby → PR3 client endpoint; practitioner page → new practitioner endpoint.
3. **Connect to LiveKit with the returned token** — `room.connect(url, roomToken)`; `url` taken from the token response (no env var).
4. **Simple 2-person room** — local video/audio tile + one remote participant video/audio tile; mute/unmute (toggle mic track), camera on/off (toggle camera track), leave (disconnect + unmount → return to a calm post-call state).
5. **Preserve consent/Sanctuary gates already in place** — no token is minted without `authorizeClientRoomJoin` (client) / owns-session check (practitioner). Sanctuary screen-share exclusion is already enforced at the **grant** level (server), not the UI; the room shows the Sanctuary banner as a state indicator. The Lobby still must not offer a control that changes retention (§12).
6. **No infra / token-semantics / memory / consent-storage / Sanctuary-behavior changes** — except the one necessary new mint route for the practitioner, which reuses existing primitives (`mintRoomToken`, `publishSources`) and adds no new token claims.

---

## 4. Out of scope (intentional)

**From the brief's exclusions (hard no for PR4):** recording, egress, transcripts, multi-party grid (>2), in-room chat / data channel (`canPublishData` stays false), screen-share UI, dial-in/PSTN, clustering/multi-node. **Do not alter** LiveKit infra, token semantics, memory, consent storage, or Sanctuary behavior unless a bug blocks connection.

**Deferred to PR5+ (named gates, per PR2 notes / spec §7):**
- **Webhook lifecycle handling** — `room_finished` / participant events → retention writes (PR2 receiver only *acknowledges*; lifecycle is PR5, gated on the verified webhook so a forged event can't trigger a write).
- **Mid-session enforcement** — `RemoveParticipant` to kill a live connection after a mid-session revoke (`ClientConsent` notes this is runtime server-side, not modeled in the join gate; PR5).
- **Scribe as a named participant** in-room (spec §7 Phase 3 mentions a visible Scribe panel — defer; PR4 is 1:1 human↔human only).
- **Session timer / completion screen / continuity** (spec Phase 4): summary, action items, follow-ups, memory integration gated by retention profile.
- **Presence/quality indicators beyond connection-state.**
- **External-provider parity** — the `window.open` external path is untouched and not migrated.
- **443-only-network reachability** — known v1 TURN gap (PR2 Option (b)); `caddy-l4` consolidation is a separate later decision.

---

## 5. Manual test steps (two devices)

Pre-req: a real session with a client invite accepted (PR1–PR3 flow), provider = soullab, `LIVEKIT_*` env present on prod.

**A. Same-LAN two-device 1:1**
1. Device 1 (practitioner): Studio → Session Room → select the booking → **Enter sovereign room**. Confirm a token mints (network: 200 from `practitioner-room-token`) and local video appears.
2. Device 2 (client): open the accepted join link → Lobby → device check → **Enter**. Confirm 200 from `room-token` and local video appears.
3. Confirm each sees the **other's** remote video + hears audio (room name = same session id).
4. Mute/unmute on each → confirm the remote indicator/audio reflects it.
5. Camera on/off on each → confirm the remote tile blanks/returns.
6. Leave on one → confirm clean disconnect; the other sees the participant drop.

**B. Sanctuary path**
7. Repeat A with a **Sanctuary** agreement. Confirm the room shows the Sanctuary banner, the call is live A/V (Sanctuary ≠ muted), and **screen-share is not offered** (grant-level: `publishSources` excludes it). Confirm nothing is recorded/transcribed (no artifacts written).

**C. Cellular / WAN through `livekit.soullab.life` (the real proof)**
8. Put Device 2 on **cellular** (off-LAN), Device 1 on LAN. Re-run A. This exercises `wss://livekit.soullab.life` signaling + the **TURN relay on 3478** for NAT traversal. Confirm media connects both ways. (Known v1 gap: 443-only/symmetric-NAT networks may fail — note, don't fix, per PR2.)

**D. Gate integrity (negative)**
9. With consent **refused/revoked**, hitting `room-token` returns 403 and the room never mounts.
10. Unset a `LIVEKIT_*` var in a staging env → 503 fail-closed, no fallback to prod SFU.

---

## 6. Blockers found before coding (each verified)

1. **`livekit-client` not a dependency** — VERIFIED absent (`package.json`, no `@livekit/*`). **Resolution:** add `livekit-client` (client SDK only; keep mint on Node `crypto`). **Capacitor/iOS implication:** the room UI is web-only; both the practitioner page (already in `MOBILE_EXCLUDED_DIRS`) and the join route (force-dynamic, auto-excluded) stay out of the iOS static export, so the SDK never needs to bundle for WKWebView in this PR. Verify the new API route is excluded too. (Native iOS WebRTC-in-WKWebView is a later concern, spec §6.)

2. **No practitioner room-token mint path** — VERIFIED: only `authorizeClientRoomJoin` exists; `RoomRole` includes `practitioner`/`scribe` but neither is ever constructed; practitioner page only does an external `<a href>`. **This is the biggest real PR4 item.** **Resolution:** add `POST /api/session/[sessionId]/practitioner-room-token` (authenticated, owns-session check, `room=sessionId`, `identity='practitioner:'+id`, reuse `mintRoomToken`/`publishSources`, fail-closed + rate-limited like PR3). Same room name = session id is the binding that joins both parties.

3. **How each side enters today** — VERIFIED. Client: `JoinClient` → Lobby `enter()` (soullab path = placeholder `setEntered(true)`). Practitioner: `<a href={videoRoomUrl}>Open Video Call</a>` (external only). **Resolution:** client wire-in at the Lobby `soullab`-entered branch (`SovereignLobby.tsx`); practitioner wire-in as a new "Enter sovereign room" action in `app/studio/session-room/page.tsx`, both mounting the shared `SovereignRoom`.

4. **Where the browser gets the WS URL** — VERIFIED: the PR3 token response already returns `url` (= `LIVEKIT_WS_URL`). **Resolution:** consume `url` from the response on both sides. **No new `NEXT_PUBLIC_*` var needed** — which also sidesteps the build-time NEXT_PUBLIC trap (ARG/ENV/compose/rebuild). If a public env var is ever preferred, that full wiring sequence applies; avoid it.

5. **Capacitor exclusion** — VERIFIED: `app/studio/session-room` is in `MOBILE_EXCLUDED_DIRS`; `app/session/join/[token]` is auto-excluded via force-dynamic detection. **Resolution:** the new practitioner API route uses `force-dynamic` (like PR3's room-token route) so it should be auto-caught; explicitly confirm during the build and add to the exclusion config if the auto-detector misses an API route.

**Single biggest scope risk:** the **practitioner mint path (#2)**. It is net-new server code with its own authorization model (Studio-authenticated owns-session check, distinct from the token-ledger gate that protects the client), and getting the **room-name binding (= session id) identical on both sides** is what makes the 1:1 actually connect. Everything else is SDK glue on top of proven primitives; this is the one place a wrong identity/room derivation silently puts the two participants in different rooms.

---

## 7. Split decision (2026-06-18) — SPLIT into PR4a + PR4b

**Decision: SPLIT** (Kelly-approved). The practitioner mint endpoint (§6 #2) is the **trust boundary** — it authorizes who may enter a session's room and carries the room-name-binding correctness risk. Net-new server code with its own auth model, not "extremely small," so it earns an isolated security review. It is independently provable **without any UI** (authenticated script, the PR3 mint-proof pattern), and the UI cannot be meaningfully tested until it exists → the split is also the natural build order.

### PR4a — Practitioner room-token endpoint + security (server only)
- **New route:** `POST /api/session/[sessionId]/practitioner-room-token`.
- **Auth:** Studio session (`getMemberIdFromRequest` → practitioner), **owns-session check** — REUSE the exact ownership pattern already in `app/api/studio/sessions/[sessionId]/agreement/route.ts` (`member_id === caller`); do not invent a new ownership model.
- **Mint:** `room = sessionId` (byte-identical to the client path's room), `identity = 'practitioner:'+practitionerId`, `role='practitioner'`, `sanctuary` from the session's accepted agreement; reuse `mintRoomToken` + `publishSources(sanctuary)`; least-privilege (`roomJoin` only — **no** `roomAdmin`/`roomCreate`/`roomList`); fail-closed 503 if `LIVEKIT_*` unset; rate-limit per `(sessionId, practitionerId)` like PR3.
- **OPEN design decision (settle before/in PR4a):** may the practitioner (host) mint/enter **before** the client accepts? Lean = **yes** — host present once the agreement is set + `room_state` valid; the **client** stays accept-gated (`authorizeClientRoomJoin`). Kelly's call — it's a trust-boundary nuance.
- **Security tests (the review):** owns-session allow · wrong-practitioner 403 · unauthenticated 401 · `LIVEKIT_*` unset 503 · identity server-derived (never from body) · **room-name parity** (practitioner room === client room for the same session) · grant least-privilege (no admin) · rate-limit. Provable via an authenticated script (PR3-style), **no UI**.
- **Out:** no UI beyond an optional diagnostic call.

### PR4b — LiveKit client UI (depends on PR4a deployed)
- Add `livekit-client`; build `SovereignRoom.tsx`; wire Lobby `enter()` (client) + a new "Enter sovereign room" (practitioner) to the two endpoints; 2-person room — local + remote video/audio, mute/unmute, camera on/off, leave; preserve the external-provider `window.open` path untouched.

### Hard acceptance (both rungs, per Kelly)
Client + practitioner join the **exact same room** · wrong practitioner cannot mint · non-consented client cannot mint (already PR3) · Sanctuary boundaries unchanged · no recording/transcript/egress/screen-share/chat/multi-party.

### Build order
PR4a (endpoint → security-auditor pass → gated deploy → authenticated-script proof) → **then** PR4b (UI → 2-device LAN proof → cellular/WAN proof). Each rung its own explicit founder go. **Boundary: build sovereign 1:1, not Zoom.**

### 7.1 PR4a — finalized contract (Kelly 2026-06-18)

**Trust-boundary RESOLVED: practitioner may enter before the client, but only into a pre-encounter (empty) room.** Distinction = **preparation vs encounter** — a practitioner alone is "arranging chairs" (no interaction begun); the **client joining is when the relationship goes live**, and that stays consent-gated.

**Session lifecycle (presence-DERIVED — NOT new persisted room state):**
`Created → Waiting for Practitioner → Practitioner Ready → (client accepts) → Client Joining → Live Session → Ended`. Observed from participant presence (PR4b UI / PR5 webhooks), never stored as a room object. **PR4a persists nothing new for this.**

**Encoded constraints:**
- Practitioner token MAY mint before client acceptance — gate = owns-session + agreement set + non-terminal `room_state`; **no** consent-ledger requirement for the host.
- Client token CANNOT mint until consent is recorded — unchanged PR3 rule (`authorizeClientRoomJoin`).
- Room stays pre-encounter until the client joins; practitioner leaving before the client = nothing special; client never accepting = room simply expires.

**NEW — ephemeral room (no app-side room object):**
- Room identity is deterministically `sessionId`; the app stores **session** state, never **room** state.
- The room exists only because **LiveKit auto-creates it on first join** and **auto-deletes when the last participant leaves** (`auto_create` + `empty_timeout`). PR4a mints tokens only — it must **NEVER** call a LiveKit room-create/admin API (the grant already has no `roomCreate`/`roomAdmin`). LiveKit stays *transport*, not a second domain model.
- *Confirm at build:* `config/livekit.yaml` has `auto_create` on (LiveKit default = true) + a sane `empty_timeout`; tuning `empty_timeout` is an optional later infra tweak, out of PR4a.

**NEW acceptance criterion — single shared room-name derivation:**
- Add `getSessionRoomName(sessionId)` (one server-side fn, e.g. in `lib/session/livekitToken.ts`). **BOTH** the new practitioner endpoint AND the existing PR3 client path call it — not "the same value," the **same function**. This is a small *behavior-preserving* refactor of the client mint (room stays `sessionId`; the 57 PR3 tests are the guard). The parity test asserts both route through it → the `"session:123"` vs `"123"` vs `"Session-123"` class of silent failure becomes structurally impossible.

**PR4a's final responsibility — exactly five, nothing else:** (1) authorization, (2) shared room identity, (3) token minting, (4) security tests, (5) nothing else. If PR4a merges clean, **PR4b is a client-integration exercise, not a security exercise.**
