---
name: maia-conversation-review
description: Review MAIA's primary conversation surface (app/maia, OracleConversation) as a lived inhabited environment on PWA/iOS — mode continuity, composer ergonomics, field crowding, response legibility, interruption. Use when asked to review the main page, the chat/voice experience, the PWA field, "why won't it switch back to speak mode", crowding on mobile, or to compare against ChatGPT/OpenAI-class conversation UX. Read-only by default; produces a findings instrument, never a change.
---

# MAIA Conversation Surface Review

*The conversation is the product. iOS, PWA, and desktop are delivery vehicles.*
*A review that reports "the route loads and the composer renders" has reviewed nothing.*

Invoked as: **`review the MAIA conversation surface`** · `/maia-conversation-review [surface]`

⛔ **READ-ONLY BY DEFAULT.** This skill produces a findings instrument. Implementation
is a separate, separately-authorized unit. A finding may be *written as a ready patch*;
it may not be *applied* under this skill's authority.

## Governing authority — read before the first pass

| Instrument | What it governs here |
|---|---|
| [`docs/design/INHABITABLE_ARCHITECTURE.md`](../../../docs/design/INHABITABLE_ARCHITECTURE.md) | **The design law.** Rooms, gestures, warehouse failure mode, adaptive calm. This outranks every UX convention below. |
| [`docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md`](../../../docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md) | **Evidence lanes.** Which claims need Phase 1 (fast lane) vs Phase 2 (native lane). Binding. |
| [`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`](../../../docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md) | Any change to voice, tone, or relational behavior. |
| `CLAUDE.md` → Founder escalation | Whether a finding is below the authority boundary (implement) or above it (escalate the principle). |

## The comparative baseline — borrow mechanics, refuse retention

ChatGPT/Claude/Gemini mobile apps have solved real conversation-surface mechanics through
enormous iteration. Those solutions are **legitimately borrowable** and it is not drift to
study them. But they are built for an engagement-optimized product, and MAIA is not.

**Borrow freely (mechanics of legibility and control):**
- One composer, always in the same place, never relocating between modes.
- Mode transitions that are **atomic** — one tap moves *every* piece of state, or the tap is refused.
- Latency made legible (streaming, a settled thinking state) rather than hidden.
- Interruption as a first-class gesture — the member can always stop output mid-flight.
- Keyboard handling that never occludes the last turn.
- Persistent scroll position; new content never yanks the reading position.
- Touch targets ≥44px; destructive actions never adjacent to routine ones.
- Chrome that recedes during reading and returns on intent.

**Refuse (retention patterns — these violate canon, not merely taste):**
- Streaks, badges, unread counts, "you haven't talked to MAIA in N days."
- Suggestion chips that manufacture the next turn for the member.
- Notification hooks that re-engage rather than serve a member-set intent.
- Anything that raises session count as its own success metric.

**The test for any borrowed pattern:** does it increase the member's *control and clarity*,
or the system's *hold on their attention*? Borrow the first. Refuse the second.

## Why the witness loop is not optional

Founder ruling 2026-08-13, after the P0 voice-recovery unit. In one pass, **looking at the
running surface caught three defects a code-only review had already missed** — and two of
them were invisible in the diff by construction:

1. **An apparently decisive code-read diagnosis, overturned by the DOM.** The caption sat in a
   `pointer-events: none` container, which read as "the recovery instruction cannot be tapped." The
   rendered ancestry disproved it: the clickable ancestor owned the handler and was
   `pointer-events: auto`, so clicks passed through and the region was already the voice target. The
   real defect was **effective opacity 0.6** inherited from that ancestor, plus missing pending and
   failure states.

   > ⭐ **Trace effective interaction through the rendered ancestry, not merely the DOM node where
   > the symptom appears.** A property on the element that looks broken can be entirely overridden by
   > an ancestor that owns the behaviour.

   Corollary: **`opacity` on an ancestor cannot be escaped from inside.** Two contrast fixes were
   applied before measuring the ancestor chain, and neither could have worked.
2. **A pre-existing dual layout authority.** Two competing `resize` listeners rendered the
   same object at two different centres in the same frame. Visible instantly on screen,
   invisible in any single file read.
3. **A safety fix that initially cost too much viewport.** The repair replaced a 15px caption
   with a 56px block and shifted the field centre — amplifying the very defect the unit was
   deliberately not fixing. Caught by re-measuring after the change, not by review.

> ⭐ **A code read establishes what the code says. Only a witness establishes what the member
> meets.** These are different claims, and the second is the one that ships.

Corollaries this unit earned the hard way:

- **Re-witness after *any* change, including presentation-only ones.** "className and margins,
  no logic" still invalidated a proven contract. Presentation-only is not the same as
  re-established. (It also silently broke the build — a `{/* */}` comment placed directly
  inside a `{cond && (…)}` expression is invalid JSX; only reloading the page revealed it.)
- **Attribute before repairing.** When a defect appears alongside your change, reproduce it on
  pinned, unpatched trunk under the same viewport and state before classifying it. "I didn't
  touch those lines" is not attribution.
- **Do not fix a symptom that is load-bearing evidence.** Aligning one coordinate would have
  made the screenshot correct while leaving the dual authority alive — destroying the proof
  and preserving the defect.

## Standing evidence rules (non-negotiable)

1. **Name the evidence class on every finding.** `CODE-READ` · `PHASE-1 DEVICE` ·
   `PHASE-2 DEVICE` · `PROD-LOG` · `INFERENCE`. An unlabeled finding is inadmissible.
2. **Voice, mic lifecycle, TTS, and permissions claims require PHASE-2 evidence** per the
   verification loop. A code-read may *locate* such a defect; it may never *close* it.
3. **Read the live SHA, not just the working tree**, before claiming a member is affected today.
4. **Never claim a member-facing effect from a code path alone.** Say what the code does;
   say separately what a member would experience, and mark that second claim's class.
5. **`git blame` the surprising line before calling it a bug.** This surface carries dense
   intentional comments; several apparent defects are ruled constraints. If a comment says a
   pattern is *ruled*, the finding is against the ruling, not the code — escalate the principle.
6. **Sweep the memory corpus, not just the code, for governing rulings.** Rulings on tokens —
   color, palette, copy, naming, register — frequently live *only* in
   `~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory/`, with nothing in the file itself.
   Before proposing or applying any token change, grep that corpus for the token and its family.
   This is mandatory for palette/color work. Learned the hard way: a review passed the in-code
   constraint check and then softened a palette that canon marks **LEGACY, do not extend** — the
   ruling existed, just not where the check was looking.

   A constraint check that only looks where constraints are *usually* written will certify changes
   that violate constraints written elsewhere.

## The passes

Run in order. Each pass has one question and produces findings, not fixes.
**Pass 0 runs first and outranks taste** — a safety finding is not weighed against aesthetics.

### 0. Safety sweep — motion, flash, and signal bindings

Mechanical, not aesthetic. A static reading cannot see these; they exist only in motion, at rates a
reviewer rarely reproduces by hand. Grep, don't eyeball.

- **Live signals bound to visual properties.** Find any real-time value (`amplitude`, `audioLevel`,
  scroll velocity, sensor input) appearing inside `opacity`, `scale`, `transform`, `filter`, or
  `background`. Flag any with a transition **under ~400ms** or an opacity delta **over ~0.2** on a
  large area. Speech amplitude modulates at 4–8 Hz; bound directly to opacity, that is a
  WCAG 2.3.1 flash violation and a photosensitive-seizure risk regardless of design intent.
  **The binding determines the flash rate, not the intent.**
- **Threshold ownership swaps.** Patterns like `signal > 0.1 ? undefined : [...]` hand control back
  and forth between the animation library and inline styles every time the signal crosses the
  threshold. This flickers on its own, independently of any transition duration, and is easy to miss
  because each branch looks reasonable in isolation.
- **`prefers-reduced-motion`.** Required on any large animated area. Verify it *disables reactivity*
  rather than merely slowing it — and that it does not delete a state signal the member needs. Freeze
  the light, don't remove it.
- **Rhythm legitimacy.** A fixed ambient rhythm the member may entrain to is fine and can be good.
  A rhythm that *tracks the member's state and shifts its own rate to lead them* is covert state
  induction and forbidden by the non-manipulation vows. Signals may modulate brightness; they must
  never modulate period. If a change would make rhythm adaptive, that is a founder question.

## Founder invariants (2026-08-13) — these outrank every heuristic below

**The hierarchy. 1. Encounter · 2. Conversation · 3. Controls.** Three things currently compete to
be the primary experience — the field, the transcript, and the application controls. Controls appear
when needed and disappear when not. The field and transcript must not compete either: they behave as
**one breathing surface**, not two interfaces.

> ⭐ **MAIA should never require more screen in order to communicate less.**

That is the top design invariant. The clearest violation is a `thinking` state that consumes a large
band to convey almost nothing. Listening, thinking, speaking, waiting and responding are **states of
the encounter, not application modules**.

> **State should usually be expressed within the relational field before adding another piece of
> interface.**

**The field breathes rather than toggling.** Text ↔ Speak must feel like one room transforming, not
two interfaces swapping:

| Moment | The field |
|---|---|
| Voice encounter | opens |
| MAIA speaking | remains present, becomes subtly MAIA-colored |
| Member selects Text | contracts upward; conversation rises into the space |
| Keyboard opens | anything unnecessary disappears |
| Keyboard closes | the field breathes out again |
| Member returns to Speak | transcript retreats, field expands, listening unmistakable |

The governing principle: **the field expands when it *is* the experience and recedes when
conversation requires the space.** During a silent voice encounter an expansive field is wonderful.
During text interaction, transcript reading, typing, or a long response, it must yield substantial
vertical territory.

**Presence, not performance.** MAIA must not visually perform every syllable — a relational presence
*accompanies* speech rather than visualizing audio. Speech energy may affect spatial drift or
breadth; **brightness belongs to a slow 4–8s breathing envelope.** Gold emerges *inside* the field —
broad slow gradients, overlapping opacity, no hard perimeter, no amplitude strobing. Never a status
light.

**The question that ranks above all UI comparisons:**

> **Does MAIA feel like a presence inhabiting the field, or like software indicating state?**

This is the level at which to compare against OpenAI's conversation experience — **not by copying
their UI, but by studying why theirs recedes so successfully during conversation.**

**Modality independence (invariant, founder-ruled 2026-08-13).** Member **input** modality and MAIA
**output** modality are orthogonal axes. All four cells must be real and reachable:

| Member input | MAIA output |
|---|---|
| Type | silent |
| Type | spoken |
| **Speak** | **silent** |
| Speak | spoken |

> ⭐ **Switching input modality must NEVER mutate MAIA's output preference.**

Do **not** consolidate the input-modality control and the MAIA-voice control into one toggle because a
competitor ships a single microphone button — that destroys a real capability. The defect to fix is that
they *look like* they describe the same dimension, not that there are two of them. Correct framing:
microphone = *how I speak to MAIA*; speaker = *how MAIA answers me*. Two controls, ideally one place.

**How this fails, and why a code read is not enough:** the UI can correctly remember "MAIA voice off"
while a *streaming or fallback audio path* behaves as though it never heard the preference. Gating the
obvious `shouldSpeak` branch alone looks correct and is bypassed. When auditing, enumerate **every**
audio-emitting path (primary speak, streaming queue, each fallback, and any predicate that mirrors
them) — and separately confirm that visual-only state derived from the same condition was *not* gated,
or the visualizer will cut out mid-speech. Verify the four cells behaviourally on device, not in code.

**Identity witness (mandatory).** Every personalized name, greeting, relationship reference,
remembered fact and speaker attribution visible on the conversation surface must resolve to the
currently authenticated member and conversation context. A mismatch **outranks visual polish** — it
damages relational trust immediately. **Trace the source; never just replace the string.**

## Viewport budget pass (mandatory, every captured state)

For each state, account for the whole viewport:

| Bucket | px | % |
|---|---|---|
| Conversation (transcript) | | |
| Field / encounter | | |
| Navigation & header | | |
| Composer | | |
| Status (thinking/listening) | | |
| Browser chrome & safe areas | | |

Then answer: **how much of the actually available viewport serves the person's present intention?**

- **Text** → transcript + composer should dominate.
- **Speak** → the living field may dominate.
- **Thinking** → must not suddenly spend ~20% of the screen announcing thinking.

## Environment matrix — never claim "mobile fixed" from one browser simulation

A responsive desktop viewport is **not** a witness for any of these. Installed-PWA and
Safari-with-toolbar are materially different environments.

| Environment | Must witness |
|---|---|
| iPhone Safari | browser toolbar collapse/expansion, dynamic viewport |
| Add-to-Home-Screen PWA | standalone safe areas, keyboard, lifecycle |
| Desktop Safari | responsive layout |
| Desktop Chrome | baseline |
| iPhone orientation change | state / layout persistence |

Record which environment produced each screenshot. Visible browser chrome consuming viewport is part
of the budget, not an artifact to ignore.

### 1. Arrival — what does the field hold on entry?
Count every element that can be simultaneously present on a 390×844 viewport. Classify each:
**identity** · **current gesture** · **utility** · **debug** · **orphan**. Per Inhabitable
Architecture, a surface that displays all capabilities at once has failed. Report the count
and the orphans by line number.

Mechanically: inventory `fixed`/`absolute` positioned elements and check which are
responsive-gated (`md:hidden` / `hidden md:block`). Ungated chrome is mobile-present chrome.

### 2. Mode continuity — is the switch atomic?
Enumerate every state variable that constitutes "which mode am I in" (input mode, listening,
mute, audio-enabled, consent flags, refs). Then, for **each** transition affordance, verify it
moves *all* of them. A transition that moves the visible UI but leaves a gating flag behind is
the highest-severity class of defect on this surface: the member acted, the system displayed
success, and the capability is dead.

Build the table explicitly — do not eyeball it:

| Affordance | line | sets UI | arms/disarms mic | sets consent flag | unmutes | atomic? |
|---|---|---|---|---|---|---|

### 3. Composer ergonomics under keyboard
Keyboard open on iOS PWA: is the last turn visible? Does the composer track the visual
viewport? Are safe-area insets applied at the *bottom* as well as the top? Does a mode switch
while the keyboard is open leave a gap or an occlusion?
⚠️ Check for existing ruled constraints on `dvh`/`visualViewport` in this component before
proposing either — some are deliberately forbidden with measured reasons in-comment.

### 4. Response legibility
Time-to-first-token; whether waiting is a settled state or a void; whether streaming text
reflows the reading position; whether interruption is reachable *while* MAIA speaks; whether a
failed turn is recoverable without losing what the member typed.

### 5. Constitutional consistency
Does the surface's grammar match its canon? Dashboard/inventory grammar is forbidden drift.
Does anything infer member state rather than reading authored facts (sovereignty rider)? Does
any control's *label* de-conflate from its *function* — especially adjacent controls that read
as the same thing (a known trap on this surface: input-mode vs MAIA-voice-output).

## Output

Write to `docs/design/reviews/MAIA_CONVERSATION_PWA_REVIEW_<YYYY-MM-DD>.md`. Never inline.

Each finding:

```
### F<n> — <one-line defect>
**Evidence class:** CODE-READ | PHASE-1 | PHASE-2 | PROD-LOG | INFERENCE
**Severity:** capability-dead | degraded | friction | polish
**Location:** file:line
**What the code does:** <mechanism, no interpretation>
**What a member experiences:** <marked separately, own evidence class>
**Ruled-constraint check:** <comment/blame result, or "none found">
**Fix:** <precise change, or "needs Phase-2 evidence first">
**Authority:** below boundary (implement) | above boundary (escalate principle)
```

Close with: findings by severity · what this review could NOT establish and which lane
would · the single highest-value next unit.

## Running it as a loop

This skill is one pass. To make it a standing loop:

```bash
/loop 1d review the MAIA conversation surface
```

Loop discipline: each run reads the **previous** review doc first and reports **deltas** —
newly closed, still open, newly appeared, and *regressions*. A loop that re-reports the same
open findings every day is noise; a loop that catches a regression the day it lands earns its
cost. If a run finds no delta, say so in one line and stop — do not pad.

## Anti-patterns for this skill

- ⛔ Proposing a redesign of a 10k-line component as one unit. Findings are individually shippable or they are not findings.
- ⛔ Reporting "crowded" without the element count and the orphan list.
- ⛔ Closing a mic/voice finding on a code read.
- ⛔ Importing a competitor's pattern because it is standard, without running the control-vs-attention test.
- ⛔ Treating a dense in-code comment as noise. On this surface it is usually the ruling.

---

## Emerging Conversation Patterns — a standing track (HELD, not authorized)

Founder-authored spec: **[`references/emerging-conversation-patterns.md`](references/emerging-conversation-patterns.md)**.
Load it when running that pass; do not improvise the pass from this file.

A research and discernment pass that does **not** authorize implementation. Governing question:
*is conversational AI learning a fundamentally better way for a human and an intelligence to be
together — and if so, what principle belongs in MAIA?* Ten domains, a six-field evaluation filter, a
five-verdict scale (WATCH · PROTOTYPE · DESIGN INPUT · ADOPT · REFUSE), a standing refusal test, and a
ledger.

Companion vision: **[`references/living-field-as-body-language.md`](references/living-field-as-body-language.md)**
— *"The Living Field should become MAIA's body language. Not her body. Her body language."* Carries the
seven attentional gestures, the five silences, and the relational palette with meaning attached.

⭐ **The one rule from it that applies to ALL field work, now, not just future work:**

> **Animate what MAIA knows about her own conversational state before animating what MAIA infers about
> the member's inner state.**

MAIA reliably knows whether she is listening, waiting, retrieving, responding, speaking, or has yielded
— those may drive the field. Whether the member is sad, afraid or resistant is inference and must stay
tentative. ⛔ No visual emotion detection (*"you sound sad" → blue field*); acoustic cues are evidence,
never truth. And ⛔ never mistake **technical silence** (dropped audio, stalled connection) for
contemplative silence — say the technical thing.

Three things to carry even without loading it:

- ⭐ **The ledger is kept completely separate from the defect backlog** (founder ruling). Full-duplex
  may sit at `WATCH` for six months without becoming implied work. No tickets for WATCH items.
- ⛔ **Consent rider:** nothing requiring a persistently open microphone may be designed or
  prototyped until a founder ruling addresses **third-party consent** — the other voices in the room
  never opted in.
- ⭐ **Final standard:** an emerging technology earns attention when it allows **less interface to
  support more relationship** — not when it makes MAIA seem more advanced.
