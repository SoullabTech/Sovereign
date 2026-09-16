# PROSPECTIVE-CLAIM-PLAN-01 — P4–P6

**Status:** P4–P6 COMPLETE · offline/shadow evidence only

## P4 · Deterministic renderer

The renderer performs no semantic generation. It concatenates already-authored claim surfaces with non-semantic whitespace and records exact source spans.

A render is valid only when claim count, claim ids, speech acts, standings, exact surface bytes, ordering, and span coverage match the plan.

## P5 · Standing-changing gesture replay

Offline fixtures prove:

- `that is exactly it. MAIA!` binds the exact claim targeted by a prospective confirmation question;
- `no, that's not it` binds that same target without affecting neighboring grounded/question claims;
- opaque retrospective reference remains `AMBIGUOUS` without referent evidence;
- `I already told you` binds a sole question claim;
- generic confirmation across multiple assertive claims remains ambiguous.

Evidence: `P4-P5_OFFLINE_ROUNDTRIP_2026-09-16.json`.

## P6 · Deterministic plan → prose → retrospective round trip

The governing test is:

```text
structured claim plan
→ deterministic fluent render
→ retrospective claim parser
```
The prospective and retrospective ids are intentionally different namespaces. Acceptance requires a one-to-one realization map, not id equality.

P6 result:

```text
prospective claims       3
retrospective units      3
dropped claims           0
unplanned units          0
round trip               PASS
```

The realization map preserved:

- exact rendered bytes and span boundaries;
- one retrospective unit per prospective claim;
- no merged claims;
- no extra claims;
- question structure;
- prospective speech-act class and standing as inherited metadata.

Critically, both `GROUNDED / established` and `CANDIDATE / provisional` parse retrospectively as ordinary assertions. The parser therefore does not rediscover epistemic status from prose. Status travels through the prospective realization map.

Tamper tests rejected both extra unplanned prose and a merged/dropped realization.

Evidence: `P6_DETERMINISTIC_ROUNDTRIP_2026-09-16.json`.
### Relational-Gestalt continuity replay

A Silver Cedar Gestalt fixture preserved the required sequence:

```text
GROUNDED / established  guardian relation
CANDIDATE / provisional orienting-bridge synthesis
QUESTION / open         practice/design edge
```

The renderer preserved all three one-to-one, rejected reopening the established guardian meaning, and rejected candidate laundering into assertive member truth.

Evidence: `P6_GESTALT_ROUNDTRIP_2026-09-16.json`.

### Rejected model-shadow instrument

A local Ollama plan-proposal harness was attempted only as an untrusted auxiliary instrument. It stalled without producing an admissible evidence artifact. Those runs are classified **NO EVIDENCE** and are not part of P6 adjudication.

P6 therefore rests entirely on deterministic claim-plan and round-trip evidence, not on model-generated scores or proposals.
