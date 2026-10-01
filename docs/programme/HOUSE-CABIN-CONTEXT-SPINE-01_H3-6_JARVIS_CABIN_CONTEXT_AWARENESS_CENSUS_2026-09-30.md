# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.6 — JARVIS Cabin Context Awareness Census

## Gate question

Can JARVIS observe the existence and custody posture of the local Cabin Context
Package without acquiring authority to export, import, read member content, or
alter the package?

## Ruling

Yes.

The first JARVIS integration should be **read-only awareness**, not action.

This respects O0:

> JARVIS manages complexity. The operator governs consequence.

H3.6 therefore adds no new IPC channel and no new mutation capability.

It extends the existing read-only `jarvis:status` observation with a bounded
`cabin_context` state.

## Input boundary

JARVIS receives the artifact location only from:

```
JARVIS_CABIN_CONTEXT_PACKAGE_PATH
```

The value is not supplied by the renderer.

No path argument crosses IPC.

No automatic path discovery is introduced.

If the variable is absent, JARVIS reports `NOT_CONFIGURED`.

## Observation boundary

JARVIS may observe:

- configured artifact path;
- existence;
- byte count;
- modification time;
- SHA-256 of the artifact bytes;
- whether the bytes are valid JSON;
- whether the top-level schema identifier is the governed Cabin package schema.

JARVIS does not observe:

- Work titles;
- manuscript names;
- relationship names;
- memory titles or bodies;
- member identity;
- package contents;
- semantic meaning.

Full H2.5 custody remains the Cabin runtime's authority.

## State vocabulary

- `NOT_CONFIGURED`
- `MISSING`
- `PRESENT_UNVERIFIED`
- `MALFORMED_JSON`
- `WRONG_SCHEMA`

`PRESENT_UNVERIFIED` is deliberately not `VALID`.

JARVIS does not duplicate the H2.5 parser.

## Falsifiers

### F1 — content leakage

JARVIS status contains member-facing package content.

### F2 — renderer path authority

A renderer-supplied path reaches the status observer.

### F3 — filesystem mutation

The observer writes, deletes, renames, watches, or modifies the artifact.

### F4 — schema authority duplication

JARVIS claims full package validity without invoking H2.5.

### F5 — network leakage

The observer reaches any network endpoint.

### F6 — identity leakage

Member/session identity appears in the observation.

### F7 — automatic behavior

The observer schedules, watches, imports, exports, or remounts.

### F8 — new IPC authority

A new renderer channel is introduced merely to expose this read-only state.

## Acceptance

H3.6 passes when the existing `jarvis:status` surface can truthfully report
Cabin artifact posture while remaining read-only and content-free.

## Implementation witness

Implemented as:

- `jarvis-desktop/src/cabin-context-status.js`
- `jarvis-desktop/src/main.js`
- `jarvis-desktop/test/cabin-context-status.test.mjs`
- `jarvis-desktop/test/cabin-context-main-wiring.test.mjs`
- `docs/design/contracts/jarvis-cabin-context-awareness.md`

The existing `jarvis:status` surface now reports `cabin_context` without
adding a preload channel.

Focused H3.6 suite: **10/10 PASS**.

JARVIS constitutional regression run:

- O0: **14/14 PASS**
- O1: **16/16 PASS**
- O2: **25/25 PASS**
- O3: **35/35 PASS**
- operator flow/work-unit regression: **15/15 PASS**
- H3.6 + operator integration witness: **134/134 PASS**

Full `jarvis-desktop/test/*.mjs` is **352/367 PASS, 6 FAIL, 9 SKIP**. The
six failures are pre-existing substrate failures in the bound checkout:
two JOP-00 negative controls expect an older refusal vocabulary, two R5B tests
require `scripts/builder/work-unit.mjs`, and two Work Unit control tests
require `scripts/builder/opencode-provider.mjs`. None references the H3.6
files or the `jarvis:status` observation seam.

Project design canon: **PASS**.

Project typehealth remains **223 errors vs 239 baseline**, with the same
unrelated Stripe diagnostic at `lib/stripe/config.ts:23`; no H3.6 diagnostic
is reported.

**H3.6 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

## Stop boundary

Do not add:

- export invocation;
- import invocation;
- sync;
- UI;
- MAIA cognition;
- Grokker ingestion;
- Question/Transition;
- production deployment.

The next consequential JARVIS act remains a separate operator-authority
decision.
