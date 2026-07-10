# Spiralogic Registration Grammar — Falsifiability Spec

**Date:** 2026-07-09 · **Status:** EXTRACTED FROM CODE (describes what the code does, not what it intends)
**Frozen subject:** `clean-main-no-secrets` @ `c7019ee95` (read via worktree `/Users/soullab/.worktrees/soul-portrait-form-fix`). The current dev branch `feature/now-what-maia-presence` does **not** contain the Soul Portrait generator files; all `lib/soulPortrait/generator/*` and route citations below are against clean-main. All other cited files are identical paths on both branches unless noted.

---

## 1. The Grammar (one page)

### Inputs (deterministic core)

| Input | Schema | Source |
|---|---|---|
| Birth date | `YYYY-MM-DD` string, regex-validated | `ephemerisCalculator.ts:19-31,583-615` |
| Birth time | `HH:MM` (or `HH:MM:SS`, seconds ignored) **local wall clock** | `:589-601` |
| Location | `{lat: -90..90, lng: -180..180, timezone?: IANA string}` | `:22-29,604-614` |
| House system | `'whole-sign'|'equal'|'porphyry'|'placidus'|'koch'`, default **'porphyry'** | `:17,30,750` |

**Timezone rule:** local→UTC via IANA zone with historical rules when `timezone` is valid (`resolveBirthTimeUTC`, `:674-698`, two-pass fixed-point for DST edges); otherwise silent fallback to `round(lng/15)` (`:700-710`). The Soul Portrait route requires `timezone` **present** but not **valid** (`app/api/soul-portrait/generate/route.ts:46`). No ayanamsa in this path (tropical zodiac throughout; vedic routes are separate).

### Mapping rules (each a testable proposition)

- **R1 — longitude→sign:** `sign = ZODIAC_SIGNS[floor(((lon % 360)+360)%360 / 30)]`, degree-in-sign rounded to 2 dp (`ephemerisCalculator.ts:81-92`).
- **R2 — longitude→house:** planet is in house *i* iff `cusp[i] ≤ lon < cusp[i+1]` (wrap-aware), **except** a planet 0–5° before an angular cusp (1/4/7/10) is pulled into that angular house (`:97-140`).
- **R3 — house→element/phase (the Spiralogic wheel):** Fire = houses 1,5,9 · Water = 4,8,12 · Earth = 10,2,6 · Air = 7,11,3; phases vector/circle/spiral in that listed order per element. **No house maps to aether.** Two parallel tables agree on element+phase, differ on labels: `spiralogicMapping.ts:32-164` and `spiralogicHouseMapping.ts:16-108`.
- **R4 — sign→element:** classical triplicities, no aether (`engines/spiralogicEngine.ts:14-27`; unweighted duplicate at `lib/services/maiaAstrologyContextService.ts:923-934`).
- **R5 — elemental balance (weighted, `/api/astrology/reading` path):** sum `PLANET_WEIGHTS` over 10 planets' sign-elements (Sun/Moon 3, Jupiter/Saturn 2, Venus/Mars 1.5, others 1), normalize to integer %; dominant = max, deficient = min (`spiralogicEngine.ts:59-117`).
- **R5′ — elemental balance (unweighted, live MAIA context path):** count of 10 planets per sign-element, no normalization (`maiaAstrologyContextService.ts:778-797,520-524`). **R5 and R5′ can disagree on dominant element for the same chart.**
- **R6 — facet activation:** houses containing planets activate their facet; intensity = Σweights/10 capped at 1; sorted desc; "current phase" = element+stage of top facet (`spiralogicEngine.ts:177-236`).
- **R7 — aspects:** all pairs over 17 bodies (10 planets + nodes + Chiron + Lilith/Ceres/Pallas/Juno/Vesta); orbs conj/opp/trine/square 8°, sextile 6°, quincunx 3°; `exact = orb < 1` (`ephemerisCalculator.ts:533-578`).
- **R8 — decan:** `decan = floor(degree/10)` within sign via 36-decan table (`decanCalculator.ts:72-95`). **Dormant — no production caller.**

### Invariants (same birth data → identical, always)

Given identical `BirthData`: UTC instant, all 17 longitudes, signs, degrees, house cusps, house assignments, retrograde flags, aspect list **including array order**, R3–R7 outputs, and the portrait prompt's `chartSummaryText` string are all bit-identical across runs (pure functions of input; no randomness, no clock reads in the natal path).

### Degrees of freedom + leash

| Freedom | Leash |
|---|---|
| **The entire chart→element registration in the Soul Portrait** — the LLM reads raw placements and writes the five element paragraphs itself | JSON key schema only (`portraitPrompt.ts:55-61`); element **keyword** pinned from `ELEMENT_META` (`generatePortrait.ts:59`); temperature 0.7 (`:171`) |
| Archetype selection + resonance | Filtered to 9-key catalog, max 4, resonance defaulted to `'present'` (`generatePortrait.ts:65-75`) |
| Which placements the portrait cites, and their claimed sign/house | **None** — LLM strings pass through unchecked (`generatePortrait.ts:77-82`) |
| Outer-planet relational readings (Uranus×Mercury etc.) | Prompt instruction only (`portraitPrompt.ts:84-89`); not enforced in code |
| Spiralogic Report facet narratives | Per-facet deterministic fallback if LLM omits a house (`spiralogicReportGenerator.ts:314-321`) |
| All portrait prose registers | System-prompt DESIGN LAW (`portraitPrompt.ts:77-82`) + minimum-viability guard on 3 fields only (`generatePortrait.ts:143-145`) |

---

## 2. Call graph — what actually runs

**Live Soul Portrait path** (`POST /api/soul-portrait/generate`, practitioner-gated, `route.ts:16,67`):

```
birthData → calculateBirthChart (ephemerisCalculator.ts:721)   [deterministic]
         → chartSummaryText (portraitPrompt.ts:32-46)          [deterministic, lossy]
         → deep-tier LLM, temp 0.7 (generatePortrait.ts:157-173) [LLM]
         → parseModelJson + assemble against catalogs (:43-147)  [deterministic leash]
```

**Answer to the critical question: none of `spiralogicMapping.ts`, `spiralogicHouseMapping.ts`, `spiralogicSystem.ts`, `decanCalculator.ts`, or `spiralogicReportGenerator.ts` participates in the portrait path.** `generatePortrait.ts:11-23` imports only the ephemeris, the LLM provider, the schema catalogs, and the prompt module. The chart→element registration step in the live generator is **performed by the LLM in prose**, bounded only by the JSON contract. The deterministic registration engine that exists in the repo (`spiralogicEngine.ts`) is not called there.

**Outer-planet relational-aspect rule:** instructed to the LLM (`portraitPrompt.ts:84-89`), **not** enforced by aspect-detection gating. The aspect data supplied is additionally lossy (see A3) and outer-planet *placements* are omitted from the summary entirely (`KEY_BODIES`, `portraitPrompt.ts:19-29`, has no Uranus/Neptune/Pluto).

| Module | Status | Evidence |
|---|---|---|
| `ephemerisCalculator.ts` | **LIVE** | portrait route; `/api/astrology/birth-chart/route.ts:13`; live MAIA context; many others |
| `generatePortrait.ts` / `portraitPrompt.ts` | **LIVE** | `app/api/soul-portrait/generate/route.ts:16` |
| `maiaAstrologyContextService.ts` | **LIVE** (MAIA conversation context) | `app/api/sovereign/app/maia/list/route.ts:99,590` |
| `engines/spiralogicEngine.ts` | Reachable route, traffic unverified | `composeAstrologyReading.ts:27,197` ← `app/api/astrology/reading/route.ts:4`; also `spiralogicReportGenerator.ts:15,520` |
| `spiralogicMapping.ts` (facet table) | Reachable via UI + engines | `app/astrology/page.tsx:26`; `spiralogicEngine.ts:8`; `spiralogicReportGenerator.ts:19` |
| `spiralogicMapping.ts` `getElementalFacet` | **DORMANT** (0 callers) | grep: no importers |
| `spiralogicHouseMapping.ts` | UI-only | `app/astrology/page.tsx:27`, `app/journey/page.tsx:29`, `components/astrology/SacredHouseWheel.tsx:32` |
| `spiralogicSystem.ts` (FOCUS_STATES, HYBRID_FACETS) | **DORMANT** (0 importers) | grep: no importers outside itself |
| `decanCalculator.ts` | **DORMANT** in prod | importers: `decanTransits.ts` (itself 0 callers), `decanDemo.ts`, `app/api/_backend/...spiralogicAstrologyService.ts` (quarantined backend) |
| `spiralogicReportGenerator.ts` | Reachable route; stored output feeds live MAIA context | `app/api/astrology/spiralogic-report/route.ts:14`; summary injected at `maiaAstrologyContextService.ts:246-247` |
| `birthChartContextService.ts` | Wired to `PersonalOracleAgent` (route with ~zero live traffic per CLAUDE.md); its spiralogic import is dead code | `lib/agents/PersonalOracleAgent.ts`; dead import `birthChartContextService.ts:23` |

---

## 3. Findings

### A. Latent bugs (should be deterministic and correct, isn't)

1. **Retrograde flag wraps wrong at 0° Aries** — `ephemerisCalculator.ts:180-183`: `lon2 < lon1` with no 360° wrap handling; a direct planet crossing 0° between day N and N+1 is reported retrograde. Also `:171-177` computes `HelioVector` positions that are never used.
2. **Unverified asteroid positions feed the aspect pool** — Pallas/Juno/Vesta `M0` values explicitly "NOT verified… potentially 20-60° off" (`ephemerisCalculator.ts:390-394`), yet `calculateAspects` runs over all 17 bodies (`:533-578`) and those aspects are eligible for the portrait's 8-slot "Notable aspects" list (`portraitPrompt.ts:40-43`).
3. **Aspect list for the LLM is truncated by insertion order, not tightness** — `portraitPrompt.ts:40-43`: `filter(exact || orb<=4).slice(0,8)` with no sort; order comes from planet-pair loop order (`ephemerisCalculator.ts:548-575`). A 0.2°-orb Pluto×Venus aspect (late pair) can be dropped while a 4.0° Sun aspect stays — directly starving the outer-planet relational rule the prompt depends on.
4. **Duplicate key `'earth-aether'`** in `ELEMENTAL_FACET_COMBINATIONS` — `spiralogicMapping.ts:241` and `:253`; the second silently overwrites the first ("Practical Wisdom" is unreachable).
5. **`getElementalFacet` lookup never matches most keys** — `spiralogicMapping.ts:262-266` sorts inputs alphabetically (`fire,air → 'air-fire'`) but table keys are element-order (`'fire-air'`); most pairs return `undefined`. Dormant (0 callers) but a trap for any future wire-up.
6. **Placidus and Koch silently degrade to Porphyry** — `ephemerisCalculator.ts:270-280,316-320`; the `BirthChart` output does not record which system actually ran, so callers cannot detect the substitution.
7. **"True Node" is a mean-node formula** — `ephemerisCalculator.ts:144-165` computes the *mean* node (linear regression formula) while comments call it True Node (`:813-821`).
8. **Timezone provenance is computed then discarded** — `resolveBirthTimeUTC` returns `source: 'iana'|'longitude-approximation'` (`:658-664`) but `calculateBirthChart` only console.logs it (`:743-746`). An *invalid* IANA string passes the route's presence-only check (`app/api/soul-portrait/generate/route.ts:46`) and silently produces a lng/15 chart with no label anywhere downstream.
9. **`TIMEZONE_HANDLING.md` documents the fallback as "The Solution"** — the doc describes only the longitude approximation and never mentions the IANA path that the code actually prefers (`lib/astrology/TIMEZONE_HANDLING.md` §"The Solution" vs `ephemerisCalculator.ts:674-698`). Doc contradicts code.
10. **Two elemental-balance implementations disagree** — weighted (`spiralogicEngine.ts:59-117`) vs unweighted count (`maiaAstrologyContextService.ts:778-797`). Same member can be told different dominant elements by `/api/astrology/reading` and by live MAIA context.
11. **Dead weights** — `PLANET_WEIGHTS` defines `Chiron: 0.5` and `"North Node": 1` (`spiralogicEngine.ts:70-71`) but both balance (`:77-88`) and facet-activation (`:181-192`) loops iterate only the 10 planets; those weights are unreachable.
12. **Simplified Ascendant math with fixed obliquity** — `ephemerisCalculator.ts:336-350` ("Simplified formula (would need more precision for production)"), obliquity hardcoded 23.4393 (`:297`). ASC error propagates to every house cusp, so sign-boundary births can flip *all* house→element registrations.
13. **Angular-orb house pull is nonstandard and undocumented** — `ephemerisCalculator.ts:95-119`: a planet ≤5° before cusps 1/4/7/10 is reassigned to the angular house, creating a discontinuity against the standard rule at `:123-137`. Not stated in any spec or UI.
14. **Minimum-viability guard misses the elements** — `generatePortrait.ts:143-145` checks only `openingLetter`, `soulSignature.body`, `soulVocation`; all five elemental bodies may be empty strings and the draft still assembles.
15. **`getSignFromDegree` breaks on negative input** — `decanCalculator.ts:38-48`: `degree % 360` without `+360` normalization; negative longitudes fall through to the `'Aries'` fallback. Dormant path.
16. **`alchemicalStage` inconsistency across quadrants** — phase-3 states are `'integrates'` for Fire/Earth/Air but `'completes'` for Water (`spiralogicSystem.ts:158,208,258,308`). Dormant file; flags either design intent or copy error.

### B. Undocumented degrees of freedom (intentional-looking; spec should name them)

1. **LLM selects 3–4 archetypes of 9 and assigns resonance** — leash: catalog-key filter + `slice(0,4)` + default `'present'` (`generatePortrait.ts:65-75`); archetype *name* pinned to catalog, but essence/gift/shadow prose is free.
2. **LLM writes element titles and bodies freely**; only the per-element `keyword` is code-pinned (`generatePortrait.ts:58-62`, `lib/soulPortrait/schema.ts:317-360`). Sampling: `temperature: 0.7`, `maxTokens: 8000` (`generatePortrait.ts:171-172`).
3. **LLM chooses which 6–8 placements to feature** in `natalPlacements` (`portraitPrompt.ts:51`) — an editorial freedom with no code-side required-placement list.
4. **The aspect visibility filter is an unnamed editorial rule** — only `exact || orb ≤ 4`, max 8, reach the LLM (`portraitPrompt.ts:41-42`), while the chart itself carries orbs up to 8° (`ephemerisCalculator.ts:538-545`). Nobody documents that the portrait "sees" a stricter sky than the chart API returns.
5. **Tie-breaks on dominant/deficient element are insertion-order artifacts** — stable sort makes fire beat water beat earth beat air on ties (`spiralogicEngine.ts:109-110`), and fire>earth>air>water in the other implementation (`maiaAstrologyContextService.ts:522-523`). Deterministic, unnamed, and mutually inconsistent.
6. **Facet-activation ties resolve to the lowest house** (numeric key order of `Object.entries`, `spiralogicEngine.ts:203-225`), which then defines "current phase" — an unnamed rule with member-visible consequences.
7. **House system is caller-selectable but the portrait route never sets it**, so the portrait is always Porphyry by default (`ephemerisCalculator.ts:750`; `app/api/soul-portrait/generate/route.ts:71` passes no `houseSystem`).
8. **Ascendant/Midheaven are excluded from every elemental balance** (`spiralogicEngine.ts:77-88`; `maiaAstrologyContextService.ts:782-785`) — plausibly intentional, nowhere stated.

### C. Fuzzy determinism (the boundary is unclear in the code)

1. **HEADLINE — the registration step itself is LLM prose in the live portrait path.** The generator imports no Spiralogic mapping module (`generatePortrait.ts:11-23`); it hands the LLM a raw placements list (`portraitPrompt.ts:32-46`) and asks it to write the Fire/Water/Earth/Air/Aether paragraphs directly (`portraitPrompt.ts:55-61`). Deterministic registration code exists (`spiralogicEngine.ts:14-27,59-117,177-236`) but is **not called** here. Consequence: same birth data → same chart summary string, but the *element registration a member reads* is unleashed LLM variation at temperature 0.7, constrained only by JSON keys and voice rules. This is the falsifiability gap: no test can currently assert "this chart registers as Water-dominant" against the portrait.
2. **Outer-planet relational rule is instruction, not enforcement** — `portraitPrompt.ts:84-89` tells the LLM to read Uranus/Neptune/Pluto only through aspects to personal planets and "do not manufacture one," but no code detects those aspects, gates the instruction on their presence, or verifies compliance; meanwhile the supplied aspect list is truncated non-optimally (A3) and outer-planet placements are absent (`portraitPrompt.ts:19-29`). The rule's premises are partially withheld from the model asked to honor it.
3. **The portrait's printed chart "facts" are LLM echoes** — `assemble()` copies the model's claimed `body/sign/house` strings verbatim (`generatePortrait.ts:77-82`) with no reconciliation against the computed `BirthChart` sitting in the same function's scope (`:154`). A hallucinated "Sun in Leo, house 3" would ship as if mechanical.
4. **Aether has no registration rule anywhere in code** — no house maps to it (`spiralogicMapping.ts:32-164`), no sign maps to it (`spiralogicEngine.ts:14-27`), both balances are 4-element, and one type system excludes it outright (`spiralogicHouseMapping.ts:9`) while another includes it (`spiralogicMapping.ts:15`). Yet every portrait carries an aether paragraph — pure LLM synthesis presented structurally alongside chart-derived elements.
5. **The Spiralogic Evolutionary Report launders mechanical facts through LLM narration** — deterministic house/element/stage tables and weighted balance are computed (`spiralogicReportGenerator.ts:14-19,520`), then passed into an Anthropic call that re-narrates them (`:236-285`), with silent per-facet deterministic fallback on missing keys (`:314-321`); the stored result is later summarized into live MAIA context (`maiaAstrologyContextService.ts:246-247`). Provenance (computed vs narrated vs fallback) is not labeled per field.
6. **"Current phase" is mechanical but reads as insight** — it is simply the top-intensity facet's element+stage (`spiralogicEngine.ts:224-236`; comment at `:224` says "based on dominant element," which is not what the code does), then surfaced downstream as an evolutionary-phase statement (`composeAstrologyReading.ts:146-157`).

---

## 4. Open questions for Kelly (design intent only — code cannot answer)

1. **Should element registration in the Soul Portrait be code-computed?** The deterministic engine (R5) exists. Intended options: (a) keep LLM-registered prose as a feature, labeled as reflection; (b) compute R5/R5′ and feed the result into the prompt as data the LLM must honor; (c) compute and *verify* the LLM's element emphasis post-hoc. Which is the constitutional posture (Mirror Invariant: never synthesis)?
2. **Which elemental-balance formula is canonical** — weighted (`spiralogicEngine`) or unweighted count (`maiaAstrologyContextService`)? And should Ascendant/MC carry weight?
3. **Is the 5°-before-angular-cusp house pull** (`calculateHouse`) Spiralogic doctrine or a leftover experiment?
4. **Is aether *supposed* to have no chart registration rule** (i.e., aether = the integration lens, never chart-derived), or is a rule (e.g., element-balance evenness, 12th-house emphasis, node aspects) intended but unbuilt?
5. **Water-3 `'completes'` vs other elements' `'integrates'`** (`spiralogicSystem.ts`) — intentional asymmetry (12th house as completion) or typo? (File is dormant; answer matters only if it gets wired.)
6. **Porphyry as default** is asserted "best for Spiralogic" in comments (`ephemerisCalculator.ts:748-749`) — is that settled doctrine (so Placidus/Koch options should be removed rather than silently substituted)?
7. **Should timezone-resolution provenance (`iana` vs `longitude-approximation`) travel with the chart** into stored portraits, per verify-or-label?
