# JARVIS-FOUNDER-WORKSPACE-01 — B3 · Monitor Instrument Registry + Machine-Readable Census Outputs (evidence)

**Authorized by:** founder continuation act 2026-09-23 (B3 · B4 · V1 in parallel) under the P0 adjudication (FD-4 YES additive · OE-4 read-only · D-04 local-first · D-05 no cost). **Against:** canonical `840194ba` · lane tip after B1+B2 `44e1a387`. **Standing: B3 DELIVERED · ⛔ STOP.**

## 1 · What landed

| File | Role |
|---|---|
| `scripts/builder/founder-workspace/instrument-registry.mjs` | `scanShell` (comment- and prose-safe static read-only scan) · `admit` (proof or refusal; content-hash pin) · `DECLARED` (9 entries) · `REFUSED_BY_NAME` (5 scripts) · `observe` / `observeAll` (`instrument-observation.v1`; re-verifies the pin; unavailable never calm) · `readObservationHistory` + `freshnessOf` (historical / stale) |
| `scripts/builder/founder-workspace/observe-instruments.mjs` | CLI: observe every admitted local instrument; `--write` stores under `$AIN_HOME/observations/<id>/` (never under docs/) |
| `scripts/builder/founder-workspace/adapters.mjs` (extended) | `adaptObservations` → monitor rows; `composeViewModel` accepts `registry · observations · observation_history` |
| `scripts/ops/workstation-storage-census.sh` · `scripts/ops/worktree-census.sh` | **FD-4:** optional `CENSUS_JSON=<path>` output mode (JSONL of every `hdr()`/`row()` observation with a meta line · JSON array of the TSV rows). Default behaviour unchanged; output only; no cleanup, deletion, sudo, new probe or production access |
| `tests/constitutional/founder-workspace/{b3-matrix,b3-candidates}.mjs` | MR-1…MR-7 · FD-4 · RL-4 · DC-8 with defeat candidates DC-M1…DC-M6 |

## 2 · Admission result (registry built against this checkout)

| Entry | Kind | Proof | Permitted writes named by the scan |
|---|---|---|---|
| `git.checkout` · `git.status` | command | read-only git allowlist | — |
| `ollama.tags` | loopback GET | `http://127.0.0.1:11434/api/tags` | — |
| `session.governor.status` | presence-gated CLI | B2 RL-5 witness; never spawned when `$AIN/sessions` is absent | — |
| `ops.workstation-storage-census` | script | static scan PASS, sha256 pinned | `mkdir`/`tee`/`> >(tee …)` to `CENSUS_OUT`/`CENSUS_JSON` · `> $out`/`rm $out` (mktemp scratch) · `kill $pid` of its own bounded child |
| `ops.worktree-census` | script | static scan PASS, sha256 pinned; `CENSUS_FETCH` pinned `0` | `> $TSV`/`> $RAW`/`rm` (mktemp scratch) · `mkdir`/`tee` to `CENSUS_OUT`/`CENSUS_JSON` · `git fetch` gated by `CENSUS_FETCH` |
| `voice.whisper-server` | script | static scan PASS (`WHISPER_HOST` proven loopback in the script) | curl loopback GET ×2 |
| `github.read` | not-instrumented | requires OE-4 token custody act | — |
| `production.minisforum` | not-instrumented | D-04 boundary row, never a probe | — |

**Refused by name, every one present and failing the scan:** `storage-health-monitor.sh` (13 findings: `mkdir`, `tee $HEALTH_LOG`, `rm ~/Library/…/DerivedData/*` …) · `health-check.sh` (26: production host reach, `mkdir`, `curl` …) · `backup-postgres.sh` (6: `docker exec`, production host …) · `verify-deploy-provenance.sh` (12: `mkdir`, `rm $ROOT`, `> $REPO` — a self-test, not an observation) · `smoke-voice.sh` (1: curl to production).

## 3 · Matrix (this container)

MR-1 census + whisper admit on scan; every refused script fails; a mutating script under a census-shaped entry is still refused · **MR-2 a script edited after admission is REFUSED at observation and never run** · MR-3 `ssh minisforum`, a non-loopback URL and a remote host are refused; the production boundary is a first-class `not_instrumented` row · MR-4 a throwing probe observes `unavailable · freshness none`, adapted as `failed`, never good · MR-5 registry carries no score/aggregate/cost key (58 keys scanned) · MR-6/MR-7 every observation names instrument · time · proof · state; not-instrumented rows say what they require · **FD-4 + RL-4 real runs on this host, bounded:** `worktree-census` default output unchanged with no JSON produced absent `CENSUS_JSON`; with it → JSON array (same columns as the TSV); `workstation-storage-census` → 27 JSON lines (meta · section · row), 0 unreadable; **repository snapshot byte-identical (size + mtime) around both runs** · history: an unreadable stored observation is surfaced; a 3-day-old observation with `stale_after_s=300` is `stale`; a historical good observation renders *observed then · present state unknown* (DC-8) · AL-5 composed view-model with registry rows validates live (16 monitor rows). **DC-M1…DC-M6 all DEAD** → exit 0. Typecheck strict `checkJs` exit 0.

## 4 · What the scanner is and is not

It is a **static, declaration-checked proof**: every write the script performs must be covered by a declared scratch variable, a declared output-path env, a declared network gate or a declared self-signal, or the script is refused. It strips comments and blanks quoted strings before matching (the C21 lesson: prose and awk programs are not commands), keeps quoted variable references as path tokens, and treats a production-host mention as a refusal only on a line that reaches out. ⚠️ It is **necessary, not sufficient**: the two census scripts additionally carry a **live witness** (RL-4 snapshot) on this Linux host with bounded roots; ⚠️ the Mac Studio run (macOS branches, Docker daemon, real roots) is **UNWITNESSED here** and is the founder's to perform: `CENSUS_JSON=/tmp/x.jsonl scripts/ops/workstation-storage-census.sh` · `CENSUS_JSON=/tmp/x.json scripts/ops/worktree-census.sh`.

## 5 · Routed out, ⛔ not repaired

`session.mjs allRecs()` mkdirs on read (owner: session governor; presence-gated here) · `scripts/stop-whisper.sh` uses `local` outside a function (V0 finding; owner: voice scripts) · no scheduler runs any instrument — `scheduled:false` on every entry is truthful, and a LaunchAgent is an ops act (OE-7 pattern).

## 6 · Not done (§VII hard stop honoured)

No B5 renderer · no IPC · no Desktop mutation · no production probe · no GitHub token · no cost · no scheduler. `jarvis-desktop/src/**` unchanged.
