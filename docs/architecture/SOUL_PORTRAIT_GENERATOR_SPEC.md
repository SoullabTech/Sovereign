# The Soul Portrait Generator — Architecture & Quality Spec (DRAFT)

> **Status:** DRAFT / candidate architecture (Kelly 2026-06-22). The five hand-authored portraits (Katie, Augusten, Sophie, Andrea, Kelly) are the working prototype; this is the path to a member-facing *generator field* in the Astrology section. **Editorial authorship + authorization: Kelly.** Nothing built yet — design first.

## What it is
A field in the **Astrology section** where a member enters (or uploads) birth data — date, exact time, and place of birth (DOB/TOB/POB) — for themselves *or* someone they're gifting. The platform computes the chart + the year's transits, generates a full literary three-layer Soul Portrait (Part I + the Year Ahead) in the established voice, and lets the member **review, edit, and send** it — always with an optional, freely-chosen door to go deeper on the platform.

## The two halves
1. **The astrology engine (computation).** Accurate chart + transits from DOB/TOB/POB. **Self-hosted Swiss Ephemeris** — no external API, no cloud dependency (sovereign by design). Output = structured chart DATA (placements, houses, aspects, chart patterns, current transits) — exactly the DATA I've been hand-fed from Astrograph, now computed in-house.
2. **The interpretation engine (the writing).** Turns chart DATA → the portrait, in the established voice. **This is where the quality lives.**

## How the generator reaches the hand-authored quality (the core question)
The quality was never magic — it is **encodable**. Six levers:
1. **Same intelligence.** Claude (strongest model) via the Anthropic API as the interpretation engine — the sanctioned primary AI (`ANTHROPIC_API_KEY`). The generator is Claude, doing what I did here.
2. **Signature-first synthesis, not placement-by-placement.** The pipeline first extracts the chart's *signatures* — the funnel/bucket, the stelliums, the tightest aspects, the chart ruler and the *leading planet* — and builds the reading **around** them. This is what made the portraits coherent instead of a list of placements.
3. **The standards as the system prompt.** Encode what made them good: the **Traceability Covenant** (DATA→meaning; prose written fresh; never copy copyrighted interpretation text), **anti-Forer/Barnum** (specific to *this* chart), the **Life→Meaning inversion** (astrology disappears beneath the experience), the **magic-not-equivocation** register, the **three living layers** (Soul Portrait → Year Ahead → Living Spiral), the **Dance of Elements** (ecology, not typing), **end-blessed-not-informed**, **attune-don't-assess**, **a-portrait-may-be-given/a-relationship-must-be-chosen**.
4. **The five hand-authored portraits as gold-standard exemplars (few-shot).** The single biggest quality lever — the model writes in the *proven* voice by example.
5. **The schema as the output contract.** The generator populates the existing `LiterarySoulPortrait` shape → renders through the existing renderer, unchanged.
6. **Guardrails + the two-key release gate.** Automated checks (no essence-claims, no fate/prediction, no Forer language) **and** a human editorial approval before anything is sent. The giver — who knows the recipient — reviews and edits. *Technical attestation that it generated ≠ editorial truth that it's right.* The generator drafts to a high bar; a human signs off.

## Multiple systems (Western · Sidereal · Chinese · Mayan)
- **Western tropical** — what we have. Solid.
- **Sidereal / Vedic** — same ephemeris, shifted zodiac (ayanāṁśa) + its own techniques (nakshatras, dashas). A real interpretation layer, **computable on the same engine**.
- **Chinese (BaZi / Four Pillars, zodiac animals)** — a *different* system (lunar calendar, five elements, animals). Its own engine/logic.
- **Mayan (Tzolkin day-signs)** — another distinct calendrical system.
- **Recommendation:** start with **"insights woven in"** — the Western-based portrait enriched by one thread from each tradition (your Chinese animal+element, your Vedic Moon nakshatra, your Mayan day-sign) as an *"Across the Traditions"* chapter. Full, separate per-system reports are a later, larger phase. Honest scope: **each full system is its own build.**

## Consent & sovereignty (non-negotiable)
- **Consent of the person being portrayed** is the new frontier: making a portrait of *another* person. Needing their birth data is a partial natural signal, not the whole — a product needs an explicit **Path B** reception/consent gate, especially if a recipient could ever be a **minor**.
- **The gift → deeper-platform door** must honor *a portrait may be given; a relationship must be chosen*: the report is complete in itself; going deeper is the recipient's free choice, never a funnel.
- **Two-key release:** nothing auto-sends; a human approves every portrait before it reaches a person.

## Sequenced build (each phase is its own slice; Kelly reviews between)
1. **Engine** — self-hosted ephemeris → structured chart + transit DATA (replaces the hand-fed Astrograph reports).
2. **Generator pipeline** — signature-extraction → Claude-with-standards-+-exemplars → `LiterarySoulPortrait` → existing renderer.
3. **The field / UI** — the Astrology-section surface: enter/upload birth data, generate, review/edit, send (two-key gate).
4. **Consent / Path B** — recipient reception + the freely-chosen deeper door.
5. **Multi-tradition insights** woven in; full per-system reports later.

## The proof test
The generator is ready when it can **reproduce one of the five hand-authored portraits from chart data alone**, at a quality Kelly would sign off on. That is the bar — concrete and falsifiable.
