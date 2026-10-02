# JARVIS-FOUNDER-OPERATING-ENVIRONMENT-01 — P0 · Full-Functionality Readiness Matrix

**Act:** P0 (read-only, documentary) · **Authored:** 2026-09-23 · **Machine-readable source of record:** `JARVIS-FOUNDER-OPERATING-ENVIRONMENT-01_P0_READINESS_MATRIX_2026-09-23.json` (this file is rendered from it; the JSON governs on any divergence).
**Observed against:** canonical `840194ba859bd5a497fc939c94329ee972ca3f80` · Workspace reference tip (founder-stated) `5039fc5e3dc4c19775f553f114c505c6dd61d2a8` · Workspace actual tip `9b1c1acf5fa473942edd7795213483a5d4a19f64` (none (docs-only lineage)) · installed app: 6d3c0cbc4 (JOP-02, 2026-08-16) — older than canonical; current installed state UNOBSERVED.
**Ladder law:** BUILT ≠ WIRED ≠ LIVE ≠ USABLE ≠ WITNESSED. ✅ yes · ⚠️ partial · ❌ no · ? unobserved from this container.

---

## 0 · The one-screen answer — *What is stopping Kelly from using JARVIS as her normal working environment today?*

Seven things, in the order they bite:

1. **The doorway opens onto the wrong thing.** The installed app (last witnessed at `6d3c0cbc4`) is a four-view operational console over one repo, not the five-surface workspace F1 designed. Nothing shows the founder her day across programmes (R-01, R-02).
2. **There is no programme-state reader.** Every programme's standing is prose in 535 records and the CLAUDE.md thread; no parser, no projector, no cockpit reader. Today cannot be built until FD-3 is ruled (R-02).
3. **Saying what you want does not reach a mind.** O1–O4 exist as pure modules and are loaded by nothing; the Work form asks for lanes and evidence paths (R-03, R-04).
4. **Work is one unit at a time, from memory that dies on quit.** No list of Work Units, no run history reader, no results index, no 'where was I' (R-06, R-07, R-08).
5. **Real code work from the app is broken or unwired.** C1 throws on an undeclared identifier on every submit; the local-native patch lane is CLI-only and its Desktop bridge is called by no renderer code; the RB-6 embargo stands (R-15).
6. **Graph and Monitor do not exist inside JARVIS.** The Spiral is a status projection; instruments are scattered scripts with no registry, no scheduler, no machine-readable mode (R-09, R-10).
7. **Voice, canonical admission and external state are absent by construction**, not by defect: no voice pipeline, Merge Authority is an external dependency not found in this checkout, no GitHub reads, no connectors (R-14, R-16, R-17).

**Reliability is unwitnessed rather than known-bad**: JOP-02 proved identity, not daily use — offline, restart, crash, first-run and rebinding were never walked (R-12, R-13).

**Nothing on this list is a research problem.** Items 2–4 and 6 are composition over organs that already exist (F2 census); item 5 is two named defects plus one governance closure; items 1 and 7 need founder acts in their owning programmes. The execution sequence (`…_P0_EXECUTION_SEQUENCE`) orders them.

## 1 · Ladder summary

| Req | Requirement | BUILT | WIRED | LIVE | USABLE | WITNESSED | Owning programme |
|---|---|---|---|---|---|---|---|
| R-01 | One doorway | ✅ | ✅ | ? | ⚠️ | ⚠️ | JOP-01 / JOP-02 (distribution + installed acceptance) |
| R-02 | Understand my day | ⚠️ | ❌ | ❌ | ❌ | ❌ | JARVIS-FOUNDER-WORKSPACE-01 (surface) |
| R-03 | Say what I want in ordinary language; JARVIS classifies intent without asking me to name lane, provider, class or evidence class | ✅ | ❌ | ❌ | ❌ | ❌ | JARVIS-ORCHESTRATION-OPERATOR-01 (O1) |
| R-04 | JARVIS organizes the machinery | ✅ | ❌ | ❌ | ❌ | ❌ | JARVIS-ORCHESTRATION-OPERATOR-01 |
| R-05 | Consequential decisions only | ✅ | ✅ | ? | ⚠️ | ⚠️ | JARVIS-WORK-UNIT-01 (W0.v2) |
| R-06 | See work | ⚠️ | ❌ | ❌ | ❌ | ❌ | JARVIS-FOUNDER-WORKSPACE-01 (B2 read organs) |
| R-07 | Receive result | ❌ | ❌ | ❌ | ❌ | ❌ | JARVIS-FOUNDER-WORKSPACE-01 (surface) |
| R-08 | Return and continue | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | JARVIS-CONTINUITY-BRIDGE-01 (substrate) |
| R-09 | Graph | ⚠️ | ❌ | ❌ | ❌ | ❌ | JARVIS-FOUNDER-WORKSPACE-01 (B7) |
| R-10 | Monitor | ⚠️ | ❌ | ❌ | ❌ | ❌ | JARVIS-FOUNDER-WORKSPACE-01 (B3 registry) |
| R-11 | Why does JARVIS believe this | ⚠️ | ❌ | ❌ | ❌ | ❌ | JARVIS-FOUNDER-WORKSPACE-01 |
| R-12 | Failure is legible | ⚠️ | ⚠️ | ? | ⚠️ | ⚠️ | JOP (desktop reliability) — owner NOT NAMED by any record (docket OE-5) |
| R-13 | Daily-use reliability | ⚠️ | ⚠️ | ? | ⚠️ | ❌ | JOP (see OE-5) |
| R-14 | Canonical admission | ? | ❌ | ❌ | ❌ | ❌ | JARVIS-MERGE-AUTHORITY-01 (external) |
| R-15 | Execute real code work from the doorway | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | JARVIS-ROUTING-INTELLIGENCE-01 (lanes) |
| R-16 | Voice activation | ❌ | ❌ | ❌ | ❌ | ❌ | NONE — no JARVIS voice programme exists (docket OE-1) |
| R-17 | External state | ❌ | ❌ | ❌ | ❌ | ❌ | JARVIS-SOVEREIGN-ACTION-SUBSTRATE-01 (LANE NOT OPENED) |

## 2 · Requirement rows (eleven mandatory fields each)

### R-01 · One doorway: an installed JARVIS that opens, binds to the Sovereign checkout, and tells the truth about its own identity

- **Ladder:** BUILT ✅ · WIRED ✅ · LIVE ? · USABLE ⚠️ · WITNESSED ⚠️
- **What exists:** Electron app `jarvis-desktop/` (appId life.soullab.jarvis, 0.1.0-alpha); single-instance lock; first-run binding prompt; config.json binding ladder (env → config → hard-coded default → NONE); provenance card separating app stamp from substrate HEAD; JOP-02 six identity proofs PASS on installed 6d3c0cbc4
- **Owning programme:** JOP-01 / JOP-02 (distribution + installed acceptance)
- **Standing:** JOP-02 6/6 PASS on 6d3c0cbc4 (2026-08-16)
- **Founder-facing today:** yes — but the four views it opens onto are not the five-surface workspace
- **Defects (recorded, ⛔ not repaired):** no notarize/hardenedRuntime/entitlements; `build-resources` referenced but absent; app stamp never compared to substrate HEAD (two identities, no equality check); installed build is 6d3c0cbc4, canonical is 840194ba — the founder is running an app older than the substrate it binds to (INFERRED; current install UNOBSERVED)
- **Authority needed:** JOP-01/02 reinstall act on a named SHA (founder, on the Mac Studio)
- **Prerequisite:** none for reinstall; B5 renderer swap for the five-surface doorway
- **Falsifier:** install from canonical; `build-info.json.app_build_sha` == `git rev-parse --short` of the bound root; second launch focuses the first instance; unbound packaged launch reads 'JARVIS cannot operate yet' with no substitution
- **Exact next lawful act:** JOP-02-style reinstall walk on canonical `840194ba` (founder act) — evidence, not P0's to run

### R-02 · Understand my day: Today shows what matters, what is happening, what needs me — across programmes, not per repo

- **Ladder:** BUILT ⚠️ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** Home view is per-repo status (`jarvis:status` → `deriveOperatorView`); programme state lives as prose in 535 `docs/programme` records + the CLAUDE.md priority thread; `jarvis-recall.py` already regexes `declared_state`; F1 prototype renders Today over a recorded `programme-state.v1` fixture (13 programmes, population complete:false)
- **Owning programme:** JARVIS-FOUNDER-WORKSPACE-01 (surface) · projector = D-03 / FD-3 (founder)
- **Standing:** F1 Today = REVISE; contract PS-1…PS-9 delivered; projector NOT BUILT
- **Founder-facing today:** prototype only (file://, recorded fixture)
- **Defects (recorded, ⛔ not repaired):** no programme-record parser exists (0 frontmatter; 171/535 carry a State|Status|Standing line); no cockpit reader for manual §24; Home headline 'green for any state' (F0 §4)
- **Authority needed:** FD-3 projector law (what counts as the record; where the projection lives) → B4 (Class A)
- **Prerequisite:** B1 view-model contract; FD-3
- **Falsifier:** PS-9: Today may not state a total until `population.complete === true` from a deterministic projector; projector run over the whole `docs/programme` + thread reproduces the F0 13 as a subset and classifies every other subject
- **Exact next lawful act:** founder rules FD-3 → open B4 (`programme-state.v1` projector) — may precede the F1 walk (FD-5)

### R-03 · Say what I want in ordinary language; JARVIS classifies intent without asking me to name lane, provider, class or evidence class

- **Ladder:** BUILT ✅ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** Work view prose box (`renderer.js`) → `jarvis:submit-task`; O1 `compileIntent({utterance, priorIntent})` pure and NOT loaded by `index.html`; router chooses lane from explicit fields only (`capability` → C0; `bounded_for_local` ≤4000 chars → C1; else C3)
- **Owning programme:** JARVIS-ORCHESTRATION-OPERATOR-01 (O1) · JARVIS-FOUNDER-WORKSPACE-01 (surface)
- **Standing:** O1 contract exists, UNWIRED (F0 §5 PARTIAL)
- **Founder-facing today:** a prose box exists; today the founder must still set `bounded_for_local` / `capability` semantics by form
- **Defects (recorded, ⛔ not repaired):** the Work form asks for evidence paths and lane-shaped inputs (`wu-evidence` textarea placeholder) — machinery on the doorway (HU-1 breach)
- **Authority needed:** B6 (Class A) wiring O1 as a read/plan organ; no authority created (O0 law)
- **Prerequisite:** B5 renderer swap; F1 Work ruling (KEEP)
- **Falsifier:** an utterance with no lane/provider/class fields produces a rendered plan with `execution_authorized:false`; the founder never sees a provider name on the doorway
- **Exact next lawful act:** B6 after B5 (both after the F1 walk); O1 adapter can be harnessed in B1 now

### R-04 · JARVIS organizes the machinery: plan → work graph → authority plan → capability route, shown as one sentence with evidence one layer down

- **Ladder:** BUILT ✅ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** O2 `compileWorkGraph(intent)`, O3 `planAuthority(json)`, O4 `planCapability(...)` pure; O4 runtime implemented in `51890bc0`/`d2db8896` with NO witness record; W0.v2 `statusCanonicalV2` frozen read (`authority_effect:'none'`)
- **Owning programme:** JARVIS-ORCHESTRATION-OPERATOR-01 · JARVIS-ROUTING-INTELLIGENCE-01
- **Standing:** O1–O3 CANDIDATE unwired; O4 UNVERIFIED (D-07)
- **Founder-facing today:** no
- **Defects (recorded, ⛔ not repaired):** O4 doc says NO RUNTIME while the runtime exists (drift); O3 accepts a JSON string only
- **Authority needed:** O4 reconciliation act (ORCHESTRATION-OPERATOR-01, founder) before O4 is consumed; B6
- **Prerequisite:** R-03; O4 reconciliation for the last hop
- **Falsifier:** O1→O2→O3 plan renders with no execution; consuming O4 while UNVERIFIED is refused by a static guard
- **Exact next lawful act:** founder opens O4 reconciliation in its owning programme; B6 wires O1→O2→O3 plan-only

### R-05 · Consequential decisions only: the founder is asked exactly when authority is needed, in plain words, with a governed Yes — and a governed No

- **Ladder:** BUILT ✅ · WIRED ✅ · LIVE ? · USABLE ⚠️ · WITNESSED ⚠️  
  WITNESSED: partial (JOP-02 did not exercise create/execute)
- **What exists:** E1/R5B gestures: `authorize-execution-once` → `confirm-execute` → `revoke` on canonical v2 units; `ACCEPTED_ADJUDICATION_REQUIRED` (W0.v2 requires `decision==='accepted'`); governance holds in status
- **Owning programme:** JARVIS-WORK-UNIT-01 (W0.v2) · JARVIS-FOUNDER-WORKSPACE-01 (presentation)
- **Standing:** gestures LIVE in the four-view console (UNOBSERVED on the installed build)
- **Founder-facing today:** yes, in internal vocabulary (raw ids, provider names on screen)
- **Defects (recorded, ⛔ not repaired):** D-06: no governed No exists — a reject gesture is owed to the Work Unit programme, not the workspace; six status vocabularies on one screen
- **Authority needed:** WORK-UNIT-01 act constituting a governed refusal/decline; B5 for plain-language presentation
- **Prerequisite:** none for the Yes path; D-06 act for the No path
- **Falsifier:** every affordance on screen maps to an existing governed capability (defeat: a button that does something no capability constitutes)
- **Exact next lawful act:** founder opens the D-06 'governed No' act in WORK-UNIT-01 (docket OE-2)

### R-06 · See work: current work list, history, handoffs, artifacts — all of it, not one unit at a time

- **Ladder:** BUILT ⚠️ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** one Work Unit at a time via sessionStorage `jarvis:active-work-unit`; `$AIN/work-units-v2/*.json` UNENUMERATED (no list function); `listRuns` exists and is unused (mkdirs on read); `events.jsonl` has no reader; sessions `status --json` active only, `report` counts handed-off
- **Owning programme:** JARVIS-FOUNDER-WORKSPACE-01 (B2 read organs) · JARVIS-WORK-UNIT-01 (substrate)
- **Standing:** F1 Work = KEEP; read organs NOT BUILT
- **Founder-facing today:** prototype only (3 ILLUSTRATIVE units)
- **Defects (recorded, ⛔ not repaired):** no 'where was I' read exists; sessionStorage is lost on quit
- **Authority needed:** B2 (Class B, read-only, static no-write guard)
- **Prerequisite:** B1
- **Falsifier:** a corrupt unit file renders as UNREADABLE, never silently dropped; `listWorkUnitsV2` performs no write (guard)
- **Exact next lawful act:** open B2 now (may precede the walk, FD-5)

### R-07 · Receive result: results and artifacts are first-class — listed, openable, attributed to the unit that produced them

- **Ladder:** BUILT ❌ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** results live in `$AIN/runtime/runs/*.json` + provenance blocks in canonical units; Desktop can only `showItemInFolder` config.json and the workspace root; NO openPath/openExternal (deliberate preload law)
- **Owning programme:** JARVIS-FOUNDER-WORKSPACE-01 (surface) · preload allowlist law (five questions)
- **Standing:** NOT FOUND as a surface; artifact opening is a refused capability class today
- **Founder-facing today:** no
- **Defects (recorded, ⛔ not repaired):** none — absence; opening an artifact is a new reveal/open capability needing the five-question act
- **Authority needed:** a governed reveal capability (preload act) — docket OE-6
- **Prerequisite:** B2 (results index)
- **Falsifier:** a result row names its producing unit + attempt; 'open' reveals in Finder only (never executes); zero `openExternal`
- **Exact next lawful act:** founder rules OE-6 (reveal-only vs open) → B5/B6

### R-08 · Return and continue: open JARVIS after a day away and be shown where I was; mechanical 'continue' (manual §25)

- **Ladder:** BUILT ⚠️ · WIRED ⚠️ · LIVE ⚠️ · USABLE ❌ · WITNESSED ❌
- **What exists:** sessions (completed/handed-off/paused/abandoned), continuity sqlite FTS (`~/.jarvis/continuity`), `jarvis-recall.py`, `session.mjs report`; Desktop re-reads only the one id in sessionStorage (renderer-session scoped, lost on quit)
- **Owning programme:** JARVIS-CONTINUITY-BRIDGE-01 (substrate) · JARVIS-FOUNDER-WORKSPACE-01 (surface)
- **Standing:** substrate LIVE (read-only search reachable); resume surface NOT FOUND
- **Founder-facing today:** search only
- **Defects (recorded, ⛔ not repaired):** `jarvis-continuity.py` search creates tables / sets WAL (a read that writes); continuity import is run by hand, unscheduled
- **Authority needed:** B2/B4 (read organs) + B6 Work; a scheduled continuity import is an ops act (docket OE-7)
- **Prerequisite:** B2 · B4
- **Falsifier:** quit + relaunch → Today names the last handed-off session and the last active unit without the founder typing anything
- **Exact next lawful act:** B2 (sessions + runs adapters) now; resume surface in B5/B6

### R-09 · Graph: programmes · branches · work units · blockers · dependencies · systems, every edge evidenced

- **Ladder:** BUILT ⚠️ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** Living Spiral (status projection, not a graph); F1 Graph prototype (22 nodes / 19 evidenced edges, REVISE); sources readable per row (units, grants, sessions, git refs, records) — no join
- **Owning programme:** JARVIS-FOUNDER-WORKSPACE-01 (B7) · Spiral jurisdiction R2/R4 preserved
- **Standing:** NEW CAPABILITY over existing data; prototype REVISE
- **Founder-facing today:** prototype only
- **Defects (recorded, ⛔ not repaired):** none — absence
- **Authority needed:** B7 (Class A) after B2 + B4
- **Prerequisite:** B2 · B4 · B5
- **Falsifier:** VM-3 on live data: zero uncited edges; no member node, no elemental vocabulary
- **Exact next lawful act:** B7 after B4/B5

### R-10 · Monitor: machines · services · deployments · storage · backups · jobs · failures — local-first, instrument-named, time-stamped, no synthetic score

- **Ladder:** BUILT ⚠️ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** read-only instruments: `workstation-storage-census.sh` (human report), `worktree-census.sh` (TSV), git, Ollama `/api/tags`, `session.mjs status`, `verify-deploy-provenance.sh`; MUTATING and refused: `storage-health-monitor.sh`, `health-check.sh`, `backup-postgres.sh`; no scheduler runs any JARVIS instrument; production NOT PROBED (D-04); no cost instrument (D-05); F1 Monitor prototype REVISE with freshness per row
- **Owning programme:** JARVIS-FOUNDER-WORKSPACE-01 (B3 registry) · ops (storage-relief record) for script output modes · JARVIS-CAPACITY-SENTINEL-01 (named NEXT in the storage record, NOT OPENED)
- **Standing:** NOT FOUND inside JARVIS; instruments scattered; liveness UNOBSERVED
- **Founder-facing today:** prototype only
- **Defects (recorded, ⛔ not repaired):** the two admissible census scripts have no machine-readable mode (FD-4); GitHub/CI state has zero readers in JARVIS
- **Authority needed:** FD-4 (ops-script JSON/TSV mode, founder act) · B3 registry · docket OE-4 for GitHub read
- **Prerequisite:** B1; FD-4
- **Falsifier:** registry REFUSES an entry pointing at `storage-health-monitor.sh`; an absent instrument renders 'not observed', never calm
- **Exact next lawful act:** founder rules FD-4 → B3

### R-11 · Why does JARVIS believe this: every value names its instrument, time and record; governed evidence one layer down

- **Ladder:** BUILT ⚠️ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** F1 `row()` helper with 'Why does JARVIS believe that?'; DC-1/DC-8 ratified for F1; W0.v2 provenance blocks; grant standings; freshness per Monitor row (F1R1)
- **Owning programme:** JARVIS-FOUNDER-WORKSPACE-01
- **Standing:** law RATIFIED for F1; live rendering NOT BUILT
- **Founder-facing today:** prototype only
- **Defects (recorded, ⛔ not repaired):** none
- **Authority needed:** B1 validator (VM laws) · B5
- **Prerequisite:** B1
- **Falsifier:** VM-1…VM-7 lethal against 7 defeat candidates; a value without instrument+time fails validation
- **Exact next lawful act:** B1 now

### R-12 · Failure is legible: no false calm, no false alarm; a broken lane says it is broken in plain words

- **Ladder:** BUILT ⚠️ · WIRED ⚠️ · LIVE ? · USABLE ⚠️ · WITNESSED ⚠️
- **What exists:** structured `{state, detail}` / `{ok:false,status,reason}` returns; DESKTOP_FAULT, DEGRADED, UNCONFIGURED states; native dialogs only for invalid folder + first run; no crash handling anywhere in `jarvis-desktop/src` (0 hits for uncaughtException / unhandledRejection / render-process-gone / relaunch)
- **Owning programme:** JOP (desktop reliability) — owner NOT NAMED by any record (docket OE-5)
- **Standing:** PARTIAL
- **Founder-facing today:** yes, as status rows and error blocks
- **Defects (recorded, ⛔ not repaired):** C1 fails on every submit with a ReferenceError shown as a generic failure (INFERRED); 'green for any state' headline; a main-process exception has no handler
- **Authority needed:** owning programme act for crash/relaunch handling; C1 repair in ROUTING/WORK-UNIT owner (D-07)
- **Prerequisite:** OE-5 owner named
- **Falsifier:** kill Ollama → local worker reads UNREACHABLE within one tick and C1 says why; throw in main → app survives or relaunches with the fault named
- **Exact next lawful act:** founder names the owner (OE-5); that owner opens a reliability act

### R-13 · Daily-use reliability: startup, workspace/state recovery, offline/degraded behaviour, relaunch, no silent stale

- **Ladder:** BUILT ⚠️ · WIRED ⚠️ · LIVE ? · USABLE ⚠️ · WITNESSED ❌
- **What exists:** single-instance lock; binding re-verified every launch; config.json atomic write; renderer 15 s status tick (no re-render on Work), 2 s poll while a provider runs; Ollama absent → UNREACHABLE; nothing touches a git remote; Node resolved via login shell with caching
- **Owning programme:** JOP (see OE-5) · JARVIS-FOUNDER-WORKSPACE-01 for on-screen freshness (DC-8)
- **Standing:** PARTIAL; JOP-02 did not check offline, restart persistence, crash, first-run, rebinding
- **Founder-facing today:** yes
- **Defects (recorded, ⛔ not repaired):** window state not persisted; sessionStorage lost on quit; 15 s re-render wipes the open Spiral inspector (JOP-02 pre-existing); no relaunch path; app stamp vs substrate SHA never compared
- **Authority needed:** OE-5 owner act
- **Prerequisite:** OE-5
- **Falsifier:** the reliability checklist JOP-02 skipped, run on the installed build: offline · restart · crash · first-run · rebind — each with a witnessed outcome
- **Exact next lawful act:** OE-5 → reliability walk on the installed build (founder + owner)

### R-14 · Canonical admission: work JARVIS produces can reach canonical under a governed merge authority

- **Ladder:** BUILT ? · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** Merge Authority = EXTERNAL PROTECTED DEPENDENCY (D-01); `JARVIS-MERGE-AUTHORITY-01 / M1R1R1` NOT FOUND in this checkout (0 hits); founder-stated standing AUTHORIZED · UNSPENT · IDLE PENDING CREDENTIALED EXECUTION CAPACITY; M1 pinned to an older canonical (founder-stated)
- **Owning programme:** JARVIS-MERGE-AUTHORITY-01 (external)
- **Standing:** honoured by name and non-mutation only
- **Founder-facing today:** no
- **Defects (recorded, ⛔ not repaired):** record not present where every other programme's record is; JOP-04 forbids every GitHub write from JARVIS today
- **Authority needed:** founder act in MERGE-AUTHORITY-01 (re-pin M1 to current canonical; credentialed execution capacity)
- **Prerequisite:** outside this programme entirely
- **Falsifier:** a JARVIS candidate commit reaches canonical through the named authority with a witness — or does not, and Work says 'candidate, not admitted'
- **Exact next lawful act:** none here; Work renders admission state as 'not admitted from this workspace' until the dependency is live

### R-15 · Execute real code work from the doorway: deterministic checks, local reasoning, and a bounded patch in a worktree — end to end from JARVIS, not the CLI

- **Ladder:** BUILT ✅ · WIRED ⚠️ · LIVE ⚠️ · USABLE ❌ · WITNESSED ⚠️  
  WITNESSED: partial (Route A proof for C0 only)
- **What exists:** C0 (16 deterministic capabilities) executes from Desktop via `submit-task`; C1 reasoning path in Desktop throws on undeclared `REPO_ROOT` (INFERRED); C3 routed_not_executed + explicit frontier act (reasoning only); local-native patch lane (`ain-delegate.sh local-native`, qwen3-coder:30b, NPA1 admission, verifier, candidate commit) is CLI ONLY — `jarvis:run-work-unit` exposed in preload, called by NO renderer code; canonical v2 confirm-execute runs providers over an evidence sandbox — no patch path from Desktop; JOP-04 RB-6 embargo ACTIVE (Condition B stands: `submit-task` executes a routed C0 without separately constituted invocation authority)
- **Owning programme:** JARVIS-ROUTING-INTELLIGENCE-01 (lanes) · JARVIS-WORK-UNIT-01 (W0.v2) · JOP-04 (RB-6 / invocation authority) · provider-execution
- **Standing:** C0 LIVE-unobserved · C1 BROKEN (INFERRED) · local-native BUILT+UNWIRED · embargo ACTIVE
- **Founder-facing today:** C0 and reasoning only; no patch from the app
- **Defects (recorded, ⛔ not repaired):** C1 `REPO_ROOT` (D-07); local-native labelled read-only while requiring `repo.write:worktree`; RB-6 Condition A repair not visible on this branch (`router.mjs:33` still confers C0; `main.js:1148` executes) — location UNVERIFIED; `ollama-direct` refused on the legacy run-provider path
- **Authority needed:** C1 repair (owner per D-07) · RB-6B closure or an explicit founder ruling that P5 stays plan-only until then (docket OE-3) · a governed act wiring `runWorkUnit` with the write-scope label corrected
- **Prerequisite:** OE-3 ruling; C1 repair; label repair
- **Falsifier:** from the app, an ordinary-language ask yields a candidate commit in a claimed worktree with verifier evidence, under a visible one-time authority — or is refused with the reason named
- **Exact next lawful act:** founder rules OE-3; owning programmes repair C1 + label; B6 wires plan-only first

### R-16 · Voice activation: speak to JARVIS (push-to-talk or wake word), hear it answer — sovereign, local, never a cloud provider in the loop

- **Ladder:** BUILT ❌ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** JARVIS desktop: NONE (1 grep hit is a placeholder string; no mic permission handler; no audio pipeline). MAIA: local Faster-Whisper STT in production (`maia-whisper`, Docker on minisforum — production, NOT PROBED by Desktop law); whisper.cpp local server scripts for the Mac Studio (`scripts/start-whisper.sh`, port 8080, `ggml-base.en.bin`); local Kokoro TTS via `lib/tts/ttsRouter.ts` (openai/pplex/sesame NOT qualified); `app/api/voice/openai-tts` still imports the OpenAI SDK (guarded by the router; noted, not this lane's); voice non-degradation gate (`__tests__/voice-non-degradation.test.ts`) governs MAIA's mind, not JARVIS
- **Owning programme:** NONE — no JARVIS voice programme exists (docket OE-1)
- **Standing:** REQUIRES NEW CAPABILITY, composable over existing local STT/TTS
- **Founder-facing today:** no
- **Defects (recorded, ⛔ not repaired):** none — absence. Design hazards to rule before any build: wake-word = always-listening microphone (a consent/containment question under the Oath even for the founder's own machine); the Mac Studio whisper.cpp path exists but its liveness is UNOBSERVED; Electron needs a `setPermissionRequestHandler` for media (currently absent) — a preload/main change under the five-question law
- **Authority needed:** founder opens a child lane (proposed `JARVIS-VOICE-DOORWAY-01`) ruling: push-to-talk first vs wake word; STT = local whisper.cpp on the Mac Studio (never production whisper); TTS = Kokoro local; transcript → the same O1 intent seam as typed input (one mind, two capture paths — the MAIA convergence law applied to JARVIS)
- **Prerequisite:** R-03 (O1 wired) — voice without an intent seam is a microphone attached to a form
- **Falsifier:** spoken and typed utterances reach `compileIntent` as the same object; no audio leaves the machine (network guard: only 127.0.0.1); microphone indicator visible whenever capture is open; wake word OFF by default
- **Exact next lawful act:** founder rules OE-1 (open the lane, choose push-to-talk vs wake word) — sequenced after B6

### R-17 · External state: GitHub PRs/CI, connectors (mail, calendar, drive) visible or usable through JARVIS

- **Ladder:** BUILT ❌ · WIRED ❌ · LIVE ❌ · USABLE ❌ · WITNESSED ❌
- **What exists:** zero GitHub reads in `jarvis-desktop/src` or `scripts/builder`; JOP-04 forbids all GitHub writes; MCP servers exist unregistered (no `.mcp.json`); `lib/mcp` client layer declared-on with inert transports and zero consumers (MCP census); `lib/email` + `lib/gmail` exist in MAIA runtime with no JARVIS path
- **Owning programme:** JARVIS-SOVEREIGN-ACTION-SUBSTRATE-01 (LANE NOT OPENED) · JOP-04
- **Standing:** ABSENT in JARVIS; REQUIRES CONNECTOR + governed lane
- **Founder-facing today:** no
- **Defects (recorded, ⛔ not repaired):** MCP integrations default ON with no working transport (absence of consequence, not of authority)
- **Authority needed:** founder opens SOVEREIGN-ACTION-SUBSTRATE-01 with its containment fork answered first (the existing wire into MAIA cognition)
- **Prerequisite:** outside this programme; read-only GitHub status is the smallest lawful increment (docket OE-4)
- **Falsifier:** a PR/CI row names the API call and time; no write capability appears while JOP-04 holds
- **Exact next lawful act:** founder rules OE-4 (read-only GitHub instrument in B3) — connectors stay REQUIRES CONNECTOR

## 3 · Acceptance gate (founder) → falsifiable rows

| Gate | Holds when | Rows |
|---|---|---|
| orientation | Today answers *what matters · what is happening · what needs me* across programmes from a deterministic projection with `population.complete === true` | R-02, R-11 |
| work | an ordinary-language ask becomes a plan the founder can authorize with one governed Yes (and decline with a governed No), and a bounded patch lands in a worktree from the app | R-03, R-04, R-05, R-15 |
| continuity | quit, return next day, be shown where you were without typing | R-08 |
| artifacts | every result is listed, attributed and revealable | R-07 |
| graph | zero uncited edges on live data | R-09 |
| monitor | every row names instrument + time; absent instruments read *not observed*; no score; no cost | R-10 |
| evidence | every value opens to the record that asserts it | R-11 |
| failure | a broken lane says it is broken in plain words; no false calm, no false alarm | R-12 |
| reliability | offline · restart · crash · first-run · rebind each walked on the installed build | R-01, R-13 |
| sustained use | the founder runs a real week of Soullab/AIN/MAIA work in it and the walk record says so | all; founder witness only — ⛔ never reported established by a machine |

## 4 · Containment

P0 changed no file outside `docs/programme/` and `CLAUDE.md`. No runtime, prototype, IPC, projector, probe, production, routing, authority, merge or deploy law was touched. Every INFERRED claim above (C1 ReferenceError; installed-build age) is marked as such and is owed a runtime witness on the Mac Studio, which this container cannot perform.
