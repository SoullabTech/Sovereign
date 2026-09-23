# JARVIS-FOUNDER-WORKSPACE-01 / F2 — Surface Composition Contract + Implementation Sequence

**Opened:** 2026-09-23 by founder direction (*"what do we need to do to get it fully functional? lets start a next level Jarvis flow for this and continue"*).
**⚠️ Standing at opening, stated plainly:** the F1R1 adjudication set *STOP AT HUMAN WALK · DO NOT OPEN F2*. This record is opened on the founder's later direction, which outranks that stop. **The F1 experiential walk remains OWED — it is neither waived nor claimed performed.** F2 is a CONTRACT + SEQUENCE act; it changes no code, so opening it does not pre-empt the walk. Where the sequence below depends on the walk's per-surface rulings, it says so.
**Canonical observed by F2:** `840194ba859bd5a497fc939c94329ee972ca3f80` (four commits past the F0 census SHA; one docs file; no prototype/runtime path). F0/F1 fixtures remain observed against `b4f73ac4` and are not re-projected here.
**Class:** B for this act (documentary). Every build act below names its own class.
**Inputs:** F0 census · F1 prototype + view-model shape · F1R1 · one read-only seam census of the organs (2026-09-23, re-verified where load-bearing) — inputs, not authority.

---

## 1 · What "fully functional" means (the definition of done, testable)

The founder opens JARVIS and sees the same five surfaces as the prototype, **fed by organs instead of fixtures**, with every value carrying instrument · observed time · evidence state, and nothing invented. Per surface:

| Surface | Done when | Not done while |
|---|---|---|
| **Today** | needs-you / in-motion / changed-recently derive from a **mechanically projected** `programme-state.v1` (`population.complete: true`) plus the live status probe; the headline drops *"in this snapshot"* by construction | any programme row is hand-typed; any count is unscoped while `complete` is false |
| **Work** | current work is the real list of W0.v2 units on this machine; history is the real ledger; results open real artifacts; "say what you want" produces a real O1 intent → O2 plan → O3 authority plan and **holds** | any unit is illustrative; any proposal runs anything; a Reject affordance exists (D-06) |
| **Graph** | nodes and edges are joined from records (units · grants · sessions · git · programme records) and **every edge cites** its source object; an uncited relation is not drawn | any edge is inferred from a name; the Spiral is presented as the graph |
| **Monitor** | every row comes from a **registered read-only local instrument** with `observed_at`; freshness is data; absent instrument renders *not observed*; production renders *not observed from this workspace* | any row is hard-coded; any instrument in the registry can write; production is probed; a cost number appears |
| **System** | provenance (app build vs bound checkout) is live; authority table derives from the projection; vocabulary map is the committed document; raw records are the real objects | any vocabulary gloss is unverified without its marker |

Cross-cutting: **the workspace holds no state of its own** (DC-2) — kill the app, rebuild from organs, nothing lost. Renderer never reads an organ directly (§3).

## 2 · Composition contract — organ of authority per surface

Binding source: `docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J6_WORK_UNIT_I4/DESKTOP_NATIVE_EXPERIENCE_STANDING_2026-09-18.md` — *consume the canonical W0.v2 read/control substrate rather than reimplement authority, routing, lifecycle, transport, provenance, or adjudication.*

| Need | Organ of authority (exists) | Exact read seam (verified) | Gap (named) | Class |
|---|---|---|---|---|
| Workspace binding · organ health · holds · sessions | `main.js` status probe → `legibility.deriveOperatorView` | `jarvis:status` → `{observed_at, workspace, sessions[], builder_os, route_a, local_worker, memory_postgres, production, claude_lane, frontier_reasoner, continuity, builder_mechanism, governance_holds[], desktop_runtime}`; `deriveOperatorView(status)` → `{headline, sentence, binding, capabilities, organs[], active_work, needs_founder}` | none | COMPOSITION |
| One Work Unit's full state | W0.v2 substrate | `statusCanonicalV2(root, id)` → frozen `{lifecycle, authorized_core, routing, transport_bindings, provenance{attempts, verifier_results, adjudication, closure}, next_actions, authority_effect:'none', presentation_only:true}`; legacy `status()`; grants via `listCanonicalGrantStandingsV1(wuId)` / `listGrantStandings(wuId)` | none | COMPOSITION |
| **List of Work Units** | `$AIN/work-units-v2/<id>.json` (+ `.desktop.json`) | **NONE — no function lists across units** (only `listRuns` in the runtime store lists anything) | `listWorkUnitsV2(home)` — read-only directory enumeration + `statusCanonicalV2` per id | **NEW read organ** (small) |
| Run history | runtime store | `listRuns({limit, offset})` → `{total, runs[]}` (⚠️ calls `initStore()` which `mkdirSync`s — a read that creates a directory); `loadRun(id)` | `events.jsonl` has **no reader** | NEW read organ: `readEventsTail(n)`; note the mkdir side effect |
| Governor sessions + history | `session.mjs` | `status --json` → `{active, queued, sessions[rec+liveness], collisions, recoverable, local_request_rate}`; `report --since --json` → aggregates | none (both read) | COMPOSITION |
| Recall | continuity bridge | `continuity.search(root, q, limit)` → `{results[]}`; `jarvis-recall.py search` → `{branch_summary, branch_records[], history[]}` | none | COMPOSITION |
| **Programme state** (Today's needs-you / in-motion) | `docs/programme/*` records + CLAUDE.md priority thread | **no parser exists**; 0 files have frontmatter; 171 of 535 carry a `**State|Status|Standing:**` line; `jarvis-recall.py` already extracts `declared_state` with `^\*\*(State|Status|Standing):\*\*`; 22 `*_WORK_UNIT_*.json` share `programme, act, title, date, status, next_gate` | the **`programme-state.v1` projector** (D-03) | **NEW CAPABILITY** (governed by PS-1…PS-9) |
| **Graph join** | units (`identity.programme`, `identity.parent_work_unit`), grants, sessions (`work_unit`, `branch`), git refs (`jarvis-recall.py`), programme records | all readable per row; **no join exists** | the evidenced join (each edge names the object that asserts it) | **NEW CAPABILITY** |
| **Monitor instruments** (local-first, D-04) | ops scripts | **read-only, admissible:** `scripts/ops/workstation-storage-census.sh` (human report; `CENSUS_OUT`), `scripts/ops/worktree-census.sh` (**TSV** via `CENSUS_OUT`), git status/HEAD, Ollama `/api/tags`, `session.mjs status`, `verify-deploy-provenance.sh` (self-test). **⛔ NOT admissible — they WRITE:** `storage-health-monitor.sh` (appends logs, `rm -rf` at 90%, `sudo rm -rf /tmp/*`), `health-check.sh` (INSERT/DELETE in production DB), `backup-postgres.sh` (pg_dump + deletes). `deploy-lock.sh` is a sourced library, not a read; its lockfile is a key=value file **on production only**. | an **instrument registry** with a read-only proof per entry; JSON/TSV output mode on the two census scripts | **NEW CAPABILITY** (registry) + small ops-script change (own act) |
| Intent → plan → authority (Work's "say what you want") | O1 `compileIntent({utterance, priorIntent})` · O2 `compileWorkGraph(intent)` · O3 `planAuthority(jsonString)` · O4 `planCapability(...)` — all pure, **none wired** | signatures verified; O3 accepts a JSON string only; O4 imports J6 (⚠️ O4 runtime standing UNVERIFIED — D-07) | wiring O1→O2→O3 as **read/plan** organs; ⛔ O4 not consumed until reconciled | COMPOSITION (no authority created — O0 law) · **O7 decision surface NOT claimed** (D-02) |
| Provenance | `provenance.js` + `build/build-info.json` | exists | none | COMPOSITION |
| Costs | — | **no instrument** | (D-05) render the gap only | out of scope |
| Production | — | Desktop law: `NOT PROBED` | (D-04) render *not observed from this workspace* | out of scope until its own authority act |

**IPC budget (verified):** 13 invoke channels + 1 push, enforced by exact-match tests (`jarvis-alpha-floor-proof.mjs`, `desktop-c0-explorer-proof.mjs`) with five questions per new entry. `work-unit-action` already multiplexes read verbs (`status`, `providers`). **Contract:** reads go through existing channels wherever possible; **at most one** new invoke channel (`jarvis:workspace-viewmodel`) is proposed, and only as a governed act answering the five questions.

**Renderer facts (verified):** single `render()` entry (`renderer.js:2349`) dispatching four views; no external resources; **no CSP** on `index.html` (only `preferences.html` has one); `contextIsolation: true`, `nodeIntegration: false`, no `sandbox` flag.

## 3 · Architecture decision (CANDIDATE — founder rules, FD-1)

**Recommended: the five-surface renderer replaces the four views inside `jarvis-desktop`, over the existing `main.js` / `preload.js` / IPC / custody.** Not a second app. Reasons: the console already is *presentation over canonical state*; a second app would duplicate preload custody, the allowlist law, repo binding and provenance, and would be exactly the reimplementation the standing record forbids. **The prototype's presentation becomes the renderer; the prototype's fixture shape becomes the view-model contract (§4); adapters map organ outputs to it.**

```text
organs (jarvis:status · work-unit-action reads · listWorkUnitsV2 · listRuns · session.mjs · continuity · projector · instrument registry)
        ↓  pure adapters (testable against recorded organ outputs)
founder-workspace-viewmodel.v1  ← fixtures.js is one conforming instance
        ↓  renderer (Today · Work · Graph · Monitor · System) — reads the view-model only
```

**Consequence:** the renderer can be walked and falsified against fixtures before any organ is wired, and each adapter can be falsified against recorded organ outputs before the renderer sees it. The law lives in the adapters and the view-model validator, not in the screen.

## 4 · `founder-workspace-viewmodel.v1` (contract, from the F1 fixture shape)

- `meta {observed_against, fixture_recorded_at|observed_at, workspace}`
- `programme_state` — exactly `programme-state.v1` incl. `population` (PS-1…PS-9)
- `monitor[] {group, subject, axis, value, plain, level, instrument, observed_at, freshness, evidence_state}` — `instrument` mandatory; `level` ∈ good·warn·failed·unobserved·unauthorized; `freshness` ∈ current·historical·none; ⛔ no aggregate field exists in the shape
- `graph {nodes[{id,kind,label,sub}], edges[{from,to,rel,evidence{kind,ref}}]}` — `evidence` mandatory per edge
- `work {units[], history[], handoffs[], results[], adjudication_note}` — each unit carries `evidence_state`; `ILLUSTRATIVE` permitted only in fixtures, ⛔ refused by the live adapter
- `provenance {artifact, substrate, rule}` · `vocabularies[]` · `events[]`

**Validator laws (VM-1…VM-7), each with a defeat candidate:** VM-1 no aggregate/score field · VM-2 every monitor row has instrument + freshness · VM-3 every edge has evidence · VM-4 `population.complete` may be true only when `projector !== 'manual'` · VM-5 no `ILLUSTRATIVE` in a live view-model · VM-6 labels: node `label` never matches `^[0-9a-f]{7,40}$` (identifier-as-label) · VM-7 counts are computed by the renderer from rows, never carried in the view-model.

## 5 · Implementation sequence

| Act | Name | Class | Depends on | May not | Exit (mechanical unless stated) |
|---|---|---|---|---|---|
| **B1** | View-model contract + validator + adapter harness (pure; `tests/constitutional/founder-workspace/**`) | B | F2 ratified | touch `jarvis-desktop/src`, runtime, IPC | VM-1…VM-7 suite LETHAL against 7 defeat candidates; F1 `fixtures.js` validates as conforming; typecheck exit 0 |
| **B2** | Read organs: `listWorkUnitsV2(home)` · `readEventsTail(n)` · `governorReport()` wrapper; adapters status→VM, units→VM, runs→VM, sessions→VM | B | B1 | write anything (static guard: no `writeFileSync`/`mkdirSync`/`spawn` with effects in read modules; `listRuns`'s mkdir noted and wrapped) | adapters produce a valid VM from **recorded** organ outputs; corrupt file → `UNREADABLE` row, never silently dropped |
| **B3** | Monitor instrument registry (local-first) + JSON/TSV output mode on the two ops census scripts | B (registry) · **founder act** for the ops-script change | B1 | admit an instrument without a read-only proof; probe production; emit a cost | registry refuses unproven entries (defeat candidate: a registry entry pointing at `storage-health-monitor.sh` must be REFUSED); absent instrument → *not observed* |
| **B4** | `programme-state.v1` deterministic projector (D-03) | **A** (it decides what counts as a programme) · **founder decisions FD-3** | B1 | write a second truth store; set `complete:true` by hand | PS-1…PS-9 LETHAL; projection of the whole `docs/programme` + CLAUDE.md thread reproduces the F0 fixture's 13 rows as a subset and reports every other subject as examined/not-emitted/unclassified |
| **B5** | Renderer swap in `jarvis-desktop`: five surfaces replace four views; reads through existing channels + at most one new `jarvis:workspace-viewmodel` (governed); CSP added to `index.html` | **A** (Desktop mutation; preload allowlist) | B1–B3 · **F1 walk rulings per surface** (KEEP/REVISE decide what B5 builds) · FD-1 · FD-2 | any new mutation channel; any affordance without a governed capability (no Run/Reject/Answer-here) | alpha-floor + c0-explorer proofs green with the amended allowlist; JOP-02-pattern **installed acceptance** on the Mac Studio |
| **B6** | Work surface live: unit list · history · results · O1→O2→O3 wired as **plan-only** (hold before any authority) | A | B2 · B5 · O4 reconciliation (D-07) before O4 is consumed | create authority; consume O4 while UNVERIFIED; add a reject gesture (D-06) | plan renders for an intent with `execution_authorized:false` everywhere; existing E1/R5B gestures unchanged and still the only execution path |
| **B7** | Graph live: evidenced join over B2/B4 sources | A | B2 · B4 · B5 | draw an edge without a source object | zero uncited edges (validator VM-3 on live data); Living Spiral jurisdiction R2/R4 preserved (no member node, no elemental vocabulary) |
| **B8** | Founder walk of the **live** workspace (the seven questions again, on organs not fixtures) → lane closure or repair | founder act | B5–B7 | — | founder rules; O10-style witness recorded under ORCHESTRATION-OPERATOR-01's authority, ⛔ not claimed by this lane (D-02) |

**Prerequisites owned outside this lane (D-07), sequenced so they do not block B1–B4:** C1 `REPO_ROOT` repair (needed only if the founder wants *Run locally* to work — Work renders it FAILED until then) · local-native label repair · O4 runtime reconciliation (blocks B6's use of O4 only).

**What can start before the F1 walk (FD-5):** B1–B4 touch no Desktop file and no runtime; they are pure or read-only. **B5 cannot** — it builds what the walk rules KEEP/REVISE per surface.

## 6 · Founder decisions required (docket)

- **FD-1 Architecture:** renderer replacement inside `jarvis-desktop` (recommended) vs a second app.
- **FD-2 IPC:** one new read channel `jarvis:workspace-viewmodel` vs multiplexing reads through `work-unit-action` + `jarvis:status`. Recommendation: one channel, one governed act, five questions answered; it carries a view-model only (`authority_effect: none`, `presentation_only: true`, mirroring `statusCanonicalV2`).
- **FD-3 Projector law (D-03):** what counts as *the record* for a programme (the dated `docs/programme` file with a `State|Status|Standing` line? the CLAUDE.md LATEST bullet? both, with precedence?) and where the projection lives (generated under `docs/programme/` vs `$AIN`). Without this B4 cannot set `complete: true` lawfully.
- **FD-4 Ops instruments:** authorize a JSON/TSV output mode on `workstation-storage-census.sh` and `worktree-census.sh` (they are ops instruments under the storage-relief record, not this lane's).
- **FD-5 Sequencing:** may B1–B4 open before the F1 walk? (Recommended yes; they cannot pre-empt any surface ruling.)
- **FD-6 CSP:** add a Content-Security-Policy to `index.html` in B5 (hardening; `preferences.html` already has one).

## 7 · What F2 does not authorize
⛔ No code in this act · ⛔ B1–B8 each open on a founder act · ⛔ no production Monitor · ⛔ no cost instrument · ⛔ no Reject gesture · ⛔ no O7/O10 claim · ⛔ no O4 consumption while UNVERIFIED · ⛔ no projector authority over programme standing (a projection reports; records rule) · ⛔ no new mutation channel · ⛔ no change to E1/R5B execution law · ⛔ merge/deploy/production untouched.

**Standing:** `F2 — CONTRACT + SEQUENCE DELIVERED · FIVE-SURFACE DONE-DEFINITION STATED · COMPOSITION vs NEW CAPABILITY SETTLED PER SEAM · B1–B8 SPECIFIED · FD-1…FD-6 OWED · F1 WALK STILL OWED · ⛔ NO BUILD ACT OPEN`
