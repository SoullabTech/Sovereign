# FOUNDER IMPLEMENTATION DIRECTIVE — WRITER'S STUDIO FULL REDESIGN

**Date:** 2026-09-23  
**Status:** DRAFT FOUNDER IMPLEMENTATION DIRECTIVE · NOT CANONICAL · NOT DEPLOYMENT AUTHORITY  
**Working branch:** `feature/writers-studio-light-shell-20260923`  
**Base:** `e886888416062c7fcbcf899040e3827bc8013835`  
**Draft PR:** #1502

## 0. Why this directive exists

The Writer's Studio work split into three layers that were repeatedly conflated:

1. the approved design images;
2. the written product / trust / interaction canons;
3. the implemented runtime surfaces.

The founder's current instruction is explicit:

> Build the Writer's Studio we designed in the images **and** fulfill the functional agreement in the canons.

A smaller proof host, an older workspace, or a canon-green component subset is **not** fulfillment of this directive.

The target is one coherent Writer's Studio product.

---

# 1. Source-of-truth hierarchy

## 1.1 Visual / composition authority

Use the complete Writer's Studio image set in:

`/Users/soullab/Downloads/Writer's Studio/`

and the archived design references under:

`docs/design/writers-studio/flagship/`

The images govern:

- overall composition;
- visual hierarchy;
- spatial relationships;
- light / warm shell;
- cool blue interaction language;
- literary typography;
- restrained gold;
- density;
- atmosphere;
- panel proportions;
- family resemblance across Home / Write / Develop / Review;
- how the member experiences MAIA in relation to the Work;
- whether the product feels like the approved Writer's Studio rather than an engineering surface.

Do **not** substitute an older dark-rail composition merely because it already exists in code.

Do **not** treat fixture renders from a prior implementation generation as more authoritative than the founder's accepted visual references.

## 1.2 Functional / trust authority

The canon documents govern:

- capability honesty;
- evidence;
- provenance;
- coverage;
- observation truth;
- author intent boundaries;
- reader-effect non-conclusion;
- reading scope;
- commission boundaries;
- exact place / return addresses;
- persistence;
- mutation authority;
- Apply / Undo semantics;
- stale-reading behavior;
- concurrency;
- failure / recovery;
- Sanctuary;
- MAIA scope;
- Guided / Learning / Direct authority invariance;
- privacy;
- beta / release evidence.

Relevant authorities include, at minimum:

- `SOULLAB_WRITERS_STUDIO_FLAGSHIP_EXPERIENCE_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_VISUAL_SYSTEM_CANON_v1.md`
- `FLAGSHIP_VISUAL_CANON_v2.md`
- `FLAGSHIP_INTERACTION_AND_ACCEPTANCE_CONTRACT_v1.md`
- `SOULLAB_WRITERS_STUDIO_MAIA_RELATIONAL_CONVERSATION_AND_FACET_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_WORK_NAVIGATION_AND_DISCOVERY_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_CORE_OBJECT_AND_STATE_MODEL_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_DURABLE_PLACE_AND_OBSERVATION_ADDRESS_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_FAILURE_RECOVERY_AND_CONCURRENCY_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_LANGUAGE_AND_MICROCOPY_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_FIRST_ARRIVAL_AND_ONBOARDING_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_FLAGSHIP_EVIDENCE_AND_READINESS_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_FLAGSHIP_RELEASE_DOCKET_v1.md`
- `CC_HANDOFF_WRITERS_STUDIO_FLAGSHIP_v1.md`

## 1.3 Conflict rule

When an image contains a visually useful representation of a capability that is not yet truthful at runtime:

- preserve the **composition**;
- do not fake the **capability**;
- show an honest unavailable / not-read / not-yet-declared state where required;
- wire the real capability before claiming it is live.

When an older written ruling allowed a different visual composition but the founder's current instruction explicitly chooses the supplied images, the current founder visual instruction governs the presentation **unless doing so would violate truth, privacy, mutation, or safety law**.

No agent may resolve a material conflict silently.

---

# 2. Product target

Writer's Studio is one Work-centered environment with four visible product states:

`Home · Write · Develop · Review`

The persistent visual family is the light-shell Soullab environment visible in the approved design images.

Shared qualities:

- warm, literary, spacious;
- navy / ink serif for Work;
- clean sans for product/system;
- cool lucid blue for active navigation / selection / action;
- restrained gold for warm attention, not ranking;
- soft environmental imagery where appropriate;
- quiet rounded panels;
- Work title always recoverable;
- no dark-tech or engineering-workbench feel;
- no generic SaaS dashboard feel;
- no permanent technical machinery stack.

---

# 3. Required screen family

## A. Home / arrival

Build the approved arrival / Work-recognition composition.

Required semantics:

- recognize the Work;
- show truthful resume state only;
- no fabricated "where you left off";
- first useful action before tutorial;
- Keep writing is always available;
- no fake feature tour.

## B. Write — resting manuscript

Required:

- manuscript is primary;
- Work / chapter identity;
- comfortable literary measure;
- real save state;
- real current version;
- contextual access to Contents / related contextual tools;
- no default analysis dashboard.

The approved image family may show the manuscript rail as a visible navigation/context surface. Its role must remain navigation / orientation, not a competing analysis region.

## C. Write — passage + MAIA

Required:

- exact selected / held locus;
- MAIA joins that locus;
- same Work / chapter / passage identity;
- MAIA opening must not lose the writer's place;
- same conversation seam;
- Discuss / Revise / Teach / Reason belong to one relationship;
- MAIA cannot silently widen reading scope;
- closing and reopening preserves the same relationship.

The image may show the MAIA panel fully open. That is the **open state**, not authority to make MAIA an always-on judge of the manuscript.

## D. Revision loop

Must be one coherent flow:

`hold passage → talk with MAIA → alternatives → Read in context → Apply or Keep original → receipt → Undo / History`

Rules:

- alternatives unranked;
- descriptive labels;
- Keep my original first-class;
- no Apply from alternatives list;
- exact source locus retained;
- stale target refuses unsafe Apply;
- Undo is truthful forward restoration, not history erasure.

## E. Develop — Overview

Build the approved light-shell Develop overview.

Purpose:

> see the Work from another altitude.

Not:

> grade the Work.

Required:

- Work recognition;
- evidence-linked patterns;
- real coverage;
- no invented "health";
- no scorecard meaning disguised as visual polish.

## F. Develop — Structure / Story-Spiral Map

Build the approved map composition, but obey provenance:

- member-declared structure → render as member-declared;
- selected Soullab template → label template choice;
- undeclared structure → honest undeclared / sequence state;
- never infer Spiralogic / elemental structure from prose and present it as the writer's map.

## G. Develop — Themes

Build the approved Themes composition and visual language.

Runtime requirements:

- only real admitted observations / relations;
- evidence for every cross-Work claim;
- coverage visible/reachable;
- return-to-passage for each meaningful object;
- provenance;
- no "stronger/weaker theme" as quality language;
- do not invent Themes results from fixture data.

## H. Develop — Voice

Build the approved Voice composition.

Runtime requirements:

- evidence-linked voice observations;
- no claims of authenticity / quality as facts;
- distinction between measured textual facts and MAIA interpretation;
- exact return paths.

## I. Develop — Continuity

Build the approved Continuity composition.

The map must communicate:

> where something appears

not:

> whether it is good / important / weak / strong.

Every cell / row must preserve provenance and exact navigation.

## J. Reader Perspective

Reader Perspective remains hypothesis-shaped:

> possible reader effects — not predictions.

No reader verdict may be presented as a factual property of the Work.

## K. Review

Review is not a report and not MAIA's judgment.

Required:

- Work remains visually and navigationally present;
- observations/findings in book/page order by default;
- provenance visible;
- exact passage relationship;
- Go to passage;
- Discuss;
- Explore;
- Back to Review;
- stale reading disclosure;
- "What MAIA Read" / coverage;
- same observation identity travels into manuscript;
- Review Discuss R2-2 uses exact durable finding identity.

Do not label generic ranked lists "key" or "most relevant" unless the member explicitly created that ranking or the label describes a literal member-owned category.

## L. Mobile

Mobile is the same product, recomposed:

- no squeezed desktop columns;
- manuscript first;
- MAIA as contextual sheet/card where needed;
- maps/grids scroll rather than crush;
- same semantic navigation names;
- no hover-only critical interaction.

---

# 4. Existing substrate to preserve and reuse

Do not rebuild what has already earned authority.

Preserve and adapt the proven substrate for:

- real manuscript identity;
- real section/chapter identity;
- autosave / save queue;
- version concurrency;
- stale-base protection;
- authored-body editing;
- exact held passage;
- editorial passage relationship;
- R2-2 Review Discuss;
- read-only Review reading identity;
- exact Review → passage return;
- disclosure receipts;
- durable observation identity;
- provider governance;
- Sanctuary behavior;
- deployment provenance.

The new visual shell sits **above** those authorities.

It must not create a second save engine, second observation identity, second conversation store, or second Review ontology.

---

# 5. Largest runtime gaps to close

## Gap 1 — Live Develop

This is the largest product gap.

Do not connect fixture objects and call it live.

Implement a real Develop mapper from governed reading / observation substrate.

For every object shown, the server must know:

- Work;
- reading / source;
- exact evidence;
- coverage;
- provenance;
- doesNotEstablish;
- return address;
- freshness.

If that object cannot be truthfully constructed:

> show an honest state instead of inventing content.

## Gap 2 — Revision loop

Wire the existing visual states to the real authorship substrate.

Required real acts:

- MAIA revision conversation;
- plural proposals;
- read-in-context;
- Apply;
- Undo;
- History.

No proposal becomes authored Work before Apply.

## Gap 3 — Review completeness

Wire:

- member-authored observation;
- stale reading / reread;
- related passage trails;
- observation provenance;
- same finding identity into MAIA conversation.

## Gap 4 — Facets

Guided / Learning / Direct may alter:

- explanation depth;
- terminology;
- teaching detail;
- pacing.

They may not alter:

- observation truth;
- evidence;
- scope;
- number/breadth of proposals;
- mutation authority;
- reading authority.

## Gap 5 — First arrival / Home

Build only from durable facts.

Do not fabricate a continuation or a psychological narrative of what the member was doing.

---

# 6. Implementation sequence for CC

## Stage 1 — visual founder surface

Create an isolated route:

`/writers-studio/flagship-v2`

Purpose:

- render the complete light-shell screen family;
- fixture data allowed;
- no production route replacement;
- no claims that fixture capabilities are live.

Required founder states:

1. Home
2. Write rest
3. Write + MAIA
4. Alternatives
5. Read in context
6. Applied + Undo / History
7. Develop overview
8. Structure / Story-Spiral Map
9. Themes
10. Voice
11. Continuity
12. Reader Perspective
13. Review
14. Review → passage → MAIA → back
15. Mobile equivalents

## Stage 2 — real Write + MAIA under new shell

Move the proven manuscript / save / passage / Discuss substrate beneath the approved shell.

No visual fallback to the older workspace.

## Stage 3 — real Review

Move live reading selection, Review presentation, exact navigation, and R2-2 beneath the approved shell.

## Stage 4 — real Develop

Implement governed Develop data mapping and wire each view one at a time.

No fixture escape hatch in the live route.

## Stage 5 — revision loop

Wire alternatives → context → Apply → Undo / History.

## Stage 6 — member observation + stale reading

Implement only against the governed durable-place / freshness law.

## Stage 7 — facets + arrival

Add only after the underlying acts are truthful.

## Stage 8 — integrated founder + human walk

Only after the whole product is together.

---

# 7. Acceptance protocol

## 7.1 Visual acceptance is side-by-side

For every required screen:

- same viewport;
- same state;
- reference image;
- candidate render;
- exact commit.

Required viewports at minimum:

- 1920
- 1440
- laptop
- ~390 mobile

A machine test does not proxy founder visual judgment.

## 7.2 Functional evidence

For every interactive screen, report separately:

- E0 specified;
- E1 law;
- E2 implemented;
- E3 machine witness;
- E4 rendered;
- E5 human witness;
- E6 founder accepted;
- E7 admitted;
- E8 release candidate;
- E9 deployed;
- E10 post-deploy witnessed.

Never collapse these into "done."

## 7.3 Founder gate

Before replacing the production Writer's Studio route, the founder must be shown the actual integrated candidate and answer:

> **Is this the Writer's Studio we designed?**

Only:

- PASS
- REVISE

No deployment before PASS.

---

# 8. Explicit refusals

CC must refuse to claim completion if:

- it renders the old `RebuildStudioClient` aesthetic;
- it renders the earlier dark-rail flagship in place of the approved light-shell family;
- it ships only Write and calls the Studio complete;
- Develop remains fixture-only;
- a visual card claims data that has no live substrate;
- a Review item cannot return to exact Work evidence;
- MAIA silently rereads / widens scope;
- Apply can target stale prose;
- an observation loses provenance or reading identity;
- mobile is simply compressed desktop;
- a machine gate is used as a substitute for founder visual acceptance.

---

# 9. Current branch boundary

The branch `feature/writers-studio-light-shell-20260923` and PR #1502 are only the first isolated visual surface.

They are **not** the accepted implementation yet.

They must remain draft until:

1. the full image family has been represented;
2. the founder sees the rendered result;
3. named visual revisions are incorporated;
4. live substrate wiring begins as separately witnessed steps.

---

# 10. Definition of fulfillment

This programme is fulfilled when the member can enter the actual light-shell Writer's Studio and, on real Work:

`arrive → write → hold exact passage → MAIA joins → discuss/revise/learn/reason → see governed Develop views → follow an observation → return to exact passage → Review → discuss finding → try a revision → read it in context → apply or keep original → undo/history → continue writing`

with:

- the visual language of the approved images;
- the functional/trust law of the canons;
- the existing proven runtime substrate;
- no substitute workspace standing in for the product.

