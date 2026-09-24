# Shell Fidelity S1 — evidence bundle

Custody: handed to JARVIS (`JARVIS-WRITERS-STUDIO-UIUX-RECOVERY-01`). Documents and instrument only — no product code, no runtime change.

## Reference
- Corpus commit: `737bbb89dc6dd9eb5149d58fbdfb6d9f04f9467e` (branch `chore/ws-founder-reference-corpus-20260923`)
- Image: `docs/design/writers-studio/founder-reference-corpus/ChatGPT Image Sep 22, 2026 at 02_59_51 PM.png`
- SHA-256: `c3f708824e35d998570241847c4896b94438ad71f8c6cddd3082cb86b417cf08` · 1536×1024 · River Between, Develop › Themes

## Files
| file | what it is |
|---|---|
| `CONTRACT.md` | lane preamble, gate question, landmark contract measured from the reference pixels |
| `fidelity.js` | the instrument — `node fidelity.js $PWD/candidate.html` (needs Playwright; run from repo) |
| `candidate.html` | self-contained candidate page (fonts + images embedded) |
| `candidate-src.html` | readable source of the candidate (placeholders `__FONTS__`, `__ASSETS__`) |
| `candidate-1536.png` | Chromium render the instrument took at 1536×1024 |
| `side-by-side.png` | reference (left) vs candidate render (right), same viewport and state |
| `fidelity-result.txt` | candidate: **18/18 GREEN** |
| `falsifier-result.txt` | prior candidate (published 2026-09-23): **10/18 RED** — MAIA stacks below at 1100/1024, wrong ink, rows/hero/cards off |
| `FUNCTION_INVENTORY.md` | every member-facing function of the full workspace at `e88688841`, with flags and reachability |

## What the fidelity test proves
Panel geometry (top bar, manuscript, work column, MAIA, hero, theme rows, lower cards) within ±6 px of the reference;
ground/panel/ink colour within ΔE 6; no mojibake; no wrapped chapter ranges; **MAIA stays a right-side panel at 1536–1024 px**.
It can fail: the prior candidate goes RED on it for the same reasons the founder rejected it.

## What it does not prove
- Atmosphere, elegance, literary feel, "on my side" — founder witness only.
- Anything about the live Studio: the candidate is a static page with fixture content, not `RebuildStudioClient`.
- Hero copy is baked into an image crop of the reference, not live text.
- Chart card is clipped at the bottom; the reference card ends cleanly (known remaining difference).
- Write: **no River Between Write board exists** in the corpus; Write in this shell must be derived — founder decision owed.

## Next (not authorized by this bundle)
S2 — port the same shell onto the full workspace (`RebuildStudioClient`) and run this instrument against the live local render.
