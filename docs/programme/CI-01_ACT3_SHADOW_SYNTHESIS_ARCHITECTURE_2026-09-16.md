# CI-01 — Act 3 Shadow Synthesis Architecture

**Date:** 2026-09-16

**Act:** A3 — shadow synthesis architecture

**State:** ARCHITECTURE COMPLETE · RESEARCH ONLY · NO RUNTIME AUTHORITY

**Branch:** feature/ci-01-conversational-intelligence-synthesis-20260916

**A2 base:** 32feba46b3cacb5e68f75d8471f15152c5a45785

**Read-only sibling evidence:** 897dfcc8c7067ac8d09d9221647f80a7dda0c012

**Tracker:** MAIA-SOVEREIGN-ci01-a3

**Authority:** None. This record creates no event tap, journal, worker, runtime type, database,
prompt block, model call, endpointing decision, response plan, expression behavior, memory write,
learning policy, deployment, or member-facing change.

## 1. The ruling

> **A conversational shadow synthesizer is a one-way observational pipeline over sealed source
> cuts. It coordinates independent projectors, attests what each projector saw, and joins those
> frozen projections to later outcomes. It is not a shared conversation brain, a live decision
> service, a second cognition path, or a store of member truth.**

The synthesizer does not own a monolithic field object. It owns coordination facts:

- which already-lawful witnesses were available;
- which purpose-specific projector was run;
- which exact temporal cut it saw;
- what closed projection state it produced or refused;
- whether the result was sealed before the outcome;
- what the live path independently did;
- what the member observably did next;
- and whether the shadow system remained absent from every behavior reader.

The governing comparison remains:

~~~text
what the live path did
what each witness observed
what the synthesizer projected
what the member did next
~~~

No row in that comparison is allowed to become an instruction to the live path.

## 2. What “causally absent” must mean

An observer attached to a running system is not literally free of physical effect. CPU, memory,
I/O, queue pressure, database work, and network calls can all perturb latency even when no caller
branches on the result. A3 therefore separates two proof obligations that are often blurred.

| Isolation dimension | Required meaning |
|---|---|
| **Authority isolation** | No projection, comparison, failure, score, or manifest can change prompt membership, endpointing, transcript commit, model invocation, response content, TTS, playback, memory, settings, or learning. |
| **Operational non-interference** | Capturing and processing shadow evidence cannot synchronously block the live path, share its mutable decision state, exhaust its resources without bounds, or hide measurable latency / reliability effects. |

A later implementation may use the shorter phrase **causally isolated** only after both are
demonstrated. “No branch on the result” proves part of authority isolation. It does not by itself
prove operational non-interference.

## 3. Decisions at a glance

| Question | A3 decision |
|---|---|
| Is there one shadow field snapshot? | **No.** A run manifest references independent witnesses and projections; it does not contain a mixed field payload. |
| Does the synthesizer retrieve data? | **No.** It receives only already-lawful mirrored events or frozen fixtures. |
| Does “admitted evidence” always mean MIPA-admitted? | **No.** Source eligibility, projector eligibility, and MIPA cognition disposition are three separate gates. |
| May outcomes help construct the projection being evaluated? | **No.** The input cut and projection must be sealed before outcome join, or the record is retrospective and excluded from prospective claims. |
| May a late witness mutate a sealed projection? | **No.** It creates a new revision with a supersession link. |
| May A3 generate an alternative MAIA response? | **No.** That would create a second cognition path and a contaminated counterfactual. |
| May shadow content enter prompts or response plans? | **No.** Zero behavior readers is a constitutional requirement. |
| May a shadow failure degrade the conversation? | **No.** Live behavior proceeds; the shadow evidence fails closed as missing or invalid. |
| May the manifest persist member content? | **No.** Durable records are content-minimized references, codes, versions, timings, and digests under custody review. |
| May repeated agreement promote policy or memory? | **No.** Outcome joining is observation, not learning authorization. |

## 4. Evidence cut

### 4.1 Current-tree contracts and implementations read

- docs/programme/CI-01_CONVERSATIONAL_INTELLIGENCE_SYNTHESIS_CHARTER_2026-09-16.md
- docs/programme/CI-01_ACT1_CONVERSATIONAL_INTELLIGENCE_CENSUS_2026-09-16.md
- docs/programme/CI-01_ACT2_CONVERSATIONAL_FIELD_CONTRACT_2026-09-16.md
- lib/voice/turnArbiter.ts
- lib/voice/turnBench.ts
- lib/voice/turnTaking.ts
- lib/voice/voiceDiagnostics.ts
- lib/voice/dispatchProvenance.ts
- components/voice/ContinuousConversation.tsx
- app/api/telemetry/client/route.ts
- lib/maia/canonical-turn/types.ts
- lib/maia/canonical-turn/manifest.ts
- lib/maia/canonical-turn/shadow.ts
- app/api/sovereign/app/maia/list/route.ts
- lib/memory/provenance/turnMemoryProvenance.ts
- lib/field/fieldOrchestratorTelemetry.ts
- lib/db/ainShapeTelemetry.ts
- lib/sovereign/maiaService.ts
- lib/consciousness/activeThread.ts
- lib/consciousness/correctionDetection.ts

### 4.2 Immutable research evidence read without promotion

At 897dfcc8c7067ac8d09d9221647f80a7dda0c012 on the independent TURN-03 branch:

- TURN-03_A2_LOCAL_SHADOW_RUNTIME_2026-09-16.md
- TURN-03_A3_SYNTH_CONTROL_2026-09-16.md
- TURN-03_A3_SMARTTURN_COMPARATOR_2026-09-16.md
- TURN-03_A3_ADVERSARIAL_02_2026-09-16.md
- TURN-03_A3_OWNERSHIP_CANDIDATE_2026-09-16.md
- A3_SMARTTURN_EVIDENCE.json

At 33eb5ee84c589855aeb7957213c1e4fb43ab0507:

- RELATIONAL-GESTALT-STANDING-01_ACT6_ADJUDICATION_2026-09-16.md
- RELATIONAL-GESTALT-STANDING-01_ACT7_MINIMUM_ARCHITECTURE_2026-09-16.md

Those branches remain research evidence. A3 imports no code or runtime standing from them.

## 5. What the repository already teaches about shadow work

| Existing locus | Useful precedent | Why it is not the A3 architecture |
|---|---|---|
| TURN-02 arbiter in ContinuousConversation | Pure recommendation vocabulary; no caller branches on the result; structural scores only | It executes inside the client path, has no sealed input cut, and its client event is not currently in the server telemetry route allowlist on this branch. Browser emission is not durable comparative evidence. |
| Canonical-turn shadow and ShadowDiff | Same-source comparison, content digests, expected versus unexpected deltas, hostile-mutation tests | The route awaits shadow identity resolution inside the served request. It is semantically non-authoritative but is not proof of operational non-interference. |
| TurnParticipationManifest | Versioned, content-free evidence of what was considered and admitted | It manifests one cognition boundary, not evolving multi-domain projections or later outcomes. |
| TurnMemoryProvenance | Explicit observational-only law, non-throwing emission, source counts and digests | It is memory-specific and emission-only; it does not establish cross-event correlation or projector timing. |
| DispatchProvenance | Names the actual send boundary and records sequence without suppressing it | Its state is client-local and engagement-scoped. A3 needs encounter / exchange correlation across client and server clock domains. |
| FieldOrchestratorTelemetry | Fire-and-forget structural metrics | FieldContext is already effect-bearing prompt material, mixes sources, and lacks claim-level lineage. It is an observed source family, not the A3 field contract. |
| AIN shape telemetry | Structure-only post-response flags and continuity indicators | The same runtime region can optionally rewrite the response and awaits telemetry persistence. It is not a clean causal-isolation precedent. |
| TURN-03 A2/A3 sibling research | Exact model custody, raw comparator metrics, explicit zero live authority, preserved falsifiers, and an asymmetric ownership candidate | The corpora are synthetic and acoustic-specific. They do not establish whole-conversation synthesis, real-human timing, or consented member-walk validity. |

Two current-tree mismatches are especially load-bearing:

1. voice_turn_shadow_decision is a client diagnostic event and is emitted in the component, but
   app/api/telemetry/client/route.ts does not admit it on this branch. A3 may not assume a server
   record exists merely because the browser called the logger.
2. “Fire-and-forget” and “caught on failure” are valuable failure properties, but neither proves
   that shared computation, I/O, or awaited setup had zero latency effect.

The latest sibling evidence also sharpens one domain law without acquiring CI-01 authority. Smart
Turn completion failed to distinguish seven complete-but-continuing cases from implicit yields.
TURN-03 therefore admitted an observed-corpus shadow candidate in which predictive evidence may
extend waiting but may not independently seize the floor; ambiguous handoff remains bounded by
the member-selected Conversational Space ceiling. A3 preserves that asymmetry as research
evidence, not as a global policy or a live rule.

A3 records those facts; it does not repair them.

## 6. Candidate topology

~~~mermaid
flowchart TB
    L["Live conversation path"]
    E["Bounded one-way event mirror"]
    J["Isolated shadow journal"]
    C["Temporal cut builder"]
    P["Independent projectors"]
    A["Attestations and ephemeral inspection"]
    O["Later outcome events"]
    X["Content-minimized comparison record"]

    L --> E
    E --> J
    J --> C
    C --> P
    P --> A
    L --> O
    O --> J
    A --> X
    J --> X
~~~

The arrows do not return to the live path.

The candidate architecture has four planes:

| Plane | Responsibility | Forbidden |
|---|---|---|
| **Live plane** | Continue current conversation and emit already-authorized bounded facts | Await a shadow projection, read a shadow result, or alter behavior because shadow is available |
| **Boundary plane** | Copy allowlisted events across a one-way seam | Retrieve extra member data, perform synthesis, share a live transaction, or backpressure the encounter |
| **Shadow plane** | Seal source cuts, run independent projectors, attest results, receive later outcomes | Prompt injection, endpointing, dispatch, rendering, memory / setting writes, policy mutation |
| **Inspection plane** | Compare facts, display authorized ephemeral detail, export benchmark-ready records | Become a retrieval source, member profile, training corpus, or control dashboard |

## 7. The synthesizer is a coordinator, not a model

The name “synthesizer” can suggest one model that receives everything and authors a unified story.
A3 rejects that interpretation.

The coordinating function may:

- validate encounter and exchange scope;
- select a temporally valid source cut;
- invoke one projector with its closed allowlist;
- record versions, dependencies, refusals, and timings;
- seal the projector result;
- and later join that sealed result to observable outcomes.

It may not:

- combine all witness payloads into a generic context bag;
- decide which source is true by confidence arithmetic;
- rewrite one projector from another projector's prose;
- invoke canonical MAIA cognition;
- generate an alternate response;
- resolve member identity, consent, or room policy;
- retrieve additional history;
- or make a cross-domain action recommendation.

The coordinated “field” is visible through references and relations among records. It is not
materialized as one mutable object.

## 8. Three gates that must keep distinct names

A3 sharpens the word “admission,” because using it for all boundaries would quietly expand MIPA.

| Gate | Question | Authority |
|---|---|---|
| **Source custody eligibility** | Was this witness already lawfully produced and made available under its native consent, room, sovereignty, and retention law? | Native source contract |
| **Projector eligibility** | May this exact witness family, origin, scope, lifetime, and standing enter this purpose-specific projector? | Projector contract |
| **MIPA disposition** | May a separately registered candidate participate in canonical cognition? | CanonicalTurn / MIPA only |

A hearing signal can be eligible for a floor projector without becoming a cognition participant.
A Gestalt projection can exist in shadow without being registered with MIPA. MIPA-admitted memory
can be referenced by a shadow Gestalt projector only within the same lawful aperture; its admission
does not grant the shadow worker independent retrieval authority.

## 9. Source aperture law

The shadow plane has **no collection or retrieval authority**.

For an encounter run, its maximum source aperture is:

~~~text
already-lawful live-turn material
plus explicitly authorized benchmark fixtures
minus any source excluded by sanctuary, consent, room, expiry, or projector policy
~~~

It may never be wider merely because shadow analysis would be interesting.

Consequences:

1. If sanctuary or a recall preference prevented a source from loading, shadow may not fetch it.
2. If the live path never had lawful access to raw audio, shadow may not create a second capture.
3. If a source exists only on another research branch, citing it does not make it available.
4. If a witness is mixed-origin and cannot be partitioned, the projector refuses it.
5. If source lineage is missing, the record is absent or invalid; a default narrative may not
   replace it.
6. Explicit benchmark fixtures must carry their own provenance and may not be relabeled as member
   evidence.

## 10. Initial projector input matrix

This is an allowlist candidate, not a runtime registry.

| Witness family | Floor | Gestalt | Relational act | Expression | Outcome join |
|---|:---:|:---:|:---:|:---:|:---:|
| direct member hold / release / current speech | yes | reference only | yes | interruptibility only | yes |
| selected conversational space / mode | yes | no | yes | yes | yes |
| bounded speech, silence, overlap, acoustic, semantic continuation evidence | yes | temporal reference only | through sealed floor result only | through sealed floor result only | yes |
| current member utterance and correction relations | no | yes | yes | no | yes |
| MIPA manifest and admitted source references | no | yes, if within same aperture | through standing-resolved Gestalt only | no | comparison only |
| governed historical evidence and typed relations | no | yes, if already loaded | through Gestalt only | no | comparison only |
| system-inferred PFI / field scalars | no | held initially | held initially | held initially | observation only |
| current FieldContext prompt block | no | no | no | no | live-path observation only |
| MAIA's current response | no | no for the same exchange | no for the same exchange | yes, only after cognition | yes |
| later member act | no for the sealed projection | no for the sealed projection | no for the sealed proposal | no for the sealed envelope | yes |
| prior outcome / telemetry accumulation | no | no | no | no | comparison only |

PFI / field scalars are held in the minimum A3 architecture because the current FieldContext
combines sources, includes partial synthetic defaults, and lacks claim-level lineage. A later
source-family contract may admit specific partitioned witnesses. A3 does not reject those
faculties; it refuses to launder them through the shadow field.

## 11. Temporal cut and seal law

The most important A3 protection is temporal:

> **A projection evaluated against what happened next must be frozen before what happened next is
> available to that projector.**

Every run must distinguish at least:

| Time / order fact | Meaning |
|---|---|
| event sequence | Monotonic order within the source that produced the event |
| occurred at | When the source says the event occurred |
| observed at | When the producing observer detected it |
| available at | When the shadow boundary could lawfully see it |
| cut at | The latest event included in the projector input |
| sealed at | When the projection and its dependency digest became immutable |
| valid until | Expiry or invalidation boundary |
| outcome occurred at | When the later member / system event happened |
| joined at | When the outcome was associated with the frozen projection |
| clock domain | Client monotonic, client wall, server monotonic, server wall, model clock, or fixture clock |

Wall-clock timestamps from different devices are not silently comparable. A future implementation
must either establish a bounded clock relationship or rely on source sequence plus explicit
correlation events. Unknown clock order yields CLOCK_UNRESOLVED, not a guessed chronology.

The basic prospective invariant is:

~~~text
all input.availableAt <= cutAt
cut is immutable
projection.sealedAt precedes outcome availability in a proven order
outcome is joined only after projection sealing
~~~

### Late evidence

A witness arriving after the cut cannot mutate the sealed record. It may:

- create a later projection revision;
- cite the prior projection as superseded;
- preserve both versions for inspection;
- and mark which version, if any, was genuinely prospective.

The revised projection may not be scored against an outcome it had already seen.

## 12. Timing classes

Every projection comparison needs one timing class.

| Class | Definition | Claim it may support |
|---|---|---|
| **PROSPECTIVE_SHADOW** | Projection sealed before the outcome under a proven clock / sequence relation | Predictive quality and measured shadow runtime |
| **SEALED_INPUT_REPLAY** | Computed later, but only from an immutable pre-outcome source cut | Offline semantic / policy comparison, not live latency |
| **RETROSPECTIVE_DIAGNOSTIC** | Computed after the outcome or with access to later material | Qualitative debugging only |
| **TEMPORALLY_INVALID** | Order, cut, or leakage cannot be proven | No performance or predictive claim |

This distinction lets A3 remain operationally isolated without pretending a delayed replay was a
real-time participant.

## 13. Shadow run lifecycle

The conceptual run has append-only transitions:

| State | Meaning |
|---|---|
| **CREATED** | Encounter / exchange scope and contract versions are known |
| **CUT_SEALED** | Eligible witness references and source watermark are immutable |
| **PROJECTED** | One or more independent projectors returned a closed result or refusal |
| **ATTESTED** | Dependency, output, timing, and isolation facts are sealed |
| **OUTCOME_PENDING** | No later event has yet been joined |
| **COMPARED** | Predeclared outcome window closed and a comparison record was emitted |
| **INVALID** | Scope, lineage, time, isolation, or integrity failed |
| **EXPIRED** | Inspection lifetime elapsed; durable content-minimized manifest may remain if authorized |

No state is rewritten. Correction, invalidation, and supersession append relations.

## 14. Independent projector graph

A3 preserves A2's differentiated projectors.

| Projector | Reads | Produces | May not read or cause |
|---|---|---|---|
| member-authority normalizer | direct member / UI acts and exact recognition references | scoped authority facts | model confidence as a substitute for the member act; any behavior |
| floor projector | authority, current hearing witnesses, selected space, bounded session rhythm | one A2 floor state plus reasons / uncertainty | Gestalt, response intent, endpointing, transcript commit, dispatch |
| Gestalt projector | lawful current evidence, admitted historical references, typed relations, corrections, counterevidence | disposable A2 Gestalt items and standing | floor action, personality truth, memory write, current MAIA output as self-corroboration |
| relational-act projector | authority, sealed floor projection, standing-resolved Gestalt, selected mode | one primary act candidate, alternatives, warrant, restraint | wording, model invocation, floor seizure |
| expression-envelope projector | canonical MAIA output, admitted act proposal, current authority / floor, selected voice policy | form, length, pacing, prosody, silence / acknowledgment eligibility | changing meaning, dispatch, ignoring re-entry |
| outcome observer | subsequent direct events and exact source references | outcome observations | revising the sealed projection, policy promotion, memory write |

The floor and Gestalt projectors may run independently from the same cut. The relational-act
projector may consume only sealed upstream projections, never their mutable working state. The
expression projector is post-cognition by design.

## 15. Projection attestations

Each projector result requires a content-minimized attestation. Conceptually it records:

- projection identity and projection contract version;
- shadow run, encounter, exchange, room, identity posture, and sovereignty references;
- projector name, code version, policy version, and model identity where applicable;
- source-cut identity, watermark, and dependency digest;
- input witness references, origin classes, revisions, expiry decisions, and content-free digests;
- projection state code and closed reason codes;
- measurement uncertainty distinct from epistemic standing;
- supporting, contesting, correction, and supersession references;
- generated, sealed, valid-until, and invalidated times with clock domains;
- timing class;
- failure, omission, refusal, or partial-coverage facts;
- candidate MIPA disposition only if a separately registered output actually approached MIPA;
- causal-isolation declaration and behavior-reader count;
- output digest and authorized ephemeral-inspection reference, never a durable prompt body.

The attestation is not the projection content. It is evidence that a particular projector produced
or refused a particular version from a particular source cut.

## 16. Cross-projector reason codes

Projector-specific vocabularies remain separately versioned. A common refusal layer needs at
least:

~~~text
OK
NO_ELIGIBLE_MATERIAL
MISSING_REQUIRED_WITNESS
EXPIRED_WITNESS
SCOPE_MISMATCH
SOVEREIGNTY_MISMATCH
MIXED_ORIGIN_UNPARTITIONED
LINEAGE_BROKEN
CLOCK_UNRESOLVED
CONFLICT_UNRESOLVED
PROJECTOR_FAILURE
OUTPUT_WITHHELD
INGRESS_DROPPED
ISOLATION_UNPROVEN
TEMPORAL_LEAKAGE
~~~

A refusal is a valid observation. It may not be silently replaced by a weaker default.

## 17. Shadow run manifest

The run manifest is the cross-projector coordination record. It may contain:

- run / encounter / exchange references;
- build and contract versions;
- source families considered, held, refused, expired, and missing;
- sealed source-cut digest;
- projector identities and attestation references;
- timing classes and clock-health facts;
- comparison status;
- isolation evidence;
- persistence / expiry class;
- and aggregate counts.

It may not contain:

- one generic witness payload;
- transcript or prompt text;
- acoustic frames;
- memory bodies;
- free-form Gestalt or relational inference prose;
- model chain-of-thought;
- a generated alternative response;
- or a serialized field block suitable for prompt insertion.

The manifest is a map of the observation. It is not the observed conversation.

## 18. The four-panel comparison record

A3's principal output is one inspectable comparison whose panels remain distinct.

### Panel A — what the live path did

Only observed facts belong here:

- capture / transcript event sequence;
- actual commit / dispatch boundary and trigger;
- canonical route, surface, tier, and manifest references where available;
- response request / start / completion facts;
- playback start, interruption, abort, and completion facts;
- actual settings and policy versions;
- structure-only response observations with their own inference provenance;
- and content digests where lawful.

The panel does not say the live act was correct.

### Panel B — what each witness observed

This panel lists:

- witness identities and source families;
- origin kinds;
- source windows and availability;
- expiry / invalidation decisions;
- uncertainty and coverage;
- source-native custody status;
- projector eligibility;
- and missing / dropped / refused evidence.

“No witness row” does not mean the event did not happen. Missingness is first-class.

### Panel C — what the synthesizer projected

This panel lists each independent projection:

- state or act code;
- reason codes;
- evidence / relation references;
- standing and measurement uncertainty;
- timing class;
- expiry;
- revisions / supersession;
- and whether the projector refused.

It contains no command and no alternate response.

### Panel D — what the member observably did next

Candidate outcome observations include:

~~~text
MEMBER_CONTINUED
MEMBER_EXPLICITLY_HELD
MEMBER_EXPLICITLY_YIELDED
MEMBER_REENTERED
MEMBER_INTERRUPTED_MAIA
MEMBER_CORRECTED
MEMBER_REJECTED
MEMBER_ADOPTED
MEMBER_REFINED
NO_OBSERVABLE_MEMBER_ACT_IN_WINDOW
CAPTURE_OR_CORRELATION_GAP
~~~

Semantic outcomes such as correction, adoption, or rejection must cite the direct member act and
preserve detector uncertainty. Silence, topic change, or absence of correction is not adoption.

## 19. Outcome-window law

“What happened next” has different horizons by domain. A3 does not collapse them.

| Projection | Candidate outcome horizon | Example observable relation |
|---|---|---|
| floor | milliseconds to several seconds | member continued before / after live commit; re-entry overlap |
| relational act | the next member response or correction | direct adoption, rejection, repair signal |
| Gestalt | one or more subsequent member turns under a declared bound | returned thread, correction, novelty, contradiction |
| expression | response lifecycle and immediate re-entry | member interruption, response abort, playback completion |

Every benchmark later built on A3 must predeclare its outcome window. Analysts may not extend a
window until a desired outcome appears.

## 20. Observation is not adjudication

A3 creates comparable facts. It does not decide conversational quality.

Examples:

- member continuation after a live transcript commit is an observable collision candidate, not
  automatically proof of harmful interruption;
- member silence after a relational proposal is not consent;
- a response-shape classifier saying “mirror” is a system inference, not a relational fact;
- a later return to a subject may support continuity, but does not prove an earlier Gestalt
  projection was complete;
- a model and the live path agreeing does not establish either as correct.

Human adjudication, fixture truth, and metrics belong to A4 under case-specific law. A3 preserves
the evidence required for that adjudication.

## 21. No counterfactual response generation

A3 deliberately refuses the most tempting experiment:

~~~text
shadow projection
    → second MAIA prompt
    → alternative response
    → compare eloquence
~~~

That experiment would:

- create a second cognition path;
- expose additional data to a model;
- confound act selection with wording quality;
- produce MAIA output that could contaminate later analysis;
- and tempt evaluators to score style instead of relational fit.

A3 may compare an abstract RelationalActProposal with a separately observed structure of the live
response. It may not ask another model to write what MAIA “would have said.”

## 22. Authority isolation contract

A future shadow runtime must establish all of the following:

1. **Zero behavior readers.** Shadow outputs have no consumers in prompt assembly, MIPA inputs,
   endpointing, transcript commit, model routing, response generation, rewriting, TTS, playback,
   settings, memory writeback, or learning.
2. **One-way dependency graph.** The live path may emit bounded facts. No shadow package, store,
   callback, feature flag, or queue result is imported back into live decision modules.
3. **Separate permissions.** Shadow credentials may append to an isolated observation store and
   read only explicitly mirrored records. They cannot write live conversation, memory, settings,
   policy, or producer-registry state.
4. **No shared mutable decision state.** Projectors cannot mutate live refs, caches, session
   thresholds, response plans, or route metadata.
5. **No hidden promotion.** Dashboards, analyst actions, repeated agreement, or batch jobs cannot
   convert a result into policy.
6. **Kill independence.** Disabling, crashing, corrupting, or deleting the shadow runtime changes
   no live decision or response envelope.

The reader inventory must be manifestable. “We know nobody reads it” is not sufficient.

## 23. Operational non-interference contract

The preferred future shape is an out-of-process worker consuming a bounded, one-way journal.
Architecture requirements:

- live publication is non-awaiting and non-throwing;
- a full or unavailable queue drops the shadow record with an observable counter rather than
  blocking the encounter;
- no live database transaction includes a shadow write;
- no shadow model runs on the live event loop;
- CPU, RAM, GPU / MPS, disk, and network use are separately bounded;
- shadow storage and connection pools are separate from response-critical pools;
- projector retries remain in the shadow plane;
- replay and batch work cannot run under live-serving priority;
- kill / fault injection is exercised before any member walk;
- and latency / error distributions with shadow disabled and enabled are compared.

No numeric overhead budget is frozen in A3. A later implementation lane must declare one before
measurement, not after seeing the result.

The current browser fetch pattern is useful as a non-throwing event emitter, but an HTTP request
still consumes browser and server resources. It is not accepted as zero-overhead by assertion.

## 24. Live equivalence evidence

Because model responses may be stochastic, “the words were identical” is not always a valid
non-interference test. A future implementation should compare the strongest deterministic
boundaries available.

| Boundary | Candidate equivalence evidence |
|---|---|
| floor / endpointing | identical settings, timers, commit triggers, dispatch sequence, and endpoint decisions |
| cognition ingress | identical route, registered producer candidates, MIPA dispositions, prompt / request digest, model and tier selection |
| expression | identical response identity, render request, voice profile, playback control events |
| persistence | identical live memory / settings / relationship write set |
| operations | predeclared p50 / p95 / p99 latency and error-rate comparison; resource saturation and queue-drop evidence |

The shadow system must never make a nondeterministic model call appear equal by comparing only the
final prose.

## 25. Failure behavior

Shadow failures fail in two directions:

> **Open for the live conversation; closed for the evidence claim.**

| Failure | Live result | Shadow result |
|---|---|---|
| event mirror unavailable | unchanged | ingress drop / missing coverage recorded where possible |
| queue full | unchanged | record dropped; never retried through live request |
| worker crash | unchanged | run incomplete |
| projector timeout | unchanged | PROJECTOR_FAILURE |
| missing / expired witness | unchanged | refusal or partial projection; no default |
| mixed origin | unchanged | MIXED_ORIGIN_UNPARTITIONED |
| broken lineage | unchanged | invalid projection |
| unresolved clock order | unchanged | comparison cannot be prospective |
| outcome unavailable | unchanged | OUTCOME_PENDING or gap |
| shadow store unavailable | unchanged | no durable claim that the run completed |
| attempted behavior read | deployment refused / alert | isolation falsified |

“Graceful degradation” may not invent a projection, suppress a missingness fact, or reuse a stale
result.

## 26. Privacy, custody, and retention

A3 adopts the manifest restraint from canonical-turn and memory-provenance work, with one added
warning:

> A digest is a comparison handle. It is not automatically anonymization.

Low-entropy strings can be guessed, stable hashes can become cross-context identifiers, and even
content-free event sequences can reveal behavior. A future implementation must adjudicate whether
to use source-owned opaque references, scoped keyed digests, shorter-lived correlation ids, or no
digest at all.

Candidate retention classes:

| Class | Content | Retention posture |
|---|---|---|
| durable manifest | versions, opaque refs, codes, counts, timings, coverage, digests if approved | custody-reviewed; never retrieval or learning input |
| ephemeral inspection | projection detail required for an authorized researcher to inspect one run | short TTL, access-controlled, not indexed into MAIA memory |
| benchmark fixture | synthetic or explicitly consented and separately admitted case data | governed by A4 / corpus contract |
| forbidden durable copy | raw audio, transcript, prompt, memory body, free-form psychological inference, alternate response | absent unless a later explicit custody lane authorizes it |

A3 creates none of these stores.

## 27. Missingness and coverage

The shadow system must be able to distinguish:

~~~text
source produced no qualifying event
source was not active on this surface
source was forbidden by policy
source event expired
event mirror dropped the record
correlation failed
projector refused the witness
projector failed
observer has no evidence either way
~~~

Collapsing those states into null would make a missing microphone frame look like silence, a
missing correction detector look like member agreement, or an absent memory source look like no
relevant history.

Coverage facts therefore belong in every run manifest and every later aggregate.

## 28. Correction, contest, and supersession

The shadow journal is append-only.

~~~text
new member correction or counterevidence
        ↓
append new witness / relation
        ↓
invalidate current dependent projection
        ↓
produce a new projection from a new sealed cut
        ↓
retain the old projection as historical comparison evidence
~~~

The old projection is not rewritten to look wiser in hindsight. A benchmark must be able to see
that the system was wrong, uncertain, or under-informed at the time.

## 29. Determinism, replay, and model projectors

Deterministic projectors owe:

- same source cut + same versions + same configuration = same output;
- stable ordering and digest behavior;
- explicit refusal on unknown fields;
- and hostile mutation tests that make the comparison go non-zero.

Model-backed projectors owe:

- exact repository / revision / weight identity and license custody;
- local artifact checksum;
- runtime and dependency versions;
- seed and determinism posture where applicable;
- raw output preservation only under the authorized evidence contract;
- no network model resolution;
- and explicit acknowledgement where repeated runs may vary.

Replay must never be mislabeled as prospective runtime evidence. TURN-03's exact-custody,
same-corpus comparator pattern is useful prior art for this requirement.

## 30. Causal-isolation falsifiers

The A3 architecture fails if a future design permits any of the following:

1. **Whole-field blob:** one mixed field payload is assembled or registered as a single producer.
2. **Live readback:** a prompt, endpoint, response, expression, memory, setting, or policy reader
   can access shadow output.
3. **Synchronous dependency:** the live path awaits shadow identity resolution, projection,
   persistence, or acknowledgement.
4. **Backpressure:** a full queue, slow worker, or store failure delays the member encounter.
5. **Shared mutation:** shadow code changes a live ref, cache, transaction, threshold, or plan.
6. **Aperture expansion:** shadow retrieves data the lawful live / fixture scope did not provide.
7. **Outcome leakage:** a projector sees the member's later act before its evaluated result seals.
8. **Mutable prediction:** a sealed projection is edited after later evidence arrives.
9. **Clock laundering:** uncorrelated client and server timestamps are treated as a proven order.
10. **Missingness laundering:** absent telemetry is interpreted as an observed negative.
11. **Mixed-origin laundering:** member, system inference, and MAIA output travel as one witness.
12. **Self-evidence:** MAIA's response corroborates the interpretation that generated it.
13. **Expired evidence:** a stale witness participates without a valid revision and source window.
14. **Correction blindness:** later correction cannot invalidate present use or remains detached
    from the historical projection.
15. **Alternate cognition:** A3 prompts a second MAIA to write a counterfactual response.
16. **Score sovereignty:** one confidence or aggregate score overrides origin, standing, or a
    constitutional failure.
17. **Durable projection memory:** a field projection becomes a future retrieval source.
18. **Learning by observation:** outcomes, recurrence, or analyst agreement automatically alter
    policy, member profile, threshold, or model.
19. **Unmeasured observer effect:** “fire-and-forget” is accepted as non-interference without
    latency, failure, and resource evidence.
20. **Kill coupling:** disabling shadow changes the live decision envelope or breaks a turn.
21. **Silent substitution:** a projector failure is replaced with a default psychological,
    relational, or floor claim.
22. **Inspection authority:** a dashboard action can promote a result into live use without a new
    governed lane.

Any one falsifier defeats a claim of causal isolation.

## 31. Evidence required before a future shadow member walk

A3 does not authorize a member walk. A successor would first owe:

- closed event and projector registries;
- complete reader inventory with behavior-reader count zero;
- source-aperture and sovereignty tests;
- temporal-cut and future-leakage tests;
- same-input deterministic tests where applicable;
- malformed / mixed-origin / expired witness refusals;
- correction and supersession tests;
- queue-full, worker-crash, store-down, and projector-timeout fault injection;
- shadow-disabled versus enabled live-equivalence evidence;
- declared operational overhead budget and measured distribution;
- privacy / retention / deletion adjudication;
- explicit consent posture for any member data;
- and a kill switch whose activation changes no live behavior.

Synthetic and frozen-fixture runs should precede any consented encounter.

## 32. Candidate future implementation sequence — not authorized

If CI-02 or another successor is separately opened:

1. **Offline contract fixtures** — no live data; validate cuts, reasons, expiry, correction, and
   comparison assembly.
2. **Pure projector harnesses** — one projector at a time; no generic field assembler.
3. **Content-minimized run / attestation emitter** — still offline; hostile mutation tests.
4. **One-way event mirror with synthetic traffic** — prove drop, failure, and resource isolation.
5. **Sealed-input replay over already-governed records** — establish semantic comparison without
   live latency claims.
6. **Prospective shadow under explicit consent** — only after reader-zero and non-interference
   evidence.
7. **A4 benchmark execution** — score the ecology while preserving constitutional failures.

No step above grants live influence. Any request for such influence belongs to a separate
authority lane.

## 33. Handoff to A4

A3 gives A4 the minimum inspectable unit:

~~~text
sealed source cut
    + live-path facts
    + witness coverage
    + independent projection attestations
    + later outcome observations
    + causal-isolation evidence
~~~

A4 must decide:

- case and population labels;
- outcome windows;
- human adjudication requirements;
- metrics and denominators;
- constitutional failure classes that cannot be averaged away;
- how prospective shadow, sealed replay, and retrospective diagnosis are reported separately;
- and what result would justify continued research versus rejection.

A3 does not define a composite “conversational intelligence score.”

## 34. How the earlier R&D enters synergistically

| Prior work | Contribution to A3 | Power withheld |
|---|---|---|
| TURN-01 / TURN-02 | direct member authority, floor witnesses, conservative recommendation law | endpointing or speech |
| TURN-03 | exact-custody acoustic comparators, permanent adversarial pause cases, and asymmetric ownership research | model promotion or live floor authority |
| CMT-01 / MIPA | closed identities, dispositions, content-free manifest, hostile-diff precedent | ownership of non-cognitive floor evidence |
| memory provenance | observational-only and non-retrieval manifest law | shadow access to new memory |
| relational standing research | typed relations, descent, correction, disposable projection | member truth or live Gestalt |
| Care grammar | candidate relational-act vocabulary | compulsory response sequence |
| AIN shape telemetry | post-response structural observations | proof of relational fit or rewrite authority |
| full-duplex research | timing, overlap, abortability, acknowledgment, prosody questions | replacement cognition |

The synergy is methodological as much as functional: exact custody, separation of powers,
preserved falsifiers, and outcome comparison become one research discipline.

## 35. A3 disposition and stop

A3 establishes this architecture candidate:

> **Shadow synthesis is a temporally sealed, one-way comparison ecology. It coordinates
> differentiated projectors over already-lawful witnesses, records content-minimized
> attestations, and joins later outcomes only after projections are frozen. Its first proof
> obligation is not intelligence but isolation.**

A3 does not authorize:

- event schemas or emitters;
- journal, queue, worker, process, table, or dashboard creation;
- runtime witness or projection types;
- a generic field assembler;
- model installation or invocation;
- TURN-03 integration;
- prompt or MIPA registry changes;
- response planning or alternate generation;
- endpointing, transcript commit, backchannel, dispatch, TTS, or playback changes;
- memory, relationship, setting, learning, or training writes;
- member-data collection or a shadow member walk;
- merge, deployment, or production use.

The next prepared act remains:

~~~text
CI-01 A4 — MAIA-CONVERSATION-BENCH-01 specification
~~~

A4 is not opened by this record.

## 36. Standing

~~~text
A3 synthesizer shape ................ COMPLETE · COORDINATOR, NOT MASTER MODEL
source aperture ..................... CLOSED · NO COLLECTION OR RETRIEVAL AUTHORITY
admission vocabulary ................ SEPARATED · SOURCE / PROJECTOR / MIPA
temporal cut and outcome seal ....... REQUIRED · FUTURE LEAKAGE INVALIDATES CLAIM
projector graph ..................... CANDIDATE DEFINED · NO RUNTIME TYPES
four-panel comparison ............... CANDIDATE DEFINED · NO STORE
counterfactual response ............. EXCLUDED
authority isolation ................. CONTRACT DEFINED · NOT IMPLEMENTED
operational non-interference ........ PROOF OBLIGATION DEFINED · NOT CLAIMED
privacy / retention ................. BOUNDARY DEFINED · NO CUSTODY GRANTED
learning promotion .................. EXCLUDED
A4 conversation benchmark ........... NOT OPENED
runtime / prompt / schema changes ... NONE
member-facing behavior .............. UNCHANGED
production .......................... UNTOUCHED
~~~
