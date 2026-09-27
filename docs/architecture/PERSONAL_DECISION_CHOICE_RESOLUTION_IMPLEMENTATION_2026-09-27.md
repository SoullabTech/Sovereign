# DECISIONS-UX-08 — Member Choice Event Migration + Personal-Scope API Contract

**Programme:** SOULLAB-LIVING-ORIENTATION / PERSONAL DECISIONS
**Date:** 2026-09-27
**Status:** IMPLEMENTED + LOCAL API/DB WITNESS PASS · NO MEMBER-FACING RESOLVE UI · NOT PROMOTED TO 3597

## 1. Standing

DECISIONS-UX-08 implements the durable substrate authorized by DECISIONS-UX-07 and stops before member-facing resolution controls.

The substrate now represents the human fact the prior Decision model could not:

> **what the member actually chose**

without converting Council recommendation, lifecycle status, or inferred meaning into member authorship.

## 2. Migration

Migration:

`database/migrations/20260927000002_personal_decision_choice_events.sql`

It introduces:

- composite ownership key on `studio_decisions(id, personal_member_id)`;
- `personal_decision_choice_events`;
- exact member / Decision composite foreign-key custody;
- `choice_recorded | reopened` event types;
- exact member-authored `choice_text` only on `choice_recorded`;
- truthful `recorded_at` timestamp;
- database-assigned `event_order` for exact append chronology;
- indexes for Decision chronology and member lookup.

No existing Decision is backfilled.

Legacy Personal Decisions with `status='complete'` and no choice event therefore remain truthfully distinguishable.

## 3. Why event order is explicit

`recorded_at` is human-facing factual time, but two database events can theoretically share a timestamp.

`event_order BIGINT GENERATED ALWAYS AS IDENTITY` is used only for append ordering.

It is not exposed as meaning, score, sequence progress, or member-visible chronology.

## 4. Personal choice action endpoint

New endpoint:

`POST /api/studio/decisions/[id]/choice?scope=personal`

Supported actions:

```json
{ "action": "record_choice", "choiceText": "member words" }
```

```json
{ "action": "reopen" }
```

The endpoint:

- derives member identity from authentication;
- requires explicit personal scope;
- locks the owned Decision row with `FOR UPDATE`;
- refuses archived Decisions;
- refuses while Council consultation is in progress;
- serializes concurrent resolution writes;
- stores trimmed member text without generated substitution;
- mirrors `choice_recorded` to `status='complete'`;
- mirrors `reopened` to `status='active'`;
- creates no Threshold Event;
- creates no memory atom.

## 5. Duplicate / race law

A current choice cannot be overwritten.

If the latest event is `choice_recorded`, another `record_choice` returns:

`409 CHOICE_ALREADY_RECORDED`

The member must explicitly reopen first.

Authenticated concurrency witness submitted two record-choice requests simultaneously against one open Decision.

Observed result:

- one HTTP 200;
- one HTTP 409;
- exactly one choice event row.

This proves the row-lock boundary rather than relying on UI double-click prevention.

## 6. Ownership law

`personal_decision_choice_events(decision_id, member_id)` references the exact pair:

`studio_decisions(id, personal_member_id)`

A direct database attempt to bind another member to the Decision was refused by PostgreSQL with foreign-key SQLSTATE:

`23503`

The API likewise returned 404 when one authenticated member attempted to act on another member's Decision.

## 7. Read contract

The existing exact Personal Decision GET now returns, for personal scope only:

```ts
choiceHistory
currentChoice
resolutionStanding
```

`resolutionStanding` is one of:

- `open`;
- `choice_recorded`;
- `legacy_complete_without_choice`.

Practice Decision responses do not gain these Personal resolution semantics.

## 8. Legacy complete truthfulness

Witnessed legacy state:

- `status='complete'`;
- zero choice events;
- GET returned `legacy_complete_without_choice`;
- no text was inferred or fabricated.

From that state the API supports either:

- explicit `record_choice` with member-authored text;
- explicit `reopen` with no synthetic choice text.

Both were witnessed successfully.

## 9. Generic status bypass is closed

The existing generic Decision PUT endpoint can no longer mutate `status` for Personal Decisions.

Any Personal `body.status` write returns:

`409 PERSONAL_STATUS_REQUIRES_GOVERNED_ACTION`

This prevents a caller from creating contradictions such as:

- recorded choice + `status='draft'`;
- recorded choice + direct `status='active'`;
- `status='complete'` without the member choice act.

Personal archiving remains a separate custody action through the existing archive/delete path.

Practice Decisions retain the previous generic status behavior.

The witness explicitly proved a Practice Decision could still be set to `complete` through its existing PUT route with HTTP 200.

## 10. Exact witnessed lifecycle

One temporary Personal Decision was exercised through:

```text
open
  ↓ record_choice
choice_recorded
  ↓ reopen
open
  ↓ record_choice
choice_recorded
```

Persisted history:

`choice_recorded > reopened > choice_recorded`

First exact choice:

> I chose to leave at the end of the year.

Second exact choice:

> I chose to stay through spring, then reassess.

The first choice remained in history after reopen and after the second choice.

## 11. Consultation collision

A temporary Personal Decision in `status='consulting'` refused `record_choice` with:

`409 CONSULTATION_IN_PROGRESS`

This prevents a long Council write from later overwriting the status mirror after a member has resolved the Decision.

## 12. No ambient memory side effects

Counts were taken before and after all choice / reopen actions for the temporary member.

Observed deltas:

- `threshold_events`: **0**;
- `member_memory_atoms`: **0**.

Resolution therefore remains a Decision-domain member act only.

## 13. Migration replay

The migration was applied and then replayed locally.

Replay completed successfully.

The additive table / column / index guards are idempotent, while the Decision chronology index is explicitly replaced to guarantee the intended `(decision_id, event_order)` definition even after an interrupted development application.

## 14. API witness matrix

| Case | Result |
|---|---|
| Initial open Decision read | 200 · `open` · 0 events |
| Direct Personal status complete | 409 governed-action refusal |
| Record first choice | 200 · `choice_recorded` |
| Exact GET after record | complete · currentChoice present |
| Duplicate current choice | 409 `CHOICE_ALREADY_RECORDED` |
| Reopen | 200 · `open` |
| Exact GET after reopen | active · currentChoice null · history preserved |
| Direct Personal status active | 409 governed-action refusal |
| Direct Personal status draft | 409 governed-action refusal |
| Record second choice | 200 · prior history preserved |
| Choice during consulting | 409 `CONSULTATION_IN_PROGRESS` |
| Other member's Decision | 404 |
| Legacy complete GET | `legacy_complete_without_choice` |
| Record legacy choice | 200 |
| Reopen legacy complete | 200 |
| Practice status complete | 200 · unchanged practice behavior |
| Two concurrent record requests | 200 + 409 · one event only |
| Mismatched DB owner | FK refusal `23503` |
| Threshold Event delta | 0 |
| Memory atom delta | 0 |
| Cleanup | member residue 0 · choice residue 0 |

## 15. Explicitly not implemented

UX-08 does not add:

- a Resolve button;
- a `What did you choose?` field;
- choice-history presentation;
- Reopen UI;
- outcome evaluation;
- comparison of member choice to Council recommendation;
- MAIA commentary on the choice;
- Daily Anchor payload changes;
- memory promotion;
- Threshold Events;
- production promotion.

## 16. 3597 standing

`localhost:3597` remains on the accepted House + Changes candidate.

DECISIONS-UX-08 was implemented and witnessed on the isolated Decisions line (`localhost:3699`).

## 17. Exact stop

> **DECISIONS-UX-08 — PASS · DURABLE CHOICE/REOPEN SUBSTRATE + PERSONAL API CONTRACT PROVEN · NO RESOLVE UI · STOP**

If founder-accepted, the next bounded act is:

> **DECISIONS-UX-09 — MEMBER-FACING WHAT-I-CHOSE + REOPEN EXPERIENCE ONLY**

That act should bind the proven substrate into the Personal Decision room, including truthful legacy-complete handling, then stop before any new cross-facet or memory behavior.