# JARVIS-WRITERS-STUDIO-FULL-REDESIGN-01 · PC3-S3 — Evidence Record
## Write Resting + Full Canvas

**Standing:** CANDIDATE · STOP BEFORE MERGE / DEPLOY · FOUNDER ADJUDICATION — PC3-S3 CANDIDATE ONLY
**Authority:** isolated non-production fixture implementation only
**Packet:** `docs/programme/WRITERS-STUDIO-FULL-REDESIGN-01_PC3-S3_CC_EXECUTION_PACKET.md` @ commit `ba0573367c6eef517aba9e0272216d65b0c47ad5` · git blob `a9fb938bb2167036cdad1dce4b798ca67323c72c` · SHA-256 `95511e32c196a397ac26a7c9dec113d3bef5b02693f4e15db52a365b6917e81b` · 14,282 bytes
**Exact base:** `fa151298997380fd5e4c76beef22b0afb6dc5662` (S3 visual-authority custody), parent chain verified `e8868884 → b8a3656a2 → 9995c785b → c01d19085 → d7501001e → fa1512989`
**Canonical awareness:** `clean-main-no-secrets@e886888416062c7fcbcf899040e3827bc8013835` — unmoved; PC3 lineage not rebased
**Branch:** `feature/ws-full-redesign-pc3-s3-write-20260924` · **candidate SHA:** the commit that carries this record (named in the stop report)

## 1. Custody

| | |
|---|---|
| path | `docs/design/writers-studio/founder-reference-corpus/s3-visual-authority/a_clean_multi_panel_ui_ux_design_composite_with_fi.png` |
| commit | `fa151298997380fd5e4c76beef22b0afb6dc5662` |
| SHA-256 | `982b363b158a47d229c3efcb634be0ee09e722a7810df33a500a51de8058b5d9` |
| bytes | 1,855,655 |

Both S3 instruments read the authority with `git show commit:path` and **refuse** before any browser opens on a SHA or byte mismatch (proven by the `custody-mismatch` mutant, exit 2). The custody PNG and `SHA256SUMS` are unmodified.

Adjudication notes carried with the pixels (packet §2), applied as law:
- Night has the same Chapters 6–12 tree as Light; the generated Night corruption/omission has no authority.
- S3-E's generated `passag e` has no semantic standing.
- No MANUSCRIPT document control is implemented.
- No formatting architecture: the editor is **plain-text only** (`contenteditable="plaintext-only"`); Markdown remains candidate-only.

## 2. Paths changed (all within packet §4)

Code:
- `app/writers-studio/full-redesign/WriteRoom.tsx` (new)
- `app/writers-studio/full-redesign/Shell.tsx` — one additive seam: optional `canvas` (bar + manuscript context recede, `<main>` keeps its place in the tree), and a manuscript region without a MAIA region. S1/S2 pass neither and their output is unchanged (proved below).
- `app/writers-studio/full-redesign/fixtures.ts` · `tokens.ts` · `types.ts` (additive: Write states, fixture, reference, `saved` role, `WRITE_GEOMETRY`)
- `app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx` · `full-redesign-review.css` (scoped S3 block) · `page.tsx` (metadata title names S3)
- `app/writers-studio/__tests__/fullRedesignWrite.test.ts` (new)

Evidence/instruments: `scripts/writers-studio/pc3-s3-write-{fidelity,capture}.mjs` (new) · `docs/design/contracts/writers-studio-full-redesign-pc3-s3-write.md` (new) · `docs/design/contracts/screenshots/full-redesign-pc3-s3/**` (new, 15 files) · this record.

Forbidden surfaces untouched: no `app/writers-studio/rebuild/**`, `canvas/**`, live routing, API, SQL, migration, auth, member data, save/runtime service, production config, deployment file or canonical branch; no accepted S1/S2 byte; no dependency; no MAIA call; no network.

## 3. How the build keeps one editor

- The harness holds `canvas`; the Shell receives it and renders `null` in place of the bar and the manuscript `<aside>`, so `<main>` — and the Write room inside it — keeps its position in the tree and is never remounted.
- The editor is a memoised component whose props never change across the transition, so it is not re-rendered either.
- Entering and returning restore focus and the remembered selection (anchor and focus positions in the same DOM text) explicitly; pointer presses on the controls do not steal focus.
- Return and Escape call the same `leave` action.
- **These are mechanisms, not proof.** The proof is §4 S3-E: a JS mark set on the editor node before entry is read back from the only editor during and after both returns.

## 4. S3 fidelity — `pc3-s3-write-fidelity.mjs` → **65/65 GREEN**

| group | assertions (each at 1536×1024, Light and Night unless stated) | result |
|---|---|---|
| custody | K-custody (SHA + bytes from Git) · K-source-unchanged (source bytes identical before/after) | PASS |
| S3-A/C resting | F-bar=S1 (bar, brand, nav ×4, Work picker, avatar identical to accepted S1 with Write current) · F-regions topbar·manuscript·work · T-rest-controls (Saved, Draft v12, 1 Full Canvas, Previous+Next, no Return) · T-chapters 6–12, Chapter 6 current | PASS ×2 |
| S3-B/D full canvas | F-no-bar (regions = work only) · T-canvas-controls (Saved, Draft v12, exactly 1 Return, no Previous/Next, no entry control) | PASS ×2 |
| all four states | T-one-editor (1 editor, plaintext-only) · T-held-quotation verbatim · T-no-resident-maia · T-no-formatting · F-type-roles (every text node resolves to Newsreader or Inter; 0 inline font-family) · Z-network (zero business requests) · R@1536 no overflow · A-proportions vs authority | PASS ×4 |
| Light = Night | 11 landmark boxes identical, resting and full canvas (exact) | PASS |
| one page, two fields | G-same-measure (980 = 980) · G-page-holds-height (title y 136→136, editor y 211→211, ±2px) | PASS |
| S3-E | E-before · E-enter-same-editor · E-return-button · E-enter-keyboard · E-return-escape · E-one-destination · E-no-third-exit (only control in Full Canvas: Return) · E-shell-recedes · Z-network | PASS |
| derived 1280 / 1024 / 390 | per state: no overflow · bar = S1 (resting ≥720) / no bar (full) · manuscript primary · single editor + single mode control · no MAIA · full round trip keeps the same editor | PASS ×6 |

Measured tuple (identical before, in Full Canvas, after Return, after Escape): **Work** The River Between · **place** The River Between › Chapter 6 · **selection** the full quotation (113 characters) · **cursor** offset 564 (end of selection) · **version** Draft v12 · **save** Saved · **focus** editor · **editor identity** same node, 1 editor.

Authority proportions (tolerance ±0.03 of width — composite generation noise ≈±1.5% plus the deliberate one-measure law; see the S3 contract): rail 0.234 (0.236) · resting text-left 0.298 (0.297) · resting measure 0.638 (0.635) · full text-left 0.181 (0.188) · full measure 0.638 (0.661).

**The instrument corrected two of its own definitions during the build, before any mutant ran** (implementation unchanged by either):
1. "manuscript primary" at derived desktop widths first required the rail to be right of or below the editor, which is wrong for the authority layout (rail on the left). Now: side by side, the page is ≥2× the rail; stacked, the page comes first.
2. the tuple's `Work` read the whole breadcrumb because its separator is an icon, not `›`. It now reads the breadcrumb's own segments.

**And it caught one real defect in the build:** at derived widths in Full Canvas the breadcrumb overlapped the Return control (the first grid column collapsed to 32px), so Return could not be clicked. Repaired by sizing that column to its content; the round-trip check now passes at 1280/1024/390.

## 5. Mandatory known-bad mutants (packet §13) — **all RED**

| # | mutant | result | killed law |
|---|---|---|---|
| 1 | duplicate-editor | RED | E-enter-same-editor `editors: 1→2`; E-return-*; derived round trips |
| 2 | cursor-loss | RED | E-enter-same-editor `selection → "" · cursor 564→0`; E-return-* |
| 3 | save-state-loss | RED | E-enter-same-editor `save: Saved→Saving…`; T-canvas-controls |
| 4 | return-divergence | RED | E-return-button `selection → "The river" · cursor 564→9`; E-one-destination |
| 5 | escape-removed | RED | E-return-escape **“keyboard return route LOST — Escape left canvas=full”**; E-one-destination (never passes as “fewer paths”) |
| 6 | resident-maia | RED (51/65) | T-no-resident-maia ×4; F-regions; F-no-bar; derived |
| 7 | formatting-toolbar | RED (60/65) | T-no-formatting ×4; E-no-third-exit |
| 8 | type-role-bypass | RED (61/65) | F-type-roles ×4 |
| 9 | light-night-drift | RED (63/65) | G-write-resting; G-write-full-canvas |
| 10 | shell-leak | RED (61/65) | T-canvas-controls ×2; E-shell-recedes; E-no-third-exit |
| 11 | custody-mismatch | **REFUSED** (exit 2) | K-custody — no fidelity run |

Mutants are runtime injections; source bytes were hashed before and after every run (K-source-unchanged).

**Jest laws mutation-tested** (each reverted byte-identical): rich `contentEditable` → killed (plain-text law) · component-local `fontFamily` → killed (type-role law) · Previous/Next kept in Full Canvas → killed · elapsed-time copy → killed.

## 6. Regression gates (packet §14)

| gate | result |
|---|---|
| S1 fidelity | **55/55 GREEN** |
| S1 drift −0.6 / −0.3 / +0.3 / +0.6 | **55/55** each |
| S1 maia-drop mutant | **49/55 RED** |
| S2R1 Home fidelity | **91/91 GREEN** |
| S2R1 mutants resident-maia · urgency · bar-shift · no-room-field · flat-tones · heavy-chrome · orphan-sep | 87 · 87 · 75 · 63 · 76 · 87 · 87 /91 — all RED (unchanged) |
| accepted S1 + S2 captures regenerated | **0 byte difference** (not committed) |
| Jest `fullRedesignShell` + `fullRedesignHome` + `fullRedesignWrite` | **49/49** (13 + 21 + 15) |
| `npm run check:design-canon` | ✅ 3 Experience Contracts cover the change |
| `npm run typecheck` | ✅ no regressions (226 vs baseline 239) — one new diagnostic in the build (`RefObject` type) was caught by the gate and fixed |
| `npm run check:no-supabase` | ✅ |

## 7. Captures and boards (`docs/design/contracts/screenshots/full-redesign-pc3-s3/`)

- Authority width: `write-resting-1536x1024.png` · `write-resting-night-1536x1024.png` · `write-full-canvas-1536x1024.png` · `write-full-canvas-night-1536x1024.png`
- Derived: `write-resting-{1280x800,1024x768,390x844}.png` · `write-full-canvas-{1280x800,1024x768,390x844}.png`
- Boards against the custodied authority region: `board-s3-a-light-write-resting.jpg` · `board-s3-b-light-full-canvas.jpg` · `board-s3-c-night-write-resting.jpg` · `board-s3-d-night-full-canvas.jpg` · `board-s3-e-transition-return.jpg` (behavioural: four frames of one live session with the measured tuple under each — not a drawn fifth screen)

## 8. Derived responsive findings (not founder authority)

- 1280 / 1024: the authority composition holds; the rail narrows toward its floor, the page keeps the 980 measure where room allows, the bar equals S1.
- 390: manuscript first — place, `Saved · Draft v12`, Full Canvas, then the page, the word count and Previous / Next; the chapter context follows the page. Full Canvas and Return work and keep the same editor. This is usable and truthful, **not** a mobile design (PC10).

## 9. Known differences / generation artifacts

1. **Word count** shows the true count of the fixture page (**123 words**), not the generated “214”.
2. **Line breaks** differ from the authority's generated text (its glyph metrics are not a font); the prose is 22px Newsreader in a 980px measure — the same in both fields.
3. **Full Canvas measure** is the Resting measure (0.638), where the authority draws ≈0.661 — deliberate (one editor never re-breaks its lines).
4. **Vertical positions** are not matched to the composite (its panels are shorter than 1024 at the horizontal scale); the page holds the same screen height across the transition instead.
5. **Full Canvas and Return colours** use existing roles (`--fr-held` fill; `--fr-panel` with `--fr-line`/`--fr-action-line` edge); the authority's Night button tint is approximated by the role, not sampled.
6. **An edit** in the fixture changes `Saved` to `Unsaved` (gold dot) and recounts words; there is no save engine, and the fixture says so rather than pretending.
7. **Finding outside S3 (not modified):** the root `app/layout.tsx` runs a global audio-unlock script that shows a green “🔊 Audio enabled” toast for 2 seconds on the **first click of any route**, including this fixture. It will appear once in the founder walk. It is outside the §4 surface; board E waits for it to expire rather than hiding it.

## 10. Proven / not proven

**Proven (mechanically, at the stated scope):** Write Resting and Full Canvas exist in the accepted family; the S1 bar is unchanged; one editor exists in every state and it is the same DOM node across entry and both returns; the §8 tuple is identical before, in Full Canvas, and after Return and after Escape, with focus back in the editor; Return and Escape land identically and there is no third exit; the shell, manuscript context and Previous/Next recede in Full Canvas; no resident MAIA; no formatting affordance; type through roles only; Light = Night geometry; zero business requests; no overflow at 1536/1280/1024/390; the authority is bound by custody and a mismatch refuses the run; every mandatory mutant is RED; S1 and S2R1 are unchanged in fidelity, mutant behaviour and capture bytes.

**Not proven:** founder visual acceptance; that Full Canvas *feels* like more room rather than another editor; long-form immersion, spaciousness or beauty; any live save, place, version or navigation behaviour (fixture only); screen-reader experience beyond the live-region and labels present; mobile design (PC10).

**Production and live Writer’s Studio were untouched.** Nothing was merged or deployed.

**STOP: FOUNDER ADJUDICATION — PC3-S3 CANDIDATE ONLY.**
