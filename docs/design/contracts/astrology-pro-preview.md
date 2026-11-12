---
room: Astrology Pro — founder-only preview
human_activity: A professional astrologer working with one chart at a time in a dedicated workstation (natal chart, relationships, research and study), as a private founder-only preview that is disabled for everyone else.
surfaces:
  - app/astrology/pro-preview/**
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — a workstation for one chart and one professional's attention, not a member-facing feature
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — calculated chart facts stay distinct from interpretation; the astrologer remains the author
  - MAIA_OATH — no MAIA authority over the reading
  - MARKETING_CLAIM_DISCIPLINE — a preview is not a release; nothing here may be presented as available to members
reference_surfaces:
  - docs/design/contracts/astrology.md
  - docs/design/contracts/astrology-room-experience-architecture.md
shared_with_house: the same chart geometry and calculated facts as the Free Astrology room · human-language section names · provenance-aware labels
distinct_to_room: a dense professional instrument (chart studio, relationships, research and study work areas) rather than a member's reflective room. It exists only when the server runs the founder-only preview and the verified session is the founder's; for every other session the route serves no Pro content.
screenshot_desktop: docs/design/contracts/screenshots/astrology-pro-preview-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/astrology-pro-preview-mobile.png
experience_verification: 2026-10-30 automated witness on the same production build and fictional database. With the founder-only preview flags absent (production-like), /astrology/pro-preview served no Pro content to the would-be founder and /api/astrology/pro/my-chart returned 404; note the page returns HTTP 200 wrapping the not-found page (App Router notFound after streaming), not a true 404. With ASTRO_PRO_PREVIEW_ENABLED=true, ASTRO_PRO_ACCESS_PHASE=founder-only and the fictional founder's id, the founder saw Chart Studio on desktop and phone, labelled 'Professional workspace · Private preview', with 'MAIA Mentor · transfer held'; a non-founder member received no Pro content (again HTTP 200 around not-found). Zero MAIA or conversation requests and zero external requests. Not the founder's experiential acceptance.
---

# Astrology Pro — founder-only preview — Experience Contract

**Scope.** `app/astrology/pro-preview/**`, carried dark with the Free Astrology
reconciliation under founder decision D1 (2026-10-30: ship the founder-only Pro
preview with Free, behind the existing gate).

**This is not a release.** The preview is reachable only when all of the following
hold, and is otherwise absent:

- the server sets `ASTRO_PRO_PREVIEW_ENABLED=true` and `ASTRO_PRO_ACCESS_PHASE=founder-only`;
- `ASTRO_PRO_FOUNDER_MEMBER_ID` names one exact member;
- the verified session is that member's.

The production environment is expected to leave these unset. That must be confirmed
before any deploy (D1).

**Access since 2026-11-10: restricted tester beta (supersedes "founder-only" above as
current fact; the text above is kept as the D1 record).** On founder direction the
production phase is `ASTRO_PRO_ACCESS_PHASE=tester-grant`: the founder plus members
with an audited individual grant (`astro_pro_tester_grant_events`, nine at launch) can
open the room; everyone else still receives no Pro content. It is still not a release,
a tier or an entitlement. Where this contract says "founder" or "non-founder" about
who may enter, read "the founder or a granted tester" and "a member without a grant".
Launch record: #1893.

**MAIA's guidance (2026-11-11).** Inside the room, MAIA is given a source-checked list
of the workstation's controls (`lib/astrology/proGuide.ts`, guarded by a test that every
label appears in this room's source) and told her scope here: astrology, the
workstation itself, and its technical side. She names and locates controls; she cannot
press any of them. Outside the room, MAIA's platform map carries only a short Astrology
Pro entry (`lib/sovereign/platformKnowledge.ts`) and cannot see any chart.

## What this room is for

The founder, working as a professional astrologer, testing a chart-first workstation
before anyone else can see it.

## Arrival

> **Astrology Pro**, with the open chart's name beside it, the house system, the sky now and *Private preview*.

**The cockpit (2026-11-09, founder direction).** The room is one screen, not a page to
scroll. A status bar names the chart, the house system and the sky now. A rail of
nine tools (Chart, Timing, Relationships, Places, Traditions, Readings, Research,
Study, Saved charts) opens and closes panels beside the wheel; the wheel stays in
place. A tool that needs a chart says so in one line instead of showing an empty
block.

**MAIA is a conversation, not a sidebar (2026-11-09, founder direction, after Writer's
Studio's conversation stage).** A bar at the foot of the tools reads "Talk with MAIA
about …". Opening it gives the conversation the whole working area beside the wheel:
what it is about at the top with "Back to the tools", the thread, ways to begin, and
the box to ask at the foot. Follow-ups build on the earlier turns of the visit. Unlike
the Studio, MAIA does not speak first: nothing of a chart goes to MAIA until the
astrologer asks.

Not yet walked by the founder or on a phone. The 2026-10-30 verification above
describes the earlier single-page layout and its screenshots are of that layout.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Open or close a tool | the tool's name on the rail (Chart, Timing, Relationships, Places, Traditions, Readings, Research, Study, Saved charts); keys 1–9 | a professional's working vocabulary |
| Collapse or close an open tool | the chevron and the × on its header | the astrologer arranges the desk |
| Talk with MAIA | "Talk with MAIA about…" at the foot of the tools or on an instrument; key M | a conversation, entered by choice |
| Return to the tools | "Back to the tools"; key M | the conversation is a place, not a trap |
| Ask MAIA to teach | "Mentor" | the technique, with this chart only as the example |
| Ask for more | "In depth"; "Say more"; "Draw on all systems" | depth and breadth are the astrologer's call |
| Bring MAIA's knowledge of me | "Read this with what you know about me" (own chart only, off until chosen in each conversation) | the astrologer chooses it each time; it is never assumed |
| Return to Astrology | "Return to Soullab Astrology" | the Free room stays the home |

## Known wart

The dark and non-founder responses carry HTTP 200 around the not-found page rather than a 404. No Pro content is served. The canonical proxy already returns a hard 404 for the approved-reading review pages for exactly this reason; extending that to this route is a separate change.

## Forbidden here

- any route by which a non-founder session receives Pro content
- presenting the preview as a member feature, tier or entitlement
- MAIA speaking as astrological authority
- sending chart material to MAIA

## Contract drift, for founder ruling

Two lines above, "MAIA speaking as astrological authority" and "sending chart material
to MAIA", predate Ask MAIA inside Pro (founder request 2026-11-07, merged 2026-11-08),
which sends a section's calculated facts to MAIA when the astrologer asks: never a name
or birth details, nothing kept, and MAIA told the chart is symbolic and the astrologer
is the author. The cockpit's dock uses that same route and adds a Mentor mode. The
"Forbidden here" list has not been edited: whether it should now read "sending chart
material to MAIA except as the astrologer's own question, facts only" is the founder's
to rule. The separate hold on transferring a chart into the main MAIA conversation
(R4F, #1817) is untouched; the dock does not use the main conversation or its memory.

## Founder ruling 2026-11-09: MAIA may read the astrologer's own chart with what she knows of them

Ruled in conversation: for the astrologer's **own chart only**, and **chosen each time**,
MAIA may read the chart alongside what the astrologer has chosen to keep with her.

- What is read: the member's kept memory atoms, through the existing loader and its
  consent filters (active, allowed to return, never sacred-protected). Nothing else:
  not prior conversation turns, not system-derived memories.
- Never for a saved (client) chart or a two-chart reading. The server refuses it.
- One direction only. Memory informs the answer; no chart material is written to the
  conversation, to memory or anywhere else. The R4F hold (#1817), which concerns
  chart passages entering the main conversation and being recalled later, is untouched.
- After such an answer the page says how many kept things MAIA read, including zero.

## The two brand tests

**Same house?** Yes: the same chart geometry and calculated facts as the Free room.

**Distinct room?** Yes: a professional instrument, not a reflective room, and unseen
by anyone but the founder.
