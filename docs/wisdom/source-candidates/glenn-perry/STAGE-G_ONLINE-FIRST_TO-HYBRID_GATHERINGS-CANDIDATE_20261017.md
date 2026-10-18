---
tier: 4
authority: derivative
source_type: research
title: "Wisdom Keepers — online-first to hybrid gatherings"
author: "Soullab service design for founder review"
version: "0.1"
date_added: "2026-10-17"
status: review
safe_for_retrieval: false
---

# From online Circles to hybrid gatherings

**Founder direction accepted for DESIGN: online first, then hybrid.** This document is a pilot architecture candidate, not an authorized live meeting, event programme, provider selection, production deployment, calendar booking, Circle membership change, or keeper invitation.

## The experience, rather than the platform

Wisdom Keepers should grow as a community of *actual relationships*: people discover a named teacher's contribution, choose to gather with others, listen and respond, and, when the original keeper accepts, meet that keeper as a consenting human host. **Hybrid** means someone physically present and someone connecting from another place both belong to the same deliberately held encounter. It is not a webinar with second-class remote spectators.

Online is the preferred place to discover the right human rhythm before investing in equipment, venues, or a new communications substrate. The first gatherings can exist without an integrated Soullab video product, without scraping or licensing an author's corpus, and without turning a group into a training resource.

## Four phases with independent gates

| Phase | Human offering | Technical posture | Gate before advancing |
| --- | --- | --- | --- |
| **1 · One online founder-hosted Circle** | The already drafted 75-minute *Where Symbols Meet Life* educational experience; 6–8 voluntary adult attendees is a facilitation target, not Circle law | Private, host-controlled external meeting, chosen and tested before launch; no integrated MAIA bot, auto-registration, recording or transcript | Actual venue and access/exit tests, true privacy notice, founder go/no-go to invite |
| **2 · Online gatherings as a rhythm** | Small recurring inquiry Circles; optional source-study gatherings; open-to-quiet-presence salons | Reuse a tested meeting adapter/linkout only after scoped invitation access; each meeting has its own host, consent, source attribution and exit | Genuine Circle/Commons join and roles, no inferred membership or retention incentives |
| **3 · Voluntary keeper-hosted online fields** | Keeper-selected teachings, human Q&A, occasional salons, co-keeper conversations, optionally courses or supported apprenticeships | Separate founder approval, keeper-scoped acceptance, participant-specific entry, topic and rights/recording boundaries, fair honoraria | Human keeper and member consent + narrowly enforceable rights/access, no MAIA impersonation |
| **4 · Hybrid local + remote experiences** | In-person study evenings, workshops, seasonal gatherings and carefully bounded retreats, with inclusive remote participation | Verified local venue + tested remote bridge, real human facilitators for both audiences, independent safety and venue privacy controls | Hybrid accessibility, audio and equal-participation rehearsal, real venue terms and incident response |

These are a learning progression, **not a conversion funnel** and not compulsory stages for members. Members can choose a public author link or quiet private reflection without joining any Circle or paying.

## What the repository offers today — and what it does not prove

The following is a source inspection, **not** a test of production credentials, deployed services or actual connectivity:

- `docs/architecture/MAIA_GROUPS_MEETINGS_2026-06-27.md` describes a **provider-agnostic link-launch** design and lists Zoom, Google Meet, Jitsi, LiveKit, Proton Meet, Teams and custom links, with meeting URL and metadata types in `lib/trust/types.ts`. It explicitly describes itself as a **design sketch**, not a group meeting implementation.
- `docs/specs/SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md` distinguishes an external-provider managed link-out from a sovereign media system. A third-party video provider's recording, account, conferencing or telemetry rules **do not become Soullab-sovereign** merely because its link appears inside MAIA.
- `app/open/session-room/[roomId]/page.tsx` and its signaling/TURN routes implement a **consent-gated two-participant encounter transport** without built-in recording/transcript/memory. This is **not** evidence of a tested multiperson Wisdom Circle, accessible hybrid facility or video event platform. Self-hosted coturn credentials are environment dependent and may fail closed if absent.
- `lib/session/livekitToken.ts` and the client room-token route contain permissioned LiveKit token issuance for Session Room. They do **not** certify a deployed, managed group conferencing bridge or production-ready keeper field. A token script is not a tested gathering.
- `app/api/events/[slug]/register/route.ts` permits anonymous email registration for non-private open events by design. That **must not** be reused as a shortcut to private, consent-gated Wisdom Circles. A generic `meeting_link` column and practitioner group pages do not prove invitation privacy, consent, attendee visibility, or recording custody.

**Preferred Phase 1 approach:** A separately selected, mature, host-controlled conferencing provider or a verified private meeting already available to the founder. Validate the exact account/service settings with fictional people and test devices, including recording and transcript controls, before making any privacy promise. Never invent a meeting URL or assume the provider has end-to-end encryption, no data processing or zero technical logs. Use an external link if necessary; no forced MAIA or account integration is needed for the first human experiment.

**Phase 3/4 engineering choice remains open:** Once human rhythms and Circle controls are proven, assess whether sovereign LiveKit/Jitsi/multiparty WebRTC or another audited provider actually improves consent, latency, access and reliability. Do not deploy an unfinished self-hosted stack for a sensitive group merely to claim sovereignty.

## First online gathering — a concrete hosting picture

The Stage F run of show and original facilitator prompts **do not need rewriting**. They do require online-specific staging:

**Before the doors open:** The founder names an operational human co-host when useful. Only explicitly invited consenting participants receive a private, controlled admission method. Configure waiting room or equivalent admission controls, restrict screen-sharing to host unless separately allowed, disable recording/transcription/AI notes, and verify the provider's administrative logs and attendance visibility rather than promising no data exists.

**At arrival:** The host explains participant-visible names/cameras/microphone status, speaking and chat expectations, discretionary privacy, the choice to participate camera-off or quietly, and how to disconnect. A participant entering through an external provider has data handled by that provider under its terms—name the provider accurately in the final consent.

**During inquiry:** Use the six movements from *Where Symbols Meet Life* (0–10, 10–20, 20–35, 35–55, 55–65, 65–75). Allow an optional spoken queue, text-based question alternative where available, and periods of silence. Do not force camera-on or assign pseudoscientific identity claims. Questions from publicly linked wisdom traditions remain acknowledged and contestable.

**During a problem:** A forced recording, uninvited person, unexpected transcript, exposed roster, disruptive speaker, or unreliable host-control mechanism triggers pause and an honestly communicated repair or end. A host must know how to remove an intruder, close admission, and end the room for everybody without deleting source member material or punishing disagreement.

**At closing:** Give each person their own meaning, do not ask for self-report scores, automatically copy group chat into AIN, distribute attendance-based campaigns, create AI transcripts, or publish a Circle summary. Any future authored contribution is a separate consent act under FR-07 and FR-08; Sanctuary never crosses.

### Private online meeting acceptance — minimum rehearsal

A fixture-only rehearsal should verify: invited participant can join; uninvited person cannot; an expired/revoked invitation cannot; host can pause/close entry, end the entire meeting, and eject an intruder by a recorded procedural safety basis; a camera-off/mobile or low-bandwidth member can participate; recording/transcript/AI helper can be shown off; unapproved screen-share and member-list exposure are prevented when required; provider and any logs are transparently described; and an attendee can leave without creating a follow-up profile.

If the selected provider or Soullab permissions cannot demonstrably meet the participant notice, **do not host**. This review branch does not claim these checks have passed.

## Phase 2 — a learning ecology, not an event factory

Possible opt-in formats include:
- **Intimate Wisdom Circle:** a recurring (only if expressly desired) 60–90 minute facilitated exchange with a named inquiry.
- **Study evening:** an attributed, original question about a publicly cited teacher's work; the author need not be present or endorsed.
- **Open salon:** a deliberately held conversation with invited questions, quiet listening and accessible participation.
- **Keeper visit:** one bounded human teaching/discussion after affirmative keeper and member terms, including fair agreed compensation.
- **Cross-keeper encounter:** multiple invited human teachers and independent lineages, with each person's voice and IP intact.

Avoid no-show pressure, automatic enrollment into a subscription, inferred "matching," book-excerpt redistribution, pre-filled referral emails, attendance leaderboards, and paid ranking of keepers.

The existing Wisdom room can orient toward original work and human invitations; the FR-02 Interest Commons would eventually support destination-specific **explicit interests**, never interest inferred from MAIA memory, private chart data or psychological state.

## Phase 4 — hybrid means *equal presence*

### Essential rooms and human roles

1. **Physical host:** holds consent and procedures in the venue; manages safe arrival, seating, visible privacy/recording notices and interruption boundaries.
2. **Remote co-host / participant advocate:** monitors whether online participants can hear, be heard, ask a question, or pause, and reports failures immediately. They are not a hidden recorder, therapist or member-data analyst.
3. **Keeper, if invited:** has only an agreed topic and hosting permission. No automatic admin access, member list export, room control or copyright license.
4. **Participants:** may attend from either mode under the same authorship/consent law. A remote person may choose camera off; a local person may choose not to be filmed.

**Minimum technical floor:** bidirectional, intelligible room audio; microphones placed to capture willing local speakers without covert recording or unconsented transmission; an appropriate sound-reinforcement and acoustic-echo approach (test mix-minus/echo cancellation for the venue); camera/lighting framing with informed consent for who is visible; live remote participation queue; accessible captions or a plainly communicated accommodation plan where technically available; a non-video alternative for participants with bandwidth or disability constraints; host controls for admission, removal and ending; and explicit decisions about what happens if connectivity fails.

**No hidden side channel:** if the venue has an audience, the remote audience needs to know who is present and can hear. If remote attendees join a closed Circle, local bystanders must not be able to listen unannounced.

### Hybrid-specific pass/fail rehearsal (before anyone is invited)

- A remote person speaks and is clearly heard by the people in the room without feedback.
- A physically present person, with consent to transmit, is clearly heard by a remote participant.
- A remote participant can ask and decline questions on materially equal terms.
- The host can pause video/audio to protect someone who withdraws their visibility consent.
- Camera framing and screen-sharing do not reveal unwilling bystanders, personal devices, participant lists or sensitive documents.
- If an in-person attendee steps away, they aren't filmed or mentioned as an absence-triggered concern.
- Local and remote participants know whether recording is possible, its actual configured state, and which technical/admin logs exist.
- The entire session can stop cleanly if a venue or privacy failure occurs.
- No public livestream or open guest join URL is treated as a private Circle.

If any of those fails, revert to online-only or postpone the hybrid meeting. Do not claim "equal presence" without witnessing it.

## Events and gatherings are *human acts*, not inferred commitments

A public author reference, a declared interest, a Circle membership, an event invitation and an RSVP are **five different things**. A consent to one cannot silently confer the others. In a future booking flow, identity/host/source/venue/price are named and known; recipients are knowingly selected; registration is explicit; any external provider's data handling is identified; and attendance never becomes consent to marketing, recordings, intellectual property reuse or AI inference.

A keeper or member can decline, pause, or exit without loss of their original works or private memories. Fair, disclosed payment for genuine labor is compatible with communal reciprocity; paid privilege to a person's *meaning* is not.

## Decision order — no automatic work is scheduled

1. **Now:** Ratify (or revise) *online-first / hybrid-later* as the founder's service direction, while preserving a small educational pilot and no source-admission change.
2. **Before an actual first invitation:** Choose one specific online meeting provider/account **and** witness privacy/host controls under fictional participants. Determine date, time, local time zone, operating costs and accessibility, then review the final invitation.
3. **Before a recurring Circle:** Verify real Circle/Commons cohort access, procedural host role, join/leave/revocation, and absence of unsolicited data retention.
4. **Before a keeper-hosted event:** Obtain a **separate, narrow keeper invitation and acceptance**, source/recording/copyright terms and explicit member consent.
5. **Before hybrid:** Run a local/remote audio, privacy, accessibility and equal-participation acceptance rehearsal; only then approve a venue and named local/remote facilitators.

No step authorizes emails, calendar invites, meeting links, a live room, deployment, recording, payments or production changes merely by approving a research document.

**Custody:** Stage G is a source-candidate design within the dedicated Perry/Wisdom Keepers research folder; `status: review`, `safe_for_retrieval: false`. Separate founder release is required for human outreach and for any new software or platform deployment.
