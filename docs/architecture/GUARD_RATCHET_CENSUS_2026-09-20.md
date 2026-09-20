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
| `check-provider-governance.ts` | `_ratchet.debt_max` + `_ratchet.forbidden_debt_max` | **added by this census** — see §3a |

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

**Both are now repaired** — the first at §3, the second at §3a under a founder act taken the same
day. The class is closed: no guard in this repository still carries an uncapped debt bucket.

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

## 3a. Second repair — `check-provider-governance.ts`

Authorized by founder act 2026-09-20, after §3. Same pattern, two differences worth recording.

**The metric could not have been entry count here, even in principle.** `legacy_backend` allowlists a
path *prefix*, so one entry covers many files: 34 listed entries correspond to **53 live debt files**.
The guard already computed that number (`debtFiles`) and printed it as information. It simply never
checked it. ⭐ *The measurement existed; only the judgement was missing.*

**⭐⭐ A second ceiling, on the FORBIDDEN class — and the reason is the sharper finding of the two.**
The scanner declares its browser-API-key rule `{ forbidden: true }`, and the guard's own failure text
says *"Browser api keys (NEXT_PUBLIC_*OPENAI) are FORBIDDEN — never allowlist; remove the
client-side key."*

**Nothing read that field.** `forbidden` was declared in the rule table and consumed nowhere. A
browser key added to `quarantine_browser_keys` passed exactly like any other debt. So the one class
the policy burns *first*, and the only class that is a **live secret in a shipped client bundle**
rather than an architectural preference, was the single class enforced by prose alone.

`forbidden_debt_max` (pinned at 3) makes the field load-bearing. Its failure path deliberately omits
the "raise the ceiling" option the general path offers: a bundled API key is not a design trade-off
to be re-argued in review.

**⚠️ `--retighten` writes surgically, not by round-trip.** `provider-policy.json` is hand-formatted —
compact single-line objects in `tiers`. A `JSON.parse`/`stringify` rewrite reflowed 58 lines of
unrelated governance text on the first attempt and was reverted. The implemented writer regex-replaces
the two integers and touches nothing else, verified by `git diff --numstat` showing `7 0` after a
retighten — the same 7 lines the ratchet block itself added, and zero deletions.

**Verified by running each path** (2026-09-20, pinned 53 / 3):

```
F1  debt_max 52          → exit 1  "OpenAI debt GREW: 53 live, ceiling 52 (+1)"
F2  forbidden_debt_max 2 → exit 1  "FORBIDDEN (browser key) debt GREW" + "Remove the key."
F3  60 / 5, no flag      → exit 1  both gauges STALE
F4  60 / 5, --retighten  → exit 0  rewrote 60→53 and 5→3; numstat 7/0, no reflow
F5  _ratchet deleted     → exit 2  "missing a valid '_ratchet' block"
    restored, clean run  → exit 0  "At the ceiling on both gauges."
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

**CENSUS COMPLETE · BOTH REPAIRS TAKEN AND VERIFIED BY EXECUTION (4 paths + 5 paths) ·
NO UNCAPPED DEBT BUCKET REMAINS · ⛔ NO FILE MIGRATED · ⛔ NO ROUTING CHANGE · ⛔ NO SCHEMA CHANGE ·
⛔ NO RUNTIME CODE TOUCHED · ⛔ NO DEPLOY · PRODUCTION UNTOUCHED.**

Open questions, in gating order:

1. ✅ **Closed 2026-09-20** — `openai_removal` now carries `debt_max` and `forbidden_debt_max` (§3a).
2. Is the generalized rule in §4 recorded as canon, or does the fourth sighting get its own record
   too? The cost of the current arrangement is not any single miss; it is that each sighting is
   re-derived from scratch.
3. ⛔ **Nothing here retires any debt.** 55 grandfathered sovereignRouter bypasses and 53 live OpenAI
   surfaces are unchanged. **The ratchet stops the numbers growing; it does not make them fall.**
   That remains per-surface migration work, and the tiered-local-inference note (§L2) is where the
   grandfathered set would first be classified.
4. ⭐ The `forbidden_debt_max` finding (§3a) is not really about a ceiling: **three files ship an
   OpenAI key into the browser bundle today**, and the policy's own burn order puts them first. The
   ratchet guarantees a fourth cannot join them. It does nothing about the three, and they are a
   live-secret question rather than an architectural one.
