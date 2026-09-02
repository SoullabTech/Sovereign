# Client Journey — Design Candidate (Landing → Sign-in → Check-in → Today → Field → Return)

**Date:** 2026-09-02 · **Status:** DESIGN CANDIDATE — FOUNDER EXPLORATION — NOT IA RULING.
**Author:** founder synthesis, recorded verbatim in structure and reasoning; extended in the same
session, same document, per explicit instruction not to fragment into new artifacts.
**Governance, unchanged since this document's opening:** parked per the master programme's anti-drift
law, cross-referenced from `NOW_WHAT_MASTER_PROGRAMME.md`. No route change, no code change, no IA
ruling is authorized by this document. Substrate for tomorrow's Larry encounter to confirm, reject,
or reshape — that is the explicit purpose, not implementation.
**Template used for every screen** (fixed, per founder instruction): purpose → human question →
what is visible → primary gesture → secondary access → underlying capabilities → what stays
invisible → Larry's role → failure modes → what we test in the walk.

---

## The core diagnosis

> `/now-what` is currently behaving like a return doorway, when it also needs to function as the
> front door to an entire client experience.

Three different states have accidentally been asked of one screen:

| State | The person's own words | Needs |
|---|---|---|
| **Landing** | "I don't yet know this environment." | brand, proposition, Larry, trust |
| **Today** | "I know the environment; orient me." | current work, relationship, relevant teaching, one next action |
| **Return** | "I was in the middle of something." | exactly what the current build already does — "You were carrying… What happened since?" |

> **That screen is good. It's just not Home.**

## The candidate journey

```
PUBLIC LANDING     Who is Larry? What is Now What? Why enter?
        ↓
SIGN IN             Return me privately to my own space
        ↓
CHECK-IN            What brings me here today?
        ↓
TODAY               What is most immediately relevant?
        ↕
FIELD / EXPLORE      What else is available when I want it?
        ↓
CONVERSATION         Work with something
        ↓
KEEP                 I decide what matters
        ↓
RETURN               My prior act has continuity
```

The four distinct jobs this journey separates — arguably the most useful discovery so far:

> **Landing = meaning. Sign-in = access. Check-in = intention. Today = orientation.**

---

## Screen 1 — Public Landing / Arrival

**Purpose.** Not authentication yet. The moment a prospective or invited client understands: *I have
arrived in Larry's Now What? environment, and I understand why I might want to enter.* The current
shared threshold may be visually beautiful, but this state has a different job — establish the
relationship and proposition *before* asking the person to cross the threshold.

**Human question.** *What is this, and is it meant for me?* Answered in seconds.

**What is visible.** Five ingredients only:

> NOW WHAT?
> A very short proposition in Larry's language.
>
> Larry Closs
> His role/identity, presented with confidence, not as a résumé.
>
> One brief line: reflection · coaching · teachings/resources · support for what comes next.
>
> A strong Enter / Sign in gesture.
>
> Potentially one restrained visual element that makes it unmistakably a branded environment rather
> than a utility page.

Not five boxes explaining the app.

**Primary gesture.** *Enter Now What?* → leads to sign-in when unauthenticated.

**Secondary access.** Possibly *Learn about Now What?* — but *"See the map first"* is explicitly NOT
carried forward automatically. That phrase comes from our architecture; it is exactly the sort of
thing the walk should tell us whether a client actually needs.

**Larry's role.** Explicit design intent: *Larry should be clearly present without making the page
into a personal-brand sales funnel.* The desired feeling —

> This is a thoughtful private environment created around Larry's work and my relationship with him.

Not *"Welcome to Soullab technology featuring Larry."* Not *"Welcome to LarryCloss.com."* That
balance is the design problem this screen exists to solve.

**What stays invisible.** Room ontology · flourishing framework · MAIA architecture · provenance
language · field/program mechanics · client-resource taxonomy · feature list · navigation system ·
dashboard · explanation of AI. All of it may exist one or two layers below.

**Underlying capabilities.** Even at this visual simplicity, this page may represent: brand + Larry
identity + invitation/auth + program eligibility + sovereignty + responsive presentation. The
principle for the whole candidate: **many systems may compose into one human moment.**

**Landing ≠ Sign-in, explicitly separated:**

| | Landing | Sign-in |
|---|---|---|
| Question | "What is this?" | "Let me into my own space." |
| Register | Brand. Larry. Promise. Invitation. | Extremely functional. Email → code → enter. |

The second screen needs almost no selling because the first already established meaning. The
sovereignty line becomes plain-language reassurance there instead: *"Your space belongs to you.
Signing in returns you to your own work."* Candidate copy only — not a ruling.

**What we test in the walk.** Does a person who has never seen this before answer *"what is this, and
is it for me"* within seconds? Does Larry's presence read as *his* environment rather than a Soullab
demo or a personal-brand page?

---

## Screen 2 — Sign-in

**Purpose.** Move from public orientation into private continuity with essentially no friction.

**Human question.** *How do I get into my space?*

**What is visible.**

> NOW WHAT?
> Welcome back.
> Email field.
> Continue
> A small privacy/trust sentence.

Larry identity may remain lightly present in the environment chrome so it doesn't suddenly become
generic infrastructure.

**Failure mode.** If signing in feels like *leaving Larry's world and entering Soullab
authentication*, continuity is broken before the client even begins.

**What we test in the walk.** Specifically inspect for that exact break — does the register shift
underneath the person between Landing and Sign-in.

---

## Screen 3 — Check-in

**Purpose.** Determine the person's intention for this visit without the system deciding what
matters for them.

**Human question.** *What brings me here today?*

The current Return screen answers one version of this automatically — *"You were carrying this."*
Excellent when the person truly wants to return there. It should not presume every arrival is a
continuation.

**Candidate gestures** (illustrating the architecture — intentions rather than modules, not proposed
final labels):

> Continue where I left off
> Something is on my mind
> Prepare for my conversation with Larry
> Find something from Larry
> Just look around

**What we test in the walk.** Whether a real person's actual reason for arriving maps onto any of
these without translation effort.

---

## Screen 4 — Today

*First pass (below) superseded in composition by the detailed elaboration that follows — the job
and the danger it names remain the throughline; the second pass develops the actual first-viewport
hierarchy and the three states.*

**Purpose.** *Help me understand where I am today and make one meaningful next move.* Not *"what
features does Now What? have?"*

This is the screen most carefully explored, because it is where the risk sits on both sides:

> too little — the current Return screen standing in for the whole product;
> too much — a dashboard of every capability.

### First viewport, candidate hierarchy

```
NOW WHAT?

Good morning, Kelly.


WHAT YOU'RE CARRYING

"How do I know whether I am moving
toward something or merely leaving?"

What happened since? →


NEXT WITH LARRY

Thursday · September 10 · 2:00 PM

Prepare →


FROM LARRY

On knowing when a chapter is complete
7 minute video

Watch →


Explore your Now What? space →
```

Editorial composition, not cards: large air, excellent typography, thin separators, one restrained
accent. *Feels full without feeling busy.*

### Three candidate states

**A — Returning with something alive.** Carried thread primary — the composition above, as-is.

**B — No carried thread.** Open check-in becomes primary instead of manufacturing a hero object the
UI expects but the person hasn't earned:

> Good morning, Kelly.
> What brings you here today?
> Something is on my mind →
>
> Next with Larry — Thursday · 2:00 PM
> From Larry — one relevant program resource
> Explore your space →

**C — Session approaching.** Emphasis may shift based on a **factual scheduled event**, never
inferred psychology:

> Your conversation with Larry is tomorrow.
> Prepare for it →

— their carried work rendered beneath it, not displaced.

### Why this solves the original concern

The screenshot that started this review had, in essence: *"You were carrying… [reflection] … What
happened since? … Tell MAIA…"* — a genuinely good continuity moment. But Now What? also needs to
communicate three separate things a single reflection prompt cannot carry alone: **I have a
relationship here. There is something for me here. There is somewhere to go here.** Today provides
all three without turning Home into a control center.

### The three sources of orientation — candidate rule

> **ME** — what I am carrying. **LARRY** — my human relationship / next encounter. **FROM LARRY** —
> teaching or material available to me. Then **EXPLORE** if I want more.

**MAIA's role, stated explicitly.** MAIA does not get her own permanent block on Today. She becomes
available *inside* gestures where conversational help makes sense — significant, because Larry stays
visibly central while MAIA stays powerful underneath, not beside him.

### Candidate compositional rule (to preserve)

> **Today is not a dashboard. It composes member continuity, human relationship, and Larry's offered
> material into one orientation state, while the broader environment remains available on demand.**

**What we test in the walk.** Whether states A/B/C read as one coherent screen with shifting emphasis
or as three different screens; whether "Explore your space" feels like an honest low-weight door or
a suppressed feature list.

---

## Screen 5 — Field / Explore

**Purpose.** *Show me what is available without making all of it compete for my attention every time
I arrive.* Reached only when the client wants breadth — likely the home for what was earlier called
"the field of options."

**Candidate human regions** (illustrating composition, not yet canonical IA):

> **My work** — questions, reflections, practices, kept material.
> **With Larry** — coaching, preparation, shared material, conversations.
> **From Larry** — teachings, videos, exercises, resources.
> **Support** — MAIA, scheduling, contact, session access.

The insight matters more than these labels: **capabilities cluster around human purpose**, not
software subsystem.

**What we test in the walk.** Whether a person reaching Field already has enough context from Today
that this reads as *"more of what I already understand"* rather than *"the real app, finally."*

---

## Screen 6 — Conversation

**Purpose.** One quiet place to think something through with MAIA without turning MAIA into Larry, a
coach, or the author of what matters. Conversation should feel like a continuation of the client's
own work, not a departure into "AI chat."

**Human question.** *Can I stay with this long enough to understand what I actually think, feel, or
want to bring forward?* The system's job is to support attention and articulation — not to diagnose,
not to decide, not to manufacture a breakthrough.

**What is visible.** The first viewport preserves context rather than resetting into a generic
chatbot. The client should always be able to tell *why* this conversation started:

> **For a return:** "You were carrying… 'How do I know whether I'm moving toward something or merely
> leaving?' … What happened since?" — then the conversation begins beneath that.
>
> **For preparation:** "Your conversation with Larry is tomorrow. What feels important to bring into
> that conversation?"
>
> **For a new concern:** "Something is on your mind. Start wherever it feels true."

Different entry conditions; one coherent conversational environment.

**Primary gesture.** Speak / write — nothing more complicated. Voice and text are modalities of the
same act, not two different experiences. The primary experience is: *tell me what is here.*

**Secondary access.** Very few, and all explicit member choices, never automatic: *Keep something* ·
*Bring something to Larry* (a separate explicit act) · *Leave for now* (legitimate non-action remains
available) · possibly *Back to Today.* No toolbar of AI operations — no "analyze / summarize /
generate plan / extract insights / identify patterns." Those capabilities may exist underneath but
must not become demands on the client.

**Larry's role — central to tomorrow's question.** MAIA supports the space *between* Larry's
conversations. It does not become the coaching relationship. A client should experience: *"Larry is
the human relationship. MAIA helps me think between encounters."* Two compositional boundaries follow:

1. MAIA should not repeatedly mention Larry as though reporting back to him.
2. MAIA should not impersonate Larry's teachings or coaching voice unless material has actually been
   authorized and attributed.

When preparing for Larry, MAIA can help the client articulate what they want to bring — categorically
different from *"here is what Larry would tell you."*

**What stays invisible.** Spiralogic phases · flourishing-domain machinery · memory retrieval ·
prompt assembly · safety architecture · provenance internals · model/provider identity · system
interpretations of psychological state · "insight scores" · inferred priorities · coaching-framework
names · Larry-source retrieval mechanics. The intelligence may use appropriate governed context
underneath; the client experiences a conversation.

### Three candidate Conversation states

**A — Entering with explicit continuity.** The member arrives from Return/Today carrying a prior
authored act. MAIA may use that context because the member actually made the prior act — it must
not strengthen the story ("You've clearly realized that…") unless the member actually said so.

**B — Entering openly.** No prior act needs to be manufactured — *"What's here today? Start wherever
it feels true."* The interface cannot require the system to know the meaning of every visit. Absence
of continuity is not a failure state.

**C — Preparing for Larry.** A factual scheduled conversation frames the room — *"Your conversation
with Larry, Thursday · 2:00 PM — what feels important to bring into it?"* MAIA supports preparation;
the destination remains the human encounter, not greater dependence on MAIA.

### Conversation rhythm — candidate design principle

> Conversation should deepen by attention, not by feature escalation.

```
member expression → MAIA reflects / asks / stays with it → member expression
   → MAIA responds proportionately → member decides whether anything matters enough to keep
```

Not: `member expression → analysis → framework → recommendation → action plan` — that sequence turns
reflection into workflow software almost immediately.

### The end of Conversation — the seam into Keep

A conversation should not finish by announcing *"here are your three key insights"* — that makes the
system the authority on what mattered. Instead: *"Is there anything from this conversation you want
to keep?"* — with three equally valid responses: **Keep something · Not now · I'm done.** This
directly preserves the programme's requirement for legitimate non-action. If nothing is kept, the
conversation was still allowed to have value.

### Failure modes

1. **Generic AI chat** — if the current context disappears and the screen becomes "Ask MAIA
   anything," continuity breaks.
2. **MAIA becomes the coach** — if MAIA provides authoritative life direction, Larry becomes
   peripheral.
3. **MAIA becomes Larry** — if it synthesizes his voice/teachings without authorized material, both
   provenance and relationship fail.
4. **Forced insight** — if every conversation is expected to generate something worth keeping,
   reflection becomes productivity.
5. **Hidden authorship** — if MAIA-generated language is later presented as the member's own
   understanding, sovereignty fails.
6. **Feature creep** — if the room fills with analysis buttons, suggested prompts, scores, themes and
   actions, simplicity disappears.
7. **No exit** — if the person cannot simply leave without completing something, the environment
   becomes coercive.

### What we test in the walk

With Jondi/Larry, don't explain the intended boundaries first. Observe, organized by the master
programme's own design-quality dimensions:

- **Orientation** — does the person understand what to do immediately? Do they know what they came
  in carrying?
- **Relationship** — does MAIA feel supportive without replacing Larry? Does Larry feel this extends
  his work rather than competes with him?
- **Simplicity** — does the room feel like somewhere to think, or like an AI product?
- **Agency** — does the client remain the person deciding what matters?
- **Humanity** — can nothing happen? Can uncertainty remain uncertainty? Can the person leave without
  a manufactured resolution?
- **Continuity** — does Conversation feel like the same Now What? environment as Today and Return?

### Candidate compositional rule (to preserve)

> **Conversation is not where Now What? tells the client what their experience means. It is where
> the client is given enough relational and reflective support to discover what, if anything, they
> themselves want to say, keep, or bring into their human relationship with Larry.**

---

## Screen 7 — Keep

**Purpose.** The moment when something from an otherwise temporary conversation becomes part of the
member's continuing Now What? space *because the member chose it.* Not "save chat." Not MAIA
extracting insights. Not consent to show Larry. Narrower and more important:

> Allow the member to say: **"This matters enough that I want it to travel with me."**

That act creates continuity without surrendering authorship or privacy.

**Human question.** *Is there anything here I want to carry forward?* The important word is *I* — MAIA
may help a conversation unfold, but MAIA does not decide what becomes part of the member's continuing
field.

**What is visible.** A quiet threshold after Conversation, not a form. The person sees the exact thing
they are considering carrying forward, with its authorship still legible:

> Keep this?
> "I think I've been trying to choose the next chapter before letting the old one actually end."
>
> **Keep this** · Change the words · Not now

If the material originated with MAIA, the interface must not quietly transform it into the member's
voice — the difference stays visible: *"MAIA offered: 'Perhaps the uncertainty is not asking to be
solved yet.'"* The member may leave it, retain it with its real provenance if supported, or restate
it in their own words.

> **Keeping preserves choice; it does not manufacture ownership.**

**Primary gesture.** *Keep this* — for member-authored material, means exactly what it sounds like:
put this chosen piece into my continuing Now What? space. No categorization required before the act
succeeds. The member should not have to answer *"what type of insight is this? what flourishing
domain? what stage? what goal does this support?"* Those may be useful invisible structures or later
optional acts — never the price of keeping something meaningful.

**Secondary access.** Sparse: *Change the words* (restate before carrying it), *Not now* (legitimate
non-action). After a successful Keep, a **separate** invitation may appear — *Bring this to Larry* —
but it must remain visibly separate from Keep. Load-bearing distinction:

> **KEEP ≠ SHARE.** "I want to remember this" and "I want Larry to see this" are two different human
> acts. They should never be collapsed into one checkbox, one default permission, or one clever
> inferred workflow.

**Larry's role.** Becomes available only *after* the member has established what belongs to them:

```
Something matters to me → I keep it → it remains mine
   → I may separately choose to bring it into my work with Larry
```

Not: `something matters → system stores it → Larry can see it`. If the member chooses *Bring this to
Larry*, the interface makes the act clear and bounded — *"Bring this into your coaching with Larry?"*
— plain language that this item becomes visible in that relationship and can later be withdrawn,
assuming that remains the governed behavior. **The member does not need to understand the database
boundary. They need to understand the relationship boundary.**

**What stays invisible.** The event ledger, database identifiers, provenance machinery, visibility
fields, memory architecture, retrieval system, Spiralogic classifications, semantic embeddings,
system salience, or any computed "importance." Especially invisible: any machinery trying to answer
*"which part of this conversation was most important?"* — that judgment belongs to the member.

### Three candidate Keep conditions

**A — The member knows exactly what matters.** The simplest case: *"I need to stop treating
uncertainty as evidence that I'm doing something wrong." Keep this. Done.* No ceremony.

**B — Something is close, but the words are not theirs yet.** *"Put this in my words"* gives the
member authorship of the new wording through an explicit act rather than silently laundering a model
formulation. The distinction: *MAIA gave me language I chose to make my own* vs. *the system decided
this is what I realized* — psychologically and ethically different events.

**C — Nothing needs to travel.** *Not now*, or simply leaves. No "Are you sure?" No lost-progress
anxiety. No "You haven't saved an insight." No implication the conversation failed. **A conversation
can matter without producing a durable artifact — that must remain a successful outcome.**

### After Keep

Quiet, not celebratory. Not "🎉 Insight saved!" — closer to: *"Kept."* — then perhaps *Continue
talking · Bring this to Larry · Back to Today.* Hierarchy matters here too: sharing should never
happen merely because it is the obvious next button. The member has completed one sovereign act
already; the interface should not hustle them into another.

### Failure modes

1. **Automatic extraction** — MAIA summarizes the conversation into "your insights" and asks the
   member to approve them, subtly transferring authorship upstream before giving it back.
2. **Keep becoming Share** — Larry visibility follows preservation automatically or through a
   preselected control.
3. **Provenance laundering** — MAIA's wording later appears as though the member authored it.
4. **Forced categorization** — a human realization must be assigned a type, framework, domain, or
   program position before it can be kept.
5. **Productivity pressure** — every conversation is expected to end in an insight, commitment, or
   action.
6. **Celebratory gamification** — the system rewards accumulation and teaches the person to collect
   "insights."
7. **Irreversibility anxiety** — Keep feels like declaring permanent truth rather than preserving
   something worth carrying for now.

### What we test in the walk

Whether the member understands Keep means *mine*; whether they understand Larry does not
automatically receive it; whether the authorship of the thing kept remains obvious; whether declining
to keep anything feels completely legitimate. With Larry specifically, one additional reaction to
watch for, unanswered on his behalf: **does this boundary make his relationship with clients feel
stronger, or unnecessarily mediated?** A real product question — his to answer, not ours.

### Candidate compositional rule (to preserve)

> **Keep is the member's act of creating continuity. It preserves what they choose without changing
> who authored it, what it means, or who may see it. Keeping something never constitutes sharing it
> with Larry; sharing is a second, explicit relationship act.**
>
> **The absence of a Keep is not an absence of value. Now What? must allow a conversation, a feeling,
> or an unfinished question to remain transient.**

That closes the central journey seam:

> Conversation → member encounters something → Keep or don't → optional Bring to Larry → Return can
> later truthfully carry what the member actually chose.

---

## Preserved, unchanged from the existing strong states

- **Return** — *"You were carrying… What happened since?"* — preserved as an important candidate
  component in its own right, not treated as a mistake for being minimal. It composes into Today's
  state A and into Conversation's state A, rather than standing alone as the whole product.

---

## End-to-end compositional review

**Status: DESIGN CANDIDATE · FOUNDER EXPLORATION · NOT IA RULING.** A composition review, not
another round of screen invention. The central question:

> **At what points does the client stop feeling that they are moving through one living Now What?
> environment and start feeling that they have entered another product, module, or workflow?**

### The eight transitions, at a glance

| Transition | Read | Main risk |
|---|---|---|
| Landing → Sign-in | Needs tight binding | Beautiful brand experience collapses into generic authentication |
| Sign-in → Check-in | Conceptually strong | Check-in becomes a questionnaire or menu |
| Check-in → Today | Strong | System asks intention, then ignores it and shows predetermined Home |
| Today → Field | Highest IA risk | Quiet orientation suddenly becomes a dashboard/module map |
| Today/Field → Conversation | Strong if shell survives | "Now What?" suddenly becomes an AI-chat product |
| Conversation → Keep | Very strong | Keep becomes a save dialog/workflow rather than a sovereign threshold |
| Keep → Return | Strong substrate | Return becomes a second Home instead of continuity recomposed into Today |
| Return → new engagement | Strongest existing behavior | Excessive minimalism hides Larry, context and breadth |

### 1. Landing → Sign-in

These should feel like two phases of one threshold, not separate pages. Landing can be expressive;
Sign-in can be functional — but the environmental DNA cannot disappear between them. Keep: same
wordmark, same type system, same background/material language, same visual motif, some continuing
Larry identity, same spatial spine.

The failure: `Beautiful Larry / NOW WHAT? experience → generic email authentication form`. The client
should feel `I chose to enter this place → now it is letting me into my part of it`. One seam to
explicitly test.

### 2. Sign-in → Check-in

Conceptually good, but Check-in risks becoming another menu. The candidate's intentions (continue
where I left off / something is on my mind / prepare for Larry / find something from Larry / perhaps
look around) are much better than software modules — but five equal buttons would recreate the
problem just spent weeks removing.

> **Check-in must feel conversational and orienting, not classificatory.**

Perhaps one prompt and a few quiet sentence-doors. And: **do not necessarily show Check-in every
time** — a member returning directly to a clearly ongoing thread may not need to answer "what brings
you here today?" before continuing. Check-in is probably best understood as a **conditional
orientation state**, not a mandatory tollbooth. Candidate observation, not an IA ruling.

### 3. Check-in → Today

Works if Today actually honors the answer. Choosing *Prepare for Larry* and then seeing an unrelated
carried question means the system asked and ignored. Choosing *Find something from Larry* should
meaningfully alter orientation.

> **A human intention declared at Check-in must survive visibly into the next state.** Not
> necessarily permanently. But immediately. Both UX coherence and relational respect.

### 4. Today → Field — the most dangerous seam

Today is coherent precisely because it says ME / LARRY / FROM LARRY / EXPLORE with one primary
emphasis. Field reasonably reveals My Work · With Larry · From Larry · Support — but if it becomes
four beautiful boxes, navigation cards, counters, icons, and feature destinations, this is back where
NW-D00 began.

Field needs to feel like **zooming out within the same environment**, not **opening the application
menu**. Same editorial grammar preserved — prose under a heading with one quiet destination link —
never a card grid.

> **Candidate compositional rule: Field is a change of scale, not a change of product grammar.**
> Probably the most important new finding from this review.

### 5. Today/Field → Conversation

Conceptually excellent; will fail immediately if Conversation looks like a conventional chat
application. The transition should be *"I entered more deeply into something I was already
holding,"* not *"I launched MAIA."* Conversation retains: environmental background, typography,
reading measure, subtle Now What? identity, entry context, restrained navigation. The composer
emerges naturally at the bottom.

The biggest visual test:

> **If you removed the transcript text, would Conversation still unmistakably look like the same
> Now What? place as Today?** If not, the shell is broken.

### 6. Conversation → Keep

One of the strongest conceptual seams — but Keep should **not** feel like another destination. It is
psychologically a threshold *within* Conversation: *"Of everything that happened here, this is
something I choose to carry."* An **in-place narrowing of attention** — Conversation recedes, the
chosen words come forward, then *Keep this / Change the words / Not now*. Not
`Conversation → navigate to /keep → Save Insight form`, which would turn an existential gesture into
CRUD.

> **Candidate compositional rule: Keep should feel like Conversation becoming quieter around one
> chosen thing, not like leaving Conversation to manage data.**

### 7. Keep → Return — the most interesting structural observation

The existing Return screen is excellent. But Return and Today may not need to feel like two separate
destinations — they may be **two compositions of the same orientation state**: Today returning with a
carried thread (thread gets primary emphasis) vs. Today with a session tomorrow (Larry preparation
gets primary emphasis) vs. Today with no current thread (open orientation). This does **not** settle
whether they are technically one route or one IA object — it is the compositional finding:

> **Return should inherit Today's world rather than creating a second competing Home.**

This resolves the concern from the first screenshot review: the screen wasn't wrong. It was **a
complete Return composition being asked to represent the whole product.**

### 8. The biggest cross-journey issue — Larry and MAIA

A relational movement across the whole journey:

```
LANDING       Larry strongly present
SIGN-IN       Larry / Now What? identity remains
TODAY         Larry as human relationship; member as center
CONVERSATION  MAIA comes forward because invited
KEEP          member becomes visibly sovereign again
RETURN        member's own continuity comes forward
FIELD         Larry / teachings / support remain available
```

This gives MAIA a **dynamic presence** rather than permanent screen real estate. Larry doesn't need
to compete with MAIA. The member remains the center of the field throughout — one of the strongest
things in the candidate.

### The single spatial grammar

For the whole journey to feel like one place — structural consistency, not styling:

- **One spine** — content shares a recognizable left/reading edge.
- **One measure** — the environment does not swing between narrow contemplative pages and 1200px
  dashboards.
- **One type hierarchy** — wordmark → orientation label → human headline → body → quiet action.
- **One material world** — Landing may be more expressive and Conversation more intimate, but they
  belong to one atmosphere.
- **One gesture hierarchy** — one obvious primary invitation; secondary access recedes.
- **One movement grammar** — transitions settle/deepen/reveal rather than launch unrelated apps.
- **One relational grammar** — ME / LARRY / FROM LARRY / MAIA never become four equal product
  modules.

### Four load-bearing fracture risks

1. **Landing becoming marketing while the interior becomes software.** Fix through shared visual DNA.
2. **Check-in and Field becoming menus.** Fix through human-intention language and editorial
   composition.
3. **Conversation becoming an AI-chat application.** Fix through context continuity and shared shell.
4. **Return becoming a separate ultra-minimal Home.** Fix conceptually by understanding Return as a
   **state of orientation**, not evidence that the entire environment should contain one sentence
   and a text box.

### The journey, recomposed

```
LANDING        This is Larry's Now What?
     ↓
SIGN-IN        Let me into my space
     ↓
CHECK-IN       Why am I here?
     ↓
TODAY          Where am I now?
     ↕
FIELD          What else is here when I want it?
     ↓
CONVERSATION   Let me stay with this
     ↓
KEEP           Does anything deserve to travel with me?
     ↓
RETURN         What happened since?
     ↓
TODAY          My life has moved; orient me again
```

That last loop matters: **Return doesn't terminate the journey. It recomposes Today.** That is what
makes this feel like an environment rather than a sequence of screens.

### Assessment

The conceptual composition is strong enough now to **stop adding screens.** The next meaningful
design work is visual/compositional comparison, not more screens, copy polishing, or code:

> Put all eight states beside one another at low fidelity and ask, **"Which one looks like it belongs
> to another application?"**

---

## Eight-State Low-Fidelity Strip

**Status: DESIGN CANDIDATE · FOUNDER EXPLORATION · NOT IA RULING.** First-viewport skeletons only —
no polished copy, colors, imagery, or component detail. The test is not *"does each screen look
good?"* It is: **cover the labels and still tell these eight screens belong to one environment.**
Content drawn from the screens already developed above, not invented fresh.

```
LANDING → SIGN-IN → CHECK-IN → TODAY ↔ FIELD → CONVERSATION → KEEP → RETURN
                                                                          ↓
                                                                        TODAY
```

Shared skeleton, every frame:

```
┌──────────────────────────────┐
│ NOW WHAT?                    │
│ Larry / location context     │
│                               │
│ ORIENTATION                  │
│                               │
│ Primary human content        │
│                               │
│ Primary gesture →             │
│                               │
│ quiet secondary context      │
│ secondary access →            │
└──────────────────────────────┘
```

### The eight frames

```
┌ LANDING ──────────────────────┐  ┌ SIGN-IN ──────────────────────┐
│ NOW WHAT?                     │  │ NOW WHAT?                     │
│ Larry Closs                   │  │ Larry identity, light chrome  │
│                                │  │                                │
│ "For the moments when what    │  │ Welcome back.                 │
│  got you here no longer tells │  │                                │
│  you where to go next."       │  │ [ email field ]                │
│                                │  │                                │
│ reflection · coaching ·       │  │ Continue →                    │
│ teachings/resources · support │  │                                │
│                                │  │ small privacy/trust sentence  │
│ Enter →                       │  │                                │
│                                │  │ MAIA: not visible              │
│ Learn about Now What? (cand.) │  │                                │
│ MAIA: not visible              │  │                                │
└────────────────────────────────┘  └────────────────────────────────┘
              ⚠ FRACTURE 1 — does Larry's world suddenly become authentication software?

┌ CHECK-IN ─────────────────────┐  ┌ TODAY ────────────────────────┐
│ NOW WHAT?                     │  │ NOW WHAT?                     │
│                                │  │ Good morning, [name].          │
│ What brings you here today?   │  │                                │
│                                │  │ WHAT YOU'RE CARRYING            │
│ Continue where I left off      │  │ "…member's actual words…"      │
│ Something is on my mind        │  │                                │
│ Prepare for Larry              │  │ What happened since? →         │
│ Find something from Larry      │  │                                │
│ (help me find my way)          │  │ Next with Larry — Thu 2pm      │
│                                │  │ From Larry — one teaching      │
│ [conditional — may not show    │  │                                │
│  if returning to a live thread]│  │ Explore your space →           │
│ MAIA: not visible              │  │ MAIA: not visible (in gesture) │
└────────────────────────────────┘  └────────────────────────────────┘
              ⚠ FRACTURE 3 (early form) — does the system ask intention, then ignore it?

┌ FIELD ────────────────────────┐  ┌ CONVERSATION ─────────────────┐
│ NOW WHAT?                     │  │ NOW WHAT? (shell retained)     │
│ Your Now What? space           │  │ entry context stated:          │
│                                │  │ "You were carrying…" /         │
│ My Work — thinking, living,    │  │ "Your conversation with Larry  │
│  choosing to keep. See →       │  │  is tomorrow…" /               │
│ With Larry — conversations,    │  │ "Something is on your mind."   │
│  what you've brought. Go →     │  │                                │
│ From Larry — teachings,        │  │ [ transcript / composer ]      │
│  videos, resources. See →      │  │                                │
│ Support — MAIA, schedule,      │  │ Speak / write                  │
│  contact, join. Get help →     │  │                                │
│                                │  │ Keep · Bring to Larry · Leave  │
│ ← Back to Today                │  │ MAIA: NOW VISIBLE — invited     │
│ MAIA: one line inside Support  │  │                                │
└────────────────────────────────┘  └────────────────────────────────┘
              ⚠ FRACTURE 2 — does orientation suddenly become a module dashboard?
              ⚠ FRACTURE 3 — does Now What? suddenly become ChatGPT?

┌ KEEP ─────────────────────────┐  ┌ RETURN ───────────────────────┐
│ (Conversation recedes;         │  │ NOW WHAT?                     │
│  chosen words come forward)    │  │                                │
│                                │  │ WHAT YOU'RE CARRYING            │
│ Keep this?                     │  │ "…the member's own act…"       │
│ "…the member's exact words…"   │  │                                │
│                                │  │ What happened since? →         │
│ Keep this →                    │  │                                │
│                                │  │ [ recomposes into TODAY,        │
│ Change the words · Not now     │  │   not a second destination ]   │
│                                │  │                                │
│ (if MAIA-sourced, attributed:  │  │ MAIA: not visible               │
│  "MAIA offered: …")            │  │                                │
│ MAIA: only if attributed        │  │                                │
└────────────────────────────────┘  └────────────────────────────────┘
              ⚠ FRACTURE 4 — does continuity become a separate mini-product instead of
                              recomposing orientation, on the loop back into TODAY?
```

### The relational line

```
LANDING        Larry strongly present
SIGN-IN        Larry / Now What? identity retained
CHECK-IN       Member moves to center
TODAY          Member + Larry relationship visible
FIELD          Member's world broadens
CONVERSATION   MAIA comes forward because invited
KEEP           Member authority becomes explicit
RETURN         Member's own continuity leads
```

If MAIA dominates visually before Conversation, that's a finding. If Larry vanishes immediately
after Landing, that's a finding. If the member stops being the center anywhere, that's a finding.

### The gesture line — the simplicity test

```
LANDING        Enter
SIGN-IN        Sign in
CHECK-IN       Name why I'm here
TODAY          Make one meaningful move
FIELD          Look around
CONVERSATION   Speak / write
KEEP           Choose what travels
RETURN         Continue
```

Eight screens, enormous capability underneath, one intelligible thing asked of the person at each
moment.

### The diagnosis this strip makes visible

> **The production Return screen is not "too minimal" in itself. It becomes too minimal only when it
> is forced to serve as the client's understanding of the whole Now What? environment.**

The strip shows why: Return is one frame among eight, sharing the same skeleton as the other seven —
not a competing product, not evidence the whole environment should be one sentence and a text box.

---

## STOP — held for tomorrow

Per explicit instruction: no further refinement of this candidate tonight. What exists now:

> screen logic → seam logic → spatial grammar → whole-journey strip

That is enough theory. Tomorrow's encounter supplies what is currently missing — Larry's actual
reaction to the thing. Nothing here is IA doctrine, nothing authorizes a route or code change; the
master programme's sequence (UX-03 → deploy → Kelly walk → Jondi walk → UX-04 → Larry walk) is
unchanged. This document remains open for continuation, not closed as a ruling.

### The walk protocol (founder, 2026-09-02 — governs how tomorrow's evidence is gathered)

> **Observe first. Interpret second. Fix later.**

Capture his actual words, where he hesitates, what he expects to find, what he ignores, what he
immediately wants, and what makes him say *"this is too much"* or *"where is ___?"* Do not rescue the
experience by explaining it unless he explicitly asks. This makes tomorrow an encounter with the
product, not another design conversation.

**Afterward** — not before — return to this candidate and mark each finding against every claim
above as one of: **CONFIRMED · CHALLENGED · NEW EVIDENCE · STILL UNKNOWN.** The next UX move comes
from the encounter, not from prediction made tonight.
