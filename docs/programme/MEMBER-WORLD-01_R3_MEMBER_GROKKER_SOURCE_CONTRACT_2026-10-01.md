# MEMBER-WORLD-01 · R3 Member Grokker Source Contract · 2026-10-01

## Purpose

Define what Grokker may retrieve inside a member's World before any model synthesis or cross-context use is permitted.

R3 is a source/consent contract only.

It does not wire Ask Grokker into member data.
It does not call a model.
It does not create memory.
It does not create community or consulting sharing.

## Source classes

### Shared / non-member-private

- House navigation metadata
- shared Library material

These may participate in trace without per-request private-source selection.

### Member-owned personal

- living work
- journal
- reflections

These require explicit member selection for each request.
### Member-owned heightened sensitivity

- relationships
- dreams
- astrology / symbolic chart material

These require:

1. explicit per-request selection;
2. heightened consent for that request.

### Closed in R3

- developmental memory / ambient remembered context

Memory does not become a source merely because the system has it.

## Active influence

Any selected private source is request-scoped.

After the request, active influence must release.

Historical source custody may persist in its rightful room; the Grokker request does not gain continuing jurisdiction over it.
## Synthesis boundary

R3 permits source-policy validation for TRACE only.

All synthesis requests are refused with:

`R3_SYNTHESIS_CLOSED`

until a later act defines:

- synthesis consent;
- interpretation standing;
- contradiction preservation;
- release behavior;
- what may be remembered from a synthesis.

## Cross-context boundary

R3 refuses moving a member Grokker request into:

- community;
- consulting.

with:

`R3_CROSS_CONTEXT_CLOSED`

A future share/consulting grant must be distinct from ordinary World use.
## Laws carried

- SOURCE_STANDING_MUST_SURVIVE
- MEMORY_DOES_NOT_CREATE_PERMISSION
- PRIVATE_CONTEXT_IS_REQUEST_SCOPED
- RELEASE_AFTER_REQUEST
- NO_CROSS_CONTEXT_WITHOUT_SEPARATE_GRANT

## Verification

`npx tsx lib/world/__tests__/memberGrokkerSourceContract.test.ts` — PASS.

The defeat suite proves refusal of:

- unselected journal use;
- relationship use without heightened consent;
- ambient developmental memory;
- synthesis before admission;
- consulting crossing;
- community crossing;
- duplicate-source ambiguity;
- empty-query requests.

## Standing

**R3 SOURCE CONTRACT: ADMITTED AS CODE CONTRACT**

No member Grokker retrieval/runtime is opened by this record.
No merge or deploy is authorized.

## Exact next boundary

**R4 — member Trace runtime design.**

Build read-only retrieval over explicitly admitted source adapters, preserving provenance and standing. Stop before synthesis.