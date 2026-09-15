# Retrieval Evidence Ruling — `SOURCE-CUSTODY-PII-01`

**Status:** Founder ruling, in force. Recorded **2026-09-15**.

⭐ **PRE-REGISTERED. This document was committed BEFORE the A1–A4 production
queries were run, and git history is the proof.** That is its entire purpose:
an evidence rule written after seeing a result is not a rule, it is a
rationalization. Whatever A1 returns, the classes below were fixed in advance.

---

## The evidence ladder

For any personal material found in `ain_knowledge_chunks`, these classes remain
distinct:

```
ELIGIBLE FOR INGESTION
      ≠
INGESTED INTO PRODUCTION
      ≠
AVAILABLE TO RETRIEVAL
      ≠
RETRIEVED DURING A TURN
      ≠
SURFACED TO A MEMBER
```

⛔ **No later state may be inferred solely from an earlier state.**

---

## Production ingestion

Rows in the production corpus establish:

> `INGESTED INTO PRODUCTION = VERIFIED`

They do **not** establish that a retrieval query ever selected those rows.

## Member retrieval

`RETRIEVED TO A MEMBER` may be recorded **VERIFIED** only from evidence capable
of identifying the relevant retrieval act: preserved retrieval traces,
sufficiently specific logs, durable provenance, or equivalent direct evidence.

⛔ The following do **not** establish retrieval, individually or together:

- the chunks existed;
- the retrieval system could search them;
- a member used MAIA while they existed;
- the chunks would have matched a plausible query.

## Absence of evidence

If the system did not preserve evidence capable of answering the historical
retrieval question:

> `RETRIEVAL = UNKNOWN`

If the relevant historical evidence no longer exists and cannot be reconstructed
without inference:

> `RETRIEVAL = UNKNOWN · HISTORICALLY UNRESOLVABLE`

⛔ Do not convert either into `RETRIEVAL = NO`.
⛔ Do not convert either into `RETRIEVAL = YES`.

## Remediation does not rewrite evidence history

Targeted deletion of unauthorized corpus rows may proceed once their presence is
verified. Successful deletion establishes **present absence after remediation**.

⛔ It does not establish whether historical retrieval occurred, and does not
alter the evidence class of that historical question.

## Governing principle

> **An unanswered historical question remains unanswered. The programme must not
> manufacture certainty merely because certainty would make closure easier.**

This protects in both directions. If A1 is positive, nobody may later inflate
*present in the table* into *MAIA disclosed this to members*. If retrieval
telemetry is absent, nobody may soothe the incident by converting missing
evidence into *it never happened*.

---

## Result form — fill only these slots

⭐ The form is part of the ruling. There is deliberately **no free-text verdict
field**, because that is where inference creeps in. Each line takes one of its
own listed values and nothing else.

```
A1 · known tester sources in ain_knowledge_chunks
    source files with rows ......... <count>
    chunks per source .............. <path: count, …>
    INGESTED INTO PRODUCTION ....... VERIFIED | VERIFIED ABSENT (these sources only)

A2 · corpus shape
    total chunks ................... <count>
    distinct sources ............... <count>

A3 · broader human-record signals
    sources flagged ................ <count>
    (classification required before any action — a signal is not a finding)

A4 · distinct email strings per flagged source
    <path: count, …>
    (distinguishes one support address in an essay from a roster)

RETRIEVAL
    class .......................... VERIFIED | UNKNOWN | UNKNOWN · HISTORICALLY UNRESOLVABLE
    basis .......................... <the specific evidence, or "none preserved">

REMEDIATION (only if A1 > 0)
    rows deleted by source_file .... <count>
    present absence verified ....... YES | NO
    historical retrieval class ..... UNCHANGED BY THIS DELETION
```

⚠️ `VERIFIED ABSENT` on A1 covers **those three source files only**. It is not a
statement about the corpus; that is what A3/A4 are for.

---

## Standing at the time of this ruling

```
ACT 4 admission guard ......... ✅ landed (023cd5e9b)
zero-corpus safeguard ......... ✅ landed (56b4481d9)
retrieval evidence law ........ ✅ this document
A1–A4 ......................... ⭐ NOT YET RUN
B / D / R11 / R12 ............. ⛔ HOLD
corpus rebuild / embed job .... ⛔ HOLD
```

Queries: [`scripts/witness/source-custody-act4-founder-queries.sql`](../../scripts/witness/source-custody-act4-founder-queries.sql)
— read-only, counts and paths only, no personal value ever selected.
