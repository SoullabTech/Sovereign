---
room: Conversation
human_activity: talking with MAIA — a person speaking or writing to her, and being answered
surfaces:
  - app/maia/page.tsx
  - components/OracleConversation.tsx
change_class: experiential
principles:
  - MAIA_ARRIVAL_CONSTITUTIONAL_PRINCIPLES — "Conversation is the threshold of relationship" (the Five, ratified 2026-07-22)
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models; the warehouse failure mode
  - INHABITABLE_ARCHITECTURE — "MAIA should never require more screen in order to communicate less" (founder 2026-08-13)
  - SOULLAB_THEME — navy is foundational, plum is atmospheric; the Holoflower remains the jewel
  - MAIA_OATH — no guru stance; MAIA offers reflection, never authority
  - MAIA_SOVEREIGNTY_INVARIANTS — non-manipulation; offered rhythm, never applied rhythm
  - WCAG 2.3.1 — no more than three flashes per second in a large area
reference_surfaces:
  - docs/design/reviews/WITNESS_001_TRACES_2026-08-13.md
  - docs/design/reviews/WITNESS_001_TRACE4_VERTICAL_SPACE_OWNERSHIP.md
  - docs/design/reviews/P0_VOICE_RECOVERY_WITNESS_PROTOCOL.md
  - docs/design/reviews/REFERENCE_CHATGPT_TEXT_RECESSION_MECHANICS.md
shared_with_house: navy field foundation · the Holoflower as the one point of colour · warm serif for MAIA's voice · human-verb gesture language · provenance discipline (nothing inferred presented as authored)
distinct_to_room: this is the only room where the encounter itself is the activity — the field may hold territory during voice because the field IS the experience, and must yield it when words become the activity; it is also the only room with two orthogonal modality axes (how the member speaks · whether MAIA answers aloud)
screenshot_desktop: docs/design/contracts/screenshots/conversation-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/conversation-mobile.png
experience_verification: >
  PARTIAL — layout and interaction-state witnessed; microphone, audio and physical-thumb behaviour
  NOT yet witnessed. Layer A (complete): reached the authenticated /maia conversation surface in the
  iPhone 17 Pro Simulator against http://localhost:3491 and in an authenticated desktop session at
  1280x800. Measured in the live DOM, not read from source — recovery caption effective opacity 1.0
  (was 0.6, inherited from a decorative ancestor); voice region 109x112 with pointer-events auto and
  a single handler; caption passes through as pointer-events none exactly as before; glow centre
  cy=120, identical to unpatched trunk baseline, so the layout cost of the discarded 44px button is
  fully reclaimed. Four-state caption confirmed rendering, and the failure path
  (Tap to Speak -> Preparing to listen... -> Tap to try again) was observed end-to-end under a
  GENUINE denied microphone in the browser pane, stable across 7s with no relapse to a false-idle
  state. Photosensitivity: zero raw-amplitude bindings to any visual property, zero threshold
  ownership ternaries, zero sub-400ms transitions, prefers-reduced-motion guarded. Pre-existing
  defects observed and deliberately NOT repaired: dual-centre Holoflower geometry (reproduced on
  unpatched trunk 52a3b924b) and an idle `thinking` band occupying a full-width zone while displaying
  no label at all. Layer B (PENDING, requires physical device): case 6 full recovery through
  retry -> Listening; case 9 bidirectional modality preservation; thumb activation verdict; real
  microphone and audio behaviour; Safari vs installed-PWA lifecycle. Status may move to COMPLETE only
  after the deployed candidate SHA passes those on a physical iPhone.
---

# Conversation — Experience Contract

> **STATUS: PROVISIONAL / PARTIALLY WITNESSED.** This contract is the custody place for what has been
> proven and what has not. It must not be read as certifying the voice path.

**Implementation lineage: PRE-EXISTING.** `components/OracleConversation.tsx` is ~10.6k lines with
years of accumulated behaviour. This contract does not describe a new room; it opens custody on one
that shipped without a contract, at the first change that touched it under the Design Canon gate.

## What this room is for

A person talking with MAIA. Speaking, or writing, and being answered. Not "managing a conversation" —
the exchange itself is the activity, and everything else in the room is subordinate to it, including
the field and including MAIA's own instrumentation.

## Arrival

> **Good morning, Kelly** · *An early start. What feels most useful right now?*

Then the Holoflower, one gesture (`I'm ready`), and a composer. The greeting degrades to a bare
`Good morning` when no member-authored name is available — deliberately, so no bogus label is ever
presented as the member's name.

⚠️ **Known defect in custody:** the greeting name resolves from `localStorage.explorerPreferredName`
with only a small denylist (`friend, user, guest, anonymous, explorer, test, admin`). Any other
string in that slot is greeted verbatim — reproduced locally as
*"Good morning, QA Soul Portrait (test-only)"*. Provenance of that value is unvalidated. Recorded, not
repaired here.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| enter the encounter | `I'm ready` | the member declares readiness; the system does not admit them |
| begin speaking | `Tap to Speak` | a verb naming what the region does |
| activation in flight | `Preparing to listen…` | the field says what is happening; never a false idle |
| live | `Listening` | present tense, not "recording" |
| recover from failure | `Tap to try again` | recovery is one tap; **reload is not part of the interaction model** |
| switch to writing | `Text` | the activity, not the widget |

The voice region is a single ~109×112 target with one handler. The caption is informational and
`pointer-events: none`; taps pass through to the region, so the member never has to hit the words.

## The two modality axes — orthogonal, and both must stay

| Member input | MAIA output |
|---|---|
| Type | silent |
| Type | spoken |
| **Speak** | **silent** |
| Speak | spoken |

> ⭐ **Changing how the member communicates must never silently change how MAIA responds.**

Microphone = *how I speak to MAIA*. Speaker = *how MAIA answers me*. These look conflatable and have
been renamed once to disambiguate; they must not be merged into one control.

## Forbidden here

- Any real-time signal bound directly to a visual property's **brightness** (WCAG 2.3.1; speech
  modulates at 4–8 Hz). Signals may modulate breadth; brightness belongs to a slow breath envelope.
- Adaptive rhythm that tracks the member's state to lead it — offered rhythm only, never applied.
- A state zone whose height does not vary with how much it has to say.
- Dashboard or inventory grammar; a card per data model.
- Reload as a recovery path.
- Instructions rendered inside a decorative `opacity` subtree.

## The two brand tests

**Same house?** Yes — navy foundation, Holoflower as the single point of colour, warm serif for
MAIA's voice, amber restraint. Against the references named above.

**Distinct room?** Yes. No other room has an encounter that can be *entered*, or two orthogonal
modality axes. A member would know this from Journal without a label: Journal opens on a question and
waits for writing; Conversation opens on a presence and waits for a voice.

## Held, in custody, NOT repaired by this change

| Item | Why held |
|---|---|
| Dual-centre Holoflower geometry | Two competing `resize` writers; pre-existing on trunk. Fixing a coordinate would destroy the evidence and preserve the dual authority. Trace #4. |
| Idle `thinking` band | Full-width zone, different palette register, **no label at all** when idle. Its placement is a prior ruling; recover the reason before overriding it. |
| Field does not yield to text | No mechanism couples field size to mode, keyboard, or activity. Needs the single-owner viewport unit. |
| Response typography / colour | Large serif is correct; saturated gold is what reads declarative. Brand register — founder call. |
| Identity-slot hardening | `explorerPreferredName` provenance. Own unit. |
