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
  2026-09-05 — GEOMETRY WITNESS ONLY. Founder production witness showed the defect directly: the MAIA sheet opened
  on the right, but OracleConversation's fixed transcript and holoflower resolved against the viewport and painted
  across the Reflection while the sheet itself had no composer. After repair, a local evidence route mounted the
  exact OracleConversation inside the exact MaiaPresence sheet geometry with seeded transcript state; 448x640 and
  390x717 both bounded message and textarea. Persistence/agent calls returned 401 for want of an authenticated
  member, so that pass proved layout, not a real MAIA turn.

  2026-09-06 — AUTHENTICATED PRODUCTION CONVERSATION + RENDER WITNESS. PASS. Closes the 401 gap above.
  Bound before and after to production 2732706b6 (subject stable; /api/members/me 200). A real Reflection was
  opened, the WHAT MAIA WILL RECEIVE preview confirmed present and editable, and exactly the visible preview sent
  unchanged (373 chars, hashed rather than transcribed into evidence). The turn exercised production, not a
  fixture: POST /api/sovereign/app/maia/list 200 and POST /api/conversation/turns 200, thread 11+11 -> 12+12 on
  the same canonical session identity that existed before the handoff.
  Desktop 1280x800: sheet x=801 y=144 448x640, textarea inside, page width == viewport 1280, no overflow,
  Reflection mounted beneath a 40% scrim. Mobile 390x844 (true emulation): sheet 390x717.39, MAIA response and
  textarea fully inside, body scrollWidth 390, no horizontal spill. Close/reopen held 12+12 with the canonical
  session unchanged and the composer present; the same history survived a mobile reload/reopen. No second
  conversation was minted. Steady-state sheet: text composer present and enabled, zero microphone, zero Speak,
  zero voice controls.
  Separate pre-existing finding, deliberately NOT folded into this seam: on first interaction after a browser
  reload, root app/layout.tsx briefly emits a global "Audio enabled" toast (~2s). That is the app-wide
  first-interaction audio unlock, not a sheet control and not governed by voiceEnabled. Under the stated
  criterion (composer intact, no stray microphone control) this is PASS; the toast is tracked as its own UI
  finding elsewhere.
  Witness profile, screenshots, and browser process removed afterward; debug port 9333 closed; no repository
  files changed by the walk.
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

**Measurement note — a naive bounding-rect check will report a false failure.**
When the transcript has auto-scrolled, the last MAIA message's *layout box* can
begin a few pixels above the sheet (5 px, observed 2026-09-06), so
`getBoundingClientRect()` alone reports "not entirely inside" while nothing is
leaking. Both the transcript and the sheet clip overflow. Containment must be
decided by what is painted and hit-testable, not by layout geometry: hit-test
just above the sheet edge and confirm no message element is there, and confirm
body `scrollWidth` equals viewport width. Any automated containment test written
against rects alone will fail on a correctly contained sheet.

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

**Sequence (founder, 2026-09-06).** Reflections closes first. Desktop walk PASS;
mobile walk PASS (390x844 true emulation, real response, no spill); the console
item is OPEN and weaker than first recorded — a red count of 2 was *visible* on a
Reflections page in production, but `Preserve log` was checked, so those entries
may have survived earlier navigation and are not attributable to the Reflections
turn. Neither their text nor their provenance is established, so they can be
neither dismissed nor counted as reproduced. Settling it takes one causally clean
pass: uncheck `Preserve log`, clear, reload, one MAIA turn, filter to Errors only,
capture whatever remains. That is the last item on the gate. Only when it settles does
**Journal** open as specimen two. Nothing is named or extracted before the two
rooms can be compared.

### Console gate — ruling predeclared before the observation (2026-09-06)

Written down *before* the pass so the outcome cannot be rationalized after it
arrives. The witness is narrow and re-verifies nothing already held: clean Chrome
profile with extensions absent, DevTools console, `Preserve log` OFF, reload
`/reflections`, clear once settled, then exactly one ordinary act — open one
Reflection, Discuss with MAIA, let the contained conversation open, close/reopen
only if that is part of the subject. Stop. Capture every red entry with full text
and source URL.

| Observation | Ruling |
|---|---|
| zero red entries | CONSOLE PASS · Reflections may close · Journal may open |
| `chrome-extension://`, favicon/resource, unrelated bare CORS | dismiss as external noise **with the source recorded** · CONSOLE PASS |
| `[SCRIBE]` `[TTS]` `[iOS]` `[StreamingVoice]` `[localStorage]` `[PostgreSQL]` `[OracleConversation]` `[Capsule]` `[LabAction]`, or reflections-owned failure text | APP-OWNED · Reflections stays OPEN · preserve the exact error and diagnose only that error |

**A zero-error clean run does not retroactively diagnose the earlier count.** The
red count of 2 seen under `Preserve log` is unattributable and stays that way —
provenance cannot be recovered after the fact. A clean pass is therefore recorded
as:

```text
console witness       PASS
observed errors       0
prior visible count   UNATTRIBUTED — provenance never established
```

and never as "the previous errors were stale." Absence in a new run is evidence
about the new run only. That is enough to close the gate; it is not enough to
convert an unattributed count into a finding.

### Console gate — RESULT, 2026-09-06 · PASS

Clean witness run per the predeclared procedure. The Reflections → Discuss with
MAIA walk produced two successful MAIA request/response cycles and no error-level
entry.

```text
console witness       PASS
observed errors       0
prior visible count   UNATTRIBUTED — provenance never established
```

The prior count is **terminal at UNATTRIBUTED**. It was not found stale, not
found benign, and not found app-owned; it was seen under a cumulative log and its
provenance is unrecoverable. This result closes the gate without diagnosing it.

One warning-level entry was present and is **not** a gate failure — the criterion
was app-owned *error*-level entries:

```text
⚠️ [GLOBAL] Audio play failed:
NotSupportedError Failed to load because no supported source was found.
```

It occurred on the global audio-unlock path. Parked as its own item, outside this
seam; note that it plausibly shares a root with the global first-interaction
"Audio enabled" toast recorded in `experience_verification` — both sit on the
app-wide unlock in `app/layout.tsx`, neither is sheet-governed, and neither is
touched by `voiceEnabled`. If either is ever examined, examine them together.

### Reflections — CLOSED, 2026-09-06

```text
experience / render   PASS
containment           PASS   1280x800 + 390x844
close / reopen        PASS   no second conversation identity
console               PASS   0 observed errors
prior 2-error count   UNATTRIBUTED — terminal
```

The Reflections → MAIA containment repair is closed. Under the sequencing ruled
above, **Journal may now open as specimen two.** No generic abstraction, no
extraction, and no name for the pattern until the two rooms can be compared
against the five behavioral properties.

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
