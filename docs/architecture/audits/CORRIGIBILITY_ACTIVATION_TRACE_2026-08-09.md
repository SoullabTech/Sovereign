# Corrigibility Activation Trace

## Why the COGOS authority/supersession pathway is absent from the live MAIA runtime

**Date:** 2026-08-09
**Authorization:** Founder-directed follow-on to `AIN_MEMBER_CENTER_CORRIGIBILITY_STEWARDSHIP_AUDIT_2026-08-09.md`. Investigation only — **no wiring, no redesign, no production table population, no new corrigibility vocabulary.**
**Implementation changes made by this trace:** **NONE.**
**Branch / commit:** `feature/labtools-redesign` @ `851c2e73a`

---

## 0. Answer

The founder offered five hypotheses: (a) intentionally deferred, (b) abandoned, (c) superseded, (d) partially implemented and never connected, (e) blocked by architectural incompatibility.

**The evidence supports none of them. The correct answer is a sixth category:**

> **(f) Built, wired, and live — then deleted as undisclosed collateral inside an unrelated refactor.**

COGOS was not landlocked. It was **connected and running for seven days**, then removed by a commit whose message describes only a Spiralogic report feature and says nothing about removing anything.

| | |
|---|---|
| **Built and wired** | `4f73d66b0` — 2026-03-12 — *"feat: interpretive ledger + hypothesis accumulation pipeline"* — added 4 modules (2,107 lines), 3 migrations, 2 member-facing routes, **and +115 lines of live wiring into `app/api/oracle/conversation/route.ts`**, which was the live conversational route at that date. |
| **Deleted** | `d7cea280d` — 2026-03-19 (7 days later) — *"feat(spiralogic): add report evolution delta and context injection"* — `app/api/oracle/conversation/route.ts`: **+353 / −1,947** (3,635 → 2,041 lines). Every COGOS import and every COGOS call site removed. **The commit message does not mention it.** |
| **Relocated?** | **No.** Zero added lines anywhere in that commit import `interpretiveLedger`, `hypothesisBuffer`, `observationExtractor`, or `gateEvaluator`. It was removed, not moved. |
| **Ever restored?** | **No.** `git log -S` across all branches shows exactly two commits touching these call sites: the one that added them and the one that removed them. |

This is not a story about unfinished work. It is a story about **work that was finished, ran, and was lost without anyone noticing** — including by the two audits since (`RECURSIVE_DEVELOPMENT_CURRENT_STATE_AUDIT_2026-07-26.md` correctly recorded "0 upstream callers" but read it as *"promote path not wired into generation"*, i.e. as incompleteness rather than as regression).

---

## 1. The scope is much larger than COGOS

This is the finding that outranks the corrigibility question.

`d7cea280d` removed **36 subsystem imports** from the live conversational route. Today, **34 of the 36 have never returned to that route**, and **14 of those modules now have zero importers anywhere in the repository.**

### 1.1 Orphaned repo-wide (0 importers, anywhere, today)

| Module | What it does | Relevance |
|---|---|---|
| `lib/consciousness/correctionDetection.ts` | `detectCorrectionSignal()` — deterministic phrase detector for `"that's not what I meant"`, `"that's not what I said"`, `"you misunderstood"`, `"you already asked"`, `"I just told you"`; returns `{hasCorrectionSignal, correctionType: 'repeat'\|'misread'\|'thread_loss'\|'general', matchedPhrase, confidence}` | ⭐ **This is the T1 trigger the audit reported as non-existent. It exists, it is complete, and it is dead code.** |
| `lib/consciousness/responseThreadCheck.ts` | `validateResponseAgainstActiveThread()` + `buildRepairInstruction()`; issue types include `'missed_correction'` | ⭐ The repair half of the same loop |
| `lib/consciousness/activeThread.ts` | `deriveActiveThread()` + `buildActiveThreadBlock()` | ⭐ The thread state both of the above operate on |
| `lib/consciousness/observationExtractor.ts` | COGOS step 1 — extracts observations **and corrections** | ⭐ COGOS head |
| `lib/consciousness/gateEvaluator.ts` | COGOS promotion gates (510 lines) | ⭐ COGOS gate |
| `lib/consciousness/pfiResponder.ts` | direct-response path | |
| `lib/conversation/conversationStateResolver.ts` | conversation state + state hint | |
| `lib/patterns/getTopPatterns.ts` · `getTopHypotheses.ts` · `PatternDetectionService.ts` | practitioner-named pattern surfacing into context | |
| `lib/memory/stores/JournalStore.ts` | journal read into context | |
| `lib/wisdom/wisdomGraphService.ts` | wisdom event emission | |
| `lib/consciousness/modelRouter.ts` · `lib/library/dynamicRange.ts` | routing / retrieval breadth | |

`hypothesisBuffer` and `interpretiveLedger` are not in this list only because the member-facing read/annotate routes and the sweeper script still import them — i.e. they are reachable **for inspection**, never **for effect**.

### 1.2 What this means

MAIA had, and lost, **two independent corrigibility mechanisms** — not one:

- **In-turn repair** (`correctionDetection` → `responseThreadCheck` → `buildRepairInstruction`): MAIA notices *within the conversation* that it has been corrected, and repairs. No database, no schema, no consent question.
- **Durable authority change** (COGOS ledger): a correction weakens an interpretation's `routing_influence_weight` across sessions while the evidence is preserved.

The first is cheap and uncontroversial. The second is the profound one, and carries an unresolved constitutional question (§4).

---

## 2. Reconstructed intended lifecycle

From `4f73d66b0` and `docs/engineering/cogos-status.md`, the pipeline as designed and as it actually ran:

```
                       ┌─────────────────────────────────────────┐
                       │  if (!isSanctuarySession) {  ← invariant │
                       └─────────────────────────────────────────┘
member turn + MAIA response
        │
   [1] extractObservations({sessionId, memberId, userMessage, maiaResponse,
        │                   currentElement, currentPhase, currentMode, conversationDepth})
        │      → { observations[], corrections[] }        ← OS-native, deterministic, no LLM
        │
   [2] for (obs of observations) enqueueObservation(userId, obs, sessionId)
        │      → creates/updates accumulating_hypotheses      (fire-and-forget)
        │      → appends to cogos_evidence_events            (insert-only, immutable:
        │                                                     "you can revise the hypothesis,
        │                                                      not what was observed")
        │
        │   ┌── Promise.all ──┐
        ├───│ loadActiveHypotheses(userId)   │
        │   │ loadLedgerSummaries(userId)    │
        │   └────────────────────────────────┘
        │
   [3] for (correction of extraction.corrections)
        │      match correction.target_keywords against
        │      hypothesis.candidate_interpretation
        │      → enqueueContradiction(...)   ← CONTRADICTION_WEIGHTS.user_correction = 0.95
        │
   [4] evaluateHypothesis / runGateSequence(hypothesis, DEFAULT_GATE_THRESHOLDS)
        │      gates: recurrence · cross_context · developmental_relevance
        │             structural_completeness · store_routing · confidence_floor
        │      → persistGateResult(...)
        │
   [5] if (isPromotionEligible && isPromotionWorthy)
        │      → promoteToLedger(hypothesis, {...})
        │        interpretive_ledger entry, routing_influence_weight = 0.70
        │
        ▼
   loadLedgerForRouting(userId) → LedgerRoutingView[]  ── injected into the prompt
        │                                                 at route line ~540, inside the
        │                                                 opening Promise.all, with graceful
        │                                                 fallback to []
        ▼
   member-facing:  GET /api/members/ledger        (inspect)
                   POST /api/members/ledger/annotate  (clear_influence | add_context)
                   applyDecay() via sweeper
```

**Verified operation.** `docs/engineering/cogos-changelog.md` records a live verification run — `hypotheses created: 1`, `status: active`, `falsifiability_anchors: [recurrence, cross_context, member_confirmation]` — plus a real bug found and fixed in `shouldExpire` (premature expiry for new hypotheses). This pipeline demonstrably executed.

**Where the chain stops today:** at step **[1]**. `extractObservations` has no caller. Everything downstream is structurally correct and permanently unreachable. Production confirms: `accumulating_hypotheses` 0, `interpretive_ledger` 0, `ledger_member_annotations` 0, `relational_calibration` 0.

**Design intent that was never built** (`cogos-status.md`, "remaining work", items 3–4 — open since 2026-03-12, independent of the deletion):

3. Member-facing annotation **UI** — `clear_influence`, `add_context` (the API exists; no surface does)
4. **Consent surfacing flow** — *"how and when MAIA offers interpretations to the member (requires design pass against sovereignty invariants)"* — **never done**

---

## 3. Compatibility with current AIN ontology

COGOS was designed 2026-03. The governing canon it must now satisfy was written **five months later**. A compatibility review is therefore genuinely required, and the result is split.

### 3.1 Where COGOS is *ahead* of the canon — strongly compatible

| COGOS mechanism | Canon it anticipates |
|---|---|
| `routing_influence_weight` — *"Reduced by decay, contradictions, and member revocation. **Evidence is preserved regardless of this value.**"* | Exactly the founder's stated principle: history remains true as history while ceasing to define the person. Written in March; articulated as doctrine in August. |
| `cogos_evidence_events` insert-only — *"you can revise the hypothesis, not what was observed"* | `EVIDENCE_BELONGS_TO_ITS_ARCHITECTURE_2026-08-06`; the anti-erasure requirement |
| `FalsifiabilityAnchor` mandatory on admission — *"Entries without falsifiability anchors cannot decay cleanly and become self-sealing over time"* | `MODEL_COMPLETION_CRITERION_2026-08-06`; the anti-self-sealing discipline |
| `decay_conditions` — *"What developmental shift would make this interpretation irrelevant"* | Developmental release; the T4 requirement |
| `cogos_surfacing_status = 'cleared_by_member'` | Member authority over surfacing |
| Sanctuary guard wrapping the whole pipeline | Sanctuary invariant 6 — holds unconditionally |
| Deterministic, no-LLM extraction | Auditability; `EVIDENCE_SCOPE_RULE_2026-08-06` |

### 3.2 Where COGOS **conflicts** with canon written after it — the real blocker

**`isPromotionEligible()` requires all six gates to pass. None of the six is member confirmation.** Verified: the string `member_confirmation` appears in the status document as a *falsifiability anchor label* and **nowhere in the gate logic**. The gates are `recurrence`, `cross_context`, `developmental_relevance`, `structural_completeness`, `store_routing`, `confidence_floor` — all structural properties of accumulated system observation.

So the promotion rule is:

> *A system-authored interpretation about a member acquires durable routing authority over how MAIA understands that member, on the strength of recurrence and cross-context evidence alone. The member's correction operates only afterward, as a contradiction event that reduces a weight.*

Set against:

- **`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`** — *authority may only move upward through authored experience … never skipping a layer, never manufacturing higher-order meaning.* Promotion manufactures higher-order meaning from observation without passing through member authorship.
- **`AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06.md`** — authority is authored or held; it is not accumulated.
- **Practitioner Inference Containment (2026-08-06)** — *"Visibility, acknowledgment, confidence, recurrence, and professional role never create authorship or permission."* **`recurrence` is named explicitly as something that does not create authority** — and `recurrence` is COGOS's first gate.

**This is the genuine architectural incompatibility.** It is not the reason COGOS is unwired (the reason is a deleted diff), but it is the reason it **cannot simply be re-wired as it stands**.

**A distinction that may resolve it, and that only the founder can rule on:** the containment ruling governs material **crossing from a member's sovereign field into a shared developmental commitment** — into a *practitioner's* view. COGOS influences only MAIA's attunement to the member themselves; nothing crosses to a third party, and the member can inspect and clear it. Whether MAIA's own understanding of a member counts as "shared" — or whether the member's own field is exactly where the rule should be strictest — is a constitutional question, not an engineering one.

---

## 4. Smallest activation boundary

Stated as two separable layers, because they have different sizes and very different constitutional weight. **Neither is implemented here.**

### Layer A — in-turn repair · *no ruling required*

Restores MAIA noticing and repairing a correction **within the conversation**. Constitutionally uncontroversial: it makes no claim about the member, stores nothing, and infers nothing durable.

- **Components:** `detectCorrectionSignal()` · `deriveActiveThread()` / `buildActiveThreadBlock()` · `validateResponseAgainstActiveThread()` / `buildRepairInstruction()`
- **All pure functions.** No DB reads, no DB writes, no migration, no schema, no consent surface.
- **Boundary:** import into the live path (`app/api/sovereign/app/maia/list/route.ts` → `lib/sovereign/maiaService.ts`); one addendum slot in `summarizePromptBlock()` (`lib/maia/maiaRuntimeContext.ts:284-307`).
- **Caveat, stated honestly:** `validateResponseAgainstActiveThread` runs **after** generation and its value depends on a repair/regeneration step. Whether the live route has a post-generation seam is **not established by this trace**. `detectCorrectionSignal` + `buildActiveThreadBlock` are pre-generation and have no such dependency — that subset is the true minimum.
- **Honest limit:** Layer A gives MAIA in-turn responsiveness to correction. It does **not** give the member authority over MAIA's durable understanding. It would be a real improvement and it would **not** make "members can correct what the system believes about them" true.

### Layer B — durable authority · *ruling required first*

- **Components:** the full step 1–5 pipeline + `loadLedgerForRouting` read-back + a new `ledger` addendum.
- **Blocked on:** §3.2 (the promotion rule vs. authored-authority canon) and `cogos-status.md` item 4 (consent surfacing, never designed).
- **Also required and never built:** the annotation UI (item 3). The write API exists; no surface calls it. Without it, `clear_influence` is reachable only by authenticated `curl`.

### What is *not* in the activation boundary

Nothing needs to be designed. Nothing needs new vocabulary. The schema, the types, the gates, the weights, the anchors, the decay, the member routes and the Sanctuary guard all exist and are internally coherent. **The gap is a decision and a connection, not a design.**

---

## 5. What genuinely requires a founder ruling

1. **Does system-inferred interpretation get to hold durable authority over MAIA's understanding of a member at all?** §3.2. If no, COGOS's promotion path must be re-gated on member authorship and the trace's Layer B becomes a different architecture. If yes, the containment ruling needs an explicit member's-own-field carve-out.
2. **Consent surfacing** — when and whether MAIA offers a held interpretation back to the member. Open since 2026-03-12; the one piece the original lane deferred on purpose.
3. **Layer A now, or Layer A with Layer B?** Shipping A alone visibly improves corrigibility while leaving the Paper III claim false. That gap must be deliberate, not accidental.
4. **The 12 other orphaned modules** (§1.1). This trace was scoped to corrigibility. Whether the rest of the 2026-03-19 excision should be reviewed, restored, or retired is out of scope and unaddressed.

---

## 6. Process finding — the thing that should not be allowed to recur

A 1,947-line deletion removed 36 subsystems from the live conversational route under a commit message describing a report feature. Nothing caught it: not review, not tests, not the typecheck gate (removing a call site keeps everything compiling), not the four months of audits since. It surfaced only because this lane asked "why is this not wired" instead of "how do we wire this."

The `__tests__/practitioner-authority-boundaries.test.ts` pin pattern — `git grep` assertions that a wiring **exists** or **does not exist** — is the instrument that would have caught it, and it already exists in the repository. **No such pin is proposed or written here.** Whether wiring pins should guard live-path subsystems is a founder decision.

---

## Verification appendix

```bash
cd /Users/soullab/MAIA-SOVEREIGN

# 1. COGOS was wired, then removed — exactly two commits, all branches
git log --oneline --all -S 'extractObservations' --pretty='%h %ad %s' --date=short
# 4f73d66b0 2026-03-12 feat: interpretive ledger + hypothesis accumulation pipeline
# d7cea280d 2026-03-19 feat(spiralogic): add report evolution delta and context injection

# 2. The removing commit's message mentions nothing about it
git log -1 --format=%B d7cea280d

# 3. Scale of the deletion
git show d7cea280d --numstat -- app/api/oracle/conversation/route.ts   # 353  1947

# 4. Removed, not relocated — zero ADDED lines import these modules
git show d7cea280d | rg '^\+.*(interpretiveLedger|hypothesisBuffer|observationExtractor|gateEvaluator)'
# expected: no output

# 5. The pipeline as it ran
git show d7cea280d^:app/api/oracle/conversation/route.ts | rg -n -A45 'const extraction = extractObservations'

# 6. The correction detector exists and is dead
rg -n 'export function detectCorrectionSignal' lib/consciousness/correctionDetection.ts
rg -l --glob '!node_modules' -g '*.ts' "from '@/lib/consciousness/correctionDetection'" .
# expected: definition found; zero importers

# 7. No gate requires member confirmation
rg -n -A14 'export function runGateSequence' lib/consciousness/gateEvaluator.ts
rg -n 'member_confirmation' lib/consciousness/ lib/types/interpretive-ledger.ts
# expected: six structural gates; no hit in gate logic
```

**Limitations.** (i) The reconstructed lifecycle is read from `d7cea280d^`, not observed running — the changelog's `hypotheses created: 1` is the only execution evidence, and it does not identify its environment. (ii) Production shows 0 rows in all COGOS tables; whether the March run wrote to production or to a dev database is **not established**. (iii) The 34-absent / 14-orphan counts are import-graph facts for that route and repo-wide respectively; a module could in principle be reached by dynamic import, though none was found. (iv) The compatibility analysis in §3.2 is an argument from canon text, not a founder ruling, and is offered as the question rather than the answer.

---

*Read-only trace. No wiring, no repair, no production writes.*
