# Security incident response standard

**Status:** canon, ratified by founder 2026-08-09.
**Derived from:** the `premium-storage/export` DELETE incident (discovered, repaired, deployed and closed on 2026-08-09), and the four false-signal findings that surrounded it.

This is not a process for its own sake. Every clause below exists because this project has already been misled by its absence.

---

## The chain

```
finding
   ↓
authority trace          ← what is the domain's real ownership/delegation model?
   ↓
isolated repair          ← smallest coherent change; a stated diff boundary
   ↓
tests                    ← adversarial, not merely confirmatory
   ↓
merge
   ↓
deploy
   ↓
non-destructive live verification   ← at the executable boundary, in production
   ↓
closure classification
   ↓
record propagation       ← correct every statement the closure falsifies
```

No step may be skipped by declaring the next one. In particular: **merged is not deployed, deployed is not verified, and verified is not closed.**

## The two governing rules

> ### ⭐ 1. A finding is not CLOSED until both the executable boundary and the documentary boundary agree about its status.
>
> A deployed fix with a record that still reads "vulnerable" is not closed. A record that reads "closed" over an undeployed fix is worse. Closure is the *agreement*, not either half.

> ### ⭐ 2. Propagation is semantic, not textual.
>
> Correct every statement whose **meaning** has become false. Preserve every statement that still describes unresolved neighbouring risk.

Rule 2 guards two opposite failures, and both are live risks here:

| Failure | Shape |
|---|---|
| **Under-propagation** | stale documents keep a closed incident artificially open; later audits re-litigate settled work |
| **Over-propagation** | a find-and-replace sweep makes *unresolved* vulnerabilities disappear from institutional memory |

The 2026-08-09 closure nearly produced the second. "Production still runs the vulnerable code" appeared in a document describing **27 handlers**, of which exactly **one** had shipped. A textual fix would have silently marked twenty-six live defects as resolved. The correct propagation split the claim by fact.

## Deployment state is seven independent facts, never one "status"

⛔ **Never write a bare `Status:` line on a security repair record.** Record each of these separately; any of them can be true while later ones are false:

```
designed | implemented | tested | merged | deployed | live-verified | closed
```

**Why this is mandatory.** The `delete-my-memory` record read *"Route repaired + regression-tested"* — every word true, no deployment state given. That phrase is precisely what a later session promotes to "fixed" without noticing it did so. The dangerous stale-language shape is not the false claim; it is the **absent qualifier a reader completes optimistically.**

A record carrying `tested` but not `merged` is a correct and useful record. A record carrying an unqualified "repaired" is not.

## Verification must be non-destructive and must prove the boundary

The probe has to fail *in the specific way the repair introduced*, without exercising the destructive path.

The 2026-08-09 closure evidence:

```
401  DELETE /api/premium-storage/export?exportId=probe-nonexistent-0000
     {"error":"Unauthorized","message":"Authentication required."}
```

Unauthenticated caller, deliberately nonexistent id. Before the repair that exact request reached `prisma.exportArchive.findUnique`, then `fs.unlink`, then the row delete. The `401` proves the new control fires **before** persistence access. Neighbouring behaviour was checked unchanged in the same pass (two `400`s), because a repair that also silently changed something else is not a clean closure.

⛔ **Never demonstrate a vulnerability by exploiting it.** Reachability plus static authority analysis is sufficient to establish a defect; a non-destructive probe is sufficient to establish its closure.

## Two standing principles this incident confirmed

> ### Missing infrastructure is not authorization. Failure by accident is not a control.
>
> `delete-my-memory` was protected by absent tables. `premium-storage/export` was protected by an absent `ExportArchive` table. Neither was protected. Both would have become live the day someone ran a migration. **Ship the control anyway** — an inert surface is a latent one, and inertness is not a boundary you can point to.

> ### A tool's output is only as trustworthy as the provenance of the workspace that produced it.
>
> A branch reported `clean-main-no-secrets` while sitting 18 ahead / 402 behind. A gate reported four failing diagnostics that existed in no source file, from a stale `tsconfig.ship.tsbuildinfo`. Establish provenance before believing a reading — **especially a reassuring one.** Detail: `docs/ops/WORKSPACE_PROVENANCE_FALSE_SIGNALS_2026-08-09.md`.

## Diff boundary

State the intended boundary as a **number** before opening the PR, and treat any widening as a signal to split rather than to review harder. The 2026-08-09 PR opened at 56 files / +9,655 instead of 2 files / +171; only the pre-stated number caught it.

## Classification

Every PR must carry a change classification. Use `.github/PULL_REQUEST_TEMPLATE.md` — ⛔ **`gh pr create --body-file` bypasses the template**, which is how PR #996 merged with an unmet Covenant Gates check. If the template was bypassed, apply the `class-*` label retroactively rather than leaving a merged sovereignty change unclassified.

⚠️ Path-based auto-labelling is **not** a safety net: `classAPaths` did not include `app/api/premium-storage/`, so nothing would have caught the omission automatically.

## Scope discipline at closure

A clean terminal state is the moment adjacent work is most tempting and least warranted. **Closure authorizes nothing beyond itself.** Pulling neighbouring lanes into a closed incident's momentum weakens the evidentiary chain that made the closure worth anything.

---

*Canon. Applies to security repair records under `docs/security/`.*
