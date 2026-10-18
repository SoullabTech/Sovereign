---
tier: 4
authority: derivative
source_type: research
title: "Wisdom Keepers gatherings — online-first founder brief"
author: "Soullab programme design for founder review"
version: "0.1"
date_added: "2026-10-17"
status: review
safe_for_retrieval: false
---

# Begin online. Grow into hybrid.

**Wisdom Keepers Commons · proposed sequence, not scheduled events**

### The invitation

Soullab can begin with a living, face-to-face *online* encounter: small enough to feel human, open to quiet listening, and deliberately held by a named facilitator. Once the community knows how to gather without exploiting its members' personal information, the same practice can grow into salons led by willing wisdom keepers, in-person meetings and inclusive hybrid events.

Hybrid should not mean a camera pointed at a room. Remote participants must be heard and welcomed as fully participating humans.

## A phased rhythm, not a funnel

| Phase | Human offering | What makes it possible |
| --- | --- | --- |
| **1 · First online Circle** | *Where Symbols Meet Life* — 75 minutes, founder-hosted, voluntary adult study | A private, verified video meeting; actual access/recording/consent checks |
| **2 · Online community rhythm** | Intimate study Circles, thematic gatherings, occasional open salons | Reliable Circle membership and genuine member-declared interests; no automatic enrollment |
| **3 · Keeper-hosted encounters** | A real keeper might teach, answer questions, cohost or collaborate | The keeper *and* members accept each specific experience; fair rights and compensation |
| **4 · Hybrid gatherings** | Local and remote workshops, meetings, retreats, studio encounters | Local + remote host roles, tested two-way audio, privacy, accessibility and equal voice |

No ongoing cadence, venue, paid subscription or named keeper participation has been authorized.

### My proposed first implementation

**Evaluate Soullab's already-created hybrid meeting service first.** The founder has identified an on-platform capability we should reuse rather than assume an external service is necessary. Our [read-only platform reuse audit](./STAGE-G_PLATFORM-HYBRID-REUSE_AUDIT_20261018.md) confirms meaningful Studio group links, provider-aware meeting metadata, LiveKit SFU configuration, Session Room consent, and video/signaling components.

The missing verification is whether the *particular existing on-platform hybrid interface* safely supports 6–8 adult participants with scoped join/revocation, reliable bidirectional audio/video, host controls, camera-off access and accurate recording/transcript disclosure. One older WebRTC client handles a single peer, and the older Socket.IO join handler lacks an evident verified membership gate; it should not be used as a private group room unmodified. The consent-gated Session Room is intended for individual encounters, not verified multiperson Circles.

**Plan:** identify the founder's existing hybrid service screen/route; run a fictional multiperson privacy and media acceptance on the isolated service; reuse it if it passes. Treat a conventional external meeting link as a fallback **only if** the existing Soullab service does not yet meet the intended standard. Never advertise a stronger sovereign capability than has been demonstrated.

Before sending an invitation, the host should demonstrate that an invited person can join, a stranger cannot, recording/AI notes are off, a participant can stay camera-off and leave, and the host can close access. The consent notice must accurately describe names, microphones, cameras, chat and provider retention. The Circle remains educational and nonclinical; no AI transcription, diagnosis or re-use of participant stories.

### Hybrid later: the standard

For a local gathering with remote participants, plan for **two stewards**—one physically holding the venue, another listening for remote voices. The remote participant must be able to ask questions, be heard by the physical room, choose camera-off and exit safely. The physical participants must know who can hear them and whether their image/voice is transmitted. Test echo cancellation, microphones, framing, accessibility and a fallback to online-only. Do not merge hybrid attendance into consent originally granted for an online event.

### What is prepared

- [Full Stage G roadmap](./STAGE-G_ONLINE-FIRST_TO-HYBRID_GATHERINGS-CANDIDATE_20261017.md)
- [Online and hybrid consent/permission contract](./STAGE-G_ONLINE-TO-HYBRID_DELIVERY-CONTRACT_CANDIDATE_20261017.json)
- [75-minute first Circle guide](./STAGE-F_FIRST-GATHERING_FACILITATOR-KIT_CANDIDATE_20261017.md)
- [Unsent online invitation and entry notice](./STAGE-F_FIRST-GATHERING_INVITATION-AND-CONSENT_CANDIDATE_20261017.md)
- **Default-off founder preview:** an interactive comparison of online first vs hybrid later, with no real meeting or participant data.

### The next small decision

**Which screen/route is the on-platform hybrid service you have already built?** We will verify that exact room with fictional participants, instead of selecting an outside service by default.

No purchase or meeting is needed to make that choice. We will then verify the provider's real settings and invite/exit behavior with test identities before choosing a date or communicating with any participant.

The first Circle may be founder-hosted without Glenn Perry; he remains an **unaffiliated referenced author** and will only become a participant through your separate invitation and his affirmative agreement.

---

Research-stage founder brief. No launch, third-party license, event creation, member recruitment or source-corpus use is authorized.
