# CMC-001 · Phase 1 · Unit 2
## Artifact 3: Contributor Survival Matrix — CORE/DEEP relative to FAST

Referent `52a3b924b7cf52013c1c8b0d635359c2cad672fc`. All rows OBSERVED from executable
code unless marked. Five §VII evidence fields are constant across every row and are stated
once at the foot rather than repeated 8×.

Legend: **SURVIVES** = reaches a model prompt on the default path ·
**RESERIALIZED** = reaches it through a different mechanism/order ·
**DISAPPEARS** = present in `meta`, never read by the path ·
**CONDITIONAL** = reaches a model only under a gate not statically decidable.

| # | Contributor | FAST | CORE | DEEP (primary) |
|---|---|---|---|---|
| C1 | `conversationalRecallAddendum` | SURVIVES — `:1224`, site `:1297` | **RESERIALIZED** — `MaiaContext:1581` → `ADDENDA_SPECS:427` → `maiaVoice:913` | **DISAPPEARS** — consultation `:2098` / repair `:2215` only |
| C2 | `episodicRecallAddendum` | SURVIVES — `:1234`, site `:1297` | **RESERIALIZED** — `:1584` → `SPECS:428` | **DISAPPEARS** — `:2099` / `:2222` only |
| C3 | `atomsAddendum` | SURVIVES — `:1245`, site `:1297` | **RESERIALIZED** — `:1587` → `SPECS:429` | **DISAPPEARS** — `:2100` / `:2226` only |
| C4 | `relationalContextAddendum` | SURVIVES — `:1253`, site `:1297` | **RESERIALIZED** — `:1588` → `SPECS:430` | **DISAPPEARS** — `:2101` / `:2227` only |
| C5 | `relationshipContext` (from `relationshipMemory`) | SURVIVES — loaded `:684`, serialized `:1090-1092`, site `:1297`, early position | **SURVIVES, different depth** — loaded `:1419` (5 themes / 2 breakthroughs), serialized `maiaVoice:891-896` (same serializer) | **DISAPPEARS** — loaded `:1826` at the *richest* depth (10/5), stored `:1834`, **never serialized** |
| C6 | `memoryInfluenceAddendum` | SURVIVES — `:1199`, site `:1297` | **DISAPPEARS** — absent from 1377–1787; **not in `ADDENDA_SPECS`** | **DISAPPEARS** — absent from 1788–2295 |
| C7 | `forwardReadinessAddendum` | SURVIVES — `:1205`, site `:1297` | **DISAPPEARS** — absent from 1377–1787; **not in `ADDENDA_SPECS`** | **DISAPPEARS** — absent from 1788–2295 |
| C8 | `contextPrompt` channel (`memoryContext` / `recentContext` / `recentThreadBlock`) | SURVIVES — built `:847-867`, passed as `userInput` `:1339` | **DISAPPEARS** — `userInput: input` (raw) at `:1722`; neither identifier occurs in range | **DISAPPEARS** — `userInput: input` at `:2108`/`:2243`; neither identifier occurs in range |

Exhaustiveness of the negative claims (C6, C7, C8) was established by whole-range
identifier scan of lines 1377–1787 and 1788–2295 of blob `e8f5bf6d…`, plus scan of
`ADDENDA_SPECS` (`maiaVoice.ts:406-431`) — zero occurrences. This is an absence proven over
a bounded range, not an unobserved absence.

---

### The four answers the unit was asked for

**SURVIVE unchanged:** none. Every contributor that reaches CORE does so through a
different mechanism than in FAST.

**SURVIVE with changed serialization (CORE only):** C1–C4. Same four strings, same
relative order, but delivered via `MaiaContext` fields → `ADDENDA_SPECS` iteration →
`appendAllContextAddenda`, instead of direct template interpolation. Two consequences
distinguish the channels:
* In FAST the four sit **mid-string** among 33 interpolations, before
  `stateVectorContract` and `youthPrompt`. In CORE `appendAllContextAddenda` appends them
  and then **appends four unconditional trailing blocks after them** — the MEMORY
  SPEECH-ACT BOUNDARY (`maiaVoice:507`), `PLATFORM_KNOWLEDGE_ADDENDUM` (`:514`),
  `PLATFORM_KNOWLEDGE_BOUNDARY` (`:518`), and `INTERFACE_HUMILITY_GUARDRAIL` (`:522`).
  Recency position relative to the member's own material therefore differs by path.
* In CORE the assembled prompt is subsequently **rewritten wholesale** by
  `adaptResponsePromptWithPolicy(adaptivePrompt, policy)` at `maiaService:1684`. FAST
  applies no equivalent transform to `baseSystemPrompt`. Whether that rewrite preserves
  the addenda is a property of `adaptResponsePromptWithPolicy` and was **not traced** —
  out of unit scope, recorded in Unit 2 §F.

**DISAPPEAR:** C6 and C7 disappear in *both* CORE and DEEP — they exist in `meta`, are
built by the route (`route.ts:908-968`, `:1051-1058`), and are read by no consumer outside
`fastPathResponse`. C8 disappears in both. C1–C5 disappear on DEEP-primary.

**SUPPLEMENTED DIFFERENTLY:** CORE gains material FAST does not have —
`ElementalOracleBridge` results (`:1440-1453`, `:1472`), an I Ching silent mapping
(`:1479-1494`, log-only, no prompt effect), `routeWisdom` injection (`:1668-1673`),
`consciousnessPolicy` (`:1408-1462`), and `formatFieldAddendum(fieldContext)`
(`:1692-1708`). DEEP gains `ConsciousnessContext` orchestration (`:2034-2052`) and a
deeper relationship-memory *load*. FAST alone carries C6, C7, C8.

---

### The topological finding

The three profiles are not three renderings of one context. They are **three different
context architectures** that happen to be handed the same `meta`:

* **FAST** — direct interpolation, dual-channel (system prompt + `contextPrompt`),
  11 route addenda + 22 local. Richest continuity surface.
* **CORE** — indirect via a typed `MaiaContext` contract whose `ADDENDA_SPECS` registry
  admits 24 named fields, of which C6/C7 are not members. Single-channel, raw `userInput`.
* **DEEP** — no prompt seam. A structured `ConsciousnessContext` with eight non-addendum
  fields. Continuity reaches a model only via a disabled-by-default env flag or a
  validation-failure repair.

The gradient runs opposite to intent: the profile selected for the member's *deepest*
material (`'shadow work'`, `'help me with my trauma'`, `'core wound'` — `processingProfiles.ts:107-119`)
is the profile that discards the most continuity.

**This is recorded as a topology finding, not a defect claim and not a repair proposal
(§XIX).** Whether any real member turn reaches DEEP is `RUNTIME_BRANCH_UNRESOLVED`.

---

### §VII evidence classification — applies to every row above

| Field | Value |
|---|---|
| `evidence_basis` | `STATIC_POSSIBLE` — executable code read at a bound SHA. Not `RUNTIME_OBSERVED`; no witness performed. |
| `route_status` | `REGISTERED_CANONICAL_LIVE` (`sovereign/app/maia/list`, per registry at `52a3b92`; inherited from Unit 1 Artifact 1, evidence_date 2026-08-12) |
| `observed_status` | `OBSERVATION_PENDING_AUTHORITY` — Phase 1 is static; §XXVII authority not granted |
| `evidence_date` | 2026-08-12 |
| `referent_binding` | `origin/clean-main-no-secrets` @ `52a3b924b7cf52013c1c8b0d635359c2cad672fc`; deployed referent `DEPLOYED_REFERENT_UNBOUND` |
