# The Living Field — Design Direction

_Exploration · 2026-06-03 · Cat-1 preserved direction · no code changed · grounded in actual repo files_

---

# The Living Field: Design Direction

**Cat-1 — Preserved Direction. No code changed. The human pulls the trigger.**

---

## 1. RECOMMENDATION

The Living Field becomes a place rather than software by changing what happens to a gesture after it lands — not by engineering the approach to arrival. Start with Move 3: rename "Submit" to "Leave this here" and replace the post-submission confirmation with "Left in the field." This requires no new infrastructure, changes three strings and one post-submission state, and shifts the ontology of the entire page from form-submission to accumulation. Every subsequent move builds on that premise.

---

## 2. PLACE NOT SOFTWARE — PRINCIPLES

**The field has weather, not notifications.**
Ambient orientation (an elemental season, a steward-written weekly line) belongs to the field, not to the member's behavior. It is the same for every arrival. It does not change based on who is reading or when they last visited.
_Canon guardrail: Canon §II.5 — no manufactured anticipation. Test: would this line be worth writing if no one read it? If no, it is doing retention work, not orientation work._

**Gestures are left, not submitted.**
Observations, responses to living questions, experiment reflections — these are things a member sets down in a place. The language of deposit ("leave this here," "left in the field") is not cosmetic; it changes the ontology. Something was left. Nothing is owed back.
_Canon guardrail: Invariant 4 — no attachment capture. The gesture flows one direction: member to field. The field does not perform gratitude or signal the member's importance to it._

**Loops close quietly, not publicly.**
When an observation finds its way into Shared Learnings, the submitting member sees a quiet marker on their own thread ("This found its way into the field"). The marker is visible only to them, never as a count, never as a ratio, never as a social signal.
_Canon guardrail: Canon §II.6 — no implying the member is incomplete without continued engagement. The closing of the loop acknowledges the path; it does not incent submission volume._

**The steward voice names uncertainty, not progress.**
The founding voice in the Welcome section — a datestamped letter, updated when something real shifts — is worth writing only if it names what is unresolved. "We don't know yet" passes. "Something remarkable is happening" does not.
_Canon guardrail: Canon §II.10 — no speaking with finality where humility is required. The letter returns authority to the humans tending the field, not to the platform as a self-governing entity._

**The field releases, structurally.**
"You do not need to return" must appear as entry orientation, not exit copy. The direction of travel is established at arrival: what you notice here belongs to your life, not to the field. This is not Move 5's footer line — that is a caption on a trap. This is the Welcome page's header framing, always visible.
_Canon guardrail: Invariant 7 — aliveness happens outside the system. Invariant 3 — comfort permitted, reliance interrupted. The release is structural, not decorative._

**Threshold content must arrive simultaneously with navigation, not before it.**
If a living question or steward note is worth reading on arrival, it earns that position by its quality, not by a manufactured delay. Any mechanism that withholds navigation to deliver content is creating anticipation through structural tension — precisely Canon §II.5's prohibited pattern. Remove the delay. Place the content first on the page, alongside the nav.
_Canon guardrail: If the content only lands because something was withheld, the content is not doing the work — the delay is. Strengthen the content; do not reinstate the delay._

---

## 3. OPEN TO ALL — VISIBILITY MODEL

| Section | Free Member | Continuity (Personal) Member | Cohort (Beta Tester) | Protected + Why |
|---|---|---|---|---|
| **Welcome** | Read + observe; sees steward letter and field weather | Same | Same, plus context about tester role | Nothing gated here. This is the invitation. |
| **Living Questions** | Read all questions; can respond via observation shortcut (pre-populated, element optional) | Same | Same, plus their questions informed the list | Questions are prompts for noticing, not data collection. Read + respond is safe immediately. |
| **Experiments** | Read all protocols; can follow the session-prompt shortcut into observation | Same | Same, plus they are running the experiments | Experiment descriptions expand the noticing pool. The cohort runs them; others can try them on their own. |
| **Elemental Perspectives** | Read + use as observation lens | Same | Same | Fully static content, no data risk. Open immediately. |
| **Observations — read own** | Not applicable until Commons write path ships | Available (their own thread, retrievable across sessions) | Full access | No observations exist for free members until the Commons write path exists. Do not surface an empty state as a feature. |
| **Observations — write** | Available via Commons write path (new table, new prompts, orientation gate required) — NOT the `beta_observations` table | Same as free | Full access to `beta_observations` | The `beta_observations` table is a research instrument with a specific consent frame. Free members need a distinct contribution type (own table, own prompts) before a write path opens. Do not reuse beta infrastructure. |
| **Shared Learnings — read** | Read curated content (cohort-generated + steward-authored, already reviewed) | Same | Same, plus their observations eligible for promotion | Curated learnings have passed human review. Safe to show broadly. Free members see what the cohort generated; they do not yet contribute to this pool. |
| **Shared Learnings — private signal** | "Does this name something you've experienced?" — binary, flows to stewards only, never visible to member or field | Same | Same | Signal is asymmetric by design. The moment it reflects back to the submitting member, it becomes validation. Keep it one-directional: member to steward. |
| **Field Pulse — metrics** | Observe aggregate counts (observations this week, most active element) | Same | Full, including `membersReturning` | Aggregate counts are not member-identifiable. Safe. `membersReturning` is cohort-specific data; if shown to open members, must be framed as "what the research cohort is doing" — not as a norm for participation frequency. |
| **Field Pulse — sensing** | Read steward's human reflection | Same | Same | The sensing block is a human-written orientation note, not a computed metric. It belongs to the whole field. |
| **Roadmap** | Read + submit one-direction suggestion ("Something I notice is missing") — goes to admin view only | Same | Same, plus they can influence direction | Roadmap items are platform communication. Hiding them from the broader community has no benefit. Suggestions stay asymmetric: member to steward, never public, no vote counts. |
| **News** | Read | Same | Same | Published news is authored for the cohort today but logically belongs to the whole community. Distinguish News (what changed in the system, using liveness vocabulary) from Shared Learnings (what the cohort is noticing together) — different frames, not just different content. |

**What stays cohort-only and why:** The `beta_observations` write path remains cohort-gated because of contextual consent, not access restriction. Cohort members entered a frame (invitation, research context, explicit distinction between field observation and personal MAIA reflection) that free members arriving cold do not have. Opening the write path before that frame is established is a contextual consent failure, not a formal one. The solution is a Commons observation type with its own infrastructure and its own orientation — not a removal of the cohort gate from the existing path.

---

## 4. MEMBERSHIP INTEGRATION

**Persistence, not access.**
The field itself is whole for every member. What a Continuity (Personal) member carries is their thread: their own observations retrievable across sessions, their attention visible over time, their cross-session awareness in MAIA when they bring something from the field into conversation. A free member's observation enters the field and stays there as a contribution to the commons. It does not stay as theirs. The difference is not depth of field access — it is whether the member can carry themselves back into it.

**Verdict on Explore / Continue / Steward.**
Adopt verb-modes. Verbs describe what a member is doing; nouns describe what the system has assigned them. "I am exploring" places the locus in the member's activity; "I am an Explorer" makes MAIA the authority who categorized them. This is Invariant 1 (Authority Return) operationalized at the tier level. One guard: "Explore" must never appear as a lesser or provisional state. These are parallel modes of participation, not rungs of a progression. The copy "Free stays complete forever" must remain in the same viewport as the mode names.

Note: the existing architecture recommendation document (MEMBERSHIP_AS_PARTICIPATION_EXPLORATION_2026-06-03.md) adopted "Explorer / Companion / Steward." Reconcile before implementation — the verb direction supersedes that noun recommendation. No parallel truths in the architecture docs.

**Concrete copy moves (tier page).**

Replace the boundary line:
> Before: "The limit is continuity, not care."
> After: "MAIA is fully present whether or not she remembers. What Continue adds is the thread back — your observations, your patterns, your returning."

Add one sentence to the Continue card, after "MAIA remembers":
> "In the Living Field, your observations stay yours — you can return to what you noticed months ago and see how your attention has moved."

Add a jurisdictional line at the top of the tier section, above all cards:
> "The Living Field is open to everyone. Continue membership means your relationship with it persists — your observations, your patterns, your thread back."

---

## 5. WHAT NOT TO BUILD

**The session-threshold delay (Move 2 as proposed).**
Withholding navigation for two seconds to deliver curated content is manufactured anticipation. It is Canon §II.5's prohibited pattern dressed as atmosphere. The content belongs first on the page, alongside the nav. If removing the delay makes the content feel less significant, the content needs to be stronger — the delay does not get reinstated.

**The retention-framed founding voice.**
The steward letter is worth writing and belongs on the Welcome page. It is not worth writing as a "reason for returning members to stay on the page longer." The goal of the letter is truth-telling about what is unresolved. Dwell time is not a success metric for it.

**The orientation paragraph as the full sovereignty guardrail.**
The one-paragraph first-visit orientation solves contextual consent (does this member know their observations are field research). It does not solve the sovereignty problem: does this member, after repeated use, become more self-directed or more field-directed. The sovereignty orientation — "what you notice here belongs to your life, not to us" — must be visible entry framing, not a deferred footer. Both are needed. One does not substitute for the other.

**"Most requested" or vote counts on Roadmap suggestions.**
One-direction, asymmetric, steward-readable only. The moment suggestions become visible to other members or ranked by frequency, the roadmap becomes a feature-request tracker with competitive dynamics. That is a different product.

**Completion indicators on Experiments.**
No count of how many experiments a member has run, no indication that the cohort "completed" one. The field is not a curriculum to finish.

**Aggregate return-frequency signaling.**
No streaks, no "you've been here N days," no visible ratio of how many of a member's observations were promoted to Shared Learnings. These all install behavioral comparison signals. They are lighter versions of the patterns the canon prohibits, not exceptions to them.

---

## 6. WHERE TO START

**Move 3: Observations are left, not submitted.**

Three string changes and one post-submission state. No new infrastructure, no new data model, no session logic, no editorial dependency.

1. Button label: "Submit" → "Leave this here"
2. Confirmation toast: "Observation saved" → "Left in the field"
3. Post-submission state: page does not redirect away; the observation appears below, joined to others already there

The payoff is categorical, not incremental. The page stops being a form and starts being a place where things accumulate. Every subsequent move — the founding voice, the observation shortcut from Living Questions, the "this found its way into the field" marker, the release line — all depend on the premise that you can leave something here. Move 3 is where that premise becomes felt rather than stated.

Do this before opening the gate, before writing the orientation copy, before any of the visibility table changes. It is an afternoon of implementation and it changes what the field is.
