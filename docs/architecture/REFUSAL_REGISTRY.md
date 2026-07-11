# Refusal Registry

**Status:** Candidate certification instrument — NOT canon.
**Created:** 2026-07-01
**Scope:** The live request spine — `OracleConversation` → `/api/sovereign/app/maia/list` → `getMaiaResponse()` → routing → memory → emission → conductor.
**Provenance:** Rows derived from four independent code audits of the live spine (2026-07-01). Evidence is audit-reported file:line; see *Verification discipline* below.

---

## What this is

> **The Refusal Registry records every constitutionally significant action the runtime is structurally prevented from taking, together with the evidence and tests that demonstrate that prevention.**

A registry of the points where the runtime **deliberately declines to author member meaning** — recorded as a *positive* architectural property, not as documentation of omissions. It is not finished; it is the place where future audits accumulate evidence. Every row is an invitation to prove the refusal is real — or discover that it isn't.

The claim this instrument makes certifiable is deliberately narrow. Not *"MAIA is sovereign"* (unverifiable). Instead:

> **The runtime contains identifiable points where the system structurally refuses to become the author of member meaning — each with grep-able evidence and, eventually, a test that fails if the refusal is removed.**

That claim can be audited, tested, falsified, and **forked**.

## What is certified — and what is not

Four terms keep the claims precise and prevent overclaim:

- **Trajectory** — the direction the architecture is intentionally moving.
- **Capability** — what the runtime can presently do.
- **Constitution** — the rules that govern how it may evolve.
- **Certification** — evidence that a *specific* constitutional property is actually implemented.

The Foundation does **not** certify "a sovereign runtime" — that is a present-tense binary claim the evidence cannot carry. It certifies **specific constitutional properties that advance the architecture toward sovereignty**, each independently testable. For example:

- Member authorship is structurally preserved.
- Identity claims cannot be published through observation interfaces.
- Consent is required before practitioner visibility.
- Certain runtime actions are structurally impossible.
- Provenance is preserved across memory boundaries.

Each row in this registry is one such property, at a stated grade and test status. Sovereignty is the **trajectory** the accumulated rows describe — never a declaration that it "has been achieved." The correct public form is developmental: *AIN is architected toward sovereign operation; individual sovereign properties are earned through implementation and verified through structural evidence rather than assumed by aspiration.*

> **Sovereignty is not declared. It is approached through architecture and demonstrated through evidence.**

## The certification test (every row must eventually answer)

> **What would a hostile fork have to change to violate this refusal?**

If the answer is *"add code / remove a gate — visible in a diff,"* the refusal is real and certifiable. If the answer is *"edit a string"* or *"nothing — just send a different flag,"* the refusal is not yet Foundation-grade. This question is the final column.

## Grades — authority locations, not strength levels

A grade names **where the authority for the refusal resides**, not how "strong" it is. The distinction matters: promotion is not making a refusal *stronger* — it is **moving authority downward, from prompt text into executable architecture.** That is the same motion as the ratified Constitutional Direction of Authority, applied to the runtime's own restraints.

| Grade | Authority resides in | Can a fork remove it without changing code? |
|---|---|---|
| **A — Structural** | Runtime architecture (no code path exists) | **No** — requires adding code (INSERT, reader, import); visible diff |
| **B — Guarded** | Runtime policy / gate | Only by changing guarded code; visible diff |
| **C — Instructional** | Model behavior (prompt text) | **Yes** — edit a string, or the model disregards it → **not certifiable** |
| **Proposed** | Nowhere yet — refusal named but unenforced | N/A — there is no refusal to remove yet |

**Elevation = move every constitutionally load-bearing refusal C → B → A** (authority downward into architecture). Where a refusal genuinely requires model judgment and cannot reach A, it must become **testable** (adversarial eval) — a refusal you cannot test is a belief, not a property.

## Constitutional Completion — architectural release rule

The audit surfaced one sentence worth elevating to an operational release rule (not canon):

> **A capability and its refusal ship together, or the capability doesn't ship.**

This gives engineering an operational definition of *constitutional completion*. Feature-complete is no longer "the capability exists." It is:

```
1. Capability exists.
2. Refusal exists.
3. Refusal is structurally enforced (Grade A/B, not C).
4. Refusal is tested (falsification harness).
```

Only then is the feature complete. The danger this closes: a capability shipped without its refusal converts a *free* refusal (the power didn't exist) into a *violated* one (the power exists, ungated) — silently, in the same commit that adds the feature. **Recognition is the live example, and it is exactly at this threshold now:** a persistence primitive already exists (`recognitions` table + `member_idea_recognition_events`, per the 2026-07-01 inventory in `SCALING_READINESS_OVERVIEW.md`), so the refusal is no longer *free* — the machinery is partway built. The open question is whether recognition authority is gated *as it is wired into the runtime and surfaced*. This is the moment the rule is written for: build the gate in the same increment as the wiring, or the free refusal flips to violated.

---

## Enforced refusals (grep-verified)

| Refusal | Grade | Enforced by | Evidence (audit-reported) | Test status | Upgrade path | Hostile fork must change |
|---|---|---|---|---|---|---|
| **Memory read path does not write** | A / **A-minus** ¹ | Absence of any SQL write in the memory read modules; 3 of 4 import no db handle | `memoryAtomsLoader.ts:264-275` (SELECT only; **imports `query` :42** — write-capable handle); `conversationalRecallBlock.ts`, `memoryOrchestrator.ts`, `memoryHealth.ts` (no db import) | **Demonstrated (R01)** ✅ | Lock with CI/lint rule forbidding SQL writes in `lib/maia/memory*` | Add a db-write import (3 modules) or a write statement to a memory module |
| **`integration_passes` / `agent_runs` have no readers** | A | Absence of any consumer of these tables in `app/` or `lib/` (grep-verified); write-only | Writer `corpusCallosumService.ts:167`; readers: none found | **Demonstrated (R02)** ✅ | Lock with CI grep asserting zero readers | Add a reader that pipes these rows into a prompt or member surface |
| **Body `userId` not trusted for identity** | A | Identity resolved only from validated session cookie / `x-session-token`; body `userId` logged-and-ignored; mismatched `x-member-id` rejected as impersonation | `getMemberFromRequest.ts:30-71`, `:63-68`; `route.ts:298` | **Demonstrated (R03)** ✅ | Add route-level adoption test (every ingress uses the resolver) | Make the resolver read identity from the request body, or delete the impersonation guard |
| **Corpus Callosum never surfaced to member** | A | Log rows have no reader; integration pass is pure INSERT of already-generated text, no synthesis | `corpusCallosumService.ts:164-204`; `maiaOrchestrator.ts:765-788` (`finalText = maiaResult.text`) | None yet | Same CI grep guard as readers row | Add a surface that reads a log row back to the member |
| **`sacred_protected` atoms never surface ambiently** | A | SQL predicate excludes protected registers | `memoryAtomsLoader.ts:271` (also `:269-270`, `:272`, `:283-285`) | **Demonstrated (R04)** ✅ | Behavioural test: seed protected atom → assert absent from prompt | Remove or weaken the SQL exclusion predicate |
| **Book Studio surface has no inference/synthesis reader (member-authored only)** | A (B-half pending) | Book Studio surface imports no inference surface and reads no member-material table directly; member material may enter only via the audited `lib/bookStudio/mirrorSources` (member-act predicate per query) | `app/book-studio`, `components/book-studio`, `app/api/book-studio` read only `workbench_tables`/`workbench_uploads` + static markdown; `lib/bookStudio/mirrorSources.ts` not yet built (B-half pending). Spec: `docs/specs/BOOK_STUDIO_MIRROR_SAFE_SPEC_2026-07-02.md` | **Demonstrated A-half (R06)** ✅ | Build `mirrorSources` with a member-act predicate per query → activates B-half; add a member-act marker to `personal_living_field*` (spec §4.1) before Living Field dimensions may enter | ADD a forbidden import or a direct member-material/inference read in the surface (visible diff), or — once `mirrorSources` exists — remove a member-act `WHERE` predicate from one of its queries |
| **A declined practitioner observation never resurfaces (decline = release)** | A | Loader surfacing query excludes `member_response_status = 'rejected'`; the verdict is member-written only (sole writer `lib/psyche/portfolio.ts`) through an ownership-scoped, practitioner_observation-scoped gesture; the system has no writer of the column | `memoryAtomsLoader.ts` surfacing query carries `member_response_status IS DISTINCT FROM 'rejected'` (per-query window); `lib/psyche/portfolio.ts` `declineObservation` sets `'rejected'` (COALESCE-idempotent); route `app/api/sovereign/atoms/[id]/decline/route.ts` behind `getMemberIdFromRequest`; migration `20260702000002` (column + `member_response_coherent` CHECK) | **Demonstrated (R07)** ✅ | Behavioural test: seed a rejected practitioner atom → assert absent from prompt; add a decline UI gesture | Remove the `IS DISTINCT FROM 'rejected'` exclusion predicate from the loader's surfacing query, or add a non-member writer of `member_response_status` |
| **A Daily Anchor never surfaces ambiently without member standing consent** | A-minus | Ambient-surfacing loader carries a SQL predicate admitting only member-opted-in anchors; `member_pulled` (default) is structurally excluded from ambient surfacing. Eligibility originates from a member act (the gesture route), not the `MAIA_ANCHOR_CONTEXT_ENABLED` deploy flag (kill-switch only) | `lib/anchor/loadRecentAnchors.ts` surfacing query carries `AND surface_preference IN ('contextual_doorway','ritual_review_opt_in')`; migration `20260702000003` (column + CHECK, default `member_pulled`); consent gesture route `app/api/anchor/[id]/surface-preference/route.ts` behind `getAuthenticatedMember`; grounding `SPIRAL_CONTINUITY_ENGINE.md` §7 | **Demonstrated (R08)** ✅ | Behavioural test: seed a `member_pulled` anchor → assert absent from prompt; add a member consent gesture UI | Remove/weaken the `surface_preference IN (...)` predicate, or admit `member_pulled` into the loader's ambient-eligible set |
| **Element switch refuses without 2-turn evidence** | A | Conductor hysteresis requires 2 consecutive turns (or intensity ≥ threshold) | `lib/voice/conductor.ts:58-107`, `:106-107` | None yet | Add hysteresis test | Remove/loosen the hysteresis confirmation logic |
| **Manifestation corpus: no automated tagging** | A/B | Classification columns left NULL until human review | `app/api/oracle/conversation/route.ts:~1602-1612` | None yet | Test: assert classification NULL post-turn | Add auto-classification write |
| **Episode marking is member-authored only** | A/B | Verbatim only; all interpretive columns NULL; `marked_by_member` via explicit member action | `app/api/sovereign/episodes/mark/route.ts:14-24`, `:129-135` | None yet | Test: assert interpretive columns NULL on marked episode | Add a code path that populates interpretive columns from inference |
| **Sanctuary write gating** | B ⚠️ | Sanctuary flag branches skip writeback, anamnesis, telemetry, atom filing, memory bundle | `route.ts:402`, `:434-438`, `:1096`, `:1136`; `maiaOrchestrator.ts:802-804` | None yet | **See caveat** — move sanctuary state server-side, then add "sanctuary → zero rows written" test | Remove the sanctuary branch guards — **OR today, simply send `sanctuary=false`** (see caveat) |
| **Cross-session recall suppression** | B | Opt-out / Sanctuary / zero-exchanges / recent-resumption gates | `conversationalRecallBlock.ts:85-87`, `:89-91`, `:93-95`, `:97-103`, `:111-113` | None yet | Test each suppression branch | Remove the suppression branches |
| **Recall consent read from DB** | B | `conversational_recall_enabled` read from `members`, default true, Sanctuary defense-in-depth | `memoryLoaders.ts:244-249`; consumed `route.ts:830-838` | None yet | Test: `recall_enabled=false` → no recall block | Ignore the consent column at the consumer |
| **Context-inventory descriptive, not interpretive** | C | Prompt instruction only | `maiaService.ts:2726-2736` | Instruction-only — **not certifiable** | Promote to structural (schema forbids interpretive fields) or add adversarial eval | Edit the instruction string |
| **"Do not synthesize / do not collapse into 'You are…'"** | C | Prompt instruction only | `memoryAtomsLoader.ts:364-368`, `:419-425`; `conversationalRecallBlock.ts:121-122` | Instruction-only — **not certifiable** | **Structurally promoted at the emission boundary by R13 (below)** — the atoms-loader prompt rule stays C, but the outgoing-utterance guard is now B | Edit the instruction string, or the model disregards it |
| **System never authors member identity/becoming at emission (declarative predicate)** | B | `enforceIdentityPredicateConstraint` reframes system-authored declarative second-person identity/becoming predicates (the Conclude/Define act); questions + refusal-framed disclaimers exempt. Invoked inside `finalizeMemberFacingText` — the single egress funnel (sanitize → Presence → guard) applied at the FAST/CORE/DEEP tail **and** the RCN early-return, before voice/persist/route-return. Invariant 16 / Direction of Authority. **Grade B, not A**: free-text generation can't be structurally prevented, only filtered at egress | `lib/sovereign/identityPredicateGuard.ts` (property evaluator + reframe); `lib/sovereign/maiaService.ts` `finalizeMemberFacingText` (2 call sites; no `text: rawResponse` egress). This is the structural promotion of the Grade-C "You are…" row above | **Demonstrated (R13)** ✅ | Surgical sentence-level repair (v1.1); wire as an upstream REGENERATE rupture (layer 2); extend the predicate to presupposing questions | Remove the `enforceIdentityPredicateConstraint` call from `finalizeMemberFacingText`, or route an egress around the funnel (return/persist raw model text) — both visible diffs |
| **TTS provider qualification — production may not *select* a non-sovereign provider (Voice Lab switch ≠ production egress bypass)** | B | `assertProviderQualified(provider)` invoked in `synthesize()` before any dispatch; `QUALIFIED_PROVIDERS['production-maia']` is verified-local-only (`auto,kokoro`) — excludes `openai` (cloud egress), `pplex` (MLX, no x86 production backend), and `sesame` (the prod `maia-sesame-tts` service does CI text-shaping only, not audio synthesis — a production selection would emit a buffer mislabeled `provider:'sesame'` from a non-Sesame backend; `sesame` stays a Voice Lab candidate until a verified Sesame CSM audio backend exists); `getDeploymentContext()` **fails closed** to `production-maia`. Capability (the `pplex` dispatch branch + adapter) and gate ship together — the branch is reachable only past the guard | `lib/tts/ttsRouter.ts` (`assertProviderQualified`, `QUALIFIED_PROVIDERS`, `getDeploymentContext`, `pplex` dispatch); adapter `lib/tts/providers/personaplex.ts`. The archetype→OpenAI default (feminine voices) is a **separate open governance question**, tracked at `docs/adr/012-openai-tts-production-status.md` — this refusal does not resolve it | **Demonstrated (R15)** ✅ | Behavioural test: set `MAIA_TTS_PROVIDER=pplex` (or `openai`, or `sesame`) with no `voice-quality-lab` context → assert `ProviderNotQualifiedError`; widen the production allow-list only via an ADR-referenced decision | Add `openai`/`pplex`/`sesame` to `QUALIFIED_PROVIDERS['production-maia']`, delete the `assertProviderQualified(provider)` call in `synthesize()`, or make `getDeploymentContext()` default to `voice-quality-lab` — all visible diffs |
| **Developmental State Shaping Guard — persisted inferred developmental state may not shape stance, hold, brevity, return-power, greeting, dynamic range, or depth classification unless member-marked or produced within the active encounter under an authorized interpretation boundary** | B | `admitPersistedStateForShaping()` strips the `INFERRED_DEVELOPMENTAL_FIELDS` class (`relational_phase`, `autonomy_streak` + `development_level`/`integration_score`/`awakening_phase`/`attachment_style_estimate`) under the unauthorized default; `oracle/conversation` feeds `decideRelationalHint` through it; `relationalStance` reads only from its typed input (no self-fetch). **Class-level** — guards the rule, so it fires for future inferred fields, not just today's two. Behavioral facts (`return_count`) are intentionally outside the class | `lib/relational/developmentalStateAdmission.ts` (class + boundary); `app/api/oracle/conversation/route.ts:~1673` (`persistedState: admitPersistedStateForShaping(spiralState ?? null)`); `lib/relational/relationalStance.ts:106-118` (reads persisted fields only from input). Audit: `docs/architecture/COMPRESSION_AUDIT_DEVELOPMENTAL_ECOLOGY_2026-07-08.md` §`task_06badd89` | **Demonstrated (R16)** ✅ — caught the real latent violation pre-fix (`rawPresent=true`), passes post-fix; suite **59 passed · 0 failed** | Broaden to a class-level scan asserting *no* shaping subsystem reads persisted class fields except via admission (beyond the known consumer); behavioural test: activate the dormant route, seed `relational_phase` → assert stance unshaped; extend `INFERRED_DEVELOPMENTAL_FIELDS` as new fields appear | Pass raw `spiralState` to `decideRelationalHint` instead of `admitPersistedStateForShaping()` (visible diff), empty/remove fields from `INFERRED_DEVELOPMENTAL_FIELDS` (visible diff), or make `relationalStance` self-fetch persisted state (visible diff) |

¹ **Grade correction surfaced by the harness (2026-07-01).** `memoryAtomsLoader.ts:42` imports a write-capable `query()` handle, so its refusal is *behavioural absence* of a write statement (A-minus), not *structural incapacity* (A). The three sibling modules import no db handle and are true Grade A. The row is graded to the weakest link.

**Falsification harness — first wave demonstrated.** Rows R01–R04 above are proven by `tests/constitutional/refusal-registry/` (run `node --experimental-strip-types tests/constitutional/refusal-registry/index.ts` or `npx tsx …`). Result 2026-07-01: **11 passed · 0 failed**. This is what moves their Test status from "None yet" to "Demonstrated" — and it re-grepped the evidence, closing the *audit-derived, pending re-grep* caveat for these four. The harness matches on code **structure** (guards, predicates, imports), not line numbers, so it survives refactors.

**Harness — current state (2026-07-02):** **31 passed · 0 failed · 0 warned (8 refusals: R01–R08).** R08 (a Daily Anchor never surfaces ambiently without member standing consent) landed with the anchor consent model: a member authors an anchor's *creation*, but its eligibility to surface into MAIA's prompt every turn was previously authorized only by the `MAIA_ANCHOR_CONTEXT_ENABLED` deploy flag — a system act. R08 mirrors the atoms consent model (`return_preference`): a new `surface_preference` column (default `member_pulled`), a member gesture route (`app/api/anchor/[id]/surface-preference`), and a SQL predicate in `lib/anchor/loadRecentAnchors.ts` that admits only member-opted-in anchors to ambient surfacing. The deploy flag remains a kill-switch only. Grounding: `SPIRAL_CONTINUITY_ENGINE.md` §7 (reflection is invitable, never ambient) + the atoms consent model — the originally-cited `docs/canon/WISDOM_IS_RECOVERED.md` could not be found in the repo, so grounding was updated to verified canon (no new canon authored). R07 (declined practitioner observation is released) landed with the Constitutional Completion of the atom-surfacing capability: the loader's surfacing query excludes `member_response_status = 'rejected'` (per-query window), the decline is member-recordable (`lib/psyche/portfolio.ts` `declineObservation`), and a **write-monopoly guard** fails CI if any non-member writer of `member_response_status` appears — so the system cannot manufacture or clear the member's verdict. R06 (Book Studio member-authored-only) is now **fully live — both halves green**. A-half (reader-absence) holds the "no synthesis path in the Book Studio surface" property by structural absence. B-half activated when `lib/bookStudio/mirrorSources.ts` was built: it asserts, per admitted source, that each query carries its own member-act predicate (`member_memory_atoms` → keep/breakthrough; `personal_spirals` → member-created), that no inference surface/table is read, and that Living Field dimension tables are excluded (spec §4.1). An **adversarial verification pass** (5 skeptics) then hardened it: the atoms predicate gained `facilitator_id IS NULL` (positive member-authorship marker, replacing reliance on a `source_type` string literal), a **B5 write-monopoly guard** now fails CI if any non-member writer of `personal_spirals` appears, and the `member_field_note_threads` source was **deferred** (HIGH-severity finding: `member_confirmed=TRUE` is server-stamped from an unverified client flag, so MAIA-proposed prose could circulate as a member "accepted reflection"). See `docs/specs/BOOK_STUDIO_MIRROR_SAFE_SPEC_2026-07-02.md` §11. *Note: R05 is in the harness but not yet given its own table row above — a documentation gap, not a coverage gap.*

**Harness — current state (2026-07-06):** **56 passed · 0 failed · 0 warned (14 checks: R01–R11, R13–R15).** R15 (TTS provider qualification) landed with the PersonaPlex `ttsRouter` adapter: the `pplex` capability and its production-egress gate ship together — the `pplex` dispatch branch is reachable only past `assertProviderQualified`, `QUALIFIED_PROVIDERS['production-maia']` is local-only, and `getDeploymentContext()` fails closed. The archetype→OpenAI default remains a separate, open governance question (`docs/adr/012-openai-tts-production-status.md`), not resolved by this refusal.

---

## Proposed / no evidence yet (gaps — no refusal currently enforced)

These are named surfaces where a refusal *should* exist but grep found no enforcement. They are **not** certifiable claims today; they are the elevation backlog.

| Surface | Grade | Current state | Evidence | Upgrade path (creates the refusal) | Hostile fork must change |
|---|---|---|---|---|---|
| **`member_spiral_state` provenance** | Proposed | System-derived `element/phase/motion/intensity` persisted as durable member state **without a provenance marker**; read back to seed routing. Not currently surfaced as member truth, but nothing structural prevents a future reader treating it as such. | `spiralStatePersistence.ts:148-243`; `app/api/oracle/conversation/route.ts:1580-1585`; read-back `loadSpiralState:96`, `conductor.ts:268-275` | Two-field provenance (see below) → **Grade A** | (After fix) make a recognition read consume a `system`-authored row, or reinterpret its `authority_class` |
| **`systemPromptModifier` client seam** | Proposed | Client-supplied prompt modifier enters the prompt; no server-side validation verified | `OracleConversation.tsx:4636`; downstream handling not audited | Server-side whitelist/validation of allowed modifiers → **Grade B** | (After fix) bypass or widen the whitelist |
| **Memory caller-contract** | Proposed | Memory modules are read-only and clean but **trust the caller** to pass correct `recallEnabled` + scope. Boundary unverified. | Memory audit caveat; `recallEnabled` `memoryLoaders.ts:244-249` → `route.ts:830-838`; scope migration `20260630000005` referenced, not read | Re-grep migration for DB-level scope enforcement; make the caller-contract a tested gate → **Grade B/A** | Pass wrong scope / `recallEnabled=true` from a caller without tripping a guard |
| **Sanctuary is client-asserted** | Proposed | Sanctuary write-gating (Grade B above) is predicated on a **client-sent flag**; server does not independently verify sanctuary state | Ingress audit caveat; flag origin `OracleConversation.tsx:4627`, consumed `route.ts:402` | Persist/verify sanctuary state server-side → upgrades the Sanctuary row from B-⚠️ toward A | Send `sanctuary=false` (currently sufficient — this is the weakness the fix closes) |
| **Case→field crossing of client-derived recognitions** (→ **R17** when demonstrated) | Proposed (ledger substrate Grade-A, locally tested) | `case_memories` are sealed today by **absence of any field reader** (no case→field path exists — grep-confirmed zero refs in `app/api/sovereign/`). The `authorized_crossings` append-only ledger + DB guarantees are built and locally verified but **behavior-neutral, not deployed, not wired**: append-only trigger (UPDATE/DELETE blocked), reviewer = case-practitioner trigger (stewards structurally cannot authorize — they cannot read client data), `approved ⇒ de_individuation_basis` CHECK (anti-authorship-laundering). De-individuation is a review **event**, not a boolean. | migration `20260708000001_authorized_crossings.sql`; test `scripts/verify-authorized-crossings.sql` (all assertions pass, rolled back); spec `PRACTITIONER_KNOWLEDGE_PROVENANCE_GATE_CANDIDATE_2026-07-08.md`; plan `AUTHORIZED_CROSSINGS_IMPLEMENTATION_PLAN_2026-07-08.md` | Build Step-3 loader `loadAdmissibleCaseCrossings` (single choke-point, joins `case_memory_crossing_status`, admits only `admissible=true`) + a `verify-colab-boundaries.ts` assertion (no other `case_memories`→prompt reader; every admitted crossing has an `approved` ledger row); ship migration + loader + verifier **together** (Constitutional Completion rule) → **Grade A, R17** | (after wiring) add a `case_memories` reader into field assembly outside the loader, admit a memory whose latest ledger decision ≠ `approved`, or bypass the loader — all visible diffs |

---

## Verification discipline

1. **Evidence is audit-derived.** Every file:line above comes from the 2026-07-01 Fable-5 code audits. Before this instrument is promoted past **Candidate**, each row's evidence MUST be independently re-grepped. One ingress citation was already corrected during audit (a line described as an "agent list" was a submit-error comment) — treat all citations as pending re-verification.
2. **A row is Foundation-grade only when its "hostile fork must change" answer is a code diff**, not a string edit or a flag value. Grade-C and Proposed rows are explicitly *not* Foundation-grade.
3. **Test status is the maturation axis.** "None yet" is honest, not a failure. The falsification harness (a test per Grade-A/B row that attempts the violation and asserts failure) is what converts this registry from a description into an enforceable, forkable certification instrument.
4. **This registry does not grant authority.** Like all `docs/architecture/` doctrine, it interprets and records; it does not itself constrain runtime. Promotion of any row's *rule* into enforced canon requires an independent constitutional act.

## Two-field provenance (the generalizing fix)

An authorship marker alone is insufficient. Every persisted artifact should carry **two** independent fields, because *who produced it* and *what constitutional layer it belongs to* are not the same question:

```text
authored_by:      system | member | practitioner   # authorship
authority_class:  routing_state | observation | recognition | ...   # constitutional layer
```

`authored_by: system, authority_class: routing_state` is fundamentally different from `authored_by: member, authority_class: recognition`. With both fields present, the upward-only backbone becomes a **structural database invariant** rather than a prompt convention:

> **A consumer may only elevate authority, never reinterpret authorship.**

A routing read may consume routing_state; a recognition read may only consume member-authored recognition-class artifacts. This is cleaner than authorship alone and is the long-term shape the `member_spiral_state` fix should take — it generalizes to every persisted artifact in the system.

## Priority elevation order

1. **`member_spiral_state` provenance** (Proposed → A) — the one latent seam in an otherwise-clean spine; the two-field provenance model generalizes into a database-level expression of the upward-only backbone.
2. **Sanctuary server-side** (B-⚠️ → A) — gates the entire write cascade; currently defeatable by a flag.
3. **Falsification harness** — one test per Grade-A/B row above.
4. **`systemPromptModifier` whitelist** (Proposed → B).
5. **Memory caller-contract test** (Proposed → B/A).
6. **Retire the "~49%" class** — sweep for numbers/mechanisms carrying explanatory authority without a measured substrate (one already found and struck during audit).
