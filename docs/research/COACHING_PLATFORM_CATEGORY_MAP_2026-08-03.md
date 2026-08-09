# Coaching Platform Category Map — what each platform assumes a human IS

**Date:** 2026-08-03 · **Status:** ⛔ **RESEARCH — analysis, not a claim.** Authorizes nothing.
Governed by [`MARKETING_CLAIM_DISCIPLINE.md`](../canon/MARKETING_CLAIM_DISCIPLINE.md) — every line below is
classified **Live / Designed / Vision** where it touches AIN.
**Method:** public web sources, 2026-08-03. ⛔ No primary interviews, no product trials, no ICF primary data.

---

## 0. Three guards this document is built to satisfy

| # | Guard | Why |
|---|---|---|
| **G1** | ⛔⛔ **Never compare AIN's *designed* architecture to a competitor's *shipped* product without marking the asymmetry.** BetterUp's worldview is visible in what it ships; most of AIN's differentiation is **Cat 1–5, not Cat 6** | otherwise the map is a pitch deck wearing research clothes |
| **G2** | ⛔ **The founder's question *"what % of coaching value is lost between sessions"* has no measured answer.** No such figure exists. It is **not estimated here** | manufacturing it would be this project's named failure class arriving through a market doc |
| **G3** | ⚠️ **A web search returning nothing is a weak instrument, not proof of absence** | *empty measurement ≠ absence* |

---

## 1. ⭐⭐⭐ The worldview map — the actual finding

> **Every platform encodes an answer to "what is a person?" in its data model. The answer is legible in
> what the system stores and what it notifies on.**

| Platform | Surface | **What a person IS, per the architecture** | Evidence |
|---|---|---|---|
| **BetterUp** | coaching marketplace | **A measurable psychometric profile.** The "Whole Person Model" *measures resilience, productivity, social connection* to generate growth plans; 50+ PhDs; benchmarking at individual / team / **organizational** level | vendor + analyst sources below |
| **CoachAccountable** | coach workspace | **A compliance surface.** Clients complete assignments, check off action items, track habits; **the coach is auto-notified when items are overdue**; progress charts both sides see | product reviews |
| **Practice Better** | practitioner portal | **A clinical and billing record.** HIPAA telehealth + billing-ready client administration | product reviews |
| **Torch** | leadership development | **An organizational capability unit** — development measured against org competency frameworks | vendor comparison |
| **Ezra** | subscription coaching | **A unit of access** — the innovation is distribution, not model of person |  |

### ⭐⭐⭐ The shared assumption AIN challenges

> **In all five, the authoritative description of the person is produced BY THE PLATFORM OR THE
> PRACTITIONER, and stored ABOUT the member.**

Measurement, competency mapping, assignment completion, benchmarking, clinical record — the direction of
authorship runs **inward onto the person**. The member is the *subject* of the record, not its *author*.

⭐ **This is the real differentiator, and it is architectural, not a feature.** AIN's member material carries
`authorship`, no `practitioner_id`, and a hard-DELETE departure with zero residue — *the member's meaning is
portable beyond the relationship that helped reveal it.* **CoachAccountable's overdue notification is the
exact inverse gesture.**

### ⭐⭐⭐ The direction of authority is reversed

```text
TRADITIONAL                          AIN
Practitioner                         Experience
      ↓                                    ↓
Platform record                      Member meaning
      ↓                                    ↓
Person being developed               Member-owned field
                                           ↓
                                     Optional relational lenses
```

**The platform becomes a place where the practitioner or organization accumulates knowledge ABOUT the
person.** ⭐ That is the deeper category distinction — not a feature gap.

### ⛔ Keep the comparison at the worldview level — a feature grid is feature theater

⛔ *Has journaling? Has AI? Has tasks?* ⇒ fragile, and copyable in a quarter. The revealing axes:

| Category question | Traditional coaching platforms | AIN Client Field |
|---|---|---|
| **Who describes the person?** | practitioner / platform | **member** |
| **What persists?** | client record | **member meaning** |
| **What happens after the relationship ends?** | record remains **organizational** | field remains **personal** |
| **What is the role of AI?** | advice / automation layer | **relational / contextual intelligence** |
| **What is the unit of value?** | **session delivery** | **continuity of development** |

⭐⭐⭐ **The last row is the strategic opening.**

⚠️ **G1 applies:** the five platforms' worldviews are **shipped and in production**. AIN's counter-position
is **partly Live** (member-authored tags, departure semantics, the no-scores promise at
`ClientHome.tsx:463`) and **partly Designed** (universal field, expression layer, CF-D5b/c). ⛔ Do not
present the whole stack as Live.

---

## 2. The between-sessions problem — what is actually evidenced

| Claim | Status |
|---|---|
| Insight decays without reinforcement; classic forgetting-curve magnitudes (≈half within a day, majority within a week) | ✅ **well-established psychology**, applied to coaching by vendors |
| *"Coaching insight is not just information — it's a **state**, and states are more fragile than facts"* | ⚠️ **vendor framing** (CortexOS), rhetorically strong, not a research finding |
| *"Clients don't need more content; they need more continuity"* | ⚠️ **vendor framing** — but it is the market articulating AIN's thesis independently |
| Working alliance is a significant predictor of coaching outcomes | ✅ meta-analytic, cited across sources |
| **% of coaching value lost between sessions** | ⛔ **NO SUCH FIGURE. Not estimated.** (G2) |

### ⭐ The defensible structural fact — arithmetic, not a claim

> **12 sessions × 60 minutes = ~12 hours of contact per client per year.**
> The other ~8,750 waking hours are outside the relationship entirely.

That single line does more work than any invented percentage, and it is **arithmetic over an industry
median**, not an assertion about value.

⭐ **The statement to use — structural, not quantified:**

> **Coaching creates transformation through relatively few moments of direct contact, while the person's
> life continues between those moments.**

⛔ **The percentage stays out** — it invites invented precision, and the structural fact is stronger without it.
⭐ **The opportunity is therefore NOT *"replace coaching."*** It is: **increase the continuity of the
developmental relationship without pretending to replace the human relationship.**

---

## 3. ⚠️⚠️ The counter-evidence — read this before building a pitch on §2

> **By early 2026, most AI-coaching platform deployments are reportedly being quietly rolled back.**

Reported failure pattern: **generic advice** · usage declining after initial curiosity · managers asking for
human coaches for *"complex cases"* — **which turned out to be most cases**. AI coaching reportedly works
only with **narrow scope, immediate feedback, measurable skill metrics**, and **fails when positioned as a
relationship replacement.**

⛔ **This cuts at AIN directly.** *"An AI layer between coaching sessions"* is precisely the thing the market
has already tried and is reportedly retreating from. The differentiation claim must survive this, not route
around it.

### ⭐⭐⭐ The distinction to keep explicit — it is not "AI versus human"

```text
FAILURE PATTERN              AIN'S INTENDED POSTURE
AI                           AI
 ↓                            ↓
generic advice               contextual reflection
 ↓                            ↓
user disengagement           member meaning
                              ↓
                             human relationship STRENGTHENED
```

> **AI as AUTHORITY ⊥ AI as RELATIONAL INFRASTRUCTURE.** ⛔ Never let the argument collapse into
> *"AI versus human"* — that framing concedes the wrong axis.

⭐ **The honest reading, and it is genuinely favourable:** every listed failure is a failure of **posture**,
not of continuity. Generic advice = speaking without grounds. Premature interpretation = authoring the
member's meaning. Relationship replacement = the guru stance. **AIN's governance layer refuses all three by
construction** — the no-synthesis rule, `declared ≠ derived`, *witness not expert*, and the CF-D5c guard
(*no member meaning may acquire a source it did not choose*).

⚠️ **But that is a Designed advantage, not a demonstrated one.** ⛔ Nothing here shows AIN avoids these
failures in production — no member has walked the field yet. **This is the argument for D9, not a substitute
for it.**

---

## 4. Practitioner economics — ⚠️ weak sourcing, internal contradictions

⛔ **Do not build a pitch on these numbers.** They come from SEO-aggregator statistics pages, not ICF primary
research, and **they contradict each other**:

| Figure | Conflict |
|---|---|
| Global coaching revenue **$5.34B (2025) → $5.8B (2026)** | ⛔ irreconcilable with *"executive coaching reached $103.6B in 2026"* in another source — a ~20× gap on overlapping scope |
| *"Annual industry practitioner revenue $15.2B"* | ⛔ also inconsistent with the $5.34B figure |

**Figures that recur consistently enough to use directionally:**

| | |
|---|---|
| Coach practitioners worldwide | ~123,000 (2025); ~109,000 (2022); ~71,000 (2019) — **growing** |
| Executive coaches | ~15,000 globally |
| Sessions per client per year | **~12**, 60 min, sold in 3–6 month blocks |
| Median fees | ~$244/hr global · executive $400–500+/session · ICF-credentialed $272 vs $148 non-credentialed |
| Active coach: hours / clients / income | **11.6 hrs per week · ~12.4 active clients · ~$49,283/yr** |

### ⭐ The economics observation that survives the bad sourcing

An active coach works **~11.6 billable hours a week** and earns **~$49k**. The constraint is not demand or
pricing — it is that **the only sellable unit is an hour of presence.** A practice-extension layer sells
something that is not an hour. ⚠️ **Whether practitioners would pay for it is UNTESTED** — no willingness-to-
pay evidence was found, and none is asserted.

---

## 5. The category question — verdict

> **Is AIN competing with coaching platforms, or creating a category those platforms will eventually need?**

**Finding:** searching for an existing category combining *between-session continuity* with *member-owned
meaning / data sovereignty* surfaced **no such category**. Sovereign-AI language exists but is
**infrastructure-scoped** (where models and data live), not **relationship-scoped** (who owns the meaning).

⚠️ **G3: this is a weak-instrument null.** One search pass is not a market scan. It is **consistent with** the
founder's suspicion; it does **not verify** it.

### Where the evidence actually points

| Reading | Support |
|---|---|
| **AIN competes with coaching platforms** | weak — AIN has no marketplace, no billing, no scheduling, no org benchmarking. It does not do what buyers currently purchase |
| **AIN builds the layer those platforms lack** | ⭐ stronger — the between-sessions gap is independently articulated by the market, and no incumbent's data model can host member-owned meaning **because their business model requires the org to be the reporting customer** |

### ⚠️ CORRECTED 2026-08-03 — the incumbent argument was overstated

⛔ **Withdrawn:** *"BetterUp cannot adopt AIN's model without breaking its own."* **Too absolute**, and
therefore easy to dismiss. Replaced with the accurate and harder-to-dismiss form:

> **A measurement-centered coaching platform has different incentives and data structures from a
> sovereignty-centered member field. Moving toward member-owned meaning would require changing what the
> platform considers valuable evidence.**

⭐ **Different category logics can coexist.** The argument is about **what each platform treats as evidence
of value** — org-level rollup versus the member's own continuity — not about capability.

### ⭐⭐⭐ The category thesis to preserve — testable, not declarative

⛔ **Not** *"AIN is a new category"* — **too early**, and unfalsifiable today.

> **AIN introduces a different organizing principle for human development technology: the member's lived
> experience becomes the primary field of continuity, while practitioners contribute contextual lenses
> rather than ownership of the person's development record.**

⭐ **That is testable** — and the walk with real members is what tests it. **The category only exists if
people actually experience the difference.**

> **The architecture may be coherent. The category is earned when someone says, without being taught:**
> ### **"This is where my work continues."**

---

## 6. ⛔ What this document does NOT establish

⛔ That AIN's architecture works in production · that members experience the difference · that practitioners
will pay · that a category exists · any figure for value lost between sessions · that the $5.34B / $103.6B
market sizes are reliable · that Larry's audience wants this.

> **The unresolved question is not whether the architecture is coherent. It is whether an untrained human
> perceives that coherence without having it explained.** No market map can answer it. **D9 can.**

---

## Sources

- [Torch — coaching platform comparison](https://torch.io/compare/) · [BetterUp — Guide to Evaluating Coaching Platforms](https://www.betterup.com/hubfs/Guide%20to%20Evaluating%20Coaching%20Platforms_June2022.pdf) · [Boon — enterprise coaching platforms](https://www.boon-health.com/learn/resources/best-enterprise-coaching-platforms) · [BetterUp business model](https://businessmodelcanvastemplate.com/blogs/how-it-works/betterup-how-it-works)
- [CoachAccountable review](https://bestcrmforcoaches.com/reviews/coachaccountable-review/) · [CoachAccountable guide](https://quso.ai/blog/coachaccountable-review-complete-guide-coaching-software) · [Client portal software for coaches](https://agiled.app/blog/best-client-portal-software-for-coaches)
- [Insight events in coaching sessions (IJEBCM, Oxford Brookes)](https://radar.brookes.ac.uk/radar/file/55d0b0da-34a1-4dde-b729-fe3b9294dbd4/1/IJEBCM_S13_08.pdf) · [The Second Session Problem (CortexOS)](https://cortexos.app/library/the-second-session-problem/) · [The Continuity Crisis in AI Coaching (MaxGood)](https://blog.maxgood.work/the-continuity-crisis-in-ai-coaching-why-your-ai-coach-forgets-you-and-why-that-matters/) · [Continuum Coaching Model](https://www.gregcdansereau.com/journal/the-continuum-coaching-model)
- [Why AI Coaching Felt Smart but Failed (Noomii)](https://orgs.noomii.com/why-ai-coaching-felt-smart-but-failed) · [Hidden Dangers of AI Coaching (Noomii)](https://orgs.noomii.com/the-hidden-dangers-of-ai-coaching) · [State of AI in Coaching Businesses 2026](https://www.thecoachscmo.com/state-of-ai-coaching-2026)
- [ICF coaching statistics (Simply.Coach)](https://simply.coach/blog/icf-coaching-statistics-industry-insights/) · [Coaching rates benchmarks 2026](https://coachstackhub.ai/research/coaching-rates-benchmarks-2026) · [Coaching industry market size](https://luisazhou.com/blog/coaching-industry-market-size/)
- [What is Sovereign AI? (McKinsey)](https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-sovereign-ai) · [Data sovereignty for AI agents (Atlan)](https://atlan.com/know/ai-agent/data-sovereignty-for-ai-agents/)
