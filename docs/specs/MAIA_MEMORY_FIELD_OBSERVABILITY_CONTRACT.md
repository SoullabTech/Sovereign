# MAIA Memory Field Observability Contract

> ⚠️ **SUBORDINATE DOCUMENT (founder-directed, 2026-08-04).** This contract is the
> **memory arena's implementation** of a grammar it does not own. The governing artifact is
> **`docs/specs/FIELD_TRANSITION_RECORD_PROPOSAL_2026-08-04.md`** (lifecycle
> `offered → explored · adopted · declined · withdrawn`; **R4** — only the member may write
> `adopted · declined · withdrawn`; **R5** — grammar, not service).
>
> ⛔ This document may **not** define lifecycle or ownership semantics. Panel 5 *implements*
> the authority boundary; it does not author it. Where the two disagree, the proposal governs.
>
> 🔴 **Correction carried from that proposal (§9.1):** the memory lifecycle is system-side only —
> **`stored → loaded → offered → used`**. ⛔ **`alive` must NOT name loader health.** Relational
> aliveness is member-authored and already exists as `member_memory_atoms.status = 'still_alive'`.
> Occurrences of `ALIVE` below still carry the old technical sense and are **superseded** —
> read them as `loaded` pending a revision pass.

**Status:** DRAFT — contract proposed, not implemented, not ratified.
**Amended 2026-08-04** (two founder review passes): §0 added (+ two corollaries);
`empty` decomposed into five orthogonal raw observations (§I.A); D1 (USED) and D2
(escalation) recorded as explicit deferred decisions; D3 (vocabulary collision) opened,
direction accepted, `EXISTS` renamed **`STORED`**, items 1 and 3 still open (§V.A).
**Stage vocabulary is now `stored → alive → offered → used → owned`**, nested beneath
the ratified capability grammar rather than competing with it.
**Measured against:** `0cf6696ab` (branch `feature/labtools-redesign`), 2026-08-04.
**Not measured:** no production probe was run. Every "covered today" claim below is a
*code-reading* claim about the deployed shape of the monitor, not an operational one.
**Surface:** admin monitoring — extends `/admin/maia/substrate`
(`app/api/admin/maia/substrate/route.ts`), admin-gated by `isAdminRequest`.
🔴 **Blocked on D3** (§V.A) — vocabulary collision with the ratified five-axis grammar
of `docs/specs/ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md`. Read D3 before building anything
from §V.

---

## The question this contract exists to answer

> **At every stage, can we tell whether memory exists, is alive, is offered, is used,
> and remains owned by the member?**

**Stage vocabulary (post-D3):** the memory arena is `stored → alive → offered → used`.
**`owned` is no longer a memory stage** — D3 item 3 ruled it up to a cross-arena
sovereignty axis ([`SOVEREIGNTY_OWNERSHIP_AXIS_v0.md`](./SOVEREIGNTY_OWNERSHIP_AXIS_v0.md)).
Panel 5 below is memory's *implementation* of that axis, not its definition.
The first stage was drafted as `EXISTS` and **renamed to `STORED`** to end a referent
collision with the ratified capability grammar (§V.A/D3). `STORED` is concrete and
non-interpretive: it asserts *there are records* and implies nothing about relevance,
retrieval, authority, or meaning.

The contract's job is to make each of those five words a *separately falsifiable*
observation. Today they are partly conflated — most damagingly, `empty` in
`runtime_events.memory_layers` means both *"this member has nothing of this kind"*
and *"this layer never ran"*. A monitor that cannot tell those apart cannot answer
stage 1 at all.

---

## §0 — Governing principle: observability must not increase authority

A monitor that measures the journey of experience must not thereby acquire the right
to interpret it. The observability layer is permitted to describe **mechanism**; it is
forbidden from asserting **meaning**.

**The monitor MAY say:**
- this memory was stored / retrieved / offered
- this gate was checked, and this is what it returned
- this layer failed, or never ran

**The monitor MAY NOT say:**
- this memory is true
- this pattern defines the person
- this response was *caused by* this memory
- this memory mattered

The distinction the architecture is converging on:

> **Memory stores experience. Observability measures the journey of experience.
> Meaning remains with the member.**

This principle is load-bearing for §III Panel 4 (USED) and constrains every future
panel added to this contract. An observability signal that can only be produced by
interpreting the member — or by interpreting MAIA's response *about* the member —
is out of scope by default and requires its own sovereignty read before it may be
specified.

**Corollary 1 (detection ≠ response).** The monitor answers *"did this occur?"* Policy
elsewhere answers *"what happens when it occurs?"* Collapsing the two would quietly
convert the observability layer into an operational authority layer. See §V.A/D2.

**Corollary 2 (a threshold is not an authorization).** A measurement threshold is not an
authorization boundary unless the governing rule says it is. A reading crossing a line
may **trigger attention**; it may never **trigger restructuring**. This applies to every
alarm specified in §III — an alarm authorizes *looking*, not *changing*. It is the same
principle that governs the memory-index character ceiling, where a size warning is
informational and only an explicit rule authorizes structural change.

---

## §I — The five stages

Each stage has a strict definition and a falsification test. **A stage is only
observable if a monitor reading can come back FALSE.** A signal that can only ever
read "fine" is decoration, not observability.

| # | Stage | Strict definition | Falsification test |
|---|---|---|---|
| 1 | **STORED** | Rows are durably persisted for this member in this layer's store. | Member with known history shows `storedCount = 0` for a layer they have written to. |
| 2 | **ALIVE** | On this turn, the loader for the layer ran and returned without error. | `memory_layers[layer] = 'error'`, or the layer is absent from the turn payload entirely. |
| 3 | **OFFERED** | The loaded content actually reached the model prompt on this turn. | Layer is `ok` in `memory_layers` but `false` in `prompt_block_layers`. |
| 4 | **USED** | MAIA's response drew on the offered content rather than ignoring it. | Offered for N consecutive turns with no downstream evidence of uptake. |
| 5 | **OWNED** | Surfacing was authorized by a member act, and the member can withdraw it. | Content surfaced while the member's consent flag/preference says otherwise. |

### §I.A — Decomposing `empty` (the primary state-space defect)

`empty` is today a **primitive fact**. It is carrying at least five distinct meanings:

1. the member has no memories of this type;
2. the layer has never executed;
3. retrieval failed;
4. consent blocked retrieval;
5. the layer ran and legitimately returned nothing.

These are not equivalent, and three of them are alarms while two are normal. A single
variable that cannot distinguish an empty member from a broken retrieval from a
consent block is not an observation — it is an erasure.

**The contract requires the state space be forced apart into orthogonal variables,
each independently observable:**

```text
storage:        present | absent
execution:      ran | did_not_run | failed
retrieval:      attempted | not_attempted
result:         candidates_returned | none_returned
authorization:  allowed | blocked
```

Note `retrieval` and `result` are **separate** variables. Collapsing them re-creates
the defect one level down: *"we tried and got nothing"* and *"we never tried"* are
different facts, and only the first says anything about the member.

**`empty` is an interpretation, not an observation.** It becomes a *derived conclusion*,
generated when appropriate — never a recorded primitive. Each of the five original
meanings becomes a distinct, nameable tuple:

| Meaning | storage | execution | retrieval | result | authorization | Alarm? |
|---|---|---|---|---|---|---|
| Member genuinely has nothing | `absent` | `ran` | `attempted` | `none_returned` | `allowed` | no |
| Layer never executed | any | `did_not_run` | `not_attempted` | — | any | ⚠️ yes — wiring |
| Retrieval failed | `present` | `failed` | `attempted` | — | `allowed` | 🔴 yes |
| **Stored but not retrieved** | `present` | `ran` | `attempted` | `none_returned` | `allowed` | 🔴 **highest-value alarm** |
| Consent blocked it | `present` | `ran` | `not_attempted` | — | `blocked` | ✅ **no — correct behavior** |

⚠️ **The consent-blocked row is the trap.** A naive health dashboard would render a
*protected member state* as a failure — and thereby create pressure to "fix" a system
that is behaving exactly as the vows require. Any aggregate health rollup that counts
`authorization = blocked` toward degradation is itself the defect.

Note the last row: consent-blocked is a **healthy** state and must never be counted
as degradation. Conversely, the fourth row is the false-amnesia class made visible
*at the moment it happens* rather than diagnosed after a member reports it.

### The two conflations this contract forbids

- ⛔ **`empty` ≠ absent.** Stage 1 and stage 2 must be reported by *different fields*
  (`storage` vs `execution`), never inferred from one another.
- ⛔ **loaded ≠ offered.** Stage 2 and stage 3 must be reported by *different fields*.
  The DEEP-tier addenda-channel divergence
  (`docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B) is precisely a
  turn where stage 2 is true and stage 3 is false. If the monitor cannot show that
  as a discrepancy, it is not monitoring the thing that actually broke.

⚠️ **Migration note:** the existing `runtime_events.memory_layers` `ok`/`empty`/`error`
enum cannot represent this space. It is retained for continuity, but the four state
variables must be recorded *alongside* it, not encoded into it. Back-filling old rows
is impossible — historical `empty` values are permanently ambiguous and must be
rendered as `ambiguous (pre-decomposition)`, never silently mapped.

---

## §II — Coverage today (code-read at `0cf6696ab`)

| Stage | Signal that would carry it | Source of truth | On the monitor today? |
|---|---|---|---|
| 1 STORED | per-member stored row counts per layer | `member_memory_atoms`, episodic/semantic stores, `member_daily_anchors` | ❌ **absent** — nothing counts stored rows |
| 2 ALIVE | `memory_layers` (12 keys, `ok`/`empty`/`error`) + `memory_continuity_confidence` | `runtime_events` ← `lib/maia/memoryHealth.ts` | ✅ **covered** (`getSubstrateActivity`, `deriveStatus`) |
| 3 OFFERED | `prompt_block_layers` (booleans) + `prompt_block_chars` | `runtime_events` ← `recordRuntimeEvent` | ⚠️ **partial** — booleans exist; never *correlated against* `memory_layers`, and no per-tier (FAST/CORE/DEEP) split |
| 4 USED | none | — | ❌ **absent** — no signal of any kind exists |
| 5 OWNED | consent flags + return/surface preferences | `members.conversational_recall_enabled` / `.episodic_recall_enabled` / `.recurrence_recall_enabled`; `member_memory_atoms.return_preference`; `member_daily_anchors.surface_preference`; `member_memory_atoms.is_breakthrough` | ❌ **absent from the monitor** — the gates are enforced in `lib/maia/memoryLoaders.ts` and `memoryAtomsLoader.ts`, but **nothing surfaces whether enforcement held** |

**Honest read:** the monitor answers stage 2 well, stage 3 halfway, and stages 1, 4,
and 5 not at all. Stage 5 is the gap that matters most — consent is the vow, and it
is currently the *least* observable property in the system.

---

## §III — What the admin monitoring page must show

Extends `/admin/maia/substrate` with a **Memory Field** section: five panels, one per
stage, each rendering its own falsification state. No panel may render a green state
it cannot also render red.

### Panel 1 — STORED (substrate census)
Aggregate, non-identifying: per layer, count of members with ≥1 stored row, total rows,
oldest/newest row timestamp. **Alarm:** any layer whose `storedCount > 0` cohort shows
recurring per-turn `empty` — surfaced as **"stored but not retrieved (N turns)"**.

### Panel 2 — ALIVE (per-turn loader health)
Existing 12-layer grid + `continuityConfidence` distribution over the recent window.
Add: **error rate per layer per 24h**, and explicit **base-chain degraded** count
(`isBaseChainDegraded`). Unwired layers must render `unwired`, never `empty`.

### Panel 3 — OFFERED (loaded → prompt)
The correlation view, per layer: `ok-and-offered` / `ok-but-not-offered` / `offered-but-not-ok`.
Broken out by **processing tier** (FAST / CORE / DEEP) — this is what makes the DEEP
divergence visible instead of inferred. Requires adding a tier column to `runtime_events`.

### Panel 4 — USED (uptake)
Renders **"no authoritative signal"** — permanently, until D1 (§V.A) is ruled otherwise.
⛔ Do not fake it. ⛔ Do not infer use from `prompt_block_chars`. ⛔ Do not label any
technical proxy as USED.

Per D1, USED is **not a purely technical state**. A memory can be retrieved, injected,
and attended to by the model without becoming meaningful to the human. The panel's
job is therefore to hold the distinction open, not to close it:

> The monitor knows *"this memory was available."*
> It does not know *"this memory mattered."*

If proxies are ever displayed here they must be labeled as proxies, in their own
vocabulary (`available`, `carried_forward`), and must never aggregate into a
stage-4 "healthy" reading.

### Panel 5 — OWNED (consent standing)
Aggregate counts only, **never per-member content**:
- per gate (`conversational_recall_enabled`, `episodic_recall_enabled`,
  `recurrence_recall_enabled`): enabled / disabled / null-default;
- atoms by `return_preference`; anchors by `surface_preference`;
- **member-marked** counts (`is_breakthrough`) — with the system-never-sets invariant stated on the panel.
**The load-bearing alarm — impossible-state detection:**

```text
memory offered  AND  authorization = blocked
```

Expected value is **0 by architecture**, not 0 by good behavior. This is not a
degradation reading. The correct rendering is:

> *"The system entered a state the architecture declares impossible."*

— **not** *"this feature is degraded."* A consent failure is categorically different
from a retrieval failure: a retrieval failure affects **capability**; a consent failure
affects the **relationship**. The panel must not place them on the same severity scale.

⛔ Per §0 and D2, this panel **detects only**. It does not page, halt, or remediate.
Response policy is named in D2 and lives outside this contract.

---

## §IV — Invariants on the monitor itself

1. **Sanctuary-safe.** No message content, ever. `member_id_prefix` stays NULL for
   sanctuary and anonymous turns (already true of `runtime_events`).
2. **Aggregate for consent.** Panel 5 shows distributions, never "member X opted out".
   Observing consent must not itself become surveillance of consent.
3. **No inferred green.** Every panel distinguishes `unknown` / `not-instrumented`
   from `ok`. Missing instrumentation renders as missing, never as healthy.
4. **Read-only.** The monitor never mutates memory or consent state.
5. **The monitor must not depend on the invisibility it detects** — durable transport
   (`runtime_events`), not an in-process buffer. (Already ruled; preserved here.)
6. **Observability must not increase authority** (§0). The monitor describes mechanism
   and never asserts meaning, truth, causation, or personhood. It detects; it does not
   respond.

---

## §V — Implementation order (not yet authorized)

1. **Panel 5a — consent *state*.** *Can the system determine whether this member's
   memory use was permitted?* Read-only aggregate query over the gate columns and
   preferences. **No schema change.** New: `lib/maia/memoryConsentObservability.ts`.
2. **Panel 5b — consent *violation detection*.** *Can the system prove an impossible
   state occurred?* ⚠️ Requires a schema change: detecting `offered AND blocked` means
   persisting the **gate outcome** per turn in `runtime_events` (`authorization`),
   which nothing records today.

   **The standing/evidence distinction:** *gate exists* + *gate enforced* does **not**
   establish *gate outcome recorded*. Without the recorded outcome the monitor cannot
   separate three very different histories:

   - blocked correctly,
   - bypassed,
   - never checked.

   **Therefore the honest current status is: consent architecture exists; consent
   observability is incomplete.** ⛔ That sentence is the accurate claim until 5b ships —
   do not upgrade it to "consent is verified" on the strength of 5a. Detection only, per D2.
3. **Panel 1.** Stored-row census + the *stored-but-not-retrieved* alarm (§I.A row 4).
   New reader alongside `lib/maia/substrateObservability.ts`.
4. **Panel 3.** Add `processing_tier` to `runtime_events` and render the
   loaded↔offered correlation, split by tier.
5. **Panel 2.** Record the four §I.A state variables alongside the legacy enum;
   render `unwired` and `ambiguous (pre-decomposition)` as first-class states.
6. **Panel 4.** Held by D1 — renders "no authoritative signal" indefinitely.

**Consolidated migration** (items 2 + 4 + 5 touch the same table): one migration adding
`authorization`, `processing_tier`, and the `storage` / `execution` / `retrieval` /
`result` columns to `runtime_events` is preferable to three. Sequencing above
is by *value order*; the schema work can be pulled forward into a single change.

### §V.A — Recorded decisions

Both prior open questions are now recorded. Neither is a ratified ruling; each is an
**explicit deferred decision with a stated position**, which is what the contract
requires before implementation may begin. ⛔ Neither may be resolved by implementation.

---

**D1 — What counts as USED?** · *Deferred, with a position that constrains building.*

Three candidate definitions, none adopted:

| # | Definition | Assessment |
|---|---|---|
| 1 | **Model-content inference** — did the response contain something derived from memory? | Requires inspecting output; risks creating a hidden evaluator of the member interaction; confuses correlation with influence. Barred by §0 unless separately ruled. |
| 2 | **Retrieval contribution** — was the memory in the available context? | Already measured — **this is OFFERED, misnamed.** Adopting it would rename stage 3 and leave stage 4 empty while appearing to fill it. |
| 3 | **Member-recognized influence** — did the member carry something forward because of it? | Strongest sovereignty alignment; sparse and slow. The only candidate that observes meaning where meaning actually lives. |

**Recorded position:** *USED has no authoritative implementation signal yet. Technical
proxies may exist, but they cannot claim human meaning.* USED is likely not a purely
technical state at all. Until D1 is ruled, Panel 4 renders **"no authoritative signal"**
and the system is forbidden from asserting that any memory mattered.

**What this decision protects against:** a system that says *"this memory mattered"*
when all it knows is *"this memory was available."*

---

**D2 — What happens on a consent-boundary breach?** · *Out of scope, referred.*

**Recorded position:** detection and response are separate concerns. This contract owns
**detection only** — *"did an impossible consent state occur?"* Whether the answer pages
immediately, halts surfacing, or enters review is an **operational governance decision**,
not a memory-contract decision. Folding it in here would quietly convert the
observability layer into an operational authority layer (§0 corollary).

The likely progression, recorded as *shape only*, not adopted:

1. Detect
2. Preserve evidence
3. Halt unsafe surfacing if possible
4. Human review

⛔ Steps 2–4 are **not authorized by this contract** and must not be built as part of
Panel 5. Panel 5 implements step 1 and stops.

---

---

**D3 — Vocabulary collision with the ratified five-axis grammar.** · *🔴 UNRULED — blocking.*

⚠️ **Discovered after drafting, on a memory-index pass.** A five-axis observability
grammar was **already ratified (Kelly, 2026-05-27)** and governs all admin substrate
observability panels:

```text
exists → reachable → participates → observable → influences
```

Governed by `docs/specs/ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md` (parent) and
`docs/specs/FRAMEWORK_REGISTRY_MONITOR_2026-05-27.md`. It defines six arenas, and
**arena A is "Memory Functionality"** (spec §, lines 48 / 72). Its intended surface is
`/admin/maia/observability`.

**Verified at `0cf6696ab`:** both specs exist on disk; **the surface does not** —
`app/admin/maia/observability` and `app/api/admin/maia/observability` are absent. The
ratified grammar is spec-complete and unimplemented. `/admin/maia/substrate` is the
surface that actually exists.

There is also a *third* five-element ladder — `Built / Reachable / Participating /
Observable / Sovereign` ([[project_governed_participation_doctrine]]) — which the
memory record explicitly flags as *"complementary to but NOT the same as this evidence
grammar — do not conflate."* **This contract must not silently become a fourth.**

**Altitude mapping — the two are not competitors:**

| This contract (member lifecycle) | Ratified grammar (capability evidence) | Relation |
|---|---|---|
| EXISTS — *this member* has stored rows | exists — artifact/service is present | **different altitude**, same word 🔴 |
| ALIVE — loader ran this turn | participates — runtime turn invoked it | near-equivalent |
| OFFERED — content reached the prompt | *(no clean analog)* | **gap in the ratified grammar** |
| USED — contributed measurably | influences — output reflects participation | equivalent; both held unmeasured |
| OWNED — consent authority preserved | *(none)* | **genuine addition** ⭐ |
| *(none)* | reachable — code path can invoke | not covered here |
| *(none)* | observable — emission is visible (load-bearing) | not covered here |

**Verified:** the ratified spec has **no consent or ownership axis** — `consent` appears
only as a v0.1 per-member-drill-down caveat (line 229). OWNED is a real addition, not a
rename.

**The collision that matters:** `exists` means *capability-level presence* in the
ratified grammar and *member-level stored rows* here. Same word, two referents, one
admin surface. That is precisely the referent-divergence failure this project has been
bitten by before.

#### D3 disposition (founder review, 2026-08-04) — direction accepted

**Do not discard the member lifecycle model. Do not create a competing top-level
grammar. Nest it.**

```text
Admin Observability Grammar
│
├── Capability State          ← ratified 2026-05-27, unchanged
│     exists
│     reachable
│     participates
│     observable
│     influences
│
└── Memory Arena: Member Lifecycle Depth   ← this contract
      stored
      alive
      offered
      used
      owned
```

**Accepted:**
- **Rename `EXISTS` → `STORED`.** Concrete, non-interpretive. Asserts *there are records*;
  implies nothing about relevance, retrieval, authority, or meaning. Applied throughout
  this document.
- **OFFERED survives** as a genuine contribution. A capability can `exist`, be
  `reachable`, and `participate` without ever answering *"was this memory actually made
  available in this interaction?"* That is a distinct member-facing lifecycle event with
  no analog above.
- **OWNED survives** and is the constitutional addition. The capability grammar measures
  capability *behavior*; OWNED measures whether that behavior stayed **within authority
  boundaries**. A system can read `influences = true` and `owned = false` simultaneously —
  which is exactly why OWNED cannot be reduced into the capability ladder.

#### D3 remaining resolution items — 🔴 still blocking

1. **Final parent-grammar relationship.** The nesting above is accepted in shape.
   What is not settled: whether "Memory Arena: Member Lifecycle Depth" is a *pattern*
   other arenas may instantiate, or a memory-only structure. This determines whether
   the tree has two levels or three.
2. **Rename** — ✅ resolved (`STORED`). Remaining mechanical work only: no other stage
   term collides with the capability grammar (`alive` vs `participates`, `used` vs
   `influences` are near-synonyms at *different altitudes*, which the nesting makes safe).
3. **Where OFFERED and OWNED live** — 🔴 **the sharp one, and it is not what it looks
   like.** The nesting diagram places both inside the memory arena. That is right for
   OFFERED. It may be **wrong for OWNED**.

   OWNED is described above as *constitutional* — it measures containment of authority,
   not memory behavior. If that is true, then consent boundaries apply to **every** arena
   (framework registry, Corpus Callosum voices, routing tiers), not just memory. In that
   case OWNED does not belong nested under the memory arena at all; it belongs as a
   **cross-arena axis at the parent level**, and this contract is merely its first
   instantiation.

   **✅ RULED 2026-08-04 — option 3b.** OWNED does **not** move into the Memory Arena.
   It lifts to a **cross-arena sovereignty axis**, with memory as the first concrete
   implementation. Rationale: *"Every MAIA capability needs a visible path from system
   capability → human encounter → human ownership."* Nesting it in memory would leave
   every other arena — Knowledge Field, archetypal agents, Corpus Callosum routing,
   frameworks, practitioner tools — to rediscover the same boundary with nothing
   compelling them to.

   **The axis now lives in its own artifact:**
   [`docs/specs/SOVEREIGNTY_OWNERSHIP_AXIS_v0.md`](./SOVEREIGNTY_OWNERSHIP_AXIS_v0.md).
   Universal states: `Observed → Offered → Engaged → Integrated → Owned →
   Withdrawn/released`, governed by *"the system can observe transitions; it cannot
   perform the transition into meaning."*

   ⚠️ **Consequence for this contract:** the memory arena is now a **four-stage**
   lifecycle — `stored → alive → offered → used`. Panel 5 remains specified here as
   memory's *implementation* of the ownership axis, but it no longer owns the concept
   and may not define it. ⛔ Ownership semantics are set by the axis document.

   ⚠️ **Consequence for the ratified spec:** lifting OWNED to parent level implies
   `docs/specs/ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md` needs amendment. That amendment
   is not written and is item 5 of the axis doc's open list.

⛔ **D3 blocks implementation of every panel in §V**, not just Panel 5. Building against
an unratified vocabulary on a surface governed by a ratified one would harden the
collision into code.

---

**Gate status:**
- D1, D2 — **recorded.** The pre-implementation condition stated at review
  (*both questions recorded as rulings or explicit deferred decisions*) is met.
- D3 — **direction accepted, items 1 and 3 open.** Item 2 (rename) resolved.
  Panels remain unstarted. Panel 4 additionally held by D1.
