# Pre-commit hook reconciliation — decision memo (2026-08-09)

Follows `docs/ops/INSTRUMENT_REGISTRY_2026-08-09.md` §3.

> **STATUS: §2 APPLIED 2026-08-09 (founder-approved). §3 items remain OPEN debt.**
> Applied: `setup-githooks.sh` now installs `.githooks/pre-commit` verbatim (`cp`), the versioned
> file contains exactly the installed body, `check:no-direct-anthropic` added to the commit gate,
> stale installer comment removed. Verified: installed `pre-commit.old` is **byte-exact** with
> `.githooks/pre-commit`; beads chaining wrapper preserved; worktree-safe `--git-common-dir`
> resolution intact.
> Decisions on §3: **fix the debt, then bind** for both red checks; **run `--strict` in preflight
> first** for `check:no-phi-enc`. None of the three is bound yet — they are open work, tracked below.

## 1. Verified binding + clean-tree state

Run in worktree `mystifying-sutherland-05674d`, clean tree, 2026-08-09.

| check | clean-tree exit | bound to | actually runs? |
|---|---|---|---|
| `check:no-supabase` | 0 | installed pre-commit body | ✅ yes |
| `check:no-openai` | 0 | installed pre-commit body | ✅ yes |
| `check:no-direct-anthropic` | **0 (green, 2s)** | `preflight` (pkg:100) | ⚠️ human-invoked only |
| `check:no-phi-enc` | 0 (warn-only; no `--strict`) | `guardrails` (pkg:60) | ❌ `guardrails` has **zero callers** |
| `check:phi-inventory` | **1 (RED)** | nothing | ❌ never |
| `check:no-inline-names` | **1 (RED)** | nothing | ❌ never |

§3 said the four checks are "dormant at commit-time." Verified reality is broader: **three of them
are dormant *everywhere*** — no hook, no CI workflow, no preflight.

### Red detail (pre-existing debt, not introduced here)
- `check:phi-inventory` — `No accessor configured for encrypted table 'practitioner_client_notes'`.
  This is a **substantive PHI gap**, not a wiring gap. 63 PHI column entries inventoried; one
  encrypted table has no accessor.
- `check:no-inline-names` — 6 `preferred_name || name` sites (`app/api/members/enter/route.ts:100`,
  `app/api/members/lookup-email/route.ts:35`, `app/api/practitioner/practice-field/invite/route.ts:51`,
  `app/maia/portal/page.tsx:46`, `components/team/DMProfileCard.tsx:48`,
  `scripts/send-beta-reengagement.mjs:75`).

### Two stale claims found in the installer
`scripts/setup-githooks.sh:14-16` says `check:no-direct-anthropic` is *"currently RED on
pre-existing debt"* and *"runs in CI (ci:sovereignty)"*. Both are now false: it exits **0**, and
`ci:sovereignty` (pkg:98) does **not** contain it. Further, **`ci:sovereignty` itself has no
caller** — no `.github/workflows/*` invokes it. Its workflows run only `check:diagrams`, `lint`,
`typecheck`, `test:ci`, `build`.

### `check:no-phi-enc` is a third false-green
It exits 0 while printing PHI leak warnings; failure requires `--strict`. Binding it as-is would
add a gate that cannot fail — the same anti-ritual problem in a new place.

## 2. Recommendation — (b)'s content via (a)'s mechanism, plus one real addition

Option (a) as posed is **not available today**: you cannot install two checks that are red.
Option (b) alone leaves the divergence *class* alive (two files kept in sync by discipline).

**Recommended:**

1. **Kill the divergence structurally.** Change `setup-githooks.sh` to `cp .githooks/pre-commit`
   (exactly as it already does for pre-push at line 71), and rewrite `.githooks/pre-commit` to
   contain *only what is installed*. One copy, mechanically enforced — the hook file can no longer
   drift from the installed hook, because it **is** the installed hook. Preserves the beads
   `pre-commit.old` chaining and the worktree-safe `--git-common-dir` repair.
2. **Add `check:no-direct-anthropic` to the commit gate.** Green, 2s. A genuine gain, not a
   re-statement. Delete the stale "currently RED / runs in ci:sovereignty" comment.
3. **Do NOT bind the two red checks or the false-green.** Instead give each a named home and a
   named gap — see the open question below. No check is deleted.

## 3. Open question — where the three unbound checks go

Each needs a different answer; none should be silently dropped.

- **`check:phi-inventory` (RED, PHI).** The red is a real finding. Two sub-decisions: (i) fix the
  `practitioner_client_notes` accessor so the check can go green, then bind it to pre-commit
  (1s, cheap); or (ii) bind it to `preflight`/CI as blocking now, accepting that it fails until
  fixed. Recommend (i) — the accessor gap is the actual security item and should be worked, not
  gated around.
- **`check:no-inline-names` (RED, correctness/PHI-adjacent).** 6 known sites. Recommend: fix the 6,
  then bind to pre-commit. Until then it belongs in `preflight`, not the commit gate.
- **`check:no-phi-enc` (green but warn-only).** Recommend deciding whether `--strict` is the
  intended posture. If yes, run it strict in `preflight` first, absorb the findings, then bind.
  If no, it is an advisory tool and should be labelled one — not a gate.
- **Adjacent, out of scope here:** `guardrails` and `ci:sovereignty` are both defined and both
  uncalled. They read as gates and are not. Same defect class, own lane.
