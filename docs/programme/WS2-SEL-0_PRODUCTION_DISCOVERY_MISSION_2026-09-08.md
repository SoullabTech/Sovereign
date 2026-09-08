# SEL-0 — production-store discovery mission · READ-ONLY

**Status**: **NEXT ACT · NOT STARTED.** Blocked on read-only production access.
**For**: a session with Mac Studio / production terminal access. Opening prompt: *"perform SEL-0 production-store discovery read-only; prove the owning store before exporting anything."*
**Governing instrument** (read before acting, do not re-derive): `WS2-DEVELOPMENTAL_INTELLIGENCE_AUDIT_2026-09-08.md` §4 — SEL-0 frozen order, manifests A/B/C, native-field boundary, selection-neutral sort, `N ≥ 40` floor.

> This file exists because the mission was ruled in conversation. A session on another machine reads the repository, not that conversation — the same gap that put the baseline conditions and the SEL-0 blinding order at risk twice before.

---

## Mission

```text
1. DISCOVER the canonical production store
     table / view / runtime object
     writer and reader code paths
     exact fields that constitute an observation

2. PROVE it is the SEL-0 corpus
     not merely something containing "developmental" IDs
     the historical 226 count is CORROBORATION ONLY, never identity

3. SNAPSHOT source state, read-only

4. APPLY F-7 eligibility

5. FREEZE
     A  source manifest
     B  Kelly blind ranking surface   (selection-neutral sort, seed recorded)
     C  MAIA native ranking surface   (config version, payload digests)
     +  separate excluded-set manifest, IDs + explicit F-7 reason

6. REPORT ONLY N

7. STOP
```

### The gate after N

```text
N >= 40   -> freeze the numerical threshold next (step 1 sees N and nothing else)
N <  40   -> STOP. The current top-k instrument may not run, and a weak result
             may not be read as a finding. Redesign required — rank correlation
             over the full set rather than top-k overlap.
```

---

## ⛔ Do not

- **Do not use `voice:memory_selection` because it looks close.** It is the nearest match found by search, which is exactly what makes it the tempting shortcut. Every downstream digest would faithfully pin the wrong candidate set.
- **Do not assume `226`.** `N` is whatever survives the read and F-7 exclusion.
- **Do not let the founder inspect the observations during discovery.** He sees the items for the first time at step 2, from Manifest B, after the threshold is frozen.
- **Do not compute any MAIA ranking.**
- **Do not touch F-7 repair, Phase 2, or the manuscript.**
- **No writes. No provider calls. No deploy.**

### Operational consequence of the third rule

Proving the store *requires* inspecting sample content; showing that content to the founder *breaks the blind*. Both are true, so the discovering session must resolve it rather than pick one:

**Report structural evidence — schema, writer/reader code paths, field names, counts, digests. Do not paste observation text into a transcript the founder reads.** Identity of the store is provable from structure and provenance; it does not require displaying the stimulus.

---

## Standing

```text
STEP 1                 CLOSED
VOICE BASELINE         ARTIFACT PINNED · surface deferred to Phase 9
SEL-0 DESIGN           COMPLETE — no further refinement before production evidence
SEL-0 PRODUCTION       NEXT — read-only discovery
MANIFESTS A/B/C        SPECIFIED · NOT FROZEN
MINIMUM N              FROZEN >= 40
THRESHOLD              UNSET
RANKINGS               NOT STARTED
F-7 · PHASE 2          HOLD
PR / MERGE / DEPLOY    NOT AUTHORIZED
```
