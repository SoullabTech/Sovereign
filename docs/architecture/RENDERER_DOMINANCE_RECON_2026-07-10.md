# Renderer Dominance Recon — C-Fence Decision Input

**Date:** 2026-07-10
**Status:** Recon report (read-only code audit across branches — not a plan, not authorization, nothing merged or edited).
**Type:** Decision input for the Spiralogic dominance consolidation. The registration grammar is ratified (Q1/Q6 = C: distribution is ground truth, **no dominance crown at grammar layer**, dominance is an interpretive claim from ONE versioned rule that may return `none`). This note maps every place the codebase currently crowns or phrases dominance, so the replacement rule is designed against reality, not against the three sites we happened to remember.
**Spec:** [`docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md`](../specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md) · Substrate: `lib/spiralogic/registration/` (`registerChart`, committed `8e8ab1cf7`, Built-unwired, 38/38 tests green).

---

## §1 The three named crown sites — exact current behavior

### 1a. `lib/astrology/engines/spiralogicEngine.ts:108-114` — the source crown

```ts
  // Find dominant and deficient
  const elements: SpiralogicElement[] = ["fire", "water", "earth", "air"];
  const sorted = elements.sort((a, b) => balance[b] - balance[a]);

  return {
    ...balance,
    dominant: sorted[0],
    deficient: sorted[sorted.length - 1],
  };
```

**Computation:** weighted sign-tally over 10 bodies — `PLANET_WEIGHTS`: Sun 3, Moon 3, Jupiter 2, Saturn 2, Venus 1.5, Mars 1.5, Mercury/Uranus/Neptune/Pluto 1 (Chiron 0.5 and North Node 1 are defined in the table but **never iterated** — the planets loop stops at Pluto). Normalized to integer percentages, then a full sort.
**Tie-breaking:** none — on ties the pre-sort array order wins (fire > water > earth > air). Silent, unstated, and biased toward fire.
**Threshold:** none — **always crowns**, even at 25/25/25/25.
**Language emitted:** none directly, but it mints the `dominant`/`deficient` **fields** that every downstream phrasing site treats as fact. Note it crowns *two* things: `deficient` is the inverse crown, and `getCoherencePractices()` (same file, lines ~120+) switches practice text off `deficient` — the interpretive rule must govern both poles, not just dominance.

**Divergence from ratified grammar:** this weighting (Sun/Moon 3×, social planets 2×…) is exactly the kind of interpretive judgment Q5 removed from the grammar layer (ratified: all weights 1.0; Moon branches 0.5 each). The engine currently bakes interpretation into what it presents as measurement.

### 1b. `app/journey/page.tsx:1868` — the inline crown

```tsx
  <ElementalBalanceDisplay balance={elementalBalance} />
  ...
  <p>Dominant Element: <strong>{Object.entries(elementalBalance).reduce((a, b) => a[1] > b[1] ? a : b)[0].toUpperCase()}</strong> ·
  Integration practices available through personalized guidance</p>
```

**Computation:** inline `reduce` over the state object; strict `>` means first-max wins ties (object key order: fire, water, earth, air). Always crowns.
**Language emitted:** `Dominant Element: **WATER**` — declarative, uppercase, bold.
**⚠️ Load-bearing finding — the crown runs on placeholder data.** The `elementalBalance` state initializes to hardcoded `{fire: 0.28, water: 0.38, earth: 0.18, air: 0.16}` (line 153), and even after the real chart loads, line ~501 sets it to **another hardcoded literal** `{fire: 0.25, water: 0.30, earth: 0.20, air: 0.25}` with the comment `// TODO: Make this more sophisticated`. **The journey page has never crowned from a real chart — it declares "Dominant Element: WATER" for every member.** Replacing this site is not a refactor of a working crown; it is the first wiring of a real one.

### 1c. `components/astrology/ElementalBalanceDisplay.tsx:55-57` — the component crown

```tsx
  // Find dominant element
  const dominant = Object.entries(balance).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0] as keyof ElementalBalance;
```

**Computation:** same first-max-wins `reduce`, no threshold, always crowns.
**Language emitted:** an italic `dominant` tag rendered beside the winning element's bar (lines ~96-100).
**Latent scale trap:** the component renders `Math.round(balance[element] * 100)` — it expects 0–1 fractions. `spiralogicEngine` emits 0–100 integers. Today's two live callers (`app/journey/page.tsx:1866` — fractions, fake; `app/chart/page.tsx:297` — fractions, real) happen to pass fractions, but wiring the engine's output into this component without normalization would render "2800%". The consolidation must fix the unit contract, not just the crown.

---

## §2 The sweep — additional sites beyond the named three

### 2a. Chart-derived (inside the C-fence — these MUST move to the rule)

| # | Site | What it does | Language emitted |
|---|---|---|---|
| 4 | `app/chart/page.tsx:90-109` | **A fourth independent distribution computation**: unweighted count over only **7 bodies** (Sun→Saturn; no Uranus/Neptune/Pluto), fraction-normalized, 0.25-each fallback on empty. Feeds `ElementalBalanceDisplay`, which crowns it. | (via the display's `dominant` tag) |
| 5 | `lib/astrology/composeAstrologyReading.ts:151, 304` | Consumes the engine crown: `dominantElement: raw.elementalBalance.dominant`, then pushes into the reading's integration path. | `"Elemental balance: Dominant ${sp.dominantElement}, strengthen ${sp.deficientElement}."` |
| 6 | `lib/astrology/spiralogicReportGenerator.ts:142` | Consumes the engine crown into the plain-text report. | `"Dominant: ${bal.dominant}  |  Deficient: ${bal.deficient}"` plus practice line `'Daily grounding practice to anchor the dominant element'` (line 207). |
| 7 | `lib/astrology/spiralogicReportGenerator.ts:455-456` | **A silent default crown**: `dominant: bal?.dominant ?? 'fire'`, `underactive: bal?.deficient ?? 'earth'` — when no balance data exists at all, the report **invents** a fire dominance and earth deficiency. This is the exact inverse of first-class ambiguity: absence of evidence rendered as a confident verdict. | Structured `ElementalBalanceInsight` consumed by report sections. |

Consumers of 5–7: `app/api/astrology/reading/route.ts` and `app/api/astrology/spiralogic-report/route.ts` — so the crowned language reaches members through two API surfaces, both downstream of the single engine crown (§1a). **Consolidation shape: sites 5–7 are not independent crowns — they are phrasing sites that inherit crown #1.** Fixing the engine and giving these a `none` branch covers them.

So the honest count: **3 named + 2 structurally distinct additional crown mechanisms** (the chart-page's fourth distribution computation feeding the display crown, and the report generator's `?? 'fire'` fallback crown) **+ 2 downstream phrasing sites** that treat the crown as fact.

### 2b. Adjacent domains — same pattern, different substrate (fence, don't consolidate)

These crown "dominance" from non-natal-chart inputs. They are **out of the C-fence** (the ratified grammar governs natal registration), but they are listed because the always-crown `reduce`/`sort[0]` idiom is a house style that will keep re-seeding chart renderers unless named:

- `lib/spiralogic/SpiralogicDataModel.ts:814-821` — crowns dominant element **and** dominant phase from facet values; emits `"Your energy signature shows strong ${dominantElement} with ${dominantPhase} phase activation."` (consumed by `app/api/practice/insights/generate/route.ts`).
- `lib/divination/runes/casting.ts:383-388` and `lib/divination/tarot/drawing.ts:155-160` — `getDominantElement()` sort-and-take-first over drawn runes/cards; feeds insight prose and ritual selection.
- `app/api/between/consciousness-bridge/route.ts:706-711` — `getDominantElement()` reduce over resonance scores.
- Conversational-domain `dominant_element` (`member_spiral_state`, conductor hysteresis, `between/chat`, admin dashboards) — different substrate (session signal, not chart), governed by Bridge D; explicitly not in scope.
- `app/api/_backend/**` (fourPillars, EvolutionTracker, ArchetypalTypologyAgent) — dormant/legacy tree, excluded from Next routing; note-only.

### 2c. A live precedent for first-class ambiguity already exists in-repo

`app/api/clinical/ipp/analysis/route.ts:261-292` computes elemental scores and — unlike every chart renderer — **refuses to crown** below thresholds:

```ts
  if (balanceScore > 80) { dominantPattern = 'balanced'; }
  else if (highest.score - lowest.score > 40) { dominantPattern = `${highest.element}-dominant`; }
  else if (mean < 40) { dominantPattern = 'depleted'; }
  else { dominantPattern = 'chaotic'; }
```

Variance-based balance score, spread threshold for crowning, and named non-crown verdicts. The interpretive rule does not need to invent the `none`-verdict pattern from scratch; the repo already ships one (in the clinical surface, where the epistemic stakes forced honesty first).

---

## §3 Renderer family — structural diff across branches

### File-level deltas vs `clean-main-no-secrets` (lib/soulPortrait + app/soul-portrait)

| Branch | Delta | Character |
|---|---|---|
| `f00c2a307` (themes) | M `generatePortrait.ts`, `schema.ts`, `registry.ts` | Presentation tokens only — `PortraitThemeKey = 'classic'|'earth'|'fire'|'water'|'air'|'aether'`; schema states *"a theme never alters the portrait's text, structure, or framing"* and *"new themes are data (add an entry to PORTRAIT_THEMES), not code forks."* |
| `6d8166b5d` (literary) | M `generatePortrait.ts`, `portraitPrompt.ts`, `portraitStore.ts` | New register: 16-chapter `LiterarySoulPortrait`, assembled deterministically in code, minimum-viability guard on the chapter arc. |
| `a2ac339e4` (year-ahead) | A `generateYearAhead.ts`, `yearAheadPrompt.ts`, `transitReportParser.ts` (+test) | New Part II: Seasonal Spiral over real transits. |

### How each voice handles elemental emphasis / dominance

- **Main-line generated portrait** (`portraitPrompt.ts` OUTPUT_CONTRACT): **structurally dominance-free.** The contract demands one paragraph for *each* of five elements (fire/water/earth/air/aether), equal weight, no ranking field anywhere in the JSON contract. Voice: *"Companions, not cages… never labels, never a type they 'ARE'."* The generator never computes a crown.
- **Hand-authored portraits** (`portraits/*.ts`, all branches): dominance appears **as authored editorial judgment** — e.g. jondi.ts: *"Dominant element FIRE (5), dominant modality FIXED (6)"* (count-based, in a code comment as author's working notes); nathan.ts prose: *"The strongest current in your chart is Air — five of your planets sit in the thinking, relating, future-facing signs"*; andreaFagan.ts inverts the trope entirely: *"Air moves through your chart like the bright thread in a tapestry — not the dominant color, but the one that makes the whole design sing."* These are Kelly-voice claims with the evidence shown inline (planet counts), sometimes explicitly *declining* dominance framing. **Not code crowns — do not mechanize.**
- **Literary register** (16 chapters): the five element chapters run **in fixed order with fixed paragraph weights** (2-3 each) — the form itself refuses dominance; every element gets a chapter regardless of the chart. Practices close with one paragraph per element, always all five.
- **Year Ahead / Seasonal Spiral**: fixed elemental order as *phases of the year* (Earth → Fire → Water → Air → Aether), transits as *"weather, not fate."* Where "dominant" appears (nathan.ts year section: *"Neptune… is the dominant weather"*) it is a **temporal claim about a transit period**, not a natal identity claim — a different speech act that should not be collapsed into the natal dominance rule.

**One-line voice characterizations:**
- spiralogicEngine/report chain: *actuarial* — "Dominant: fire | Deficient: earth," verdict as data field.
- journey page: *declarative banner* — "Dominant Element: WATER" (currently fiction).
- ElementalBalanceDisplay: *quiet tag* — an italic "dominant" beside a bar.
- Soul Portrait (generated): *egalitarian letter* — five companions, no ranking.
- Soul Portrait (authored): *essayist with the chart open* — dominance claimed, evidenced, or deliberately subverted, per person.
- Literary: *fixed liturgical form* — the arc itself is the equality.
- Year Ahead: *weather report* — dominance is seasonal, never constitutional.

### Factoring opportunities

**Mechanical (safe to factor, no voice change):**
1. **One distribution source.** Three independent distribution computations exist (engine weighted-10-body; chart page counted-7-body; registration grammar ratified-10-body-weight-1.0). All chart surfaces should consume `registerChart()`'s `SpiralogicProfile` (element rollup = `fire_1+fire_2+fire_3`, etc.). The 7-body and weighted variants disappear.
2. **One crown authority.** A single `interpretDominance(profile, interpretation_version)` module; every site in §1/§2a becomes a consumer. Ties, thresholds, `none`, and moon-sensitivity live in exactly one file.
3. **Unit contract.** Distribution travels as raw weights (per SH-12); presentation-percentage conversion happens once, at the display boundary — fixes the ×100 trap.
4. **Delete the fallback crown** (`?? 'fire'` / `?? 'earth'`) — absence of data must render as absence, mechanically.

**Editorial (Kelly's call, not factorable):**
- The *phrasing* each surface uses for a crowned verdict, a graded verdict, and a `none` verdict (banner vs tag vs sentence vs letter prose).
- Whether the journey banner survives at all once it must sometimes say "no single element leads."
- Whether authored portraits ever cite the rule's output or remain purely authorial (recommendation: remain authorial — they are already the best `none`-handling in the codebase).

---

## §4 What the single versioned rule must support (consumption map)

**Inputs** (all available from the built substrate today):
- `SpiralogicProfile.distribution` (12 phase keys, raw weights) → element rollup.
- `SpiralogicProfile.moonUncertain` (Q4 flag — travels with the profile).
- `interpretation_version` (the rule's own version, distinct from `grammar_version: 1`).
- **Open design tension:** the luminaries-2× weighting explored in the design data **cannot be applied over the aggregated distribution** — per-body identity is already summed away. If the rule wants luminaries-weighted dominance it must either (a) consume `ChartPositions` alongside the profile, or (b) the weighting becomes a grammar-layer question (reopening ratified Q5). Option (a) keeps the ratification intact; option (b) is a constitutional amendment. This is a rule-design decision, not a renderer decision — flag it before implementation.

**Output shape the call sites need:**
```
{ verdict: 'dominant' | 'none',
  element?: Element,              // present iff verdict === 'dominant'
  grade?: 'clear' | 'leaning',    // graded language tier
  deficient?: Element | null,     // the inverse claim, same discipline (practices key off it)
  moonSensitive?: boolean,        // true when a one-sign Moon shift would flip the verdict
  interpretation_version: number }
```

**Where each current site consumes it:**

| Site | Consumes | Language need |
|---|---|---|
| `spiralogicEngine.ts` | stops crowning; returns distribution only (or is retired in favor of `registerChart`) | — |
| `composeAstrologyReading.ts:304` | verdict → sentence | needs a `none` sentence (*"no single element leads — the chart is genuinely mixed"*) and a graded variant |
| `spiralogicReportGenerator.ts:142,455` | verdict → report lines + `ElementalBalanceInsight` | `none` line; **delete** `?? 'fire'` fallback; practices section needs a balanced-chart branch |
| `getCoherencePractices` | `deficient` (may also be null) | a no-deficient practice branch |
| `app/journey/page.tsx:1868` | verdict → banner | must first wire real data (currently placeholder); banner needs a `none` state or removal |
| `ElementalBalanceDisplay.tsx` | verdict → tag | no tag when `none`; possibly a "balanced" annotation; fix unit contract |
| `app/chart/page.tsx:90` | replace local computation with profile + rule | display inherits the above |
| Soul Portrait generator | **nothing** — already dominance-free; do not add a crown | — |
| Year Ahead | **nothing** — seasonal claims are a different speech act | — |

---

## §5 What the null-rate data implies per site

Design data: strict crowning → **~25–28% `none`**; luminaries-2× → ~18% `none`; a one-sign Moon shift flips dominance in **~39%** of charts (rising 38.4% → 52.1% under luminaries-2×).

- **Every current chart crown always crowns.** Under the strict rule, roughly **one member in four** who today sees "Dominant: X" would see a `none`/balanced verdict instead. That is not a regression — it is the first time the claim is honest — but every phrasing site listed in §4 needs its `none` language *before* the rule ships, or the surfaces will render `undefined`.
- **Journey page: 100% behavior change**, not 25% — its crown has never reflected a chart. Whatever ships there is net-new function wearing an old banner.
- **`spiralogicReportGenerator:455`** is the emblematic casualty: a site so committed to always-crowning that it crowns fire *with no data at all*. The strict rule makes this pattern impossible to reintroduce silently — provided the fallback is deleted, not routed around.
- **Moon sensitivity:** at ~39% flip-on-one-sign-shift, any noon-mode chart carrying `moonBranches` is in the highest-instability class. The rule should treat `moonUncertain: true` as a strong prior toward `none` (or a mandatory `moonSensitive` annotation that phrasing sites must surface) — otherwise the epistemic flag the grammar worked to preserve dies at the interpretation boundary.
- **The 2b adjacent sites** (facet, divination, resonance) inherit none of this automatically. They stay always-crown. Acceptable — different substrates — but worth one line in the rule's doc naming them as *out of jurisdiction*, so nobody later cites them as precedent for chart behavior.

---

## §6 Open editorial questions (Kelly only)

1. **The `none` voice.** When no stable dominance exists, what does each surface *say*? "Balanced," "mixed," "no single current leads," silence? The authored portraits already model several registers (andreaFagan's "bright thread in a tapestry" is a `none`-adjacent voice). This is a voice decision per surface, not one global string.
2. **Does the journey banner survive?** It has been declaring fiction. Options: wire it honestly (with a `none` state), demote it to the quiet-tag register, or remove it. Constitutionally any works; editorially they read very differently.
3. **Graded language tiers.** Does "leaning fire" (crown by a thin margin) get its own voice, or is the vocabulary binary (dominant / none)? The 39% Moon-flip figure argues for at least surfacing fragility somewhere.
4. **`deficient` framing.** "Deficient"/"strengthen" is prescriptive in a way "dominant" is not. Keep, soften ("quieter element"), or drop from member-facing surfaces? (Practices currently key off it.)
5. **Luminaries question.** Strict (all-1.0, ~25-28% none) vs luminaries-2× (~18% none but higher Moon-instability) — and if luminaries-weighted, whether the rule consumes raw positions (§4 tension) — is an interpretation-philosophy call: how much should the Sun and Moon *mean* at the interpretation layer, given the grammar deliberately declined to say?
6. **Themes cross-reference.** The theme schema imagines a giver choosing a theme that "quietly rhymes with the portrait's dominant element." Once dominance can be `none`, is that hint reworded, or left as pure giver intuition (recommended — it was never computed)?

---

*Recon complete. Nothing in this document authorizes the consolidation build; it is the map the build decision reads.*
