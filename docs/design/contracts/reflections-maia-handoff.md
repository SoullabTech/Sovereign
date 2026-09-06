---
# Scope note: this contract covers only the in-room MAIA handoff/presentation seam.
# It does not define the full /maia Conversation Room or every future use of the
# shared OracleConversation and ModernTextInput components.
room: Reflections — MAIA Handoff
human_activity: returning to one's own reflection and carrying it into conversation with MAIA without losing the reflection as place
surfaces:
  - components/OracleConversation.tsx
  - components/maia/presence/MaiaPresence.tsx
  - components/ui/ModernTextInput.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — the room remains the place; shared House presence must not overwrite it
  - SOULLAB_THEME §4 — variation follows function while the House field remains continuous
  - MAIA_OATH — the member remains the subject; MAIA accompanies rather than taking over the room
reference_surfaces:
  - components/reflections/ReflectionDetail.tsx — the live Reflection object that remains visible beneath the handoff
  - components/reflections/DiscussWithMaia.tsx — the existing member-initiated gesture and no-navigation contract
  - docs/design/contracts/journal-room.md — prior House/Room boundary record for ambient MAIA presence
shared_with_house: the canonical MAIA session and transcript, one relationship voice, the House field hierarchy, and the quiet MAIA sheet chrome
distinct_to_room: the Reflection remains visibly present as the member's object; Discuss with MAIA opens a contained text conversation over it rather than turning the page into the full Conversation Room
screenshot_desktop: docs/design/contracts/screenshots/reflections-discuss-maia-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/reflections-discuss-maia-mobile.png
experience_verification: |
  2026-09-05 — founder production witness showed the defect directly: the MAIA sheet opened on the right, but
  OracleConversation's fixed transcript and holoflower resolved against the viewport and painted across the
  Reflection while the sheet itself had no composer. After repair, a focused local evidence route mounted the exact
  OracleConversation inside the exact MaiaPresence sheet geometry and seeded canonical local transcript state. At
  1280x800 the 448x640 sheet bounded both the MAIA message and textarea; at 390x844 the 390x717 sheet bounded both;
  body scroll width equaled viewport width in both captures. Headless persistence/agent requests returned 401
  because the evidence route had no authenticated member, so that pass was a geometry/presentation witness, not a
  production conversation-response witness.

  2026-09-06 — PRODUCTION CONVERSATION WITNESS (closes the 401 gap above). Deployed `2732706b6` to minisforum
  through the immutable-SHA lane; running-container provenance verified on both channels (printenv == Config.Env ==
  asserted SHA), Co-Lab boundaries 33 passed / 0 failed / 0 warned. Founder then walked the room signed in on
  desktop Chrome at `soullab.life/reflections/<id>` (authenticated member confirmed by the anamnesis recollection
  greeting). Observed: the MAIA sheet bounded on the right with a real MAIA response painted INSIDE it — the
  original defect state (blank sheet while response text paints across the page) did not recur; the Reflection
  remained legible as the place beneath it, with SOURCE EXCERPT, the Discuss gesture, and the WHAT MAIA WILL RECEIVE
  panel all still rendered; the text composer present in the sheet with no microphone affordance under
  voiceEnabled={false}; and canonical thread continuity — the handoff POSTed to /api/sovereign/app/maia/list and the
  client restored 18 existing messages, so the conversation was appended to rather than forked into a second
  identity.

  NOT established by the 2026-09-06 pass, and still open: no signed-in walk on a production MOBILE viewport (the
  390x844 containment evidence remains local-geometry only); and the page carried 2 console errors / 6 warnings that
  were not classified during the walk — unrelated to the containment claim, but not cleared either.
---

# Reflections — MAIA Handoff Experience Contract

## What this seam is for

A member has already kept a reflection and chooses **Discuss with MAIA**. The
activity is not "opening AI"; it is continuing with something they have already
seen and recognized as theirs. The Reflection therefore remains the place, while
MAIA becomes available inside it.
## Arrival

> **Discuss with MAIA**

The member presses the gesture from the open Reflection. A scrim softens the room
without erasing it. MAIA opens in the bounded presence sheet; the existing
conversation comes with her, and the member-composed handoff is appended rather
than used to replace the thread.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| enter | `Discuss with MAIA` | names relationship and activity, not a tool action |
| continue | text composer | lets the member continue the same canonical conversation in place |
| leave | close control / scrim | returns attention to the Reflection without destroying the conversation |

## Containment invariant

The sheet is a host, not a miniature viewport. When `presentationMode="contained"`,
OracleConversation's fixed descendants resolve against the sheet's own containing
block. Transcript, scrim, and composer may not paint into the Reflection behind it.
Full-room `/maia` geometry remains viewport-native and unchanged.

The contained handoff is text-only for now. `voiceEnabled={false}` must not suppress
the text composer, and it must not leave stray microphone or response-voice
affordances in the sheet.

## Forbidden here

- full-viewport transcript, holoflower, composer, or scrim escaping the sheet
- a blank MAIA panel while response text paints elsewhere on the page
- a second conversation identity or a fresh thread created by the handoff
- navigation to `/maia` when the governed room can host the conversation in place
- voice controls in a host that has explicitly disabled voice

## The two brand tests

**Same house?** Yes. The handoff uses the same canonical MAIA relationship,
session, transcript, typography family, field hierarchy, and quiet ember signal as
the House conversation layer. It is not a bespoke Reflection chatbot.

**Distinct room?** Yes. The member's Reflection stays legible as the place beneath
the scrim, and the sheet is intentionally subordinate to it. Closing MAIA reveals
the same Reflection exactly where the member left it.
## Not yet a pattern (held against a second specimen)

This room is **one specimen**, not a reusable architecture. Reflections is the
first place MAIA has entered a member-owned object without displacing it; that
is not yet evidence that a general contained-presence pattern exists. Extracting
one now would repeat the move the COACHING-TEMPLATE-EXTRACTION-01 naming ruling
refused on 2026-09-04 — *the first specimen is not the generic architecture*.

**Sequence (founder, 2026-09-06).** Reflections closes first: desktop walk PASS,
mobile walk outstanding, console errors outstanding. Only when all three settle
does **Journal** open as specimen two. Nothing is named or extracted before the
two rooms can be compared.

**Why Journal and not Co-Lab or Writer's Studio.** Journal shares the load-bearing
condition — the member already owns an object underneath, MAIA can enter in
relation to it, leaving must restore precisely that object — and there is already
a House/Room boundary record (`docs/design/contracts/journal-room.md`) to test
against. It is also different enough from a Reflection that anything surviving
both starts to look like an invariant rather than Reflections-specific UI. Co-Lab
and Writer's Studio add other authority and collaboration semantics, which would
make it impossible to tell whether a difference came from the presence pattern or
from the room itself. They are not candidates for specimen two.

**The comparison is behavioral, not component-based.** The question is not whether
Journal reuses `MaiaPresence`. Sharing a component proves nothing; a room could
mount the same sheet and still displace its subject. What must survive both rooms:

- the member-owned object remains primary
- canonical MAIA continuity (one relationship, one thread — never a fresh identity)
- no navigation required to reach MAIA
- closing MAIA restores the exact prior place and state
- exit carries no penalty

The deeper criterion these serve, in the founder's words: *contained presence is
not "MAIA in a drawer" — it is MAIA entering a member-owned place without
displacing its subject.* "Contained presence" is a working handle here, not a
canonized name; naming waits on the comparison.

**If one of these disappears in Journal, that is the finding** — it tells us the
property was Reflections-specific before anything got canonized. A failure in
specimen two is the cheapest possible outcome, and the reason for running it.
