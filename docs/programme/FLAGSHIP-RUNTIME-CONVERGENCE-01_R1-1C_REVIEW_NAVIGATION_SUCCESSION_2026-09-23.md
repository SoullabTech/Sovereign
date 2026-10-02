# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1C — Review Navigation Succession + Governed Re-freeze

**Date**: 2026-09-23
**Act**: R1-1C (founder-authorized after R1-1B-A1 PASS · CLOSED)
**Starting head**: `e5a89f2a4` on `fix/flagship-ec1-contract-reconciliation-20260923` · **canonical** `b4f73ac4c` in ancestry · **carried semantic authority** `1fcf1ad0a` (R1-1B, unchanged)
**Lineage**: suite `14bc889f7` (RED) → implementation + successions `af3aac0e1` → FS2 freeze `a1a2ead79` → type placement `fac6aed0e` → this record
**Authority**: Review is a visible flagship destination; entry into a particular Review still resolves ONLY through one explicit human choice → `reading=<id>` → the unchanged R1-1B runtime. ⛔ No reading inferred · no aggregation · no commission · no cognition · no write · no legacy bridge · read-only capabilities unchanged · no deploy · no flag. ⛔ STOPPED for founder adjudication. No post-R1-1C capability act taken.

## 0. Standing at the top

- **Visible Review navigation exists, and Write remains intact.** The one shell names **Write · Review** on both orientation surfaces (rail, mobile). The current destination is non-interactive orientation; the other carries its lawful action — a location as `<a href>`, an act as `<button>` — marked `data-affordance="navigate"`. Develop is not named; no legacy room is linked; no second shell, no second state store.
- **Nothing selects a reading but the member.** Choosing Review with no reading opens the **reading chooser**: the member-owned ledger's own metadata (lens in plain language, day frozen, observation count), in the ledger's own order, nothing pre-chosen, nothing from inside any reading. A row that produced no reading is shown as that fact and is not a link. An empty ledger is one sentence, never an offer to commission. The member's explicit choice becomes `reading=<exact id>`; R1-1B takes over. A direct `reading=<id>` never passes through the chooser; an unavailable, foreign, stale or unknown reading is the R1-1B unavailable state, with no fallback.
- **The URL is the single state authority.** `m` · `s` · `reading`. An explicit `reading` is Review whatever the transient chooser flag says; Write from Review removes only `reading`. Ordinary Write makes no reading request; the ledger is read only while the chooser is open.
- **Suite first**: reference 1/19 on `e5a89f2a4` (every runtime law UNMOUNTED; succession custody unmarked; the governing R1 suites unfrozen), D1–D15 dying on their named laws. After the act: **19/19 · 15/15 dead · LETHAL + DISCRIMINATING**.
- **Live runtime witness 12/12** (§5): zero reading GETs on ordinary Write; ledger-only on entering Review; the exact chosen id in the URL and ledger → that reading → R1-0 ready → R1-1B mount; Write return non-mutating; direct URL and unavailable behaviour intact; mobile and desktop expressing the same law; member-scoped digest byte-identical; provider hits 0; non-GET requests 0.
- ⚠️ **W7 exposed a pre-existing defect, repaired in the act**: the mobile orientation surface had **never rendered visibly** — `flagship.css` set `.fs-mobilenav{display:flex}` inside the 820px media block *before* the base `.fs-mobilenav{display:none}`, and at equal specificity source order wins. The controlled witness's own mobile-390 captures show no navigation since B2. The rule now follows the base rule; six controlled mobile captures change (the nav appears); `render.tsx` and `witness.json` are unchanged; mechanical checks ALL PASS. §7 classifies it.
- ⚠️ **Succession is wider than C1B-L6 alone, and every instance is explicit** (§3): four predecessor pins of the same pre-Review-navigation fact had to succeed — C1B-L5, C1B-L6, R1-1B-L10 (renamed), R1-1B-L16 — plus one authority pin that named the shell (C1C1-L14) and one classification (C1B D1). Each predecessor assertion is read from its frozen historical blob at every run.
- **FS2 established** (§6): 95 frozen · 57 FS1 files accounted for · 3 explicitly superseded · FS1 manifest preserved byte-for-byte and pinned by its FS1 digest · verifier proven lethal three ways.

## 1. Successor navigation law (R1-1C-L1) and the predecessor it succeeds

Predecessor, frozen at FS1 (`4dade9a68`), `C1B-L6-no-legacy-mode-bridge`: *exactly two orientation entries, every one `data-nav="write"`*. Its reason: flagship navigation is explicit, bounded, non-duplicative and revives no legacy mode architecture. That reason survives unchanged; what changes is that Review is admitted as a flagship destination.

Successor (`R1-1C-L1-successor-navigation`, frozen at FS2): in Write, exactly four navigation entries across one rail and one mobile surface — Write current (orientation, ×2) and Review as an act (`<button data-nav="review" data-affordance="navigate">`, ×2); in Review or the chooser — Review current (×2) and Write as a location (`<a data-nav="write" href=…>`, ×2); no Develop; no `/writers-studio/review` or `/writers-studio/develop` anywhere in markup or source.

`StudioChrome` gained a `nav` prop of lawful actions; reference and orientation output are byte-identical to C1B when `nav` is absent, which is why the frozen controlled witness's 44 renders still pass mechanically. `NavAction`/`NavActions` sit beside `NavDestination` in `flagshipTokens.ts` (the shell imports nothing from the rebuild module).

## 2. Explicit-choice law, as data (`app/writers-studio/rebuild/reviewNavigation.ts`, pure)

| Seam | Law |
|---|---|
| `studioMode({reading, chooserOpen})` | `reading` → `review`, whatever the flag; else flag → `review-choose`; else `write` (L9, D9) |
| `enterReview(reading)` | `review` with the explicit id, else `choose`; the ledger is never consulted — an auto-selecting candidate is buildable (the law offers it the ledger) and dies (L2, D1 newest · D2 first) |
| `chooseReading(id, loc)` | `{kind:'navigate', href}` and nothing else — a choice is a location, never a mount (L6, D6) |
| `loadReadingChoices(m, ports)` | `listReadings` only; never `getReading`; never a POST (L3, D3 · L4, D4) |
| `shouldLoadChoices(req)` | true only in `review-choose` — ordinary Write fetches nothing (L5, D5) |
| `attachChoices(pending, current)` | a late ledger attaches only while the chooser is open, nothing selected, same generation (L18) |
| `locationForWrite` / `locationForReading` | remove only `reading` / set exactly `reading`; `m`, `s`, dev-only params preserved (L9 · L13, D13) |
| `navActionsFor(mode, loc, act)` | the current destination has no action; Write from Review calls only `go(href)` (L10, D10) |

`ReviewChooser.tsx` (pure) renders `data-review="choose"` with `data-choose="loading|choices|unavailable"`; each lawful row is `<a data-reading-choice=<id> href=…>` carrying `reading=<that id>` exactly; `outcome:'none'` rows carry `data-reading-outcome="none"` and no link; an empty ledger renders `data-review-empty`; no `aria-current`, `data-selected`, `data-chosen` or autofocus (L17). Copy: *Open one of MAIA’s readings of this Work. Nothing here is chosen for you.* · *There are no readings of this Work to open.* · one calm unavailable sentence.

The host holds a transient `chooserOpen` flag and a `ChooserState`; an explicit `reading` closes the flag; navigation is `router.push` of a composed location, never a second composer (R1-1B-L11's single-composer scan still holds). The read-only capability set is untouched: `askMaia · discuss · explore · commission · acknowledgeStale · ownObservation · navigate · facet` all false (L11, D11); lens tabs still filter already-loaded material and commission nothing (`onLens` unchanged, per the R1-1B adjudication).

## 3. Succession custody — every predecessor pin, explicitly

| Predecessor (frozen) | What it pinned | Successor | Predecessor witness |
|---|---|---|---|
| `C1B-L6-no-legacy-mode-bridge` | two orientation entries, all `write` | asserts the successor set (Write · Review × two surfaces), no Develop, no legacy room | `git show 4dade9a68:…c1b/laws.ts` contains `navs.every((n) => n === 'data-nav="write"')`, checked every run |
| `C1B-L5-no-dead-production-control` | `buttons === 0 && anchors === 0` — true only because no lawful navigation existed | every `<button>`/`<a>` in ordinary Write is a navigation entry carrying `data-affordance="navigate"`, and nothing else | the FS1 blob text, checked every run |
| `C1B` candidate D1 | rendered the predecessor Write-only shell verbatim | unchanged; its new L6 collateral CLASSIFIED as irreducible (the historical candidate is not rewritten) | — |
| `C1C1-L14-authority-untouched` | also pinned `StudioChrome.tsx` (composition, not authority) | StudioChrome leaves the standing pin — IR1 precedent, option B; ⛔ not re-pinned to a newer blob; every authority file stays pinned | the FS1 blob's pin list, checked every run |
| `R1-1B-L10-no-visible-review-navigation` | navs 2, all write, no `data-nav="review"` in markup or source | **renamed** `R1-1B-L10-no-legacy-review-navigation`: mounted reading read-only, successor nav set, **no legacy bridge** (its D10 still dies on the legacy href) | `git show 1fcf1ad0a:…r1-1b/laws.ts` contains the predecessor assertion, checked every run |
| `R1-1B-L16-ordinary-write-unchanged` | two goldens of the pre-navigation Write | the two R1-1B goldens stay in place **byte-identical to their `1fcf1ad0a` blobs** (verified every run) as historical custody; ordinary Write is compared to the R1-1C successor goldens of the same two states | blob identity, every run |

`R1-1C-L12-c1b-succession-explicit` binds this: the current C1B source must carry the successor marker and read the FS1 blob; the C1C1 source must mark its succession and no longer pin the shell; D12 (a rewrite with the markers stripped) dies. The R1-1B walk's navigation assertions follow the succession (13/13 rerun on the same shadow); the frozen C1B walk's F-8 is historical (§6). ⚠️ **Founder-visible**: the authorization named C1B-L6; L5, R1-1B-L10/L16, C1C1-L14 and the D1 classification are the same fact pinned at other addresses, and were treated the same way — explicitly, never silently. Any of them can be reversed by ruling.

## 4. Matrix (`npm run matrix:ws-flagship-r1-1c`)

Known-bad on `e5a89f2a4`: reference **1/19** (L19 only), candidates 15/15 dying. Final: **19/19 · 15/15 · LETHAL + DISCRIMINATING**. Classified collateral, each irreducible: D3 → L17 (a commissioning Review must draw the commission); D4 → L17 (merged findings are not what the ledger holds); D8 → L1, L16 (a bridge is an extra entry and moves the goldens); D9 → L14 (a store outranking the URL forces the direct link through the chooser); D14 → L9 (the same store from the other side). Two stale classifications (D3→L11, D4→L16) were found by the matrix and removed — the laws render with the reference chooser and a non-empty ledger, so those collaterals never fire. ⚠️ **One law fixed by the matrix, not a candidate**: L6's static scan used `view:\s*(?!r\.view)`, which backtracks to zero spaces and matches the loader's own `view: r.view`; it now reads `view:(?!\s*r\.view)`. Goldens: `nav-write-plain · nav-write-held-editorial · nav-review-choose · nav-review-choose-empty` (L16) and `write-plain · write-held-editorial` (the R1-1B-L16 successors), captured on the candidate and frozen under FS2.

## 5. Live runtime witness (⚠️ candidate evidence · ⛔ not production · ⛔ not a member walk)

Disposable PostgreSQL 16 shadow (446 migrations applied / 51 refused) · real `next dev` with `ANTHROPIC_BASE_URL` pointed at a counting stub answering 500 · real authenticated session · readings seeded directly (`current` · `other` · `stale` · `none`), never through the commission route. `npm run witness:flagship-r1-1c` → **12/12**:

| | Result |
|---|---|
| W1 | ordinary Write: two authored bodies; navs 4 — Write current ×2, Review act ×2, no Develop, no legacy; **zero reading GETs**; no non-navigation button |
| W2 | Review entered: chooser from the ledger; trace exactly `GET …/readings`; URL has no `reading`; 3 choice links + 1 non-link `none` row; no finding, no ready/loading, no forbidden control, nothing pre-selected; provider hits 0, POSTs 0 |
| W3 | choosing `current`: URL `m · s · reading=<current>`; trace ledger → that reading; `data-review-reading=<current>`; one finding `dobs_<current>`; no other reading's id or prose; Review current, Write link without `reading` |
| W4 | Write returns: `reading` gone, `m`/`s` kept; Review unmounted; zero reading GETs; POSTs 0; hits 0 |
| W5 | direct `reading=<current>`: ledger → reading; one finding; never the chooser |
| W6a/b | unknown direct → unavailable, ledger only, no chooser, no fallback; a **chosen stale** reading → the identical unavailable markup, no substitute, no reread, all GET |
| W7 | 390px: mobile nav visible, rail hidden, `Write|Review` on both surfaces, Review opens the chooser, Write is the link back, one ledger GET, no legacy bridge |
| W8 | member-scoped digest byte-identical across the whole cycle; provider hits 0; non-GET requests 0 |

Screenshots: `docs/design/contracts/screenshots/flagship-r1-1c/` (w1-write · w2-chooser · w3-chosen-ready · w6-chosen-stale-unavailable · w7-mobile-write · w7-mobile-chooser). Observed, not touched: an "Audio enabled" pill from the surrounding app layout appears on the mobile chooser capture — outside this composition and this act.

## 6. Governed re-freeze — FS2 (`npm run verify:flagship-freeze`)

`FLAGSHIP_FREEZE.json` is now **FS2** (base `af3aac0e1`, 95 frozen). **FS1 is preserved byte-for-byte** at `FLAGSHIP_FREEZE_FS1.json` and pinned in the verifier by its FS1 digest `d1fff27d…`; the verifier additionally enforces succession custody: each of the 57 FS1 files is re-frozen at its FS1 blob or named under `supersedes.superseded` with its FS1 blob, a successor law and a reason — exactly three are: `flagship-c1b/laws.ts` · `flagship-c1b/candidates.tsx` · `flagship-c1c1/laws.ts`. Newly frozen: the R1-0, R1-1A, R1-1B and R1-1C laws, candidate registries, matrices, goldens, witnesses (`r1-1b-live-review-walk` · `r1-1b-provider-counter` · `r1-1c-live-navigation-walk` · the R1-0 integration witness) and typecheck instruments. Deliberately not frozen: golden capture tools; the R1-1A candidate seams (`R1-1A-L9`, itself frozen, requires a subject's seam files outside the freeze — freezing them made D6/D7 die on L9 as collateral, and the manifest was corrected rather than the law). `historical_witness` records that the frozen C1B walk's F-8 asserts the predecessor nav set, and that six controlled mobile captures changed under the CSS repair. **Verifier lethality**: a frozen-file drift → exit 1 → restored → 0; the preserved FS1 manifest altered → *SUCCESSION CUSTODY BROKEN* → 1; the FS2 manifest edited without its pin → 1.

## 7. Closing gates

| Gate | Result |
|---|---|
| `matrix:ws-flagship-r1-1c` | 19/19 · 15/15 dead · LETHAL + DISCRIMINATING |
| `matrix:ws-flagship-r1-1b` · `-r1-1a` · `-r1-readonly` · `-c1a` · `-c1b` · `-c1c1` · `-ws-flagship` | 18/18·16/16 · 12/12·11/11 · 14/14·12/12 · 9/9·8/8 · 10/10·9/9 · 19/19·16/16 · 13/13·8/8 — all LETHAL |
| `verify:flagship-freeze` (FS2) | 95/95 intact · succession custody over FS1 intact |
| `typecheck:ws-flagship-r1-1c` · `-r1-1b` · `-r1-1a` · `-r1-readonly` · `-c1a` · `typecheck:ws-flagship` | PASS |
| `typecheck:ws-flagship-c1b` · `-c1c1` | ⚠️ FAIL on 17 inherited `readState.ts`/`draftSections.ts` diagnostics reached through the host's R1-1B import graph — **already FAIL at `1fcf1ad0a`** (verified in a worktree at that SHA); ⛔ not an R1-1C regression; ⛔ not repaired (the shared C1A instrument is frozen) |
| `witness:flagship-r1-1c` | 12/12 · R1-1B walk rerun 13/13 |
| frozen `render.tsx` | 44 renders · mechanical ALL PASS · `witness.json` unchanged · **6 mobile-390 captures changed** (the nav is now visible — §0) |
| `npm run typecheck` (ship) | no regressions |
| `ci:sovereignty` (29/29) · `check:design-canon` · `check:no-supabase` · `check:no-openai` · `git diff --check` | green |

Canonical-side trailing whitespace in JEV/operator records (reported at A1) is inherited canonical material and was not repaired.

## 8. Not done, by design

No automatic selection of any kind · no aggregation · no commission, reread or cognition · no Discuss/Explore/MAIA/facet in Review · no member observation, standing, keep or write · no lens persistence · no routing change beyond the existing route's URL state · no legacy `/writers-studio/review` bridge · no reading API, mapper, schema, migration, provider or deployment change · no feature flag · no deploy. `mapRealReview`, `liveReview.ts` and both reading routes are blob-identical to `1fcf1ad0a` (L19).

**Standing: R1-1C ✅ BUILT · WITNESSED · RE-FROZEN (FS2) · GATED ON CANDIDATE · STOPPED for founder adjudication · production untouched.**
