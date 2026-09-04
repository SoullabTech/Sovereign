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
  action. Run `sync; sleep 10; df -h /System/Volumes/Data` before concluding a cut
  failed — otherwise the lag drives over-cutting.
- **Clone extents.** APFS clones (Finder copies, `cp -c`) share copy-on-write
  extents. N apparent copies of a 2.65 GB file may occupy 2.65 GB in total, and
  deleting N-1 of them frees nothing. Compare `du -sh` per file against
  `du -ch ... | tail -1` before planning around apparent duplication. This is a
  *different* mechanism from delayed reclamation, though the symptom matches.
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
   backed.

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
