# MAIA-SOUL-SERVICE-02R1 — Living Field Aperture Integration Witness

**Date:** 29 September 2026
**Status:** LOCAL HUMAN / AUTOMATED WITNESS CANDIDATE
**Base:** `62fb763a6d5649518a8f6e43faeb838b85a5b3d3`
**Production:** untouched
**Persistence:** none
**Member data:** none in witness fixture

---

## Runtime movement

The actual `LivingConstellationPanel` now supports the locally enabled movement:

> **field presence → enter → Another perspective → live local MAIA aperture → compare / keep-for-visit / reject / unresolved → return to the same field locus**

The local witness uses synthetic read-only projection data so no member memory is pulled into the experiment.

The aperture route receives only the currently entered source text.

---

## Return-continuity implementation

Before entry the component captures:

- quiet / widened state;
- page scroll position;
- exact opener element identity.

Entry and return use the View Transitions API when available.

Fallback behavior:

- immediate semantic state transition when unsupported;
- immediate semantic state transition when `prefers-reduced-motion: reduce` is active.

After return:

- field topology is restored;
- prior page position is restored;
- focus returns to the exact opener;
- the saved return snapshot is cleared.

---

## Aperture continuity

Aperture state is local to the entered presence.

Leaving the presence unmounts:

- selected MAIA aperture;
- comparison state;
- kept-for-visit lens;
- rejected / unresolved interaction state.

Reopening the same presence begins again from:

> **Another perspective**

No MAIA aperture gains durability through navigation.

---

## Automated contract witness

New focused suites:

> **15 / 15 PASS**

covering:

- stable transition identity;
- View Transition progressive enhancement;
- reduced-motion parity;
- topology capture / restore;
- viewport capture / restore;
- opener-focus restore;
- local-only aperture integration;
- production-closed witness page;
- no local/session storage for aperture state;
- governed aperture runtime boundaries.

Existing Living Field canonical Jest suites:

> **13 / 13 PASS**

covering projection authority and epistemic presentation.

---

## Behavioral browser witness

### Integrated aperture / return run

Observed:

- View Transitions API supported: **yes**
- normal-motion View Transition calls during witness: **4**
- widened topology restored: **yes**
- exact opener focus restored after transition completion: **yes**
- temporary aperture state cleared after leaving presence: **yes**
- reduced-motion View Transition calls: **0**
- page errors: **none**

### Explicit viewport continuity probe

The witness harness introduced an external non-React spacer only to create a known scroll position without altering product UI.

Observed:

- pre-entry scrollY: **220**
- post-return scrollY: **220**
- delta: **0**
- exact opener focus restored: **yes**
- widened topology restored: **yes**
- View Transition calls: **2**

> **VIEWPORT_CONTINUITY_WITNESS = PASS**

---

## Visual evidence

Captured states include:

- quiet field;
- widened field;
- entry transition;
- settled entered presence;
- live local MAIA aperture;
- aperture comparison;
- settled comparison;
- return to widened field;
- reduced-motion return.

A pre-existing global `Audio enabled` toast may appear in some images. It is outside this candidate.

---

## Typehealth

Project gate standing:

- program files: **4541**
- errors: **223**
- baseline: **239**
- new diagnostics attributable to 02R1: **0**

The sole reported new-gate diagnostic remains unrelated:

`app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx:78 TS2304 Cannot find name 'LARGER'`

The baseline was not updated.

---

## Return law proven in this boundary

> **Return restores the member's prior orientation, not the system's preferred starting state.**

And:

> **Continuity serves truth; continuity does not overrule truth.**

02R1 proves current-navigation continuity only. It grants no durable return-memory authority.

---

## Exact stop

This candidate may be locally founder-witnessed and committed to its feature branch.

It may not be merged, deployed, connected to member memory, connected to ordinary MAIA conversation persistence, used for relation learning, scoring, or automatic scaffold fading.

**STOP before merge or production.**
