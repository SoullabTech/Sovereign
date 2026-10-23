# JARVIS Resource Custodian — Specification

**Status**: Proposal (Cat 1 — preserved direction, not authorized to build)
**Date**: 2026-10-23
**Origin**: Derived from a measured 48-hour storage incident on the Mac Studio
(2026-10-22 → 2026-10-23), in which internal free space moved
17 → 106 → 17 → 81 GiB across roughly a dozen manual interventions.

Every requirement below is grounded in a failure that actually occurred during
that incident. Nothing here is speculative hardening.

---

## 1. Why this exists

The existing tooling is sound but uncoordinated:

| Script | Does | Missing |
|---|---|---|
| `disk-census.sh` / `disk-deep-scan.sh` / `disk-data-inventory.sh` | Read-only measurement | Nobody runs them on a schedule |
| `ain-worktree-claim.sh` | Reclaims `~/.claude/worktrees` | Covers one root of at least seven |
| `storage-health-monitor.sh` | Weekly cleanup | Crude; see §7 |

The gap is not measurement and not reclamation. It is **custody**: no component
owns the question *"is this machine able to do the work asked of it, and if not,
what is the smallest honest intervention?"*

---

## 2. The governing distinction

**Stock vs flow.** Yesterday's relocation of 60 GB to external storage solved a
*stock* problem permanently — those directories will never fill the internal
disk again. It did nothing about *flow*: new checkouts and integration copies
appeared at roughly 16 GB/day (three ASTRO integration trees at 5–6 GB each, in
one day).

A custodian that only reclaims is a custodian that loses. The primary metric is
not free space; it is **net rate** — bytes created minus bytes reclaimed, per day,
per root. Free space is a lagging indicator of that rate.

---

## 3. Hard-won measurement rules

These are the errors that cost the most time. A custodian that does not encode
them will reproduce them.

### 3.1 `df` alone is a lie after any deletion
APFS local snapshots pin deleted blocks. Three times in one day a cleanup
appeared to have failed when it had worked — the space was held by an hourly
Time Machine snapshot. One thin returned 20 GiB; another returned 60 GB.

> **Rule**: every reclamation is `delete → sync → thin snapshots → re-measure`.
> Never report a reclamation result from a `df` taken before the thin.

### 3.2 Swap is disk
Swap grew 0.26 → 13 → 40 GB in a single day, consuming that much internal disk.
It was simultaneously the "missing" space and the memory-pressure signal.

> **Rule**: report free space as `df_free` and `swap_allocated` separately, and
> never attribute swap-consumed space to build output.
>
> **Correction on record**: swap *can* shrink without a restart when pressure
> drops (observed 40,960M → 22,528M after a runaway `coreaudiod` was killed).
> A custodian must not assert that only a reboot reclaims it.

### 3.3 A census is only as wide as its roots
The single largest find of the week — a 25 GB seventh checkout root — was
invisible because the scan enumerated six. Known roots as of 2026-10-23:
`~/MAIA-SOVEREIGN-worktrees`, `~/maia-wt-*`, `~/wt-*`, `~/maia-witness`,
`~/OpenMAIC`, `~/.claude/worktrees`, `~/.jarvis-worktrees`, plus ad-hoc trees on
`/Volumes/T7 Shield`.

> **Rule**: discover roots (`find ~ -maxdepth 4 -name .git -type f` finds
> worktrees anywhere) rather than reading a hardcoded list. Every report states
> which roots it enumerated. `0 RECLAIMABLE` means *nothing reclaimable under
> the roots examined* — never *nothing reclaimable on the machine*.

### 3.4 Name-matching is not classification
A scan for directories named `webpack` returned 161 hits. Only 48 were caches.
The other 113 were the installed `webpack` package, vendored library internals,
and — most dangerously — fourteen inside signed `MAIA Desktop.app` bundles,
where deletion breaks the code signature.

> **Rule**: classify by full path shape (`*/.next/cache/webpack`), never by
> basename. Re-verify each path's shape immediately before acting on it, not
> only when the list was built.
>
> **Never touch**: anything inside a `.app` bundle; `node_modules` inside an
> application's own install directory (this rule was written after deleting the
> VS Code and Cursor extension trees, which had to be reinstalled);
> `~/.nvm/versions/*/lib/node_modules`.

### 3.5 Measure a settled system
Counts from the same file read 36, then 48, then 82 — because two Ctrl-C'd
`find` processes were still appending to it, and two copies of a "stability
check" were racing each other.

> **Rule**: before acting on an inventory, produce it twice and compare. An
> inventory that does not reproduce is not an inventory. Write to a timestamped
> path; never reuse a scratch filename across runs.

### 3.6 Load average is not CPU demand
A load of 18–34 looked like saturation. The process list showed no build
activity at all — it was `rsync`, `backupd` and `du` blocked on one USB bus.

> **Rule**: pair load with actual CPU consumers before concluding saturation.

---

## 4. Custody before reclamation

Nothing is reclaimed until its custody is established. This is non-negotiable
and predates this spec (`STORAGE_CLASSIFICATION_POLICY.md`).

```
unpushed = git rev-list --count HEAD --not --remotes
dirty    = git status --porcelain | wc -l
```

`unpushed = 0 AND dirty = 0` is the only safe classification. Neither check
substitutes for the other. A tree that cannot push its own commits (hook policy
absent at that revision) is rescued by fetching into a governed clone and
pushing from there — not by `--no-verify`, which is prohibited.

During the incident this protected 24 commits across 12 trees that would
otherwise have been swept.

---

## 5. Tiered response

The custodian never takes a destructive action autonomously. It escalates.

| Tier | Trigger | Action | Consent |
|---|---|---|---|
| **Observe** | always | census, rate tracking, trend | none needed |
| **Report** | free < 60 GiB (deploy gate) | named finding + proposed cut list | none needed |
| **Reclaim-safe** | free < 35 GiB (build threshold) | thin snapshots; remove `.next/cache` under verified-clean trees | standing, revocable |
| **Propose** | free < 20 GiB | enumerated cut list with custody status per entry | explicit, per-run |
| **Escalate** | reclamation rate < creation rate for 3 consecutive days | hardware/architecture finding (see §6) | explicit |

Tier boundaries are the real thresholds already in the codebase:
`MIN_FREE_DISK_GB=60` in `pre-deploy-gate.sh`, and the 35 GiB build floor.

Every tier writes an auditable record: what was measured, which roots, what was
proposed, what the human decided, what was actually removed. The incident's
evidence files (`t7-cut.txt`, per-path manifests written *before* deletion) are
the model.

---

## 6. The upgrade signal

The user's framing — *"alerting when it is time to upgrade hardware"* — is a
real and distinct output, not a footnote.

A custodian can distinguish three states that look identical from inside a
disk-space emergency:

1. **Recoverable waste** — reclaimable artifacts exist; sweep and continue.
2. **Mislocated stock** — content on the wrong volume; relocate (yesterday's
   60 GB move, which is permanent).
3. **Structural insufficiency** — net rate is positive, nothing reclaimable
   remains, and every sweep buys hours. *This is a hardware finding.*

State 3 is reported with evidence, not vibes: net GB/day over a trailing window,
reclaimable bytes remaining, interventions per week, and hours of engineering
time spent on storage. Yesterday that figure was roughly a full working day.

The same logic applies to software: a dependency set installed 272 times across
checkouts (~35.7 GB measured 2026-09-04) is an architecture finding about
checkout strategy, not a cleanup task.

---

## 7. Corrections to `storage-health-monitor.sh`

The existing weekly agent (`com.soullab.maia.storage.cleanup`, Sundays 08:00)
needs two fixes before it is extended:

1. **`sudo rm -rf /tmp/*`** — wipes sockets and lock files belonging to
   PostgreSQL, Docker, and any other running process. Must be narrowed to a
   namespaced prefix.
2. **Unconditional `.next` deletion under `~/MAIA-SOVEREIGN`** — no custody check,
   no active-build check. It would delete the cache of a build in flight.

Also unresolved: four `find` processes were killed by SIGTERM during the
incident, from an unidentified source. `life.soullab.jarvis.security-guardian`
is the open suspect. A custodian that scans large volumes cannot coexist with an
unidentified process reaper — this must be identified before scheduled scanning
is trusted.

---

## 8. Sovereignty constraints

This is infrastructure for a system governed by the MAIA Oath, and the same
constraints apply to a custodian acting on a person's machine:

- **No stealth reclamation.** Every deletion is witnessed and recorded. A
  custodian that quietly frees space teaches the human to stop looking — which
  is how 272 `node_modules` accumulated unnoticed.
- **Agency over convenience.** The custodian proposes; the human disposes. It
  never widens its own authority because the situation is urgent.
- **Honest reporting over reassurance.** "0 reclaimable under roots examined" is
  the truthful form. A custodian that reports a clean bill of health from a
  partial scan is worse than no custodian.
- **Growth-obligation check** (per `RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04`):
  this capability increases autonomous authority over the user's filesystem.
  The matching increase in provenance is §5's audit record; the matching
  increase in restraint is §4's custody gate; the matching increase in
  transparency is §3.3's requirement that every report name its own scope.

---

## 9. Build order

1. `jarvis-resource-census` — scheduled read-only census; discovers roots;
   records net rate. **No destructive capability whatsoever.** Run for two weeks
   to establish a baseline before anything else is built.
2. Fix `storage-health-monitor.sh` §7 defects.
3. Identify the SIGTERM source.
4. `jarvis-resource-report` — tiered findings against §5, proposal only.
5. **Checkout Lifecycle GC** — the already-named follow-up: extend
   `ain-worktree-claim.sh`'s reclamation model to discovered roots, classify
   active/dirty/protected, reclaim only regenerable artifacts from inactive
   trees, never source and never the checkout itself without separate authority.
6. Reclaim-safe tier, standing consent, revocable.

Steps 1–3 are the whole value for months. Step 5 is the structural fix. Step 6
is the only step that deletes anything on a schedule, and it comes last.

---

## 10. What this does not authorize

This document does not authorize building any of it. It records a direction and
the evidence behind it. Implementation requires a separate directive, and §9's
ordering is part of the proposal, not a suggestion — a custodian that gains
destructive capability before it has an established baseline is exactly the
failure mode §3 catalogues.
