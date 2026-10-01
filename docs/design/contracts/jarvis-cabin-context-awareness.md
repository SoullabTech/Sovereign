---
room: JARVIS Cabin Context Awareness
human_activity: seeing whether the sovereign Cabin continuity artifact exists and what custody posture it has, without opening its contents to JARVIS

surfaces:
  - jarvis-desktop/src/cabin-context-status.js
  - jarvis-desktop/src/main.js
  - jarvis-desktop/test/cabin-context-status.test.mjs

change_class: architecture

principles:
  - OBSERVATION_ONLY — JARVIS observes artifact posture, not member content
  - H2_5_REMAINS_AUTHORITY — presence/schema observation is not package validation
  - NO_NEW_IPC — existing jarvis:status remains the read-only transport
  - EXPLICIT_PATH — artifact location is supplied only by an explicit host environment binding
  - NO_STEALTH_ACTION — observation cannot export, import, sync, or remount

reference_surfaces:
  - docs/design/contracts/cabin-context-package.md
  - docs/design/contracts/cabin-context-mount.md
  - docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O0_OPERATOR_CONSTITUTION_2026-09-21.md

shared_with_house: truthful state, bounded observation, provenance, and refusal to infer hidden continuity
distinct_to_room: this is JARVIS's read-only awareness of the portable Cabin artifact; it is not a cognition context feed and not an action surface

experience_verification: >-
  H3.6 uses the existing jarvis:status channel and returns only artifact
  custody metadata. No package content or member identity is exposed. Full
  H2.5 validation remains in the Cabin runtime.
---

# JARVIS Cabin Context Awareness — Architecture Contract

## Why awareness comes before action

JARVIS should first be able to say:

> The Cabin context artifact is present, and here is its custody posture.

It should not yet say:

> I can export or import your Cabin context.

That second statement is a consequential action boundary and requires its own
operator ruling.

## Observation

The observer returns metadata only:

- state;
- absolute artifact path;
- bytes;
- modification time;
- SHA-256;
- schema identifier when readable.

No package object crosses into JARVIS.

## H2.5 remains authoritative

`PRESENT_UNVERIFIED` means:

> The artifact exists and names the expected package schema, but JARVIS has
> deliberately not duplicated H2.5 validation.

This avoids creating a parallel Cabin parser inside JARVIS.

## Renderer boundary

No new preload channel is added.

The existing `jarvis:status` observation remains the sole transport.

The renderer cannot supply or override the package path.

## Stop boundary

No export, import, sync, remount, cognition, or UI behavior is introduced.
