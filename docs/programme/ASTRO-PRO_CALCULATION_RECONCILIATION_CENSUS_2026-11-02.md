# ASTRO-PRO-04 · Step 3.1 · Calculation-path reconciliation census

**Date:** 2026-11-02 · **Mode:** READ-ONLY census. No source edited, nothing committed or pushed, no production, database or network touched.
**Owner record:** SoullabTech/Sovereign#1893 (not read in this pass; network not used).
**Canonical ref:** `origin/clean-main-no-secrets` = `a4dd6fc85bae659661ea9cc7b8b939f5916be5ec`, read with `git show` from the worktree `/Volumes/MAIA Recovery/PROD_LINEAGE_RECONCILE_20261031`.

Evidence classes used below:
- **HASH**: SHA-256 computed in this session over the named bytes.
- **CODE**: what the source says (code-read). It does not establish runtime behaviour.
- **TEST**: a local jest run in a scratch copy, done in this session.
- **RECORD**: a claim taken from an archived receipt or handoff and not re-verified here.

---

## Q1 · Where the archived CF-08 calculator and the independent test are

### Found (HASH)

| Artifact | SHA-256 | Location(s) |
|---|---|---|
| CF-08 corrected `ephemerisCalculator.ts` | `0412bcfebb2cc63219fd59916c27df2c8baeaea32a8e7df081894108e5cf6e8e` | `/Volumes/T7 Shield/astro-pro-cf08-precision-qualification-20261016/lib/astrology/ephemerisCalculator.ts` (origin) · same bytes in `…/astro-pro-cf11-precision-auth-integration-isolated-20261018/`, `…/astro-pro-cf12-cookie-precision-convergence-isolated-20261022/`, `…/astro-pro-cf13-proxy-denial-cache-isolated-20261022/` · `/Users/soullab/Soullab-Development/ASTRO-PRO-OWNED-20261021/integration/ASTRO_PRO_ENGINE_CONVERGENCE_R2_20261021/candidate/lib/astrology/ephemerisCalculator.ts` |
| CF-08 independent test `cf08IndependentSwissMethod.test.ts` | `25a3ff735d138176db6a347581a832a9cc29df701e5396fd1cf9ac692a40515b` | `/Volumes/T7 Shield/astro-pro-cf08-precision-qualification-20261016/lib/astrology/__tests__/` (origin) · same bytes in the cf11, cf12 and cf13 directories above |
| Archived Pro adaptation `proIndependentSwissMethod.test.ts` | `8519f5f8b1cbd822c643863961b2acedc9e69bbd51a3edc41c08c5e6a466cf1a` | `/Volumes/MAIA Recovery/ASTRO_PRO_FOUNDER_BETA_R1_20261028/lib/astrology/__tests__/`. It is committed at `34050f00` on local branch `review/astro-pro-approved-reading-r1-20261029` in the repository at `/Volumes/T7 Shield/ProjectCache/ASTRO-FG20-ACC36-R3-QA.HMPQdF/.git`. That commit is **not** on origin: canonical's remote answered `not our ref`. Spotlight also lists copies in six other `/Volumes/MAIA Recovery/ASTRO_PRO_APPROVED_READING_*` directories; those were not hashed. |

The `/Volumes/T7 Shield/astro-pro-cf*` directories are plain directories, not git repositories.

The Pro adaptation differs from the original test in **one line only**, the import (`../ephemerisCalculator` → `../proEphemerisCalculator`). Checked by `diff` in this session.

### Not found where it was searched (absence describes the search)
- **Canonical repository history:** `git log --all` reaches 18 distinct blobs of `lib/astrology/ephemerisCalculator.ts`. None hashes to `0412bcfe…`; `a95c2b0d` hashes to `0a7ecf66…`. No ref has ever contained `cf08IndependentSwissMethod.test.ts`. Unreachable objects were not checked.
- **ProjectCache repository** (6 refs): only the `1967854b…` and `0a7ecf66…` calculator blobs. No CF-08 test.
- **`/Users/soullab/JARVIS-handoffs/`:** about 100 copies of `ephemerisCalculator.ts`, all `1967854b…`. No file named cf08*. A zip listing found no cf08 test. A recursive `grep` for `0412bcfe` timed out, so that search is incomplete.

### Lineage (RECORD, consistent with HASH and diff)
`R10_SOURCE_OWNER_HANDOFF.md` (2026-10-22) says the Pro engine was created by copying the R2 strict-core donor `0412bcfe…` byte-for-byte into `proEphemerisCalculator.ts`. `R11_SOURCE_OWNER_HANDOFF.md` says it then removed `@ts-nocheck` and added `as const`, which gives `e51437ae…`.

R11 line 12 quotes the full `0412bcfe…` hash. ⚠️ R10 line 12 quotes a **truncated** 55-character hash (`…df081894…`). It is a transcription defect in that record and does not change the file identity.

---

## Q2 · Current canonical SHA-256 (HASH)

| File | SHA-256 | Lines |
|---|---|---|
| `lib/astrology/ephemerisCalculator.ts` | `0a7ecf66f5331920b9f14fcf4a729764ca960719000885f180e29178a9f98b41` | 1107 |
| `lib/astrology/proEphemerisCalculator.ts` | `e51437ae88f494181a1f0be04f32dff7137d2a3dd65fdf3269786478adb44e06` | 1130 |
| `lib/astrology/proCalculationPolicy.ts` | `a25032f9ed9d2c1a00a1bf98cefc375baa3d074672feedabc8a49afb2f57dd8d` | |
| `lib/astrology/proChartGeometry.ts` | `1466c6c8153136fe2e841aeb4e71c4be33e69293d2c4df21d7bfcbc0f66271f9` | |
| `app/api/astrology/pro/my-chart/route.ts` | `9a256ba6745647f0bbbe4bf92acbf925abe2cb9a154eccc8ed8eb1ae18ad6e1b` | |
| `app/api/astrology/current-transits/route.ts` | `7fa31b2b6e7a953315265d03484cfc86b9a8c7d38122b0dc27c301d6c3c6f05b` | |

Both calculators were last touched on canonical by `79575c33f` (2026-10-30). Canonical carries **no** independent reference test. The only file under `lib/astrology/__tests__/` is `birthTimeResolution.test.ts`.

---

## Q3 · Which calculation paths Pro actually uses (CODE)

**Natal chart:** `ProAstrologyExperience.tsx` → `GET/POST /api/astrology/pro/my-chart[?houseSystem=]` → `my-chart/route.ts`. The route calls:
1. `admitProCalculation()` from `proCalculationPolicy.ts`. This step:
   - checks the house system against `PRO_SUPPORTED_HOUSE_SYSTEMS = ['whole-sign','equal','porphyry']`;
   - caps latitude at `PRO_MAX_TESTED_LATITUDE = 66`;
   - requires a valid IANA zone (`isValidTimeZone`);
   - converts the time with `resolveBirthTimeUTC()` plus `matchingUtcInstants()`, refusing DST gaps and folds (`TIME_NONEXISTENT` / `TIME_AMBIGUOUS`);
   - sets `qualityMode: 'strict-core'`.

   Both helpers are imported from **`./proEphemerisCalculator`**.
2. `calculateBirthChart()` from **`proEphemerisCalculator.ts`**. Inside it:

| Output | Function in `proEphemerisCalculator.ts` |
|---|---|
| Planets | Sun/Moon/planets via astronomy-engine geocentric vectors and `Ecliptic` |
| Motion | `classifyApparentMotion()` |
| Nodes | `calculateApproxMeanNode()` (mean node; South Node = +180°) |
| Lilith | `calculateMeanLilith()` |
| Chiron, Ceres, Pallas, Juno, Vesta | `keplerianGeocentricLongitude()` via `calculate*Approx()` |
| ASC | `calculateAscendant()` |
| MC | `calculateAstronomicalMidheaven()` |
| Cusps | `calculateHouseCusps(..., strictCore)`, which dispatches to Whole Sign, Equal or Porphyry. Placidus and Koch throw when `strictCore` is set. |
| Aspects | `calculateAspects()` |
| Time | `resolveBirthTimeUTC()` / `getTimeZoneOffsetMinutes()` |

**Display:** `CelestialChartWheel.tsx` and the three workbenches import `type BirthChart` only. `proChartGeometry.ts` (`geometricHouseFromCusps`, `chartBodies`), `proResearchSnapshot.ts`, `proRelationshipLens.ts` and `proStudyField.ts` import no astronomy library; they re-derive geometry from the returned chart.

**Does Pro call the ordinary calculator?**
- The natal path does **not**.
- `ProAstrologyExperience.tsx:121` does fetch the shared **`/api/astrology/current-transits`**. That route imports `classifyApparentMotion` from the **ordinary** `ephemerisCalculator.ts`. It computes positions itself (GeoVector, EclipticGeoMoon), and has its own `calculateTrueNode()`, which actually computes a **mean** node.
- `classifyApparentMotion` is byte-identical in both engines (the diff below does not touch it).

---

## Q4 · What CF-08 changed, and whether it is present (CODE, from `diff`)

### `0412bcfe` (CF-08) versus `e51437ae` (canonical Pro)
Eleven changed lines:
- first line `// @ts-nocheck` removed;
- `as const` added to ten `motionStatus` literals.

There is **no numerical difference**. **(b) Every CF-08 correction is present in the Pro engine.**

### `0412bcfe` (CF-08) versus `0a7ecf66` (canonical ordinary)
317 diff lines. The CF-08 corrections, all **absent** from the current ordinary calculator:
1. **ASC/MC independent of house system.** CF-08 computes `calculateAscendant()` and the new `calculateAstronomicalMidheaven()` directly. The ordinary calculator still uses `ascendant = houseCusps[0]` and `midheaven = houseCusps[9]`, which is wrong for Whole Sign and Equal.
2. **`strictCore` mode** (`qualityMode`). Placidus and Koch, unrecognised systems and geometry failures throw rather than silently falling back. The ordinary calculator keeps the silent Porphyry, Whole Sign and equal-house fallbacks.
3. **Node naming.** `calculateTrueNode` was renamed `calculateApproxMeanNode`, with the "mean, not true" disclosure.
4. **Motion.** CF-08 adds a `motionStatus` field, and `isRetrograde` delegates to `classifyApparentMotion`. The ordinary calculator's `isRetrograde` compares **heliocentric** `EclipticLongitude` over one day, and its node, Chiron, Lilith and asteroid entries carry asserted motion labels.
5. **`calculateTransits`.** CF-08 is geocentric (`GeoVector`/`EclipticGeoMoon`) and returns house 0, "not calculated". The ordinary calculator uses heliocentric `EclipticLongitude` for planets, plus fictional Greenwich (0,0) houses.
6. **`getMoonPhaseData`.** CF-08 uses `MoonPhase` + `Illumination.phase_fraction`. The ordinary calculator uses heliocentric Moon longitude and phase-angle/360 as "percent".
7. **Privacy and error handling.** CF-08 uses opaque error codes (`INVALID_BIRTH_*`, `BIRTH_CHART_CALCULATION_UNAVAILABLE`), `Number.isFinite` checks on latitude/longitude, and comments forbidding logging of birth data or longitudes.

**Not changed by CF-08:**
- `resolveBirthTimeUTC`, `classifyApparentMotion`, `calculateAscendant`, the Porphyry cusp maths, and the minor-body approximations are identical across all three files.
- **(a) The CF-08 corrections are absent from the ordinary calculator, not superseded.** Nothing in the ordinary file replaces them with another method.
- This file serves Free, synastry, vedic, between/chat, stellium, soulPortrait and the MAIA astrology context. That is outside the Pro scope; it is recorded here, not adjudicated.

---

## Q5 · Running the fixture (TEST)

**Setup:**
- scratch tree `/private/tmp/claude-501/-Users-soullab-MAIA-SOVEREIGN/415abd68-2e85-46c9-8893-2e50f85b8ebe/scratchpad/cf08census/repo` = `git archive origin/clean-main-no-secrets lib/astrology jest.config.js tsconfig.json package.json`;
- `node_modules` symlinked to the worktree's;
- canonical `jest.config.js` (ts-jest), `--runTestsByPath`.

**Inputs:** unmodified original `25a3ff73…`; archived Pro adaptation `8519f5f8…` (import line only). **I made no adaptation of my own.** ts-jest reported 0 TS diagnostics.

Note: the original test also imports `../proCalculationPolicy`. Against canonical, its admission and time-conversion cases therefore exercise Pro's `resolveBirthTimeUTC`, which is identical to the ordinary one. `qualityMode` is passed to the ordinary calculator, which ignores it.

| Run | Result |
|---|---|
| Original vs **canonical ordinary** `0a7ecf66` | **25 pass / 16 fail of 41** |
| Pro adaptation vs **canonical Pro** `e51437ae` | **41 / 41 pass** |

**What failed against the ordinary calculator:**
- Equal and Whole Sign cusp tests in all 7 cases (14 tests) fail **only** on the ASC/MC assertions. The cusps themselves are within tolerance.
- The two dedicated ASC/MC-independence tests also fail.
- Worst ASC/MC errors: Whole Sign ASC 29.36° (Cape Town); Equal MC 25.18° (Connecticut).

**Maximum error per case.** From `CF08_NUMERIC_*` lines. **Both engines gave identical figures**, tolerance 0.025°:

| Case | Porphyry cusps | Equal cusps | Whole Sign cusps | 10 bodies + mean node (worst) |
|---|---|---|---|---|
| J2000 Greenwich | 0.00014 | 0.00011 | 0 | 0.00702 Neptune |
| New York 1985 | 0.00129 | 0.00129 | 0 | 0.00411 Mars |
| Connecticut 2026 | 0.00157 | 0.00157 | 0 | 0.00617 Neptune |
| Sydney 2026 | 0.00111 | 0.00111 | 0 | 0.00527 Venus |
| Quito 2026 | 0.00026 | 0.00018 | 0 | 0.00729 Neptune |
| Reykjavik 2026 | 0.00019 | 0.00019 | 0 | 0.00642 Saturn |
| Cape Town 2026 | 0.00031 | 0.00020 | 0 | 0.00485 Sun |

Logs and JSON: `…/scratchpad/cf08census/run_cf08IndependentSwissMethod.{log,json}` and `run_proIndependentSwissMethod.{log,json}`.

**Corroboration (RECORD):** `ASTRO-PRO-OWNER-20261021/PRO_BETA_REFERENCE_RUN2_20261028T2005Z.json` reports 55/55 PASS on the same `e51437ae`, `a25032f9` and `1466c6c8`. That is 41 core cases plus 14 cases from `proLocalWorkbenchIndependentReference.test.ts` (`33cccb81…`), which exercise `proLocalWorkbench.ts`, a file **absent from canonical**.

The fixtures' own header says the reference values were computed once (PySwissEph 2.10.03 Moshier) and were not recomputed in this run.

---

## Q6 · Gaps that remain for step 3.1 (not a design)

1. **The fixture is not in canonical custody.**
   - Both test files exist only on external volumes and in an unpushed local branch (`34050f00`).
   - The proven-passing Pro test must become a tracked, canonical test before it can gate anything.
   - Preserving the original `25a3ff73` bytes, beside or in place of the Pro adaptation, is an owner choice.
2. **Pro and ordinary disagree on ASC/MC for Whole Sign and Equal**, by up to ~29° in these fixtures.
   - Pro is correct; the ordinary calculator is not.
   - Surfaces that mix the two (Free/MAIA context against the Pro chart) may show members different angles for the same birth data.
   - Ownership of the ordinary repair sits outside the Pro lane and needs a ruling.
3. **The shared transit route is on the Pro surface.**
   - `/api/astrology/current-transits` is not covered by the fixture.
   - Its `calculateTrueNode()` computes a mean node under a "True Node" name, the exact disclosure defect CF-08 corrected in the engine.
4. **Points the fixture does not cover in Pro output:**
   - Lilith (`calculateMeanLilith`);
   - Chiron, Ceres, Pallas, Juno and Vesta (Keplerian approximations);
   - South Node;
   - aspects;
   - `motionStatus` values, near-station sign;
   - latitudes 60–66°, beyond Reykjavik's 64.1°;
   - dates outside 1985–2026.

   Earlier owner packets hold Swiss station and retrograde fixtures (`proRetrogradeSwissReference`, `proRetrogradeStationsSwissR4`, `SWISS_STATIONS_REFERENCE_R5.json`). They are not on canonical and were not re-run here.
5. **Duplicate-engine decision is still open.** R10 and R11 called the separate Pro engine a "bounded compatibility proposal" and named shared-core versus a maintained Pro engine as a decision owed. The two engines now differ only by the CF-08 corrections plus type annotations.
6. **`proLocalWorkbench.ts` and its 14-case reference test** passed in the archived run, but neither is on canonical. Whether that code belongs to this lane is unestablished.
7. **Not checked:**
   - owner issue #1893 and its comments (no network);
   - unreachable git objects;
   - a complete recursive search of `/Users/soullab/JARVIS-handoffs` (the grep timed out);
   - whether production runs `e51437ae` (no production read).
