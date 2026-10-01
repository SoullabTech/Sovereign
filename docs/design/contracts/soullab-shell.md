room: Soullab Shell
human_activity: inhabiting any Soullab room within one coherent visual and platform field

surfaces:
  - app/layout.tsx

change_class: structural
principles:
  - SOULLAB_PLATFORM_IDENTITY_CANON_2026-09-28 — Soullab remains the platform while rooms remain distinct
  - INHABITABLE_ARCHITECTURE_STANDARD — the shared shell frames a room without becoming the room
  - AIN-CABIN-RUNTIME-01 — offline Cabin mode changes transport origin without changing room identity
  - SOULLAB_READABILITY_STANDARD — shared identity and orientation remain legible without adding ambient controls

reference_surfaces:
  - app/house/page.tsx
  - app/maia/page.tsx
  - docs/design/contracts/house-room.md
  - docs/design/contracts/maia-room.md

shared_with_house: Soullab identity, restrained spatial language, common accessibility and platform framing
distinct_to_room: the shell never supplies room-specific semantic content, Work identity, memory, or MAIA interpretation

experience_verification: Offline Cabin packaging was witnessed on a local standalone Next runtime. The root shell metadata uses the loopback Cabin origin in offline builds and the production origin in connected builds. No room navigation or member-facing layout redesign is introduced by this change.

---

# Soullab Shell — Experience Contract

## What this contract governs

The root layout is the common membrane around Soullab rooms. It carries platform identity, accessibility foundations, shared providers, and global metadata.

It is not itself a room and must not become a second navigation system.

## Cabin rule

When the build is explicitly MAIA_CABIN_MODE=offline, URL-bearing metadata resolves against the local Cabin origin rather than soullab.life.

This is transport containment only.

It does not:

- change the visual identity;
- create a second MAIA;
- carry Work or manuscript context;
- grant access;
- alter room-specific meaning.

Connected builds retain the existing production metadata origin.

## Forbidden

- remote metadata roots in an offline Cabin build;
- hidden cloud fallback;
- shell-level semantic interpretation;
- room-specific controls added to the root layout merely because the shell is shared.
