# Witness method — bind the act to the object with a cross-surface invariant

**Recorded:** 2026-09-07, from the PDF-CLEAN production witness
**Status:** method note, generalizable · not a rule, not canon

## The problem it solves

Three witnesses ran this day. Two of them — INGEST-TRANSPORT and NAV-03 — could
not be closed on their evidence alone, because nothing in a screenshot binds the
browser act to the production object. Both needed an explicit operator
attestation:

> *"I performed the fresh import and middle-section click shown in those
> screenshots, and I did not reload between the import and the click."*

That attestation is legitimate and was correctly required. But it is a claim by
a person, not a property of the artifact, and a witness that leans on it for
object identity is weaker than one that does not.

## What worked

The PDF-CLEAN witness produced a **distinctive observable invariant** that
appeared on both sides of the boundary:

```text
member UI          175 sections in the outline
application log    sections: 175
persisted object   175 rows for manuscript e2f9f288-…
```

`175` is arbitrary, specific to this subject, and not guessable. Its appearing
in the member surface AND the authoritative backend record binds the browser
event to the production object without anyone asserting that it does.

## The rule

> When possible, choose a witness subject that produces a distinctive
> observable invariant in **both** the member surface and the authoritative
> backend record.

Character counts work (`1261` on the transport witness). Section counts work.
Anything the subject itself determines, that a coincidental act could not
reproduce, works.

## The limit — stated so this is not over-applied

This replaces attestation for **object identity and persistence**. It does not
replace attestation for **experiential predicates** — "no reload happened",
"I clicked rather than navigated", "nobody else was operating the browser".
Those have no artifact to leave behind and still require a named operator.

A witness therefore has two halves, and conflating them is the error this note
exists to prevent:

```text
did THIS act produce THAT object     → cross-surface invariant
what happened during the act         → operator attestation
```
