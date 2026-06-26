# Practice Source & the Architectural Translation Studio — Product Architecture

**Date:** 2026-06-25
**Status:** Product architecture — Vision/Designed direction for the *practitioner-facing* studio. Cat 1 (not authorized to build). The **methodology insight (modality-independence) is usable now**, in the concierge run; the **object + UI below are what you build *after* the methodology validates** (deployment-order discipline).
**Reads with:** `ARCHITECTURAL_TRANSLATION_STUDY_2026-06-25.md`, `JONDI_RUNNABLE_PROTOCOL_2026-06-25.md`, `LEGACY_SESSIONS_SPEC_2026-06-25.md`, `AIN_PRACTITIONER_DEPLOYMENT_SEQUENCE_2026-06-25.md`, `PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md`. **Governed by:** `MARKETING_CLAIM_DISCIPLINE.md`, `MAIA_SOVEREIGNTY_INVARIANTS.md` (esp. 14), `REPRESENTATIONS_AS_ORIENTATION.md`.

---

## The felt center (what every design decision moves toward)

The constitution (§8) says what must never happen. The **felt center** says what every decision moves *toward* — and is the more valuable of the two:

> **This is a place where your life's work can rest, breathe, and continue becoming.**

Notice what is *not* in that sentence: AI, analysis, knowledge, memory, insights, productivity. Those may all exist beneath the surface — but they are **not the experience.**

---

## 0. The realization: Architectural Translation is modality-independent
The methodology operates *above* the input modality. Conversation, voice memo, audio, session recording, journal, book, article, course transcript, video, notes, email, whiteboard photo, existing framework, client worksheet — all are **evidence sources.** The pipeline:

```
Evidence sources (any modality)
   → Representation layer (indexed in her language; verbatim preserved)
   → Reflective dialogue (the integration space)
   → Architectural Translation
   → Domain Definition
```

Reflective dialogue is no longer the only input — it is the **integration space** where all sources are brought together and reflected back. This *strengthens* the methodology: prior work becomes prior evidence, so MAIA can say *"across your workshop transcripts I see three recurring patterns; yesterday's conversation seems to add a fourth — does that fit?"* — far stronger than discovering from scratch, and it spares an experienced practitioner from repeating what she has already written.

**Usable now (no software):** the concierge Jondi run absorbs this *today* — *"bring whatever already exists: your book, recordings, notes."* The facilitator works with her artifacts. Everything below is the *product* form, for **after** the methodology validates — don't build it first.

---

## 1. `Practice Source` — a first-class object
Everything — audio, text, conversation, book, transcript, photo — is one object: a **Practice Source** (not an "upload"). The naming matters: *"I'm sharing another expression of my work,"* not *"I'm feeding the AI."*

Governance is built in **from the start** (this is the `case_memories` gap done right, not a parallel ungoverned store):

| Field | Why |
|---|---|
| source type · date · context | provenance |
| **practitioner authorship** | attribution (= facilitator id) |
| **original wording preserved (verbatim link)** | Invariant 14 — "normalize" = *index/link*, never *rewrite* |
| **consent status** | informed · reversible · honored |
| **contains third party? (client)** | ⚠ the triadic gate — §2 |
| **crossing_allowed** (default FALSE) | may this cross into a client-facing representation? |
| reflection status · influenced-current-representation? · superseded? | the living, revisable representation |

---

## 2. ⚠ The governance landmine modality-independence creates: third-party content
*"Upload your session recordings / client worksheets / coaching emails"* sounds clean — but **those artifacts contain clients who never consented to MAIA processing them.** Modality-independence smuggles the **triadic boundary into Stage 1.**

- **Solo Practice Sources** (her book, journal, solo voice memo, keynote) — the practitioner's own; clean.
- **Client-containing Practice Sources** (session recordings, client worksheets, client emails) — **third parties present → gated on client consent; `crossing_allowed=FALSE`; NOT in the concierge run without it.** This is the same triadic boundary that blocks Stage 3, now reachable at Stage 1 through the back door of "upload everything."

`contains_third_party` is therefore **a gate, not optional metadata.**

---

## 3. The crossings survive the expansion — and some get harder
- **Corpus-derived reflection inherits offer-not-assert — more strictly.** *"Across 20 years I see three patterns"* carries far more authority than a tentative in-conversation reflection; the authority asymmetry makes offer-framing and her-authorship *more* essential. Pattern-mining a corpus easily surfaces patterns *real in the data* but never *load-bearing in her practice* — offering those as "your patterns" is steering by selective summarization.
- **Prior artifacts strengthen the externalization/emergence discriminator** (study §10.3): the corpus is an expanded Week-0 baseline. A pattern in her 15-year-old book is clearly *recovered*; one absent from the whole corpus is a candidate *emergence*.
- **Normalization is interpretive — keep it link-not-rewrite.** "Normalized into practitioner language" must mean *indexed, pointing back to the verbatim original* — never paraphrased into a house style (Invariant 14).

---

## 4. The gumbo (the right metaphor — with one correction)
Better than knowledge-graph / corpus / memory: a gumbo develops over time; ingredients contribute differently; flavor comes from the *interaction*. The operation isn't summarizing each source — it's: **"what becomes visible only when all of these season one another?"**

- **The gumbo is the broth, not the output.** It is the rich internal representation reflections arise *from*; the output is always restrained (*"this distinction first appeared in your April retreat, was refined in three sessions, and today you gave it new language"*). She never has to digest the whole gumbo — MAIA does. **This is `REPRESENTATION_DISCERNMENT` in a kitchen:** high internal richness, disciplined surfacing — serving the whole gumbo is "the dump."
- **Correction (where the metaphor breaks):** in a real gumbo, ingredients dissolve untraceably. Here they **must not.** Every contribution stays **traceable to its source** even as it blends — provenance is non-negotiable. *"Disappears into the broth"* = contributes without dominating, **not** loses its origin.
- **Humility:** a gumbo is *tended*; it simmers; it surprises the cook — closer to the relationship than a system that "analyzes" a practitioner.

---

## 5. The studio (UI/UX) — Vision-tier; not the member companion
The product's primary job changes: from a chat app (*"What would you like to ask MAIA?"*) to an **Architectural Translation Studio** (*"How would you like to share your practice today?"*). Organize the home around **human intentions, not media types**: *I have something to share · I want to reflect · I want to build · I want to remember.* Media (audio/text/PDF/video) become implementation details. Lifecycle as stages, not features: **Express → Collect → Reflect → Recognize → Refine → Integrate → Create.** Navigate by *state of work* (Express / Reflections / Emerging Patterns / Living Framework / Resources / Conversations / History). The software gets **quieter.**

**Two governor boundaries:**
- **This is the practitioner studio — NOT the member-facing companion.** Different product, purpose, and entry point (the companion serves presence / With-Me; the studio stewards a body of work). Don't conflate or retrofit one onto the other.
- **"Emerging Patterns" / "Living Framework" give MAIA's representations *visual authority*.** They must render as **provisional, hers, offered** (M3 — *"a reading, not a verdict"*), or the studio itself becomes a steering device. The offer-not-assert crossing applies at the level of **UI prominence**, not just conversational phrasing.

---

## 6. The felt objective: relief
The emotional experience to optimize for is not efficiency or intelligence — it is **relief.** *"Bring the mess first; we'll help discover what's already alive within it."* The honoring image is a **craftsman's workshop**, not "toys" (toys diminish decades of practice): *"Don't clean the workshop before you invite us in."*

Foundational principles:
1. **Never require practitioners to organize their practice before sharing it.** Organization is the platform's responsibility; expression is the practitioner's. (Record without filing; drop the PDF without tagging; speak an hour without an outline.)
2. **Reflection before organization** — organization *emerges from* understanding.
3. **Reduce the friction between lived practice and authentic expression.** Every feature answers: *does this make it easier to share something meaningful she otherwise might not have?* (= the Integrator charter's "reduce cognitive load or justify it.")
4. **Help her see the possibilities already emerging within her play** — direction emerges from her body of work, never imposed. *(Which may be emergence, consolidation, **or rest** — `MEETING_PEOPLE_WHERE_THEY_ARE`: stillness is co-equal with movement. The platform protects conditions; it does not impose a telos of growth.)*

**Governor tail on #1:** "organization is the platform's responsibility" must not become *authority over how her work is structured.* The platform **proposes** organization; she **disposes.** Same crossing.

**Relief as a Flourishing design criterion** — evaluate every screen: does it reduce the burden of carrying decades alone? easier to express than to organize? leave her lighter? invite play over documentation? Success: *"I don't have to hold all of this in my head anymore — and I can finally see it more clearly."*

---

## 7. The living studio (the temporal dimension)
Legacy is a **relationship, not a project.** *"Sit down → tell your story → complete"* is the wrong shape — the most valuable material arrives *later*: the memory three weeks on, the dream connecting thirty years, the dog-walk realization. So the studio never closes. Not *"complete your legacy"* but *"continue"* it. Open it months later to **"What's alive today?"** — a surfaced memory, a dream, an untold story, a 1998 photo, *"something I don't want to lose"* — brought in with no pressure to organize. Rhythm is **cyclical**: Experience → Capture → Reflection → Recognition → Integration → Life → New Experience. The loop never closes because the person never stops becoming.

**Product constitution principle:** **Nothing meaningful should ever feel like it is too late to add.** A practitioner at 2 a.m. is as welcome as a scheduled session; someone remembering a childhood story twenty years in should feel *"of course this belongs here,"* never *"I already finished that section."* Database wants **completion**; a living studio expects **surprise.**

### 7.1 ⚠ "Tending the garden" is the highest-risk capability — test = *grace vs surveillance*
MAIA *noticing relationships* is the most powerful image here **and** the most dangerous operation: **proactive, interpretive, cross-temporal pattern-surfacing.** The field-test is not *"was it accurate?"* but **"did it feel like grace or surveillance?"** — which reduces to one rule:

**MAIA follows; it does not lead.** Surveillance volunteers the pattern (*"you've mentioned your grandfather three times in six months…"* — true, invasive). Grace waits for *her* to open the thread (*"this reminds me of my grandfather"*) and then **offers to return what's held**: *"You've spoken of him before — would it help if I brought those stories back?"* (Stricter than "proactive but careful": even an accurate, fact-framed, unbidden surfacing *leads.*) Supporting disciplines:
- **Invitation, not intrusion.** Offer the *door*, not the *content*. **"No" must be costless**, and the invitation must never become a recurring nudge (an invitation repeated is a notification; a notification is surveillance by another name).
- **Offer a fact; never assert a feeling.** A verifiable co-occurrence MAIA may surface; *"something feels connected"* both interprets and simulates a feeling MAIA must not project — leave the meaning to her.
- **Rare, or it's a hall of mirrors.** An over-eager gardener manufactures through-lines — Barnum across time. Faithfully tended, the garden is **often silent**; patience is part of fidelity.
- **Candidate, not conclusion.** A connection she then explores can *manufacture* a through-line that was never there. Tag it candidate; let her author whether it's recovered or just-now-made.

### 7.2 The living relationship is with her *work*, not with MAIA
The eagerness — *"I can't wait to bring this here"* — is toward **her own work having a place that receives and freshly reflects it**, not toward bonding with MAIA (the non-attachment vow). The greenhouse is for *her work*; MAIA stays the **gardener/steward, non-central.**

### 7.3 The study takes bounded windows inside the open studio
*"Nothing is ever too late"* governs the **product/relationship** (open, cyclical). The **research** still needs **bounded windows** — the Week-0 baseline must precede; retrodiction needs a fixed reference; a study that never closes can never discharge. Living studio = the open home (Conversation layer); the Jondi study = a bounded observation window inside it (Research layer).

### 7.4 Naming (founder's call)
*"Legacy"* carries **gravity** but a **backward pull** (*what I leave behind*); what's built is *what I'm still growing* → **Living Legacy / greenhouse, not archive.** (Pairs with the gumbo: gumbo = the integrating broth; greenhouse = the living, tended space.) Member-facing surface decision; internal mechanism term unaffected.

---

## 8. The constitution of the room: received, not watched
The deepest design tension is not warmth vs governance. It is **being received vs being watched.** A practitioner must feel *"my work is being received"* — never *"my life is being monitored."*

**Even the internal vocabulary:** speak and design in terms of **receiving, holding, returning, reflecting, stewarding** — not *observing* or *tracking*. (The one honest exception: the *research layer* does **observe** — but as a **bounded, consented act inside a study window**, never the ambient posture. Ambient watching is what "receive, not observe" forbids.)

**The governing sentence:** **The platform waits more often than it speaks.** Silence is allowed; not every pattern needs surfacing; restraint is a feature. The hundred silences are what let the one or two returns — *"I'd forgotten that. Thank you."* — land as **grace** rather than surveillance.

**Relief comes from safety; safety from predictable boundaries.** The room keeps its word: nothing forced · nothing assumed · nothing disappears *without her hand* (she keeps deletion authority) · nothing prematurely organized · nothing meaningful ever too late · nothing deeply personal surfaced without invitation or context.

### 8.1 Remembers without possessing
Possession says *"this is now mine"*; remembrance says *"I'll help you hold this until you need it again."* A **steward**, not a repository — not an AI that "knows" her. Technical correlate: the work is **held in trust** — hers, attributed, exportable, withdrawable (data sovereignty). **The feeling must be architecturally true:** silent retention, training on her work, or withdrawal-friction would make it a lie.

### 8.2 The threshold: the first moment after she entrusts her work
Uploading twenty years is **entrusting a piece of identity.** Not *"Successfully processed 184 documents."* Instead: *"Thank you. I've received them. There's no need to organize anything today. Whenever you're ready, we'll begin exploring them together, at your pace."* ⚠ **It only works if it is true** — if the system mined the corpus in the background while saying "nothing analyzed," the calm message is surveillance in a gentle voice. Either genuinely defer, or be honest that indexing occurred and nothing will be surfaced unbidden.

### 8.3 Surprise only with what they discover
> **Never surprise someone with what the system knows. Surprise them only with what they discover.**
*"Look how much I remembered about you"* centers the system; *"look what became visible when we looked together"* centers her discovery. The system still *offers* material — but **the seeing is always hers, and credited as hers.** It provides the conditions for discovery; it never claims it.

### 8.4 Rooms, not features
Not screens and workflows but a **room**: it receives, has atmosphere, holds silence, doesn't rush, remembers what belongs, doesn't ask you to perform, can be left and returned to. The promise this adds up to — practitioners won't say *"it knows me,"* they'll say:
> **"It helps me come home to my own work."**

---

## 9. The architectural inversion: gift, not fuel
Every metaphor that holds — gumbo, greenhouse, studio, room, home — names **a place where something is cared for, not consumed.** Most software treats input as **fuel** (engagement, models, metrics); this room treats it as a **gift.** Practically: don't interrupt gifts, don't optimize them for engagement, don't immediately classify them, don't exploit them; **acknowledge** them, **care for** them, **return** them when asked. So *"remembers without possessing"* is **hospitality**, not merely a data policy.

**The threshold is relational, not informational.** A home opens with *"Come in,"* not *"What's your objective today?"* (relationship with **the room**, not with MAIA). **Relief, at its root:** *"I don't have to reduce my life's work before I bring it here."* Everywhere else, people compress before they share — summarize, brand, edit, extract. Here: *bring the workshop, the dream, the half-written book, the contradiction, the voice memo from the car, the thing you don't yet understand — we'll begin there.* That makes the room **generous** — and she can **arrive whole.**

**⚠ Guard it in the business model, not just the design.** Generosity is easy to design and hard to keep — software economics pull back toward *fuel.* The felt center survives only if **incentives never make extraction profitable.** The project's **stewardship model** (tiers as degrees of assumed responsibility, *not* engagement-paywalls) is load-bearing here: a gift-framed product on an engagement-maximizing model becomes fuel within a quarter.

---

## 10. The garden: weather, seasons, and the spiral
A garden is a **relationship between a gardener and forces beyond the gardener.** The practitioner is not the sole author — her work is shaped by seasons of life, grief, joy, students, clients, aging, culture, the world: call those **weather.** The studio **stewards an ecosystem**, it doesn't preserve a fixed identity.

- **The practitioner isn't the project — the garden is.** Seasons of flowering, pruning, dormancy, unexpected growth. A good gardener isn't anxious when winter comes; **winter belongs.**
- **Practice is an ecology, not a collection of methods.** Stories nourish the teaching; failures reshape the philosophy; even what "didn't work" becomes compost. *Nothing is waste.*
- **Memory spirals, it doesn't complete.** The same story revisited a decade later by a different person: the record unchanged, the *meaning* moved (Spiralogic at the scale of a life; the record is fixed, the reading is alive — and hers).

### 10.1 ⚠ Weather is *received*, not *diagnosed*
"Weather" is a posture for how the **room behaves**, not a state MAIA **reads back to her.**
- **Received (grace):** on a heavy day, gentler, shorter, no push, nothing to complete. It **adjusts without announcing.** (*"Not in words, but in the way it behaves."*)
- **Diagnosed (surveillance):** *"you seem to be in grief today"* — asserts a feeling (§7.1) and watches rather than receives. Forbidden.

She authors her own weather and may name it; MAIA does not announce her interior to her. **Concrete consequence — "winter belongs" forbids re-engagement nudges:** *"you've been quiet lately — come back!"* is the engagement-fuel reflex wearing concern. The garden isn't anxious when she's away; it is simply **there when she returns.** No streaks, no nudges.

### 10.2 The sentences for the heart
> **This is a living garden, not an archive. It grows with you, changes with the seasons of your life, and is shaped by the weather you cannot control as much as by the hands that tend it.**

> **Nothing you bring here has to justify itself today. Some things are seeds. Some are blossoms. Some are compost. All of them belong to the life of the garden.**

---

## 11. Ontology, phenomenology, and the three levels
The room operates at **three levels**, and the system *knows* only the first:
- **The Garden** — the whole living body of work and the relations among its parts. *This* the system holds (she gave it the artifacts).
- **The Seasons** — long arcs (apprenticeship, mastery, loss, renewal). **Not detected — gradually revealed** over years.
- **The Weather** — the lived experience of *today.* Not *what* or *who* she is — *"How shall this room receive you today?"* The room needn't **know** it; it needs to be **capable of responding if she reveals it.**

This grounds receive-not-diagnose in a principle: **Seasons and Weather are phenomenology — first-person, revealed, never measured.** The system has no business *inferring her state or life-stage*; it provides the garden and **receives what she reveals.**

### 11.1 Elements: the language of expression, not assessment
Fire / Water / Earth / Air are **not personality types** and not a diagnosis. They are **her language for experience** (*"today feels like fog," "I have so much Fire I can't sleep"*). The room meets her in the language she chose; it never replies *"your dominant element is Fire."* **For the live conductor:** reading her *expressed* register to **respond in kind** is legitimate (receiving); asserting an assessment *back* is not; **her declared elemental language overrides the system's read** (Invariant 14).

### 11.2 Microclimates
Some memories become shelter, some nourishment, some lie dormant for years, some bloom after decades. **The platform doesn't decide which — life does** (the role is revealed by her living, not assigned by the system).

### 11.3 Ecological, not human
This retires an old question — *"how do we make the AI feel more human?"* The room should feel **ecological**, not human: natural systems don't hurry, don't optimize every interaction, don't demand continuous productivity; they make room for cycles, dormancy, surprise, return. This honors the vows — a *human-feeling* AI invites attachment/bonding (refused); an *ecological* room invites **return without bonding.** Guidance: don't interrupt dormancy · don't reward constant activity · don't assume every seed sprouts now · don't prune because nothing bloomed · don't mistake winter for failure.

### 11.4 The companion principle
> **The platform waits more often than it speaks** *(time)* — **and receives more often than it responds** *(posture).*

The deepest inversion: most software is designed to be **the most active thing in the room.** Here, the **living work itself is the protagonist**; the technology tends conditions and stays in service. (This is the Sovereignty Invariant — *reduce the system's psychological centrality over time* — as a felt design principle.)

---

## 12. The epistemic constraint (engineering form)
*"Ontology belongs to the work; phenomenology belongs to the person"* and *"model the conditions, not the person"* are operationalized in **`PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md`** — the reification line (the sin is *promotion*, not inference), Room State vs Person State, the per-field code-review tests, "psychological centrality" given a measurable substrate, and the `member_spiral_state` audit methodology. Refined heuristic: **persist obligations for the room before attributes of the member.**
