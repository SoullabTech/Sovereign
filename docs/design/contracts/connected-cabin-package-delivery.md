---
room: Connected Cabin Package Delivery
human_activity: explicitly carrying a selected continuity envelope from the connected Soullab environment onto the member's local machine

surfaces:
  - app/api/cabin/export/route.ts
  - app/api/cabin/export/__tests__/route.test.ts

change_class: architecture

principles:
  - MEMBER_AUTHORITY — identity comes from the authenticated member session
  - EXPLICIT_SELECTION — the request names exactly what the member chose
  - H3_4_ASSEMBLY — source selection and ownership remain in the connected assembler
  - H3_5_WRITER — artifact creation remains in the single governed writer
  - TEMPORARY_SERVER_CUSTODY — the connected server holds the artifact only long enough to deliver it
  - NO_JARVIS_AUTHORITY — JARVIS observes the local result but does not own connected export
  - NO_SYNC — delivery is a one-time explicit transfer, not synchronization

reference_surfaces:
  - docs/design/contracts/cabin-connected-export-assembly.md
  - docs/design/contracts/cabin-explicit-connected-export.md
  - docs/design/contracts/cabin-context-export.md
  - docs/design/contracts/jarvis-cabin-context-awareness.md

shared_with_house: explicit member choice, authenticated identity, bounded context, and truthful return
distinct_to_room: this is the connected-to-local delivery membrane; it is not a source store, runtime mount, or JARVIS action
---

# Connected Cabin Package Delivery — Architecture Contract

## Request

The member's authenticated connected session invokes:

    POST /api/cabin/export

with:

    {
      workIds: string[],
      relationshipIds: string[],
      memoryIds: string[]
    }

No member identity travels in the request body.

## Pipeline

    authenticated member
            ↓
      explicit selection
            ↓
           H3.4
            ↓
           H3.5
            ↓
    temporary context-package.json
            ↓
        HTTP attachment
            ↓
       member's machine

## Why HTTP is transport, not authority

The route does not interpret the package.

It does not decide what should be carried.

It does not expose source rows.

It simply delivers the exact governed artifact produced by H3.5.

## Server custody

The temporary artifact is removed after its bytes have been read for the response.

The route never writes a permanent Cabin copy on the connected server.

## JARVIS boundary

JARVIS is deliberately absent from this act.

Its local role remains H3.6 observation.

A future operator action can be considered separately, but it cannot acquire connected member identity or selection merely because export exists.
