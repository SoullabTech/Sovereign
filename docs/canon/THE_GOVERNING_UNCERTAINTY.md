# The Governing Uncertainty

**Status:** Canon candidate (authored 2026-06-25, Kelly + Claude). **Not ratified.** This doc is at the *intent* stage of maturation — stated as a law, not yet instrumented, not yet validated against a real graduation decision. See §10. Per [The Grammar of Translation](./THE_GRAMMAR_OF_TRANSLATION.md): a principle stops being philosophy when it survives validation with an independent failure, and nothing here has.

**Governs at:** the **Governance** layer (orthogonal; observes all outward layers, participates in none). Per [Architectural Layers and Boundaries](./ARCHITECTURAL_LAYERS_AND_BOUNDARIES.md), this is a meta-governance principle about *how a capability moves through its own lifecycle*, not about runtime behavior.

---

## Thesis

> **Every governed phase is defined by exactly one principal uncertainty. Completing a phase is not "more confidence" — it is the resolution of that uncertainty and the explicit declaration of its successor.**

Field Lab is the first concrete application of this law, not its only one. The law is general; the rest of this document derives Field Lab's membership, lifecycle, and graduation from it, then states the failure tests by which we would know it has drifted.

---

## 1. The principal uncertainty

A governed phase exists to reduce **one** uncertainty. Not several equal ones — one.

A room that enters with a cluster of legitimate questions —

- Does this help?
- Is the framing understandable?
- Is the interaction comfortable?
- Does it create trust?

— has not declared a principal uncertainty; it has declined to. The cost of declining is paid later, when stewardship finds itself explaining every observation after the fact and no observation can falsify anything, because there is always another question the result "really" speaks to.

So each phase declares: **the principal uncertainty this phase exists to reduce is X.** That single act does three things:

1. It makes the phase **falsifiable in a modest sense** — there is a result that would count as *resolved*, and results that would count as *not yet*.
2. It explains why the room exists **independently** rather than folded into another — its principal uncertainty is distinct.
3. It assigns every *other* question a fate (§2).

## 2. The three fates of a question

Singularity is not "ignore the other questions." It is "assign each one a fate." Any question a room raises is exactly one of:

| Fate | Meaning |
|------|---------|
| **Principal-now** | The one uncertainty this phase is governed by. |
| **Contextual evidence** | A question whose answer *bears on* principal-now. It is data, not a second governor. |
| **Principal-later** | A successor uncertainty — handed forward to a future phase by the relay (§3). |

"Resist plural hypotheses" is enforceable in this form and only in this form. "Pick one" by itself is a slogan; "assign each question one of three fates" is a procedure.

## 3. The relay (not the ramp)

Most experimental systems assume **one** uncertainty that monotonically shrinks:

```
uncertainty → less → less → ship        (the ramp)
```

This law proposes instead a **relay**:

```
Question A → resolved → Question B → resolved → Question C → …   (the relay)
```

Every phase has exactly one governing question. When it resolves, governance **deliberately changes the question** rather than pretending the same question continues with more confidence behind it.

**Why the relay is stronger than the ramp:**

- **It prevents answered-question drift.** Organizations routinely keep collecting evidence for a question they have already answered, because no one declared that the governing question had changed. The relay makes that declaration mandatory.
- **It is Goodhart-resistant by construction.** The ramp collapses to "push the one number," because there is one number running the whole lifecycle. The relay has no such number — the *question itself* changes at each baton-pass, so there is nothing stable to optimize end-to-end. (This is the lifecycle-scale form of the Goodhart constraint already named in the epistemic-governance program.)

## 4. The baton-pass is the governance act

The relay's danger is symmetric. The ramp's failure is collecting evidence for an *answered* question. The relay's failure is the mirror image: **resolving the principal uncertainty and sliding into its successor without declaring it** — so the governing question changes while the evidence standard, consent basis, and success criteria shift silently underneath.

Therefore the rule is not only "one uncertainty per phase." It is:

> **Phase transitions are declared, not inferred.** The baton-pass is the governance event.

Two riders:

- **Evidence is indexed to the uncertainty that governed when it was collected.** It does not auto-carry across a baton-pass. Reusing Question-A-era evidence for Question B requires re-justification — the same discipline as the **Independence Contract** in [The Grammar of Translation](./THE_GRAMMAR_OF_TRANSLATION.md) (returning evidence strengthens a hypothesis only if independent of the act that produced it). Laundering evidence across a phase boundary is a defect.
- **Revising the principal uncertainty mid-phase is itself a declared, audited re-admission** — never a silent swap. Otherwise "we found a more interesting question" becomes the mechanism by which a phase never ends. Singular at any moment, correction permitted, but the swap is a visible event that resets the falsifiability clock.

## 5. Three liveness axes (why "Cat 6" strained)

The platform's working typology (Cat 1–6) is a single ordinal ladder. That ladder is a **projection of three independent axes** onto one line, which is why a surface like the Relational Navigation Room could be "Cat 6" *and* in observation phase and have it read as a category error. It was not an error; the projection fuses things that are distinct:

- **Technical:** absent → implemented → deployed
- **Access:** ungated → entitled → universal
- **Epistemic:** unobserved → observed → ratified

The axes are not fully independent — they have a **dependency, not an identity**:

> **Technical liveness is necessary but not sufficient for epistemic liveness.** You cannot ratify what does not run, or observe what no one can reach.

So the legal states include *technically-live + epistemically-provisional* (Field Lab), *technically-live + epistemically-ratified* (`/maia`), and *technically-absent + nothing-yet* (docs/architecture) — but never *technically-absent + ratified*. The non-collapse has a direction. Keeping these axes separate is the vocabulary that dissolves the anomaly: **a room can be fully live in code and still epistemically provisional, and that is not a contradiction — it is exactly what Field Lab is for.**

---

## 6. First application: Field Lab membership

Field Lab is the phase whose principal uncertainty is, for every room it holds:

> **"Does this room actually help — in a way only member contact can answer?"**

A surface **belongs in Field Lab** when, and only when:

1. **It declares one contact-reducible principal uncertainty** (§1–§2). Not several; one.
2. **Solitary refinement *on that uncertainty* is exhausted.** The next progress on the principal question depends primarily on observing real human use. Accessibility defects, broken copy, an obvious interaction failure, a missing conceptual step — these are desk-reducible and must be spent *before* the shelf. Secondary polish may remain; what must be exhausted is desk-work on the load-bearing question. The test is a counterfactual: *is there any solitary action that would meaningfully reduce the principal uncertainty?* If yes, do it first.
3. **It is walkable in the strong sense — capable of producing evidence about that uncertainty.** "Walkable" is not "the page renders." A page whose essential interaction is stubbed is walkable-as-UI and mute-as-evidence. Worse, a page instrumented for *usage* (clicks, dwell) rather than for the *hypothesis* satisfies "produces evidence" while producing none that bears on the question — the observation/engagement inversion the index page already forbids, surfacing one layer earlier. So each room owes, before the shelf: **a declaration of what observation would bear on its uncertainty.**
4. **It holds the observation-only posture** — no persistence, no efficacy claim, observation brought to the stewardship team, not harvested as engagement.

The negative-form invariants in [`app/maia/field-lab/page.tsx`](../../app/maia/field-lab/page.tsx) are this membership rule stated as prohibitions: Field Lab is **not** a beta-features showcase, a power-user unlock, a preview pipeline, or anything optimized for tester conversion, return rate, or uptake. The shelf "only reflects what is genuinely walkable, with honest framing about incompleteness." Entitlement is the per-member, tier-independent, consent-granted, reversible `members.tester` flag (see [Stewardship Model](../architecture/STEWARDSHIP_MODEL.md)); the registry [`lib/maia/fieldLab/experiments.ts`](../../lib/maia/fieldLab/experiments.ts) enforces "build the page first — the shelf reflects what is actually walkable."

## 7. The lifecycle and the dwell-state

The relay applied across the whole capability lifecycle:

```
Architecture ──► Implemented ──► Walkable ──► Field Lab
                                                  │  governing uncertainty U1:
                                                  │  "does this help? (contact-reducible)"
                                                  ▼
                                            U1 resolved?
                                                  │ yes  ── exit Field Lab ──►
                                                  ▼
                                        successor blocker present?
                                       ┌──────────┴───────────┐
                                    no │                      │ yes
                                       ▼                      ▼
                                     /maia               D W E L L
                              (U2 already met)     typed by its blocker:
                                                   · governance not authorized
                                                   · operational obligation unmet
                                                   · architectural dependency absent
                                                          │
                                                   blocker resolved ──► /maia
                                                          │
                                          blocker resolution RE-OPENS U1?
                                                          ▼
                                              re-admission to Field Lab
                                              (new declared principal uncertainty)
```

**Dwell is a first-class lifecycle state, not a governance exception.** A room whose principal uncertainty is confirmed but which depends on, say, a persistence layer not yet built should *not* return to Field Lab (its principal uncertainty is resolved; member contact is no longer the reducer) and should *not* ship (a successor condition is unmet). It dwells.

Two disciplines keep dwell from becoming a junk drawer:

- **Dwell is typed by its blocker.** A room is never merely "in dwell"; it is "in dwell, blocked on \<governance | operational | architectural\> condition X." The type is what makes the dwell *exitable* — you know exactly what would release it. A dwell with no nameable blocker is a smell: usually U1 did not actually resolve, or there is a hidden successor uncertainty no one has articulated.
- **Dwell is conditional, not mandatory.** If U1 resolves and no successor blocker exists, the room ships straight through. Dwell exists only when there is a named, tracked, resolvable blocker.

The elegant consequence: **Field Lab stays clean.** It contains exactly one class of object — rooms whose principal uncertainty is still answerable through member contact. Unfinished-but-confirmed things accumulate in **Dwell**, not on the shelf.

## 8. Graduation is two gates

Graduation is not one threshold. It is a relay of two uncertainties that resolve independently:

| | Field Lab exit gate | `/maia` admission gate |
|---|---|---|
| Governing question | **U1:** does this help? | **U2:** can we responsibly operate it? |
| Reducible by | member contact | usually *not* contact — consent, persistence, third-party data, architecture |
| Resolution means | leave the shelf (→ ship or dwell) | assume operational authority, persistence justified, claims authorized |

Admission to Field Lab is one threshold. Graduation is a **sequence**: U1 resolves (exit) → dwell (if blocked) → U2 resolves (ship). Symmetric in spirit to admission, but the exit gate and the ship gate are different gates, and the gap between them is where the hardest governance lives.

## 9. Worked case: Relational Navigation Room

RNR ([`app/maia/field-lab/relational-navigation/page.tsx`](../../app/maia/field-lab/relational-navigation/page.tsx)) is the likely first room to exercise the gap, which makes it the right validation target.

- **Declared principal uncertainty (U1):** *Can MAIA support relational discernment — preparation and integration around important conversations — without becoming an interpretive authority over human relationships?* Contact-reducible: you cannot answer it at the desk.
- **Bearing observation:** what surprised the member, what felt like MAIA overstepping into authority, what subtly pulled toward dependence vs. supported their own discernment. *Not* time-on-page.
- **Why it is correctly in Field Lab though technically live:** it renders and the tester gate works (technically live), but it makes no efficacy claim and persists nothing (epistemically provisional). §5 in one room.
- **Its probable dwell blocker (U2):** suppose observation confirms U1 — RNR genuinely helps. Graduating would want persistence, but persistent *relational* content about third parties is exactly what RNR's own invariants forbid ("no relationships list, dossier, or graph"; "does not carry them in memory across sessions"). So U2 — *can we responsibly operate persistent relational memory?* — may remain open **even after the room is proven to help.** That is an `architectural`/`governance`-typed dwell, possibly a long one. The law's job is to make that state legible instead of forcing a premature ship or a pointless return to the shelf.

## 10. Failure tests (how we would know it has drifted)

Per the charter's own discipline — if applying this ever feels like process for its own sake, it has drifted. Concretely, it has drifted if:

- A room is admitted with **plural co-equal principal uncertainties** (§1).
- Observation is collected that bears on **usage, not the principal uncertainty** (§6.3) — engagement wearing the costume of observation.
- A **phase transition happens without a declared baton-pass** (§4) — the governing question changes and no one marked it.
- **Evidence is carried across a baton-pass without re-justification** (§4) — U1-era data laundered into a U2 claim.
- A room sits in **dwell with no nameable blocker** (§7).
- **Field Lab is used as a parking lot** for confirmed-but-unshippable rooms (they belong in dwell).
- A room's principal uncertainty is **swapped silently** to keep it on the shelf (§4).

## 11. Maturation status (honest)

- **Stratum / category:** a Law (principles stratum).
- **Confidence:** Candidate (Held → **Candidate** → Canon). Authored in one conversation; has not survived edge-case and compositionality testing.
- **Maturation stage:** the baton-pass declaration is now **instrumented** (registry field + validator + proof, below); the relay itself is **not yet exercised** — RNR holds its admission uncertainty with zero declared transitions, so no real pass has been governed. *Instrumented, not validated.* Telemetry would not prove the law; only an independent failure of a real pass would.
- **First validation:** RNR's actual graduation decision (§9) is the first place this law enters validation rather than instrumentation. Entering is not surviving.

**Implementation (2026-06-25):** the declared baton-pass is the `governingUncertainty` field on each experiment — [`lib/maia/fieldLab/governance.ts`](../../lib/maia/fieldLab/governance.ts) (types + `validateGoverningUncertainty`), required on every entry in [`lib/maia/fieldLab/experiments.ts`](../../lib/maia/fieldLab/experiments.ts), enforced by `lib/maia/fieldLab/__tests__/governingUncertainty.test.ts` (runnable mirror: `scripts/repro/governing_uncertainty_proof.mts`, 13/13 green). The validator makes the key rule a structural invariant: a room may not change `current`/state without a transition record naming what it **leaves**, what it **enters**, and what evidence **carries** vs. **must be newly proven**.

**Registry-load enforcement (2026-06-25, ruling):** the shelf reads the registry through [`lib/maia/fieldLab/shelf.ts`](../../lib/maia/fieldLab/shelf.ts) (`getShelfExperiments`), which **excludes** any room whose governing uncertainty does not validate — *better an absent experiment than a falsely governed one.* The exclusion is loud for builders (logged always; thrown in development) but never a member-facing broken UI: the page renders, the invalid room simply does not appear. CI protects the repo; this protects the epistemic surface.

**Open questions:**

1. ~~*Does revision of the principal uncertainty require the same authority as admission?*~~ **Ruled (2026-06-25):** **yes — admission-level by default.** A mid-residence revision can retroactively distort what prior observations were answerable to, so it is not a light editorial change. A future `revisionClass: 'clerical' | 'substantive'` may exempt pure wording fixes (no change in evidentiary target) from re-authorization — but the distinction is **not yet encoded**, and the default must not be weakened until the authority gate exists. (Seam marked in `governance.ts`.)
2. ~~*Who declares the baton-pass, and where is it recorded? At what enforcement level?*~~ **Resolved:** recorded as a `GoverningTransition` in the registry, declared in a PR (version-controlled, reviewable). Enforcement is now wired at the shelf read (above) — not deferred. The remaining latitude is whether to additionally throw at module-load vs. at read; the read-site check was chosen so one malformed room cannot take down the whole shelf.

## Provenance

Authored 2026-06-25 (Kelly + Claude), from a conversation that began with "what belongs in Field Lab?" and converged on a general governance law of which Field Lab is the first application. Siblings: [The Grammar of Translation](./THE_GRAMMAR_OF_TRANSLATION.md) (Independence Contract, maturation ladder), [Architectural Layers and Boundaries](./ARCHITECTURAL_LAYERS_AND_BOUNDARIES.md) (layer-declared governance), [Stewardship Model](../architecture/STEWARDSHIP_MODEL.md) (`members.tester` entitlement).
