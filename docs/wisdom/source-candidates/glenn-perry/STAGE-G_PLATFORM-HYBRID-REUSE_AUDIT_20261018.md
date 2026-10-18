---
tier: 4
authority: derivative
source_type: research
title: "Wisdom Keepers — assess existing Soullab hybrid meeting infrastructure first"
author: "Soullab code inspection for founder review"
version: "0.1"
date_added: "2026-10-18"
status: review
safe_for_retrieval: false
---

# First examine the hybrid service Soullab already built

**Founder clarification:** Soullab has already created a hybrid service on-platform. The first Wisdom Circle should **prefer reuse** of that investment and the platform's sovereign participant experience, provided that a real multiperson and privacy acceptance check passes. Do **not** reflexively prescribe an external commercial meeting provider, duplicate working infrastructure, or claim that existing service components prove a working 6–8-person room.

**Scope of this audit:** read-only inspection of Soullab repository sources as of 2026-10-18. No developer deployment, account/session inspection, provider credential verification, real call, screenshots of current production, permission grant, purchase, recording, or participant invitation occurred. A different on-platform hybrid service not referenced by these paths could exist; its exact location/deployment must be separately verified.

## Reusable building blocks actually present

| Current component | Evidence in source | Potential use for a Wisdom Circle | Limit |
| --- | --- | --- | --- |
| Studio Groups | `app/studio/groups/new/page.tsx`, `app/studio/groups/[groupId]/page.tsx`, `app/api/studio/groups/route.ts` | A group/cohort can be defined, with meeting day/time/duration and a video meeting link. The practitioner-facing group page displays the link, under practitioner-session checks. | This is **a meeting link/organizer**, not itself verified multiperson conferencing or a member-specific invitation door. Existing group membership is practitioner-client oriented, not automatically a constitutional Circle. |
| Provider-agnostic Trust Layer | `lib/trust/types.ts`, `lib/trust/service.ts` | Provider labels and meeting metadata can be reused without forcing Zoom or Teams. | Listed providers and `recordingConsent` metadata do not enforce a third-party provider's actual recording controls. |
| Studio online meeting adapter | `lib/studio/studioSessionMeeting.ts` | Can construct a calendar-backed online meeting and pass attendees to an injected provider. | Explicitly **invite-only**; admission occurs in the provider, not this wrapper. Tests are primarily injected/fake providers. |
| Self-hosted LiveKit infrastructure | `docker-compose.production.yml`, `config/livekit.yaml`, `Caddyfile` | A self-hosted SFU is declared in deploy configuration; this may be valuable for a future verified multiperson/hybrid meeting. | Presence in Git does not prove it is currently running, reachable for 6–8 real clients, adequately scaled, or privacy-controlled. |
| Consent-scoped Session Room token issuance | `app/api/session/join/[token]/room-token/route.ts`, `lib/session/ClientConsent.ts`, `lib/session/livekitToken.ts` | Strong principles to reuse: current agreement version, short-lived signed room token, source-of-identity server, Sanctuary-specific permissions, refusal after revocation. | Existing token flow is explicitly based on **practitioner/client** session and join-token consent, not authenticated group membership/host permission. Do not simply mint group tokens from client room credentials. |
| Native WebRTC encounter | `app/open/session-room/[roomId]/page.tsx`, signaling and TURN routes | Consent-gated two-person WebRTC proof demonstrates meaningful media boundaries, including no automatic transcript/memory. | It is **two-person encounter transport**, not proven multiperson group video. |
| Earlier Soullab Video signaling server | `app/video-server/server.js`, `lib/video/WebRTCManager.ts` | Tracks a map of participants and relays Socket.IO SDP/ICE, illustrating a possible multi-person signaling evolution. | `WebRTCManager` has **one** `RTCPeerConnection` and one remote stream. More importantly, the older `join-session` handler accepts caller-provided `sessionId`, `userId`, `userName` with no visible verified session/room consent gate in that handler. **Do not use it to host a sensitive private group unmodified.** |
| Public event registration | `app/api/events/[slug]/register/route.ts` | A distinct future public events mechanism. | Its open-event path allows email-only anonymous registration; it is **not** a private Wisdom Circle membership/consent gate. |

**Result:** Soullab has a genuine meeting/consent/media substrate. It has **not yet been shown in this audit** that an existing UI and backend already provide an approved, private **6–8-person** group room with participant-authored admission and safe operator controls. The founder may know a different launched hybrid interface: verify that exact URL/screen before declaring any part missing or rebuilding it.

## Technical acceptance: reuse in preference to replacement

**Step 1 — identify the existing service precisely.** Determine the actual Soullab route/room/account that the founder considers the hybrid service. Record its source commit, runtime deployment, intended human workflow and whether it uses Studio Groups, a LiveKit room, a custom component or an external provider link. Never infer from a source-code file that the production instance is live.

**Step 2 — isolate a fictional group rehearsal.** With production untouched, simulate a named human founder-host, several adult fixture members and an uninvited stranger. Confirm actual multiperson video/audio; guest denial; scoped meeting tokens; non-guessable and revocable entry; host ability to close, mute/remediate and end the room; no unintended attendance or member-profile exposure; and safe departure. A code-only unit pass is not a substitute for media verification.

**Step 3 — confirm privacy as implemented.** Verify screen-sharing, recording, transcription, AI notetakers, temporary/local caches, room chat, server/provider logs, what participants see, and what survives closing. Document the honest provider-data boundary. In the founder pilot **recording and AI group participation default OFF**. If the system cannot show these off, postpone.

**Step 4 — prove real-world connectivity and accessibility.** Test Mac Studio + an iPhone/tablet/second desktop using fictional identities, with multiple independent connections, headphones/speakers, mute/camera-off, low bandwidth and an accessible route to ask a question. For hybrid later, include a room microphone, echo-cancellation and a remote-voice advocate.

**Step 5 — select only the working path.** If the existing Soullab hybrid service passes these gates, use it as the first Wisdom Circle venue. Its distinct video engine can coexist with Soullab's own participant orientation and consent. If it fails, choose whether a bounded fix is appropriate. An external provider/linkout is a **contingency**, not an unexamined default.

## Release and relationship boundaries

- This research does not authorize changing or starting the live hybrid service, activating LiveKit or a Socket.IO server, creating a Circle, sending event invitations, enrolling anyone, or using a production account.
- Glenn Perry remains an unaffiliated original-source reference. No keeper involvement, source-text license, embedding or model imitation follows from a working meeting room.
- The first educational pilot still belongs to the people present: speaking and camera are optional; no recording/AI recap; no private MAIA memory, Sanctuary or Circle interior crosses into a Commons.
- Do not recycle the practitioner/client room's role and consent ledger into a group without explicit authorization tests. Circle facilitation is procedural, and organizer/founder/keeper roles are separate.
- The canonical Circle membrane and member-data privacy rules remain unchanged.
- A separate founder release decision is required after an actual safe multiperson and operator acceptance witness.

**Recommendation:** Treat the existing on-platform hybrid service as the **first implementation candidate**. Verify it precisely and try an isolated, fictional private group before purchasing or integrating anything else. Do not call it ready until the group-room and host controls have passed.
