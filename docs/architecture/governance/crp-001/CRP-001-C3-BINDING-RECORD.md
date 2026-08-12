# CRP-001 — C3 BINDING RECORD (MIR-001-A v2)

**Executed:** 2026-08-12, read-only
**Under:** C3 ruling F1, fail-closed to F2
**Disposition:** **F1 stands — prospectively, with a recorded non-claim.**

---

## 1. Binding attempt — five required elements

| # | Required | Result |
| --- | --- | --- |
| 1 | exact file | ✅ `MAIA-SOVEREIGN/docs/architecture/audits/MIR-001_MAIA_HEALTH_MAP_2026-08-12.md` |
| 2 | exact bytes / hash | ✅ sha256 `c28969b07fbed320a7cfd48e900caa0797ca772cb38fea301bc37149d3b56ff4`, 31576 bytes |
| 3 | git / blob / commit provenance *where recoverable* | ⚠️ **PARTIAL** — blob `6e645af6240e4cc5232dc89cc6ef638f5b9ab356`; **no commit provenance: the file is untracked (`??`)** |
| 4 | v2 / re-seal status | ✅ `MIR-001-A v2 — FINAL / RE-SEALED`, self-documented at §−1 |
| 5 | canonical / runtime referents the finding cites | ✅ trunk `clean-main-no-secrets`; deployed production SHA `e5f2c5fa2` (`docker exec maia-sovereign printenv GIT_COMMIT`) |

Repo state at binding: `MAIA-SOVEREIGN` HEAD `d41b8b3551e13847ff8fc73a42b5c7219eb95123`,
branch `feature/labtools-redesign`, remote `origin` →
`github.com/SoullabTech/Sovereign.git`. **HEAD is contained in no remote
branch** (`git branch -r --contains HEAD` → empty).

## 2. Why F1 stands rather than failing closed

Element 3 is the only shortfall, and the C3 ruling qualifies it as *"where
recoverable."* Here it is **unrecoverable by construction**, not merely
unlocated: the file was never committed, so no commit object was ever created
to find.

The health map states this about itself, unprompted, at §−1:

> **⚠️ v1 has no hash, and none can be manufactured.** The v1 map was written
> to the working tree and never committed, then edited in place. **No git
> object, tag, or backup of v1 exists.** I am not going to invent a referent
> for it.

and records the lesson it drew:

> **Standing lesson this establishes:** an artifact should be committed
> *before* being called sealed.

An object that documents its own provenance ceiling, in the terms the binding
would have used, is bound as far as binding can reach. The four recoverable
elements are established. F1 stands.

## 3. The non-claim that travels with this binding

**The sha256 binds this object prospectively, from 2026-08-12 forward. It does
not establish retrospectively that this file is what the cold MIR-001 run
produced.**

By the document's own account it was edited in place once (v1 → v2). Nothing
in the repository can distinguish that edit from any other. Any CRP unit
citing a MIR §1 finding must carry this non-claim; it may not restate the
binding as "MIR-001-A v2, bound" without it.

What *is* checkable, per §−1: the v2 edit was purely additive at one
contiguous insertion point (§4.8, between §4.7 and §5; +42 lines, 0 removed,
0 modified), so v1 is exactly reconstructible from v2 by deleting §4.8. That
is a content claim about the edit, asserted by the document, not independently
verified here.

## 4. One cheap action would close this permanently — NOT TAKEN

Committing the file to a branch and pushing it would give it a real commit
object and a remote ref, converting a prospective binding into a durable one.

**Not done.** That is a git write to a product repository, and no such
authority exists under CRP-001. Recorded as a request for founder ruling —
and note it belongs naturally with **Step 3 (canonical custody)**, since the
question is identical: where do sealed evidence objects live so a later reader
on another machine can verify them?

## 5. Convergence worth noting for Step 3

The health map's own §1 already diagnosed the disease Step 3 exists to cure:

- local trunk ref **472 commits behind** the remote (flagged as a live
  referent hazard);
- deployed production SHA **4 commits behind** trunk;
- **D5 — Local trunk ref is 472 commits stale. (PROVEN DEFECT, process)**;
- governing evidence reachable only via a preservation commit `c42cfe4a3`
  that is *"not on trunk, not on HEAD"*, with `CLAUDE.md` citing rulings a
  trunk-only reader cannot open.

Three independent instances of the same failure now sit on the record: the
CRP schema freeze on a non-repo path, this untracked health map, and the
stale-trunk/orphan-commit findings above. Step 3 is not bookkeeping.

---

## LOG

- **2026-08-12** — Binding executed read-only. F1 stands prospectively.
  Non-claim recorded (§3). No file was moved, committed, or modified.
