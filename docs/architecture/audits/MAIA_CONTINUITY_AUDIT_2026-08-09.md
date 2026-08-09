# MAIA Continuity Audit — 2026-08-09

**Part of the MAIA High-Target Tester Readiness Audit.** Scope: the end-to-end turn lifecycle on the live route, exactly what MAIA knows on a returning member's first turn, the return-experience architecture, tier coverage, and fallback continuity. Evidence: code trace at call sites + production probes (container `b1399f693`; `[MAIA] conversational-block` firing 49×/24h with `emitted: true`).

---

## 1. Turn lifecycle (live route: `app/api/sovereign/app/maia/list/route.ts`)

The oracle route's zero-traffic status is stated **in code**, not just docs (`route.ts:1114-1117`).

**Identity**: `resolveMemberIdentity` (`route.ts:300`) → session-verified only (`maia_session` cookie or `x-session-token` header against `auth_sessions`). Body `userId` is deliberately ignored; spoof attempts are logged (`resolveIdentity.ts:1-29`, `route.ts:303-312`). This is the right shape.

**Loader order per turn**: schema guard → identity → session + cognitive profile → MemoryBundle (≤5 bullets, cross-session scope in continuity mode) + astrology/Wu Xing → `buildMemberLiveContext` (3 session summaries, 4 patterns, 5 journals, relationship essence, 20 themes/30d — `lib/memory/MemberLiveContext.ts:383-396`) → practice-field context → memory layers (developmental ×3, theme signals ×10, atoms ×8, cross-session exchanges ×6, marked episodes ×5 — `route.ts:808-931`) → `buildMemoryHealth` (`:955`) → `buildMaiaRuntimeContext` (observer only, `:992`) → `assertProviderAvailable` (fail-closed, `:1046`) → `getMaiaResponse` (`:1049-1092`, server addenda placed after `...meta` so client meta cannot override).

**Tier selection** (`processingProfiles.ts:95-267`): empty/noise→FAST; short+light→FAST; meaningful content→CORE (default); DEEP only on ultra-restrictive invitations, with cognitive-profile up/down-regulation.

**Prompt per tier**:
- **FAST** (`maiaService.ts:1285-1295`): template interpolates `MEMORY_AUTHORITY_BLOCK` + memberWeb + conversationalRecall + episodicRecall + atoms + memoryInfluence + correctionRepair addenda into the system prompt. MemoryBundle bullets enter as user-input context.
- **CORE**: `MaiaContext` carries the addenda → `buildMaiaWisePrompt` → shared `appendAllContextAddenda` (`maiaVoice.ts:488-527`, called at `:912`). **The May §V divergence fix has landed for CORE.**
- **DEEP**: three lanes. *Primary* — `consciousnessWrapper.processConsciousnessEvolution` (local, 4.5s race; stub fallback text on timeout) — **has no prompt seam; recall addenda structurally cannot reach it** (`maiaService.ts:2214-2219`). *Consultation* — gated off by default (`MAIA_USE_CLAUDE_CONSULTATION === 'true'`); when enabled, carries full addenda (`:2094-2115`). *Repair* — Socratic-validator regeneration uses `buildMaiaComprehensivePrompt` → `appendAllContextAddenda` (`maiaVoice.ts:1044`) with full addenda.

**Model**: Anthropic primary (`claude-sonnet-4-6` conversation / `claude-opus-4-6` reasoning, temp 0.65, `claudeClient.ts:13-16`).

**Post-turn persistence**: conversation exchange (dual-write, shared exchangeId), relationship essence (fire-and-forget), `MemoryWritebackService.writeBack` → `developmental_memories`/`breakthrough_moments`/`conversation_insights` (`route.ts:1302`; `MemoryWriteback.ts:602,688,731` — **this answers the topology audit's open question: developmental_memories' producer is the writeback service**), agent_runs, relational signals, consent-state record, state vector. **No spiral-state upsert on the live route.**

## 2. What MAIA knows on a returning member's first turn

**Injected before the model sees the message**:
- Up to **6 verbatim cross-session exchanges**, recency-ordered with labels ("yesterday", "3 days ago"), 280-char caps; default-on; suppressed for opt-out/sanctuary/resumption-within-30-min (`conversationalRecallBlock.ts:76-104`)
- Up to **8 atoms** (breakthrough-first, then recency; consent-gated `return_preference`)
- Up to **5 member-marked episodes** (default-on; no UI toggle yet)
- **Member web**: 3 session summaries, 4 patterns, 5 journal entries, recurring themes
- **MemoryBundle**: ≤5 ranked bullets + relationship snapshot (FAST user-input only)
- Relationship essence, astrology + Wu Xing, cognitive profile, identity backfill (name/pronouns)

**Loaded but never rendered**: spiral state (loaded at `MemberLiveContext.ts:390`; `formatMemberWebForPrompt` has no spiral section) · developmental memories ("loaded but not injected" — `maiaService.ts:2871-2872`).

**Not loaded at all on the live route**: anchors (oracle route only; 0 prod rows anyway) · Bridge D conductor seeding (`lib/voice/conductor` imported only by the oracle route) · coherence/field services · somatic/morphic · practitioner material (correctly — pinned closed) · any vault/wisdom content.

**Verdict**: first-turn continuity rests on **literal recall with provenance** — verbatim quotes, member-authored marks, summaries — not on any synthesized "where you are" model. That is constitutionally right for this system, and it works (production-verified emission). What's missing is not more inference; it's the **relational shape** — see §3.

## 3. Return-experience architecture (same day vs 3 days vs 2 months)

**Server-side: none.** No code puts time-since-last-visit into any prompt (grep for `daysSince` across route/service/voice: zero hits). The only server-side time conditioning: the 30-min resumption suppression and per-exchange recency labels.

**Client-side UI only**: `generateWelcomeGreeting` (`OracleConversation.tsx:7552-7558`; tiers in `lib/maia/welcomeGreeting.ts:83-110` — <3 days: nothing / 3–6 days / 7+ days). These are static UI strings, not model-generated, not fed to the model.

So the model itself has no idea whether the member was away three days or three months, beyond incidental recency labels on quoted exchanges. There is no differentiated 2-week vs 2-month return posture anywhere server-side. **The "recognition without surveillance" first-return experience is currently an emergent accident of recency labels, not an architecture.**

## 4. Tier coverage table

| Substrate | FAST | CORE | DEEP-primary | DEEP-consult (flag off) | DEEP-repair |
|---|---|---|---|---|---|
| Atoms | ✅ | ✅ | ❌ | ✅ if enabled | ✅ |
| Conversational P2 | ✅ | ✅ | ❌ | ✅ if enabled | ✅ |
| Episodic | ✅ | ✅ | ❌ | ✅ if enabled | ✅ |
| Member web | ✅ | ✅ | ❌ | ❌ | ✅ |
| MemoryBundle | ✅ (user-input) | own loaders | history-seed only | — | — |
| Spiral state | ❌ everywhere (loaded, never rendered) | | | | |
| Anchors | ❌ everywhere (oracle route only; 0 rows) | | | | |
| Wisdom content | ❌ everywhere (see Wisdom Field audit) | | | | |

**DEEP-primary is the continuity hole**: a member who earns a DEEP turn gets a response from a local consciousness wrapper that cannot see any recall addenda — and on its 4.5s timeout, a canned stub ("I'm here with you. Let's explore what you're bringing."). The member's deepest moments get the least continuity.

## 5. Fallback continuity

**FAST/CORE: survives fallback intact by construction.** `modelService.ts:188-194` passes the identical assembled system prompt to Ollama; `localModelClient.ts:88-91` sends it whole. Three caveats:
1. **No `num_ctx` set** (`localModelClient.ts:100-101`) — Ollama's default context window may silently truncate the very large system prompt. Risk identified, not runtime-verified.
2. The default local model is a small instruct model — same context, much weaker synthesis.
3. Billing/auth errors skip fallback entirely → fail-closed 503 (`PROVIDERS_UNAVAILABLE`), which is honest.

**DEEP**: continuity never depended on the remote model — the primary lane is local and context-blind regardless.

## 6. Continuity-quality checklist (the twelve dimensions)

| Dimension | State | Basis |
|---|---|---|
| A. Factual continuity | **PARTIAL** | verbatim exchanges + summaries; recency-only, no relevance retrieval (semantic vectors write-only) |
| B. Emotional/relational continuity | **PARTIAL** | relationship essence + patterns reach prompt; write-path liveness unverified |
| C. Unfinished conversations | **ABSENT** | no thread/unfinished-business substrate exists |
| D. Commitments & intentions | **ABSENT** | no commitments store anywhere in the system |
| E. Previous practices | **PARTIAL** | practice-field context reaches prompt when member is in a practitioner space |
| F. Member's language/metaphors | **PARTIAL** | verbatim quoting preserves language within the 6-exchange recency window; nothing durable |
| G. Significant people/relationships | **ABSENT** | no people/relationship-graph substrate for member's life relationships |
| H. Corrections to prior understanding | **BROKEN** | in-turn repair only; corrections don't persist (see Corrigibility audit) |
| I. Developmental change over time | **PARTIAL** | developmental_memories written every turn, injected only via MemoryBundle bullets |
| J. Preferences & boundaries | **PARTIAL** | recall toggles + atom gestures real; no general preference memory |
| K. Prior moments of insight | **PARTIAL** | breakthrough infrastructure wired; 0 member-marked breakthroughs in prod |
| L. What NOT to foreground | **PARTIAL** | `sacred_protected`/`protect`/`archive` statuses enforced; no salience/quieting model beyond them |
