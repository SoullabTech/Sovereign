# Wisdom Fields — Information Architecture

> Soullab is the invisible architecture. The fields are the entry point.

**Status:** Design complete — ready for Phase 1 implementation
**Depends on:** `WISDOM_KEEPERS_FIELDS_SPEC.md` (data model), Circles system
**Last updated:** 2026-03-19

---

## Community Navigation — Expanded Structure

```
Community
├── Circles                   /commons/circles          (existing)
├── Wisdom Keepers Fields     /commons/fields/wisdom    (new — past masters)
├── Master's Fields           /commons/fields/masters   (new — living thinkers)
├── Dialogues                 /commons/dialogues        (Phase 2)
├── Study Cohorts             /commons/cohorts          (Phase 2)
└── Living Library            /commons/library          (Phase 3)
```

For Phase 1, the nav surfaces:
- **Circles** (existing)
- **Wisdom Keepers** (past masters — Jung, von Franz, Steiner, Rumi, etc.)
- **Master's Fields** (living thinkers — McGilchrist, Kimmerer, Maté, Macy, etc.)

These are three distinct entry points in the CommunityLink nav and the `/community` hub page.

---

## The Two Field Types — Final Distinction

### Wisdom Keepers Fields
For thinkers whose work has entered the shared cultural inheritance.

> The point is not to simulate the master, but to create a living commons around their work.

AI posture: **contextual** — MAIA can explore ideas alongside members. Never speaking as the master. Always returning to the primary source.

### Master's Fields
For living thinkers, teachers, and culture-shapers where the relationship requires greater ethical precision.

> This field is a place to study, reflect, and gather around the work of this thinker. The intelligence here arises through the community's encounter with the work itself.

AI posture: **none** — MAIA is architecturally silent. No LLM path exists within the field context. Community is the only intelligence.

---

## Field Page Structure — Information Architecture

Every field has six sections, accessible via a tab or section nav:

```
/commons/fields/[slug]
├── Home          — who this master is, why this field, essential themes
├── Key Works     — books, lectures, interviews, archival material, entry points
├── Core Ideas    — curated concept map (steward-maintained)
├── Reflections   — community contributions (reflections, questions, integrations)
├── Circles       — sub-circles active within this field
└── Stewards      — who holds this field
```

### Section 1: Field Home

**Left / main column:**
- Master's name + dates + domain (e.g. "Analytical Psychology, Alchemy, Myth")
- A brief orientation paragraph (human-written by field steward, not AI-generated)
- 3–5 essential themes (not a full index — just the gravitational center)
- "Why this field matters now" — one paragraph on the contemporary relevance
- Field AI posture note (transparent, non-apologetic):
  - Wisdom Keepers: *"MAIA can explore this work alongside you. She does not speak as Jung."*
  - Master's Fields: *"MAIA is quiet here. This field belongs to the community and to [Master]'s work."*

**Right / sidebar:**
- Member count + active circles count
- Recent activity (last 3 contributions, timestamped)
- "Enter this field" CTA (joins field if not already a member)
- Steward names + avatars

---

### Section 2: Key Works

A curated catalog — not a content library. A map to the primary source.

**Structure per work:**
```
Title          — The Master and His Emissary
Year           — 2009
Type           — book
Description    — [2–3 sentences: what it opens, why it matters, who it's for]
Where to find  — [publisher / archive / official site link]
Entry point?   — Yes / No  (steward flags newcomer-accessible works)
```

Filtering: by type (book / lecture / essay / interview), by entry point status, by theme tag.

**Steward note on works:**
The catalog is a guide to the primary source. It does not replace it. Members are expected to engage with the works directly — community reflections should arise from real encounter, not summaries.

---

### Section 3: Core Ideas

A distilled concept map maintained by field stewards. Not a glossary. Not a Wikipedia summary. A living orientation — the essential structures of the thinker's contribution.

**Format per idea:**
```
Concept name   — Individuation
One line       — The lifelong movement toward wholeness through integration of the unconscious
Body           — [3–5 sentences that orient without flattening]
Related ideas  — Shadow, Self, Persona, Alchemy
Related works  — [1–2 works where this is developed]
```

**Pilot concept maps:**

*Carl Jung — Wisdom Keepers Field:*
- Shadow
- Individuation
- Self
- Persona
- Anima / Animus
- Symbol
- Synchronicity
- Psychological types
- Alchemy as inner process
- Psyche and myth

*Iain McGilchrist — Master's Field:*
- The divided brain (hemispheric asymmetry)
- The Emissary and the Master
- Attention as ontology
- Participation vs. representation
- Living vs. mechanical reality
- Metaphor and meaning
- The Master's betrayal
- Re-enchantment

*Joanna Macy — Wisdom Keepers Field (bridge figure):*
- The Work That Reconnects
- Active Hope
- The Great Turning
- Dependent co-arising
- Gratitude, Honoring Pain, Seeing with New Eyes, Going Forth
- Ecological grief as gateway
- Mutual causality

---

### Section 4: Community Reflections

The living layer. Where the community metabolizes the work.

**Contribution types:**
| Type | Prompt |
|------|--------|
| `reflection` | "Something in this work opened, disturbed, or confirmed something for me..." |
| `question` | "A question this work raises — not seeking an answer, holding the inquiry..." |
| `integration` | "How this work has entered my lived experience..." |
| `application` | "How I've used this in practice — therapeutic, creative, relational, ecological..." |

**Display:**
- Chronological by default, filterable by type
- Each contribution shows: member name (or "anonymous in this field"), type tag, date, body
- Community replies threaded below (no voting, no ranking)
- Member can retract their contribution at any time

**What is not allowed:**
- AI-generated contributions (prohibited — contributions must be member-authored)
- Promotional content
- Claims of authority over the master's meaning
- Flattening the work into motivational clichés

Stewards can remove contributions that violate field integrity. No explanation required — stewards hold the tone.

---

### Section 5: Circles

Sub-circles that form within the field, focused on:
- A specific work ("Reading *The Master and His Emissary* together")
- A theme ("Shadow work — a 6-week circle")
- A practice ("Active Hope practices — ongoing")
- A dialogue series ("What does individuation mean in an ecological crisis?")

**UI:**
- List of active circles within this field
- Each shows: name, facilitator, member count, rhythm (weekly / lunar / open), open or invite-only
- "Start a circle in this field" — spawns a new Circle linked to this field via `wisdom_field_circles`

Circles use the existing consent-governed Circle system. The field link is additive — circles retain their own privacy, consent architecture, and lifecycle.

---

### Section 6: Stewards

Who holds this field.

- Names + brief bio (optional)
- Role: Steward (curator), Contributor (active member), Reader (can view)
- Contact path: "Reach the stewards" (within-platform message, not email)

Steward responsibilities:
1. Write and maintain the orientation paragraph and Core Ideas
2. Curate the Key Works catalog
3. Hold the tone — remove contributions that don't serve the field's integrity
4. Welcome newcomers (optional — but modeled in pilot fields)
5. NOT: moderate ideologically, enforce interpretive orthodoxy, or speak for the master

---

## First-Time Entry Experience — The 60-Second Journey

This is where the model either clicks or doesn't.

Someone arrives at `/commons/fields/carl-jung` for the first time. What they encounter in 60 seconds must do four things: orient, welcome, invite action, and not overwhelm.

### Seconds 0–15: Orientation

**What they see:**
- Master's name in clean, unhurried type
- Dates and domain — brief, factual
- One sentence: "Carl Jung (1875–1961) — Analytical Psychology, Alchemy, Myth"
- The orientation paragraph (3–5 sentences, human-written):
  > "Jung opened a map of the psyche that took seriously what modernity had discarded — dream, symbol, shadow, and the deep patterns that move beneath conscious life. His work doesn't offer answers so much as a way of asking better questions. This field gathers people who are working with his ideas — not as an intellectual exercise, but as a living practice."
- Essential themes as quiet labels: Shadow · Individuation · Symbol · Alchemy · Psyche and Myth
- Member count + active circles — "34 members · 3 active circles"

**What they don't see:**
- Sign-up prompts
- Subscription walls
- AI introductions
- Onboarding wizards

---

### Seconds 15–35: The Invitation

A single, unambiguous call to action:

**Button:** "Enter this field"

Below it, in small type: "Free to join. No commitment required."

For authenticated members who are not yet in the field, this is a one-click join.
For unauthenticated visitors, this opens a lightweight sign-in / create account flow.

After joining, the button becomes: "You're in this field" (with a quiet checkmark).

---

### Seconds 35–60: First Look Around

After joining (or while still deciding), the page settles into its resting state:

**Above the fold:**
- The three most recent community reflections — brief, real, varied (one reflection, one question, one integration)
- Each shows member name, type tag, first 80 words, "Continue reading"
- These are the signal: *this is what people do here*

**Sidebar (or below on mobile):**
- "New to Jung? Start here" → a Key Works entry point for newcomers (flagged by steward)
- Active circles: the 2–3 circles currently accepting members
- A quiet prompt: "Have something to bring?" → link to the Contribute form

---

## Day One Available Actions

What a new field member can do on their first day. These are the only actions. No more, no less.

| Action | Where | Description |
|--------|-------|-------------|
| Read the orientation | Field Home | Understand what this field is |
| Browse Key Works | Key Works tab | Find where to start with the work |
| Read Core Ideas | Core Ideas tab | Orient to the essential concepts |
| Read community reflections | Reflections tab | See what others are bringing |
| Bring a reflection / question / integration | Reflections tab | Contribute their own |
| Reply to another member's contribution | Reflections tab | Begin to connect |
| Browse active circles | Circles tab | See what groups are forming |
| Join a circle | Circles tab | Enter a smaller, more intimate space |
| Start a circle | Circles tab | Propose a new gathering |

**What is NOT available on day one:**
- Becoming a steward (earned, not immediate)
- Editing Core Ideas or Key Works (steward-only)
- AI conversation within the field (for Wisdom Keepers fields, this comes naturally through MAIA — but the field itself doesn't prompt it)

---

## The Growth Loop (by design, not manipulation)

```
1. ATTRACTION
   "I want a place to explore Jung / McGilchrist"
   → Arrives via search, referral, or resonance
   → Enters field in 60 seconds without friction

2. ENGAGEMENT
   Reads others' reflections → Feels something
   Brings a reflection of their own → Receives a reply
   Joins a circle → Smaller, more intimate

3. DEPTH
   Cross-field patterns begin to appear:
   Shadow (Jung) ↔ Left-hemisphere dominance (McGilchrist)
   The Work That Reconnects (Macy) ↔ Active imagination (Jung)
   "There's something connecting all of this."

4. INTEGRATION
   Members start mapping their own experience
   Contributions become more personal, more specific, more useful to others

5. CONTRIBUTION
   They host circles
   They add to Key Works
   Some become stewards

6. EXPANSION
   They invite others who resonate with the same masters
   → Loop begins again
```

**The moment Spiralogic emerges:**
Not as an introduction. Not as a sales pitch. As a quiet recognition when members begin noticing recurring structures across fields. The platform can gently name it — "We call this pattern..." — but only when the member is already feeling it.

---

## Pilot Fields — Phase 1

Three fields that demonstrate the full model.

### 1. Carl Jung — Wisdom Keepers Field
- Type: `past_master` / AI posture: `contextual`
- Why first: most widely known, deepest existing community library (`JUNGIAN_ALCHEMY_FRAMEWORK.md`), the natural ancestral field for MAIA's own framework
- Core Ideas: Shadow, Individuation, Symbol, Self, Alchemy, Psyche and Myth
- Entry point works: *Man and His Symbols*, *Memories Dreams Reflections*, *Modern Man in Search of a Soul*

### 2. Iain McGilchrist — Master's Field
- Type: `living_master` / AI posture: `none`
- Why second: demonstrates the ethical precision of the living master design; his work is the most important contemporary frame for what MAIA is responding to
- Core Ideas: The Emissary and the Master, Attention as Ontology, Participation, Re-enchantment
- Entry point works: *The Master and His Emissary* (dense), *The Matter with Things* (later, wider), YouTube lectures (more accessible first)

### 3. Joanna Macy — Bridge Figure
Options: Macy (ecological grief + activism) or Marie-Louise von Franz (Jungian alchemy — closer to existing library)

Recommendation: **von Franz** as third pilot
- Type: `past_master` / AI posture: `contextual`
- Why: directly extends the Jung field; `JUNGIAN_ALCHEMY_FRAMEWORK.md` already exists; her work on fairy tales and alchemy maps naturally to MAIA's symbolic language
- Macy as fourth field (she's living, AI posture would be `none`, different register)

**Triad logic:**
- Jung → depth psychology, the individual psyche, shadow and wholeness
- McGilchrist → the divided mind, attention, what modernity has lost
- von Franz → the symbolic imagination, alchemy, the fairy tale as psychological map

These three already speak to each other. Members in all three will feel the resonance without being told to.

---

## What Does NOT Belong

This is as important as what does.

**Not content farms.** The Core Ideas section is not a Wikipedia mirror. It is a living orientation maintained by stewards who have sat with the work.

**Not AI-generated contributions.** Every reflection in the Reflections tab is a real person's real encounter with the work. This is non-negotiable and should be stated in the field guidelines.

**Not shallow summaries.** The Key Works catalog points toward works; it does not replace them. No "Jung in 10 minutes" content.

**Not fan pages.** The field is not an admiration space. It holds the tension — where the work is wrong, incomplete, or in need of evolution is as important as where it is right.

**Not interpretive orthodoxy.** Stewards hold tone, not doctrine. Members are free to challenge, question, and extend the work.

---

## Phase 1 Implementation Scope

What ships in Phase 1:

**Infrastructure:**
- DB migration (all six tables from WISDOM_KEEPERS_FIELDS_SPEC.md)
- `lib/wisdom-fields/types.ts` + `fieldService.ts`
- `app/api/wisdom-fields/` — field, membership, works, contributions, replies endpoints
- Seed data: Jung, McGilchrist, von Franz fields (steward-authored content)

**UI:**
- `/commons/fields` — directory page (two columns: Wisdom Keepers / Master's Fields)
- `/commons/fields/[slug]` — field page with all six sections
- Contribution form (type selector + body + optional work link)
- Reply UI (threaded, simple)
- "Enter this field" join flow

**Community nav:**
- CommunityLink updated: adds Wisdom Keepers + Master's Fields
- `/community` hub page: adds field cards to the community section

**Not in Phase 1:**
- Cross-field pattern detection / Spiralogic emergence layer
- Living Library
- Study Cohorts
- Dialogues section
- AI engagement within field context (even for Wisdom Keepers — keep Phase 1 human-first)

---

*This document governs the information architecture. The data model is in WISDOM_KEEPERS_FIELDS_SPEC.md.*
*Implementation begins with Phase 1 scope only.*
