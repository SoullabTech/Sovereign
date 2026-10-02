# JARVIS-FOUNDER-WORKSPACE-01 / F0 — Current-State Product Census + Founder Experience Constitution

**Lane:** `JARVIS-FOUNDER-WORKSPACE-01` (charter: `JARVIS-FOUNDER-WORKSPACE-01_CHARTER_2026-09-23.md`)
**Act:** F0 · DISCOVER / CENSUS · **READ-ONLY · DOCUMENTARY · OBSERVATIONAL**
**Standing:** F0 RECORD DELIVERED · ⛔ NOTHING RATIFIED · ⛔ NO CODE CHANGED · **STOP FOR FOUNDER ADJUDICATION** (docket §11)
**Date:** 2026-09-23

## 0 · Freshness block (binding, per charter)

```text
observed against   b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f   origin/clean-main-no-secrets tip at census start (== lane HEAD then)
charter commit     d4efcbfb                                   JARVIS-FOUNDER-WORKSPACE-01 charter, zero non-doc delta from the census SHA
candidate commit   the commit that introduces THIS file        (a file cannot carry its own hash; read it from git on branch claude/sharp-cannon-cyrdeb)
reconciliation     NONE PERFORMED                              if canonical advanced after census start, that is a later dated act; this record is not re-observed silently
```

⚠️ The checkout is a **shallow clone (~50 commits)**. Any "since when" question that needs older history is `UNVERIFIED`, and is marked so below.

## 1 · Method, population, denominator

- **Population searched:** `jarvis-desktop/src/**` (24 modules + `index.html`), `jarvis-desktop/test/**` (27 files), `scripts/builder/*.mjs|py` (46 non-test modules), `scripts/ops/**`, `scripts/*` health/backup/deploy helpers, `app/api/**/health|status` routes, `docs/programme/JARVIS-*` (≈150 records), `docs/ops/JARVIS_*|JOP-*|ADMIN_*`, `docs/governance/JARVIS_LIVING_SPIRAL_*`, `docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/**`.
- **Inputs:** two read-only subagent censuses (code substrate; programme documents). ⭐ **They are inputs, not authority.** Every load-bearing claim below was re-verified against source by this session before being recorded; claims not re-verified are marked `(report)`.
- **Not done, by design:** the app was **not launched**; no production, SSH, database or network read; no `node_modules` installed; nothing repaired. Runtime behaviour is therefore `INFERRED` from source at best, never `OBSERVED`.
- **Evidence states** follow manual §4: OBSERVED · PARTIAL · INFERRED · UNVERIFIED · ABSENT / NOT FOUND · CANDIDATE · RATIFIED · SUPERSEDED · DELIBERATELY REFUSED. `NOT FOUND` = searched the named population, nothing there. `UNOBSERVED` = not searched / not searchable from here.

## 2 · Exact observed substrate (freeze item 1)

### 2.1 Founder-facing surfaces — the JARVIS operational console (`jarvis-desktop/`, Electron, `life.soullab.jarvis`)

`jarvis-desktop/package.json` describes itself as *"Presentation over canonical Builder OS / router state. No business logic duplicated here."* Four views are declared at `index.html:170-173` (`data-view=` home · work · system · spiral). ⚠️ **No programme document names or ratifies the four-view set** (`NOT FOUND` in docs; the set exists in code only).

| Surface | Entry point | What it shows | Founder actions | Fed by | Evidence |
|---|---|---|---|---|---|
| **Home** | `renderer.js` `renderHome` (167-218) | "What do you want to happen?" prose box · headline sentence · active workspace (name · path · branch · HEAD · clean/dirty · how resolved) · "Needs you" holds · active sessions · three capability groups (*Can do now / Not working or not verified / Not authorized*) · "Which JARVIS is this?" provenance card | Change Workspace · Refresh · Reveal in Finder · per-session recover / reconcile / close (reason or end-state form) | `jarvis:status` → `legibility.deriveOperatorView` · `governance.js` · `provenance.js` | OBSERVED (source) |
| **Work** | `renderWork` (1519-1768) | (1) "Run through JARVIS" intent + Local/Frontier choice · (2) Canonical Work Unit W0.v2 form (work class · J5 task shape · evidence class E0–E4 · review pressure · routing posture · capability · falsification/stop conditions · authority checkboxes · disclosure · route preview · Create) plus a legacy provider-strategy mode · (3) live Work Unit panel (canonical 1089-1277: lifecycle gestures · route/participants · E1 execution bridge · attempts · verifiers · adjudicate · close; legacy 1279-1390: R5B panel, provider runs) · (4) "Recall prior work" · (5) Advanced manual C0/C1/C3 | many; **one Work Unit tracked at a time** (`sessionStorage 'jarvis:active-work-unit'`) | `operator-flow.js` · `capability-form.js` · `work-unit-control.js` · `canonical-work-unit-v2.js` · `continuity.js` | OBSERVED (source) |
| **System** | `renderSystem` (2062-2091) | status rows: Builder OS · Route A · Local worker · Frontier lane · Nemotron · continuity · mechanism · Desktop runtime · Memory/Postgres · Production · provenance card (again) · raw JSON of `builder_os.detail` | none | `main.js` status probe | OBSERVED (source) |
| **Living Spiral** | `renderSpiral` (2116-2264) | SVG: rings = standing, five spokes = presentation-only grouping; cards for attention · "Not knowable yet" · evidenced links · legend · node/edge inspector. **Projects the same data as Home** (`renderer.js:2254` says so); no IPC of its own | inspect | `spiral.js` over `legibility.js` | OBSERVED (source) |
| **Preferences** | `preferences.html/js`, Cmd+, (`main.js:359`) | repository binding + how resolved | Choose repository · Clear | `repo-config.js` | OBSERVED (source) |
| **Menu** | `main.js:377-406` | "Reveal configuration in Finder" | one | — | OBSERVED (source) |

Status auto-refreshes every 15 s on every view except Work (`renderer.js:2360`).

**Installed / running standing:** JOP-02 recorded installed acceptance 6/6 PASS on `6d3c0cbc4` (2026-08-16); DESKTOP-OPERATOR-FLOW-02 says the flow is *"qualified for a founder Desktop walk. It is not installed."* Whether the app **at the census SHA** is installed, running, or has been walked by the founder is `UNOBSERVED` from this container. *packaged ≠ installed ≠ running ≠ witnessed* (JOP-03).

### 2.2 Work graph

- **`operator-work-graph.js` (O2)** — a bounded, deterministic chain of 1–6 *planned Work Unit descriptors* (explicitly not W0.v2 units). **Data structure only. Not imported by `main.js`, `renderer.js`, `index.html` or `preload.js`** (grep: 0 hits) → `OBSERVED: NOT WIRED`. Same for O0 `operator-constitution.js`, O1 `operator-intent-contract.js`, O3 `operator-authority-planner.js`, O4 `operator-capability-router.mjs`.
- **The only visualisation is the Living Spiral**, which is a *status projection*, not a work graph. A graph of programmes · branches · work units · blockers · dependencies · systems: `NOT FOUND`.
- Substrate a graph could be composed from (all present, none joined): O2 descriptors · W0.v2 Work Units at `$AIN_HOME/work-units-v2/<id>.json` (+ `.desktop.json`) · W4 append-only ledger · execution grants (`execution-grants/`, `work-units-v2/execution-grants/`) · runtime runs `$AIN_HOME/runtime/runs/<run_id>.json` + `runtime/events.jsonl` · `jarvis-recall.py` git-ref search · `docs/programme/*` records (not machine-indexed). `$AIN_HOME` = `$AIN_DELEGATION_HOME`, default `~/.claude/ain-delegation`.

### 2.3 Continuity path

`continuity.js` (Desktop, read-only bridge, non-authoritative) → `python3 scripts/builder/jarvis-recall.py --repo --db … search` → `jarvis-continuity.py` SQLite FTS at `$JARVIS_CONTINUITY_DB` or `~/.jarvis/continuity/continuity.sqlite3`, importing Claude project JSONL from `~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN`; everything `LOCAL_ONLY`, `external_eligible=0` (CONTINUITY-BRIDGE-01). Status = file-existence checks; AVAILABLE only when script + db + python exist. ⚠️ `connect()` creates tables and sets WAL even on search, so the "read-only" search is not strictly read-only at the file level (`(report)`, not re-verified). Surface: the Work view's "Recall prior work" only. ⚠️ No document names `continuity.js`.

### 2.4 Monitoring / health surfaces

**Inside JARVIS (System view rows, `main.js` status probe):** git `rev-parse`/`status --porcelain` of the bound repo · `node scripts/builder/session.mjs status --json` · dynamic import of `deterministic.mjs` · HTTP `127.0.0.1:11434/api/tags` (Ollama) · `opencode` binary + `~/.local/share/opencode/auth.json` · continuity file existence · macOS Keychain presence. **Hard-coded rows** (`main.js:518-520`, re-verified): `memory_postgres: UNCONFIGURED` ("Desktop holds no database configuration and does not connect to one"), `production: NOT PROBED` ("requires explicit production/SSH authority, which Desktop does not hold and does not request"), `claude_lane: AVAILABLE`. ⭐ The comment above them states the law: *a status row must never be the thing that opens a database connection or reaches production.*

**Machines · services · deployments · storage · backups · jobs · costs · GitHub — inside JARVIS: `NOT FOUND`.** The only "cost" is the router's `cost_class` label.

**Elsewhere in the repository (PRESENT as files; whether any is scheduled or running on any host is `UNOBSERVED`):**

| Substrate | Path | What it would tell a Monitor surface | Evidence |
|---|---|---|---|
| App health | `app/api/health/route.ts` (also `ai/health`, `voice/health`, `consciousness/health`, `session/status`, `build/status`, `field/status`, `notifications/status`) | version/uptime/component status | OBSERVED file |
| Deploy lane | `scripts/deploy-lock.sh` · `deploy-tag.sh` · `verify-deploy-provenance.sh` · `verify-deploy-lock-record.sh` · `verify-deploy-tag-prune.sh` · `deploy-production.sh` | holder / target SHA / rollback tags / provenance; ⚠️ **no durable ledger of completed deploys** (CLAUDE.md 2026-09-07 finding: lockfile is overwritten per acquisition) | OBSERVED file |
| Storage | `scripts/ops/workstation-storage-census.sh` · `worktree-census.sh` · `worktree-reclaim-plan.sh` · `scripts/storage-health-monitor.sh` | disk / worktree census (Mac Studio); `JARVIS-CAPACITY-SENTINEL-01` named but not opened | OBSERVED file |
| Backups | `scripts/backup-postgres.sh` · `backup-database.sh` · `backup-db.sh` · `maia-auto-backup.sh` · `setup-backup-cron.sh` · `backups/` | backup existence/age — ⚠️ four overlapping scripts | OBSERVED file |
| Health/monitor scripts | `scripts/health-check.sh` · `maia-monitor.js` · `setup-automated-monitoring.sh` · `consciousness-health-check.sh` · `monitor-consciousness-server.sh` · `monitoring/prometheus.yml` | host/container health | OBSERVED file |
| Typecheck health | `scripts/audit-typehealth.ts` · `check-typehealth-baseline.js` · `typecheck-baseline.json` | debt vs baseline | OBSERVED file |
| Co-Lab gate | `scripts/verify-constitution-colab.ts` | 33/0/0 last observed in production 2026-09-06 (CLAUDE.md) | OBSERVED file |
| Ops records | `docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md` etc. | human-authored | OBSERVED file |

`deploy-production.sh` references only `deploy-lock.sh`, `deploy-context.sh`, `deploy-tag.sh`, `constitutional-verification.sh`, `review-custody-migration-gate.ts` — none of the monitor/backup scripts run inside a deploy. Cron/launchd wiring for monitoring and backups: files reference `crontab`/`plist` (`setup-automated-monitoring.sh`, `setup-backup-cron.sh`) but whether they were ever installed on minisforum or the Mac Studio is `UNOBSERVED`.

### 2.5 Provenance / governance surfaces

- **Provenance card** (`provenance.js`): artifact identity (`build/build-info.json` → `app_build_sha`) vs substrate identity (bound repo HEAD). Shown on Home **and** System.
- **Governance** (`governance.js` → `scripts/builder/session.mjs`): recover / reconcile / close only; session id `^s-[0-9a-f]{6,}`; `--force` unreachable; **`session.mjs` is the authority**, Desktop only builds argv. Vocabulary LIVE / STALE / AMBIGUOUS_OWNERSHIP / CAPACITY · DONE / REFUSED BY GOVERNOR / COLLISION / QUEUED.
- **Legibility** (`legibility.js`): founder states READY · WORKING · NEEDS_SETUP · NEEDS_AUTHORITY · DEGRADED · BLOCKED · FAILED · UNVERIFIED; raw AVAILABLE / UNAVAILABLE / UNCONFIGURED / UNREACHABLE / NOT PROBED / UNKNOWN mapped in; anything unrecognised → UNVERIFIED. **Law:** a refusal, an unobserved row or a failure must never become READY/WORKING (JOP-01, JOP-04 SABOTAGE tests).
- **Correctness** (`correctness.js`): verified / failed / unverified; execution success never implies correctness.
- **Reconciliation** (FLOW-02): NOT_RUN · SECOND_REVIEW_OWED · REPAIR_BEFORE_WITNESS · NEEDS_KELLY · REVIEW_DISAGREEMENT · EVIDENCE_PRESENTED — semantic judgment founder-owned.
- **Work Unit provenance:** W4 append-only ledger; E1/R5B grants; `work-unit-control.js` derives identity, SHA and digest in MAIN (renderer may never supply provider, model, digest, SHA, credential or authority — R5A, E1, `work-unit-cockpit` test).

### 2.6 Runtime organs (`scripts/builder/`, 46 non-test modules)

JARVIS-named: `jarvis-runtime-pipeline.mjs` (run state machine QUEUED … VERIFIED / ESCALATION_REQUIRED / FAILED / CANCELLED / PAUSED_FOR_GOVERNANCE; `executeRun` = packet lint → `ain-delegate.sh claim` → SHA/context boundary → budget → `session.mjs` capacity → `ain-delegate.sh local-native` → result validation → worker gate → patch verification → rollback) · `jarvis-runtime-store.mjs` (`runtime/runs/*.json`, `runtime/events.jsonl`, `runtime/runtime.json`) · `jarvis-governance-gate.mjs` (six gate classes, pure) · `jarvis-local-worker.mjs` (Ollama loopback only, `maia-coder:latest`) · `jarvis-context.mjs` · `jarvis-packet-guard.mjs` · `jarvis-native-*-admission.mjs` · `jarvis-native-prompt.mjs` · `jarvis-continuity.py` · `jarvis-recall.py`. Work-unit family: `work-unit*.mjs` v1 and v2 (create · lifecycle · routing · transport · ledger · e2e). Routing family: `router.mjs` (C0/C1/C3) · `routing-intelligence*.mjs` (J5/J6) · `routing-execution-admission.mjs` (R4) · `routing-route-integrity.mjs` (R5A). Provider family: `opencode-provider.mjs` · `tinker-direct.mjs` · `canonical-provider-*-v1.mjs` (E1) · `human-provider-execution-grant*.mjs` (R5B). Session/governor: `session.mjs`. Evaluation: `jev-judgment-host-v1.mjs` · `epistemic-*.mjs`. Internals of `ain-delegate.sh`, `session.mjs` and the v2 ledger/lifecycle scripts beyond their storage paths: `UNVERIFIED` in this census.

### 2.7 Mutation inventory (what can change state, and its guard)

Preload allowlist `scripts/builder/__tests__/desktop-preload-allowlist.mjs`: **14 entries** (13 invoke channels + the `repo-changed` event; re-verified count). ⚠️ `legibility.js:34` still says "exactly nine" — stale comment. JOP-00 law: the allowlist stays EXACT; a UI lane widening it needs its own review.

| Channel (`main.js`) | Effect | Guard |
|---|---|---|
| `choose-repo` (443) | writes `<appData>/JARVIS/config.json` | native dialog + four-marker check |
| `clear-repo` (456) | deletes config, re-resolves | none |
| `reveal-workspace` (450) | Finder reveal | takes no argument |
| `governance-action` (1280) | `session.mjs` recover/reconcile/close | argv builder; `session.mjs` is the authority |
| `run-work-unit` (718) | pipeline `executeRun`: claim worktree, spawn delegate, **candidate commit** | mechanism's `validatePacket` · `checkAuthority` · `validateWorkerGate`; **not reachable from the renderer today** (no `runWorkUnit` call in `renderer.js`, re-verified) |
| `submit-task` (1127) | `router.mjs`: C0 runs registry capability · C1 calls Ollama · C3 `routed_not_executed` | router + registry; ⚠️ C1 path defective (§6.1) |
| `run-external-reasoning` (1268) | `opencode run --pure --agent jarvis-frontier` in temp sandbox | `external_ok===true`, ≤12,000 chars |
| `continuity-search` (658) | reads sqlite | query ≤500 chars, limit 1–20, fixed script + db |
| `work-unit-action` (780) | one channel switching on `action`: legacy create · canonical create · canonical-bound / -authorize (W2) · canonical-route (W3) · -bind-transport / -prepare-execution-transport (W3T) · -authorize-execution-once (E1 grant) · **-confirm-execute** (grant ACTIVE → fresh R4/R5A evaluation → exact transport identity → OpenCode ancestor preflight → credential presence → one-shot claim → EXECUTING → execute → consume → W4 ledger) · -revoke-execution-grant · -record-verifier · -evidence-ready · -adjudicate · -close · legacy R5B authorize / confirm / revoke · run-provider (refused for W0.v2 and route-bound units) | W2 lifecycle law · E1 · R4 · R5A · R5B · W4; **the O0–O4 planner guards none of these (not wired)** |

Effect-bearing authority beyond the above (GitHub write, deploy, production, merge): `NOT FOUND` in Desktop — and **JOP-04 §5 embargoes it** (RB-6).

### 2.8 Programme / document organs (index, with stated standing)

| Lane | Standing (doc's own words) | Relevance to a founder workspace |
|---|---|---|
| `JARVIS_INSTRUCTIONAL_MANUAL_v1` | CANONICAL OPERATING MANUAL (2026-09-17); "does not upgrade unimplemented or unwitnessed capabilities to LIVE" | method; §24 cockpit; §42 *"projection is not custody… a dashboard over distributed, conflicting state can render confusion more convincingly without resolving it"* |
| `JARVIS-ORCHESTRATION-OPERATOR-01` | O0–O3 CLOSED · CANONICAL; **O4 doc: "CONTRACT + FALSIFIER INSTRUMENT ONLY · NO O4 RUNTIME IMPLEMENTATION"** yet `51890bc0` (2026-09-22) *"jarvis: implement O4 capability router"* landed `operator-capability-router.mjs` with **no witness or adjudication record found** → O4 runtime standing `UNVERIFIED` (§6.3); **O7 Operator Decision Surface — NOT OPEN**, **O10 Desktop Operator Witness — NOT OPEN** (O3 doc :250,:253; O4 doc :329) | ⚠️ a founder workspace is O7/O10 territory — D-02 |
| `JARVIS-WORK-UNIT-01` | W0 RATIFIED; W1–W5 CLOSED; closure said NOT MERGED, R5A later cites merge subject `fab09573…` (`(report)`, not re-verified) | the Work surface's canonical substrate |
| `JARVIS-ROUTING-INTELLIGENCE-01` | J5 RATIFIED; R4 · R5A founder-accepted; **R5B IMPLEMENTED LOCALLY · AWAITING FOUNDER ADJUDICATION**; J6/I1–I4 candidates | renderer submits structured intent only (R5A) |
| `…/evidence/…/J6_WORK_UNIT_I4/DESKTOP_NATIVE_EXPERIENCE_STANDING_2026-09-18.md` | future Desktop workspaces should consume the canonical W0.v2 read/control substrate *"rather than reimplement authority, routing, lifecycle, transport, provenance, or adjudication"* (:20, re-verified) | ⭐ **the most directly binding rule for this lane** |
| `JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E1` | local candidate; no PR/merge/deploy/live-provider authority | Authorize Once ≠ Confirm Execute |
| `JARVIS-CONTINUITY-BRIDGE-01` | implemented + proven locally; merge/deploy unopened | "Projection is not authority"; LOCAL_ONLY |
| `JARVIS-DESKTOP-OPERATOR-FLOW-02` | qualified for a founder walk; not installed | ⭐ governing UX law already exists: *"The founder states the desired outcome. JARVIS handles machinery. The founder is asked only for consequential choices."* No FLOW-01 document exists |
| `JOP-00 … JOP-04b` (Aug) · `JOP-04` (Sep, Effect-Bearing Operator) | JOP-01 source closure established, distribution owed; JOP-02 installed 6/6 on `6d3c0cbc4`; JOP-04 (Sep) census complete, **no effect-bearing capability authorized**, embargo RB-6 | ⚠️ "JOP-04" names two things — do not number this lane JOP |
| `docs/governance/JARVIS_LIVING_SPIRAL_JURISDICTION_2026-08-16` | RATIFIED, binding | operator-only, *"does not live inside MAIA"*; R2 a member is never an inferred node; no elemental vocabulary in the operator graph; artifact named "JARVIS Living Spiral — operational field…" |
| `docs/ops/ADMIN_SURFACE_INVENTORY_2026-08-16` | DISCOVERED — authorizes nothing | EFFECT × DISCLOSURE classification; *read-only is not the same as safe to display* |
| `JARVIS-SVE-01` | CANDIDATE — NOT RATIFIED | nothing here relies on it |
| `JARVIS-JEV-01` · `JEV-INT-01R3` | J0 ratified; J1 not; dev-provider governance ratified; transport shut | nothing here relies on it |
| `MAIA-DESKTOP-BETA-01` | different product (`life.soullab.maia.desktop`, doorway to `/maia`) | ⛔ not JARVIS; do not conflate |
| **`JARVIS-MERGE-AUTHORITY-01 / M1R1R1`** | **NOT FOUND in this checkout** — 0 hits for `MERGE-AUTHORITY`, `M1R1R1`, `\bM1R1\b` across tracked files, branch names and all reachable commit messages; only the generic phrase "merge authority" appears (manual §15, O0, O4 F-O4-05B, R5A, `J11_CANONICAL_TRANSFER_READY`, KP-01 ACT10 :240) | its founder-stated standing (AUTHORIZED · UNSPENT · IDLE PENDING CREDENTIALED EXECUTION CAPACITY) is honoured **by name and by non-mutation only**; ⚠️ *a lane citing a programme nobody here can open inherits from a document that is not in custody* — D-01 |

## 3 · Founder work journey — as it exists today (freeze item 2)

| Step | What exists today | Where | Evidence | Gap |
|---|---|---|---|---|
| **"I have something to do"** | Home prose box; Work intent textarea | Home · Work | OBSERVED (source) | keyword matching only (`onConvoKey` 286-310: "broken"/"happening"/"decision"/"need" answer inline; else saved to sessionStorage → Work). **O1 intent contract exists and is not wired.** |
| **Orient** | active workspace card (repo · branch · HEAD · clean/dirty · resolution); "Needs you"; capability groups; Spiral | Home · Spiral | OBSERVED (source) | orientation is **per bound repository**, not per programme; programme/lane state lives only in `docs/programme/*` and `CLAUDE.md`, unindexed → `NOT FOUND` as a surface. Manual §24 cockpit YAML has **no runtime reader**. |
| **Begin work** | Local/Frontier submission (C0/C1/C3); W0.v2 create → route → transport → grant → confirm-execute | Work | OBSERVED (source); runtime INFERRED | ⚠️ C1 defective (§6.1); local-native `run-work-unit` unreachable from UI; **two work paths with different vocabularies** (§4). |
| **See progress** | 15 s status refresh; single live Work Unit panel (attempts, verifiers) | Work · System | OBSERVED (source) | only **one** Work Unit at a time; no list of Work Units, runs or grants (`listRuns` in the runtime store is unused by Desktop). |
| **Inspect evidence** | attempts / verifiers / route digest / ledger rows; raw JSON `<pre>`; provenance card | Work · System | OBSERVED (source) | evidence is shown as identifiers and JSON, not as sentences (§4.3). |
| **Intervene** | governance recover / reconcile / close; revoke grant; adjudicate (⚠️ hard-coded `decision:'accepted'`, `renderer.js:1260`); close | Home · Work | OBSERVED (source) | adjudication UI offers no *rejected* path from the renderer — `NEEDS FOUNDER RULING` whether that is law or gap (D-06). |
| **Receive artifact / result** | durable result under `$AIN_HOME/work-units-v2/results/<id>/<grant>.json`; candidate commit on a worktree (pipeline) | filesystem · git | OBSERVED (paths in source) | no surface lists results or opens the artifact; "Reveal in Finder" reveals the workspace, not the result. |
| **Resume later** | "Recall prior work" (continuity FTS + git-ref search); governor `close --state handed-off` | Work | OBSERVED (source) | no history or handoff **view**; the manual §25 "continue" protocol (state recovery → next lawful act) has **no mechanical counterpart** in Desktop → `NOT FOUND`. |

## 4 · Fragmentation register (what is duplicated, contradictory, or requires internal vocabulary)

### 4.1 Same thing shown twice
- Provenance card on Home **and** System. Spiral repeats Home (self-declared). Governance holds in "Needs you" **and** in the prose answer. Objective textarea prefilled twice from the same draft (`renderer.js:1526,1550`).
- Frontier appears three ways: System "Frontier reasoning lane" hard-coded AVAILABLE (`main.js:520`), Home "Automatic C3 execution" NEEDS_AUTHORITY, plus a separate Nemotron row.

### 4.2 Same concept, several names (across code and documents)
- **Work Unit:** O2 *planned descriptor* (not W0.v2) · W0/W1 v1 · **W0.v2** (I1–I4, E1) · Desktop legacy *packet* (`operator-work-unit.js`, fenced LEGACY by I4).
- **Routing:** R1/R2 `routeIntelligence` · J6 `planRouting` · O4 capability router (says it composes, but now has code) · C0/C1/C3 `router.mjs` · R3 `preview-route` vs J6 `route-plan` (distinct by design).
- **Authority vocabularies:** O0/O3 (`repo.read`, `repo.write:worktree`) · W0 block (`repository_write`, `network_external`, …) · R4 atoms (`provider.execute:<id>`).
- **Human execution grant:** R5B (legacy) vs E1 (canonical v2) — both "Authorize once ≠ Confirm execute".
- **Cockpit:** manual §24 programme cockpit (YAML) · HUMAN-EXPERIENCE master-run cockpit · R5B/FLOW-02 "Work Unit cockpit" (Desktop UI) — three objects, one word.
- **Status vocabularies (six):** JOP-01 legibility · O0 gate decisions · FLOW-02 reconciliation · manual PASS/STOP/RETURN/HOLD/PARK · SVE A0 dispositions · O4 outcomes. ⭐ KP-01 ACT2 §6: *machine legibility requires `subject + axis + value`, not `status`* — a workspace must not collapse these into one "status".
- **Lifecycle grammars:** manual §5 · SVE S0–L0 (unratified) · W2 lifecycle.
- **Continuity:** CONTINUITY-BRIDGE-01 scripts + `continuity.js` are one system (undocumented by name) vs MAIA Desktop's member "cross-surface continuity" (unrelated).
- **Spiral:** JARVIS Living Spiral (operator) vs a future Member Reflective Spiral (MAIA) — constitutionally separate.

### 4.3 Raw internals shown to the founder
- JSON `<pre>` blocks (`renderer.js:2040,2057,2088`), `JSON.stringify(detail).slice(0,200)` in status rows (:28), capability arguments (:2004).
- Internal keys as labels (`builder_os`, `route_a`, :292-294). Session ids, Work Unit ids, SHAs, route digests, attempt/verifier ids, grant ids (:1183, :1216-1217, :1339, :873-877). Blocker codes as `CODE: detail` (:1268, :1504).
- Provider and model names on screen: Qwen3 Coder 30B · GPT-OSS 20B · Nemotron Zen · Inkling · `qwen2.5:7b` · `opencode/nemotron-3-ultra-free`.
- Vocabulary the founder must already know: W0.v2 / W2 / W3 / W3T / W4 · J5 / J6 · R3 / R4 / R5A / R5B · E1 · I4 · E0–E4 · CODE_GROUNDED · C0/C1/C3 · local-native.
- "Needs Kelly" — the founder's name is hard-coded (`renderer.js:591,1322`).

### 4.4 Contradictory copy
- "Provider execution remains disconnected in I4" / "No provider.execute authority exists" (`renderer.js:1562,1646,1221`) sit beside a working E1 "Confirm Execute" (:852).
- Any canonical lifecycle state is painted green AVAILABLE (:1185, :1339) — clashes with the legibility rule.
- Spiral `PLACEMENT` lists "Claude reasoning" but the organ is named "External frontier reasoning", so it falls to the default sector (`spiral.js:56,123`).

## 5 · What is missing — NOT FOUND vs UNOBSERVED

| Need (founder direction) | State | Note |
|---|---|---|
| Today/Home: "what needs me · what changed" across **programmes** | NOT FOUND | Home is per-repo; programme state is prose in `docs/programme` + `CLAUDE.md` |
| Ordinary-language task entry with intent classification | PARTIAL | prose box + O1 contract exists unwired |
| Current work list / history / handoffs / artifacts | NOT FOUND | one Work Unit at a time; `listRuns` unused; results unlisted |
| Graph (programmes · branches · work units · blockers · dependencies · systems) | NOT FOUND | O2 structure + ledgers exist unjoined; Spiral is a status projection |
| Monitor: machines · services · deployments · storage · backups · jobs · costs · failures · GitHub | NOT FOUND in JARVIS; PRESENT as scattered scripts in repo (§2.4); liveness UNOBSERVED | Production deliberately NOT PROBED by Desktop law |
| System: governance · provenance · authority · logs | PARTIAL | provenance card, governance actions, raw JSON; no log view; runtime `events.jsonl` unread by Desktop |
| Mechanical "continue" (manual §25) | NOT FOUND | — |
| Programme cockpit reader (manual §24) | NOT FOUND | YAML block has no consumer |
| Whether the app at `b4f73ac4` is installed / running / walked | UNOBSERVED | container cannot see the Mac Studio |
| `JARVIS-MERGE-AUTHORITY-01 / M1R1R1` record | NOT FOUND (see §2.8) | D-01 |

## 6 · Defects observed during the census — ⛔ recorded, not repaired (manual §7)

1. **`REPO_ROOT` undeclared** — `jarvis-desktop/src/main.js:1180,1181,1192` use `REPO_ROOT`; the file declares only `REPO_ROOT_MODE` (:168) and `currentRoot()` (:167). OBSERVED FACT (static). → interpretation: every C1 submission throws `ReferenceError`, caught at :1249 as `status:'failed'`; this is the Work button "Run locally with JARVIS" (`renderer.js:1542`). INFERRED (app not run). → consequence: the C1 lane is dead at the census SHA; `c1-evidence-containment.test.mjs` inspects source text and cannot catch it. → open: present since at least merge `9580ad38` (2026-09-18); earlier history unreachable (shallow clone) → origin UNVERIFIED. ⛔ Repair belongs to a lane that owns C1, not to F0.
2. **"read-only" label over a write-bearing mechanism** — `main.js:535`, `builder-mechanism.js:12`, `legibility.js:136,381` call the local-native lane read-only; `jarvis-runtime-pipeline.mjs:129` requires `repo.read + bounded repo.write:worktree` and makes a candidate commit. OBSERVED. → the label no longer matches the mechanism; mitigated today only because `runWorkUnit` is unreachable from the renderer.
3. **O4 standing drift** — O4 doc: "NO O4 RUNTIME IMPLEMENTATION"; commit `51890bc0` (2026-09-22) "jarvis: implement O4 capability router" + `d2db8896` "harden O4 authority-gate evidence". OBSERVED. → no witness / adjudication record found in `docs/programme` → the O4 runtime's canonical standing is UNVERIFIED; manual §41 forbids this lane from upgrading or downgrading it.
4. Stale comment "exactly nine" channels (`legibility.js:34`) vs 14 allowlist entries.
5. Hard-coded founder name; contradictory copy; green-for-any-state; Spiral placement miss (§4.3–4.4).
6. `jarvis-continuity.py` search creates tables / sets WAL (`(report)`).

## 7 · Humane UI law — CANDIDATE (freeze item 3) · ⛔ NOT RATIFIED

Grounded in law that already exists: FLOW-02 (*founder states the outcome; JARVIS handles machinery; founder asked only for consequential choices*), JOP-01 legibility (*state · reason · fix; no bare identifiers; no refusal upgraded to health*), manual §42 (*projection is not custody*), ADMIN_SURFACE_INVENTORY (*read-only is not safe-to-display*), Living Spiral jurisdiction (*no aggregate health score; motion UNOBSERVED*), KP-01 ACT2 §6 (*subject + axis + value*).

- **HU-1 Ordinary language first.** Every row the founder reads is a sentence with subject · axis · value · what it means for them · what they can do. Programme codes, hashes, provider names, JSON and vocabulary tables are **one layer down**, reachable, never required.
- **HU-2 Technical truth is never removed, only layered.** The lower layer is the canonical object (Work Unit, grant, ledger row, route record) rendered verbatim — the workspace is a projection, and *projection is not custody*.
- **HU-3 No restyled identifiers.** A surface that renders `builder_os: AVAILABLE` in a nicer font has not become humane. Names are derived from the organ's own legibility layer or from a documented vocabulary map that the founder can inspect.
- **HU-4 No invented health.** No score, percentage, trend, "all systems go", or colour may appear unless a **named instrument** produced the underlying value at a **stated time**; UNOBSERVED / NOT PROBED / UNVERIFIED render as exactly that, with the reason, and are never painted green. Freshness is shown, not assumed.
- **HU-5 Six vocabularies stay six.** Legibility states, gate decisions, reconciliation states, manual dispositions, lifecycle states and route outcomes are shown on their own axis; the workspace never synthesizes a single "status".
- **HU-6 Presence ≠ liveness.** *packaged ≠ installed ≠ running ≠ witnessed; built ≠ wired ≠ surfacing ≠ verified.* A surface says which of these it can actually see.
- **HU-7 Nothing on the surface confers authority.** Reading, naming, grouping, ranking-for-display and "what needs me" never create, widen or imply permission; consequential acts remain the same explicit gestures they are today (Authorize once ≠ Confirm execute; adjudication is a human act).
- **HU-8 The founder is a person, not a constant.** "Needs Kelly" becomes "Needs you" / the role, with the person resolved from the operator identity, not a string literal.
- **HU-9 A refusal is not an occasion to disclose.** Errors and holds show the *class* of reason and the *fix*, not payloads, credentials, or member/corpus material (ADMIN_SURFACE_INVENTORY EFFECT × DISCLOSURE).

## 8 · Single-workspace architecture — CANDIDATE (freeze item 4) · ⛔ NOT RATIFIED

⭐ Composition rule (binding source: `DESKTOP_NATIVE_EXPERIENCE_STANDING_2026-09-18` :20): each surface **consumes** an existing organ; it never reimplements authority, routing, lifecycle, transport, provenance or adjudication.

| Surface | Founder question | Composed from (existing) | Classification |
|---|---|---|---|
| **Today / Home** | What am I working on? What needs me? What changed? | Home headline + workspace card + "Needs you" (legibility · governance) · continuity recall (last N) · runtime `events.jsonl` (unread today) · W0.v2 units in `$AIN_HOME` · **programme cockpit** (manual §24) — ⚠️ the cockpit has no machine-readable source today | COMPOSITION for repo/session/work-unit state; **NEW CAPABILITY** for programme-level "what changed" (needs a programme-state source: D-03) |
| **Work** | Say it in ordinary words → see current work → history → handoffs → artifacts | Home prose box + O1 intent contract (unwired) → O2/O3 (unwired) → W0.v2 form + cockpit (existing) · `listRuns` (unused) · results dir · governor `handed-off` · recall | COMPOSITION (wiring O1–O3 as *read/plan* organs is composition; **any new mutation path is NEW CAPABILITY** and JOP-04-embargoed) |
| **Graph** | How do programmes, branches, work units, blockers, dependencies and systems relate? | O2 descriptors · W4 ledger · grants · runtime runs · git refs (`jarvis-recall.py`) · Spiral edge law (*edges need evidence*) · `docs/programme` records | **NEW CAPABILITY** (a join + renderer that does not exist), built over existing data; must obey Living Spiral R2/R4 (no member node, no elemental vocabulary) |
| **Monitor** | Are the machines, services, deployments, storage, backups, jobs and costs healthy? What failed? | `/api/health` family · deploy lock/tag/provenance verifiers · storage/worktree censuses · backup scripts · typecheck baseline · Co-Lab gate — **all outside JARVIS today, none scheduled as far as this census can see** | **NEW CAPABILITY** as a surface; each row is COMPOSITION of one named instrument or it does not appear (HU-4). ⛔ Desktop law forbids the status probe from reaching production; a Monitor that reads production needs its own authority act (D-04). Costs: `NOT FOUND` any instrument → must not appear until one exists (D-05) |
| **System** | Show me the governance, provenance, authority, logs and technical detail | provenance card · governance actions · legibility raw states · W4 ledger · grant stores · `events.jsonl` · the existing raw JSON — moved **down one layer** | COMPOSITION |

**Placement question (not ruled):** the operator programme names **O7 Operator Decision Surface** and **O10 Desktop Operator Witness** as NOT OPEN. A founder workspace is exactly that territory. Whether `JARVIS-FOUNDER-WORKSPACE-01` (a) subsumes O7/O10, (b) coordinates with them as separate lanes, or (c) is the flow under which they open, is **NEEDS FOUNDER RULING** (D-02). This record does not decide it.

## 9 · Dashboard / graph / monitoring contract — CANDIDATE (⛔ not ratified)

- **DC-1 Every displayed value names its instrument and observation time.** `{subject, axis, value, instrument, observed_at, evidence_state}`; missing any field → rendered as UNVERIFIED with the missing field named.
- **DC-2 The workspace holds no state of its own.** Destroy and rebuild from the organs and nothing is lost (manual §24 cockpit test). Per-founder conveniences (collapsed panels, last tab) are the only local state.
- **DC-3 Graph edges require evidence** (Spiral law): an edge exists only where a ledger row, grant, git ref, or explicit record names both ends. No inferred edges; no member nodes; no elemental vocabulary; the graph is named "JARVIS Living Spiral — operational field" or a new ratified name, never bare "Living Spiral".
- **DC-4 Monitor rows are read-only observations of existing instruments.** No new probe is added by the surface; adding one is its own act with its own authority (production/SSH/DB especially).
- **DC-5 No aggregate.** No roll-up score across rows; "what needs me" is a *list* derived from holds and gate decisions, ordered by a **non-evaluative** key (time), never by invented severity.
- **DC-6 Vocabulary map is a document, not a heuristic.** Ordinary-language labels are produced from a committed, reviewable map (organ term → founder sentence); a term without a mapping renders its raw term inside a clearly marked technical chip, never a guessed paraphrase.
- **DC-7 Nothing in the surface widens the preload allowlist by default.** A read path that needs a new IPC channel is a NEW CAPABILITY act with its own review (JOP-00).
- **DC-8 Freshness on screen mirrors the freshness discipline in this lane:** observed SHA · candidate SHA · reconciliation state, per row where applicable.

## 10 · F0 completion test — the five questions, answered from this record

1. **What JARVIS already has:** four console views + preferences over a 14-channel preload (§2.1, §2.7); a canonical W0.v2 Work Unit substrate with lifecycle, routing, transport, one-shot execution and an append-only ledger (§2.6–2.7); legibility, correctness, governance, provenance and continuity organs (§2.3, §2.5); O0–O4 operator organs **as unwired pure modules** (§2.2); a repository of ops/health/backup/deploy instruments **outside** JARVIS (§2.4); ≈150 programme records with stated standings (§2.8).
2. **What is fragmented:** §4 — two work paths, three Work Unit meanings, six status vocabularies, three "cockpits", duplicated cards, raw identifiers, contradictory copy.
3. **What is missing:** §5 — programme-level Today, work list/history/handoff/artifacts, any graph, any monitor, log view, mechanical "continue", cockpit reader; plus two UNOBSERVED items (installed/running state; merge-authority record).
4. **What should become the daily workspace (CANDIDATE):** §8 — one environment, five surfaces, composed as tabled; the Work surface's canonical substrate is W0.v2 and the O1–O3 organs become its read/plan layer; Spiral is retained as the Graph's law, not as the Graph.
5. **Composition vs new capability:** Today (repo/work state) · Work · System = COMPOSITION; Today (programme-level change) · Graph · Monitor = **NEW CAPABILITY over existing data**, each needing its own act, and Monitor-over-production needing its own authority.

## 11 · Founder decision docket (STOP)

- **D-01 · Merge-authority custody.** `JARVIS-MERGE-AUTHORITY-01 / M1R1R1` is NOT FOUND in this checkout. Options: (a) founder supplies its location/branch and the lane records it as protected-by-reference; (b) the founder confirms it lives outside this repository and this lane keeps honouring it by name only; (c) the record is landed on canonical first. *Non-decision:* nothing in F0 depends on its content; only the protection's verifiability does.
- **D-02 · Placement vs O7 / O10.** Subsume · coordinate · flow-parent (§8). Effect: which charter governs the Work-surface decisions and the Desktop witness.
- **D-03 · Programme-state source for Today.** Today needs a machine-readable programme cockpit. Options: (a) author a cockpit file per programme (manual §24 YAML, derivable from records) — new artifact class; (b) derive from `docs/programme` filenames + standing lines — brittle; (c) defer programme-level Today to a later act. *Recommendation, non-authoritative:* (a) as a documentary convention first, since it changes no runtime.
- **D-04 · Monitor authority boundary.** Desktop law forbids probing production. Options: (a) Monitor reads only what the Mac Studio can see locally (health of local stack, worktrees, storage, backups on local paths) — no new authority; (b) Monitor reads production through an existing read-only instrument run by the founder (ssh) — needs an act naming it; (c) no Monitor until (b) is ruled. *Recommendation, non-authoritative:* (a) first.
- **D-05 · Costs.** No cost instrument exists. Rule that "costs" does not appear until one is named, or open a separate lane to define one.
- **D-06 · Adjudication gesture.** Renderer hard-codes `decision:'accepted'`. Rule whether a *rejected* path from the UI is owed (and by which lane) or whether rejection is deliberately out-of-band.
- **D-07 · Defects §6.1–6.3.** Assign to their owning lanes (C1 lane; local-native mechanism lane; ORCHESTRATION-OPERATOR-01 for O4 standing). ⛔ Not this lane's to repair.
- **D-08 · Open F1?** Proposed: `F1 — Founder Workspace information architecture + living prototype` — a prototype over **recorded** evidence (snapshots of real status JSON, ledgers, docs), no runtime mutation, walked by the founder; exit = per-surface ruling composition vs new capability confirmed, plus the vocabulary map's first draft. ⛔ Not opened by this record.

## 12 · Defeat candidates for F1 (named now so F1 cannot pass by construction)

- **DF-1 Restyled dashboard:** renders the same `builder_os: AVAILABLE` rows in a new theme → must fail HU-3.
- **DF-2 Invented health:** a green "System OK" with no instrument/time → must fail HU-4 / DC-1.
- **DF-3 Silent aggregate:** one status derived from six vocabularies → must fail HU-5 / DC-5.
- **DF-4 Inferred edge:** graph draws programme→branch from a name match → must fail DC-3.
- **DF-5 Stateful workspace:** prototype keeps a "current programme" the organs cannot reproduce → must fail DC-2.
- **DF-6 Convenient authority:** a "Run" affordance on Today that reaches `work-unit-action` without the existing gestures → must fail HU-7.
- **DF-7 Probe creep:** a Monitor row that opens a connection → must fail DC-4 / Desktop status-row law.

## 13 · Containment (what this act did not do)

⛔ No file under `jarvis-desktop/`, `scripts/`, `app/`, `lib/`, `database/` modified · ⛔ app not launched · ⛔ no production/SSH/DB/network read · ⛔ no `node_modules` installed · ⛔ no test run · ⛔ nothing ratified · ⛔ no O4 / R5B / SVE / JEV standing touched · ⛔ merge-authority programme untouched and uninspected · ⛔ F1 not opened. The two subagent reports were consumed as inputs; their claims not re-verified here are marked `(report)`.
