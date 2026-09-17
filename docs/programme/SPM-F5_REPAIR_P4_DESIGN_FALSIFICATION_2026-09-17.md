# SPM-F5 Repair P4 — Adversarial Design Falsification — 2026-09-17

**Standing:** P4 COMPLETE · ORIGINAL P3 SET PARTLY DEFEATED · REVISED SET SURVIVES DESIGN ATTACK

## 0 · Bound authority

- SPM-FC-01 blob: b52c53eae03851fb6bf21dbc41a1f38fe3a003d1
- Examined organism: 89b79a4a59f42a1cd5951d6a9686d3a47772ddef
- Ratified conformance commit: bbb1672d5e454f1f9051bdca76b8f71e681e88d8
- P2 contracts: SPM-F5_REPAIR_P2_CONTRACTS_2026-09-17.md
- P3 selection: SPM-F5_REPAIR_P3_ARCHITECTURE_SELECTION_2026-09-17.md
- P3 response surface census: SPM-F5_REPAIR_P3_RESPONSE_SURFACE_CENSUS_2026-09-17.md

P4 attacked the P3 designs before any executable mutation.

## 1 · Result summary

    A1   SURVIVES WITH WITNESS HARDENING
    A2   ORIGINAL DEFEATED → REVISED
    A3   SURVIVES WITH CONCURRENCY / EXTERNAL-CUSTODY REFINEMENT
    A4   SURVIVES
    A5   ORIGINAL ROUTE-LEVEL FORM DEFEATED → REVISED SEALED HANDOFF
    A6   ORIGINAL POSITIVE-WARRANT DESIGN WITHDRAWN → DEFAULT-CLOSED GATE
    A7   SURVIVES WITH STATE-PROVENANCE PRECISION
    A8   ORIGINAL TRANSPORT FORM DEFEATED → DURABLE RECOVERABLE ACT
    AX1  ORIGINAL REPLAY CLAIM DEFEATED → ATOMIC TRACE-BEFORE-INFLUENCE

No P4 correction creates implementation authority.
# F1 — A1 legacy retirement attack

## Attack

Assume the Next route and Lab Tools button are removed while:
- the static my-data-summary route still claims deletion_available/permanent/immediate;
- the standalone legacy service remains independently reachable;
- lexical /api/sovereign prefix behavior remains capable of classifying an old sibling route if it reappears.

Result: the experience can still promise or expose the retired destructive capability.

## Evidence

The Lab Tools sovereignty page uses a hardcoded demo_user_001, calls the summary route, and presents deletion controls.
The summary route returns static positive data and asserts deletion is available, permanent, and immediate.
Repository deployment/config search found no explicit independent launcher for services/user-sovereignty/delete-memory-api.js, but absence from those files is not proof that no deployed service exists.

## Disposition

**A1 survives only as a whole-experience retirement.**

Required implementation witness:
1. remove/disable the Lab Tools destructive experience;
2. retire the summary route's fake data/deletion promises;
3. retire/refuse the Next delete-my-memory route;
4. prove the standalone legacy service is not independently reachable in the target environment;
5. remove accidental authority inheritance for the retired path or prove no route remains to inherit it.

A1 does not authorize replacing the feature with a new full-erasure implementation.
# F2 — A2 provenance-mint attack

## Attack 1 — producer known, material not known

Suppose the system knows the current actor is the member but receives the command:

    "keep this"

If the architecture records the command as the intended material, it may preserve authorship but store the wrong object.
If it guesses that "this" means the previous MAIA response, it has inferred a referent the member did not structurally identify.

## Attack 2 — replayed excerpt

The conversational respond route currently accepts an excerpt or complete FilingInstruction from the client.
A caller can supply byte-identical MAIA text while claiming a member-directed filing shape.

Producer classification alone cannot prove the selected material.

## Disposition

**Original A2 is defeated.**

## Revised A2 — Attested Material Envelope + separate adoption act

Before the mint, the server must hold one immutable input envelope containing:
- exact selected material identity;
- exact bytes or digest bound to that identity;
- producer/authorship classification established by the source boundary;
- source object/version/turn when one exists;
- member Keep/adoption act identity separately.

The client may point at a candidate object or make a gesture. It may not author the envelope's provenance facts.

For deictic commands such as "keep this", the system must either resolve a server-held exact referent from the conversation act or refuse/seek a new explicit act. It may not guess.

Unknown/caller-carried material may still be kept if product law permits, but its producer remains unknown/unproven; the member's adoption does not rewrite it to member-authored.

## Re-attack

Forged MAIA excerpt → cannot mint member authorship because the envelope is server-attested.
Ambiguous "this" → no exact envelope, therefore no provenance-bearing mint.

**Revised A2 survives P4.**
# F3 — A3 custody planner attack

## Attack 1 — stale plan

A disposition plan is calculated, then before execution:
- a new shared artifact is created;
- Circle membership/consent changes;
- a dependent row appears;
- another sovereign acquires a stake.

Executing the old plan can destroy or strand authority that did not exist when planning occurred.

## Attack 2 — external bytes

A database transaction can commit while file/object-store deletion later fails.
Calling the act "complete" at database commit would repeat I-25 in a more elaborate form.

## Attack 3 — dynamic schema

A new member-bound table can land after registry code is written but before the destructive process is updated.

## Disposition

A3 survives with three mandatory refinements.

### Revised A3 conditions

1. **Plan identity + state binding.**
   The plan carries a digest/version of the governed custody facts it relied on.

2. **Revalidation at execution.**
   Transactional DB state is locked/rechecked immediately before destructive mutation. A material difference invalidates the plan rather than being silently incorporated.

3. **Multi-phase custody truth.**
   Database disposition and external-byte disposition are separate observed phases under one act identity. The member-wide act cannot report complete erasure while an external phase is unverified or failed.

The schema/custody census is a CI/landing gate: a newly introduced member-affiliated class not present in the semantic registry blocks the governed completeness claim.

**Revised A3 survives P4.**
# F4 — A4 derivation-lineage attack

## Attack

A generic lineage table can itself become a fiction when:
- the derivative is written but the edge write fails;
- a source is mutable and only its object id is recorded;
- source content is later lawfully erased;
- heterogeneous source kinds cannot share a database FK.

## Disposition

A4 survives because its authority is the lineage relation, not a universal FK.

Mandatory conditions:
- derivative + edge creation is one atomic governed act wherever one database transaction can cover both;
- mutable sources require version/state/digest;
- external or heterogeneous source identity is verified by the source adapter at write time;
- lawful source erasure may leave a non-content tombstone/identity where governing custody law permits;
- edge records never preserve source prose merely to keep lineage alive;
- an edge whose source identity was never verified is not governed lineage.

**A4 survives P4.**

# F5 — A5 participation handoff attack

## Attack 1 — downstream reload

Between's generateMaiaTurn() independently calls MemoryBundleService.build() after the route boundary, then passes that context into getMaiaResponse().

Therefore canonicalizing only the route would not govern all member-context participation.

## Attack 2 — nested cognition

A response engine may launch additional model stages or enrichments after the first handoff. If those stages can independently fetch member-specific stored context, the first canonical decision is not authoritative.

## Attack 3 — false producer class

The current producer registry can classify member.atoms as member-authored/placed while RC-2 proves some Keep paths can mis-stamp origin.

Universalizing that registry before A2 would universalize false provenance.
## Disposition

**Original route-level A5 is defeated.**

## Revised A5 — Sealed Canonical Cognition Context

The canonical authority boundary produces a sealed, frozen context object that owns all governed member-context participation for the turn.

Rules:

1. Candidate loading may occur before adjudication, but every member-related stored/contextual candidate must enter through a registered producer/source adapter.
2. The adjudicator fixes the admitted set once for the governed turn.
3. Response-producing engines receive the sealed context and may choose reasoning/provider/tier strategy.
4. A governed engine path must not independently reload member-specific stored context outside that sealed object.
5. If a later internal stage needs another governed member source, it must request a new adjudicated candidate through the same turn authority, not query around it.
6. Unregistered member-context producers refuse rather than appearing as raw prompt strings.
7. Dormant routes cannot reactivate without this handoff.
8. A2 provenance authority must be proven before the member-atom producer classes can participate in the cutover.

This preserves MAIA's dynamic intelligence: the architecture governs participation membership, not reasoning style, model selection, room grammar, elemental synthesis, or gestalt processing.

## Re-attack

Between's current internal MemoryBundle build would violate sealed-context mode and therefore must be removed, moved before adjudication, or made incapable of running when a canonical context is present.

**Revised A5 survives P4 as a design; current organism still fails RC-5.**
# F6 — A6 crossing-warrant attack

## Attack

P3 proposed a new exact revision-offer warrant.

But current evidence establishes only:
- a reading warrant exists;
- the revision-offer schema can persist MAIA's proposed wording under that reading authority;
- no runtime INSERT into manuscript_revision_offers is currently located.

The evidence does **not** establish what member act should constitute a second representation warrant.

Inventing one in P3 would create constitutional authority from architectural convenience and risks filling I-19 by analogy.

## Disposition

**Original positive-warrant A6 is withdrawn.**

## Revised A6 — Default-closed representation gate

For the earned origin='work' revision-offer crossing:

- reading authority can never itself permit persistence of the MAIA offer;
- the representation crossing remains **CLOSED BY DEFAULT**;
- no runtime writer may activate it;
- the persistence substrate must not accept an origin='work' offer merely because a reading-authority object exists;
- a future positive representation warrant requires a separate founder/evidence adjudication defining the human act and its exact binding.

Candidate-origin offers remain a distinct question because the writer handed their own candidate into the discourse; P4 does not generalize the work-origin rule onto that path without evidence.

## Re-attack

Read warrant present + no separately ratified representation authority → persistence refuses.
No claim about general MAIA speech is created.

**Revised A6 survives P4 by containment, without filling I-19.**
# F7 — A7 transformed-state provenance attack

## Attack

A single section can contain:
- original member wording;
- an accepted MAIA replacement;
- later member edits.

A mutable section.author field would lie.
Permanent byte-level authorship mapping for every character could also overbuild I-5 and create fragile diff machinery.

## Disposition

A7 survives as **state-transition provenance**, not a global authorship scalar.

Each governed transformed state records:
- section identity;
- prior state/version/digest;
- resulting Work version/digest;
- exact transformation source formulation/version;
- source formulation producer;
- authorizing member act;
- transformation executor/system act.

A later member edit creates another state transition whose actor is the member and whose prior state points back to the transformed state. The current section may therefore be truthfully "member-revised from MAIA-assisted state" or other non-collapsing description rather than falsely assigning every byte to one author.

I-5 requires recoverable provenance of the transformation; it does not require reconstructing eternal per-character ownership.

**A7 survives P4.**
# F8 — A8 member-visible truth attack

## Attack — lost response

The server commits a destructive act, but the HTTP response is lost.

A client that sees only a network error cannot truthfully say:
- deletion failed; or
- deletion succeeded.

A typed response alone does not solve this.

## Disposition

**Original A8 is defeated at the transport-loss edge.**

## Revised A8 — Durable recoverable deletion act

Before destructive mutation:

1. the client creates an opaque request correlation id; it carries no subject authority;
2. authenticated server logic resolves/creates a durable deletion act with its own server identity bound to the verified member;
3. mutation and disposition update that durable act;
4. retry/status lookup by the correlation id resolves only within the authenticated member's acts;
5. the client renders succeeded/refused/partial/failed from durable status;
6. a network loss before status recovery renders **outcome unknown — checking**, never success or failure by inference.

A3 supplies the actual disposition/manifest semantics.

## Re-attack

Lost response after commit → retry/status reads durable completed act.
Lost response before mutation → retry/status reads pending/refused/failed act.
Foreign correlation id → indistinguishable from absent under I-7-compatible scoping.

**Revised A8 survives P4.**
# F9 — AX1 traceability attack

## Attack — replay promise exceeds record

P3 said an idempotent replay could return the already-recorded occasion.

But memory_cut1_trace_runs deliberately stores ids/scores/ranks, not memory bodies.
If source rows later change or are erased, the trace cannot reconstruct the exact candidate content that was returned.

Therefore the trace is sufficient for historical traceability of selection, not a general response-replay cache.

## Disposition

**The P3 replay claim is withdrawn.**

## Revised AX1 — Atomic trace-before-influence

For an accountable Cut-1 retrieval invocation:

    begin governed DB act
      → run observed candidate read
      → derive exact trace from that same read
      → insert/verify occasion trace
    commit
      → only now may candidate content leave for response-producing cognition

If read or trace persistence fails, the accountable retrieval produces no candidate influence.

retrieval_id remains the identity of one retrieval invocation, as the schema already states. A later HTTP retry may legitimately be a new retrieval occasion with a new retrieval_id and its own trace.

An accidental conflicting reuse of one retrieval_id refuses. No claim is made that the trace can reconstruct erased prose.

## Re-attack

Trace INSERT failure → transaction/act fails before candidates cross.
Read succeeds but COMMIT fails → candidates do not cross.
Historical query → ids/ranks/scores/captured occasion remain answerable from the record.

**Revised AX1 survives P4.**
# 2 · Surviving architecture set after falsification

The P4-surviving set is:

    S1  A1  Whole legacy sovereignty deletion experience retirement
    S2  A2  Attested Material Envelope + separate member adoption
    S3  A3  State-bound, revalidated, multi-phase custody/disposition planner
    S4  A4  Atomic immutable derivation edges
    S5  A5  Sealed Canonical Cognition Context
    S6  A6  Default-closed work-origin revision-offer representation gate
    S7  A7  Writer's Studio state-transition provenance
    S8  A8  Durable recoverable deletion act + member-visible outcome
    SX  AX1 Atomic trace-before-influence

## Dependency graph after falsification

    S2 provenance ───────── HARD PRECONDITION ───────▶ S5 participation cutover

    S3 custody/disposition ─ final semantics ───────▶ S8 deletion outcome

    S4 derivation edges ─── possible primitives ────▶ S7 transformation provenance
                            implementation sharing still unproven

    S6 representation gate ─ CLOSED until separate positive founder/evidence law

    SX traceability ─────── independent imported companion

## Sequencing consequence

The first implementation grant need not be the broadest repair.

The design permits bounded waves:
- S1 can retire a dangerous legacy corridor independently;
- S2 can repair provenance before S5;
- SX can repair traceability independently;
- S3 is the major substrate programme and should not be rushed merely because S8 is visible in the UI.
# 3 · P4 standing

    P0  authority / denominator binding     COMPLETE
    P1  root dependency map                COMPLETE
    P2  repair contracts                   COMPLETE
    P3  architecture selection             COMPLETE
    P4  design falsification               COMPLETE — REVISED SET SURVIVES

    P5  founder implementation grant       NEXT
    P6  contained implementation           CLOSED
    P7  re-adjudication                    CLOSED
    P8  canonicalization / release         CLOSED

    SOURCE IMPLEMENTATION                  CLOSED
    SCHEMA / MIGRATION                     NOT AUTHORIZED
    UI / ROUTE REPAIR                      NOT AUTHORIZED
    DEPLOYMENT                             NOT AUTHORIZED
    PRODUCTION                             UNTOUCHED

## 4 · P5 rule

P4 creates **no implementation authority**.

A P5 founder grant must name:
- the surviving architecture / wave;
- exact allowed mutation class;
- exact seam(s);
- evidence gates;
- forbidden spillover;
- stop condition.

No later wave inherits authority from an earlier grant.

P4 recommends that any first grant be bounded rather than programme-wide.
