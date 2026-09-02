# MAIA Long-Term Memory — Current-State Census

**Lane**: JARVIS — Long-Term Memory Participation (Cat-5)
**Status**: Census complete. No production behavior changed. Awaiting architectural adjudication.
**Date**: 2026-09-02
**Branch**: `claude/maia-long-term-memory-fda5gf`
**Governing question**: *How should something from a member's history become eligible to enter the present MAIA relationship?*

**Restraint honored**: no embeddings added to a live route, no pgvector wired into MAIA retrieval, no prompt-composition change, no limit widened, no ranking altered, no new memory write, no Keep/Mark semantics touched, no deploy. Defects discovered in the census are **recorded, not repaired**.

**Hard separation honored**: nothing in this document touches `extendSession`, auth cookies/tokens, identity parity, anonymous-session handling, `useMaiaChat.ts`, or re-auth UI. Those belong to the identity-continuity lane. This census assumes the server has correctly resolved the authenticated member and studies what happens after.

---

## 0. Headline finding

> **MAIA's memory system is a *consent and provenance* architecture with no *relevance* architecture.**

Every live retrieval path is conditioned on **who** (member scope), **when** (recency), **whether** (consent gates), and **how significant the member said it was** (Keep / Mark / breakthrough). **No live path is conditioned on *what the member is currently asking about*.**

This is not an accident or an omission that slipped through. It is **declared policy, versioned in code**:

> `lib/maia/memorySelectionPolicy.ts:44` —
> *"Ordering is breakthrough-first then most-recently-kept; **relevance to the current conversation does not participate in selection under this policy version**."*

> `lib/maia/memorySelectionPolicy.ts:32` (`OPERATIONAL_CONTINUITY_DECLARATION`) —
> *"Current operational continuity is provided through recent conversational context only… This provides short-horizon continuity but **does not constitute durable relational memory**."*

The gap this lane investigates is therefore **already named by the system about itself**. The census confirms the declaration is accurate, maps its exact boundary, and finds that the mechanism for closing it partially exists in the codebase but is pointed elsewhere (§3.7).

### The corollary that matters for design

The *reason* selection is not relevance-conditioned is not merely that nobody built the search. Selection is currently governed by predicates whose authority is **member-conferred and auditable** — `return_preference`, `marked_by_member`, `is_breakthrough`, `member_response_status`, `sacred_protected`. Recency is a defensible tiebreak inside that consent envelope because it asserts nothing. **Similarity asserts something.** Introducing relevance introduces the first selection dimension in the system whose authority originates in *the machine's judgment about meaning* rather than in a member act. That is the real threshold, not the retrieval engineering.

---

## 1. Architecture specimens — Louisiana and Karen

Founder-run production diagnostics, 2026-09-02. **Recorded as architecture specimens, not as causal evidence for any witnessed failure.**

### 1.0 Evidentiary discipline (governing standard for this lane)

An earlier draft of this census recorded the Louisiana case as an empirical specimen *proving that retrieval architecture caused* the witnessed 2026-09-02 exchange. **That was too strong, and it is corrected here** (founder ruling, 2026-09-02).

The `ILIKE '%Louisiana%'` probe located historical Louisiana material under the member identity. It did **not** locate the September 2 exchange itself. Because a turn served under an unresolved server identity is not durably written on this path, the *absence* of a September 2 row cannot distinguish between:

- **A** — recognized member, retrieval could not reach Louisiana; and
- **B** — server-side anonymous, the memory bundle never loaded at all.

**The server identity of that specific turn is UNKNOWN and must not be used as causal evidence.** Doing so would launder an unknown into a fact.

| Question | Status |
|---|---|
| Does Louisiana history exist under the member identity? | **YES** |
| Is MAIA persisting recent recognized-member turns? | **YES** |
| Do valid (unrevoked, unexpired) sessions exist? | **YES** |
| Does query-conditioned long-term retrieval exist? | **NO** (§3.6) |
| Is fixed 30-day expiry without renewal a real defect? | **YES** *(Lane 1, not this lane)* |
| Can client-only identity converse server-side as anonymous? | **YES / architecturally possible** *(Lane 1)* |
| Was the witnessed 2026-09-02 turn recognized server-side? | **UNKNOWN** |
| Was that failure caused by A rather than B? | **NOT PROVEN** |

**The governing standard this lane carries forward:**

> **Not "does it exist?" but "can we prove it participated in the living MAIA turn?"**

This standard is not confined to memory. It applies identically to RFI, Unified Resonant Intelligence, Spiralogic, Anamnesis, developmental intelligence, relational intelligence, FIS, and every other declared capability. The census below is written to it: every claim about what participates is anchored to a live call site, and every claim about what does not is anchored to an absent one.

**The lane does not depend on the screenshot.** The architectural finding stands independently of which turn failed and why.

### 1.1 Louisiana — autobiographical material outside every window

| Probe | Result |
|---|---|
| `conversation_turns` matching `%Louisiana%` | 7 rows under member `ce284751…` — 2026-08-18, 2026-08-04, 2026-08-02, 2026-03-22 (×3) |
| Last 3 days grouped by `user_id` | Two concrete member UUIDs (130 / 12 turns); no NULL group returned |
| `auth_sessions` for the account | Multiple rows with `revoked = false` AND `expires_at > NOW()` |

**Specimen statement (the claim the evidence supports):**

> Louisiana-bearing historical material demonstrably exists under the member identity, while the canonical live route has no mechanism to retrieve arbitrary historical conversation conditioned on the current query. Such material is therefore **structurally unreachable through general autobiographical recall** unless it happens to be captured by another eligible memory layer (a Kept atom, a Marked episode, or a turn inside the recency window).

**Root cause of the *structural* unreachability, from source (§3):** the only live retrieval over `conversation_turns` is recency-ordered with `LIMIT 6` (`lib/maia/memoryLoaders.ts:207-214`) and `LIMIT 12` (`lib/memory/MemoryBundle.ts:222-229`). Turn-volume evidence below shows how far outside those windows the material sits. **No code path anywhere in the repository searches `conversation_turns` by content** (§3.6). The unreachability is total, not marginal.

### 1.2 Turn volume — the windows in scale

Seven days of traffic for the same member:

| Day | Sessions | Turns |
|---|---|---|
| 2026-09-01 | 1 | 16 |
| 2026-08-31 | 6 | 114 |
| 2026-08-30 | 1 | 4 |
| 2026-08-29 | 1 | 10 |
| 2026-08-28 | 4 | 160 |
| 2026-08-27 | 11 | 142 |
| **7-day total** | **24 sessions** | **446 turns** |

**The `LIMIT 6` cross-session window covers roughly the last two hours of a single active day.** The `LIMIT 12` bundle window covers roughly four. The 2026-03-22 Louisiana turns sit behind an unmeasured but clearly five-to-six-figure volume of intervening rows.

This also partially answers Unknown #1 (§10) for one member: the corpus is **hundreds of turns per week across dozens of sessions**. Candidate retrieval is not a small-corpus problem, and per-member growth is fast enough that any fixed-N recency window degrades continuously as engagement increases. **The more a member uses MAIA, the less of their history she can reach.**

### 1.3 Karen — Test Case 2 specimen

| Probe | Result |
|---|---|
| `conversation_turns` matching `%Karen%` | 5 rows, all 2026-08-28, all in `session_1787879627399` |

Five days before the census. **Already unreachable**: at least 130 turns were written after it, so the material is roughly twenty times outside the `LIMIT 6` window and ten times outside `LIMIT 12`. It also sits in a single session — one bounded conversation — which is exactly the shape Test Case 8 requires and which no live retrieval path can address (§7, Case 8).

**Confirms without inference**: person-referential history accumulates in `conversation_turns` and becomes unreachable within days, not months. Whatever the identity lane finds, this material would not have been retrievable by a fully recognized member either.

### 1.4 Platform observation (Lane 1 boundary, recorded not pursued)

Session ids show two client families under one member: `session_<epoch>` and `desktop-<epoch>`. On 2026-08-27 alone, six distinct `desktop-*` sessions produced 104 turns alongside five `session_*` sessions.

Two facts follow, and they point in opposite directions:

1. **Desktop turns are landing under the correct member id** — so the desktop client is authenticating and persisting correctly.
2. **Each client generates its own session id**, and every cross-session loader excludes only the *current* session. Cross-client history is therefore not privileged or penalized — it is treated identically, and identically bounded.

This supports §6.5: memory reach does not branch on platform. **Recorded as a boundary marker for Lane 1, not investigated here.**

### 1.5 Behavioral note worth preserving

In the witnessed exchange MAIA did not fabricate continuity. Whatever the identity resolution was, **the honesty layer held while the memory architecture could not reach**. Any architecture proposed downstream must not purchase recall at the cost of that property — the failure mode this system avoided ("Of course I remember Louisiana…") is worse than the one it exhibited.

## 2. WRITE topology — how material enters durable memory

Live writers on the authenticated MAIA path. "Automatic" = fires without a member gesture.

### 2.1 `conversation_turns` — raw exchange (automatic)

- **Writer**: `lib/memory/stores/TurnsStore.ts:125, 215, 274, 281`
- **Trigger**: every served turn on the live route.
- **Representation**: verbatim `content`, `role`, `user_id`, `session_id`, `exchange_id`, `seq`, `created_at`, `posture_at_creation`, `provenance`.
- **Provenance**: yes — S5 minted provenance + `TurnPosture` resolved at the serving boundary (`lib/memory/stores/TurnsStore.ts:9-19`); DB-level mint gate `s5_require_minted_provenance`.
- **Sanctuary**: enforced at write via `contentWritable(posture)` — a Sanctuary turn does not enter the table.
- **Member visibility / edit / delete**: **none.** No inspection UI, no export coverage (§6.3), no per-turn delete. This is the largest corpus and the least member-reachable.
- **Epistemic status**: unambiguous — verbatim member/assistant utterance. The cleanest substrate in the system, and the one with no retrieval over it.

### 2.2 `developmental_memories` — distilled directional signal (automatic, interpretive)

- **Writer**: `lib/memory/MemoryWriteback.ts:603-655`
- **Trigger**: significant exchange, post-turn.
- **Representation**: `content_text` = an LLM-distilled 3-clause signal `[core movement]; [direction of shift]; [tone/quality]` (Storage X4, 2026-04-09).
- **Raw preserved**: yes — first 500 chars of each side under `trigger_event.raw` (`MemoryWriteback.ts:573-580`), recoverable for re-distillation or audit.
- **`vector_embedding`**: **written as literal `NULL`** (`MemoryWriteback.ts:610` column list, `:625` value list). Consequence in §3.5.
- **`entity_tags`**: written from `capsule.entities`.
- **Epistemic status**: **inferred.** This is machine interpretation of the member's process, stored as if it were a memory. It is the highest-risk substrate in the system for provenance contamination.
- **Member visibility**: appears in `/api/members/export-data` (§6.3) — the only inferred layer that does. No edit, no correct, no retract; delete only via full account deletion.
- **Quality guard**: a format validator (`lib/maia/memoryLoaders.ts:57-77`) rejects non-canonical rows at *read* time — noisy pre-X4 rows are dropped to `directional_cue: null` rather than surfaced. *"Better no signal than corrupted signal."*

### 2.3 `member_memory_atoms` — Keep (member-directed)

- **Writers**: `lib/psyche/portfolio.ts:460` (member Keep gesture); `app/api/studio/with-me/sessions/[sessionId]/route.ts:137` (practitioner observation bridge).
- **Trigger**: explicit member act — UI gesture, or a conversational filing instruction matched by an exact-anchored regex table (`lib/psyche/conversational-keep.ts:126-156`, e.g. `^keep (this|that|it)$`). The regexes are deliberately narrow and anchored: **MAIA does not infer intent to Keep from conversational drift.**
- **Provenance carried**: `source_type`, `epistemological_status` (`observed` / `reported` / `inferred` / `provisional` / `claimed`), `facilitator_id`, `provenance` jsonb (audit history), `member_response_status`.
- **Epistemic status**: fully distinguishable. Member-placed atoms vs. practitioner observations are separate `source_type`s rendered in separate prompt sections with different authority language (§5.2).
- **This is the strongest layer in the system.**

### 2.4 `episodic_memories` — Mark (member-directed)

- **Writer**: `app/api/sovereign/episodes/mark/route.ts:308-317`
- **Trigger**: explicit member Mark gesture.
- **Representation**: **six columns, nothing interpretive.** `verbatim_text` inserted raw — no trim, no normalize, no summarization.
- **Refusal R18**: a mark whose `source_turn_id` / `source_session_id` cannot be resolved to one of the member's own sessions is **rejected 403** (`:295-303`). Provenance is a precondition of the write, not a decoration on it.
- **Deliberately NULL**: `significance`, `emotional_intensity`, `breakthrough_level` — "the meaning the system refuses to author."
- **Epistemic status**: verbatim member utterance, member-designated as significant. Second-strongest layer.

### 2.5 `member_theme_signals` — theme inference (automatic, fire-and-forget)

- **Writer**: `lib/consciousness/participatoryRealityHelper.ts:110-127`
- **Trigger**: automatic per turn. Explicitly non-awaitable (`storeThemeSignal` returns `void`), errors swallowed.
- **Representation**: `theme`, `signal_type`, `resonance_strength` (0-1 machine score), `element`.
- **Epistemic status**: **inferred, with a numeric confidence that has no provenance trail back to what produced it.** No member visibility, no correction, no deletion path, and — notably — **no consent gate at all** (§6.1).

### 2.6 `breakthrough_moments` — (mixed)

- **Writers**: `lib/memory/stores/BreakthroughStore.ts:77`, `lib/memory/MemoryWriteback.ts:689`, `lib/memory/RelationshipMemoryService.ts:505`.
- **Epistemic status**: **mixed and not separable at the row level.** Contrast with `member_memory_atoms.is_breakthrough`, where the schema constraint `breakthrough_flag_timestamp_coherent` and the route `POST /api/sovereign/atoms/[id]/breakthrough` guarantee only the member can set it. `breakthrough_moments` has no equivalent guarantee. **Recorded gap.**

### 2.7 `member_relationships` — person/entity records (member-created, auto-touched)

- **Writers**: `app/api/relationships/route.ts:71` (member creates); `lib/consciousness/relationalObserver.ts:172` (observer insert), `:224` (touch `updated_at`).
- Relevant to Test Case 2 and 8 (§7).

### Write summary

| Layer | Automatic? | Interpretation? | Provenance retained | Member can see | Member can correct/retract |
|---|---|---|---|---|---|
| `conversation_turns` | ✅ auto | none (verbatim) | ✅ S5 minted + posture | ❌ | ❌ |
| `developmental_memories` | ✅ auto | **✅ LLM distillation** | partial (`trigger_event.raw`) | ✅ export only | ❌ |
| `member_memory_atoms` | ❌ member act | none / labelled | ✅ full + epistemic status | ✅ | ✅ decline / set-aside |
| `episodic_memories` | ❌ member act | **none, by refusal** | ✅ R18-enforced | ✅ | partial |
| `member_theme_signals` | ✅ auto | **✅ scored inference** | ❌ | ❌ | ❌ |
| `breakthrough_moments` | mixed | mixed | ❌ not separable | ❌ | ❌ |

**Pattern**: *the layers that interpret are the layers the member cannot see, and the layers the member controls are the layers that refuse to interpret.* This is a coherent and defensible design — but it means any future retrieval that mixes these layers must carry the distinction forward, or it silently launders inference into recollection.

---

## 3. RETRIEVE topology — how prior material can enter a present turn

All paths below are on the live route `app/api/sovereign/app/maia/list/route.ts`.

### 3.0 Master gate

```
isSanctuary            = meta.sanctuary === true                         (route.ts:376)
allowCrossSessionMemory = isRecognizedUser && !isSanctuary               (route.ts:499)
shouldBuildMemory       = !isSanctuary && allowCross && mode !== 'ephemeral' (route.ts:520)
```

`memoryMode` is server-resolved, never client-trusted (`lib/memory/MemoryGate.ts:50-87`): a client may *request* `longterm`, the server downgrades unless `MAIA_LONGTERM_WRITEBACK=1` and (empty allowlist OR member listed). Downgrades are logged (`:93-107`). **This gate governs writeback, not retrieval reach** — an important distinction: no env flag currently expands what MAIA can *recall*.

### 3.1 Prior cross-session exchanges

`lib/maia/memoryLoaders.ts:196-221`
```sql
SELECT session_id, role, created_at, LEFT(content, 600) AS content
FROM conversation_turns
WHERE user_id = $1 AND session_id IS NOT NULL AND session_id <> $2
ORDER BY created_at DESC
LIMIT 6
```
| | |
|---|---|
| Query-conditioned | **NO** |
| Ordering | recency only |
| Consent gate | `members.conversational_recall_enabled` (default TRUE) |
| Provenance downstream | ✅ speaker + date preserved (§5.1) |

### 3.2 Member-marked episodes

`lib/maia/memoryLoaders.ts:283-297` — `WHERE user_id = $1 AND marked_by_member = TRUE ORDER BY created_at DESC LIMIT 5`. Never orders or filters by `significance` / `emotional_intensity` / `breakthrough_level`. **Query-conditioned: NO.** Gate: `members.episodic_recall_enabled` (default TRUE) — see §6.1 for the gate's reachability problem.

### 3.3 Memory atoms (Keep)

`lib/maia/memoryAtomsLoader.ts:279-292`
```sql
SELECT … FROM member_memory_atoms
WHERE member_id = $1
  AND (memory_scope='personal' OR <colab/client/encounter scope, additive>)
  AND status IN ('active','still_alive')
  AND return_preference IN ('contextual_doorway','ritual_review_opt_in')
  AND NOT ('sacred_protected' = ANY(registers))
  AND (source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)
  AND member_response_status IS DISTINCT FROM 'rejected'
ORDER BY is_breakthrough DESC, kept_at DESC
LIMIT 8
```
**Query-conditioned: NO.** Six consent/scope predicates, zero relevance predicates. The scope clause is **additive** — "absence = restriction, not widening" (`:250`). `PRACTITIONER_ATTRIBUTION_GUARD` (`:176-186`) refuses to surface an unattributed practitioner observation rather than presenting "a practitioner observed…" with nothing behind it. A member `reject` **releases** the atom permanently — it is not silently re-carried (Right to Remain Unpossessed).

This SQL is the best expression in the codebase of what a *relational eligibility* layer looks like. It is a **gate stack**, not a ranker.

### 3.4 Developmental memories

`lib/maia/memoryLoaders.ts:95-104` — `WHERE user_id=$1 AND valid_to IS NULL ORDER BY significance DESC, formed_at DESC LIMIT 3`. Plus theme signals (`:145-152`, recency, `LIMIT 10`). **Query-conditioned: NO.** Note `valid_to IS NULL` — a supersession mechanism exists in the schema (relevant to Test Case 4, §7).

### 3.5 MemoryBundle — the path that *looks* query-conditioned and is not

Live on the route (`route.ts:531-551, 683-698`). Three buckets, all `user_id`-scoped:

- **A — recent turns** (`MemoryBundle.ts:222-229`): recency, `LIMIT 12`. Not query-conditioned.
- **B — `getSemanticMemories(userId, queryText, facet)`** (`:240-341`): despite the name, executes a **non-vector** query first (`:251-277`) — `0.40·decayed_confidence + 0.35·recency + 0.15·confirmed + 0.10·recall_count`, `LIMIT 12`. `queryText` **is not referenced in this branch.** The vector branch (`:305-325`, cosine over `vector_embedding`) is reached **only if the non-vector branch returns zero rows** (`:281`). It is doubly unreachable in production:
  1. **Structurally** — any member with developmental rows short-circuits it.
  2. **At the data layer** — the live writer inserts `vector_embedding` as `NULL` (`MemoryWriteback.ts:625`), and the vector query requires `vector_embedding IS NOT NULL`.
- **C — breakthroughs** (`:351-366`): `ORDER BY integrated ASC, timestamp DESC LIMIT 5`. Not query-conditioned.

Then `rankCandidates(allCandidates, currentInput, facet)`:
```
compositeScore = (0.40·similarity + 0.30·significance + 0.20·recencyScore + 0.10) · facetMatch
```
`currentInput` is **accepted as a parameter and never read in the body** (`:422-449`). `similarity` is `0` for every candidate on every live path, so the `0.40·similarity` term contributes nothing and the effective formula is significance + recency + facet. Top 5 survive `slice(0, maxBullets)`.

> **This is the single most important finding in the retrieval census.** `currentInput` is threaded through `build()` → `getSemanticMemories()` → `rankCandidates()` as a first-class parameter at every level. The *signature* of the pipeline promises query-conditioning at three separate seams. The *body* delivers it at none. Anyone reading the interface — including a future engineer, including a prompt author reasoning about what MAIA "has" — would reasonably conclude semantic recall is live. It is not.

**Note**: `selectionTrace` (`:160-169`) is disciplined observability — computed strictly *after* the cutoff, documented as unable to influence it. Retained as a model for how to instrument a future adjudication layer without letting the instrument become the decision.

### 3.6 The negative result

Repository-wide search for any content-conditioned retrieval over the member's conversational corpus:

- `conversation_turns` + (`ILIKE` | `LIKE` | `to_tsvector` | `tsquery` | `<=>` | `similarity`) → **zero matches.**
- Full-text search infrastructure exists in the repo (`lib/workbench/sources/uploaded.ts`, `lib/askMaia/cardService.ts`, three migrations) — **none of it touches member conversation history.**

**There is no mechanism, live or dormant, by which the content of a member's question can reach the content of their conversational past.** This is the complete and sufficient explanation of the Louisiana case.

### 3.7 The mechanism that exists and points elsewhere

`lib/memory/DevelopmentalMemory.ts` implements exactly the two retrieval modes this lane is investigating:

- `retrieveMemories()` (`:165-195`) — **entity-conditioned**: `AND entity_tags && $n`, plus facet / type / significance filters.
- `semanticSearch()` (`:234-274`) — **pgvector cosine** with a similarity `threshold` (default 0.65), `ORDER BY similarity DESC`, and `incrementRecallCounts()` on hit.

Its **only importer** is `app/api/between/chat/route.ts:50`, and both calls there pass `userId: 'CANON_GLOBAL'` (`:729-733`, `:742-747`).

> **The system already has working entity-linked and vector-semantic retrieval. It is aimed at the shared canon corpus and has never been aimed at a member's own history.**

Supporting infrastructure is likewise present and unused for this purpose: `pgvector` is installed; `developmental_memories.vector_embedding vector(768)` exists with an `ivfflat` cosine index (`database/baseline/0001_baseline_2026-09-01.sql:6234`, `:30642`); sixteen embedding columns exist across the schema; `generateLocalEmbedding()` (`lib/memory/embeddings.ts`) is sovereignty-compliant (local Ollama `nomic-embed-text`, 768-dim, 2s timeout, graceful `[]` on failure — matching the column dimension exactly); and two SQL functions `find_related_insights` / `find_similar_sessions` are defined in the baseline (`:1426`, `:1451`).

**Consequence for the architecture-candidates phase**: the retrieval-engineering cost of Candidate A is close to zero. The build is not the hard part, and any candidate evaluation that scores primarily on implementation effort will produce a misleading result. **The hard part is everything the census found downstream of retrieval — provenance preservation, epistemic labelling, supersession, and the speaking decision.**

---

## 4. STORE topology — can the corpus support trustworthy recall?

| Object | Owner key | Temporal | Source pointer | Salience | Epistemic status | Supersession | Lifecycle |
|---|---|---|---|---|---|---|---|
| `conversation_turns` | `user_id` | `created_at`, `seq` | `session_id`, `exchange_id` | ❌ | verbatim (implicit) | ❌ | no expiry, no member delete |
| `developmental_memories` | `user_id` | `formed_at`, `last_confirmed_at` | `trigger_event.raw` | `significance`, `recall_count` | **inferred, unlabelled** | ✅ `valid_to` | decay fn; deleted on account delete |
| `member_memory_atoms` | `member_id` (+scope) | `kept_at`, `marked_breakthrough_at` | `source_type`, `provenance` jsonb | `is_breakthrough`, `status` | **✅ `epistemological_status`** | via `status` / `member_response_status` | member-governed |
| `episodic_memories` | `user_id` | `created_at` | **`source_turn_id`, `source_session_id`** | `marked_by_member` only | verbatim, member-designated | ❌ | R18-gated write |
| `member_theme_signals` | `member_id` | `detected_at` | `session_id` | `resonance_strength` | **inferred, unlabelled** | ❌ | unbounded |
| `breakthrough_moments` | `user_id` | `timestamp` | `related_themes` | `integrated` | **mixed, inseparable** | ❌ | unbounded |

### Verdict on corpus trustworthiness

**Partially. The corpus is trustworthy exactly where the member authored it, and untrustworthy exactly where the system did.**

- ✅ **`member_memory_atoms` is retrieval-ready today.** It carries owner, time, salience, source type, epistemic status, facilitator attribution, consent preference, and a member-response state. Anything retrieved from it can be spoken with correctly proportioned authority.
- ✅ **`episodic_memories` is retrieval-ready.** Verbatim + enforced source provenance + member designation. Its `source_turn_id` is the only **bidirectional link** in the system between a curated object and the raw corpus — the natural spine for any future two-stage architecture.
- ⚠️ **`conversation_turns` is the richest and the flattest.** Verbatim and well-provenanced at the *turn* level, but it carries no salience, no supersession, and no notion of which of its statements the member still stands behind. Retrieval over it returns *text the member once said*, which is **not** the same as *what is true about the member now*. Test Case 4 (§7) is where this bites.
- ❌ **`developmental_memories`, `member_theme_signals`, and `breakthrough_moments` are not retrieval-ready.** They hold machine inference with no field distinguishing it from member statement. `developmental_memories` is the sharpest case: its `content_text` is grammatically indistinguishable from something the member said, it sits under the member's `user_id`, and nothing in the row marks it as MAIA's construction. **Any retrieval that surfaces these rows without adding an epistemic label will present MAIA's interpretation of the member back to the member as the member's own history.** That is Test Case 6, and it is a live risk in the current corpus, not a hypothetical one.

**Structural observation**: `member_memory_atoms.epistemological_status` is the field the other layers lack. It is already defined, already populated by the practitioner bridge, and already rendered with proportioned framing (§5.2). It is the obvious candidate for generalization — but note that generalizing it *retroactively* over existing `developmental_memories` rows means asserting an epistemic status for material that was written without one. That backfill is itself an epistemic act and should not be done silently.

---

## 5. COMPOSE topology — what happens after retrieval

### 5.1 Provenance survives composition — for the member-authored layers

`lib/maia/conversationalRecallBlock.ts` renders each exchange as `(Member|MAIA): "…"` with a date, under a header that states the epistemic terms plainly:

> *"## PRIOR EXCHANGES (cross-session continuity, structural recall only) — These are this member's words and your responses from sessions other than the current one. **Recency is the only ordering — there is no relevance score, no thematic clustering, no system interpretation.** Reference these only if directly…"*

The module documents its own drift canaries (`:44-50`): dropping the `(Member|MAIA): "…"` form "silently asserts authority over the content"; emitting while `recallEnabled === false` is "a consent-gate bypass; the gate test must remain the first branch." **It does remain the first branch** (`:85-88`).

### 5.2 Epistemic authority is proportioned — in the atoms block

`formatAtomsForPrompt` (`lib/maia/memoryAtomsLoader.ts:414-560`) splits into two sections with different standing:

- **MEMBER-PLACED PORTFOLIO** — *"These are member-placed, not system-inferred. Recognize naturally if the present moment connects, but do NOT cross-reference, synthesize, or interpret across them — each atom stands as the member declared it."*
- **PRACTITIONER OBSERVATIONS** — each line carries a framing derived from `epistemological_status` via `epistemicFraming()` (`:550-560`): `observed` → "observed by a practitioner in session"; `inferred` → "inferred from session patterns — **provisional**"; `claimed` → "stated by the member during a session". Closing instruction: *"these observations have practitioner-level standing, not member-confirmed standing… **explicitly invite the member to confirm, reject, or refine** — do not carry it as established context until the member has responded."*

**This is the most sophisticated epistemic composition in the system, and it is the template for everything else.** It demonstrates that the codebase already knows how to attach graded authority to a memory at prompt time. What it does *not* yet do is apply that grading to the inferred layers (§4).

### 5.3 Where memory enters the prompt

Three tiers, one shared injector:

- **FAST** — `lib/sovereign/maiaService.ts:1432`, a single template literal appending ~25 addenda in fixed order: `…conversationalRecallAddendum → episodicRecallAddendum → atomsAddendum → relationalContextAddendum → memoryInfluenceAddendum → forwardReadinessAddendum…`
- **CORE** — `appendAllContextAddenda(context, adaptedPrompt)` (`lib/sovereign/maiaVoice.ts:894`)
- **DEEP** — `buildComprehensiveVoicePrompt(...)` then `appendAllContextAddenda(context, result.prompt)` (`:949-956`)

`ADDENDA_SPECS` (`maiaVoice.ts:406-430`) is a declarative, order-stable table consumed by `appendAllContextAddenda` (`:489-491`).

> **CORRECTION TO PROJECT ANCHOR.** `CLAUDE.md` records the DEEP tier as blocked at `buildComprehensiveVoicePrompt` per `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B, with the Phase 2 fork (Option A vs B) still open. **The divergence is closed in the current tree.** Option A shipped: the shared `appendAllContextAddenda` helper exists and all three tiers call it (`maiaVoice.ts:894`, `:956`; source comments at `:889-892` and `:941-947` state this explicitly). Memory addenda reach FAST, CORE, and DEEP. The anchor's "Phase 2 fork" and "Coverage after this cut" entries are stale and should be refreshed. *(Recorded, not edited — Cat-5.)*

**Separate live asymmetry, still open**: the MemoryBundle `memoryContext` string reaches **FAST only**. CORE declares this in code rather than hiding it — *"CC-A: CORE does not read `meta.memoryContext` at all. That is an architectural fact, not an error… Recorded so the absence is observable rather than inferred"* (`maiaService.ts:1538-1559`), emitting a provenance record with `bundleConsulted: false`, `contextOrigin: 'none'`. **Recorded, not repaired.** Its consequence for this lane: the *bundle* channel and the *addenda* channel have different tier reach, so a future retrieval layer's reach depends on which channel it rides. That choice should be deliberate.

### 5.4 Can MAIA know *why* a memory appeared?

**Partially, and unevenly by layer.**

- ✅ Atoms — yes. Source type, epistemic framing, member designation, and an explicit "no synthesis" discipline are all in the prompt.
- ✅ Prior exchanges — yes, and unusually honestly: the block *tells MAIA that recency is the only reason these were selected*. MAIA is informed that presence in context implies nothing about relevance.
- ❌ MemoryBundle bullets — no. `compress()` produces a bullet with `source`, `significance`, `timestamp` — but the composite score, the bucket it came from, and the fact that `similarity` was `0` are not surfaced. MAIA receives a ranked list with no account of the ranking.
- ❌ `memoryInfluenceAddendum` (orchestrator plan) — carries directional cues without the raw exchange behind them by design; MAIA cannot see what produced the cue.

### 5.5 Is restraint structurally possible after retrieval?

**Only as instruction, never as structure.** Every suppression decision in the system is made *before* composition:

| Gate | Where | Kind |
|---|---|---|
| `recallEnabled === false` | `conversationalRecallBlock.ts:85` | pre-composition |
| Sanctuary | `:89` + route `:499` | pre-composition |
| empty | `:93` | pre-composition |
| session-resumption (<30 min, <3 turns) | `:97-103` | pre-composition |
| atoms consent/scope/status | SQL `WHERE` | pre-retrieval |

Once a block is composed, it is in the prompt. Whether MAIA *speaks* it is governed entirely by natural-language instruction — *"Reference these only if directly…"*, *"do not carry it as established context until the member has responded"*. There is no post-composition gate, no confidence threshold at the speaking boundary, and no structural mechanism by which a retrieved memory can be present-but-unspeakable.

> **`retrieval eligibility ≠ speaking eligibility` is currently a prompt-level aspiration, not an architectural property.**

This holds today because retrieval is so bounded that nearly everything retrieved is *safe* to speak: it is member-Kept, member-Marked, or the member's own recent words. **Relevance-conditioned retrieval breaks that coupling.** The moment retrieval can reach an eighteen-month-old painful disclosure because it is topically similar, "eligible to retrieve" and "eligible to speak" come apart — and the system currently has no place to put that distinction. **This, not retrieval, is the load-bearing gap.** It is Test Case 5 (§7), and it is the strongest evidence for the "memory participation layer" hypothesis in the lane brief.

---

## 6. MEMBER SOVEREIGNTY — verified implemented behavior

Verified from source, not from intended UX.

### 6.1 Consent gates

| Gate | Column | Default | Read by | Member-writable? |
|---|---|---|---|---|
| Conversational recall | `members.conversational_recall_enabled` | TRUE | `memoryLoaders.ts:236` | ✅ `PATCH /api/members/recall-preferences` |
| Episodic recall | `members.episodic_recall_enabled` | TRUE | `memoryLoaders.ts:325` | ❌ **not exposed** |
| Atom surfacing | `member_memory_atoms.return_preference` | `member_pulled` (private) | atoms SQL | ✅ `POST /api/anchor/[id]/surface-preference`, atoms UI |
| Atom rejection | `member_response_status` | — | atoms SQL | ✅ `/api/sovereign/atoms/[id]/decline` |
| Sacred protection | `registers @> sacred_protected` | — | atoms SQL | ✅ conversational `protect this` |
| Theme signals | *(none)* | — | `memoryLoaders.ts:145` | ❌ **no gate exists** |
| Developmental | *(none)* | — | `memoryLoaders.ts:95` | ❌ **no gate exists** |

> **GAP — orphaned consent gate.** `episodic_recall_enabled` is read on every authenticated turn but is absent from `RECALL_PREFERENCE_COLUMNS` (`app/api/members/recall-preferences/route.ts:43-45`), which is documented as "the single source of truth for which gates exist." The route's own header comment lists it as *future* work — the loader shipped ahead of the surface. **A member cannot currently turn off episodic recall.** The gate exists in schema and in code; it is unreachable by the person it belongs to. *(Recorded, not repaired.)*

> **GAP — ungated inferred layers.** The two layers with no consent gate at all (`developmental_memories`, `member_theme_signals`) are precisely the two layers that store machine inference about the member. The consent architecture covers the member's own words and omits the system's conclusions about them.

### 6.2 Preserve / mark / distinguish

- ✅ **Preserve**: Keep (UI + anchored conversational instruction), `still_alive`, `protect`.
- ✅ **Mark**: episodic Mark with R18 provenance enforcement; `is_breakthrough` — schema-guaranteed member-only.
- ✅ **Distinguish MAIA-interpretation from autobiography**: **only within the atoms layer** (`epistemological_status` + section split + framing language). Not available for `developmental_memories`, `member_theme_signals`, or `breakthrough_moments`.

### 6.3 Inspect / correct / retract / delete

- **Inspect**: `GET /api/members/export-data` returns `members`, `member_settings`, `member_sessions`, `developmental_memories`, `google_calendar_credentials`.
  > **GAP — the export omits the corpus.** `conversation_turns`, `member_memory_atoms`, `episodic_memories`, `breakthrough_moments`, and `member_theme_signals` are **not exported**. A member cannot obtain their own conversational history. **The Louisiana turns are not visible to the person who spoke them** — not to MAIA, and not to Kelly. Any long-term-memory architecture that makes that corpus *machine*-reachable while leaving it *member*-unreachable inverts the sovereignty ordering: the system would gain a capability over the member's history that the member does not have. **The export gap should be treated as a precondition of the Cat-5 lift, not a follow-up to it.**
- **Correct**: ❌ nowhere. No layer supports member correction of stored content. Atoms support *rejection* (release), not revision.
- **Retract**: ✅ atoms (decline / set-aside / archive). ❌ everything else.
- **Delete**: `POST /api/members/delete-account` — **refuse-by-default containment posture** (`:41-61`, `:211-228`). If `governedContentFor(memberId)` finds any member-owned content the route cannot remove, it returns `409 deletion_incomplete_unavailable` with `accountChanged: false` **and changes nothing**, rather than deleting the `members` row and orphaning content while reporting success (the 2026-07-28 privacy incident). Credentials are revoked *first* inside the transaction so a rollback leaves the account intact and usable. Actual deletion covers only `member_settings`, `member_sessions`, `developmental_memories`, `google_calendar_credentials`, `memory_links`.
  > **This is the most honest failure mode in the codebase**, and it is the right template for the whole lane: *refusing, visibly, is better than succeeding, silently, at less than you claimed.* Note also that it is the **only** place in the memory system where MAIA's inability to do something is surfaced *to the member* rather than logged for operators.

### 6.4 Constrain by context

✅ Atoms only — `memory_scope` ∈ {`personal`, `colab`, `client`, `encounter`}, additively gated on active `team_id` / `client_id` / `encounter_id`; the loader "never blends across boundaries." **No temporal, topical, or emotional context constraint exists anywhere.** A member cannot say "don't bring that up" about a subject, a period, or a person.

### 6.5 Platform note (iOS / PWA / desktop)

Out of lane, recorded once because it was in the originating request: **all memory reach in this census is server-side on `/api/sovereign/app/maia/list`.** No loader, gate, limit, or composition step branches on client platform. Any client that authenticates as the member receives identical memory reach. Platform-specific memory symptoms are therefore **identity/transport symptoms**, not memory-architecture symptoms — which is consistent with the lane separation Kelly drew. Note this cuts both ways and does **not** resolve the witnessed exchange: because reach does not branch on platform, a platform-specific memory *symptom* would be evidence for an identity failure (Lane 1), not for a memory-architecture failure. §1.0 leaves that question open. Whatever this lane builds will reach iOS, PWA, and desktop identically, provided the identity lane holds.

---

## 7. The eight test cases against the current architecture

### Case 1 — "Do you remember when I lived in Louisiana?"
**FAILS structurally. Material confirmed present and out of reach (§1.1-1.2); the witnessed turn's server identity remains unproven and is not cited here.** Retrieval reaches 6 cross-session turns (recency) + 12 bundle turns (recency) + 8 atoms (kept-at) + 5 marked episodes (recency). March-2026 turns are far outside every window. No content-conditioned path exists (§3.6). *Unless* the member had Kept or Marked a Louisiana atom, in which case it may surface — but by `kept_at`, not because it was asked for.
**Names the gap**: query-conditioned candidate retrieval over `conversation_turns` does not exist.

### Case 2 — "What do you remember about Karen?"
**FAILS, and differently from Case 1. Specimen confirmed (§1.3): five Karen-bearing turns exist from 2026-08-28, already ~20× outside the `LIMIT 6` window five days later.** `member_relationships` exists but is read **only on explicit handoff** — the member must have pressed "Take this to MAIA" and the client must ride `relationshipContextId` on the POST (`route.ts:874-889`). `allowRecentThreadFallback` is deliberately off: *"ambient detection is membrane leakage if it arrives before observation."* Absent that gesture, "Karen" is an unindexed string in `conversation_turns`. `developmental_memories.entity_tags` is populated at write and **never read on the live route** (§3.7).
**Names the gap**: person/entity resolution — distinct from semantic similarity (see Case 8).

### Case 3 — "We discovered something months ago about why I keep doing this."
**FAILS.** This asks for a *jointly-established insight*. The nearest substrate is `developmental_memories` (LIMIT 3, significance+recency) or `breakthrough_moments` (LIMIT 5). Neither is query-conditioned; both are dominated by recent rows. And critically, `developmental_memories` is **MAIA's distillation**, not a joint construction — surfacing it as "what we discovered" would assert a shared authorship that the write path does not establish.
**Names the gap**: no representation of *jointly-established* material. The epistemic vocabulary has `observed` / `reported` / `inferred` / `provisional` / `claimed` — and no term for *co-authored*. Case 3 may require a new epistemic status, not just better retrieval.

### Case 4 — Contradiction over time (said X 18 months ago, revised it 6 months ago)
**INDETERMINATE, trending unsafe.** `developmental_memories` has `valid_to` (bitemporal supersession) and the loader filters `valid_to IS NULL` — **the only supersession mechanism in the system, and it is confined to one layer.** `conversation_turns` has no supersession: both the original and the revision are equally retrievable rows with nothing linking them. Recency ordering accidentally favors the revision *today*, but that is a side effect of the window, not a semantic. **Under similarity ranking the 18-month-old statement could outrank the revision** if it is lexically closer to the question — the architecture would actively prefer the stale truth.
**Names the gap**: supersession/contradiction tracking across the conversational corpus. **This is the strongest argument against Candidate A (pure semantic search) in the codebase**: relevance ranking without supersession does not merely fail to help, it makes the system *worse* than recency at answering "what is true about me now."

### Case 5 — Sensitive but semantically relevant; member has not invoked it
**THE ARCHITECTURE HAS NO ANSWER, because the question cannot currently arise.** Today the material is unreachable, so no permission question is posed. The moment relevance-conditioned retrieval exists, this case becomes live — and §5.5 shows there is **no post-composition gate** anywhere in the system. A retrieved memory is a composed memory is a speakable memory, restrained only by prompt instruction.

The nearest existing protection is `sacred_protected` — but it is (a) atoms-only, (b) member-designated in advance, and (c) a *retrieval* filter, not a *speaking* filter. It protects material the member thought to protect, in the one layer that supports protecting it.

**Retrieval must not imply permission. The current architecture cannot express that distinction.** This is the single clearest structural justification for the memory-participation layer hypothesized in the lane brief.

### Case 6 — MAIA inference the member never endorsed
**FAILS UNSAFE — and the exposure exists today, before any Cat-5 lift.** `developmental_memories.content_text` is an LLM distillation of the member's process, stored under their `user_id`, carrying no field that marks it as inference. It reaches MAIA's prompt on the live route via `memoryInfluenceAddendum` (`route.ts:936-951`) as a `directional_cue`. There is no `epistemological_status` on that layer and no member-visible surface for it, so there is also no path by which a member could endorse or reject it.

The system *knows how* to do this correctly — `epistemicFraming()` exists (§5.2) — and applies it to exactly one layer.

**Contrast that establishes the standard**: the atoms path refuses to surface an unattributed practitioner observation at all (`PRACTITIONER_ATTRIBUTION_GUARD`), and releases an atom permanently on member rejection. **`developmental_memories` needs the same treatment and does not have it.**
**Names the gap**: mandatory epistemic status on every retrievable object, enforced at retrieval (surfacing), as atoms already do — plus a member-visible endorse/reject surface for inferred material, without which "provisional" is a label with no mechanism behind it.

### Case 7 — Kept object vs. semantically similar conversation history
**The architecture answers this one clearly, and it is the design's real strength.** A Kept atom passes six consent predicates, carries `epistemological_status`, respects `sacred_protected`, honors `member_response_status`, and is composed with "member-placed, not system-inferred." A conversation turn passes `user_id` + `session_id <> current` + recency, and is composed with "recency is the only ordering."

**A Kept atom carries member-conferred authority. A conversation turn carries only the fact of having been said.** Any future ranking that lets similarity score promote a turn above a Kept atom inverts the authority ordering the entire consent architecture is built on.

> **Design constraint, derivable from the current architecture rather than imposed on it: member-conferred significance is not a ranking weight competing with similarity. It is a different kind of authority, and it should not be commensurable with similarity on a single scale.** A composite score with a `0.3 · memberKept` term would silently make it commensurable. This is the sharpest guidance the census produces for the candidates document.

### Case 8 — "What happened last time I talked with you about my relationship with X?"
**FAILS, and the case proves the two problems are distinct.** This requires the **conjunction** of: person resolution (which "X"?) → topical scope (the relationship, not X's job) → temporal scope ("last time") → session boundary ("that conversation"). Similarity search over turns satisfies none of these reliably: it would return turns lexically near "relationship with X" scattered across arbitrary sessions, with no notion of *a conversation* as a unit.

The substrate for the missing structure partly exists: `conversation_turns.session_id` + `exchange_id` + `seq` make a conversation reconstructible, and `episodic_memories.source_turn_id` is a bidirectional link between a curated object and its raw origin. Nothing currently uses either for retrieval.

**Answer to the question the brief poses**: **no — person/entity linkage and semantic retrieval are not the same problem.** Person linkage is *resolution* (identify a referent, gather everything about it, regardless of wording). Semantic retrieval is *similarity* (find text resembling this text, regardless of referent). Conflating them produces the classic failure: asked about Karen, the system returns turns about a *different* person that happen to use similar emotional language. The system's own instinct here is already correct — `member_relationships` is an explicit *entity* table, not an embedding — and it is under-used rather than wrongly designed.

### Test case summary

| # | Case | Verdict | Primary gap named |
|---|---|---|---|
| 1 | Louisiana | ❌ fails structurally *(material present, out of reach — §1.1)* | no query-conditioned retrieval over turns |
| 2 | Karen | ❌ fails *(material present, out of reach in 5 days — §1.3)* | no person/entity resolution at retrieval |
| 3 | Earlier insight | ❌ fails | no representation of jointly-established material |
| 4 | Contradiction | ⚠️ indeterminate, unsafe under similarity | no supersession outside `developmental_memories` |
| 5 | Sensitive-but-relevant | 🚨 **no architectural answer** | no speaking gate distinct from retrieval gate |
| 6 | Unendorsed inference | 🚨 **fails unsafe today** | no epistemic status on inferred layers |
| 7 | Kept vs. similar | ✅ **answered well** | must be preserved, not diluted by ranking |
| 8 | Relationship history | ❌ fails | entity resolution ≠ similarity; no conversation-as-unit |

---

## 8. Confirmed capabilities

1. **Consent gating is real, SQL-enforced, and first-branch.** Six predicates in the atoms loader; the opt-out test is structurally the first branch in the conversational formatter, with a documented drift canary.
2. **Sanctuary is enforced at three independent depths** — write (`contentWritable(posture)` + DB mint gate), retrieval (`allowCrossSessionMemory`), composition (formatter defense-in-depth). Defense-in-depth is real, not decorative.
3. **Epistemic proportioning is implemented and works** — for atoms. `epistemicFraming()` maps five statuses to five authority levels in the prompt.
4. **Provenance survives composition** for member-authored layers — speaker + date, never stripped.
5. **Member-marked significance is schema-guaranteed** — `is_breakthrough` only settable by the member; `marked_by_member = TRUE` the sole episodic filter; interpretive columns deliberately NULL; R18 refuses unprovenanced marks.
6. **The system declares its own limits in code**, not only in docs — `memorySelectionPolicy.ts`, the CORE `bundleConsulted: false` provenance record, `selectionTrace` computed strictly after the cutoff.
7. **Deletion refuses rather than orphans**, and says so to the member in plain language.
8. **Identity resolution and member scoping are sound.** Every query is `user_id` / `member_id` scoped; no cross-member leakage path found.
9. **Retrieval infrastructure for the Cat-5 lift already exists** — pgvector installed and indexed, sovereign local embeddings at matching dimension, entity-tag and cosine retrieval implemented and working against the canon corpus.

## 9. Confirmed gaps

**Retrieval**
1. **No query-conditioned retrieval over member history.** Zero content-search paths over `conversation_turns` repo-wide.
2. **`currentInput` is threaded through the pipeline and never read** — signature promises relevance at three seams, body delivers none.
3. **The vector path in `MemoryBundle` is doubly dead** — unreachable by control flow; empty by data (`vector_embedding` written NULL).
4. **Entity-tag retrieval exists, is never called for members** — only `CANON_GLOBAL`.
5. **No person/entity resolution at retrieval.** `member_relationships` reachable only by explicit handoff gesture.

**Epistemics**
6. **No epistemic status outside atoms.** `developmental_memories` surfaces machine inference indistinguishably from member statement — **live exposure today** (Case 6).
7. **No supersession outside `developmental_memories`.** No contradiction handling over the conversational corpus (Case 4).
8. **No representation of jointly-established material** (Case 3).
9. **`breakthrough_moments` mixes member-marked and system-inferred with no separating column.**

**Restraint**
10. **No speaking gate distinct from the retrieval gate.** All suppression is pre-composition; restraint after retrieval is instruction-only (Case 5). **Load-bearing.**
11. **MAIA cannot know why a bundle memory appeared** — no score, bucket, or reason reaches the prompt.

**Sovereignty**
12. **`episodic_recall_enabled` is an orphaned gate** — read every turn, exposed nowhere.
13. **No consent gate at all on the two inferred layers** (`developmental_memories`, `member_theme_signals`).
14. **Export omits the corpus** — `conversation_turns`, atoms, episodes, breakthroughs, theme signals. **Precondition, not follow-up.**
15. **No correction path anywhere.** Rejection ≠ revision.
16. **No contextual constraint** — a member cannot exclude a topic, a period, or a person from resurfacing.

**Architecture hygiene** *(recorded, not repaired)*
17. `CLAUDE.md` DEEP-divergence entry is stale — Option A shipped (§5.3).
18. `memoryContext` reaches FAST only; CORE declares the absence and DEEP is untested for it.
19. Two duplicate `SemanticMemoryService` implementations remain unreconciled (per the anchor's Cat-4 list).

## 10. Unknowns requiring further investigation

1. **Corpus volume and shape per member.** *Partially answered for one member (§1.2): 446 turns across 24 sessions in 7 days.* Still unknown across the member base: distribution, median session length, total corpus age, and how many members have enough history for long-horizon recall to matter at all. Determines whether candidate retrieval is a 10k-row or 10M-row problem. *(Read-only SQL; no lift required.)*
2. **Are `developmental_memories` rows actually distilled, or mostly guard-rejected?** The X4 format guard silently nulls non-conforming rows. If most production rows fail the guard, this layer is far thinner than it appears — and its Case-6 exposure correspondingly smaller. *Measurable by running `isValidDistilledSignal` over a sample.*
3. **What fraction of members have Kept/Marked anything?** Determines whether the member-curated layers are a usable retrieval spine or a near-empty one — decisive between Candidate B and Candidate C.
4. **Is Ollama reachable from the `maia-sovereign` container?** `generateLocalEmbedding` has a 2s timeout and returns `[]` on failure. Embedding an entire historical corpus has a very different cost profile than embedding one query. Unmeasured.
5. **Latency headroom.** FAST targets <2s and already runs MemoryBundle, WuXing, and astrology in parallel. An added retrieval + adjudication stage has an unmeasured budget.
6. **Does `breakthrough_moments` contain member-marked rows at all**, or only system-inferred? Determines whether it can be salvaged or should be excluded from retrieval.
7. **What does `member_theme_signals` actually contain at volume?** Ungated, unbounded, fire-and-forget, per-turn — plausibly the largest inference table in the system and entirely unaudited.
8. **Is there a member-facing conversation-history surface anywhere** (beyond the export gap)? Not found in this census; absence not proven.
9. **What would "the member endorsed this inference" even look like as a gesture?** Case 6 needs a member act that does not currently exist in the product vocabulary. This is a design question, not an engineering one, and it likely gates any safe use of the inferred layers.

---

## 11. What the census implies for the second deliverable

Recorded as **findings**, not recommendations. No architecture is chosen here.

1. **Retrieval is the cheap part.** pgvector, embeddings, entity matching, and cosine search all exist and work. Any candidate evaluation weighted toward implementation cost will mis-rank.

2. **Candidate A (pure semantic search) is affirmatively contraindicated by Case 4**, not merely insufficient. Similarity ranking without supersession would prefer an eighteen-month-old superseded statement over its revision whenever the stale text is lexically closer to the question. That is worse than recency at answering "what is true about me now."

3. **Case 5 and Case 6 both resolve to the same structural absence**: a stage between retrieval and composition. Case 5 needs it for *permission*; Case 6 needs it for *epistemic labelling*. That two independent failures converge on one missing stage is the strongest evidence in the census for the participation-layer hypothesis, and it points toward Candidate C.

4. **Case 7 is the constraint that disciplines the ranking design.** Member-conferred authority and machine-computed similarity should not be commensurable on one scale. A single composite score makes them commensurable by construction. The existing atoms loader — a **gate stack**, not a ranker — is the architecture's own answer, and it is worth taking seriously as a template rather than replacing.

5. **Case 8 shows retrieval is at least two problems**: entity *resolution* and semantic *similarity*. The system's existing instinct (an explicit `member_relationships` table rather than an embedding) is sound and under-used.

6. **The sovereignty gaps (12–16) are not follow-ups.** Making the corpus machine-reachable while it remains member-unreachable inverts the sovereignty ordering the platform is built on: MAIA would gain a capability over the member's history that the member does not have over their own. Under the growth-obligation check in `CLAUDE.md` — *every increase in capability must produce a matching increase in provenance, restraint, and transparency* — **the export gap (14) and the orphaned episodic gate (12) are the matching increase, and they should ship with or before the capability, not after it.**

7. **The participation standard applies to the candidates themselves.** Per §1.0 — *not "does it exist?" but "can we prove it participated in the living MAIA turn?"* Every candidate must specify, in advance, the production evidence that would prove its retrieval stage actually participated in a served turn, and the evidence that would prove its *restraint* stage did (a memory retrieved and deliberately not spoken leaves no trace unless the architecture is designed to leave one). An architecture whose restraint is unobservable cannot be verified, only trusted.

8. **The system's own honesty conventions are the template for the lift.** `memorySelectionPolicy.ts` (declare the policy), `selectionTrace` (instrument after the decision, never before), the CORE `bundleConsulted: false` record (name the absence), and the deletion route's `409 accountChanged: false` (refuse visibly rather than succeed silently) are four distinct, already-working patterns for building a capability without overclaiming it.

---

## STOP

Per the lane's stop rule, the census ends here. **The architecture-candidates document is not authored until Kelly's architectural adjudication.**

The question the candidates document will have to answer, sharpened by the census:

> Given that similarity is cheap, that the corpus is trustworthy exactly where the member authored it and untrustworthy exactly where the system did, that retrieval and speaking are not currently separable, and that member-conferred authority must not become a ranking weight — **what structure lets MAIA recognize that "Louisiana" is a legitimate invitation to recollect those specific encounters, without granting every semantically adjacent wound, inference, person, and symbol the same permission to enter the room?**

---

### Evidence index

| Concern | Source |
|---|---|
| Live route | `app/api/sovereign/app/maia/list/route.ts` (1797 ln) |
| Declared selection policy | `lib/maia/memorySelectionPolicy.ts:26-56` |
| Cross-session turns (LIMIT 6) | `lib/maia/memoryLoaders.ts:196-221` |
| Marked episodes (LIMIT 5) | `lib/maia/memoryLoaders.ts:275-305` |
| Consent gate readers | `lib/maia/memoryLoaders.ts:233-247`, `:318-333` |
| Atoms loader (6 predicates) | `lib/maia/memoryAtomsLoader.ts:230-300` |
| Epistemic framing | `lib/maia/memoryAtomsLoader.ts:414-560` |
| `currentInput` unread | `lib/memory/MemoryBundle.ts:422-449` |
| Dead vector branch | `lib/memory/MemoryBundle.ts:281`, `:305-325` |
| `vector_embedding` NULL at write | `lib/memory/MemoryWriteback.ts:610`, `:625` |
| Entity + cosine retrieval (canon-only) | `lib/memory/DevelopmentalMemory.ts:165-195`, `:234-274`; `app/api/between/chat/route.ts:729-747` |
| Suppression rules | `lib/maia/conversationalRecallBlock.ts:83-104` |
| Shared addenda injector (all tiers) | `lib/sovereign/maiaVoice.ts:406-430`, `:489-491`, `:894`, `:956` |
| FAST composition | `lib/sovereign/maiaService.ts:1432` |
| CORE bundle absence declared | `lib/sovereign/maiaService.ts:1538-1559` |
| Memory mode gate | `lib/memory/MemoryGate.ts:50-107` |
| Episodic Mark + R18 | `app/api/sovereign/episodes/mark/route.ts:295-317` |
| Orphaned episodic gate | `app/api/members/recall-preferences/route.ts:16-45` |
| Export coverage | `app/api/members/export-data/route.ts:73-102` |
| Deletion containment | `app/api/members/delete-account/route.ts:35-61`, `:146-163`, `:211-262` |
| Sanctuary write gate | `lib/memory/stores/TurnsStore.ts:9-19`, `:112` |
| pgvector schema | `database/baseline/0001_baseline_2026-09-01.sql:6234`, `:30642`, `:1426`, `:1451` |
