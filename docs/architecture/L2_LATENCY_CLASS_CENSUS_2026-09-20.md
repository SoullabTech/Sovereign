# L2 — Latency-Class Census of the 55 Grandfathered Files

**Date:** 2026-09-20
**Status:** CENSUS COMPLETE · ⚠️ AMENDED §6 after Phase-1 verification · 9 files DELETED, ceiling 55 → 46.
**Authorizes:** nothing. It is the evidence L3 was gated on.
**Input:** `scripts/anthropic-import-allowlist.json` → `grandfathered.files` (55, live debt = 55).
**Method:** import-graph tracing over `git ls-files`; route reachability at 1–2 hops; per-file caller
verification for every ambiguous case.

---

## 1. Result — the premise was wrong, and that is the finding

| Class | Count | Share |
|---|---:|---:|
| **E. Unreached** (no path from any route or worker) | **25** | 45% |
| A. Interactive — confirmed | 14 | 25% |
| B. Route-reached, await unknown | 11 | 20% |
| D. Batch (offline scripts) | 4 | 7% |
| **C. Deferred — confirmed** | **1** | 2% |
| | **55** | |

55/55 classified, zero unaccounted.

⭐⭐ **The direction note assumed this set was full of deferred background cognition waiting to move
local. It is not. Exactly one file is confirmed deferred — and it is already correct.**
`lib/scribe/sovereignSummarizer.ts`'s generator is called only by
`scripts/run-session-summary-worker.ts`: already off the request path, already queued, nobody waiting.
Moving it to local inference is a one-file change with no latency consequence — and a one-file change
is not a programme.

⭐⭐ **The largest category is dead code.** 25 of 55 — 45% of the tracked sovereignRouter bypass debt
— is unreachable from any route or worker. **That debt is retired by deletion, not by migration**, and
deletion needs no provider decision, no quality trade-off and no growth-obligation answer.

⚠️ **THE LOAD-BEARING SCOPE LIMIT.** This census covers only files that bypass `sovereignRouter` by
importing the SDK **directly**. Deferred cognition reached through `sovereignRouter` itself, or
through `getClaudeService()`, is **outside this set and unexamined**. *"Only one deferred file"* is a
statement about the grandfathered allowlist, ⛔ **never about the system.** Anyone quoting this
number without that clause is quoting it wrong.

---

## 2. Classification

### A. INTERACTIVE — confirmed (14)

A member is waiting on the response. ⛔ Not L3 candidates at any point.

| File | Evidence |
|---|---|
| `app/api/maia/living-field/[fieldKey]/encounter/route.ts` | conversational route — "Living Encounter, conversation-first" |
| `app/api/maia/living-field/[fieldKey]/refine/route.ts` | MAIA proposes candidate expression in-session |
| `app/api/maia/relational-navigation/route.ts` | Relational Navigation Room, live |
| `app/api/portal/[slug]/chat/route.ts` | practitioner chat companion |
| `app/api/practitioner/practice-field/draft/route.ts` | drafts from what practitioner JUST shared |
| `lib/consciousness/LLMProvider.ts` | reached from 36 routes; holds MAIA_STRICT_503 |
| `lib/services/ClaudeService.ts` | app/api/voice/stream-conversation — voice realtime |
| `lib/consultation/claude-consultation-service.ts` | app/api/between/chat |
| `lib/team/maiaReflectService.ts` | team channel maia-reflect |
| `lib/team/maiaThreadReflection.ts` | ideas/[id]/ask-maia |
| `lib/songwriter/seedInterpreter.ts` | songwriter/seed |
| `lib/consciousness/relationalCheckin.ts` | relationships/[id]/checkin |
| `lib/dialectical-ai/core.ts` | consciousness/analyze |
| `lib/story/archetypalNarrativeService.ts` | astrology/narrative |

### B. ROUTE-REACHED, AWAIT UNKNOWN (11)

Reached from an HTTP route; whether a member *waits* on it is **not established**. Per this census's own rule, recorded as ambiguous rather than defaulted to interactive. ⭐ Every real L3 candidate in the live system is in this bucket, and resolving it needs the calling UI, not more static tracing.

| File | Evidence |
|---|---|
| `app/api/studio/with-me/sessions/[sessionId]/synthesize/route.ts` | post-session synthesis; may be awaited by a UI button or not |
| `lib/astrology/spiralogicReportGenerator.ts` | report generation — long-running by nature |
| `lib/maia/sessionProcessor.ts` | maia/session/process — name suggests post-session |
| `lib/patterns/generatePatternIntelligence.ts` | members/patterns + studio client patterns |
| `lib/memory/bardic/LinkingService.ts` | consciousness/memory/episodes |
| `lib/memory/bardic/TeleologyService.ts` | bardic/capture-episode |
| `lib/content/extractor.ts` | content/pipeline |
| `lib/content/transformer.ts` | content/pipeline |
| `lib/content-pipeline/extractor.ts` | content/pipeline |
| `lib/content-pipeline/transformer.ts` | content/pipeline |
| `lib/content-pipeline/qualityFilter.ts` | content/pipeline |

### C. DEFERRED — confirmed (1)

Worker-invoked. Nobody waits.

| File | Evidence |
|---|---|
| `lib/scribe/sovereignSummarizer.ts` | generateSessionRemembrance called ONLY by scripts/run-session-summary-worker.ts |

### D. BATCH (4)

Offline scripts. Never on a request path.

| File | Evidence |
|---|---|
| `scripts/backfill-maia-turns-summaries.ts` | one-shot backfill |
| `scripts/generate-chapter-illustrations.ts` | offline asset generation |
| `scripts/library/distillSource.ts` | offline library distillation |
| `scripts/walk-relational-navigation.ts` | offline walk/eval |

### E. UNREACHED (25)

No path from any route or worker. ⛔ Not migration candidates — **deletion candidates.**

| File | Evidence |
|---|---|
| `app/api/_backend/maia-ask-needs.js` | 0 importers outside _backend |
| `app/api/_backend/maia-first-contact-direct.js` | 0 |
| `app/api/_backend/maia-first-reflection.js` | 0 |
| `app/api/_backend/maia-i-thou.js` | 0 |
| `app/api/_backend/maia-session-closing.js` | 0 |
| `app/api/_backend/maia-supervision-session.js` | 0 |
| `app/api/_backend/maia-triad-continue.js` | 0 |
| `app/api/_backend/maia-triad-conversation.js` | 0 |
| `app/api/_backend/src/core/UnifiedOracleCore.ts` | only scripts/dev-only/test-sovereignty.js |
| `app/api/_backend/src/services/ElementalIntelligenceRouter.ts` | 0 |
| `app/api/_backend/src/services/hallucination-testing/maiaModelRunner.ts` | 0 |
| `lib/ai/ClaudeBridge.ts` | 0 importers |
| `lib/complete-sacred-oracle.ts` | 0 external importers |
| `lib/layered-sacred-oracle.ts` | 0 |
| `lib/elegant-sacred-oracle.ts` | imported only by the other two unreached oracles |
| `lib/consciousness/CacheWarmingService.ts` | 0 |
| `lib/consciousness/MAIAUnifiedConsciousness.ts` | via BrainTrustOrchestrator + ElementalWeavingEngine; neither reaches a route |
| `lib/maia/principleExtractor.ts` | 0 |
| `lib/pipelines/document-analysis.ts` | 0 |
| `lib/scribe/sessionSummaryGenerator.ts` | 0 — superseded by sovereignSummarizer |
| `lib/transcript-analysis/PatternExtractor.ts` | 0 — apparent importers resolve to lib/morphogenetic/PatternExtractor (basename collision) |
| `lib/transcript-analysis/TranscriptAnonymizer.ts` | only PatternExtractor + WisdomLibrary, both unreached |
| `lib/services/conversationEssenceExtractor.ts` | 0 |
| `lib/services/UnifiedInsightEngine.ts` | type-only imports; no value import reaches a route |
| `lib/secondbrain/secondBrainClassifier.ts` | via lib/secondbrain/index.ts; no route imports it |

---

## 3. Two things found while tracing, routed out rather than absorbed

### 3a. ⚠️ `legacy_backend`'s prefix exemption is broader than its own description

`scripts/provider-policy.json` exempts `app/api/_backend/` by **path prefix**, describing it as an
*"unreachable legacy Express backend, pending wholesale deletion."*

**For the 11 anthropic files in that directory the claim holds** — verified individually, all 11 have
zero importers outside `_backend` (one is reached only by `scripts/dev-only/test-sovereignty.js`).

**For the directory it does not.** Live Next routes import from `_backend` today, by explicit
specifier, verified by reading the import statements rather than matching basenames:

```
app/api/oracle/memory/route.ts:5   import { personalOracleAgent } from '../../_backend/src/agents/PersonalOracleAgent'
app/api/oracle/trust/route.ts:11   await import('../../_backend/src/agents/PersonalOracleAgent')
app/api/journal/list/route.ts:7-9  MemoryStore · LlamaService · logger
app/api/voice/transcribe/route.ts:8-10   ·  app/api/voice/list/route.ts:6-7
app/api/members/bazi-profile/route.ts:7  ·  app/api/spiralogic-report/[reportId]/download/route.ts:49
```

⭐ And `app/api/_backend/src/agents/PersonalOracleAgent.ts` **carries an OpenAI surface** and is
covered by that prefix. So a prefix exemption justified by unreachability is exempting a file two live
routes import.

**WITNESSED:** the import edges above, and the OpenAI surface in that file. **NOT ESTABLISHED:**
that those routes are member-reachable in production, or that the OpenAI code path executes when they
are called. ⛔ Not repaired, ⛔ no lane opened — `legacy_backend` belongs to the provider-governance
lane, and the `forbidden_debt_max`/`debt_max` ratchets pinned 2026-09-20 hold the numbers still while
it is decided.

### 3b. Basename collision defeated the first pass, twice

An initial trace reported `lib/transcript-analysis/PatternExtractor.ts` as reached, and six
`_backend` OpenAI files as reachable from live routes. Both were **false**: the importers resolved to
`lib/morphogenetic/PatternExtractor` and to same-named files under `lib/`. Corrected by matching
import *specifiers* rather than basenames — the same discipline
`scripts/check-no-direct-anthropic.ts` already encodes in its own matcher, and the reason its count
differs from a naive `grep`.

⭐ Recorded because it nearly produced a census that was confidently wrong in the safe-sounding
direction: it would have classified dead code as live, and inflated the migration surface.

---

## 4. What this changes about L1–L4

| Step | Status after L2 |
|---|---|
| **L1** — `latencyClass` discriminator | Still worth landing. Zero behaviour change. |
| **L2** — this census | ✅ Complete for the grandfathered set. |
| **L3** — route deferred work local | ⛔ **Not worth opening on this evidence.** One confirmed deferred file, already correctly queued. The candidates are in class B, and class B is unresolved. |
| **L4** — leave interactive alone | Unchanged, and now supported by 14 confirmed files. |

**The highest-leverage next act is no longer L3.** In order:

1. ⭐ **Delete the 25 unreached files** (or quarantine them under `.DISABLED`, which the guard already
   excludes). Retires 45% of the bypass debt with no provider decision, no quality trade-off, and no
   growth-obligation answer owed. Each deletion lets `--retighten` lower the ceiling — the ratchet
   turning debt reduction into something the guard enforces rather than merely records.
   ⚠️ Verify each against runtime, not only the import graph: dynamic `import()` by constructed string
   and config-driven dispatch are invisible to this method.
2. **Resolve class B (11 files)** by reading the calling UI. That is where the real deferred work is,
   if it exists.
3. **Then, and only then,** decide L3 — on a set whose size is known.

---

## 5. Standing

**L2 COMPLETE · 55/55 CLASSIFIED · 1 CONFIRMED DEFERRED · 25 UNREACHED · L3 ⛔ NOT OPENED AND NOT
RECOMMENDED ON THIS EVIDENCE · ⛔ NO FILE DELETED · ⛔ NO FILE MIGRATED · ⛔ NO ROUTING CHANGE ·
⛔ NO SCHEMA CHANGE · ⛔ NO DEPLOY · PRODUCTION UNTOUCHED.**

Open questions:

1. Are the 25 unreached files deleted, quarantined, or left? Deletion is the only act here that
   reduces debt rather than capping it — and it is the one act that needs no provider ruling.
2. Who resolves class B? It needs the calling UI, not more static analysis.
3. ⛔ The `legacy_backend` prefix finding (§3a) is the provider-governance lane's, not this one's.


---

## 6. ⚠️ AMENDMENT — Phase-1 verification corrected this census before anything was deleted

**The census above was wrong about one file, and the error was systematic.** §2's trace covered
`app/ lib/ scripts/` and **not `components/`**. `lib/services/conversationEssenceExtractor.ts` is
imported by `components/OracleConversation.tsx` and is reachable from **10 entry points including
`app/maia/page.tsx`** — the main member surface. It is **INTERACTIVE**, not unreached.

**Corrected counts: Interactive 15 · Unreached 24** (Route-reached-await-unknown 11, Batch 4,
Deferred 1 unchanged).

⭐ *A census that misses a whole top-level directory misses it for every file at once.* Only Phase 1
caught it, and only because Phase 1 rebuilt reachability instead of re-running the same query.

### The instrument was rebuilt and validated

Reachability is now a transitive reverse-closure over a resolved import graph: specifiers resolved
through `@/` and relative forms with extension and `/index` candidates, edges over 7,488 tracked
files (12,328 reverse edges), entry points = `app/**/{route,page,layout,…}` + `middleware.ts` +
worker scripts (1,516 detected).

⭐ **Validated against known-true controls before being trusted**, because a reachability tool that
answers "unreached" for everything is indistinguishable from a broken one:

```
REACHABLE lib/consciousness/LLMProvider.ts            entries=58
REACHABLE lib/db/postgres.ts                          entries=888
REACHABLE lib/scribe/sovereignSummarizer.ts           entries=3   (worker)
REACHABLE components/OracleConversation.tsx           entries=10
REACHABLE lib/morphogenetic/PatternExtractor.ts       entries=14  ← the collision twin
```

The last control is the one that matters: it confirms the *morphogenetic* `PatternExtractor` is live
while the *transcript-analysis* one is dead, which was the distinction the basename trap destroyed.

---

## 7. What was deleted, and what was deliberately not

### ✅ DELETED — 9 files, 2,936 lines. Ceiling **55 → 46**.

`lib/ai/ClaudeBridge.ts` · `lib/complete-sacred-oracle.ts` · `lib/layered-sacred-oracle.ts` ·
`lib/elegant-sacred-oracle.ts` · `lib/consciousness/CacheWarmingService.ts` ·
`lib/maia/principleExtractor.ts` · `lib/pipelines/document-analysis.ts` ·
`lib/scribe/sessionSummaryGenerator.ts` · `lib/transcript-analysis/PatternExtractor.ts`

**Selection rule: reverse-closure entirely within the deletion set.** Each has either no importer at
all, or importers that are themselves in this set (the three sacred-oracle files form one mutually
importing dead cluster and go together). Nothing outside the set loses a dependency.

### ⛔ HELD — 4 targets whose closure pulls in 9 unflagged files

`MAIAUnifiedConsciousness.ts` (+`BrainTrustOrchestrator`, `ElementalWeavingEngine`) ·
`TranscriptAnonymizer.ts` (+`WisdomLibrary`, `MAIAWisdomIntegration`) ·
`UnifiedInsightEngine.ts` (+`useInsightTracking`, `InsightPersistence`, `unified-insights-storage`) ·
`secondBrainClassifier.ts` (+`secondbrain/index.ts`, `scripts/secondbrain/testCapture.ts`).

**Every one of these closures has zero entry points — the collateral is provably dead too.** Deleting
them is *correct*. It is also 9 files nobody flagged, and the authorization was for the 25 in the
allowlist. ⛔ **Scope named rather than assumed.** A founder act saying "delete the closures too"
makes this a 13-file deletion and drops the ceiling to 42.

### ⛔ HELD — the 11 `app/api/_backend/` files

All 11 are genuinely unreached from any Next entry (verified individually). Held anyway, for three
reasons: `_backend/src/boot/diag.ts:18` does `require(m)` on a **variable**, so its dependencies are
invisible to static analysis; `ElementalIntelligenceRouter` and `maiaModelRunner` are imported by
other `_backend` files; and the directory is already slated for **wholesale deletion** by the
provider-governance lane, which also owns the §3a prefix finding.

⭐ *Partial demolition of a building already scheduled for demolition, by a lane that does not own the
building, is not a win.*

---

## 8. ⚠️ Finding — the typecheck no-regression gate is currently red for an environmental reason

`npm run typecheck` **fails on a clean tree**, before any change in this lane:

```
program files : 4402 (baseline 3965)      errors : 2 (baseline 239)
NEW: tsconfig.ship.json:3 TS5101 / TS5107 — 'downlevelIteration' and 'moduleResolution=node10'
     are deprecated and will stop functioning in TypeScript 7.0
239 error(s) fixed since the baseline  ·  444 new file(s) entered the program
```

This container runs a newer TypeScript than the one that recorded `typecheck-baseline.json`. The two
new diagnostics are **compiler-option deprecations in the tsconfig itself**, not code defects.

**So the gate could not discriminate this deletion from no deletion.** The discriminating evidence is
that the diagnostic set is **identical before and after** — 2 errors both times, same two codes, same
line — and the program shrank by exactly 1 file (8 of the 9 deleted files were not in the ship
program at all, consistent with the gate's own `8 baselined file(s) were deleted from disk`).

⛔ **Not repaired, and deliberately not re-baselined.** The gate's own output forbids it
(*"Do NOT run `npm run typecheck:baseline` to absorb a new error"*), re-baselining is a governed act,
and absorbing a TypeScript-version deprecation would bless 239 errors' disappearance in the same
stroke — a coverage change nobody reviewed.

⭐ Worth its own act, and soon: **a gate that is permanently red teaches people to ignore it**, which
is the exact reasoning that produced the S3 substrate-typecheck disposition. A red gate that cannot
discriminate is one step from a gate nobody reads.

---

## 9. Standing (amended)

**L2 COMPLETE AND AMENDED · 9 FILES DELETED (2,936 lines) · CEILING 55 → 46 · 13 FILES HELD PENDING
SCOPE RULING · 11 `_backend` FILES HELD FOR THE PROVIDER LANE · TYPECHECK GATE RED PRE-EXISTING AND
UNREPAIRED · ALL OTHER GUARDS GREEN · ⛔ NO ROUTING CHANGE · ⛔ NO SCHEMA CHANGE · ⛔ NO DEPLOY ·
PRODUCTION UNTOUCHED.**

⚠️ `lib/consciousness/README-COST-OPTIMIZATION.md` documents `CacheWarmingService` usage in sample
code. The service is deleted; that README is now stale. Left as-is — doc repair is not this lane's.
