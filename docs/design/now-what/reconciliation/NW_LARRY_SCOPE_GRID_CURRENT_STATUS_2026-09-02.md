# Larry Scope Grid — Current Implementation Status

**Date:** 2026-09-02 · **Status:** EVIDENCE ONLY. Not a design doctrine unit; not a JARVIS-numbered
unit. Not authorized to settle IA, naming, or hierarchy questions.
**Method:** NW-D00 as prior authority → current-trunk verification → Larry-facing status.
Where NW-D00 already ruled a finding, it is cited, not re-derived. Where NW-D00's own stated scope
(`app/now-what`, `components/now-what`, `lib/nowWhat`, `app/api/now-what`) didn't reach a surface —
notably the entire practitioner `/studio` side — this document supplies fresh, dated verification.
**Referent:** `origin/clean-main-no-secrets`, `2f8d97297`, 2026-09-02. NW-D00 was conducted
2026-08-26 against a different environment state; **no NW-D00 status is copied forward without
re-checking it against current trunk.**
**Purpose:** answers a different question than NW-D00. NW-D00 asks *"what is this product?"* This
asks, row by row against Larry's own scope document: *if Larry says YES here, are we retaining
something live, completing something partial, or commissioning something new?*
**What happens next:** Larry marks YES / NO / MAYBE against this evidence. His answers become
product authority and enter the master programme through the governed sequence — this document
does not pre-decide them.

---

## Your Clients

| FUNCTION | SIMPLE VERSION | LIVE TODAY | YOUR CHOICE |
|---|---|---|---|
| **Home** | Program, next session, what needs attention | ✅ **LIVE** — client Home and return experience are working (`ClientHome.tsx`, PR #1145) | YES / NO / MAYBE |
| **My Program** | What they're doing with you + materials | ⚠️ **PARTIAL** — coaching relationship + program position render; client materials do not | YES / NO / MAYBE |
| **Sessions** | Upcoming/past sessions + preparation | ⚠️ **PARTIAL** — upcoming, prior-session continuity, and a preparation entry exist; recordings/session media do not | YES / NO / MAYBE |
| **Schedule** | Book and manage appointments | ❌ **NOT BUILT FOR CLIENTS** — upcoming appointments can display; nothing lets a client book or manage one | YES / NO / MAYBE |
| **Notes** | Type or upload; simple labels if useful | ⚠️ **PARTIAL** — typed reflection/capture is live; client file upload is not | YES / NO / MAYBE |
| **Messages** | Communicate directly with you | ❌ **NOT BUILT FOR CLIENTS** — NW-D00 F9: gated on the encrypted lane (`phiAccessors`), disciplined absence, not an oversight | YES / NO / MAYBE |
| **Share with Larry** | Choose exactly what they want you to see | ✅ **LIVE** — explicit, per-item sharing with withdrawal | YES / NO / MAYBE |
| **Resources** | PDFs, slides, worksheets, links | ❌ **NOT SURFACED TO CLIENTS** — NW-D00 F8: no resources/library surface exists; consistent with the door map, correctly absent rather than placeholdered | YES / NO / MAYBE |
| **Virtual Assistant** | Optional between-session help | ✅ **LIVE** — MAIA / The Room | YES / NO / MAYBE |
| **Session Room** | Meet with you | ❌ **NOT CONNECTED ON CLIENT SIDE** — session metadata may label a meeting "video"; no client join path exists | YES / NO / MAYBE |

## Your Side

| FUNCTION | SIMPLE VERSION | LIVE TODAY | YOUR CHOICE |
|---|---|---|---|
| **Today** | Who's coming in + what needs attention | ✅ **LIVE** — `StudioHome`, upcoming bookings | YES / NO / MAYBE |
| **Clients** | Clients and their programs | ✅ **LIVE** — `/studio/clients` | YES / NO / MAYBE |
| **Programs** | Offerings, structure and materials | ✅ **LIVE** — programs can be created, structured, and connected to materials | YES / NO / MAYBE |
| **Schedule** | Calendar and availability | ✅ **LIVE** — `/studio/scheduling` | YES / NO / MAYBE |
| **Sessions** | Prepare and keep up with sessions | ✅ **LIVE** — `/studio/sessions`, including a real practitioner session room (fetches a configured video-room URL) | YES / NO / MAYBE |
| **Communications** | Messages + client-shared material | ⚠️ **PARTIAL** — `/studio/comms` sends outbound SMS only. Its own source states the honest limit: *"there is no inbound message store wired to this surface... sent messages are NOT shown as persisted history"* — content isn't stored, by sovereignty design, not merely unbuilt | YES / NO / MAYBE |
| **Resources** | Share materials with clients | ⚠️ **PARTIAL** — Materials supports real upload and linking (`uploadFile`, program-step attachment); client-facing delivery is the missing half | YES / NO / MAYBE |
| **Client Notes** | Your professional notes | ✅ **LIVE** — `/api/studio/clients/[id]/notes` | YES / NO / MAYBE |
| **My Practice** | Private place to develop your work | ⚠️ **PARTIAL** — a practitioner workspace exists (reachable via `/maia/vision-studio`); the full "private place to develop your work" is not independently re-verified in this pass — flagged, not confirmed | YES / NO / MAYBE |

---

## How to read this

- **✅ LIVE** — the core function works now; a YES here means *keep/show what already exists.*
- **⚠️ PARTIAL** — meaningful infrastructure exists, but not the complete experience Larry
  described; a YES here means *finish something already started.*
- **❌ NOT BUILT / NOT SURFACED** — a YES here is new development scope, not a toggle.

## What this changes about the conversation with Larry

A YES beside Messages is not the same commitment as a YES beside Home. The bounded, genuinely new
scope — client scheduling, real two-way messaging, client-facing resource delivery, client access
to the live session room — is now visible as exactly that: bounded. The expensive underlying
pieces (programs, materials, sessions, client structure, consented sharing, practitioner workspace,
continuity) largely already exist.

## What this document does not do

It does not propose an information architecture, a client-hierarchy, a threshold/arrival design, or
a resource-delivery pattern. Those are IA and design-doctrine questions — governed by
`NOW_WHAT_MASTER_PROGRAMME.md`, downstream of NW-D01/D02, and parked under the anti-drift law until
the Jondi walk completes. This document's only job is to make Larry's YES/NO/MAYBE decision
informed by what is actually true today.
