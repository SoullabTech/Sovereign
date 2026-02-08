# Decision Council — User Manual

*Soullab Studio | MAIA Mentor*

---

## What It Is

The Decision Council is a practitioner-facing reflection tool inside Soullab Studio. It takes a decision — clinical, relational, organizational, personal — and runs it through multiple analytical perspectives simultaneously. You get back tensions, risks, insights, and a synthesized recommendation. Then you do the real work: annotate what matters, draft the questions you'll bring into the room (or sit with yourself), and prepare for what comes next.

The client never sees the raw council output. You do. That's the point.

---

## Who It's For

The Decision Council is designed for any practitioner who works with human complexity:

- **Therapists** — client case conceptualization, treatment direction, relational dynamics
- **Coaches** — client decisions, growth edges, accountability framing
- **Leadership Consultants** — executive decisions, organizational politics, stakeholder navigation
- **Facilitators** — group dynamics, systemic patterns, intervention design
- **Supervisors** — supervision of clinical work, countertransference, process reflection
- **Self-reflection** — your own process, blind spots, what you're carrying into the room

---

## Where to Find It

**Studio sidebar** > **Decisions** (Scale icon)

Three pages:

| Route | Purpose |
|---|---|
| `/studio/decisions` | Decision list — all your records, filterable |
| `/studio/decisions/new` | Create a new decision |
| `/studio/decisions/[id]` | Detail view — council output, your notes, your questions |

---

## Situation Types — Field Orientation

When you create a new decision, the first question is: **What are you working with?**

This is not a quiz or a diagnostic. It's field orientation — you're telling the council what kind of situation you're reflecting on, so it can tune its perspectives accordingly.

| Type | Label | When to Use | Council Tuning |
|---|---|---|---|
| **Individual client** | Individual client | One person's situation — what to name, ask, or do next | Phenomenology required. Human + domain perspectives preferred. |
| **Relationship dynamic** | Relationship dynamic | Between people — boundaries, rupture/repair, patterns, projections | Relationships framing required. Domain + human perspectives preferred. |
| **Group / organization** | Group / organization | A team or system — roles, culture currents, group dynamics, stuck loops | Organizational Field required. Domain + strategic perspectives preferred. |
| **Leadership / authority** | Leadership / authority | Decisions under power — strategy, stakeholders, politics, responsibility | Leadership Power Dynamics required. Strategic + domain perspectives preferred. |
| **Personal reflection** | Personal reflection | Your own process — countertransference, bias, fear, desire, clarity | Archetypal framing required. Uses the Shadow council (not Deliberation). |

### How Situation Type Affects the Experience

- **Different framings are prioritized.** An individual client decision gets phenomenology and human perspectives. A leadership decision gets power dynamics and strategic perspectives.
- **Labels shift.** "Leader's State" becomes "Client's State" or "My State." "Questions for the Leader" becomes "Questions for the Client" or "Questions to Sit With."
- **The closing question changes.** Each type asks the council a different synthesis question, tuned to what matters in that field.
- **Self-reflection uses a different council.** The Shadow council surfaces what you're not seeing, rather than deliberating options.

### Default Behavior

- Default situation type: **Individual client** (most common use case)
- If you select a client with a leadership profile, it automatically switches to **Leadership / authority**
- Existing decisions (created before situation types) default to **Leadership / authority** for backward compatibility

---

## Creating a Decision

Navigate to **Decisions > New Decision**.

### Fields

| Field | Required | What to Enter |
|---|---|---|
| **Situation Type** | Yes (default: Individual) | What kind of situation are you reflecting on? Select one of the five types. |
| **Client** | No | Select from your client list. Leadership clients sort first. If unlinked, select "No client." |
| **Decision Title** | Yes | Name the decision clearly. This is what you'll scan in the list later. |
| **Context** | Yes | Describe the situation. Background, constraints, what is being faced. The richer the context, the sharper the council output. |
| **What's at stake?** | No | Cost of failure, cost of inaction, who gets hurt. Forces the council to weigh gravity. (For self-reflection: "What am I protecting? What would honesty cost?") |
| **Time Pressure** | No | None / Low / Medium / High / Urgent. Affects council urgency weighting. |
| **State** | No | Free text. The label shifts by situation type — "Client's State," "Leader's State," "Group State," or "My State." Describes the emotional or psychological state present in the situation. |

### Two Actions

- **Save Draft** — Stores the decision without running the council. Use this when you're still gathering context or want to return later.
- **Consult Council** — Saves the decision and immediately invokes the AIN consultation engine. Takes 10-30 seconds. Redirects you to the detail page when complete.

---

## How the Council Works

When you press **Consult Council**, this happens:

1. **Decision context is structured** into a question that includes the title, context, stakes, time pressure, state, and (if available) leadership profile. The closing question is tuned to the situation type.

2. **Framings are selected.** Each situation type requires one specific framing and prefers certain domains. The engine selects up to 5 framings total. The AIN framing library includes perspectives from:
   - **Domain**: Leadership Power Dynamics, Organizational Field, Relationships, Grief, Ethics
   - **Strategic**: Systems Thinking, Risk & Reliability, Strategic Vision, Governance & Incentives
   - **Foundational**: First Principles, Phenomenology
   - **Human**: User Experience
   - **Theoretical**: Jungian/Archetypal

3. **Each framing analyzes the question independently** — producing its own perspective on the decision.

4. **Sinkhorn normalization** balances the framing weights so no single voice dominates. Each voice's weight (displayed as a percentage) reflects its relative contribution to the synthesis.

5. **Synthesis** — The engine distills the multi-perspective output into:
   - **Insights** — key perspectives worth considering
   - **Tensions** — conflicts or polarities the decision sits between
   - **Risks** — potential dangers or failure modes
   - **Recommendation** — a suggested path forward
   - **Emergence Rating** — how novel the synthesis is (recombination, synthesis, or breakthrough)
   - **Confidence** — a 0-100% signal of how useful the council judges its own output

---

## Reading the Detail Page

After the council completes, the detail page shows:

### Header
- Decision title, client name, and a **Consult Council** button (available when status is not "complete" — you can re-run the council if you've updated your thinking).

### Context Block
- Your original context, situation type badge, stakes, time pressure badge, and state (labeled dynamically per situation type). This is what the council saw.

### Council Error (if applicable)
- If the consultation failed (network issue, API error), a red banner appears with the error message and a **Try again** button. The decision reverts to draft status automatically on failure.

### Emergence Rating
- A purple badge showing the emergence level and statistics: how many perspectives were used and the confidence score.

### Council Voices
- Each framing that contributed appears as a card with:
  - **Icon and color** identifying the framing type
  - **Label** (e.g., "Power Dynamics," "Relationships," "Archetypal")
  - **Weight** (percentage from Sinkhorn normalization)
  - **Full response text** — the framing's analysis of your decision

### Tensions (amber)
- Polarities the council identified. These are the "both/and" dynamics present in the situation.

### Risks (red)
- Dangers, failure modes, blind spots. Each marked with a warning icon.

### Insights
- Key perspectives worth holding. Not recommendations — observations.

### Recommendation (green)
- The council's synthesized suggestion. Use this as a starting point for your own thinking, not as an answer.

---

## Your Workspace (Below the Council)

This is where the tool becomes yours.

### Your Notes
A text area for your observations. This is private — the client never sees it. Use it for:
- Patterns you notice across the council voices
- What you'd emphasize or de-emphasize
- What the council missed that you know from the relationship
- Countertransference signals (especially in self-reflection mode)
- What you want to hold, not say

### Questions (dynamic label per situation type)

The label shifts based on your situation type:

| Situation Type | Label |
|---|---|
| Individual client | Questions for the Client |
| Relationship / dynamic | Questions for the Client |
| Group or organization | Questions for the Group |
| Leadership / authority | Questions for the Leader |
| Personal reflection | Questions to Sit With |

A numbered, editable list. This is the core deliverable of the Decision Council workflow.

- **Add a question**: Type in the input field and press Enter or click +
- **Remove a question**: Click the X next to any question
- **Copy all questions**: Click **Copy all** (top right of the section) to copy the numbered list to your clipboard. Ready to paste into session prep notes, an email, or a shared doc.
- **Save**: Click **Save Notes & Questions**. The button flashes green with "Saved" confirmation for 2 seconds.

Questions are saved as part of the decision record and appear in the decision list view ("X questions prepared").

---

## Use by Practice Type

### Therapy / Clinical
- **Situation type**: Individual client or Relationship / dynamic
- **Use for**: Case conceptualization, treatment direction, stuck points
- **Key output**: Questions for the client that open the real work
- **Example**: A client keeps repeating a relational pattern but can't see it. Use Relationship / dynamic to surface attachment dynamics, projection, and rupture/repair cycles. Draft questions that name the pattern without interpreting it for them.

### Coaching
- **Situation type**: Individual client or Leadership / authority
- **Use for**: Client decisions, growth edges, accountability
- **Key output**: Questions that help the client think beyond their default frame
- **Example**: A client is deciding whether to take a promotion. Use Individual client to surface what they're not considering — identity loss, relational cost, what "success" actually means to them.

### Leadership Consulting
- **Situation type**: Leadership / authority or Group or organization
- **Use for**: Executive decisions, organizational politics, stakeholder navigation
- **Key output**: Questions to bring back to the leader
- **Example**: A CEO is restructuring their executive team. Use Leadership / authority to surface power dynamics, visibility risk, and political terrain. Draft questions that help the leader see their own blind spots.

### Supervision / Self-Reflection
- **Situation type**: Personal reflection
- **Use for**: Countertransference, blind spots, what you're carrying into the room
- **Key output**: Questions to sit with — no client, no session, just you
- **Example**: You notice you're dreading a particular client session. Use Personal reflection to surface what's yours, what's theirs, and what patterns are running that you can't see from inside them. The Shadow council will name what you're avoiding.

---

## Decision Statuses

| Status | Meaning |
|---|---|
| **Draft** | Decision created, council not yet run |
| **Consulting** | Council is actively deliberating (10-30 seconds) |
| **Complete** | Council has returned results |
| **Archived** | Decision is archived (hidden from default list, cannot be re-consulted) |

---

## Leadership Client Profiles

If your client has a Leadership Profile, the council automatically incorporates it into the question for any situation type. The profile includes:

| Field | Example |
|---|---|
| Role | CEO, VP Engineering, Division Head |
| Organization | Company name |
| Org Size | Startup / 10-50 / 50-200 / 200-500 / 500-1000 / 1000+ |
| Industry | Tech, Healthcare, Financial Services |
| Decision Domain | Strategy, M&A, People |
| Authority Scope | Full P&L, Division, Function |
| Stakeholder Complexity | Low / Medium / High |
| Pressure Level | Low / Medium / High |
| Direct Reports | Number |
| Board Exposure | Yes / No |

### Setting Up a Leadership Profile

1. Go to **Studio > Clients > [Client]**
2. Open the **Leadership Profile** section (amber collapsible panel with crown icon)
3. Fill in the fields and click **Save**
4. The client is automatically tagged as a "leadership" client type

Once a profile exists, the Decision Council uses it to contextualize its analysis — authority scope shapes the power dynamics framing, stakeholder complexity adjusts the political terrain analysis, and so on.

---

## Session Briefing Integration

When you have a session coming up with a leadership client, the **session briefing** automatically includes leadership context:

- **Recent decisions** — the last 5 decisions for this client, with key tensions
- **Pressure signals** — any open (draft) decisions still unresolved
- **Recurring themes** — patterns across recent sessions (themes that appeared 2+ times)

This happens automatically. No extra step needed — just open the session briefing as usual.

---

## Filtering and Finding Decisions

The decision list page offers three filters:

- **All** — everything except archived
- **Draft** — decisions waiting for council consultation
- **Complete** — decisions with council results

Each card in the list shows:
- Decision title and client name
- Situation type label
- Time pressure badge (color-coded: amber for medium/low, red for high/urgent)
- Emergence rating badge (purple)
- Status badge
- Date created
- Number of framings used
- Number of questions prepared

---

## Workflow: Start to Session

A typical Decision Council workflow:

1. **A situation surfaces** — a client calls, you notice a stuck point, or you feel something unresolved
2. Create the decision in Studio, selecting the situation type and capturing context
3. **Consult Council** — get multi-perspective analysis in 10-30 seconds
4. Read the council voices — notice where they agree, where they diverge
5. Write your notes — what you see that the council doesn't
6. Draft questions — the questions that will open the real conversation (or the real self-inquiry)
7. **Copy questions** to your session prep
8. In the session, use the questions to guide reflection — not the council output directly
9. After the session, return to update notes with what emerged

### Self-Reflection Workflow

1. **You notice something** — countertransference, dread, over-identification, avoidance
2. Create a decision with situation type **Personal reflection**, no client
3. **Consult Council** — the Shadow council surfaces what you may be avoiding
4. Read the voices — notice what lands, what you resist
5. Write notes — be honest about what's yours
6. Draft "Questions to Sit With" — questions you don't need to answer yet
7. Return before the next session to see if anything has shifted

---

## What the Council Is Not

- **Not a recommendation engine.** The council surfaces perspectives. You synthesize.
- **Not client-facing.** The client never sees this output. You translate it into questions, observations, and framings appropriate to the relationship.
- **Not a diagnosis tool.** It doesn't tell you what's wrong. It tells you what to look at.
- **Not a replacement for your judgment.** The council is a second set of eyes. You decide what to carry into the room.
- **Not therapy.** Self-reflection mode supports your practice process. It does not replace clinical supervision or personal therapy.

---

## Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Add question | Type + Enter |
| Copy all questions | Click "Copy all" button |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Council consultation failed" banner | API timeout or AIN engine error | Click **Try again**. If persistent, check that the ANTHROPIC_API_KEY is valid. |
| "Network error" banner | Connection issue | Verify network connectivity. The council requires an active connection to the AI provider. |
| Council returns only 1-2 framings | Context too short or too narrow | Add more context, stakes, or state description. Richer input produces better framing selection. |
| Client doesn't appear in dropdown | Client not yet created | Create the client in Studio > Clients first, then return to create the decision. |
| Leadership profile fields not showing | Client not tagged as leadership | Open the client, expand the Leadership Profile section, fill in at least the Role field, and save. |
| Questions not persisting | Forgot to save | Click **Save Notes & Questions** after making changes. Watch for the green "Saved" confirmation. |
| Decision stuck in "Consulting" status | Rare: process interrupted mid-consultation | The system reverts to "draft" on failure. If stuck, re-run the council. |
| Labels say "Leader" but it's a therapy client | Wrong situation type selected | Edit or recreate the decision with the correct situation type (Individual client or Relationship / dynamic). |

---

*Decision Council is part of MAIA Mentor — the practice intelligence layer inside Soullab Studio. It is practitioner-facing by design. The client's sovereignty is protected by the practitioner's judgment about what to surface, when, and how.*
