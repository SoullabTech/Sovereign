# DECISIONS-UX-07 — Member-Authored Choice / Resolution Substrate Design

**Programme:** SOULLAB-LIVING-ORIENTATION / PERSONAL DECISIONS
**Date:** 2026-09-27
**Status:** DESIGN ONLY · NO MIGRATION · NO API MUTATION · NO UI MUTATION

## 1. The missing human object

The existing Personal Decisions substrate can represent:

- the question / choice under consideration;
- the context around it;
- stakes, time pressure and present state;
- council perspectives;
- lived experiences after the Decision began;
- multiple perspective rounds;
- a generic lifecycle status including `complete`.

It cannot represent the most important terminal human fact:

> **What did the member actually choose?**

`status = 'complete'` records a system lifecycle state.

It does **not** record the member's choice.

This distinction is now load-bearing because the Personal Decisions room has been rebuilt around member authorship. A Resolve control that merely flips `status` would complete the software record while leaving the human act absent.

## 2. Existing fields are not valid substitutes

### `council_result.recommendation`

System-authored perspective. It may influence discernment but can never become the member's chosen outcome.

### `consultant_notes`

Originally practitioner synthesis. Even in personal scope, it is not constitutionally the member's choice.

### `follow_up_intention`

A future-facing intention or experiment. A person may choose one thing and intend another next step. They are different objects.

### `decision_experiences`

Evidence about what happened around the choice. A reflection may contain a choice in prose, but the system cannot infer that a reflection is the member's final decision.

### `threshold_events`

Not suitable as the canonical choice substrate.

`threshold_events` is a broad narrative / trajectory store:

- it admits MAIA-detected events;
- it has no durable `studio_decisions` foreign key;
- its `summary` is a narrative sentence rather than the Decision's chosen outcome;
- it is used as part of a wider life-threshold memory system;
- its existing write route accepts a supplied `memberId` rather than being the Personal Decisions ownership boundary.

A member-authored Decision resolution must not be coerced into a general MAIA trajectory event.

No automatic Threshold Event is authorized by this design.

## 3. Governing resolution law

> **A Decision becomes resolved only when the member explicitly records what they chose.**

Council recommendation is neither necessary nor sufficient.

A member may choose:

- without ever consulting the council;
- after one perspective round;
- after several rounds;
- after lived evidence contradicts an earlier perspective.

The chosen outcome therefore belongs directly to the member-owned Decision, not to a council iteration.

## 4. Why a single `chosen_outcome` column is insufficient

A tempting minimal patch would add:

```text
chosen_outcome TEXT
chosen_at TIMESTAMPTZ
```

directly to `studio_decisions`.

That fails once a Decision is reopened.

If the member later reconsiders and chooses differently, the product would have to either:

- overwrite the earlier choice and erase history;
- clear the earlier choice and make it appear never to have happened;
- or accumulate version semantics inside one mutable field.

All three are weaker than the existing Decision iteration philosophy, which already preserves history rather than rewriting it.

Resolution therefore needs a small append-style event substrate.

## 5. Proposed durable object

### Table: `personal_decision_choice_events`

One row represents one explicit member act in the resolution lifecycle.

Proposed shape:

```sql
CREATE TABLE personal_decision_choice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL,
  member_id UUID NOT NULL,

  event_type TEXT NOT NULL
    CHECK (event_type IN ('choice_recorded', 'reopened')),

  choice_text TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT personal_decision_choice_event_shape CHECK (
    (event_type = 'choice_recorded'
      AND choice_text IS NOT NULL
      AND btrim(choice_text) <> '')
    OR
    (event_type = 'reopened' AND choice_text IS NULL)
  )
);
```

Ownership should be bound to the Personal Decision at the database boundary, not merely trusted from request input.

Preferred ownership enforcement:

```sql
ALTER TABLE studio_decisions
  ADD CONSTRAINT studio_decisions_id_personal_member_key
  UNIQUE (id, personal_member_id);

ALTER TABLE personal_decision_choice_events
  ADD CONSTRAINT personal_decision_choice_owner_fk
  FOREIGN KEY (decision_id, member_id)
  REFERENCES studio_decisions(id, personal_member_id)
  ON DELETE CASCADE;
```

This makes it impossible for a choice event to name one member while pointing at another member's Personal Decision.

## 6. Why `recorded_at`, not `chosen_at`

The system knows exactly when the member recorded the choice in Soullab.

It does not necessarily know when the choice was made in life.

A member may return tomorrow and write:

> I chose yesterday to leave the role.

Calling the database timestamp `chosen_at` would make a factual claim Soullab cannot establish.

`recorded_at` is therefore the truthful default.

A separately member-authored effective date may be considered later if there is a real human need. It is not required for the first substrate.

## 7. Resolution lifecycle

### Open → Choice recorded

The member explicitly authors `choice_text` and chooses:

> **Keep what I chose**

One transaction:

1. locks the owned Personal Decision row;
2. verifies it is not archived or currently consulting;
3. verifies there is no already-current recorded choice;
4. inserts `choice_recorded` with exact member-authored text;
5. updates the compatibility lifecycle mirror to `status = 'complete'`.

### Resolved → Reopened

The member explicitly chooses:

> **Reopen this Decision**

One transaction:

1. locks the owned Personal Decision;
2. verifies it is presently resolved;
3. inserts `reopened` with no synthetic choice text;
4. updates `status = 'active'`.

The earlier `choice_recorded` event remains intact.

### Reopened → New choice

If the member later chooses differently, a new `choice_recorded` event is appended.

History then truthfully reads:

```text
choice recorded
reopened
choice recorded
```

No earlier choice is overwritten.

## 8. Current choice derivation

The current resolution standing is derived from the latest choice event:

- latest event = `choice_recorded` → current choice exists;
- latest event = `reopened` → Decision is open;
- no event + status not complete → open / no choice recorded;
- no event + legacy `status = 'complete'` → legacy resolved state with missing choice text.

`studio_decisions.status` remains a compatibility mirror for existing queries and practice code. For Personal Decisions, the choice-event stream becomes the authority for resolution meaning.

## 9. Legacy `complete` Personal Decisions

No migration may fabricate chosen outcomes for already-complete Personal Decisions.

Specifically, do **not** backfill from:

- council recommendation;
- consultant notes;
- follow-up intention;
- most recent experience;
- MAIA memory;
- Decision title or context.

A legacy complete Personal Decision with no choice event should render truthfully:

> **This Decision was marked resolved before Soullab recorded what you chose.**

and offer two member acts:

- **Record what I chose**
- **Reopen this Decision**

Nothing else is inferred.

## 10. API boundary

Proposed member-scoped endpoint:

`POST /api/studio/decisions/[id]/choice?scope=personal`

Accepted actions:

```json
{ "action": "record_choice", "choiceText": "..." }
```

or:

```json
{ "action": "reopen" }
```

The endpoint:

- derives the member from the authenticated request;
- accepts no `memberId` from the client;
- requires `decision_scope = 'personal'`;
- requires exact member ownership;
- uses a transaction + row lock;
- stores member text verbatim after trimming outer whitespace;
- accepts no recommendation, summary, score, confidence, or generated meaning;
- creates no MAIA memory or Threshold Event.

Suggested first-pass limit: 2,000 characters for `choiceText` at the API boundary. The database remains `TEXT`.

## 11. Race and double-submit behavior

The write must serialize on the Decision row.

After one `choice_recorded` transaction succeeds, a second concurrent record-choice request sees the resolved standing and must not create another current choice.

The UI will disable while saving, but correctness must not depend on UI timing.

Recommended response for an already-current choice:

`409 CHOICE_ALREADY_RECORDED`

The member must explicitly reopen before recording a new choice.

While `status = 'consulting'`, resolution should refuse with `409 CONSULTATION_IN_PROGRESS` rather than race a long-running council write that later sets the Decision active.

## 12. Guard the old status mutation seam

Once the choice substrate exists, Personal Decisions must not be able to bypass it through:

`PUT /api/studio/decisions/[id]?scope=personal { status: 'complete' }`

or a direct Personal `status: 'active'` reopen.

For personal scope:

- `complete` must require `record_choice`;
- reopening a current choice must require `reopen`.

Practice Decisions retain their existing lifecycle semantics. This is a Personal Decisions authority repair, not a Studio-wide status rewrite.

## 13. Read contract

The exact Personal Decision GET should add:

```ts
choiceHistory: Array<{
  id: string;
  eventType: 'choice_recorded' | 'reopened';
  choiceText: string | null;
  recordedAt: string;
}>;

currentChoice: {
  id: string;
  choiceText: string;
  recordedAt: string;
} | null;

resolutionStanding:
  | 'open'
  | 'choice_recorded'
  | 'legacy_complete_without_choice';
```

These are factual lifecycle values, not psychological interpretations.

## 14. Member-facing experience

### Open Decision

The Decision room may offer a quiet explicit threshold:

> **Have you chosen?**

This should not compete with Notice or Perspective while the member is still actively discerning.

### Record choice

The resolution chamber contains one blank member-authored field:

> **What did you choose?**

No council recommendation is copied into it.

No option is preselected.

No system-generated summary appears as a draft.

Primary gesture:

> **Keep what I chose**

### After resolution

The Decision's most stable object becomes:

> **What I chose**

followed by the member's exact words and:

> Recorded in Soullab [date]

not “MAIA recommendation accepted,” “optimal path,” or “decision score.”

### Reopen

`Reopen this Decision` does not erase the prior choice.

The room should say plainly that the earlier choice remains part of the Decision's history and the question is being opened again.

## 15. Relationship to Council

Council perspective and member choice stay separate even when the member agrees with the council.

There is no:

- Accept recommendation button;
- Apply council decision;
- one-click conversion of recommendation into choice text;
- automatic resolution after consultation;
- council-triggered status completion.

If the member wants to use council language, they must author their own choice in the resolution field.

## 16. Relationship to Decision → Daily Anchor

The existing Daily Anchor crossing remains identity/provenance based.

It currently resolves the Personal Decision by:

- Decision id;
- title;
- context;
- exact return path.

UX-07 does not add chosen-outcome text to the crossing payload and does not pre-write the Anchor from the choice.

A resolved Decision may still be carried into today, but Daily Anchor remains independently member-authored.

## 17. Relationship to MAIA memory / Threshold Events

Recording a choice does not automatically:

- create a Threshold Event;
- create a memory atom;
- promote a pattern;
- notify MAIA outside an explicit conversation;
- alter Living Field projection.

A member-authored choice may later become eligible for an explicit memory or cross-facet gesture, but that requires its own authority contract.

## 18. Deletion and custody

Choice events belong to the Decision.

Deleting the Personal Decision may cascade-delete its choice history under the same member deletion authority.

The first version should expose no independent delete or edit endpoint for choice events.

A changed choice is represented by reopen + new choice, preserving history.

Text correction semantics, if needed, should be separately designed rather than silently mutating historical choices.

## 19. Exact non-goals

DECISIONS-UX-07 does not:

- add a migration;
- change the API;
- add Resolve UI;
- create a Threshold Event;
- add outcome scoring;
- compare the member's choice to the council recommendation;
- label the choice wise / unwise / aligned / misaligned;
- infer why the member chose;
- add automatic follow-up.

## 20. Acceptance criteria for the successor

The implementation successor must prove:

1. a member can resolve a Personal Decision without ever consulting Council;
2. the exact member-authored choice is durable;
3. Council output cannot populate the choice field;
4. direct personal `status=complete` cannot bypass the choice act;
5. reopening preserves the earlier choice;
6. a second choice after reopening creates history rather than overwrite;
7. legacy complete Decisions are not backfilled with invented text;
8. Practice Decisions are unchanged;
9. Decision → Daily Anchor remains provenance-only;
10. no memory / Threshold Event is created;
11. temporary witness data can be removed with zero residue.

## 21. Exact stop

**DECISIONS-UX-07 stops at substrate design.**

No schema or runtime change is authorized by this act.

If founder-accepted, the next bounded act is:

> **DECISIONS-UX-08 — MEMBER CHOICE EVENT MIGRATION + PERSONAL-SCOPE API CONTRACT ONLY**

That act should create the durable substrate and API, prove lifecycle semantics at the database/API layer, and stop before adding member-facing Resolve UI.