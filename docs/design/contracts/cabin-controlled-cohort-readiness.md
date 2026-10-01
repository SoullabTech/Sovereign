---
room: Cabin Controlled-Cohort Readiness
human_activity: preparing a small named tester group to encounter the offline Cabin without turning an unfinished distribution path into an implicit release
surfaces:
  - maia-desktop/
  - lib/cabin/
  - app/cabin/
change_class: architecture
principles:
  - FROZEN_CANDIDATE — the tester artifact is produced from one exact merged SHA
  - CLEAN_ARTIFACT — the packaged build must contain only the witnessed candidate
  - OFFLINE_BOUNDARY — Cabin is exercised through the local loopback runtime, not the public web deployment
  - NAMED_COHORT — external access is granted only to an explicitly named tester set
  - CONSENT_FIRST — tester consent, feedback route, and incident contact precede distribution
  - OBSERVATION_BEFORE_EXPANSION — first cohort is an observation boundary, not permission to broaden release automatically
  - ROLLBACK_READY — the immediately preceding signed artifact remains the rollback target
  - NO_INFERRED_AUTHORITY — a successful local witness does not itself authorize external distribution
reference_surfaces:
  - docs/programme/MAIA-DESKTOP-BETA-01_RELEASE_CANDIDATE_2026-09-16.md
  - docs/programme/MAIA-AIN-INTEGRATION-01R1_TESTER_RELEASE_MANIFEST_2026-09-27.md
  - docs/design/contracts/AIN-CABIN-RUNTIME-01.md
  - docs/design/contracts/cabin-post-return-continuity.md
shared_with_house: explicit member choice, bounded access, truthful release state, and reversible thresholds
distinct_to_room: Cabin cohort readiness governs distribution of the local offline runtime; it does not change Cabin content authority or create a web-hosted Cabin
experience_verification: >-
  2026-10-01 readiness census. H4.2–H4.5 are merged and locally witnessed.
  Public production health is currently 975a208b8 and does not contain the
  H4.5 merge; https://soullab.life/cabin returns 404, consistent with Cabin's
  offline-only boundary. The existing Desktop beta contract still marks named
  external testers NO-GO until Developer ID signing, hardened/notarized/stapled
  artifact acceptance on a clean second Mac, update/rollback ownership, and
  tester consent/feedback/incident contact are ready.
---

# Cabin Controlled-Cohort Readiness — Architecture Contract

## Release law

The next Cabin act is not a web production deployment.

Cabin is an offline local runtime. The public Soullab deployment remains the
connected platform and must not be made to masquerade as Cabin merely to create
a convenient test URL.

The cohort artifact must therefore be a governed Desktop/local-runtime release.

## Required sequence

1. Freeze the exact merged candidate SHA.
2. Verify a clean worktree.
3. Build the packaged Desktop/local-runtime artifact from that SHA.
4. Verify the artifact's runtime marker equals the SHA.
5. Run the governed Desktop package, containment, identity, and Cabin tests.
6. Run the local offline Cabin health and full crossing witness.
7. Complete the Desktop distribution gates:
   - Developer ID Application signing;
   - hardened runtime;
   - notarization;
   - stapling;
   - untouched artifact accepted by Gatekeeper on a clean second Mac;
   - named update channel;
   - named rollback owner.
8. Prepare the named tester cohort.
9. Confirm tester consent, feedback route, and incident contact.
10. Release only that artifact to only that named cohort.
11. Capture metadata-only reports: build SHA, macOS/hardware, route, reproduction,
    expected/observed result, timestamp, diagnostic filename, severity.
12. Any identity, continuity, containment, package-integrity, or data-loss
    failure stops the cohort and triggers rollback assessment.

## What is not authorized by this contract

- public web Cabin;
- member-wide Cabin release;
- silent cohort inference;
- automatic cohort expansion;
- copying member data into the tester artifact;
- production PostgreSQL fallback;
- network dependency in offline mode;
- semantic object carry beyond the governed Cabin crossing;
- new MAIA cognition authority;
- JARVIS authority.

## Current release standing

READINESS CANDIDATE · EXTERNAL COHORT NOT YET AUTHORIZED.

The exact missing gates are distribution/clean-device/consent gates, not another
Cabin context implementation.
