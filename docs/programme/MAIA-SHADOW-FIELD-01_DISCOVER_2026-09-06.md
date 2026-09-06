# MAIA-SHADOW-FIELD-01 · SHADOW-01 / DISCOVER — prior-art census

```text
LANE        MAIA-SHADOW-FIELD-01 (record: MAIA-SHADOW-FIELD-01_LANE_DEFINITION_2026-09-06.md)
STAGE       SHADOW-01 / DISCOVER — read-only census
AUTHORIZED  founder, 2026-09-06 ("DISCOVER authorized")
BASE        clean-main-no-secrets @ 69f6fb7c (this branch adds docs only)
MODE        READ ONLY — no repairs, migrations, renames, prototypes, or retirement decisions
LAWS        CANDIDATE. Every "appears to challenge" below is a potential conflict with a candidate
            law, recorded for FALSIFY and CONSTITUTE. Nothing here adjudicates.
METHOD      four read-only census agents (one per named module; one sweep of the live cognition
            path), each answering the founder's eight questions with path:line citations; the
            conductor then re-read ten load-bearing claims at source (§10). Observation status:
            READ (code/prompt/copy at a named path) · UNKNOWN (with reason). Nothing WALKED —
            no runtime was touched.
STATUS      DISCOVER COMPLETE · awaiting founder acceptance (§11)
```

## 0 · The founder's question, answered first

> For each piece of prior art: what exists, what conception of shadow it embodies, who holds
> interpretive authority, what it asserts about a person and whether the person can see it,
> what it persists, whether it can shape later MAIA behavior invisibly, what is reusable
> without its epistemology, and which candidate laws it appears to challenge.

**The decisive finding is not in the three named modules.** It is on the live path. Today,
on `/api/sovereign/app/maia/list`, MAIA already enters shadow interpretation **uninvited, on
substring inference, on every tier**, and a second shadow voice runs **on every turn** whether
or not the member said anything about shadow:

- **M1 · Shadow Guardian.** Any of `shadow · dark · hidden · avoid · resist · pattern · repeat ·
  sabotage`, or phrases like *"keep doing this"*, *"triggered by"*, *"what's wrong with me"*,
  summons a system-prompt injection that tells the model *"The user is encountering shadow
  material — patterns, projections, or rejected parts. The Shadow Guardian is now present"*,
  *"Projection onto others reveals disowned parts of self"*, *"Self-sabotage often protects us
  from something we fear"*, and directs it to *"Reframe the pattern"*. On FAST, CORE and DEEP.
  The member sees none of this. The pattern label is written to `agent_runs`. The injection
  also offers a tool, `shadow-integration-space`, for which **no route or page exists**.
- **M2 · Elemental Oracle shadow voice.** `enabledElements` includes `'shadow'` and the bridge
  is called with `includeAll: true` on all three tiers, so a "Shadow/Integrator" reading is
  computed and logged for every turn. It does not reach the prompt.

So the Invoked entrance the lane proposes is **not a new capability**. It is the replacement of
an existing uninvited one with a member-chosen one. And the only member-chosen shadow surface
already in production navigation (the Journal panel's "Shadow Work — Guided depth exploration"
flow) is the one that **persists nothing and calls no model**. The organism currently has the
two halves of the Field inverted: the consented surface has no intelligence, and the
intelligence has no consent.

The three named modules sort as: **reachable and inert** (`shadowWorkFlows`), **orphaned but
writing** (`ShadowIntegrationTracker`), **dead but designed** (`shadow-insight`). The
philosophically important one, `shadow-insight`, cannot run today for two independent reasons,
yet its *stated design* — a hidden psychological representation that shapes the agent and is
"never exposed to user" — is live elsewhere in three sibling modules the whole-organism census
already ranked (X1, X3). §5 carries that question forward to FALSIFY and CONSTITUTE without
answering it.

## 1 · Prior-art register — one row per item

| Item | Exists / reachable | Conception of shadow | Interpretive authority | Assertions about the person · visible? | Persists | Invisible effect on later MAIA | Candidate laws it appears to challenge |
|---|---|---|---|---|---|---|---|
| **A · `shadowWorkFlows.ts`** + `app/api/consciousness/shadow-work/route.ts` + `ShadowWorkGuide.tsx` | 495 / 225 / 610 lines. **Reachable** by members: `app/maia/page.tsx:803` (`spatialMaiaShell` default on) → `JournalPanel.tsx:66-71` "Shadow Work". Also founder Lab Tools `app/maia/labtools/page.tsx:328` | Jungian-developmental-archetypal, non-clinical disclaimer (`:2-13`); astrological overlay via `HOUSE_NEURAL_MAPPING` (house → "pathologicalExpressions") | **Member** within a flow — every step is an open question in a free textarea (`ShadowWorkGuide.tsx:451-461`), nothing reads or scores it. **System** at selection in two API paths the UI does not use: `suggestShadowFlow({awarenessLevel})` (`:476-495`, route `:78-86`, no producer of `awarenessLevel` exists) and `generateHouseShadowFlow(house)` (`:350`, house is a URL param; component ignores `houseFlows`, `:126`) | Hand-written flows: none person-specific. House flows: *"The {archetype} shadow can manifest as: Impulsivity without awareness, Narcissistic self-absorption…"* (`:373-374`; `neuroArchetypalMapping.ts:151-156`) — **visible**, rendered verbatim | **Nothing.** `route.ts:175` "In a full implementation, this would save to database"; POST echoes; `onComplete` is `console.log` (`app/maia/page.tsx:1784`) | None. No import on the `/list` path. Latent: `HOUSE_NEURAL_MAPPING` drives persisted house inference elsewhere (`lib/journal/chartIntegrationService.ts:244, 299, 400`) | ENTRY (system-chosen flow paths exist in the API) · INTERPRETIVE (house shadow stated as fact; "Every shadow holds a gift" `:134`) · PLURALITY (one flow, one archetype per house) · RELATIONAL (`projection_retrieval` names a real person and reframes them as carrier of the member's material `:166-167, :180-181`). **Not** MEMORY. EXIT and DEPENDENCY appear **supported** (integration practice returns to body and week `:155-158`; no MAIA turn needed) |
| **B · `ShadowIntegrationTracker.ts`** + `app/api/elemental-alchemy/shadow/route.ts` + `UnifiedSpiralogicAlchemyMap.ts` | 855 / 414 / 677 lines. **Orphaned**: no page or component calls the API; only an auth test references it. PATCH hard-disabled 501 (`route.ts:355-363`, founder ruling `:354`: no provable owner column) | Developmental-archetypal with alchemical overlay (nigredo → rubedo), operationalized behaviorally. 12 fixed facets, each with a canonical `shadowPattern` and a prescribed `goldMedicine` (`UnifiedSpiralogicAlchemyMap.ts:46-47, 85-86`). Member text filed as `personal*` beneath `official*` (`:62-67`) | Split, weighted to the map. Member names the pattern (`:56`). **Algorithm decides integration**: `wasIntegrated: !!(goldMedicineApplied \|\| responseTaken)` (`:230`). MAIA absent; no LLM call anywhere | Declaratives: *"This shows developing mastery"* (`:466`), *"could indicate deep integration"* (`:496`), *"{n}% of your tracked shadows are {element}-related"* + fixed per-element diagnoses, e.g. Aether → *"Spiritual bypassing"* (`:518, :524`), *"This is alchemical transformation in action"* (`:548`). Visible in principle (API body); no UI renders them | **Yes.** `ea_shadow_instances` rows incl. computed `was_integrated` (route `:102-137`); `ea_shadow_patterns` (`db/migrations/20251214_elemental_alchemy.sql:82-158` — note `db/`, not `database/`). Metrics in process-local Maps (`:790-793`, vanish on restart). Sixteen derived quantities: integration rates, trends, streak-style achievements (§3.B) | None today. No reader on the `/list` path; nothing on `meta` | INTERPRETIVE (declarations) · MEMORY (inferred `was_integrated` persisted, never affirmed) · PLURALITY (one facet → one shadow → one remedy) · DEPENDENCY (map holds the interpretation; member naming subordinate) · ENTRY, mild (`suggestShadowPatternsForFacet` `:561` proposes from journey position). Also a direct tension with `docs/ACCOMPANIMENT_MODEL.md:170-181` ("No Progress Tracking … No completion percentages … No Growth Mechanics") |
| **C · `shadow-insight.ts`** + `lib/agent-context.ts` + `lib/enriched-agent-prompts.ts` | 155 / 247 / 209 lines. **Dead.** Chain: shadow-insight → agent-context → enriched-agent-prompts → **no importer**. Only other consumer is `app/api/between/chat/route.enhanced.backup.ts` (not a route file; excluded from ship typecheck `tsconfig.ship.json:71`; type-incoherent — calls a one-arg async `detectShadow` against a two-arg sync signature and reads fields that do not exist). `PetalIntensities` input has **no producer anywhere** | Behavioral asymmetry between two channels (petal check-in intensity vs keyword presence in text), Jungian veneer via a fixed 12-item `SHADOW_THEMES` list ("imposter syndrome", "fear of success"). `asymmetryScore` = substring-count ratio presented as a 0–1 psychological quantity (`:100-102`); a single word "fear" fires four fear-themes at once (`:89-96`) | **Algorithm computes, agent alone consumes.** `agent-context.ts:1-2`: *"Hidden intelligence layer … Never exposed to user — shapes agent's intuitive responses"*; `:206`: *"HIDDEN CONTEXT (do not reveal these values)"*. Member is never a party: no consent, display, correction, or adoption | `avoidedFacets`, `overEmphasized`, `silences`, *"Asymmetry Score: X% (significant misalignment)"* (`:211`). **Visible nowhere** by design | None in the chain (pure functions). Downstream of the dead backup route: UNKNOWN | **Today: no** (unreachable). **Dormant: would not run** (broken + no input). **Designed intent: yes, emphatically** — `asymmetryScore > 0.5` → `responseMode = 'invite'`, injects "slow pace / don't rush to fill silence" (`:120-134, :217`): the member would feel a stance change with no available account of why | ENTRY (classifier inference) · INTERPRETIVE (declarations) · MEMORY, in intent (forward-shaping context with no adoption) · PLURALITY (one fixed theme list) · EXIT (no off-switch; cannot leave a mode never disclosed) · DEPENDENCY, weak. Plus the question in §5, which no current law names |
| **M1 · Shadow Guardian** (`lib/consciousness/maia-path-revelation.ts:258-266`; `WisdomRouter.ts:122-147`) | **Live on all tiers**: `routeWisdom` at `maiaService.ts:1262` FAST, `:1879` CORE, `:2106` DEEP; injected into the FAST template at `:1464` (`${wisdomInjection}`), CORE `:1882`, DEEP `:2110` | Jungian, stated as doctrine to the model: gold in what is resisted, projection = disowned parts, self-sabotage = protection | **System.** First-match substring scan; no request verb required. "I keep avoiding my inbox" summons it | *"The user is encountering shadow material"*; *"Projection onto others reveals disowned parts of self"* — **not visible** to the member; shapes the utterance | `agent_runs` WisdomRouter row with `wisdomPatterns.pattern` / `toolId` (`corpusCallosumService.ts:404-420`). Sanctuary posture refuses the write (`:112-118`) | Yes — this *is* the invisible effect, on the live path, today | ENTRY · INTERPRETIVE · MEMORY (label persisted without adoption) · RELATIONAL (instructs a reading of an absent person's role). The offered tool `shadow-integration-space` has no route — an offer that cannot be honored |
| **M2 · Elemental Oracle shadow voice** (`lib/bridges/elemental-oracle-bridge.ts:175, 166-170, 641-645`) | **Live, every turn**: `includeAll: true` at `maiaService.ts:852` FAST, `:1654` CORE, `:2208` DEEP | "Shadow/Integrator" archetype; *"What shadow gifts await integration?"* | System | Intensity/archetype reading (`:354-357`) — not visible; not in prompt | `agent_runs` rows `element='shadow'` with `output_text` (`corpusCallosumService.ts:110-158, 470-540`) | Not today (parked in `meta.elementalResult` `:863`); the substrate exists for it | PLURALITY (a standing shadow voice rather than a chosen perspective) · MEMORY (per-turn persistence of a system reading) |
| **M3 · Scribe escalation** (`maiaService.ts:522-536`) | Live, Scribe mode only. `shadow` listed under "DEEP escalation" but no tier selector reads it; consumers are memory recall `:2966`, lattice elevation `:538-560` → write `:3544-3585` (gated `memoryMode === 'longterm'`), embedding `:3594` | Lexical | System | none | In Scribe mode the single word converts capture-only into recall + lattice write + embedding | Yes (memory shape) | MEMORY |
| **M4 · Consultation type** (`maiaService.ts:2566-2601`) | DEEP only; `'archetypal-guidance'` on `mother \| father \| shadow \| pattern` **or** `profile.dominantElement === 'aether'` (`:2581-2585`). Consumed only when `MAIA_USE_CLAUDE_CONSULTATION === 'true'` — **off by default** (`:2328`); deployed value UNKNOWN | Archetypal (parent/child, shadow, anima/animus) | System; `dominantElement` is keyword scoring (`conversation-elemental-tracker.ts:253, 289`); `relationshipDepth = min(history.length × 0.1, 1)` | *"The user is engaging archetypal patterns"* (`claudeConsciousnessService.ts:295-322`); consultation may substitute MAIA's response (`:2394-2405`) — not visible | none found (metadata only) | When enabled, yes | ENTRY (aether fires with no shadow word) · INTERPRETIVE (substitution) |
| **M5 · Standing prompt baseline** (`MAIA_RUNTIME_PROMPT.ts:15, 75, 152-158`) | Live, every turn | Stance: "I hold opposites together: light and shadow"; "sensitivity to shadow material, complexes, and split-off parts" | — | none about the person; `:152-158` restrains jargon unless the member introduces it first | none | It is a stance, not a member assertion | INTERPRETIVE, weakly; `:152-158` counter-weighs |
| **DEEP tier entry** (`processingProfiles.ts:107-121`) | Live | — | **Member** — literal phrases `'shadow work'`, `'guide me into the shadow'`, `'take me deeper'` | none | none | Tier only; down-regulators `:240-251` can pull DEEP → CORE on Bloom level / bypassing score (X1) | The one phrase-explicit, request-shaped gate on the path. "Let's look at the shadow in this" does **not** match it |

## 2 · Unreached stacks (exist, do not participate)

Recorded so DISCOVER is complete, not so they are inherited:
`app/api/_backend/src/agents/ShadowAgent.ts` + `shadowWorkModule.ts` +
`agentOrchestrator-shadow-integration.ts` (a real Jungian agent on the `_backend` stack, not
imported by `/list`); `lib/oracle/**` (MaiaOrchestrator, SacredListeningDetector,
MaiaSystemPrompt, GenZLifeCompanion gold-projection — parallel, unreached);
`lib/beta/SoulprintTracking.ts` `shadowIntegrationScore` (no importer under `lib/sovereign` or
`app/api/sovereign`); `lib/knowledge/DreamConversationWisdom.ts` (curiosity over interpretation
`:25`, yet decoded equivalences *"An enemy = possibly your shadow"* `:142`; reachable only via
`PersonalOracleAgent` / `TenantMAIA`, not `/list`).

## 3 · The three named modules — the founder's particular risks

### 3.A `shadowWorkFlows.ts` — initiation / interpretation authority

*Does MAIA decide what the member should explore?* **In the shipped UI, no.** The member picks
a flow from cards (`ShadowWorkGuide.tsx:283-332`) and answers open questions nothing reads. **In
the API, the capacity exists and is unused**: `suggestShadowFlow` maps a numeric
`awarenessLevel` to a flow (`≤2` → basic recognition, `≥4` → projection retrieval), exposed as
`?suggest=true&awarenessLevel=N`, defaulting to 2; **no code in the repository produces an
`awarenessLevel`** — the route comment says "Could accept context params". `generateHouseShadowFlow`
keys a flow off an astrological house passed as a URL parameter; the twelve are enumerated in the
default listing but the component never reads them. The system-authored part that *is* visible is
the house flow's opening declaration of "pathological expressions" — typological content shown
verbatim. Everything else in this module is scaffolding around member-authored, unread,
unpersisted answers. Three flows exist: basic recognition, projection retrieval, inner critic
(step names at `:84-153, :174-243, :264-334`).

### 3.B `ShadowIntegrationTracker.ts` — teleology and measurement

*Does it presume shadow work has a measurable direction called "progress"?* **Yes, explicitly and
structurally.** Header: *"Measure transformation over time with insights and progress metrics"*
(`:6`). Status is ordered `active → integrating → integrated → dormant` (`:75`); insights are typed
`'progress' | 'achievement'` (`:137`); `wasIntegrated` is **computed** from whether two optional
fields were filled (`:230`) and written to a database column (route `:115, :135`) the member never
affirms. Derived quantities: `averageIntegrationRate` (`:357-361`), `integrationRate × 100`
(route `:258-301`), status counts, `shadowsByElement`, 30/90-day windows, `patternsIntegratedLast90`,
`mostActivePattern`, weekly `integrationRate` / `averageIntensity`, `intensityTrend`,
`frequencyTrend`, dominant-element percentage with per-element diagnosis, SQL `AVG(intensity)` per
day, and consistency "achievements" (`:532-540`); `awarenessSpeed` is `0, // TODO`. The map supplies
the canonical shadow and its remedy per facet; the member's own words are the `personal*`
customization of an `official*` text. No model is ever called. The endpoint is reachable by URL and
writes a real table; nothing in the product calls it.

### 3.C `shadow-insight.ts` — hidden psychological representation

*Can MAIA form a model about the member that changes its behavior without becoming part of the
shared conversational field?* Three answers, kept separate:

- **Today — no.** No live route, prompt, write, profile, routing decision or `meta` field carries
  `avoidedFacets`, `overEmphasized`, `silences`, or `asymmetryScore`.
- **Dormant — would not run if restored.** The only consumer is a backup file that is not a route,
  is excluded from ship typecheck, calls the function with the wrong arity and reads fields the type
  does not have; and the `PetalIntensities` input it needs is produced nowhere.
- **Designed intent — yes, and that is its stated purpose.** *"Never exposed to user — shapes
  agent's intuitive responses"*; *"HIDDEN CONTEXT (do not reveal these values)"*; `asymmetryScore
  > 0.5` sets `responseMode = 'invite'` and injects pacing instructions. The member would
  experience a change in stance with no account of why, no way to see the claim, contest it,
  contextualize it, or revoke it.

The intent is the load-bearing object, not the code. The same intent is **live** in three siblings
the whole-organism census already placed: `processingProfiles.ts` (cognitive altitude / bypassing
frequency → tier and depth; X1), `panconsciousFieldRouter.ts` (realm/intensity routing; X1),
`relationalObserver.ts` (relational rows about the member; X3). `shadow-insight` is the dead
member of a live family.

## 4 · What "let's look at the shadow in this" does today, end to end

1. `routeWisdom` matches `shadow` → Shadow Guardian injection into the system prompt on whatever
   tier the turn lands (M1). Tool offer for a space that does not exist.
2. Elemental Oracle runs all voices including shadow (M2) — but it did that on the previous
   neutral turn too.
3. Tier: **not DEEP** — the phrase misses `processingProfiles.ts:107-121`; FAST/CORE per the usual
   router, with X1 down-regulators applicable.
4. In Scribe mode only: recall + lattice write + embedding switch on (M3).
5. On DEEP with the consultation flag on (default off): `'archetypal-guidance'` consultation may
   substitute the response (M4).
6. `agent_runs` receives the WisdomRouter pattern row and the shadow-voice row; Sanctuary refuses
   both writes.

Mechanism only. The member asked; the system had already decided before they asked, and would
have decided the same on "I keep avoiding my inbox".

## 5 · The question DISCOVER hands forward (not answered here)

> **May MAIA privately know something psychologically consequential about someone that the
> person cannot encounter, contest, contextualize, or revoke?**

DISCOVER establishes only that the organism currently answers *yes* in three live places and
*intended yes* in a fourth, and that none of the seven candidate laws names this directly. The
RELATIONAL law is about the absent person; the INTERPRETIVE law is about declaration versus
possibility; the MEMORY law is about persistence. A hidden representation that is neither
persisted nor declared nor about a third party slips between them. Whether that needs an eighth
law, a clause in an existing one, or is already covered by Invariant 5/6 and P12 (Honest in Both
Directions) is for FALSIFY to test and CONSTITUTE to rule.

## 6 · Participating systems (from the whole-organism map, verified here only where noted)

| System | Standing | What the Field could inherit | What it must not inherit |
|---|---|---|---|
| Relational Navigation Room (`lib/maia/relationalNavigation/prompts.ts` header) | live, Field Lab shelf | the negative-form invariant (does not model the absent party; returns authority at the close, every time) — the RELATIONAL law's source | — |
| Now What? (`app/api/now-what/interview/route.ts:63-84`, `lib/nowWhat/roomGrammar.ts`, `LIVED_RETURN_GROUNDING`) | live instance | "Reflect before interpreting"; "Do NOT sort, type, label"; return without evaluation ("Not living something is information … never a failure") | Larry-specific flourishing domains (census X14) |
| Practice Field PF-1 | live substrate; "practice" names four unrelated substrates and no spec (census 08) | the room-composition mechanism | instructed familiarity (X15) |
| Sanctuary (`lib/sanctuary/sanctuaryGuards.ts`) | live; toggle unreachable in conversation (X5, WALKED 2026-08-28) | the absolute boundary; corpus-callosum write refusal under Sanctuary posture is already structural (`corpusCallosumService.ts:112-118`) | the Field cannot rely on a toggle the member cannot reach |
| Field Lab (`lib/maia/fieldLab/{experiments,shelf,governance}.ts`, `app/maia/field-lab/page.tsx`) | live; **no tester flag, allowlist, or admission table found** — each room declares a `governingUncertainty` validated at `governance.ts:99-165`; the bound is editorial (what is on the shelf), not per-member. **Corrects the lane record §9, which assumed a "tester gate".** | the governing-uncertainty declaration as the shape of a Field's own epistemic contract | an assumption of per-member gating that does not exist |
| Canonical turn (`lib/maia/canonical-turn/`) | M0–M2 landed; M3 unauthorized; closed 38-producer registry | the three-axis provenance (`authoredBy` · `participationClass` · `authority`) for the six-register grammar | any new producer; any reopening of M3 |
| Refusal registry (`tests/constitutional/refusal-registry/`, 36 files, tail `refusal-31`) | live gate | FALSIFY's landing place | — |

## 7 · Candidate-law exposure matrix (potential conflicts, not adjudicated)

| | A flows | B tracker | C insight | M1 guardian | M2 voice | M3 scribe | M4 consult | M5 baseline |
|---|---|---|---|---|---|---|---|---|
| ENTRY | API only | mild | intent | **live** | — | — | live (aether) | — |
| INTERPRETIVE | house flows | **yes** | intent | **live** | — | — | live (subst.) | weak |
| MEMORY | no | **yes** (DB) | intent | live (`agent_runs`) | live (`agent_runs`) | live (Scribe) | — | — |
| PLURALITY | yes | yes | intent | — | standing voice | — | — | — |
| RELATIONAL | yes | no | — | **live** | — | — | — | — |
| EXIT | supported | — | no exit | no affordance | — | — | — | — |
| DEPENDENCY | supported | yes | weak | — | — | — | — | — |
| §5 hidden-knowledge | — | — | **the specimen** | live | live (logged) | — | — | — |

Reading rule: a cell says where a potential conflict *appears*; "live" means the mechanism runs
on the authoritative route today; "intent" means the design says so and the code cannot run.

## 8 · Reusable without inheriting the epistemology

Stated neutrally; reuse is a DESIGN decision, not made here.

- **Step shape** — title · instruction · one open question · optional body prompt · suggested
  seconds (`shadowWorkFlows.ts:29-40`); body-attention prompts (*"Place a hand where you feel the
  sensation. Breathe into that space."* `:101-103`); the pause/pace disclaimer (`:79-81`);
  back-navigation preserving prior answers; Exit always visible; the deferred integration-practice
  card (`ShadowWorkGuide.tsx:552-571`).
- **The "when it arises" note form** — trigger · context · how noticed (body sensation / emotion /
  behavior / thought / external feedback) · awareness · insights (`ShadowIntegrationTracker.ts:32`),
  **decoupled from any official pattern, score, status or rate**; member-named pattern
  (`:56-57`); chronological retrieval of one's own entries without derived quantities (`:282`).
- **The actor-from-session check and the fail-closed PATCH rationale** in the tracker route
  (`:52-63, :181-191, :332-354`) — exemplary as written.
- **Questions as offers** — `generateShadowQuestions` (*"What might be left unsaid here?"*
  `shadow-insight.ts:113-132`) and `generateContextualQuestions` (`agent-context.ts:156-192`), if
  issued because the member chose the door rather than because a hidden score crossed 0.5.
- **Tone/mode vocabulary** (`agent-context.ts:32-33, 232-248`) as a *member-selectable* stance.
- **Petal → element arithmetic** over member-supplied check-ins (`shadow-insight.ts:16-29,
  135-156`) — arithmetic, not inference.
- **The encounter-and-projection differentiation order** already in the research corpus (what
  happened → what you experienced → what meaning it acquired → …) — the projection door's spine.
- **Not reusable on the evidence**: `detectShadow` scoring; `formatAgentPromptContext`
  (concealment is its function); `SHADOW_THEMES`; the Shadow Guardian injection text; the
  `official*` / `goldMedicine` canon; every derived metric in §3.B; house-keyed "pathological
  expressions".

## 9 · Evidence gaps (UNKNOWN, with reason)

- **Authorship dates** of all shadow modules — the clone's history begins at a single import
  merge (2026-09-02); pre-import provenance is not recoverable here.
- **Deployed `MAIA_USE_CLAUDE_CONSULTATION`** — no env read (read-only census); M4 is off by code
  default.
- **Whether `ea_shadow_instances` / `ea_shadow_patterns` exist in the production database** — the
  migration lives under `db/migrations/`, not `database/migrations/`; runner state not inspected.
- **Whether any member-facing surface reads `agent_runs` shadow rows** — none found; `app/` not
  exhaustively audited.
- **`MEMBER_REQUEST_PATTERNS` first-match precedence** for arbitrary sentences — table shape
  verified, not every earlier pattern's substrings.
- **Runtime reachability of the Journal "Shadow Work" button per member** — asserted from the
  flag default and forced migration, not from a session.
- **Downstream of the dead backup route** (`processUltimateMAIAConsciousnessSession`,
  `autonomousEcosystem.processMessage`) — not traced; it never executes.
- **Whether `shadow-integration-space` ever had a surface** — only the registry entry exists.

## 10 · Conductor re-verification at source

Ten claims re-read directly before this record was written: the M1 pattern table
(`maia-path-revelation.ts:256-268`); `${wisdomInjection}` inside the FAST template
(`maiaService.ts:1464`); `enabledElements` includes `'shadow'` (`elemental-oracle-bridge.ts:175`)
and `includeAll: true` at `maiaService.ts:852 / 1654 / 2208`; the Journal panel button
(`JournalPanel.tsx:64-72`); `agent-context.ts:1-2` and `:206`; `wasIntegrated` (`:230`) and the
PATCH 501; `shadow-integration-space` present only in the registry file; the DEEP explicit phrases
(`processingProfiles.ts:107-112`); the Shadow Guardian assertion text (`WisdomRouter.ts:124-132`);
the consultation flag (`maiaService.ts:2326-2328`). All held. Agent-reported line numbers that
differed by a few lines were replaced with the verified ones.

## 11 · What DISCOVER does not do, and what it hands to FALSIFY

Not done here: no adjudication of any potential conflict; no inherit / retire / quarantine
decision; no repair of M1's phantom tool offer, the tracker's computed `was_integrated`, or the
Sanctuary reachability defect; no runtime measurement.

Handed to FALSIFY as candidate failure tests, each with a specimen already in the tree:

1. **Uninvited entry** — specimen M1: a bare substring summons shadow framing. Detector: prompt
   assembly audit for `AGENT_VOICE_PROMPTS.shadow` on turns with no member request.
2. **Declaration where a possibility was owed** — specimens M1 text, tracker insights, house
   "pathological expressions".
3. **Silent persistence of a system reading** — specimens M1/M2 `agent_runs` rows, tracker
   `was_integrated`, Scribe lattice write on one word.
4. **Hidden representation that shapes behavior** (§5) — specimen `agent-context` intent; live
   siblings X1/X3.
5. **Collapse to one reading** — specimens one-flow / one-facet / one-theme-list / one standing
   voice.
6. **Modeling the absent person** — specimen `projection_retrieval` and the Guardian's
   "projection onto others".
7. **Teleology** — specimen tracker: progress, integration rate, achievements.
8. **No exit** — specimen: no "stop this lens" affordance on any shadow branch.
9. **An offer that cannot be honored** — specimen `shadow-integration-space`.
10. **Inverted halves** — the consented surface has no intelligence; the intelligence has no
    consent. A Field that fixes one half only reproduces the other.

Founder acceptance of this census is the exit gate. On acceptance the founder names what is
inherited, retired, or quarantined **as a ruling**, and FALSIFY opens. Nothing in MAIA changed
during this census.

```text
DISCOVER   COMPLETE · READ · nothing WALKED · nothing repaired
NEXT       founder acceptance → FALSIFY
NOT        any code
```
