# Upstream product feedback — memory-size warning · DRAFT

**Date:** 2026-08-04 · **Target:** Claude Code product feedback
**Authorized:** drafting only · **⛔⛔ NOT SENT — sending requires a channel decision**
**Governed by:** [`MEMORY_SIZE_WARNING_AUTHORITY_2026-08-04.md`](./MEMORY_SIZE_WARNING_AUTHORITY_2026-08-04.md) §6.2

```
STATUS
  body             FINAL — wording approved (founder, 2026-08-04)
  refinements      APPLIED — generic example · preference-ordered asks · no quoted string
  channel          RULED — in-product feedback > GitHub issue > other official channel
  attribution      RULED — Kelly's own name, NOT the project's identity
  sent             NO — the send is Kelly's act; Claude has no tool for it
```

⚠️ **This file is the artifact under review, not a record of a filing.** If it is ever sent, that is a
separate act and should be recorded as such — ⛔ do not let the existence of this draft be read later
as evidence that a report was filed.

⭐⭐⭐ **Send the reportable body ONLY.** Everything below the rule at the end is local review material.
⛔ No project names · ⛔ no repository names · ⛔ no governance document names · ⛔ no size figures,
current or historical · ⛔ no review notes.

---

## Reportable body — send exactly this, nothing above or below it

> **Subject: memory-size warning issues a compaction imperative without checking whether compaction is authorized**
>
> The built-in memory-size warning is valuable because it surfaces an observable measurement. However,
> it also issues an imperative recommendation to compact, without any mechanism to determine whether
> compaction is actually authorized under the project's governance.
>
> The problem is not that it reports size. The measurement is useful and we want to keep it. The
> problem is that it moves directly from measurement to recommendation, with no check on whether the
> recommended action is permitted.
>
> A project may intentionally govern its memory using a policy other than the warning's
> recommendation. In that case the measurement remains useful, but the recommendation may be incorrect,
> because it has not consulted the project's governing authority. Where governance is explicit,
> measurement and authorization are intentionally separate — and the warning collapses them. Because it
> fires on every write, an instruction that conflicts with the project's own rules ends up being the
> most frequently repeated instruction in the session.
>
> We also found no way to adjust this locally: we checked user- and project-level `settings.json` and
> `settings.local.json` and all hook scripts, and found no configuration surface. The warning appears
> to come from the memory feature itself.
>
> **What we'd ask for, in order of preference:**
>
> 1. **Separate the observation from the recommendation** — report the measurement and let the reader
>    decide.
> 2. **If recommendations remain, allow projects to suppress or customize them independently of the
>    measurement** — so a project can keep the telemetry without the imperative.
> 3. **If neither is possible, make the recommendation relative to the actual configured limit** rather
>    than a fixed threshold.
>
> The general principle: a tool that measures has standing to *report*; it does not have standing to
> *authorize*. A recommendation that skips the permission question puts automated advice in conflict
> with project governance — and the tool will always repeat itself more often than the governance does.

---

## Review notes (⛔ NOT part of the report — do not send this section)

**Founder refinements applied 2026-08-04**

| Refinement | Applied |
|---|---|
| Replace the project-specific illustration (~20,662 / ~25K) with a general example | ✅ removed; generic paragraph substituted verbatim from the founder's wording |
| State the asks in explicit order of preference | ✅ 1 separate · 2 suppress/customize independently of measurement · 3 relative to configured limit |

⭐ The refinements also **retired an open question**: the earlier draft deliberately quoted the
historical figure to describe the incident state, which required a paragraph of explanation to keep it
from reading as a current-state claim. With the generic example that tension disappears — the report no
longer asserts anything about our sizes at all, so nothing needs disambiguating. **Fewer facts, fewer
ways to be misread.**

**⭐ Resolved: no literal warning text, no thresholds** (founder, 2026-08-04)

The quoted product string was removed entirely — the body now says *issues an imperative
recommendation to compact*, and nothing is quoted.

> The purpose of the report is to describe a **product behavior**, not to help the recipient identify
> the exact warning string. A team that owns the feature will know which warning is meant from the
> description.

⭐⭐⭐ **Quoting would not have strengthened the report, but it would have made it brittle** — a
report pinned to a literal string decays the moment the string is reworded, and the design issue it
describes would still be live. **Describe the behavior, not the artifact.**

⛔ Do not reintroduce the quote, the thresholds, or a "for reference, the exact text is…" appendix in
any later revision.

**Privacy / egress check** — ⭐⭐⭐ this is outward-facing; it leaves the project permanently:

| | |
|---|---|
| memory contents | ⛔ none |
| project / repository / governance-document names | ⛔ none |
| size figures, current or historical | ⛔ none — removed by refinement 1 |
| review notes | ⛔ none — this section is local-only |
| what *is* disclosed | that we run a governed memory policy, and that we checked settings and hooks for a config surface |

⭐ The residual disclosure is now **structural only**: that a project can have a memory policy of its
own. That is the premise of the report and cannot be removed without removing the report.

**Channel — founder preference, in order (2026-08-04)**

1. **In-product feedback**, if the harness provides it — this is product behavior, not a bug in this
   repository, and the in-product channel routes it to the team that owns the feature.
2. **GitHub issue**, if the project publicly tracks product issues there.
3. **Any other official support channel**, if neither of the above fits.

**Attribution — founder ruling:** send under **Kelly's own name**, ⛔ not under the project's identity.

> The report is framed as a product observation from a user of the tooling. It doesn't require the
> recipient to know anything about Soullab or the governance model, and a personal name keeps it
> straightforward.

⭐ Attribution and scope agree: a fully generic body sent under a project identity would invite the
question *"what project, and why does its policy matter?"* — the exact framing the refinements removed.

**⛔⛔ Who performs the send**

The draft is send-ready, but **Claude did not and cannot send it.** There is no tool here that files
product feedback; the in-product channel is an interactive command, and the report goes out under
Kelly's name from Kelly's account. **The sending act belongs to Kelly.**

⭐ This is not a technicality. Sending is outward-facing and irreversible — a filed report is public or
semi-public and cannot be recalled. Drafting was authorized; the send is a separate act performed by
the person whose name is on it.

**If it is sent, record it.** Add the date, channel, and any tracking identifier to this file, and flip
`sent` in the STATUS block. ⚠️ Until then this file remains a draft — ⛔ its existence is not evidence
that anything was filed.
