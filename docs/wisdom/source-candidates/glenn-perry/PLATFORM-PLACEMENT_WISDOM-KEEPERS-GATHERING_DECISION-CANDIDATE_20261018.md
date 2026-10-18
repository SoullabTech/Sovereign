---
tier: 4
authority: derivative
source_type: research
title: "Wisdom Keepers gatherings — best existing Soullab placement"
author: "Soullab platform route audit for founder review"
version: "0.1"
date_added: "2026-10-18"
status: review
safe_for_retrieval: false
---

# Best place on Soullab: Wisdom → Gather → private Circle → video room

**Founder question:** “Find the best place in platform.”  
**Answer from currently inspected canonical source:** Make the **existing Wisdom Keepers / Wisdom room** the member-facing threshold for live wisdom gatherings. Do not make the practitioner Studio Groups page, a public Events demo, or an unlicensed Glenn Perry Master Field the front door.

The route `/wisdom-keepers/wisdom` already exists, and `lib/house/catalog.ts` places it under **Home → Wisdom**; `app/maia/page.tsx` also directs Wisdom Keepers there. Member experience is already established around “Pathways & Sources,” quotations and MAIA conversations. Add a deliberate **Gather Together** section within this room only after its backed access is ready, rather than inventing a parallel brand/navigation hierarchy. This addition is proposed, **not yet rendered**.

## Routing choices by actual role

| Person or purpose | Best existing path | State and proposed treatment |
| --- | --- | --- |
| Member seeking living wisdom | **Home → Wisdom** `/wisdom-keepers/wisdom` | Existing and House-reachable. Future Gather Together section can show only truthful available gatherings and original source links. |
| Opted-in group relationship and contributions | **Commons → Circles** `/commons/circles/[circleId]` | Existing invitation/membership/consent service is the correct conceptual container; **currently founder-only in both page layout and API**. Do not open to members until named cohort authority and access acceptance are separately approved. |
| Keeper-specific relational home, after that keeper consents | **Master's Field → With Others** `/fields/[field]/with-others` | Existing field registry and human-centered threshold, but `FieldPathwayPage` clearly says mentoring Circles are **coming soon** and routes to MAIA. No automatic membership, meeting or real keeper access. Do not register Glenn Perry without his direct agreement. |
| Human host preparing sessions, logistics and resources | **Studio → Groups / Sessions** `/studio/groups` and Studio meeting-provider wrapper | Existing practitioner-scoped meeting day/time/link, contacts and injected provider adapter. An **operator workspace**, not the member-facing Communion room; its client-group roster must not become a hidden Circle authorization source. |
| Transport for the actual live encounter | Existing LiveKit/WebRTC infrastructure **once tested for multiperson & privacy** | Configured self-hosted SFU and per-session token gates exist, but current Session Room is a **two-person** consent/encounter path. The older Socket.IO video server allows room joins without visible authenticated group consent; its WebRTC client has **one peer connection**. No tested 6–8-person private meeting demonstrated. |
| Public festival or event browsing | `/community/events` / public event API | The community Events page currently contains a hard-coded `UPCOMING_EVENTS` fixture list, while open event registration allows email-only anonymous registration. Do **not** use this page/API as source of truth or private invitation door. |
| Legacy historical “Wisdom Fields” | formerly `/commons/fields` and `/api/wisdom-fields` | The implementation introduced by commit `7819fc6bb4` exists in git history but **these paths are absent from current canonical tree**. Treat it as a recovery reference, not a functioning current route or reason to fork the Circle ontology. |

## Desired member journey, once properly approved

**Home → Wisdom → Gather Together → an invited private Circle → Enter Online Room**

The section under Wisdom has three progressively bounded things, none automatically activated:
1. **Discover the keeper.** The human author is named and linked to their real site/work. Distinguish a simple public reference from a participating keeper. Perry remains **unaffiliated**.
2. **Choose to gather.** A member expresses interest by an explicit current act. Only a truly admitted, membership-scoped Circle may offer a meeting invitation; preview-only offerings must say “not available yet” and never fabricate a date.
3. **Cross the room threshold.** The Circle member receives a session-specific, consent-verified private join through the audited on-platform hybrid/video service. Room authority and media privacy are separately checked; joining a Circle alone is not consent to be recorded or profiled.

When an external teacher becomes a willing partner, their `/fields/{keeper}/with-others` page may host their **own** welcome, teachings and scoped Circles, linked back to the central Wisdom room. This is a hosted pathway within established fields, **not** a new seventh field.

**A human facilitator needs a backstage.** Studio can schedule, curate resources, handle invitations and assess venue readiness, with an explicit service-to-Circle bridge. Do not send members to Studio's practitioner/client workspace or infer that an existing Studio Groups row creates a valid Circle roster.

## Current blockers that must be recorded truthfully

- `app/commons/circles/layout.tsx` calls `requireFounder()`; `lib/circles/circleAccess.ts` also permits only `isFounderMemberId`. The code explicitly says Circle cohort access for ordinary members is future, not authorized. **Never add member IDs to `FOUNDER_MEMBER_IDS` to make a Circle work**—that grants founder-private privileges in unrelated areas.
- `components/masters/FieldPathwayPage.tsx` states “Mentoring circles and practitioner resources coming soon,” so the Master Field “With Others” pathway is a conceptual home, not a complete live event room.
- `app/community/events/page.tsx` is seeded with fixture events. A plausible “Join Event” button does **not** prove a live, controlled Wisdom Circle.
- LiveKit service entries in `docker-compose.production.yml` and token signing code are evidence of **source/infrastructure design**, not direct proof of currently running, production-approved multiperson room with adult attendees.
- Current video client `lib/video/WebRTCManager.ts` has only one `RTCPeerConnection`; the separate `app/video-server/server.js` `join-session` trusts client-supplied IDs in the shown handler. Avoid assigning it to confidential gatherings without independent group authorization/permission checks and a verified multiperson implementation.
- Different field labels have distinct epistemic/consent roles: a Wisdom source, a keeper's hosted presence, a Circle, a Studio client group, an event and a video room are **not interchangeable grants**.
- Previous founder-only Stage B–G research branch is diverged from canonical. **No merge, rebase, protected-code edit or production activation** is authorized by this design decision.

## Minimal implementation outline, separately authorizable

**P0 — Read-only conceptual selection:** founder approves the placement and copy “Gather Together”; record the existing routes and constraints. No site UI or new API.

**P1 — Founder-only preview in Wisdom:** a default-off mock entry in the existing Wisdom room pointing to a fictional gathering journey, with no real Circle membership, join URL or keeper claim. Keep the preexisting founder preview under its own auth/flag rather than sharing founder-only URLs with beta members.

**P2 — Proper Circle cohort authority:** create and test a named, scoped access authority in both API and UI without touching founder privileges; verify founder, invited cohort member, uninvited member, revoked member, Sanctuary, create/invite/join/leave boundaries against disposable accounts.

**P3 — Connect a video room:** bind one session-specific, server-minted invitation/role credential to actual Circle membership and recording consent, using the verified existing hybrid service. Require multiperson video/audio, denied guest, short-lived tokens, host removal/end, mobile/camera-off and honest log policy. Do not reuse unguarded generic Socket.IO session IDs as credentials.

**P4 — Run founder-hosted pilot:** once P2/P3 pass and host/venue, date/time/cost, safety and invitation terms are truthful, receive separate founder authorization for the first *Where Symbols Meet Life* invitations. Glenn Perry is referenced, **not claimed present**.

**P5 — Keeper-hosted field:** only after an identified keeper affirmatively agrees to their own hosting scope, rights, compensation and member entry terms. A public book link is never sufficient for partner status.

**P6 — Hybrid extension:** later, verify local/remote facilitation, audio, camera framing, participant parity and separate hybrid privacy notice; do not inherit online attendee consent into a room with physical audience or cameras.

## The choice

**Choose Wisdom Keepers as the front door, Commons Circle as the relationship container, Studio as human host operations, and the already-built Soullab video/hybrid service as the conditional transport.** Treat keeper-specific “With Others” as a future linked space once the human relationship exists.

That is the shortest path that preserves previous Soullab investments, established meaning/consent boundaries, and the founder's request for a living community rather than an extractive online course or marketplace.

**Standing:** recommendation grounded in source route inspection as of 2026-10-18; not a live browser/production verification, field membership grant or release.
