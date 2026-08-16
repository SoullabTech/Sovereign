# JARVIS Desktop — package 6d3c0cbc4 · replacement + acceptance walk
**Date:** 2026-08-16 · **Authority:** founder replacement authority (this session)

## Canonical binding (freshly re-resolved, not by name)
- `git fetch origin clean-main-no-secrets` → **6d3c0cbc4**
- first parent **89d72e9c0** ✓ (claim confirmed)
- merge of **#1061** `fix/maia-ain-identity-field-binding`
- `git diff 89d72e9c0 6d3c0cbc4 -- jarvis-desktop` → **0 files** ✓ (#1061 is not a Desktop change)

## Prior installed artifact — identity captured BEFORE replacement
| field | value |
|---|---|
| build-info.json | `{"app_build_sha":"58d4915f4","built_at":"2026-08-16T19:42:20.818Z"}` |
| app.asar SHA-256 | `224b123dcb31693ef6107cb91393e438a7acbf178424b6fc1f22c330070bf24b` |
| bundle mtime | 2026-08-16T15:42:22-0400 |
| bundle size | 223M (asar 171993 B) |
| version / id | 0.1.0-alpha / life.soullab.jarvis (Team ZVK2X646Z2) |

Quit confirmed before replacement: 4 → **0** processes, **0** open handles on app.asar.
(Aug-11 mistake — destroying the artifact before reading its stamp — not repeated.)

## Replacement
- packaging worktree `.claude/worktrees/jarvis-pkg-6d3c0cbc4` @ 6d3c0cbc4 (new referent, honest name)
- `npm run install:app` → stamped 6d3c0cbc4, signed, installed
- bound checkout `/Users/soullab/jarvis-runtime` was clean → advanced 5767d5d41 → **6d3c0cbc4**

## Identity proofs
| proof | result |
|---|---|
| installed stamp == canonical | `6d3c0cbc4` == `6d3c0cbc4` **PASS** |
| installed app.asar == built app.asar | `58e5641b…68f15` both **PASS** (differs from old ✓) |
| one installed referent | `/Applications/JARVIS.app` only **PASS** |
| one running referent | 1 main proc, bundle `/Applications/JARVIS.app` **PASS** |
| mechanismState().available (from installed asar) | `true`, reason `null`, all 5 modules ok **PASS** |
| headline | "JARVIS is operating." **PASS** |
| asar src parity vs build tree | builder-mechanism/legibility/spiral/renderer IDENTICAL |

## Closure matrix — witnessed on the installed artifact
| row | witness | verdict |
|---|---|---|
| READY / BOUND | "JARVIS is operating." · binding `/Users/soullab/jarvis-runtime` READY · new "Builder execution mechanism READY" row | **PASS** |
| BY_DESIGN | Automatic C3 execution node → Disposition `deliberately switched off (BY_DESIGN)`, Because, **Needs you** — no Fix label, no remediation row | **PASS** |
| JARVIS_REPO_ROOT override | Execution substrate **DEGRADED**: "Two answers exist, and the environment is winning — by design"; saved choice named; `launchctl unsetenv` remedy | **PASS** |
| UNBOUND packaged | "JARVIS cannot operate yet." · "No eligible Sovereign checkout was resolved (packaged build)" — no substitution from ~400 worktrees | **PASS** |
| Spiral UNOBSERVED | Builder OS + Local model worker render hollow dashed on NOT OBSERVED, distinct from solid blue / amber | **PASS** |
| Spiral LICENSED EDGE | 3 BLOCKS_OBSERVATION edges; inspector gives plain claim · Link · **Justified by** (mechanism's exact words) · Between · Strength ESTABLISHED | **PASS** |

**6/6 PASS** → JOP-01 distribution closure and the JOP-02 installed repair witness are now evaluable for closure.

## Restored / unchanged
- saved binding config restored, sha `7df04836…80d8e` verified identical; backup at `scratchpad/config.json.bak`
- `s-44159e3e` — STALE, unrecovered, untouched (NOT AUTHORIZED)
- 2 queued sessions · ungoverned lanes — unchanged

## Observation (not a matrix failure, pre-existing)
`renderer.js` re-renders every 15 s (`setInterval … render()`), which rebuilds `$main.innerHTML` and
**wipes `#sp-inspector`**. An open node/edge inspector disappears mid-read. Not introduced by #1062;
not in scope of this package. Recorded, not fixed.
