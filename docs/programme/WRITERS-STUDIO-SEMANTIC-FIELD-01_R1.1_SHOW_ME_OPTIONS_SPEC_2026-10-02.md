# Writer's Studio — Semantic Field 01 · R1.1 "Show me options"
## Build spec · 2026-10-02 · founder-walk finding

Programme: `WRITERS-STUDIO-SEMANTIC-FIELD-01` · successor to R1 (#1706, live as production projection `12b461bd8`).
Status: **SPEC ONLY — no code changed.** The observation screen it targets ("I'm here with this" rail; buttons *Stay with this in Write · Show me in the manuscript · Talk with MAIA · Help me understand · Go deeper*) is **not present in the canonical checkout at `56cc22f0`**; the implementing lane must build against the branch that renders it.

## 1. Finding (founder walk, 2026-10-02)

On the observation *"The weight is uneven across the chapter"* every visible action either explains (*Help me understand*, *Go deeper*, *Explain it plainly*, *Teach me what is happening*) or converses (*Talk with MAIA*). None offers **improvements to the writer's own wording**. The writer's words:

> One of the clear options needs to be "offer options, edits…" so I can see what is ideal considering my writing. And I don't want a complete rewrite unless it is called for, but a way to take my writing and make it better.

## 2. Existing substrate (do not rebuild)

- Passage-level actions already exist in `app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx`: *Revise from this*, *Show examples*, *Give me ideas*, *Teach me more*, each built from a prompt helper (`revisePassagePrompt`, `examplesPassagePrompt`, `ideasPassagePrompt`).
- Revision authority is already governed by the Working Style latitude `Touch → Line → Passage → Shape → Open` (`lib/manuscript/editorialScope/contract`), with paragraph removal a separate permission. Out-of-scope wording is refused and not shown (PR #1704 preserved this).
- `InsightReading.tsx` already carries `onRevise` / `onChoosePassage` and a single-`Try a revision` rule (C6R1).

R1.1 is a **new entry point onto these**, not a new editorial system.

## 3. The control

**Label:** `Show me options` (plain; no jargon at any Explanation level).
**Position:** immediately after *Talk with MAIA*, before *Help me understand*. Visually a primary-weight sibling, not buried under "Go deeper".
**Sub-line (one sentence):** *"A few small ways to improve your own words. Nothing changes until you choose."*

## 4. Behaviour

1. **Observation has a bound passage** → request options for that passage directly.
2. **Observation is whole-chapter / structural (no single passage)** — the case in the screenshot → MAIA first names 2–3 places where it shows (reusing the existing evidence refs / `onChoosePassage` flow). The writer picks one. Options are generated for that one passage only. ⛔ Never generate edits for a whole chapter at once; ⛔ MAIA never silently picks the passage for the writer (C6 first prohibition).
3. **Smallest change first.** 2–4 options, each: the changed wording shown beside the original, plus one plain sentence on *why*. Default intent = *improve the writer's own words, keep their voice*.
4. **Bigger only when called for.** A recast beyond the writer's chosen latitude is not shown. MAIA instead says it exists and what it needs: *"A larger change would fit at Shape. Raise it and I'll show you."* (reuses the #1704 scope-recovery wording; do not weaken the rejected-wording law).
5. **Writer's act, always.** Per option: *Use it · Change it · Talk about it · Undo*. Nothing is applied without the writer's act. Options are not ranked or scored; present in manuscript order.
6. **Explanation register** (Plain…Expert) governs the *why* sentence only. Same options, same evidence at every level.

## 5. Constitutional constraints (acceptance)

- **Authorship (FACETS-01 §9.3):** latitude, Explanation and Pace change how much MAIA *explains*, never how much MAIA *writes*. A "Plain" writer must not receive more rewritten prose than an "Expert" one.
- Proposals pass through the existing proposal chain and authorization; no new apply path.
- No stored declaration of intent is created by this action (turn-local context only).
- No implicit ranking ("best", "recommended"). ⛔ No "ideal" claim — MAIA offers options for the writer to judge; she does not assert what the passage *should* be (Invariant 14 / voice lens: the manuscript is the reference).
- Paragraph removal stays a separate permission.

## 6. Falsifiers (author before implementing — S3 Class B discipline)

| ID | Law | Defeat candidate (must die) |
|----|-----|------------------------------|
| O1 | Options never exceed current latitude | Option generator ignores latitude |
| O2 | Whole-chapter observation never yields chapter-wide edits | Generates edits for all evidence refs at once |
| O3 | MAIA does not choose the passage on the writer's behalf | Auto-selects first evidence ref |
| O4 | Nothing applied without a writer act | "Use it" auto-fires, or options write on render |
| O5 | Same options across Explanation levels | Plain level triggers a larger rewrite |
| O6 | No ranking / "best" marker | Options sorted or badged by quality |
| O7 | Out-of-scope wording is not revealed | Over-latitude option shown "for reference" |

## 7. Out of scope

R2 governance, constellations, Chapter Compass persistence, any change to latitude semantics, any new store.

## 8. Founder-walk acceptance

On the same screenshot observation: press **Show me options** → see 2–3 places → pick one → see 2–4 small wording options beside the original, each with a plain reason → use one → manuscript changes only then → Undo restores. At no step did MAIA rewrite more than the chosen latitude allowed.

Question it answers: *does this help me make my own writing better without handing it over?*
