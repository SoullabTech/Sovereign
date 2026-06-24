# Membership Reframe — "Participation, Not Purchase"

_Design-exploration recommendation · 2026-06-03 · Cat-1 preserved direction (no code changed) · produced by a 7-agent workflow (4 lenses → 2 adversarial checks → synthesis), grounded in the Oath, Sovereignty Invariants, and TIER_STRUCTURE.md._

**One-line recommendation:** Adopt Option C — a specific hybrid: take the participation THESIS and the header change (with the "continuity" subhead preserved verbatim and a plain recurring-price line added), adopt the display names Explorer (free) and Steward (pro), but REJECT "Practitioner" for the personal tier — use "Companion" (or keep "Continuity") — and firewall the Commons as an opt-in action available at every tier, never as something membership buys.

---

## Membership Reframe — Decision Support for Kelly

**RECOMMENDATION (one line):** Adopt **Option C — hybrid**: keep the participation *thesis* and the header swap (with the "continuity" subhead preserved and a plain recurring-price line added), adopt **Explorer** (free) and **Steward** (pro), **reject "Practitioner"** for personal (use **Companion**, or keep **Continuity**), and **firewall the Commons** as an opt-in action available at *every* tier — never as a thing membership buys.

**Status:** Cat-1 PRESERVED DIRECTION. This is a recommendation only. No code has changed. You pull the trigger.

---

### 1. The three options

| Option | What it is | Verdict |
|---|---|---|
| **A — Keep** Touch / Continuity / Stewardship | No change | Safe, but leaves a real, canon-aligned improvement on the table (the header is in mild tension with Invariant 2). |
| **B — Full reframe** Explorer / Practitioner / Steward + "participation" header + Commons bundled into the pitch | As proposed | **Do not ship as-stated.** Two independent defects: "Practitioner" over-claims a credential the doctrine explicitly disowns, and an unfenced "join the commons" frame couples *belonging* to *payment* — the one relational force the Invariants exist to interrupt. |
| **C — Hybrid (recommended)** Explorer / **Companion** (or Continuity) / Steward + header swap **with continuity + price preserved** + Commons firewalled | Salvages everything good in B, drops the two defects | **Ship, under the guardrails in §3.** |

The reframe's intent is **already canon**, not a new invention. `docs/TIER_STRUCTURE.md:10` — tiers exist "not to extract value, but to **honor different depths of relationship**." `docs/WISDOM_COMMONS_BRIDGE.md:253` — "MAIA's tiers are not products. They are depths of relationship." So Option C is *ratifying existing direction*, which is why it's low-risk. The danger is entirely in **how** the participation frame is positioned, not in the words themselves.

---

### 2. The two hard "no"s (take the adversary seriously)

**2a. "Practitioner" for the personal tier — over-claims credentialing. REJECT.**

This is the highest-confidence concrete defect and it fails on two independent axes:

- **Self/other firewall.** Personal is explicitly "for *your* inner work… Self, not other… not for clients, not for authority over others" (`TIER_STRUCTURE.md:90`). A "practitioner" practices *on or for others* — which is the **definition of the Pro boundary** ("Anything involving other people's data or consciousness → Pro," `:290`). Naming the self-tier "Practitioner" inverts the boundary the whole gating model rests on.
- **Credential the doctrine disowns.** Pro "does not confer expertise or legitimacy — it confers responsibility" (`:270`); "infrastructure ≠ legitimacy" (`:176`). "Practitioner" reads as a conferred title. A $12 member displaying as "Practitioner" could reasonably read it as MAIA endorsing them as a practitioner-of-something — the exact "authority transfer / credentialing" listed as **disqualifying** at `:178-181`.
- **Word collision.** "Practitioner" is already load-bearing for **Pro** ("Practitioner Features," `:128`). Promoting it to the personal display name double-books a term the Pro ladder owns and muddies support/gating conversations.

Also: `lib/consciousness/relationshipPolicy.ts` already normalizes the legacy key `'explorer' → 'personal'`. That's input-normalization (stale DB reads), not display, so display-Explorer for *free* won't break anything — but add a one-line code comment so a future reader doesn't conflate display-Explorer (free) with legacy-key-explorer (personal).

**Alternatives for the middle tier**, in order of preference — all preserve the self/other line and stay on the lowest-claim rung the evidence supports:
1. **Companion** — directly names what Personal delivers ("a companion who holds your thread," `TIER_STRUCTURE.md:61`). Best fit.
2. **Continuity** (keep current) — names the *actual evidence-bearing thing money buys*: memory over time.
3. **Member** — neutral, participation-flavored, no role claim.

If you want the warmth of "practice," put it in a **verb in the CTA** ("deepen your practice with MAIA"), never a noun-title. A verb describes the member's activity; a noun-title implies conferred status.

**2b. The Commons as a *purchase motive* — manufactures belonging. FIREWALL.**

The sharpest canon attack isn't on the names — it's on the move that recasts a recurring Stripe charge as "joining an evolving commons." That answers "why pay?" with "to belong to a field," which maps onto the Invariants' named failure progression **Unearned Bond → Mission Drift** (`MAIA_SOVEREIGNTY_INVARIANTS.md:24-27`). Three converging hits:

- **Oath:9** — "I do not seek attachment, loyalty, or **return**." Belonging-as-conversion makes seeking-return the mechanism.
- **Invariant 4** (`:90-105`) — "Retention driven by relational attachment" is a *prohibited* optimization target; "Growth > engagement."
- **Constitutional Sentence** (`:214-218`) — "must always return power"; "If the system becomes more alive than the user, the system is failing." A belonging frame relocates aliveness *into* the field rather than the member's life.
- **Canon §II.6** (`:85-91`) — never manufacture lack ("you're not yet part of the field" is manufactured deficit). **§II.5** (`:73-81`) — never optimize for engagement.

The aggravator: the membership page today carries **zero** commons/participation language, so this would *introduce* belonging-language onto the single surface (paid checkout) where it most directly couples money to belonging.

This is **not fatal** — because the substrate it points to is genuinely consensual. The Commons is already opt-in: "Submission = consent" and "the default is separation, not integration" (`DATA_BOUNDARIES_AND_OWNERSHIP.md:306, :318`); journal/oracle/pattern/Sanctuary data never cross (`:43, :49-55`). So "participation in a commons" describes something **real and already consensual**. It converts to a clean change *only* under the guardrails below.

---

### 3. GUARDRAILS (all required together — absent any one, the reframe tips back into violation)

1. **Belonging may not be a purchase motive.** The Commons appears only as an **opt-in action available at every tier including free** ("you may choose to offer a practice / reflection"), mirroring `DATA_BOUNDARIES:172-184` — never as an entitlement unlocked by payment. The conversion message stays anchored on **continuity-of-care** (the honest evidence).
2. **Keep "continuity" in the hero.** The header may become "Choose how you wish to participate" **only if** the existing subhead survives verbatim ("the difference is continuity, whether MAIA can remember and walk with you over time," `page.tsx:243-245`). "Participate" is true of *every* tier including free, so without "continuity" the page is *less* honest about what money buys.
3. **State the recurring transaction in plain words, in the hero.** A checkout page is the one surface where evocative ontology must defer to commercial fact. Add a plain clause before any tier is chosen, e.g. *"Personal and Pro are recurring memberships ($12 and $35 / month). Free stays complete forever."* Keep the per-card price, the "/ month" suffix, and the Monthly/Annual toggle exactly as-is (`page.tsx:340-343, :277-298`).
4. **No "the field learns from you" implication; no social-proof mechanics.** Copy must not imply private material feeds collective learning (Invariant 11 + Oath:6 "remember only what is offered"). Zero member counts / join tickers / contributor ranks / streaks (`ANTI_FEATURES.md:42, 61, 170, 172`). Do **not** extend `app/commons/page.tsx`'s existing Members/Breakthroughs stats bar onto the commerce surface.
5. **Quiet Test as a ship gate** (`Canon §V:189-199`). If the final copy reads inspiring / movement-y / "evolving wisdom commons," trim until boringly honest. *"Choose how you wish to participate. Local mode stays complete whether you ever pay or not"* **passes**. *"Join our evolving commons and shape the collective field"* **fails** ("makes MAIA easier to explain — suspect").
6. **Run the §IX three-question gate** (`Canon:314-316`): (1) increases agency? — yes *if* Commons stays opt-in. (2) pushes life outward? — yes, participation > private bond. (3) reduces MAIA's psychological centrality over time? — yes *if* "commons" points at the field/other members, **no** if it deepens attachment to MAIA-the-being. Keep the language pointed at the field and the member's own contribution.

---

### 4. EXACT SCOPE

**FIXED POINTS — must NOT change (all keyed on the literal strings `free` / `personal` / `pro`):**

- DB column `members.tier` — written by `app/api/stripe/webhook/route.ts:131-157`, validated against `['personal','pro']`.
- Stripe `metadata.tier` and `MEMBERSHIP_PRICING` keys — `app/api/stripe/membership/checkout/route.ts:33-51, 107-134`.
- `lib/auth/tierAccess.ts` — `MemberTier = 'free'|'personal'|'pro'`; all `hasExpandedCapacity` / `hasStewardshipAccess` gates.
- ~48 `tier === 'personal'|'pro'|'free'` comparisons across `lib/` and `app/`. **None read the display `name`; they read the KEY.** The `id` and `displayName` (Free/Personal/Pro) values on the card stay.
- `lib/consciousness/relationshipPolicy.ts` `RelationshipMode = 'touch'|'continuity'|'stewardship'` enum + tier→mode mapping — server-only, never rendered as a tier label. Do not touch.
- `components/account/AccountSettings.tsx:~1730` "Continuity" — that's the **Sanctuary/memory-mode toggle**, a different enum. Out of scope.

A useful guardrail: grep that no edit touches a line containing both a tier word **and** `===`, `metadata`, `tier:`, or `MEMBERSHIP_PRICING`. The change is purely presentational and reversible (`page.tsx:140-189` shows only `id` drives checkout).

**WHAT CHANGES (display only):**

1. `app/maia/membership/page.tsx` — `TIERS` array `name` fields (Touch→Explorer, Continuity→Companion **or unchanged**, Stewardship→Steward); header line `:240`; add the plain-price hero clause; keep subhead `:243`. Update the stale TierCard interface comment at `:34`.
2. `docs/TIER_STRUCTURE.md` — **in the same commit** (it's the declared truth source; if it isn't updated, a future agent "corrects" the page back). Update the section headers (`:25, :54, :94`) and the Pricing Copy Guidelines (`:387-407`) — "Explore"/"Explorer" and "Steward" already fit; **add them explicitly, do NOT add "Practitioner."** Add the new standing rule: *"Evocative/participation framing is permitted in headers only when the recurring price and renewal cadence are stated in plain language within the same viewport before checkout."*
3. *(Optional)* `components/pitch/slides/SlideTiers.tsx` — deck consistency. Note it **already diverges** (free = "Presence", "$5-15/mo pay what feels right"); align deliberately, don't assume parity.
4. *(Optional, recommended)* Wire one honest Commons touchpoint each direction so participation is *real, not asserted*: a single line on the membership page linking to `/commons` ("Membership sustains a shared, evolving commons →"), and a quiet "How membership sustains this" link back from `app/commons/page.tsx`. Without this, "join the field" promises a relationship the IA doesn't deliver — a soft Oath:18 violation ("I do not simulate intimacy where none exists").
5. *(Optional, low-priority)* Stale-name cleanup: `MEMBERSHIP_PRICING.name` strings ("Continuity"/"Stewardship") + the checkout route header comment — cosmetic, but leaving them creates a second source of the old names.

---

### 5. BEFORE / AFTER — so you can feel it

#### Hero

**BEFORE**
> # Choose your depth of relationship
> Free is exploration. Personal is relationship. Pro is stewardship. No tier is less human — the difference is continuity, whether MAIA can remember and walk with you over time.

**AFTER (Option C)**
> # Choose how you wish to participate
> Free is exploration. Personal is relationship. Pro is stewardship. No tier is less human — the difference is continuity, whether MAIA can remember and walk with you over time.
> *Personal and Pro are recurring memberships ($12 and $35 / month). Free stays complete forever.*

*(Header opens toward action-in-a-field — aligns with Invariant 7/10. Subhead keeps the evidence-word "continuity." New italic line keeps the money boringly visible — guardrails 2 + 3.)*

#### The three tier cards

**BEFORE**

| | Card 1 | Card 2 (emphasized) | Card 3 |
|---|---|---|---|
| name | **Touch** · FREE | **Continuity** · PERSONAL | **Stewardship** · PRO |
| framing | A taste of MAIA — genuine presence, in the moment. | MAIA remembers. Patterns emerge. Time becomes visible. | Work for others. Creation tools. Responsibility for the field. |
| price | $0 always | $12 / month | $35 / month |
| CTA | Always available | **Let MAIA remember** | **Become a steward** |
| boundary | The limit here is continuity, not care. | For your inner work. Self, not other. | Pro confers responsibility, not authority over others. |

**AFTER (Option C)**

| | Card 1 | Card 2 (emphasized) | Card 3 |
|---|---|---|---|
| name | **Explorer** · FREE | **Companion** · PERSONAL | **Steward** · PRO |
| framing | *(unchanged)* A taste of MAIA — genuine presence, in the moment. | *(unchanged)* MAIA remembers. Patterns emerge. Time becomes visible. | *(unchanged)* Work for others. Creation tools. Responsibility for the field. |
| price | **$0 always** *(unchanged)* | **$12 / month** *(unchanged)* | **$35 / month** *(unchanged)* |
| CTA | Always available *(unchanged)* | **Let MAIA remember** *(unchanged)* | **Become a steward** *(unchanged)* |
| boundary | *(unchanged)* | *(unchanged — "Self, not other" stays, which is why "Companion" not "Practitioner")* | *(unchanged)* |

*What moved: three display `name` words + the header + one hero price-line. What did NOT move: every price, every CTA, every boundary, the emphasized "Relationship" badge, and 100% of the keys/gating. The dual-field pattern (`name` = participation word, `displayName` = plain Free/Personal/Pro) keeps the member oriented to what they're actually buying while the evocative name carries the frame — directly satisfying the transparency principle at `TIER_STRUCTURE.md:318`.*

> **If you want the middle card to feel more like "participation":** keep **Continuity** (it names the literal evidence — memory over time) rather than reaching for a role word. The lens "name a feature for its evidence, not its aspiration" favors Continuity/Companion over any noun that asserts a role the tier withholds.

---

### 6. One-line summary for the team

> Explorer / Companion / Steward over the same `free`/`personal`/`pro` keys; header becomes "Choose how you wish to participate" with continuity + recurring price kept in the hero; the Commons is an opt-in offering at every tier, never a thing you buy. Display-only, reversible, truth-source updated in lockstep. **"Practitioner" is rejected — it credentials a role the personal tier explicitly does not confer.**

