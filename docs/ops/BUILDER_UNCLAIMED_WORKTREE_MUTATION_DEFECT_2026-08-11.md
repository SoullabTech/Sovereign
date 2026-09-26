# Builder OS defect — unclaimed cross-worktree mutation is invisible

**Date**: 2026-08-11 · **Status**: read-only investigation + proposal. ⛔ **Nothing implemented.**
**Lane**: Builder OS governance. ⛔ Not bundled with JARVIS Desktop feature work.

**Provenance line**
`manual inspection · 2026-08-11 · observer worktree /Users/soullab/MAIA-SOVEREIGN/.claude/worktrees/clever-heyrovsky-784cd6 @ f9a7326f1 (clean, 470 behind origin/clean-main-no-secrets) · instruments read from /Users/soullab/MAIA-SOVEREIGN @ working tree · no deployed referent claimed`

⚠️ **This document is written on a 470-commit-stale branch.** Its `docs/ops/` holds 16 files; trunk
holds 80+. It must be cherry-picked onto trunk before it is authoritative. It was written *here*
rather than in the main checkout deliberately — writing it into another workspace would be the
exact act this unit is about.

---

## 1. Correction to the reported premise

The brief describes "a substantial **staged** changeset" left ownerless in
`/Users/soullab/.claude/worktrees/jarvis-desktop-c0-explorer`. Measured:

| fact | measured value |
|---|---|
| branch | `feature/jarvis-desktop-alpha-floor` |
| HEAD | `ea2e1ea46` — *"feat(jarvis-desktop): durable installed macOS app, and the real launch defect"* |
| upstream | **none configured** — branch has never been pushed |
| working tree | 4 tracked files modified (`.gitignore`, `package.json`, `src/main.js`, `src/provenance.js`) |
| named new files | `preferences.html`, `preferences.js`, `repo-config.js`, `child-env.js` all present and **committed** |

So the work is **committed and durable in git**, not floating in a staging area. The custody gap is
real; the *loss* risk is materially lower than "staged changeset" implies. What is true is that the
branch is **local-only**, so it is invisible to every remote-based instrument — the standing
consequence *"a commit is the only durable act"* (`WORKSPACE_PROVENANCE_DISCIPLINE_2026-08-09.md`)
needs its second clause: **a commit nobody can fetch is durable only on this disk.**

Two lanes still had to reason about whether the work was live or abandoned. That part stands.

---

## 2. Does a mechanism already exist? (brief item 1)

**Yes — and building a second one would be wrong.** But it is *mis-scoped*, not merely uninvoked.

### 2.1 The mechanism that exists

`scripts/builder/session.mjs` already implements the whole shape:

- `measure(worktree)` (:152) — branch · head_sha · dirty_count · **sha256 digest of the sorted dirty set**
- `rec.baseline` captured at `open` (:314)
- `collide(rec, cur)` (:376) — diffs baseline vs now across branch / head_sha / dirty_digest
- `cmdCheck` (:385) — exit 2, preserves evidence, refuses to let testing continue against a moving artifact
- `cmdSync` (:422) — the owner's acknowledgment primitive, `--reason` mandatory

This is a *good* instrument. It is not the problem.

### 2.2 The precise defect

One line:

```js
const cur = measure(rec.worktree);        // session.mjs:390
```

Collision detection is **scoped to the worktree named on the claim**. A session that writes into
worktree B is not detected by design — B is not in the measured set for *any* session, because no
session claimed it. `open` refuses a *claim* clash (:249-266); nothing refuses, records, or notices
a *write* outside the claim.

**So: not a missing instrument. An instrument whose aperture is the claim rather than the act.**

### 2.3 The Dormant Instrument Failure does apply — to `check`

`session.mjs check` has **no invocation boundary**. Verified: `~/.claude/settings.json`,
`~/.claude/settings.local.json` and the project settings contain **no `hooks` key at all**. Nothing
calls `check`. Per `INSTRUMENT_REGISTRY_2026-08-09.md` §4 that makes it *"a hypothesis about
protection, not protection."* Widening its aperture without binding it changes nothing.

### 2.4 Workspace provenance discipline names the dimension but has no executable form

`WORKSPACE_PROVENANCE_DISCIPLINE_2026-08-09.md` lists **Workspace — *which of ~101 worktrees?*** as
provenance dimension #1. It is a *discipline* (procedural). The same doc's own §4 finding applies to
it: structural boundaries outperform procedural ones, 12×.

---

## 3. The measurement that kills the obvious proposal (brief item 2)

The brief's suggested minimum — surface *"worktree W has uncommitted changes and no claim"* in
`status` — was measured against reality before being proposed:

```
36 of 56 scanned worktrees are dirty with no Builder claim.
1 of 56 is claimed (ain-relational-geometry, s-cad54855).
```

**Unclaimed + dirty is the norm, not the exception.** That surface would print ~36 warnings on every
`status` call. It would become a *false control surface* — the exact failure recorded in
`INSTRUMENT_REGISTRY_2026-08-09.md` §3 — and would be tuned out within a day.

> **Absolute visibility is unusable here. Only differential visibility carries signal.**

---

## 4. The reusable precedent already in the file

`cmdStatus` (:632-640) already does the right thing for a neighbouring problem:

```
⚠ N distinct sessions observed in transcripts vs M Builder-governed — N-M lane(s) are UNGOVERNED.
  The budget above governs only sessions that called `session.mjs open`.
```

Observed-minus-governed, reported as a delta, blocking nothing. **That is the shape to copy** — the
same sentence with *worktrees* substituted for *sessions*, and a baseline so the standing 36 are
silent.

---

## 5. Proposal — three moves, smallest first

### P1 · `status` prints the caller's own claim mismatch (≈15 lines, no storage)
Compare `canonicalWorktree(process.cwd())` against the claims held. Print one line:

```
YOU ARE HERE  /Users/soullab/.claude/worktrees/jarvis-desktop-c0-explorer
              ⚠ no Builder claim covers this workspace
```

Zero baseline, zero census, no noise — it speaks only about the caller. This alone would have made
the reported incident self-evident to the session that caused it.

### P2 · Differential worktree census (the actual visibility fix)
Store `worktree-census.json` in `AIN_DELEGATION_HOME`: `{worktree → {head_sha, dirty_digest, seen_at}}`,
refreshed on `open` / `sync` / `close`. `status` recomputes and reports **only worktrees whose digest
moved since the census while no claim covered them**:

```
UNCLAIMED MUTATION (since last census)
  jarvis-desktop-c0-explorer   head ea2e1ea46 (moved)  4 dirty  — no claim
  The 36 statically-dirty worktrees are not listed; only movement is.
```

Reuses `measure()` verbatim — no second mechanism. Cost: ~56 `git status --porcelain` calls, sub-second.

### P3 · `sync --worktree <p>` — declare a secondary workspace (brief item 3)
Do **not** require re-declaration before writing (unenforceable without a write-time hook, and
legitimate sibling reads exist). Instead extend the acknowledgment primitive that already exists:
`sync` already demands `--reason` for a baseline reset. Let it also *add* a worktree to the claim's
measured set. Re-declaration becomes a thing an honest lane **can** do, not a thing every lane must.

### Enforceable vs observable — recommendation
**Observable only. Do not block cross-worktree writes.** Legitimate cases exist (reading a sibling
checkout, comparing two branches, this very investigation). A hard block would be refused around
within a week, and a refused-around control is worse than an honest indicator. The brief's own
constraint — *unclaimed mutation must be VISIBLE, not impossible* — is the correct standard, and
P1+P2 meet it.

---

## 6. Launch Mode verdict

**DEFER.** This does not block the JARVIS Desktop Alpha week. Nothing here is on the Alpha critical
path; the c0-explorer work is committed and recoverable. Recommended sequencing:

- **P1 now if anything** — it is ~15 lines, has no storage, no baseline, and cannot generate noise.
- **P2 after Alpha.** It needs a census format, a refresh boundary, and an F6 live-artifact walk.
- **P3 only with P2** — it is meaningless without a measured set to add to.

**F6 obligation** (founder ruling 2026-08-11, `feedback_f6_live_artifact_acceptance`): the user-facing
artifact here is `session.mjs status` terminal output. Acceptance = run the real command against the
real 56-worktree environment and paste actual output — not a mock, not a described shape.

---

## 7. What this investigation did not establish

- Whether the reported session wrote into c0-explorer **deliberately** (a legitimate sibling edit) or
  by losing track of its own cwd. The transcript was not read.
- Whether ~101 worktrees is itself the defect. 56 were scanned under two roots; the discipline doc
  cites ~101. **The worktree population may be the root cause and custody merely its symptom** — that
  is a separate unit and is not proposed here.
- Any claim about `scripts/ain-worktree-claim.sh`, which was referenced but not read.
