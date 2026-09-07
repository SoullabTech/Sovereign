# DEPLOY SEQUENCING LAWS
**Ratified 2026-09-08 · learned in `JARVIS-CIRCLES-01` I0.5, applicable project-wide**

⭐ **These are not Circle rules.** They were learned while sequencing one release against another
lane's live production witness, and they govern **every lane that deploys**.

---

## 1 · RELEASE ADVANCE LAW

> **Release qualification is necessary but not sufficient for deployment. Immediately before
> deployment, the target must also be proven to advance the actual running production SHA. A
> qualified ancestor of newer production must never be deployed as a regression.**

**Why.** Qualification establishes the **artifact**. Ancestry at **execution time** establishes that
deploying it is still an **advance**. The two are different claims, and time separates them: canonical
moves, other lanes deploy, and a target qualified hours ago can silently become an ancestor of what
is now running.

**The gate.** Re-read production; do not assume it, and do not reuse an earlier observation:

```bash
RUNNING=$(ssh <host> 'docker exec maia-sovereign printenv GIT_COMMIT')   # fresh, every time
TARGET=<the qualified SHA>
git merge-base --is-ancestor "$RUNNING" "$TARGET"
```

```text
0   PASS — target advances production
1   STOP — target is not a descendant of running production
>1  STOP — ancestry could not be established
```

⛔ On `1` or `>1` the deploy **stops** and the target is **re-decided by an explicit act** — never
substituted at deploy time.

**Worked case (I0.5, 2026-09-08).** Production `e535e6246`; qualified target `891b33ee0`; canonical
had advanced to `b4831d2ab`, and the 12 commits between contained another lane's governed-erasure
work. Deploying the qualified target *after* canonical would have been an ancestor deploy that
silently removed that work. The ordering was ruled explicitly, and the gate was retained as the
backstop for the case where the ordering communication failed.

⭐ **Coordination preserves the intended sequence; the ancestry gate keeps you safe when coordination
fails.** ⚠️ It degrades into **blocked**, not into *fine* — which is the correct failure direction.

---

## 2 · DEPLOY-LANE CUSTODY LAW

> **A live holder plus a named protected act is sufficient custody. Inability to identify the session
> holding the deploy lane is not evidence of abandonment.**

⛔ **Never terminate a live holder. Never delete `.deploy.lock` to force entry.** Deleting the
lockfile detaches the kernel lock from future acquirers and re-opens the 2026-07-09 concurrent-deploy
race the lock exists to prevent.

**The inversion this prevents:** reading *unidentifiable* as *unowned*. Session identity is **not** a
custody credential. On this infrastructure a hold's local lineage runs through a shared service
process, so a legitimate holder frequently **cannot** be mapped to a chat or session — that is a
property of the tooling, not a signal about the hold.

**What to do instead.** Verify the hold is live (`fuser -v ~/MAIA-SOVEREIGN/.deploy.lock`; a refusal
naming a dead PID means a child of that deploy is still running). Then **wait for a holder-owned
release**, or relay the constraint and let the holder act.

### Corollary — a cross-lane acknowledgment must be falsifiable

Where the holder cannot be identified from outside, an acknowledgment from *a* lane does not
establish that the **holding** lane acknowledged. ⛔ A bare *"acknowledged"* does not discharge a
cross-lane sequencing constraint.

A discharging acknowledgment **asserts holdership** — the PID and the protected target — so it can be
checked against the live lock:

```text
This lane holds <NAMED ACT>, remote PID <PID>, target <SHA>.
<constraint> acknowledged.
```

⭐ *An acknowledgment that names the PID is falsifiable; one that does not is ceremony.*

⚠️ **Write the ruling against the holder, never against a session id.** In the I0.5 case the lane
inferred the wrong owning session from session metadata — and it cost nothing, because the
identification was labeled `INFERRED, NOT PROVEN` and the ruling bound *whoever holds the lock*. Had
it named the session, it would have bound the wrong lane.

### Corollary — a free lane is not authorization

A sequencing hold is **not** lock contention. When the lock releases, a sequencing restriction on
another lane **survives intact**. ⛔ Do not read an empty deploy lane as permission.

---

## Promotion inventory (for PR scope — verified 2026-09-08)

⚠️ **"Three promoted laws" was ambiguous.** The promotion contains **four law statements** across
**three doctrines** in **two canon files**. Both counts are correct at different levels; the PR scope
is the file list.

```text
LAW STATEMENTS (4)                        DOCTRINE (3)        CANON FILE (2)
1. Migration witness law            \____ migration doctrine  MIGRATION_WITNESS_DOCTRINE.md
2. Migration reconcile law          /
3. Release advance law              ----- release advance     DEPLOY_SEQUENCING_LAWS.md
4. Deploy-lane custody law          ----- deploy custody      DEPLOY_SEQUENCING_LAWS.md

FILES CHANGED (3)
  CLAUDE.md                              new "Migration & Deploy Laws" section, 4 statements
  docs/ops/MIGRATION_WITNESS_DOCTRINE.md carries the 2026-09-08 checksum correction
  docs/ops/DEPLOY_SEQUENCING_LAWS.md     new file
```

⭐ **Count by DOCTRINE when speaking; count by FILE when scoping a PR.** The two migration laws are
one doctrine and were ratified as a pair — ⛔ do not split them.

⛔ **No re-drafting during promotion.** The text is already fixed on the lane; the PR moves it
unchanged.

---

## 3 · CLOSURE BOUNDARY LAW

> **Proximity does not establish provenance. A residual discovered during a closure belongs to that
> closure's RECORD without automatically becoming evidence against what the closure actually
> CERTIFIED.**

A closed witness is closed **on what it witnessed**. Bounded cleanup and tooling debt found along the
way are **named and carried**, not folded back into the certification.

**Worked case (I0.5, 2026-09-08).** Closure certified `891b33ee0` running in production with its
migrations, schema effects and state preserved. Two residuals were named in the same record:

```text
maia_i05_shadow_d58488db     disposable local DB, empty — adjacent bounded debt
PG client/server-major       operational/tooling debt, will recur
```

⛔ Neither reopens I0.5. Reopening a closure for adjacent debt is the same error as reading an
unattributed field as provenance: **letting proximity stand in for the thing itself.**

⚠️ The law cuts **both** ways — it is not licence to discard a residual. *Named and carried* means
recorded in the closure's own record, with its own disposition, so it survives the closure rather
than being absorbed or forgotten by it.
