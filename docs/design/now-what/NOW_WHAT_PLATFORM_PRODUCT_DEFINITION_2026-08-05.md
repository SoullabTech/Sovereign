# NOW WHAT? — PLATFORM PRODUCT DEFINITION (Reset, 2026-08-05)

**Status**: Founder-directed platform reorientation (Kelly, 2026-08-05).
Supersedes nothing structurally — it *names the whole* that the existing
ratified documents are parts of. All implementation threads outside this
document's roadmap are STOPPED pending founder review of this document.

**Standing document set** (this document + these three = the product model):
1. This file — product definition, capability audit, smallest complete loop, roadmap
2. `NOW_WHAT_EXPERIENCE_GAP.md` — experiential target + release object v1 + FREEZE
3. `NOW_WHAT_EXPERIENTIAL_FLOOR_PLAN.md` — ratified architecture (Deliverable 3)
4. `NOW_WHAT_GESTURE_ARCHITECTURE.md` — first-30-seconds journey (Deliverable 2 core)

---

## 1. Product Definition

**Now What? is the between-session executive development environment for
clients of Larry Closs' coaching practice.** It extends the coaching
relationship between scheduled conversations: the place where a leader
continues to develop, reflect, practice, prepare, communicate, and integrate
what the coaching work opens.

It is the **first deployment** of the universal client development
environment this platform is built to be. Larry's practice is the first
instance, not the owner of the category.

**The triangle** (ratified 08-05, floor-plan amendments):
- the **coach's developmental framework** (Larry's process gives the room meaning)
- the **executive's real work** (decisions, pressures, application)
- **MAIA as continuity** (conversational presence within the coaching
  environment — opens the door, never owns the house)

**Governing sentence**: *Now What? does not replace the coaching
conversation; it extends the developmental arc between conversations.*

**It is NOT**: an AI app · a journal app · a dashboard · a course platform ·
a CRM · a practitioner admin system. Any surface that reads as one of these
has failed regardless of the code behind it.

### Constitutional reconciliation (binding on every pass)

The reset frames Larry's coaching relationship as the center of the client
experience. That is correct **as the organizing loop** — and it must not be
absorbed as ownership. Ratified canon holds:

- **The member's Field is the platform root.** The field is the member's,
  not Larry's. A lens may never become the owner's name for the experience.
- **The member is the authority boundary.** Only the member creates adopted
  meaning; adaptation keys on authored facts only.
- The door reads *"Your coaching work continues here"* — never *"Welcome to
  Larry's platform."* (Floor-plan ruling 2.)

Both are true at once: the coaching relationship is the center of the
client's *experience*; the member remains the center of *authority*.

### Engine and vehicle (explicit preservation directive)

The practitioner field system (Studio, practitioner notes lanes, Co-Lab
boundaries, provenance constitution) is the **engine**. The client
experience is the **vehicle**. The recent discovery is that the center of
gravity was wrong — not that the engine work was wrong. **Nothing on the
practitioner side is deleted or reverted by this reset.** It is re-ranked:
client experience leads; practitioner surfaces serve it.

## 2. Primary User & Human Loop

**Primary user**: a CEO/executive leader in Larry's coaching programs.
Developers, practitioners, and administrators matter, but the client
experience is the product. No surface is optimized for them first.

**The loop every capability must serve** (the coaching arc — phases of the
relationship, never app modules, never tabs):

> Coaching conversation with Larry → return to daily life → leadership
> challenges emerge → reflect, practice, explore (with MAIA) → keep what
> matters → the next conversation with Larry is deeper → leadership
> flourishes.

Arc vocabulary: **Prepare → Conversation → Apply → Reflect → Return.**

### CEO Journey Map (Deliverable 2)

The lived journey, mapped to what the environment does in each phase. The
first-30-seconds detail is `NOW_WHAT_GESTURE_ARCHITECTURE.md` and governs.

| Phase | Lived moment | The environment's part | Grounded in |
|---|---|---|---|
| Return | Opens Now What? days after a session, carrying something unformed | Recognition · relationship line · one invitation: *"What are you working through today?"* | Gesture arch. §first-30s |
| Reflect / Explore | Talks it through with MAIA | Hearth conversation; continuity only from what they explicitly carried | Floor plan §Hearth |
| Keep | Chooses what matters | Keep gesture at close; the table gains it, visibly, by their act | Gesture grammar |
| Apply | Lives it — decisions, pressure, practice | The kept item is theirs to pick back up; no nudges, no homework framing | Floor plan §adaptation boundary |
| Prepare | Session with Larry approaches | What they chose to share is with their coach; they arrive already mid-thought | Shared-with-coach marker |
| Conversation | Session with Larry | **Off-platform (or Session Room).** The platform steps back | Positioning amendment |

Design laws in force for all of it: **Inhabitable Architecture**
(`docs/design/INHABITABLE_ARCHITECTURE.md`) — human intent before system
capability; relationship before technology; simplicity outside, depth
inside; and **no construction site**: no "coming soon," no roadmap items, no
empty containers explaining themselves. The room is complete without
content (gesture architecture: absence is a beginning, never an essay).

## 3. Client Experience Architecture (Deliverable 3)

**Already ratified — not reopened by this reset.**
`NOW_WHAT_EXPERIENTIAL_FLOOR_PLAN.md` (approved with refinements, Kelly
2026-08-05): Threshold → Hearth (with Living room as its visible condition)
→ Study/Archive as emergent capabilities → Coach relationship as persistent
quiet presence. Rooms are builder vocabulary; the house is felt, not
diagrammed. The five 08-05 amendments (executive-register doorway, threshold
names the relationship, MAIA never owner, capabilities-not-rooms, design for
the unformed) are binding.

The reset prompt's five CEO intentions map onto this architecture as
follows — this is the check that the architecture is sufficient, and it is:

1. *Continue my coaching* → Threshold + Hearth (exists in v1 room)
2. *Engage my program* → Study-class capability (NOT in v1; gated — see roadmap)
3. *Work through challenges* → Hearth + the table of kept items (v1)
4. *Communicate* → shared-with-coach marker (v1, one-way declare) + Session Room (later)
5. *See development over time* → Archive door (v1 quiet door; fuller in v2 continuity)

## 4. Existing Capability Audit (Deliverable 4)

Inventory taken 2026-08-05 against trunk `main` + this working tree.
**The capability map serves the product definition; it does not define
it.** The audit answers *what exists, what works, what is reusable* — never
*what Now What? should become.* Accordingly, classification is
**loop-relative**, not available/not-available:

- **1 — Exists and completes the loop** (§5)
- **2 — Exists but requires translation** (right substance, wrong shape or register)
- **3 — Exists as infrastructure only** (technically real, no client experience)
- **4 — Missing but required** (the loop cannot close without it)
- **5 — Future possibility** (real, but not owed to the smallest loop)

Provenance (corrected after verification 2026-08-05): **everything below,
including the doorway trio, is on trunk `clean-main-no-secrets` and
deployed** (production `GIT_COMMIT=8a6aad214`, PR #967). The audit agent's
initial "working-tree-only" claim measured a stale local `main` referent.

| Capability | Class | State (one line) |
|---|---|---|
| Doorway room (ClientHome) | **1** | Renders the v1 target: recognition, relationship line, one door, kept thread, boundary sentence; read-only, one member-scoped call. **Shipped + deployed (PR #967 → `8a6aad214`)** |
| MAIA conversation (`/now-what/room`) | **1** | The Hearth — clean, coaching-oriented, member-scoped (the `/maia` shell is a parallel flag-laden environment, not this product's door) |
| Member notes / field threads | **1** | `member_field_note_threads` + field-note routes — the substrate the kept thread and Return movement run on |
| Commitments / decisions / reflections | **2** | Exist as typed tags on the thread table, correctly attributed; need translation into a lived keep-and-pick-up loop, not new object types |
| Practitioner relationship view | **2** | Coach name + one focus line exist; the relationship line renders — session history and upcoming-session are absent (future) |
| **Coach read seam** (shared items readable by Larry) | **4** | The projection seam itself is **merged + deployed** (PR #937, `0d351e441` ∈ `8a6aad214`); PR #938 (Bring Forward — the member-authorized shared artifact) is **open, unmerged**. Remaining missing-but-required work: merge #938, then reconcile the Home's `member_field_note_threads` "brought into your coaching" marker with the `coach_client_shared_items` snapshot substrate so what a member brings forward is what the coach actually reads |
| Session Room (P2P call) | **3** | Transport-only consent-gated call room with no path from Home; practitioner recording room separate; no client experience yet |
| Communications (client↔coach messages) | **3** | Full messaging infrastructure exists; UI is practitioner/portal-side — a signed-in member cannot message their coach |
| Memory (atoms / Keep / moments under `/maia`) | **3** | Rich machinery organized as psyche-portfolio taxonomy; Now What does not read it — see reconciliation debt below |
| Lab Tools / My Lab | **3** | Intent-organized shelf, but a 60-tool builder taxonomy unlinked from the coaching journey |
| Programs / curriculum | **5** | Practitioner authoring exists; member sees only a self-declared position line. **IP-gated**: no content until the instrument is signed |
| Calendar / upcoming session | **5** | Prospect booking exists on the portal only; encounters may promote this |
| Resources shared to client | **5** | Practitioner materials exist; no shared-to-me route; not owed to the smallest loop |
| Practitioner notes | — | Outside the client loop by design (held practitioner lanes; correctly separated from member notes) |

**Named gaps** (each becomes an encounter-sequenced roadmap candidate, not
an immediate build): no client↔coach message surface for a signed-in
member · no client-visible upcoming session, and no bridge from Home to the
live call room · no shared-to-me resources route · `shared[]` from the Home
API is rendered only as a count sentence, not a browsable list.

**Named reconciliation debt (recorded, NOT authorized for fixing under the
FREEZE)**: two parallel member-memory systems — `psyche/portfolio` atoms +
Keep under `/maia`, vs `member_field_note_threads` under Now What. Now What
does not read atoms. Unifying them is an architecture change and waits for
its own ruled lane.

Known constraints the audit sits inside (from governed memory, verified
rulings):
- **Larry's IP / program corpus is NOT in the repo** (verified absent), and
  the rights instrument exists but is **unsigned**. Therefore "Engage my
  program" is *missing by fact, not by oversight* — and must stay out of
  the client room until content exists under a signed instrument.
- **Practitioner read seam (Gate 0 G3)** is the named critical path for the
  coach side of the loop.
- `sessions.notes` plaintext PHI and #890 practitioner-notes hold are real
  but practitioner-lane issues — outside this client-experience scope.

## 5. Smallest Complete Client Loop (Deliverable 5)

**The proof point is not "all coaching functionality exists." It is: does
the developmental arc survive between conversations?** The loop, stated in
the relationship's own rhythm:

> **Before conversation** — the member arrives with context, reflection,
> or intention. → **During** — the coaching relationship creates insight
> and direction. → **After** — the member carries forward reflection,
> commitments, developmental movement. → **Return** — the member finds
> continuity rather than starting over.

Operationally, the smallest experience that makes Larry's coaching more
powerful — nothing less counts as shipped, nothing more is v1:

1. **Arrive**: client opens `/now-what`, is recognized, sees the
   relationship line and one door. *(Built — doorway room, working tree.)*
2. **Converse**: enters the Hearth, works through something real with MAIA.
   *(Exists — `/now-what/room`.)*
3. **Keep**: at close, keeps what mattered in their own words; the table
   visibly receives it. *(Exists in part — Keep slice; audit confirms the
   in-room close gesture.)*
4. **Return**: days later the room shows their kept thread and one
   continuation line — *"pick it back up."* *(v1 renders it; the carried
   thread is the room's proof of memory.)*
5. **Deepen**: what they chose to share is readable by Larry before the next
   session. *(The one seam likely missing — G3. This is the loop's last
   mile and the roadmap's first post-encounter build item.)*

The loop is complete when a real client does 1–4 unaided and Larry reads a
shared item before a real session (5). Not before.

## 6. Implementation Roadmap (Deliverable 6)

Sequenced by the founder-set post-deploy order in
`NOW_WHAT_EXPERIENCE_GAP.md`; the FREEZE governs between steps. **The only
valid input after each ship is a person encountering it.**

| # | Step | Nature | Gate |
|---|---|---|---|
| 0 | ✅ **SHIPPED** — doorway room (v1, "The Room"): PR #967 merged, deployed, prod-verified at `GIT_COMMIT=8a6aad214` (2026-08-05) | Done | Screenshot truth layer + founder look satisfied pre-merge |
| 1 | **Larry encounter** | Evidence, not build. Pre-registered observations in the gap doc (final wording in lane memory) | No in-walk fixes. **This is the next human action — the room is live and waiting** |
| 2 | **One executive encounter** | Evidence | ⚠️ blocked on **D9** (client-research recruitment authority) — founder ruling required. **The executive version is never extrapolated from the coach encounter; the human loop may differ, and D9-gated research is where that is learned** |
| 3 | Session Room improvement | Build, scoped by encounter findings | Existing Session Room lane rules (dual-channel attribution walk) |
| 4 | Continuity loop (v2): "something meaningful is carried forward" + coach read seam (G3) | Build | v1 explicitly does not claim this |
| 5 | Program layer ("Engage my program") | Content + build | **Signed Larry IP instrument first** — until then: no embedded curriculum, no ingestion of proprietary materials, no assumption that the platform contains the method. The environment supports the relationship without absorbing the intellectual property |

**Not authorized by this roadmap**: new rooms, navigation redesign, new AI
features, architecture changes, any surface whose justification is "the
capability exists."

### Build authorization (founder, 2026-08-05, post-review)

The reset document was reviewed and accepted; build mode is entered in
narrow sprints. The freeze is **selective**: it fences architecture
changes, IP assumptions, and capability harvesting — it does **not**
freeze the encounter loop. *"Everything not necessary for the smallest
complete loop waits"* replaces *"nothing moves until everything is
resolved."*

- **Sprint 1 — Ship the doorway**: ✅ already complete (step 0 above).
- **Sprint 2 — Close the coach loop (G3 seam)**, with the **founder-ruled
  semantic scope** that previously blocked this build (the "semantic
  authority unruled" hold is hereby resolved):
  - Larry sees: what the client **explicitly chose to share** · the
    **member's own words** · the **relationship context**.
  - Larry never sees: private MAIA conversations · practitioner notes
    rendered as member material · **inferred insights** · hidden memory.
  - Constitutional anchor: *only the member creates adopted meaning.*
  - Substrate state: #937 (projection seam) merged + deployed; #938
    (Bring Forward artifact) open, retargeted to trunk, awaiting founder
    merge — **never auto-merged**. Post-merge: full
    `deploy-production.sh deploy <SHA>` (migrations required — quick
    `deploy-maia` runs none), then the ruled synthetic journey.
- **Sprint 3 — Encounter before expansion**: build → Larry uses →
  observe → adjust. Never build → imagine → expand.

---

*The question is not "what can we build?" It is: what is the simplest
complete experience that makes Larry's coaching more powerful — and the
answer is the loop in §5, encountered by real people in the order of §6.
Every next artifact emerges from the intersection of product definition ×
capability reality × human loop — never from the feature inventory.*
