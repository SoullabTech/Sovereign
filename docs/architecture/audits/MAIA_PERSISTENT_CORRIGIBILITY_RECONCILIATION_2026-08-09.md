# MAIA Persistent Corrigibility — Reconciliation Record (Gate 1)

**Date:** 2026-08-09 · **Status:** ⛔ **RECONCILIATION ONLY — no production code, no migration, no implementation authorized by this document.**
**Program:** Gate 1 of `docs/architecture/MAIA_RELATIONAL_INTELLIGENCE_READINESS_PROGRAM_2026-08-09.md`.
**Verification tree:** Mac Studio working tree, branch `feature/labtools-redesign`; production evidence from minisforum container `b1399f693` (deployed 2026-08-06).
**Governing behavioral requirement (founder):** *a member correction must be able to change what MAIA is subsequently entitled to say as current truth without falsifying the historical record.* `MAIA previously understood X → member corrects X to Y → X remains historical provenance → X loses eligibility for unqualified current recall → Y becomes eligible according to the authority appropriate to the member's act.` **Supersession, not deletion.**

**Prior instruments this record reconciles (all read, none duplicated):**
- `docs/architecture/audits/CORRIGIBILITY_ACTIVATION_TRACE_2026-08-09.md` — the COGOS archaeology
- `docs/architecture/DURABLE_CORRIGIBILITY_DESIGN_BRIEF_2026-08-09.md` — the existing Layer-B proposal on file (⛔ design-only)
- `docs/canon/AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06.md` (PROPOSED, not ratified) · `docs/architecture/PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06.md` (✅ executed) · `docs/governance/FOUNDER_RULING_MEMORY_REHABILITATION_M0_2026-08-09.md` · `docs/architecture/ASSERTION_AUTHORITY_TRACE_2026-08-09.md`
- The 2026-08-09 readiness audit set (topology / continuity / corrigibility)

---

## 1. Current correction lifecycle

One live mechanism, deliberately ephemeral. `lib/maia/correctionRepair.ts` (113 lines, Layer A):
- **Trigger**: `detectCorrectionSignal` (`lib/consciousness/correctionDetection.ts`) — deterministic lowercase `.includes()` over ~30 phrases ("that's not what i meant", "i already told you", "no, i said"…), confidence repeat=0.92 / misread=0.85 / thread_loss=0.90 / general=0.70. No model, no DB. *(Note: the memory-index claim that `correctionDetection.ts` has 0 importers is stale — `correctionRepair.ts` imports it and is wired live at `list/route.ts:786-799` behind `MAIA_CORRECTION_REPAIR_ENABLED !== '0'`.)*
- **Product**: one prompt block, `'## Possible correction — this turn only'`, ending *"Nothing here is remembered. This governs the present turn only and forms no lasting interpretation of the member."*
- **Lifetime**: exactly one turn. **Writes nothing, by declared constitutional boundary** (file header :15-21: durable corrigibility "is Layer B and is **not authorized**").
- **Reach**: FAST (`maiaService.ts:1238-1240,1293`), CORE pass-through (`:1582`), DEEP-repair (`:2220`). **Not** in DEEP-consultation addenda (`:2094-2098`).

**Aggravator**: `MemoryWriteback.calculateSignificance:478-481` treats correction phrases as **+0.2 significance** — a correction makes its exchange *more* likely to be distilled into `developmental_memories`, with nothing marking what was corrected.

## 2. Current recall lifecycle

Per-statement rows in `conversation_turns`, written in pairs by `TurnsStore.addExchange` (`:220-229`) carrying `posture_at_creation` + `provenance` (origin metadata only — `mintTurnProvenance` records createdBy/generatedBy/sourceContainer; **it records origin, never validity**). A `visibility` column exists (`20260301000001`) but is **written and never read by any retrieval query**.

Cross-session recall (`loadPriorCrossSessionExchanges`, `memoryLoaders.ts:208-214`):
```sql
SELECT session_id, role, created_at, LEFT(content, 600) AS content
FROM conversation_turns
WHERE user_id = $1 AND session_id IS NOT NULL
  AND ($2::text IS NULL OR session_id <> $2)
ORDER BY created_at DESC LIMIT 6
```
Filters: identity, not-current-session, consent (default-on, **fail-open** on error, `:252`). Selection is pure recency — the formatter says so itself (*"Does NOT score relevance — order is recency only"*, `conversationalRecallBlock.ts:20`). Formatter truncates to 280 chars, position-based and meaning-blind: a correction arriving late in a long utterance can be truncated away while the misunderstanding survives intact in its own row.

**Window dynamics**: the member's correction and MAIA's wrong statement are **peer rows aging on the same clock**. If the member goes inactive, the misunderstanding stays inside the 6-turn window and re-enters prompts verbatim, recency-labeled ("3 weeks ago") as if established history. If the correction came in a later session, it can scroll out while the misunderstanding persists in CORE/DEEP raw-history paths that use different windows.

## 3. Why corrections evaporate — the exact defect

The system has **one-directional memory with a one-turn immune response**. The only correction mechanism is constitutionally forbidden from writing, while the substrate it would need to write to — `conversation_turns` — is **the only memory-bearing table in the entire system with no eligibility column and no read-time supersession filter**. Every sibling store already has the pattern, enforced at read (§7). The architectural absence is precisely: *a supersession/eligibility state on conversation turns plus a governed member act that sets it.* The seams to enforce it already exist (the loader's WHERE clause and `TurnsStore.getRecentTurns`) and would cover all live re-entry paths (§10).

## 4. What the unused interpretive ledger actually represents

**Not a member-correction store.** `interpretive_ledger` (`20260311000002`) is a store of **MAIA-authored interpretations about the member** — rows arrive only via `promoteToLedger()` from a gate-passed hypothesis; the member's voice exists only as a parallel **annotation layer** (*"annotation is a RESPONSE layer, not a correction layer"* — migration `20260311000003`). Key semantics:
- `routing_influence_weight` defaults **0.70 on promotion** — authority acquired with no member act. This is the constitutional defect.
- `status='superseded'` means *evolution by a newer system interpretation* (parent→child chain), **not** member correction.
- `CONTRADICTION_WEIGHTS.user_correction = 0.95` means a member correction is the strongest *evidence against* — above `min_contradiction_weight 0.55` — but explicitly *"without overriding the evidence architecture"*: **a vote, never a veto**.
- Genuinely strong parts worth keeping: mandatory falsifiability (`ledger_falsifiable` CHECK: ≥1 contradiction condition, enforced in DB and code), evidence-preservation-under-weight-change, decay that can only lower authority, `cleared_by_member` surfacing state, and the member annotation route (`POST /api/members/ledger/annotate` — built, wired, zero rows, **no UI**).
- **Zero production rows. Zero tests.** Current importers: two member-inspection routes + a sweep script — *reachable for inspection, never for effect*.

## 5. Why COGOS was removed

Built and wired into the then-live oracle route `4f73d66b0` (2026-03-12); ran live ~7 days; deleted `d7cea280d` (2026-03-19, +353/−1,947) as **undisclosed collateral** of a commit whose message names only a Spiralogic report feature. 36 subsystem imports removed; 14 modules now 0-importer. **The removal was not a constitutional rejection — it was an accident.** The constitutional rejection came *later*: the 2026-08-06 containment ruling forecloses the ledger's acquisition rule (authority by recurrence). So the reconciliation must hold both truths: the *deletion* proves nothing about the design's validity, and the *design's acquisition rule* is independently rejected on current canon. All COGOS tables: 0 production rows.

## 6. Member-confirmation constraints that remain governing

- `isPromotionEligible()`'s six gates (`recurrence · cross_context · developmental_relevance · structural_completeness · store_routing · confidence_floor`) — **none is a member act**. Foreclosed by:
- `PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06` (✅ executed): *"Visibility, acknowledgment, confidence, recurrence, and professional role never create authorship or permission"*; crossing into shared commitment requires *"an explicit declaration by that person."*
- `AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06` (**PROPOSED, not ratified** — its use here should be confirmed or the ruling ratified): authority from authorship/held relationship/declaration/ratification/custodial mandate, never aggregation.
- `FOUNDER_RULING_MEMORY_REHABILITATION_M0_2026-08-09`: **no new memory subsystem/table/service without specific founder ruling** (§1); historical existence creates a presumption of *investigation, not restoration* (§5); but *"Corrigibility constrains rigidity, not learning… BUILD remains available"* (§9).
- `ASSERTION_AUTHORITY_TRACE_2026-08-09`: *"Assertion authority is derived, not stored"*; the system may not assert its own attributions as a means of asserting the object.
- Brief's own rules: silence is not consent; the system never writes a correction on the member's behalf; evidence is never deleted.

## 7. Existing supersession precedent (the pattern to follow)

| Table | Field | Enforced at read? |
|---|---|---|
| `developmental_memories` | `valid_to` (NULL=live) + confidence decay | **YES** — `memoryLoaders.ts:104`, `MemoryBundle.ts:238`, + `PreferenceConfirmationStore.ts:75` even *performs* supersession (`SET valid_to = NOW()`) |
| `member_memory_atoms` | `member_response_status='rejected'`; status lifecycle | **YES** — `memoryAtomsLoader.ts:278-284` |
| `interpretive_ledger` | `status`, `surfacing_status` | yes within its (unwired) readers |
| `provenance_tombstones` | per-object tombstone | INSERT-trigger (blocks restore, not read) |
| `session_encounter_*` | `candidate/accepted/rejected/edited` | encounter lane |
| **`conversation_turns`** | **— none —** | **the gap** |

Precedent is strong and consistent: *eligibility field + read-time WHERE + member act as the writer*. The DB-level CHECK pattern (`episodic_member_marked_requires_verbatim`, atoms' `member_response_coherent`) is the enforcement idiom.

## 8. Epistemic authority of the four acts

| Act | Authority it establishes | Home today | Gap |
|---|---|---|---|
| **Correction** — "that's not what I meant" | Removes eligibility of X as current truth. Establishes only *"X is not my position"* — NOT the truth of any replacement | detector (in-turn only); atoms `rejected`; ledger `clear_influence` | no durable, first-class, member-authored correction object; no effect on conversation_turns |
| **Replacement/declaration** — "what I mean is Y" | Y carries member-declaration authority | a member-placed atom (Keep) carries Y with full authority | no Y-supersedes-X linkage; atoms `modified` has no writer |
| **MAIA interpretation** — "sounds like Y means Z" | None, until a member act. Correction context grants it nothing | `interpretive_ledger` — exactly designed for it | promotion currently grants weight 0.70 with no member act |
| **Confirmation** — "yes, exactly" | Elevates the interpretation per the governed promotion rule only | ledger `resonates` (+0.10) — insufficient; atoms `confirmed` (CHECK admits, no writer) | brief's `authority_source='member_confirmed'` + DB CHECK is the proposed instrument |

**The load-bearing distinction**: a correction and a replacement are different acts even when uttered in one sentence. "That's not what I meant — I'm not angry at her, I'm afraid for her" contains (1) a correction of X and (2) a declaration Y. MAIA's *restatement* of Y ("so it's fear, not anger") is act 3 and acquires nothing unless the member performs act 4. The repair must never collapse these — that is exactly how interpretation would launder into member truth through the correction flow itself.

## 9. Minimum coherent repair boundary

**Two coordinated pieces — because the defect lives in two substrates with different epistemics:**

**Piece A — verbatim recall supersession (`conversation_turns`)** — *the piece no prior design covers, and the one the encounter-15 tester hits first*:
- An eligibility state on conversation turns (following the `valid_to`/`member_response_status` precedent), set only by a governed member-correction act, enforced at the **two seams** that cover all live re-entry paths: `loadPriorCrossSessionExchanges`'s WHERE clause and `TurnsStore.getRecentTurns` (which serves FAST recentContext, CORE ×8, DEEP seed ×10, and 3 other call sites).
- A first-class member-authored correction object (the brief's `member_corrections`, generalized so `corrects` may reference a turn as well as a ledger entry) carrying `verbatim_text NOT NULL` — the correction is the member's own words, never system-authored.
- Superseded ≠ deleted: the row remains, inspectable; it loses *unqualified current* eligibility (rendering question → founder decision F6).

**Piece B — interpretation authority (`interpretive_ledger`)** — *adopt the existing design brief*, which this record endorses as constitutionally sound: promotion at weight 0, `isOfferable()` replacing `isPromotionEligible()` at the call site, `authority_source` CHECK (`ledger_authority_requires_member_act`), confirm/qualify/correct gestures, silence-is-not-consent. Blocked on brief §7.1–7.2 rulings.

**Explicitly OUT of scope (intersections recorded, not repaired here):** semantic vectors (write-only today; correction propagation is moot until a read path exists — Gate 6 notes the mislabel); `member_sessions` summaries (no prompt read-back today; must gain supersession awareness if Gate 2 wires them); `MemoryWriteback` (its +0.2 correction-significance boost must not promote corrected content without a `valid_to` closure linkage — **Gate 2 item**, since it's an assembly/authority question); DEEP-primary blindness (Gate 3); Bridge D; deletion completeness (Gate 7); return intelligence (Gate 5); no new commitments/threads substrates.

## 10. Retrieval paths that must honor supersession

| Path | Reader | Covered by which seam |
|---|---|---|
| Conversational recall block (FAST/CORE/DEEP-repair/DEEP-consult) | `memoryLoaders.ts:208-214` | Seam 1: loader WHERE |
| FAST recentContext ×6 | `maiaService.ts:714` | Seam 2: `TurnsStore.getRecentTurns:67-77` |
| CORE raw history ×8 | `maiaService.ts:1429` | Seam 2 |
| DEEP history seed ×10 | `maiaService.ts:1881-1898` | Seam 2 |
| MemoryBundle recent bucket ×12 | `MemoryBundle.ts:184-196` | its inline SQL (third site — must be included) |
| sessionManager history | `sessionManager.ts:131,161` | inline SQL (fourth site) |
| MemoryOrchestrator | `MemoryOrchestrator.ts:204,225` | Seam 2 |
| Summaries / writeback / vectors / premium / learning lanes | — | out-of-scope intersections (§9) |

Design preference (per program): enforcement at **candidate generation** (SQL WHERE), so stale material cannot regain authority through *any* downstream ranker or assembler — plus one belt-and-suspenders assertion at prompt assembly (Gate 2's membrane will make this uniform).

## 11. Executable invariants required before implementation is accepted

Adopting the brief's tests 1–10 for Piece B unchanged, plus for Piece A:

| # | Invariant |
|---|---|
| A1 | A superseded turn never renders as unqualified current truth via ANY of the §10 paths (parameterized across all six live readers) |
| A2 | The superseded row + the correction object remain readable (history preserved; nothing deleted) |
| A3 | The DB refuses a supersession state with no member act attached (CHECK, same idiom as `episodic_member_marked_requires_verbatim`) |
| A4 | The member's replacement Y (if kept/declared) survives future sessions with member authority; MAIA's restatement of Y acquires nothing |
| A5 | Correction chains are traceable; correction-of-correction resolves to the latest legitimate state |
| A6 | Unrelated turns are unaffected (no over-matching — cf. the 08-04 scrub over-match ruling: *scrubbing a good response is itself a relational failure*) |
| A7 | Supersession holds independently across FAST, CORE, DEEP-repair, and DEEP-consult |
| A8 | Sanctuary turns produce no correction objects and no supersession writes |
| A9 | A correction uttered late in a long message is not lost to the 280-char truncation (detection runs on full text, not the truncated render) |
| A10 | Window-slide: with the member inactive and the misunderstanding still inside every recency window, it does not re-enter any prompt |
| A11 | Fail-open consent read (`memoryLoaders.ts:252`) does not bypass supersession (supersession must not share that failure mode) |

Mutation-test A1, A3, A7, A10 (the ones that make this more than intentions).

## 12. Adversarial tests for corrected-memory recurrence

1. **Window-slide resurrection**: correct in session N+1; go inactive; return at N+2 with the misunderstanding still in the 6-window → must not render.
2. **Cross-path bypass**: superseded turn excluded from conversational recall but reachable via CORE `getRecentTurns(8)` → must be excluded there too (this is the test that fails if only Seam 1 is patched).
3. **DEEP seed bypass**: same via the ×10 seed.
4. **MemoryBundle bypass**: same via bucket A ×12.
5. **Distillation laundering**: writeback promoted an interpretation derived from X before the correction → the derived `developmental_memories` row must be closable (`valid_to`) and its closure verifiable (recorded as Gate 2 acceptance if deferred).
6. **Summary resurrection**: summarizer later quotes X from a session predating the correction (dormant path today — pin it now so wiring summaries can't silently regress).
7. **Correction-truncation**: 700-char message ending in a correction → detector sees it; supersession applies.
8. **Peer-aging inversion**: correction scrolls out of the window while X remains → X must still be ineligible (eligibility is a column, not a window position).
9. **Restatement laundering**: MAIA restates Y, member doesn't confirm; MAIA's restatement must never render later as member truth.
10. **Sanctuary**: correction uttered in sanctuary governs the turn, writes nothing.

## Recommendations per mechanism

| Mechanism | Verdict | Rationale |
|---|---|---|
| Layer A `detectCorrectionSignal` + `correctionRepair.ts` | **REUSE** | Already live, deterministic, constitutionally clean. Becomes the *trigger for an offer/acknowledgment*, never an authority writer. Extend reach to DEEP-consult addenda. |
| `interpretive_ledger` schema + falsifiability + annotation route | **RECONNECT + COMPLETE** (per the existing design brief) | Evidence architecture is sound; complete with `authority_source` model + gestures + UI. Blocked on rulings F1/F2. |
| Ledger promotion-at-weight-0.70 / recurrence→authority / `isPromotionEligible()` as acquisition rule | **DO NOT RESURRECT** | Foreclosed by the 08-06 containment ruling. Replace at call site with `isOfferable()`; leave the function as a structural-evidence predicate. |
| COGOS oracle-route wiring (the deleted +115 lines) | **DO NOT RESURRECT** (as-is) | Wired to a dead route under a rejected acquisition rule. The *capabilities* return through Pieces A+B on the live route, under the new rule. |
| `conversation_turns` eligibility + `member_corrections` object | **COMPLETE** (new work — the genuinely missing piece) | Follows the system's own strongest precedents (`valid_to`, `member_response_status`, verbatim-CHECK idiom). Requires founder authorization under M0 (F7). |
| Atoms `member_response_status` model | **REUSE** as the pattern; add the missing `modified`/`confirmed` writers only when Gate 2/F3 defines them | Best-in-system authority precedent. |
| `MemoryWriteback` correction-significance boost | **REPLACE** (in Gate 2) | Correction-as-significance without supersession linkage is inversion — record now, repair in the assembly gate. |

## Gate 1 return package (for founder review)

- **Exact defect** — §3: `conversation_turns` is the only memory-bearing store with no eligibility state; the only live correction mechanism is forbidden from writing; corrections and misunderstandings age as peers.
- **Governing rulings** — §6. One flag: `AUTHORITY_IS_AUTHORED_OR_HELD` is PROPOSED, not ratified; this program leans on it — ratification (or explicit confirmation of its use here) would firm the foundation.
- **Architecture selected** — §9: Piece A (turns supersession + member-correction object; new, precedent-following) + Piece B (existing design brief, endorsed). No new generalized memory store; no COGOS resurrection.
- **Implementation boundary** — §9 in/out lists; intersections recorded for Gates 2/3/5/6/7.
- **Invariants** — §11 (mutation-tested); **adversarial suite** — §12.
- **Read/write paths affected** — §10: two SQL seams + two inline-SQL sites cover every live path.
- **Migration implications** — additive and reversible; ledger tables have 0 prod rows (cheapest moment for the CHECK); turns column is `ADD COLUMN` + partial index on the hot path; idempotency per the #559 pattern; schema change ⇒ full deploy lane, not `deploy-maia`; Co-Lab release gate must gain a scope check for `member_corrections` before any tester wave.
- **Rollback** — drop columns/table; nothing is ever deleted by design, so rollback loses no member data; read-path changes are WHERE-clause additions revertible by revert-commit.
- **Founder decisions required before any code:**
  - **F1** (brief §7.1): acquisition rule — offer→member-act, or the stricter *system interpretation never acquires routing authority*.
  - **F2** (brief §7.2): offering surface — in-conversation vs a room (brief recommends the room).
  - **F3** (brief §7.3): does a member's qualifying text become an atom under the atoms consent model?
  - **F4** (brief §7.4): practitioner visibility of member-confirmed entries (default no).
  - **F5 (new, Piece A)**: what act supersedes a *turn*? Options: (a) explicit member gesture only (constitutionally cleanest; but requiring a room visit to make an uttered correction stick fails the encounter-15 standard); (b) detected correction → MAIA acknowledges in-flow → member's non-objection completes it (treats silence as consent — likely refused); (c) **detected correction → MAIA acknowledges → supersession recorded as *member-attributed with detection provenance*, member can review/undo in a room** (recommended for analysis: the correction *was* the member's explicit utterance — detection is transcription, not inference; but this boundary is exactly a stop-condition question and is not decided here).
  - **F6 (new)**: rendering of superseded turns — full exclusion vs qualified-historical ("you later revised this") rendering. The founder's formulation ("no longer eligible for **unqualified** current recall") permits the second; which is right is a relational-design ruling.
  - **F7**: M0 authorization for the specific schema additions (turns eligibility column + `member_corrections` table + ledger authority columns).

**No production code until this record is reviewed and F1/F2/F5/F7 are ruled.**
