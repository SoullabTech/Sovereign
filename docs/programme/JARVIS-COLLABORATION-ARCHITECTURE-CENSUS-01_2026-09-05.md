# JARVIS-COLLABORATION-ARCHITECTURE-CENSUS-01

**Date:** 2026-09-05
**Class:** Read-only census. No implementation plan, no product, no integration, no canon amendment, no new programme lane.
**Authorization:** Founder ruling 2026-09-05 (GO, tightly constrained).
**Occasion:** Airtable's 2026 human–agent collaboration material entered the session as a market artifact. The marketing asset it advertises was examined and **declined** (see §7). What survived is its use as an *external comparator* against which Jarvis's actual architecture can be located.

---

## 1. The question this census answers

Not: *how mature is Jarvis according to a vendor ladder?*

But:

> **What is Jarvis actually capable of, where does authority for those capabilities live, what remains unverified, what has been deliberately refused — and at what points has Soullab already left the conventional agent-autonomy paradigm?**

## 2. Classification vocabulary

Five states. The distinction between `absent` and `unverified` is load-bearing.

| State | Meaning |
|---|---|
| **present** | Capability exists AND named evidence is cited in this document. Confidence is not evidence. |
| **partial** | Capability exists for a bounded scope; the scope is named. |
| **absent** | An *ontological* claim: the capability does not exist. Requires having looked. |
| **unverified** | An *epistemic* claim: this census could not produce named evidence either way. Not a synonym for absent. |
| **deliberately refused** | The capability was available and declined for constitutional reasons. The refusal is the finding. |

**Rule the census obeys about itself:** `present` requires evidence. Where evidence could not be produced within this census's read-only scope, the row says `unverified` and says so plainly. This census must not do to Jarvis what the vendor ladder does to its readers — assert a state the subject did not author.

## 3. Foreign coordinate (comparator only)

Airtable's published progression: **Explore → Assist → Delegate → Supervise → Orchestrate.**

It is recorded here as a *foreign coordinate system*, not a scale Soullab sits on. **There is no sixth rung.** The ladder conflates two variables that this census holds separate:

- **autonomy** — how much an agent may do unattended;
- **maturity** — whether custody, provenance, restraint, human authority, and supersession are sound.

A system can hold high autonomy with poor custody. That is not advanced collaboration; it is **high-powered delegation**. Conversely, withholding autonomy where consequences are poorly observable or boundaries are not architecturally enforceable is an exercise of judgment, not a lag. Airtable's reported "21% allow meaningful autonomy" therefore cannot, by itself, distinguish laggards from well-calibrated organizations. The vendor material runs no failure test on premature autonomy; the cost borne by the other 79% is unpriced.

Airtable's genuinely useful contributions, recorded and closed:

1. External corroboration that the shared-state / agent-sprawl problem Jarvis addresses is real and not idiosyncratic to Soullab.
2. The formulation: *the workflow structure you build today is the infrastructure your agents run on tomorrow.*
3. Its human-in-the-loop principles, one of which Soullab sharpens materially in §5.

## 4. The census

| # | Capability | Governing question | State | Evidence |
|---|---|---|---|---|
| 1 | **Shared operational state** | Is there one recoverable account of current work? | **partial** | 42 records in `docs/programme/*.md` plus the priority thread in `CLAUDE.md`. Recoverable **by a human reading prose**. No machine-readable programme/lane state file exists in the repository — searched, not found. State is authored, not queryable. |
| 2 | **Custody** | Where does canonical authority actually reside? | **partial** | Custody is a worked, named concept at the *source* layer: `docs/programme/WS-01_SOURCE_CUSTODY_UNIT_DEFINITION.md`, `docs/ops/JARVIS_ROUTE_A_CUSTODY_ADOPTION_PROOF_2026-08-11.md`. At the *programme* layer, canonical state is distributed across programme docs, governance docs, `CLAUDE.md`, durable memory, branch names, and the founder. No single writer. **This is the principal finding of the census** (§6). |
| 3 | **Provenance** | Can claims be traced to evidence and origin? | **present** | Immutable-SHA deploy (`docs/ops/IMMUTABLE_SHA_DEPLOY.md`); `GIT_COMMIT` chain Dockerfile ← compose ← deploy with **fail-closed post-swap verify on every path**; `scripts/verify-deploy-provenance.sh`; 29 `scripts/verify-*` gates; `.github/workflows/jarvis-epistemic-guard.yml` adjudicating claim records against a canonical ledger. |
| 4 | **Memory / continuity** | What survives session and model turnover? | **partial** | Live: atoms loader + `is_breakthrough`; Daily Anchor under member standing-consent (refusal **R08**); `member_spiral_state` (Bridge D); Corpus Callosum substrate. 466 migrations. `lib/maia/canonical-turn/` (12 modules) converges authority over composition. Bounded: conversational Phase 2 is branch-only; CMT-01 M3 unauthorized; DEEP tier blocked at `buildComprehensiveVoicePrompt`. |
| 5 | **Delegation** | What may agents actually do? | **partial** | Six bounded agent definitions in `.claude/agents/` (ain-architect, ain-growth, maia-dev, maia-ios, maia-ops, security-auditor). One project skill (`field-study`). Scope is bounded by definition; **breadth is thin relative to the work actually delegated**, which currently runs through general sessions rather than typed roles. |
| 6 | **Constitutional enforcement** | Are boundaries architectural or merely instructed? | **present** | Strongest row. 30 entries in `tests/constitutional/refusal-registry/`; `DEPLOY_LANE_TOKEN` build tripwire (`docs/ops/DEPLOY_LANE_TOKEN.md`) — the retired deploy path *fails at build*, it is not discouraged; `scripts/deploy-lock.sh` kernel `flock`; the **closed** 38-producer registry in `lib/maia/canonical-turn/producerRegistry.ts`; `npm run check:no-supabase`; the `typecheck` no-regression baseline; workflows `covenant-gates`, `sovereignty-gate`, `canonical-pr-quality`, `jarvis-epistemic-guard`. |
| 7 | **Human authority** | Where are decisions reserved upward? | **present** | 36 records in `docs/governance/`, including `FOUNDER_DECISION_DOCKET_2026-07-29.md`, `FOUNDER_RULING_LIVING_SPIRAL_CONTRACT_AMENDMENT_2026-08-16.md`, `PR_1145_CLASS_A_BOOTSTRAP_EXCEPTION_2026-08-28.md`. Acceptance is a founder act; `covenant-gates.yml` enforces it in CI. Reservation is explicit and traceable. |
| 8 | **Observability / witness** | Can action and failure be inspected? | **present** | 29 `verify-*` scripts; `scripts/witness/cmt-01-shadow-witness.ts`, `cc-a-memory-provenance-witness.ts`; the shadow-construction pattern (`lib/maia/canonical-turn/shadow.ts`) emitting per-turn diff without being response-producing; the witness-record genre across `docs/programme/`. Failure is observable *and* a single non-zero shadow line halts the witness for classification rather than being normalized. |
| 9 | **Cross-agent coordination** | Can multiple intelligences act without divergent realities? | **partial** | Structural where it was built: the deploy lane `flock` exists **because** five processes wedged on 2026-07-09 — the file names the incident. Elsewhere coordination is *instructed, not enforced*: "BRANCH FROZEN TO A SINGLE WRITER" is prose in `CLAUDE.md` and the CMT-01 runbook, with no mechanism by which a second session would encounter it. Divergent-reality risk is unmitigated outside the deploy lane. |
| 10 | **Accountable supersession** | Can state, models, claims and decisions be replaced without erasing their history? | **partial / unverified** | Present in specific instruments: append-only revision store with digest-verified historical recovery (`lib/manuscript/development/` — `readState.ts`, `resolve.ts`, `bind.ts`); canon pre-ratification reconciliation (`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION_PRE_RATIFICATION_RECONCILIATION_2026-08-10.md`); `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md`. **Unverified** as a general property: this census found no mechanism guaranteeing that a superseded programme claim retains its authority history. Superseded prose is edited in place. |

### Tally

`present` 4 · `partial` 5 · `partial/unverified` 1 · `absent` 0 · `deliberately refused` 0 (see §7 — refusals in this census's scope are *product* refusals, not capability refusals)

## 5. Where Soullab has already left the paradigm

Three points where Jarvis is not further along the vendor ladder but **orthogonal to it**.

**5.1 — Constitutional boundaries are enforced architecturally, not remembered by intelligence.**
Airtable's fourth human-in-the-loop principle is *"hard-code non-negotiables rather than trusting the model to remember them."* Soullab's version is stronger and has **three independent specimens** (rows 6, 9): a build that dies in under a second; a kernel lock that cannot be left wedged and cannot be forced without detaching itself; a producer registry that is closed rather than conventionally respected. The distinguishing move is that the boundary survives the intelligence being replaced. Recorded here as a **candidate discovered invariant supported by multiple implementations** — deliberately *not* canonized in this document. Canonization follows the normal evidence path.

**5.2 — Scope discipline on what a green gate establishes.**
`jarvis-epistemic-guard.yml` states in its own header exactly what a green run establishes *and no further*: not that claims are true, not that fabricated evidence was detected, not that inadmissible claims cannot enter by another route. A gate that publishes its own limits is a different object from a gate that reports success. No comparator material examined here does this.

**5.3 — Accountable supersession as the terminal problem, not orchestration.**
Orchestration asks whether multiple agents can coordinate action. Accountable supersession asks whether the organism can change what it believes, and change what performs its cognition, **without losing the history, authority, provenance, or constitutional continuity of what came before.** The ontology this requires — claim → evidence → confidence → authority → provenance → custody → decision → supersession — is not carried by the enterprise agent-platform model. Row 10 records that Soullab has this problem *named* and partially instrumented, not solved.

## 6. Principal finding

**The bottleneck is custody, not display.**

Rows 3, 6, 7, 8 are `present`. Rows 1, 2, 9 are `partial` in a mutually reinforcing way: canonical programme state is authored in prose, distributed across at least five surfaces, with no single writer and no enforcement of the single-writer conventions that exist. Every new session reconstructs that state, and reconstructs it differently.

The consequence is the observed contradiction: **the architecture is capable well beyond what its operator can presently act on, because acting requires first re-deriving where things stand.** That is not a visualization deficit. A projection built over uncustodied state would render the divergence faster and more persuasively.

**Governing constraint for any future projection surface** (recorded, not authorized):

> If destroying and regenerating the projection from sovereign sources loses information, the projection had already acquired authority.

Custody first. Projection second.

## 7. Scope refusals

Recorded so the repository does not falsely encode what problem was being solved:

- The sovereign maturity-diagnostic asset was **declined** — demand-generation for a category Soullab is not in; the bottleneck is verified function, not conceptual differentiation; and it would have forced the generic Coaching Journey architecture to emerge through marketing abstraction ahead of specimen extraction, inverting `COACHING-TEMPLATE-EXTRACTION-01`.
- The design invariant surfaced during that exploration — *a diagnostic must return interpretive authority to the person being diagnosed* — is **not canonized here**. Sovereignty Invariant 6 (Mirror Integrity: *"Diagnostic-style labeling"* prohibited; *"Reflection, not projection"*) and Invariant 5 (*"False certainty transfers authority outward. Honest uncertainty returns it."*) already constrain most of the territory. The uncovered case is *instruments* rather than turns. It waits for a real specimen, so the eventual text is disciplined by an actual authority problem rather than an imagined one.
- No Airtable integration is proposed, implied, or authorized.

## 8. What this census does not establish

It does not establish that the `present` rows work under load, that the `partial` rows are safe at their boundaries, or that row 10 is tractable. It establishes what evidence exists in this repository as of `2026-09-05`, and names where evidence could not be produced.
