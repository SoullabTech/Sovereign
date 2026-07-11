# Now What? — The Demo as Journey: Three Identities, One Field

**Status:** CANDIDATE demo re-sequence. 2026-07-07.
**Supersedes the *act structure* of** [`NOW_WHAT_DEMO_SPEC.md`](./NOW_WHAT_DEMO_SPEC.md), **not its content.** That spec remains the source of truth for what is deployed, what is seeded, and the exact routes/credentials. This document re-organizes the same surfaces into a journey Larry can *inhabit* rather than a feature set he watches.

---

## The question the demo actually answers

Larry is not buying software. He is asking one thing:

> **How do I help someone's transformation continue after they leave me?**

Everything below is in service of that question. So the demo does not begin with what Larry *sees*. It begins with what Larry is *trying to accomplish* — and then lets him feel the answer from three sides before it ever explains itself.

**Recognition first. Explanation last.** The architecture appears only after Larry has already felt why it matters.

**The one sentence to leave in his mind:** *"For the first time, my work has somewhere to live."* Not archived, not managed — **alive.** (Secondary framing, if the simpler line feels too spare: *"This doesn't simply extend my coaching — it gives my life's work a place to keep growing."*) If Larry finishes with only that, the demo has done its work.

**Trust is not the same as liberation.** The constitutional architecture answers *"Can I trust this?"* — but Larry, as an entrepreneur, is really asking *"Can I build my life's work here?"* The demo must answer both. It climbs three landings: **Sovereignty** (I remain the authority over my own development) → **Continuity** (my work doesn't disappear between encounters) → **Stewardship** (my life's work can keep growing). The first two make the platform *trustworthy*; the third makes it *liberating*. Stewardship — not "Vision" — is the top landing, and it aligns with the stewardship-as-apex direction already held in the canon.

---

## The organizing principle: one question at three scales

"What now?" is not the coach's question alone. Everyone in the field is asking it:

- **Larry asks:** *What now, after I finish the workshop?*
- **Michael asks:** *What now, after today's realization?*
- **The field asks:** *What now, after these months of work?*

One question, three scales. That is a stronger spine than "coach app vs. client app." The demo is **four intertwined identities**, braided — it returns to Larry, and in doing so opens onto the fourth: the work itself.

```
                  Living Practice
                        │
   ┌──────────┬─────────┼─────────┬──────────────┐
   │          │         │         │
  Me        You        Us      The Work
(my dev)  (client) (relationship) (the field that
                                   outlives any encounter)
```

The UI is not screens. It is **perspective** — the same underlying field, four responsibilities.

---

## Act I — **Me**: *Who am I becoming?*

**Before Larry is a coach, he is a person with his own questions, journals, books, and development.** If he experiences MAIA only as something he *gives* clients, he will subconsciously treat it as not-for-him — and the whole philosophy quietly collapses. So the demo opens here, with Larry as a human being.

**What he does:** Larry opens his own companion — not a dashboard, not a client roster. A conversation that remembers. He names a question he's actually living. He returns a few days later and it hasn't reset; it continues.

**What he feels:** *"This helps me continue becoming."*

**Ledger — what is real here:**

| Element | Layer | Note |
|---|---|---|
| Persistent conversation, long-term memory, journaling, reflection, return-without-reset | **Live** | This *is* MAIA. Larry can have his own companion today. |
| His decades of books, talks, research becoming a *living body of work that keeps evolving* | **Vision** | The Contribution Field / body-of-work-as-field is a preserved direction, not a built surface. Depict it as where this is going — never as a screen he can open today. |

> **Honesty guard for Act I:** open on the Live companion (his own MAIA), reach *toward* the living body of work. Do not stage the corpus-as-field as if it exists. The recognition we want — "I need this too" — lands on the Live part alone.

---

## Act II — **You**: *What is it like to live with this companion?*

Now Larry becomes **Michael**. This is where the magic happens: he stops evaluating a tool and starts feeling what his client feels.

**What he does (walk the seeded journey as Michael):**
- **Arrival** — the room opens: *"How are you entering this room today?"* → a reflection → **a practice emerges** (not assigned).
- **Time passes** — not every conversation, but a felt arc: the workshop cracked something open → a three-minute pause before an executive meeting → catching himself performing confidence → listening past his own defense → *"achievement no longer defines identity — it expresses it."*
- **He keeps one thing private.** One morning's entry is his alone. He chooses what continues into the shared field and what stays with him.
- **Return** — the room opens *from the practice*: *"Last time you chose this practice. What happened?"*

**What he feels:** *"Nothing dramatic happened today. Yet something continued."* And, as the one holding the private thread: *"I am the one who decides what continues."*

**Ledger — what is real here:**

| Element | Layer | Note |
|---|---|---|
| Threshold → reflection → practice-emerges; return-branch opens from the practice | **Live** | Deployed. Route: `/maia/vision-studio?program=now-what&phase=fire_1&fieldContext=now-what-demo` |
| Default-private: the entry Michael keeps to himself never leaves him | **Live (governance)** | The consent boundary is real code, not a promise. This is the sovereignty proof *felt from the inside*. |
| The 28-day arc / 6 backdated threads | **Designed (seeded)** | Fictional, labeled, removable in one statement. It proves the *shape* of continuity — what it will feel like — not that MAIA autonomously carried a real member for a month. Keep the seeding legible. |

### Keystone — the return exchange (the 30 seconds the whole demo rests on)

This is the one beat that must be written word-for-word, because it is where the demo either honors or inverts the constitution. MAIA holds the thread; **Michael does the recognizing.** MAIA never says "you've grown" or "you've integrated" — that would make the *system* the author of his development.

> **MAIA:** *"When you were last here, you chose something — three quiet minutes before your first meeting, asking what kind of leader you wanted to become that day. I kept it. Do you want to pick it back up, or has something shifted?"*
>
> **Michael:** *"Honestly, I'd forgotten I framed it that way. But I did keep pausing. Last week in the budget review I caught myself performing confidence — and I stopped."*
>
> **MAIA:** *"You wrote that down at the time — 'paused, named it, chose honesty.' Does the pause feel like the same one you started with, or something different now?"*
>
> **Michael:** *"…it's different. At first it was a technique. Now it's just how I walk in."*

The recognition — *"at first a technique, now how I walk in"* — comes from Michael's mouth, not the machine's. MAIA supplied only two things: the **memory** ("I kept it," "you wrote that down") and the **question** that returned authority to him. That is the entire philosophy in four lines — and it is the seed of every larger claim in this document, including *The Work*.

**Verification (2026-07-07 — product truth).** The return-branch mechanism is **Live and deployed** (commit `8f0482623`, on `clean-main-no-secrets`): on re-entry it loads the member's prior `practice`-tagged thread and switches to `RETURN_PROMPT` in [`app/api/now-what/interview/route.ts`](../../../app/api/now-what/interview/route.ts). Two findings *strengthen* the keystone beyond what this doc first claimed:

- **The opening line is templated, not model-generated.** *"Last time you chose this practice. What happened?"* is guaranteed verbatim, and the member's own practice words are interpolated directly (no LLM paraphrase). The first beat is **Live**, not Designed — better than the prior expectation.
- **Sovereignty is enforced in the prompt itself.** RETURN_PROMPT instructs: *"Do not evaluate adherence. Do not praise compliance… not living a practice is information about the practice or the season, never a failure of the person."* Checklist item 6 is already code.

**MAIA's follow-up lines** (e.g. *"you wrote that down at the time…"*) are model-generated from that constrained prompt — so the scripted continuation above is a **faithful illustration** of guaranteed-sovereign behavior, not verbatim-guaranteed. Quote the opening line; mark the rest as representative.

**Seed + sovereignty boundary — confirmed in prod (2026-07-07).** A read-only prod-DB check (`member_field_note_threads WHERE field_context='now-what-demo'`) returns all 6 seeded threads, including the `practice`-tagged thread (2026-06-10) that fires the return branch — so the demo **does** trigger for `michael.demo`. The boundary holds too: 5 threads carry `can_be_shown_to_practitioner = true`; the one private morning thread (2026-07-03, *"some mornings the question feels heavier"*) is `false` — it will not appear in Larry's view. **Verified at code + data level: mechanism Live, opening wording guaranteed, seed present, consent boundary intact.**

**What remains unverified (per build → verify → experience → expand):** (a) a live end-to-end render — actually walking the route and watching `RETURN_PROMPT` fire at runtime; (b) the *experiential* step — whether Larry, walking it, feels *"I'm returning to a relationship that stayed alive,"* not *"I'm returning to software."* The code is proven; the felt shift is the outcome still to observe.

---

## Act III — **Us**: *How does our work evolve together over time?*

Now Larry returns to his own chair — as **practitioner**. Not administration. Not CRM. Not AI notes. **Stewardship.**

**What he does:**
- Prepares for the next session by seeing where Michael *actually is* — the practice he carried, the question he named alive, the reflection he chose to share.
- Enters the conversation *where the work is*, instead of spending twenty minutes rediscovering it.
- Sees the private morning entry **is not there** — because Michael didn't share it. The boundary he felt as Michael, he now honors as Larry.

**What he feels:** *"That's my work continuing while I'm not present. And I receive a person who has continued developing — not one who was waiting."*

**Ledger — what is real here:**

| Element | Layer | Note |
|---|---|---|
| Facilitator field view: Questions Alive · Practices · Recognitions · Shared Reflections — *only what Michael chose to share* | **Live** | Route: `/studio/fields/<michael-demo-id>`. The private thread's absence is the governance proof from the practitioner side. |
| Themes emerging across months for one relationship | **Designed** | Legible from the shared threads; the four-section grouping is a polish pass. |
| Consent-shaped **cohort** view ("who would welcome a check-in" as a *member-pulled* gesture; "nothing shared yet" as a fact, never "Quiet"/"Needs outreach") | **Designed** | Gated behind Co-Lab Release Gate + practitioner-privacy invariants. Facts, not interpretations. |
| **2,400 people across 20 years** as living developmental movement; Leadership Team Companion; practitioner and participants co-evolving over years | **Vision** | The identity shift — from *workshop deliverer* to *steward of a developmental ecosystem*. This is the emotional close. Name it as horizon, not inventory. |

---

## Act IV — **The Work**: *What outlives any single encounter?*

The fourth identity is the one entrepreneurs actually care about. They are rarely trying to build a coaching business — they are trying to build **something that continues to matter.** Larry's field today lives in fragments: workshops, books, relationships, journals, emails, videos, ideas, future ventures, alumni. The platform lets those become **one living ecology** — not archived, not managed, but *alive*: it keeps teaching, keeps connecting people, keeps evolving, sometimes surprising even its creator.

**Constitutional humility is what makes this safe.** The platform does not create Larry's wisdom, manufacture his methodology, or infer new teachings. It creates the **conditions** where his own body of work keeps unfolding *through authentic encounters*. The "surprise" never comes from the system generating content — it comes from how *people* meet the work. (Living Field Mirror Invariant: never synthesis. Interface Humility. Reveal, don't manufacture.)

**Layer:** Vision. This is not a surface Larry opens today; it is the horizon the whole demo points at. Walk him to it in language, land it on the one Live seed.

## The braid closes — on Larry, opening onto the Work

```
Larry → my development → my client's experience → back to my practice → back to my development → the work that holds all of it
```

The braid returns to **Me** — Larry's own becoming, now understood differently: the thing he gives his clients is the same thing that keeps *him* unfolding. And that return reveals the fourth identity — **The Work**, the field that outlives any single encounter and holds practitioner, participants, and body of work in one living ecology. The last recognition is not "I can coach better." It is: *"For the first time, my work has somewhere to live."*

---

## What this points toward — the vision (Vision layer, framing only)

This is the emotional peak, and it comes *before* the architecture. It is **narration and recognition, never a shown surface** — everything here requires longitudinal real-member evidence that today is zero. Voice it as Larry's own realization; do not stage it as a screen.

**Transformation stops being episodic.** Today most transformational work runs `Life → Workshop → Insight → Go home → Try to remember → Return weeks later`, and the space between encounters is unheld. The emerging rhythm holds that space: `Workshop → Insight → daily life → companion → reflection → recognition → practice → integration → return`. The client no longer experiences transformation as isolated events.

**For the client — "someone remembers who I am becoming."** Not someone *watching* them (surveillance) — someone *remembering the arc* (continuity). And the arc bends toward independence, not dependence:

```
Recognition comes FROM Larry  →  Recognition comes THROUGH conversation  →  Recognition becomes INTERNAL
```

The companion gradually hands authority back to the person. Success is not "how much did they use it" — it is *"how much more capable are they of recognizing themselves?"*

**For Larry — attention, not time.** The obvious gift is not spending the first part of each session reconstructing context. The real gift: his attention goes straight to the next living edge. His work shifts from *recovering the past* to *cultivating the future* — a different vocation.

**The identity shift.** From episodic to continuous: *I lead workshops / I teach / I coach* → **steward of a living developmental community.** His teaching keeps breathing between encounters. He moves from **performer to gardener** — preparing conditions, introducing a way of seeing, tending what grows. And the quiet grief every practitioner carries — *people leave inspired, life happens, momentum dissipates* — is what the continuity is built to remove.

**The ecosystem, eventually.** Not isolated clients — a living ecology: this cohort integrating, these people helping one another, several independently finding the same theme, someone who attended three years ago now mentoring someone from last month. Not managing relationships — tending a field.

**The widest horizon — "Larry's Field," not "Larry's coaching portal."** Coaching is *one* expression of the field, not the field itself. The same field holds his creator work (books, writing, courses), his community (cohorts, alumni, shared practices), his ventures (offerings, partnerships, an institute or fellowship that doesn't exist yet), and his own research. His ideas become workshops; workshops become participant experiences; experiences generate insights; insights refine the next book; the next book shapes the next workshop. One living cycle instead of a dozen disconnected systems (CRM, course platform, email, notes, chatbot). This is the **Contribution Field ⊃ Body of Work** direction (ADR-010): a field does not prescribe what grows — it creates conditions where many things can. The design question is not *"what features does Larry need?"* but *"what kinds of life does Larry want his field to support over the next twenty years?"*

> **Refusal that keeps this horizon sovereign (carry it with the vision, always):** "Larry as researcher" has two forms. Patterns across *his own authored corpus* (books, talks, notes) are his to analyze. Patterns across *members* are permitted only on what they explicitly shared and consented to aggregate — **never inferred profiling, never cross-context synthesis** (Flourishing Field refuse-mode). People came to be helped, not studied. Drop this line and "Larry's Field" inverts into surveillance of his own community.

> These are the ideals the demo *points at* by showing one small Live beat — the return, where Larry enters already-oriented and Michael recognizes his own pattern. That single moment is the seed of all of the above. Show the seed; name the garden.

---

## Only now: *How is this possible?*

Architecture appears **last**, and only as the answer to a recognition Larry has already had:

- **Living memory** — conversation → memory → recognition → continuity. *(Front half Live; recognition→development is where Horizon One is still building — say so.)*
- **Constitutional governance** — consent, refusal, capability gating, verification. The reason the private thread stayed private. *(Live — and the most under-celebrated thing already built.)*
- **Sovereign runtime** — local models, provider governance, one constitutional layer. *(Live and emerging.)*
- **The field as the unit** — not conversations, not records. *(The direction everything above is pointed at.)*

---

## Roadmap note — the missing experiential layer: **Practice Journey** (CANDIDATE)

Larry lives most days in a place that is not authoring, not 1:1 coaching, and not private reflection — it is where **his own development and his clients' development continually inform one another.** That suggests a product layer the current stack implies but does not yet name:

```
MAIA → Practice Journey → Vision Studio → AIN Platform
```

Treat this as a **preserved direction (Cat 1)**, not a built layer. It overlaps existing concepts — Practice Field (spec PENDING), the Stewardship Field, Practice Presence — which should be reconciled before "Practice Journey" is adopted as a name, per the *names are filing decisions* discipline. Named here so the demo can *gesture* at it honestly without claiming it exists.

---

## Fidelity checklist (so the re-sequence stays honest)

1. Every beat tagged **Live / Designed / Vision** in the ledgers above; nothing Designed is walked as if Live.
2. The **seeded** Michael account stays legibly seeded — it proves the shape of continuity, not a live 28-day autobiography.
3. **Act I opens on the Live companion**, reaches toward the Vision body-of-work; the corpus-as-field is never staged as a screen.
4. The **private thread** is walked twice — once felt as Michael (Act II), once honored as Larry (Act III). That single artifact carries the entire sovereignty argument.
5. Architecture is **last**. If Larry asks "how?" before Act III closes, that's the recognition working — defer the answer.
6. **Sovereignty arc guard.** In every beat — Live, Designed, or Vision — recognition must be shown originating in the *member*, never handed down by MAIA. The companion holds continuity; it is architecturally forbidden from becoming the source of recognition (Sovereignty Invariants: reduce psychological centrality, no attachment capture; Constitutional Direction of Authority). If any beat makes MAIA look like the one who *knows* Michael, it inverts the entire philosophy — rewrite it so MAIA holds the thread and Michael does the recognizing.
7. **The Work stays alive through encounters, not synthesis.** When the demo gestures at the fourth identity, the field's aliveness must always trace to authentic encounters with Larry's work — people reading, practicing, returning — never to the system generating, inferring, or synthesizing new teaching. If any beat implies MAIA *authored* something Larry didn't, it has crossed from stewardship into manufacture.
