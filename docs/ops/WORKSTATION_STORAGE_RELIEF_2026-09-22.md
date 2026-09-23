# Workstation Storage Relief — Mac Studio — 2026-09-22/23

Record of a governed relief act on the development workstation (Mac Studio, 48 GB unified
memory, 494 GB internal). Production (minisforum) untouched throughout. Every act ran from
a founder-authorized script; the instruments are on `scripts/ops/` and are read-only
except the generated act scripts, which refuse without `RECLAIM_AUTHORIZED=1`.

## Presenting condition

| Measure | Start | After relief |
|---|---|---|
| Internal free | 12 GB (98% used) | 56 GB (88% used) |
| Swap used | 17.8 GB of 18.4 | 10.4 GB of 11.3 |
| Compressed memory | 21.4 GB | 14.4 GB |
| System memory free (memory_pressure) | not readable | 58% |

The two symptoms were one fault: macOS grows swap on the internal volume, so a nearly full
disk capped swap and the compressor absorbed the overflow. **Internal free space is a memory
metric on this machine.** That rule goes into the capacity sentinel charter.

## What the census found

- Six `next-server` processes were alive, five of them days old and paged out; they were the
  swap. Stopping all six freed ~7 GB swap and ~5 GB RAM in seconds. **Dev-process liveness**
  (process, worktree, age, RSS, last activity) is a mandatory sentinel metric.
- 308 registered git worktrees across nine root locations, 155 GB on the internal disk. Only
  ~16 carried `node_modules`; the cost was 0.39 GB of plain checkout each. A witness worktree
  costs ~400 MB before anything is built. Structural, not a cleanup item.
- `~/Library` 107 GB: Messages 44 GB, Voice Memos 21 GB, Claude app `vm_bundles` 9.5 GB,
  Chrome 5.7 GB. Personal media is the largest single lever on the machine and is not for
  any script.
- Docker Desktop data and Ollama models (75 GB) were already on the T7 Shield. No network
  volume was mounted; the NAS is not integrated at the filesystem level.

## Instruments (read-only)

- `scripts/ops/workstation-storage-census.sh` — memory, volumes, Docker, models, worktrees,
  build caches, Xcode, Library breakdown, home breakdown. Daemon probes wall-clock bounded
  and fail to UNKNOWN (`docker info` hung on the day).
- `scripts/ops/worktree-census.sh` — every registered worktree classified HOLD / INSPECT /
  PRESERVE / RETAIN / REMOVABLE with total, regenerable and source GB; nested worktrees
  counted once; untracked files send a worktree to INSPECT.
- `scripts/ops/worktree-reclaim-plan.sh` — reads a census TSV, writes PLAN.txt and act
  scripts. Acts revalidate at run time: path exists, HEAD equals the censused commit, tree
  clean, zero commits on no remote, and for removal a refreshed
  `merge-base --is-ancestor` against `origin/clean-main-no-secrets`. Any difference is
  DRIFT: stop by default, `RECLAIM_ON_DRIFT=skip` to continue and report.

## Acts run (founder-authorized, by name)

| Act | Effect | Result |
|---|---|---|
| Kill six dev servers | none on disk | swap 17.8 → 10.5 GB |
| Move `~/verifier-probe-models` to T7, symlink back | 7 GB | done |
| C — preserve | push fast-forward or verified bundle to `/Volumes/T7 Shield/worktree-bundles` | 51 worktrees preserved; 7 branches found diverged from remote, local side bundled, no force push |
| A — regen delete, clean pushed worktrees | 12 worktrees | +16 GB |
| B — `git worktree remove`, clean pushed merged | 38 worktrees | +14.8 GB, no drift |

Post-preservation census (R2): 269 worktrees, 0 REMOVABLE on the internal disk. Whole-worktree
automated relief is **closed**. Remaining in the R2 plan: Act A 7.2 GB (3 clean worktrees);
Act A2 ~18 GB (git-ignored regen dirs inside unclean worktrees; optional); 28 detached, clean,
merged HOLD checkouts (~11 GB) that need a human answer to "was this witness run finished".

## Defects found in the instruments, all repaired the same day

`docker info` could hang the whole census → bounded probes. Main checkout counted its ~60
nested worktrees twice → nearest-enclosing subtraction. `dist` inside `node_modules` counted
twice → one pruning find. Untracked files admitted to REMOVABLE → INSPECT. `git bundle verify`
run outside a repository → `-C`. Diverged remote stopped Act C → push-or-bundle. Act guard did
not pin the censused HEAD → B-GUARD-R1. Path printers split on spaces → fixed.

## Standing and next boundary

- Worktree relief: CLOSED after R2 Act C and Act A. Act B has no internal population. Do not
  run it.
- Next: restart the Studio, start only the ordinary workload, take the five-line memory reading,
  run one normal build, read again. That is the fair test of 48 GB. Diverged branches (7) are a
  lane-owner reconciliation, not urgent.
- Library: separate read-only census, then human decisions (Messages, Voice Memos, Claude
  VM bundles). Not a worktree operation.
- `JARVIS-CAPACITY-SENTINEL-01`: after the workstation is stable. Two monitors (workstation,
  production), observation authority only, GREEN/AMBER/RED/UNKNOWN with UNKNOWN never
  reading as healthy, every probe bounded. Minisforum is production and is not a build worker.
