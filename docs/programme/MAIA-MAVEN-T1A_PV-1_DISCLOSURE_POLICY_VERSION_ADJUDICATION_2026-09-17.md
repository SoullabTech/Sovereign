# MAIA-MAVEN-T1A — PV-1 DISCLOSURE POLICY VERSION ADJUDICATION

**Status:** RATIFIED · `context-disclosure-v2` FOR NEW RECEIPTS · NO BACKFILL · J5-3 MAY OPEN
**Date:** 2026-09-17
**Founder act:** “letx continue” after the proposed PV-1 ruling was presented as the next exact act
**Base:** `a0861ef9a35ce6783e0455941aa41a27b16e5d70`

---

## Ruling

The shared context-disclosure receipt contract advances to:

```text
context-disclosure-v2
```

for all **newly minted** disclosure receipts after this ruling.

Existing `context-disclosure-v1` receipts remain untouched. They are historical evidence and are not migrated, rewritten, or re-labelled.

The version names the **shared receipt contract**, not a feature lane. Writer, developmental-Ask, Personal Keep, and later governed source classes use the same current contract version when minting new receipts.

## Future bump rule

Advance the policy version when either of these changes:

1. the immutable meaning/identity of a receipt; or
2. admitted authority vocabulary that a new receipt may lawfully carry.

Do **not** bump merely for:

- refactors;
- comments/documentation;
- implementation movement that preserves receipt meaning;
- a new caller using already-admitted vocabulary.

## Retry consequence

`policy_version` remains part of immutable receipt identity. A retry reusing an old disclosure id must still match the original row byte-for-contract. An old v1 receipt therefore cannot silently become fresh v2 authority.

## Standing

PV-1 is closed. J5-3 may now implement request authority and per-object receipt orchestration. This ruling does not authorize cognition crossing, receipt confirmation, prompt injection, `/maia` redesign, production migration execution, or continuation.
