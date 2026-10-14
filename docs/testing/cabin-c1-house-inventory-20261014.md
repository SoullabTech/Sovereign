# Cabin C1 — House and local identity inventory

JARVIS work unit: v2-cabin-sovereign-soullab-home-c1-ho-mv8g0yml.
This is evidence gathered in the founder-directed foreground conversation. The canonical work unit remains AUTHORIZED with execution disconnected; no autonomous worker execution, lifecycle completion or independent acceptance is asserted.

## Verified installed baseline

Cabin 0.2.1 implements local text conversation and writing with 20 MiB text import. Source baseline: 85b1df53ef. Full online MAIA orchestration and other rooms are not installed.

## Code inventory and next integration

| Area | Actual code | Present capacity | Next local integration |
| --- | --- | --- | --- |
| House | app/house/page.tsx; app/house/HousePreferences.tsx | Existing offline branches read local identity, Works and House preferences | Connect House to the standalone desktop runtime; preserve the established room meanings and return path |
| Room catalogue | lib/house/catalog.ts | Canonical room labels, purposes, groups and defaults | Reuse labels; compute availability from implemented local routes rather than treating every catalogue item as operational |
| Identity | lib/cabin/localStore.ts, ensureLocalMember | One durable SQLite identity; existing identity is reused | Display the local identity in House without inventing cloud-account linkage |
| Local sessions | lib/cabin/request.ts; apps/cabin-desktop/main.cjs and runtime.ts | Next Cabin uses local session cookies; standalone uses per-launch capability access plus SQLite owner authority | Keep the serving runtime as identity authority; do not accept member IDs from the browser or assume the two cookie schemes are interchangeable |
| Preferences | app/api/house/preferences/route.ts; CabinLocalStore readHousePreferences/saveHousePreferences | Existing offline preference read/write and revision conflicts | Reuse the existing schema and validate eligible catalogue IDs through the established preferences contract |
| Writing continuity | lib/house/houseCabinContext.ts | Explicit Work identity crossing; no private content or inferred meaning in URLs | Preserve explicit Work-to-manuscript resolution; distinguish a Work from a manuscript |
| Writing and MAIA | apps/cabin-desktop/runtime.ts; workspace.html/workspace.js | Installed bounded text workspace | Reach the working workspace from House with a clear return-home action; keep current conversation and saved manuscript intact |
| Journal | app/api/journal/quick/list/route.ts; app/api/journal/reflect/route.ts | These routes use PostgreSQL; not part of the installed local runtime | Map journal record and privacy contracts before a local persistence adapter |
| Dream | app/api/dreams/route.ts; app/api/dreams/canonical/[id]/route.ts | PostgreSQL dependencies; not locally connected | Preserve seven-state encounter and member-owned meaning; local storage before interpretation features |
| Astrology | app/api/astrology/geocode/route.ts; reflection, narrative and report routes | Geocoding makes a remote request; sampled persistence routes use PostgreSQL | Local place/timezone and calculation dependencies, then private chart storage and explicit sharing |
| Voice | app/api/voice/local-tts/route.ts; app/api/voice/transcribe/route.ts | Local-TTS source exists; actual offline voice path is not qualified in this app | Inventory model/service/audio dependencies and test the real path before advertising voice |

## Smallest useful House candidate

1. A forest-green home using the actual catalogue labels and meanings.
2. Durable local identity and existing House preferences.
3. Working doors to writing and local MAIA text conversation, with return-home navigation.
4. Journal, Dream, Astrology and member connections visibly identified as not connected; no deceptive working links.
5. Fictional-data checks for identity continuity, preference conflicts, room crossing, unsaved writing, selected Work/manuscript ambiguity and restart recovery.

The existing Next House contains offline branches, but the installed standalone runtime does not package that Next application. Merely changing the open URL to /house would therefore fail. The next implementation must connect a real local House surface and serving routes or package the existing full runtime, with acceptance appropriate to the chosen route.

No cloud calls, member data, production changes, deployments or invitations were used for this inventory.

## Readiness usability repair

Cabin 0.2.2 changes the welcome-screen Check readiness action to visibly show checking, completion time and success/failure. A terminated local runtime clears its startup state so the next check can start it again. Actual isolated packaged-window testing passed checking feedback, completion feedback, enabled opening and stopped-runtime restart. This verifies workspace/model availability, not full-platform functionality.
