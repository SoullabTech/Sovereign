# SAFETY-DISCLOSURE-01 · R1 — Member-Act Substrate Census

**Date:** 2026-10-01
**Evidence base:** commit:`7973d9eb667c0787296835f865483a9517a09b88`
**Parent:** SAFETY-DISCLOSURE-01 authority contract
**Purpose:** identify which existing member-act mechanisms actually constitute a governed disclosure crossing.

## Governing distinction

A member gesture, a visibility flag, and a completed disclosure are not the same fact.

R1 asks separately:

1. did the member explicitly act?
2. what object did that act create?
3. can the intended recipient actually read it?
4. is the private source still protected?
5. can the member withdraw or revise what crossed?

## S1 — Portal safety-concern message

### Evidence

The client portal message composer lets the member author a message and select urgency, including `safety_concern`.

The POST route accepts the member-authored body and urgency. When the member selected `safety_concern`, it creates the safety-concern log and initiates practitioner notification.

### Standing

**PROVEN MEMBER-ACT DISCLOSURE + DELIVERY PATH.**

The member acts twice: they author what crosses and explicitly label its urgency.

This path is suitable precedent for an explicit safety off-ramp because it does not disclose private reflection the member did not choose to send.

## S2 — Now What? per-thread Share with your practitioner

### Evidence

`NowWhatRoom` and the field-note route make sharing per-thread and default-private.

The UI checkbox is explicitly labelled `Share with your practitioner`.

The route parses `shareWithPractitioner === true` and writes `can_be_shown_to_practitioner` for that exact carried/authored thread.

The member can later withdraw practitioner visibility without deleting the thread from their own field.

### Standing

**PROVEN MEMBER ACT + DIRECT PRACTITIONER-VISIBILITY CROSSING. RECIPIENT-SCOPE DEFECT FOUND SEPARATELY.**

`app/studio/fields/[memberId]/page.tsx` directly reads `member_field_note_threads` with `can_be_shown_to_practitioner = TRUE`, so the checkbox does create real practitioner-readable visibility. It is a different sharing model from `bringForward()`; no shared-offering object is required for this path.

The same read-side census found a separate Class A defect: the facilitator page gated only on generic active-practitioner status, not on a relationship with the requested member. PR #1678 (`8bb936e62`) repairs that recipient boundary by requiring the authenticated practitioner's practice to hold an active/paused relationship with the target member before any target-member read.

## S3 — Coach-field bringForward

### Evidence

`lib/coachField/bringForward.ts` implements the strongest source-separation architecture found:

- only the client/member in an authorized practitioner-client relationship may bring something forward;
- the act creates a separate encrypted snapshot object;
- the member-owned source remains private and unreachable from practitioner-scoped queries;
- no FK or hydration join gives the practitioner the private source;
- the practitioner reads only the offered snapshot;
- the member may update what is seen or withdraw it;
- withdrawal is silent to the practitioner.

### Standing

**LAWFUL DISCLOSURE OBJECT MODEL · NO CURRENT CALLER FOUND.**

The repository census found no caller of `bringForward()` outside its defining module.

That makes it an available substrate, not evidence of a live member action.

## R1 adjudication

The three mechanisms must not be collapsed:

| Mechanism | Explicit member act | Recipient-readable crossing established | Private source isolated | Revocable |
|---|---|---|---|---|
| Portal safety message | yes | yes | member authors exact sent message | message itself persists |
| Now What share flag | yes | yes — direct facilitator read, relationship-bounded by #1678 candidate | no — practitioner reads the shared thread itself while visible | yes, visibility withdrawal |
| Coach-field bringForward | API enforces member/client actor | substrate yes, caller absent | yes, separate encrypted snapshot | yes |

## Design consequence

SAFETY-DISCLOSURE-01 should not wire crisis recognition directly to any of these mechanisms.

The existing member acts serve three different intentions and should remain distinct:

1. **Send a message** — the correct existing substrate when the member wants to actively contact their practitioner. It carries exact member-authored content and optional `safety_concern` urgency, with an actual notification path.
2. **Share this thread with my practitioner** — the existing Now What? visibility act. It makes that chosen field thread readable in the facilitator view and is revocable. It is not an urgency signal and must not be presented as an alert.
3. **Bring this into my work** — the stronger snapshot-isolation model implemented by `bringForward()`. It keeps later private edits separate from what was offered, but no live caller currently mounts it.

For a member-initiated safety off-ramp, use the message/urgency semantics rather than silently converting field visibility into notification. Whether `bringForward()` should later become a separate relational gesture is a product decision outside this safety lane.

## Refusal

Do not reinterpret `can_be_shown_to_practitioner = true` as automatic crisis escalation.

Do not make `bringForward()` callable by the crisis recognizer.

Do not hydrate a shared offering by joining back to the private field-note source.

Do not use a practitioner relationship as implicit consent.

## Next bounded act

Before any new UI is added, perform one integration design for the Now What? sharing gesture:

- decide whether the existing checkbox should remain a visibility marker, become a `bringForward()` act, or be split into two clearly named acts;
- preserve default private;
- preserve exact member-chosen content;
- preserve withdrawal;
- keep safety urgency as a separate optional member choice rather than system classification.

## Standing

**MEMBER-ACT SUBSTRATES DISTINGUISHED · PORTAL DELIVERY PROVEN · NOW WHAT VISIBILITY INTENT PROVEN BUT CROSSING NOT PROMOTED · BRING-FORWARD MODEL AVAILABLE BUT UNWIRED.**
