# JARVIS — PREFLIGHT RESTORATION — 01 · FIND

**Lane mission**: restore the existing repository preflight gate to green on the
lineage T1 must eventually ship against, **without** changing T1, Ideas
behavior, or weakening any gate.

**Canonical lineage**: `clean-main-no-secrets` — the GitHub default branch *and*
the deploy lineage named in `CLAUDE.md`. Head at investigation: `90f401c`.
**Branch**: `feature/preflight-restoration-01`, cut from `origin/clean-main-no-secrets`.

**Phase**: FIND. **No repair was performed.** Every observation below is a
reproduction or a history query; nothing in the working tree was changed.

Reproduced in an isolated `git worktree`, so the frozen T1 checkout
(`feature/ideas-cut02-t1-fault-localization` @ `eb0a7af`) was never touched.

---

## Headline: only ONE of the two failures is a canonical failure

The T1 closure record reported both `check-dark-text-opacity` and
`check:no-direct-anthropic` as red "on the pristine base". That was accurate for
the base it was measured against — **and that base is not the canonical
lineage**. Measured on `clean-main-no-secrets`:

| Gate | Canonical `90f401c` | T1 base `2c7f7e3` | T1 tip `eb0a7af` |
|---|---|---|---|
| `check-dark-text-opacity` | ❌ **RED** | ❌ RED | ❌ RED |
| `check:no-direct-anthropic` | ✅ **GREEN** | ❌ RED | ❌ RED |

So this lane has **one** target, not two.

---

## Failure 1 · `check-dark-text-opacity` — the real canonical blocker

Reproduces on canonical HEAD, exit 1, three hits, all inside the gate's scoped
directories:

```
app/studio/field/page.tsx:1003   text-slate-600 opacity-0  group-hover:opacity-100 hover:text-slate-300
app/studio/field/page.tsx:1085   text-slate-600 opacity-0  group-hover:opacity-100 hover:text-slate-300
app/studio/layout.tsx:113        text-slate-600 opacity-50 group-hover:opacity-100 transition-opacity
```

### It has been red for the whole visible history, and nothing enforces it

- RED at canonical `~0`, `~10`, `~25`, `~50`, and at `37bbf0c` — the **oldest
  first-parent commit in this clone** (52 deep) and the earliest appearance of
  the gate script. It has never been observed green here.
- **No CI workflow runs `npm run preflight`** or the opacity gate. Verified
  across all of `.github/workflows/`.
- The gate is **not in the pre-commit hook** either. It is reachable only via
  `npm run preflight` (and `npm run check:dark-text-opacity`), both run by hand.
- Under `GIT_PRE_COMMIT=1` the script scopes itself to *staged* files, so it
  exits 0 trivially with nothing staged — the same ratchet shape `.githooks/pre-commit`
  documents for `check:design-canon` ("green by construction … you pay only for
  the room you actually touch").

**Consequence for the acceptance gate**: the spec bullet "`npm run preflight`
clean" has been unenforceable on this lineage for as long as this clone can see.
That is the honest reading — it is historical/canonical debt that surfaced when
T1 ran the gate at full scope, not a regression T1 caused or encountered.

### Classification — the three hits are not one kind

**Hits 1 and 2 → `stale gate` (detection bug).** The gate's own header lists,
verbatim, under *"What this does NOT catch (intentionally allowed)"*:

```
#   - group-hover:opacity-*              (group hover — fine)
#   - opacity-0 group-hover:opacity-100  (tooltip pattern — fine)
```

Both hits are exactly that documented pattern. The regex's negative lookbehind
`(?<![a-z]:)` correctly excludes the `group-hover:opacity-100` half, but the
bare `opacity-0` half of the same documented-allowed pair still matches. **The
implementation contradicts its own contract.** These are reveal-on-hover icon
buttons, not text dimmed to unreadability — the footgun the gate exists to catch.

**Hit 3 → genuinely ambiguous; a DECIDE question, not a FIND answer.**
`app/studio/layout.tsx:113` is a drag handle: `opacity-50` at rest,
`group-hover:opacity-100`. The reveal *pattern* is allowed by the header, but
unlike hits 1–2 the resting state is not invisible — it is `text-slate-600`
rendered at 50%, which is a real contrast question on a dark panel. This may be
a **real violation** or an intended subtle affordance. FIND does not settle it;
it is named here so DECIDE can, on evidence rather than by pattern-matching it
to hits 1–2.

**Scope is bounded**: the gate covers eight directories and reports exactly
these three hits. This is not a long tail.

---

## Failure 2 · `check:no-direct-anthropic` — NOT a canonical failure

**Green on canonical** (exit 0: 2 approved, 1 operational, 55 grandfathered).

It is red on the T1 lineage, with a single cause:

```
lib/team/maiaTitleProposal.ts   direct @anthropic-ai/sdk import, not allowlisted
```

| Ref | File present? | In allowlist? |
|---|---|---|
| `origin/clean-main-no-secrets` | **absent** | no |
| `2c7f7e3` (T1 base) | present | **no** |
| `eb0a7af` (T1 tip) | present | **no** |

The file exists **only** on T1's base lineage and was never added to
`scripts/anthropic-import-allowlist.json`. Classification: a **real violation on
a non-canonical lineage** — out of scope for this lane, which targets the
canonical shipping lineage.

⚠️ **It is, however, a T1 integration hazard, and belongs to the integration act
rather than to this one.** T1's base is 41 ahead / 37 behind canonical
(merge base `4b8b34bc`). When T1 is integrated, if `maiaTitleProposal.ts` comes
with it the gate fires on canonical; if it does not, canonical stays green.
Either way that is decided at integration, and **must not be pre-emptively
"fixed" here** — allowlisting a file this lane has not established the need for
would be exactly the gate-weakening the mission forbids.

---

## What FIND did not do

No repair. No gate weakened, bypassed, or rescoped. T1 untouched. No Ideas
behavior touched. No `tsconfig.ship.json` work — that coverage gap remains a
separately named governance issue and no evidence here shows it is required to
make this gate truthful.

---

## For DECIDE

1. **Hits 1–2**: the smallest truthful correction is almost certainly to the
   **gate**, not the code — the pattern is documented as allowed and the regex
   fails to allow it. Correcting a detection bug is not weakening a gate, but
   it must land with a **negative control** proving the gate still catches the
   real footgun (`text-sm opacity-70`, `text-opacity-*`) after the change.
2. **Hit 3**: needs a judgment on whether `opacity-50` at rest on
   `text-slate-600` is the footgun. If yes → repair the code. If no → it joins
   the documented allowance. This is the one place a code change may be
   warranted, and it is in `app/studio/`, which the mission otherwise puts
   off-limits — so the judgment should be explicit.
3. **Enforcement**: even once green, nothing runs preflight in CI. Whether to
   wire it is a *separate* question from restoring it — raised, not assumed.
   Making a gate green that nothing runs restores the acceptance bullet's
   truthfulness but not its force.
