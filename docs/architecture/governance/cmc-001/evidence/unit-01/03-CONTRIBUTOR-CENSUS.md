# CMC-001 · §XXXIV — Artifact 3: Contributor Census (Phase-1 unit scope)

Referent for all records: `origin/clean-main-no-secrets @ 52a3b924b7cf52013c1c8b0d635359c2cad672fc`

Five evidence fields (§VII) are identical for all seven records below unless noted:
`evidence_basis: STATIC_POSSIBLE` · `route_status: REGISTERED_CANONICAL_LIVE` ·
`observed_status: NOT_OBSERVED` · `evidence_date: 2026-08-12` ·
`referent_binding: origin/clean-main-no-secrets @ 52a3b92…`

`observed_status: NOT_OBSERVED` for every record: no runtime witness is authorized
(§XXVII) and none was performed. Nothing below is a claim about what did execute.

---

## C1 — conversational recall
- **Producer** `loadPriorCrossSessionExchanges(userId, session.id, 6)` — `lib/maia/memoryLoaders.ts`; called `route.ts:978`
- **Entry condition** `allowCrossSessionMemory && userId` (`route.ts:908`); further suppressed by formatter on `opt-out` / `sanctuary` / `empty` / `session-resumption` (`lib/maia/conversationalRecallBlock.ts:86-102`)
- **Upstream representation** record collection (prior cross-session exchanges), max 6
- **Source substrate** conversation turns, cross-session
- **Selection** hard cap 6 at retrieval; recency-ordered; `computeLastPriorSessionMinutesAgo` gates session-resumption suppression (`route.ts:984`)
- **Transformation** none semantic — formatter states "the structural fact" (`conversationalRecallBlock.ts:15`)
- **Serialization boundary** `formatPriorExchangesForPrompt` → `route.ts:980`. **This is the last point structure exists.**
- **Truncation** `MAX_LINE_CONTENT_CHARS = 280` per line, ellipsis-suffixed (`conversationalRecallBlock.ts:78, 143-144`)
- **Surviving provenance** prose block only; no per-exchange durable ID survives serialization
- **Influence** explicit recall (system-retrieved, cross-session)
- **Visibility** surfaceable
- **Assertion warrant** structural fact of prior exchange; content is 280-char-truncated so verbatim quotation is unsafe
- **Assembly position** FAST `maiaService.ts:1297`, after `fieldWisdom`, before `episodicRecall`

## C2 — episodic recall
- **Producer** `loadRecentMarkedEpisodes(userId, 5)` — `lib/maia/memoryLoaders.ts`; `route.ts:1006`
- **Entry condition** same gate as C1; formatter suppresses on `opt-out` / `sanctuary` / `empty` / `non-recent` (`lib/maia/episodicRecallBlock.ts:92-111`)
- **Upstream representation** record collection of **member-marked** episodes
- **Source substrate** episodic records — **member-marked only**. `route.ts:998-999`: "never significance/emotional_intensity/breakthrough_level inference"
- **Selection** recency window filter then `MAX_EPISODES = 5` (`episodicRecallBlock.ts:84, 114`)
- **Transformation** none inferential
- **Serialization boundary** `formatMarkedEpisodesForPrompt` — `route.ts:1008`
- **Truncation** `MAX_LINE_CONTENT_CHARS = 280` (`:83, 149-150`); date reduced to `toISOString().slice(0,10)` — day granularity (`:158`)
- **Surviving provenance** date string survives; episode ID does not
- **Influence** explicit recall
- **Visibility** surfaceable — member marked it
- **Assertion warrant** high for existence (member-marked), day-granular for time
- **Assembly position** FAST `:1297`, after `conversationalRecall`

## C3 — atoms
- **Producer** `loadMemberMemoryAtomsForPrompt(userId)` — `lib/maia/memoryAtomsLoader.ts` (blob `7b246ea1…`); `route.ts:959`
- **Entry condition** same gate; `formatAtomsForPrompt` returns falsy → no addendum (`route.ts:961-967`)
- **Upstream representation** `MemoryAtomSnapshot[]` — structured, retained in `atomsResult` beyond serialization
- **Source substrate** member-placed portfolio atoms, **consent-gated, non-synthesized** (`route.ts:958`)
- **Selection** loader orders `is_breakthrough DESC` (`route.ts:1071-1072`)
- **Serialization boundary** `formatAtomsForPrompt` — `route.ts:961`
- **Surviving provenance** structured `atomsResult` survives *in the route* and feeds `memoryHealth.semantic`, `markedBreakthroughCount`, and `meta.atomsLoadedCount` (`route.ts:1092, 1075, 1217`) — but the *prompt-facing* representation is prose
- **Influence** explicit
- **Visibility** surfaceable (consent-gated at source)
- **Assembly position** FAST `:1297`, after `episodicRecall`
- **Note (§XV)** the registry declares `atomsExpected: true` for this route; **no code compares that declaration to `atomsResult.length` or `atomsError`.** See Artifact 2 §2.

## C4 — `relationalContext`
- **Producer** `getMemberActiveRelationalContext(userId, {relationshipId})` — `lib/relationships/relationshipContextService.ts`; `route.ts:877`
- **Entry condition** `userId && !isSanctuary && body.relationshipContextId` non-empty string (`route.ts:873-875`). **Explicit member handoff only — never ambient.** `allowRecentThreadFallback` deliberately off (`route.ts:868-870`)
- **Upstream representation** `ActiveRelationalContext` — structured: `relationshipId`, `relationshipLabel`, `mode`, `realm`, `bondType`, `continuitySignals[]`, `salientThemes[]`, `currentTensions[]`
- **Source substrate** MIXED — entry **kinds** are member-authored; **themes** and **tension signals** are system inference from `lib/consciousness/relationalObserver.ts` (`formatRelationalContextForPrompt.ts:10-14`)
- **Selection** service returns most recent five entry kinds (`formatRelationalContextForPrompt.ts:15-16`)
- **Transformation** system inference upstream (observer-produced themes/tensions)
- **Serialization boundary** `formatRelationalContextForPrompt` — `route.ts:881`
- **Truncation** no char cap; recency cap of 5 upstream
- **Surviving provenance** **structurally notable:** the block *labels* provenance in prose — "Entries the member logged" vs "Themes the system observed" vs "Tension signals the system flagged" (`:59, 64, 69`), and states "Entry kinds are the member's own. Themes and tension signals are system inference, not their words, and may be wrong" (`:75-76`). `relationshipId` survives **out-of-band** in `meta.relationalContextId` (`route.ts:882, 1221`) but **not inside the serialized block.**
- **DISCONTINUITY** no timestamps survive; the block explicitly compensates in prose: "no timestamp… never present it as current fact" (`:77-79`)
- **Influence** mixed — explicit provenance labelling, implicit instruction ("background, not an agenda", "Do not recite this list back", `:82-84`)
- **Visibility** restricted by instruction — do not recite
- **Assertion warrant** deliberately floored: record-of-what-was-written, never present fact; member overrides record (`:80-81`)
- **Assembly position** FAST `:1297`, after `atoms`, before `memoryInfluence`

## C5 — `relationshipContext`
- **Producer** `loadRelationshipMemory(userId, {includeThemes:true, includeBreakthroughs:true, includePatterns:false, maxThemes:3, maxBreakthroughs:1})` → `formatRelationshipMemoryForPrompt` — `lib/sovereign/maiaService.ts:684-690`, `:1090-1092`
- **Entry condition** `userId && !isSanctuary` — **ambient on every authenticated non-sanctuary FAST turn** (`:682`)
- **Upstream representation** `RelationshipMemoryContext` — `totalEncounters`, `relationshipPhase`, `themes[]`, `breakthroughs[]` (`:691`)
- **Selection** FAST path caps: 3 themes, 1 breakthrough; patterns skipped "for speed" (`:687-689`)
- **Serialization boundary** `formatRelationshipMemoryForPrompt` — `maiaService.ts:1091`
- **Influence** implicit continuity (ambient, not member-triggered)
- **Assembly position** FAST `:1297`, **early** — immediately after `cognitiveScaffolding`
- **NOT INVENTORIED** absent from `MaiaRuntimeContext.promptBlock`; the route never sees it
- **Distinct from C4** — see Artifact 2 §5 for the full disambiguation

## C6 — memory influence (developmental)
- **Producer** `buildMemoryInfluencePlan({...}).promptBlock` — `lib/maia/memoryOrchestrator.ts`; `route.ts:927-956`
- **Inputs** `loadRecentDevelopmentalMemories(userId, 3)`, `loadRecentThemeSignals(userId, 10)` (`route.ts:911-912`)
- **Entry condition** `allowCrossSessionMemory && userId`; plan emits `promptBlock` or `undefined` (`route.ts:956`)
- **Notable flags** `hasMemberLiveContext: false` and `hasRelationshipAnamnesis: false` are **hardcoded** on this route (`route.ts:936-937`) with the stated reason that /list loads memory via `MemoryBundleService`, not the `relationshipMemory` variable used by `/api/between/chat`. **OBSERVED. Not followed further — §IX-A forbids tracing into `between/chat`.**
- **Influence** implicit continuity — this is the §XIII mechanism
- **Assembly position** FAST `:1297`, after `relationalContext`

## C7 — memory health
- **Producer** `buildMemoryHealth(...)` — `lib/maia/memoryHealth.ts`; `route.ts:1084-1115`
- **Twelve layers**; five in `BASE_CHAIN`
- **Consumers** `console.warn`/`console.log` (`route.ts:1116-1119`), `MaiaRuntimeContext.memoryHealth` (`:1133`), API response payload (`:1528-1529`)
- **NOT a prompt contributor on this route** — absent from the `meta` passed to `getMaiaResponse` (`route.ts:1189-1237`) and absent from the `:1297` assembly string
- **Known internal truth-marking (recorded, not repaired):** `memoryHealth.semantic` is fed by the **atoms row count**, not semantic retrieval — "no semantic retrieval exists on this path… the field keeps its canon §VII layer name pending a canon amendment" (`memoryHealth.ts:97-100`; `route.ts:1088-1092`). A layer name asserts a capability the substrate does not provide; the code says so in the same place. Recorded per §XIX; not repaired.
- **Second known caveat** `conversational` and `episodic` counts are *retriever candidate* counts and do not distinguish emitted from suppressed (`route.ts:1097-1107`). So `memoryHealth.conversational === 'ok'` does **not** mean the block reached the prompt.
