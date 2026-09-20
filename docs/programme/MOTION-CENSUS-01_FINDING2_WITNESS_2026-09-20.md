# MOTION-CENSUS-01 — Finding 2 Witness

**2026-09-20 · founder act (act "A") · READ ONLY**
**Instrument** `scripts/witness/maia-turn-visibility.ts`
**Standing** ❌ **RED — STRUCTURAL EXPOSURE ESTABLISHED** · ⛔ INCIDENCE NOT MEASURED ·
⛔ REPAIR NOT AUTHORIZED · PRODUCTION UNTOUCHED

---

## The act as authorized, and how it changed shape

Authorized act: *force a message's entrance animation not to complete, check
whether MAIA's text is readable.* A runtime probe.

**It was not spent as a runtime probe, for two reasons — both recorded rather
than quietly substituted.**

1. ⚠️ **It could not be.** This container has no `node_modules` and no
   `framer-motion`. A browser witness is owed to a host with the app installed.
   *A statement about the environment, not a deferral.*
2. ⭐ **Reading the source answered the exposure question more cheaply and more
   exactly than the probe would have** — and once read, a probe designed to
   discover what source already shows would be theatre.

So the act delivered a **structural falsifier** instead: a guard asserting the
law, run against canonical, required to go RED. That is the Class A discipline
this repository already uses — known-bad must reproduce before anything is
called a defect.

⛔ **What the substitution costs is stated plainly below**: the probe would have
spoken to *incidence*. The falsifier does not, and nothing here should be read
as if it did.

## The law asserted

> **MAIA's turn must be readable without an animation having completed.**

Structurally: JSX rendering a turn's **text** must not be enclosed by a
`motion.*` element whose `initial` makes it invisible.

This is not a taste rule imported from outside. It is the canon's own sentence
applied to the one surface carrying MAIA's speech —
`docs/SOULLAB_DESIGN_CANON.md`, "Don't": *"Use Framer Motion for elements that
must be visible on load"*; and, in "Animations & Transitions": *"avoid
`initial={{ opacity: 0 }}` on important content."*

The guard does not decide what is important. It decides **MAIA's turn is**, which
is the narrowest possible reading of "critical content" in a conversational
companion. ⛔ It rules on no other surface.

## Result — RED on 6 surfaces, 8 turn-text sites

| surface | initial state enclosing the turn's text |
|---|---|
| `components/OracleConversation.tsx` ⭐ **the live `/maia` surface** | `opacity: 0, y: 0` |
| `components/chat/MaiaBubble.tsx` ⭐⭐ | `opacity: 0` **+ keyed on its own text** |
| `components/chat/MessageBubble.tsx` | `opacity: 0, y: 10` |
| `components/chat/ChatMessage.tsx` | `opacity: 0, y: 12, scale: 0.98` |
| `components/chat/ConversationFlow.tsx` | `opacity: 0, x: 20` |
| `components/chat/BetaMinimalMirror.tsx` | `opacity: 0, y: 20` |

`EnhancedMirrorView` and `MirrorInterface` render no turn text themselves and
are reported **n/a**, ⛔ deliberately not green — an instrument that scores a file
green for a question it never asked there is satisfying itself by not asking.

### ⭐ The live surface

`components/OracleConversation.tsx`, the component `/maia` renders. The message
loop wraps **every** turn:

```jsx
initial={{ opacity: 0, y: 0 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 0 }}
transition={{ duration: 0.5, ease: "easeOut" }}
```

⭐ **`y: 0` on both sides — there is no movement.** It is a pure 0.5s fade. The
motion carries no spatial meaning; it only delays readability. The `y` is
vestigial.

⚠️ **This also defeats the cheap global mitigation.** Framer's
`MotionConfig reducedMotion="user"` disables transform and layout animations and
**preserves opacity animations** by design. A root-level reduced-motion provider
would not touch this. The caveat carried into the recommendation is confirmed
load-bearing, not hypothetical.

### ⭐⭐ `MaiaBubble.tsx` — the most severe, and nearly missed

```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={displayedText}          // remounts on every text change
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    {displayedText}
```

Keying a node on its own streaming content means **every token remounts it**, and
each remount restarts `initial` from invisible. `mode="wait"` further delays the
entering node until the outgoing one finishes exiting. Structurally, streaming
text here can spend the stream cycling through fade-ins rather than settling at
readable.

⛔ **Not run, so not measured** — framer may coalesce updates in ways source does
not show. Recorded as the strongest *structural* case in the set, not as an
observed behaviour.

⭐ **This was found only because the first run's `INSTRUMENT FAILURE` was
investigated instead of dismissed.** The detector looked for `message.text` and
this surface holds the turn in `displayedText`, so the instrument reported it
could not find what it had been told was there — and it refused to call that a
pass. Had it been written to score silence as green, *the worst violation in the
set would have been invisible to the instrument as well as to the member.*
The detector was widened; **the law was not.**

## Established / not established

**ESTABLISHED** — on six member-facing conversation surfaces including the live
one, MAIA's words render at `opacity: 0` and become readable only when the
animation engine drives them to 1. The canon forbids exactly this, in writing,
for exactly this reason.

**NOT ESTABLISHED** — ⛔ that any animation has ever failed · ⛔ that any member
has ever lost or struggled to read a turn · ⛔ how often it would happen · ⛔
anything about the deployed runtime, which was not read.

⚠️ **This is exposure, not incidence.** The resemblance to the 2026-09-07
voice-silence defect is structural — there MAIA's turn was *committed* as a side
effect of TTS; here it is committed correctly and handed to an animation to
decide whether it becomes *visible*. **That resemblance is an argument for
looking, ⛔ never evidence that the defect occurred.** The 2026-09-07 fault was
measured. This one is not.

## Owed — ⛔ none authorized by this record

1. **Founder ruling on repair.** The exposure is confirmed on MAIA's own speech
   and the canon already forbids it. Whether that is sufficient to repair
   without first measuring incidence is a founder call, not this lane's.
   If taken, the bounded shape is: turn **text** renders readable; any fade
   moves to the chrome around it. ~6 components, guard already written.
2. **The runtime probe, if the ruling wants incidence** — owed to a host with the
   app installed. It would answer *how often*, which this act cannot.
3. `MaiaBubble.tsx`'s `key={displayedText}` under `mode="wait"` — worth a
   separate look whatever is decided about the fade, ⛔ not repaired here.

⛔ NOT AUTHORIZED BY THIS RECORD: any component change · any motion repair ·
wiring this guard into `preflight` or any commit gate · adopting any external
design skill · deploy · migration.

⭐ *The canon named this failure mode in writing. The instrument found it on the
surface that carries MAIA's speech. Neither fact says a member has been harmed —
and that distinction is the whole discipline.*
