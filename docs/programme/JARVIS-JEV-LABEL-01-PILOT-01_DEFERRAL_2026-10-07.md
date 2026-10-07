# JARVIS-JEV-LABEL-01-PILOT-01 — DEFERRED (parking record)

**Date:** 2026-10-07 · **Decision:** the founder's, relayed to this session and executed here · **Content-free:** no label value, note, unit identifier or routed-state text appears in this record.

## Disposition

PILOT-01 is **deferred**. No further human labelling is requested of anyone on the strength of this pilot. Deferral is not a pass, not a failure of the labeller, and not an approval of anything the pilot was meant to inform.

**Reason, stated plainly:** the task, evaluation criteria and consequences were **not sufficiently explained for the intended labeller to make informed judgments.** This is an **instrument-design finding**, not a failed performance by the labeller. The instrument was built on the assumption that a labeller could read the packet projection and the five candidate depth bands; the pilot existed to find where that assumption fails, and it has.

## Standing of the evidence (preserved, unchanged by this record)

| Artifact | Standing |
|---|---|
| Manifest, local index, annotations, backups, backup directories | **Unchanged.** Not touched by this record. |
| Sealed P (Label A, 100 labels) | **Retained for custody. NOT validated as a human reference. NOT usable for validation claims.** A seal proves which answers were preserved, not that the labeller understood what they were rating; this does not establish that the answers were wrong, only that there is no sound basis for treating them as a reference. **Not edited, not resealed.** |
| F (Label A) | **No recoverable artifact.** Two persistence losses; the cause of the first is **unknown**; the actual completion time of the later pass is **unverified**. Nothing was reconstructed, copied from P, completed or sealed. The finish/seal procedure was **not run**. |
| Label B | Never assigned. |

## Holds that remain in force

Deferral **grants no new authority and leaves every existing restriction unchanged**: live Jev calls and any provider transport or credential, the J1 wire-envelope amendment, any lowering of computational effort or other cost-reduction use, and anything else previously withheld. (Note the wording: the Jev seam is advisory and raise-only; that is a narrower statement than "carries no risk".)

JEV standing, unchanged: integrated as an advisory seam in JARVIS (Designed; proven against a fake transport; merged in #1756 at canonical `32d5acb38f4c5c9d74b7b67bd01f2a4d4ad3da30`). Live calls held. Judgment quality unmeasured.

**AI-authored diagnostics** may be considered separately, clearly attributed as AI analysis. They cannot substitute for human ground truth and cannot satisfy the admission gate.

## Dependency that must be preserved

#1756's projection-equivalence proof pins pilot source blob `d3d5a533703903f6cd25e34a1cb9f7510fec5c6d`, which is reachable only through the pilot branches. **Do not delete, prune, rebase or rewrite them. Do not merge a harness into canonical merely to tidy a deferred pilot.**

| Branch | Head at deferral |
|---|---|
| `claude/pensive-ride-hw6qra` | harness R1/R1.1, original record, this record |
| `chore/jev-label-pilot-human-ui-20261002` | `279bfb232` |
| `fix/jev-label-pilot-f-durability-r1-20261007` | `250286cf1` |
| `fix/jev-label-pilot-mac-custody-r1-20261007` | `7a6dca79871f` (tested code `08b86b8c7`) |
| `fix/jev-label-pilot-f-host-guard-r1-20261007` | `921d84563b29` (tested code `afe639f5e`) |

## Reopening requires a separate decision

Before any further human pass: a plain-language purpose; recognizable worked examples; explicit criteria; an explanation of what the judgments will authorize; appropriately qualified human reviewers. If the protocol still requires two independent raters, one reviewer cannot fill both roles, and the unvalidated P answers cannot silently serve as one side. Reopening is by decision, not by a date arriving.

## Actions: done and not done

**Done in this session:** the recurring check-in (`trig_01RjcBi3Vfv6KcpiQVV4hwf4`, Mon/Wed/Fri) was **deleted and verified** (a subsequent `get_trigger` returns not found); the earlier one-time reminder had been deleted on 2026-10-02. **No replacement reminder was set.** This record and the status pointer in `CLAUDE.md` on this branch.

**Not done / not within this session's reach:** the status pointers on the Mac-side branches above still carry their earlier "controlled launch" orientation and need the same deferral line when those branches are next touched; nothing was changed on them. The F server process on the Mac, the Mac Studio files and the backup directories were not inspected or modified. No implementation, experiment or labelling was started.
