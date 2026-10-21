# SAFETY-DISCLOSURE-01 · R8 — client_messages Phase 2B Readiness Census

**Date:** 2026-10-01
**Status:** CENSUS · no migration · no PHI write change
**Parent:** R7 Stage A vs Phase 2B Founder Decision Docket

## Question

What does Option B — wait for Phase 2B — actually require for `client_messages`?

## Current standing

**Phase 2B is not ready for `client_messages` on current canonical evidence.**

The repository still declares:

- Free-Text PHI Doctrine: Phase 2A complete; Phase 2B in progress;
- `clientMessages.ts`: Stage A dual-write, plaintext-first read;
- Phase 2B plan: backfill and verification prerequisites remain unchecked;
- no active `prevent_body_plaintext` / `require_body_encrypted` constraint is present for `client_messages`.

## Backfill standing

`scripts/backfill-phi-encryption.ts` includes `client_messages.body` in Wave 1 and supports `--verify`.

No canonical programme/security record found by this census establishes:

- `client_messages` backfill at 100%;
- verification pass against production/current target environment;
- zero rows where plaintext exists but encrypted body is missing;
- soak-period completion.

Therefore the backfill prerequisite remains **unwitnessed**, not presumed failed and not presumed complete.

## Read-path standing

`lib/security/phiAccessors/clientMessages.ts` contains a future `readMessageBodyPreferEncrypted()` helper.

The census found **no live caller** of either `readMessageBodyPreferEncrypted()` or `readMessageBody()` outside the accessor module.

Instead, current live code still selects or consumes plaintext `body` directly in surfaces including:

- portal message history;
- practitioner thread reads;
- practitioner inbox previews;
- practitioner safety-log detail;
- practitioner message listing.

Examples include direct `m.body`, `lm.body`, and `SELECT ... body ... FROM client_messages` usage.

Therefore encrypted-first reads are not yet an application-wide invariant for this table.

## Write-path standing

Current member/practitioner message writes continue to include:

- plaintext `body`;
- encrypted `body_enc`;
- encryption metadata.

This matches sanctioned Stage A dual-write.

Phase 2B would require new writes to set plaintext to NULL or otherwise structurally prevent plaintext values.

## Constraint standing

Current canonical migrations do not actively enforce:

- encrypted body presence for every row;
- plaintext body absence;
- rejection of a plaintext-only write.

The Phase 2B SQL exists as planned/reference steps, not as current structural law.

## Option B implementation sequence

Waiting for Phase 2B is therefore a substantive programme, not a single flag flip.

At minimum it requires:

1. production/current-environment backfill census;
2. verified encryption coverage for `client_messages.body`;
3. migrate all live reads to encrypted-first/only accessors;
4. eliminate direct plaintext previews and safety-detail reads;
5. change all client-message writes to encrypted-only / plaintext NULL;
6. add DB constraints preventing plaintext reintroduction;
7. add CI/runtime falsifiers for direct plaintext reads/writes;
8. soak and verify decrypt behavior;
9. update PHI doctrine/status from Stage A to Phase 2B for this surface.

## Option A consequence clarified

If the Founder chooses bounded Stage A use under R7 Option A, the new safety-contact feature would enter a substrate that is already deliberately dual-write and plaintext-first.

That choice would not make Phase 2B unnecessary. It would create an obligation for the new use to migrate when `client_messages` transitions.

## No inferred recommendation

R8 does not choose A or B.

It exists so the decision compares:

- **A:** earlier bounded functionality on the existing sanctioned-but-transitional Stage A substrate;
- **B:** stronger storage posture first, with a non-trivial read/write/backfill/constraint programme before the feature opens.

## Standing

**PHASE 2B FOR client_messages IS NOT YET WITNESSED READY · DIRECT PLAINTEXT READS REMAIN · PREFER-ENCRYPTED ACCESSOR IS UNMOUNTED · R7 DECISION REMAINS OPEN.**
