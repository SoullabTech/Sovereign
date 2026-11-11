# JARVIS Project Protocol — Multi-Model Orchestration and Ship Lane · v0.1 DRAFT

**Status: ADOPTED v0.1 FOR NEW PROJECTS ONLY (founder ruling, 2026-10-30, recorded from the founder's chat reply "Adopt for new").** Not retroactive: existing lanes and programmes are untouched. Adoption makes this text the working protocol for projects opened after this date; it authorizes no implementation, merge, deploy, migration or provider use, and does not lift the §3 hold. Review after the first three closures under it.

*(Superseded wording, kept: "Status: PROPOSAL. Not ratified. Confers no authority.")*

**Original draft note:** it authorizes no implementation, merge, deploy, migration or provider use. It is a thin layer *under* `JARVIS_INSTRUCTIONAL_MANUAL_v1.md` (canonical, 2026-09-17) and ⛔ does not restate or replace it. Where this draft and the manual, a ratified programme law, or a founder ruling disagree, **they govern**.

**Why it exists:** the manual specifies how to *govern* work (orient → census → decide → design → build → verify → merge → deploy → witness → close). It does not say (a) which model does which job when more than one is in use, (b) how externally generated design enters a lane, or (c) what the lightest lawful path is for a small project. The observed failure — design that spirals and rarely reaches deployment — lives in those three gaps.

---

## 1 · Definition of done

> **A project is done when it is witnessed in production, or when it is explicitly STOPPED / PARKED by the founder with the reason recorded.** A design, a spec, a passing test, or a merge is progress, ⛔ never completion.

This is the manual's §17 (*declaration is not liveness*) applied to project accounting. A project that has neither shipped nor been stopped is **open**, and open projects count against the WIP limit (§6).

## 2 · Roles

| Role | Holds | Does | Does not |
|---|---|---|---|
| **Founder** | authority | rules on meaning, priority, tier disputes, merge, deploy, public claims; holds the scope gate | operate gates the system can operate |
| **JARVIS** (orchestrator) | the lane, the record, the next-act statement | opens/closes lanes, recovers state on "continue", reconciles any external proposal against the repo, routes work, keeps the one-page brief current, stops at human boundaries | infer authority; open a second source owner; absorb adjacent defects |
| **Claude Code** (executor/verifier, under JARVIS) | repo access, ability to run gates | census, build the smallest slice, run typecheck/tests/falsifiers, deploy only when authorized, produce witness evidence | treat a design as a spec; call work done on code-read alone |
| **ChatGPT** (divergence only) | no repo custody | early ideation, option framing, naming, rough design, alternative framings, adversarial questions on a *brief* | hold project state; receive repository source or constitutional text (§3); issue instructions that bind a lane |

JARVIS is the single orchestrator. Neither model dispatches the other; **everything passes through the brief and through JARVIS.**

## 3 · Provider boundary (inherits a standing hold)

The 2026-09-20 founder interim ruling (`docs/programme/DEV_LANE_PROVIDER_EXPOSURE_FINDING_2026-09-20.md`) **blocks routing repository source or constitutional text to a Lab-tier provider at development time**, pending a ratified dev-lane governance canon and tier-table classes for those materials. This protocol therefore ⛔ does not lift it.

Consequences, as a working rule until the hold is lifted:

- What may go to ChatGPT: the **Brief** (§5), product-level descriptions in the founder's own words, public material.
- What may not: source files, diffs, migration SQL, canon/constitution text, member data of any kind, credentials.
- A ChatGPT output enters the lane as **text pasted by the founder into the brief's `Proposals` section**, tagged CANDIDATE.

⚠️ Whether past use already conflicts with the hold is **unmeasured** and not asserted either way here.

## 4 · Tiers — pick the lightest lawful path

Heavy gating on small work is itself a spiral source (manual §19: *the smallest number of gates that preserves the important distinctions*).

**Tier S — Ship fast.** All must be true: no schema/migration; no consent, memory, identity or Sanctuary behaviour; no member-facing claim about what MAIA is or does; no new external provider; reversible by one revert/rollback.
Path: Brief → build → verify (typecheck + relevant tests) → merge → deploy via the standard lane → one production witness line → close. Closure record may be a short block, not a document.

**Tier G — Governed.** Anything that fails a Tier S condition, or touches the Co-Lab gate triggers in `CLAUDE.md`. Path: the full manual cycle, charters, falsifiers and founder dockets as the manual specifies.

**Triage:** JARVIS proposes the tier in the Brief and states which condition decides it. **Ambiguity resolves to G.** The founder may override in either direction; a Tier S project that discovers a G condition mid-build **stops and re-tiers** (the change is not finished under S).

## 5 · The Brief (one page; the only artifact that crosses models)

```text
PROJECT:            <name>
TIER:               S | G   (deciding condition: ...)
OUTCOME:            <what a member / the founder can do afterwards that they cannot now>
SMALLEST SLICE:     <the least that delivers the outcome end to end>
OUT OF SCOPE:       <explicit list>
ACCEPTANCE TEST:    <one observable check, runnable; for G: the falsifier>
DONE WHEN:          witnessed in production | explicitly stopped
AUTHORITY NEEDED:   <founder rulings required before BUILD, or "none">
EXISTING LAW:       <canon / ratified docs that bind, by path — names only to outside models>
PROPOSALS:          <pasted external ideas, each tagged CANDIDATE, none binding>
STATE:              DIVERGE | BRIEFED | RECONCILED | BUILDING | VERIFYING | SHIPPED | WITNESSED | CLOSED | PARKED | STOPPED
NEXT ACT:           <one sentence>
CLOCK:              diverge window ends <date/sitting>
```

A project without an Acceptance Test and a Smallest Slice is not briefed and **cannot enter BUILD**.

## 6 · Spiral breakers (stop conditions)

1. **Diverge window is bounded** — one sitting, at most two rounds. At expiry JARVIS asks the founder: *brief it, park it, or kill it.* "Keep exploring" is a fourth answer only if the founder renews the clock explicitly.
2. **WIP limit: one ship-lane open at a time** per owner stream. Opening a second requires parking or closing the first. (Governed investigations that produce no deployable artifact are lanes in their own right and are counted, not exempted.)
3. **Scope can only shrink without a ruling.** Any addition to the Smallest Slice after BRIEFED is a founder act, recorded in the Brief.
4. **No new document without a change in the thing.** A lane may not produce a design/status/governance record whose only effect is to describe the next record. Each BUILD→SHIP interval produces code, a test, or a deploy.
5. **Reconcile before building.** An external proposal is checked against the repo (does it exist, does it conflict, who owns it) *before* BUILD. Result is one of: ALREADY EXISTS · CONFLICTS WITH LAW · FEASIBLE AS SLICE · NEEDS RULING.
6. **A designed capability is never reported as built.** Brief state names the least advanced true state (manual §4, claim discipline).
7. **Staleness:** a project in any state before SHIPPED for more than 14 days without a recorded next act is surfaced by JARVIS for a park/kill/renew decision.

## 7 · Cross-review

- Review packets contain the **artifact and the question, never the author's conclusion** ("find what breaks this", not "confirm this is right").
- ChatGPT may review the *Brief and product-level design*. Review of source/diff stays with Claude-side tools while the §3 hold stands.
- Claude-side review of a ChatGPT proposal is **reconciliation (§6.5)**, with evidence cited from the repo, not agreement.
- Disagreement between models is not resolved by either; it goes to the founder as one question with a recommendation.

## 8 · "Continue" (maps to manual §25)

On "continue", JARVIS recovers state, states the project's `STATE` and `NEXT ACT` in one sentence, executes only that act, and stops at the next human boundary. The Brief is the cockpit for Tier S; the programme cockpit is the cockpit for Tier G.

## 9 · Closure block (Tier S minimum)

```text
project / tier / SHA deployed
what shipped (one line)
witness: <command or observation, with result>
what remains unproved
STATE → CLOSED | PARKED | STOPPED
```
Tier G uses the manual §18 closure record.

---

## Amendment A — Capability roster for additional providers · PROPOSED, ⛔ NOT ADOPTED

Occasioned by the founder's direction (2026-10-30) to integrate other services (Gemini, Perplexity and others) for their distinct strengths. This amendment is a proposal against the adopted v0.1; it takes effect only on a founder ruling.

**A.1 Assign by capability, not by brand.** Roles are stable; providers are *slots* filled by evidence. JARVIS remains the single orchestrator; no provider dispatches another.

| Capability | Job in a project | Slot candidates (⚠️ strengths **unconfirmed**, to be established by trial §A.2) | May receive |
|---|---|---|---|
| Repo-grounded execution + verification | census, build, verify, deploy, witness | Claude Code under JARVIS | repo source (only slot with custody) |
| Divergent design | options, naming, rough design | ChatGPT | Brief (Class 1) |
| Grounded external research | prior art, standards, docs, market facts, with sources | Perplexity-class | research questions (Class 2) |
| Long-context / multimodal synthesis | large public documents, screenshots, recordings | Gemini-class | Brief + public material (Class 0–1) |
| Adversarial review | find what breaks the Brief/design | any provider that did **not** author it | Brief + design artifact (Class 1) |

**A.2 Admission by trial, not reputation.** A provider enters a slot after a bake-off on a real Brief: the same question to the candidates; JARVIS records what each found that the others missed, any error found on verification, and cost in time/effort. The result is written to a roster record. Strengths are never asserted from marketing or from this document's own table.

**A.3 Egress classes (working names; proposal only).** The provider tier table has no class for these materials (see the 2026-09-20 finding), so these labels are ⛔ **not the governance act** and edit nothing.
- **Class 0** — public material.
- **Class 1** — Brief / product-level description in the founder's words.
- **Class 2** — a research question, phrased so that it contains no source, no unreleased specifics beyond what the question strictly needs, and no member data.
- **Class 3** — repository source, diffs, SQL, canon/constitution text, member data, credentials: ⛔ **Claude-side only** while the dev-lane hold stands.

**A.4 Outside output is CANDIDATE.** Research output and its citations are leads, not evidence. Each load-bearing claim is verified against its cited source (by JARVIS/Claude) before it enters a Brief as anything stronger than CANDIDATE. An unverifiable claim is recorded as UNVERIFIED, never silently dropped or silently kept.

**A.5 Consult log and cap.** Every outside consult is logged in the Brief: provider · egress class · the question · result tag. Default cap: **two outside providers per diverge window**, renewable only by the founder. More voices is the cheapest way to restart a spiral.

**A.6 Development lane only.** MAIA's runtime provider rule (Anthropic primary, local fallback, no other cloud AI) and the member-data boundary are untouched. Nothing here admits any of these services into MAIA's runtime or near member data.

**A.7 Before first use of any new provider (unverified, owed):** its data-retention / training terms for the plan actually used, and whether the account is a personal or organizational one. Neither has been checked.

---

## Founder rulings

1. **Adopt this protocol?** ✅ **TAKEN 2026-10-30: adopt v0.1 for new projects only; review after the first three closures; ⛔ no retroactive application to existing lanes.**

Items 2–5 were **not separately answered**. They stand as drafted *because the founder adopted the text as written*, ⛔ not because they were individually ruled; each remains open to amendment at the first review or on request.

### Still open for explicit ruling
2. **Tier S conditions** — are the five right, or is any too loose (e.g. should any new `app/api` route force G)?
3. **WIP limit** — one ship-lane, or one per owner stream? Recommended: one, until a first project closes under the protocol.
4. **ChatGPT scope** — confirm the §3 working rule is the correct reading of the 2026-09-20 hold, or direct otherwise.
5. **Diverge clock** — one sitting / two rounds, or another bound?
6. **Amendment A** — adopt as written? Sub-questions: which providers get slots and accounts · confirm the Class 0–3 working names · confirm the cap of two outside providers per diverge window.

## Not authorized by this draft

Any change to the manual, `CLAUDE.md`, the provider tier table or governance canon · lifting the dev-lane hold · opening a lane · retroactive re-tiering · implementation, merge, deploy or production change · any claim that this protocol governs existing lanes or that Amendment A is adopted.
