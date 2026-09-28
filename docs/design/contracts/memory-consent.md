---
room: Memory & Consent
human_activity: deciding what parts of my remembered history MAIA may bring forward into future conversation
surfaces:
  - components/settings/MemoryConsentSection.tsx
change_class: experiential
principles:
  - MAIA_OATH — memory is governed by member agency; recall permission is not inferred from storage
  - INHABITABLE_ARCHITECTURE_STANDARD — consent is expressed in human consequences, not backend memory-layer jargon
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — material crosses facets only through explicit member authority; Journal does not silently become MAIA memory
reference_surfaces:
  - docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md
  - docs/design/contracts/daily-anchor.md
  - app/maia/anchor/history/page.tsx — explicit per-object standing consent expressed as For me only / MAIA may remember this with me
shared_with_house: truthful provenance language, explicit member authority, reversible choices, and no persuasion toward more memory
distinct_to_room: this is an operational sovereignty surface. It separates kinds of recall so a member can allow prior conversations while refusing marked-moment recall, or vice versa, without deleting source material.
screenshot_desktop: docs/design/contracts/screenshots/memory-consent-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/memory-consent-mobile.png
experience_verification: >
  2026-09-26 local 3597 authenticated walk. The first attempt exposed a pre-existing Settings host defect:
  activeSection changed but AnimatePresence mode=wait retained the section list indefinitely and no detail panel mounted.
  Removing only that blocking wait-wrapper restored all Settings detail reachability without changing section structure.
  A fresh walk then rendered Memory & Consent with two independent real server-backed switches: Conversational recall
  and Remembered moments. GET /api/members/recall-preferences returned both conversational_recall_enabled and
  episodic_recall_enabled. The panel states explicitly that Journal entries are not added to remembered moments
  automatically. Desktop and narrow-window screenshots were captured from the working surface.
---

# Memory & Consent — Experience Contract

## What this room is for

A member deciding what remembered material MAIA may bring forward into future conversation. Storing something, keeping something, and allowing it to return are distinct acts. The interface must preserve those distinctions.

## Arrival

> **Memory & Consent**

> Control how MAIA may bring forward what it has recorded about your past sessions.

## Current recall choices

- **Conversational recall** — whether prior exchanges may enter future prompts.
- **Remembered moments** — whether moments the member explicitly marked may enter future prompts.

These permissions are independent. Turning recall off does not delete the underlying source material.

## Governing distinctions

> **Writing something is not consent to convert it into memory.**

> **Marking something as memory is not the same consent as allowing it to resurface.**

Journal therefore does not auto-create episodic memory. Member-marked moments retain their separate provenance and the member can independently disable their recall.

## Forbidden here

- bundling all memory layers behind one vague master toggle
- implying storage permission automatically grants recall permission
- silently converting Journal, Reflection, Anchor, or another facet into MAIA memory
- persuasive copy encouraging the member to enable more recall
- reporting a preference as changed when the server did not record it

## The two brand tests

**Same house?** Yes. Consent choices speak in consequences the member can understand and preserve the same sovereignty rules governing Anchor and explicit facet crossings.

**Distinct room?** Yes. This is not contemplation or content creation; it is where the member governs how continuity may operate across time.
