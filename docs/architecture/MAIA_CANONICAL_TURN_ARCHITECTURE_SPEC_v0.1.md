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

### Deploy candidate lineage · ADJUDICATED 2026-09-03 (Path B ratified)

**The question.** Taking the bounded production reading requires deploying a SHA, and deployment authority binds to the SHA that will run, not to the last commit's intent. `b7722d2` sits 25 commits ahead of / 5 behind `clean-main-no-secrets @ a4305f4` (merge-base `90f401c`). Was there a narrower certified ancestry that carries the witness?

**The finding.** No.

```text
DEPLOY CANDIDATE LINEAGE

Strict runtime/import closure is narrower than the branch
(witness closure 68 files ⊂ /list closure 404; 13 of 16 code
commits are transitive git-level dependencies of b7722d2 —
P6 and P1 enter only through shared test files, not runtime
imports), but no narrower certified Git ancestry can be derived
without hand-resolving governing documents and producing a new,
uncertified semantic object.

  strict 13 code commits             conflict (Phase 0 spec absent)
  22 = 13 + docs, minus 3            conflict at P3e: REFUSAL_REGISTRY.md +
                                     Phase 0 spec, both edited by the excluded
                                     P3 closed-set certification commit
  23 = all minus the B-retirement    conflict at b7722d2: this spec's own §12a
  full lineage ∪ canonical           CLEAN

Therefore the production-reading candidate is:

  full CMT/MIPA lineage through Step 3b
        +
  canonical a4305f4d6ec408e34efc5dae49d9664b981d4323

Local integration specimen:
  933a7f4
  parents: b7722d2 + a4305f4
  typecheck 228 vs baseline 239 · 19 suites / 450 tests green

933a7f4 is evidence of clean integrability, not yet a
production-deployable remote SHA.
```

The governing decision: the candidate is the full certified lineage *not because every commit is a runtime dependency of the shadow witness, but because that is the smallest history that preserves the certified object without reconstruction.* P6, for example, is not required by the shadow read path; it is required by the certified lineage we are choosing not to rewrite. Path A (a reconstructed slice) is **rejected**: it would manufacture a new lineage and then pretend it inherited proof from the old one.

**The production surface, in three bands — not a blob.** 34 runtime files (+5,255 / −828), one migration, one route retired. The five canonical commits absorbed touch `app/studio/calendar`, `app/studio/layout`, one script and two docs — zero file overlap with the lineage.

| Band | Content | Disposition |
|---|---|---|
| **1 — Phase 0** | P1 · P1b · P1c · P2 · P3 · P3b · P3c · P3d · P3e · P3f · P6 (closed by founder adjudication). Some of it **changes behaviour deliberately**, by removing or narrowing authority — P3 removed uncertified inference from composition; P6 changes return authority. Named, not hidden under "prerequisite" | **authorized as production surface** |
| **2 — CMT Steps 1–2** | constructor / certification machinery; no caller; cognition authority unmoved | **deployable** · canonical cutover NO · new capability NO |
| **3 — Steps 3a + 3b** | 3a: B is an explicit 410 (`ROUTE_RETIRED`, successor `/list`) — retirement, not deletion. 3b: flag-gated · fire-and-forget · legacy cognition authoritative · read-only shadow providers · no cutover · no zero-diff claim before observation | **deployable for the bounded shadow reading** · 3a adds a live obligation: **retired route B hits = 0 expected**; traffic there is evidence against the "structurally retired" premise — record it and stop the M3 inference, do not repair in the window |

**P6 migration — `20260903000001_return_authority_fail_closed.sql` — production deployment AUTHORIZED as written.** It does exactly two things: schema default `contextual_doorway → member_pulled`; bounded backfill of rows where `source_type = 'practitioner_observation' AND generated_by = 'practitioner-observation' AND return_preference = 'contextual_doorway'` → `member_pulled`. It rewrites no authorship / provenance field. Rationale: the existing value represents future-return permission the practitioner could not confer; uncertainty resolves fail-closed, and the member retains an existing act for allowing return again. This authorizes **this exact migration as part of this exact candidate** — it does not generalize; broader memory migration and P4 / P5 remain NOT authorized. Pre-deploy, one read-only blast-radius count is recorded (it records consequence; it does not decide):

```sql
SELECT COUNT(*) AS rows_to_reseal
FROM member_memory_atoms
WHERE source_type = 'practitioner_observation'
  AND generated_by = 'practitioner-observation'
  AND return_preference = 'contextual_doorway';
-- after migration the same query must return 0
```

**Exact-SHA gates before deploy** (on the pushed candidate, not the local specimen): 19 relevant suites / 450 tests green · `npm run typecheck` no regression · `npm run preflight` EXIT 0 with the real `.env.docker` · migration reconstruction / gates green · working-tree contamination disclosed. If canonical moves before candidate construction: stop, overlap / divergence check only — this adjudication is pinned to `a4305f4`.

**Live acceptance window — for every comparable `/list` turn observed, not "some green turns":**

```text
canonical construction failure     0
unexpected provider divergence     0
unexpected disposition divergence  0
unexpected reason divergence       0
unexpected provenance divergence   0
unexpected section/order diff      0
unexpected digest diff             0

expected, reported, not counted as parity failure:
  relationship     unobserved:below_seam
  session_recall   unobserved:below_seam

also collected:
  route B 410 hits                 expected 0
  P6 post-migration target rows    0
  successful ordinary /list turns  > 0
```

One unexpected comparison → the live reading is not zero-diff. Capture it. Do not repair it under the authority to witness. The structured divergence record is preserved; it is never collapsed back to a single boolean.

**What a clean reading buys:** `Step 3b live parity PASS → M3 adjudication READY`. Not M3 authorized, not cutover authorized, not P3-global closed. Those remain separate decisions.

```text
LINEAGE QUESTION          CLOSED
PATH A · reconstructed    REJECTED
PATH B · full lineage     RATIFIED
P6 MIGRATION              PRODUCTION-AUTHORIZED AS WRITTEN
STEPS 1–2                 DEPLOYABLE
STEP 3a                   DEPLOYABLE · 410 witness required
STEP 3b                   DEPLOYABLE FOR BOUNDED SHADOW READING
REMOTE CANDIDATE          NEXT
DEPLOY                    AUTHORIZED AFTER EXACT-SHA GATES
M3                        NOT AUTHORIZED
CUTOVER                   NOT AUTHORIZED
```

---

### Production shadow-window incident · 2026-09-03 · RECORDED (ruling: Path B stands)

Four separate failures. They are recorded separately so they do not collapse into "the deployment went weird."

```text
PRODUCTION SHADOW-WINDOW INCIDENT · 2026-09-03

AUTHORIZED CANDIDATE
  3e31bc0ff4e050f9cfd35bdc68c70fbcb772e56c   (parents 93f8b38 + canonical a4305f4)

INITIAL DEPLOY (13:43–13:50 UTC, deploy-production.sh deploy, immutable snapshot)
  Mac Studio preflight                 PASS (EXIT 0 at 3e31bc0, real .env.docker)
  P6 pre-census rows_to_reseal         0
  image maia-sovereign:3e31bc0ff       created 13:48:25
  running-container provenance         GIT_COMMIT=3e31bc0ff == asserted   (13:50:23)
  migrations                           10 applied (P6 + nine canonical manuscript/ask migrations
                                       production had not yet applied; 504 already applied)
  smoke + constitutional verification  PASS

COLLISION (~13:52 UTC)
  a parallel CMT-01 session (branch claude/canonical-maia-turn-j92opb) deployed
  2fafaa4c4e8d22cca62a2d12b1a9808b0d95368b through the same serialized deploy lane.
  Its image had been built at 13:33:16 (an earlier deploy of the same SHA); the
  redeploy was fully cached, so the image kept that timestamp. Its deploy-tag step
  moved 3e31bc0ff to :previous and 2fafaa4c4 to :current/:prod; the container swapped.
  It deployed a SHA that was not the SHA authorized for this bounded Step 3b reading.

FINDING
  the deploy-lane lock SERIALIZED the concurrent deploys correctly
  it did not ENFORCE which SHA was authorized — serialization is not authorization

WITNESS CONSEQUENCE
  2fafaa4c4 contains no lib/maia/turn/shadowWitness.ts and its /list has no
  runShadowWitness call; therefore the zero "[CMT-01] shadow-witness" lines observed
  are NON-EVIDENCE.
    STEP 3b PRODUCTION WINDOW   INVALID
    zero-diff                   NOT TESTED
    non-zero-diff               NOT TESTED
    route-B 410 witness         NOT TESTED
    ordinary /list traffic      NOT ESTABLISHED
  This is a provenance failure, not a parity result. It is NOT a failed Step 3b witness.

SECOND PROVENANCE REGRESSION (14:12:06 UTC)
  the window-close command supplied by this session ran
  `docker compose up -d --no-build maia` OUTSIDE the deploy lane. It reused the
  mutable maia-sovereign:prod tag (then = 2fafaa4c4), recreated maia-sovereign
  without GIT_COMMIT materialization, and — because compose saw config drift —
  recreated maia-postgres as well. Running container afterwards:
    GIT_COMMIT=unknown · DEPLOY_LANE=deploy-lane (baked into the other lane's image)
    · CMT_SHADOW_WITNESS=0 · image created 14:12:06.
  The Dockerfile tripwire guards builds; `up --no-build` is not a build.

DATABASE
  persistent volume retained; postgres restarted twice (deploy, window-close)
  P6: pre-count 0 / UPDATE 0 / post-count 0 — schema default applied, data blast radius zero
  P6 rollback NOT WARRANTED; the nine canonical migrations stay applied
  no data-loss claim made
  NOTE: while 2fafaa4c4 code runs on the post-P6 schema, its practitioner bridge
  (app/api/studio/with-me/sessions/[sessionId]/route.ts:148) still INSERTs the literal
  'contextual_doorway', overriding the new default — P6 is held by the schema, not by
  the running writer, until Path B code is restored.

EVIDENCE PRESERVED (minisforum, 14:1x UTC)
  docker image inspect: [maia-sovereign:2fafaa4c4 :current :prod] created 13:33:16
                        [maia-sovereign:3e31bc0ff :previous]       created 13:48:25
  running container:    sha256:6c28d6de3baa…5770572 created 14:12:06
  /tmp maia-deploy-ctx remnants: none (contexts cleaned by their exit handlers)
  repo reflog: checkout unmoved since 2026-08-25 (immutable-SHA deploys touch no checkout)

RULING (founder, 2026-09-03)
  Path B / 3e31bc0 lineage                    STANDS — canonical for this CMT-01 line
  2fafaa4c4 parallel M0–M2 / pdc-1 lineage    SUPERSEDED FOR CMT-01 AUTHORITY
                                              preserve as evidence / alternate design;
                                              not deleted; no further deploy; no cutover;
                                              no production-authority claim; importing any
                                              of its material requires a separate
                                              reconciliation decision — proximity of
                                              concepts does not transfer authority
  parity conclusion from this window          NONE
  M3                                          NOT AUTHORIZED
  deploy SHA-authorization guard              VALID FINDING · SEPARATE GOVERNANCE LANE,
                                              after restore + reading (do not change the
                                              deploy mechanism while recovering with it)
```

**Recovery order (ratified):** (1) hold notice to the parallel session; (2) this record; (3) preserve evidence (above); (4) restore **through the deploy lane only** — `scripts/pre-deploy-gate.sh deploy-maia 3e31bc0ff4e050f9cfd35bdc68c70fbcb772e56c` (migrations already applied; the gate swaps with `--force-recreate --no-deps` under `--env-file .env.production`, so flag changes travel through the lane too); (5) verify the **running container itself**: `GIT_COMMIT` == `3e31bc0ff`, image label `git.commit` == same, `DEPLOY_LANE` present, `CMT_SHADOW_WITNESS=1`, and the Step 3b instrument is executable in the image — `/app/lib/maia/turn/shadowWitness.ts` present AND the compiled route `/app/.next/server/app/api/sovereign/app/maia/list/route.js` contains the marker string. *Provenance label and executable witness must both identify the same candidate; a `GIT_COMMIT` string alone did not save this incident, a tag alone certainly would not.* (6) a NEW bounded window. **Closing a window is a lane act** — set the flag in `.env.production`, then `deploy-maia` the same SHA — never a bare `compose up`.

**Standing rule from this incident:** *serialization is not authorization; a deploy lane must refuse a SHA that is not the currently authorized deployment object.* Recorded here as requirement, not implemented here.

**Restore + second window · 2026-09-03 17:07–17:1x UTC.** Path B restored **through the lane** (`pre-deploy-gate.sh deploy-maia 3e31bc0ff…`; Co-Lab gate 33/33; container created 17:07:32; provenance verified). Running-container check: `GIT_COMMIT=3e31bc0ff` · `DEPLOY_LANE=deploy-lane` · `CMT_SHADOW_WITNESS=1` · `/app/lib/maia/turn/shadowWitness.ts` present · compiled `/list` route contains the marker string — provenance and executable witness name the same candidate. (Before this restore the container already reported `3e31bc0ff` / flag `1`: a lane restore had occurred between 14:12 and 17:07; that container's logs were not retained across the recreate.) **Second window: EMPTY, not invalid** — Caddy counted **0** `/list` requests in the hour; zero witness lines is therefore *no traffic*, not *no divergence*. Route B: none. Window closed as a lane act (flag `0`, `deploy-maia` same SHA, provenance verified). *Instrument finding:* the `git.commit` **image label is not produced by the build** (`{{index .Config.Labels "git.commit"}}` is empty on every image and on the container), so `deploy-production.sh rollback`'s `CURRENT_SHA`/`PREVIOUS_SHA` reads resolve to "unknown"; the `GIT_COMMIT` ENV is the only provenance carrier. For the deploy-governance lane, not this recovery. **Next window must include deliberate authenticated `/list` turns by the operator; "ordinary turns > 0" is a precondition, not an outcome.**

**Instrument finding · 2026-09-03 · `docker logs maia-caddy` is not an access log.** The `soullab.life` site block (`Caddyfile` :145–395) writes its access log to a **file**, `/var/log/caddy/access.log` inside the container (`log { output file … }`), not to stdout, and `/var/log/caddy` has no volume, so the file is lost on every caddy recreate. Therefore: (a) every `LIST_REQUESTS=0` read today was structurally guaranteed and says nothing about traffic; (b) **the Step 3a route-B witness (`docker logs --since 720h maia-caddy`, zero matching entries) was non-evidence** for the same reason. **Re-grounded on valid instruments, same day:** `SELECT origin_route, day, count(*) FROM agent_runs … 8 days` returns **only `/api/sovereign/app/maia/list`** (710 · 708 · 42 · 33 · 518 · 67 · 8 rows on 08-27 → 09-03; no row for 09-02) — **B has zero cognition rows in the eight days before and after retirement**; and the Caddy access **file** since the 13:49 recreate shows **B_TOTAL = 0** requests, so **no 410 has been served**. The B disposition (STRUCTURALLY RETIRED) stands, now on rotation-independent evidence; the original witness is retracted as evidence, not the conclusion. **Correct counters from here:** `/list` traffic = Caddy access *file* (`docker exec maia-caddy grep -c … /var/log/caddy/access.log`, valid only since the last caddy recreate) or `agent_runs.origin_route` (rotation-independent; ~8 rows per turn under the eight-voice emission); witness lines = `docker logs maia-sovereign` (the app logs to stdout — valid, but per-container: a `deploy-maia` recreate discards them, so **collect before close**). Since 13:49 the file shows **one** `/list` request and `agent_runs` shows 8 rows today — one turn; whether it fell inside a flag-on interval on `3e31bc0` is the open question for windows 1–4.

**Second collision and canonical movement · 2026-09-03 18:09–21:42 UTC · RECORDED.** The parallel lane did not stop. Its commits after the hold: 13:16 "M2 shadow deployment", 17:20 `fix(deploy): launch provenance — the image owns GIT_COMMIT`, 18:08 "witness — R deployed through the unrepaired gate, then replaced by a second deployer (a4305…)", 18:10 "witness — R live through the repaired gate; START 18:09:04Z", 18:22 `fix(deploy): drop the runtime GIT_COMMIT override that blocks every deploy`. It deployed to minisforum at ~18:09 (after the 17:07 Path B restore). Our `deploy-maia` opens at ~20:1x re-verified `3e31bc0ff` each time. **Then `clean-main-no-secrets` moved**: merges authored by the founder at 18:27, 18:53, 20:47 and 21:20 UTC advanced canonical `a4305f4 → 6d093fb3a`, including `0e9c42847 "merge: reconcile canonical-maia-turn into main"` (20:52 UTC) — **the lane ruled SUPERSEDED FOR CMT-01 AUTHORITY is now in canonical**, together with now-what product work and **deploy-mechanism changes** (`deploy-context.sh` +164, `pre-deploy-gate.sh`, `deploy-production.sh`, compose; a new `verify-deploy-provenance.sh`; its own `scripts/witness/cmt-01-shadow-witness.ts`). Canonical `6d093fb3a` **does not contain Path B** (`3e31bc0` is not an ancestor), carries no P6 binding and no P6 migration file, and its `/list` shadow is **on by default** (`MAIA_CANONICAL_SHADOW !== '0'`). Production was then deployed from it three times (caddy recreated 21:12 = full deploy; builds 21:25 and 21:41; container created **21:42:28**). `docker exec` at ~22:50: `GIT_COMMIT=6d093fb3a` · `CMT_SHADOW_WITNESS=1` (inert) · `witness-source:ABSENT`; `:previous` is the 21:25 build — **no Path B image remains in the rollback tags.** **Window 5 (six recognized `/list` turns, 22:38–22:42 UTC, atoms 8, conversational + episodic blocks emitted, zero witness lines): INVALID** — served by `6d093fb3a`. The turns are not classifiable under this lane's instrument; the memory symptom the operator observed in that conversation ("I don't have the I Ching reading") occurred on canonical code, not on Path B, and is recorded here as an observation only. Consequence: **production is running pre-P6 writer code on a post-P6 schema** (practitioner bridge hardcodes `contextual_doorway`) — the P6 census will drift above 0 while this holds. **State of the ruling:** the founder's lineage adjudication (Path B stands) and the founder's canonical merges (superseded lane reconciled into main) now contradict each other. That contradiction is not resolvable by another deploy from this lane; it is a decision. `3e31bc0` merges cleanly with `6d093fb3a` (trial, no conflicts) — a Path B re-candidate on top of new canonical is mechanically available, but two `/list` shadows (one bounded and off by default, one always-on) cannot coexist in one route without a reconciliation decision.

---

## 13. Why the constructor is the right place for what comes after

Dreams, relationships, decisions, Spiralogic phases, ideas, changes, somatic processes — each becomes a **governed intelligence provider** feeding one participation architecture, rather than a feature bolted onto MAIA with its own private path to the prompt. The provider contract in §3.3 is the shape they will take. But not yet.

**First: one turn, one seam, one provable field.**
