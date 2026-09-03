# MAIA CANONICAL TURN — CURRENT STATE CENSUS

**Lane**: CMT-01 — Canonical MAIA Turn Construction
**Deliverable**: 1 of 2 (census). The seam is NOT proposed here and NOT implemented here.
**Branch**: `claude/canonical-maia-turn-j92opb`
**Tree**: `a4305f4` (merge of #1177)
**Date**: 2026-09-03
**Method**: source reading of the working tree only. No production traffic was observed, no
container was inspected, no database was queried. Every claim below is a claim about **code**,
not about **traffic**, unless explicitly marked otherwise.

---

## 0. THE ONE-SENTENCE ANSWER

The census asks *how many MAIAs are currently being constructed*. The answer is:

> **Four distinct turn-construction mechanisms, reached by at least seven externally
> addressable cognition ingresses, of which exactly one passes through
> `buildMaiaRuntimeContext`.** The existing "required contract for all `getMaiaResponse()`
> callers" is enforced by a CI guard that can only see `app/api/**/route.ts` files
> containing the literal string `getMaiaResponse(` — so the second-largest context
> assembler in the tree is structurally invisible to it.

The governing finding is narrower and sharper than "context construction has not converged":

> **Convergence has already been achieved at the wrong altitude.** `getMaiaResponse()` is a
> genuine convergence point — but it is *downstream* of context assembly, and it *itself
> re-forks* into three tier functions that assemble ~30 further addenda by three different
> mechanisms. The canonical seam must sit above `getMaiaResponse()`, and the tier fork
> inside it is part of the divergence, not an implementation detail beneath it.

---

## 1. LIVE COGNITION TOPOLOGY

### 1.1 Method and its limits

Two closed sets were derived from source:

1. **Import closure** — a transitive reverse-import walk (`@/`, relative, `import()`,
   `require`) from `lib/sovereign/maiaService.ts` over every `.ts/.tsx/.js/.jsx` file in the
   tree, filtered to `app/api/**/route.ts`. Result: **exactly 3 routes**.
2. **Direct model invocation** — every file containing `new Anthropic(`,
   `.messages.create(`, or a literal `api.anthropic.com` fetch. Result: 55 + 15 files, of
   which the member-facing conversational subset is enumerated in §1.3.

**What this method cannot establish** (stated so it is not mistaken for coverage):
- It cannot prove liveness. Import reachability ≠ production traffic. Liveness classifications
  below are marked by their evidence class.
- Set (2) is a **pattern match**, i.e. the exact epistemic shape that failed four times in the
  voice gate (`__tests__/voice-non-degradation.test.ts` header, v1–v4). A new cognition call
  using an unnamed helper would not appear. This is the same ceiling P3-global hit, restated
  at the cognition layer rather than the producer layer.

### 1.2 The `getMaiaResponse()` lane

`lib/sovereign/maiaService.ts:2556` — the sole sovereign cognition entry. Callers:

| # | Caller | Kind | Evidence |
|---|--------|------|----------|
| 1 | `app/api/sovereign/app/maia/list/route.ts:1186` | externally addressable API route | direct call |
| 2 | `app/api/sovereign/app/maia/route.ts:343,497` | externally addressable API route | direct call |
| 3 | `lib/consciousness/maiaOrchestrator.ts:480,1027,1160` | **library**, reached by `app/api/between/chat/route.ts:18` | `import { getMaiaResponse } from '@/lib/sovereign/maiaService'` (`maiaOrchestrator.ts:22`) |
| 4 | `scripts/witness/cc-a-memory-provenance-witness.ts:108` | witness script | not a serving path |

There is a **second, unrelated** `getMaiaResponse` at `lib/learning/enhanced-maia-service.ts:400`.
No `app/api` route imports it; its only importers are `lib/consultation/deep-path-with-consultation.ts`
(dynamic import) and two root-level `test-*.ts` scripts. **Classification: not a live ingress.**
Name collision only — but a name collision on the single most load-bearing identifier in the system.

### 1.3 Cognition ingresses that never touch `getMaiaResponse()`

| Route | Cognition mechanism | Source |
|-------|--------------------|--------|
| `app/api/voice/stream-conversation/route.ts` | own `getClaudeService()` + `buildMaiaContext(userId)` | `:88, :842, :1073, :1336` |
| `app/api/maia/relational-navigation/route.ts` | `new Anthropic()` module-level, direct `messages.create` | `:46, :243, :252` |
| `app/api/maia/living-field/[fieldKey]/encounter/route.ts` | per-request Anthropic client, direct `messages.create` | `:34, :163, :239` |
| `app/api/maia/living-field/[fieldKey]/refine/route.ts` | same shape | grep set (2) |
| `app/api/portal/[slug]/chat/route.ts` | `new Anthropic()` module-level, model pinned `'claude-sonnet-5'` inline | `:32, :129, :136, :276` |
| `app/api/now-what/interview/route.ts` | `getLLMProvider()` + `composeRoomTurnPrompt()` | `:39, :50` |
| `app/api/maia/vision-studio/interview/route.ts` | `composeRoomTurnPrompt()` (sibling of the above) | `:37` |

`now-what/interview` is the one that **documents its own divergence and justifies it**
(`:44–49`): *"Deliberately NOT getMaiaResponse: that path increments turn count, reads history
from the DB, and writes the exchange — incompatible with this room's ephemeral, client-held,
no-write contract."* That is a legitimate, argued architectural exclusion, and the census records
it as such rather than as drift. It also demonstrates that a **fourth composition seam already
exists and is already shared across two routes**: `lib/maia/roomComposition.ts`
(*"one composition order, one field resolution, one provenance shape; extracted so the siblings
cannot drift"*). Any canonical-seam candidate must reckon with this seam — it is prior art in
the same repository for exactly the move CMT-01 contemplates, at room scope.

### 1.4 Liveness classification

Evidence classes: **[client-wired]** an in-repo client component calls it; **[mounted]** that
component is rendered by a page; **[prior-audit]** classified by an earlier lane, recorded here
without re-verification; **[no-caller]** no in-repo caller found.

| Ingress | Class | Evidence |
|---------|-------|----------|
| `sovereign/app/maia/list` | **live, canonical** [client-wired, mounted] | 5 of 5 `<OracleConversation>` mounts pass `apiEndpoint="/api/sovereign/app/maia/list"` — `app/maia/page.tsx:843,1540`; `app/field/talk/page.tsx:415`; `app/studio/maia/page.tsx:118`; `components/maia/presence/MaiaPresence.tsx:239`. Plus `lib/hooks/useMaiaChat.ts:129`, `components/academy/AcademySheet.tsx:240`, `app/book-companion/ain/page.tsx:151` |
| `between/chat` | **live, secondary** [client-wired, mounted] | `components/oracle/EmbeddedMAIAChat.tsx:95,156` → mounted at `app/oracle/iching/page.tsx:810`; `components/elemental-alchemy/BookChat.tsx:103` → mounted at `app/maia/community/elemental-alchemy/page.tsx:1237`; `app/chat-test/page.tsx:49`; server-side proxy `app/api/community/elemental-alchemy/ask/route.ts:70`. **Also the default** of `OracleConversation` (`components/OracleConversation.tsx:626`) — every current mount overrides it, so the default is currently unexercised but is one omitted prop away from live |
| `sovereign/app/maia` | **dormant** [no-caller] | no in-repo client reference; only self-references and comments. Registry classifies `dormant` on a 2026-05-23 48h traffic audit [prior-audit]. **Still externally addressable** |
| `voice/stream-conversation` | **unreachable from the voice UX; route still live** | `components/OracleConversation.tsx:7208–7250` records the structural removal of the divergent voice exit. `sendStreamingMessage` is now bound (`:2575`) and never called. The route, hook and SSE protocol are deliberately preserved as evidence. `hooks/useStreamingVoice.ts:633` still calls it — reachable only if a caller is restored |
| `maia/relational-navigation` | **live** [prior-audit] | CLAUDE.md Cat 6 "Relational Navigation Room"; tester-gated (`isMemberTester`, `:206`) |
| `maia/living-field/*` | **live** [prior-audit] | CLAUDE.md Cat 6 "Field Lab + tester gate" |
| `portal/[slug]/chat` | **unclassified** | not audited by this census; flagged in §10 |
| `now-what/interview`, `maia/vision-studio/interview` | **live** [prior-audit] | Now What client lane |
| `lib/learning/enhanced-maia-service.getMaiaResponse` | **dead** [no-caller] | test scripts + one dynamic import only |
| `components/consciousness/BetweenChatInterface.tsx` | **dead** | hardcoded `http://localhost:3005` (`:240`), no mount |

---

## 2. LIVE CONTEXT ASSEMBLERS

Four mechanisms, not one.

| # | Mechanism | Location | Enumerable from a data structure? |
|---|-----------|----------|-----------------------------------|
| A | Route-level pre-assembly, hand-written per route | `list/route.ts`, `between/chat/route.ts` | ❌ no — free-form local variables |
| B | `ADDENDA_SPECS` + `appendAllContextAddenda()` | `lib/sovereign/maiaVoice.ts:406–431, 489` | ✅ **yes — 24 declared fields** |
| C | FAST tier hand-maintained template literal | `lib/sovereign/maiaService.ts:1432` | ❌ no — positional interpolation, ~31 slots on one line |
| D | Room composition | `lib/maia/roomComposition.ts` | not audited (§10) |

**(B) is the only existing structurally enumerable producer set in the cognition path.** It is
also the only place carrying the standing sovereignty guardrails (§4).

---

## 3. SURFACE / MODALITY MAPPING

### 3.1 Cross-surface parity is real — and is an accident of client reuse, not a server boundary

- iOS is a Capacitor **static export** (`next.config.js:66` — `output: 'export'` under
  `CAPACITOR_BUILD`). No `app/api` route ships in the bundle. The device calls the same origin
  as the PWA via `lib/http/apiBase.ts` (`FALLBACK_API_BASE_URL = 'https://soullab.life'`).
- `scripts/capacitor-patch-routes.sh:106–115` excludes `app/maia/*` **sub-directories**, keeping
  the root page — which is the `<OracleConversation>` mount.
- Therefore **iOS, PWA and Desktop run the same component, hitting the same route.**

The consequence to hold precisely: **parity today is a property of one React component's props,
not of the server.** `OracleConversation`'s `apiEndpoint` prop defaults to `/api/between/chat`
(`:626`). A future mount that omits the prop silently acquires a materially different memory
field (§5) on one surface only, with no gate failing. **The parity contract has no enforcement
point on the server side.**

### 3.2 Voice

Voice converges into the same construction as typed input **at the client**, not at the server:
`handleVoiceTranscript` → `handleTextMessage` (`components/OracleConversation.tsx:7254`), pinned
by `__tests__/voice-non-degradation.test.ts`. That gate is the strongest existing structural
enforcement in the system and is the **methodological model** the canonical seam should follow:
two closed sets derived from the source by the compiler, failing on the unknown *because* it is
unknown. It governs one function, not the system.

---

## 4. FAST / CORE / DEEP DIFFERENCES

`getMaiaResponse()` re-forks into three tier functions —
`fastPathResponse` (709), `corePathResponse` (1512), `deepPathResponse` (1947).

| | FAST | CORE | DEEP-primary | DEEP-repair |
|---|---|---|---|---|
| Prompt builder | inline template literal `:1432` | `buildMaiaWisePrompt` `:1751` | `consciousnessOrchestrator` (local template weaving) | `buildMaiaComprehensivePrompt` `:2407` |
| Uses `appendAllContextAddenda` | ❌ **no** | ✅ yes (`maiaVoice.ts:894`) | ❌ n/a — **no system-prompt seam by construction** | ✅ yes (`maiaVoice.ts:956`) |
| Model call at all | yes | yes | **only if `MAIA_USE_CLAUDE_CONSULTATION === 'true'`** (`:2260`) | yes |

### 4.1 The material finding: standing sovereignty guardrails are tier-conditional

`appendAllContextAddenda` appends **unconditionally**, after the 24 specs:
`MEMORY SPEECH-ACT BOUNDARY` (`maiaVoice.ts:507`), `PLATFORM_KNOWLEDGE_ADDENDUM` (`:516`),
`PLATFORM_KNOWLEDGE_BOUNDARY` (`:520`), `INTERFACE_HUMILITY_GUARDRAIL` (`:524`).

FAST does not call it. Verified: `buildMaiaWisePrompt` appears at `maiaService.ts:1751` and
`:1906` only — both inside `corePathResponse`. A grep of the FAST body (lines 709–1511) for
`INTERFACE_HUMILITY | PLATFORM_KNOWLEDGE | SPEECH-ACT | appendAllContextAddenda` returns exactly
one hit: `${PLATFORM_KNOWLEDGE_ADDENDUM}` at `:1430`. None of these constants appear in
`lib/consciousness/MAIA_RUNTIME_PROMPT.ts`. `INTERFACE_HUMILITY_GUARDRAIL` is a module-private
const in `maiaVoice.ts` with exactly one use — inside `appendAllContextAddenda`.

**Therefore, on the FAST tier — which serves the majority of turns — MAIA receives the
platform map but NOT the Interface Humility standing discipline, NOT the platform knowledge
boundary, and NOT the memory speech-act boundary.**

Two source comments assert the opposite:
- `maiaVoice.ts:506` — *"Unconditional (every tier, every turn) — this is a capability boundary, not context."*
- `maiaVoice.ts:886–888` — *"both FAST+CORE (this function) and DEEP repair path … call the same helper."*

Both are false against the current tree. This is the highest-severity finding in the census: it
is a **sovereignty-gate divergence**, not a memory-richness divergence, and it is documented as
already closed.

> Recorded, not repaired. CMT-01's first threshold is the census. This finding is the strongest
> single argument for the canonical seam and belongs in the spec's migration order — it is not
> a defect to fix opportunistically inside a discovery pass.

### 4.2 Addendum-field divergence between the enumerable set and the FAST template

`ADDENDA_SPECS` (24) vs. the FAST template literal (~31 slots):

- **In `ADDENDA_SPECS`, absent from FAST**: `relationshipModeAddendum`, `guestContextAddendum`,
  `journalContextAddendum`, `captureContextAddendum`, `bridgeSnapshotAddendum`,
  `consultationAddendum`, `astrologicalContextAddendum`.
- **In FAST, absent from `ADDENDA_SPECS`**: `knowledgeFieldAddendum`, `practiceFieldAddendum`,
  `memoryInfluenceAddendum`, `forwardReadinessAddendum`, `youthPromptAddendum`,
  `stateVectorContract`, `cognitiveScaffolding`, `wisdomInjection`, `relationshipContext`,
  `selfletPromptBlock`, `timeAwareness`, `modeAdaptation`, `sanctuaryInstruction`,
  `astrologyAddendum`.
- **Field-name aliasing**: the route emits `astrologyAddendum`; CORE/DEEP map it onto
  `MaiaContext.astrologicalContextAddendum` (`maiaService.ts:2377`), FAST consumes
  `astrologyAddendum` directly. One signal, two field names, two channels.

---

## 5. THE TWO LIVE ROUTES CONSTRUCT MATERIALLY DIFFERENT INTELLIGENCE FIELDS

Derived by extracting every `*Addendum` / `*Block` identifier from each route file.

| Field | `/list` | `between/chat` | `sovereign/app/maia` |
|---|:--:|:--:|:--:|
| `forwardReadinessAddendum` | ✓ | ✓ | ✓ |
| `memoryInfluenceAddendum` | ✓ | ✓ | ✓ |
| `knowledgeGateAddendum` | ✓ | ✓ | · |
| `wuxingSnapshotAddendum` | ✓ | ✓ | · |
| `atomsAddendum` / `atomsBlock` | ✓ | · | · |
| `conversationalRecallAddendum` | ✓ | · | · |
| `episodicRecallAddendum` | ✓ | · | · |
| `memberWebAddendum` | ✓ | · | · |
| `placeAddendum` | ✓ | · | · |
| `practiceFieldAddendum` | ✓ | · | · |
| `relationalContextAddendum` | ✓ | · | · |
| `studioAddendum` | ✓ | · | · |
| `astrologyAddendum` | ✓ | · | · |
| `astrologicalContextAddendum` | · | ✓ | · |
| `bridgeSnapshotAddendum` | · | ✓ | · |
| `spiralSnapshotAddendum` | · | ✓ | · |
| `epistemicPathAddendum` | · | ✓ | · |
| `therapeuticFrameworkAddendum` | · | ✓ | · |
| `reflectionLensAddendum` | · | ✓ | · |
| `governorAddendum` | · | ✓ | · |
| `relationshipModeAddendum` | · | ✓ | · |
| `significantMomentsAddendum` | · | ✓ | · |
| `fieldWisdomAddendum` | · | ✓ | · |
| `guestContextAddendum` | · | ✓ | · |
| `journalContextAddendum` / `captureContextAddendum` | · | ✓ | · |

**Overlap: 4 fields. Disjoint: ~21.**

The same authenticated member, asking the same question, receives a **structurally different
MAIA** depending on whether they are in the main conversation surface or the I Ching room / book
companion. `/list` carries the consent-gated member memory (atoms, episodic, conversational
recall, relational context, member web); `between/chat` carries the interpretive/elemental
apparatus (spiral, bridge, epistemic path, therapeutic framework, governor) that `/list` does not.

Neither is a subset of the other. **Convergence therefore cannot be achieved by picking a
winner** — it requires the canonical constructor to own the union and the policy that decides
per-turn admission. That is precisely why the flow's *"do not use convergence as an opportunity
to add memory"* constraint is load-bearing and hard: the honest first seam must be able to
express *"this field is authorized here and not there"* without silently levelling up either route.

---

## 6. THE EXISTING RUNTIME-CONTEXT SEAM

`lib/maia/maiaRuntimeContext.ts` (404 lines). What it **is**:

- A **registry** — `MAIA_ROUTE_REGISTRY`, 3 entries, with a strong written convention
  (`:41–58`) explicitly forbidding registry additions made to silence warnings.
- An **inventory** — `summarizePromptBlock()` over 11 named addenda fields, producing
  `PROMPT_BLOCK_CHARS` and a `layers` boolean map.
- An **emitter** — the canonical 8-field `[MAIA/runtime]` log (`:333–350`) + a ring-buffer push
  for the admin substrate monitor (`recordRuntimeTurn`).
- A **client-visible recognition signal** — `formatRuntimeContextForResponse()` returns
  `memberRecognized` / `crossSessionMemory` / `sanctuary` booleans, added 2026-08-24 after the
  iOS memory-context divergence, so a device can distinguish *"MAIA has nothing to recall"* from
  *"MAIA was never told who I am"* (`:381–392`).

What it **is not**, by its own header (`:12–17`): it does not block, does not verify the
provider, does not modify the meta, does not write. And structurally:

1. **It is called by one route.** Only `list/route.ts:1124`. `sovereign/app/maia` and
   `between/chat` never call it.
2. **It observes 11 fields; the tiers consume ~38.** Its `layers` map inventories
   `memoryInfluence, forwardReadiness, atoms, relationalContext, memberWeb, astrology, studio,
   knowledgeGate, wuxing, conversational, episodic`. It has no visibility into the ~24 further
   producers that `ADDENDA_SPECS` and the FAST template inject **after** it has already emitted.
3. **It runs at the wrong moment.** Its own instruction (`:212`) is *"Call this after memoryHealth
   is built, before getMaiaResponse()."* Everything `maiaService` assembles internally happens
   after that emission — so `PROMPT_BLOCK_CHARS` is a partial count reported as a total.
4. **It cannot fail closed.** Unknown `routeId` is a `console.warn` (`:325–331`).

### 6.1 The CI guard's actual reach

`scripts/ci/maia-route-guard.test.ts` — two bidirectional assertions, both scoped to
`findRouteFiles(app/api)` filtered by `content.includes('getMaiaResponse(')` (`:94`). It is a
careful, well-reasoned test that documents why it reads the filesystem rather than the type
system. Its blind spot is structural and unavoidable at that design point:

> **`between/chat` calls `getMaiaResponse()` transitively through `maiaOrchestrator` and
> therefore contains no such string.** Its registry entry (`maiaRuntimeContext.ts:73–81`) records
> `callsMaiaResponse: false` with the description *"uses maiaOrchestrator, not getMaiaResponse"* —
> which is true of the file and false of the system. The route's ~30-addendum assembly reaches
> sovereign cognition with no registry obligation, no `buildMaiaRuntimeContext` call, and a
> green guard.

This is the exact v1 failure mode from the voice gate, in a different room: a check that asks
*"does this look like the thing we named?"* and answers no.

---

## 7. CURRENT PARTICIPATION EVIDENCE

Three independent per-turn observability channels exist. None of them is a participation manifest,
and all three are logs rather than records.

| Channel | Marker | Emitted from | Covers |
|---|---|---|---|
| Runtime context | `[MAIA/runtime]` | `maiaRuntimeContext.ts:341` | `/list` only |
| **Memory provenance (CC-A)** | `[MAIA/memprov]` | `maiaService.ts:927 (FAST), 1541 (CORE), 1975 (DEEP)` | **all three `getMaiaResponse` callers, all three tiers** |
| Corpus Callosum | `agent_runs` rows | `list/route.ts:1455`; `maiaOrchestrator.ts:590,640,685,736` | `/list` + `between/chat` |

**`lib/memory/provenance/turnMemoryProvenance.ts` is the closest existing thing to the Turn
Participation Manifest the flow specifies, and it was built with the right constitution.** Its
header states it is observational only, must never write back into member memory, never become a
retrieval source, and never be read as proof that retrieved material is true; and that no member
content, transcript, relational inference, PHI or prompt body may enter a record — *"only
identifiers, source classes, counts, booleans, versions and hashes"*, with `digest()` so two
contexts can be compared without either being read.

Its shape already carries: `contractVersion`, `route`, `tier`, `turnId`, `sessionRef`,
`memberRef`, `buildSha`, `sanctuary`, `bundleState`, `bundleConsulted`, `fallbackInvoked`,
`fallbackReason`, `contextOrigin`, `sources[] {sourceClass, requested, returnedMaterial,
itemCount, errorClass}`, `contextDigest`, `contextChars`, `provenanceId`.

Against the manifest fields the flow proposes, the gaps are: `surface/modality`,
`canonical_context_version`, `participation_policy_version`, `epistemic classes considered`,
`admitted/excluded/held counts`, `reason codes`, `sovereignty gates applied`. Its `sources[]` is
scoped to memory source classes, not to the full producer set.

It is also deliberately **not a store** (*"a durable provenance table would be a new
memory-adjacent store and would require custody review it does not have"*) — a constraint the
spec must either inherit or explicitly seek relief from.

---

## 8. KNOWN BYPASSES AND DIVERGENCES — CONSOLIDATED

| # | Divergence | Severity | Evidence |
|---|---|---|---|
| D1 | FAST tier does not receive `INTERFACE_HUMILITY_GUARDRAIL`, `PLATFORM_KNOWLEDGE_BOUNDARY`, or the memory speech-act boundary; two source comments claim it does | **sovereignty gate** | §4.1 |
| D2 | `between/chat` reaches `getMaiaResponse()` transitively; invisible to the CI guard; never calls `buildMaiaRuntimeContext` | **structural** | §6.1 |
| D3 | `/list` and `between/chat` assemble ~21 disjoint intelligence fields for the same member | **member-facing** | §5 |
| D4 | Three composition mechanisms inside `maiaService` (template literal / spec array / local weaving) | **structural** | §4 |
| D5 | `buildMaiaRuntimeContext` inventories 11 of ~38 producers and emits before the rest are assembled | **observability integrity** | §6 |
| D6 | `sovereign/app/maia` is dormant-by-audit but externally addressable and calls `getMaiaResponse()` | **latent** | §1.4 |
| D7 | `OracleConversation.apiEndpoint` defaults to `between/chat`; parity depends on every mount overriding it | **latent, surface-parity** | §3.1 |
| D8 | Five+ `/api/maia/*` and `/api/portal/*` routes invoke Anthropic directly with no shared construction | **structural** | §1.3 |
| D9 | Name collision: a second `getMaiaResponse` in `lib/learning/enhanced-maia-service.ts` | **hazard** | §1.2 |
| D10 | Stale comments at `maiaService.ts:2387–2398` assert DEEP-repair does *not* receive addenda; `maiaVoice.ts:956` shows it does | **documentation drift** | §4 |
| D11 | DEEP-primary has no system-prompt seam at all (`:2265–2268`) — it weaves templates; the model is consulted only under `MAIA_USE_CLAUDE_CONSULTATION=true` | **architectural, by design** | §4 |

D10 is worth naming precisely: **two comments in the same file contradict each other about
whether a consent-gated memory block reaches the prompt.** In a system whose discipline is
*declaration is not liveness*, the comments are now a less reliable witness than the code — which
is the condition a canonical seam exists to end.

---

## 9. ENUMERABILITY — TODAY AND UNDER EACH CANDIDATE

The P3-global ceiling restated at this layer: **can the set of producers entering cognition be
derived from the source, such that a new unclassified producer fails closed?**

### 9.1 Today

| Producer channel | Enumerable? | Fails closed on a new producer? |
|---|---|---|
| `ADDENDA_SPECS` (CORE + DEEP-repair) | ✅ 24 typed fields | ❌ — adding a field is a one-line append with no gate |
| FAST template literal | ❌ | ❌ |
| Route-level pre-assembly (`/list`, `between/chat`) | ❌ | ❌ |
| Direct-Anthropic routes | ❌ | ❌ |
| Route membership | ⚠️ partial — registry + CI guard | ❌ — string-match scoped to `route.ts` (D2) |

**Verdict: the current architecture cannot structurally enumerate the producer set.** This is the
same ceiling P3-global reported, and this census confirms it independently at the cognition layer.
It is not a reporting failure — it is a property of four composition mechanisms, two of which are
positional string interpolation.

### 9.2 What becomes enumerable under each candidate

*Assessment of enumerability only. Not a recommendation — adjudication is Kelly's.*

**Candidate A — promote `buildMaiaRuntimeContext`.**
Gains: registry + observability already exist and are already governed by a strong convention;
the client-visible recognition signal is already wired; no new abstraction. Requires: moving it
above `getMaiaResponse()`; giving it the `addenda` union rather than 11 hand-listed fields;
making unknown-route fail closed; and — the hard part — **it cannot enumerate what `maiaService`
assembles internally after it returns.** Under A, enumerability rises from 11 to ~21 route-level
producers; the ~24 tier-internal producers remain outside unless the tier fork is also moved
above the seam. **A alone does not close P3-global.**

**Candidate B — a higher-level constructor containing it.**
Gains: can own the union of route-level and tier-level assembly, and can make `getMaiaResponse()`
take a single constructed object rather than a free-form `meta` bag — which is what would let a
compiler-derived closed set exist at all. Cost: a second abstraction over a seam that already has
a registry and a CI guard, with a migration window in which both are authoritative. The
`meta as any` casts throughout `maiaService.ts:2370–2405` are the concrete obstacle B would have
to remove, and they are the same obstacle A would eventually hit.

**Candidate C — structure required by the actual topology.**
The topology suggests the real boundary is **the `meta` bag itself**. Every divergence in §8
except D1 is a consequence of `meta` being an untyped open record that any route may populate
and any tier may read by `(meta as any)?.someAddendum`. A typed, closed, versioned
`CanonicalTurn` object — constructed in exactly one place, consumed positionally nowhere — makes
"a new unclassified producer" a **compile error**, which is the only form in which the flow's
fail-closed requirement can be honestly met. `lib/maia/roomComposition.ts` is prior art for this
shape at room scope, and `ADDENDA_SPECS` is prior art for it at addendum scope. Neither has been
audited by this census for suitability as the general form.

**Honest statement of the ceiling**: under A or B alone, P3-global recertification would still
report an architectural ceiling. Only a candidate that closes the `meta` channel can produce a
genuinely closed producer set. **This census does not claim C is correct** — establishing that
requires reading `roomComposition.ts` and the full `meta` contract, which is spec work.

---

## 10. UNKNOWNS — WHAT THIS CENSUS DOES NOT ESTABLISH

1. **No traffic evidence.** Every liveness claim is code-derived or inherited from a prior audit.
   The 2026-05-23 dormancy finding for `sovereign/app/maia` is 3+ months old and was not re-run.
2. **`app/api/portal/[slug]/chat` is unclassified.** It pins `'claude-sonnet-5'` inline and its
   identity path was not resolved.
3. **`lib/maia/roomComposition.ts` was not read.** It is the fourth composition seam and the
   closest existing analogue to the target architecture. **This is the largest single gap.**
4. **`buildMaiaContext` (`lib/maia/context/buildMaiaContext.ts`) was not read.** It is the
   voice-route assembler and is referenced by `maiaService` entry.
5. **Identity/member-resolution paths were only sampled.** `/list` uses `resolveMemberIdentity`;
   `sovereign/app/maia` and `voice/stream-conversation` use `getMemberFromRequest` + `x-member-id`;
   `between/chat`, `relational-navigation` and `living-field` use `getCurrentSession` /
   `probeAuthPosture`. **At least three distinct member-resolution mechanisms serve cognition.**
   Not audited for equivalence. Flagged, not repaired — the flow explicitly excludes
   authentication work absent a proven dependency, and this census does not yet prove one.
6. **Whether every declared addendum reaches the prompt** was verified for FAST (template
   literal, read directly) and for the `appendAllContextAddenda` channel (read directly). It was
   **not** verified field-by-field for the route-level assemblers.
7. **MIPA is absent from this repository.** No file, no doc, no commit message, on either branch,
   contains the string `MIPA`. The same is true of the P1/P2/P3a–f/P6 lane labels as a set.
   *Caveat: this clone is shallow (208 commits), so history search is bounded.* Nothing resembling
   a participation-adjudication layer was found; the nearest existing structures are the CC-A
   provenance record (§7) and `ADDENDA_SPECS` (§2B). **The census therefore does not describe a
   MIPA seam, because there is nothing in the tree to describe.** See the adjudication question below.
8. **Direct-Anthropic route set is a pattern match**, with the ceiling stated in §1.1.

---

## 11. WHAT THE SPEC WILL NEED, THAT THIS CENSUS DID NOT PRODUCE

Recorded so the second deliverable does not silently inherit gaps:

- A read of `roomComposition.ts` and `buildMaiaContext.ts` (unknowns 3–4).
- A member-resolution equivalence audit across the ≥3 mechanisms (unknown 5).
- A decision on the `meta` channel — the load-bearing choice underneath A/B/C (§9.2).
- A ruling on whether the participation manifest may become a durable record, given CC-A's
  explicit custody-review constraint (§7).
- Traffic evidence for `between/chat`, `portal/[slug]/chat`, and re-verification of
  `sovereign/app/maia` dormancy.

---

## 12. ADJUDICATION REQUESTED — STOP POINT

Per the flow, work stops here. Two decisions are Kelly's:

1. **Topology + candidate** — A, B, C, or a shape the topology in §1–§5 suggests that this census
   did not name.

2. **The one high-value clarifying question**: *MIPA does not exist in this repository (§10.7).*
   The flow treats "MIPA participation" as an existing layer the canonical constructor must
   invoke. It is not in the tree. Which is true?

   - **(a)** MIPA is a **naming** for work that exists here under other names — in which case the
     spec should identify it with `ADDENDA_SPECS` + the CC-A provenance record and stop inventing.
   - **(b)** MIPA is a **Phase 0 conceptual output** that was adjudicated but never landed as code
     — in which case the canonical seam is where it first becomes real, and CMT-01 is larger than
     convergence.
   - **(c)** MIPA lives **outside this repository or outside this clone's 208-commit history** —
     in which case the census needs the source before the spec can name a participation seam.

   The answer changes the shape of the seam, so it is asked before the spec rather than assumed
   inside it.

---

## 13. DEFINITION OF SUCCESS — DISTANCE FROM TARGET

> *One structurally enforced MAIA turn-construction boundary through which identity,
> sovereignty, provenance, participation, and the authorized intelligence field are assembled
> before cognition — and we can prove what participated in every live MAIA turn.*

| Property | State |
|---|---|
| One boundary | ❌ four mechanisms (§2), seven+ ingresses (§1) |
| Structurally enforced | ❌ warn-only + a string-match CI guard with a proven blind spot (§6) |
| Identity assembled canonically | ❌ ≥3 mechanisms (§10.5) |
| Sovereignty gates uniform | ❌ **D1 — FAST lacks three standing guardrails** (§4.1) |
| Provenance | ⚠️ CC-A exists, is well-constituted, covers 3 tiers, scoped to memory source classes (§7) |
| Participation | ❌ nothing to enumerate against (§10.7) |
| Authorized intelligence field | ❌ ~21 disjoint fields across two live routes (§5) |
| Provable per turn | ⚠️ three partial channels, none complete, none unified (§7) |

**Nothing in this census authorizes a change to the seam, a repair of D1, or an expansion of
MAIA's intelligence field.**

---

## ADDENDUM — 2026-09-03, post-adjudication targeted reads

Kelly's ruling (Candidate C; A retained as instrumentation; B as scaffolding only; MIPA = (b);
D1 = first implementation gate) directed three targeted reads before the spec. Their results
amend §10 as follows. Full treatment: `MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md`.

**Unknown 3 — `lib/maia/roomComposition.ts` (337 lines) — RESOLVED.** Prior art for four of
the spec's moves: (i) unconditional constitutional floor, NW-I01 — *"A floor a flag can remove is
not a floor"*; (ii) authorization checked before composition (`memberMayComposeField`, refusal
default); (iii) provenance carried on the reply (`RoomFieldProvenance`, `source: 'request' |
'room-default'`, *"no silent composition either way"*); (iv) a shared composer extracted so two
sibling routes cannot drift. It is also the **sole embodiment** of a further prior-art artifact
the census missed: `lib/maia/context-assembly/contextAssembly.ts` — a CANDIDATE interface
(2026-07-08) stating *"no encounter surface constructs its own conversational intelligence"*,
authority zero, with `AssembledBlock {key, text}` + `sources[]` + `hasAnything`. Its two cited
adjudication documents (`CONTEXT_ASSEMBLY_INVARIANT_CANDIDATE_2026-07-08.md`,
`CONTEXT_ASSEMBLY_SEAM_GAP_2026-07-08.md`) **do not exist in this tree** — the same absence
pattern as MIPA. The spec absorbs the candidate (§3.4).

**Unknown 4 — `lib/maia/context/buildMaiaContext.ts` (101 lines) — RESOLVED.** Identity-layer
continuity only (astrology addendum, display name, pronouns, `hasBirthData`), "fill missing
only", non-blocking. It is a **producer**, not an assembler; it registers as
`retrieved.astrology` + identity display fields. Its header records the exact bug class the
seam exists for: *"a conversation flowing through a newer/alternative route… silently loses the
natal chart that the original oracle route loaded."*

**Unknown 5 — member-resolution mechanisms — RESOLVED, and upgraded to a PROVEN DEPENDENCY.**
Five mechanisms serve MAIA-claiming cognition, two of which honor an unverified claim:

| Mechanism | Verified? | Honors bare claim? | Where |
|---|---|---|---|
| `lib/auth/getMemberFromRequest.getMemberIdFromRequest` (claim must match session) | ✅ | ❌ | `/list`, `sovereign/app/maia` |
| `lib/scribe/scribeAuth.getMemberIdFromRequest` (same name, no claim-match) | ✅ | ❌ | `now-what/interview` (+30 importers) |
| `getCurrentSession()` cookie-only, then `explorerId` / `anon:` | ✅ | ❌ | `between/chat`, `relational-navigation` |
| `probeAuthPosture()` — log-only, **returns bare `x-member-id`** | ❌ | ✅ | all 9 `living-field/*` incl. `encounter`, `refine` |
| `bodyUserId \|\| getMemberIdFromRequest` — body **first** | partial | ✅ | `voice/stream-conversation:637` → `MemoryBundleService.build({ userId })` `:1194` |

Refusal-03 (`tests/constitutional/refusal-registry/refusal-03-body-userid-not-trusted.ts:22`)
disclaims exactly this: *"passingDoesNotAuthorize: that every route USES this resolver."* Two
MAIA-claiming ingresses therefore compose member material off an identity the system did not
verify. A `CanonicalTurn` whose `identity.status === 'verified'` can be populated from a claim
would make the manifest false on those routes — so one-resolver identity is a precondition of
the seam, not an optional repair. The spec binds to the already-ratified
`docs/specs/AUTH_POSTURE_X_MEMBER_ID_2026-07-11.md` §4 and sequences its Phase 1 as the
onboarding step for those ingresses (spec §4.1). No auth work beyond that is authorized.

**Direct-Anthropic ingress classification (was: pattern-match set in §1.1) — RESOLVED.**

| Route | Claims MAIA participation? | Member memory composed? | Disposition |
|---|---|---|---|
| `portal/[slug]/chat` | **No** — virtual practitioner for public visitors; no member identity; `'claude-sonnet-5'` inline | no | G5 allowlist |
| `anthropic/ping`, `build/alert` | No — infrastructure | no | G5 allowlist |
| `studio/with-me/*/synthesize` | No — facilitator tool over session events | no (facilitator-scoped) | G5 allowlist |
| `practitioner/practice-field/draft` | Bounded drafting tool (mirror invariant) | practitioner's own material | G5 allowlist v1 — Kelly decision |
| `maia/relational-navigation` | **Yes** — MAIA room; own `systemPrompt`; no memory loaders; no `MAIA_RUNTIME_PROMPT` | no | must construct a turn (`room_direct`) |
| `maia/living-field/*/encounter`, `/refine` | **Yes** — MAIA room; `buildEncounterContext` loads `personal_living_fields`, versions, `personal_states`, `living_field_affinities` | **yes, off unverified id** | must construct a turn; identity onboarding = auth-posture Phase 1 |
| `now-what/interview`, `vision-studio/interview` | **Yes** — via `roomComposition` (floor + presence + field + position + lesson) | yes (atoms, memory-influence, conversational recall) | must construct a turn; `roomPolicy.persists=false` |
| `voice/stream-conversation` | **Yes** — `ClaudeService.buildMaiaSystemPrompt` (**0** references to `MAIA_RUNTIME_PROMPT`: a third MAIA system-prompt source) + `MemoryBundleService` + `buildMaiaContext` | **yes, off body-first id** | retire or onboard — Kelly decision |

**Corrected count.** The census §0 said "four distinct turn-construction mechanisms." With
`ClaudeService.buildMaiaSystemPrompt` and `buildEncounterContext` now read, the honest count of
**MAIA-claiming prompt-composition mechanisms** in the tree is **six**: route pre-assembly
(`/list`, `between/chat`), `ADDENDA_SPECS`/`appendAllContextAddenda`, the FAST template literal,
`roomComposition`, `ClaudeService.buildMaiaSystemPrompt`, and `living-field/encounterContext`.
The `meta` bag (200 `(meta as any)` casts, 62 distinct keys, `MaiaRequest.meta?: Record<string,
unknown>` at `maiaService.ts:590`) is the single open channel beneath the first three; the other
three never touch it and are governed by nothing shared. The spec's §0 names closing that
channel as the load-bearing move and §8 G5 as the partition that brings the other three under
the same boundary.
