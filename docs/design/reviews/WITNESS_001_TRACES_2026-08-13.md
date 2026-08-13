# Witness 001 — five traces, 2026-08-13

> **Format:** `WITNESSED → SOURCE → CAUSE → SMALLEST CHANGE → MUST BE LIVE-WITNESSED`
> **No broad redesign proposed.** Aurora implementation is **HELD** per founder instruction pending
> traces #3 and #4.
>
> **Witness environment — mobile Safari, NOT installed PWA.** Safari browser controls are visible at
> the bottom of the iPhone captures. Every mobile finding below is scoped to **iPhone Safari**.
> Standalone-PWA safe areas, keyboard behavior and lifecycle are **unwitnessed**.
>
> **Image-context gap (disclosed).** Of the captures described, JARVIS received three: iPhone Safari
> with a long transcript + navy `thinking` band; desktop Safari in text mode; iPhone with keyboard
> open. The capture containing **"Good morning Maya"** was **never in JARVIS's context** — trace #1
> is therefore reasoned from the founder's verbatim description plus code, and its final step is
> explicitly a device read, not a code claim.

---

## Trace #1 — Why is a product whose visible agent identity is `MAIA` rendering `Maya`?

**Reclassified per founder:** treat as **assistant-identity / name leakage**, not member
misidentification. The header correctly shows `K Kelly` in every capture received.

**WITNESSED** *(founder, capture not in JARVIS context)* — pre-activation welcome screen: `MAIA`
centered in header, `K Kelly` right, teal field around the Holoflower, then **`Good morning Maya`**,
then `Text`, then a full-width navy `thinking` region. Substantial unused dark vertical space between
field and greeting.

**SOURCE.** The greeting on that screen is the **welcome screen** (`hasActivated === false`), not the
transcript greeting. Chain:

- `components/OracleConversation.tsx:7725` → `generateWelcomeGreeting({ userName, … })`
- `lib/maia/welcomeGreeting.ts:223` → `const greeting = name ? \`${timeGreeting}, ${name}\` : timeGreeting;`
- `userName` prop ← `app/maia/page.tsx` `explorerName` ← `getInitialUserData()`
- name resolution: `lib/services/greetingService.ts:9` `resolveDisplayName()`

Three independent greeting paths exist (`welcomeGreeting.ts:223`, `greetingService.ts:166+`,
`lib/greetings/greetingRender.ts:45`) and **all three emit a comma** — `"Good morning, Maya"`. The
witnessed string was reported without one; most likely transcription, but if the live string genuinely
has no comma there is a **fourth path** not yet found, and that must be checked before closing.

**CAUSE (probable, one device read from confirmed).** `resolveDisplayName()` reads, in order:

1. `localStorage.explorerPreferredName`
2. `localStorage.explorerName`
3. `beta_user` JSON → `preferredName`, `name`, `displayName`, `username`

It rejects UUIDs and a generic-name list — `friend, user, guest, anonymous, explorer, test, admin`.

> ⭐ **`maya`, `maia` and `anthony` are NOT in that list.**

So if any member-name key on that device holds `"Maya"` — a legacy value from when the assistant was
named Maya (`lib/agent-config.ts:20`, `lib/agents/shared/agentRegistry.ts:44`,
`lib/personality/MayaPersonality.ts:11`, `lib/memory-keeper.ts:341` `let preferred = 'Maya'; // Default`),
or an onboarding step that asked what to call MAIA and stored the answer in the member-name slot —
it is returned as **the member's** display name and greeted verbatim. The renderer is behaving
correctly; it is being fed the assistant's name in the member's slot.

This is **stale client-side state**, which is why it appears on one device and not on desktop.

**SMALLEST CHANGE.** Two parts, and deliberately *not* a string patch:

1. **Structural guard** — `resolveDisplayName()` must reject the assistant's own identity names
   (`maia`, `maya`, `anthony`, plus `oracle`) from the *member*-name slot, exactly as it already
   rejects `friend`/`guest`. A member-name resolver that can return the assistant's name is the
   defect; the observed string is a symptom.
2. **Find the writer** — locate what wrote `Maya` into a member-name key and stop it at the source.
   A guard alone hides the leak; the write path is the real bug.

⛔ Do **not** clear the founder's localStorage before reading it — that destroys the only evidence.

**MUST BE LIVE-WITNESSED.** On the affected iPhone, in Safari devtools or via the existing
`🔍 [resolveDisplayName]` console diagnostic (already in the code at
`greetingService.ts:15`), read and record:

```js
localStorage.explorerPreferredName
localStorage.explorerName
JSON.parse(localStorage.beta_user || '{}')
```

Whichever holds `Maya` names both the leak and the writer to hunt. Also capture the exact greeting
string **with punctuation** to confirm which of the three (or a fourth) path rendered it.

---

## Trace #2 — Why does Text → Speak sometimes return visual voice mode without operational voice?

**Status: CAUSE CONFIRMED (code), patch applied, awaiting Phase-2 device witness.**

**WITNESSED.** Founder report: returning to Speak from Text does not always restore working voice.

**SOURCE.** The `Speak` button handler in the composer toolbar of
`components/OracleConversation.tsx`.

**CAUSE.** The handler was `onClick={() => setShowChatInterface(false)}` — nothing else. It moved the
visible UI and left every other piece of mode state behind. Critically it left `lastSendWasVoiceRef`
untouched, and `handleTextMessage` deliberately sets that ref `false` on a typed turn (documented
consent boundary: *typed input is not voice re-consent*). All seven auto-restart paths are gated
`if (lastSendWasVoiceRef.current)`. So after typing, the ref is `false`, the tap flips only the UI,
and nothing can arm the mic. It looked intermittent because it still worked when the member had not
typed first — the ref was still `true` from an earlier voice turn.

**SMALLEST CHANGE (applied).** Made the transition atomic, mirroring the already-working audio-enable
handler: UI → unmute → **record voice consent** → `enableAudio()` → `startListening
('speak_button_gesture')`, with a `canStartListening` guard and a warn branch. Touch target 32→44px.
The consent boundary is **not** weakened — it is honored more precisely: tapping `Speak` *is* an
explicit gesture to speak. Auto-re-arm after a typed turn remains prohibited.

**MUST BE LIVE-WITNESSED.** Phase-2 (native lane) per
`docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md` — a code read cannot close a mic claim.
Type a turn, tap `Speak`, speak. Expect `🎤 [mode] Speak tapped — mic armed`; the warn branch
distinguishes "handler never ran" from "capability refused."

---

## Trace #3 — Why does `thinking` own a separate large mobile region?

**WITNESSED** *(image 1, iPhone Safari — confirmed directly)*. A full-width band in a **different
visual register** from the warm conversation field: dark navy panel, `○ thinking` in amber at the
left, bug-report button at the right. It reads as system status, not as MAIA.

**SOURCE.** `components/voice/VoiceInteractionBar.tsx`, rendered at
`components/OracleConversation.tsx:10075` as a **fixed bottom zone**. State derived at
`OracleConversation.tsx:846-847`: `(isProcessing || isResponding) ? 'thinking'`. Label and dot at
`VoiceInteractionBar.tsx:81` (`StateDot`) and `:121` (`stateLabel`).

**CAUSE.** State was deliberately *relocated into its own persistent bar* — see the in-code note at
`OracleConversation.tsx:8932`: *"Voice state display moved to VoiceInteractionBar (fixed bottom
zone)."* So this is a **ruled placement**, not an accident. The bar is a permanently-reserved
full-width region whose height does not vary with how much it has to say, and whose navy surface
belongs to the *threshold* palette while the conversation field is the *inhabited* warm-amber
register (`feedback_two_palette_system`). Hence the "infrastructural" read: right palette family for
admin chrome, wrong one for an encounter state.

Because it is a fixed reserved zone, `thinking` costs the same vertical territory as `speaking` and
as `idle` — the interface does not get smaller when there is less to say. This is the direct
instance of **"MAIA should never require more screen in order to communicate less."**

**SMALLEST CHANGE (proposed, not applied).** Do not delete state legibility. Move the *expression*
into the field and let the reserved zone collapse:

1. `thinking` becomes a **subtle gathering / inward movement** in the existing aurora (an inward
   drift and slight contraction) plus a small `thinking…` line beneath the Holoflower, in the warm
   register.
2. The fixed bar collapses to zero height when `voiceState === 'idle' | 'thinking'`, retaining its
   interrupt affordance only while `speaking`.
3. The bug-report button leaves this zone — it is developer utility occupying encounter space.

⚠️ Because the current placement is **ruled**, this is a change *against a ruling* and needs founder
sign-off, not a patch.

**MUST BE LIVE-WITNESSED.** iPhone Safari **and** installed PWA, all four states, with the viewport
budget recorded for each. Accessibility check: state must remain perceivable without relying on the
aurora alone (reduced-motion, and non-visual announcement).

---

## Trace #4 — Why doesn't the field yield vertical space when text becomes primary?

**WITNESSED.** *Directly (image 2, desktop Safari):* large violet field persists above the transcript
in text mode with `TAP TO SPEAK` still labeled beneath the Holoflower — a voice-sized field with text
UI stacked underneath. *Directly (image 3, iPhone keyboard open):* the field **is** gone — good — but
the SOULLAB logo and bug button occupy the space immediately above the keyboard, the most valuable
real estate on screen. *Founder-reported (capture not received):* substantial unused dark vertical
space between field and greeting.

**SOURCE.** `holoflowerSize` state, `components/OracleConversation.tsx:1471`, consumed at `:8239`,
`:8248`, `:8298-8319`. Composer clearance: `composerClearancePx` (`:3534`), applied at `:9070`.

**CAUSE (partially established — this trace is NOT complete).** `holoflowerSize` is initialized from
a `useState` initializer and, on the evidence gathered, is **not a function of whether text is the
primary activity**. The transcript is positioned *relative to the composer* (`composerClearancePx`
governs its bottom edge) while the field's size is governed independently — so the two are laid out
by **separate, uncoordinated rules**. There is no single owner of "how should vertical territory be
divided right now," which is exactly why the field can stay voice-sized while text is active. This is
the layout-level counterpart of the state-level scattering in F5 of the main review.

**Not yet established, and required before proposing a change:** the full set of inputs to
`holoflowerSize` (resize listeners, breakpoints, mode dependence), and whether any state already
distinguishes text-primary from voice-primary for layout purposes.

**SMALLEST CHANGE.** Deliberately **not proposed yet** — per founder instruction, the field's
behavior should be designed as one grammar (below), not patched per-state. One item *is* separable and
safe now: **hide the SOULLAB logo and bug button while the keyboard is open** (image 3) — pure
subtraction from the most contested space, no state redesign.

**MUST BE LIVE-WITNESSED.** Field height in all five states — Text, Speak, Thinking, keyboard-open,
orientation change — across **both** iPhone Safari and installed PWA, with a viewport budget table per
state.

---

## Trace #5 — Which persistent desktop controls could become contextual?

**WITNESSED** *(image 2, desktop Safari — confirmed directly)*. Simultaneously present: home icon ·
`MAIA` · `K Kelly` · bookmark · `MAIA voice: Off` pill · `TAP TO SPEAK` · transcript · `Current shift`
card with `Threshold` badge and `entering water | leaving earth` · `MAIA` label + rainbow indicator +
`L1` · `Mark this moment` / `Not now` · `Speak` · composer · `+` · mic · SOULLAB logo · `Report a bug`.

**SOURCE.** ~20 `fixed` overlays in `OracleConversation.tsx`; exactly **one** `hidden md:block` and
**one** `md:hidden` in the entire 10.5k-line component — so almost nothing is responsive-gated.

**CAUSE.** Additive accretion with no room-membership test. Per
`docs/design/INHABITABLE_ARCHITECTURE.md` this is the **warehouse failure mode**: every capability
visible at once.

**SMALLEST CHANGE (proposed, ordered by safety).**

1. **Build-gate developer utility** — `Report a bug`, the debug readout (`:10141`), analytics toggle
   (`:9691`). Zero member-facing loss. *Below the authority boundary.*
2. **Collapse redundancy** — two limits banners + three modals into one notification channel that can
   show only one thing at a time.
3. **Make contextual, not removed** — `L1`, the rainbow indicator and `TAP TO SPEAK` (wrong in text
   mode) appear on intent rather than permanently.
4. **Typography hierarchy** — MAIA's body currently renders large gold serif while the member's own
   text is small plain white; an entire long answer becomes declarative. Proposal: MAIA body somewhat
   smaller and quieter with generous line-height, **gold reserved for meaningful emphasis**, so
   emphasis means something. *Touches brand register — founder call, not a patch.*

**MUST BE LIVE-WITNESSED.** Desktop Safari + Chrome after gating; confirm nothing member-facing was
lost.

---

## The grammar this points at (founder framing, recorded — not authorized)

One room, four conditions, almost no extra UI:

| Condition | Field |
|---|---|
| Listening | deep receptive field (indigo — inward, nocturnal) |
| Thinking | subtle gathering / inward movement |
| Speaking | warm auroral emergence through the field (gold) |
| Text | field recedes, words come forward |

If this holds, whole pieces of mobile chrome can be **removed** rather than beautified — the
`thinking` band being the first candidate. The aurora is therefore **not a cosmetic ticket**: it is
the common language for listening → thinking → speaking, and it should be designed as that language
or not at all.

## Next unit

Complete trace #4 (the full input set for `holoflowerSize`, plus whether any state already
distinguishes text-primary from voice-primary). That trace gates the field grammar, and the field
grammar gates both the aurora and the `thinking` band. Then propose the smallest coherent mobile
revision with evidence, before implementation.

---

## ⚠️ CORRECTED FINDING (2026-08-13, after Simulator + DOM witness)

The earlier claim in this document — that the caption *"named the recovery action but could not
receive it"* — is **WRONG**. It is left standing above rather than deleted, because the correction is
more instructive than the finding was.

> **CORRECTED FINDING:** the caption itself had `pointer-events: none`, but its clickable ancestor
> owned the interaction and remained `pointer-events: auto`; therefore the caption area was already
> part of the effective voice target. The actual defect was **low effective opacity** plus the
> **absence of pending/failure state representation**.

Measured in the live DOM: the ancestor is `cursor-pointer opacity-60 hover:opacity-80`, ~180×118px,
carrying its own `onClick` and `pointer-events: auto`. Clicks on the caption passed **through** to it.
So tapping the words very likely always worked.

What was genuinely broken:

1. **Effective opacity 0.6.** `opacity` on an ancestor scales the whole subtree, so the caption
   rendered at ~55% of its intended value (`text-amber-200/85` × 0.6 ≈ 0.51). This is why it read as
   decorative rather than interactive — and why two successive contrast fixes achieved nothing: **no
   colour or shadow inside an `opacity` subtree can escape it.**
2. **No pending/failure states.** Real, unaffected by the above, and the actual substance of the P0:
   the caption said `Tap to Speak` during *and after* a failed activation.

**Consequence:** the 44px button added in response to the mistaken diagnosis was solving a
hit-target problem that did not exist. It was **removed** (founder ruling 2026-08-13), along with the
negative margins and contrast hacks it required. The fix is opacity **ownership**: the interaction
container stays opaque; the 0.6 attenuation belongs to the decorative Holoflower subtree only. The
field can be ethereal; instructions cannot.

### The methodological lesson

> ⭐ **Trace effective interaction through the rendered ancestry, not merely the DOM node where the
> symptom appears.**

A property read on the element that *looks* broken can be completely overridden by an ancestor that
owns the behaviour. `pointer-events: none` on a child says nothing about whether the region is
interactive.
