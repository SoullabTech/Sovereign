# SOUL-SERVICE-03B — Disconfirmation-Aware MAIA Reality-Veto Runtime

**Date:** 29 September 2026
**Status:** LOCAL RUNTIME CANDIDATE
**Base:** 03A at `c8d22c04ea4306f6bdf7f1858ea421fb588953e6`
**Production:** closed
**Persistence:** none
**Memory:** none

## Purpose

03B asks real local MAIA one narrow question:

> **What is the evidentiary relationship between the historical expectation and the returned consequence?**

MAIA may return only:

- supports;
- complicates;
- contradicts;
- insufficient.

## Authority design

The model does not author member-facing explanation.

The server maps the enum to governed grammar.

The member then decides whether to:

- keep;
- weaken;
- narrow;
- revise;
- abandon;
- leave unresolved.

## Reality-veto requirement

The key case is:

Expectation:

> “I expect both readers to say the core argument is hard to follow.”

Returned member report:

> “Both readers said the core idea was clear. One lost the thread at the chapter transition; the other understood the transition but found the ending abrupt.”

The model should classify this relationship as:

> **contradicts**

The server renders:

> **The returned report does not support the earlier expectation as stated.**

This does not establish a general law.

## Non-self-sealing requirement

The runtime fails if it attempts to preserve the prior expectation by recasting contradictory evidence as hidden confirmation.

## Stateless route

`/api/maia/soul-service/reality-veto-pilot`

Input:

- expectation;
- consequence.

No:

- member ID;
- session;
- conversation history;
- memory;
- relation history;
- persistence.

## Production closure

The route returns 404 in production.

## Exact stop

03B may be locally stress-tested, founder-witnessed, and committed to its feature branch.

It may not be merged, deployed, persisted, used to score real-life outcomes, or used to automatically rewrite autobiographical memory.

**STOP before merge or production.**
