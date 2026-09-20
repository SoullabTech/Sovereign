# Guard Ratchet Census — which guards enforce direction, which enforce paperwork

**Date:** 2026-09-20
**Status:** CENSUS (read-only) + one repair taken under founder act.
**Occasion:** `docs/architecture/TIERED_LOCAL_INFERENCE_DIRECTION_2026-09-20.md` §2, which found
`check-no-direct-anthropic.ts` enforcing procedure without direction.

---

## 1. The distinction

Two kinds of guard wear the same green checkmark:

- **Procedural** — *"does this addition have paperwork?"* Fails an undocumented violation; passes a
  documented one, indefinitely. Converts silent drift into **legible** drift. That is a real gain and
  it is not the same thing as retiring the debt.
- **Directional (ratcheted)** — *"is this number allowed to go up?"* Pins current debt and fails on
  increase. Migration becomes the only direction the number can move.

⭐ **An allowlist's reviewability degrades with its size.** At 0–3 entries a reviewer notices one more
line. At 29 or 55, an addition is noise. **The ratchet matters most exactly where the allowlist is
large** — which is where it was absent.

---

## 2. Census

Method: read `scripts/check-*` and `scripts/guards/*` reachable from `npm run preflight`,
`.githooks/pre-commit` and the `guardrails` script. Debt buckets (§2.3) and ratchets (§2.1) were read
directly; §2.2 is partly inferred from the absence of any allowlist or ceiling construct and is the
lower-confidence row.

### 2.1 Ratcheted — direction enforced ✅

| Guard | Baseline | Mechanism |
|---|---|---|
| `check-typehealth-baseline.js` | `typecheck-baseline.json` | fails on NEW diagnostic, **INCREASED count**, or a path that left the program while still on disk |
| `guards/member-id-log-gate.ts` | `member-id-log-baseline.json` | NEW / INCREASED / **RESOLVED** — "the baseline may therefore only ever SHRINK"; `--update` is a dry run, recording needs `--accept-current` |
| `check-no-direct-anthropic.ts` | `_ratchet.grandfathered_max` | **added by this census** — see §3 |

`member-id-log-gate.ts`'s docstring is the canonical statement of the pattern in this repository, and
it says so: *"Modelled on the repo's proven `typecheck-baseline.json` precedent."* The pattern is
well understood here. It had simply not been applied to the debt buckets.

### 2.2 Absolute ban — ceiling of zero, enforced by construction ✅

`check-no-supabase.ts` · `check-nocheck-allowlist.js` (`ALLOWLIST = new Set([])` — empty, so any
`@ts-nocheck` fails) · `check-private-routes.js` · `check-backend-imports.js` ·
`check-internal-imports.js` · `check-voice-provenance.ts` · `check-member-owned-boundary.ts` ·
`check-no-phi-enc-in-responses.ts` · `guards/phi-log-gate.ts`.

No defect. A ban with no exemption tier is already directional — the ceiling is zero and it holds.

### 2.3 Debt bucket with no ceiling — procedural only ⚠️

| Guard | Bucket | Entries | Its own description of the bucket |
|---|---|---|---|
| `check-no-direct-anthropic.ts` | `grandfathered` | 55 of 58 (95%) | "legacy cognitive surfaces to be migrated"; reviewers told to treat additions as a yellow flag |
| `check-provider-governance.ts` | `openai_removal.pending_migration` | 29 | "Every file here is migration debt"; additions "expect PR pushback" |

⭐ **Two independent lanes arrived at the same construct, in the same words, with the same gap.**
Neither had a ceiling. Both told reviewers, in prose, to push back — which is a request for
vigilance where a mechanism was available.

The first is repaired (§3). **The second is not, and is not authorized here.**

### 2.4 Structural / presence assertions — ratchet not applicable

`guards/interface-humility.ts` · `guards/ain-v2-integration-present.ts` ·
`guards/no-scripted-maia.ts` · `check-design-canon.ts`. These assert a property holds, not that a
count has not grown. No debt bucket to cap.

---

## 3. Repair taken — `check-no-direct-anthropic.ts`

Authorized by founder act 2026-09-20. One guard, one JSON block. ⛔ No routing change, no schema, no
runtime code, no deploy.

**Metric is live debt, not entry count.** `_ratchet.grandfathered_max` caps grandfathered entries
that *still import the SDK*. Raw entry count is the wrong measure: a file migrated off the SDK but
left listed would keep the number flat forever, and the ratchet would never tighten.

| State | Result |
|---|---|
| `live > ceiling` | **FAIL** — debt grew; a bypass was written down instead of migrated |
| `live < ceiling` | **FAIL** — a migration recovered headroom and left it spendable by the next bypass; run `--retighten` |
| `live = ceiling` | PASS |
| `_ratchet` absent or malformed | **exit 2** — deleting the ratchet fails the guard rather than disabling it |

⭐ **The asymmetry is the ratchet:** `--retighten` can only *lower* the ceiling. Raising it requires a
human edit to the JSON, visible in review.

⚠️ **Stale-ceiling is a FAIL, not a congratulation.** This is the non-obvious half. A ratchet that
tolerates an unclaimed gain is not a ratchet — migrate five files, leave the ceiling, and five fresh
bypasses enter for free. The fix is one command, so the cost of failing closed here is trivial and
the cost of failing open is the whole mechanism.

**Verified by running each path, not by reading the code** (2026-09-20, pinned at 55):

```
F1  ceiling 54, live 55           → exit 1   "Grandfathered debt GREW: 55 live, ceiling 54 (+1)"
F2  ceiling 56, live 55, no flag  → exit 1   "Ceiling is STALE: 55 live, ceiling still 56"
F3  ceiling 56, live 55, --retighten → exit 0  "Retightened 56 → 55 (1 migrated)"
F4  _ratchet block deleted        → exit 2   "missing a valid '_ratchet.grandfathered_max'"
    restored, clean run           → exit 0   "At the ceiling."
```

---

## 4. The defect class this belongs to, and its third sighting

`scripts/anthropic-import-allowlist.json` carries this note, recorded 2026-07-27:

> "The seven entries below were added retroactively on 2026-07-27. Each shipped AFTER this guard
> landed (2026-05-20) without being allowlisted — **their lanes did not exercise preflight/pre-commit,
> so the guard never fired.**"

That is the same shape as the 2026-09-13 branch-policy finding — *a committed governance rule present
but not authoritative in every execution environment, so a commit appears policy-compliant merely
because the enforcement mechanism was absent* — and the same shape as the 2026-09-07 finding that
merge-to-canonical is latent schema-deploy authorization.

⭐ **Three independent sightings, three separate records, no registry.** The interim rule already
ratified on 2026-09-13 — *absence of the branch hook is never evidence of branch-policy compliance* —
generalizes without modification: **absence of a guard's execution is never evidence of that guard's
invariant holding.** A ratchet is robust against this in a way a procedural guard is not: a ratchet
fails on the *next* run after debt grew, wherever that run happens. A procedural guard that never
fired leaves no trace at all.

---

## 5. Standing

**CENSUS COMPLETE (read-only) · ONE REPAIR TAKEN AND VERIFIED ON ALL FOUR PATHS ·
`pending_migration` RATCHET ⛔ NOT AUTHORIZED · ⛔ NO MIGRATION OF ANY GRANDFATHERED FILE ·
⛔ NO ROUTING CHANGE · ⛔ NO SCHEMA CHANGE · ⛔ NO DEPLOY · PRODUCTION UNTOUCHED.**

Open questions, in gating order:

1. Does `openai_removal.pending_migration` (29 entries) get the same ratchet? It is the same defect
   in the same repository and the repair is now a known quantity — but it is a different guard with
   its own lane, and this census does not take it.
2. Is the generalized rule in §4 recorded as canon, or does the fourth sighting get its own record
   too? The cost of the current arrangement is not any single miss; it is that each sighting is
   re-derived from scratch.
3. ⛔ Nothing here retires any debt. 55 grandfathered surfaces and 29 pending OpenAI migrations are
   unchanged. **The ratchet stops the number growing; it does not make it fall.** That remains
   per-surface migration work, and the tiered-local-inference direction note (§L2) is where the
   grandfathered set would first be classified.
