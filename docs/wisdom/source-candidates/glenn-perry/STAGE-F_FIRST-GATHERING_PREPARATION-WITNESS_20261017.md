# Stage F — First founder-hosted Wisdom Circle preparation witness

**Date:** 2026-10-17  
**Branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Authorizing conversation:** User approved continuing the first human pilot *development*. No event, invitations or production access were authorized.  
**Tested source revision:** `616f20346e08066f3f6c93328c28b27c8705c55d`  
**Status:** Pilot prepared and rehearsed using fictional data. **Not scheduled, sent, released, deployed, or a real Circle.**

## The product insight

After preparing an attributed Glenn Perry wisdom source and a possible Keeper-Hosted Field, the founder chose to **make the human gathering real in design before seeking an external keeper relationship**. The first pilot is *Where Symbols Meet Life*, a founder-hosted, approximately 75-minute, adult, nonclinical, fully opt-in Circle exploring two human needs and Elemental Alchemy's Earth, Water, Air, Fire and Weather.

Glenn Perry is credited as an **unaffiliated public source reference** through official author links. There is no announced guest, endorsement, licensed book text, chart diagnosis or implied clinical claim.

## What was created

- [One-page founder brief](./STAGE-F_FIRST-GATHERING_FOUNDER-BRIEF_20261017.md): the participant experience, six movements, five non-negotiables and single next decision.
- [Full facilitator guide](./STAGE-F_FIRST-GATHERING_FACILITATOR-KIT_CANDIDATE_20261017.md): host words, six movements, original five-element inquiry, refusal and safety choices, non-recording, no forced disclosure, and checklist for a real venue.
- [Invitation and plain-language consent drafts](./STAGE-F_FIRST-GATHERING_INVITATION-AND-CONSENT_CANDIDATE_20261017.md): ready for **founder editing** only, with unset date, time, venue, price/cost, recipient list and support contact. Nothing has been sent.
- [Exact fictional rehearsal contract](./STAGE-F_FIRST-GATHERING_PILOT-REHEARSAL_CANDIDATE_20261017.json): 75 contiguous minutes, six source-linked movements, zero live registration, privacy guard flags and ten explicit release gates (all requiring human review remain OFF).
- `lib/maia/knowledge/wisdomFirstCircleRehearsal.ts`: original, static client-only prompts matching that exact schedule; no timer, network, store, model or event rights.
- `components/maia/knowledge/PerryLensFounderPreview.tsx`: adds a guided six-movement founder-only demonstration to the **disabled** review page. Buttons only choose a local fixed prompt and boundary.
- `stage-f-first-gathering-pilot.test.mjs` plus the updated WebKit test: verify the contract, field rights, exact time windows, honest invitation, optional speaking, and accessibility/privacy of the fixed rehearsal.

These Stage F files are added to the *existing* Perry research branch, not a fresh implementation lane.

## Test evidence

The combined executable review suite was run on the Mac Studio in a disposable source checkout at commit `616f20346e08066f3f6c93328c28b27c8705c55d`:

| Verification | Result |
| --- | ---: |
| Stage A–E source, rights, admission, Sanctuary, Circle/Commons and founder preview checks | 126 passed |
| Stage F fictional run-of-show, consent, unsent invitation, rights and zero-event contract | 10 passed |
| New Stage F desktop/mobile WebKit rehearsal tests | 2 passed |
| **Combined** | **138 of 138 passed** |

The targeted **strict TypeScript noEmit** check passed for the touched founder preview and its rehearsal/client/helper dependencies. The WebKit suite itself passed **13/13**, including all prior preview capabilities, six-step navigation, backward selection, restart, last-step lockout, mobile geometry, keyboard operation, and no unintended external browser requests.

During development two test assertions were adjusted to match actual presentation—not to weaken privacy: CSS visually uppercased an elemental heading and Markdown emphasized two boundary phrases. In each case the committed text already carried the rule; the final full suite passed at a single pinned revision.

### Hostile tests

Three intentionally modified **disposable** contract copies were rejected by the Stage F suite:
- `invitation_sent = true` without founder authorization.
- `recording_on = true` in the no-recording pilot.
- `glenn_perry_participating = true` without consent.

The original candidate JSON and repo source were restored/unchanged; these prove static contract test sensitivity, not an operating authentication/recording system.

## Remaining obligations before an actual gathering

**The human event is not booked.** Date, timezone, host appointment, meeting venue, cost, attendees and recording/logging verification remain unset. Soullab's real Circle cohort/member access, exit/revocation and facilitator roles must be demonstrated compatible; a browser mock does not do that. A private human meeting is not automatically confidential, and any actual venue must disclose unavoidable technical records truthfully.

The initial invitation is a **copy draft**, not permission to send a message or search a contact list. No email, calendar event, Zoom room, payment, enrollment form, Telegram/Discord group or member roster has been created. No personal data or third-party copyrighted source body has been processed.

No member or source corpus admission, production deployment, protected branch, MAIA provider, real Circle/Commons runtime, keeper status or hosting privileges were changed. The founder-only preview's live feature flag remains OFF, and the source-approval constant remains null. The broader Sanctuary authority work remains separate and unresolved.

## The next founder decision

The first review should be **human and narrow**: Is *Where Symbols Meet Life* the right opening inquiry, and what kind of real venue would make its boundaries credible? Once that is clear, an isolated access/recording witness and actual time/venue plan can be prepared; final contact and launch decisions remain independent.

**Standing:** Stage F is prepared for founder rehearsal and editorial review. Release gate CLOSED.
