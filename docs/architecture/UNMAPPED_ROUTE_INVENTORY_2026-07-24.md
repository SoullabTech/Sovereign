# #717 — Unmapped-Route Inventory (evidence for the strict-mode ruling)

**Date**: 2026-07-24 · **Named tree**: `bd47a3264` (= deployed production SHA)
**Purpose**: evidence artifact only. **No ruling made. `ACCESS_CONTROL_MODE` unchanged.**

## The question this exists to answer

> Would switching to strict block only accidental/unclassified routes, or would it also
> break legitimate public surfaces that were never entered into the matrix?

## Method, and its limit

Enumerated every real UI page under `app/**/page.tsx` (route groups stripped, dynamic
`[param]` routes excluded — they need separate treatment), then matched each against
`config/accessMatrix.ts` `exact` / `prefix` / `regex` rules.

**417 real page routes · 77 have no accessMatrix rule.**

Every one of those 77 is currently served under the permissive unmapped default.

⚠️ **Runtime grading is INCOMPLETE.** Unauthenticated production probes were planned for
every row; sandbox network egress dropped partway through (`/api/health` failed too, and
the container is `Up 8 hours (healthy)` on `bd47a3264` — **the site is fine, the probe
harness is not**). Only `/voice-controller-test` was graded at runtime, earlier: **200,
30,896 bytes, unauthenticated**. The "in-source gate signal" column below is a **grep
over the page and its ancestor layouts** — it names candidates, it does not grade them.
Per this project's own rule: *grep establishes inventory; runtime establishes truth.*
**The runtime column must be filled before any strict-mode decision.**

## Headline numbers

| | Count |
|---|---|
| Real page routes | 417 |
| **Unmapped (no accessMatrix rule)** | **77** |
| Unmapped **with** an in-source gate signal | 12 |
| Unmapped with **no** gate signal found ⚠️ | **65** |

**This is not one route.** Audit 1 and the House-map pass both concluded the exposure was
a single page; that was true of the *mobileAllowlist* subset only. Enumerated against real
pages, the unmapped set is 77.

## Distinguishing categories (as requested)

- **Allowlist entries with no page** — the 6 from the House-map pass (`/history`,
  `/check-in`, `/profile`, `/insights`, `/timeline`, `/how-to-use`). **Not in this table** —
  they have no `page.tsx` and 404. Aspirational, not exposures.
- **Real routes with no rule** — the 77 below.
- **API vs UI** — this inventory is **UI pages only**. `app/api/**/route.ts` is a separate
  and probably larger sweep, not yet run.
- **Dev/demo/debug harnesses**, **internal/founder surfaces**, **member surfaces**, and
  **other/unresolved** — classified in the Kind column by path convention.

## Inventory

| Route | Kind | In-source gate signal |
|---|---|---|
| `/chat-test` | dev/demo/debug | no gate found ⚠️ |
| `/debug/field` | dev/demo/debug | no gate found ⚠️ |
| `/demo/biometric` | dev/demo/debug | no gate found ⚠️ |
| `/demo/disposable-pixels` | dev/demo/debug | no gate found ⚠️ |
| `/enhanced-chat-test` | dev/demo/debug | no gate found ⚠️ |
| `/book-studio/book` | internal/founder | no gate found ⚠️ |
| `/maia/anchor` | member surface | no gate found ⚠️ |
| `/maia/anchor/history` | member surface | no gate found ⚠️ |
| `/maia/field-lab` | member surface | no gate found ⚠️ |
| `/maia/field-lab/legacy-field` | member surface | no gate found ⚠️ |
| `/maia/field-lab/project-field` | member surface | no gate found ⚠️ |
| `/maia/field-lab/relational-navigation` | member surface | no gate found ⚠️ |
| `/maia/field-lab/your-threads` | member surface | no gate found ⚠️ |
| `/maia/guide` | member surface | no gate found ⚠️ |
| `/maia/keep-capture` | member surface | no gate found ⚠️ |
| `/maia/library` | member surface | no gate found ⚠️ |
| `/maia/moments` | member surface | no gate found ⚠️ |
| `/maia/orientation` | member surface | no gate found ⚠️ |
| `/maia/songwriter` | member surface | no gate found ⚠️ |
| `/maia/songwriter/songs` | member surface | no gate found ⚠️ |
| `/maia/soul-mirror` | member surface | no gate found ⚠️ |
| `/maia/vision-studio` | member surface | no gate found ⚠️ |
| `/commons` | other | no gate found ⚠️ |
| `/community` | other | no gate found ⚠️ |
| `/community/chat` | other | no gate found ⚠️ |
| `/community/commons` | other | no gate found ⚠️ |
| `/community/events` | other | no gate found ⚠️ |
| `/community/faq` | other | no gate found ⚠️ |
| `/community/reality-check` | other | no gate found ⚠️ |
| `/community/share` | other | no gate found ⚠️ |
| `/first-witness` | other | no gate found ⚠️ |
| `/helper-fund` | other | no gate found ⚠️ |
| `/helper-fund/apply` | other | no gate found ⚠️ |
| `/helper-fund/contribute` | other | no gate found ⚠️ |
| `/library/videos` | other | no gate found ⚠️ |
| `/model-studio/caseload` | other | no gate found ⚠️ |
| `/model-studio/comms` | other | no gate found ⚠️ |
| `/model-studio/groups` | other | no gate found ⚠️ |
| `/model-studio/marketing` | other | no gate found ⚠️ |
| `/model-studio/media` | other | no gate found ⚠️ |
| `/model-studio/services` | other | no gate found ⚠️ |
| `/model-studio/settings` | other | no gate found ⚠️ |
| `/model-studio/tasks` | other | no gate found ⚠️ |
| `/model-studio/vault` | other | no gate found ⚠️ |
| `/now-what/field` | other | no gate found ⚠️ |
| `/now-what/map` | other | no gate found ⚠️ |
| `/now-what/next` | other | no gate found ⚠️ |
| `/now-what/position` | other | no gate found ⚠️ |
| `/now-what/questions` | other | no gate found ⚠️ |
| `/now-what/reflections` | other | no gate found ⚠️ |
| `/now-what/themes` | other | no gate found ⚠️ |
| `/offerings` | other | no gate found ⚠️ |
| `/open-web` | other | no gate found ⚠️ |
| `/oracle/reflections` | other | no gate found ⚠️ |
| `/pitch` | other | no gate found ⚠️ |
| `/powered-by` | other | no gate found ⚠️ |
| `/press/manuscript` | other | no gate found ⚠️ |
| `/privacy` | other | no gate found ⚠️ |
| `/research/self-awareness` | other | no gate found ⚠️ |
| `/sessions` | other | no gate found ⚠️ |
| `/simple` | other | no gate found ⚠️ |
| `/status` | other | no gate found ⚠️ |
| `/terms` | other | no gate found ⚠️ |
| `/test` | other | no gate found ⚠️ |
| `/test-sage` | other | no gate found ⚠️ |
| `/debug/auth` | dev/demo/debug | source gate |
| `/book-studio/ready-to-write` | internal/founder | source gate |
| `/book-studio/workbench` | internal/founder | source gate |
| `/maia/consciousness-computing/feedback` | member surface | source gate |
| `/maia/living-field` | member surface | source gate |
| `/maia/portal` | member surface | source gate |
| `/maia/prototype` | member surface | source gate |
| `/astrology/report` | other | source gate |
| `/choose` | other | source gate |
| `/home` | other | source gate |
| `/open-in-web` | other | source gate |
| `/signout` | other | source gate |

TOTALS: 77 unmapped real pages · 65 with no in-source gate signal

## What this does not settle

- **Intended audience is unresolved for most rows.** Path convention is a guess, not a
  ruling. Several `/community/*` and `/commons` routes may be intentionally public.
- **API routes are not covered.** A parallel sweep of `app/api/**/route.ts` is required
  before strict mode, since that is where member-scoped data lives.
- **Dynamic `[param]` routes are excluded** and need their own pass.
- **12 rows show a gate signal**; that signal is unverified. Some may gate correctly, some
  may reference auth without enforcing it (the `/api/conversation/turns` pattern from #721).

## Recommended disposition

**Do not flip `ACCESS_CONTROL_MODE` to strict on this evidence.** 65 routes with no gate
signal would deny on flip; an unknown number of them are legitimately public. The flip
would convert a silent exposure risk into a silent availability failure — the exact
trade this inventory exists to prevent making blind.

Suggested order, for a ruling:
1. Fill the runtime column for all 77 (needs working egress).
2. Run the parallel API-route sweep.
3. Triage into: intentionally public → add `public: true` · member-only → add `minTier` ·
   internal → founder-gate like `/voice-controller-test` · dead → delete.
4. **Then** flip to strict, with the matrix complete rather than the mode compensating for
   an incomplete matrix.
