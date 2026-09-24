# MEDIA-PRACTITIONER-AUTHORIZATION-01 · F2
## Human authorization + relational context design

**Date:** 2026-09-23
**Disposition:** **DESIGN CANDIDATE · NO IMPLEMENTATION YET**

This document answers one human question:

> **How should MAIA know which part of Kelly's work she means, without ever letting AI guess its way past security?**

F1 established the defect: Media correctly knows who is logged in, but then treats every logged-in person as the same practitioner.

F2 defines the replacement rule in ordinary language before any route is repaired.

### Custody while this design was written

```text
F1 accepted candidate base          c4e5048831d2048d5dc984211052d33f05575503
F1 canonical source base            a7b7825ec3e58904856280a5b10d8f48bbe6bf8c
latest canonical observed in F2     e886888416062c7fcbcf899040e3827bc8013835
authority-source overlap             ZERO
Today / Monitor / System overlap     ZERO
```

Canonical advanced while F2 was being designed. The advance did not touch the Media authorization source, the identity helpers examined by F1/F2, or the existing Today, Monitor, and System surfaces inspected for this design. The new founder operating-field observations were therefore made against the newer canonical without silently changing F1's evidence.

## 1 · The three things we must keep separate

### Identity — “Who is this?”

Login proves the person.

For Kelly, the system first establishes:

> **This really is Kelly's authenticated account.**

MAIA, ChatGPT, Claude Code, memory, conversation history, localStorage, or a project name cannot replace login as proof of identity.

### Context — “What part of my work am I in?”

This is where relational intelligence belongs.

MAIA may understand from the conversation that Kelly is working in:

- Soullab;
- Writer's Studio;
- Elemental Alchemy;
- a particular practitioner workspace;
- a specific project or body of media.

ChatGPT or Claude Code may also understand that context from their current conversation, repository, or task.

They may therefore **suggest context**.

### Authority — “Am I actually allowed to enter that context?”

The server decides this from Kelly's authenticated account and the workspaces/practitioner records that account is actually allowed to use.

AI can help answer:

> “What does Kelly probably mean?”

AI cannot answer:

> “What is Kelly allowed to access?”

That second question belongs only to the authorization system.

## 2 · The experience Kelly should actually have

The intended experience is:

```text
Kelly logs in
    ↓
the system verifies Kelly
    ↓
MAIA understands the work Kelly is doing
    ↓
MAIA suggests the likely workspace
    ↓
the server checks that Kelly is allowed to use it
    ↓
open the workspace
```

When the answer is obvious and there is only one valid workspace, this can feel seamless:

> **“Opening this in your Soullab media workspace.”**

When more than one valid workspace could fit, MAIA should ask a human question, not show a UUID:

> **“Do you mean Soullab or your other practice?”**

The person chooses in normal language. The server then verifies that choice before anything opens.

## 3 · MAIA, ChatGPT, and Claude Code become context advisors

F2 names MAIA, ChatGPT, and Claude Code as **context advisors**.

A context advisor may say, in effect:

> “From what Kelly is doing with me right now, I think she means Writer's Studio in Soullab.”

That suggestion can include only enough information to identify the work context, for example:

```text
source        MAIA | ChatGPT | Claude Code
human label   "Soullab / Writer's Studio"
work hint     "writers-studio"
reason        "current conversation and project are about Writer's Studio"
time          current session
```

The advisor does **not** send permission.

It does **not** get to say:

> “Kelly may access practitioner record X.”

The server takes the suggestion and compares it only with contexts Kelly is already authorized to use.

A suggestion that does not match an authorized context is ignored.

## 4 · Connection does not mean merging all three minds

“Connected” does not mean MAIA, ChatGPT, and Claude Code receive one another's complete memories or conversations.

The safer design is a small, explicit handoff.

Each system can offer a **context hint** from the work it is already doing with Kelly.

Only the hint needed for orientation crosses the boundary.

So the handoff should prefer:

> “Kelly is working on Writer's Studio.”

over:

> “Here is Kelly's entire ChatGPT history so MAIA can decide.”

This keeps relational continuity without turning continuity into unrestricted data sharing.

Any future ChatGPT or Claude Code connection must therefore be:

- explicitly connected by Kelly;
- limited to the context needed for the handoff;
- visible enough that Kelly can understand what is connected;
- removable without breaking Kelly's login or underlying permissions.

F2 defines this contract. It does **not** claim that a live ChatGPT or Claude Code handoff connector already exists.

## 5 · What happens when Kelly has zero, one, or several workspaces

### No practitioner workspace

Kelly may be correctly logged in and still have no practitioner workspace.

In that case Media does not invent one and does not fall back to a demo account.

It simply says:

> **“This account does not currently have practitioner Media access.”**

### One practitioner workspace

If Kelly has one active practitioner workspace, that workspace can be used directly.

MAIA may still describe it naturally, but there is nothing ambiguous to choose.

### Several practitioner workspaces

Several valid workspaces are not an error. Guessing among them is.

If there is no already-confirmed current workspace, MAIA may use context from MAIA, ChatGPT, or Claude Code to make a suggestion:

> **“It looks like you mean Soullab. Use that workspace?”**

Kelly confirms once. The server verifies that Soullab is actually one of Kelly's allowed workspaces, then holds that choice for the current working session.

Once confirmed, Kelly should not be asked again on every click.

The server remembers the confirmed workspace for that authenticated working session.

If MAIA later notices that the conversation has clearly moved somewhere else, it may suggest a switch:

> **“We seem to have moved from Soullab into your other practice. Switch workspaces?”**

A model may suggest the switch. It may not perform an unverified switch on its own.

## 6 · Projects and files never choose the workspace

A project, recording, transcript, asset, export, or file can only be opened **inside the workspace that has already been established**.

Example:

```text
Kelly is verified
    ↓
Soullab is the confirmed workspace
    ↓
Kelly asks for Project 123
    ↓
server checks: does Project 123 belong to Soullab?
    ↓
yes → open it
no  → do not reveal it
```

The project itself cannot cause the system to switch Kelly into another practitioner's workspace.

That is the central security rule F2 protects.

## 7 · What the system may trust

The rule is intentionally simple:

| Information | What it may do |
|---|---|
| verified login | prove who Kelly is |
| server-held permissions | prove which workspaces Kelly may use |
| Kelly's confirmed workspace choice | select among workspaces Kelly already owns |
| MAIA context | suggest the likely workspace |
| ChatGPT context | suggest the likely workspace |
| Claude Code context | suggest the likely workspace |
| project/file ID | select a resource inside the chosen workspace |
| localStorage or a model's claim | never grant access |

In one sentence:

> **AI can understand the relationship. The server guards the boundary. Kelly remains the chooser when there is real ambiguity.**

## 8 · What failure should feel like

The user-facing experience should remain human.

No login:

> **“Please sign in.”**

Logged in but no practitioner workspace:

> **“This account does not currently have practitioner Media access.”**

Several workspaces and no confirmed choice:

> **“Which workspace are you working in?”**

A project that is not inside the confirmed workspace:

> **“Project not found.”**

The system should not reveal that another practitioner's project exists.

## 9 · A small visible sign of where Kelly is working

When a workspace is selected, MAIA should make it quietly visible:

> **Working in: Soullab**

That gives Kelly an easy way to notice if the context is wrong.

Changing it should be a normal human action such as:

> **Change workspace**

—not an account-management ritual.

The confirmed workspace should expire with the authenticated working session unless Kelly deliberately chooses a longer-lived preference later.

The system may record a small context receipt:

```text
who was verified
which authorized workspace was selected
whether it was obvious, suggested, or explicitly chosen
which advisor made a suggestion
when the selection happened
```

It should not need to store the full MAIA, ChatGPT, or Claude Code conversation just to remember the choice.

## 10 · Existing system evidence behind this design

Current canonical already gives us most of the pieces.

- The login system already verifies a real session before returning a member identity.
- The database already links practitioner records to members.
- Existing practitioner routes already show a safe pattern: a requested practice is checked against the authenticated member before access is granted.
- Existing code also demonstrates the danger we are avoiding: some helpers choose a practitioner with `LIMIT 1`, while another identity module refuses to guess when several records exist.

## 11 · This is bigger than Media: Kelly's Operating Field

The identity/context rule in F2 is not only for Media.

It should become the continuity rule for the founder surfaces Kelly uses to run her world:

- **Graph**
- **Today**
- **Monitor**
- **System**
- Media and other work rooms that connect to them

These are not four unrelated dashboards.

They are four views into the same living field of work.

The design assumption is explicit:

> **This founder operating field is being built first for Kelly: one person carrying many simultaneous roles, projects, relationships, systems, and responsibilities, with AI partners helping her hold continuity across them.**

That is not a generic enterprise dashboard requirement. It is the primary use case.

## 12 · The core object is an Active Field

Kelly does not primarily need another stream of insights.

She needs the system to know:

> **What is alive right now, what is moving, what is blocked, what is waiting, and who is carrying the next move?**

An **Active Field** is one piece of living work that deserves continuity.

Examples:

- Writer's Studio beta readiness;
- JEV integration;
- Elemental Alchemy publishing;
- a production-security repair;
- a collaboration with a named person;
- a family responsibility Kelly is actively carrying;
- a business, research, writing, clinical, or operational thread Kelly deliberately places in her operating field.

An Active Field should be understandable at a glance in ordinary language.
Each Active Field should carry, at minimum:

- **Name** — what Kelly calls it.
- **Why it matters** — the purpose or desired outcome.
- **State** — active, waiting, blocked, watching, or complete.
- **Now** — what is actually happening.
- **Next** — the next meaningful move.
- **Waiting on** — a person, check, event, answer, date, or system.
- **Attention** — what needs Kelly specifically.
- **AI partner** — MAIA, ChatGPT, Claude Code, JARVIS, or several together.
- **Last movement** — the most recent meaningful change.
- **Related material** — chats, files, PRs, people, projects, and meetings.
- **Boundary** — what has not yet been opened or decided.

An Active Field is not merely a task. It can contain many tasks and conversations while remaining one coherent piece of Kelly's world.

The field should survive movement between AI partners and interfaces. Kelly should not have to reconstruct it every time she changes rooms.
## 13 · Graph — the living map of Kelly's world

**Graph** answers:

> **“How does everything I am carrying connect?”**

It should show the relationships among Kelly's Active Fields, people, projects, companies, books, research, systems, decisions, conversations, documents, and AI partners.

Graph is not primarily a technical knowledge graph.

Its purpose is orientation.

Kelly should be able to see, for example:

- Writer's Studio connects to Andrea, beta readiness, the flagship runtime, specific PRs, and MAIA;
- Elemental Alchemy connects to the book, Soullab Press, teaching intelligence, research, and publishing;
- JARVIS connects to repository work, security, JEV, Claude Code, system health, and current authority boundaries.

The Graph should make important relationships visible without forcing Kelly to remember where each fact lives.
## 14 · Today — Active Fields, not another insight feed

**Today** answers:

> **“What is alive today, and where does my attention actually belong?”**

This is the most important change in this design.

Today should not be primarily a list of system statistics, generic insights, or disconnected tasks.

It should surface Kelly's **Active Fields**.

The first view should answer:

- What is moving today?
- What is waiting?
- What became blocked?
- What finished?
- What changed while Kelly was elsewhere?
- What needs Kelly's judgment?
- What can an AI partner carry without Kelly?
- What should not interrupt Kelly yet?

Tasks, follow-ups, metrics, and recent activity can still exist, but they sit **inside or beneath the fields they belong to** whenever possible.

Today is therefore a working field of attention, not merely a dashboard.
## 15 · Monitor — wake Kelly only when something changes

**Monitor** answers:

> **“What changed that deserves attention?”**

The PR subscription pattern is the reference experience.

Kelly should not have to repeatedly poll GitHub, servers, beta feedback, email, workflows, or long-running AI work just to discover whether something happened.

Monitor should watch the things Kelly explicitly cares about and wake her when a meaningful condition changes.

Examples:

- a PR check settles;
- a build fails;
- production health changes;
- a beta tester reports a problem;
- an important email or request arrives;
- an AI partner reaches a decision boundary;
- a field that was waiting becomes actionable;
- a deadline or commitment is approaching.

Monitor is not meant to produce a wall of notifications.

Its job is **attention protection**: keep quiet while nothing meaningful changed, then surface the change with enough context to act.
## 16 · System — the machinery and the partners

**System** answers:

> **“What is running, who is carrying what, and is the whole thing healthy?”**

System should include more than model-call statistics.

It should help Kelly understand the working organism around her:

- MAIA;
- ChatGPT;
- Claude Code;
- JARVIS;
- models and routing;
- connected computers and servers;
- deployments;
- automations and long-running watches;
- repositories and active work lanes;
- important connectors;
- system health, errors, capacity, and cost where available.

Most importantly, System should show **responsibility**:

> “Claude Code is carrying this repository lane.”
> “ChatGPT is holding this research/adjudication thread.”
> “MAIA is holding this relational/work context.”
> “JARVIS is routing or witnessing this operation.”
> “Nothing is currently carrying this field.”

Kelly should be able to see when two AI partners are accidentally doing the same job or when something important has no partner holding it.
## 17 · AI partners share the field, not unrestricted memory

Kelly's AI partners should be able to hand work to one another without making Kelly restate everything.

The shared unit is the Active Field.

A handoff should be able to say:

> **“Here is the work Kelly is in, why it matters, where it stands, what changed, and what you are being asked to carry.”**

It should not require one AI system to ingest another system's entire private history.

A useful handoff can include:

- field identity;
- current goal;
- present state;
- last meaningful change;
- next boundary;
- relevant files, PRs, conversations, or documents;
- what Kelly has already decided;
- what remains undecided;
- what the receiving AI partner is being asked to do.

The receiving partner may add new observations to the field, but it may not silently rewrite Kelly's decisions or another partner's provenance.
## 18 · One field, four views

A single Active Field should appear differently depending on where Kelly is looking:

| Surface | The question it answers |
|---|---|
| **Graph** | What is this connected to? |
| **Today** | What about this needs attention now? |
| **Monitor** | What changed? |
| **System** | Who or what is carrying it, and is that machinery healthy? |

These must not become four separate databases that drift apart.

If a PR settles in Monitor, the same field changes in Today.

If Claude Code takes custody of a repository lane, System shows it and Graph shows the relationship.

If Kelly marks a field complete in Today, Graph retains its history but it no longer competes for current attention.

If MAIA and Kelly are talking about a field, that same field should be visible as the current context rather than creating a fifth disconnected copy.

## 19 · MAIA is the relational doorway

Inside Soullab, MAIA should be the conversational way Kelly enters and moves through this operating field.

Kelly should be able to say things like:

> “What needs me today?”
> “Show me everything connected to Writer's Studio.”
> “What changed while I was away?”
> “What is Claude Code holding right now?”
> “What is blocked?”
> “Move this out of Today but keep watching it.”
> “I want to work on Elemental Alchemy now.”

MAIA translates those human intentions into navigation through Graph, Today, Monitor, and System.

The screens remain useful; conversation becomes another doorway into the same field, not a separate universe.
## 20 · The system carries the bookkeeping

The design goal is not to give Kelly another system she has to maintain.

The AI partners should do the clerical continuity work whenever evidence is available:

- notice that a PR opened or merged;
- notice that a check settled;
- notice that a document changed;
- notice that a task became blocked or complete;
- connect the new event to the right Active Field;
- update “last movement” and “waiting on”;
- prepare the next handoff.

Kelly should be asked when meaning, priority, permission, or direction genuinely requires her judgment.

The system should not repeatedly ask Kelly to copy status from one screen to another.

> **Kelly supplies judgment. The system supplies continuity.**

## 21 · Current repository reality

A current-canonical census at `e886888416062c7fcbcf899040e3827bc8013835` shows that pieces already exist, but they are fragmented:

- **Today** exists at `/founder/today`. It currently centers tasks, follow-ups, platform vitals, and recent activity. It does not yet have the Active Field as its primary object.
- **Monitor** exists at `/admin/monitor`. Bugs are wired. Feedback, requests, and system alerts are explicitly reserved but not yet wired.
- **System** exists in the founder/admin tooling. Its current view centers model calls, tokens, status, latency, and recent errors. It does not yet show AI-partner custody of Kelly's work.
- A dedicated founder **Graph** surface for this living work map was not found in the current founder console. Existing graph components elsewhere are not yet this founder operating map.

This means the design does not require starting over. It requires converging existing pieces around one shared Active Field model.
## 22 · The AI partnership model

The operating field should treat Kelly's AI systems as a coordinated working partnership, with clear roles and visible handoffs.

Default roles:

- **MAIA** — relational continuity, conversation, orientation, and helping Kelly move through the whole field in human language.
- **ChatGPT** — synthesis, research, connected-app work, adjudication, planning, and substantial cross-domain work.
- **Claude Code** — deep repository execution, code changes, tests, and technical implementation inside a codebase.
- **JARVIS** — local orchestration, bounded review, routing, custody, repeatable evidence, and coordination of technical work.

These are defaults, not cages. A field can involve several partners.

The important requirement is that Kelly can always answer:

> **Who is holding this right now?**

and:

> **What are they waiting for from me?**

The system should also detect obvious duplication:

> “ChatGPT and Claude Code both appear to be working the same lane. Keep both, or choose one lead?”

Kelly remains the person who sets direction.
## 23 · How an Active Field begins and changes

Kelly can create an Active Field directly in conversation or from any of the four views.

The system may also notice that a coherent piece of work is forming and offer:

> **“This has become an ongoing field. Keep it active?”**

A new durable field should not be silently invented from an AI inference.

Once a field exists, evidence can update factual parts automatically:

- a PR merged;
- a check failed;
- a file changed;
- a meeting was scheduled;
- a watched condition became true.

Interpretive parts remain clearly marked as suggestions:

> “This looks blocked.”
> “This may now need your attention.”
> “I think the next move is…”

Kelly can correct those interpretations without erasing the underlying event.

A completed field leaves Today but remains available in Graph and history.
## 24 · Attention is a scarce resource

Today and Monitor should be designed around Kelly's attention, not around maximizing activity.

A field rises toward Kelly when one of these is true:

- Kelly explicitly marked it important;
- a real deadline is approaching;
- something became blocked and only Kelly can unblock it;
- a watched event changed;
- another person is waiting on Kelly;
- an AI partner reached a decision boundary it cannot cross;
- a system failure threatens work Kelly cares about.

A field should stay quiet when:

- an AI partner can continue safely without Kelly;
- nothing meaningful changed;
- a check is merely still running;
- background work is healthy;
- the item is interesting but not actionable.

MAIA may recommend attention. Kelly remains the authority over what matters most.
## 25 · Context sharing stays bounded

Because this field may eventually hold a large portion of Kelly's world, continuity must not become indiscriminate sharing.

Each Active Field can carry a sharing boundary such as:

- **Kelly only**
- **MAIA**
- **technical partners**
- **specific connected partner**
- **specific person/project**
- **do not hand off**

An AI partner receives the smallest useful field packet for the work it is being asked to do.

The field also keeps provenance:

> Kelly said this.
> GitHub established this.
> MAIA suggested this.
> ChatGPT inferred this.
> Claude Code witnessed this locally.
> JARVIS recorded this as canonical evidence.

Those are not interchangeable kinds of knowledge.

Continuity means keeping them connected without flattening them into one voice.
## 26 · Build it in separate pieces, but make it feel like one thing

After this design is accepted, implementation should split into bounded pieces rather than one enormous rewrite.

### First: fix the security boundary

Media must stop treating every logged-in member as the same practitioner.

That repair uses the identity/context/authority rule defined here.

### Second: create the shared Active Field

Build one founder-only field model that Graph, Today, Monitor, System, and MAIA can all read.

### Third: make Today useful to Kelly

Today becomes the primary view of Active Fields and attention.

Existing tasks, follow-ups, metrics, and activity become supporting material rather than the organizing principle.

### Fourth: build Graph

Create the founder map showing how fields, people, projects, systems, conversations, and artifacts relate.

### Fifth: converge Monitor

Wire meaningful changes into fields: bugs, feedback, requests, system alerts, watched PRs, and other explicit watches.

### Sixth: converge System

Add AI-partner custody, running work, watches, devices, deployments, and system health to the existing technical health view.

### Seventh: conversational control

Let MAIA navigate and update the same field naturally in conversation.

### Eighth: explicit external handoffs

Connect ChatGPT and Claude Code through bounded context handoffs when Kelly explicitly enables those connections.

These steps may be implemented separately. To Kelly, they should become one coherent operating environment.
## 27 · The governing sentence

The whole design can be reduced to this:

> **Kelly should be able to run her world in one living field. Her AI partners should carry continuity across it, MAIA should make it navigable in human language, and the system should preserve identity, permission, provenance, and Kelly's authority while doing as much of the bookkeeping as possible for her.**

## 28 · F2 boundary

F2 authorizes no implementation.

It does not yet:

- change Media authorization;
- create an Active Field table or service;
- change Today;
- build Graph;
- wire new Monitor sources;
- change System;
- connect ChatGPT or Claude Code to MAIA;
- create new data-sharing permissions;
- deploy anything.

Those are implementation acts to follow only after this design is accepted.

### Exact next boundary

> **FOUNDER ADJUDICATION — `MEDIA-PRACTITIONER-AUTHORIZATION-01 / F2` HUMAN AUTHORIZATION + KELLY OPERATING FIELD DESIGN ONLY**

If accepted, the next implementation work should open as separate bounded acts under one shared design rather than as one giant change.

**STOP before implementation.**
