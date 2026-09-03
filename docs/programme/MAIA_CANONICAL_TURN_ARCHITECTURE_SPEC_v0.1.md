# MAIA CANONICAL TURN — ARCHITECTURE SPECIFICATION v0.1

**Lane**: CMT-01 — Canonical MAIA Turn Construction
**Deliverable**: 2 of 2. Specification only. **No implementation is authorized by this document.**
**Predecessor**: `MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md` (same directory, commit `64849fe`)
**Adjudication carried forward** (Kelly, 2026-09-03):

```text
Candidate   C — a closed, typed, versioned turn object is the destination
            A — buildMaiaRuntimeContext retained as observation/registry instrumentation
            B — permitted only as migration scaffolding, never as the architecture
MIPA        (b) — Phase-0 architecture never made executable; CMT-01 is where it becomes so
D1          migration-critical; first implementation gate; not patched during spec work
Target      not "everything calls one function" — every turn that CLAIMS MAIA participation
            crosses one governed, enumerable participation boundary before cognition
```

**Status**: **APPROVED v0.1 (2026-09-03) subject to the §5.2 amendment below. Implementation authorized M0–M2 only.** M3 (authoritative cognition cutover) requires M0–M2 evidence presented and adjudicated. See §14-A.

---

## 0. THE STRUCTURAL DEFECT THIS SPEC CLOSES, STATED ONCE

`getMaiaResponse(req: MaiaRequest)` takes `meta?: Record<string, unknown> & {...}`
(`lib/sovereign/maiaService.ts:590`). Inside the service, `(meta as any)` appears **200 times**
reading **62 distinct keys**. `MaiaContext` (`lib/sovereign/maiaVoice.ts:10`) has 62 declared
fields, populated from that bag by hand, differently per tier.

Every divergence the census recorded — except D1, which is a consequence of the same thing one
level down — exists because **the channel through which a route tells cognition what MAIA is
thinking with is an open, untyped record that any route may populate and any tier may read.**
Routes invent participation on the way in; tiers invent it on the way through. Nothing can
enumerate it because nothing declares it.

The spec's single load-bearing move is therefore: **close the channel.** Replace the open bag
with a closed object that can only be constructed in one place, from registered producers,
under one adjudication, and that cognition can only read — never extend. Everything else in
this document is the consequence of that move, its migration, and its proof.

---

## 1. TWO OBJECTS, KEPT DISTINCT

Per ruling, these are not the same thing and must not collapse into one another:

| | `CanonicalTurn` | MIPA |
|---|---|---|
| **Is** | the closed structural object; the construction boundary | the rules governing what may enter that object |
| **Answers** | *what is in this turn?* | *why is it in, held, or out — under what authority, provenance, standing, consent, restraint?* |
| **Form** | TypeScript type + one constructor | a pure adjudication function over a producer registry + policy |
| **Owns** | shape, version, freeze | admission semantics, reason codes, policy version |
| **Risk if merged** | MIPA becomes the name of a giant context assembler | the turn object becomes an untyped bag with a policy label on it |

MIPA does not assemble. `CanonicalTurn` does not decide. The constructor calls MIPA; MIPA never
calls a loader.

---

## 2. THE INVARIANT

> **No live MAIA cognition invocation without canonical turn construction.**
>
> Every turn that claims MAIA participation — whether it reaches cognition through
> `getMaiaResponse()`, a room's own model call, or any future path — is constructed as exactly
> one `CanonicalTurn` object, by exactly one constructor, from producers that exist in exactly
> one closed registry, admitted under exactly one participation adjudication, and is provable
> after the fact by exactly one participation manifest.
>
> A turn that cannot be so constructed is refused. A producer that is not registered cannot
> enter. A tier that receives the object cannot extend it. A route that bypasses the constructor
> fails certification.

Corollaries the invariant makes structural (not disciplinary):

1. **Tiers vary cognition strategy, never the field.** FAST/CORE/DEEP receive the same frozen
   object. They may choose how to think with it. They may not decide what intelligence, memory,
   sovereignty boundaries, or participation rules exist in it. This dissolves the D1 *class*
   rather than repairing FAST's three missing guardrails.
2. **The constitutional floor is in the object, not appended by whoever remembers.** Prior art:
   `lib/maia/roomComposition.ts` NW-I01 — *"A floor a flag can remove is not a floor."*
3. **Rooms keep their legitimacy.** Now What's no-write contract is a *room policy carried in
   the turn*, not a reason to construct MAIA differently.
4. **Contraction is not regression.** The v1 producer registry seeds from the currently
   authorized field. Nothing removed by P3 returns because convergence made it convenient.

---

## 3. THE CANONICAL TURN BOUNDARY

### 3.1 Topology

```text
                        MEMBER / ROOM / SURFACE INPUT
                                    │
                    ┌───────────────▼────────────────┐
                    │  resolveCanonicalIdentity(req)  │  ← ONE resolver (§4.1)
                    └───────────────┬────────────────┘
                                    │ MemberIdentity
                    ┌───────────────▼────────────────┐
                    │  gatherCandidates(identity,     │  ← registered producers only (§5)
                    │    encounter, surface)          │    each returns CandidateBlock | null
                    └───────────────┬────────────────┘
                                    │ CandidateBlock[]
                    ┌───────────────▼────────────────┐
                    │  MIPA.adjudicate(candidates,    │  ← pure; policy vN (§6)
                    │    identity, encounter, policy) │
                    └───────────────┬────────────────┘
                                    │ { admitted, held, excluded }
                    ┌───────────────▼────────────────┐
                    │  constructCanonicalTurn(...)    │  ← THE boundary; freezes; emits manifest
                    └───────────────┬────────────────┘
                                    │ CanonicalTurn (frozen)
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
      getMaiaResponse(turn)   room.cognition(turn)   (future ingress)
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
    FAST    CORE    DEEP        ← strategy only; read-only access to turn
              │
              ▼
         expression
```

### 3.2 Where the boundary sits

**Above `getMaiaResponse()` and above the FAST/CORE/DEEP fork.** Not inside `maiaService`, not
inside any route. A new module boundary: `lib/maia/canonical-turn/`.

`buildMaiaRuntimeContext` (`lib/maia/maiaRuntimeContext.ts`) is **retained and relocated**: it
becomes the instrument the constructor calls *after* construction to emit `[MAIA/runtime]`, push
the substrate ring buffer, and produce the client-visible recognition signal. Its `addenda`
input is replaced by `turn.participation`. Its registry of routes survives as the seed of the
**ingress registry** (§8.3). It stops being described as "the required contract" — the
constructor is.

### 3.3 The object

```ts
// lib/maia/canonical-turn/types.ts — illustrative; names are proposals

export const CANONICAL_TURN_CONTRACT_VERSION = 'ct-1' as const;

export interface CanonicalTurn {
  readonly contractVersion: typeof CANONICAL_TURN_CONTRACT_VERSION;
  readonly turnId: string;                  // minted here; exchangeId semantics inherited
  readonly builtAt: string;                 // ISO

  readonly identity: MemberIdentity;        // §4 — discriminated union, never a bare claim
  readonly surface: SurfaceDescriptor;      // §9 — modality/client/transport; allowed to differ
  readonly encounter: PresentEncounter;     // input, session ref, room kind, room policy
  readonly sovereignty: SovereigntyState;   // sanctuary, memoryMode, gates applied (evidence)

  readonly floor: ConstitutionalFloor;      // §5.4 — mandatory; renderer appends; tiers cannot omit
  readonly participation: Participation;    // §6 — admitted / held / excluded, each typed
  readonly manifest: TurnParticipationManifest; // §7 — evidence, never content

  readonly cognitionRequest: CognitionRequest;  // mode, requested depth, includeAudio, voiceProfile
}

// The object is frozen (Object.freeze, deep) at construction. There is no setter.
// There is no `meta`. There is no `[key: string]: unknown`. There is no `extra`.
```

**What is deliberately absent**: any index signature; any `Record<string, unknown>`; any field
named `meta`, `extra`, `context`, `addenda`, or `raw`. The absence is the architecture. G3 (§8)
proves it stays absent.

### 3.4 Relationship to `contextAssembly.ts` (prior art, CANDIDATE, 2026-07-08)

`lib/maia/context-assembly/contextAssembly.ts` already states, as a candidate invariant: *"no
encounter surface constructs its own conversational intelligence; every surface obtains MAIA
through a Context Assembly that produces THIS shape."* Authority zero. One embodiment
(`roomComposition.ts`). Its two cited adjudication documents
(`CONTEXT_ASSEMBLY_INVARIANT_CANDIDATE_2026-07-08.md`, `CONTEXT_ASSEMBLY_SEAM_GAP_2026-07-08.md`)
**do not exist in this tree** — the same absence pattern as MIPA.

`CanonicalTurn` **absorbs** this candidate rather than competing with it: `AssembledBlock.key`
becomes `Participant.producerId` (now a closed union rather than a free string); `AssembledContext.sources`
becomes the manifest; `hasAnything` becomes `participation.admitted.length > 0`. The
candidate's stance — *a surface may situate, never synthesize* — is carried into MIPA as the
`authority` axis (§6.2). The seam-gap the candidate named is exactly the one §0 closes.

---

## 4. ALLOWED INPUTS

The constructor accepts **only** the following, and rejects any call that supplies anything else
(TypeScript: no excess properties; runtime: unknown key → `CanonicalTurnRefused('unknown_input')`).

### 4.1 Identity — a proven dependency, bound to an existing spec

The census left member resolution as unknown 10.5. The targeted read resolved it:

| Resolver | Verifies against `auth_sessions`? | Honors a bare claim? | Serving MAIA-claiming cognition at |
|---|---|---|---|
| `lib/auth/getMemberFromRequest.getMemberIdFromRequest` | ✅ cookie + `x-session-token`; **claim must match** | ❌ | `/list` (via `resolveIdentity.ts`), `sovereign/app/maia` |
| `lib/scribe/scribeAuth.getMemberIdFromRequest` | ✅ cookie + header | ❌ (no claim-match check) | `now-what/interview` (+30 importers) |
| `getCurrentSession()` alone | ✅ cookie only | ❌ | `between/chat` (then falls to `explorerId` / `anon:`), `relational-navigation` |
| `probeAuthPosture()` | ❌ **log-only; returns the bare `x-member-id` header** | ✅ | all 9 `living-field/*` files incl. `encounter` + `refine` |
| `bodyUserId \|\| getMemberIdFromRequest` | body **first** | ✅ | `voice/stream-conversation:637` → `MemoryBundleService.build({ userId })` `:1194` |

Two MAIA-claiming ingresses compose member material off an unverified identity. Refusal-03
(`tests/constitutional/refusal-registry/refusal-03-body-userid-not-trusted.ts:22`) states this
gap explicitly: *"passingDoesNotAuthorize: that every route USES this resolver."*

**The dependency is unavoidable, not incidental.** `CanonicalTurn.identity` carries
`status: 'verified' | 'anonymous' | 'guest'`. MIPA admits every member-about producer on
`status === 'verified'`. If a route may feed the constructor an identity it did not verify, the
manifest lies, every consent gate downstream keys off an impersonable id, and the object's
central promise — *we can prove what participated* — is false on those routes.

**Ruling this spec binds to, not re-adjudicates**: `docs/specs/AUTH_POSTURE_X_MEMBER_ID_2026-07-11.md`
§4 — *"Identity is derived only from an `auth_sessions`-backed credential… `x-member-id` is
never identity."* Its Phase 1 already plans to replace every `probeAuthPosture` site with
`getMemberIdFromRequest` and delete the probe. Therefore:

- `resolveCanonicalIdentity(req)` is a thin wrapper over **one** resolver:
  `lib/auth/getMemberFromRequest.getMemberIdFromRequest`. No other resolver may produce a
  `MemberIdentity`. The type is nominal (branded) so a string cannot be smuggled in.
- A route onboarding to the canonical turn adopts that resolver **as its onboarding step**. This
  is scope-neutral for `/list`, `sovereign/app/maia` (already on it); it *is* the auth-posture
  Phase 1 move for living-field and the body-first removal for voice-stream. The spec does not
  widen auth work — it sequences already-ratified auth work as a precondition of onboarding.
- `anonymous` and `guest` are **legitimate identity states**, not failures. `between/chat`'s
  anonymous mode survives; MIPA excludes all member-about producers for it with reason
  `no_verified_member`, and the manifest says so.
- The `lib/scribe/scribeAuth` duplicate is not repaired here; routes using it onboard by
  switching import. Recorded for a later cleanup lane.

```ts
type MemberIdentity =
  | { status: 'verified';  memberRef: MemberRef; memberId: VerifiedMemberId /* branded */ }
  | { status: 'anonymous'; anonRef: string }        // between/chat anon:<sessionId>
  | { status: 'guest';     guestKey: string };      // sovereign/app/maia guestKey
// Produced ONLY by resolveCanonicalIdentity(). Constructor input type is this union; a string is a compile error.
```

### 4.2 Present encounter

`{ input, sessionRef, exchangeId?, history? (bounded, current session), roomKind, roomPolicy, placeContext? }`.
`roomPolicy` is a typed object from a closed enum of room kinds
(`'sovereign_chat' | 'between' | 'now_what' | 'vision_studio' | 'living_field' | 'relational_navigation'`)
carrying `{ persists: boolean; memberAboutAllowed: boolean; fieldCompositionAllowed: boolean; ... }`.
Now What's *"persist nothing"* becomes `roomPolicy.persists === false`, honoured by the
persistence layer reading the turn — not by the room avoiding the constructor.

### 4.3 Surface descriptor

`{ modality: 'typed' | 'spoken'; client: 'web' | 'ios' | 'android' | 'desktop' | 'unknown'; transport: 'http' | 'sse'; streaming: boolean }`.
**Allowed to differ across surfaces.** Nothing in MIPA may branch on `client`. G7 (§8) proves it.

### 4.4 Sovereignty state

`{ sanctuary: boolean; memoryMode: MemoryMode; recallPrefs: { conversational, episodic } }` — resolved
by the constructor from member preferences, not passed by the route.

### 4.5 Cognition request

`{ mode: 'dialogue' | 'counsel' | 'scribe'; requestedDepth?: 'auto' | 'deep'; includeAudio; voiceProfile }`.
Tier selection remains **inside** cognition (it is strategy). The route may request depth; it
may not set tier.

### 4.6 What is NOT an allowed input

Any pre-rendered prompt block. Any addendum string. Any `memoryContext`. Any `memoryBundle`.
Any loader result. **Routes stop loading.** Producers load. This is the shape change that makes
the field enumerable: a route that wants a block in the turn must register a producer, not
build a string.

---

## 5. THE PRODUCER REGISTRY (what may exist)

### 5.1 Form

Evolution of `ADDENDA_SPECS` (`maiaVoice.ts:406–431`) — which is already the only enumerable
producer set in the tree — into the single declaration of everything that can enter a turn:

```ts
export const PRODUCER_REGISTRY = {
  'memory.atoms': {
    epistemicClass: 'member_placed',
    authority: 'situate',
    provenance: 'member_gesture',
    consentBasis: 'atoms.return_preference',
    requires: { identity: 'verified', notSanctuary: true },
    rooms: ['sovereign_chat', 'now_what', 'vision_studio'],
    load: loadAtomsProducer,             // (identity, encounter) => CandidateBlock | null
    registeredAt: '2026-09-03', registeredBy: 'CMT-01', reason: '...',
  },
  // ...
} as const satisfies Record<string, ProducerSpec>;

export type ProducerId = keyof typeof PRODUCER_REGISTRY;   // ← the closed union
```

`Participant.producerId: ProducerId`. A block whose id is not a key of the registry is a
**compile error** at every site that constructs a `Participant`, and a **runtime refusal** in
the constructor (belt and braces — `@ts-nocheck` exists on `/list/route.ts:1`, so the compiler
alone is not a gate there; G2 covers both).

Registry convention inherits `MAIA_ROUTE_REGISTRY`'s discipline verbatim: *adding an entry to
silence a failure is the wrong action* (`maiaRuntimeContext.ts:41–58`).

### 5.2 Epistemic class axis (proposed — ratify)

| Class | Meaning | Example producers |
|---|---|---|
| `constitutional` | the house's own standing discipline | floor, Interface Humility, speech-act boundary, platform boundary |
| `house_authored` | authored platform knowledge, not about the member | `PLATFORM_KNOWLEDGE_ADDENDUM`, place/room orientation |
| `member_authored` | the member's own words, verbatim or lightly formatted | current input, session history, journal/capture context |
| `member_placed` | material the member explicitly placed for MAIA | atoms, relational-context hand-off, breakthrough marks |
| `member_marked` | member-marked significance over system-retrieved material | episodic recall |
| `member_declared` | member-declared state or preference | mode, therapeutic framework, reflection lens, program position |
| `system_retrieved` | retrieved without interpretation, consent-gated | conversational recall, member web, relationship anamnesis |
| `system_computed` | computed state anchors from member signals | spiral snapshot, Wu Xing snapshot, bridge, forward readiness, governor |
| `system_inferred` | inference about the member | memory-influence plan, cognitive profile, elemental classification, field wisdom |
| `practitioner_authored` | a practitioner's field/program, authorized for this member | practice field, lesson, studio, position |
| `collective` | AIN / knowledge-gate / corpus-derived, not about this member | knowledge gate, AIN knowledge chunks, field wisdom (collective half) |

The `system_inferred` class is the one MIPA treats most restrictively (§6.3), and it is the class
CDPI will eventually produce into. Its participation contract is the artifact CDPI's activation
gate names.


### 5.2-A — AMENDED AXIS (Decision 2, 2026-09-03) — supersedes the single scalar above

The table in §5.2 mixed three properties into one field: who authored it, how it was formed,
and what authority it carries. That risks re-laundering what Phase 0 separated. The closed
runtime type carries **three fields**, never one scalar and never a slash-compound value:

```text
authoredBy           house | member | practitioner | system | collective
participationClass   constitutional | authored | placed | marked | declared
                     | retrieved | computed | inferred | collective
authority            situate | compute | infer
+ provenance, consentBasis (unchanged)
```

Rules the axis makes structural:

- **A member gesture alters participation/authority, never authorship.** A member-marked MAIA
  interpretation is `authoredBy: system · participationClass: marked · authority: infer`. A
  journal the system retrieved is `authoredBy: member · participationClass: retrieved ·
  authority: situate`.
- **Mixed producers partition** into separately classifiable `CandidateBlock`s before MIPA.
  Registry entries that carry mixed material today (`member.episodic_recall`,
  `retrieved.conversational_recall`, `retrieved.significant_moments` — each block holds member
  and MAIA text) are marked `partitionPending` and owe a partition at M3.
- The manifest records **both** `authoredBy` and `participationClass` per admitted row.

Implemented: `lib/maia/canonical-turn/types.ts` (`AuthoredBy`, `ParticipationClass`,
`Authority`), `producerRegistry.ts` (38 producers, each on all three fields), R27 (structural:
every entry carries both; no slash values).

### 5.3 v1 seed — the currently authorized field, and nothing more

The v1 registry is populated by **union of what is live today**, each entry classified, each
entry admitted **only where it is admitted today**. Contraction caused by P3 stays contracted.
The seed (from the census §4.2, §5 and the `ADDENDA_SPECS` read):

| Producer (proposed id) | Today in `/list` | Today in `between/chat` | Today in FAST | CORE/DEEP-repair (`ADDENDA_SPECS`) | Class |
|---|:-:|:-:|:-:|:-:|---|
| `floor.runtime_prompt` | ✓ | ✓ | ✓ | ✓ | constitutional |
| `floor.interface_humility` | — | — | **✗ (D1)** | ✓ | constitutional |
| `floor.platform_boundary` | — | — | **✗ (D1)** | ✓ | constitutional |
| `floor.speech_act_boundary` | — | — | **✗ (D1)** | ✓ | constitutional |
| `house.platform_knowledge` | — | — | ✓ | ✓ | house_authored |
| `house.place` | ✓ | · | ✓ | ✓ | house_authored |
| `member.input`, `member.session_history` | ✓ | ✓ | ✓ | ✓ | member_authored |
| `member.journal_context`, `member.capture_context` | · | ✓ | · | ✓ | member_authored |
| `member.atoms` | ✓ | · | ✓ | ✓ | member_placed |
| `member.relational_context` | ✓ | · | ✓ | ✓ | member_placed |
| `member.episodic_recall` | ✓ | · | ✓ | ✓ | member_marked |
| `declared.mode`, `declared.therapeutic_framework`, `declared.reflection_lens`, `declared.epistemic_path` | mode ✓ / others · | ✓ | ✓ | ✓ | member_declared |
| `declared.scribe_session_discussion` | ✓ | · | ✓ | ✓ | member_declared |
| `retrieved.conversational_recall` | ✓ | · | ✓ | ✓ | system_retrieved |
| `retrieved.member_web` | ✓ | · | ✓ | ✓ | system_retrieved |
| `retrieved.relationship_memory` | · | ✓ | ✓ (FAST-only path) | — | system_retrieved |
| `retrieved.significant_moments` | · | ✓ | · | · | system_retrieved |
| `retrieved.astrology` | ✓ (`astrologyAddendum`) | ✓ (`astrologicalContextAddendum`) | ✓ | ✓ | system_retrieved (member-supplied birth data) |
| `computed.spiral_snapshot`, `computed.wuxing_snapshot`, `computed.bridge_snapshot` | wuxing ✓ / others · | ✓ | ✓ (spiral, wuxing) | ✓ | system_computed |
| `computed.forward_readiness` | ✓ | ✓ | ✓ | **✗** | system_computed |
| `computed.governor` | · | ✓ | ✓ | ✓ | system_computed |
| `computed.relationship_mode` | · | ✓ | · | ✓ | system_computed |
| `inferred.memory_influence` | ✓ | ✓ | ✓ | **✗** | system_inferred |
| `inferred.cognitive_scaffolding`, `inferred.wisdom_routing`, `inferred.selflet` | · | · | ✓ | · | system_inferred |
| `inferred.field_wisdom` | · | ✓ | ✓ | ✓ | system_inferred / collective |
| `practitioner.practice_field`, `practitioner.studio` | ✓ | · | ✓ | studio ✓ / practice ✗ | practitioner_authored |
| `collective.knowledge_gate` | ✓ | ✓ | ✓ | ✓ | collective |
| `collective.knowledge_field` (AIN chunks) | · | via orchestrator | ✓ | · | collective |
| `computed.consultation` | · | · | · | ✓ (DEEP) | system_computed |
| `youth.support`, `youth.prompt` | · | · | ✓ | · | house_authored (age-gated) |

**Reading this table honestly**: the "✓/·" pattern is *the seed policy*, not a target. §6.4 says
how the disjoint cells are handled. The three D1 `✗` cells and the two CORE/DEEP `✗` cells for
`forward_readiness` / `memory_influence` are the first things the policy must adjudicate
explicitly rather than inherit — because inheriting them would freeze a sovereignty gap into the
canonical object.

Rows marked "via orchestrator" name producers that `between/chat` reaches through
`maiaOrchestrator` (AIN knowledge, MCP context, memory bundle). They register like any other.

### 5.4 The constitutional floor is a producer class with special standing

`floor.*` producers are `mandatory: true` — MIPA cannot hold or exclude them; the renderer
appends them **last** in every tier (mirroring `appendAllContextAddenda`'s "governs everything
above it" ordering and `roomComposition`'s "room's hard limits keep the final word"). A tier that
does not render `floor.*` cannot exist, because the tier does not render — the shared renderer
does (§6.5). G1 proves it.

---

## 6. MIPA — THE PARTICIPATION SEAM (what may enter)

### 6.1 Signature

```ts
export function adjudicateParticipation(input: {
  candidates: CandidateBlock[];          // from registered producers only
  identity: MemberIdentity;
  encounter: PresentEncounter;
  sovereignty: SovereigntyState;
  policy: ParticipationPolicy;           // versioned; pp-1
}): Participation;                       // { admitted, held, excluded }

// PURE. No I/O. No loader calls. No clock beyond what is passed. Deterministic for a fixture.
```

Purity is what makes MIPA certifiable by fixture and makes the manifest reproducible.

### 6.2 The four axes every candidate is adjudicated on

| Axis | Question | Source |
|---|---|---|
| **provenance** | where did this come from, and is that chain intact? | producer spec + loader-reported provenance |
| **authority** | does it situate or does it synthesize? | producer spec `authority: 'situate' \| 'compute' \| 'infer'` |
| **eligibility** | is it permitted for this identity status / room / sovereignty state? | producer `requires` ∩ turn state |
| **restraint** | even if eligible, does policy hold it for this turn? | policy rules (e.g. cap on `system_inferred` per turn; sanctuary; recall prefs) |

### 6.3 Outcomes and reason codes

```text
ADMITTED   { producerId, block, reason: 'eligible' }
HELD       { producerId, reason: 'loader_error' | 'restraint:<rule>' | 'sanctuary' | 'recall_pref_off'
             | 'room_policy' | 'inference_cap' }                  // eligible in principle; not this turn
EXCLUDED   { producerId, reason: 'no_verified_member' | 'room_forbids' | 'consent_absent'
             | 'not_registered_for_room' }                         // not eligible here
REFUSED    (turn-level) 'unregistered_producer' | 'identity_unverifiable' | 'floor_missing' | 'unknown_input'
```

`HELD` is the class the flow's manifest asks for and CC-A lacks. `loader_error → HELD` (not
silently absent) is what turns *"present but empty"* vs *"absent"* — the distinction CC-A was
built to see — into a first-class outcome.

`system_inferred` producers are the ones `restraint` governs most: v1 policy carries an explicit
per-turn `inference_cap` and requires `authority !== 'infer'` for any producer admitted into a
`roomPolicy.memberAboutAllowed === false` room. This is the executable form of *"a surface may
situate, never synthesize"* — and the exact contract CDPI's `PatternHypothesis`
(`authority = SYSTEM_INFERENCE`) will later have to satisfy to be OFFERED rather than HELD.

### 6.4 Policy v1 and the disjoint cells — no levelling up

`ParticipationPolicy pp-1` is a table `(producerId × roomKind) → 'admit' | 'hold' | 'exclude'`
plus the restraint rules. **Its v1 content is the seed table in §5.3, transcribed.** Where
`/list` and `between/chat` disagree today, v1 records *both* rows — `sovereign_chat` admits
atoms, `between` excludes them with reason `not_registered_for_room` — so the member-facing
field is unchanged on the day of cutover. Changing a cell later is a policy-version bump with a
Kelly adjudication, never a side effect of migration.

The exceptions — the cells v1 must decide rather than inherit:

1. `floor.*` on FAST — **admit** (mandatory class; this is D1's closure, gated by G1).
2. `computed.forward_readiness` and `inferred.memory_influence` on CORE/DEEP — currently FAST-only
   by accident of the template literal. **Kelly decision required**: admit (today's `/list`
   route intends them for the turn, the tier drops them) or hold with reason. This spec
   recommends *admit* on the ground that the route already authorized them and the tier is not
   an authority — but it is a field expansion on two tiers, so it is named, not assumed.

### 6.5 Rendering — one renderer, tiers read only

```ts
export function renderTurnForCognition(turn: CanonicalTurn, strategy: TierStrategy): RenderedPrompt
```

Replaces: the FAST template literal (`maiaService.ts:1432`), `buildMaiaWisePrompt`'s addenda
tail, `buildMaiaComprehensivePrompt`'s addenda tail, and the `consultationRecallAddenda` join on
DEEP-primary (`:2274`). `TierStrategy` may reorder *within* the strategy's own scaffolding and
may choose brevity/expansion guidance; it may not add or remove participants and it may not
touch `floor.*`. DEEP-primary's local template weaving (no prompt seam, `:2265–2268`) reads
`turn.participation.admitted` for its consultation lane exactly as today, from the object instead
of from `(meta as any)`.

---

## 7. TURN PARTICIPATION MANIFEST

### 7.1 Inherits CC-A's constitution verbatim

`lib/memory/provenance/turnMemoryProvenance.ts` is the manifest's ancestor and its constraints
carry forward unchanged: observational only; never writes back; never a retrieval source; never
proof that material is true; **no member content, transcript content, relational inference, PHI,
or prompt body** — identifiers, source classes, counts, booleans, versions, hashes; `digest()` so
two turns can be compared without either being read.

### 7.2 Shape (`tpm-1`)

```ts
interface TurnParticipationManifest {
  contractVersion: 'tpm-1';
  turnId: string;
  builtAt: string;
  buildSha: string;

  identityStatus: 'verified' | 'anonymous' | 'guest';
  memberRef?: string;                       // digest prefix, never the id
  surface: SurfaceDescriptor;
  roomKind: RoomKind;
  ingressId: IngressId;                     // §8.3 — the registered route/room

  canonicalContextVersion: 'ct-1';
  participationPolicyVersion: 'pp-1';
  producerRegistryVersion: string;          // hash of PRODUCER_REGISTRY keys+classes

  sovereignty: { sanctuary: boolean; memoryMode: string; gatesApplied: string[] };

  producersConsidered: ProducerId[];
  epistemicClassesConsidered: EpistemicClass[];
  admitted: Array<{ producerId; epistemicClass; chars; itemCount?; blockDigest }>;
  held:     Array<{ producerId; reason }>;
  excluded: Array<{ producerId; reason }>;
  counts: { admitted: number; held: number; excluded: number };

  floorDigest: string;                      // digest of rendered floor.* — G1 compares across tiers
  fieldDigest: string;                      // digest of ordered admitted blockDigests — G7 compares across surfaces
  cognitionPath: 'getMaiaResponse' | 'room_direct';
  tierChosen?: 'FAST' | 'CORE' | 'DEEP';    // filled by cognition, after the fact
}
```

### 7.3 Emission, not storage — with the question named

Emitted under a discoverable marker (`[MAIA/manifest]`) and returned to the client alongside the
existing `runtimeContext` recognition booleans. CC-A refused to become a table on custody grounds
(*"a durable provenance table would be a new memory-adjacent store and would require custody
review it does not have"*). This spec **inherits that refusal for v1**. The cross-surface parity
witness (§9.3) and P3-global recertification both need manifests comparable across time, which a
log line supports for a witness window. **Whether the manifest may become a durable, content-free
record is a Kelly ruling deferred to after the seam ships** — it is not needed to certify it.

---

## 8. CERTIFICATION GATES

Method: the refusal-registry harness (`tests/constitutional/refusal-registry/harness.ts`) and the
voice gate (`__tests__/voice-non-degradation.test.ts`) — each gate declares `refusal`,
`enforcedBy`, `violationAttempted`, `passingAuthorizes`, `passingDoesNotAuthorize`,
`hostileForkMustChange`. Each is certified by the constitutional method already in use:
hostile-positive mutation applied and observed to fail; innocent-negative control passes;
boundary-negative control; nonzero target discovery; structurally witnessed mutation;
tests actually executed; content-snapshot restoration verified.

| Gate | Refusal | Hostile-positive mutation (must turn red) | Innocent-negative control (must stay green) |
|---|---|---|---|
| **G1 Floor invariance** | no cognition tier renders without every `floor.*` producer | delete one `floor.*` append in the renderer | reorder two non-floor admitted blocks |
| **G2 Producer closure** | no block enters a turn whose `producerId` is not a `PRODUCER_REGISTRY` key | construct a `Participant` with `producerId: 'foo'` from a route (compile) **and** via `as any` (runtime) | add a new *registered* producer with full spec |
| **G3 No open channel** | `getMaiaResponse` accepts `CanonicalTurn` only; `(meta as any)` count in `lib/sovereign/maiaService.ts` = 0; `CanonicalTurn` has no index signature / `Record<string, unknown>` | reintroduce `meta?: Record<string, unknown>` on the request type | rename a typed field |
| **G4 Identity provenance** | `CanonicalTurn.identity` is produced only by `resolveCanonicalIdentity` over `lib/auth/getMemberFromRequest` | construct a turn with `{ status:'verified', memberId: body.userId }` | construct an `anonymous` turn |
| **G5 Ingress closure** | every `app/api/**/route.ts` that imports a model client (`@anthropic-ai/sdk`, `lib/ai/claudeClient`, `lib/services/ClaudeService`, `lib/consciousness/LLMProvider`) or `getMaiaResponse` either constructs a `CanonicalTurn` or is in `NON_MAIA_COGNITION_ALLOWLIST` with a reason | add a route importing `new Anthropic()` with neither | add a route to the allowlist with a reason |
| **G6 Manifest completeness** | every admitted block has a manifest row; `fieldDigest` recomputed from rendered blocks equals the manifest's | render one extra block the manifest does not list | change a `HELD` reason string |
| **G7 Surface parity** | for one fixture (verified member, same encounter, `pp-1`), turns constructed with `surface.client ∈ {web, ios, desktop}` produce identical `fieldDigest` and identical `admitted/held/excluded` | branch MIPA on `surface.client` | change `surface.transport` |
| **G8 Behavior preservation (migration only)** | at M2, for the `/list` fixture set, the adapter's legacy-`meta` output digest equals the pre-migration digest | drop one addendum from the adapter | reorder adapter code without changing output |
| **G9 No expansion** | per `(producerId × roomKind)`, `pp-1` admits ⊆ today's admitted set except the cells adjudicated in §6.4 | flip one `exclude` cell to `admit` without a policy version bump | bump policy version with a ratified diff |

**G5's honest ceiling.** G5 is a pattern match over import specifiers — the shape the voice gate
header says failed four times. It is stronger than today's guard (which matches one string in
`route.ts` only) and it is still a denylist on the unknown. The structural closure is to make the
model client **constructible from one module only** (`lib/ai/claudeClient.ts` already exists as
a candidate chokepoint) so that G5 becomes "imports the chokepoint or is allowlisted" — an
enumeration the compiler can be made to derive. That is recommended as M6 work, not v1.

**Allowlist seed for G5** (from the census §1.3 classification): `portal/[slug]/chat` (virtual
practitioner, public visitor, **not MAIA**), `anthropic/ping`, `build/alert`,
`studio/with-me/*/synthesize` (facilitator tool), `practitioner/practice-field/draft`
(practitioner drafting tool — mirror invariant, bounded; **decision**: allowlist v1, revisit).
**Not allowlisted — must construct a turn**: `relational-navigation`, `living-field/*/encounter`,
`living-field/*/refine`, `now-what/interview`, `vision-studio/interview`, `voice/stream-conversation`.

### 8.3 Ingress registry

`MAIA_ROUTE_REGISTRY` becomes `INGRESS_REGISTRY`: every ingress that constructs a turn is an
entry `{ ingressId, roomKind, cognitionPath, status, reason, registeredAt, registeredBy }`, and
G5's allowlist is the complementary set. The two together are a **partition** of all
model-invoking routes — the property today's registry lacks. `between/chat`'s current entry
(`callsMaiaResponse: false`, the census's D2) is corrected by construction: it constructs a turn
or it fails G5.

---

## 9. CROSS-SURFACE PARITY CONTRACT

### 9.1 Definition

> Given the same verified member, a materially equivalent present encounter, and the same
> `participationPolicyVersion`, iOS, PWA and Desktop produce turns with identical
> `participation` and identical `fieldDigest`.

### 9.2 Allowed differences (may vary; must be in `surface`, never consulted by MIPA)

transport · streaming · microphone/audio capture · TTS provider · UI · device affordances ·
modality-specific *current-turn* data (e.g. a spoken turn carries `modality: 'spoken'` and TTS
guidance is a `TierStrategy` concern, not a participant).

### 9.3 Not allowed — and how each is now impossible rather than forbidden

| Not allowed | Made impossible by |
|---|---|
| silently different member-memory field | one constructor; G7 |
| different provenance treatment | one registry; producer spec carries provenance |
| different sovereignty gates | `floor.*` mandatory + `sovereignty` resolved in-constructor; G1 |
| missing MIPA participation | constructor cannot complete without `adjudicateParticipation`; G6 |
| route-specific "second MAIA" | G5 partition; `OracleConversation.apiEndpoint` default (D7) becomes irrelevant to the field because both ingresses construct the same object under the same policy |

### 9.4 Witness

The parity witness is a manifest comparison across three real clients for one member — the SHA
CDPI's fourth predecessor binds to. It runs after M4, not before.

---

## 10. TIER / MODE HANDLING

| Concern | Where it lives | Tier may… | Tier may not… |
|---|---|---|---|
| Mode (dialogue/counsel/scribe) | `cognitionRequest.mode`; `declared.*` producers | adapt register, brevity, scaffolding | change which `declared.*` producers are admitted |
| Tier selection | inside `getMaiaResponse`, from the frozen turn | choose FAST/CORE/DEEP | re-open the turn |
| Sanctuary | `sovereignty.sanctuary`; MIPA holds all persistence-bearing and member-about producers | read the flag for tone | load anything the constructor held |
| Consultation (DEEP) | `computed.consultation` producer; admitted per policy | run its local orchestration | assemble its own addenda from anywhere but `turn.participation.admitted` |
| Repair passes | re-render the same turn with `TierStrategy.repair` | append the repair instruction | construct a new `MaiaContext` from `meta` (today's `repairedContext`) |

The `MaiaContext` type (62 fields) is **retired** at M3. Its surviving semantic content is either
a `PRODUCER_REGISTRY` entry or a `TierStrategy` parameter. Nothing else.

---

## 11. MIGRATION ORDER

Each step independently deployable, independently certifiable, independently revertible.
The order is chosen so that **the falsifiers exist before the thing they falsify**, and so that
D1 goes green by the seam, not by a patch.

| Step | Content | Gate to exit | Behavior change? |
|---|---|---|---|
| **M0 — Falsifiers first** | Write G1–G4, G6, G9 as refusal-registry checks against the *current* tree. G1 **must run RED** on FAST (that is D1, witnessed by a test rather than a comment). G3 must run RED (200 casts). Commit the red state with the expected-failure record. | Tests executed; expected failures observed; red is documented as the baseline | none |
| **M1 — Types + registry + MIPA + manifest, zero callers** | `lib/maia/canonical-turn/{types,producerRegistry,adjudicate,manifest,render}.ts`. Registry seeded per §5.3; policy `pp-1` per §6.4; §6.4(2) decided. Pure-function unit tests; fixture-based MIPA tests. | G2 (module-local), G6, G7 (fixture), G9 (policy vs seed table) | none |
| **M2 — `/list` constructs; adapter into legacy `meta` (B as scaffolding)** | `/list` calls `resolveCanonicalIdentity` → producers → MIPA → `constructCanonicalTurn`. A **temporary** adapter `turnToLegacyMeta(turn)` feeds `getMaiaResponse` unchanged. Manifest emits. `buildMaiaRuntimeContext` reads `turn.participation`. | **G8** digest equality on the `/list` fixture set; G4; G6 live | none intended; G8 proves it |
| **M3 — Cognition reads the turn; `meta` deleted** | `getMaiaResponse(turn: CanonicalTurn)`. Tiers read `turn.*`. FAST template literal → `renderTurnForCognition`. `MaiaContext` retired. Adapter deleted. | **G1 goes green** (D1 closed by construction); **G3 = 0 casts**; G8 re-run | **yes, intended, enumerated**: FAST gains the three `floor.*` producers; CORE/DEEP gain whatever §6.4(2) decided. Nothing else. |
| **M4 — `between/chat` constructs** | Same construction; `roomKind: 'between'`; `pp-1` rows preserve today's admitted set for that room. `maiaOrchestrator`'s three call sites collapse to one turn hand-off. Anonymous identity path preserved. | G9 for the `between` column; G7 | none to the between field; D2 closed |
| **M5 — Rooms and remaining ingresses** | `now-what` / `vision-studio` via `roomComposition` → construct a turn with `roomPolicy.persists=false` (`composeRoomTurnPrompt` becomes a `TierStrategy`, its loaders become producers). `living-field/encounter,refine` and `relational-navigation`: construct a turn (identity onboarding = auth-posture Phase 1 for living-field); cognition may remain direct (`cognitionPath: 'room_direct'`) reading `turn.participation`. `voice/stream-conversation`: **Kelly decision** — retire the cognition path (already unreachable from the UX; body-first identity) or onboard. `sovereign/app/maia`: **Kelly decision** — retire (dormant, externally addressable) or onboard. | G5 partition complete; G4 on every onboarded ingress | rooms: none to their fields; living-field identity: the ratified Phase 1 change |
| **M6 — Structural hardening + P3-global** | Model-client chokepoint so G5 stops being a pattern match. Ingress registry finalized. **P3-global recertification** against `PRODUCER_REGISTRY`: source-derived enumeration → classification → MIPA treatment → unclassified producer fails closed. | P3-global report; the ceiling either lifts or is reported honestly | none |

**What M2 → M3 buys**: the cutover happens with the seam observable (manifest) but the cognition
untouched, so any field discrepancy is caught by G8 *before* the tiers change. This is B doing
exactly and only the job the ruling permits it — scaffolding.

---

## 12. ROLLBACK AND FAILURE BEHAVIOR

### 12.1 Rollback

- Per-step `git revert`; each M-step is one reviewable diff.
- **No feature flag may gate the floor, MIPA, or the manifest.** (`roomComposition` NW-I01
  precedent.) A flag is permitted for exactly one thing — the M2 construction-path cutover on
  `/list` — and is deleted at M3.
- The adapter (M2) is the rollback mechanism for M3: reverting M3 re-enables it; nothing else
  needs to move.

### 12.2 Failure behavior at the boundary (fail closed, never silently thinner)

| Condition | Behavior | Manifest |
|---|---|---|
| identity cannot be resolved | construct an **anonymous** turn (legitimate state) — never fall back to a claim | `identityStatus: 'anonymous'`, every member-about producer `EXCLUDED: no_verified_member` |
| identity claim mismatches session | **REFUSED** `identity_unverifiable` (inherits `getMemberFromRequest` rejection) | refusal record emitted |
| a producer's loader throws | producer `HELD: loader_error`; turn proceeds | row present; `errorClass` only |
| a block arrives with unregistered `producerId` | **REFUSED** `unregistered_producer`; HTTP 500 with typed code; never degraded | refusal record emitted |
| `floor.*` cannot be composed | impossible by construction (constants); if the module fails to load the process fails to boot | — |
| MIPA throws | **REFUSED**; MIPA is pure, so this is a defect, not a runtime condition | refusal record |
| renderer asked to render a non-frozen object | throws; `Object.isFrozen` asserted | — |

Today `/list` answers normally as anonymous when identity fails and the recognition signal made
that visible (`maiaRuntimeContext.ts:381–392`). That behavior is **kept**, and the manifest now
carries the reason, so the "MAIA has nothing to recall" vs "MAIA was never told who I am"
distinction the signal was built for becomes a first-class, comparable record.

---

## 13. EXPLICIT NON-GOALS

Inherited from the flow and reaffirmed against the reads:

- No semantic long-term retrieval; no pgvector/embedding activation; no W1 yet.
- No proactive memory resurfacing; no P4 correction/retraction; no P5 endorsement gestures;
  no P2b settings/UI.
- **No restoration of anything P3 removed.** The v1 registry is the currently-authorized field.
- **No auth work beyond onboarding to the one resolver** already ratified in
  `AUTH_POSTURE_X_MEMBER_ID_2026-07-11.md`. The `scribeAuth` duplicate, middleware presence-check,
  and admin-role gaps that spec names are not this lane's.
- No client redesign; `OracleConversation`'s `apiEndpoint` default is left as-is (it stops
  mattering to the field; it still matters to UX and is a later cleanup).
- No voice UX change; no streaming transport extraction.
- No dormant-service cleanup (`QuantumFieldMemory`, duplicate `SemanticMemoryService`, etc.).
- No CDPI. CDPI-01 stays OPENED · NOT ACTIVE until the four SHAs exist; the artifact its
  reformulated activation gate names — *the canonical participation/admission contract governing
  SYSTEM_INFERENCE* — is §5.2 + §6.3 of this spec **once implemented**, not this document.
- No durable manifest store (§7.3 — deferred ruling).
- No deployment.

---

## 14. DECISIONS REQUESTED BEFORE IMPLEMENTATION

1. **§6.4(2)** — `computed.forward_readiness` and `inferred.memory_influence` on CORE/DEEP:
   admit (recommended) or hold.
2. **§5.2** — ratify the epistemic-class axis, or amend.
3. **§11 M5** — `voice/stream-conversation`: retire the cognition path or onboard.
4. **§11 M5** — `sovereign/app/maia`: retire or onboard.
5. **§8 allowlist** — `practitioner/practice-field/draft`: allowlist (recommended v1) or onboard.
6. **§7.3** — manifest as emission only (v1, recommended) with the durable-record question
   deferred; or open the custody review now.
7. **Naming** — `lib/maia/canonical-turn/` and the identifiers used here are proposals.

---

## 15. WHAT THIS SPEC CLAIMS AND DOES NOT CLAIM

**Claims**: that closing the `meta` channel with a typed, registry-bound, singly-constructed
object is the *only* form in which the flow's fail-closed requirement can be met against this
tree; that the migration order above reaches it without a behavior change the gates cannot see;
that D1, D2, D3, D4, D5 and D7 from the census are closed by construction at M3/M4 rather than
by discipline; and that P3-global becomes answerable at M6.

**Does not claim**: that P3-global will report Grade A — G5 remains a pattern match until the
model-client chokepoint exists, and the spec says so. Does not claim the manifest is a memory
system, a truth record, or evidence of continuity. Does not claim parity until the §9.4 witness
runs on three real devices.

**STOP.** Implementation requires separate authorization.

---

## 14-A. FOUNDER ADJUDICATION — 2026-09-03 (recorded verbatim in substance)

| § | Decision | Ruling |
|---|---|---|
| 1 | `forward_readiness` / `memory_influence` on CORE/DEEP | **ADMIT.** Tier is cognition strategy, not participation authority. `inferred.memory_influence` remains system-originated inference under full MIPA restraint / room-policy / inference-cap treatment; admission across tiers does not elevate its authority. |
| 2 | Epistemic-class axis | **AMEND before M1** → §5.2-A. `epistemicClass` → `participationClass` + mandatory `authoredBy`; `authority`, provenance, consent basis retained; no slash-compound values; mixed producers partition; manifest carries both. |
| 3 | `voice/stream-conversation` | **RETIRE the independent cognition path.** Do not migrate body-first identity and separate memory/cognition assembly. Bounded production-liveness witness before the route's retirement behavior; unexpected legitimate use returns for adjudication. Future voice = transport over canonical construction, not a second mind. |
| 4 | `sovereign/app/maia` | **STRUCTURALLY RETIRE — explicit 410 first.** Source/client census + bounded 30-day Caddy witness (zero exact-route hits) are sufficient. Do not onboard to preserve dormant architecture. |
| 5 | `practitioner/practice-field/draft` | **ALLOWLIST v1** as NON_MAIA_COGNITION with reason `practitioner_tool · not_member_maia_turn · mirror_invariant_bounded`. Exemption expires if it claims MAIA, loads member intelligence-field material, or acts relationally toward the member. |
| 6 | Manifest custody | **EMISSION ONLY v1.** No durable table during CMT-01. Use for seam observability, structural comparison, cross-surface witness, P3-global certification under existing operational retention. Durable content-free record → separate post-seam custody adjudication. |
| 7 | Naming | **RATIFIED**: `lib/maia/canonical-turn/`, `CanonicalTurn`, `CandidateBlock`, `ProducerId`, `PRODUCER_REGISTRY`, `TurnParticipationManifest`, `resolveCanonicalIdentity`, `adjudicateParticipation`, `renderTurnForCognition`. MIPA stays the architecture/concept name; code uses `adjudicateParticipation`. |

**Precision on identity**: the §4.1 dependency is approved but does not block M0–M4 globally.
`/list` already uses the verified resolver. It is an onboarding prerequisite per remaining
ingress; living-field cannot call its identity `verified` until it adopts the one resolver;
voice avoids the work by retirement.

**G5 jurisdiction confirmed**: if a route claims MAIA, direct Anthropic invocation does not
exempt it from canonical construction; a genuinely non-MAIA tool must be explicitly
allowlisted with a reason.

### Implementation authorization

```text
M0  write and witness the expected-red constitutional falsifiers            AUTHORIZED
M1  types · amended registry · adjudication · manifest · renderer, 0 callers AUTHORIZED
M2  CanonicalTurn constructed on /list in SHADOW / adapter mode;
    legacy assembly remains response-producing.
    Acceptance: paired legacy/canonical structural zero-diff witness
    + hostile mutation proving the comparison goes non-zero
      when one side loses a provider.                                        AUTHORIZED
M3  authoritative cognition cutover                                          NOT until M0–M2
                                                                             evidence adjudicated
```

No new retrieval, CDPI, P4/P5, P2b, client redesign, or deployment is authorized.

**Evidence record for M0–M2**: `docs/programme/CMT-01_M0-M2_WITNESS_2026-09-03.md`.
