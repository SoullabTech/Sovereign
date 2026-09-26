# WRITERS-STUDIO-NEXT-01 / A2-12
## MEMBER-FACING EXPLICIT CARRY SOURCE SELECTION EXPERIENCE DESIGN

**Date:** 2026-09-26
**Parent:** `91ab08970d2c6048f51516bfa915c1e186133c17`
**Branch:** `feature/ws-next-a2-12-carry-source-selection-design-20260926`
**Execution packet SHA-256:** `fe81c1428c1ae7c4ddd38d8471c630650f7f497d7a9dea0a6f6c9aeb88ce3356`

## Result

A2-12 defines the member-facing experience for explicitly bringing one eligible earlier MAIA Editorial response into one later Editorial act.

The design is manuscript-first, Editorial-local, one-shot, and explicit.

It does not implement UI.

## Placement

The affordance belongs beside the active Editorial composer:

> **Bring an earlier MAIA response**

It is available only when:
- an A2 relationship is explicitly selected;
- an Editorial thread is active;
- receiver scope is measurable;
- Sanctuary does not make Editorial unavailable.

It does not belong in the relationship card, Review, Focus, manuscript navigation, a history drawer, or a transcript workspace.

## Chooser

Opening the action reveals an inline chooser headed:

> **Earlier in this relationship**

Helper text:

> **Choose one earlier response from MAIA to bring into this turn. Nothing is added unless you choose it.**

No source is preselected.

No source is marked recommended, relevant, best, or likely useful.

Chronological order is presentation only and carries zero authority.
## Eligible source presentation

The current relationship API remains content-free.

A future separate narrow carry-source read seam may return only currently eligible A2-11 sources for the exact receiver thread.

Eligible cards show:
- exact short excerpt from the prior MAIA response;
- source scope label;
- ordinary time/date label if available.

They do not show:
- generated titles;
- generated summaries;
- member turns;
- full transcripts;
- relevance scores;
- relationship synthesis.

Unavailable, deleted, same-thread, wrong-scope, Review and Focus episodes are omitted rather than displayed disabled.

## Selection

The writer may select exactly one source.

Selection appears as a visible removable composer attachment:

> **Earlier MAIA response**

The attachment remains separate from the writer's typed words.

It is not merged into the textarea.

It is not stored as manuscript place, relationship return, or relationship preference.

Choosing another source requires an explicit member act and replaces the first selection.

## One-shot law

The selected source applies to one send gesture only.

After the send is accepted for processing, the selection clears.

It does not silently survive:
- another turn;
- relationship change;
- receiver-thread change;
- manuscript/place change;
- reload;
- Review;
- leaving the relationship.

If the source becomes unavailable at preflight, the selection clears and the Studio says it is no longer available.

No automatic replacement occurs.
## Empty and failure states

No eligible sources:

> **No earlier MAIA Editorial responses are available to bring into this conversation.**

Eligibility-read failure:

> **Earlier MAIA responses could not be checked just now. Nothing has been selected.**

No fallback to episode counts or content-free relationship metadata.

## Visual law

The manuscript remains primary.

Recommended geometry:
- lightweight text action near composer;
- inline chooser above composer;
- 2–3 compact source cards before scrolling;
- exact excerpt clamped to a few lines;
- selected source collapses to one compact chip.

No persistent side rail.
No relationship timeline.
No full-history surface.
No default modal except where mobile constraints require one.
No navigation away from the current Editorial locus.

## Evidence

Suite-first unsafe history/transcript UX:
**0/26 PASS**

Lawful A2-12 design:
**26/26 PASS**

Named UX defeats:
**38/38 DEAD**

Inherited:
- A2-10: 30/30 PASS · 38/38 DEAD;
- A2-9: 20/20 PASS · 30/30 DEAD;
- A2-8: 29/29 PASS · 30/30 DEAD;
- A2-1: 24/24 PASS · 24/24 DEAD.

Repository gates:
- A2-12 strict typecheck PASS;
- design canon PASS;
- no-Supabase PASS;
- provider governance PASS;
- ci:sovereignty PASS;
- voice identity 29/29 PASS;
- git diff --check PASS;
- product/runtime/schema/UI diff ZERO.

## Exact artifact identities

`model.ts` — `d636689d6d890310671bcf45022f950f724645b698904dd52acfe88521d324b9`
`laws.ts` — `1b814b450f95f631c27efc52acde1170fefc0b29c5df8e18d195bdab67008062`
`contract.ts` — `be6289bc92ec73518939322d8ab360871dcfb24d021b3594010d5e36888a3d0d`
`candidates.ts` — `64cff3bb5c29c45c2f348f279f23399c968f5592c841a911a5c34f9a472ac993`
`matrix.ts` — `04149912802b7be09758b764aa58bd4d1a0892ece8792956aef67069a5535bf8`
`tsconfig.ws-next-a2-12.json` — `67840cec495ea01f632baa6ac9c1ed57e11630219d41e03ff0bd94d47f3722fc`

## Recommended successor

If accepted:

> **WRITERS-STUDIO-NEXT-01 / A2-13 — ELIGIBLE CARRY SOURCE READ SEAM + INLINE SELECTION UI IMPLEMENTATION CONTRACT ONLY**

A2-13 should specify the exact eligibility endpoint, response shape, composer state machine, one-shot consumption, and refusal behavior.

It must still stop before product implementation.

## Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-12 MEMBER-FACING EXPLICIT CARRY SOURCE SELECTION EXPERIENCE DESIGN**

No A2-13 work or UI implementation has been opened.
