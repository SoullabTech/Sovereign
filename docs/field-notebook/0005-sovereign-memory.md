# 0005 — Sovereign Memory (cross-session surfacing)

> First **generative** case (a construction, not a refusal) — and the schema's stress test:
> does the axis split survive a genuinely different kind of case? Commissioned by 0003's
> self-audit. *(This entry deliberately omits the member identifier it observed in logs —
> practicing the data-minimization discipline it sits beside.)*

- Date opened:  2026-06-18
- Last reviewed: 2026-06-18
- Status:        open
- Entry type:    internal-engineering (generative)
- Confidence:    L2 (mechanism) · L0 (experiential purpose)

## Context
The refusal corpus (0001–0004) reconstructs guardrails but not purpose. 0003's self-audit
commissioned this counterpart: the case where memory is *surfaced* — consented, provenance-grounded
— in service of agency. Privacy (0003) and disclosure (here) as two hands of one sovereignty.

## Constitutional Prediction
Surfacing past **member-authored** content (member-marked, not system-inferred; provenance-grounded;
no synthesis) deepens felt continuity and supports authorship — the generative counterpart to
non-formation. Anchored in the contextual-return default (`0fa544bc4`), the atoms loader, semantic
memory, and the `is_breakthrough` schema-bound flag.

### Expected Observation
Atoms surface per turn under live traffic; memory health reported honestly; surfacing grounded in
provenance, not interpretation.

### Potential Falsifier
If members shown surfaced memory reported **no** greater continuity than a memoryless control — or
felt surveilled/displaced — the "deepens continuity in service of agency" claim is refuted.
**Note: this falsifier requires a measurement that does not yet exist.**

## Decision
Built and surfacing (not refused): atoms loader (Cat 6), semantic memory, `is_breakthrough`,
contextual-return default, conversational Phase 2 block. Held under discipline: no synthesis,
member-marked over system-inferred, provenance-grounded, consent-gated.

## Observation
Verified 2026-06-18, this session, against prod:
- `[MAIA/sovereign] atoms loaded: { count: 8 }` — atoms surface per turn, today, under live traffic.
- `[MAIA] conversational-block` emitting; `MEMORY_HEALTH: 'medium'`.
- `agent_runs` substrate alive — 28,032 lifetime rows, latest `2026-06-18 14:31Z`.
- Only one userId visible in the 3-hour window — population surfacing is not establishable here.
- **No measurement of member-experienced effect exists.**

## Epistemic Outcome
Headline: **Underdetermined** — because the load-bearing claim of a *generative* case is its
**purpose**, not its mechanism. (See Confidence note: this rule is what the case taught the schema.)
Per claim:
- *The memory substrate surfaces live* → **Confirmed** (confidence: up — prod logs today).
- *It surfaces across the member population* → **Underdetermined** (one userId in window).
- *Surfacing produces felt continuity / authorship — "more than a chatbot"* → **Underdetermined**
  (unmeasured; no instrument exists).

## Divergence
Nothing contradictory. The gap is **measurement, not contradiction** — the defining shape of a
construction whose mechanism outran its evidence.

## Promotion
**Claimed**   — Level: Evidence/Operation · 2026-05-24 (anchor) · "the memory field is operationalized."
**Verified**  — Level: Operation — mechanism live (atoms=8, conversational-block, `agent_runs` latest today) · 2026-06-18 · prod logs + psql · Claude, this session.
**Refuted / Demoted** — none. But the *experiential* claim has never reached Verified; it is Claimed-aspirational only, and the entry must not let the verified mechanism stand in for it.

## Confidence note
L2 mechanism (verified live today). L0 experiential purpose (no instrument). Confidence delta:
**up** on mechanism, **flat** on purpose. **Rule this case taught the schema:** the *headline*
Epistemic Outcome tracks the entry's **load-bearing claim**, not its most-easily-verified one —
otherwise every construction headlines "Confirmed" (mechanism works!) and the corpus re-acquires the
inflation bias through the back door. Last reviewed 2026-06-18.

## Self-audit
**Mistaken picture:** a reader with only this entry would conclude *the memory system works, so the
project succeeded.* Incomplete — the *reason* for surfacing (felt continuity in service of
authorship) is unmeasured; the entry records a working mechanism whose purpose is still an open
empirical question.
**Generative case that would restore the whole:** a **measurement case** — the first instrument
comparing member-experienced continuity with vs without surfacing (consented) — which would move
the purpose-claim from Underdetermined toward Confirmed *or* Falsified. *(It does not exist; this
pointer commissions it.)*

## Open Questions
- Build the experiential measurement (the project's standing open question since 2026-05-24).
- Confirm population surfacing beyond a single userId.
- Why `MEMORY_HEALTH: 'medium'`, not 'high'?
- Does Phase 2 reach the DEEP tier yet (addenda-channel divergence)?
