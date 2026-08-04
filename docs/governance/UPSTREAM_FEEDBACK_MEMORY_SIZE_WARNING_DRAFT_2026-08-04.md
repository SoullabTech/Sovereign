# Upstream product feedback — memory-size warning · DRAFT

**Date:** 2026-08-04 · **Target:** Claude Code product feedback
**Authorized:** drafting only · **⛔⛔ NOT SENT — sending requires founder approval of the wording**
**Governed by:** [`MEMORY_SIZE_WARNING_AUTHORITY_2026-08-04.md`](./MEMORY_SIZE_WARNING_AUTHORITY_2026-08-04.md) §6.2

```
STATUS
  draft            READY FOR REVIEW
  wording approval PENDING (founder)
  sent             NO
  channel          NOT SELECTED
```

⚠️ **This file is the artifact under review, not a record of a filing.** If it is ever sent, that is a
separate act and should be recorded as such — ⛔ do not let the existence of this draft be read later
as evidence that a report was filed.

---

## Reportable body — send exactly this, nothing above or below it

> **Subject: memory-size warning issues a compaction imperative without checking whether compaction is permitted**
>
> The built-in memory-size warning issues an imperative recommendation to compact based solely on file
> size — in our case, *"approaching the 24.4KB read limit. Compact it to under 17.1KB now."*
>
> The problem is not that it reports size. Size telemetry is useful and we want to keep it. The problem
> is that it moves directly from measurement to recommendation without any check on whether the
> recommended action is permitted.
>
> In a governed repository, the structure of a memory index can itself be under change control: size
> telemetry may be advisory, while compacting or splitting the index requires explicit project
> authorization. When those two things are true at once, the warning's imperative is an instruction to
> perform an act the project does not permit — and it fires on every write, so the instruction to
> violate the project's own rules is the most frequently repeated instruction in the session.
>
> A concrete illustration of how the targets can diverge: we deliberately settled our root index at
> ~20K characters against a project ceiling of ~25K. The warning's demanded target (~17.1KB) sits
> *below* the state we had just chosen, so complying would have undone a deliberate decision. There was
> no local configuration surface to adjust or silence this — we checked user and project
> `settings.json` / `settings.local.json` and every hook script, and found nothing; the warning appears
> to be emitted by the memory feature itself.
>
> **What we'd ask for, in preference order:**
>
> 1. **Separate observation from recommendation.** Report the measurement and let the reader decide —
>    e.g. *"Root memory index: 20,662 / 24,986 characters (17% headroom)"* — rather than issuing a
>    "compact it now" imperative.
> 2. **Failing that, make the recommendation configurable or suppressible while retaining the
>    measurement.** A project should be able to keep the telemetry and turn off the instruction.
> 3. **If thresholds stay fixed,** it would help for the recommended target to be expressed relative to
>    the actual read limit rather than as a fixed lower number that a project may have deliberately
>    chosen to sit above.
>
> The general principle we're pointing at: a tool that measures has standing to *report*; it does not
> have standing to *authorize*. Recommendations that skip the permission question put automated
> advice in conflict with project governance, and the tool always repeats itself more often than the
> governance does.

---

## Review notes (⛔ NOT part of the report — do not send this section)

**Why it is scoped this way**

- ⭐⭐⭐ It states a **general property** (size telemetry advisory ⊥ compaction authorized) and a
  **general remedy**. It does not ask the harness to understand our governance system — per §6.2, that
  ask would be unactionable and would invite a bespoke fix instead of a design fix.
- ⭐ It leads with *"we want to keep the measurement"* so the request is not misread as "turn the
  warning off." The defect is the missing permission check, not the telemetry.
- ⭐ It gives one concrete number pair because a product report without a reproducible symptom tends to
  be triaged as an opinion.

**Privacy / egress check** — ⭐⭐⭐ this is outward-facing; it leaves the project permanently:

| | |
|---|---|
| memory *contents* | ⛔ none — no entries, hooks, links, or topic names |
| project name, repo, domain, member data | ⛔ none |
| what *is* disclosed | that we run a governed memory index, its approximate size and ceiling, and that we checked settings/hooks |

⚠️ The two size figures (~20K / ~25K) are the only project-specific facts in the body. They are
structural, not sensitive. **If even that is unwanted, strike the illustration paragraph** — the report
still stands on items 1–3 without it.

**Deliberately quoted from the recalled figures, not the current measurement.** The body cites ~20,662
against the ceiling because that describes *the state that was accepted when the conflict occurred* —
which is the situation being reported. ⛔ It is **not** a current-state claim, and it does **not**
contradict the canonical current measurement (23,044 / 24,986 — 1,942 chars, 7.8%) recorded in the
governance record §4. ⚠️ If the wording is revised, keep this distinction intact: **the report
describes an incident; the governance record reports the present.**

**Open before sending**

1. **Wording approval** — founder.
2. **Channel not selected** — in-product `/bug` or feedback command, GitHub issue, or another route.
   ⛔ Choosing the channel is part of the sending decision, not part of drafting.
3. **Attribution** — whether it goes under the founder's name or the project's.
