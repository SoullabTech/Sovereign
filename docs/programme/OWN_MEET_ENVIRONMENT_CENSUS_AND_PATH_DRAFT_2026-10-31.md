# Own meet environment: census and a staged path (DRAFT, 31 Oct 2026)

**Status:** read-only census plus a proposal. **Authorizes nothing.** No production state, container or configuration was changed.
**Evidence classes:** RUNTIME = read from production 2026-10-31 · CODE = read from the live SHA `c74794afe` · NOT EXAMINED where stated.
**Decision already taken (founder):** Thursday 5 Nov, 7:00 pm EST gathering is expected on Teams (or similar). The own environment is a *separate test*, and is not named in the invitation.

## 1. What exists
| Piece | Evidence |
|---|---|
| Session Room page and join-token flow (`app/open/session-room/[roomId]`, `app/api/session/join/[token]/room-token`) | CODE |
| Consent-before-entry: the room credential is minted only at room entry, after a fresh ledger check; fails closed if LiveKit is unconfigured | CODE (route header and logic) |
| Token minting is hand-rolled HMAC JWT (`lib/session/livekitToken.ts`), no LiveKit SDK dependency found in `package.json` | CODE |
| LiveKit webhook route, encounter, consent-event, media-stream and transcript tables, `studio_meetings`, `commons_rooms` | CODE + RUNTIME (tables exist) |
| `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_WS_URL` set in the production container (host `livekit.soullab.life`; values not read) | RUNTIME (presence only) |
| `maia-coturn` (TURN relay) | RUNTIME: up 3 months |

## 2. What is not running
| Piece | Evidence |
|---|---|
| **`maia-livekit` (the media server) is stopped**: `Exited (0) 3 months ago` | RUNTIME |
| Whether `livekit.soullab.life` resolves and routes through Caddy to a media server | **NOT EXAMINED** |
| Whether the Phase-3 design (`docs/specs/SESSION_ROOM_PHASE3_LIVEKIT_DESIGN_2026-06-15.md`) was ever witnessed end to end | **NOT EXAMINED** |

## 3. What has actually been used (RUNTIME, row counts)
`encounters` 1 · `encounter_participants` 0 · `encounter_consent_events` 0 · `encounter_media_streams` 0 · `encounter_transcripts` 0 · `studio_meetings` 0 · `studio_meeting_participants` 0 · `rl_meetings` 0 · `commons_rooms` 1 · `living_encounters` 14 (a different, older concept). **The live room has essentially never carried a real session.** Built is not wired is not verified.

## 4. What is missing for a live group gathering (a gap list, not a design)
1. **A running media server**, placed on a host the founder chooses. Production (minisforum) is not a build worker, and the design question is whether a media server belongs there at all.
2. **The group case.** The Session Room is built around a practitioner and a client (join tokens, per-client consent). A gathering of five to ten people needs a different consent shape and a different join rule. Not designed; not examined.
3. **A consent and recording boundary decided in advance**: no recording by default, nothing from a Sanctuary-style session retained, transcripts only on explicit consent. The tables for transcripts exist; their rules are not ruled for a gathering.
4. **A doorway** from Pro Studio or Co-Lab into the room, and a way to invite without email (the app cannot send invitations; see the Proton plan).
5. **An end-to-end witness by someone other than the founder**, including a phone and a weak network. The TURN relay is up, which helps, but nothing has been walked.

## 5. A staged path (smallest, most reversible first)
0. **Scope ruling:** which surface is the base (Session Room, Commons room, or a new Pro Studio room) and what a gathering needs from consent. This is a founder decision and a new-capability lane charter.
1. **Prove the media server off production** on the Mac Studio stack: two people, audio and video, using the existing room-token route. If it cannot be made to work there, stop and say so.
2. **Settle the consent and recording rules** for a group, then write the failing tests first (a surviving wrong implementation repairs the suite, not the candidate).
3. **Wire the doorway** (Pro Studio / Co-Lab) through the existing join-token design, with the closed-by-default behavior preserved.
4. **Rehearse with two or three people** a few days before any real use; decide go or no-go the day before. Teams stays as the fallback.
5. **Witness** it with someone other than the founder before it is named in any invitation.

## 6. Not authorized by this draft
Starting any container · changing Caddy, DNS or the TURN relay · any schema or code change · naming the own environment to members · recording anything.
