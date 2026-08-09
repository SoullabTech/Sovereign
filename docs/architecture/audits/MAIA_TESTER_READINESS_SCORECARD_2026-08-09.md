# MAIA Tester Readiness Scorecard — 2026-08-09

**Part of the MAIA High-Target Tester Readiness Audit.** Scores current **production** behavior (container `b1399f693`, minisforum). Scale: **PROVEN** (runtime evidence) · **PARTIAL** · **ABSENT** · **BROKEN** · **UNKNOWN**. Per the audit charter, PROVEN requires runtime evidence, not architecture. Where a mechanism is code-complete but runtime-unexercised, the score is PARTIAL at best (built ≠ wired ≠ surfacing ≠ verified).

| # | Dimension | Score | Evidence (one line) |
|---|---|---|---|
| 1 | Continuity (cross-session content) | **PROVEN** | `[MAIA] conversational-block` 49×/24h in prod, `emitted: true, surfacedCount: 6`; verbatim exchanges reach FAST/CORE prompts |
| 2 | Relational continuity | **PARTIAL** | relationship essence + patterns + member web reach the prompt; relationship-memory write-path liveness unverified (possibly fossil rows); no unfinished-threads or life-relationships substrate |
| 3 | Episodic recall | **PARTIAL** | fully wired (loader → block → all reachable tiers), 115 episodes in prod; member-use of recall unverified; no un-mark path; no consent UI |
| 4 | Semantic recall | **BROKEN** | `semantic_memory_vectors` written every eligible turn, read by nobody (pure cost); `memoryHealth.semantic` counts atoms — historical "sem: ok" evidence measured the wrong thing |
| 5 | Temporal reasoning | **ABSENT** | no server-side time-since-last-visit conditioning anywhere; no supersession; recency labels on quotes are the entire temporal apparatus |
| 6 | Salience | **ABSENT** | recency + one member flag; no decay/cooldown implemented (schema-only); nothing distinguishes constitutive from ephemeral |
| 7 | Corrigibility | **BROKEN** | atoms lane propagates (decline/archive read-enforced — PARTIAL alone), but conversational corrections merely append, in-turn repair doesn't persist, and the supersession-capable interpretive ledger has 0 callers |
| 8 | Member sovereignty (consent gates) | **PARTIAL** | sanctuary enforced in code (writes refused, purge on finalize); recall toggles read-enforced; atoms default `member_pulled`; gaps: episodic toggle has no UI, anchors gate vacuous (0 rows), With Me practitioner-observation write is practitioner-approved/member-opt-out |
| 9 | Provenance | **PARTIAL** | atoms are best-in-system (`source_type` + `epistemological_status` + provenance jsonb, surviving to rendered prompt); turns carry provenance; but writeback interpretations, pattern summaries, and MemoryBundle bullets carry none at read time |
| 10 | Authority integrity | **BROKEN** | persistence launders interpretation into fact in three places: `developmental_memories` (`significance DESC`, no supersession — a stale MAIA inference never loses authority), CaseConsultationService re-feeding its own output tag-only, MemoryBundle compression stripping authorship |
| 11 | Vault access | **BROKEN** | `ain_knowledge_chunks` = 0 rows in prod (never embedded); the only wired retrieval path targets the near-dead between/chat route — doubly unreachable |
| 12 | Wisdom relevance | **PARTIAL** | gating machinery live (knowledge gate, detection-gated knowledge field, mode-aware thresholds) but gates nothing — no content behind them; Library corpus (55,760 chunks) reachable only in the Library room |
| 13 | Cross-session continuity | **PROVEN** | same evidence as #1 plus atoms surfacing ("atoms loaded" 5×/24h, 15 atoms / 10 members) |
| 14 | Fallback continuity | **PARTIAL** | identical system prompt goes to Ollama by construction; unverified risks: no `num_ctx` (silent truncation), small local model; billing/auth errors correctly fail closed |
| 15 | Privacy/isolation | **PROVEN** (structurally) | session-verified identity, body-userId spoofs refused+logged, `requireSelfScopedMember` uniform, structural tests pin every caseload handler, team-scope fails loudly; residual: only session-create pinned to team scope |
| 16 | Return experience | **ABSENT** | no server-side return architecture; client-side static greeting tiers only; 2-week and 2-month absences produce structurally identical prompts |
| 17 | Healthy engagement | **UNKNOWN** | no instrumentation distinguishes felt recognition from noise; no member-experience measurement exists; constitution favors non-capture by design but nothing measures the positive side |
| 18 | Observability | **PARTIAL** | strong per-turn logging (runtime context 8-field log, conversational-block counts, PROMPT_BLOCK_CHARS, memoryHealth, Corpus Callosum emission) — but no per-response reconstruction of *candidates vs selected vs excluded*, and memoryHealth.semantic mislabels |

## Reading the scorecard

**What is genuinely strong**: isolation/identity (15), the consent architecture where it's built (8), atoms provenance (9), and the core continuity loop (1, 13) — which is real, live, and honest (verbatim + member-authored, no synthesis).

**The three BROKEN+ABSENT clusters that matter for high-target testers**:
1. **Corrections don't stick** (5, 7, 10) — one root cause: no supersession semantics anywhere on the high-traffic substrates, while the built solution (interpretive ledger) sits unwired.
2. **Wisdom is unreachable** (11, 12) — one root cause: content never embedded in prod + retrieval wired to the wrong route, while gating machinery idles in the live path.
3. **No return architecture** (5, 16) — the first-turn experience for a long-absent member is undesigned.

**DEEP-tier hole** (cross-cutting): the members whose messages earn DEEP routing get responses from a context-blind local wrapper — least continuity exactly where most depth is invited.

**Score honesty note**: dimension 1/13's PROVEN is emission-side (blocks reach the prompt, production-verified). Whether members *feel* recognized (the actual target) is dimension 17 — UNKNOWN. Do not quote this scorecard as "continuity proven" without that qualifier.
