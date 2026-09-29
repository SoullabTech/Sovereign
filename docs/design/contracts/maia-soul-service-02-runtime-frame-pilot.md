# MAIA-SOUL-SERVICE-02 — First Runtime-Capable Frame / Perspective Slice

**Date:** 29 September 2026
**Status:** LOCAL RUNTIME PILOT
**Production:** closed
**Persistence:** none
**Schema:** unchanged
**Member memory:** none
**Conversation durability:** none
**Relational learning:** none

---

## Purpose

This is the first Soul-Service cognitive act permitted to cross from design prototype into actual model generation.

The runtime grammar is intentionally narrow:

> **source → MAIA possible frame → optional alternative perspective → member accepts / rejects / leaves open → return**

It is governed simultaneously by:

- HUMAN-AI-SOUL-SERVICE-LAW-01
- FRAME-DETECTION-NONDIAGNOSIS-LAW-01
- PERSPECTIVE-MOBILITY-NONSTEERING-LAW-01
- PERSPECTIVE-ANCHOR-PRESERVATION-LAW-01
- LIVING-FIELD-EPISTEMIC-PERCEPTION-LAW-01
- LIVING-FIELD-ARCHITECTURE-01
- LIVING-FIELD-TECHNOLOGY-LAW-01

## Runtime architecture

The pilot uses:

- a dedicated stateless route:
  - `/api/maia/soul-service/frame-pilot`
- local-model generation only;
- a pure prompt / output validator:
  - `lib/maia/soul-service/frameDetection.ts`
- a local founder witness surface:
  - `/dev/maia-soul-service/frame`

It does not call the normal persistence-capable MAIA conversation route.

## Why a dedicated route

The production MAIA route deliberately writes accepted member turns before cognition.

That is correct for ordinary conversation continuity, but incompatible with this pilot's no-persistence boundary.

Therefore the pilot does not borrow ordinary conversation durability and then attempt to suppress it later.

It is stateless by construction.

## Input boundary

The route receives only:

- current source text.

It receives no:

- member ID;
- session ID;
- conversation history;
- memory bundle;
- relational context;
- prior frames;
- durable source references.

## Output boundary

The model may return only:

- one possible current frame;
- one materially distinct alternative frame;
- a short rationale for each;
- one or two explicit unknowns;
- scope = current_question.

## Validation

Generated output is rejected if it:

- uses prohibited diagnostic language;
- fails to remain current-question scoped;
- omits a materially distinct alternative;
- returns incomplete structure.

## Production closure

The route returns 404 whenever `NODE_ENV === 'production'`.

This pilot therefore has no production runtime authority.

## Member ruling

Accept / reject / compare / unresolved state exists only in client React state.

No member ruling is persisted.

## Technology layer

The first runtime slice intentionally uses ordinary semantic DOM and CSS atmosphere.

No advanced rendering technology is introduced yet.

This obeys:

> **Use the newest technology only when it makes an existing experiential law more fully realizable.**

The first question is cognitive truth, not spectacle.

## Exact stop

This pilot may be:

- tested locally;
- exercised against the local model;
- founder-witnessed;
- refined;
- committed to its feature branch.

It may not be:

- merged;
- deployed;
- connected to member memory;
- connected to production conversation;
- made durable;
- used for automatic frame storage;
- used for member scoring;
- used for automatic scaffold fading.

**STOP before merge or production.**
