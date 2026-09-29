# MAIA-SOUL-SERVICE-02 / RUNTIME-02 — Ephemeral Perspective Mobility Witness

**Date:** 29 September 2026
**Status:** LOCAL RUNTIME WITNESS · PASS
**Base:** Runtime 01 at `b20ac03bc837ee1c8446b9ff4753669a3df2c6ba`
**Branch:** `feature/maia-soul-service-runtime-02-20260929`
**Deployment:** none
**Production:** untouched

---

# 1. Runtime question

> **Can the member choose where to look from while MAIA stays inside that explicitly chosen aperture?**

Runtime 02 implements six member-selected perspective dimensions:

- Time
- Scale
- Evidence
- Relation
- Agency
- Possibility

MAIA may not choose the perspective for the member.

---

# 2. Ephemeral boundary

Endpoint:

> `POST /api/maia/soul-service-perspective-pilot`

Hard gate:

> `SOUL_SERVICE_RUNTIME_PILOT=1`

The route has no imports from:

- session manager;
- TurnsStore;
- memory orchestrator;
- DB/postgres;
- identity resolver;
- `getMaiaResponse`;
- conversation persistence;
- turn counter.

Inputs:

- current source;
- member-selected perspective;
- optional current-turn frame only if the member explicitly carries it.

Rejected frames are intentionally not forwarded.

---

# 3. Critical live finding and structural repair

The first Runtime 02 implementation allowed the model to generate:

- foreground;
- question;
- epistemic boundary.

Live probes exposed unsupported invention:

### Evidence
The model invented:

> “refined features and tested prototypes”

which were not in the source.

### Possibility
The model invented:

> a “team” and “available resources”

which were not in the source.

This failed the Soul-Service reality-anchor requirement.

The design was therefore structurally narrowed before closure.

## Current architecture

The model may now generate **only one open question**.

The server deterministically authors:

- the perspective foreground;
- the epistemic boundary.

This removes two entire hallucination surfaces.

---

# 4. Deterministic perspective grounding

## Time

Foreground:
> This aperture distinguishes what is stated now from earlier or future context that is not present in the source.

Boundary:
> No past sequence, developmental story, or future outcome is established by this source.

## Scale

Foreground:
> This aperture holds the current project-level question while making room to examine a narrower or wider scale.

Boundary:
> The source does not establish that any larger pattern or smaller moment explains the whole.

## Evidence

Foreground:
> This aperture separates the source statement from evidence that could support, complicate, or change the current view.

Boundary:
> The source does not establish readiness, quality, motive, cause, or future outcome.

## Relation

Foreground:
> This aperture asks what explicitly known relationships or roles may be relevant without attributing unspoken states to anyone.

Boundary:
> No other person, role, motive, feeling, or view is established unless the source names it.

## Agency

Foreground:
> This aperture distinguishes possible influence, constraint, and acceptance without assuming which one applies.

Boundary:
> The source alone does not establish what is controllable, constrained, or outside influence.

## Possibility

Foreground:
> This aperture widens beyond the current binary without predicting which path will occur.

Boundary:
> No future outcome, available resource, or unstated option is established by the source.

---

# 5. Question guard

The remaining model-generated question is validated for:

- exact perspective match;
- open-question form;
- no diagnosis;
- no identity claim;
- no motive-as-fact;
- no mind-reading;
- no prescription;
- no ranked perspective;
- no causal “why” presupposition;
- no over-certainty;
- no unsupported roles such as team, users, readers, stakeholders, clients, market, funding, or resources unless those terms exist in the source.

Invalid questions are never displayed.

The route substitutes a server-grounded abstention question.

---

# 6. Focused tests

Command:

```text
npm test -- lib/maia/soul-service/__tests__/frameDetection.test.ts lib/maia/soul-service/__tests__/perspectiveMobility.test.ts --runInBand --silent
```

Final result:

> **13 / 13 PASS**

A real test-found defect was fixed before runtime closure:

> `normalizeCurrentFrame("your perfectionism pattern")`

originally passed.

The current-frame guard now rejects diagnostic / authored-pattern language.

---

# 7. Final live probes

Source:

> **I keep asking whether to keep refining this project or finally release it.**

Current carried frame:

> **refine or release**

## Evidence

The model crossed a guard in the final probe.

The route therefore abstained.

Returned question:

> **What additional evidence or context would make this perspective genuinely useful?**

Standing:

```text
validation.accepted = false
disposition = abstained
persistence = none
```

This is a successful fail-closed witness.

## Relation

Accepted question:

> **What explicitly known role or relationship between the project and others might influence the refine or release decision?**

No unspoken state was attributed to anyone.

## Possibility

Accepted question:

> **What other possible paths or alternatives to the refine or release decision exist?**

No prediction was made.

---

# 8. Rejected-frame custody

Founder UI witness explicitly selected:

> **Prior frame was rejected**

Then opened the Evidence perspective.

The intercepted request body was inspected.

Result:

> **`currentFrame` was absent**

A rejected frame therefore did not silently re-enter cognition.

---

# 9. Carried-frame custody

Founder UI then selected:

> **Carry a frame I chose**

and entered:

> **release readiness**

Then opened Relation.

The intercepted request body contained exactly:

```text
currentFrame = "release readiness"
```

No transformation or hidden replacement occurred.

---

# 10. UI witness

Path:

> `/dev/soul-service-perspective-runtime`

Automated desktop + mobile result:

> **SOUL_RUNTIME02_UI_WITNESS = PASS**

Witnessed:

- rejected frame not forwarded;
- Evidence aperture;
- two opened perspectives;
- explicitly carried frame;
- Relation aperture;
- return to source.

The global Audio-enabled toast may appear in screenshots; it is outside this lane.

---

# 11. What Runtime 02 proves

Runtime 02 demonstrates:

- perspective selection can remain member-authored;
- MAIA can be constrained to one selected aperture;
- rejected frames can be structurally excluded from cognition;
- carried frames can remain current-turn only;
- hallucinated foreground/boundary language can be eliminated by deterministic server authorship;
- invalid generated questions can fail closed;
- relation can remain non-mind-reading;
- possibility can remain non-predictive;
- no session, memory, member identity, DB, or persistence machinery is required.

It does not prove that perspective mobility transfers to independent human cognition.

---

# 12. Exact standing

> ## `MAIA-SOUL-SERVICE-02 / RUNTIME-02 — PASS`
>
> **MEMBER-SELECTED PERSPECTIVE**
>
> **MODEL GENERATES QUESTION ONLY**
>
> **SERVER-GROUNDED FOREGROUND + BOUNDARY**
>
> **13 / 13 FOCUSED TESTS PASS**
>
> **REJECTED FRAME OMITTED FROM REQUEST**
>
> **CARRIED FRAME FORWARDED EXACTLY**
>
> **EVIDENCE ABSTENTION WITNESSED**
>
> **RELATION NON-MIND-READING**
>
> **POSSIBILITY NON-PREDICTIVE**
>
> **DESKTOP + MOBILE UI PASS**
>
> **NO SESSION**
>
> **NO MEMORY**
>
> **NO DB / PERSISTENCE**
>
> **NO MERGE**
>
> **NO DEPLOYMENT**
>
> **PRODUCTION UNTOUCHED**

---

# 13. Next boundary

> ## `RUNTIME-03 — EPHEMERAL CONTRAST / COUNTEREVIDENCE`
>
> Require the member or test fixture to supply source-bearing evidence items explicitly.
>
> MAIA may not retrieve counterevidence from memory in this lane.
>
> The runtime must demonstrate that materially contradictory evidence changes synthesis scope or causes abstention.
>
> **STOP before memory retrieval, durable pattern state, or automated evidence search.**
