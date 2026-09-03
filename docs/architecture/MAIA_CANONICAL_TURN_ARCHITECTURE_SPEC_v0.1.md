# MAIA Canonical Turn Architecture — Specification v0.1

**Status: APPROVED for migration design and implementation — CMT-01 architecture-spec adjudication, 2026-09-03 — subject to the refinements marked `[CMT-01/R]` below. Implementation begins only after the B liveness witness (§2.1) has been run.**

Revision 0.1.1 — the five approved refinements are inserted in place rather than appended, so the specification reads as one document.

Discovery record: `docs/architecture/CANONICAL_TURN_SEAM_TOPOLOGY.md`
Predecessor canon: `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` (spoken/typed convergence — generalized here, not superseded)
Constitutional floor: `docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md` (Phase 0, closed)

---

## 0. The governing finding, and the one sentence this spec exists to make true

> MAIA cognition is substantially converged at `getMaiaResponse()`, but **member-turn construction is not.** Three route families assemble materially different intelligence fields before reaching the same cognition provider.

The target invariant, as refined by CMT-01:

> **No MEMBER_TURN cognition invocation without canonical turn construction. Every non-member cognition invocation requires an explicit certified invocation class and may not impersonate a member turn.**

Not *"all current callers seem to use it."* A future member-facing route must be **unable** to reach cognition without crossing the constructor, and a fourth route must fail certification because it is new.

The most important design decision in this document is **§3 — the constructor owns retrieval orchestration, not only admission.** One judge with three different people deciding what evidence the judge ever sees is still three MAIAs.

---

## 1. Invocation classification

### 1.1 The two classes

```text
Cognition invocation
        │
        ├── MEMBER_TURN
        │       a member is present, addressed, and will receive the response
        │       ↓
        │   CanonicalTurnConstructor REQUIRED
        │
        └── SYSTEM_COGNITION_PROBE
                no member is the subject; cognition is exercised, not addressed
                ↓
            explicit restricted path
```

`consciousnessHealthCheck` (`lib/consciousness/maiaOrchestrator.ts:1160`) is classified **`SYSTEM_COGNITION_PROBE`**. It is not a member encounter. It does not acquire member memory, sovereignty context or autobiographical participation to satisfy the member-turn seam, and it does not load a fake member to achieve architectural uniformity.

### 1.2 The distinction must be structural, not inferred from caller names

`getMaiaResponse(req: MaiaRequest)` currently accepts `meta?: Record<string, unknown> & {…}` — an untyped bag. The class of the invocation is not represented anywhere; it is inferred, if at all, from `originRoute`, a free string.

End state: the cognition entry takes a **discriminated invocation**:

```ts
type CognitionInvocation =
  | { kind: 'MEMBER_TURN';            turn: CanonicalTurn }          // constructed, never hand-built
  | { kind: 'SYSTEM_COGNITION_PROBE'; probe: SystemProbe };          // restricted, member-free
```

`CanonicalTurn` is a **branded type** whose brand is not exported (the P6 pattern): a caller cannot build one by hand, so a member turn cannot reach cognition without the constructor producing it. The probe arm carries **no member identity field at all** — a datum the arm cannot see is one it cannot be tuned to impersonate.

### 1.3 Certification of the class boundary

- Every executable call site of the cognition entry is enumerated from source (call-site closed set, as at P3e/P3f/P6). Each must present one arm of the union. **A call site presenting neither fails certification because it is new.**
- A `SYSTEM_COGNITION_PROBE` invocation reaching any member-context provider fails certification.
- A cast to the branded `CanonicalTurn` outside the constructor is **detected** (Grade B arm, stated), as at P6.

### 1.4 `[CMT-01/R]` A probe cannot select member-scoped providers — by registry, not only by absence

The missing `memberId` field is necessary and not sufficient. A future provider could find identity through a global or request context and turn a health check into a synthetic person. So the provider registry itself carries the constraint:

```ts
interface IntelligenceProvider<C> {
  readonly scope: 'member' | 'probe_safe';   // declared, certified, not inferred
  …
}
```

The probe arm's selector is typed over `probe_safe` providers only; a `member`-scoped provider is **unselectable** for it at the type level, and certification asserts every provider in the Stage 1 registry (§3.2) is `member`-scoped except those explicitly adjudicated probe-safe (none at Stage 1). A probe manifest therefore reads:

```text
invocation           SYSTEM_COGNITION_PROBE
member identity      unavailable by construction
member providers     unavailable
member memory        unavailable
probe-safe context   permitted
```

Certified additionally: no member sovereignty context reaches the probe arm masquerading as synthetic test data.

---

## 2. Route B — disposition protocol

`app/api/sovereign/app/maia/route.ts` ("B", two cognition call sites) has **exactly two permitted final dispositions:**

```text
CONVERGED            or            STRUCTURALLY RETIRED
```

Never *"dormant but still independently assembling MAIA."* And the choice is **not** made from import analysis.

### 2.1 Bounded liveness / contract check — required before seam implementation

| Check | Source of evidence | Recorded so far |
|---|---|---|
| Supported current client | first-party client code | **None found.** Every first-party surface (`OracleConversation`, `MaiaPresence`, `AcademySheet`, `/maia`, `/field/talk`, `/studio/maia`, `/book-companion/ain`) calls `/list`. |
| Production contract that must remain | server-side references | `app/api/maia/chat/route.ts` (itself disabled, HTTP 410) names B as `X-Recommended-Endpoint`; `app/api/oracle/conversation/route.ts:450` points at B; `personal-metrics` references it. **These are pointers from deprecated surfaces, not consumers.** |
| Legitimate current external consumer | production access log | **Not obtainable from this environment.** Requires the minisforum-side check below. |
| Dormant status | 2026-05-23 48h traffic audit (registry entry) | zero production hits — **historical**, must be re-run |

The check that closes this — `[CMT-01/R]` a 30-day window, every Caddy container, exact-path match that excludes `/list` and `/voice`:

```bash
ssh soullab@minisforum '
echo "=== exact B-route hits in Caddy logs, last 30 days ==="
for c in $(docker ps --format "{{.Names}}" | grep -Ei "caddy"); do
  echo "--- $c ---"
  docker logs --since 720h "$c" 2>&1 \
    | grep -E "/api/sovereign/app/maia([?\" ]|$)" \
    | grep -vE "/api/sovereign/app/maia/list" \
    || true
done
'
```

B's exact pathname is `/api/sovereign/app/maia` (`app/api/sovereign/app/maia/route.ts`). `/api/sovereign/app/maia/voice` is a sibling and is correctly excluded by the character class. Zero hits is **bounded evidence for the 30-day window**, not proof nobody has ever called it; combined with the source and client census it is sufficient for the retirement decision. This witness cannot be run from the development environment; it is run on minisforum and its output is pasted into the migration record verbatim.

### 2.2 Decision rule

- Zero legitimate hits over the window **and** no contract that must remain → **STRUCTURALLY RETIRED**: `[CMT-01/R]` an **explicit 410 boundary first**, not a silent handler deletion — an unexpected external caller gets an intelligible refusal with a pointer to `/list`, never a mysterious 404. The route's two cognition call sites are **deleted**, and certification asserts the file contains no cognition invocation. Two bypasses disappear without migration effort.
- Any legitimate consumer → **CONVERGED**: B enters the constructor like every other member-turn path, under a legacy profile (§5), and is retired later only through the same protocol.

Retirement is preferred. It is not assumed.

---

## 3. Retrieval orchestration — the constructor's ownership boundary

### 3.1 The defect admission-only would leave in place

```text
route A retrieves intelligence X
route C never retrieves intelligence X
        ↓
same admission policy
        ↓
still different MAIAs
```

Therefore the constructor owns:

```text
WHICH governed providers are invoked
        ↓
candidate acquisition
        ↓
MIPA adjudication
        ↓
composition
        ↓
participation evidence
```

**The constructor owns retrieval orchestration, not retrieval implementation.** Each provider remains responsible for how it retrieves its own domain.

### 3.2 The provider set at Stage 1 — derived from what routes invoke today

No new providers. No reactivation of P3-excluded intelligence. The Stage 1 registry is the **union of what the supported member-turn routes already invoke**, each wrapped as a provider, each carrying its existing certified gate:

| Provider | Current implementation | Governing gate | Invoked today by |
|---|---|---|---|
| Conversation | `TurnsStore`, `loadPriorCrossSessionExchanges` | consent gate `conversational_recall_enabled` (P2) | A |
| Atoms | `loadMemberMemoryAtomsForPrompt` | `return_preference` (P6) · practitioner attribution guard · R04 | A |
| Episodes | `loadRecentMarkedEpisodes` | consent gate `episodic_recall_enabled` (P2) · `marked_by_member` | A |
| Relationship | `loadRelationshipMemory` → `certifyRelationshipMemory` | P1c partition · P3f breakthrough boundary | A, C |
| Relationship essence | `loadRelationshipEssence` | P1c disposition (EXPORT + INSPECT) | A |
| Developmental / themes | `memoryLoaders` | R24 | A, C (reachable) |
| Memory bundle | `MemoryBundleService.build` | R25 · R26 · P3e · P3f | C (orchestrator) |
| Member web | `buildMemberWeb` → `certifyMemberWeb` | R27 | A |
| Significant moments | `loadSignificantMoments` | P3f | C |
| Selflet | `loadSelfletContext` | — (uncertified; see §8) | C |
| Session recall | `memoryOrchestrator.getSessionRecallContext` | P3f | A (fallback path) |
| Anchors | `loadRecentAnchors` | R08 | A |
| AIN knowledge | `retrieveForMode` | — (not member memory; see §8) | C |

Every row is an **existing** call. The table is the Stage 1 registry; a provider absent from it cannot be invoked by the constructor, and a provider added later is a **new intelligence source**, which this spec does not authorize.

### 3.3 Provider contract

```ts
interface IntelligenceProvider<Candidate> {
  /** Stable id, used in the Participation Manifest. */
  readonly id: ProviderId;
  /** `[CMT-01/R]` Declared, certified. `member` providers are unselectable for a probe (§1.4). */
  readonly scope: 'member' | 'probe_safe';
  /** `[CMT-01/R]` Stage 1 only: an epistemic class not yet proved is marked, never invented (§8). */
  readonly participationStatus: 'certified' | 'LEGACY_UNCERTIFIED';
  /** The gate(s) that govern this domain — recorded, never re-implemented here. */
  readonly governedBy: readonly CertifiedGate[];
  /**
   * Domain-specific retrieval. Receives ONLY the canonical turn frame —
   * identity + present encounter — never another provider's output, and never
   * the meta bag. Returns candidates, each carrying certified provenance or
   * `null` provenance; the provider does not decide admission.
   */
  retrieve(frame: TurnFrame): Promise<ProviderResult<Candidate>>;
}

interface ProviderResult<C> {
  candidates: readonly Candidate<C>[];
  /** Consent gate read for this domain, if any — so "held" is distinguishable from "empty". */
  consent?: { gate: ConsentGateName; enabled: boolean };
  /** Failure is reported, never rendered as absence (the P1a rule, applied to turns). */
  error?: string;
}

interface Candidate<C> {
  id: string;
  provenance: ProvenanceClaim;          // CertifiedProvenance | null — the existing type
  endorsement: EndorsementState;         // the existing type
  body: C;
}
```

Providers **do not compose**. They **do not adjudicate**. They **do not read each other**. The constructor:

1. selects the providers to invoke from the registry, per the turn's **profile** (§5);
2. invokes them in parallel with the frame only;
3. passes every candidate through the shared `adjudicateParticipation` / `adjudicateDerivation` boundary — **the existing gate, not a new one**;
4. composes admitted material into a **typed** `CanonicalContextBundle`;
5. records the Participation Manifest (§7);
6. invokes cognition with `{ kind: 'MEMBER_TURN', turn }`.

### 3.4 What the constructor may not do

- Import or call a provider not in the registry.
- Read a consent gate anywhere except through `readConsentGate` (P2).
- Compose a candidate that was not admitted (the discriminated-union pattern: the excluded arm has no body).
- Accept or forward an untyped `meta` bag to cognition. The bag is what made P3-global unanswerable; its replacement by `CanonicalContextBundle` is the seam's structural core.

---

## 4. Constructor contract

```ts
interface TurnFrame {
  identity: ResolvedMemberIdentity;      // resolved by the existing identity path; never a raw header
  encounter: PresentEncounter;           // sessionId, mode (Talk/Care/Note), input, modality, posture, sanctuary flag
  surface: SurfaceDescriptor;            // desktop | pwa | ios | embedded — modality facts only (§6)
  profile: TurnProfile;                  // Stage 1: a legacy profile (§5); end state: 'canonical'
}

interface CanonicalTurn {                // BRANDED — unconstructable outside the constructor
  readonly [CANONICAL_TURN_BRAND]: true;
  readonly frame: TurnFrame;
  readonly bundle: CanonicalContextBundle;   // typed; every field is admitted material
  readonly manifest: ParticipationManifest;  // §7
  readonly policyVersion: string;            // which refusal set was in force
  readonly runtimeContextVersion: string;
}
```

`constructCanonicalTurn(frame): Promise<CanonicalTurn>` is the **only** producer of the branded type. Sanctuary is honoured **inside** the constructor: a sanctuary frame invokes no durable-memory provider and the manifest records every provider as `held: sanctuary` — so sanctuary is a property of construction, not a flag each route remembers to check.

### 4.1 `[CMT-01/R]` Shadow construction — the empirical witness for "zero behaviour change"

Before the constructor becomes authoritative, it runs **in shadow beside** the existing route-local assembly, for the same member turn:

```text
LEGACY ASSEMBLY ──────────────► current cognition   (response-producing)
       │
       │ same turn, same frame
       ▼
CANONICAL CONSTRUCTOR
       │
       ▼
shadow bundle + manifest                              (never reaches cognition)
       │
       ▼
COMPARE
```

During the shadow phase the legacy assembly remains the sole producer of the live response. The constructor emits its typed bundle and Participation Manifest and **affects nothing**. For each turn the two are compared on **semantic bundle structure**:

| Compared | Legacy source | Canonical source |
|---|---|---|
| providers invoked | which loaders the route actually called | manifest `invoked` |
| gates applied | consent reads, `return_preference`, attribution guards | manifest `held` + per-provider `governedBy` |
| candidate / result counts | loader return lengths | manifest `returned` |
| admitted / excluded state | union arms after adjudication | manifest `admitted` / `excluded` |
| composed sections | which addenda were non-empty | bundle fields present |
| tier / profile | FAST / CORE / DEEP + route | manifest `profile` + processing path |
| provider failures | caught errors, silent empties | manifest `error` per provider |
| route-specific inputs | anything the route added that no provider produced | **must be zero**, or documented as observability-only |

**Model-output prose equality is not the parity criterion.** It is neither expected nor a useful seam proof; two runs of the same bundle produce different prose. Structure is what convergence is about.

Stage 1 acceptance for a route: a **zero-diff witness** across those rows for currently authorized capability, with any residual difference explicitly documented as observability-only. Only after that witness may canonical construction become authoritative for that route. This turns "zero behaviour change" from a migration intention into an empirical record — the same move P1a made for exports and the manifest makes for participation.

The shadow comparison itself is an instrument, and the harness meta-invariant applies to it: a shadow diff that reports zero must be shown to report non-zero when a provider is deliberately withheld from one side.

Relationship to the existing `buildMaiaRuntimeContext`: it is **absorbed**, not duplicated. Its eight-field observability record becomes a section of the manifest; its route registry is superseded by the invocation class + surface descriptor (§9). It stops being a wrapper the caller must remember to call, because there is no longer a caller who assembles anything.

---

## 5. Temporary legacy capability profiles — Stage 1 semantics

Convergence occurs in **two stages**. Stage 1 is structural only.

### 5.1 The principle

> **One construction mechanism before one capability set.**

A's richest current assembly is **not** the automatic canonical baseline. That would quietly combine architectural convergence with capability expansion and destroy attribution.

### 5.2 Profiles

```text
canonical constructor
        │
        ├── legacy profile A   — providers A invokes today, and only those
        └── legacy profile C   — providers C invokes today, and only those
```

A profile is a **declared provider subset plus per-provider parameters** (e.g. `maxThemes`, `includePatterns`) that reproduces each surface's **currently authorized** behaviour. It is data, not code: a route cannot express "and also load X" — it can only name a profile.

Note the direction of each difference. Where C reaches a governed module A does not (`SignificantMoments`, `Selflet`, `MemoryBundle` via the orchestrator), keeping it in profile C is **retention**; where A reaches one C does not (`MemberLiveContext`, atoms, episodes, anchors), keeping it out of profile C is **not removal** — C never had it. Stage 1 changes **no surface's capability**. That is the acceptance test.

### 5.3 Constraints

- A profile may only **subtract** from the Stage 1 registry; it can never add a provider.
- Profiles are **transitional**. Each carries a `sunset` field naming the Stage 2 adjudication that retires it. A profile with no sunset fails certification.
- A route passes a profile **name**; it never passes provider lists.
- Profiles must ultimately disappear for every intelligence source that is supposed to be surface-independent (§6 decides which those are).

---

## 6. Per-provider convergence adjudication — Stage 2

Once every member turn crosses the seam and manifests exist, **each divergent provider** is adjudicated explicitly:

```text
PROMOTE   make this governed capability canonical across member surfaces
REMOVE    this route-specific capability should not participate
RETAIN    genuinely required by modality / present encounter (a modality input, not intelligence)
DEFER     requires separate architectural or product adjudication
```

Rules of evidence:

- **"A has more" is not evidence for PROMOTE.**
- **"C lacks it" is not evidence for REMOVE.**
- Each decision requires **provenance, sovereignty and intended-MAIA-function** evidence, recorded per provider.
- RETAIN is reserved for **modality facts** — microphone, streaming, transport, UI affordance, whether a turn was spoken. A memory source is never a modality fact.

The end state: one `canonical` profile; legacy profiles deleted; the only surface-dependent inputs are those adjudicated RETAIN and carried in `SurfaceDescriptor`, which cannot influence provider selection.

---

## 7. The Participation Manifest

Emitted by the constructor for every member turn — the answer P3 could not obtain from the codebase: *what actually had the ability to enter this turn?*

```text
turn
├── identity resolved          (member id, credential path — never the credential)
├── runtime-context version
├── policy version             (refusal set in force)
├── profile                    (legacy A | legacy C | canonical)
├── providers
│   ├── registered             every provider in the Stage 1 registry
│   ├── invoked                subset selected by the profile
│   ├── held                   invoked-eligible but not run: sanctuary, consent gate off — with the reason
│   ├── candidates returned    count per provider
│   ├── candidates excluded    count per provider, by ExclusionReason
│   ├── candidates admitted    count per provider
│   └── material composed      which admitted candidates entered the bundle
├── provenance classes         authored_by × authority_class, aggregated
└── cognition invocation       { kind: 'MEMBER_TURN', processing path, provider/model }
```

Properties:

- **Six distinct states** per provider — `registered · invoked · returned · excluded · admitted · composed` — stronger than import closure (which can only say *reachable*) and stronger than P3's manual reconstruction (which could only say *found so far*).
- **No bodies.** Identifiers, counts, reasons and provenance classes only. A manifest that logs member content is a memory leak with a schema.
- **Failure is visible.** A provider error is recorded as `error`, never as zero candidates (the P1a rule).
- Persisted alongside the existing `runtime_events` substrate; format versioned.

The cross-surface parity witness (§10) is a **comparison of manifests**, not of transcripts.

---

## 8. P3-global recertification boundary

P3-global was deferred at outcome C because no source-level property separated a template that becomes prompt text from one that becomes a console line, across ~142 template expressions in `maiaService.ts` alone. The seam replaces that unanswerable question with an answerable one:

```text
canonical producer set        = the Stage 1 provider registry (§3.2)
        ↓
complete enumeration          = the constructor is the only composer; providers are the only producers
        ↓
epistemic classification      = every candidate carries ProvenanceClaim × EndorsementState
        ↓
participation enforcement     = one shared adjudicator; excluded arms have no body
        ↓
P3-global Grade A/B
```

Scope of the claim, stated precisely: **every intelligence source that can enter a MEMBER_TURN is a registered provider, and every registered provider's output crosses the shared participation boundary.** What remains outside it is whatever `getMaiaResponse` itself does with the typed bundle — which is why the bundle must be typed and the meta bag must be gone: the recertification is only as strong as the absence of an untyped side channel.

Two providers enter Stage 1 **uncertified**: `loadSelfletContext` (C) and `retrieveForMode` AIN knowledge (C). They are retained under legacy profile C because Stage 1 changes no capability, and they are named here so that P3-global recertification cannot pass while either lacks an adjudicated provenance class. Their disposition is a Stage 2 decision (§6), not a Stage 1 one.

`[CMT-01/R]` They carry `participationStatus: 'LEGACY_UNCERTIFIED'` in the registry and the manifest renders it verbatim. **No epistemic class is inferred or invented to satisfy the manifest** — an unproved class is marked, not guessed, which is the backfill rule applied to providers. Consequences, certified: a `LEGACY_UNCERTIFIED` provider may survive Stage 1 only under a legacy profile; it **may not be PROMOTED** in Stage 2 until independently certified; and P3-global cannot pass while uncertified member-about material from either enters member cognition.

---

## 9. Structural bypass refusal

The registry finding stands: `callsMaiaResponse: false` on `between/chat` is a **confirmed inaccurate architectural assertion** — the route reaches cognition through `generateMaiaTurn` / `generateSimpleMaiaResponse`. It is recorded here and **not repaired opportunistically**, because the seam design determines the field's fate:

**Disposition: eliminated.** A manually maintained boolean must not remain load-bearing for the seam. Cognition reachability becomes structural — the discriminated invocation (§1.2) plus the call-site closed set — and the field has no remaining purpose once every member-turn call site must present a branded `CanonicalTurn`. The registry's other fields (`status`, `memoryHealthExpected`, `atomsExpected`) are superseded by the manifest, which records what *did* happen rather than what was *expected*.

Certification instruments:

1. **Call-site closed set** on the cognition entry — every executable call site enumerated; each presents one union arm; a new one fails.
2. **Brand unconstructability** — `CanonicalTurn` cannot be built outside the constructor; casts detected (Grade B arm).
3. **No untyped side channel** — the cognition entry has no `Record<string, unknown>` parameter; certification fails if one returns.
4. **Provider closed set** — the constructor imports only registered providers; a route imports no provider at all.
5. **Probe isolation** — `SYSTEM_COGNITION_PROBE` reaches no member-context module (import-closure absence, sound direction).
6. **Harness meta-invariant** — target discovery, structural application witness, execution, expected refusal, content-snapshot restoration.

---

## 10. Cross-surface parity — the end state

```text
Desktop ──┐
PWA ──────┼──► identical TurnFrame (modulo SurfaceDescriptor)
iOS ──────┘          ↓
               identical provider invocation set
                     ↓
               identical adjudication
                     ↓
               manifests that differ ONLY in SurfaceDescriptor
```

The parity witness: the same member, the same explicit recollection request, on each surface — and a **diff of the three manifests** that is empty outside `surface`. That is where the original iOS/PWA problem finally closes, and it is why W1 (*"Do you remember Louisiana?"*) is sequenced after the seam and not before it.

---

## 11. Migration stages and rollback boundaries

```text
1.  classify cognition invocation types                     — §1
2.  establish the canonical member-turn constructor         — §4
3.  move existing member-turn callers through it            — A, C (B per §2)
4.  preserve legacy authorized capability profiles           — §5
5.  certify no member-turn bypass                           — §9
6.  emit Participation Manifest                             — §7
7.  rerun P3-global against the structural boundary         — §8
8.  adjudicate provider divergence                          — §6
9.  eliminate temporary surface-specific profiles           — §5.3
10. only then authorize W1 long-term recollection
```

Each numbered step is a **distinct commit and certification boundary**; the discipline of Phase 0 applies unchanged.

Rollback boundaries:

- **Steps 1–2** add types and a constructor with **no live caller**. Rollback is deletion.
- **Step 3** is the first behavioural boundary and is done **one route at a time**, A first (it already passes through the wrapper), then C, with B's disposition settled before either. Each route migration must show a **zero-diff manifest** against its legacy profile before the next begins — the Stage 1 acceptance test is that no surface's capability changed.
- **Step 5** is the point of no return, and `[CMT-01/R]` it has **preconditions**, every one witnessed before cutover:

  ```text
  1. every supported MEMBER_TURN path has a canonical shadow path        (§4.1)
  2. legacy ↔ canonical structural parity witnessed, zero-diff           (§4.1)
  3. member-turn bypass refusal certified green                          (§9)
  4. rollback BEFORE cutover demonstrated — the shadow path removed and
     the legacy path shown unaffected
  5. manifest evidence truthful and complete for the Stage 1 provider set (§7)
          ↓
     THEN authoritative cutover
  ```

  At cutover the constructor becomes the source of truth and route-local assembly **ceases to be authoritative** — it is removed, not disabled. After cutover, rollback means a **controlled code/version rollback of the seam migration**, never a feature flag that re-enables route-local assembly. A switchable second architecture kept alive "for safety" would recreate exactly what the seam removes: two ways to assemble MAIA, one of them unwatched. Architectural duality is not a rollback mechanism.
- **Steps 7–9** change capability and are each individually reversible to the previous profile state.

---

## 12. What this specification does not authorize

No historical retrieval. No new intelligence provider. No reactivation of P3-excluded intelligence. No P4/P5 gesture. No P2b work. No client redesign. No deployment.

`[CMT-01/R]` Stage 1 converges architecture only. After authoritative canonical construction is certified, the sequence is: P3-global recertification → Stage 2 provider convergence adjudication → removal of temporary surface-specific profiles → W1 explicit member-invoked long-term recollection → Desktop / PWA / iOS parity witness. **Stop before W1 unless separately authorized.**

---

## 12a. Migration record

### Steps 1–2 — invocation class + shadow constructor · CERTIFIED 2026-09-03

**B disposition, recorded first.** User-supplied production witness, 30-day `--since 720h` window, container `maia-caddy`, exact path `/api/sovereign/app/maia` excluding `/list`: **zero matching entries.** Interpreted narrowly, as adjudicated: zero hits in the logs actually retained and queried, not a claim that B was never called. Two facts sharpen "retained": `docker-compose.production.yml` caps container logs at `max-size: 10m · max-file: 3`, and the RU-0 audit header (`app/api/sovereign/app/maia/__tests__/relationalSanctuaryGuard.test.ts`) records B at 3,388 `agent_runs`/30d as of 2026-08-10. A rotation-independent confirmation exists in `agent_runs.origin_route` if ever wanted. Combined with the source census — no first-party client, every surface on `/list`, remaining references from deprecated paths, one already 410 — **B = STRUCTURALLY RETIRED**, executed at Step 3 as an explicit 410 boundary.

**What was built** — `lib/maia/turn/`, five modules, **no authoritative caller**:

| Module | Role |
|---|---|
| `invocation.ts` | `CognitionInvocation` = `MEMBER_TURN { turn: CanonicalTurn }` \| `SYSTEM_COGNITION_PROBE { probe }`. Brand not exported; one branding site; probe arm declares no member field |
| `providers.ts` | Stage 1 registry — **14 providers** (the spec's 13 with developmental/themes split as the loaders are), every one `scope: 'member'`, each wrapping an existing loader and naming its governing gate and write-path basis; `selflet` and `ain_knowledge` marked `LEGACY_UNCERTIFIED` |
| `profiles.ts` | `legacy:A`, `legacy:C` (subtractive, each with a `sunset`), `canonical` (**empty** — populated only by Stage 2 PROMOTE) |
| `constructCanonicalTurn.ts` | orchestration → acquisition → adjudication → typed bundle → manifest; `mode: 'shadow'`, `cognition.invoked: false` |
| `manifest.ts` | six states per provider, `held` with reason, `error` visible, no bodies |

**Chain of custody, not a second adjudication model.** A candidate carries one of: a canonical provenance claim (the shared `adjudicateParticipation` decides); an **upstream verdict from a named certified gate** (carried, never upgraded); or `legacy_uncertified` (composable under a legacy profile listing an uncertified provider, refused otherwise). No epistemic class was invented — MAIA's own prior words are carried under P2's ratified conversational block, and their class is a Stage 2 item.

**Expected shadow diffs, named in advance** (§4.1 will witness them, Stage 2 will adjudicate them): `session_recall`'s `relationship_context` (`user_relationship_context`, MAIA-maintained inference, P1c EXPORT with no participation gate) is excluded by the shared adjudicator while legacy composes a `RELATIONSHIP CONTEXT` block; `relationship_essence` likewise.

**Certification** — `__tests__/cmt-01-canonical-turn-steps-1-2.test.ts`, **36/36** with innocent and boundary controls; all twelve MIPA suites 304/304; differentially clean against the dirty baseline. Twelve hostile mutations, all refused, each structurally witnessed, restored by content snapshot:

| # | Mutation | Witness |
|---|---|---|
| K1 | brand symbol exported | `brand_exported` 0 → 1 |
| K2 | cast forges a `CanonicalTurn` outside the constructor (Grade B arm) | casts 0 → 1 |
| K3 | probe arm grows a `memberId` | probe fields 3 → 4 |
| K4 | a member provider declared `probe_safe` | probe-safe providers 1 → 2 |
| K5 | upstream EXCLUDED upgraded | guard expr `a.verdict === 'excluded'` → `false && …` |
| **K6** | `LEGACY_UNCERTIFIED` composes under the canonical profile | guard expr loses `profileIsLegacy &&` |
| K7 | uncertified provider given an invented class | `LEGACY_UNCERTIFIED` 2 → 1 |
| K8 | sanctuary no longer holds member providers | sanctuary hold 1 → 0 |
| K9 | manifest starts carrying bodies | bag in constructor 0 → 1 |
| K10 | a caller wires the constructor before Step 3 | callers 0 → 1 |
| K11 | A's assembly copied into the canonical profile | `{}` → `{ ...LEGACY_PROFILE_A.providers }` |
| K12 | a provider reads a consent gate itself | consent reads in providers 1 → 2 |

> **K6 initially PASSED.** The `profileIsLegacy &&` guard is unreachable through the public constructor at Stage 1 — the canonical profile lists no providers — so deleting it changed nothing any test could see. **A guard nothing reaches is not certified.** `adjudicateCandidates` is now exported and the guard exercised directly, with its expression pinned. Two instrument defects surfaced alongside: three witnesses were empty for semantic edits (now expression-level), and the runner crashed in its own witness function on a regex that assumed a newline an outer capture had consumed — before any mutation was applied, tree verified clean.
>
> The P3f `admittedBreakthroughs` closed set flagged `lib/maia/turn/providers.ts` as a new consumer. Correct: it is one. Classified there deliberately rather than silenced — that closed set noticing a new reader is the property working.

**What Steps 1–2 did not do:** touch `getMaiaResponse` (asserted); produce a response; change any route's capability; add a provider; restore P3-excluded material; wire a caller. Rollback is deletion.

**Next: Step 3** — B's explicit 410 retirement; then A and C into shadow beside their legacy assembly, one route at a time, each gated by a zero-diff structural witness (§4.1) before the next begins. Stop at each certification boundary.

---

### Step 3a — Route B structurally retired · CERTIFIED 2026-09-03

`app/api/sovereign/app/maia/route.ts` is now a **70-line 410 boundary**: `POST` and `GET` answer `410` with `code: 'ROUTE_RETIRED'`, `successor: '/api/sovereign/app/maia/list'`, and headers `X-Recommended-Endpoint` + `X-Route-Retired`. Both cognition call sites, every intelligence loader, the relational writes, and the session/cognitive-profile machinery are gone; the file no longer needs `@ts-nocheck`. The cognition call-site closed set is **six → four** (`/list`: 1; `maiaOrchestrator`: 3).

Three suites read B's source and had to change, each for a stated reason, none silenced: the RU-0 sanctuary test drops B from the routes it contains and **adds** an assertion that B performs no relational write at all; the origin-route test now asserts B declares no route to cognition; the beta-core smoke expects 410 from B and moves the conversation contract to `/list`. The authority map records `retired`, the witness, and the log-retention caveat; the `maiaRuntimeContext` registry entry is left stale by design (`callsMaiaResponse: true` over-claims rather than hides) pending its elimination in §9.

**Certification** — `__tests__/cmt-01-step3-b-retirement.test.ts` plus the two source-reading suites, **31/31**; the full MIPA + CMT set 371/371; differentially clean. Seven mutations refused, each witnessed, restored by content: a cognition call restored behind a flag (sites 5 → 6) · 410 → 404 · successor pointer dropped · a relational write re-entering B · a **new route** reaching cognition (sites 5 → 6, the closed set growing) · the file **deleted** (a silent 404, refused: retirement is an explicit boundary) · the authority map quietly reverting to `dormant`.

> **Two instrument defects, both text-is-not-code.** `lib/maia/maiaRuntimeContext.ts:96` describes B inside a *string literal* — `'… code still calls getMaiaResponse()'` — and the call-site scan counted the description as a fifth call (R23's lesson: strings are text). And the origin-route assertion read raw source, so B's own header explaining what was removed matched the pattern for the thing removed. Both detectors now strip strings and comments.

**Topology correction.** The discovery record said `getMaiaResponse()` is "defined once." It is defined **twice**: `lib/learning/enhanced-maia-service.ts:400` exports its own, wrapping `getEnhancedMaiaResponse` → `learningOrchestrator.generateMaiaResponse` — a **distinct cognition path**, with the same untyped `meta` bag. Its only in-tree importer is `lib/consultation/deep-path-with-consultation.ts`, which itself has **no importer**. So: a second cognition entry exists in source and is unreached from any route by import. The name-matching call-site scan cannot see a future caller that imports `getEnhancedMaiaResponse` instead, so the certification now **pins the importer set** (exactly one, itself unimported) and a new reacher fails because it is new. Its disposition — retire, or classify under §1 — is an open item for adjudication; it is not counted among the four and it is not assumed dead.

**Next: Step 3b** — A (`/list`) into shadow beside its legacy assembly, gated by the §4.1 zero-diff witness before C.

---

### Step 3b — `/list` in shadow: comparator certified, witness wired, OFF · CERTIFIED (instrument) 2026-09-03 · PRODUCTION READING NOT YET TAKEN

**What was built** — three modules added to `lib/maia/turn/`, the constructor rewritten to compose, and one env-gated call in `/list`:

| Module | Role |
|---|---|
| `shadowCompare.ts` | both sides reduced to one `AssemblyDigest`: providers invoked / held-with-reason / returned / admitted / excluded-by-reason / per-provider provenance classes / formatter suppression / **error** (absent ≠ empty); sovereignty gates (sanctuary, cross-session, every consent gate read); composed sections **keyed by provider** with whitespace-normalised body digests; composition order; floor + field digests; profile. `turnId`, `builtAt`, timestamps live under `observation` and are never walked. `EXPECTED_DIVERGENCES` is a named list — matches are still reported, never counted |
| `legacyDigest.ts` | reduces what `/list` already loaded, **by value**, to the same shape; a loader that threw is `invoked + error`, never held, never empty |
| `shadowWitness.ts` | `CMT_SHADOW_WITNESS === '1'` exactly; refuses before construction if profile A lists any provider not declared read-only; constructs → digests → compares → logs `[CMT-01] shadow-witness`; never throws outward (the logger included); deleted at §11 after step 5 |
| `constructCanonicalTurn.ts` | now **composes** with the certified formatters legacy uses (`formatAtomsForPrompt`, `formatPriorExchangesForPrompt` incl. its session-resumption suppression, `formatMarkedEpisodesForPrompt`, `buildMemoryInfluencePlan`, `formatMemberWebForPrompt`, `formatRelationshipMemoryForPrompt`) in **profile order**; `RUNTIME_CONTEXT_VERSION = 'cmt-01.step3b'` |

**Profile A corrected from source.** The Steps 1–2 profile listed `anchors` and `relationship_essence`; `/list` loads neither (`loadRecentAnchors` is called only by the dormant `/api/oracle/conversation`; `loadRelationshipEssence` runs post-response as essence capture, not assembly). Profile A is now the route's own composition order — `member_web, developmental, themes, atoms, conversation, episodes` — plus `relationship` and `session_recall`, which `getMaiaResponse` assembles **below the seam** (`lib/sovereign/maiaService.ts:748`, `:895`). Those two are the one **expected divergence**, named in advance: legacy reports them `unobserved:below_seam`; the canonical side carries them under its own read-only retrieval; they are excluded from order comparison and reported on every run.

**Closure flip, recorded.** Wiring the witness makes `providers.ts → SelfletIntegration → SelfletChain` reachable from `/list`. The five `selflet_*` P1c dispositions therefore moved from `not_reachable` to `certified_gate: CMT-01` (the constructor is now the gate on that path), and the P1c closure sentinel moved to `deep-path-with-consultation` / `enhanced-maia-service`, both pinned unimported since Step 3a. Discovery enlarged the obligation; nothing was re-labelled quieter.

**Side effects — the witness must not change the record by measuring it.** Every provider profile A invokes was audited from source and declared in `SHADOW_PROVIDER_SIDE_EFFECTS`: `memoryAtomsLoader`, `memoryLoaders`, `MemberLiveContext`, both recall formatters, `memoryOrchestrator`, `consentGates` — zero write statements in the module; `loadRelationshipMemory` — no call to its module's three save functions; `getSessionRecallContext` — reads only. `selflet` (SelfletChain writes) and `memory_bundle` (`ConversationMemoryUsesStore` INSERT) are declared `writes`, on evidence the suite re-derives from the import tree, and are not on profile A. `shadowWriteRisk()` is empty; a profile that lists a writing provider is **REFUSED before construction**.

**The wiring in `/list`.** Eleven by-value capture assignments and three catch-block error captures; one call site, `if (shadowWitnessEnabled()) { void runShadowWitness(…) }`, placed after `getMaiaResponse` and never awaited; the route never reads its own capture (the single read is the witness argument); the route imports `shadowWitness` + the `LegacyListAssembly` type only — not the constructor. Member-visible behaviour with the flag unset: **unchanged by construction** (no import of the constructor executes; the guard is a strict literal equality).

**Certification** — `__tests__/cmt-01-step3b-shadow-comparator.test.ts` **19/19** (end-to-end: the real constructor over mocked loaders vs. the legacy digest over the same material composed by the same formatters — equal → ZERO; withheld provider → NONZERO; disposition changed → NONZERO; body changed → block/floor/field digests move; observation-only → still ZERO; restore → ZERO; failure ≠ empty) and `__tests__/cmt-01-step3b-shadow-wiring.test.ts` **44/44**; all CMT + MIPA + route suites **435/435**, typecheck 228 vs. baseline 239, no regression. **Eighteen mutations refused**, each structurally witnessed, restored by content:

| # | Mutation | Witness |
|---|---|---|
| C1 | comparator drops provider errors — failure looks like empty | `error_in_digest` 1 → 0 |
| C2 | a blanket expected-rule swallows every provider divergence | expected rules 1 → 2 |
| C3 | sections stripped from comparison — bodies stop mattering | 0 → 1 |
| C4 | composition order no longer compared | 1 → 0 |
| C5 | body digest truncates to a prefix | normalisation 1 → 0 |
| C6 | legacy claims to observe the below-seam providers | `unobserved:below_seam` 2 → 0 |
| C7 | constructor composes atoms with a different formatter | 1 → 0 |
| C8 | formatter suppression dropped from the canonical record | suppression sites 2 → 1 |
| W1 | enable guard removed — shadow on every turn | guarded void call 1 → 0 |
| W2 | witness awaited on the response path | await 0 → 1 |
| W3 | enable check flips to default-on | strict equality 1 → 0 |
| W4 | profile A gains `selflet` | 0 → 1 |
| W5 | declaration lies: `selflet` declared read-only | 1 → 0 |
| W6 | a conversational loader failure no longer recorded | error captures 3 → 2 |
| W7 | legacy digest ignores a recorded failure | failed-first sites 4 → 3 |
| W8 | witness rethrows outward | (behavioural) |
| W9 | response path starts reading the capture | on-path reads 0 → 2 |
| W10 | log marker drifts from the documented grep string | 1 → 0 |

> **Instrument defects, recorded.** (1) C8 initially refused with **no witness** — the detector was boolean over two sites; now a count. (2) The witness module's docblock contained `add*/upsert`, which closed the comment and made the suite **fail to run** — visible only because the chain gates on jest's exit status, per the standing rule (a `tail` would have shown 19 green from the sibling suite). (3) The "never throws" test found a real hole: the catch path's own `log(…)` could rethrow if the sink threw; the logger is now wrapped. (4) A source anchor matched the route's *first* `const duration`, 28 KB above the witness; anchored after it. (5) Three closed-set instruments fired on the wiring — P3d formatter sites (2 → 3), the Steps 1–2 "no importer" pin, the P1c closure sentinel — each **re-pinned to its new deliberate member**, none widened, none silenced.

**What Step 3b did NOT do.** No production reading has been taken: the paired manifest comparison exists in-suite (end-to-end over mocked loaders), **not yet under authenticated member load**. Genuine zero-diff is therefore **not claimed**. Taking the reading is a bounded ops act — `CMT_SHADOW_WITNESS=1` on the `maia` container for a handful of member turns, then off — and the deploy that sets it is not authorised by this record. No cognition cutover; no route capability changed; no provider added; no client touched. Rollback: unset the flag; or delete the three modules and the one call.

```bash
# The reading, when authorised (from Mac Studio; flag set on minisforum for a bounded window only):
ssh soullab@minisforum 'docker logs maia-sovereign --since 30m 2>&1 | grep -F "[CMT-01] shadow-witness"'
# expect one JSON record per /list turn: zeroDiff · unexpected[] · expected[] (relationship / session_recall) · fieldDigests · floorDigests · providerErrors · durationMs
```

**Next:** the bounded production witness, then adjudication of every observed divergence (expected and not) before Step 3c (C) or any Stage 2 PROMOTE.

---

## 13. Why the constructor is the right place for what comes after

Dreams, relationships, decisions, Spiralogic phases, ideas, changes, somatic processes — each becomes a **governed intelligence provider** feeding one participation architecture, rather than a feature bolted onto MAIA with its own private path to the prompt. The provider contract in §3.3 is the shape they will take. But not yet.

**First: one turn, one seam, one provable field.**
