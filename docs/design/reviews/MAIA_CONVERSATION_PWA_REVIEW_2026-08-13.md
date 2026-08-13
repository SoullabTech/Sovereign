# MAIA Conversation Surface — PWA Review, 2026-08-13

> **Method:** `.claude/skills/maia-conversation-review/SKILL.md` (first run).
> **Surface:** `app/maia/page.tsx` (2,154 lines) · `components/OracleConversation.tsx` (10,547 lines).
> **Working tree:** branch `feature/labtools-redesign`, dirty. **Live SHA not verified** — no claim
> in this document asserts what production currently runs.
> **Evidence ceiling:** everything below is `CODE-READ` unless stated. Per
> `docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md`, mic/voice/TTS claims require
> **Phase-2 (native lane)** evidence. **No finding here is closed.** F1 and F2 have had patches
> applied and still await Phase-2 confirmation on a physical device.

---

## Findings by severity

| ID | Severity | Defect | Status |
|---|---|---|---|
| F1 | capability-dead | "Speak" button returns to voice mode without arming the mic | patch applied, unverified |
| F2 | safety | Amplitude-bound opacity flashed at syllable rate past WCAG 2.3.1 | patch applied, unverified |
| F3 | governance | Speaking-state colors extend a palette canon marks LEGACY | **escalated — see §Open question** |
| F4 | degraded | Text mode carries ~20 fixed overlays, almost none responsive-gated | open |
| F5 | friction | Mode state is scattered across ~8 variables with no single owner | open |

---

### F1 — "Speak" returns to voice mode but never arms the microphone

**Evidence class:** CODE-READ
**Severity:** capability-dead
**Location:** `components/OracleConversation.tsx` — the "Speak" button in the composer toolbar

**What the code does.** The handler was `onClick={() => setShowChatInterface(false)}` — nothing
else. Meanwhile `handleTextMessage` deliberately sets `lastSendWasVoiceRef.current = false`
(commented: *"typed turn — the mic must NOT auto-re-arm… typed input is not voice re-consent"*),
and **every** auto-restart path in the file is gated `if (lastSendWasVoiceRef.current)` —
`stream_failure_recovery`, `streaming_force_recovery`, `streaming_response_complete`,
`watchdog_recovery`, `hands_free_stream_restart`, `non_stream_final_reset`,
`non_stream_restart_attempt`.

So after a typed turn the flag is `false`, the Speak tap flips only the UI, and no path can arm the
mic. A second, working entry into voice mode (the audio-enable handler) does the full sequence —
UI, unmute, `enableAudio()`, `startListening()` — which is why the two paths behaved differently.

**What a member experiences** *(class: INFERENCE — consistent with the report, not yet observed)*:
they type, tap "Speak", the voice field appears, and nothing hears them. It reads as intermittent
because it still works when they had **not** typed first: the flag is left `true` by the earlier
voice turn. That matches "doesn't *always* switch back."

**Ruled-constraint check.** The consent boundary is deliberate and canon-grounded — it must not be
removed. The fix does not weaken it: tapping "Speak" *is* an explicit member gesture to speak, i.e.
voice consent, so the handler is the correct place to record it. Auto-re-arm after a typed turn
stays prohibited; only the deliberate tap re-arms.

**Fix applied.** Atomic transition mirroring the working handler: `setShowChatInterface(false)` ·
`setIsMuted(false)` · `lastSendWasVoiceRef.current = true` · `enableAudio()` → `startListening
('speak_button_gesture')`, with a `canStartListening` guard and a warn branch. Touch target raised
32px → 44px to match its sibling.

**Still required:** Phase-2 device verification. Look for `🎤 [mode] Speak tapped — mic armed`; the
warn branch distinguishes "handler never ran" from "capability refused."

**Authority:** below boundary — canon supplies the principle (explicit gesture = consent).

---

### F2 — Amplitude-bound opacity produced syllable-rate flashing (photosensitivity)

**Evidence class:** CODE-READ (mechanism) · user report (symptom)
**Severity:** safety
**Location:** the teal MAIA-speaking glow and the ultraviolet listening glow

**What the code did.** Two independent flash mechanisms:

1. **Direct binding.** `opacity: 0.6 + voiceAmplitude * 0.4` with
   `transition: 'opacity 0.05s ease-out'` on a 200px blurred disc (teal); the ultraviolet field was
   worse — three stacked layers at 0.7→1.0, 0.75→1.0 and 0.8→1.0 through 40–60ms transitions.
   `voiceAmplitude` is raw per-frame amplitude, which modulates at syllable rate (~4–8 Hz). A large
   area swinging up to 0.4 opacity several times per second is past the WCAG 2.3.1 general flash
   threshold. This is a seizure-risk defect, not a style preference.
2. **Threshold ownership swap.** `scale: voiceAmplitude > 0.1 ? undefined : [1, 1.05, 1]` handed
   control back and forth between Framer's animation and the inline style every time amplitude
   crossed 0.1 — so ordinary speech hovering near the threshold caused repeated abrupt swaps. A
   flicker source entirely independent of (1), and easy to miss.

A `smoothedAudioLevel` already existed but was used by only one unrelated layer; the reactive glows
bypassed it. There was **no** `prefers-reduced-motion` guard anywhere in this component.

**Fix applied.** The state colors are *retained* — they are load-bearing (teal = MAIA speaking,
ultraviolet = member speaking); only their delivery changed.

- **Aurora envelope**: rAF-driven, asymmetric attack/release (~0.4s rise, ~1.3s fall) low-passing
  amplitude before it reaches any visual property. Nothing binds to raw amplitude any more.
- **Both threshold ternaries removed** — coupling is continuous, no ownership handoff.
- **Opacity spans cut**: 0.6→1.0 becomes 0.22→0.35 (teal), 0.8→1.0 becomes 0.23→0.38 (violet),
  each slewed over 800ms so a hard amplitude jump cannot present as a flash.
- **Non-harmonic drift** at 19s / 14s / 10s. Sharing no common multiple, the layers never re-align
  into a countable beat — the eye reads drift, not pulse.
- **Diffusion**: layers overlap rather than nest concentrically, gradient origins are off-centre,
  falloff is stretched, blur is large relative to size, and all layers composite with
  `mix-blend-mode: screen` so the light adds *into* the navy field instead of stacking over it.
- **`prefers-reduced-motion`**: live-updating; amplitude reactivity switches off entirely, and the
  glow holds a steady visible base so the who-is-speaking signal is never lost.

**Rhythm, and the limit placed on it.** The salient layer sits at ~10s (≈6 cycles/min, resonant
breath range), and attack:release is ~1:3 — the shape of a calm exhale. This is continuous with the
"breathing entrainment" intent already commented in this surface. A hard limit is documented in
code: **the field may offer a rhythm; it may never chase the member's state to change it.** The
periods are constants. Amplitude may modulate brightness so the member can see who is speaking; it
must never modulate *period*. Making the rhythm adaptive — detecting arousal or breath and pacing-
and-leading — would be covert state induction, which the non-manipulation and no-attachment-capture
vows forbid. That would be a founder question, not an implementation detail.

**Still required:** Phase-2 device verification that the aurora reads as intended on a physical
iPhone, and a reduced-motion pass. `mix-blend-mode: screen` should be checked on device — it is
well-supported but interacts with the surrounding stacking context.

**Authority:** below boundary — accessibility harm plus an explicit member request.

---

### F3 — Speaking-state colors extend a palette canon marks LEGACY

**Evidence class:** CODE-READ + memory corpus
**Severity:** governance
**Status:** **escalated.** See §Open question.

The two glow colors are **not complementary**. Teal ≈ 173° hue, violet ≈ 258° — about **85°
apart**, so they are analogous-to-triadic, both in the cool half of the wheel. For an *ambient*
field that harmonises well. For a **state indicator** it is weak hue contrast, and the diffusion in
F2 lowered the salience of both, which sharpens the problem rather than causing it.

The governance issue is larger than contrast, and three separate rulings bear on it:

- `feedback_two_palette_system` — **teal/sage is LEGACY**: *"Do not preserve it, do not extend it."*
- `project_soullab_brand_color_system` — **Presence (MAIA) = plum/purple, atmosphere and accent
  only**; never make the field purple; the eye should travel *night field → living holoflower →
  warm gold typography*; the holoflower must remain the jewel.
- `feedback_two_palette_system` — `/maia` is the **warm-dark-amber** inhabited register
  (`#D4A574`, `#C8A060`), not the navy threshold register.

Read together: canon assigns **plum to MAIA's presence** and **amber/gold to MAIA's voice and
warmth**, while the code currently assigns **teal (legacy) to MAIA speaking** and **violet to the
member speaking** — roughly inverted from the canonical association, and built on a palette that is
supposed to be migrating out.

There is also a standing caution in `project_domain_accent_adoption_gap`: *"⛔ NO CHANGE — hero glow
is downstream, taxonomy pass first,"* alongside the principle *"color cannot inherit meaning merely
from resemblance."* Recoloring glows is a governed act.

**Disclosure:** the F2 patch softened and diffused the existing teal rather than replacing it. It
did not introduce teal, but it *did* invest further in a legacy palette. That was not noticed until
the palette question was raised, and it is why F3 is filed rather than quietly fixed.

**Not fixed, deliberately.** The color *assignment* is above the authority boundary: canon does not
say which color marks "MAIA speaking" versus "member speaking" in the holoflower glow, and two
implementers reading the same canon would reasonably differ.

---

### F4 — Text mode carries ~20 fixed overlays, almost none responsive-gated

**Evidence class:** CODE-READ
**Severity:** degraded
**Location:** `components/OracleConversation.tsx`, render tree

68 `fixed`/`absolute` positioned elements; ~20 are `fixed` overlays. Exactly **one**
`hidden md:block` and **one** `md:hidden` exist in the entire component — so nearly all of that
chrome is present on a 390px viewport. Inventory includes: two limits banners, an audio-enable
modal, an audio-unlock recovery modal, an agent customizer modal, a session-synthesis modal, a
debug readout at `top-4 right-4`, an analytics toggle, a shadow-petal overlay, a text-display
toggle, a mode field, plus composer chrome.

This is the **warehouse failure mode** named in `docs/design/INHABITABLE_ARCHITECTURE.md`: a
surface displaying all capabilities simultaneously. It is the likely substance of "the field on text
is so crowded."

**Fix (not applied — needs a floor plan first).** Per the design law, the correct move is not to
delete controls but to agree the experiential floor plan *before* component mapping: which of these
belong to the room the member is in, which emerge only when invited, which are debug and should be
build-gated. Concretely, three separable units: (a) gate the debug readout and analytics toggle
behind a dev/founder flag; (b) collapse the two limits banners and three modals into one
notification channel that can only show one thing at a time; (c) decide per-overlay whether it is
identity, current-gesture, or utility, and move utilities into the existing tools menu.

**Authority:** (a) below boundary. (b) and (c) need the floor plan agreed — that is a design
conversation, not a patch.

---

### F5 — Mode state is scattered with no single owner

**Evidence class:** CODE-READ
**Severity:** friction (root cause of F1)

"Which mode am I in" is spread across at least `showChatInterface`, `isListening`,
`isHandsFreeMode`, `isMuted`, `audioEnabled`, `enableVoiceInChat`, `enableVoiceInput`,
`streamingVoiceMode`, `listeningMode`, and the `lastSendWasVoiceRef` consent flag. No single
function owns a transition, so each affordance re-implements the sequence — which is precisely how
F1 arose: one entry point did the full sequence, another did one line.

**Fix (not applied).** Extract `enterVoiceMode(reason)` / `enterTextMode(reason)` as the only
sanctioned transitions, and route every affordance through them. This is a refactor of a
10.5k-line component and should be its own unit with its own verification, not folded into a bug
fix.

---

## What this review could NOT establish

- **Whether any of this is live.** The live SHA was not read. No claim here describes production.
- **Whether F1's patch works.** Mic arming is Phase-2 (native lane); a code read cannot close it.
- **Whether the aurora reads as intended.** Needs eyes on a physical iPhone, plus a reduced-motion
  pass and a `mix-blend-mode: screen` check on device.
- **Response quality.** "Responses and interactions could be improved" was raised but is not
  addressed here — it is a prompt/routing question (tier selection, memory composition), not a
  surface question, and belongs in its own review.
- **Time-to-first-token.** Pass 4 was not run; it needs instrumentation, not reading.

## Gate status — honest report

`npm run typecheck` **FAILS** on this branch. The failing diagnostic is
`app/api/focus/draft-message/route.ts:109 TS2322`, in a file **untouched in the working tree** (last
changed by `5f5b5ac5e`), surfaced because 61 new files entered the ship program. Errors
attributable to `components/OracleConversation.tsx`: **0** (verified via
`tsc -p tsconfig.ship.json`). The gate failure is a pre-existing condition of this branch, not a
product of these patches — but it does mean **the gate is not green and these changes cannot land
behind it** until that unrelated error is resolved by whoever owns that lane.

## Highest-value next unit

**Phase-2 device verification of F1.** It is the one finding that makes a capability dead rather
than awkward, the patch is small, and the log markers make it decisively checkable. Everything else
is either escalated (F3), needs a design conversation (F4), or is a scoped refactor (F5).

---

## Open question — for founder ruling

**At the level of principle: which color marks MAIA speaking, and which marks the member speaking,
in the holoflower field?**

Canon settles the surrounding facts but not this assignment. Teal is legacy and should not be
extended; plum/purple is MAIA's presence but atmosphere-only and must never become the field;
amber/gold is MAIA's voice and the warmth of the inhabited register; the holoflower must remain the
jewel and the brightest point of color.

**Recommended ruling:** **MAIA speaking = warm amber/gold** (`#D4A574` / `#C8A060`, the `/maia`
inhabited register, already "reserved for MAIA's post-auth voice"); **member speaking = plum**, held
at the restrained atmospheric opacities canon specifies. Retire teal from this surface.

**Reasoning.** It puts MAIA's voice in the color canon already reserves for it, and gives the two
states a warm/cool split — genuine complementary contrast, far more legible than the current 85°
cool-on-cool pairing, and legible even at the low diffuse opacities F2 introduced. It keeps plum
atmospheric rather than making it the field. It stops extending a legacy palette. And it preserves
the intended eye-path: navy field → holoflower jewel → warm gold as MAIA's register.

**The counter-position, honestly.** Plum *is* named "Presence (MAIA)", so one could argue MAIA
speaking should be plum and the member amber. The reason to reject it: plum-as-presence describes
the *ambient field* MAIA maintains continuously, not the *event* of her speaking — and amber is
already specified as her voice. But this is exactly where two readers of the same canon diverge,
which is why it is being asked rather than decided.

Until this is ruled, the F2 safety fix stands on the existing colors. **The safety fix is
independent of the color decision and should not wait on it.**
