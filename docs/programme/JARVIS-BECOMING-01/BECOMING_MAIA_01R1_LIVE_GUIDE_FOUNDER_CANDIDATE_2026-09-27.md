# BECOMING-MAIA-01R1 — Live in-journey MAIA guide founder candidate

**Date:** 27 September 2026
**Exact source:** `abb2fca3aa39e378ec62a4352c52d20f5451c943`
**Branch:** `feature/becoming-maia-guide-20260927`
**Founder preview:** `http://localhost:3798/becoming`
**Bundle SHA-256:** `0951cb6c4435a459529871e745c28e9e83e1cf3a79e1b41a5955e4aa5adb184c`

## Boundary

The journey architecture is frozen. This act changes only the guide layer and the elemental navigation needed to satisfy the accepted facilitation law.

During the Future Self journey, MAIA may occupy the existing companion position after the member explicitly chooses **Journey with MAIA**. The main journey remains unchanged: threshold, present arrival, time opening, encounter, optional dialogue, discernment, explicit Return, optional carry.
## In-journey MAIA law

MAIA receives only the current Becoming journey. The dedicated `/api/maia-guide` seam forces:

- `sanctuary: true`
- `memoryMode: ephemeral`
- empty conversation history
- a distinct explicit `X-Becoming-Guide: 1` act

The proxy rejects guide calls without that header and rejects attempts to submit prior conversation history.

The guide contract instructs MAIA to offer exactly one brief invitation at a time, never impersonate Future Self, never turn imaginal material into prediction, avoid major-life prescriptions, and preserve uncertainty and member authorship.
## Elemental attunement

Earth, Water, Air, Fire, and Aether remain a complete field of perception, but they are no longer a mandatory staircase.

The member can enter through whichever element already feels alive and move among the elements freely. MAIA receives the currently active element and is instructed to deepen it rather than forcing Earth → Water → Air → Fire → Aether.

Aether gathers the whole field and may notice coherence or tension. It does not pronounce revelation, destiny, or objective truth.

The guide does not fire on every keystroke. Once enabled, movement/element changes can invite one new MAIA response. **Ask MAIA to deepen** is an explicit additional act.
## Two MAIA phases remain distinct

**During the journey:** current-journey-only guide; sanctuary + ephemeral; no ambient historical retrieval or retention.

**After Return:** the already-accepted in-field MAIA synthesis/conversation remains a separate explicit continuity-enabled act.

Recording Return ends the live guide phase. No automatic transition into continuity-enabled MAIA is performed.

## Fixed-source verification

Against exact source `abb2fca3aa39e378ec62a4352c52d20f5451c943`:

- strict TypeScript: **PASS**
- Becoming/unit contract suite: **46/46 PASS**
- dedicated live-guide browser witness: **6/6 PASS**
- full Becoming browser regression: **23/23 PASS**
- missing guide-act header: **403**
- attempted guide history smuggling: **400**
- guide upstream witness: `sanctuary=true`, `memoryMode=ephemeral`, `conversationHistory=[]`
- post-Return control: `sanctuary=false`, `memoryMode=continuity`
- automated real provider calls: **0**
## Custody / concurrent lane

This guide act was built in a separate clean worktree from committed source `049fa084d6df594e5c3f50ac4c31d0bd8ab078cf` because the original programme checkout had concurrent uncommitted Across-Time work touching the same UI files.

That concurrent lane was not overwritten, staged, or silently merged.

The next reconciliation must compare this exact guide candidate with the newer Across-Time working lane before either becomes a single release candidate.

## Standing

**LIVE GUIDE IMPLEMENTED LOCALLY · CURRENT-JOURNEY-ONLY COGNITIVE BOUNDARY PROVED · ELEMENTAL PATH NON-LINEAR · POST-RETURN MAIA PRESERVED · FOUNDER LIVE PROVIDER WALK OUTSTANDING · NO CANONICAL MERGE · NO PRODUCTION CHANGE.**

The next human question is narrow:

> Does live MAIA feel like a quiet guide inside the encounter—one invitation at a time—without taking authorship away from the member or flattening the elemental field?
