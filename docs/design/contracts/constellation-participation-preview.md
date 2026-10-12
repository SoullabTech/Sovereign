---
room: Constellation — Participation Rehearsal
human_activity: reviewing how a writer could voluntarily describe one experience without surrendering private writing or agreeing to unrelated marketing use
surfaces:
  - app/founder/constellation/participation/**
change_class: experiential
principles:
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — trying a room, sharing feedback, naming an invitation, and granting public-use permission are different acts
  - INHABITABLE_ARCHITECTURE — two simple questions and a separate optional attribution choice, not a questionnaire about the person
  - MAIA_OATH — a person's uncertainty or refusal is not interpreted as a deficit or hidden motive
reference_surfaces:
  - docs/design/contracts/constellation-learning.md
  - docs/design/contracts/writers-studio-doorway.md
shared_with_house: quiet human language, explicit agency, visible evidence limits, a real exit
distinct_to_room: a founder-only rehearsal of voluntary feedback. It makes separate choices visible without enrolling anyone or retaining a report.
screenshot_desktop: docs/design/contracts/screenshots/constellation-participation-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/constellation-participation-mobile.png
experience_verification: C7B1 REVIEW-ONLY REHEARSAL, 2026-10-03. Actual component walked through a temporary development wrapper with example choices, not member feedback or real consent. Desktop 1440x1000 and mobile 390x844: no preselected answers, separate optional attribution, activity change clears usefulness, exact review before completion, edit-and-review again, clear/restart and reload reset all passed. During each scripted interaction window there were zero fetch/XHR/non-GET requests and zero Storage.setItem writes. The real signed-out founder route did not mount the preview. These are local preview checks, not authenticated production access, deployed consent, durable withdrawal, or measured product usefulness. Screenshots carry a test-harness banner; the existing shell's temporary audio-unlock toast was allowed to clear naturally before final review captures.
---

# Did this help your work?

**One optional reflection. Your writing stays yours.**

## Interaction

The rehearsal opens with a plain invitation and a visible skip action. Trying the Studio is not consent to a study. All consent-like and submission-like gestures visibly identify themselves as preview actions.

A participating writer would first select what they tried: discussing a passage or considering a revision. Then they could describe usefulness: helped, partly, not sure, did not help, or prefer not to answer. No response is ranked or translated into an engagement score. A writer may preserve the original text and still find the experience useful.

Changing the activity resets the usefulness answer. A judgment about one activity cannot quietly become a judgment about another.

Attribution has its own unchecked option. It refers to a declared example invitation, not a demographic inference, profile category, or detected source. General feedback remains possible without it. No contact, referral, training, testimonial, or publication permission is requested or implied.

## Review and clearing

The review screen shows the exact selected descriptions and every field in the illustrative payload. That payload carries `preview_only_not_submitted`. No private text field, hidden identifier, timestamp, or transcript is available.

Finishing the rehearsal says **Nothing was sent**. Clearing removes all choices and attribution from the component state, including after completion. Restarting opens a fresh invitation, not a restored draft. This is not a claim of server-side erasure: there is no feedback server, record, or participation agreement in this act.

## Access and containment

The page lives under `/founder/constellation/participation` and checks `requireFounder()` before mounting the client component. It is not linked from public campaigns or the member Studio. A link from the founder learning report makes the design discoverable without starting a pilot.

The component accepts no submission callback and imports no transport or storage. It does not read member data. The temporary development test wrapper is removed before commit. Native export inherits the existing founder-constellation exclusion.

## Before live collection

Retention and withdrawal promises must be agreed and physically verified before they appear as member consent. The proposed first pilot is one experience with no return tracking and no marketing follow-up. Thirty-day retention and author deletion are design recommendations, not implemented promises.

## Witness limits

The mechanism can prove a preview choice is separate and reversible in local state. It cannot prove that a member felt free to decline, that the questions are the best wording, that a report will be erased from backups, or that Writer's Studio helped. Those are separate design, governance, runtime, and experience questions.
