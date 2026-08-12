# CMC-001 · Prior Divergence Evidence Reconciliation

Mandate digest verified `8374f1e942c8e4f8b41dab319eb75dabf609681b` @ `dbc4d5df3`.
Canonical referent bound fresh: `origin/clean-main-no-secrets` @ `52a3b924b7cf52013c1c8b0d635359c2cad672fc`.
Documents read at that SHA:
- Doc A `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` blob `9c414eb6ff572b21efff5200d30ce6da99fe8112`
- Doc B `docs/architecture/MEMORY_SUBSTRATE_DIVERGENCE_MAP_2026-05-23.md` blob `3b01d0ba3c0f5870473c812ec5e815bd092ed495`

Mode STATIC ONLY. No runtime witness. No repository file modified. `between/chat` not traversed.
Both documents are ADMITTED CORROBORATIVE EVIDENCE ONLY. Every CORROBORATED /
CONTRADICTED verdict below is backed by first-hand reading of executable source at the
bound SHA, not by the document's assertion.

§VII fields, constant unless noted: `evidence_basis: STATIC_POSSIBLE` ·
`observed_status: NOT_OBSERVED` · `evidence_date: 2026-08-12` ·
`referent_binding: origin/clean-main-no-secrets @ 52a3b92…` (deployed referent
`DEPLOYED_REFERENT_UNBOUND`).

---

## DOC A — Addenda Channel Divergence (2026-05-24, closures 2026-05-26 and 2026-07-13)

| # | Claim (doc §) | Verdict | Source backing at 52a3b92 |
|---|---|---|---|
| A1 | "There is no generic iteration. Each addendum needs a per-tier wire." (§I) | **SUPERSEDED (partial)** | Generic iteration NOW EXISTS for CORE and DEEP-repair: `appendAllContextAddenda` declared `lib/sovereign/maiaVoice.ts:489`, called `:913` (CORE) and `:1045` (DEEP-repair), driven by `ADDENDA_SPECS` `:406–431`. It does NOT exist for FAST: `maiaService.ts:1297` is 33 hand-written interpolations. Claim is superseded for CORE/DEEP-repair, still true for FAST. |
| A2 | `atomsAddendum` "never extracted by any tier"; `grep atomsAddendum maiaService.ts → zero matches" (§II.A) | **SUPERSEDED** | `git grep -c atomsAddendum` → `maiaService.ts` **9**, `maiaVoice.ts` **2**. Present in FAST template (Unit 1 `:1245`), on `MaiaContext` (`maiaService.ts:1587`), and as `ADDENDA_SPECS` entry (`maiaVoice.ts:429`). Doc's own §IX records the closure. |
| A3 | `summarizePromptBlock` counts addendum length regardless of prompt reach — "observability theater" (§II.A, §IV) | **CORROBORATED** | `lib/maia/maiaRuntimeContext.ts:292–324` reduces each addendum to `!!addendum` / `length ?? 0`; the context object is never passed to `getMaiaResponse`. Independently established as Unit 1 Artifact 2 §1. The *mechanism* survives even though the atoms instance does not. |
| A4 | DEEP addenda channel structurally inert; `grep Addendum intelligentVoiceAdaptation.ts → zero` (§II.B) | **CORROBORATED (evidence) / SUPERSEDED (consequence)** | `git grep -c Addendum -- lib/sovereign/intelligentVoiceAdaptation.ts` → **zero**, still true. But the consequence no longer holds: `buildMaiaComprehensivePrompt` now augments the returned prompt at `maiaVoice.ts:1045` *after* `buildComprehensiveVoicePrompt` returns, so DEEP-repair does receive addenda without that file changing. |
| A5 | DEEP primary is `consciousnessOrchestrator.processRequest` at `maiaService.ts:1964` (§II.C) | **CONTRADICTED_BY_CURRENT_CODE (as stated) / CORROBORATED (one hop down)** | `maiaService.ts:2052` dispatches `consciousnessWrapper.processConsciousnessEvolution`. `consciousnessOrchestrator` is imported at `maiaService.ts:7` and **never called in that file** (only other occurrence is a comment at `:2219`) — a dead import. The orchestrator IS reached, indirectly: `lib/consciousness/consciousness-layer-wrapper.ts:126` and `:224` call `consciousnessOrchestrator.processRequest`. The doc named the right terminal machine and the wrong call site. |
| A6 | The local orchestrator "has no prompt seam by construction" (§IX) | **CORROBORATED** | `lib/orchestration/consciousness-orchestrator.ts` blob `33fce86b…`: `grep -c systemPrompt` → **0**; zero `Addendum` / `contextAddenda` occurrences. This is the first independent confirmation of Unit 2 **F-6**'s first hop. |
| A7 | `ADDENDA_SPECS` "lists all 20 addenda" (§VIII.1) | **SUPERSEDED** | `maiaVoice.ts:406–431` contains **24** `{ field, log }` entries, last four = conversational / episodic / atoms / relationalContext. Matches Unit 2's count of 24; the doc's 20 is a stale snapshot. |
| A8 | DEEP consultation lane composes `conversationalRecallAddendum + episodicRecallAddendum + atomsAddendum` — three contributors (§IX) | **SUPERSEDED / undercount** | `maiaService.ts:2097–2102` composes **four**: conversational, episodic, atoms, **`relationalContextAddendum`**, `.filter(Boolean).join('\n\n')`, passed as `contextAddenda:` at `:2115`. Unit 2's four-contributor reading is correct; the doc is one short. |
| A9 | **"No prompt seam remains, on any tier, where a member turn can generate without its consent-gated recall blocks."** (§IX, "the claim this cut authorizes") | **CONTRADICTED_BY_CURRENT_CODE** | Two CORE seams return a system prompt **before** `appendAllContextAddenda` (`maiaVoice.ts:913`): (a) `:533–536` `MAIA_SAFE_MODE === 'true'` → `return buildSimpleMaiaPrompt(context)` (`buildSimpleMaiaPrompt` declared `maiaVoice.ts:254`); (b) `:543–568` `depth === 'opening' && depthConfig.maxTokens <= 50` → returns a hardcoded greeting prompt literal. Both are prompt seams; both generate with zero recall blocks. Additionally `memoryInfluenceAddendum` and `forwardReadinessAddendum` are absent from `ADDENDA_SPECS` and from ranges 1377–1787 / 1788–2295, so CORE and DEEP always generate without them. |
| A10 | Dormant routes "`/api/sovereign/app/maia` root and `/api/oracle/conversation`" carry superseded headers forbidding new wiring (§IX) | **CONTRADICTED_BY_CURRENT_CODE (half)** | Root route: header present — `app/api/sovereign/app/maia/route.ts:5–7` `STATUS: dormant` / `SUPERSEDED BY: /api/sovereign/app/maia/list` / `SUPERSEDED ON: 2026-05-23`. **`app/api/oracle/conversation/route.ts` has no such header** — grep for `superseded|dormant|deprecat` returns zero, and the file opens `// @ts-nocheck`. It is also **absent from the three-entry route registry** (`lib/maia/maiaRuntimeContext.ts:60–105`: `/list` canonical-live, `between/chat` live-secondary, `/maia` root dormant). Its status is `UNREGISTERED`, not "dormant". See STOP below. |
| A11 | `agent_runs`: zero DEEP turns / 7 days; CORE 645, FAST 198; five distinct member prefixes / 30 days (§IX) | **ADDITIONAL_UNVERIFIED** | Runtime telemetry claim, `evidence_date 2026-07-13`, `referent_binding DEPLOYED_REFERENT_UNBOUND`. Not statically decidable; not admitted as evidence of current behavior. Bears directly on Unit 2 **F-1** (`RUNTIME_BRANCH_UNRESOLVED`) but does not resolve it. |
| A12 | `origin_route` label originates from the list route's own meta stamp at `list/route.ts:235` (§IX) | **CORROBORATED (substance) / line drift** | The stamp exists but at `app/api/sovereign/app/maia/list/route.ts:1435` — `originRoute: '/api/sovereign/app/maia/list'` (see also the file-header note at `:6`). Nothing at `:235`. Substance holds; cite the current line. |
| A13 | `MAIA_USE_CLAUDE_CONSULTATION` gates the DEEP consultation lane, off by default (§IX) | **CORROBORATED** | Gate at `maiaService.ts:2082–2085`; independently established as Unit 2 **F-3**. Production value remains environment state → unresolvable under STATIC ONLY. |
| A14 | `/api/between/chat` is Tier-2 live-secondary with an unresolved consent question (§IX) | **OUT_OF_SCOPE** | Registry status `live-secondary`, `callsMaiaResponse: false` (`maiaRuntimeContext.ts:60–105`) — recorded from the registry only. §IX-A forbids traversal; not followed. |
| A15 | §V six-step fix sequence; §VI drift canaries (§V, §VI) | **OUT_OF_SCOPE — prior design, not adopted** | Recorded as history under §XIX. Steps 1–3 and 5 are demonstrably implemented at the bound SHA (A1, A2, A4). Step 4 was audited (A5/A6). Step 6 is a production-verification claim = A11. **No recommendation from §V is adopted or carried forward.** |

---

## DOC B — Memory Substrate Divergence Map (2026-05-23)

| # | Claim (doc §) | Verdict | Source backing at 52a3b92 |
|---|---|---|---|
| B1 | Active substrate inventory — 12 modules (§1) | **CORROBORATED (existence only)** | All 12 paths present in `git ls-tree` at the bound SHA. "ACTIVE" markers are the doc's own assertion and are NOT admitted; `lib/maia/memoryOrchestrator.ts`, `memoryAtomsLoader.ts`, `memoryHealth.ts`, `memoryLoaders.ts` are independently confirmed active on `/list` by Unit 1 C1–C7. `MemoryPalaceOrchestrator` / `SessionMemoryServicePostgres` / `spiralStatePersistence` are NOT consumed by `/list`. |
| B2 | Backend service layer `app/api/_backend/src/**` orphaned by the Next.js migration (§2) | **ADDITIONAL_UNVERIFIED** | Tree present (`controllers/memory.controller.ts`, `routes/*.routes.ts`, etc.). "Completely bypassed" is a negative claim over the whole tree that was not re-derived here — verifying it would require the general contributor census this unit is forbidden to open. |
| B3 | Nine `lib/consciousness/memory/*` services "unmapped / underutilized" (§2) | **ADDITIONAL_UNVERIFIED** | All nine files present. None appears in the `/list` continuity path (Units 1–2 enumerate that path exhaustively), so the claim is consistent with admitted evidence, but "unmapped" tree-wide was not proven here. |
| B4 | **`app/api/oracle/conversation/route.ts` is the SOLE SUBSTANTIVE CONSUMER of the memory substrate** (§3) | **CONTRADICTED_BY_CURRENT_CODE** | `git grep -l` over `app/` at the bound SHA: `buildMemoryInfluencePlan` → 4 routes incl. `/list`; `loadMemberMemoryAtomsForPrompt` → 3 incl. `/list`; `buildMemoryHealth` → 3 incl. `/list`; `buildMemberLiveContext` → 2 incl. `/list`; `loadRecentDevelopmentalMemories` → 4 incl. `/list`; `scrubMemoryAmnesia` → 2 incl. `/list`. `/api/sovereign/app/maia/list` imports six of the eight listed symbols directly. Only `memoryPalaceOrchestrator` and `sessionMemoryServicePostgres` remain exclusive to oracle/conversation. The choke point described in 2026-05 no longer holds. |
| B5 | Seven memory-named routes are "impoverished / unmapped" (§4) | **ADDITIONAL_UNVERIFIED** | All seven route files present. Their mapping status was not re-derived — doing so is the general contributor census this unit is barred from. |
| B6 | Four secondary consumers "rely on oracle" without importing substrate (§5) | **CONTRADICTED_BY_CURRENT_CODE (for `between/chat`) / OUT_OF_SCOPE (rest)** | `app/api/between/chat/route.ts` appears in the `git grep -l` result set for `buildMemoryInfluencePlan`, `loadMemberMemoryAtomsForPrompt`, `buildMemoryHealth`, and `loadRecentDevelopmentalMemories` — it **does** import substrate directly, contradicting §5's premise. Recorded from the symbol index only; the route was **not opened** (§IX-A). `maia/chat` and `ask-maia/ask` not examined. |
| B7 | Restoration Path Phases 1–4 (§6) | **OUT_OF_SCOPE — prior design, not adopted** | Repair/consolidation proposal. §XIX bars adoption. Recorded as history only; explicitly **not** carried forward. |
| B8 | Legacy: `lib/memory/beads-sync/`, `lib/memory/mem0.ts` (§2) | **CORROBORATED (existence only)** | Both present at the bound SHA. Phase/legacy labels not verified. |

---

## THE SIX SPECIFIC QUESTIONS

**1. Did they already identify FAST / CORE / DEEP divergence?**
Doc A: **YES, in kind.** §II–§III name the three tiers and state that per-tier extraction
is required, that FAST and CORE reach the prompt while DEEP does not, and §VI names the
exact drift mechanism ("add a `*Addendum` to `meta` without adding it to a tier extractor").
That mechanism is the direct ancestor of Unit 2's C6/C7 FAST-only finding.
Doc A did **not** identify the divergence in its current form: it did not identify the
`contextPrompt` second FAST channel (Unit 2 C8), the `ADDENDA_SPECS` membership gap for
`memoryInfluence`/`forwardReadiness`, the `adaptResponsePromptWithPolicy` rewrite, the CORE
bypass guards, or the differing relationship-memory load depths (5/2 vs 10/5).
Doc B: **NO.** It contains no reference to processing profiles at all; it is a module/route
inventory, not a path analysis.

**2. Do they describe the DEEP-primary prompt-seam problem?**
**YES — Doc A §II.C and §IX, and this is the documents' single strongest contribution.**
§IX states the finding in nearly the same words Unit 2 derived independently: the local
draft machine produces output by template weaving and *has no prompt seam by construction*.
Verified: `lib/orchestration/consciousness-orchestrator.ts` contains zero `systemPrompt`
occurrences. Unit 2 reached the identical conclusion from `consciousnessContext`
(`maiaService.ts:2034–2043`) without having read this document. **Two independent
derivations agree.** Doc B is silent.

**3. Do they describe CORE prompt rewriting?**
**NO.** Neither document mentions `adaptResponsePromptWithPolicy` (`maiaService.ts:1684`)
or any wholesale rewrite of the assembled CORE prompt. Unit 2 **F-4** remains open and
receives no corroboration, no contradiction, and no prior analysis from either document.
Doc A §VIII.2's claim that the refactor left "FAST+CORE behavior preserved — same ordering,
same log markers" is a claim about the *helper* refactor only and says nothing about the
downstream policy rewrite.

**4. Additional continuity contributors or assembly sites not enumerated by Units 1–2?**
Contributors: **none.** Every named addendum in Doc A is inside the 24-entry
`ADDENDA_SPECS` or the FAST template already enumerated by Units 1–2.
Assembly sites: **none new inside `/list`.**
Two items outside Units 1–2's enumeration:
- `lib/consciousness/consciousness-layer-wrapper.ts:126, :224` — the delegation hop from
  `consciousnessWrapper` to `consciousnessOrchestrator.processRequest`. This **resolves the
  first hop of Unit 2 F-6** and is not a new assembly site (no prompt seam below it).
- **`app/api/oracle/conversation/route.ts`** — a substantive memory-substrate consumer,
  unregistered and unheadered. See STOP.

**5. Was any claimed repair or design previously proposed or implemented?**
**YES, extensively.** Doc A §V proposes a six-step fix sequence; §VIII and §IX record steps
1–5 as executed. Independently verified as present at the bound SHA: the shared helper
(`maiaVoice.ts:489`), its two call sites (`:913`, `:1045`), and atoms end-to-end
(`ADDENDA_SPECS:429` + 9 `maiaService.ts` occurrences). Doc B §6 proposes a four-phase
restoration path; **no evidence of its execution was sought or found** — Phase 4's
"choose spiralStatePersistence vs memorySpiral" is unresolved at the bound SHA since both
`lib/consciousness/spiralStatePersistence.ts` and `app/api/_backend/src/lib/memorySpiral.ts`
still exist. Per §XIX and this unit's hard limits, **no prior design recommendation from
either document is adopted, and none is proposed.**

**6. Does canonical code at the bound SHA still exhibit each documented condition?**
- Doc A §II.A (atoms inert) — **NO longer exhibited.** Repaired.
- Doc A §II.B (DEEP addenda inert) — **NO longer exhibited for the repair path**
  (`maiaVoice.ts:1045`); the underlying `intelligentVoiceAdaptation.ts` blindness is
  **still exhibited** (zero `Addendum` occurrences) but is now routed around.
- Doc A §II.C (DEEP-primary unaudited) — **audited and confirmed**; the condition
  (no continuity on DEEP-primary) is **still exhibited**, now by construction rather than
  by oversight.
- Doc A §I / §VI (per-tier wiring, drift canary) — **still exhibited for FAST**, which has
  no generic iteration and is the only holder of C6/C7/C8.
- Doc A §IX's closing claim (no seam without recall) — **not exhibited; contradicted** (A9).
- Doc B §1/§2 inventory — **still exhibited** as file existence.
- Doc B §3 (oracle choke point) — **NO longer exhibited**; contradicted (B4).
- Doc B §4/§5 — **unverified**, deliberately.

---

## CORRECTIONS TO UNITS 1–2

**None.** No claim in either document overturns an independently established Unit 1 or
Unit 2 finding. Where they disagree, the documents are the stale surface:
- Doc A's "atoms never extracted" is dead; Unit 1 C3 stands.
- Doc A's "20 addenda" is dead; Unit 2's 24 stands.
- Doc A's three-contributor consultation lane is an undercount; Unit 2's four stands.
- Doc A's `maiaService.ts:1964` DEEP-primary call site is dead; Unit 2's `:2052` stands.
- Doc B's oracle choke point is dead; Units 1–2's `/list`-centred topology stands.

**Two refinements (additive, not corrective):**
- **R-1** — Unit 2 **F-6** advances one hop. `consciousnessWrapper` delegates to
  `consciousnessOrchestrator.processRequest` (`consciousness-layer-wrapper.ts:126, :224`),
  and that orchestrator has **zero** `systemPrompt` occurrences. Unit 2's narrow claim
  ("the route's contributors are not passed to it") is now supplemented by: no prompt seam
  exists one level below either. Whether the orchestrator performs *its own retrieval* is
  still untraced — F-6 narrows, it does not close.
- **R-2** — `consciousnessOrchestrator` is imported at `maiaService.ts:7` and never called
  there. A dead import that makes the DEEP call chain look one hop shorter than it is.
  This is exactly the §IV `SURFACE_SUBSTITUTION` shape that produced Doc A's wrong
  `:1964` citation. Recorded as a reading hazard for any future unit.

---

## WHAT THE DOCUMENTS ADD THAT UNITS 1–2 MISSED

1. **Independent confirmation of the DEEP-primary seam absence** from a different surface
   (the orchestrator's own construction) and a different date. Units 1–2 derived it from
   `consciousnessContext`; Doc A derived it from the 10-stage weaving pipeline. Convergent.
2. **A causal history for the C6/C7 asymmetry.** Doc A §VI predicted, in 2026-05, precisely
   the drift that Unit 2 measured in 2026-08. The asymmetry is a known, named, documented
   failure mode with a stated doctrinal bar ("a channel is not added until every active
   tier explicitly extracts and injects it") that FAST still fails to meet.
3. **A documented over-claim.** Doc A §IX's authorized claim (A9) is contradicted by the
   CORE bypass guards. The document is the current "single honest source of truth for what's
   reaching prompts" by its own §VIII declaration — and it is wrong at the bound SHA.
4. **`app/api/oracle/conversation/route.ts`** as a substantive memory-substrate consumer
   that neither Unit 1 nor Unit 2 enumerated and that the route registry does not contain.
5. **Runtime traffic shape as unadmitted context** (A11): CORE 645 / FAST 198 / DEEP 0 over
   seven days at 2026-07-13. Not admitted; recorded because it bears on F-1's eventual
   resolution under §XXVII authority.

---

## STOP STATE

### `STOPPED_UNENUMERATED_ASSEMBLY_SITE` — `app/api/oracle/conversation/route.ts`

Raised by Doc B §3 and partially mischaracterized by Doc A §IX. At the bound SHA this route:
- imports the memory substrate directly, including two modules
  (`memoryPalaceOrchestrator`, `sessionMemoryServicePostgres`) consumed **nowhere else**
  in `app/`, plus `buildMemoryInfluencePlan`, `loadMemberMemoryAtomsForPrompt`,
  `buildMemoryHealth`, `buildMemberLiveContext`, `loadRecentDevelopmentalMemories`,
  `scrubMemoryAmnesia`, `spiralogic-core`;
- carries **no** superseded/dormant header (unlike `app/api/sovereign/app/maia/route.ts:5–7`),
  contradicting Doc A §IX;
- is **absent from the route authority registry** at `lib/maia/maiaRuntimeContext.ts:60–105`
  → `route_status: UNREGISTERED`;
- opens with `// @ts-nocheck`.

Per this unit's hard limits it was **not traced**. Whether it contains a prompt assembly
site, whether it is reachable in production, and whether its `spiralogic-core` /
`PanconsciousFieldService` imports constitute a fourth context architecture are all
**open and unexamined**. Its unregistered status is itself the finding: a substantive
memory consumer sits outside the surface the registry claims to enumerate.

### Also recorded, not stopped on
- `app/api/between/chat/route.ts` imports memory substrate directly (B6), contradicting
  Doc B §5. Recorded from the symbol index; route **not opened** (§IX-A).
- Unit 2 **F-4** (`adaptResponsePromptWithPolicy`) receives nothing from either document
  and remains the largest untraced transform.
- **F-1/F-2/F-3** unchanged: `RUNTIME_BRANCH_UNRESOLVED`, `MAIA_SAFE_MODE` and
  `MAIA_USE_CLAUDE_CONSULTATION` production values remain environment state.

### Discipline
No repair proposed. No prior design adopted. No file in `/Users/soullab/MAIA-SOVEREIGN`
modified — all source read via `git show <SHA>:<path>` / `git ls-tree` / `git grep <SHA>`.
No runtime witness. No `between/chat` traversal. No MFR-001 or frontier material touched.
Census not broadened. Both documents remain **corroborative evidence only**; no Unit 1–2
finding was overwritten by either.

**Unit disposition: `UNIT_COMPLETE` with `STOPPED_UNENUMERATED_ASSEMBLY_SITE` reported.**
