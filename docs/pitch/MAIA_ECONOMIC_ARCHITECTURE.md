# MAIA Economic Architecture — Strategy for Nathan & Heather

*Date: 2026-06-05 · Companions: `MAIA_MONETIZATION_READINESS_NATHAN.md`, `MAIA_MONETIZATION_DECISION_MATRIX.md` · Governed by `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`*

## Orientation: this is economic architecture, not pricing

Most AI companies optimize **Acquire → Engage → Retain → Expand.**
MAIA optimizes **Invite → Accompany → Deepen → Liberate.**

That reframe is the whole strategy. It is also already the house position: the Sovereignty Invariants require every user-facing feature to *increase agency, push life outward, and reduce the system's psychological centrality over time.* "Liberate" as the endpoint is the boldest claim in the funnel — and the rarest market position. (It is a **Vision**-tier claim; see annex.)

## Executive summary — three tiers + a stewardship tier

| Tier | Price | Purpose |
|---|---:|---|
| **Explorer** | Free | Experience MAIA (trust-building, not conversion pressure) |
| **Companion** | $22/mo | Personal continuity relationship — the default membership |
| **Practitioner** | $88/mo | Stewardship of others — a different *category* of work, not "premium Companion" |
| **Founding Circle** *(optional)* | $44/mo | Early supporters helping shape MAIA — a **stewardship** tier, not a feature tier |

---

## For Nathan — Product & Revenue Architecture

**Principle 1 — Do not monetize attention.** Revenue must never be proportional to messages, minutes, hours, streaks, or compulsive return. Those create structural incentives toward capture.

**Principle 2 — Monetize continuity infrastructure.** People pay for memory, continuity, relational intelligence, reflection space, voice companionship, symbolic tools — *not* "more AI."

**Principle 3 — Separate personal use from professional use.** This is where durable revenue emerges.

**Companion ($22)** — the default membership: MAIA relationship, continuity memory, voice, journal, dream journal, astrology, oracle, personal portal, elemental practices.

**Practitioner ($88)** — everything in Companion **+** Practitioner Studio, client continuity spaces, session review, practitioner dashboard, client reflections, higher usage limits, future practitioner community. A different category of work.

---

## For Heather — Brand & Positioning

**What we are NOT selling:** AI assistant, productivity tool, life-coach bot, personal OS, second brain. All of those file MAIA inside an existing AI category.

**What we ARE selling:** a **Relational Intelligence Companion** — not software, coaching, therapy, or productivity. A relational intelligence environment for reflection, continuity, meaning, self-awareness, and conscious participation.

### Messaging hierarchy (relief → continuity → transformation → belonging)

1. **Relief** — *"Stop starting over every conversation."*
2. **Continuity** — *"MAIA remembers the threads of your life."*
3. **Transformation** — *"Become more aware of the patterns shaping your life."*
4. **Belonging** — *"Participate in a new relationship between humans and intelligence."*

---

## Free tier — Explorer

Purpose: **trust-building, not conversion pressure.** The free tier should feel *complete enough that people understand what MAIA actually is* — a genuine experience, not a demo.

*(See annex Reconciliation #1: honor that principle by capping **volume**, not by sampling/crippling features.)*

---

## Founding Circle — the launch vehicle

**$44/mo — "Help steward the emergence of MAIA."** Includes Companion access + founder updates, community calls, early previews, feedback sessions, and recognition as founding members.

It attracts early believers and aligned contributors rather than power-users seeking advantage — *because it confers belonging and voice, never a better MAIA.* That boundary is load-bearing (annex, Failure Test).

---

## Launch sequence

1. **Phase 1 (now)** — Beta testers. Observe. No optimization, scaling, or ad spend.
2. **Phase 2** — Founding Circle, 50–100 members. Validate retention, resonance, willingness to pay, continuity value.
3. **Phase 3** — Public Companion launch ($22). Sustainable operating revenue.
4. **Phase 4** — Practitioner Program. Highest-trust, highest-value ecosystem layer.

---

## Success metrics — the governing distinction

Track DAU/MAU/engagement/session-length **operationally**, but do **not** let them govern. Governing metrics:

- **Continuity** — Do people return?
- **Resonance** — Do they describe the experience as meaningful?
- **Sovereignty** — Do they report greater clarity, agency, participation in life?
- **Trust** — Would they entrust important parts of their journey to MAIA?
- **Stewardship** — Would they recommend MAIA to someone they care about?

These align with the Charter's accompaniment / sovereignty / coherence-over-growth orientation. **The strategic advantage:** almost every AI company competes to become more indispensable. MAIA occupies the rarer position of *deepening human participation in life rather than dependence on the system.* That is both ethically aligned and a distinctive market position.

*(See annex Reconciliation #3 — how to instrument these honestly without overclaiming.)*

---

# Annex — Claim-Discipline Pass

*Per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`. The line: "We do not tell tomorrow's story as if it were today's." This annex exists so the strategy above can become web copy, decks, and onboarding without inflating. Three instruments applied: **Live / Designed / Vision · Center of Gravity · Failure Test.***

## A. Live / Designed / Vision — tag before it becomes copy

| Claim as a member/buyer will read it | Status | Grounding |
|---|---|---|
| "MAIA remembers the threads of your life" | **Live, with a visible gap** | Continuity is wired into the prompt (atoms/recall surfacing verified). But it's currently **invisible on screen** — next day still opens cold. Honest now: *"MAIA carries the threads forward."* Not yet honest: *"you'll see your history."* |
| Voice companionship · journal · dream journal · oracle · elemental practices | **Live** | Built and running |
| Astrology | **Live (partial)** | Western live; Mayan/Chinese partial. Don't claim "every tradition." |
| "Personal portal" (Companion) | **Designed / semantics mismatch** | What's built (`app/portal/[slug]`) is the *practitioner's client portal*, not an individual-member portal. Build the member portal or drop it from Companion. |
| Practitioner Studio · dashboard · client spaces · session review | **Live (needs gate installed)** | The most-built surface in the system. |
| Future practitioner community · "shape MAIA" previews | **Vision** | Not built; legitimately framed as future. Keep it future-tense in copy. |
| "Become more aware of the patterns shaping your life" | **Designed → Vision** | Pattern detection is partially live but not yet member-facing as insight. Frame as *invitation*, not delivered capability. |
| "Liberate" / greater agency in your life | **Vision** | The orientation, not a measured outcome. Aspirational by design — label it so. |

## B. Center of Gravity

The center of gravity of all outward messaging should sit on **continuity** (Live) — Messaging Level 2 is the truest claim we can make today. Levels 3–4 (transformation, belonging) are real *directions* but should be voiced as invitation, not as accomplished fact. Lead with what is Live; let Vision pull, never assert.

## C. Three reconciliations (resolve before launch)

**1. Free tier: cap volume, don't sample features.** The doc's own principle — *"a genuine experience, not a demo"* — argues against "limited memory horizon / sample astrology / sample journal." Those make Explorer a *demo by mutilation*. The architecture already supports the better path: `TIER_LIMITS` / `quota-service` / `LimitsEnforcer` gate by **sessions-per-month, daily messages, voice minutes, and DEEP-depth**. Recommend: **Explorer = the full MAIA, capped in volume.** Free users meet the real thing, just less of it. (Also the lower-build path — no partial-memory mode exists today.)

**2. "Personal portal" in Companion.** Resolve the mismatch above before it ships as a Companion bullet.

**3. Success metrics vs. the witnessing rung.** Continuity / Resonance / Sovereignty / Trust / Stewardship are the *right* north stars — but instruments report **traces, never fulfillment.** A dashboard cannot measure "greater agency in life"; it can only measure what was left behind. Operationalize each as a trace, and never collapse the trace into the thing:
- Continuity → return cadence *(clean trace ✓)*
- Resonance → qualitative self-report — keep it qualitative; do **not** average it into a "resonance score"
- **Sovereignty → the dangerous one.** You cannot read inner agency from inside the system. Honest proxies are *indirect*: healthy session spacing, members reporting they acted in the world. **Never build a "Sovereignty score."**
- Trust → entrustment survey *(trace ✓)*
- Stewardship → referral / recommend *(clean trace ✓)*

The rule (same one that governs astrology, symbol, memory, and any metric): *these are interfaces to the real thing, not the real thing — do not collapse the interface into reality.*

## D. Failure Test — Founding Circle

The tier is sound **only while belonging never becomes access-privilege.** Tripwire: if a Founding member's feedback starts overriding canon, or "founding" status implies priority in MAIA's care or a better MAIA, the stewardship framing has collapsed into patronage-capture — the exact thing the Sovereignty Invariants forbid. State the boundary in the tier's own copy: *Founding members shape and are recognized; they do not receive a different MAIA, and no member's standing in MAIA's care is ranked above another's.*
