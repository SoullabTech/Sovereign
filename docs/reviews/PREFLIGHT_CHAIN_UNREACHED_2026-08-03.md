# The preflight chain is invoked by nothing

**Status:** ⛔ **FINDING ONLY. Nothing fixed.**
**Referent:** `origin/clean-main-no-secrets` @ `ee91aedf7` (post-#935 merge).
**Raised by:** applying the #935 review standard to #935's own wiring.

---

## The finding

`npm run preflight` is invoked by **nothing**:

| Candidate invoker | Invokes preflight? |
|---|---|
| `scripts/pre-deploy-gate.sh` | ❌ no |
| `scripts/deploy-production.sh` | ❌ no — its two "preflight" hits are *disk* preflight comments, unrelated |
| `.githooks/pre-commit` · `pre-push` · `commit-msg` | ❌ no |
| `.github/workflows/**` | ❌ no |
| Anywhere else in the repo | ❌ no |

The pre-commit hook runs **five checks directly by name** — `check:no-supabase`,
`check:no-inline-names`, `check:no-phi-enc`, `check:phi-inventory`,
`check:no-direct-anthropic` — and never calls `preflight`.

### Which preflight-chain checks execute automatically

| Check | pre-commit | CI |
|---|---|---|
| `check:no-supabase` | ✅ | ❌ |
| `check:no-direct-anthropic` | ✅ | ❌ |
| `check:no-vendor-voices` | ❌ | ❌ |
| `check:voice-provenance` | ❌ | ❌ |
| `check:no-openai` (provider governance) | ❌ | ❌ |
| `ci:guard` (route guard) | ❌ | ❌ |
| `preflight-compose-config.sh` | ❌ | ❌ |
| **`check:member-owned-boundary`** (#935) | ❌ | ❌ |

**Six of eight run only when a human types the command.**

---

## ⭐⭐⭐ This lands on #935 itself

PR #935 stated: *"Wired into preflight rather than left standalone."* That is **true and
insufficient**. The harness is in `preflight`; `preflight` is in nothing.

The founder-issued acceptance criterion was:

> Given a future code change, when a practitioner-reachable path references protected client
> material, **the harness fails before release.**

**That criterion is NOT yet satisfied.** The harness *detects* — verified by A/B on the merged tip,
exit 1 on a planted practitioner read — but **nothing runs it before release.** Detection without
invocation is the same class of failure the harness was built to prevent, one layer up:

```
control exists  →  control is not executed  →  control is a description
```

This is the third instance of that pattern found today, and the first one that is **ours**:

1. `scripts/verify-colab-boundaries.ts` — declared mandatory in CLAUDE.md, **does not exist**
2. `scripts/verify-coach-field-boundaries.ts` — exists, proves the structural half of the Slice 0
   boundary, **invoked nowhere**
3. **`check:member-owned-boundary`** — merged today, **invoked nowhere automatically**

---

## What this does and does not change

**Does not change:** the harness is correct, live, and A/B-verified on trunk `ee91aedf7`. Its
detection logic needs no repair. #935 was worth merging.

**Does change:** Slice 0's boundary-harness deliverable should be read as
**built and merged, not yet enforcing.** The gap is wiring, not logic.

---

## The lane this upgrades

The founder named a lane: *"Wire existing trust-boundary verification into the release/preflight
path."* This finding shows it is **larger than one gate** — the preflight chain as a whole is
unreached, and the #935 harness now sits inside it.

⚠️ **Design question that must be ruled, not assumed:** `verify-coach-field-boundaries.ts` requires a
**database**; `preflight` runs without one. They cannot share a single invocation point without a
decision about which gate runs where:

| Candidate | Runs with | Suits |
|---|---|---|
| pre-commit hook | no DB | static checks (the #935 harness) |
| `pre-deploy-gate.sh` | DB reachable | schema/boundary gates needing a live DB |
| CI | configurable | both, if a DB service is provisioned |

⛔ Touching the deploy lane is not authorized. **Recorded, not started.**

*The system does not outrun the evidence.*
