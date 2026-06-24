# Synthesis Merge-Gate — Accountability Precondition for Member-Facing Synthesis

**Status:** PROPOSED (Designed-tense). Not built, not live.
**Authorship:** Drafted by Claude as the *operational* form of a constitutional invariant that remains Kelly's to author/seal. The spec proposes; doctrine disposes.
**Date:** 2026-06-07
**Center of gravity:** Future. The gate's Clause B triggers only when `narrative_synthesis` (or any integration method that authors member-facing text) is switched on for a real traffic tier. Currently `narrative_synthesis` = 3 rows ever, all BETWEEN — wired, off.
**Origin:** Accountability-topology audit of the Corpus Callosum substrate (2026-06-07), prompted by the Anthropic multi-agent diffusion-of-responsibility finding. Receipts in memory `project_corpus_callosum_substrate_cat6` (correction block).

---

## 0. The diagnosis this gate answers

The audit found MAIA does **not** have a multi-agent synthesis problem. It has a synthesis-**appearance** problem:

- Member-facing answers are **single-authored by MaiaVoice**.
- The "8 voices" are **1 author + 7 classifiers** (MythicAtlas tags `AIR_1::SAGE (65%)`; the five elementals + Shadow emit `resonance detected (0 signals)`, latency ~0).
- `integration_passes` is an **observational/diagnostic trace**, not a synthesis: `final_text` is a classifier status line (`"[Fast] Dominant: earth (0 signals). Active elements: none detected."` — 933 identical), `≠` the served reply (`identical = f`); `tensions_named` is a fixed template every row; `reconciliations` always empty; `coherence_score` 0; `integration_method = 'fast_pattern_match'` on all tiers incl. DEEP.

Therefore the proposed invariant ("agents may contribute, never own") is **untested — not tested-and-passed.** A bridge that has not carried load has not demonstrated capacity. The leverage is to set the load-capacity rule before the first load. Once `narrative_synthesis` is member-facing, retrofitting accountability is much harder than establishing it at the gate.

---

## 1. The invariant this operationalizes (PROPOSED — for Kelly to author into canon)

> Not self-sealed. Proposed wording for `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`, as the next invariant after Invariant 13 (Claim-Type Floor).

> **Intelligence may distribute. Responsibility may not.**
> Agents may contribute to a response. They may never become the owner of a response.
> - **MAIA owns accountability for the response it produces** — jurisdiction over its own conduct, already granted by the vows and Invariant 13.
> - **The member owns the decision about their life** — the authority layer stays vacant; standing ≠ sovereignty.
> - **The contributing agents own neither.**
> The integration layer must have a single named accountable owner — MAIA-as-singular-relationship — and that ownership is over the *synthesis*, never over the member's *choice*.

This sits inside the vacant-authority-layer doctrine: "MAIA owns the decision" read literally would re-fill the deliberately-vacant authority layer (guru stance). The two-owner split prevents that — MAIA owns its *response*, the member owns their *choice*.

---

## 2. Two clauses — one enforceable now, one before switch-on

**Clause A — Honest representation (enforceable NOW, no switch required).**
A response may be represented to a member as *synthesized / woven from multiple voices* **only if** it passed the gate (§4). A diagnostic trace may **never** be represented as a synthesis. This is `MARKETING_CLAIM_DISCIPLINE` ("we do not tell tomorrow's story as if it were today's") applied to runtime self-representation.
*Today's trace already mildly violates this:* the `integration_passes` schema advertises `tensions_named` / `reconciliations` / `coherence_score` it never substantively populates, and `final_text` is typed/named as a synthesis output while holding a classifier status line. Clause A's near-term action: **label the trace a trace** — rename/repurpose so nothing represents `fast_pattern_match` co-occurrence logging as a merge.

**Clause B — Accountable synthesis (enforceable BEFORE `narrative_synthesis` serves any member-facing tier).**
When the integration actually authors the member-facing text, it must — *from records alone, without reconstruction, guessing, or reading source code* — answer the five questions in §3, or it does not ship to the member.

---

## 3. The five records

Kelly's five questions → required, per-turn, **substantive (non-boilerplate)** fields. For any response served as synthesis, the trace MUST persist:

| # | Question | Required record | Anti-boilerplate rule |
|---|----------|-----------------|-----------------------|
| 1 | Which voices contributed? | `contributing_voices[]` = `{agent_run_id, name, element, weight, output_excerpt}` | non-empty; weights present; each linked to a real `agent_runs` row |
| 2 | **Which voices were ignored?** | `excluded_voices[]` = `{name, reason}` | **KEYSTONE — zero current substrate.** If the selector takes ~half (WisdomRouter ~52%), the other half must be named *with reasons*. |
| 3 | Which tensions were resolved? | `tensions_named[]` (per-turn) + `reconciliations[]` = `{tension, resolution, method}` | reject the known fixed-template triple; `reconciliations` non-empty whenever tensions are named |
| 4 | Why was one interpretation favored? | `selection_rationale` (structured) + the deciding factor / weights | reject placeholder; must name the decisive criterion, not narrate vaguely |
| 5 | What specifically shaped the final response? | `final_text == the served text` (the audit's identical-test) + span/claim → voice attribution | reject `final_text ≠ served text` — that is a trace masquerading as a synthesis |

**Q2 is the keystone.** Recording *deliberate exclusion with reasons* is what converts selection from opaque to accountable. The current system records what fired, never what was deliberately not used. It is the one record that must be built from nothing.

**Q5's identical-test** generalizes the audit's decisive probe: a genuine synthesis has `final_text` equal to what the member saw. Anything else is, by definition, a trace.

---

## 4. Enforcement — fail-closed to the already-accountable fallback

- A validator `validateSynthesisAccountability(pass) -> { ok: boolean, missing: string[] }` runs **before** a synthesis response is delivered. This is a **precondition on member-facing output** — not an after-the-fact, non-blocking log, which is what the current trace is (`logCorpusCallosumTrace`, non-blocking, fired after the response).
- **Fail-closed, but never to a dead end:** if any §3 record is missing or boilerplate, the synthesis is **not shown**; the system serves the **single-author MaiaVoice response**, which is *already accountable* (one named owner). Accountability enforcement therefore costs **no availability** — there is always an accountable answer to serve. This dissolves the "but then MAIA can't respond" objection.
- Every fail-closed event is logged with the specific missing record(s), so gate breaches are themselves auditable.

---

## 5. Failure Test

> Per `MARKETING_CLAIM_DISCIPLINE` — every claim carries the condition that would falsify it.

The gate is **breached** if: a member asks *"why did you suggest that?"* about a response represented as synthesis, and the system cannot answer all five §3 questions **from records alone — without reconstruction, without guessing, without reading source code.**

Operationally testable at any time: sample any served `narrative_synthesis` response → query the trace → confirm all five records are present, substantive, non-template, and `final_text == served`. Any miss = gate breach = that path reverts to Clause-A trace status (not member-facing synthesis) until fixed.

---

## 6. The prior question the gate does NOT answer (Kelly's to hold)

The gate makes synthesis **accountable**. It does **not** establish that member-facing synthesis is **sovereign**.

A perfectly-accountable synthesis still does the integrating *for* the member — a small transfer of the interpretive act away from the person. The sovereign alternative may be: single-author reflection + **named standing sources** ("memory says X, your journal said Y"), leaving the member to do the integrating. That keeps sources visible and the synthesis in the member's hands — arguably closer to the standing-vs-authority doctrine than any merge.

So: **the gate is a precondition for synthesis, not a permission for it.** The higher question — *should MAIA be a synthesizer at all, or a presenter-of-standing-sources?* — is doctrine, and Kelly's call. The gate governs the former; the latter may be the more sovereign default, in which case `narrative_synthesis` stays off indefinitely and the gate's Clause A (honest representation) is the only part that ever ships.

**DECISION (Kelly, 2026-06-07):** **Presenter-of-standing-sources is the sovereign default.** `narrative_synthesis` stays **off by default**. **Clause A ships now.** Clause B is not a roadmap item — it is the **constitutional precondition (the lock)** on any future switch to a synthesizer mode. Single-author MaiaVoice + named standing sources is the design; synthesis is a door that stays locked until the gate exists.

---

## 7. Status discipline

- This spec: **Designed.** Not live.
- The merge-gate: **not built.**
- `narrative_synthesis`: **wired, off** (3 rows ever, all BETWEEN).
- Clause A (label the trace a trace): **buildable now → IN PROGRESS (2026-06-07, the active build).**
- Do not let "the gate is specced" inflate into "synthesis is now safe." The gate is the rule; the rule is unbuilt; the load has not been carried.

---

## Cross-references

- Memory `project_corpus_callosum_substrate_cat6` — the audit, receipts, and the appearance-problem diagnosis.
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — Invariant 13 (Claim-Type Floor); proposed sibling invariant (§1).
- `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — Live/Designed/Vision · Center of Gravity · Failure Test (this spec applies all three).
- Vacant-authority-layer doctrine; standing-vs-authority; status-honesty.
- Wire sites (for whoever builds it): `lib/sovereign/maiaService.ts` (response path + `logCorpusCallosumTrace` call ~:3265), `lib/services/corpusCallosumService.ts` (`logIntegrationPass` / `logCorpusCallosumTrace`, the trace schema), `integration_passes` table.
