# Storage Classification Policy

**Status**: policy, adopted 2026-09-04 after the Mac Studio disk lane
**Diagnostics**: `scripts/disk-deep-scan.sh`, `scripts/disk-census.sh` (both read-only)
**Reclamation**: `scripts/ain-worktree-claim.sh` (`list`, `gc`, `gc --caches`)

## The principle

> Do not optimize according to pathname size. Classify storage by **custody**,
> **regenerability**, **ownership**, and **required access latency**.

That yields three distinct operations instead of one dangerous "disk cleanup"
bucket:

1. **Reclaim** what can be regenerated.
2. **Archive** what must survive but does not need NVMe residence.
3. **Leave** managed runtime state where its owner expects it.

Collapsing these is how a cleanup session deletes something irreplaceable while
the actual consumer goes unmeasured.

## Why this exists

The 2026-09-04 lane ran through several cycles of cutting caches before anything
was measured end-to-end. The census, when it finally ran, found the pressure was
never cache growth: **272 `node_modules` directories totalling ~35.7 GB** plus
~11.5 GB of `.next` output, against 4.8 GiB free, spread across checkout families
no reclamation authority reached. Every earlier cut was safe and none of them
addressed the cause.

Measure before cutting. A guess that sounds mechanical is still a guess — the
first estimate in that lane was 15–20 GB of worktree bloat; the real figure was
4.9 GB.

## Classification

### Keep internal — managed runtime state

Active MAIA repositories and worktrees · databases · Docker and runtime state ·
Claude runtime/VM bundle · Node and global CLI tooling (`~/.nvm/versions/*/lib/node_modules`)
· App Sandbox containers (`~/Library/Containers`, `~/Library/Group Containers`) ·
active application-support state.

Sandbox containers must not be symlinked out: it breaks TCC and container
identity, and sandboxed apps may refuse to launch or silently recreate the
directory.

### Reclaim — regenerable, no custody weight

`node_modules` in checkouts not actively building (`npm i` restores) · `.next`,
`.turbo`, `target`, `dist` · Xcode `DerivedData` · `iOS DeviceSupport`
(re-downloads on device attach) · unavailable simulators (`xcrun simctl delete
unavailable`) · Docker build cache (`docker builder prune -af`).

**Not** `~/.nvm/versions/*/lib/node_modules` — installed tooling, not project
dependencies; a project-level `npm i` will not restore it.

### Archive — must survive, tolerates latency

Original media and recordings · completed presentations and demos · historical
evidence bundles · retired project archives · old exports · device backups
(`MobileSync`), *only* to a permanently attached volume.

### Never on a cleanup pass

Rollback images and tags (`maia-sovereign:current` / `:previous` / `:<sha>` —
`docker image prune -a` destroys rollback capability; see `scripts/deploy-tag.sh`)
· Docker volumes · dirty worktrees and any tree holding unpushed commits ·
`Downloads` and personal files · `/System`, `/private`, `/opt`.

## Traps measured in this lane

- **Delayed reclamation.** Deletion and `df` movement are not simultaneous.
  21 GB of Docker build cache and 14 GB of `iOS DeviceSupport` each moved `df` by
  roughly 1 GiB at the time; the Docker space appeared later without further
  action. The cleanest instance: free space rose 11 → 15 GiB across an interval in
  which **no deletion succeeded at all** — a `du` that errored on missing paths and
  an `rm` that removed nothing. The blocks were from an earlier `.next` cut,
  surfacing later. Run `sync; sleep 10; df -h /System/Volumes/Data` before
  concluding a cut failed — otherwise the lag drives escalation to riskier cuts
  that were never needed.
- **Clone extents, and why `du` cannot see them.** APFS clones (Finder copies,
  `cp -c`) share copy-on-write extents, and **`du` counts shared extents against
  every file that references them**. So `du` cannot distinguish three distinct
  2.65 GB files from three clones of one — both report ~8 GB. Summing sizes to
  "prove" files are distinct is invalid reasoning.
  Measured 2026-09-11: the Messages `TemporaryItems` tree measured ~10 GB by
  `du`, containing three same-named 2.65 GB movie copies. Clearing the entire
  tree returned **~1 GiB**. The `du` figure was an upper bound, not a prediction.
  **Treat every `du` total as a ceiling on reclaimable space, never an estimate**
  — especially before committing to an expensive operation (a long archive, an
  export-and-verify pass) justified by the size it reports. Only deletion
  measures unique occupancy. This is a *different* mechanism from delayed
  reclamation, though the symptom matches.
- **Container-wide `df`.** `df` on `/System/Volumes/Data` reports `Size` as the
  whole APFS container but `Used` as that volume's share, so used + available need
  not equal size. A large gap points at sibling volumes, purgeable space, or
  snapshots — not at any directory `du` can see.
- **`du -sh -d1` is invalid.** `-s` and `-d` are mutually exclusive on both GNU
  and BSD `du`. Use `du -h -d1`.
- **Messages.** `~/Library/Messages` is a managed SQLite store plus
  `Attachments/`. Hand-moving files corrupts the index and usually does not return
  the space. Export originals, then delete through Messages or Storage Management.
- **`MobileSync` mount discipline.** If externalized: no mounted backup volume, no
  device backup or restore. A sync with the drive absent silently recreates a local
  `Backup` directory and splits the set. Requires Full Disk Access for whatever
  performs the move.

## Recurrence

Reclamation authority currently covers `~/.claude/worktrees` only, via
`scripts/ain-worktree-claim.sh`. Ad-hoc checkout families accumulate ~2 GB per
tree with nothing reclaiming them: `~/MAIA-SOVEREIGN-worktrees/`, `~/maia-wt-*`,
`~/wt-*`, `~/maia-witness/*`, `~/OpenMAIC`.

Named follow-up — **Checkout Lifecycle GC**: extend the worktree reclamation model
to discover approved checkout roots, classify active/dirty/protected trees, and
reclaim only regenerable artifacts from inactive ones — never source, and never
the checkout itself, without separate authority.

### Synchronization is not custody

A synchronized copy is not an independent backup when the same mechanism that
creates or maintains the copy can also propagate deletion, corruption, or
replacement.

**Rule: no synchronized or mirrored copy may satisfy a custody requirement by
itself.**

Before removing the last independently controlled local copy of durable data:

1. Create an independent copy on a **separately controlled storage substrate**.
2. Verify the copy is complete using an appropriate integrity witness — file
   count, hashes, manifest equality, playback/readability, or equivalent.
3. Only after verification may synchronization be disabled, local storage
   reclaimed, or the original removed.

Applies to cloud-synchronized application data, mirrored working directories,
temporary git checkouts, and any replica whose lifecycle stays coupled to its
source. **Synchronized ≠ backed up. Mirrored ≠ independently recoverable.**

Worked example — Voice Memos (2026-09-11). iCloud sync makes recordings appear
on every device, and permanently deleting one removes it everywhere; no
optimize-and-evict path exists, so the only way to stop paying local storage is
to leave the sync. The ordering is therefore load-bearing, because disabling
sync can itself prompt removal of the local copies:

```
export → verify independent custody → disable sync → reclaim local
```

Step 2 is the analogue of SHA equality: "the export appeared to work" is the
same claim as "Everything up-to-date", and neither is proof. Count the exported
files against the app's own count and spot-check readability on the oldest.
Skipping it makes the cleanup the event that tests whether synchronization was
a backup.

Messages is the contrasting case: an optimize/offload path does exist, so the
correct operation is to let macOS evict local attachments rather than to export
and delete. Deleting a conversation with Messages in iCloud enabled propagates
to every synced device.

### Custody classes: "a git checkout" is not one thing

Three classes, each with a different failure mode:

1. **Normal worktrees** — protected or reclaimable by git state plus explicit
   lifecycle rules. The classifier in `scripts/ain-worktree-claim.sh` covers these.
2. **External-drive checkouts** (e.g. `/Volumes/T7 Shield/...`) — everything above,
   *plus* dependence on the device being mounted. Work here is invisible to any
   sweep run while the drive is detached, and unreachable at the moment it is
   needed. Evidence and artifacts belonging to such a checkout should be written to
   internal disk so they survive the volume's lifecycle independently.
3. **`/private/tmp` checkouts** — subject to an **external deletion authority**:
   macOS purges that directory on a schedule, so anything unique there is under a
   countdown nothing in this repo controls. Treat as already expiring until proven
   backed. On 2026-09-04 the `node_modules` under two such checkouts were found
   already absent, with no one having deleted them — consistent with macOS purging
   by access time, though not by itself decisive. The check that settles it is
   whether the checkout and its object store survive:
   `ls -ld <checkout>` and `git -C <checkout> rev-parse HEAD`. If the objects are
   gone, the backup ref pushed beforehand is the only extant copy — which is the
   case this class exists to prevent.

### The custody check is two questions

Neither substitutes for the other:

```bash
git -C <checkout> log --oneline HEAD --not --remotes   # commits on no remote
git -C <checkout> status --short                       # modified + staged + untracked
```

Both silent means no git-visible unique work. Either producing output is a custody
issue. `status --short` omits ignored files by design, which is correct here — the
question is unique work needing custody, not whether regenerable build artifacts
exist. Deleting such a checkout's `node_modules` stays safe either way; regenerable
material was never the custody question.

### Preserve first, then classify

`HEAD --not --remotes` proves *these SHAs* are on no remote. It does not prove *this
work* is unbacked — a cherry-pick or rebase reproduces the change under a new SHA.
So push to a backup ref first (cheap, reversible, no commit and therefore no
pre-commit hook — the `chore/` prefix satisfies the pre-push allowlist), and only
then determine whether the work is unique.

Matching commit subjects are a **lead, not proof**: a rebase preserves the subject
while changing the patch, and two different implementations can share one. Compare
patches:

```bash
git show --pretty=email --patch <sha> | git patch-id --stable
```

- **Same patch-id elsewhere** → already represented; the backup ref is sufficient
  custody and the checkout is stale infrastructure.
- **Different or no counterpart** → genuine work needing a real lane and review
  path. A backup ref preserves it; it does not constitute acceptance or integration.

**Directory provenance is not work provenance.** Proven 2026-09-04: a
`/private/tmp` checkout named for database bootstrap scratch held two unbacked
`feat(ws2-05h)` commits implementing a member invocation boundary — member-facing
consent-surface work sitting in a path macOS purges on a schedule.

### Design constraint: reclaimable is not disposable

The current classifier answers exactly one question — *could this be reconstructed
without loss?* — and that is the right question for custody. It is **not** the
question *is this checkout still wanted?*

The two diverge at a predictable moment. A tree holding unbacked work is protected
because its work is unique; push that work and the same tree becomes `dirty=0,
unpushed=0`, which classifies as `SAFE` and eligible for reclamation. The
protection dissolves at the instant custody completes — correct behavior, and the
whole point of the design, but it means securing work also removes the thing that
was keeping the checkout around.

Checkout Lifecycle GC must therefore carry **liveness as a dimension distinct from
custody safety**. Custody safety says reclamation would lose nothing; liveness says
someone is still working here. Reclaiming on custody safety alone destroys
convenience the person was relying on, silently, at the moment they did the right
thing.

### A census is only as wide as the root it was pointed at

Measured 2026-09-28. This repository has **two worktree roots**, and they are
different directories:

- `~/.claude/worktrees` — the home root, which `scripts/ain-worktree-claim.sh`
  reads and which the 2026-09-22/23 workstation relief run censused
- `~/MAIA-SOVEREIGN/.claude/worktrees` — a **repo-local root**, holding 51
  worktrees totalling 21 GB

The relief run reported `0 REMOVABLE left internally` while those 21 GB sat
inside the repository. That report was not wrong; it was pointed at the other
root. The standing note *do not run Act B again* therefore does not cover the
repo-local root, because no act ever reached it.

**The rule this establishes:** a storage census must state which roots it
enumerated, and `0 REMOVABLE` means *nothing removable under the roots
examined* — never *nothing removable on the machine*. An instrument that does
not name its own scope will eventually be read as having measured everything.

### `dirty > 0` is not by itself a custody claim

The same census found 40 of 51 trees at exactly `dirty=1`. Aggregating every
porcelain entry across all trees (`status --porcelain | awk '{print $1,$2}' |
sort | uniq -c`) identified the cause immediately:

| entry | trees | what it is |
|---|---|---|
| `?? .jarvis/` | 11 | JARVIS scratch directory |
| `?? tsx-501/` | 9 | tsx compile cache, uid-suffixed |
| `?? jest_dx/` | 5 | jest cache |
| `?? maia-jest-cache/` | 3 | jest cache |

Twenty-eight trees were dirty solely because a tool wrote a cache directory into
the checkout. Discounting those four paths and re-classifying moved 18 trees
(≈7.7 GB by `du`) from HOLD to SAFE, including two at 1.2 GB and 749 MB that a
naive `dirty > 0` rule would have preserved indefinitely.

**Two boundaries this must not be allowed to cross.** The discount list is
enumerated explicitly, never a pattern like `?? *cache*`: a glob would sooner or
later absorb a real directory whose name happens to contain the word. And the
discount applies only to *untracked* entries — a modified or deleted tracked
file is working state regardless of what it is named.

**The act revalidates; it does not trust the census.** Removal recomputed
`unpushed` and residual-dirty per tree immediately before acting, and removed
only what still classified SAFE at that moment. `git worktree remove --force` is
licensed by that revalidation one line earlier — not by convenience. `--force`
is required because SAFE trees still hold the discounted cache directories, and
that is precisely why the flag must never be reached for without the recompute.

Removal goes through `git worktree remove` from the main checkout so the
`.git/worktrees/` admin entries go with each tree. A bare `rm -rf` leaves the
registry asserting the existence of trees that are gone — the failure mode that
silently "succeeded" during the 2026-09-04 `PROJECT_DIR` defect.

**Outcome, recorded honestly:** 18 of 51 trees removed, 0 refused, inodes
7.5M → 7.2M — so the trees are demonstrably gone — while `df` still read 25 GiB
free immediately afterward. Either APFS delayed block reclamation (documented
above) or the removed trees shared extents with the main checkout, which would
mean the 7.7 GB `du` figure was again counting clones. Both are consistent with
the evidence in hand; which one applies was not established.

### The loss was never in the managed roots

Measured 2026-10-01, under a 100%-full disk that was failing writes
(`zsh: can't create temp file for here document: no space left on device`).

Two weeks of reclamation targeted `~/.claude/worktrees` and
`~/MAIA-SOVEREIGN/.claude/worktrees`, because those were the roots the tooling
knew about. Together they held **26 GB**. The disk was 409 GB used.

A `du -h -d1 ~` — started and killed three times before it was allowed to
finish — located the actual mass: roughly **25 ad-hoc full checkouts directly in
`$HOME`**, each carrying its own `node_modules` and `.next`, one per work unit,
never cleaned up. Three created in the preceding 48 hours held 28 GB between
them. `ws-full-experience-r2-20260930` alone was **12 GB against a ~350 MB bare
checkout — 97% regenerable build artifact.**

Stripping `node_modules`, `.next` and `.turbo` from 37 such trees returned
**63 GB in a single pass**, taking free space from 13 GiB to 76 GiB. Nothing was
classified, nothing was pushed, nothing was at risk: the strip touches no source,
no commits and no uncommitted work, so it needs no custody decision at all.

**Three rules follow.**

**Finish the census before optimising the sweep.** Every round of this lane
produced a smaller return than the last, and each one was read as *the tier is
exhausted* rather than *we are measuring the wrong tier*. The scan that found the
answer takes minutes and was abandoned three times for being slow.

**Count what you have located against what `df` reports used.** Summing the
measured directories came to ~240 GB against 409 GB used. That 170 GB gap was
visible for days and was the single most informative number available; it was
noticed late. A reclamation plan that does not reconcile against total used space
is optimising inside whatever fraction it happens to see.

**Separate the cache question from the custody question.** Custody
classification is expensive — it needs `unpushed`, `dirty`, a backup push, SHA
verification. Cache stripping needs none of it, because `node_modules` and
`.next` are regenerable by definition. Running the cheap operation across every
checkout first, and reserving classification for checkouts actually proposed for
deletion, would have returned 63 GB on day one.

Additional roots found the same day, neither known to any instrument:
`~/.jarvis` (22 GB) and `~/.worktrees` (16 GB) — a fourth and fifth worktree
root, further instances of the scope defect recorded above.
