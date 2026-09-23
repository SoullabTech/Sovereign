# Provider Governance — V1 Constitutional Defeat-Fixture Compatibility

**Programme:** `PROVIDER-GOVERNANCE`
**Act:** `V1-CONSTITUTIONAL-DEFEAT-FIXTURE-COMPATIBILITY`
**Standing:** CANDIDATE COMPLETE · EXACT RULE-SCOPED COMPATIBILITY REPAIR · STOP AFTER ADMISSION
**Date:** 2026-09-23

## Problem

The versioned provider-governance pre-commit hook correctly scans every tracked source file for new OpenAI surfaces. `JARVIS-VOICE-DOORWAY-01 / V1` intentionally contains a literal `https://api.openai.com/v1/audio/transcriptions` value inside `tests/constitutional/voice-doorway/matrix.mjs` as the hostile input for V-F2: the doorway must refuse a renderer-supplied non-loopback STT endpoint. The provider guard could not distinguish that constitutional defeat fixture from a live provider surface, so every later commit on the lineage was refused.

The blocker is classification, not B4 and not a request to weaken Provider Governance. The V1 fixture is not migration debt and must not be placed under `pending_migration`.

## Repair

`scripts/provider-policy.json` gains `openai_removal.constitutional_defeat_fixtures.entries`. An entry must name an exact file, one or more exact provider-guard rules it is allowed to exercise as hostile input, and an exact source marker.

The first and only admitted entry is:

- file: `tests/constitutional/voice-doorway/matrix.mjs`;
- allowed rule: `openai REST endpoint`;
- marker: `PROVIDER-GOVERNANCE-DEFEAT-FIXTURE: V-F2 hostile non-loopback STT endpoint`;
- evidence: V1 V-F2 / DC-V2.

`scripts/check-provider-governance.ts` validates the class fail-closed:

- constitutional defeat fixtures must live under `tests/constitutional/`;
- the exception is exact-path, never directory-wide;
- each allowed rule must already exist in the provider guard vocabulary;
- a rule marked `forbidden` can never be exempted;
- the source marker must be present in the exact file;
- any hit in the same file outside the declared allowed rule still fails;
- ordinary allowlist/migration-debt behavior is unchanged.

The V1 matrix carries the required marker immediately above the hostile endpoint case. No provider call is added; V1 remains a pure injected test double.

## Defeat evidence on Kelly's Mac Studio

Conforming guard:

`npm run check:no-openai` → PASS, reporting one constitutional defeat fixture admitted by exact path + rule scope + source marker.

V1 matrix:

`node tests/constitutional/voice-doorway/matrix.mjs` → `V1 MATRIX: LETHAL + DISCRIMINATING (exit 0)`.

Adversarial witnesses, each performed by temporary working-tree mutation and then restored:

1. remove the exact source marker while leaving the endpoint literal → **REFUSED**;
2. add `import OpenAI from 'openai'` to the admitted V1 fixture → **REFUSED** because the exception permits only `openai REST endpoint`;
3. place the same OpenAI endpoint literal in unlisted `tests/constitutional/founder-workspace/reference.mjs` → **REFUSED** because the exception is exact-path.

Final restoration: `npm run check:no-openai` → PASS.

The existing `development-provider-governance-proof.mjs` remains the governing proof for capability vocabulary, hold state and repository assignment authority; this repair grants no provider capability and changes no repository-data assignment.

## Boundary

This act does not authorize OpenAI for JARVIS voice, Desktop, runtime, member data, repository source, constitutional canon or browser use. It recognizes one literal provider endpoint as a hostile constitutional test input only. The real JARVIS voice contract remains loopback Whisper + local Kokoro, fail-closed, with no cloud fallback.

**Standing:** COMPATIBILITY CANDIDATE GREEN · PROVIDER GUARD STILL FAIL-CLOSED · NO PROVIDER AUTHORITY GRANTED · READY FOR NORMAL PRE-COMMIT ADMISSION.
