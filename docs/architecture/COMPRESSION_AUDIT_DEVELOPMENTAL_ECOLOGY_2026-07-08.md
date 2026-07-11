# Compression Audit: Developmental Ecology Candidate Against Existing Architecture

**Date:** 2026-07-08
**Status:** Evidence-gathering for the generative-power test (`feedback_boundary_justification_three_powers` — power 3). Not a ratification.
**Method note:** This audit is grounded in canon + `CLAUDE.md` + session memory descriptions of each artifact, **not** in a fresh read of every implementation. Findings that turn on implementation detail (marked ⚠️ **verify-in-code**) must be confirmed against current source before being treated as established. This honesty is load-bearing: an audit that trusts its own descriptions can manufacture the result it wants.

---

## The candidate set under test

1. **Configure ecologies, never beings** (left/ecological may be configured; identity/meaning/worth/consciousness/personhood may not)
2. **Encounter as primitive** (Presence → Encounter → Participation → Development → Contribution)
3. **Stable beings, configured participation** (the participants are preserved whole; only the participatory conditions among them change)
4. **Authority terminates before personhood** (the platform's jurisdiction ends at the edge of the person)
5. **Recognition vs interpretation** (member-marked recognition is admissible; system-inferred interpretation of the person is not)

## Classification key

- **Type A** — the artifact *contradicts or falsifies* the candidate (a live surface configures a being, or asserts authority over personhood, or persists an interpretation as if it were recognition).
- **Type B** — the candidate explains the artifact *partially*, but a **different constitutional family** is doing the real load-bearing work.
- **Type C** — the artifact is **outside this candidate's jurisdiction** entirely (correctly — a healthy boundary excludes as well as includes).
- **Hold** — the candidate explains it cleanly, with no exception.

**The test the set must pass:** exceptions should classify as **B or C** (specialization / correct exclusion). **Type A is the only outcome that falsifies.** A set that produces zero Type A *and* a coherent story about where its jurisdiction ends has generative power. A set that "explains everything" has failed a different way — it has become unfalsifiable.

---

## FAILURES FIRST — Type A and the sharpest strains

### A-1 ⚠️ verify-in-code — `member_spiral_state` (Bridge D: Spiral State Persistence)

- **What it does:** persists per-member `dominant_element`, `phase`, `motion`, `intensity`, **`relational_phase` (1=orientation…4=seasonal return)**, **`autonomy_streak`**, `return_count`. Read at conversation start; fire-and-forget write. Purpose: anti-regression — don't treat a returning member as brand-new.
- **Which principle:** tests 1, 5.
- **Where it holds:** `dominant_element` / `phase` / `motion` are plausibly *structural position within the encounter ecology* — participation-state, not personhood. Under that reading it is principle-3 configured participation, and holds.
- **Where it strains:** `relational_phase` and `autonomy_streak` read as **a persisted, system-inferred measure of the person's developmental level** — precisely the right-hand column of the sovereignty table ("developmental level — never configure/measure/infer"). And it is *inferred from conductor hysteresis*, i.e. **interpretation, not member-marked recognition** (principle 5). If those columns feed anything the member is treated *as*, this is **Type A**.
- **Classification:** **Type A — code-confirmed, but latent (dormant-route).** VERIFIED 2026-07-08:
  - **Response-shaping is real.** `app/api/oracle/conversation/route.ts:1673` calls `decideRelationalHint({ …, persistedState: spiralState })` with the *full* persisted state. In `lib/relational/relationalStance.ts:114-118`, `relational_phase >= 4` forces stance `SEASONAL_RETURN`, and `autonomy_streak >= 3 || relational_phase >= 3` forces `RELEASE` (holdLevel 0.2, brevity 0.8 — "diminish centrality"). Output `stance/holdLevel/returnPowerLevel/brevityLevel` shapes tone and structure of the reply. So by the rule ("affects response-shaping, tone, or developmental interpretation → Type A"), this **is Type A**: a *system-inferred* developmental read (never member-marked) shaping treatment. Violates **principle 5** (recognition vs interpretation).
  - **But it does NOT violate principle 1.** It configures MAIA's *stance/expression* (left-column participation), never the person. And its intent is sovereignty-serving — `RELEASE` exists to *diminish MAIA's centrality* and return authorship. Benign intent does not cure the principle-5 defect (the platform still infers "this person is autonomous / in seasonal return" and acts on it unbidden), but it is not a personhood-configuration.
  - **Liveness caveat (decisive for severity).** `decideRelationalHint` appears in **exactly one route** — `oracle/conversation` — which `CLAUDE.md` documents as **~zero live traffic**. The live MAIA path (`app/api/sovereign`, `lib/sovereign`) consumes **none** of `relational_phase`, `autonomy_streak`, `relationalStance`, or the four classifiers (grep-verified empty). On the live path these fields are **persisted-but-unused** → a **watch-item**, not an active violation.
  - **Net:** **Latent Type A** — same category as A-2/A-3: a genuine principle-5 violation present in code, quarantined to a dormant route, not currently reaching production members. The candidate set correctly flagged a real drift; the codebase has not (yet) shipped it on the live path.

### A-2 — `ConsciousnessEvolutionService` ("level increased")

- **What it does:** dormant service (Cat 4) whose vocabulary asserts a person's consciousness *level rose*.
- **Where it strains:** naming a person's consciousness level is the ontological right-column, twice over (consciousness, worth).
- **Classification:** **Type A — latent, already quarantined.** Crucially, the architecture *already* flagged it for rename→`DevelopmentalTrajectoryService` + "strip 'level increased'." So the candidate set does not discover a new violation here — it **agrees with a judgment the system already made on other grounds.** That convergence is weak-but-real generative evidence: the principle predicts the exact quarantine the project independently chose.

### A-3 — `AchievementService`

- **What it does:** dormant; would measure/optimize the person via achievements.
- **Classification:** **Type A — latent, already gated** ("Later; reframe as practice"). Same shape as A-2: the candidate co-signs an existing "hold." Confirmation by prior quarantine.

### A-4 ⚠️ verify-in-code — Spiralogic cell inference (What Now? holoflower)

- **What it does:** `inferSpiralogicCell` assigns a single cell at ~0.7 confidence to tint the holoflower; client-only, never in the prompt, not persisted about the person.
- **Where it strains:** assigning a cell *is* interpretation (principle 5), and a single confident cell is Drift 4 (confidence replacing curiosity) from the Companion.
- **Classification:** **Type B, not A** — because it is **contained**: cosmetic, non-persisted, non-authoritative. It interprets a *moment's* tint, not the *person's* identity, and nothing downstream treats the member as that cell. The candidate explains why this containment is exactly what keeps it legal. Had the cell been persisted as "the member's element," it would be A-1's sibling.

---

## Type B — candidate explains partially; another constitutional family carries the load

### B-1 — Sanctuary Mode

- Principle 3 explains the *participation condition* ("this encounter is not remembered"). But the **absolute, no-exceptions, not-even-by-user-request** boundary is the **Consent/Custody family**, not this candidate. The candidate could not, by itself, generate Sanctuary's *absoluteness*. **Needs: Memory-Consent vow.**

### B-2 — Atoms return-preference gate · breakthrough `is_breakthrough` flag

- Hold cleanly under **principle 5** (member-marked recognition; default private; opt-in) and **principle 1** (configures whether a memory *participates*, never the person). Strong confirmations. But their *default-private* posture co-roots in the Consent/Custody family. **B, leaning Hold.**

### B-3 — Constitutional Direction of Authority (Invariant 16)

- Principle 4 ("authority terminates before personhood") is a *special case* of Direction of Authority's upward-only rule — but Direction of Authority is the **broader Authority-Flow family** (layers, upward-only, no manufactured higher-order meaning). Principle 4 does not generate it; it is generated *by* it. **Needs: Authority-Flow family.** This raises a minimality question below.

### B-4 — Corpus Callosum substrate

- Configures *MAIA's internal participation* (8 voices, selective integration) — principle 3 at the level of MAIA's cognition, not the person. Holds loosely, but its real content (epistemic integration, WisdomRouter selectivity) belongs to an **Epistemic-Integration family** the candidate says nothing about. **B.**

---

## Type C — correctly outside jurisdiction (the honest exclusions)

These are the artifacts that make the audit trustworthy: the candidate set **should not** explain them, and does not.

- **C-1 — Provider governance** (`check:no-openai`, `check:no-supabase`, Claude-core, local-embeddings). Family: **Provider Sovereignty.** The candidate has nothing to say about which model serves an encounter.
- **C-2 — Self-hosting** (minisforum, Caddy, local PostgreSQL, air-gap capability). Family: **Infrastructure/Data Custody.**
- **C-3 — Members / cross-device recognition** (username/passkey identity resolution). Family: **Identity & Auth.** (Note: *recognition* here means "same account," not principle-5 developmental recognition — a naming collision worth flagging, not a strain.)

None of these strain the candidate. They are simply governed elsewhere. A candidate that tried to absorb them would be overreaching.

---

## Clean holds (confirmations)

- **H-1 — Daily Anchor surface-preference gate (LIVE):** principle 1 + 5. Member opt-in configures whether the anchor *participates*; MAIA follows consent. Textbook.
- **H-2 — Living Field Mirror Invariant (never synthesis):** principle 5, in its purest form — MAIA reflects recognition, never manufactures meaning. The candidate *predicts* this invariant.
- **H-3 — Co-Lab boundary checks (31/31 gate):** principles 3 + 4 — configures roles, scopes, DMs, session boundaries (participation + jurisdiction), never the persons in them.
- **H-4 — Session Room (canonical 1:1):** principle 2 — a place built *around the encounter* as the unit.
- **H-5 — Right to Remain Unpossessed / Recognition Integrity:** principles 1 + 5 — no typology capture; recognition is the member's. Direct confirmations.

---

## Verdict

**Coverage (15 artifacts):** Type A: 2 live-conditional (A-1 ⚠️, A-4→B) + 2 latent-already-quarantined (A-2, A-3). Type B: 4. Type C: 3. Hold: 5.

**Does the set compress the built architecture?** *Partially, and honestly.*

1. **Generative signal is real but modest.** The set predicts the project's own quarantines (A-2, A-3) and its purest invariants (H-2, H-5) without being told to — the shape appearing where we didn't put it. That is genuine, if weak, generative evidence.

2. **One live falsifier-candidate, unresolved.** **A-1 (`relational_phase` / `autonomy_streak`)** is the audit's real yield. Until code-verified, the candidate's standing is *conditional*: if those fields shape how a member is treated, principle 5 (and the sovereignty table) is **contradicted by a shipped surface** — which is more valuable than any confirmation, because it is actionable.

3. **The set is not minimal.** **Principle 4 collapses toward principle 1** (both are "jurisdiction ends at the person"), and principle 4 is itself downstream of the Authority-Flow family (B-3). A future pass should test whether 1 and 4 are one principle stated twice. (This is the Companion↔Methodology-style seam risk applied to the set itself.)

4. **The candidate is one family among several — as it should be.** The audit surfaces at least four constitutional families the candidate **does not** subsume: **Consent/Custody** (B-1, B-2), **Authority-Flow** (B-3), **Epistemic-Integration** (B-4), **Provider/Infrastructure Sovereignty** (C-1, C-2). "Configure ecologies, never beings" is not the theory of everything. It is the theory of *the person↔platform jurisdiction* — and it holds cleanly *there*.

**Conclusion.** The candidate set earns a step toward standing on explanatory + early-generative grounds, **conditional on resolving A-1.** It does **not** earn totalizing status, and its Type C exclusions confirm it should not seek it. Recommended next: (a) code-verify A-1 and A-4; (b) test the 1↔4 minimality collapse; (c) name the four sibling families explicitly so the candidate stays in its lane.

---

## Resolution of A-1 (2026-07-08)

**Decision (Kelly):** do **not** delete the fields — they retain diagnostic/audit value. Do **block** them from response-shaping. Guardrail principle:

> Persisted developmental inference may inform aggregate reflection, but may not directly determine MAIA's stance, tone, brevity, holding level, or return-power **unless the member has marked, consented to, or actively invoked that frame.**

The boundary, as a table (constitutional, not implementation detail):

| Allowed | Blocked |
|---|---|
| Persist inferred developmental observations | Use inferred developmental observations to shape responses |
| Aggregate reflection | Personalized stance selection |
| Administrative summaries | Tone, brevity, holding level, relational release |
| Current in-encounter observation | Persisted developmental inference |

The load-bearing distinction (what Principle 5 protects): **reading what is happening in *this* encounter is responsive; assuming a developmental stage from accumulated history is interpretive.** The first may shape MAIA's expression; the second may not, unless the member marked or invoked that frame.

Filed as background task `task_06badd89` (supersedes `task_e7f89f7d`). Its verifier is deliberately **class-level, not field-level**:

> **No response-shaping subsystem may consume persisted inferred developmental state unless the source is explicitly member-marked, or produced within the active encounter under an authorized interpretation boundary.**

This guards the *rule*, so it still fires against future fields (`development_level`, `integration_score`, `awakening_phase`, `attachment_style_estimate`, …) — not just today's two. To be closed **before** any live-path activation of relational stance, so the dormant route does not become a regression trap.

**Evidence-record note (for the candidate's standing, not a promotion).** This finding is evidence *against* the earlier worry that the candidate set merely redescribes the architecture. The set predicted (1) *where* a violation would likely exist, (2) *how severe* it is (latent, dormant-route), (3) *why* it is Principle 5 not Principle 1, and (4) *what repair* satisfies the constitution without discarding useful capability. That is predictive + corrective value, a higher bar than explanatory elegance. Still: no promotion on one repair — this accrues to the candidate's record ([`feedback_boundary_justification_three_powers`]). Standing is earned only if the same small set keeps finding independent issues across unrelated surfaces and keeps proposing proportionate repairs.

## Open items

- ✅ **A-1 verified** — code-confirmed Type A on the dormant `oracle/conversation` route (response-shaping via `decideRelationalHint`); live sovereign path consumes none of it. Latent. Guardrail task `task_e7f89f7d` spawned.
- ⚠️ **Verify A-4** — confirm the What Now? cell is never persisted as a member attribute.
- **Minimality** — are principles 1 and 4 the same principle? Fold or keep, with reason.
- **Sibling families** — Consent/Custody · Authority-Flow · Epistemic-Integration · Provider/Infrastructure Sovereignty. The candidate should cite, not absorb, them.
