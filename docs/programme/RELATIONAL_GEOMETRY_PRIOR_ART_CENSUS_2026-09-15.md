# Relational Geometric Reasoning — prior-art census

**Class: READ-ONLY CENSUS. ⛔ No lane opened. ⛔ Nothing authorized. ⛔ No source changed.**
Run 2026-09-15 against branch `claude/magical-hawking-p340hr` @ `3909be96`.
Scope: repository truth only — no runtime read, no production read, no external search.

---

## 0 · Verdict, first

**Geometric reasoning: ZERO prior art.** No latent-space instrumentation, no
representational-geometry work, no perturbation corpus, no flip-rate metric, no
reference to Sophontic or Julian Michels anywhere in tracked source or docs.
Every `geometr*` hit in the repo is decorative or spiritual-symbolic prose
(sacred geometry, Neuropod material), not representation-space measurement.

**Relational reasoning: SUBSTANTIAL prior art, built for governance reasons.**
The repository contains a typed, enforced relational substrate that was never
framed as reasoning research. It is the corpus a `JR-01` census would mine, and
it already exists at type level, database level, and CI level.

⭐ The honest framing of the gap is therefore not *"we have half of it"* but:
**we have the relational operators and none of the measurement apparatus.**

---

## 1 · The one existing direction document

`docs/architecture/held-directions/JARVIS_RELATIONAL_INTELLIGENCE_RESEARCH_PROGRAMME_2026-08-14.md`
(241 lines, founder-articulated 2026-08-14, marked **PRESERVED DIRECTION · NOT
AUTHORIZED · NOT started**).

It already contains, unbuilt:

- the loop `OBSERVE → DIFFERENTIATE → PERTURB → ABLATE → COMPARE → CORRECT → ACCUMULATE`
- a five-rung **evidence staircase** — recurrence → invariance under vocabulary
  perturbation → discriminative predictability → **selective impairment under
  ablation** → generalization across models and members
- eight **developmental axes** stated as failures that look like success
  (differentiation without fragmentation; continuity without fixation;
  familiarity without presumed intimacy; interpretation without added authority;
  …; **continuity without identity foreclosure**)
- the artefact sketch `hypothesis → predicted observable → intervention →
  control → production witness → result → confidence → contradictions → next
  experiment`
- one paragraph that is exactly the Julian bridge: *"if external methods can
  measure internal representational geometry, JARVIS becomes the layer
  correlating 'this representational trajectory changed' with 'here is the exact
  relational event, memory condition, correction, mode, member state, and
  control condition associated with it.'"*
- the maxim **"Build gates that fire. Automate the work, never the authority."**
- ⛔ a standing first-unit instruction: **READ the actual source paper before
  redesigning anything.** It records that the paper was referenced but never
  read, and that no claim it "already contains this architecture" was verified.

⚠️ The perturbation/ablation methodology the proposal treats as new is
**already written down here and still unstarted.** That is the finding, not the
absence of ideas.

---

## 2 · The relational substrate that actually exists in code

Ranked by how directly it constitutes a relational operator.

### 2.1 Participation axes — the strongest specimen
`lib/maia/canonical-turn/participationDisposition.ts` (contract `pdc-1`, founder
ruling 2026-09-03)

A candidate's provenance is **three orthogonal axes, explicitly ruled not one
scalar**:

| Axis | Values | Relational distinction carried |
|---|---|---|
| `authoredBy` | house · member · practitioner · system · collective | self / other |
| `participationClass` | constitutional · authored · placed · marked · declared · retrieved · computed · inferred · collective | origin / mechanism of arrival |
| `authority` | situate · compute · infer | epistemic standing |

Plus a closed disposition set `AVAILABLE · HELD · OFFERED · ADMITTED · EXCLUDED`
with **disjoint, closed reason families per final state** and the ruling
**HELD ≠ EXCLUDED** (legitimately eligible and deliberately withheld, versus not
constitutionally eligible). `lib/maia/canonical-turn/adjudicate.ts` is a pure
function over those axes.

⭐ This is already a relational ontology with 5 × 9 × 3 identity space and a
machine-readable basis for every disposition. It was built to stop MAIA
inflating what it thinks with — not as reasoning research.

### 2.2 Evidence reference algebra
`lib/manuscript/development/evidenceRef.ts` + `bind.ts` · `readState.ts` ·
`resolve.ts` (BUILD-07A, 2026-09-03)

Six typed reference kinds across two families —
textual (`section` · `passage` · `section-run`) and structural (`structure-unit`
· `structure-units` · `structure-topology`) — carrying `EvidenceRequirement =
body | position | structure`. Frozen `readState` binds
`(revisionNumber, code-point range, digest)`; `recoverEvidence` (historical,
digest-verified) is **type-separated from** `locateCurrent` (three-state, scoped,
never fuzzy); `bindEvidence` produces unforgeable `BoundEvidence`.

⭐ This is part/whole, original/revision, and **memory-of-a-text vs present
observation of that text** as enforced types rather than conventions.

### 2.3 Disclosure boundary — consent as an ordering, not an audit trail
`lib/disclosure/disclosureBoundary.ts` · `contextDisclosureReceipt.ts` ·
`authorizationAct.ts`

`resolve posture → require consent → mint receipt → caller crosses → confirm
crossed`, where each step **is the previous step's returned authority**.
`BoundaryOutcome` makes refusal-carrying-a-mint unrepresentable. Receipts have
`attempted` and `crossed` and deliberately **no `withheld`** — *"it would assert
a negative the database cannot prove."* The module authorizes and never executes,
"because a seam that both authorized and executed would make the two
indistinguishable in a later audit."

⭐ Consent / absence-of-consent, and claim / evidence, as structural relations.
⭐⭐ And the refusal to store an unprovable negative is, already, the
counterevidence discipline `JR-02` proposes — applied at one boundary only.

### 2.4 Authority × Time — the memory decomposition
`docs/research/human-experience/frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md`
(working decomposition, founder-adopted after R12; **authorizes nothing at runtime**)

Eight authority classes (member-stated · member-marked · observed ·
system-inferred · practitioner-observed · computed · historical pattern ·
house-authored) crossed with time. `docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`
separates episode `occurred_at` from assertion `valid_from`/`valid_to`, carries
succession on the successor (`supersedes` stored, `superseded_by` derived), and
predeclares five discriminating queries whose fifth — *what did MAIA believe
before I corrected it?* — is the discriminator.

⭐⭐ **This is the silver-cedar problem already formalized.** The proposal's
origin/temporality/epistemic-status perturbation axes map 1:1 onto it.
⚠️ `grep`: `supersedes` appears in 28 files, `superseded_by` in 1, `valid_from`
in **0** TypeScript files — the decomposition is documented, not implemented.

### 2.5 Memory participation provenance
`lib/memory/provenance/turnMemoryProvenance.ts` (contract `mpv-1`, marker
`[MAIA/memprov]`) — content-free manifest rows: identifiers, classes, counts,
booleans, versions, digests. No body field; unknown keys refused.

---

## 3 · The epistemic apparatus (claims, ledger, falsifiers)

### 3.1 Claim states and the guard
`scripts/builder/epistemic-guard.mjs` — eight statuses, **not one ladder**:

```
promotion rungs:  HYPOTHESIS(0) → OBSERVATION(1) → PROVEN(2) → INVARIANT(3)
lateral/terminal: CORRECTION · HEURISTIC · STALE · SUPERSEDED   (rank null)
```

Evidence kinds are a closed set split into `WEAK_KINDS` (code_comment, filename,
naming_convention, import_graph, architecture_doc, historical_assertion,
project_memory, worker_claim — *"an assertion about the system, not an
observation of it"*) and probative kinds (runtime_route_trace, endpoint_proof,
production_observation, db_query, log_marker, executable_gate, deployed_commit,
founder_ruling, …). Guards G1–G5 fire on assertion shape; over-inclusive by
design, *"a guard that fails to fire costs a false LIVE."*

### 3.2 The ledger, as it actually stands
`.ain/epistemic-ledger.jsonl` — **2 rows**: a genesis row (2026-08-16, blocking,
explicitly no historical backfill) and **one** transition
(`JARVIS-ADMISSION-001`, HYPOTHESIS → OBSERVATION, PERMITTED).
`.ain/claims/` — **one** claim record.

⛔ Do not read this as a populated research ledger. It is a working control with
one claim through it.

### 3.3 Falsifier corpora — the closest existing thing to a perturbation paradigm
- `tests/constitutional/s3/` — `transitionContract.ts` (typed observable
  transition semantics) · `falsifiers.ts` · `candidates.ts` (**eight disposable
  wrong machines, each the smallest competent embodiment of its named error**) ·
  `matrix.ts` (lethality + **classified vs unclassified collateral**). 674 lines.
- `tests/constitutional/refusal-registry/` — 15+ named refusals with a harness.
- `tests/constitutional/` also: `ain-context`, `editorial-runtime`,
  `s3-substrate`, sanctuary behavioural proofs.

⭐⭐ The S3 corpus is a **paired-defeat methodology already running in this
repository**: every falsifier carries a plausible-but-wrong implementation that
passes the rest of the suite and dies on this one. That is structurally the same
move as Sophontic's paired perturbation — applied to architecture rather than to
model representations.

### 3.4 Claim-state canon
`docs/canon/CLAIM_STATE_AUTHORITY.md` · `VERIFICATION_STATES.md` ·
`MARKETING_CLAIM_DISCIPLINE.md` (Live/Designed/Vision · Center of Gravity ·
Failure Test) · `docs/research/human-experience/CLAIM_LADDER.md`.

---

## 4 · The eight proposed flows against actual substrate

| Flow | Substrate present | Missing | Readiness |
|---|---|---|---|
| **1 Relational Geometry Lab** | §2.1–2.4 operator inventory; §3.3 paired-defeat method | perturbation corpus; any model instrumentation; an external partner | **census-ready, experiment-blocked** |
| **2 Counterexample Lab** | §3.1 CORRECTION/SUPERSEDED/STALE; receipts' refusal to store a negative | ⛔ no per-claim `counterevidence`, `alternatives`, or `confidence` field in the claim record — support and refutation are separate records, not one structure | **gap confirmed, as proposed** |
| **3 Cognitive Memory Lab** | §2.4 Authority × Time; §2.1 dispositions; `is_breakthrough`, anchors, `return_preference` | `valid_from` unimplemented; decay has two divergent definitions (2026-09-06 audit F3); no participation map | **strongest substrate of the eight** |
| **4 Sovereign State Reconstruction** | 262 programme docs; CLAUDE.md anchor; `.ain/` runtime store; `scripts/builder/jarvis-runtime-store.mjs` | nothing mechanical reads programme state; reconstruction is per-session human work | **highest practical leverage** |
| **5 Code World Model** | typecheck baseline; guard scripts; `askRouteEffectFamily` (transitive value-import graph walk, 31 files) | no causal graph; no blast-radius query | partial primitive exists |
| **6 Model Difference Lab** | provider governance canon; routing tiers FAST/CORE/DEEP | no canonical evaluation set; no cross-model corpus | **cheapest to start** |
| **7 Global Workspace Lab** | §2.1 adjudication IS a relevance gate; Corpus Callosum `agent_runs`/`integration_passes`; `[MAIA/shadow]` diffing | no comparative measurement of gated vs ungated | shadow machinery already exists |
| **8 Field Dynamics Lab** | `member_spiral_state`; rupture/repair records; FIS primitive (canon, no runtime authority) | no trajectory representation; no dynamics measurement | furthest out |

---

## 5 · The finding

⭐⭐ **Soullab did not build a relational-reasoning architecture in order to do
relational-reasoning research. It built one because governance forced it to.**

Each operator in §2 exists because a specific inflation had to be refused:
provenance became three axes because a scalar let authorship hide inside
epistemic class; evidence recovery is type-separated from current location
because a fuzzy match would have let a quotation drift; the disclosure boundary
returns permission without executing because an audit could not otherwise tell
authorization from action; receipts carry no `withheld` because the database
cannot prove a negative.

⭐ That provenance is what makes the corpus scientifically interesting rather
than merely elaborate: **these distinctions were load-bearing before anyone
proposed measuring them.** They were not designed to produce a result.

⚠️ And it bounds the claim honestly: an explicit type-level distinction in
TypeScript is **not** evidence of a representational distinction inside a model.
Whether the two correspond is exactly the open empirical question — it is not
answered by having built the types, and the census must not be read as partial
evidence for it.

---

## 6 · What is genuinely absent

1. Any measurement of model-internal representation. Zero.
2. A relational perturbation corpus. Zero paired cases exist.
3. A per-claim structure holding support **and** counterevidence **and**
   alternatives **and** confidence together (§4 row 2).
4. Mechanical programme-state reconstruction (§4 row 4).
5. A canonical cross-model evaluation set (§4 row 6).
6. ⛔ The source paper named in the 2026-08-14 held direction — still unread,
   still unlocated. Its standing first-unit instruction is undischarged.

---

## 7 · Sequencing note (⛔ recommendation only, no lane opened)

The 2026-08-14 document's own first unit blocks the rest: **read the source
before redesigning**. After that, the cheapest decisive act is not a lab but a
corpus — §2.1–2.4 already name the operators, so a first set of paired relational
perturbations can be authored from repository material alone, with no model
access, no partner dependency, and no runtime change. Whether it is then measured
behaviourally (flip rate / invariance) or representationally (a partner's
instrumentation) is a later and separable decision.

⛔ Nothing above authorizes any of it.
