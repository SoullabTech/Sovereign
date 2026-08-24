# JARVIS Repository Topology Invariant

**Status:** in force
**Established:** 2026-08-24, under JARVIS-00C
**Implementation:** `jarvis-desktop/src/repo-topology.js`
**Proof:** `jarvis-desktop/test/repository-topology-invariant.test.mjs`

---

## The invariant

> JARVIS must distinguish repository, remote, branch, worktree, commit, and
> built artifact. **A filesystem directory is not sufficient repository
> identity.** Before packaging or mutating code, record the worktree and exact
> commit involved. Before declaring a running application fixed, prove the
> running artifact was built from the intended commit.

These identities must never be collapsed into "the repo."

---

## Why a directory is not a repository

The common mental model is:

```
original repo → fork → separate repo
```

That is not the shape JARVIS is actually in. The shape is:

```
                    ONE GIT REPOSITORY
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   MAIA-SOVEREIGN    jarvis-runtime     jarvis-fix
      worktree          worktree          worktree
       branch A          branch B          branch C
       commit X          commit Y          commit Z
```

Linked worktrees **share history and object storage** — `git rev-parse
--git-common-dir` returns the same path for all of them — and each one can hold
**different source**. So every one of these statements can be true at once:

- these are the same repository,
- these are different checkouts,
- these contain different code,
- everything reports "the repo" correctly.

That is the hazard. A developer reads `jarvis-runtime`, fixes a bug, believes
JARVIS is fixed — then packages the app from `jarvis-fix` and ships the old
implementation. Nothing lied. The identities were simply never kept apart.

---

## The eight identities

| Identity | What it answers | Source |
|---|---|---|
| **Repository** | which object store / history is this? | `git rev-parse --git-common-dir` |
| **Operated worktree** | which checkout is JARVIS acting on? | resolved binding (`currentRoot()`) |
| **Operated branch** | which line of development? | `rev-parse --abbrev-ref HEAD` |
| **Operated commit** | exactly what source state is there? | `rev-parse --short HEAD` (+ dirty) |
| **Build-source worktree** | which checkout produced this binary? | build stamp, written at package time |
| **Build-source commit** | its source state at package time? | build stamp |
| **Running artifact SHA** | what does this binary say it is? | build stamp, gated on `app.isPackaged` |
| **Operated repository** | restated on each stored run | run record `topology` |

The last one is not redundancy. A run retrieved a year later must be readable
without the reader knowing which field meant which identity.

---

## The relationship states

`compareBuildToOperated()` never returns a boolean. It returns a named state,
because the remedies differ:

| State | Meaning | Clean? |
|---|---|---|
| `ALIGNED` | built from and operating the same checkout at the same commit | ✅ |
| `DIVERGED_DECLARED` | different checkouts, and a contract says why | ✅ |
| `SAME_WORKTREE_DRIFT` | same checkout, different commit — the build is stale | ❌ |
| `DIVERGED_UNDECLARED` | different checkouts, no contract — **the 2026-08-24 hazard** | ❌ |
| `CROSS_REPOSITORY` | not even the same object store | ❌ |
| `UNKNOWN` | something could not be read | ❌ |

`UNKNOWN` is deliberately unclean. An artifact carrying no build identity
**cannot** be aligned with anything, and optimistically reporting it as fine is
the failure mode this whole discipline exists to prevent.

### Declaring an intentional split

If JARVIS.app is *meant* to be built from a pinned release checkout while
operating a working checkout, that is legitimate — but it must be **declared**,
not assumed. Write it into
`~/Library/Application Support/JARVIS/config.json`:

```json
{
  "version": 1,
  "repo_root": "/Users/soullab/MAIA-SOVEREIGN",
  "topology_contract": "JARVIS.app is packaged from the pinned release checkout at /Users/soullab/jarvis-release by design; the operated substrate is the working checkout."
}
```

It is free text, not a boolean, on purpose: *"yes it's fine"* is not a contract,
and the reason has to survive the person who knew it. A rebind preserves it.

---

## Where the invariant is enforced

**Before packaging** — `npm run stamp` (`jarvis-desktop/scripts/stamp.mjs`)
reads the build worktree's full identity and **refuses to stamp** a source it
cannot identify. It prints the worktree, branch, commit and dirty state, and
announces a dirty build rather than letting it read as a clean SHA. `pack`,
`install:app` and `dist` all run it first.

**At runtime** — `currentTopologyRecord()` in `main.js` compares the shipped
stamp against the resolved substrate on every status read. The System view
renders all eight identities in their own card, below provenance, with the
relationship state and its full detail.

**On every run** — each C1 run record embeds the topology at admission time, so
a run retrieved after a restart still says what it was operating on.

**Before declaring the app fixed** — `npm run witness:packaged verify`
(`scripts/gate-zero-packaged-witness.mjs`) proves the stored run's
`running_artifact_sha` matches the installed application that produced it. A
walk that passes every mechanical condition while the topology is unclean exits
`2` with `MECHANICALLY SATISFIED, TOPOLOGY UNCLEAN` — a distinct verdict,
because the remedy is a decision, not a retry.

---

## What this invariant does *not* say

It does not say worktrees are bad, or that divergence is forbidden. It says
divergence must be **visible and declared**.

It also does not endorse forking. Forking is for maintaining genuinely divergent
source of an external project. For dependencies, the order stays:

```
DEPEND → WRAP → ADAPT THROUGH OUR INTERFACE → (only then) FORK
```

The thing to watch in this architecture is not clone vs. fork. It is
**repo vs. branch vs. worktree vs. running artifact.**
