# Risk #1 Investigation — Signals vs Pattern Generation

**Status:** Investigation findings — **documentation only, no mutation.** Read-only code archaeology (callers/migrations traced, not filenames). Produced 2026-07-26. **Stops for Founder Ruling.** Facts are the investigation's; the **compliance verdict is Kelly's** — this document renders *counsel*, not a ruling.

**Question (Kelly, 2026-07-26):** the new doctrine says *automation ends at Signal; humans author Recognition and Pattern.* Do the three existing live generators already emit **named patterns/interpretations** (past the line) rather than **bounded signals**? Answered factually per service below.

---

## Service 1 — `ImprovementHypothesisGenerator` (`lib/learning/ImprovementHypothesisGenerator.ts`)

| Q | Finding |
|---|---|
| **Inputs** | Rupture/misattunement categories, feedback patterns, engine comparisons, cross-loop patterns. Threshold: 3+ recurrences (:181). |
| **Outputs** | `ImprovementHypothesis[]` — proposals about the **SYSTEM, not members**: `type` (`prompt_modification`/`gating_threshold`/…), `modification.target` (e.g. `AIN_RESPONSE_LENGTH_CONSTRAINT`), `priority`, `status:'proposed'`. Persisted to `improvement_hypotheses` (:424). |
| **Consumers** | Only `learningSystemOrchestrator` Loop E (:343) ← `scripts/dreamtime.ts` cron + `app/api/learning/feedback`. → `improvement_hypotheses` table for **mentor review. Does NOT reach member generation.** |
| **Signal vs Pattern / gating** | Lifecycle `proposed→approved→testing→validated→deployed`; *"MAIA proposes; Mentors approve; Production is human-signed"* (:340). `approveHypothesis` refuses without `mentorId` (:497); `deployHypothesis` requires `validated`+mentor. **Mentor-gated proposal; never authoritative.** |

**Reading:** it auto-authors a *hypothesis* (more than a signal — a named, scored system-change proposal), **but** it is authority-safe: fully mentor-gated, human-signed at every promotion, never reaches members. Authority is preserved; **authorship** crosses the new doctrine's Signal line.

## Service 2 — Pattern system (`lib/patterns/*`)

- **`PatternDetectionService.ts`** (`detectPatterns`/`upsertPatternCandidate`): **0 callers — DORMANT.** Its own doc says *"Notice structure. Never name meaning."*
- **The live writer is `upsertPatternLedger.ts`** ← `SessionMemoryServicePostgres.ts:162`, derived from `conversation_insights`; `statement` normalized to **named labels** ("Withdraws under conflict") via `normalizePatternInsight.ts`.

| Q | Finding |
|---|---|
| **Inputs** | `conversation_insights` (insightText, significance, type). |
| **Outputs** | `pattern_ledger` rows: `statement` (**NAMED pattern**), `confidence`, `status`. `generatePatternIntelligence.ts` uses the **Anthropic LLM** (:106) to author `description`+`invitation` at confidence≥0.6 & recurrence≥2 — interpretive, framed *"provisional, never diagnostic."* |
| **Consumers — REACHES MEMBER GENERATION** | `getActivePatternContext` (`PatternOfferingService.ts:309`, `status NOT retired/rejected AND confidence≥0.25` — **includes unconfirmed 'emerging'**) → `buildMemberLiveContext` → `patternsBlock` `P1 [72% | scope | date]: <statement>` → `oracle/conversation/route.ts:895,972`. |
| **Signal vs Pattern / gating** | The reaching-generation path surfaces the **named statement** as background: *"Silent context — background awareness, do not recite… if relevant reflect briefly."* This is **NOT** the Invariant-8 gated offer — the gated single-offer path (`getPatternOffer`, distress-gate + cooldown + "tap on glass") and `getTopPatterns` injection are both **0 callers — DORMANT.** So a named, LLM-interpreted pattern flows to member generation as de-facto background, **minus** the intended offer/cooldown/distress gating. |

**Reading:** this is the clearest live instance of *system-authored named patterns reaching member generation* — but it is **member-facing**, a different domain from the self-improvement loop this lane governs. It sits against **Recognition Integrity (Invariant 16)** and *"notice patterns, never name meaning,"* not against the recursive-development doctrine per se. Mitigations exist (silent background, non-recite, "provisional, never diagnostic"); the concern is the **intended gating is dormant** and 'emerging' (unconfirmed) statements are included.

## Service 3 — `detectBreakthrough` (`lib/utils/breakthroughDetection.ts:60`)

| Q | Finding |
|---|---|
| **Inputs** | Raw text. |
| **Outputs** | `BreakthroughAnalysis { isBreakthrough, depth, markers[], spiralLevel? }` — keyword match vs `SACRED_MARKERS`/`SPIRAL_MARKERS`. A **boolean + depth score + marker labels** = a bounded **signal**. |
| **Consumers** | `oracle/conversation` → gated `depth≥0.5 && hasValidContext` → `ainSpiralogicBridge.sendToField` → **collective anonymized field** (fire-and-forget); + `api/ain/collective/breakthrough`. **Does NOT feed the member's own generation prompt.** |
| **Signal vs Pattern / atoms** | **Explicitly forbidden** from `atoms.is_breakthrough`; that column is written **only** by the member-action route (verified — TRUE:105 / FALSE:145). System never auto-marks. |

**Reading:** a **clean signal detector**, correctly walled off from the member-authored breakthrough flag, feeding an anonymized collective field. Consistent with both the doctrine and the member-marked canon.

## Summary table

| Service | Output kind | Reaches member generation? | Gating | Line status |
|---|---|---|---|---|
| ImprovementHypothesisGenerator | scored system-change **hypothesis** | No (mentor loop) | mentor-signed; refuses deploy without `mentorId` | authority-safe; **authorship** past Signal |
| PatternDetectionService (writer) | would emit named pattern | **Dormant** (0 callers) | n/a | inert |
| pattern_ledger → `getActivePatternContext` | **named pattern** (+LLM interpretation) | **Yes** (oracle background) | **intended offer gating DORMANT** | member-facing; past Signal |
| `getPatternOffer`/`getTopPatterns` | gated pattern **offer** | Dormant (0 callers) | Invariant-8 wiring exists, unused | inert |
| detectBreakthrough | boolean + depth + markers **signal** | No (collective field) | depth-gate; forbidden from atoms flag | **clean signal** |

*(Correction surfaced: `lib/learning/hypothesisBuffer.ts` is empty; the real writers are `lib/consciousness/hypothesisBuffer.ts` + `interpretiveLedger.ts`.)*

---

## The one genuine constitutional question this forces

**The new doctrine ("automation ends at Signal") is *more specific* than the platform's existing Invariant 8 ("all layers may suggest; only the Conductor decides") — a *lex specialis* for one domain, not a stricter reading of the same question.** Invariant 8 answers *who decides* (a system may auto-*author* a proposal so long as a human decides). The new doctrine answers a *different* question — *who may perform the first act of interpretation from which the system evolves* — and reserves that first named interpretation to a human. Nothing in Invariant 8 is overridden; scope is narrowed. *(Founder correction, Kelly 2026-07-26: "stricter" would wrongly imply Invariant 8 was insufficient — it is not.)*

Service 1 is the crux: it is **Invariant-8-compliant** (mentor-gated) yet **would require redesign under the more-specific new doctrine** (it auto-authors hypotheses). So the decision that gates this entire lane is:

> **Does the recursive-development doctrine tighten Invariant 8 for the self-improvement loop — or inherit it?**

## Counsel (recommendation — your ruling, not mine)

- **Service 1 → Constitutional clarification (this is the gating decision).**
  - If the doctrine *tightens* Invariant 8 for self-improvement → a later **implementation change**: the generator emits *signals* ("rupture category X recurred N times"); a mentor authors the hypothesis.
  - If it *inherits* Invariant 8 → **documentation**: record that mentor-gated, non-member-facing hypothesis-*proposals* are permissible offers, distinct from member-facing pattern authorship.
  - Either way: **no bug, no urgency** — it is authority-safe today.
- **Service 2 → separate flag, not this lane.** A live, member-facing named-pattern-to-generation path with its intended Invariant-8 gating dormant. Recommend a **distinct member-facing review** (Recognition Integrity), decided on its own merits — not folded into the recursive-development lane. *(Measure first; the "silent/provisional/non-diagnostic" framing is a partial mitigation.)*
- **Service 3 → no change.** Clean signal; worth citing as the discipline done right.

**Bottom line:** the doctrine is not already violated by the self-improvement loop; Service 1 is gated. What the investigation reveals is that **the doctrine, as written, is *more specific* than existing canon — a lex specialis, not a stricter reading** — so the real work is a *constitutional clarification of the doctrine's relationship to Invariant 8*, which should precede any build (Prompt 2 stays held until then). Service 2 is a separate, member-facing question the audit happened to surface.

## Founder Ruling (Kelly, 2026-07-26)

Ratified as a domain-specific constitutional clarification (*lex specialis*) — full text in `RECURSIVE_DEVELOPMENT_CANDIDATE_2026-07-26.md` §Constitutional Ruling. Applied to the three services:

- **Service 1 (`ImprovementHypothesisGenerator`) — constitutionally ahead of the doctrine, not defective today.** Faithfully implements Invariant 8; **documentation outcome now**, implementation candidate later *if/when* implementation is authorized. Explicitly **not** a violation (Statement 4 — no retroactive judgment).
- **Service 2 (pattern_ledger → member generation) — a separate lane** under Recognition Integrity (Invariant 16). **This dossier must NOT be used as evidence for or against the recursive doctrine.** To be opened as its own bounded investigation, later.
- **Service 3 (`detectBreakthrough`) — the reference implementation** of the desired boundary, cited inside the doctrine.

No implementation authorized. Prompt 2 held.

**End of investigation. No mutation.**
