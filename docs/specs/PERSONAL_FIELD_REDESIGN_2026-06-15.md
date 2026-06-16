# Personal Field — Field States & Redesign

- **Date**: 2026-06-15
- **Status**: Design exploration. **Not authorized to build.** Each module/cut requires its own go (per project gate discipline).
- **Author**: design pass with Kelly
- **Supersedes the working assumption that**: Personal Field opens on Threshold.

> **Reconcile with the prior same-day Kelly directive** (memory `project_personal_field_attend_to_life`): it **paused the visual redesign** pending an *episode-grounded* case-study library, and held the field-object list as a **hypothesis to test, not a schema to fill**. This doc moved faster. Two honest gaps: the §2 case studies are *screen/feature-shaped* (what you'd see on the page) rather than **episodes of attending** (coded for the verb — tending / deciding / returning-to / making / worrying-about), the exact framing the directive said to escape; and §3 presents the taxonomy as *derived* rather than provisional. **Treat the redesign and Cut 0 as a hypothesis of where this lands, not an emerged result.** Before building Cut 0: (a) re-ground the cases as episodes, ideally with a few of Kelly's real ones; (b) test the candidates that surfaced in the raw cases but got folded into Threads/Inner-states — **Loss/grief, Body/health, Resources/means** — as possibly distinct objects; (c) resolve whether Commitments and Decisions are one object in two states, and whether Places is a quality rather than an object.

---

## 0. The correction this fixes

The current Personal Field opens on **The Threshold** — a six-week developmental sequence ("Week 0 of 6", "Orientation", "This week's practice"). Three problems:

1. **Threshold became the whole field.** It is one room. It should not be the front door.
2. **Personal Field is not a productivity dashboard, CRM, or curriculum.** It is where a person *encounters their life* — relationships, commitments, meaning, attention, becoming.
3. **The scope selector is cosmetic.** `MODE_CONFIG` in `components/studio/TeamSwitcher.tsx` only sets a `label`/`icon`/`description`. Choosing "Personal Field" vs "Practice Portal" does **not** swap the module set or interface. It should.

The governing lens is the **Ganesha model** (ADHD / attention support), which inverts the usual product question:

> Not "what should a productivity app show?"
> But "what reduces cognitive load and helps someone regain orientation in ~15 seconds?"

The design principle beneath it: **executive function should be externalized.** Threshold asks the member to hold the structure in their head. Personal Field should hold the structure *for* them — and then release them back into their life.

---

## 1. Design principles

1. **Encounter your life, not your program.** The page shows the living field, not a curriculum position.
2. **Orientation before development.** Answer "what is alive / who needs me / what was I doing" *before* "where am I in a sequence."
3. **Externalize the structure.** The page holds people, threads, commitments, and continuity so the person doesn't have to.
4. **Attention over efficiency.** This is not optimization. It is staying in relationship with what matters. (Aligns with `docs/canon/MAIA_ATTENTION_DOCTRINE.md`.)
5. **Orient and release.** A sovereign home gets you oriented fast and returns you to your life — it does not become a place to dwell. The 15-second target *is* the sovereignty safeguard: it resists becoming a new dependency surface. (Aligns with `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — "reduce the system's psychological centrality over time," "push life outward into the world.")
6. **Field objects, not app objects.** The page is built from People, Threads, Commitments, Inner states, Questions — not weeks, modules, lessons.

---

## 2. Field-state case studies (the research)

Not product personas. **Real field states** — what a person sees when they open Personal Field. Read for the recurring *objects*, not the people.

### 1 — Kelly (founder building MAIA)
- **Alive right now**: Elemental Alchemy manuscript · MAIA memory restoration · tester launch
- **Asking you**: Nathan (deployment review) · Jondi (3 days ago, no reply)
- **Continue**: Session Room architecture
- **Today**: 2 meetings · 1 decision pending
- **Reflect**: "What's most alive today?"
- *Reveals*: threads, people-waiting, continuity, commitments, a live question.

### 2 — Therapist (her own life, Personal scope — not clients)
- **Alive**: own supervision relationship · an upcoming retreat she's attending
- **Asking you**: a friend she keeps meaning to call · sibling's birthday this week
- **Continue**: personal journal thread "boundaries at work"
- **Inner weather**: tired
- *Reveals*: the Personal/Practice split is real — her *clients* belong in Practice Portal; her *life* belongs here.

### 3 — Painter (preparing a gallery show)
- **Alive**: current body of work · the show install
- **Asking you**: gallerist (loan agreement) · framer (deadline)
- **Continue**: the canvas she stopped mid-stroke
- **Keep**: a dream note captured last night
- *Reveals*: Creations are first-class; Keeps catch the fleeting.

### 4 — Mid-life transition (divorce + career pivot)
- **Alive**: separation logistics · exploring a new field of work · health
- **Asking you**: lawyer · a recruiter · his daughter
- **Reflect**: thread — "What is ending? What is beginning?"
- **Inner weather**: unsettled
- *Reveals*: threads can be heavy and slow; the page must hold endings, not just tasks.

### 5 — Mother of two (the "Kids Summer" field)
- **Alive**: summer camp logistics · a family trip · her own neglected creative project
- **Asking you**: pediatrician callback · co-parent re: schedule
- **Today**: pickup at 3 · dentist at 4:30
- **Reflect**: "Where am I in all of this?"
- *Reveals*: caregiving fields are dense and time-bound; the *self* thread is the one most easily lost.

### 6 — Novelist (mid-manuscript)
- **Alive**: the manuscript (one dominant thread)
- **Continue**: chapter 9, where she left off
- **Keep**: three idea fragments captured this week
- **Asking you**: agent (waiting on revised outline)
- *Reveals*: one thread can dominate; "Continue" is the single highest-value card for deep work.

### 7 — Grief (recent loss of a parent)
- **Alive**: estate matters · the grief itself, named and held
- **Asking you**: siblings · the funeral home
- **Reflect**: "What do I need today?"
- **Inner weather**: heavy
- *Reveals*: the page must hold a state that is not a task and not a goal. Attention, not progress.

### 8 — Caregiver (aging father, dementia)
- **Alive**: father's care · own marriage · work
- **Asking you**: care facility · brother (shared decisions)
- **Today**: visit at 2
- **Inner weather**: stretched
- *Reveals*: recurring people + recurring commitments; the relief is *not having to remember* — externalized executive function in its purest form.

### 9 — Graduate student (finishing a dissertation)
- **Alive**: dissertation · job market · funding
- **Continue**: the chapter draft
- **Asking you**: advisor (waiting on draft) · a recommender
- **Today**: defense scheduling
- *Reveals*: deadlines + a long thread + a few critical people.

### 10 — Early recovery / health rebuild (day 90)
- **Alive**: sobriety practice · sleep · movement
- **Practices**: Daily Anchor (streak) · a contemplative practice
- **Reflect**: "What's underneath the urge?"
- **Inner weather**: steady
- *Reveals*: this is the one field state where **Practices** legitimately rises near the top — and even here it's *one* zone, entered intentionally.

### 11 — Relationship repair (one partner's view)
- **Alive**: the relationship · couples work · a shared trip being rebuilt
- **Asking you**: partner (a conversation owed) · therapist (scheduling)
- **Reflect**: thread — "What am I willing to own?"
- *Reveals*: a relationship is itself a thread, not just a contact.

### 12 — Recently relocated (new city)
- **Alive**: building community · the new job · finding a home
- **Asking you**: two new acquaintances to follow up · landlord
- **Places**: neighborhoods being explored
- **Inner weather**: lonely / curious
- *Reveals*: Places appear; People are sparse and *worth* surfacing precisely because they're few.

### 13 — Retiree (reorienting around meaning)
- **Alive**: a legacy project · grandchildren · health
- **Continue**: memoir she's writing
- **Asking you**: an old friend · her doctor
- **Reflect**: "What wants to be passed on?"
- *Reveals*: no deadlines, no program — pure field. The strongest argument that Personal Field ≠ task manager.

---

## 3. Pattern extraction — the field objects

Tallying what recurs across all 13 states, in rough frequency order:

| Field object | Appears in | What it is |
|---|---|---|
| **People in the field** | all 13 | Who matters; *some asking attention* (waiting, owed a reply, a date coming) |
| **Threads** | all 13 | What I'm carrying — book, business, family, health, the relationship, the grief. Slow-moving domains, not tasks. |
| **Commitments / Today** | 11 | Time-bound or owed — meetings, due decisions, promises made |
| **Inner weather** | 9 | How am I (steady / heavy / stretched / lonely). A state, not a goal. |
| **Continue** | 8 | What I was in the middle of — pick up where I left off |
| **A live question / Reflect** | all 13 | One open question; the door to MAIA |
| **Creations** | 6 | Works in progress — manuscript, canvas, project |
| **Practices** | 4 (top in 1) | Threshold, Daily Anchor, contemplation — entered intentionally |
| **Places** | 2 | Where I am / where I'm going |

This confirms the prediction: the constituents of a lived field are **People, Threads, Commitments, Inner states, Questions, Creations, Practices, Places** — not weeks, modules, lessons. **Threshold is one object in the smallest-but-real category (Practices).**

---

## 4. The redesigned Personal Field home — "What is alive right now"

Section order is the Ganesha 15-second scan: orientation first, navigation quiet, Practices demoted.

1. **Header** — greeting + date + a light **inner-weather** chip (one tap: steady / heavy / stretched / curious…). Optional, never nagging.
2. **Today** — the few time-bound things: meetings, a due commitment, a pending decision. (calendar + tasks + decisions)
3. **Asking you** — people waiting / follow-ups owed. The single most Ganesha card: *stay in relationship with what matters.* (relationship field + contacts + comms + tasks)
4. **Continue** — pick up the thread you were mid-stream on. (derived from recent field activity)
5. **Alive right now** — the 3–5 currently-warm field objects (not all of them). **Mixed objects — people, questions, creations, commitments — not just initiatives** (see §9.2). (field records / rooms + relationship field)
6. **Reflect with MAIA** — one open question.
7. **Navigate** (quiet, demoted) — People · Field Map · Calendar · Keeps · Tasks · **Practices** (→ Threshold, Daily Anchor, Contemplation).

Empty/quiet states are graceful, never "nothing working": *"Your field is quiet. Nothing is asking for you right now."* (per `feedback_empty_state_emotional_interpretation`).

What's gone from the front door: "Week 0 of 6," the program scaffolding, and the mode-wrong "Name this as a service" CTA (that belongs in Practice Portal).

---

## 5. Information architecture

### Personal Field nav (module set)
`Home · Today/Calendar · People · Field Map · Keeps · Reflections · Tasks · Practices`
where `Practices → { Threshold, Daily Anchor, Contemplation, Guided Journeys }`.

### Practice Portal nav (for contrast — proves the scope-shift)
`Caseload/Clients · Sessions · Scheduling · Comms · Services · Session Room · Metrics`

Threshold keeps its existing "Week N of 6" program UI — but only when a member *intentionally enters* it from Practices, not as the landing page.

---

## 6. Scope-shift behavior (the one real code seam)

Today `MODE_CONFIG` is cosmetic. To make scope meaningful:

1. Give each mode a `modules` array (the nav set above) in `MODE_CONFIG`.
2. Have the Studio left nav (`app/studio/layout.tsx`) render from the active mode's `modules`, not a static list.
3. Route `/studio` / `/studio/field` to render the **Personal home** (Section 4) when mode = personal, and the Practice home when mode = practice.
4. Threshold leaves Personal's top level → nested under Practices.

This is the smallest change that makes "choosing Personal Field actually shifts the field" true.

---

## 7. Reality check — substrate status (built ≠ wired ≠ surfacing)

Most of this is **surfacing existing substrate**, not building it. (Migrations cited from `database/migrations/`.)

| Module / card | Status | Substrate |
|---|---|---|
| Today / Calendar | **Live** | `calendar_events` (20260407000005), google/microsoft sync; `/studio/calendar` |
| Tasks | **Live** | `studio_tasks` (20260202200001), `tasks_adhd_support` (20260211000001), `focus_tasks`; `/studio/tasks` |
| Keeps | **Substrate live, surface it** | `member_keep_preferences` (20260521000003) |
| Vault | **Live** | `vault_symbol_index` (20260108000001); `/studio/vault` |
| Daily Anchor | **Live, member-facing** | `member_daily_anchor` (20260519000001); `lib/maia/dailyAnchor.ts`; `/maia/anchor` |
| Reflections | **Substrate exists** | `reflection_capsules` (20260122000001), `pattern_reflections`, `mentor_reflections`; scribe |
| People | **Substrate exists, UNSURFACED** | contacts via `session_artifacts_and_contacts` (20260406000001) + `relationship_field_v1` (20260403000001). **No `/studio/people` route** — add the edge. |
| Field Map / Threads | **Substrate exists, needs framing** | `field_records` (20251230000005), `field_rooms` (20260211000001), `field_kanban`, `field_activity_log` (20260320000001), `circle_living_fields` (20260402100001) |
| Continue | **Derivable, no new schema** | `field_activity_log` |
| Asking you | **Derivable** | relationship field + tasks + decisions + comms |
| Reflect with MAIA | **Live** | scribe / maia |
| Inner weather | **Net-new UI; partial backing** | `coherence_field_readings` (20260115000005), `/api/studio/energy`, daily-log |
| **Scope-shift module swap** | **Not implemented** | `MODE_CONFIG` is cosmetic — Section 6 |

Read: the redesign is mostly **"find the missing edge, not the missing thing"** (`feedback_find_the_missing_edge`) — the nodes exist; Personal Field just doesn't surface them. Genuinely net-new: *Inner weather* as a UI, *thread* as a first-class life-organizing object, and the *scope-shift* wiring.

---

## 8. Suggested staging (each its own go)

- **Cut 0 — Demote Threshold + Personal home shell. (Proposed — pending episode-grounding, see §9.5.)** New `/studio/field` Personal home (Section 4), Threshold moved under Practices. Derive Today / Asking-you / Continue / Alive-right-now from substrate that already exists; inner weather cosmetic only. Highest value, lowest risk, no new schema.
- **Cut 1 — People edge.** Surface `/studio/people` from existing contacts + relationship field.
- **Cut 2 — Field Map / Threads.** Frame `field_records`/`field_rooms` as "threads I'm carrying."
- **Cut 3 — Scope-shift wiring.** `MODE_CONFIG.modules` + nav reads from mode (Section 6).
- **Cut 4 — Inner weather.** Net-new, smallest surface, backed by energy/coherence — only after the above land.

**Open questions for Kelly**
1. Which field objects are in the v1 home (all of Section 4, or a tighter set)?
2. Is "Practices" the right name for the room Threshold moves into? (alt: Pathways / Journeys / Orientation)
3. Does "Inner weather" earn its place at the top, or is it a quieter check-in lower down? *(Partly resolved by §9.3–9.5: cosmetic seam in v1, control surface in v2.)*

---

## 9. Refinements from design review (2026-06-15)

Kelly's review of the home mockup validated the direction — *"it already feels like a field, not a dashboard… I don't think 'what program should I run?' I think 'what is my life asking of me right now?'"* — and sharpened four things. (Resolves open questions 1 and 3.)

### 9.1 "Asking you" is the center of gravity
Confirmed strongest section: relationships, not tasks. *"I instantly understand my field — not because they're tasks, because they're relationships."* Keep it first among the response sections.

### 9.2 "Alive right now" should be mixed field objects, not initiatives
As mocked it still reads as projects (Elemental Alchemy, tester launch…). The field doesn't separate categories — life carries People, questions, creations, and commitments together. Target a *mixed* set, e.g. `Elemental Alchemy · Nathan · graduation season · tester launch · memory restoration`.

**Boundary vs "Asking you"** (so the two sections don't collapse):
- **Asking you** = an *open loop* — something owed or pending (a reply, a decision, a date approaching). Action-shaped.
- **Alive right now** = *warm presence* — what is central *whether or not it's asking anything*. A person can be alive in the field without owing you a reply (Sophie in graduation season). Attention-shaped.

### 9.3 Orientation → re-orientation: time and weather are two different axes
The mockup nails *orientation*. The next test is *re-orientation* — the same screen at 7am / 2pm / 10:30pm answers different questions. The load-bearing insight: there are **two distinct control variables**, and conflating them muddies the design.

| Axis | Source | What it changes |
|---|---|---|
| **Time of day** | automatic (clock) | the *framing question* + section order |
| **Inner weather** | deliberate self-report | the *density and tone* — how much to surface |

- **Time of day** reframes: morning → "what matters today?"; midday → "what's slipped that still matters?"; evening → "what's still alive — and what can be put down?"
- **Inner weather** modulates volume: *stretched* → show less, only what's truly asking (protect the person); *grounded / curious* → show more, including generative threads.

This is why the inner-weather chip is not decorative — it is the seam for the one genuinely new mechanism in the architecture.

### 9.4 Sovereignty safeguard on adaptation
Time/weather adaptation changes *emphasis and framing only* — it never withholds the field or prescribes a mood. The person can always reach everything; MAIA never decides how they should feel at a given hour (no guru stance). The **evening lens is orient-and-release** — help the person put the day *down*, not audit what they failed to finish. Prefer *"what's still alive"* over *"what you dropped"*: same data, but the latter frames the day as an audit and invites shame (against `MAIA_ATTENTION_DOCTRINE.md`). Aligns §1.4–1.5.

### 9.5 Cut 0 — proposed (redesign still paused pending episode-grounding)
Kelly stated this Cut 0 *this* session; the prior same-day directive paused the redesign until episode-grounded cases exist (see banner up top). So this is the **proposed** scope — to confirm after re-grounding, not a lock.
1. Demote Threshold into Practices.
2. Build the Personal Field home shell.
3. Populate from existing substrate: **Today · Asking you · Continue · Alive right now**.
4. Inner weather stays **cosmetic** in v1 (seam only).
5. No new schema; surface existing nodes.

Re-orientation (time + weather → emphasis/density, §9.3) is the **named v2 candidate**, to be learned from real usage of Cut 0 — *"let real usage teach you what the missing objects are."*

---

## 10. Verb-first hypothesis (2026-06-15) — the source-of-truth shift

Kelly's advance, recorded as the **new primary hypothesis** to test against episodes (supersedes §3's noun-taxonomy as the thing being tested):

> **A field may be organized by the relationship the person currently has to a thing — the *verb* — not by what the thing *is* — the noun.**

Candidate verbs: `holding · returning-to · waiting-on · carrying · deciding · making · grieving · tracking · remembering · letting-go`.

Three consequences:

1. **The mockup's sections are already verbs.** *Asking you* = waiting-on / owed (open loop). *Alive right now* = holding / present-to (asking nothing). *Continue* = returning-to / making. The home was already a **verb surface**; §3's object list was the regression to nouns. Verb-first doesn't tear down the mockup — it tells us the *sections* were the find and localizes the error to the taxonomy. The field is a **verb surface over a noun substrate.**
2. **The verb is temporal; the object persists.** The same object moves through verbs over time (Nathan: made-with → waiting-on → present-to). Substrate stores objects; the field renders the **current verb**. This resolves the earlier "Commitments vs Decisions = one object, two states" question — one object under a changing verb (*deciding → decided/owed*) — and gives "unfinished but not incomplete" a home: *carrying*, not *finishing*.
3. **Behavioral verbs can be inferred; meaning verbs must be named.** *Returning-to* (reopen count), *waiting-on* (inbound, unanswered), *tracking* (recurring touch) are **behavioral** — the field can notice them for you (executive function externalized). *Grieving · letting-go · holding-sacred* are **meaning-laden** — they belong to the person to name (Meaning Sovereignty). The system surfaces the behavioral verb and *invites* the meaning verb; it never assigns the latter.

**Watch the ninth as a verb, not a noun.** The noun list is nearly saturated; lived attention varies more in the *relationship*. A recurring verb with no home in the mockup's sections is the architecture-changing signal.

### Episode elicitation (Kelly's instrument, preserved — ignore screens, pull for the verb)
1. What did you reopen three times in a week — not urgent, just wouldn't leave you alone? *(returning-to / carrying)*
2. What is alive in your life that requires nothing today? *(present-to / holding)*
3. What do you keep mentally carrying because you don't trust it's placed anywhere reliable? *(holding / the executive-function gap)*
4. When did you last feel lost in your own field — what were you trying to orient to? *(orienting)*
5. What feels unfinished but not incomplete? *(carrying, not finishing)*

### Coding scheme (per episode)
`trigger → felt-need → VERB (relationship-to) → object → temporal stance (needs-nothing / owed-now / unfinished) → behavioral-or-meaning`. Cluster by verb. A recurring verb absent from the mockup's sections = candidate new section. The 13 §2 case studies are **test data** against this, not source data.

---

## 11. Live module audit + held routing fix (2026-06-15)

Prod report (Kelly): *"personal and practitioner field are the same on startup."* Investigation **corrects** the earlier "MODE_CONFIG is cosmetic" read — the mechanism works; the identity is thin.

`getVisibleModules` (`lib/studio/moduleDefinitions.ts:389`) filters the nav by `studioMode` against each module's `mode` tag. Audit of `MODULE_DEFINITIONS`:
- **Practice-only (14):** clients, caseload, sessions, scheduling, booking, services, calendar, tasks, comms, groups, portal, marketing, teams, command_center
- **Personal-only (2):** decisions, changes
- **Shared `both` (9):** threshold, maia, media, vault, scribe, camera, code, tools, settings

So Personal Field = 9 shared modules + **2** exclusive ones, on a `/studio/field` landing that is **mode-agnostic** (`app/studio/field/page.tsx` never reads `studioMode`), with **no re-route on mode switch**. The nav filter verifiably works (the prod screenshot shows decisions/changes present, clients/sessions absent) — so the sameness is **structural, not a broken toggle**. This is the quantified form of "Personal Field isn't its own thing yet": its entire distinct identity is two modules.

**Decision (Kelly 2026-06-15): HOLD the routing fix; fold into this redesign; use the audit as evidence.** A routing/landing patch would make the two modes *look* separated while the structural thinness remains — manufacturing the appearance of resolution. *"Do not patch prod just to create visual separation."* **Visual separation ≠ structural identity** — the project's anti-inflation discipline at the UX layer.

**Carry-forward order — not a hotfix:** define the Personal module set **from the episode-grounded case studies / protocol**, then routing + landing follow. Candidate set — **HYPOTHESIS, not settled:** People · Field Map · Keeps · Reflections · possibly Patterns / Thresholds / Decisions. And "define the module set" is the **object-axis** framing — itself gated on the protocol's §6 axis decision (§10): if the field proves verb-organized, the set may be *stances*, not noun-modules. Sequence: **episodes → axis decision → module/stance architecture → routing/landing.** ("module/stance," not "module set" — the name itself must not presume the object axis.)

---

## 12. Two-axis "field shifts" requirement (2026-06-15)

Requirement (Kelly): the field must shift across **both** selectors — **mode** (Personal Field ⇄ Practice Portal) **and** **scope** (Personal ⇄ Team Soullab ⇄ Kids Summer ⇄ any co-lab/group).

**Verified current state — the field shifts on NEITHER axis (content-wise).** `/api/studio/field/pulse` scopes queries **only by the current user**: `studio_changes WHERE practitioner_id=$1`, `studio_decisions WHERE practitioner_id=$1`, `threshold_events`/`state_vectors WHERE member_id=$1`. **No `team_id` filter; no `studioMode` branch.** So Team Soullab, Kids Summer, and Personal all return the identical field (explains the identical "Still Alive" cards across scopes). The client stores `{teamId, includePersonal, studioMode}` in **localStorage** (`studio_team_context`) and **never transmits `teamId`** to the field API — so even the wiring to pass scope is absent.

**Substrate IS scope-ready:** `studio_changes.team_id` + `studio_decisions.team_id` exist, FK→`studio_teams`, indexed (migrations `20260212000001`, `20260208000002`). The rows know their co-lab; the query ignores it.

**Two distinct pieces, different natures:**
- **A — Scope-shift (functional correctness, substrate-ready).** Transmit selected `teamId` + `includePersonal` to the field API; filter changes/decisions by it (Personal = `team_id IS NULL`; Team X = `team_id=X`; +personal = `team_id=X OR team_id IS NULL`). This is *correctness*, **not** the visual-separation theater held in §11 — showing the selected co-lab's field is simply right behavior. Wrinkle: `threshold_events`/`state_vectors` are member-scoped (no `team_id`) → decide whether a co-lab has its own threshold/alive-state or those stay personal.
- **B — Mode-identity (architectural, paused).** What Personal Field *is* (its module/stance set, §11) — episode-gated; stays held.

**Open decision:** build A now as a functional fix (substrate-ready, outside the §11 visual-separation hold), or fold A into the held redesign with B? B is paused regardless. Mode-level field-content differentiation (beyond the existing page-level personal→/studio/field vs practice→/studio command-center split) belongs with B.

**Build status (2026-06-15): A BUILT + locally verified, NOT deployed.** 7 edits / 4 files: `pulse/route.ts` (scope filter, `$2=teamId`; threshold/state untouched), `field/page.tsx` (`useTeamContext` → sends `teamId`/`includePersonal`, refetches on scope change), `changes/new` + `decisions/new` (tag new items with active `teamId` read from `studio_team_context` localStorage; create API already persists `team_id`). #3 (includePersonal default true) was already satisfied — no edit. Verified: `npm run typecheck` exit 0; read-side filter against prod data — Personal = 17 changes, co-lab strict = 0, co-lab + includePersonal = 17. Teams: Team Soullab `6c015931…`, Kids Summer `8f79f059…`. **Visibility:** existing 48 rows stay personal (NULL) → shift surfaces only as NEW items are created inside a co-lab. Edits sit on `fix/admin-auth-require-session` (mixed with admin-auth) → clean ship = own branch off `clean-main-no-secrets` → PR → deploy (gated, not done).
