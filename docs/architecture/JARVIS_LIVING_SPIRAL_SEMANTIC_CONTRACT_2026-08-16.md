# JARVIS Living Spiral — Semantic Contract (Phase 1)

**Date:** 2026-08-16
**Phase:** 1 — semantic contract only
**Authority:** [`FOUNDER_RULING_LIVING_SPIRAL_SEMANTIC_JURISDICTION_2026-08-16.md`](../governance/FOUNDER_RULING_LIVING_SPIRAL_SEMANTIC_JURISDICTION_2026-08-16.md) §4
**Predecessor:** [`JARVIS_LIVING_SPIRAL_PHASE0_RECONCILIATION_2026-08-16.md`](./JARVIS_LIVING_SPIRAL_PHASE0_RECONCILIATION_2026-08-16.md)
**Status:** ⭐ **`ACCEPTED`** — founder ruling 2026-08-16, on the narrow acceptance check.
Next gate is the **synthetic visual prototype**. ⛔ Implementation remains **NOT AUTHORIZED**.

**Amendment provenance.** This is the amended successor to a predecessor returned for amendment.

```text
PREDECESSOR       sha256 e29bdfe14444477ce53bab6589bd1595e7bbd3d8be15d4e87a462c42a94f70aa
                  28,372 B · 519 lines · PROPOSED / RETURNED FOR AMENDMENT
AMENDMENT         six bounded corrections + A4 completion, founder ruling 2026-08-16
                  docs/governance/FOUNDER_RULING_LIVING_SPIRAL_CONTRACT_AMENDMENT_2026-08-16.md
ACCEPTED CONTENT  sha256 ebfebb5aa6f496e8ce8023b030c7a3576d598448954620c303ffb6b2f626fbfe
                  34,755 B · 624 lines · committed 21db7685c
                  ⚠️ That hash covers the accepted SEMANTIC CONTENT — i.e. this file as of
                  21db7685c, before this status stamp. A file cannot contain its own hash;
                  the stamp itself carries no semantic change.
CUSTODY           assigned to the amending lane 2026-08-16 (amendment custody only)
AUTHORSHIP        UNRESOLVED — not established by the custody act or by acceptance
```

⛔ Custody is **not** authorship. Acceptance is of the **semantics**, not of authorship, and not of
any implementation. The architecture below is the predecessor's; the six corrections plus the M4
temporal-axis completion are the only semantic changes.

**Standing established by the acceptance ruling:**

```text
SEMANTIC CONTRACT        ACCEPTED
operational_layer        still PROVISIONAL as specified (§3.3)
O1 / O2 / O3 / O4 / O5   unchanged (§13)
SYNTHETIC PROTOTYPE      AUTHORIZED AS NEXT GATE
IMPLEMENTATION           NOT AUTHORIZED
LIVE TELEMETRY           NOT AUTHORIZED
RUN/ASSERTION SUBSTRATE  NOT CREATED OR AUTHORIZED HERE
```

⚠️ **Carried observation, not a defect and not blocking** (founder, 2026-08-16): M8 admits
`none`/`zero` → `present`, which is coherent because `none` means no instance while `zero` can mean
an evidenced zero level of the phenomenon. ⛔ Do not paraphrase M8 globally as "absence → presence"
where `zero` is involved; the rule as written in §4 is explicit and does not invent prior
existence or nonexistence.

> ⛔ **This contract authorizes no code.** No UI, no telemetry, no emitter change, no graph store,
> no production connection. It defines meanings and the tests those meanings must survive.
>
> ⛔ **`operational_field_state` is not defined here and may not be inferred from anything here.**

**The acceptance test this contract is written against** (founder, §7 of the ruling):

> *Spiralogic should provide JARVIS with a grammar of perception, not a license to metaphorically
> relabel infrastructure. The elemental architecture becomes valuable precisely when the mappings
> have to earn their meaning.*

---

## §0 Method — how a mapping earns its meaning

### 0.1 Direction of derivation

Every mapping in this contract was derived **upward from operational phenomena** observed in this
codebase, then given a label. None was derived downward from an elemental name looking for
something to denote.

```
✅  operational phenomenon → independent definition → evidence → label
⛔  elemental name → search for a plausible operational referent
```

### 0.2 The swap test — the mechanical form of "earn their meaning"

> **The canonical value of `operational_element` is the phenomenon name. Fire/Water/Earth/Air/
> Aether are a declared display alias, defined in one place (§2.8) and swappable without changing
> a single definition, evidence binding, fixture, or refusal in this contract.**

If replacing the elemental aliases with `A/B/C/D/E` changes any meaning, the mapping was
load-bearing on the name and has **failed**. This is testable by inspection and is the contract's
own falsification hook.

### 0.3 The firewall (required verbatim by the ruling §2.2)

> **An `operational_element` classification makes no assertion about the developmental,
> psychological, spiritual, or elemental condition of a member or person.**

Corollary refusals, binding on any later phase:

- ⛔ No surface may render an `operational_element` and a member-facing elemental state in one view.
- ⛔ No member record may carry an `operational_element`, and no operational record may carry a
  member elemental state.
- ⛔ The member ring ladder (`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`, Sovereignty Invariant 16)
  is not referenced by, aliased to, or ordered against `operational_layer`.

### 0.4 Evidence standing of every binding in this contract

All evidence sources named below are **`CANDIDATE — code-read class, UNVERIFIED at runtime.**
Phase 0 §D.2 established that no table was measured, and §A.3 that the production referent is
bound on 1 of 5 criteria. Nothing here claims a source is populated, written, read, or fresh.

`table declared ≠ exists in production ≠ is written ≠ is fresh ≠ anything reads it`

---

## §1 The unit — everything attaches to an assertion, nothing attaches to a node

Adopted from [`JARVIS_RUN_PROVENANCE_ARCHITECTURE_2026-08-16.md`](./JARVIS_RUN_PROVENANCE_ARCHITECTURE_2026-08-16.md) §5, which this
contract is downstream of and does not amend.

```
OPERATIONAL ASSERTION
  assertion_id
  subject / predicate / object
  operational_element[]        §2   — multi-valued; a property of the ACTIVITY, never of a node
  operational_layer            §3
  observed_at / valid_as_of    §8
  temporal_status              §8
  epistemic_status             §9
  evidence_class               §9   — per JARVIS CORE §B
  source                       §10
  resolver + binding_method    §10
  custody                      §10
  authority_basis              §10
  presence_value               §7   — phenomenon condition; NEVER null-as-healthy
  observation_status           §7   — observation condition; kept SEPARATE from presence
```

⛔ **Naked edges are prohibited.** An edge retrievable without its custody is a referent
retrievable without its state.

⛔ **Nothing renders that is not an assertion.** Every visual element in any future prototype must
resolve to an `assertion_id`. This is the mechanical form of *"no glow without cause."*

### 1.1 The category error this kills

*"Is PostgreSQL an Earth component?"* is **inadmissible** — it asks for an element on a node.
The admissible question is *"what mode of activity does this assertion describe?"* A single
component participates in several modes depending on what it is doing, at different times, with
different evidence. The classification lives on the activity, and therefore so does its evidence.

---

## §2 `operational_element` — modes of operational activity

Five phenomena, each independently defined. Per ruling §2.2, each specifies all eight required
fields.

### 2.1 `transformation` — *display alias: Fire*

| | |
|---|---|
| **Phenomenon** | Activity that changes the state of the system itself: what exists after is not what existed before. |
| **Admissible evidence** | `agent_runs`, `ain_executor_runs`, `hypothesis_test_runs`, deploy-lane execution (`scripts/deploy-production.sh`, `pre-deploy-gate.sh`), applied migrations. *(CANDIDATE — §0.4)* |
| **Positive** | A deploy swapping a running container · a migration applied · an agent run producing a new artifact · a build emitting an image. |
| **Counter** | A health check (observes, changes nothing) · a read query · a queue drain that relocates material unchanged → that is `conveyance` · a decision that selects but does not alter → `discrimination`. |
| **Cardinality** | Multi-valued. A deploy is `transformation` + `consolidation`. |
| **Transitions** | Enters on evidenced start; leaves on evidenced completion **or** on decay (§4 M4) — never on inferred completion. |
| **Uncertainty** | Representable. `transformation @ epistemic_status: provisional` = change is asserted but the after-state is unwitnessed. |
| **Does NOT mean** | ⛔ energy · passion · intensity · urgency · severity · that the change was good. A destructive change is `transformation`. |

### 2.2 `conveyance` — *display alias: Water*

| | |
|---|---|
| **Phenomenon** | Activity that moves material between components **without changing what it is**. |
| **Admissible evidence** | `comms_delivery_queue`, `comms_analysis_queue`, `embedding_jobs`, `session_summary_queue`, `media_jobs`, `supervision_jobs`, proxy hops through `maia-caddy`, model routing. *(CANDIDATE)* |
| **Positive** | Queue depth changing · a message delivered · a request proxied · a payload routed to a tier. |
| **Counter** | A transformation that happens to write to another table (still `transformation`) · material at rest (that is `consolidation`) · a routing *decision* (that is `discrimination`; the subsequent move is `conveyance`). |
| **Cardinality** | Multi-valued. |
| **Transitions** | Enters on evidenced departure; leaves on evidenced arrival. **Departure without arrival is not completion — it is a `blocked` or `unresolved` disturbance (§6).** |
| **Uncertainty** | Representable. In-flight with unwitnessed arrival = `conveyance @ provisional`. |
| **Does NOT mean** | ⛔ emotion · flow state · feeling · ease · that movement is desirable. A retry storm is `conveyance`. |

### 2.3 `consolidation` — *display alias: Earth*

| | |
|---|---|
| **Phenomenon** | Activity by which state comes to **stand** somewhere — and by which where-it-stands becomes assertable. |
| **Admissible evidence** | Commit reachability from a named branch · `GIT_COMMIT` of a running container · rollback tags (`maia-sovereign:current/:previous/:<sha>`) · migration ledger · `provenance_tombstones` · the custody chain `local ≠ committed ≠ pushed ≠ merged ≠ deployed ≠ production-witnessed ≠ canonical` (`CLAUDE.md` JARVIS CORE §C). *(CANDIDATE)* |
| **Positive** | A SHA becoming the running provenance · a commit becoming reachable from an intended branch · a rollback tag refreshed. |
| **Counter** | A file existing on disk (**existence ≠ standing**) · a table having rows · a branch *name* pointing somewhere (Phase 0 §A.2 — the rename that moved a name without moving the object). |
| **Cardinality** | Multi-valued. |
| **Transitions** | Enters when a custody assertion is newly witnessed; leaves on supersession or decay. Custody **never** transitions by inference from a successful adjacent step. |
| **Uncertainty** | Representable, and this is its most important use: partial binding (Phase 0 §A.3, 1 of 5 criteria) is `consolidation @ provisional`, **never** `established`. |
| **Does NOT mean** | ⛔ grounding · embodiment · stability-as-virtue · correctness. Wrong state can stand perfectly well. |

### 2.4 `discrimination` — *display alias: Air*

| | |
|---|---|
| **Phenomenon** | Activity in which the system makes a distinction **that changes what happens next**: a decision, gate, route, refusal, or classification. |
| **Admissible evidence** | `field_decisions`, `maia_decisions`, `studio_decisions`, `maia_decision_votes` · `deriveStatus()` (`app/api/admin/maia/substrate/route.ts:80`) · refusals R07/R08/R16/R23/R24 · deploy-lane lock refusal · Dockerfile deploy-lane tripwire · `scripts/governance/escalation-guard.py` · `scripts/builder/epistemic-guard.mjs`. *(CANDIDATE)* |
| **Positive** | A gate refusing a build · a lock refusing a second deploy · a router selecting a tier · `deriveStatus` returning `wired-unobserved`. |
| **Counter** | Logging without branching · recording a metric · a value being *available* to a decision that did not consult it. |
| **Cardinality** | Multi-valued. |
| **Transitions** | Instantaneous — a discrimination is an event, not a state. It **persists as an assertion**, never as an ongoing condition. |
| **Uncertainty** | Representable: a decision whose *basis* is unrecoverable is `discrimination @ ambiguous` — which is itself a finding, not a gap. |
| **Does NOT mean** | ⛔ intellect · clarity · thought · correctness. **A wrong decision is fully `discrimination`.** A refusal is a first-class positive instance, not a failure. |

### 2.5 `composition` — *display alias: Aether*

| | |
|---|---|
| **Phenomenon** | Activity by which separately-produced parts become **one effective whole** — and the mode in which assembly can fail silently while every part reports success. |
| **Admissible evidence** | `integration_passes` · Corpus Callosum multi-voice integration (`lib/services/corpusCallosumService.ts`) · `appendAllContextAddenda` (`lib/sovereign/maiaVoice.ts`) · final prompt assembly · `docker compose` bringing a stack up as a set. *(CANDIDATE)* |
| **Positive** | Addenda evidenced *in the final assembled prompt* · a router integrating voices into one response · a stack coming up as a set. |
| **Counter** | ⛔ **Two components running at the same time.** Co-location is `JOINT MANIFESTATION / CAUSAL RELATION UNESTABLISHED`, never composition. ⛔ **Presence in a `meta` object.** *Availability is not composition* — the `PBR-002` failure class. |
| **Cardinality** | Multi-valued, and typically co-occurring — composition is asserted *about* parts that are themselves elsewhere classified. |
| **Transitions** | Enters only on evidence at the **assembly point**, never at a contributing part. |
| **Uncertainty** | Representable and **mandatory**: composition asserted from part-availability rather than assembly-point evidence is `composition @ provisional` at best, and is the single most likely false-positive in the whole contract. |
| **Does NOT mean** | ⛔ spirit · unity · consciousness · emergence-as-value · synthesis of member meaning. |

### 2.6 Cardinality rule (all elements)

**Multi-valued.** An assertion may carry several elements. It carries them because the *activity*
exhibits several modes — never because the *component* is versatile.

### 2.7 Uncertainty rule (all elements)

Every element is representable at any `epistemic_status` (§9). ⛔ **An element may never be
asserted at `established` on the strength of a name, a schema, a label, or a sibling success.**

### 2.8 Display alias table — the sole canonical definition of the alias mapping

| `operational_element` | Display alias |
|---|---|
| `transformation` | Fire |
| `conveyance` | Water |
| `consolidation` | Earth |
| `discrimination` | Air |
| `composition` | Aether |

⛔ This table is a **rendering-layer alias only**. It is never stored, never queried, never
reasoned over, and carries no meaning not stated in §2.1–§2.5.

---

## §3 `operational_layer` — proposed, and tested

Per ruling §4.2: *propose and test.* Five strata are proposed; the jurisdiction test is then run
and its result reported honestly, including where it partially fails.

### 3.1 Proposed strata

| Layer | The kind of reality it distinguishes | Competent witness |
|---|---|---|
| `intention` | what was **authorized** — as against merely possible or merely desired | governed record: ruling, mandate, work unit, authority state |
| `declaration` | what the system **says about itself** — as against what is | code-read / schema-read / doc-read |
| `enactment` | what actually **ran** — as against what was declared | runtime trace |
| `standing` | **where a thing holds** — as against having run somewhere | custody witness: SHA + provenance + reachability |
| `encounter` | what a **person actually met** — as against what the system did | member or operator witness |

### 3.2 The jurisdiction test

> *What kind of reality does this layer distinguish that another layer does not?*

Each passes: authorized≠possible · said≠is · ran≠said · holds-here≠ran-somewhere ·
met≠did. No stratum is redundant against another.

### 3.3 The adequacy rule — **and where the test partially fails**

For `declaration → enactment → standing → encounter` a strict rule holds, inherited from an
existing operator-side instrument (`CLAUDE.md`: *declaration is not liveness; built ≠ wired;
wired ≠ surfacing; surfacing ≠ verified*):

> **An assertion at layer L may not be established by evidence competent only for a layer to its
> left.**

`intention`, however, **does not sit on that chain.** It is not weaker evidence than `declaration`;
it is a different kind of witness entirely. The five-stratum axis is therefore **not a single
ladder**, and presenting it as one would be a fabricated ordering.

**Result: `operational_layer` is `PROVISIONAL`.** Four strata form an adequacy chain; `intention`
is orthogonal to it and sits alongside. Open question carried to §13.

### 3.4 Firewall — this is not Invariant 16

⛔ `operational_layer` carries **no directional authority constraint**. It is an
**evidence-adequacy** ordering, not an authority ordering. Nothing rises through it, nothing is
authored into it, and no operational component occupies a member developmental position. Per
ruling §2.1, concentric geometry may render it; the member ring ladder is not its source and is
not referenced by it.

---

## §4 Motion grammar — evidenced change only

> **Motion = a difference between two assertions over the same `(subject, predicate)`, where the
> object or the epistemic/temporal status differs, and both assertions are evidenced.**

| | Class | Definition | Is it motion? |
|---|---|---|---|
| M1 | `first_observation` | first assertion about a `(subject, predicate)` | **no** — establishes that we have begun to see, not that anything began |
| M2 | `transition` | object changed between two evidenced assertions | yes |
| M3 | `restatement` | re-witnessed, object identical | **no** — refreshes temporal standing only |
| M4 | `decay` | no restatement within the freshness threshold | **yes** — temporal-axis motion |
| M5 | `divergence` | a new assertion contradicts a live one | yes |
| M6 | `resolution` | a disturbance's stated `resolution_condition` is met | yes |
| M7 | `withdrawal` | evidence became inadmissible or was removed | **yes** — status → `unknown` |
| M8 | `emergence` | an evidenced `presence_value: none`/`zero` is followed by an evidenced `present` over the same `(subject, predicate)` | yes |

> **M1 and M8 are not the same event, and conflating them is the error this separation exists to
> prevent:**
>
> ## **newly observed ≠ newly begun**
>
> A first-ever assertion establishes first *observation*. It cannot establish that the phenomenon
> **began**, because nothing witnessed its prior absence. `emergence` (M8) is a genuine motion and
> requires two evidenced assertions like every other motion class — the first establishing absence,
> the second presence. ⛔ **A first observation may never be rendered as emergence, birth, start,
> or arrival.** What changed was the observer, not the world.

### 4.1 The central mechanism

**M4 and M7 are the reason "absence ≠ health" is mechanically true rather than merely asserted.**

When a source goes silent, the system does not fall still. `decay` fires on the *absence* of
restatement and drives **`temporal_status → stale`**. When evidence is withdrawn (including lawful
Sanctuary expiry), `withdrawal` fires and drives `presence_value → unknown`.

⚠️ **Decay is temporal, not epistemic.** The assertion remains `established` *about its
`valid_as_of`* — that witness really did occur, and demoting it would rewrite history to record a
present-tense limitation. What decays is its competence to establish **now**:

```
epistemic_status   established   (unchanged — about valid_as_of)
temporal_status    stale
current-state claim   NO LONGER ESTABLISHED FROM THIS EVIDENCE
```

⛔ `stale` is **not** a member of the `epistemic_status` enum (§9) and may not be written there.

> **Silence produces visible motion toward loss of knowledge. It never produces calm.**

### 4.2 Refusals

- ⛔ **M3 may never render as motion.** Re-polling identical metrics is the mechanism by which a
  dashboard manufactures the appearance of life. Restatement updates freshness; nothing else.
- ⛔ **No motion without two evidenced assertions.** One assertion plus an assumption is not a
  transition.
- ⛔ **Animation intensity is not a severity channel** (§6.3).

---

## §5 Stillness taxonomy — stillness must be typed or it is unknown

**`stillness_kind` classifies a phenomenon that is evidenced to be at rest.** It is not a place to
record that we could not look.

| `stillness_kind` | Meaning |
|---|---|
| `completed` | the activity finished, with evidence of completion |
| `equilibrium` | evidenced steady state |
| `awaiting` | evidenced wait on a named condition |
| `failed_silent` | failure evidenced, no further activity |

> **Only an evidenced phenomenon condition may receive a `stillness_kind`. Failure to observe a
> phenomenon is carried on the observation, presence, and temporal axes (§7, §8) and may never
> itself establish stillness.**

⛔ **`unobserved`, `stale`, `absent` and `not_applicable` are removed from this taxonomy.** They
were category errors here, and each has a lawful home:

| Removed | Belongs to | Because it describes |
|---|---|---|
| `unobserved` | `observation_status` (§7) | the observer's aperture |
| `not_applicable` | `observation_status` (§7) | jurisdiction |
| `stale` | `temporal_status` (§8) | the standing of evidence in time |
| `absent` | `presence_value: none` (§7) | ontology |

**The defect this closes:** `stillness_kind: unobserved` asserted that a thing was *still* on the
strength of not having looked at it. If the system is unobserved, we do not know that it is still.

> **A subject may be rendered still only where `observation_status: observed` and a
> `stillness_kind` is established. Absent that, it renders as `unknown` — never as calm, never as
> healthy, never as nothing.**

---

## §6 Disturbance grammar — typed attention states

### 6.1 Types

`blocked` · `contradicted` · `stale` · `degraded` · `failed` · `unverified` ·
`custody_incomplete` · `authority_blocked` · `unobserved_where_expected` · `unresolved`

`authority_blocked` is a first-class disturbance and a **non-fault stop condition**. Work stopped at
an authority boundary is a truthful stop; it **may be resumable**, and it must be visible as
awaiting-authority rather than as failure.

⛔ It may **not** be represented as a failure, **nor** as a completed objective, unless the
governing mechanism establishes that disposition. A governance boundary can stop work truthfully
without terminating the objective — some gates pause pending legitimate authority. Asserting
completion here would silently alter Run Provenance semantics (§1) while claiming not to amend
them.

### 6.2 Required fields

```
type · subject · evidence · attention_basis · temporal_standing ·
epistemic_status · provenance · resolution_condition
```

### 6.3 Refusals

- ⛔ **No severity scalar.** `attention_basis` is a **typed reason**, not a number.
- ⛔ **No aggregate score, percentage, ratio, index, or vitality figure** — for a disturbance, a
  layer, an element, or the system. One uncovered high-authority condition may matter more than
  fifty low-authority ones (anti-metric rule, JARVIS referent discipline Monitor 6).
- ⛔ **A disturbance without a `resolution_condition` is inadmissible.** A condition that can never
  clear becomes permanent ambient alarm, and permanent alarm is indistinguishable from decoration.
- ⛔ **Disturbance ≠ error.** `unverified` and `authority_blocked` are disturbances; neither is a
  fault.

---

## §7 Absence, unknown, and silence — the presence and observation axes

**Two fields, because two different questions are being asked.** Collapsing them is the mechanism
by which a condition of the observer becomes a condition of the observed.

```
presence_value       PHENOMENON CONDITION   — what is the case?
observation_status   OBSERVATION CONDITION  — what can be seen from here?
temporal_status      TEMPORAL STANDING (§8) — does the evidence still establish the present?
```

**`presence_value` — the phenomenon condition.** Four values:

| Value | Meaning |
|---|---|
| `present` | the thing is present and evidenced |
| `zero` | a valid zero was measured |
| `none` | no instance exists |
| `unknown` | the condition cannot be established |

**`observation_status` — the observation condition.** Three values:

| Value | Meaning |
|---|---|
| `observed` | admissible telemetry covers this condition |
| `unobserved` | no admissible telemetry covers this condition |
| `not_applicable` | the condition has no jurisdiction here |

⛔ **No two values on either axis may share visual semantics, no value on one axis may share visual
semantics with a value on the other, and none may share visual semantics with a healthy state.**

### 7.1 The binding rule between the axes

> **`presence_value` may take `present`, `zero`, or `none` only where
> `observation_status: observed`. Under `unobserved` or `not_applicable`, `presence_value` is
> `unknown` — always.**

This is the mechanical form of the governing principle. Not seeing a thing is not a fact about the
thing. `unobserved` is therefore no longer expressible *as* a presence value at all, which is what
makes the error unrepresentable rather than merely discouraged.

⚠️ **`stale` is not a presence value and never was one.** Staleness is temporal standing (§8): the
evidence remains real about its `valid_as_of` and simply no longer establishes the present. A stale
assertion's `presence_value` is whatever the evidence established *then*, carried with
`temporal_status: stale` — it is **not** silently rewritten to `unknown`.

> ⛔⛔ **Neither `presence_value` nor `observation_status` may be filled by inference from another
> field** (inherited from `scripts/builder/orient.mjs`, where this rule is already executable).
>
> ⛔⛔ **No absence value on either axis implies health, at any layer, under any composition.**

**Precedent, already shipped:** `deriveStatus()` falls through to `wired-unobserved` when
`okCount === 0`. Absence-≠-health is not a new requirement in this codebase; it is an existing
behaviour this contract generalizes.

---

## §8 Temporal grammar

```
observed_at            when the witness occurred
valid_as_of            what moment the assertion describes
freshness_threshold    declared per source; after it, decay (M4) fires
temporal_status        current | recent | enduring | recurring | resolved | historical | stale
```

- ⛔ **A current condition and the memory of a condition may never be visually indistinguishable.**
- ⛔ **Resolved disturbances may not remain luminous.** Lineage is recoverable on inspection;
  it is not ambient.
- Transition lineage is preserved as `previous → event → current`, never by overwrite.

---

## §9 Epistemic grammar

`established` · `provisional` · `emerging` · `ambiguous` · `contradicted` · `superseded` ·
`unknown`

Carried alongside, never merged: `evidence_class` per JARVIS CORE §B — *code-read · runtime trace ·
custody witness · member/operator witness · authority record.*

### 9.1 Contradiction handling

When two live assertions disagree:

- ⛔ do not average them;
- ⛔ do not hide one;
- ⛔ do not prefer the more recent by default;
- ✅ render `contradicted`, keep both retrievable, and hold it until jurisdiction or authority
  resolves it.

**Contradiction is a finding, not a defect in the display.** Phase 0 §F.2 is the worked example:
two resolvers over the same repository returned different results, *and the discrepancy was the
result.*

### 9.2 Correction lineage

Superseded assertions remain retrievable with the evidence that superseded them. Corrections
replace confidence, not evidence.

---

## §10 Provenance grammar

Every assertion carries:

```
source
resolver
binding_method:
    resolver:  the specific mechanism
    domain:    what that mechanism actually resolves over
    scope:     where it operated
    query:     the material selector
custody
authority_basis
```

⛔ **Insufficient:** `searched repo` · `checked the DB` · `looked at the deploy` · `read the docs`.
✅ **Sufficient:** a resolver+domain pair specific enough that a later reader can state what the
operation was **structurally incapable** of returning.

### 10.1 The interrogation path (instruction §9)

```
pattern → phenomenon → assertion → evidence → binding_method → temporal standing → authority
```

Every rendered element must complete this path. **A rendered element that cannot is a contract
violation, not a missing feature.**

---

## §11 Discriminating semantic fixtures

Per ruling §4.7. These are **paper fixtures** — specified inputs and required classifications. No
code, no data files, no telemetry. Each names what a *failing* implementation would do instead,
which is what makes it discriminating.

| # | Scenario | Required classification | A failing implementation would instead |
|---|---|---|---|
| **F1** | A telemetry source is removed entirely. | `observation_status: unobserved`; `presence_value: unknown`; **no `stillness_kind` at all**; disturbance `unobserved_where_expected` | render calm / green / nothing — or record the aperture loss as a fact about the subject (`presence_value: unobserved`, `stillness_kind: unobserved`) |
| **F15** | A `(subject, predicate)` is asserted for the first time ever. | M1 `first_observation`; **not motion**; no `emergence` | render it as emergence / birth / a new thing starting |
| **F2** | A source freezes; last write 6h ago, threshold 15m. | M4 `decay` fires; `temporal_status: stale`; `epistemic_status` **stays `established` about its `valid_as_of`**; no current-state claim survives | keep showing the last value as current — or demote the historic witness to `stale` as though it had never been established |
| **F3** | Two sources assert different `GIT_COMMIT` for one container. | `contradicted`; both retrievable; no winner chosen | prefer the newer, or average, or hide one |
| **F4** | A disturbance's `resolution_condition` is met. | M6 `resolution`; disturbance clears; lineage retrievable on inspection only | leave it glowing, or delete the lineage |
| **F5** | Metrics polled 200×; no state transition. | **No motion.** M3 `restatement` only; freshness refreshed | animate continuously |
| **F6** | High normal activity, zero disturbance. | Visible aliveness; **no** attention signal | read as unhealthy because it is busy |
| **F7** | Near-zero activity; one `authority_blocked` item. | Attention signal **remains fully visible** | let low activity mute the signal |
| **F8** | A member-derived source contributes. | Only structural derived state surfaces; `member_id_prefix` NULL under Sanctuary; no content | leak payload, or persist it for replay |
| **F9** | `container maia-sovereign` bound on 1 of 5 criteria. | `consolidation @ provisional`; `presence_value: unknown` for anything downstream | treat it as `established` and answer questions from it |
| **F10** | Component X available in `meta`; assembly point unwitnessed. | `composition @ provisional` at most | assert `composition @ established` from availability |
| **F11** | Two services run in the same second on one path. | `JOINT MANIFESTATION / CAUSAL RELATION UNESTABLISHED` — **no** `composition` edge | draw a naked edge between them |
| **F12** | A branch is renamed; HEAD SHA unchanged. | Object unchanged; a **new** `consolidation` assertion about the name; no motion of the object | show the subject as having moved |
| **F13** | Evidence is lawfully withdrawn (Sanctuary expiry). | M7 `withdrawal`; status → `unknown` | revert to healthy, or retain the payload to keep the view stable |
| **F14** | A gate refuses a deploy. | `discrimination` @ `established`; disturbance `authority_blocked`, not `failed` | classify a refusal as an error |

**F5, F9, F10, F11 and F13 are the load-bearing five.** They are the fixtures a plausible,
attractive, wrong implementation fails.

---

## §12 What this contract refuses

1. Any rendered element without an `assertion_id` (§1).
2. Any element asserted on a node rather than an activity (§1.1).
3. Any single score, percentage, index, or vitality figure (§6.3).
4. Any absence value implying health (§7).
5. Any motion from restatement (§4.2).
6. Any severity encoded as animation intensity (§6.3).
7. Any `operational_element` on a member record, or member elemental state on an operational
   record (§0.3).
8. Any ordering of `operational_layer` presented as an authority direction (§3.4).
9. Any `operational_field_state` (ruling §2.3).
10. Any naked edge (§1).
11. **Any condition of the observer recorded as a condition of the observed** (§7.1) — an
    observation state written into `presence_value`, a `stillness_kind` asserted where
    `observation_status: unobserved`, or a first observation rendered as emergence (§4, M1/M8).
12. Any `stale` written into `epistemic_status` (§4.1, §9).

---

## §13 Open — carried forward, not resolved

| # | Item | Standing |
|---|---|---|
| O1 | `intention` is orthogonal to the adequacy chain (§3.3). Is it a fifth stratum, or a separate axis crossing all four? | `UNRESOLVED` — resolvable in Phase 2 by fixture, not by argument |
| O2 | `freshness_threshold` per source cannot be set without runtime observation of real cadences. | `NOT YET CONSTRUCTIBLE` — Phase 3 input |
| O3 | Admissibility of the member-derived tables in Phase 0 §G to an operator surface. | `NOT DETERMINED` — needs its own ruling before any live projection |
| O4 | Whether five elements are complete, or whether an unnamed sixth mode exists. | `EMERGING` — five were derived, not proven exhaustive |
| O5 | The Run Record and assertion graph this contract presumes do not exist. | `BLOCKED_ON_PROOF` — governed by the run-provenance document, not by this programme |

⛔ None of O1–O5 may be closed by invention. O5 in particular is **not** this programme's work.

---

## §14 Acceptance conditions

This contract should be accepted only if all hold:

1. **The swap test passes** (§0.2) — replacing Fire/Water/Earth/Air/Aether with A/B/C/D/E changes
   no definition, evidence binding, fixture, or refusal.
2. **The firewall is verbatim and its corollaries are refusals, not guidance** (§0.3).
3. **Every element specifies all eight ruling-required fields**, including an explicit
   *does-not-mean* (§2).
4. **`operational_layer` is reported as `PROVISIONAL` with its partial test failure named**, not
   smoothed (§3.3).
5. **Absence, stillness, and unknown are mechanically prevented from reading as health** (§4.1,
   §5, §7).
5b. **The observer axis is separated from the phenomenon axis** (§7), stillness is admissible only
   where observed (§5), first observation is not motion (§4 M1/M8), and `stale` is temporal rather
   than epistemic (§4.1) — the four surfaces of: *a condition of the observer must never be
   promoted into a condition of the observed.*
6. **No scalar anywhere** (§6.3).
7. **The fixtures discriminate** — each names the plausible wrong behaviour it catches (§11).
8. **Nothing was built** — no UI, telemetry, emitter, store, or production connection.

---

## §15 Disposition

> ## **PROPOSED — AWAITING FOUNDER ACCEPTANCE**

Next gate per ruling §4: **founder acceptance of this semantic contract → synthetic visual
prototype.** Not implementation.

⭐ This item is `AWAITING_AUTHORITY`. Silence, a dismissed prompt, or a timeout leaves it exactly
there — never `AUTHORIZED`, never `DEFERRED`.

**Stopping here.**
