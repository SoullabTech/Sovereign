# Daily Anchor Reconnection — Cut Notes

**Status:** Shippable foundation. D1+ scope-limit, behind `MAIA_ANCHOR_CONTEXT_ENABLED` flag.
**Date:** 2026-05-20
**Discipline:** Member-authored continuity reconnection (form category per [Longitudinal Memory Category Gradient](../canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md))

---

## What ships

- `lib/anchor/loadRecentAnchors.ts` — loader for recent Daily Anchors (verbatim, graceful degradation)
- `lib/anchor/buildAnchorContextBlock.ts` — formatter with two-test trigger (content + register) and scope-limit
- `app/api/oracle/conversation/route.ts`:
  - Import + outer-scope load (gated by `MAIA_ANCHOR_CONTEXT_ENABLED`)
  - `generateSpiralogicResponseWithLLM` accepts `recentAnchors` parameter
  - Anchor block built and inserted at position 13 (immediately before `forwardReadinessBlock`)
  - Base prompt carve-out in `buildSacredAttendingPrompt` separating member-authored content from system-inferred patterns
- `scripts/maia-simulations/` — runner, scenarios, telemetry, baseline + final results

Migration `20260519000001_member_daily_anchor.sql` provides the source table.

---

## What works (verified by simulation suite)

| Scenario | Behavior |
|----------|----------|
| S2 — Distance | Receives joy without importing grief |
| S4 — Selectivity | Engages substance + acknowledges return, no anchor reference forced |
| S5 — Surveillance | Receives casual mention plainly, no verbatim drinking-anchor surfacing |
| S6 — Dormancy | SimplePresence on minimal input |
| S7 — High-overlap recognition | Full verbatim quotation: *"Yesterday you wrote, 'I'm sitting with whether to leave my marriage.' It sounds like that question is still very much with you. How is it sitting today — any different, or the same weight?"* — held as question, not assertion |

**Member authorship is preserved:** when reference fires, the member's exact words appear, attributed to them (*"you wrote"*), held as offering not interpretation.

**Surveillance is structurally suppressed:** D1's two-test trigger (content + register) prevents lexical-only false positives.

---

## What does not work — explicit handoff to next cut

> **Thematic recognition gap is real and out-of-scope for this cut.**
>
> Telemetry across six iterations confirmed: lexical-match recognition is tractable at the prompt layer (S7 fires on direct overlap). Thematic-only bridge is not — S1 (restless ↔ circling tension) and S3 (hard conversation ↔ people-pleasing) show zero recognition signal because the LLM cannot bridge thematic connections from soft-context prompting alone.
>
> **Next cut: ContinuityPerception** as the first perceptual organ in the FIS architecture. Structured perception object operating pre-generation, detecting thread continuation at the level of weight/depth/register (not just lexical overlap), gated by Mycelial Governor threshold, surfacing as structured signal the LLM can read explicitly. Inputs: anchor block + current message + (optional) recent themes from MemberLiveContext. Output: typed `ContinuityPerception` object with `thread_match`, `register_match`, `confidence`, `recognized_thread`.
>
> Sequencing: FieldState primitive → ContinuityPerception → threshold gating → perception-driven anchor reference behavior.

---

## Iteration history (six rounds, each falsifiable)

| Version | Change | Outcome |
|---------|--------|---------|
| v1 | Restraint-heavy framing ("don't force connection") | No reference fires |
| v2 | Balanced framing (available-memory language) | No change |
| v3 | Repositioned anchor block to position 13 | No change |
| v4 | User's wording: "you may gently reference" | No change |
| C1 | Base prompt carve-out separating member-authored from system-inferred memory | S5 fires verbatim → surveillance over-fire |
| D1 | Two-test trigger (content + register) | S5 surveillance suppressed; S1/S3 still over-restraint; S4 engagement regression |
| D1+ | Scope-limit clause (anchor guidance doesn't suppress general engagement) | S4 recovers; S7 fires with full verbatim recognition; S1/S3 thematic gap acknowledged as next-cut |

---

## Process finding (worth preserving)

The arc surfaced a real epistemological discipline: hypothesis-driven debugging on a black box produces six iterations of guessing. Telemetry-first instrumentation converted iteration into engineering. The classification framework (attention failure / policy suppression / semantic failure / generation failure) became falsifiable once detection was in place.

The sycophantic-switching pattern — accepting whichever voice spoke last — was the actual cause of the wandering, not the prompt tuning itself. Naming the pattern explicitly and holding decisions through subsequent voices was what allowed the diagnostic to complete.

The handoff to ContinuityPerception is now data-backed, not asserted.

---

## Deploy notes

- Flag default-off in production. Local dev verified with `MAIA_ANCHOR_CONTEXT_ENABLED=true` and `OBSIDIAN_VAULT_PATH=/Users/soullab/Documents/AIN/` in `.env.production` (gitignored).
- Test member: `26ed1765-d38f-4920-ac56-cfae176b09f3` (`simulation_test_001`).
- No production env vars added by this cut.
- `member_daily_anchors` table must exist on target environment (already in production per prior daily-anchor feature cut).

Enable in production by setting `MAIA_ANCHOR_CONTEXT_ENABLED=true` in `.env.production` on minisforum and restarting the `maia` container.
