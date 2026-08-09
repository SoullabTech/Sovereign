# Now What? — World-Class UI/UX Refinement & Deployment Strategy

**From dashboard grammar to leadership environment.**
Written against what production renders (`soullab.life/now-what`, `95b21ce42`), screenshot
2026-08-04. Founder design direction + implementation and deployment plan.

> **Admission:** the preceding session produced 14 commits of governance and **zero design
> change.** The architecture matured; the UI still speaks the old language.
>
> **The next work is not invention. It is translation** — turning the architecture we spent
> weeks clarifying into an interface that feels inevitable.

---

## North Star

| ⛔ Current | ✅ Desired |
|---|---|
| *"Your coaching information lives here."* | **"Your leadership journey continues here."** |

> Make Now What? feel like **the place a successful person returns to after the achievement** —
> a private leadership environment where their next evolution unfolds.
>
> ⛔ Not a coaching portal. Not a task manager. Not an AI app.

The interface must embody the movement:

```
Achievement → Reflection → Integration → Practice → Flourishing
```

### The model correction

```
⛔ CURRENT              ✅ CORRECTED

Navigation              Relationship
    ↓                        ↓
Rooms                   Your Work
    ↓                        ↓
Cards                   Reflection
    ↓                        ↓
Actions                 Practice
                             ↓
= SaaS dashboard        Continuation
                        = a private leadership field
```

**The user does not navigate features. They return to their work.**

---

## PART 1 — Diagnosis against the live screen

### D1 🔴 The top navigation row — the single biggest UX error

```
Home │ Session room │ Your field │ Where you are │ Questions you're living │ What may be next
```

**It forces the user to understand a conceptual taxonomy before they understand the
environment.** It is also the original defect unfixed — the redesign removed six *sections*
and left six *tabs* — and it contradicts a ruling already made: *the Client Field is not
another destination.*

### D2 🔴 There is no centre — MAIA has no presence

**No conversation doorway exists anywhere on the page.** The member can read their material
and cannot continue it. Conversation is being treated as a feature; **MAIA is the companion
field.** The most consequential gap on the screen, and not a visual one.

### D3 🔴 There is no "Continue"

Every great product has a heartbeat — *continue watching, continue reading, continue editing.*
Now What? has none. A returning executive is given a filing cabinet, not a thread.

### D4 🔴 The page is an inventory of absences

Four of five panels say a variant of *"Nothing is held here yet."* The member scrolls a
well-typeset list of what they **do not have.** The *empty layers do not render* fix sits on
`78358f979` and is **not deployed.**

### D5 🔴 The three titles are semantically indistinguishable

| Eyebrow (11px, faintest text in the panel) | Title (24px) |
|---|---|
| MY JOURNEY | What you are working **on** |
| DECISIONS | What you are working **through** |
| COMMITMENTS | What you are **practising** |

*Working on* vs *working through* is a preposition apart. **The eyebrow carries the meaning and
is the smallest text — the hierarchy is inverted.**

### D6 🟠 Governance copy leaking into the member surface

*"Nothing here recommends, ranks or decides."* *"nothing tracking whether you complied."* Five
panels of defence, then a sixth restatement in `RoomTrustCopy` — reassurance against an
accusation the member never made.

### D7 🟠 One action on the page · D8 🟡 uniform visual weight

`Work a decision through →` is the only affordance in a full screen. Identical radius, border,
padding and gradient throughout: no entry point for the eye, so the page reads as a wall.

---

## PART 2 — The redesign

### C1 — The hearth: arrival should feel like entering a private room

```
Welcome back, Kelly.

Your leadership work continues here.

The decisions you are carrying.
The practices you are growing.
The questions that are shaping what comes next.
```

The person should immediately understand: **this belongs to me · this remembers what matters ·
nothing is judging me · something meaningful is waiting.**

### C2 — "Continue" becomes the central interaction ⭐ the heartbeat

```
Continue where you left off

You were exploring:

  "How do I lead without carrying everything myself?"

                                    Resume conversation →
```

⭐ This is the strongest single move in the redesign. It converts the Home from a **record** into
a **thread**, and it is what makes the environment feel like it was waiting for them.

### C3 — MAIA as presence, not a button

```
────────────────────────────────────

     What is alive for you today?

          Continue with MAIA

────────────────────────────────────
```

Quiet. Inviting. ⛔ Not chatbot-like. The member should always sense *"I can return here and
continue."*

### C4 — Cards become living areas

| ⛔ Current | ✅ Refined |
|---|---|
| MY JOURNEY · *What you are working on* | **WHAT IS ALIVE** · *The work currently asking for your attention* |
| DECISIONS · *What you are working through* | **DECISIONS YOU ARE LIVING WITH** · *The choices becoming clearer* |
| COMMITMENTS · *What you are practising* | **THE LEADER YOU ARE BECOMING** · *The qualities you are choosing to embody* |

The system is not *tracking* decisions. It is **holding** them.

### C5 — Navigation reduced to four

```
✅  Home  ·  Your Work  ·  Your Growth  ·  Your Conversations
```

Deeper areas appear naturally, reached from content. ⛔ Never six concept-tabs.

### C6 — Editorial typography, not UI labelling

| ⛔ | ✅ |
|---|---|
| `SESSIONS` / *Continuity between conversations* | **Between conversations** <br> *The thread continues.* |

Large statements, less chrome. Invert the current hierarchy so the eyebrow's meaning becomes
the heading.

### C7 — Visual direction

| ⛔ Away from | ✅ Toward |
|---|---|
| dark repeated cards · many borders · boxed information · CRM · productivity app · analytics | private executive retreat · luxury journal · modern monastery · high-end advisory environment |

```
⛔  card        ✅  thought
    card            space
    card            reflection
                    space
                    invitation
```

Three weight tiers: **live work** (full treatment) · **available** (single line + inline door,
no panel) · **dormant** (not rendered). Nothing renders as a dead end.

### C8 — The product adapts by state

A world-class environment does not always show the same page.

| State | Arrival |
|---|---|
| New member | *Welcome. Let's discover what matters.* |
| Active coaching | *Your current leadership edge.* |
| Post-achievement | *What is calling you forward?* |
| Transition | *What wants to change?* |

⚠️ **See CC3 — this is the most seductive idea here and the easiest place to breach a ruling.**

---

## PART 3 — 🔴 Three constitutional checks

Not objections to the direction. These are the three places the new design can **silently
violate rulings already made** — cheap now, expensive later.

### CC1 — "What is alive" must be member-declared, never derived

If themes are computed, the surface becomes a **system-voiced finding**, which this room
explicitly refuses (*no "theme detected", no third voice narrating the member to themselves*).

> ✅ *"You have been exploring:"* is safe **only if the member said so.**
> ⛔ If inferred, it renders as *"Possible reflection"* — or not at all.

### CC2 — "What comes next" must not manufacture direction

Ruled: **`Next` composes ONLY from time-bound events · explicit sequence · member-declared
continuation. There is no fourth source.**

> **The system may reveal momentum. It may not manufacture direction.**

### CC3 — 🔴 State-adaptive arrival must not infer the member's developmental phase

*Post-achievement* and *Transition* are **characterisations of a person's life stage.** If the
system decides which one a member is in, it has done exactly what the architecture forbids:
manufactured higher-order meaning about them, and moved authority downward instead of upward
through authored experience.

| ✅ Permitted | ⛔ Refused |
|---|---|
| the member names their own phase | the system infers it from activity, tenure or content |
| the phase is a **lens the member can change or remove** | the phase becomes an identity the member cannot see or edit |
| ⚠️ practitioner-placed, **attributed and provisional** — *"placed by your coach — yours when you say so"* | practitioner-placed and silent |

⭐ **Ship C8 with a member-declared phase or ship the neutral arrival.** ⛔ Do not ship an
inferred one.

---

## PART 4 — Executive Flourishing: where Now What? differentiates

Most executive coaching stops at performance, goals, capability. Now What? begins after.

```
Achievement → Reflection → Integration → Meaning → Flourishing
```

| ⛔ | ✅ |
|---|---|
| *"Become a better leader."* | **"You have built something. What is asking to emerge next?"** |

This is Larry's doorway. ⛔ **It is a lens, not the environment** — visible through language,
prompts, reflections and practices. Per the ruled vocabulary architecture:

> ⛔ *"This is what your leadership means."* ✅ *"Here is a way to explore your work."*

**The member remains primary.**

---

## PART 5 — Deployment

### Position

| | |
|---|---|
| Production | `95b21ce42` — six tabs · all empty layers render · no MAIA door · no Continue |
| Phase 1 branch | `78358f979` — fixes D4 only · not deployed · **not authorized for promotion** |
| Governance | `chore/client-field-completion-rulings` — docs only |

### Phases

**Sprint 1 — Visual experience upgrade. No backend changes.** Home layout · hearth/arrival ·
**Continue thread** · **MAIA presence** · typography · navigation · cards → living areas ·
empty states · hierarchy.
**Deliver: a person understands the place in 10 seconds.**

**Sprint 2 — Living data.** Conversations → themes → decisions → practices → flourishing.
⛔ No AI-generated interpretation unless explicitly offered. See CC1/CC2.

**Sprint 3 — Larry's Executive Flourishing lens.** Vocabulary · invitation flow · practitioner
relationship layer. ⛔ Only after the universal experience works.

**Sprint 4 — Pilot walk.**

### Ship order inside Sprint 1 — smallest blast radius first

```
S1a   empty layers + arrival copy          text/render only · reversible
S1b   typography + living areas            no data-path change
S1c   Continue thread + MAIA presence      new surface, no new capability
S1d   navigation reduced to four           largest change · land it last
```

⛔ Do not ship S1d first despite D1 being the root defect — land it against a Home that is
already clean.

### Per-slice gate, then immutable-SHA deploy

```bash
npm run typecheck && npm run preflight
```

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
```

⛔ Never the bare compose command — it fails at the deploy-lane tripwire. Verify after each
slice; must equal the deployed SHA, never `unknown`:

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
```

### 🔴 Two gating facts the sprint plan must absorb

1. **Sprints 1–3 move the tree and invalidate the walk referent `78358f979`.** Correct and
   intended: Sprint 4 walks the *fixed* surface and the referent is re-derived at the new SHA.
   A participant must not spend their one unrepeatable first impression rediscovering D1–D8.
2. ⛔⛔ **Client entry is blocked independently of D9.** The Larry materials agreement is
   **unsigned**: *"nothing moves — no book ingested, no client enters — until both versions
   are signed."* **Larry's own walk is not blocked by it. Clients are.**

---

## Definition of done

⛔ Not *"Do you like the design?"*

> ✅ **"Did you forget you were using software, and feel like you were continuing your work?"**

Underneath it: *does a successful executive feel this is a place where the next chapter of
their leadership can unfold?*

---

## Not authorized here

- ⛔ No promotion of `78358f979` as-is — it fixes D4 only.
- ⛔ No relaxation of a vow. Relocating trust copy is not weakening it; the guarantees stay
  enforced in payload and schema.
- ⛔ No derived themes, emergent "next", or inferred developmental phase — CC1 · CC2 · CC3.
- ⛔ No client entry before the agreement is signed.
