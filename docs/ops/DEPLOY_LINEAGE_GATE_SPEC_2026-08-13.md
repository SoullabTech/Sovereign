# Deploy Lineage Gate — spec (NOT IMPLEMENTED)

**Status:** specification only. No code written. Authorized in principle by founder ruling
R3 (2026-08-13); implementation belongs to the `maia-route-edge-witness` unit.

**Origin incident:** 2026-08-13. `6f56f1926` (memory/continuity release) went to production
at 11:03 UTC. At 11:45 and 12:05, two deploys off `fix/p0-voice-recovery*` — forked from
`52a3b924b`, before the memory work — replaced it. Every existing gate passed honestly.
Eight commits left production with no signal. Full witness:
`docs/architecture/audits/PWA_DEPLOYMENT_CONTINUITY_WITNESS_2026-08-13.md`.

## What exists today

Verified by grep across `deploy-production.sh`, `pre-deploy-gate.sh`, `deploy-lock.sh`,
`deploy-tag.sh` — **zero** occurrences of `merge-base`, `is-ancestor`, `ancestor`,
`descendant`, `rev-list --count`.

| Control | Question it answers |
|---|---|
| `deploy-lock.sh` | Is another deploy in flight? (exclusive non-blocking `flock`) |
| `gate_provenance` | Is the SHA real and not `unknown`? |
| `gate_colab` | Do the 31 boundary checks pass? |
| `gate_disk` | Is there build headroom? |
| **— missing —** | **Does this candidate contain what is already running?** |

The lock protects **time**. The provenance gate protects **identity**. Nothing protects
**lineage**.

## The governing rule (founder form, R3)

Not strict ancestry. A legitimate reconciliation may cherry-pick or squash equivalent work
and therefore lack literal ancestry; a strict-ancestor gate would block correct deploys and
train operators to reach for the override.

```
IF candidate descends from current production:
    → fast-forward. Proceed through normal gates.

IF candidate diverges from current production:
    → BLOCKED.
    → Unless explicit reconciliation evidence proves the candidate
      intentionally incorporates or supersedes the live changes.
```

**Fast-forward by default; divergence requires reconciliation evidence.**

Applied to the incident:

```
live:       6f56f1926
candidate:  78ea266c5
merge-base: 52a3b924b        → candidate does not descend from live

DEPLOY BLOCKED — candidate omits 8 commits currently in production:
  90e169018  fix(sovereign): cross-session continuity fails loudly
  994c284d5  fix(sovereign): restore prompt-authority invariant on the member route
  939ca9b4a  fix(sovereign): report context composition truthfully per tier
  … (5 more)
```

A reconciled candidate `C` merging both lanes deploys normally once ordinary gates pass.

## Resolving CURRENT_PRODUCTION_SHA

No new plumbing needed — two independent sources already exist:

1. `docker exec maia-sovereign printenv GIT_COMMIT` (the running container's provenance)
2. the `maia-sovereign:current` tag, maintained by `deploy-tag.sh:44`

Prefer (1) — it reports what is *running*, not what was last *tagged*. Use (2) as
cross-check; **disagreement between them is itself a block**, since it means the tag no
longer describes production (the 2026-07-10 failure mode).

## Correctness requirements the naive version misses

1. **Fail-closed on unresolvable CURRENT.** If the running SHA is absent, `unknown`, or its
   object is not in the local store → BLOCK. A gate that passes when it cannot evaluate is
   worse than no gate, because it manufactures false assurance.
2. **Fetch before judging.** The prod checkout tracks `clean-main-no-secrets`; another
   lane's commits may not be local. Ancestry computed over a partial object store yields
   false "divergent" *and* false "descendant" results. Fetch the specific SHAs first;
   failure to fetch is a block, not a skip.
3. **Rollback exempt by construction, not by flag.** `deploy-production.sh rollback` is
   *definitionally* a non-descendant deploy. Exempt the code path; never rely on the
   operator remembering an override.
4. **One explicit ack, following the existing idiom.** `DEPLOY_ALLOW_REGRESSION=1`,
   mirroring `DEPLOY_ALLOW_HEAD=1`. It **must print every commit being dropped** before
   proceeding. Today's incident would have printed eight.
5. **The block message names commits, not counts.** "Candidate omits 8 commits" is not
   actionable; the list is.

## Attachment point

A fourth gate function in `scripts/pre-deploy-gate.sh` alongside `gate_provenance` /
`gate_colab` / `gate_disk`, called on every deploy entry point (`deploy`, `update`,
`deploy-maia`). It must run **before** the build, not after — the point is to refuse
cheaply.

## Acceptance

Reproduce the incident topology and prove refusal:

```
A ← live
 \
  B ← candidate          → B cannot silently replace A

A ──► C
 \   /
  B─                     → C deploys normally once ordinary gates pass
```

## Scope boundary

This gate protects **capability lineage across lanes**. It does **not** detect the deeper
condition the same incident exposed — that a single build can contain two divergent
continuity contracts behind one member-facing identity (`/api/between/chat` vs
`/api/sovereign/app/maia/list`). Verified: `/between/chat` is byte-identical in
`78ea266c5` and `6f56f1926`, and the client default `apiEndpoint = '/api/between/chat'`
is unchanged at line 624 in both. **A perfect lineage gate would have preserved the split,
not healed it.** That is R2's subject, not this gate's.
