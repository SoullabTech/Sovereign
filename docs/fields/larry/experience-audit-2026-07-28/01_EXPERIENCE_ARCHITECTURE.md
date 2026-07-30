# Now What? — Experience Architecture & Register Audit

**Date:** 2026-07-28
**Object:** `app/now-what/*`, `components/now-what/*`, `app/api/now-what/*`
**Method:** Code-walk in route order as a first-time executive client. Every screen is split into
**OBSERVATIONS** (literally present in the code — copy quoted verbatim, `file:line` cited) and
**INTERPRETATIONS** (inferred experience). Register is judged per screen from the copy strings and
affordances actually rendered.
**Discipline:** No recommendations appear in the body. Anything that reads like a fix is confined to
Appendix C as a raw observation. Where the rendered experience depends on runtime data or a live
model call, the audit says **cannot determine from code**.

---

## 0. Entry topology (what a first-time client actually traverses)

**OBSERVATIONS**

- `/whatnow` and `/what-now` → 307 → `/now-what` (`next.config.js:121-129`).
- `/now-what` → 307 → `/now-what/room` (`next.config.js:136-141`), comment: *"room as entry
  (2026-07-08). The front door of the Now What? field is the live room, not the pitch slideshow."*
- Unauthenticated hit on any `/now-what*` path → middleware redirects to
  `/now-what/arrive?next=<original path+query>&rid=<rid>` (`middleware.ts:290-296`).
- `/now-what/welcome` is `public: true` (`config/accessMatrix.ts:57`); `/now-what/room` is
  `minTier: 'free'` (`config/accessMatrix.ts:68`); `/now-what/arrive` is public
  (`config/accessMatrix.ts:69`).
- `/now-what/field`, `/questions`, `/next`, `/position`, `/themes`, `/reflections`, `/map` have **no
  rule** in `ACCESS_RULES`. Unmapped routes are **allowed** in the default `permissive` mode
  (`config/accessMatrix.ts:597-603`, `checkAccess` `no-rule-match` branch). Their gate is
  client-side: `useMemberSession()` (`components/now-what/NowWhatShell.tsx:43-53`) reading
  `localStorage.beta_user`.
- `themes` and `reflections` call `NowWhatShell` but never call `useMemberSession` — they render
  their full content with no session branch at all (`app/now-what/themes/page.tsx:23-31`,
  `app/now-what/reflections/page.tsx:21-29`).
- Registration is gated on the `next` URL carrying a `fieldContext` in a hardcoded allowlist
  `{'now-what-demo', 'now-what', 'flourishing'}` (`app/api/now-what/register/route.ts:39-50`).
  Failure returns 403: *"This door opens with an invitation link. Ask the person who invited you to
  send theirs again."* (`register/route.ts:70`).
- `/now-what/arrive` defaults `next` to `/now-what/room` — **no fieldContext** — when the param is
  absent (`app/now-what/arrive/page.tsx:38`).

**INTERPRETATIONS**

- There are two mutually exclusive first-time clients: the one who clicks a practitioner's link
  carrying `?fieldContext=…`, and the one who types `whatnow` / follows the public landing CTA. The
  second one traverses the identical visual path and is refused only at the moment of form
  submission. Everything before that point tells them they are welcome.
- The gate is invisible until it fires. Nothing on `/now-what/arrive` distinguishes an invited
  arrival from an uninvited one — same holoflower, same *"You were invited here."*, same two tabs.
- Because `/themes` and `/reflections` are unmapped and un-gated on the client, a signed-out visitor
  can read them in full. They contain no member data by construction, so this is a reachability
  fact, not a disclosure one.

---

## 1. `/now-what/welcome` — public landing

`app/now-what/welcome/page.tsx`, rendered by `components/landing/PublicSectionLanding.tsx`

**OBSERVATIONS**

- Eyebrow: **"Now What?"**; H1: **"Flourishing in the Midst of a Busy Life"**; subtitle: *"A place to
  meet what is actually happening, and find the next real step."* (`lib/og/ogCard.tsx:188-196`).
- Body paragraphs (`welcome/page.tsx:29-33`):
  1. *"A live room where you bring the actual thing — the decision, the overwhelm, the question that
     keeps coming back — and work with it until a next real step appears."*
  2. *"You speak; MAIA listens and works with you — plainly, without scripts or diagnosis. When the
     step is clear, the room lets you go. The point is your life, not the session."*
  3. *"Private by design: self-hosted, consent-first, nothing sold, nothing farmed."*
- CTAs: **"Enter the room"** (primary, → `/now-what`) and **"Program overview"** (→ `/now-what/pitch`)
  (`welcome/page.tsx:34-37`).
- Visual: warm dark-brown gradient `#1A1513 → #241C18`, cream text `#F3EDE4`, accent `#3A7CA5`
  (steel blue), bold 4xl/5xl headline, `font-semibold` pill CTAs
  (`PublicSectionLanding.tsx:36-37, 50, 60-72`).
- Larry Closs is not named anywhere on this page.

**INTERPRETATIONS**

- **User goal:** decide in under thirty seconds whether this is worth their time.
- **Likely state:** skeptical, time-poor, evaluating. Possibly arriving from a forwarded link with
  no context.
- **Encourages:** clicking "Enter the room" — it is the only accented affordance and it is a verb of
  arrival, not of signup.
- **Discourages:** slow reading. Three short paragraphs and two buttons produce a decide-now posture,
  not an orienting one.
- **Assumption made about the user:** that they already know who invited them and why. The page
  names no practitioner, no program, no cohort — the reader must supply that context themselves.
- **Cognitive load:** low. **Momentum:** high, and it points directly at the registration wall.
- **In the background:** the fact that "Enter the room" is not enterable without an invitation link.
- **Unnecessarily visible:** "Program overview" as a co-equal pill — for an already-invited client
  it is a detour out of the practice path.

**REGISTER: marketing site → software.** Bold sans headline, `font-semibold` pill CTAs, a feature
triad ending in *"nothing sold, nothing farmed"*. The words describe a room; the typography and the
button grammar describe a product page. The palette (warm brown/cream/steel blue) belongs to a
different visual world than every screen that follows (navy `#062a42`, amber `#ffe27a`), so the
register break is also a chromatic one.

---

## 2. `/now-what/arrive` — the environment's own door

`app/now-what/arrive/page.tsx`

**OBSERVATIONS**

- Full-bleed navy `#062a42` (`arrive/page.tsx:189`), a `RoomHoloflower` at 120px with `coolTint mono`
  (`:102`), eyebrow `Now What?` in amber `#ffe27a` at `tracking-[0.45em]` (`:103-105`).
- H1: **"You were invited here."** (`:106-108`) — `text-2xl font-extralight`.
- Sub-line: *"This is a place where the work you started together keeps living between conversations.
  What you say here is private — you choose, item by item, what is ever shared."* (`:109-113`).
- Two tabs, `role="tablist"`: **"Create my key"** / **"I already have a key"** (`:117-146`).
- Create fields: `Your name`, `Email`, `Choose a password (8+ characters)` (`:151-153`). No
  invitation-code field exists.
- Submit label: **"Create my key and enter"** / **"Sign in and enter"**; busy label **"Opening the
  door…"** (`:175`).
- Footer: *"Your key is yours. Signing in is how the room knows whose field to hold."* (`:179-181`).
- 409 handling pivots to sign-in with notice: *"You already have a key for this email. Sign in to
  continue through your invitation."* (`:69`).
- Errors render in `text-red-400` (`:166`).

**INTERPRETATIONS**

- **User goal:** get through the door with minimum ceremony.
- **Likely state:** mild wariness ("another account"), softened by "invited".
- **Encourages:** proceeding. "Key" instead of "account", "door" instead of "submit", "enter"
  attached to every button — the form is dressed as a threshold.
- **Discourages:** asking who invited them, or whether they have the right link. The page asserts
  invitation as a fact ("You were invited here.") rather than checking it.
- **Assumption about the user:** that they arrived via a link that carries a valid `fieldContext`.
  For anyone who did not, this screen is a three-field form that ends in a 403 (`register/route.ts:70`)
  **after** name, email, and a chosen password have been entered.
- **Cognitive load:** low, until the 403; then it spikes with no recovery affordance on the page —
  the error is a red line under the form.
- **Momentum:** high and single-directional.
- **In the background:** the whole invitation mechanism.
- **Unnecessarily visible:** nothing.

**REGISTER: software wearing a conversation's vocabulary.** The affordances are a standard tabbed
auth card (tablist, three inputs, autocomplete attributes, red error text). The lexicon —
*key*, *door*, *whose field to hold* — is the room's. The seam shows where a system message overrides
the register: *"Choose a password (8+ characters)"* and `text-red-400` are software; *"Opening the
door…"* is the room. Both are on screen at once.

**EMPTY STATE:** not applicable — no data is read.

---

## 3. `NowWhatThreshold` — signed-out room door

`components/now-what/NowWhatShell.tsx:160-244`, invoked by `room/page.tsx:36-40`,
`field/page.tsx:80-84`, `questions/page.tsx:66-70`, `next/page.tsx:67-71`, `position/page.tsx:82-86`

**OBSERVATIONS**

- 140px holoflower, staggered `nwtFadeUp` animation at 80/140/200/260/320 ms (`:182-234`).
- Eyebrow `Now What?`, then the room name as H1, then the room's own line, e.g. for the session room:
  *"Sit with MAIA. Bring the actual thing — work with it until a next real step appears."*
  (`room/page.tsx:38`).
- Constant second line: *"This room holds what you choose to keep — signing in is how it knows whose
  field to hold."* (`NowWhatShell.tsx:214-215`).
- Two actions: **"Enter"** (amber pill → `/now-what/arrive?next=<current path+search>`) and
  **"See the map first"** (underlined slate link → `/now-what/map`) (`:221-233`).
- Header comment: *"The threshold replaces the inline 'Sign in required.' API error the walk hit
  inside the room"* (`:28-30`).

**INTERPRETATIONS**

- **User goal:** understand what is behind the door before committing.
- **Likely state:** curious, unhurried; the fade-up stagger imposes a slower tempo than the landing.
- **Encourages:** "See the map first" — the presence of a second, non-committal path is unusual for
  an auth wall and reads as permission to look around.
- **Discourages:** nothing observable.
- **Assumption:** that "field" is a word the reader already accepts. It is used without definition on
  the very first gated screen.
- **Cognitive load:** low. **Momentum:** deliberately damped by the animation delays.

**REGISTER: a trusted advisor's foyer.** *"signing in is how it knows whose field to hold"* is a
sentence about custody, not authentication. "See the map first" is hospitality grammar. This is the
first screen in the flow that does not read as software.

**REGISTER SHIFT:** landing (marketing) → arrive (auth card) → threshold (foyer). Note the ordering:
the least software-like screen sits *behind* the most software-like one, and a signed-in member
never sees the threshold at all (`room/page.tsx:33`).

---

## 4. `/now-what/room` — first-visit welcome

`components/now-what/NowWhatRoom.tsx:762-812`

**OBSERVATIONS**

- Gate: renders only when `roomPhase === 'arrival' && nowWhat && !returning && !entered` (`:778`).
  `returning` is `priorPractice !== null` (`:773`).
- While return-detection is in flight *and* a `fieldContext` exists, the screen is a bare holoflower
  on navy with no text at all (`:765-772`).
- Eyebrow: **"Now What? · with Larry Closs"** (`:788`). H1: **"Welcome."** in `SERIF`
  (`ui-serif / New York / Georgia`), `text-4xl sm:text-5xl` (`:48`, `:789`).
- Body, `text-[17px] leading-[1.85]` (`:791-799`):
  - *"Flourishing is a practice — one you live, day by day, long after a conversation ends."*
  - *"This is where that practice continues."*
  - *"It's a place to return to between our conversations. A place to notice what you're learning,
    work with the questions that matter, and bring fresh experience back into the conversation."*
  - *"You set the rhythm."* / *"You decide what deserves your attention."* — both serif italic,
    `text-lg`, `text-slate-100`.
  - *"Nothing here measures you or grades your progress. The only growth that matters is the growth
    you recognize in your own life."*
  - *"Think of this as our coaching continuing — carried into your real, working life, one step at
    a time."*
- Then: *"When you're ready…"* (slate-500 italic) and one button **"Come in"** (`:801-807`).
- No skip, no secondary link, no navigation. `NowWhatShell` is in `quiet` variant above it
  (`room/page.tsx:45`), so the only other element on screen is the amber wordmark → `/now-what/map`
  and the words "Session room".

**INTERPRETATIONS**

- **User goal:** find out whose room this is and what it will ask of them.
- **Likely state:** this is the first screen with a named human on it. For an invited client the
  effect is recognition; the eyebrow does the work the landing page did not.
- **Encourages:** reading to the end. Single button, staggered 0 / 0.25 / 0.5 / 0.75s fade-ins, serif
  body — the page is paced like a letter.
- **Discourages:** skimming and skipping. There is no way past this screen except the button, and the
  button is below seven paragraphs.
- **Assumption:** that the reader is a coaching client of Larry's ("our coaching continuing", "between
  our conversations"). A client of a different practitioner, or a self-directed user, is addressed in
  the first person plural by someone they have not met.
- **Cognitive load:** low; **momentum:** deliberately slow. This is the flow's clearest tempo change.
- **In the background:** every other room. The map, field, questions, next, and position doors are
  invisible here except through the small wordmark.

**REGISTER: a coach's letter — the strongest single register on the surface.** Evidence: the serif
face reserved for spoken lines (`:48`), first-person plural (*"our coaching"*, *"our conversations"*),
the two italic imperatives about authority (*"You set the rhythm."*), the explicit refusal of
measurement, and a threshold verb (*"Come in"*) rather than a system verb (Continue / Start / Next).

**INCONSISTENCY (observation, not recommendation):** the eyebrow names **Larry Closs** (`:788`), while
`OPENING_FRAME` — reachable two screens later behind *"What is this space?"* — says *"Kelly can
accompany this field as your facilitating practitioner"* and *"Sharing any thread with Kelly is a
separate choice"* (`:139`). Two different practitioner names are addressable to the same first-time
client in the same session.

---

## 5. `/now-what/room` — arrival threshold (the first question)

`components/now-what/NowWhatRoom.tsx:814-1079`

**OBSERVATIONS**

- Holoflower (≥170px), amber eyebrow **"Now What?"**, then — conditionally — the position anchor
  block, then the question, then a centered borderless textarea, then **"Begin"**, then three quiet
  affordances, then a disclosure and the trust panel.
- **First-visit question** (`:969-971`), serif, `text-3xl sm:text-[2.75rem]`:
  **"Where's your attention right now?"** Placeholder: *"In your own words…"* (`:979`).
- **Return-visit variant** (`:960-967`): *"Last time you chose this practice:"* → the practice verbatim
  in serif italic → **"What happened?"** Placeholder: *"What actually happened…"*.
- **Position anchor block** (`:831-958`), renders only when `programArrival` is non-null and not
  dismissed:
  - Un-confirmed state: *"This room holds Larry's work — you've come in through the **{programTitle}**,
    current focus: *{cohortFocalPoint}*."* then *"Is that where you are?"* (`:856-865`).
  - Three buttons: **"Yes, that's where I am"** (amber) · **"I'm somewhere else"** (slate) ·
    **"Not now"** (dim slate, `aria-label="Not now — nothing is saved"`) (`:896-919`).
  - Correction path: a centered underline input, placeholder *"Where are you, in your own words…"*,
    `maxLength={300}`, actions **"That's where I am"** · **"Back"** (`:866-894`).
  - Confirmed state: *"Working from the **{programTitle}** — *{focalPoint}*"* with a dim
    **"I've finished this"** and *"This clears your position here; the door is open whenever you
    return."* (`:833-852`).
  - Stale state adds: *"Last time you said: *{focalPoint}*"* (`:921-925`).
  - Multi-engagement state: *"You've been working from X and Y. Which are you bringing today — or
    something else?"* (`:933-937`).
- **Three ways in** (`:1001-1041`), equal weight, dot-separated:
  **"Dictate"** (→ "Listening…") · **"Upload"** (`.txt,.md` only) · **"Discuss"**.
  Caption beneath: *"speak it once · bring a note · talk it through"* (`:1038-1040`).
- Disclosure toggle: **"What is this space?"** → the full `OPENING_FRAME` (`:1050-1061`).
  `OPENING_FRAME` is 45 lines of mostly one-sentence paragraphs (`:97-141`), opening *"Before we
  begin, I'd like to frame what we're doing together. / This isn't an intake interview. / It isn't an
  assessment."* and including *"Think of this as the beginning of a Living Field"*, *"The authority
  for meaning stays with you"*, and *"This is an early beta…"*.
- Standing line: *"What you carry stays private in your own field. Sharing with your practitioner is a
  separate, explicit choice — off by default."* (`:1062-1064`).
- `RoomTrustCopy` collapsed summary: **"What this room holds — and what it never does"**
  (`RoomTrustCopy.tsx:41`), with four labelled rows — Holds / Never holds / Who can see it / Your
  control (`NowWhatRoom.tsx:1069-1074`).

**INTERPRETATIONS**

- **User goal:** answer one question and get moving.
- **Likely state:** engaged but slightly on the spot. A large serif question with a single blinking
  centered line is a performance surface — the geometry says *say something good*.
- **Encourages:** a short, composed, written answer. The textarea is `rows={2}`, centered, borderless
  except a bottom rule; Enter submits and Shift+Enter newlines (`:982-987`).
- **Discourages:** a long or messy answer, and — despite equal styling — the three alternate ways in.
  "Dictate", "Upload", "Discuss" are `text-sm` slate-400 dot-separated on one line beneath the
  primary amber pill; they read as fine print relative to **Begin**.
- **Assumption:** that the client can locate their attention on demand and put it in words. "Discuss"
  exists precisely for those who cannot (`:750-758` comment: *"I'm not ready to formulate this — help
  me talk it through"*), but nothing on screen says that — the affordance is named for its mechanism,
  not its need.
- **Cognitive load spike:** this screen carries the most simultaneous content in the flow — up to four
  stacked blocks (anchor, question, ways-in, disclosure+trust). For a member with a program anchor,
  the first thing asked is not their attention but a confirmation of a cohort focal point.
- **Momentum:** the anchor block interrupts it. The room's own question sits below a question about
  program position.
- **In the background:** the OPENING_FRAME's entire ethical constitution, collapsed behind a
  `text-xs` dim underline.
- **Unnecessarily visible:** for a returning member with a confirmed position, the "Working from …"
  line plus "I've finished this" plus its explanatory sub-line occupy the top of the screen every
  visit.

**REGISTER: a conversation with a workspace wedged into its opening.** The question and the
placeholder are conversation (*"In your own words…"*). The anchor block is an operating environment:
it has states (confirmed / assumed / absent), a correction input with a 300-char cap, a departure
action, and epistemic labels. The `RoomTrustCopy` `<details>` element is a third register again —
a legal/policy disclosure with four fixed columns. Three registers coexist above the fold.

**EMPTY STATES**

- No `fieldContext` → `returnChecked` is set immediately (`:302`), `programArrival` stays `null`, the
  anchor block never renders. The screen is: holoflower, eyebrow, *"Where's your attention right
  now?"*, textarea, Begin, three ways in, disclosure, trust panel.
- With `fieldContext` but the catalog resolves no arrival → identical (`:317`, `field-note/route.ts:186`
  *"null arrival = unknown field / no catalog — the room renders no line"*).
- With `fieldContext` and a slow API → a **wordless holoflower on navy**, no text, no spinner, no
  copy (`:765-772`). Duration cannot be determined from code.

---

## 6. `/now-what/room` — conversation

`components/now-what/NowWhatRoom.tsx:1495-1784`

**OBSERVATIONS**

- Layout: holoflower at top center (150px mobile / 240px desktop, `:277`, `:286-287`), amber eyebrow
  `Now What?`, then the transcript, then the composer. Max width `46rem` (`:1496`).
- MAIA's turns render in `SERIF`, `text-[17px] leading-[1.85]`, `text-slate-100`; the member's own
  turns render in sans, `text-[15px]`, `text-slate-400` (`:1554-1562`).
- The "working" indicator is a single serif ellipsis `…` with `sr-only` text *"MAIA is responding…"*
  (`:1567-1577`).
- If `guided && turns.length === 0` (only reachable via **Discuss**), a large serif question renders:
  for `phase=fire_1` (the default, `room/page.tsx:25`) that is
  **"When you imagine the world your work is trying to call into being — not what you're doing to get
  there, but the world itself — what do you see?"** (`:159`, rendered `:1540-1546`). Fallback when no
  phase matches: *"No need to have it fully formed — what's stirring? We can talk it through."* (`:1543`).
- Composer placeholder: **"Say something…"** (`:1693`). Hint: *"Enter to send · Shift+Enter for
  newline"*, hidden below `sm` (`:1709`).
- Left cluster, two stacked link+caption pairs (`:1716-1742`):
  - **"Bring something with you"** / *"Start this session from a saved thread or a note."*
  - **"Keep — take something back with you"** / *"End the session. Save what matters. Pick a practice.
    Name a question."* — renders only when `turns.length >= 2`.
- Right cluster: **"Hear the room"** ↔ **"Speaking"**, **"Speak"** ↔ **"Listening…"**, and the amber
  **"Send"** pill (`:1745-1779`).
- A second, duplicate keep affordance sits under the holoflower when `turns.length >= 4`:
  **"Keep — listen back"** (`:1514-1522`).
- Load-bearing comment at `:1710-1715`: *"YPO-grade rule (founder, 2026-07-13): a busy CEO understands
  every action in three seconds… the founder, twice while informed, could not find keeping when it read
  that way."*
- **Element candidate strip** (`:1581-1626`), when the model returns a `cellCandidate`:
  *"This feels like {new energy trying to move | something deeper finding its flow | something taking
  solid shape | a clearer way of seeing arriving | things weaving together}. Does that feel true for
  you?"* (`:76-82`, `:1587-1589`) with **"Feels true"** · **"Not quite"** · **"It's something else"**,
  and the footnote *"A lens you can correct — never a verdict."* (`:1624`).
- **Bring panel** (`:1632-1680`): *"Bring something with you — a journal page, a note, anything alive."*,
  a paste textarea, **"Bring this in"** · **"Choose a .txt or .md file"** · **"Never mind"**, footnote
  *"Stays on your device — nothing uploads. You review and edit before it's sent."*
- Errors surface as `text-red-400 text-xs` inline (`:1628-1630`). API failure text is
  *"Not available right now. Try again in a moment."* (`interview/route.ts:406`).
- Mic denial writes into the same error slot: *"Microphone access is blocked — enable it in your
  browser settings to dictate."* (`:524`).

**INTERPRETATIONS**

- **User goal:** be understood, and get to something usable.
- **Likely state:** varies by turn; at the outset, testing whether this is a real interlocutor.
- **Encourages:** talking. The typographic hierarchy — MAIA in large serif, the member in smaller
  grey sans — is the room's clearest non-verbal statement, and it inverts the chat convention where
  the user's own words are primary. It reads as *being read to*, not as *messaging*.
- **Discourages:** ending. Everything about the screen is composed for continuation; the exit
  ("Keep — take something back with you") is a `text-sm` underline in the left gutter, competing with
  four other controls in the same 60px band.
- **Assumption:** that the member wants MAIA's replies to be weightier than their own. Also that the
  session has an end the member will choose — nothing prompts closure.
- **Cognitive load:** the composer row carries seven distinct affordances at `turns.length >= 2`
  (Bring, Keep, Hear the room, Speak, Send, plus two captions), and an eighth appears above the
  transcript at `turns.length >= 4`. This is the densest control surface in the environment, and it
  grows as the conversation deepens — load increases exactly as attention narrows.
- **Momentum:** highest here. Enter-to-send plus an always-focused textarea (`autoFocus`, `:1690`)
  means the path of least resistance is another turn.
- **In the background:** the exit, the field, and every other room. The `quiet` shell above shows only
  the wordmark and the words "Session room".
- **Unnecessarily visible:** the duplicated keep gesture (two different labels for the same
  `listenBack()` function, `:1516` and `:1732`) and the persistent "Bring something with you" caption
  after the session is underway.
- The **Discuss** path is the sharpest unintended register break available to a first-time executive:
  clicking a button captioned *"talk it through"* produces *"When you imagine the world your work is
  trying to call into being…"* — a Vision-Studio interview question for a practitioner with a body of
  work, addressed to someone who just said they were not ready to formulate.

**REGISTER: a conversation, with a control panel bolted to its floor.** The transcript is
conversation-register throughout (serif, no bubbles, no avatars, no timestamps, no read receipts). The
composer strip is workspace-register (pill toggles with pressed states, an `Enter to send` hint, a
seven-control row). The element strip is a fourth thing again — a coach's tentative offer
(*"Does that feel true for you?"*) rendered as a two-button confirm/deny UI.

**EMPTY STATE:** entering via **Begin** means `turns.length === 1` immediately, so the guided question
never shows; entering via **Discuss** shows the fire_1 question above an empty transcript. There is no
"no messages yet" state.

**CANNOT DETERMINE FROM CODE:** the actual felt quality of MAIA's replies. `RESPONSE_GRAMMAR`
(`interview/route.ts:89-103`) mandates reflect → name the tension → offer a choice of direction →
optional elemental touch, and states *"Your reply must be impossible to send unchanged to a different
person."* Whether the model honors this is a live-behavior question, not a code question. Likewise the
frequency and accuracy of `cellCandidate` proposals.

---

## 7. `/now-what/room` — proposal ("What surfaced")

`components/now-what/NowWhatRoom.tsx:1325-1491`

**OBSERVATIONS**

- Header: eyebrow `Now What?`, then *"What surfaced"* (`:1334`).
- Immediately below, in a quoted left-rule block, the closure question:
  **"Before we pause — what surprised you in what you just said? Is there anything you want to name
  before we stop?"** (`:167`, rendered `:1337-1339`). It is displayed as text; **there is no input
  attached to it.**
- Threads group under four headings in fixed order: *"Themes that emerged"* · *"Questions still
  alive"* · *"Practices available"* · *"What remains open"* (`:90-95`, sorted `:1328-1329`).
- Per thread: title, a one-sentence `reflection` in `text-xs`, and four lowercase actions —
  **keep** · **revise** · **leave**, and after revising, **keep revised** / **undo** (`:1392-1421`).
  Kept threads show a slate italic **"kept"**.
- A `Share with your practitioner` checkbox appears only after a thread is kept (`:1424-1437`).
- *"Something of your own"* with placeholder *"Name a thread that is genuinely yours..."* (`:1446-1452`).
- Footer block, three lines (`:1468-1472`): *"What you keep enters your own Living Field — private by
  default."* / *"Sharing a thread with your practitioner is a separate choice, per thread; nothing is
  shared unless you check it."* / *"Only what you authored or affirmed. Not a record of this
  conversation. Nothing the system concluded about you."*
- Actions: **"Keep what I chose"** (amber) · **"Leave without keeping"** (dim) (`:1474-1488`).

**INTERPRETATIONS**

- **User goal:** decide what was worth the last twenty minutes.
- **Likely state:** reflective, slightly fatigued, wanting to be efficient.
- **Encourages:** triage. Four lowercase verbs per item is a review queue; the interaction rhythm is
  scan → keep → scan → keep.
- **Discourages:** answering the closure question. It is the emotionally largest sentence on the
  screen and the only one with no affordance beneath it — the reader's next possible action is
  "keep" on an unrelated item. Anyone who wants to answer it must scroll to *"Something of your own"*
  and type it into a field labelled *"Name a thread that is genuinely yours..."*
- **Assumption:** that the member reads reflections before deciding. `reflection` renders at
  `text-xs text-slate-500` — smaller and dimmer than the title it justifies.
- **Cognitive load:** high, and it is the second-highest point in the flow. Per thread there are up to
  four verbs plus a conditional checkbox; the actions are lowercase and unadorned, so target
  discrimination is by position, not by shape.
- **Momentum:** drops. This is the flow's hinge — the register changes from being spoken to, to
  operating a list.
- **In the background:** the conversation itself, which is now unreachable and unsaved by design
  (`interview/route.ts:27-28`).

**REGISTER: workspace / review queue.** Evidence: `keep` · `revise` · `leave` · `undo` as lowercase
inline verbs; a fixed four-heading taxonomy; per-row checkboxes; a three-line legal footer. The
closure question is the only conversation-register element left, and it is inert.

**EMPTY STATES — three distinct ones, all flagged:**

1. **Model returned zero threads, cleanly** (`:1356-1360`): *"Nothing clear enough to propose — that
   is a faithful outcome. You may name something yourself below."*
2. **Parse-degraded** (`:1342-1355`): *"I couldn't quite gather that this time — that's on me, not
   you. Try listening back again, or name something yourself below."* plus a **"Try listening back
   again"** button. The `degraded` flag exists specifically so *"a glitch never reads as 'MAIA found
   nothing in you'"* (`:221-224`).
3. **Member kept nothing and pressed "Leave without keeping"** → `carry({proposals:[],created:[]})`
   → advances to the practice phase regardless (`:1483`, `:653`).

---

## 8. `/now-what/room` — practice

`components/now-what/NowWhatRoom.tsx:1139-1209`

**OBSERVATIONS**

- H2: **"Now what will you actually live?"** (`:1145`), sub: *"One practice. One experiment. One
  commitment. Not ten."* (`:1146`).
- When practice-kind threads exist: *"Practices that surfaced"*, each a clickable line that fills the
  textarea (`:1149-1162`).
- Textarea placeholder: *"In your own words — what will you live between now and next time?"* (`:1168`).
- `Share with your practitioner` checkbox appears only once text is entered (`:1172-1182`).
- Actions: **"Carry this practice"** (amber) · **"Not today"** (dim) (`:1187-1202`).
- Footer: *"When you return, the room will begin from this practice — not from the beginning."*
  (`:1204-1206`).

**INTERPRETATIONS**

- **User goal:** name one concrete thing.
- **Likely state:** this is the moment the session either converts to life or doesn't.
- **Encourages:** commitment, and specifically singular commitment. *"Not ten"* is the only
  prohibition-shaped sentence addressed to the member anywhere in the flow, and it lands as a
  constraint they will probably experience as relief.
- **Discourages:** hedging. The footer states the consequence plainly — this text becomes next
  session's opening.
- **Assumption:** that a practice is expressible in a two-row textarea.
- **Cognitive load:** lowest of any interactive screen. One question, one field, two actions.
- **Momentum:** high. This is the cleanest screen in the environment.

**REGISTER: a coach's closing move.** *"Now what will you actually live?"* is the product's own name
turned into a question, and *"One practice. One experiment. One commitment. Not ten."* is a coach's
cadence, not a form label. The only workspace residue is the checkbox.

**EMPTY STATE:** if no `practice`-kind threads surfaced, the "Practices that surfaced" block is
omitted entirely (`:1149`) and the member faces a bare textarea. Note the block filters
`proposed`, which is in-memory only — a member who reached this phase via *"Leave without keeping"*
still sees suggestions from proposals they explicitly declined (`:1140` filters on `revising`, not on
`authored`).

---

## 9. `/now-what/room` — offering

`components/now-what/NowWhatRoom.tsx:1212-1265`

**OBSERVATIONS**

- Sub-line: *"One more — only if it feels right. This one is optional."* (`:1217`).
- Question: **"What would you enjoy making available to others at this point in your life?"** (`:1221`).
- Placeholder: *"Nothing is required here…"* (`:1228`).
- Actions: **"Offer it"** · **"Skip for now"** (`:1248-1261`).
- Reached automatically after `commitPractice()` (`:687`) and also via **"Not today"** on the practice
  screen (`:1196`).

**INTERPRETATIONS**

- **User goal:** by this point, to finish.
- **Likely state:** spent. This screen arrives after the conversation, the review queue, and the
  commitment.
- **Encourages:** skipping — three separate copy elements say it is optional before the question is
  read.
- **Discourages:** taking the question seriously. *"Nothing is required here…"* is inside the input
  itself, so the pre-emption is the last thing read before typing.
- **Assumption:** that a client who has just committed to one practice has capacity for a question
  about contribution to others.
- **Momentum:** this is where it dissipates. It is the only screen whose framing argues against its
  own content.

**REGISTER: a coach's optional postscript.** The question is genuinely coach-register; the framing
around it is apologetic in a way no other screen is.

---

## 10. `/now-what/room` — closed

`components/now-what/NowWhatRoom.tsx:1268-1322`

**OBSERVATIONS**

- If a practice was saved: *"The practice you chose"* → the text verbatim in a left-rule block →
  *"When you return, we'll begin from what happened."* (`:1272-1281`).
- Thread count: *"N threads carried into your field."* or, when none,
  **"Nothing carried — that is a faithful outcome too."** (`:1284-1288`).
- Kept threads list verbatim (`:1290-1298`).
- Off-ramp line: **"Take this back with you. The room will be here when it's been lived."** (`:1302-1304`).
- Two actions: **"See your field"** (amber, `text-base`) · **"Begin again"** (dim, triggers
  `window.location.reload()`) (`:1305-1319`).
- Code comment: *"the exit door leads OUT — into the member's own field and back into their life —
  never back into more room. ('The room exists to return people to their lives,' 2026-07-10.)"*
  (`:1299-1301`).

**INTERPRETATIONS**

- **User goal:** leave with something.
- **Likely state:** settled, if the practice landed.
- **Encourages:** leaving. *"The room will be here when it's been lived"* is the only sentence in the
  environment that explicitly asks the member to go away, and it is placed above both actions.
- **Discourages:** "Begin again" — dim, small, and semantically contradicted by the line above it.
- **Assumption:** that "your field" is now a meaningful destination. For a first-time member it holds
  the 0–N threads just created and nothing else.
- **In the background:** the whole map. The two links go to the field or back into the room; the
  other four rooms are not offered at the one moment the member is oriented and unhurried.

**REGISTER: a trusted advisor's goodbye.** *"Take this back with you"* and *"that is a faithful
outcome too"* are register-consistent with the welcome letter. This screen and screen 4 bracket the
session in the same voice; everything between them is a different voice.

**EMPTY STATE:** a member who kept nothing and skipped the practice sees only the eyebrow, *"Nothing
carried — that is a faithful outcome too."*, the off-ramp line, and two links.

---

## 11. `/now-what/map` — the building

`app/now-what/map/page.tsx` → `components/now-what/EnvironmentMapView.tsx`

**OBSERVATIONS**

- H1: **"This is the building. You are inside it."** (`:329`). Sub: *"The lit rooms are open — walk in.
  The scaffolded ones are deliberately still forming — step close and they will tell you why."*
  (`:342-348`).
- A 700×585 SVG floor plan (`:168-298`): a lit center circle (r=95) labelled **Session room** /
  *"sit with MAIA"* / `enter →`, four lit rectangular chambers (Your field E, Where you are W,
  Questions you're living NW, What may be next NE), two dashed chambers (Themes SW, Reflections SE)
  labelled `TAKING SHAPE · READ WHY`, solid corridors to lit rooms, dashed corridors to scaffolded
  ones, and a south arch captioned **"you arrived through a door"** — a mark, not a link (`:201-207`).
- Below the drawing, *"The rooms, in words"* — each room with an always-visible `explain` paragraph
  (`:358-395`). Examples:
  - Session room: *"This is where the work happens. Bring something real — a decision, a question, a
    stuck place — and talk it through with MAIA until a next real step appears. At the end, you choose
    what to keep; nothing is saved without your say-so."* (`:76-77`).
  - Where you are: *"…until you say where you are, this room is simply empty."* (`:95-96`).
  - Themes / Reflections: *"Not open yet — on purpose…"* (`:130`, `:138`).
- Footer: *"Rooms open as they are ready. Nothing here rushes you."* (`:402`).
- `pointer-events-auto` on the SVG is annotated as load-bearing — a global `svg { pointer-events:
  none }` Safari patch had silently killed every chamber door (`:163-167`).
- The same component serves the practitioner at `/studio/environment` with `viewer="practitioner"`;
  the copy switches to *"The environment you hold."* and `open — walk it` (`:329`, `:156`).

**INTERPRETATIONS**

- **User goal:** find out what else is here.
- **Likely state:** oriented and curious, or lost mid-session and looking for an exit.
- **Encourages:** exploration — the drawing is the only screen in the environment that is
  spatially rather than sequentially organized, and it is the only place the six non-room doors exist.
- **Discourages:** treating the environment as a linear program. Nothing here is numbered or ordered.
- **Assumption:** that the member will find this page. Its only entrances are the shell wordmark
  (`NowWhatShell.tsx:98`, `:117`) and the threshold's *"See the map first"* — neither is offered on
  the closed screen, which is where a first-timer is most receptive.
- **Cognitive load:** moderate but well-distributed — the drawing carries structure, the index carries
  meaning, and the index is always visible rather than hidden in tooltips.
- **Unnecessarily visible:** for a member with no program, the "Where you are" chamber is lit and
  enterable but will render as an explanation of emptiness.

**REGISTER: an operating environment — and deliberately so.** *"This is the building. You are inside
it."* is a statement about a place, not a product. The `TAKING SHAPE · READ WHY` labels are the only
place the environment admits incompleteness to the member's face, and it does so architecturally
(dashed scaffolding) rather than apologetically.

**EMPTY STATE:** none — this page reads no member data on either clearance (`:23-24`).

---

## 12. `/now-what/field` — Your field

`app/now-what/field/page.tsx`

**OBSERVATIONS**

- Full `NowWhatShell` (not quiet) with pills Map · Session room · **Your field** lit (`:107`,
  `NowWhatShell.tsx:55-59`).
- Three-panel grammar, annotated *"one container per question, one accented action per page"* (`:98-101`).
- Box 1: eyebrow *"Your field"*, H1 **"What you kept, in your own words."**, body: *"Every line here is
  something you authored or chose to keep in this environment — threads, practices, offerings. Nothing
  is interpreted, scored, or summarized. What it adds up to is yours to recognize."* (`:122-135`).
- Box 2 header **"Kept"**; entries grouped by month, each a bullet on an amber left-rule with the title
  verbatim, a short date, an optional `Practice`/`Offering` tag, and — if shared — *"· shared with your
  practitioner"* (`:154-178`).
- Box 3 header **"Now"**, one amber pill whose label switches on emptiness:
  *"Enter the session room →"* when empty, *"Return to the room →"* otherwise (`:193`), beside
  *"The room is a threshold. This is what has come through it."* (`:195-197`).
- `RoomTrustCopy` (`:201-206`) and the standing closer *"Nothing here rushes you."* (`:208-210`).
- A holoflower watermark at `opacity-[0.05]` sits behind the panels (`:114-119`).

**INTERPRETATIONS**

- **User goal:** see whether the work is accumulating.
- **Likely state:** on a second or third visit, mildly proprietary; on the first, uncertain what to
  expect.
- **Encourages:** rereading one's own words. Verbatim + date + nothing else is the whole design.
- **Discourages:** expecting insight. The page states three times that it does not interpret.
- **Assumption:** that a chronological list of one's own phrases is legible as development. Whether it
  is depends entirely on volume — cannot determine from code.
- **Cognitive load:** low. **Momentum:** the single accented action points back into the room.
- **What disappears:** any sense of the conversations these came from. By design
  (`interview/route.ts:27-28`), no transcript exists.

**REGISTER: a journal — specifically a commonplace book.** Verbatim entries, dated, month-grouped,
no editing, no tags the member did not create, an amber marginal rule. The three trust panels and the
`<details>` disclosure pull it briefly toward software; the entries themselves do not.

**EMPTY STATE (explicit):** *"Your field fills only through your own gestures — what you keep at the
end of a session collects here, in your words. Nothing is here yet."* (`:147-152`), with the action
pill reading *"Enter the session room →"*. **Loading state:** *"Opening your field…"* (`:144`).
**Error state:** the raw API string *"Could not load your threads right now."*
(`field-note/route.ts:198`) in `text-red-400`.

---

## 13. `/now-what/questions` — Questions you're living

`app/now-what/questions/page.tsx`

**OBSERVATIONS**

- H1: **"The questions you kept, waiting for you — kept warm."** (`:95-97`).
- Body: *"A question worth living doesn't need an answer yet — it needs to not get lost. When a session
  surfaces one that is still alive and you choose to keep it, it waits here in your exact words. MAIA
  does not dig questions out of your conversations; only your gesture puts one here."* (`:98-103`).
- Box 2 header **"Still alive"**; entries show the title and *"kept {date}"* (`:124-142`).
- Box 3 action label switches: *"Bring one back into the room →"* when non-empty, else *"Enter the
  session room →"* (`:157`), beside *"A kept question is an invitation you wrote to yourself."* (`:159-161`).
- `RoomTrustCopy` "Never holds" includes: *"No questions MAIA inferred, extracted, or synthesized from
  your conversations. No grouping, ranking, or 'deeper question' analysis — this room does not think
  about you between visits."* (`:167`).
- The data source is a client-side filter on `spiralogic_phase === 'question'` over the same
  field-note GET the field page uses (`:55`).
- `NowWhatShell current="Questions you're living"` — a name not in `DOORS`, so **no pill is lit**
  (`NowWhatShell.tsx:126-149`).

**INTERPRETATIONS**

- **User goal:** re-meet something they left open.
- **Likely state:** returning deliberately; this is not a page one lands on by accident.
- **Encourages:** carrying a question back into a session. The action label is the only
  context-sensitive CTA in the environment that names a specific act rather than a destination.
- **Discourages:** expecting the room to have noticed anything. The negative claims are stated three
  times across two blocks.
- **Assumption:** that the member marked questions as questions during the proposal phase — which
  depends on the model having assigned `kind: 'question'` and the member having pressed **keep** on it
  (`NowWhatRoom.tsx:718-733`, `field-note/route.ts` persists only `kind === 'question'` per the comment
  at `NowWhatRoom.tsx:720-723`).
- **Cognitive load:** low. **What remains unnecessarily visible:** the shell nav renders three unlit
  pills, none of which is this page — the member is in a room the wayfinding does not acknowledge.

**REGISTER: a journal with a curator's note.** Entry list is journal; the orientation paragraph and
trust panel are a policy statement about what the system refuses to do.

**EMPTY STATE (explicit):** *"No questions named yet. When a session ends, the questions still alive
are offered back to you — the ones you choose to keep are what live in this room. Nothing appears here
without that choice."* (`:116-122`). **Loading:** *"Opening…"* (`:113`).

---

## 14. `/now-what/next` — What may be next

`app/now-what/next/page.tsx`

**OBSERVATIONS**

- H1: **"The practices you chose, and the door to your next step."** (`:96-98`).
- Body ends: *"Held open, not prescribed: no one here announces your next step — not MAIA, not the
  program, not this page."* (`:99-104`).
- Box 2 header **"What you chose to live"**; entries are practice titles with a short date (`:124-137`).
- Box 3: **"Start a session →"** beside *"The session room is where a next real step appears — pulled by
  you, never pushed."* (`:152-156`).
- Trust "Never holds": *"No recommendations, no suggested next steps, no ranking of possibilities, no
  compliance tracking of whether you lived a practice."* (`:162`).
- `current="What may be next"` — again absent from `DOORS`, so no pill lights.

**INTERPRETATIONS**

- **User goal:** find out what they said they would do.
- **Likely state:** either checking in on a commitment or looking for a prompt.
- **Encourages:** returning to the room.
- **Discourages:** treating the list as a to-do. There is no completion affordance, no checkbox, no
  status — a deliberate absence the trust copy names (*"no compliance tracking"*).
- **Assumption (notable):** the title promises futurity; the content is a history of past commitments.
  A member arriving at a door labelled *"What may be next"* is shown what they already chose. The H1
  reconciles this in words; the room name does not.
- **Cognitive load:** low. **Momentum:** the accented action is the strongest phrased CTA in the
  environment (*"Start a session →"*).

**REGISTER: a journal presented as a workspace panel.** Header/Now/Never-holds is the same
three-box scaffold as field and questions; the content is a dated list of the member's own sentences.

**EMPTY STATE (explicit):** *"No practices yet. At the end of a session, when something is worth
actually living, you choose it — and it appears here as you said it."* (`:117-122`).

---

## 15. `/now-what/position` — Where you are

`app/now-what/position/page.tsx`

**OBSERVATIONS**

- H1: **"Your place, as you declared it."** (`:107-109`). Body: *"A program can say where its cohort is;
  only you can say where you are. This room shows what you have said — confirmed or in your own words —
  and nothing it worked out about you, because it works nothing out."* (`:110-114`).
- Box 2 header **"Declared"**. Per row: program title in uppercase tracking, the focal point (in
  typographic quotes when `member_stated`), and a footing line from `footingLine()` (`:43-53`):
  - *"placed by your practitioner — not yet yours until you say so"*
  - *"in your own words · {date}"*
  - *"you confirmed this · {date}"*
  - *"last known — not reconfirmed since {date}"*
- Box 3: **"Return to the room →"** beside *"Confirming, restating, or departing all happen there —
  where the work is."* (`:179-183`).
- Trust "Who can see it": *"You. Your practitioner cannot see your positions — there is no read for
  them, anywhere."* (`:190`).
- The fetch is skipped entirely when `fieldContext` is absent (`:63`), leaving `positions === null`.

**INTERPRETATIONS**

- **User goal:** confirm they are in the right place in a program.
- **Likely state:** only reached deliberately, and only meaningful for program members.
- **Encourages:** nothing on this page — every gesture is elsewhere. It is a read-only mirror whose
  own copy sends the member back to the room to act.
- **Discourages:** treating position as progress. There is no percentage, no step count, no sequence.
- **Assumption:** that the member entered through a program door. Roughly half this page's states
  exist to explain to a non-program member why it is empty.
- **Cognitive load:** the `footingLine` vocabulary (*declared* / *confirmed* / *last known* /
  *not reconfirmed*) is the most technical language a member meets anywhere in the environment.
- **Momentum:** terminal. Every road leads back to the session room.

**REGISTER: an operating environment / a record system.** Evidence: the header word *"Declared"*,
epistemic-footing strings, and *"there is no read for them, anywhere"* — a sentence about access
control addressed to a client. The care is real and legible; the register is systems-integrity, not
coaching.

**EMPTY STATES — two distinct, both explicit:**

1. **No `fieldContext`** (`:121-127`): *"You arrived without a field in context. This room shows your
   place inside a specific field's programs — enter through a program door, or open it from that
   field's map, and your declarations appear here."* Note the shell's Map link only carries
   `fieldContext` when the current page had one (`NowWhatShell.tsx:86-87`), so a member who lost the
   param has no in-page route back to a context-bearing map.
2. **`fieldContext` present, zero rows** (`:137-144`): *"You have not placed yourself in a program here
   yet. When you arrive through a program's door, the session room will ask where you are — your
   answer, in your words, is what appears in this room. Nothing appears until you say so."*

---

## 16. `/now-what/themes` and `/now-what/reflections` — HOLD + EXPLAIN

`app/now-what/themes/page.tsx`, `app/now-what/reflections/page.tsx`

**OBSERVATIONS**

- Eyebrow in slate `#8fa0b8`, not amber: *"Themes · taking shape"* / *"Reflections · taking shape"*
  (`themes:39-41`, `reflections:37-39`).
- H1s: **"See what repeats in what you kept — patterns you pull, never pushed."** (`themes:44-46`);
  **"MAIA's mirror, only when you ask."** (`reflections:40-42`).
- Both pages are exactly three panels: what it will be · **"Why it isn't open yet"** · **"What it will
  never do"**, plus `RoomTrustCopy` and *"Nothing here rushes you."*
- Themes, why-not: *"Because the alternative is worse than waiting. A themes room that runs before its
  foundations are proven would be MAIA interpreting your life in the background and presenting the
  result as if you asked — the exact thing this environment exists to refuse. The memory this room
  needs is being built and tested first. Until it holds, this door stays honest: there is nothing
  behind it, and it says so."* (`themes:57-64`).
- Reflections, why-not: *"A mirror is only trustworthy if what stands behind it is proven… Opening this
  door early would mean an automated reflection feed wearing a mirror's name, and that is not what this
  room is for."* (`reflections:54-61`).
- Trust "Holds": *"Nothing yet — this page is the whole room. No member data is read to render it."*
- Neither page has a session gate or a `NowWhatThreshold` branch.

**INTERPRETATIONS**

- **User goal:** find out what these are.
- **Likely state:** curious after the map's dashed chambers.
- **Encourages:** trust — these are the only screens in the environment that explain a decision to the
  member rather than a feature.
- **Discourages:** waiting for them. Neither page offers notification, date, or "tell me when".
- **Assumption:** that the member is interested in the reasoning. The pages are ~150 words of product
  ethics each, addressed to a client who came looking for a room.
- **Cognitive load:** low but conceptually dense — *"an automated reflection feed wearing a mirror's
  name"* asks the reader to model a failure mode they have not experienced.
- **What remains unnecessarily visible:** the H1s are written in the future-facing voice of a feature
  that works (*"See what repeats in what you kept"*), and the amber-to-slate eyebrow demotion plus the
  second panel are what carry the "not yet". A fast reader meets a capability claim before the
  correction.

**REGISTER: the product's own governance memo, in the member's second person.** *"the exact thing this
environment exists to refuse"* and *"this door stays honest"* are institutional voice. It is the most
candid register on the surface and the least like coaching.

**EMPTY STATE:** the page *is* the empty state, and says so.

---

## 17. Unreachable branch — generic "Ways to Begin"

`components/now-what/NowWhatRoom.tsx:1083-1136`

**OBSERVATIONS**

- Guarded by `roomPhase === 'arrival'` after the `nowWhat` branch returns, but `nowWhat` is
  `const nowWhat = true` (`:197`) — this block cannot render in `/now-what`.
- It contains: eyebrow *"Vision Studio"*, the phase label (*"Fire I — Vision"*), *"Every practitioner
  begins differently."* / *"Choose whatever feels most natural today."*, and two cards —
  **"Begin in your own words"** / *"Just start — no prompt, no structure."* and **"Begin with a
  question"** / *"A place to start, at your own pace."*

**INTERPRETATIONS**

- Not part of the client experience. Recorded because its copy is the Vision Studio register
  (practitioner-facing, phase-labelled) living inside the same component that renders Larry's client
  room — the two products share a file and a mental model, and the shared `roomTitle` /
  `PHASE_LABELS` / `PHASE_OPENING_QUESTIONS` constants are what leak the Vision Studio question into
  the **Discuss** path (§6).

---

## Appendix A — Register map, in flow order

| # | Screen | Dominant register | Secondary register present |
|---|--------|-------------------|----------------------------|
| 1 | `/now-what/welcome` | **software** (marketing page) | — |
| 2 | `/now-what/arrive` | **software** (auth card) | conversation (lexicon only) |
| 3 | threshold | **trusted advisor** | — |
| 4 | room welcome | **coach** (a letter) | — |
| 5 | room arrival | **conversation** | operating environment (anchor); legal (trust panel) |
| 6 | conversation | **conversation** | workspace (composer row) |
| 7 | proposal | **workspace** (review queue) | conversation (one inert line) |
| 8 | practice | **coach** | workspace (checkbox) |
| 9 | offering | **coach** (apologetic) | — |
| 10 | closed | **trusted advisor** | — |
| 11 | map | **operating environment** | — |
| 12 | field | **journal** | workspace (three-box scaffold) |
| 13 | questions | **journal** | policy statement |
| 14 | next | **journal** | workspace |
| 15 | position | **operating environment / record system** | — |
| 16 | themes, reflections | **governance memo** | — |

Mid-flow shifts, in order of magnitude:

1. **6 → 7** (conversation → review queue). The member is being spoken to in serif, then operating
   lowercase verbs on a taxonomy. This is the sharpest break in the session.
2. **1 → 2 → 3** (marketing → auth card → foyer). Three registers and two palettes in three screens,
   before the member has said anything.
3. **5 internal** (conversation + operating environment + legal disclosure stacked above the fold).
4. **Discuss → 6** (a button captioned *"talk it through"* → a Vision Studio interview question).
5. **9 → 10** (apologetic postscript → advisor's goodbye).

Screens 4 and 10 are register twins and bracket the session; everything between them is a different
voice.

---

## Appendix B — Cannot determine from code

- The felt quality, length, and specificity of MAIA's turns. `RESPONSE_GRAMMAR`
  (`interview/route.ts:89-103`) specifies the shape; adherence is runtime behavior.
- How often `cellCandidate` fires, and therefore how often the *"This feels like…"* strip interrupts
  the conversation (`interview/route.ts` `inferSpiralogicCell` path; `NowWhatRoom.tsx:451-458`).
- How many threads a typical proposal returns (`PROPOSE_SYSTEM` says 1–3, *"Fewer is better than
  forced"*, `interview/route.ts:160`), and how often the degraded branch is hit.
- Whether `programArrival` is non-null in practice — depends on `field_programs` catalog rows that no
  page in this surface creates (`field-note/route.ts:181-191`).
- The duration of the wordless-holoflower hold on return-detection (`NowWhatRoom.tsx:765-772`).
- Whether any real client's `next` link carries an allowlisted `fieldContext`
  (`register/route.ts:39`) — determined by what practitioners actually send.
- Voice quality of the `speechSynthesis` "Hear the room" reading (default system voice, no voice
  selection, `NowWhatRoom.tsx:470-479`).
- Whether `#062a42` navy on `text-slate-400`/`text-slate-500`/`text-slate-600`/`text-slate-700` body
  copy meets contrast thresholds in situ — several strings sit at `text-slate-700`
  (`NowWhatRoom.tsx:1204`, `:1624`, `:1676`) and `text-slate-600` (`arrive/page.tsx:179`).

---

## Appendix C — Noticed, not recommended

Raw observations only. No action is proposed for any item.

1. `/now-what/arrive` defaults `next` to `/now-what/room` with no `fieldContext`
   (`arrive/page.tsx:38`), while `POST /api/now-what/register` 403s unless `next` carries an
   allowlisted `fieldContext` (`register/route.ts:39-50, 68-73`). The refusal arrives after the form
   is filled.
2. Practitioner name conflict: `"Now What? · with Larry Closs"` (`NowWhatRoom.tsx:788`) vs
   `OPENING_FRAME`'s *"Kelly can accompany this field as your facilitating practitioner… Sharing any
   thread with Kelly"* (`NowWhatRoom.tsx:139`).
3. `PHASE_OPENING_QUESTIONS.fire_1` (`NowWhatRoom.tsx:159`) is Vision Studio copy addressed to a
   practitioner with a body of work; it renders in the client room whenever a member clicks
   **Discuss** (`:753-758` → `:1540-1546`).
4. `listenBack()` is bound to two differently-labelled controls that can be on screen simultaneously:
   *"Keep — listen back"* (`:1520`) and *"Keep — take something back with you"* (`:1736`).
5. The closure question *"Before we pause — what surprised you…"* (`:167`) renders as static text on
   the proposal screen with no input attached (`:1337-1339`).
6. `NowWhatShell` `DOORS` contains only Map / Session room / Your field (`NowWhatShell.tsx:55-59`);
   pages passing `current="Questions you're living"`, `"What may be next"`, `"Where you are"`,
   `"Themes"`, `"Reflections"` light no pill.
7. `themes` and `reflections` render without any `useMemberSession` branch and have no
   `ACCESS_RULES` entry; unmapped routes resolve to allowed under the default `permissive` mode
   (`accessMatrix.ts:597-603`).
8. `room/page.tsx` renders nothing while `session === 'unknown'` (`:33`, `:42`) — a navy screen with
   no content between mount and the first `localStorage` read.
9. The practice screen's "Practices that surfaced" list filters `proposed` by `kind` and `revising`
   only (`:1140`), so proposals the member declined via *"Leave without keeping"* still appear as
   suggestions.
10. The closed screen offers only *"See your field"* and *"Begin again"* (`:1305-1319`); the map and
    the four other rooms are not linked from the one screen where the member is finished and unhurried.
11. `NowWhatShell`'s map link only appends `fieldContext` when the current page received one
    (`:86-87`); a member who loses the param cannot recover a context-bearing map from within the shell.
12. `/now-what/welcome` renders on `#1A1513`/`#F3EDE4` with accent `#3A7CA5`
    (`PublicSectionLanding.tsx:36-37`, `ogCard.tsx:195`); every other screen in the environment is
    `#062a42` with accent `#ffe27a`.
13. Raw API strings reach the member unchanged in error states, e.g. *"Could not load your threads
    right now."* (`field-note/route.ts:198`) and *"Not available right now. Try again in a moment."*
    (`interview/route.ts:406`), rendered in `text-red-400` inside otherwise amber/slate surfaces.
14. The offering screen states its optionality three times before the question is read (`:1217`,
    `:1228`, `:1260`).
15. The room name *"What may be next"* labels a page whose only data is past commitments
    (`next/page.tsx:109-137`).
