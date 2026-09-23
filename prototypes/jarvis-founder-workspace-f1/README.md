# JARVIS Founder Workspace — F1 living prototype (recorded evidence only)

**Lane:** `JARVIS-FOUNDER-WORKSPACE-01 / F1` · opened by founder adjudication 2026-09-23 against F0 candidate `8b8592d9`.
**What this is:** a founder-walkable prototype of the five surfaces — Today · Work · Graph · Monitor · System — over **static, recorded evidence** grounded in the F0 census. It is the information architecture made tangible.
**What this is not:** it is not the JARVIS console (`jarvis-desktop/`), it changes nothing in it, and it runs nothing. No network, SSH, database, provider, IPC or production access. Nothing you press executes anything.

## Open it
Double-click `index.html` (works from `file://`; no build, no server, no dependencies). Fonts load from Google Fonts if online and fall back to system faces if not.

## Files
| File | Role |
|---|---|
| `index.html` | the page: all presentation and interaction; no data of its own |
| `fixtures.js` | every recorded value shown, each with `instrument`, `observed_at`, `evidence_state` and `source`. Values marked `ILLUSTRATIVE` are fixtures with no recorded observation and are labelled as such on screen |
| `vocabulary.js` | founder vocabulary map v1: internal term → ordinary-language sentence → technical source (+ `confidence`) |
| `programme-state.v1.fixture.json` | **generated** from `fixtures.js` — the D-03 projection fixture; contract in `docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F1_PROGRAMME_STATE_V1_CONTRACT_2026-09-23.md` |

Regenerate the derived files after editing `fixtures.js` / `vocabulary.js` (see the F1 record for the one-line node command). The derived files are never edited by hand.

## Law this prototype is bound by
HU-1…HU-9 (binding founder-experience law) and DC-1…DC-8 (binding prototype constraints) — `docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F0_FOUNDER_ADJUDICATION_2026-09-23.md`. In particular: no invented health or scores; unobserved is never painted calm; every graph edge cites evidence; the workspace holds no state of its own (only a remembered tab in `localStorage`); no affordance implies an authority that does not exist (there is deliberately no Reject button — D-06 — and no Answer-here on decisions, because O7 is not open).

## Freshness
`observed against b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f` (census SHA) · fixture recorded 2026-09-23. If canonical advances, the fixture stays as recorded; re-observation is a later dated act.
