# DEFECT — Builder Capacity Coverage

**Date:** 2026-08-10 · **Class:** ⭐ **architectural** — governance coverage, not lifecycle
**Status:** RECORDED — ⛔ not fixed, ⛔ no remedy chosen
**Founder ruling 2026-08-10:** elevate as a **distinct** defect; ⛔ do not fix in the authority-scope lane;
⛔ do not merge with claim-release latency.

---

## §1 — Statement

> **Concurrency accounting does not cover active development sessions that never enter through
> `session.mjs open`. Reported capacity can therefore materially understate actual parallel work.**

## §2 — Observation

`session.mjs status`, 2026-08-11T02:41:29Z:

```
Claude sessions active: 2 / 2
⚠ 10 distinct sessions observed in transcripts vs 2 Builder-governed — 8 lane(s) are UNGOVERNED.
  The budget above governs only sessions that called `session.mjs open`.
```

**Coverage: 2 of 10 — 20 %.** Stable across two readings three minutes apart (22:38, 22:41).

## §3 — Why this outranks claim-release latency

The two defects are **opposite failures of the same number**, and must not be conflated:

```
CLAIM RELEASE LATENCY      → governed work occupies capacity too long
                             (capacity OVERSTATES load; self-clearing on a 4h clock)

CAPACITY COVERAGE          → work may occupy no governed capacity at all
                             (capacity UNDERSTATES load; does not self-clear)
```

⭐ **The second can make the capacity number itself misleading.** A latency fix improves an accounting
figure that already omits 80 % of the lanes. Sequencing that ignores this would optimize the wrong
quantity.

⭐ **The higher-order lesson (founder, 2026-08-10):** *claim correctness is not enough if entering the
claim system is optional.* Builder OS currently governs **participating** lanes, not **actual parallel
work**. The next Builder-governance evolution should examine **coverage of work**, not only the
**lifecycle of claims already known to Builder OS**.

## §4 — Live consequence already observed

During the 2026-08-10 authority-scope adjudication: capacity read **2/2 (full)** while both slots
were held by claims whose processes were dead, **and** the one lane doing real `authority_scope`
implementation held **no claim at all** (custody class C). Capacity accounting and actual custody had
come apart **in opposite directions simultaneously** — the exact compound failure this defect makes
possible. Evidence: `JARVIS_CLAIM_CUSTODY_AND_AUTHORITY_SCOPE_ADJUDICATION_2026-08-10.md` §3, §6.

## §5 — Secondary finding: the coverage number is display-only

`scripts/builder/session.mjs:632-633` emits the ungoverned-lane count via `console.log` inside the
human-readable renderer. It is **not** part of `status --json`, so **nothing can gate, alert, or
regression-test on coverage.** Any remedy will likely need it as a first-class field.

## §6 — Candidate remedy directions (⛔ none chosen — ⛔ do not jump to one)

1. **Session discovery** — reconcile transcript-observed sessions against the registry; report only.
2. **Admission enforcement** — refuse or warn on writable work outside a claim. ⚠️ highest blast radius.
3. **Launcher integration** — make `open` automatic at session start, so entry stops being optional.
4. **Honest reporting** — surface `governed / observed` as a first-class metric and stop presenting
   `active/limit` as if it described all parallel work.

⚠️ The remedy space spans mechanism, ergonomics, and policy. The founder ruling is explicit that this
**needs its own unit** precisely because the remedy is not obvious.

## §7 — Not claimed here

⛔ No unit opened · no remedy selected · no code inspected beyond §5 · no session enumerated or named
beyond the aggregate count reported by the tool itself.
