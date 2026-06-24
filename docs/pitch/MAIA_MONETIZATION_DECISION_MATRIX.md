# MAIA Monetization — Decision Matrix (for Nathan)

*Date: 2026-06-05 · Companion to `MAIA_MONETIZATION_READINESS_NATHAN.md` · Scope: personal-development MAIA*

## 0. The frame

- **Infrastructure question: essentially solved.**
- **Business-model question: still open.**

So Nathan's decision is **not** "Can MAIA be monetized?" It's:

> **"What relationship do we want between access, depth, and payment?"**

The pricing discussion is now **positioning, not engineering.** One audit finding (§3) should anchor it: *the system is already built to gate by **volume and depth**, not by crippling features.* That happens to be both the lowest-build path and the most canon-aligned one.

## 1. The three viable paths

| Option | Free | Paid 1 | Paid 2 | Strength | Risk | Build cost |
|---|---|---|---|---|---|---|
| **SaaS** | Limited | $12 | $35 | Familiar; live in code today | Commoditizes MAIA — mentally grouped with generic AI tools at $12 | Lowest (already coded) |
| **Companion** | Free | $22 Companion | $88 Practitioner | Aligns with relationship model; entry price signals depth | Higher entry price | Low — both tiers map to **built** surfaces |
| **Founding** | Free | $22 Companion | $44 Guide | Gentle progression | More tier complexity; middle tier's differentiators are the least-built (§3) | Medium — Guide needs invented differentiators |

## 2. Feature-door matrix — annotated with build reality

Legend: **Live** = exists, works (ungated today) · **Wire** = exists; needs the existing gate installed · **Build** = the *gradation* implied doesn't exist yet · ⚠ = semantics to resolve.

| Feature | Free | Companion | Guide | Practitioner | Reality |
|---|---|---|---|---|---|
| Chat | ✓ | ✓ | ✓ | ✓ | **Live** |
| Continuity Memory | Limited | Full | Full | Full | Full = **Live**. "Limited" = **Build** — no partial-memory-horizon mode surfaced; memory is all-or-nothing today |
| Voice | Limited | Full | Full | Full | Voice = **Live**; minute-metering primitive exists (`LimitsEnforcer`, `monthlyVoiceMinutes` caps) = **Wire** |
| Astrology | Preview | Full | Full | Full | Full (incl. spiralogic-report) = **Live**; "Preview" = **Build** |
| Journal | Basic | Full | Full | Full | Full = **Live**; "Basic" gradation = **Build** |
| Personal Portal | — | ✓ | ✓ | ✓ | ⚠ What exists (`app/portal/[slug]`) is the **practitioner's client portal**, not an individual-member portal — resolve semantics |
| Advanced Reports | — | — | ✓ | ✓ | **Live & substantial** — spiralogic-report PDF pipeline, field-analytics, automated reporting = **Wire** |
| Client Spaces | — | — | — | ✓ | **Live** — `studio/clients`, `practitioner/clients`, `clientSubscription` = **Wire** |
| Practitioner Studio | — | — | — | ✓ | **Live & extensive** — full studio + practitioner suite (billing, sessions, scheduling, labtools) = **Wire** |

**Read:** every *full* feature is Live. Every paid differentiator above Companion (reports, client spaces, studio) is **Wire-only**. The only **Build** items are the *gradations* of consumer features (limited memory, preview astrology, basic journal) — and those are the ones that fight the "continuity is the point" positioning.

## 3. The key insight: gate by volume, not by mutilation

The architecture is **already specified to gate this way.** `TIER_LIMITS` (`lib/consciousness/SmartTierSelection.ts`) caps `maxSessionsPerMonth` and `allowDeep`/`allowComplete`; `quota-service.ts` enforces `dailyMessageLimit`; `LimitsEnforcer.ts` enforces voice minutes. So the cleanest, lowest-build, most aligned model is:

- **Free** = the *real* MAIA, capped volume (≈10 sessions/mo, no DEEP/oracle depth, basic voice minutes) — **already defined in code**
- **Companion** = uncapped volume, full depth, full voice
- **Practitioner** = + the built studio/clients/reports suite

Free users meet the genuine MAIA, just less of it — not a lobotomized demo. That is the canon-aligned position *and* the path of least engineering resistance.

## 4. Positioning note on entry price

If MAIA's core claim is **continuity, memory, relationship**, a $12 tier gets mentally filed next to generic AI utilities. A **$22–29 Companion** tier communicates *personal-development relationship*, not token-metered tool. Don't anchor the entry low to feel competitive with chatbots — that's the wrong reference class.

## 5. Recommendation

**Free / Companion $22 / Practitioner $88. Defer Guide until real usage data arrives.**

Audit-grounded reason: Companion (full features, uncapped) and Practitioner (the largest *built* surface in the codebase) are both **Wire-only**. The middle **Guide** tier is where you'd be *inventing* differentiators ("deeper memory" isn't a real axis yet; reports could just as easily sit in Practitioner). Defer it. The infrastructure supports many tiers later; **simplicity is harder to recover once added.**

## 6. What Nathan actually decides

1. **Entry price:** $12 (live, commoditized) vs **$22** (positioning). *Recommend $22.*
2. **Tier count:** 3 now vs 4. *Recommend 3, defer Guide.*
3. **Gating philosophy:** volume + depth (low-build, canon-aligned) vs feature-gradation (higher-build, more crippling). *Recommend volume + depth.*

Everything downstream of these three answers is execution, not decision.

## Appendix — the "wire the paywalls" punch-list (so it's concrete, not hand-wave)

1. **Collapse the tier vocabularies.** At least four exist in code today — `free/personal/pro` (membership, canonical), `free/explorer/seeker/oracle` (`SmartTierSelection`), usage-tracking's own set, and `subscriber/vip` (practitioner clients). Map all to one member model. *This is the single biggest wiring item — reconciliation, not greenfield.*
2. **Install the existing gates** (`requireTier()` / `checkQuota()`) at premium doors: oracle/DEEP depth, voice-minute cap, reports, studio, client spaces. (Helpers exist but appear installed at near-zero route doors today.)
3. **Set the per-tier limit values** (sessions/mo, daily messages, voice minutes).
4. **Turn off the beta override** that currently sets every member to `personal` (nothing is gated today by design).
5. **Wire Companion → Practitioner** into the existing Stripe checkout with final price IDs.
