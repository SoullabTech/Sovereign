# Now What? — Practice Workspace Design

**2026-08-02** · Lane `feature/now-what-client-home-pilot` · trunk `c0c8b0ba6`
⭐ **Supersedes the v1/v2 artifact split.** `…CLIENT_HOME_V1_AVAILABLE_NOW.md` survives as the
build-scope note; `…CLIENT_HOME_SUBSTRATE_BOUNDARY.md` survives unchanged as the substrate truth.
No separate "v2" document — the future sections live here, in one design.

---

## 0. The design principle

> # Familiar outside. Transformative inside.

The architecture has been protecting against becoming a coaching CRM. That is correct. **The
opposite failure is equally real:**

> ⚠️ **A beautiful, philosophically coherent environment that Larry cannot immediately understand is
> not a product.**

Larry is not arriving thinking *"I need a developmental relationship operating system."* He is
thinking: **"I have clients. I coach them. I need to help them between sessions. I need to know where
people are, what they're working on, and what I need to do next."**

⛔ **The bridge is not to remove sophistication.** It is to **use familiar mental models as the
doorway into a deeper environment.**

| Layer | Vocabulary |
|---|---|
| **Surface — what you see in 30 seconds** | Clients · Programs · Sessions · Notes · Assignments · Calendar · Resources · Follow-ups |
| **Interior — how those things behave** | relationship · Field · continuity · authorship · sovereignty · MAIA |

⭐ **The adoption path:** *"I understand this in 30 seconds"* → six months later → *"this has changed
how I coach."*

⛔ **The danger is designing for the philosopher while Larry is trying to run a practice.**

---

## 1. Naming — architectural accuracy is not a doorway

| ⛔ Architecturally accurate | ✅ Larry's doorway |
|---|---|
| "Practitioner Field" | **Larry's Practice** / **Client Workspace** |
| "Developmental environment" | **Your work with Larry** |
| "Member Field" | **Your reflections** |

A CEO/executive coach expects a practice, a client list, and a place per client. Give them that. The
depth appears in *behaviour*, not in *labels*.

---

## 2. Larry View — familiar coaching operations

```
Larry's Practice
│
├── Clients
│     ├── Senja
│     │     Overview      ← who, where, what's live
│     │     Program       ← journey + stage
│     │     Sessions      ← past + next
│     │     Commitments   ← what she's working with
│     │     Notes         ← private + what he's offered
│     │     Resources     ← what he's shared
│     │     Timeline      ← the arc
│     ├── Client B
│     └── Client C
│
├── Sessions        (across clients)
├── Programs        (his offerings)
└── Follow-ups      (what needs him)
```

**Immediately legible.** Nothing here requires explaining a philosophy.

⭐ **Where the interior shows through:** the practitioner **understands the person's development**
rather than managing tasks. No completion percentages, no engagement scores, no attrition flags —
because `coach_*` carries none, by ruling. The absence of CRM metrics is what makes it feel like
attention rather than administration.

---

## 3. Client View — familiar personal workspace

```
Your work with Larry

Executive Leadership Journey

Current focus:
Building your next chapter

Next session:
August 14

Things you're working with:
  · Commitment
  · Practice
  · Reflection

[ Continue ]
```

A normal person understands this instantly. ⛔ Not *"your developmental environment."*

---

## 4. ⭐⭐⭐ The translation table — same doorway, different interior

This is where the product actually differs. **The nouns are familiar; the verbs are not.**

| A normal coaching platform says | **Now What? says** |
|---|---|
| Here are your tasks | **Here is what is alive in your work** |
| Complete assignment | **Continue the practice you chose** |
| Notes from coach | **What Larry offered you to work with** |
| Progress: 60% | *(nothing — the system does not score development)* |
| Overdue | *(nothing — a practice is not late)* |
| Your coach assigned you… | **Larry offered…** |

⭐ **Every row is the same information under a different relationship to the person.** The left column
positions the person as a task-executor; the right positions them as the author of their own work.

⛔ **Never adopt left-column vocabulary for convenience.** It is the single fastest way to become the
CRM this architecture exists to avoid — and it will not read as a small copy choice to the member.

---

## 5. "Your Coaching Space" — the section model, filled gradually

⭐ **The UX should not expose missing architecture.** The organizing concept is a *space* with
standing sections, not a feed sorted by author:

| Section | Contains | Substrate today |
|---|---|---|
| **Current Work** | program · focus · commitments | ✅ available |
| **From Larry** | offered practices · resources · reflections | 🔴 deferred |
| **Your Reflections** | the client's Field | ✅ available |
| **Next Session** | calendar · preparation | ⚠️ partial (dates only, no preparation) |

⭐⭐ **The design is complete at four sections; the build fills them gradually.** Designing all four
now is what stops "From Larry" being retrofitted later into a layout that never anticipated it.

### 5.1 The one honesty constraint that survives the redirect

⚠️ Designing the section ≠ shipping an empty one.

> **A rendered empty container is a claim that the channel exists.**

So: **the section is designed and holds its place in the layout; in the pilot build it is not
rendered until it has content.** That is different from my earlier ruling that it be *conspicuously
absent* — the redirect is right that a visible hole is its own kind of dishonesty about the product's
intent. The resolution is that the person never sees a promise the system cannot keep, **and** the
layout is not reorganized when the channel opens.

⚠️ **This must be reported in the pilot result:** during the Client Continuity Pilot, nothing from
Larry can arrive, so the only thing waiting on return is what the client left. Real result, narrower
claim.

---

## 6. Authorship without navigation by author

*"From Larry"* is legible as a **section** inside a coaching space. It is **not** legible as the
organizing principle of the whole surface — a person does not experience coaching as an inbox sorted
by sender.

> **Preserve authorship without making the person navigate authorship labels.**

Authorship appears **at the item** (*"Larry offered this"*), and as **one section** among four — never
as the page's top-level structure.

---

## 7. What each view must prove

**Larry, in 30 seconds:** who my clients are · where each one is · what they're working on · what
needs me next.
**Client, in 30 seconds:** who I'm working with · what journey I'm in · what's alive for me · one way
to continue.

**Signature test (unchanged):** a client leaves for two weeks, returns — *"here's another app"* or
**"something I began is still here"**?

⭐ **The relationship between the two views is the innovation.** Same underlying reality, two
authorized perspectives, neither a copy of the other — and per the standing question, still unruled:
whether the client's journey is a *projection* of the practitioner's process object or a co-equal
object the client also authors.

---

## 8. Constraints that do not bend for legibility

Familiar vocabulary changes the **doorway**, never the **boundaries**:

- ⛔ `coach_client_selected_focus` has no `relationship_id` — the client's declared focus is **not**
  visible to Larry, whatever a familiar layout would suggest.
- ⛔ The system does not decide developmental position, score progress, or generate a next step. Only
  a **person** authors a next step.
- ⛔ Larry's private notes never appear on the client surface.
- ⛔ No new content-bearing tables — including titles, labels, reasons, or generic JSON.
- **MAIA is a resident, not the house.**

Related: `…CLIENT_HOME_SUBSTRATE_BOUNDARY.md` (what exists) ·
`NOW_WHAT_CLIENT_HOME_EXPERIENCE_DESIGN.md` (hierarchy, motion, empty states) ·
`…CLIENT_HOME_V1_AVAILABLE_NOW.md` (pilot build scope)
