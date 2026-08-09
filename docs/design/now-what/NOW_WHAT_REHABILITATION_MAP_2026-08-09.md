# Now What? — Rehabilitation Map (forensics + audit)

**Date:** 2026-08-09
**Status:** AUDIT ONLY — no implementation. Stops for founder authorization.
**Directive:** Founder, "Now What? — Existing Build Rehabilitation" (rehabilitate the existing build; optimize for minimum total cost to the coherent product, not minimum diff).
**Method:** Static forensics of the production commit tree, the trunk tree, and the working branch; repo-wide substrate audit of migrations, API routes and surfaces. No production database reads. No live authenticated walk.

---

## ⚠️ CORRECTION — 2026-08-09 (later same day), founder-directed

**Nothing below is deleted.** The original findings are preserved as audit history. This block records
what a subsequent evidence pass falsified, what it confirmed, and what it re-frames.

**Method of the correcting pass:** fresh `git fetch origin clean-main-no-secrets`; ancestry by
`git merge-base --is-ancestor`; live DOM read of the rendered Home; a walked authenticated dev server
at trunk tip; inspection of the running production container's own build artifacts. Evidence file:
`NOW_WHAT_FIVE_DOOR_TRACE_2026-08-06.md` (scratchpad).

### FALSIFIED — §0, §G, and implementation-sequence item 0

Production `b1399f693` **is** an ancestor of trunk `ced4ab513`. Measured:

```
git merge-base --is-ancestor b1399f693 origin/clean-main-no-secrets   → YES
git rev-list --count origin/clean-main-no-secrets..b1399f693          → 0   (prod commits absent from trunk)
git rev-list --count b1399f693..origin/clean-main-no-secrets          → 4   (trunk ahead of prod)
git log origin/clean-main-no-secrets..b1399f693 -- app/now-what …     → (empty)
```

`ca8d1cac9` (the five-room ontology) is on trunk, merged via `6c0af7928` (PR #985). The claimed
merge-base `7c9dd5192` and the "sixteen now-what commits live in production and absent from trunk"
do not reproduce. **Most probable cause of the original reading: a stale local `clean-main-no-secrets`
ref (measured before fetching), the same class of error as citing a production SHA that has since
moved.** Standing rule reaffirmed: *fetch before you claim divergence; name the referent and the
time of measurement.*

⇒ **There is no production-only Now What? work to recover, and a branch cut from trunk deletes
nothing.** Prerequisite #0 as written is void.

### RE-FRAMED — prerequisite #0

> **#0 (revised): Establish current trunk (`ced4ab513`) as the canonical development baseline.
> Account explicitly for the trunk→production delta (4 commits, incl. `808d5b6ba` "name each room
> once, from the registry", PR #989 — naming-source consistency, not routing; Home's door names and
> hrefs are byte-identical between prod and trunk). Verify that rehabilitation preserves the live
> five-room behavior.**

### CONFIRMED — §B.1, and §B.2 stands unchanged

The five rooms are **behaviorally distinct**, proven by route, destination component, query, and
rendered output — not inferred from labels:

| Door | Route | Destination | What makes it distinct |
|---|---|---|---|
| My Question | `/now-what/questions` | `questions/page.tsx` (NowWhatShell) | field-note filtered `phase==='question'` |
| My Work | `/now-what/work` | `work/page.tsx` (PaperRoom "My Work") | `phase==='practice'` **plus** grouping by `flourishing_dimension` |
| My Coaching | `/now-what/coaching` | `coaching/page.tsx` (PaperRoom "My Coaching") | **different endpoint** — `/api/now-what/home` + `field_program_positions` + `sessions` |
| My Story | `/now-what/field` | `field/page.tsx` (PaperRoom "My Story") | **no phase filter** — everything kept, grouped by month |
| The Room | `/now-what/room?entry=think` | `room/page.tsx` → `NowWhatRoom` | props `phase, fieldContext, program, entry, entryThread, entryDimension` |

Rendered proof, walked: "STILL ALIVE" · "What you chose to live" + six dimensions · "What you brought
forward / Where you are" · "the arrangement is only by month". Negative control on The Room: with
`entry=think` the arrival reads *"A place to think. / What are you working through?"*; without it,
*"Where's your attention right now?"* (branch at `components/now-what/NowWhatRoom.tsx:1064`).

⚠️ **§B.2 is NOT falsified and remains authoritative.** `entry` changes *arrival rendering only*; it
is still absent from the interview request body, and no code path lets the door influence the model.
That the arrival differs does **not** establish that `entry` should become a model-level mode — and
§B.2's warning against threading it into the prompt stands.

### SUPERSEDED — §E's "consolidate the five doors into Notes-with-labels"

Founder ruling, 2026-08-09: **preserve the five-room ontology; rehabilitate the functions inside it.**
The premise "three doors over one table filtered by one column" is too coarse — it holds for
My Question/My Story, but My Work adds a second organizing axis and My Coaching reads different
substrate entirely. Do not collapse the rooms into a generic dashboard, and equally do not invent
differentiation (extra AI prompt modes) for its own sake. The ontology is preserved **unless the
user experience disproves it**; the test is whether each room fulfils its promise for an
executive-coaching client, not whether the rooms are technically distinct — they are.

The room promises, as ruled:

```
My Question  = what am I trying to understand?
My Work      = what am I practicing / living?
My Coaching  = what are Larry and I formally working with?
My Story     = what has happened over time?
The Room     = where I actively think/work with MAIA now
```

⇒ Gap analysis against these promises: **§I**, below. Structural hazards (§C.1–C.3, §D) remain in scope.

---

## 0. THE FIRST FINDING — YOU ARE NOT AUDITING THE CODE YOU THINK YOU ARE

> ⚠️ **SUPERSEDED 2026-08-09 — see CORRECTION above.** Production is fully contained in trunk;
> the divergence described in this section does not reproduce against a freshly fetched ref.
> Retained verbatim as audit history.

Production `maia-sovereign` runs **`b1399f693`** (container created 2026-08-06T03:58:24Z), which is:

- `Merge pull request #972 from SoullabTech/feature/writer-canvas-v01`
- **NOT an ancestor of `clean-main-no-secrets` (trunk)**
- **NOT an ancestor of the local working branch `feature/labtools-redesign`**

Its merge-base with trunk is `7c9dd5192` (PR #868, iOS PWA composer keyboard). Everything Now What? that shipped after that point exists **only in production and in that feature branch's lineage** — not on trunk.

Sixteen `now-what` commits are live in production and absent from trunk, including the load-bearing ones:

| Commit | What it did |
| --- | --- |
| `ca8d1cac9` | **build(now-what): the five-room ontology — four noun-rooms, one verb-room** |
| `376eb4078` | Merge trunk; redirects stand for retired rooms |
| `3a13e5634` / `f6606b8a8` | The placing gesture + question gesture persistence |
| `f6fc9cbd9` | Programs + calendar join the orientation field — eight doors |
| `7bfe87af4` | The constellation — six doors, deeper rooms, time as continuity |
| `b7af060d9` / `76a5e5c45` / `597e326f2` | The warm register (navy removed) |
| `82030aacd` | Direction B wordmark + brand directions for Larry |
| `06c5b2649` | Daily thought band |

### Consequence — three divergent Now What? builds exist right now

| | Doors on Home | Rooms on disk |
| --- | --- | --- |
| **Production `b1399f693`** | **5** (My Question · My Work · My Coaching · My Story · The Room) | + `work`, `practice`, `home`(redirect); `next`/`cultivate` retired-in-place |
| **Local branch `feature/labtools-redesign`** | **8** (question · living · cultivate · coaching · position · calendar · field · think) | no `work`, no `practice`, no `home` |
| **Trunk `clean-main-no-secrets`** | **0** — `ClientHome.tsx` does not exist; no `coaching`, `calendar`, `cultivate`, `page.tsx` | 10 rooms only |

**This is a governance finding before it is a product finding.** The production experience the founder is looking at cannot be rehabilitated from trunk, and a rehabilitation branch cut from trunk would silently *delete* the five-room ontology, the placing gesture, the warm register and the wordmark. **Reconciling production into trunk is prerequisite work item #0.** Any implementation sequence that skips it will re-run the expensive pattern the directive names.

*Everything below describes the PRODUCTION build (`b1399f693`) unless stated.*

---

## A. WHAT `/now-what/map` ACTUALLY IS TODAY

`/now-what/map` is **not the product**. It is a 16-line page rendering `components/now-what/EnvironmentMapView.tsx` with `viewer="member"`.

- It is a **drawn floor plan** of the environment — chambers, corridors, a lit holoflower centre, amber doors — plus a word-index below it explaining each room in member language.
- It **fetches no data whatsoever**, on either clearance. The same component serves `/studio/environment` with `viewer="practitioner"`, and the doctrine is that the practitioner sees the *structure* of holding, never what is held. That boundary is structural, not disciplinary — worth protecting.
- It lists 5 `OPEN_ROOMS` (`room`, `field`, `position`, `next`, `questions`) and a set of `PROTECTED_ROOMS` (`themes`, `reflections`) whose doors deliberately open onto an honest explanation of why they are not running.
- **It is stale relative to production's own Home.** Its `OPEN_ROOMS` still names `next` — a room production retired — and does not know about `work`, `coaching`, `calendar` or `cultivate`. The map and the house disagree.

The actual member entry point is **`/now-what` → `components/now-what/ClientHome.tsx`** (448 lines in the branch, five doors in production). `/now-what/home` is a retired shadow route that 302s to `/now-what`.

---

## B. THE FIVE DOORS — PROVEN, NOT ASSUMED

The founder's observation was: *"these apparently distinct choices may resolve into substantially the same conversational experience."*

**Verdict: the observation is TRUE, and the mechanism is now provable.** But it is more precise than "five chat rooms."

### B.1 What each door actually is

| Door | Route | Destination component | Server context | Reads | Writes | Real behavioural distinction |
| --- | --- | --- | --- | --- | --- | --- |
| **My Question** | `/now-what/questions` | `app/now-what/questions/page.tsx` | `GET /api/now-what/field-note` | `member_field_note_threads` filtered `spiralogic_phase='question'` | none | **A list.** Verbatim titles, chronological. No ranking, no dedup. |
| **My Work** | `/now-what/work` | `app/now-what/work/page.tsx` | `GET /api/now-what/field-note` | same table, `practice`-tagged + `flourishing_dimension`-placed | none | **A list, two sections.** Merge of retired `next` + `cultivate`. |
| **My Coaching** | `/now-what/coaching` | `app/now-what/coaching/page.tsx` | `GET /api/now-what/home` + `program-position` | `practitioner_clients`→`members` (coach name), `sessions` (upcoming/past), shared threads, `field_program_positions` | none | **The only room reading real coaching substrate.** |
| **My Story** | `/now-what/field` | `app/now-what/field/page.tsx` | `GET /api/now-what/field-note` | same table, unfiltered | none | **A list.** Everything kept, timeline order. |
| **The Room** | `/now-what/room?entry=think` | `components/now-what/NowWhatRoom.tsx` (1887 lines) | `POST /api/now-what/interview` | threads | `member_field_note_threads` + `_events` on explicit gesture | **The conversation.** |

So the four noun-rooms are **not** five chat rooms. They are **four filtered views over one table** (`member_field_note_threads`, filtered by one column) plus one conversation.

### B.2 Where the collapse actually happens

Every noun-room terminates in a link back into the *same* conversation, distinguished only by an `entry` query parameter:

- `questions` → `roomHref`
- `work` → `?entry=lived`, `?entry=cultivate&dimension=<slug>`
- `coaching` → `?entry=prepare`
- `field` → `roomHref`
- Home's fifth door → `?entry=think`

**`entry` is presentational only.** In `NowWhatRoom.tsx` it is consumed exclusively inside the arrival JSX (the placeholder/heading branch) to choose which static invitation to render. It is **never** placed in the request body. `POST /api/now-what/interview` accepts `mode`, `phase`, `history`, `returningPractice`, `fieldContext`, `program` — **there is no `entry` field, and no code path by which the door the member came through can influence the model.** (`dimension` does ride a body — but the *field-note write* body, not the interview body.)

Every member, through every door, then receives the identical 700-word `OPENING_FRAME` beginning *"Before we begin, I'd like to frame what we're doing together… Think of this as the beginning of a Living Field."*

### B.3 Cause

Ranked against the directive's candidate causes:

1. **Incomplete implementation — PRIMARY.** The routing exists; the contextual plumbing was never finished. `entry` reaches the arrival copy and stops.
2. **Product-architecture mismatch — SECONDARY and deeper.** Even completed, the design asks the member to declare the *philosophical category* of their material before doing anything. That is the defect the founder named.
3. Deployment lag — real, but a separate axis (§G).
4. Intentional shared-shell — **rejected.** The room's own docstring treats `entry` as "frames the arrival; never seeds content," which is a deliberate *restraint*, not an architecture. Restraint is not the same as a shared shell doing contextual work.
5. Obsolete navigation — true of `/now-what/map` only.

**Do not "fix" this by threading `entry` into the prompt.** That would preserve the ontology-first product architecture at higher cost. The correct move is §H.

---

## C. CAPABILITY AUDIT — THE UNIVERSAL COACHING PLATFORM

Legend: READY · BUILT-UNSURFACED · PARTIAL · DUPLICATED · MISCOMPOSED · MISSING · OBSOLETE · UNKNOWN

| Capability | Existing substrate | Now What? surface today | Other existing surface | Production state | Class |
| --- | --- | --- | --- | --- | --- |
| **Practitioner→client relationship** | `practitioner_clients`, `client_relationships`, `client_invites`, `client_portal_tokens` | read for coach name only (`/api/now-what/home`) | `/studio/clients`, `/studio/clients/[id]` | live | **BUILT-UNSURFACED** |
| **Client relationship — second model** | `stellium_clients` (written by `/api/portal/[slug]/book`) | not read | portal booking | live | **DUPLICATED** ⚠️ see §C.1 |
| **Programs (curriculum)** | `field_programs`, `field_program_lessons`, `field_program_revisions`; `programAuthoringService`; `/api/practitioner/programs` | `/now-what/position` shows declared position only | `/studio/programs`, `/now-what/practice` | live | **PARTIAL** |
| **Program enrollment** | `field_program_positions` (member-declared / practitioner-seeded) | `/now-what/position`, `/now-what/coaching` | — | live | **MISCOMPOSED** — position ≠ enrollment; §C.2 |
| **Program dates / duration / cadence / status** | — | — | — | — | **MISSING** |
| **Sessions** | `sessions` (practitioner_id, client_id, service_id, scheduled_start/end, status, location_type, location_details, notes, practitioner_notes, price_cents, payment_status) | `/now-what/coaching` upcoming + past; `/now-what/calendar` | `/studio/sessions`, `/studio/sessions/[id]`, `/studio/sessions/new` | live | **READY** (substrate) / **PARTIAL** (surface) |
| **Session Room / join** | `session_join_tokens`, `session_artifacts`, `session_markers`, `studio_session_live_prompts` | none | `/studio/session-room` | live | **BUILT-UNSURFACED** (client side) |
| **Session preparation** | — | `?entry=prepare` → generic conversation | `/api/practitioner/clients/[clientId]/prep` | live | **MISCOMPOSED** — prep is a chat with no session context |
| **Program↔session relationship** | `sessions.service_id` only | — | — | — | **MISSING** — no FK from `sessions` to `field_programs` |
| **Availability / slots** | `practitioner_availability`, `availability_overrides`, `lib/scheduling/slotCalculator.ts` | none | `/api/studio/availability`, `/api/portal/[slug]/availability` | live | **BUILT-UNSURFACED** |
| **Booking** | `/api/portal/[slug]/book` (writes `sessions`), `booking_funnels`, `booking_metadata` | none | `/portal/[slug]/book`, `/book/[slug]/[serviceId]`, `/studio/booking` | live | **BUILT-UNSURFACED** |
| **Reschedule / cancel** | `sessions.status` supports `cancelled`; `/portal/manage/[token]` | none | portal manage page | live | **PARTIAL** |
| **External calendar** | `GoogleCalendarService`, `MicrosoftGraphService`, `CalDAVService`, `AppleCalendarSync`, `syncSessionToGoogle`, `calendar_credentials`, `google_calendar_credentials`, `calendar_events` | none | `/studio/calendar`, `/api/studio/calendar/sync` | live | **BUILT-UNSURFACED** |
| **Reminders / notifications** | `session_notifications`, `member_notification_preferences`, `system_notifications`, `focus_reminders`, `scheduled_sends`, `maia-comms-worker` | none | `/studio/scheduled-sends` | live | **BUILT-UNSURFACED** |
| **Timezone** | — | not surfaced (all `toLocaleString`, browser-local) | — | — | **PARTIAL** — no stored member tz |
| **Messaging** | `client_messages`, `practitioner_messages`, `comms_threads`/`comms_messages`, `message_policies`, `client_message_tokens`; `lib/portal/messages.ts`, `lib/practitioner/messages.ts`; PHI accessors | **none** | `/api/portal/[slug]/messages` (GET+POST), `/studio/comms`, `/api/practitioner/messages` | live API, **no member page anywhere** | **BUILT-UNSURFACED** ⭐ highest-value composition |
| **Notes / capture (member)** | `member_field_note_threads` + `member_field_note_events` (authorship, member_decision, `spiralogic_phase`, `flourishing_dimension`, `can_be_shown_to_practitioner`, provenance, withdraw) | `/now-what/questions`, `/work`, `/field` | — | live | **READY** — this is the strongest asset in the build |
| **Direct typed note (no conversation)** | — | **none** — every note is born inside a MAIA conversation | `/api/studio/field/notes` (practitioner) | — | **MISSING** ⭐ blocks §12/§13 |
| **Upload (member)** | — | client-side `FileReader`, `.txt`/`.md` only, **never uploaded** | `lib/storage/fileVault.ts` | live | **MISSING** — no PDF, no persistence |
| **Share a note with practitioner** | `can_be_shown_to_practitioner` (default FALSE, per-thread gesture), `WithdrawVisibility` | `/now-what/coaching` "What you brought forward" | — | live | **READY** ✅ exemplary |
| **Practitioner client-facing materials** | `practitioner_materials` (pdf/doc/audio/video/text/url), `practitioner_files` + `practitioner_file_folders` + `practitioner_file_shares` (client_id, share_type view/download, access_token, password, expiry, access log), `practitioner_resources` (`visibility`: private / all_clients / specific_clients, `shared_with[]`), `/api/shared/file/[token]` | **none** | `/studio/materials`, `/api/studio/files`, `/api/practitioner/materials` | live | **BUILT-UNSURFACED** ⭐ answers the founder's Resources addendum almost entirely |
| **Resource↔program / ↔session binding** | — | — | — | — | **MISSING** — the one real gap in the Resources ask |
| **Practitioner Today / dashboard** | — | `/now-what/practice` (named-and-empty by design) | `/studio`, `/studio/caseload`, `/studio/triage`, `/studio/command` | live | **DUPLICATED** — several competing practitioner homes |
| **Practitioner schedule view** | as above | none | `/studio/calendar`, `/studio/scheduling`, `/studio/booking` | live | **READY** |
| **Practitioner notes on client** | `practitioner_client_notes`, `/api/studio/clients/[id]/notes` | none | `/studio/clients/[id]` | live | **READY** |
| **Practitioner development (Sources / authority / cultivation)** | `practitioner_sources`, practice-field service, authoring + revisions, publishing-candidate model, `__tests__/practitioner-authority-boundaries.test.ts` | `/now-what/practice` | `/studio/field`, `/studio/environment` | live + active design work | **PROTECT** — §17 |
| **Virtual Assistant naming** | `OPENING_FRAME` and copy hard-code "MAIA"; "Kelly" is hard-coded as the facilitating practitioner in the room's frame | `/now-what/room` | — | live | **MISCOMPOSED** ⚠️ §C.3 |
| **Voice input** | browser `SpeechRecognition` + `speechSynthesis`, local-only, never auto-sends | **present in `/now-what/room`** (mic button, spoken replies toggle) | shared MAIA surfaces | live | **RETIRE for Larry** — §13 forbids it |
| **Larry's methodology content** | `lib/soulPortrait/portraits/larry.ts`; six flourishing dimensions used as product structure | `/now-what/work`, `/now-what/cultivate` | — | live | **UNKNOWN / content gap** — §C.4 |

### C.1 Two client models ⚠️

`/api/portal/[slug]/book` creates `stellium_clients` rows and `sessions` rows. `/api/now-what/home` reads `practitioner_clients`. **A client who books through the portal does not become a Now What? client.** Composing portal booking into Now What? without reconciling this will produce a member who booked a session that their coaching room cannot see. This must be decided before any scheduling composition.

### C.2 Position is not enrollment

`field_program_positions` is deliberately constrained: *"Departure hard-deletes the row — closed = gone, no churn ledger. NO practitioner read of these rows, ever (catalog spec §8)."* It answers *"where do I say I stand?"* — it is a sovereignty instrument, not a roster. The founder's §8 asks for `practitioner → client → program enrollment → sessions`. **Enrollment does not exist and cannot be retrofitted onto positions without violating catalog §8.** Enrollment is genuinely new work, and it must live beside positions, not replace them.

### C.3 Hard-coded identity ⚠️

`NowWhatRoom.tsx`'s `OPENING_FRAME` names **Kelly** as the facilitating practitioner in member-facing copy, and names MAIA. `app/now-what/coaching/page.tsx` and `app/now-what/cultivate/page.tsx` also reference Larry in comments/copy. For a Larry-facing product this is a correctness bug, not a preference: **an executive client of Larry's would be told Kelly can accompany their field.** Practitioner identity must come from the relationship record.

### C.4 Larry's methodology — content gap, stated honestly

The six flourishing dimensions are used as product structure. The code says so plainly: *"pending Larry's validation of them as his authored framework (agreement unsigned, corpus not captured)."* Member-facing copy keeps the unattributed posture. **This restraint is correct and must survive rehabilitation.** No Harvard credential, positive-psychology framing, testimonial, exercise or framework attributable to Larry exists in the repo. Per §9: identify the gap, do not fill it. **The system must not speak in Larry's voice because a content slot needs filling.**

---

## D. WHAT IS GENUINELY MISSING

Ranked by whether the acceptance test (§19) can pass without it.

1. **A note the member can simply type** — every note today is born inside a MAIA conversation. Blocks §12 and §13.
2. **Upload of real documents** — no PDF, no persistence, no member file storage. Client-side `FileReader` on `.txt`/`.md` is not upload.
3. **Program as a container with dates, cadence, sessions and status** — `field_programs` is curriculum + focal points only.
4. **Program enrollment** (see §C.2).
5. **Program↔session and resource↔program/session bindings.**
6. **A member-facing Messages surface** (the API exists; no page does).
7. **Member-initiated booking / reschedule / cancel inside Now What?.**
8. **Stored member timezone.**
9. **Practitioner identity resolved from the relationship** rather than hard-coded.
10. **Product-level naming configuration** for the assistant.

Everything else the acceptance test needs already exists somewhere in the repo.

---

## E. CONSOLIDATE OR RETIRE

| Surface | Disposition | Why |
| --- | --- | --- |
| `/now-what/map` + `EnvironmentMapView` (member clearance) | **RETIRE as a member surface** | A map of rooms is the ontology lesson §2 forbids. It is also stale. **KEEP the practitioner clearance** (`/studio/environment`) — it is a legitimate structural view and its no-data boundary is doctrine. |
| Five-door Home (`My Question` / `My Work` / `My Story`) | ~~**CONSOLIDATE → Notes** with labels~~ ⚠️ **SUPERSEDED 2026-08-09 — PRESERVE the ontology** (see CORRECTION) | Original rationale, retained: "Three doors over one table filtered by one column. Exactly §12." Falsified as too coarse: My Work adds a second organizing axis, My Coaching reads different substrate. |
| `/now-what/next`, `/now-what/cultivate` | **already retired in production** — finish the job | Redirects stand; remove from map. |
| `/now-what/themes`, `/now-what/reflections` | **KEEP AS-IS** | Honest closed doors. Do not open, do not delete. Model behaviour. |
| `/now-what/position` | **REUSE inside Program** | The declaration is valuable; a whole room for it is not. |
| `/now-what/calendar` | **RESTRUCTURE → Schedule** | Reads `/api/now-what/home`; needs real booking. |
| `/now-what/arrive`, `/welcome`, `/signin`, `/register` | **KEEP** | Threshold + auth. |
| Voice in `NowWhatRoom` | **RETIRE for Larry via config; PRESERVE globally** | §13. Do not delete shared capability. |
| Competing practitioner homes (`/studio`, `/caseload`, `/triage`, `/command`, `/now-what/practice`) | **CONSOLIDATE — decide one** | Out of scope for member rehabilitation, but it will surface the moment §16 is built. |

---

## F. PROTECT — MUST SURVIVE UNCHANGED

1. **`can_be_shown_to_practitioner` defaults FALSE; per-thread explicit gesture only.** Sharing is never implied by the relationship. Exactly the founder's §14 line, already correct in code.
2. **`WithdrawVisibility`** — withdrawal tells no one.
3. **`member_field_note_events`** — the provenance ledger under every gesture.
4. **The practitioner sees structure, never content** (`EnvironmentMapView` fetches nothing).
5. **Catalog §8** — no practitioner read of `field_program_positions`, ever.
6. **`RoomTrustCopy`** — holds / does-not-hold / who-sees / control, stated once per room.
7. **Honest-absence rendering** — empty means empty; nothing is inferred to fill a slot.
8. **Closed doors that say so** (`themes`, `reflections`).
9. **The unattributed posture** on the six dimensions until Larry validates them.
10. **The private/shared boundary on practitioner material** — `practitioner_resources.visibility` defaults `private`; a file in Larry's Practitioner Field must never become client-facing by existing. This is the founder's Resources rule, and the substrate already enforces it.

---

## G. PRODUCTION VS TRUNK

> ⚠️ **SUPERSEDED 2026-08-09 — see CORRECTION.** Production `b1399f693` is an ancestor of trunk
> `ced4ab513` (0 prod commits absent from trunk; trunk 4 ahead). No rehabilitation cut from trunk
> deletes live work. Retained verbatim as audit history.

See §0. In summary:

- **Production (`b1399f693`)** — five-room ontology, placing gesture, warm register, wordmark, daily thought. Ahead of everything.
- **Trunk** — no `ClientHome`, no `coaching`, no `calendar`, no `cultivate`, no `/now-what/page.tsx`. Roughly the 2026-07-13 completion slice.
- **Local branch `feature/labtools-redesign`** — an *eight-door* intermediate that production has already superseded. Its `ClientHome.tsx` is an earlier draft of the same file.

**Risk:** a rehabilitation cut from trunk deletes live work; a rehabilitation cut from the local branch re-introduces a superseded eight-door Home. Neither is safe. **Reconcile production into trunk first.**

---

## H. RECOMMENDED REHABILITATION ARCHITECTURE

### The move

> **Ordinary interface → extraordinary substrate.**

The substrate is in far better shape than the product. `member_field_note_threads` with provenance, per-thread share consent and withdrawal is a *better* notes model than any commercial coaching platform has. The defect is that it is presented as an ontology the member must navigate. Keep the model; change the doors.

### Target member navigation

```
Home · My Program · Sessions · Schedule · Notes · Messages · Assistant
```

with **Resources inside Program and Sessions**, per the founder's addendum — not a top-level Library.

### Mapping — old to new

| Today | Becomes |
| --- | --- |
| My Question | Notes, label = Question |
| My Work → "what you chose to live" | Notes, label = Practice |
| My Work → "what you are cultivating" | Notes, dimension = metadata (placing gesture preserved) |
| My Story | Notes, default timeline view |
| My Coaching | split → **Program** (container) + **Sessions** (lifecycle) + **Messages** (correspondence) |
| Where you are | a line inside Program |
| Calendar | **Schedule** |
| The Room | **Assistant**, reachable from Notes, Session prep, Program, and standalone |
| The map | retired for members; kept for the practitioner |

**Capture first, classify second.** A note is typed or uploaded, then optionally labelled. The label is a column, not a room. Everything under it — provenance, authorship, program/session association, privacy, share, withdraw, assistant context — is preserved.

### Implementation sequence (for authorization, not execution)

| # | Step | Depends on |
| --- | --- | --- |
| **0** | ~~Reconcile production `b1399f693` into trunk.~~ ⚠️ **VOID 2026-08-09 — prod is contained in trunk.** REVISED: establish trunk `ced4ab513` as the canonical development baseline; account for the 4-commit trunk→prod delta; verify rehabilitation preserves live five-room behavior. | — |
| **1** | Decide `practitioner_clients` vs `stellium_clients` (§C.1). One relationship model. | 0 |
| **2** | Resolve practitioner identity from the relationship; remove hard-coded "Kelly"/"MAIA" from member copy; add product-level assistant naming (§15). | 1 |
| **3** | **Notes**: direct typed note (no conversation required) + optional label + real upload. Reuse `member_field_note_threads` + `fileVault`. | 0 |
| **4** | Retire voice for Larry via configuration; preserve globally (§13). | 0 |
| **5** | **Messages**: compose the existing `/api/portal/[slug]/messages` into a member page + Larry's inbox. Highest value per unit of work in the whole map. | 1 |
| **6** | **Program as container**: dates, cadence, status, enrollment beside (never replacing) positions. New migration. | 1 |
| **7** | **Sessions + Schedule**: compose `slotCalculator`, availability, booking, reschedule, join tokens, calendar sync, reminders into the member surface. Add `sessions ↔ program`. Store member timezone. | 6 |
| **8** | **Resources**: surface `practitioner_files`/`_shares`/`practitioner_resources` inside Program and Session. Add resource↔program/session binding. Preserve private-by-default; sharing stays an explicit act. | 6, 7 |
| **9** | **Home** as the executive dashboard: current program · next session (prepare / join / reschedule) · upcoming · notes brought forward · unread messages · assistant. | 3, 5, 6, 7 |
| **10** | Retire `/now-what/map` for members; keep `/studio/environment`. | 9 |
| **11** | Practitioner side (§16): Today · Clients · Programs · Schedule · Sessions · Communications · **My Practice** (the practitioner field, unchanged). | 5, 6, 7, 8 |

Steps 3, 4, 5 are independent of 6–8 and deliver visible product early. Steps 6–8 are the real build.

### Open questions for the founder

1. **Enrollment vs position** — confirm that enrollment is new substrate beside positions, and that catalog §8 (no practitioner read of positions) still holds absolutely.
2. **Client model** — `practitioner_clients` or `stellium_clients`?
3. **Assistant name** for Larry's product.
4. **Larry's authored content** — is there a corpus to capture, or does the product ship with the unattributed posture intact?
5. **`fieldContext`** — the whole environment threads an opaque `fieldContext` query param through every route. Does it survive the rehabilitation as the program/field identifier, or is it replaced by program id?

---

## Evidence index

- Production commit: `b1399f693`; container created 2026-08-06T03:58:24Z (`docker inspect maia-sovereign`).
- Trunk merge-base: `7c9dd5192`.
- `entry` never reaches the model: `app/api/now-what/interview/route.ts` body parse (`mode`, `phase`, `history`, `returningPractice`, `fieldContext`, `program`) vs `components/now-what/NowWhatRoom.tsx` `entry` usage (arrival JSX only).
- Five doors: `components/now-what/ClientHome.tsx` @ `b1399f693`.
- One table, four views: `app/api/now-what/field-note/route.ts` → `member_field_note_threads`.
- Coaching substrate: `app/api/now-what/home/route.ts` → `practitioner_clients`, `sessions`, `field_program_positions`, `field_programs`.
- Client-model fork: `app/api/portal/[slug]/book/route.ts` → `stellium_clients` + `sessions`.
- Sharing substrate: `database/migrations/20260206000001_practitioner_files.sql`, `20260118_stellium_practitioner_layer.sql` (`practitioner_resources.visibility`).

**Not verified in this pass** (would require an authenticated production walk or DB read): whether Larry exists as a `practitioners` row; whether any `services`, `practitioner_availability` or `field_programs` rows exist in production; whether calendar sync is configured; the rendered appearance of `/now-what/map` under a live member session. These are marked UNKNOWN above rather than assumed.

---

## I. FUNCTIONAL GAP ANALYSIS AGAINST THE FIVE-ROOM ONTOLOGY (added 2026-08-09)

Method: each room evaluated against **its own promise** for an executive-coaching client, using
functionality already present at trunk `ced4ab513`. No new structure proposed where the existing
substrate can meet the promise. "Gap" = the room does not yet keep its promise; it is not a
complaint that the rooms resemble each other.

### I.1 My Question — *what am I trying to understand?*

| | |
|---|---|
| Keeps its promise | A kept question survives in the member's exact words; the room refuses inference, grouping and ranking — and says so. |
| **Gap 1 — no front door to the room's own object** | A question can only be created by ending a session and choosing to keep one. Empty state: *"No questions named yet. When a session ends…"* An executive who arrives already holding a question cannot put it here. The room promises inquiry but only accepts inquiry that has already been through a conversation. |
| **Gap 2 — a question cannot change** | No restate/close/answer gesture. A question that has been resolved, or has become a different question, stays as first written. For a promise about *understanding*, the absence of movement is the defect. |
| Not a gap | Only action is "Enter the session room" — appropriate for a room whose verb lives elsewhere. |

### I.2 My Work — *what am I practicing / living?*

| | |
|---|---|
| Keeps its promise | Two genuine halves: chosen practices (*"chosen in the room, never assigned"*) and six dimensions, each with a per-dimension door into the room. This is the only room with two organizing axes. |
| **Gap 1 — "Explore →" leaves the dimension behind** | Every dimension's Explore links to `/now-what/field` (My Story) with **no dimension filter**. The member is shown a door labelled per-dimension that lands on an unfiltered month timeline. Concrete, cheap: pass the dimension, or relabel the door. |
| **Gap 2 — placed material is not visible in its dimension** | The room can group placed threads by dimension, but the dimension sections currently render doors, not the member's own placed material beneath them. The cultivation loop is written but not shown back. |
| **Gap 3 — practices have no lifecycle** | A practice can be chosen but not marked as living, paused, or finished. For an executive practising something for six weeks, the room can only ever show the choosing. |

### I.3 My Coaching — *what are Larry and I formally working with?*

| | |
|---|---|
| Keeps its promise | The only room reading real relationship substrate: coach name from `practitioner_clients`, upcoming from `sessions`, brought-forward threads, position from `field_program_positions`. Its absences are declared honestly in the docstring rather than faked. |
| **Gap 1 — past sessions exist only if something was kept** | Past sessions are derived *strictly* from `source_session_ref` on kept threads. A real conversation from which the member kept nothing is invisible. Defensible as anti-surveillance, but it means the room cannot answer *"when did we last speak?"* — a formal-relationship question. |
| **Gap 2 — messages and resources are unsurfaced** | `practitioner_messages` and `practitioner_resources` substrate exists; **zero** Now What? surfaces read either (verified by grep across `app/now-what`, `app/api/now-what`, `components/now-what`). A coaching relationship with no way to see what the coach shared is the largest promise gap in the five rooms. |
| **Gap 3 — position is not enrollment** | No enrollment substrate exists; "Where you are" is a member-declared position. Correct as sovereignty, but the room cannot state *what program the member is formally in* — which is what "formally working with" means to an executive. (§C.2 stands.) |

### I.4 My Story — *what has happened over time?*

| | |
|---|---|
| Keeps its promise | Everything kept, month-grouped, uninterpreted — and explicitly not scored or narrated. The restraint is the product. |
| **Gap 1 — time is the only lens** | No filter by kind, dimension, or program, and no search. At 20 threads the month grouping reads as story; at 200 it reads as a log. This is where the promise degrades with success, not with failure. |
| **Gap 2 — no chapter gesture** | The room's docstring notes there is no marking UI. A member cannot mark a turning point, so "what has happened" can never acquire the shape the member sees in it. |
| Not a gap | Absence of MAIA-narrated arc — that is the boundary, and it should survive rehabilitation unchanged. |

### I.5 The Room — *where I actively think/work with MAIA now*

| | |
|---|---|
| Keeps its promise | Real arrival differentiation per `entry` (proven, incl. negative control); dictate/upload/discuss; per-thread consent off by default. |
| **Gap 1 — arrival differs, the conversation does not** | §B.2 stands: `entry` never reaches the interview body; every door yields the same ~700-word `OPENING_FRAME`. The member is greeted by their door and then met by a generic frame. ⚠️ The fix is **not** necessarily threading `entry` into the prompt (§B.2's warning holds) — the cheaper reading is that the opening frame is too long and too identical for a returning executive, independent of doors. |
| **Gap 2 — hard-coded practitioner identity** | `components/now-what/NowWhatRoom.tsx:835` renders the literal *"Now What? · with Larry Closs"*, while My Coaching resolves the coach's name dynamically from substrate. The same product shows one room that knows who the practitioner is and one that has it compiled in. (§C.3 stands; single call site, cheap to fix, blocks any second practitioner.) |

### I.6 Structural hazards — still in scope, unchanged by this correction

1. **Two client models** — `practitioner_caseload` (20260107000001) alongside `practitioner_clients` (read by `/api/now-what/home`) and `client_groups`. §C.1 stands.
2. **Enrollment vs position** — no enrollment substrate; see I.3 Gap 3. §C.2 stands.
3. **Hard-coded practitioner identity** — see I.5 Gap 2. §C.3 stands.
4. **Unsurfaced capabilities** — scheduling (partial: upcoming only), messages (none), resources (none). See I.3 Gap 2 and §C/§D.

### I.7 What this implies for sequencing (for authorization, not execution)

Ordered by *promise kept per unit of change*, all inside the preserved ontology:

1. My Coaching → surface resources and messages (substrate exists; `visibility` default `private` already enforces the founder's Resources rule).
2. My Work → make Explore dimension-aware and render placed material under its dimension.
3. My Question → allow a question to be written directly, and to change.
4. The Room → shorten/condition the opening frame for a returning member (**not** by threading `entry` into the model).
5. My Story → one non-time lens, and a member-authored chapter mark.
6. Hazards: unify the client model; de-hard-code the practitioner name.

No code changes have been made. This section is analysis only.

---

## J. Q1 — CANONICAL CLIENT/RELATIONSHIP IDENTITY (gate; evidence for the founder's ruling)

**Founder direction 2026-08-09:** *"Messages, resources, session history, enrollment, booking, and
practitioner identity must all resolve against one governed relationship path rather than deepening
the current client-model split."* **No code until Q1 is ruled.** This section is the evidence, not
the ruling.

### J.1 The split is a migration-ordering artifact, not two designs

**Three** migrations declare `CREATE TABLE IF NOT EXISTS practitioner_clients`, with **conflicting
foreign keys**:

| Migration | `practitioner_id` references |
|---|---|
| `20260114000001_practitioner_themes.sql:102` | `practitioners(id)` (+ nullable `member_id → members(id)`) |
| `20260116000001_practitioner_portal.sql:252` | `practitioners(id)` |
| `20260118_stellium_practitioner_layer.sql:7` | **`members(id)`** |

`practitioners` itself is declared **three** times (`…themes`, `…portal`, `…faqs_and_enhanced_clients`).
Because every declaration is `IF NOT EXISTS`, **only the first to run takes effect and the rest
silently no-op.** The live schema is therefore decided by migration order, not by design intent —
and code written against a losing declaration compiles, deploys, and quietly finds a different shape.

### J.2 What production actually has (read-only, measured 2026-08-09)

Live `practitioner_clients` FKs:

```
practitioner_clients_practitioner_id_fkey → practitioners(id) ON DELETE CASCADE
practitioner_clients_member_id_fkey       → members(id)       ON DELETE SET NULL
```

⇒ The `practitioners`-rooted declaration won. The `members`-rooted one (`20260118_stellium`) **never
applied**. Any code assuming `practitioner_clients.practitioner_id` is a member id is wrong against
production.

Row counts:

| Table | Rows | Reading |
|---|---|---|
| `practitioners` | 18 | populated |
| `practitioner_clients` | 13 (5 distinct practitioners) | populated |
| — of which linked to a member account | **1** | ⚠️ **12 of 13 relationships have `member_id IS NULL`** |
| `practitioner_cases` (caseload model) | 1 | effectively unused |
| `sessions` | 34 (6 with `client_id`) | real |
| `field_program_positions` | **0** | "Where you are" renders for nobody |
| `practitioner_messages` | **0** | empty |
| `practitioner_resources` | **0** | empty |

### J.3 What this changes about §I (correction to my own finding)

§I.3 Gap 2 said messages and resources are *unsurfaced*. True — and **incomplete**: they are also
**unpopulated** (0 rows each). Surfacing them today would render empty sections. The honest statement
is: *the member cannot inhabit the coaching relationship because it is neither bridged to their
account nor filled by the practitioner.* Rehabilitation of My Coaching therefore has two halves, and
the member-side half alone delivers nothing:

- **bridge** — `practitioner_clients.member_id` populated (1 of 13 today);
- **fill** — practitioner-side authoring of resources/messages (this is where the practitioner
  stewardship loop meets the member field, not a separate program).

Likewise §I.3 Gap 3: `field_program_positions` is not merely "not enrollment" — it is **empty in
production**, so the position section is dead for every member today.

### J.4 The three candidate rulings (founder's call)

> ⛔ **VOID 2026-08-09 (later) — DO NOT RULE FROM THIS SET.** Framed without knowledge of
> `Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md`, which already rules this ground as **R-Q1a**,
> and framed Candidate 3 as *"create a constituted relationship object"* when **`relationship_spaces`
> already is that substrate**. Superseded by **§K**. Retained verbatim as reasoning history.

1. **`practitioners` + `practitioner_clients` is canonical** (what production enforces). Work =
   backfill `member_id` for the 12 unlinked rows, retire the `members`-rooted declaration, and delete
   or quarantine `practitioner_cases`. Lowest schema churn; matches live FKs.
2. **`members` is canonical for both sides** (one identity table; practitioner = a member with a
   role). Requires migrating `practitioners.member_id` into the join and rewriting `practitioner_clients`.
   Cleaner long-term; a real migration against live rows.
3. **A new constituted relationship object** (relationship/enrollment as its own governed row,
   distinct from a CRM-style client record). Most work; the only option that also answers the
   enrollment-vs-position gap rather than deferring it.

**Whatever is ruled, one thing is not optional:** the duplicate `IF NOT EXISTS` declarations must be
collapsed to a single authoritative definition, or the next migration silently re-opens this split.

### J.5 REVISED IMPLEMENTATION SEQUENCE (supersedes §H's sequence and §I.7)

> ⛔ **NOT FINALIZABLE — see §K.4.** Step 1's word *"bridge"* is struck: backfilling
> `practitioner_clients.member_id` is **PROHIBITED** by R-Q1a.6. The sequence may not be settled
> until Q1-A…Q1-E are answered.

Founder-ordered 2026-08-09, by promise-kept-per-change, **gated on Q1**:

| # | Work | Gate |
|---|---|---|
| **Q1** | **Rule canonical client/relationship identity** (J.4). Collapse duplicate declarations. | ⛔ **no code before this** |
| 1 | Resolve canonical client/relationship identity in schema + code; bridge `member_id`. | Q1 |
| 2 | De-hard-code practitioner identity (`NowWhatRoom.tsx:835`) **from that resolved relationship**. | 1 |
| 3 | Surface existing My Coaching substrate — messages, resources, sessions, booking, program state (see J.3: needs the fill half too). | 1, 2 |
| 4 | My Work dimension-aware end to end (Explore preserves dimension; placed material renders under its dimension). | — |
| 5 | My Question directly writable and revisable. | — |
| 6 | Condition The Room's opening frame **from actual relational/context state** — ⛔ not by forwarding `entry`. | 1 |
| 7 | One meaningful non-time lens in My Story. | — |

**Standing constraints:** keep `entry` an arrival concern unless evidence establishes a genuine
model-level distinction (§B.2 holds); do not collapse the five rooms; do not introduce new rooms;
do not rebuild capabilities already present in the platform.

---

## K. Q1 AMENDED — DECOMPOSED DECISION SET (supersedes §J.4; §J.1–J.3 evidence retained)

⭐ **Canonical home:** `docs/design/now-what/Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md`.
That instrument holds the operative ruling **R-Q1a**. §K does **not** restate it and must never become
a shadow copy — it records what §J uniquely adds, and routes each sub-question to where it is already
answered. §J was written without knowledge of the instrument; this section reconciles them.

### K.1 Production settles the executable shape; it does not settle the constitutional model

The three conflicting `CREATE TABLE IF NOT EXISTS practitioner_clients` declarations (§J.1) mean
**migration order accidentally determined ontology**. Production tells us which declaration won —
`practitioners → practitioner_clients` — and that is authoritative evidence about *the live schema*.

> **It is not, by itself, evidence that this schema should become the canonical ontology.**

The defect is environment-order-dependent: a fresh environment can instantiate an incompatible
schema while every environment looks internally coherent. **The duplicate declarations must be
reconciled regardless of how Q1 is ruled** — otherwise environment creation stays order-dependent.
⛔ But do **not** normalize them yet; normalizing before the ruling would freeze the accident.

### K.2 Four layers, permanently distinct — replaces "bridge + fill"

§J.3's *"bridge + fill"* is withdrawn: it collapsed the first two layers, which is the exact category
error R-Q1a exists to prevent.

| Layer | Question | Substrate | Production |
|---|---|---|---|
| 1 · Identity | Who is this human? | `members` | 87 |
| 2 · Administrative contact | Whom does the practitioner hold in their roster? | `practitioner_clients` (+ optional `member_id` identity bridge) | 13 rows · 12 unlinked |
| 3 · Constituted relationship | What have these two people mutually established? | `relationship_spaces` | **0 rows · 0 constituted** (verified independently 2026-08-09) |
| 4 · Program participation | What work is this person participating in? | enrollment *(not built)* · `field_program_positions` (sovereign declaration, **not** enrollment) | 0 / 0 |

Plus, orthogonal to all four: **practitioner authoring** (`practitioner_messages` 0, `practitioner_resources` 0)
and **member surfacing** (the rooms). Six facts, never one foreign key.

**Where the product is actually alive** (measured): sessions ✅ 34 · administrative roster ✅ 13 ·
practitioner identity ✅ 18/18 with `member_id` · constituted relationship ❌ 0 · practitioner
messages/resources ❌ 0 · program position ❌ 0.

### K.3 Correction to §I.3 and §J.3 — My Coaching's emptiness is substantively correct

§I.3 called unsurfaced messages/resources the largest promise gap; §J.3 refined it to
"unpopulated as well as unsurfaced." **Both understated the cause.** Per the instrument §2.1, there
are three failures at three layers, and the primary one is constitutional: even with the join fixed,
the room would be reading *"who is my coach?"* out of a **unilaterally authored contact record**.
With `relationship_spaces` empty, **nothing has been constituted anywhere in production**.

⇒ **My Coaching is empty because no commitment exists — not because a join is broken.** Its emptiness
is correct under Ruling 1. Fixing the join to populate it would render a relationship that does not
constitutionally exist. The room should read the commitment and stay honestly empty until commitments
exist. *(The wrong-referent join is a real, separately-ruled bug — not the fix for this room.)*

### K.4 The decomposed decision set — Q1-A … Q1-E

| | Question | Status |
|---|---|---|
| **Q1-A** | Should every practitioner be a member identity, with `practitioners` as role/profile state attached to it? | **Evidence complete:** `practitioners.member_id` populated **18/18** (verified); `practitioner_clients.practitioner_id` matches `practitioners.id` 13/13 and `members.id` **0/13**. R-Q1a.7 already resolves the chain. Needs ratification, not more evidence. |
| **Q1-B** | What does `practitioner_clients` constitutionally represent? | **Ruled by R-Q1a.1** — practitioner-owned contact/CRM/operational record; legitimate for details, invitations, billing, roster; **not** a relationship. Open sub-item: its 48 columns carry four collapsed jobs; the lifecycle columns are vestigial duplicates of what `relationship_spaces` owns (instrument §1.2). Bounding them is deferred work, not a new ruling. |
| **Q1-C** | When may a contact acquire `member_id`? | **Ruled by R-Q1a.6** — only through an explicit governed claim/invitation path. ⛔ Never by email match, similarity, historical session, or administrative backfill. **The 12 unlinked contacts are not to be linked.** Open: *which* claim path is authorized (the constitutive event is named but not built). |
| **Q1-D** | Is `relationship_spaces` the canonical commitment substrate, and when does a commitment come into existence? | **Ruled by R-Q1a.3** — yes; predicate `participant_member_id IS NOT NULL AND status='active' AND consent_status='accepted'`. Already queryable; **no new object may be proposed.** Open: reconcile with the separately authorized Relationship Constitution Trace, and name the act that creates the row. |
| **Q1-E** | Is enrollment a state, a separate object, or already represented? | **Open — least settled.** R-Q1a.4 fixes only what it is *not*: `field_program_positions` is sovereign member declaration, **not** enrollment (0 rows; ⛔ do not let it acquire enrollment semantics because the name sounds adjacent). Enrollment is a member↔program relation keyed on the commitment, not built. |

⇒ **Q1-A and Q1-D need ratification; Q1-C and Q1-E need answers; Q1-B is ruled with deferred bounding.**

### K.5 Sequence — not finalizable, and one dependency inverted

The `Q1 → identity+bridge → My Coaching` ordering (§J.5) contains an ontology shortcut and is
withdrawn as a proposal. The eventual dependency is expected to run:

```
identity → relationship constitution → practitioner authoring → member surfacing
```

with **administrative client records alongside that chain, never serving as it.** My Coaching's
population predicate must derive from whatever Q1-D establishes as the authoritative relationship
fact — ⛔ never from identity linkage, and never from the practitioner's roster.

> **The practitioner's database does not create the member's relationship reality.** A practitioner
> may record that they regard someone as a client; the system may not thereby assert that the two
> people have constituted a relationship together.

Retained from §J.5 as still-valid, gated: dimension-aware My Work · writable/revisable My Question ·
opening frame conditioned on real relational state (⛔ not by forwarding `entry`; §B.2 holds) ·
one non-time lens in My Story. Retained constraints: no room collapse · no new rooms · no rebuilding
existing capability.

**No implementation. No code until Q1-A…Q1-E are answered.**

---

## L. Q1-E BROUGHT FORWARD (2026-08-09)

Per founder direction, Q1-E (enrollment) is the next bottleneck — it sits between the constituted
relationship and the coaching/program experience. Its decision instrument is
**`docs/design/now-what/Q1E_ENROLLMENT_DECISION_INSTRUMENT_2026-08-09.md`** (canonical home for the
enrollment question; ⛔ do not re-derive it here).

Three findings from it that change §J/§K:

1. **The position model already implies enrollment as a distinct prior event.** `field_program_positions.stated_by`
   admits `practitioner_seeded`, documented as *"placed **at enrollment**, assumed until the member speaks."*
   The separation is an existing implication, never built — not a new constraint being imposed.
2. **An enrollment model already exists and is keyed the forbidden way.** `academy_enrollments.client_id →
   practitioner_clients(id)` — enrollment hung beneath the administrative contact record, the exact
   inversion R-Q1a prevents. **Inert (0 rows), so nothing needs rescuing** — quarantine or retire, per E6.
3. **Enrollment and position cannot share substrate, on a structural ground independent of philosophy:**
   positions carry an absolute *no practitioner read, ever* invariant (catalog §8), while a practitioner
   must be able to see who is enrolled in their own program. **Opposed read boundaries.**

All enrollment-shaped substrate is empty in production (`academy_enrollments` 0 · `academy_paths` 0 ·
`workflow_enrollments` 0 · `field_programs` 0 · `field_program_positions` 0), so Q1-E is being decided
at its cheapest possible moment — nothing to backfill, nothing to reinterpret.

### L.1 ✅ Q1-E RULED — R-Q1e (founder, 2026-08-09)

Enrollment is a **separate governed relation between a constituted commitment and a
practitioner-authored program**; never inferred from contact, membership, position, or program
visibility. Practitioner **offers**; enrollment becomes active only on an **explicit member act**.
Member may pause/withdraw without dissolving the commitment; dissolution of the commitment ends or
invalidates dependent enrollment. Enrollment is bilaterally inspectable but ⛔ grants **no** access to
`field_program_positions` (Catalog §8 untouched). `academy_enrollments` and any
`practitioner_clients`-rooted enrollment model are constitutionally nonconforming — quarantine, ⛔ do
not migrate. Full ruling, lifecycle, and the five items it deliberately does **not** settle:
`Q1E_ENROLLMENT_DECISION_INSTRUMENT_2026-08-09.md` §6.

⭐ **The generalizing reason** (founder): unilateral placement *"would quietly turn 'relationship
consent' into 'consent to every future program,' which is too broad."* **Consent stays granular —
one act does not silently license the next.**

⇒ **Q1 status:** Q1-A evidence complete (needs ratification) · Q1-B ruled (bounding deferred) ·
Q1-C ruled prohibitively (claim path unbuilt) · Q1-D ruled (reconcile with Relationship Constitution
Trace) · **Q1-E RULED**. ⛔ Still no code: the sequence (§K.5) may not be finalized until Q1-A and
Q1-D are ratified and Q1-C's claim path is named.
