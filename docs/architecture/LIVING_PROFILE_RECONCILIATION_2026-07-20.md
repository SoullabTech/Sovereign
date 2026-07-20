# Living Profile — Phase 1 Reconciliation

**Date:** 2026-07-20
**Status:** RECONCILIATION MAP. Follows and depends on `SPIRALOGIC_LIVING_PROFILE_EVALUATION_2026-07-20.md` (closed). Maps six systems; answers one question. Authorizes nothing.
**Primary question:** *Is the Living Profile a product, or an aggregation layer?*
**Answer up front:** **An aggregation layer — and it already exists, in two disjoint halves that have never been named as one thing.** The product framing is the refused path, and the repo contains the archaeological proof (SHIFt).

---

## 1. The six systems, surveyed (repo state, 2026-07-20)

| System | Category | Authorship | Persistence | Surfacing | Repo state |
|---|---|---|---|---|---|
| **Journey Framework** | Ratified sequence (5 gated steps) | — (governs the others) | — | — | Spec + conformance run done; step 2+ pending |
| **/journey** (its live surface) | Cat 6 | Symbolic rendering (deterministic spine) + LLM report prose | Report stored | **Member-pulled** (visit + click generate) | LIVE: `app/journey/page.tsx` ← `lib/astrology/engines/spiralogicEngine.ts` |
| **Soul Portrait** | Cat 6 | LLM-authored from chart (spine wire = pending step 2) | **Immutable**, write-once, provenance + consent ledger | **Member-pulled**; practitioner-gated draft flow | LIVE: `lib/soulPortrait/`, `soul_portraits` + `soul_portrait_consents` |
| **Holoflower** | Rendering grammar, not a data system | **Inherits** the constitutional status of whatever drives it | None of its own | Ambient-decorative in most routes; interactive in check-in/survey variants | LIVE: many variants; `SacredHoloflower` accepts member `userCheckIns` |
| **SHIFt** | **Cat 4 dormant** | System-inferred (implicit path) + member survey (explicit path) | Stubbed ("would be database queries") | **Never surfaced**; zero live callers | UNWIRED legacy tree `app/api/_backend/src/` (`@ts-nocheck`) |
| **Bridge D** | Cat 6 | System-inferred — but **structural position only, no content** | `member_spiral_state` | **Not member-surfaced** (seeds conductor; one read-only API) | LIVE: `lib/consciousness/spiralStatePersistence.ts` ← oracle route |
| **MemberLiveContext** *(found in survey, not on the original list)* | Cat 6 — **unnamed aggregator** | Aggregates: spiral state, natal/astrology, recent journal, patterns, sessions | Assembled per-request | Feeds **MAIA only** (oracle/between/sovereign paths); no member page | LIVE: `lib/memory/MemberLiveContext.ts` |

*Disambiguation:* `lib/services/ShiftPatternService.ts` is a different, wired system (elemental-state *transition* detection) — not SHIFt. The name collision should be noted wherever SHIFt's disposition is decided.

## 2. The relationship map

```text
                    JOURNEY FRAMEWORK (the governing sequence — "our Gene Keys")
                    step1 spine ✓ → step2 wire portrait → step3 one-spine-two-surfaces
                    → step4 contemplation → step5 MAIA-held profile
                          │
        ┌─────────────────┼──────────────────────┐
        │                 │                      │
   SOUL PORTRAIT      /JOURNEY             FIVE QUESTIONS (future, step 4)
   Recognition        Orientation          Inquiry
   "Who am I?"        "What season?"       "What is alive?"
   immutable          member-pulled        member-authored answers
   rendering          report               universal, unpresupposing
        │                 │                      │
        └────────┬────────┴──────────┬───────────┘
                 │                   │
           HOLOFLOWER          (renders any of them —
           shared visual        constitutional status
           grammar              flows from the data, not the flower)
                 │
   ══════════ member-facing half ══════════
   ══════════ MAIA-facing half ════════════
                 │
        MEMBERLIVECONTEXT  ←──  BRIDGE D (spiral state: continuity, anti-regression)
        the de-facto             configures MAIA's participation,
        aggregation layer        never surfaced as a claim
        feeds MAIA only
                 │
              [ MAIA in conversation — ephemeral expression,
                governed by speech-act + presupposition tests ]

   SHIFt — outside the living map: the dormant ancestor.
   Its implicit path IS the refused assessment logic (stored inferred profile).
   Its explicit survey IS a crude precursor of the Five Questions.
```

**Mode assignments** (per the ratified "mode, not type" canon): Soul Portrait = Recognition · /journey = Orientation · Inner Guide = Encounter · Five Questions = Inquiry (the mode the evaluation added). The Living Profile is **not a fifth mode** — it is what holds the modes adjacent.

## 3. The answer, precisely

**The Living Profile is an aggregation layer, not a product.** Three arguments, one from each direction:

**3a. Archaeological.** The platform already built the product version once. SHIFt is a complete implicit-inference assessment engine — 12-facet profile scored from conversation features — and it sits unwired, `@ts-nocheck`, persistence stubbed, zero callers. It was never refused by ruling; it simply never earned wiring. The evaluation (closed yesterday's thread) now supplies the constitutional reason retroactively: a stored, system-inferred, system-authored profile is Assessment Logic, and every live system that DID earn wiring took the other shape (member-pulled, provenance-carrying, consent-gated). The codebase already voted.

**3b. Structural.** The aggregation layer already exists in two halves:
- **MAIA-facing half:** `MemberLiveContext` — spiral state + astrology + journal + patterns assembled per-request to attune MAIA's participation. This is Journey Framework **step 5 in embryo** ("MAIA holds the profile as standing context"), live and unnamed — an inverse-drift instance: Cat 6 infrastructure invisible because nobody said its name.
- **Member-facing half:** /journey + Soul Portrait (+ future Five Questions), each member-pulled, each carrying its own authorship and provenance.
A "Living Profile product" would be a third thing duplicating both. Nothing needs it.

**3c. Constitutional.** A product delivers a result; results have an author; the author would be the system — the exact crossing the evaluation refused. An aggregation layer, by contrast, can honor **co-presence without synthesis**: each pane keeps its own authorship label (symbolic rendering / member-authored / system-held continuity), nothing merges them into a unified claim about the person. Cross-layer **synthesis** remains frozen (Cat 5, §0.C); cross-layer **adjacency** is what rooms already do.

## 4. The constraints the layer inherits (all pre-existing, none new)

1. **Co-presence, never synthesis.** The layer may place the Portrait beside the season beside the member's answers. It may not compute anything *from* their combination into a new claim. (Freeze doctrine, Cat 5.)
2. **Each pane declares its author.** Symbolic rendering ("your chart's registration…") / member-authored ("you wrote…", with provenance) / system-held continuity (Bridge D — which stays unsurfaced unless it passes through the consent architecture). (Constitutional sentence; §5b of the evaluation.)
3. **Member-pulled by default; anything ambient passes the standing-consent gate.** ("Selection becomes assertion when it persists" — anchor-gate pattern.)
4. **The MAIA-facing half configures participation, never the person.** MemberLiveContext exists so MAIA can attune; the moment its contents are spoken as assertions, the speech-act grammar governs, and the moment they are *displayed*, constraint 2 governs. (Nothing-configures-the-person.)
5. **Holoflower inherits, never launders.** Rendering system-inferred state through a beautiful member-facing flower does not change its constitutional status. The only Holoflower variant that may carry member state ambiently is one fed by member-authored check-ins.

## 5. What Phase 1 surfaces for later phases (findings, not authorizations)

- **F1 — Name the embryo.** MemberLiveContext should be recognized in the record as Journey Framework step 5 in embryo (inverse-drift discipline: production substrate must be named). Whether it ever *becomes* the held profile stays behind the existing step-5 gates (Gates 3/4, Personal Portal consent shape). **Precision that must travel with this finding: the embryo has the body but not the constitution** — the assembly mechanics exist; the authorized consent shape does not. Naming it is inventory, not promotion, and must not quietly grant the standing the gates were built to withhold.
- **F2 — SHIFt needs a Cat 4 disposition** (rename / gut / Later-with-named-gate), now with constitutional grounds: the implicit path is refused logic; the explicit-survey types may be worth salvaging as prior art for the Five Questions surface. Also resolve the ShiftPatternService name collision.
- **F3 — The spine wire (step 2) is the binding constraint** for everything member-facing: until `spiralogicEngine` grounds `generatePortrait`, the Portrait's elemental claims are LLM echoes (conformance finding C1), and no aggregation surface should imply otherwise (claim discipline).
- **F4 — Bridge D's boundary is now statable:** it is the one legitimate stored system-inference *because it does not surface*. Any future member-facing rendering of `member_spiral_state` ("your element is…") converts it to a stored assertion → consent architecture + authorship label required. The read-only `/api/members/spiral-state` endpoint sits exactly on this line and should be flagged when the layer is designed.
  **ERRATUM (2026-07-20, same day — from `RENDERING_STATUS_AUDIT_2026-07-20.md` F-01/F-02):** this finding's premise is factually wrong about the repo. `member_spiral_state` IS member-surfaced today: `ContinuityView` renders element/phase/motion/relational-phase/autonomy-streak at `/worlds/journey` and in Account Settings under the heading "Your Current Position," with zero disclosure that it is inferred. The flag condition F4 deferred to "when the layer is designed" had already fired before this paper was written. Bridge D's constitutional standing as "legitimate because unsurfaced" does not describe the repo; the §1 table row "Not member-surfaced" is likewise corrected. Decision now with Kelly (briefing D8): disclose, consent-gate, or unsurface.
- **F5 — The Holoflower check-in path** (`userCheckIns`, `HoloflowerSurvey`) is the only live member-authored elemental input in the codebase — the natural ancestor of the Five Questions surface, worth auditing before step 4 is designed.

## 6. What the Living Profile is NOT (builder-facing guard, added on second pass)

Future builders will drift toward these assumptions; each is refused in advance (describe-by-refusal pattern):

- **Not a personality assessment** — SHIFt's implicit path, unwired for a reason (§3a).
- **Not a score, index, or metric** — RFI/UFI remain Cat 1 anti-drift examples.
- **Not a synthesized identity or unified profile object** — synthesis is frozen (Cat 5); adjacency is the whole design.
- **Not a developmental verdict or type** — "mode, not type" is canon; verdicts cross the ontological column.
- **Not a recommendation engine** — invitations may exist only under the standing-consent gate; the layer itself recommends nothing.
- **Not a new data model** — it holds pointers to objects that already own their storage, provenance, and consent.

**Ruling-sentence candidates filed for Kelly (with the evaluation's):**
1. *The Living Profile is a room, not a result.*
2. *The Living Profile does not describe the person; it preserves the relationships among the lenses through which the person encounters themselves.*
3. *Rendering cannot change constitutional status* — ("Holoflower inherits; it never launders") — note this one generalizes past this paper: dashboards, summaries, reports, any future memory surface.

---

**Phase 1 disposition:** map complete. The Living Profile names the constitutional convergence of two existing halves — an aggregation layer with a room on top, governed entirely by constraints that already exist. No product. No build authorized by this document.

---

## 7. Archaeology addendum (2026-07-20, post-close) — the claimed genealogy vs the verified one

A proposed ancestry arrived after close: *"Elemental Gifts → Native Capacities → SHIFt → Living Profile inquiry,"* citing an "Elemental Gifts" framework, a "Native Capacities" framework, and a "PHASE 6 — ARCHETYPAL / ELEMENTAL / SPIRALOGIC SYSTEM MAP" paper. A very thorough repo sweep (code + all markdown, including Community-Commons) was run to verify.

**7a. NOT FOUND — verified absences (whole repo, case-insensitive):**
- "Elemental Gifts" — nowhere.
- "Native Capacities" — nowhere (only hit: "native Capacitor shell," the mobile framework).
- "PHASE 6 — ARCHETYPAL / ELEMENTAL / SPIRALOGIC SYSTEM MAP" — nowhere. SHIFt itself has only 5 phases; no phase 6 exists in any Spiralogic structure in the repo.
- "Five Questions" as a named framework / "what comes naturally" — nowhere. **The Five Questions were born in this evaluation cycle** (proposed by the outside dialogue, transformed by the evaluation). They have no repo ancestor.
- StrengthsFinder / CliftonStrengths / "talents" — nowhere.

If these frameworks exist, they exist outside the repo (personal vault, old notes, another machine) — **claim discipline: not citable as platform history until Kelly produces the artifact.** Precedent: the WISDOM_IS_RECOVERED.md canon citation that turned out not to exist in the repo (CLAUDE.md, anchor note).

**7b. FOUND — the real genealogy is five strands, none of them a gifts framework:**
1. **SHIFt's 12 facets** (`app/api/_backend/src/types/shift.ts:24-37`): F1 Meaning, F2 Courage (fire) · E1 Coherence, E2 Grounding (earth) · W1 Attunement, W2 Belonging (water) · A1 Reflection, A2 Adaptability (air) · AE1 Values, AE2 Fulfillment, C1 Integration, C2 Integrity (aether). Scored dimensions — **no** gifts/overuse/underuse vocabulary.
2. **PersonalOracleAgent's resource model** (`app/api/_backend/src/agents/PersonalOracleAgent.ts:125,141,143,990`): "natural elemental strengths," "capacities wanting to develop," "recognizing and celebrating their natural gifts and capacities" — the nearest true ancestor, and notably it frames gifts as **resources MAIA recognizes in conversation**, not a profile output.
3. **"Developmental edge"** as a recurring motif (EnhancedSHIFtNarrative, IndividuationProcess, MAIA reflection/supervision docs).
4. **"Capacities, not deficits"** — the Presence Principle stance (Community-Commons) — the values ground any gifts language would stand on.
5. **"Strengths and distortions/shadows"** pairing in the astrology member manuals (Mayan/Chinese) — per-symbol, not per-person.

**7c. Consequence for the record.** The "Elemental Gifts table" (Visionary: when healthy / when overused / when neglected / what balances it) is a **new proposal wearing the costume of a memory**. Judged on its own terms it is constitutionally interesting: a universal grammar describing *capacities and their weather* (healthy/overused/neglected) describes **patterns, not persons** — clean as reference vocabulary (kin to the astrology manuals' per-symbol strengths/shadows), and it becomes typing the moment the system *assigns* it. Disposition: filed as **prior-art input to D5** (Five Questions surface), alongside SHIFt's explicit-survey types. No framework mint; no new ancestor claimed.

**7c-bis. Provenance classification (binding on future sessions — do not re-canonize unverified memory):**

| Candidate | Provenance status |
|---|---|
| SHIFt (12 facets, implicit/explicit) | **Verified ancestor** (repo, unwired) |
| PersonalOracleAgent resource model | **Verified ancestor** (repo, live framing: gifts recognized in encounter) |
| "Developmental edge" motif | **Verified recurring pattern** |
| "Capacities, not deficits" (Presence Principle) | **Verified philosophical lineage** |
| Astrology strengths/distortions (per-symbol) | **Verified symbolic lineage** |
| Elemental Gifts | **External-memory candidate** — not platform history until Kelly produces the artifact |
| Native Capacities | **External-memory candidate** — same condition |
| "Phase 6" archetypal/elemental system map | **External-memory candidate** — same condition |
| Five Questions | **New emergence (this 2026-07-20 cycle)** — enters by discover → test → ratify, not recover → implement |

A third failure mode named here for future sessions: **retrospective synthesis** — genuinely new ideas that arrive wearing a feeling of recognition because they resonate with earlier work. The feeling of familiarity is not provenance.

**7d. The archaeology strengthens §3a rather than weakening it.** Even the imagined genealogy conforms to the pattern: everything assessment-shaped (SHIFt scoring, implicit inference) stayed unwired; everything that survived into live code frames capacities as things MAIA *recognizes in encounter* (strand 2) or the member *reads in a symbol* (strand 5). The codebase voted the same way twice.
