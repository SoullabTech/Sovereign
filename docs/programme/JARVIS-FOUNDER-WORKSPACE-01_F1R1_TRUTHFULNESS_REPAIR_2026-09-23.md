# JARVIS-FOUNDER-WORKSPACE-01 / F1R1 — Prototype Truthfulness + Freshness + Human-Label Repair

**Authorized by:** F1 founder adjudication §VII (`…_F1_FOUNDER_ADJUDICATION_2026-09-23.md`) against exact candidate `8349aa5d8c29b5862dd0861cfc7cb9c51cb9bd2d`.
**Scope discharged:** exactly the seven items. ⛔ No runtime code · no Desktop mutation · no IPC · no projector · no Graph/Monitor implementation · no O7 · no O10 · no F2.
**Canonical:** ⚠️ **ADVANCED DURING F1R1.** *(Superseded text, preserved: "still `b4f73ac4…` (re-checked at F1R1 authoring; no reconciliation owed)" — true when written, before the post-commit fetch.)* See **§ Freshness** below.
**Standing:** F1R1 REPAIRS APPLIED · prototype validation rerun (syntax check + one headless render of Today · Graph · Monitor) · ⛔ **F1 NOT CLOSED — the founder's experiential walk is the exit** · ⛔ F2 NOT OPEN.

## Repairs, one by one
| # | Ruling | What changed | Where |
|---|---|---|---|
| **F1-R1** | Snapshot completeness | `programme_state.population` added: definition · source · `examined: 26` · `emitted: 13` · selection rule · `not_emitted[13]` · `unreadable[]` · `unclassified[2]` · **`complete: false`** with `why_not_complete`. Contract gains the `population` block and **PS-9 Population before totals** (unqualified totals only when a deterministic projector set `complete: true`; a manual `complete: true` is a defeat candidate). | `fixtures.js` · `programme-state.v1.fixture.json` (regenerated) · `…_F1_PROGRAMME_STATE_V1_CONTRACT_2026-09-23.md` §2, §3 |
| **F1-R1 (Today)** | Snapshot-qualified totals | Headline reads *"In this recorded snapshot, N decisions are waiting on you and M programmes are in motion."* whenever `population.complete !== true`; lede states *13 included of 26 examined by hand; completeness not mechanically established, so they are not totals*; the *Needs you* heading carries *visible in this snapshot*; the rail badge's tooltip says the same. The wording drops the qualifier by construction once a projector sets `complete: true`. | `index.html` `today()` |
| **F1-R2** | Freshness semantics | Every Monitor row now carries an explicit **`freshness`** field (`current` = observed on the snapshot date · `historical` = observed earlier · `none`) — data, not a heuristic. Display level: a `good` value that is `historical` renders as **`Observed then · present state unknown`** (hollow green pill, distinct from dashed *Not observed* and from *needs care*/*failed*); such rows never enter the "observed now and fine" count. Headline now counts six states: *observed now and fine · observed earlier with present state unknown · need care · failed · not observed · not permitted*. Warn/failed rows that are historical keep their level and show *present state unknown* beside the age. Result at this snapshot: **2 now-fine · 4 historical · 4 need care · 1 failed · 8 not observed · 2 not permitted** (was 6 "observed and fine"). | `fixtures.js` (21 rows) · `index.html` `displayLevel`, `monitor()`, legend, CSS |
| **F1-R3** | Human-first graph labels | Every node's `label` is an ordinary-language subject; identifiers moved to `sub`: *O4 router implementation* / `commit 51890bc0 · unwitnessed` · *F0 census record* / `commit 8b8592d9` · *Canonical trunk at census* / `b4f73ac4` · *Founder Workspace branch* / `claude/sharp-cannon-cyrdeb` · *Work engine* / `Builder runtime` · *JARVIS console* / `the desktop app`. Monospace now applies only to the identifier sub-label; node width accounts for the sub-label so nothing clips. | `fixtures.js` graph nodes · `index.html` CSS + layout |
| **F1-R4** | Recorded vs illustrative | Banner: *"This uses recorded evidence as of 23 Sep 2026 (canonical b4f73ac4); anything illustrative is marked as such where it appears. Nothing here is live, and nothing you press runs anything."* — true globally; the three illustrative Work Units remain marked in place. | `index.html` banner |
| **F1-R5** | Zero-network containment | Both Google Fonts `<link>` tags removed; font stacks are system faces only (`system-ui` · `Iowan Old Style`/Palatino/Georgia · `ui-monospace`/Menlo). `grep -c "https://" index.html` → **0**. README and the F1 record corrected; the F1 record's original *no network* claim is preserved as superseded, not edited away. | `index.html` · `README.md` · `…_F1_INFORMATION_ARCHITECTURE…md` |
| **(7)** | Regenerated derived files | `programme-state.v1.fixture.json` and `…_F1_VOCABULARY_MAP_V1_2026-09-23.md` regenerated from their single sources (vocabulary unchanged: 55 · 51 verified · 4 candidate). | prototype dir · docs |

## Validation rerun
- Inline script `node --check` → OK. Fixtures + vocabulary load under Node → OK; monitor display-level census `{good:2, historical:4, warn:4, failed:1, unobserved:8, unauthorized:2}` (sums to 21).
- One headless Chromium render each of `#today`, `#graph`, `#monitor` at 1280px: headline scoped; historical pill and legend visible; graph leads with subjects. Three render defects found in that look and fixed in the same pass (commit label typeface, sub-label overflow, legend swatch). ⛔ No second look taken; the live page is the review surface.
- External requests in `index.html`: **0**.

## What this act did not do
⛔ Did not implement the projector (population stays manual and `complete: false`) · ⛔ did not add any instrument to Monitor · ⛔ did not build the evidence join behind Graph · ⛔ did not touch `jarvis-desktop/src/**`, `scripts/**`, `app/**`, `lib/**` · ⛔ did not perform or claim the founder walk.

## Exit
Per adjudication §VIII: the founder performs the experiential walk on the repaired prototype (`prototypes/jarvis-founder-workspace-f1/index.html`, or the republished private mirror) against the seven questions. Green → F1 closes and the next boundary is **`F2 — SURFACE COMPOSITION CONTRACT + IMPLEMENTATION SEQUENCE`**. Not green → a further bounded repair act.

## Freshness (dated 2026-09-23, after commit `0858331d`)
```text
observed against   b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f   (census SHA — unchanged; the fixtures are NOT re-observed)
canonical now      840194ba                                    origin/clean-main-no-secrets after PR #1495 (CANONICAL-ADMISSION-ENFORCEMENT-01 / E1)
lane merge-base    b4f73ac4                                    the lane still branches from the exact census SHA
drift              1 file: docs/programme/CANONICAL-ADMISSION-ENFORCEMENT-01_E1_FAIL_CLOSED_ADMISSION_DESIGN_2026-09-23.md (+666)
                   0 files under jarvis-desktop/ · scripts/builder/ · scripts/ops/ · CLAUDE.md
```
- **Consequence for the substrate census (F0 §2):** none — nothing the console or the runtime scripts depend on changed.
- **Consequence for the population claim (F1-R1):** the drift adds exactly one new subject to the programme population that the hand-projected fixture **did not examine** (`examined: 26` was true at `b4f73ac4`). This is precisely the case PS-9 exists for: the fixture stays `complete: false`, the Today headline stays scoped to the snapshot, and the new subject is recorded here as **not examined**, ⛔ not silently added to the fixture. A re-projection is a later dated act (or the projector's job).
- ⛔ History not rewritten; the fixture's `observed_against` remains the census SHA.
