# JARVIS-FOUNDER-WORKSPACE-01 — B1 + B2 · View-Model Foundation + Read-Organ Composition (evidence)

**Authorized by:** P0 founder adjudication §VI (`JARVIS-FOUNDER-OPERATING-ENVIRONMENT-01_P0_FOUNDER_ADJUDICATION_2026-09-23.md`) · **Against:** canonical `840194ba859bd5a497fc939c94329ee972ca3f80` · **F2 contract:** `9b1c1acf` · **P0 record:** `eb77216b`. **Standing at authoring: B1 ✅ · B2 ✅ · ⛔ HARD STOP (§VII) — STOPPED FOR EVIDENCE + NEXT-ACT ADJUDICATION.**

## 1 · What landed (no Desktop file touched)

| File | Role | Purity |
|---|---|---|
| `scripts/builder/founder-workspace/viewmodel-v1.mjs` | `founder-workspace-viewmodel.v1` contract + `validateViewModel` / `assertViewModel`; laws VM-0…VM-7 | pure (no fs/process/network) |
| `scripts/builder/founder-workspace/read-organs.mjs` | B2 read organs: `listWorkUnitsV2` · `listRunsReadOnly` · `readEventsTail` · `listSessions` · `governorReportReadOnly` · `listResults` · `readAllOrgans` | read-only; imports `readdirSync, readFileSync, existsSync, statSync` only (static guard RL-0) |
| `scripts/builder/founder-workspace/adapters.mjs` | pure adapters status→monitor/provenance, units/runs/events/sessions/results→work rows; `composeViewModel` (live, asserts on exit) | pure |
| `tests/constitutional/founder-workspace/{matrix,candidates,reference}.mjs` | B1 matrix: references + seven defeat candidates DC-1…DC-7 | — |
| `tests/constitutional/founder-workspace/{b2-matrix,b2-candidates}.mjs` | B2 matrix: RL-0…RL-5, AL-1…AL-5, candidates DC-R1…DC-R3 | scratch `$AIN` home only |
| `tsconfig.founder-workspace.json` · `package.json` scripts `typecheck:founder-workspace` · `matrix:founder-workspace` | reproducible instrument (strict `checkJs`) | ⛔ does not widen `tsconfig.ship.json` |

## 2 · Results (this container)

- **B1 matrix** `node tests/constitutional/founder-workspace/matrix.mjs` → F1 fixture PASS (fixture mode, 0 violations) · live reference PASS · F1 fixture **refused live on VM-5** (its ILLUSTRATIVE units) · **DC-1…DC-7 all DEAD on their named law, zero collateral** → `MATRIX: LETHAL + DISCRIMINATING (exit 0)`.
- **B2 matrix** → RL-0 (no write primitive; adapters import no fs/process/network) · RL-1 absent `$AIN` home never created, every organ `present:false` · RL-2 corrupt unit/run/session surfaced (2 unreadable units, 1 run, 1 session) · RL-3 bad `events.jsonl` line surfaced with its line number · **RL-4 reading every organ left a size+mtime snapshot byte-identical** · **RL-5 the real `session.mjs report --json` was read through the presence-gated wrapper without mutation** and is never spawned when `$AIN/sessions` is absent · AL-1 live composition refuses ILLUSTRATIVE at the seam · AL-2 unknown organ state → `unobserved`; `NOT PROBED` → `unauthorized · DELIBERATELY REFUSED`; a status without `observed_at` never reads good · AL-3 every unreadable object is a visible row · AL-4 the unit was a **real canonical v2 envelope** written by `createCanonicalV2` into scratch and read back through `statusCanonicalV2` (`DRAFT`, objective preserved) · AL-5 composed view-model validates live, governor counts stripped · DC-R1/R2/R3 DEAD → exit 0.
- **Typecheck** `tsc -p tsconfig.founder-workspace.json` strict + `checkJs` → **exit 0**. ⚠️ Run here with `--typeRoots` pointing at a scratchpad `@types/node` (the container has no project `node_modules`); on the founder's machine the plain npm script resolves the project's own types. ⭐ The founder's run is the evidence of record.

## 3 · Laws made structural (and where a defeat candidate proves each)

- **VM-1…VM-7** (F2 §4, ratified): DC-1 score · DC-2 instrument/freshness · DC-3 uncited edge · DC-4 manual `complete:true` · DC-5 ILLUSTRATIVE live · DC-6 sha-as-label · DC-7 carried count. VM-4 also enforces FD-3's completeness arithmetic (`examined = emitted + excluded_by_rule + classified`, no unclassified/unreadable) so B4 cannot set `complete:true` by hand.
- **Read law (§VI):** RL-1 with DC-R1 (the `initStore()` shape). **Failure law:** RL-2/RL-3 with DC-R2 (the `listRuns` catch-and-skip shape).
- **No false calm:** AL-2 with DC-R3; a stale status (no `observed_at`) is demoted from good to unobserved by the adapter, and VM-2 refuses `freshness:none` + `level:good` at the contract.

## 4 · Two things the build found, ⛔ routed out, not repaired

1. **Reads that write, in two owners' organs:** `scripts/builder/jarvis-runtime-store.mjs` `listRuns()` → `initStore()` → `mkdirSync`, and skips unreadable runs; `scripts/builder/session.mjs` `allRecs()` → `ensureHome()` → `mkdirSync` on every `status`/`report`. B2 does not consume either as a read; the governor wrapper is presence-gated so the mkdir is a no-op whenever it is invoked. Owners: runtime store (Builder runtime) · session governor.
2. **The typed path is not O1** (also found by V0): `renderer.js:1793–1807` → `OF.buildTask` → `jarvis:submit-task`; `compileIntent` is loaded by nothing. B6 is where that changes; B2 asserts nothing about it.

## 5 · What B1+B2 do not do (§VII, confirmed)

No B3 registry · no B4 projector (`programme_state` is emitted as `projector:'absent'`, `complete:false`, `why_not_complete` set) · no B5 renderer · no IPC (`jarvis:workspace-viewmodel` reserved by FD-2, unspent) · no Desktop mutation · no voice implementation · no O1 wiring · no execution · no Graph join (`graph` is `{nodes:[],edges:[]}` unless supplied) · no production · no GitHub · no connectors. `jarvis-desktop/src/**` unchanged (verified by `git status`).

## 6 · Next lawful acts (for adjudication, not opened)

B3 registry (needs FD-4 already ruled YES) · B4 projector (FD-3 ruled; `$AIN_HOME` location) · B5 renderer (blocked on the F1 walk) · V1 voice contract ratification. Commands for the founder's run: `npm run typecheck:founder-workspace && npm run matrix:founder-workspace`.
