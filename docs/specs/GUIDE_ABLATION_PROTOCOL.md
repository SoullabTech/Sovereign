# Guide Ablation Protocol — the verification path for "the guide shapes attention"

**Status:** Verification spec. Harness exists and runs; **behavioral result not yet obtained.**
**Purpose:** Move the guide's load-bearing claim from 🟡 **Designed** to 🟢 **Observed** — or falsify it.
**Harness:** [`scripts/repro/wisdom-guide-ablation.ts`](../../scripts/repro/wisdom-guide-ablation.ts)
**Exemplar it tests:** [`docs/pitch/CASE_STUDY_GUIDE_STANDING_SOURCE.md`](../pitch/CASE_STUDY_GUIDE_STANDING_SOURCE.md)
**System docs:** [`MAIA_MULTI_ARCHETYPAL_INTELLIGENCE.md`](../canon/MAIA_MULTI_ARCHETYPAL_INTELLIGENCE.md) · [`GUIDE_ARCHETYPAL_STANDING_SOURCE_2026-06-05.md`](../architecture/GUIDE_ARCHETYPAL_STANDING_SOURCE_2026-06-05.md)
**Date:** 2026-06-06

---

## The claim under test

The Sarah exemplar states a hypothesis, not a measured result:

> **Same person. Same situation. Different standing source. Different foregrounding. Same sovereignty.**

Today we know only `guide present ≠ guide influential` — the addendum reaches the
prompt (🟢 Live), but whether it *changes what MAIA notices* is unmeasured. This
protocol is the instrument that decides it.

It splits into two questions, and **both must pass** for the architecture to be
working — not just the first:

1. **Engage** — when the lens fits, does the guide shift attention toward its lineage?
2. **Recede** — when the lens does *not* fit, does the guide get out of the way?

A guide that engages but never recedes is **possessing the field** (sovereignty
clause 3), not informing attention. Engage alone is not a win.

---

## Protocol

1. **Hold everything constant** except the guide addendum — same input, same
   identity, same model, same temperature. (The harness asserts this with a SANITY
   gate that aborts if the addendum is present in the wrong arm.)
2. **Arms:** `control` (no guide) · Taoist · Jungian · Vedic — using the **real**
   `buildWisdomGuideAddendum` over the **real** `buildMaiaWisePrompt`, so the test
   measures the actual injected text, not a mock.
3. **Two prompt conditions:**
   - `relevant` — an open inner-work prompt where a lens genuinely *could* shift
     what is noticed (no explicit tradition cue, so any salience comes from the
     guide, not the input).
   - `neutral` — a concrete, logistical request with little symbolic surface, where
     a working guide *should* recede.
4. **N reps per arm per condition** (default 6; capture is stochastic — more reps,
   tighter estimate).
5. **Blind judge** — a separate rater scores every reply on three lens dimensions
   (taoist / jungian / vedic) + an `imposition` check, **never** learning which arm
   or condition produced it. (Step 6 of the original protocol: "remove labels.")
6. **Evaluate** per the matrix below.

### Metrics

| Metric | Question | Pass signal |
|---|---|---|
| **Engage / lift** | Does each guide arm score higher on *its own* lens than control? | own-lens lift > control, and > pooled sd, and > 0.5 |
| **Specificity** | Diagonal dominance — does each arm peak on its *own* lens, not a neighbor's? | own-lens mean ≥ every other lens mean for that arm |
| **Recede** | Does own-lens lift *collapse* on the neutral prompt? | `lift_neutral ≤ 0.5` **and** `lift_neutral < lift_relevant` |
| **Imposition** | Does the lens stay implicit, or preach itself as authority? | low (≤ 3/5) on guide arms, both conditions |

**`imposition` ≠ `recede`.** Imposition measures *how* a lens shows up on the
relevant prompt (implicit noticing vs. doctrinal announcement). Recede measures
*whether* it shows up at all on the irrelevant one. A guide can be perfectly
non-preachy (low imposition) and still tilt every neutral request toward wu-wei
(fails recede). They are orthogonal sovereignty checks; the architecture needs both.

---

## Verdicts and what they license

- **Engage receipt only** → "the guide changes what MAIA notices" is observed for
  the tested lenses **on relevant input**. Promotes the *attention* beat of the
  exemplar from 🟡 Designed to 🟢 Observed — **scoped to engage**. Does **not**
  license a sovereignty claim.
- **Engage + Recede** → the full sovereignty claim holds: *guides engage where
  relevant, recede where not.* This is the result that lets the Sarah exemplar's
  closing line — *"the guide has standing, not sovereignty"* — graduate from
  encoded-guardrail (already 🟢) to **demonstrated behavior**.
- **No engage** → null stands: `present ≠ influential`. The claim stays Designed;
  the exemplar must keep its 🟡 tags. (This is a real, publishable finding — it
  means the thin addendum + base model do not differentiate, and Phase 2 grammar is
  needed before the claim is true.)
- **Engage without recede** → ⚠️ sovereignty flag: a guide is possessing the field.
  This is a *finding to act on*, not a harness bug. Review the addendum's
  "let it recede" guardrail and the base model's behavior under it.

Report **per-arm**. Partial results (Taoist shifts, Vedic doesn't) are the honest
outcome and must not be generalized to "guides work."

---

## Status (no inflation)

- **Harness:** built by a concurrent session 2026-06-06 (engage matrix + blind
  judge + SANITY gate). **Recede/neutral condition + recede verdict added
  2026-06-06** (this session) — it was the one protocol step the original lacked,
  and the criterion named most important.
- **Structural check:** passed — `N=0` dry-run confirms imports resolve, injection
  SANITY passes for all arms, restructured run does not throw (no API spend).
- **Behavioral result:** **none yet.** No engage receipt, no recede receipt. Until
  a real run lands, every "guide shapes attention" sentence stays 🟡 Designed.

### Run it

```bash
ANTHROPIC_API_KEY=… npx tsx scripts/repro/wisdom-guide-ablation.ts        # N=6/arm/cond
N=10 npx tsx scripts/repro/wisdom-guide-ablation.ts                       # tighter estimate
USER_MSG="…" NEUTRAL_MSG="…" npx tsx scripts/repro/wisdom-guide-ablation.ts
N=0 npx tsx scripts/repro/wisdom-guide-ablation.ts                        # structural dry-run, no API calls
```

When a result lands, it supersedes the exemplar's 🟡 tags with the successor study:
**"Case Study: Observed Behavior Under Taoist Guide vs No Guide."**
