# PHI Gate Repair — implementation + adversarial proof (2026-08-09)

Authorized unit. Implements the extraction recommended by
`docs/ops/PHI_GUARDRAILS_AUDIT_2026-08-09.md` §J.

**Built and proven. NOT bound.** Binding (boundary H) is a separate authorization.

| artifact | purpose |
|---|---|
| `scripts/guards/phi-log-gate.ts` | the extracted, fail-closed PHI gate |
| `scripts/guards/__proof__/phi-log-gate.proof.ts` | adversarial proof harness |
| `npm run check:phi-gate` | independently invocable gate |
| `npm run proof:phi-gate` | the proof — **19 passed · 0 failed** |

---

## G1 — enumeration cannot fail open ✅

The predecessor's `git ls-files … || true` (`phi-no-plaintext-drift.sh:15`) turned a git failure
into an *empty file set*, skipped every loop, and printed `✅ PHI guardrails: OK`.

Now: `git ls-files` failure → **exit 2 (BLOCKED)**. Empty result → **exit 2**. Empty declared
population → **exit 2**. Exit 2 is explicitly *not* a pass; the gate states it could not inspect the
repository and therefore makes no claim.

Proven by spawning the gate with a shadowed `git` stub — both a failing stub and a
succeeds-but-prints-nothing stub. Both exit 2; neither prints `✅`.

## G2 — dependency removed, not declared ✅

**Established first, as instructed: removal beats declaration.** `guard:phi` was the *only* ripgrep
consumer in the repo, and the repo already has a native idiom for exactly this
(`check-no-phi-enc-in-responses.ts:81` — `git ls-files` + `fs.readFileSync` + regex). Adding a
system-binary dependency to AIN to keep one script alive was the worse trade.

The gate now invokes **exactly one external binary: `git`** — asserted structurally by the proof,
which parses every `execSync`/`execFileSync` call out of the gate source. No ripgrep, no new
dependency.

## G3 — PHI checks independently reachable ✅

`check:phi-gate` invokes the gate directly. It is **not** behind `check:nocheck &&
check:private-routes && …`. The audit's finding — that the red leg at position 1 short-circuited
before the PHI legs ever ran — cannot recur, and the proof asserts the npm script contains no `&&`.

## G4 — scope explicit ✅

**Declared claim:** *all tracked first-party source files capable of emitting application logs, plus
tracked SQL migrations.*

Enumeration now corresponds to that claim: prefix + extension over `app/ lib/ components/ hooks/
scripts/` (+ `middleware.ts`), extensions `.ts .tsx .js .jsx .mjs`, plus
`database/migrations/**.sql`. Git's `**` pathspec — which silently dropped every top-level file —
is gone.

| | files |
|---|---|
| predecessor scanned | 4,786 |
| gate scans | **6,081** + 435 migrations |

**Documented exclusions (the only ones):** the gate itself, its proof fixtures, and the predecessor
script — all three contain the patterns literally and would self-match. **Test files are NOT
excluded** (173 of them, verified zero pattern hits, so excluding them would buy no noise reduction
and cost a blind spot).

**Materiality of the widening:** scanning 1,295 additional files surfaced **no new violations**. The
blind spot was latent risk, and it is now closed without a re-baseline.

Proven by planting violations in four previously-unreachable locations —
`components/`, top-level `lib/`, top-level `scripts/`, `hooks/` — confirming each is caught, then
removing them. The proof compares tree/index against a baseline captured at start, so unrelated
pending edits are not misreported as residue.

## G5 — the acceptance violation is real ✅

```
app/api/practitioner/practice-field/invite/route.ts:111
console.log(`[PracticeField] Invitation sent: ${practitionerName} → ${client_email}, space ${spaceId}`);
```

The gate exits **1**, names the file *and* line 111, and prints no success line. This is a live
defect, not a fixture.

Corroborating (not sole) evidence, as instructed: `check:no-inline-names` independently flags the
same file at line 51 — where `practitionerName` is constructed.

**The leak is deliberately NOT fixed in this unit.** Fixing it would destroy the acceptance case
before binding is authorized, and it is a production route change deserving its own review.

## G6 — claim scope honest ✅

Stated in the gate header and printed on every pass:

> **CAN establish:** the known textual PHI-logging patterns are absent from the declared population.
> **CANNOT establish:** this repository contains no PHI logging.

Aliasing, destructuring, computed access, helper functions, and serialization all exceed a
line-oriented regex scanner. The success message says so inline, so the limit travels with the
signal rather than living only in documentation.

**Detection semantics are preserved byte-for-byte** from the predecessor — same two failing patterns,
same PHI identifier list, same decrypt-fallback and plaintext-column warnings with the same
fail/warn split and the same `scripts/backfill-*` exemptions. Widening sinks or the identifier list
is *broader PHI detection*, explicitly outside this lane.

---

## Status against the ladder

| property | state |
|---|---|
| EXISTS | ✅ |
| REACHABLE | ✅ independently invocable (`check:phi-gate`) |
| DEPENDENCIES AVAILABLE | ✅ git only; no undeclared binary |
| FAILURE-CAPABLE | ✅ exit 1 on the real leak |
| FAILURE-PROPAGATING | ⏸ untested — no boundary bound yet |
| EFFECTIVE | ✅ within the declared, honest scope |
| BOUND | ❌ **not bound — awaiting authorization** |
| PROVEN IN LIVE CI | ❌ |

## Known transitional state

`guard:phi` and the `guardrails` aggregate are **untouched** — reclassification is a separate unit.
Two PHI scanners therefore coexist: the old one unreachable behind a red leg, the new one unbound.
This is deliberate and should not outlive the reclassification unit.

## Binding readiness (boundary H) — not performed

Binding requires one decision first: the gate is **red on the current tree** by design (G5). Binding
it to CI before `route.ts:111` is fixed lands a red gate on every PR. The options —

1. fix line 111, then bind (CI green from the start); or
2. bind first and let the real leak block, making the repair urgent —

are a governance call, not an implementation detail. Recommend **(1)**: the acceptance proof is
already recorded here, so the evidence survives the fix.

Out of this unit's boundary and untouched: `guardrails` reclassification, `commit-msg` installer
binding, the four local-only hooks, broader PHI detection, telemetry, and the `check:no-phi-enc`
`--strict` decision (that check is **not** part of this gate — its posture ruling is still open).
