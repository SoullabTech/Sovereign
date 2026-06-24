# Co-lab Beta Team Guide

## Current State, Intended Use, and What We Need You to Notice

---

## ⚑ Release state (read first — claim-accurate as of 2026-06-06)

Co-lab's communication layer is **live on production**. The decision → task loop is **merged to the deploy branch but not yet on production**.

| Capability | State |
|---|---|
| Channels · DMs · Threads · Presence · Reactions · Channel permissions · Team roles | **🟢 Live on prod — use now** |
| Capture Decision → Decisions view → Make Task → Assign | **🟡 Staged for this release — not live until deploy is complete** |
| Complete Work (mark a task done *inside* Co-lab) | **⬜ Next increment — not in this release** |

The Decisions/Tasks loop becomes **live** only after all four are true:
```
1. git pull on minisforum
2. migrations applied
3. maia rebuilt / restarted
4. post-deploy beta receipt passed (therapist + engineer run the loop)
```
Until then, treat the 🟡 sections below as *what's coming this release*, not as available today.

---

## Why We Are Testing Co-lab

Co-lab is not being evaluated as a chat application.

We are testing whether it can function as a collaborative operating environment for a small team working on real projects.

The core question is:

**Can a team move from conversation to coordinated action without leaving the environment?**

The current beta team consists of therapists and engineers because we want to test whether Co-lab can support different modes of work while preserving a shared operational thread.

---

## The Operating Loop We Are Testing

```
Conversation
→ Capture Decision        🟡 staged for this release
→ Find Decision Later     🟡 staged for this release
→ Create Task             🟡 staged for this release
→ Assign Responsibility   🟡 staged for this release
→ Complete Work           ⬜ next increment (not in this release)
```

If this loop works naturally, Co-lab becomes more than messaging. If it breaks, we want to know exactly where.

---

## What Is Live Today (🟢 on production)

### Team Communication

Co-lab currently supports, **live on prod**:

* Team channels
* Direct messages
* Threads
* Presence
* Reactions
* Channel permissions
* Team roles

Use it as you would a working team environment.

---

## What Is Staged for This Release (🟡 live after deploy)

> The two sections below describe capabilities **merged to the deploy branch** and verified in build/test, but **not live on production until the deploy completes**. They are part of *this* release.

### Decisions

A decision made in conversation can be captured as a Team Decision.

The purpose is simple: instead of losing important decisions in chat history, they become visible and discoverable.

Ask yourself:

* Could I find this decision next week?
* Could someone joining later understand what was decided?
* Does the captured decision reflect what the team actually agreed on?

*(The "why" behind a decision is preserved via its link back to the source conversation — not a separate field. Following that link is how you recover the rationale.)*

### Tasks

A captured decision can become a task. Tasks represent accountable work.

The important test is not whether the task exists. The important test is whether:

* ownership is clear
* the next action is obvious
* the task remains connected to the conversation that created it

*(Creating and assigning tasks is in this release. Marking a task **complete** inside Co-lab is the next increment.)*

---

## How We Suggest Using It

### Daily Work

Use Co-lab for: project discussions, technical decisions, design conversations, implementation planning, operational coordination.

Avoid treating it as a demo environment. Treat it as your actual workspace.

### When You Reach Agreement (once Decisions are live)

Capture the decision. Examples:

* "Let's use email-code login."
* "Heather will lead marketing onboarding."
* "Jordan will build the task conversion flow."

If it matters later, capture it.

### When Action Is Required (once Tasks are live)

Create a task from the decision. Assign someone. Do not leave decisions floating.

The question is: can Co-lab help us move naturally from agreement to action?

---

## What We Need Feedback On

**1. Friction** — Where did you hesitate? Where did you feel confused, slowed down, or uncertain what to do next?

**2. Continuity** — Could you return later and understand: what happened, what was decided, who owned what?

**3. Visibility** — Could you easily see: active decisions, open tasks, assigned work? *(Completed-work visibility arrives with the completion increment.)*

**4. Trust** — Did the system feel reliable? Did you trust that decisions would remain visible, tasks would remain connected, and context would not disappear?

**5. Naturalness** — Most important: Did using Co-lab feel like work flowing naturally? Or did it feel like maintaining a tool?

---

## What We Are Not Evaluating Yet

This beta is not evaluating: advanced AI workflows · recording integration · practitioner workflows · Session Room integration · knowledge management · academy functionality.

Those are future layers. Right now we are testing the operating loop: **Conversation. Decision. Task.** (Execution/completion follows in the next increment.)

---

## Success Criteria

At the end of the beta week, a team member should be able to answer:

1. What did we decide?
2. Why did we decide it?
3. Who owns it?
4. What is the next step?
5. Where is the conversation that created it?

If Co-lab can answer those five questions consistently, we have crossed an important threshold: the system has become an operating environment rather than a messaging tool.

*(These five become testable for the Decisions/Tasks loop once the deploy is complete and the post-deploy beta receipt has passed.)*
