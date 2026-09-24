# JARVIS-WRITERS-STUDIO-FULL-REDESIGN-01 · PC3-S1 — Evidence Record
## Canonical Light Shell + Appearance Architecture (as amended by PC3-S1R1)

**Standing:** CANDIDATE · STOP BEFORE MERGE · FOUNDER VISUAL REVIEW — PC3-S1
**Authority:** isolated non-production implementation only
**Packet:** JARVIS `control-room/writers-studio/PC3_S1_CC_EXECUTION_PACKET.md` as amended by `PC3_S1R1_PACKET_AMENDMENT.md` (control room `ee4fbcc77678d9f3a0f2c4e8a0e09ec6df358259`)
**Base:** `origin/clean-main-no-secrets` = `e886888416062c7fcbcf899040e3827bc8013835` (freshness verified = packet expectation)
**Branch:** `feature/ws-full-redesign-pc3-s1-shell-20260924`

---

## 1. References (founder originals, custody `c0f4bca2952a6b6afa2d74e204117b6abdf1915a`)

| state | original | SHA-256 |
|---|---|---|
| cross-mode family | `Soullab Writers Studio Visual Canon.png` | `e5a72601548ee0f19e490a0f3c6f99d66694b2333217d6c341e64e9a37c44b25` |
| `develop-themes` | `Soullab Themes Writing Workspace.png` (#10) | `c3f708824e35d998570241847c4896b94438ad71f8c6cddd3082cb86b417cf08` |
| `develop-manuscript` | `Soullab Manuscript Analysis Dashboard.png` (#11, Develop active) | `9986821d23396f4a48058926a556697685530b56f215d841476d70d86a29543e` |
| `review-chapter` | `Soullab Writer’s Studio Review Dashboard(3).png` (#23) | `b46562a7268cd499316c49c84bbbeeb13550d5de2aa14e00296eaab2bd8ecc82` |

All four verified by hash from the custody commit before use; `VISUAL_CUSTODY_SHA256SUMS.txt` verifies clean. The capture
instrument re-reads each original with `git show` and re-checks its hash — no candidate render is ever used as a reference.

## 2. What was built

- **Shell** (`app/writers-studio/full-redesign/`): `Shell.tsx` (four regions in fixed order: product bar · manuscript
  context · the Work · MAIA), `tokens.ts` (colour roles for Light + a derived Night proof; per-state geometry measured from
  each original), `types.ts`, `fixtures.ts` (River Between fixture text + imagery cropped from the originals).
- **Founder-review route** `/dev/writers-studio-full-redesign-review?state=develop-themes|develop-manuscript|review-chapter`
  (`app/dev/writers-studio-full-redesign-review/`). Outside `app/writers-studio/**`, so it does not inherit
  `StudioAtmosphere` and its atmosphere GET/PUT (amendment §3). “Founder review · fixture data” sits in a strip below the
  captured 100vh product frame; state and appearance selectors live there too.
- **Instruments:** `scripts/writers-studio/pc3-s1-fidelity.mjs`, `scripts/writers-studio/pc3-s1-capture.mjs`.
- **Tests:** `app/writers-studio/__tests__/fullRedesignShell.test.ts` (13 structural laws).
- **Contract:** `docs/design/contracts/writers-studio-full-redesign-pc3-s1.md` (experiential, covers the shell).

Reconciliation per amendment §6: files first created at `app/writers-studio/full-redesign-review/**` were **moved** to
`app/dev/writers-studio-full-redesign-review/**`; no duplicate route or test copy exists. The `.test.tsx` was never
committed; the suite exists only at the amended `.test.ts` path.

## 3. Gates (all run in this session)

| gate | result |
|---|---|
| `npm run typecheck` | ✅ No TypeScript regressions (one new diagnostic found in the candidate was fixed, not baselined) |
| `npm run check:design-canon` | ✅ 1 Experience Contract covers this change (run after screenshots existed; new files staged so the gate could see them) |
| `npx jest app/writers-studio/__tests__/fullRedesignShell.test.ts --runInBand` | ✅ 13/13 |
| `npm run check:no-supabase` | ✅ |
| `node scripts/writers-studio/pc3-s1-fidelity.mjs` | ✅ **55/55 GREEN** |
| `… --mutant maia-drop` (known-bad) | ✅ **49/55 RED** — dies on exactly `R-maia-right@1100` and `@1024` in all three states, nothing else |
| `node scripts/writers-studio/pc3-s1-capture.mjs` | ✅ 9 renders + 3 side-by-sides |

**The suite was itself falsified before being trusted.** Three mutants were injected into the shell and reverted:
network call → killed; Explore in the spine → killed (2 laws); a *relative* import of the live `StudioAtmosphere` →
**survived** the first version of the import law, which matched path text instead of resolved paths. The law was repaired
to resolve every specifier to a repository path; the relative and aliased variants are now both killed. The suite was
wrong, so the suite was repaired — never the candidate.

**The fidelity instrument caught the candidate, not the other way round.** First full run: 50/55 RED — #11 held passage
14 px high, MAIA card 37 px short; #23 hero/tiles/findings 27 px low and findings card stretched by grid alignment. Each was
repaired in the candidate; no contract number was changed.

## 4. Fidelity contract (from the originals, ±6 px)

| state | bar | manuscript l/r/t/b | Work l/r | MAIA l/r/t/b | landmarks |
|---|---|---|---|---|---|
| #10 | 56 | 13/311/63/1011 | 333/1175 | 1193/1524/63/1011 | hero 334/1174/206/437 · theme row 505–570, pitch 68 · lower cards top 785 |
| #11 | 55 | 11/305/66/1009 | framed 318/1112/66/1009 | 1125/1527/66/1009 | held passage 348/1080/537/618 · MAIA card 1148/1507/181/423 |
| #23 | 51 | 19/256/66/976 | 273/1164 | 1182/1517/66/977 | hero 274/1163/187/350 · tiles 360–431 · findings 439–944 |

Plus, per state: colour roles (ground #F3F3F3 · panel #FEFEFE · title ink #08143B, ΔE ≤ 6), text encoding (no mojibake;
curly punctuation present), chapter ranges do not wrap, spine = Home·Write·Develop·Review, **zero business network
requests** (fetch/XHR/EventSource/WebSocket other than the dev HMR socket), and MAIA right of the Work at
1536 · 1440 · 1280 · 1100 · 1024.

## 5. Screenshots (`docs/design/contracts/screenshots/full-redesign-pc3-s1/`)

- `develop-themes-1536x1024.png` · `-1440x900.png` · `-1280x800.png` · `-1100x800.png` · `-1024x768.png` · `-390x844.png` (full frame, phone)
- `develop-manuscript-1536x1024.png` · `review-chapter-1536x1024.png`
- `develop-themes-night-1536x1024.png` (Night proof: same geometry, colour roles only)
- `side-by-side-develop-themes.jpg` · `side-by-side-develop-manuscript.jpg` · `side-by-side-review-chapter.jpg` — founder original LEFT · browser candidate RIGHT, same viewport and state

## 6. Known differences (named, not hidden)

1. **Hero imagery** is cropped from the founder originals and carries their lettering inside the image; it keeps the
   original’s aspect ratio at every width so the lettering is never cut. Real hero photography with live text is owed to a
   later asset act.
2. **#23 Review, under ratified law:** canonical product bar (no Explore / Library / global Search / bell; one-line brand;
   56 px vs the original’s 51 — within tolerance); **Readiness** tab withheld; **“Balanced · Pacing”** tile replaced by a
   lawful count (“4 · Observations · from this reading”); **“Most relevant”** sort replaced by “In manuscript order”;
   “Key Findings” titled “Findings” (PC1 VS-16, VS-17).
3. **#11 formatting toolbar** is drawn as in the original but inert and `aria-disabled` — editing arrives with real Write (PC5).
4. **Fixture interactions:** theme selection, Develop/Review tabs, MAIA tabs, Review filters and the compose box respond
   locally; MAIA suggestion rows, “Open in manuscript”, “Edit your map”, “+ Add” are visual only. Non-S1 tabs say “a later
   PC3 state family”. Home/Write in the spine report in the review strip that they are later PC3 states (no dead nav, no fake room).
5. **Story Map and Continuity grid** in #23 are fixture drawings with no substrate (PC1 VS-09/VS-10 capabilities are not built).
6. **Iconography** is hand-drawn SVG approximating the originals’ icons.
7. **Typography:** Newsreader + Inter through the app’s existing `next/font/google` path (build-time acquisition, served
   from this host at runtime); no font binaries committed.
8. **1024 px:** MAIA’s third suggestion scrolls beneath the compose box. **Tablet (< 1024):** the manuscript context becomes
   a strip above the Work while MAIA keeps the right — not covered by any S1 original. **Phone:** Develop tabs scroll
   horizontally; manuscript context is capped at 260 px. S1 proves recomposition only, not PC10 mobile acceptance.
9. **Member initial** is “J” in every state (#23 shows “K”).

## 7. Negative visual evidence — falsifier answers (NV required use)

1. *Does this resemble the old workbench?* — Not by construction: light ground, no dark rail, no permanent tool chrome,
   manuscript primary. **Founder to confirm.**
2. *Generic SaaS / Office / copilot?* — The measured geometry and typography are the originals’; whether it *feels*
   generic is exactly what the machine cannot judge. **Founder to judge.**
3. *Did any real function disappear?* — **No.** The production route `/writers-studio/rebuild` still mounts
   `RebuildStudioClient` (asserted by the suite); no live file was modified.
4. *Did any mock capability become fake live data?* — **No live route shows it.** All content is fixture, on a `/dev/`
   route marked “Founder review · fixture data”, with zero business network requests.
5. *Is the comparison against the original founder reference?* — **Yes**, read from custody `c0f4bca2` and hash-checked by
   the capture instrument.
6. *What remains for founder judgment?* — atmosphere, elegance, Soullab feeling, MAIA’s relational quality, and PC4 acceptance.

## 8. What this proves / does not prove

**Proves:** the canonical Light Shell exists as real React/Next code; at 1536×1024 it reproduces the measured regions and
landmarks of #10, #11 and #23 within ±6 px; MAIA holds the right at every required desktop width, and the instrument dies
on the rejected preview’s defect; appearance changes colour roles only; the review harness makes zero business network
requests; production is untouched.

**Does not prove:** founder visual acceptance (PC4); atmosphere, elegance or relational quality; any live data, live MAIA,
Develop or Review intelligence, Themes cognition, persistence, authorship or mutation; Write composition; Home; final mobile
(PC10); production readiness.

## 9. Boundary

No merge. No deploy. No production route replaced. No schema, API, flag, access-matrix, Jest-config or design-canon-config
change. **STOP: FOUNDER VISUAL REVIEW — PC3-S1.**
