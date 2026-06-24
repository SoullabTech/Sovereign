# MAIA Assist — scope + sequence

**Status:** Scope decision (intent) + Step 1A substrate verification (state, 2026-06-17). Verification was read-only; nothing built this pass. Companion to [`PROPOSAL_LANDSCAPE_2026-06-17.md`](./PROPOSAL_LANDSCAPE_2026-06-17.md) and [`../canon/MAIA_CONSENT_GATES.md`](../canon/MAIA_CONSENT_GATES.md). Intent and state are kept strictly separate (a claim about state is never the state itself).

## Scope (decision)

The outward-action surface (the **Action faculty**) is named **MAIA Assist** and scoped to the **Studio** — serving the person's outer life in **both personal and professional** registers (their own days and their practice alike). The member-facing **MAIA companion** stays inward (Memory/attention — reflection, continuity, Keep, Field Note) with **no outward-action surface**. The split is the architecture's own inward/outward boundary applied as a surface boundary. Scope keeps the companion from capturing *through action* — but that is **necessary, not sufficient**: an inward-only architecture is itself a *rescue loop* (insight erodes in a fragmented environment, the person returns for repair — dependency in therapeutic clothing). The real safeguard is the full developmental loop reaching outer coherence, so real necessity falls (see the outer-coherence principle below). The companion cannot act on the world, and the governor layer is deferred to the Studio's bounded consent context (the person's own outer life, and practitioner↔client where applicable).

## Sequence (INTENT — not state)

1. Calendar → real external sync
2. Reactive `propose_message`
3. Proactive proposals — only after the governor layer is **runtime** (not merely written)

Each step is gated by **reversibility**: calendar events are reversible (deletable); sent messages are not → messaging's consent surface matters more than its generation; proactive waits on runtime governors.

## Current STATE (verified 2026-06-17 — separate from intent)

1. Calendar proposal loop — proven locally, **not deployed** ([PR #477](https://github.com/SoullabTech/Sovereign/pull/477)); currently wired into the member turn, to be re-homed to Studio scope.
2. Calendar external sync — substrate **present and failure-safe** (CalDAV path ready); **not wired** into the proposal executor; Google-for-`calendar_events` wrapper missing; update-sync missing.
3. Reactive `propose_message` — **unbuilt** (send channels exist: Twilio SMS/WhatsApp, Resend email, in-app DM).
4. Proactive governors — **canonized, not runtime** (no `member_standing_grants` table / scarcity / window enforcement).

## Step 1A — calendar substrate verification (read-only)

**Verified present** (file:line = the falsifier; each was opened):
- Sync integration already matches the plan: `syncEventToCalDAV(memberId, eventId)` — `lib/calendar/syncStudioEventToCalDAV.ts:19`. Fire-and-forget, member-scoped; checks connection (→ `not_connected`), respects disclosure (private→`local_only`, generic→"Busy", full→real fields), creates the external event, writes back `external_event_id` + `sync_status='synced'` + `last_synced_at`; on error sets `sync_status='failed'` + `last_sync_error` (lines 23–77). **The "failure leaves the local row intact with `sync_status='failed'`" requirement is already implemented.**
- External delete path: `deleteEventFromCalDAV` — same file, line 83. Idempotent (no-op if never synced / not connected); logs but does not fail (local soft-delete is authoritative).
- Provider services: CalDAV / Google / Apple / Microsoft (`lib/calendar/`). `CalDAVService` create/update/deleteEvent (282/301/325); `GoogleCalendarService` createEvent/deleteEvent (369/556).
- Connection flows: CalDAV configure/test/status/calendars (`app/api/connectors/caldav/*`); Google OAuth connect + callback + calendars (`app/api/auth/google/connect|callback|calendars/*`); Microsoft (`app/api/auth/microsoft/*`).
- Connect UI: `components/settings/CalDAVConnectSection.tsx`, surfaced in `app/studio/settings` → **studio-scoped** (matches Assist = Studio).
- Credential storage: `google_calendar_credentials` (user_id-keyed; migration `20260104000002`), `practitioner_integrations` (`20260122`), `oauth_providers`, `microsoft_calendar`, `sessions_calendar_sync`.
- Data model: `calendar_events` carries `calendar_provider`, `external_event_id`, `sync_status`, `last_sync_error`, `last_synced_at` (used at `syncStudioEventToCalDAV.ts:116–133`) + sync-tracking migration `20260407000006`.

**Missing / gaps:**
- The proposal executor (`lib/maia/proposals/executor.ts`) does **not** call any sync — it only INSERTs. Wiring = one fire-and-forget `syncEventToCalDAV` call after the INSERT.
- No `calendar_events → Google` sync wrapper (Google sync exists only as `syncSessionToGoogle`, session-scoped). CalDAV is the ready path.
- No **update**-sync for `calendar_events` (create + delete only; `CalDAVService.updateEvent` exists but isn't wired) — editing a synced event won't propagate externally.

**Risk:**
- Partial-failure orphan: external `createEvent` succeeds, then the local write-back fails → external event exists but `external_event_id` is null → it can't be deleted later (delete needs the id) and a retry would duplicate. Narrow but real; no local-id → external-uid idempotency key.
- Provider asymmetry: CalDAV-first means Google users get local-only until the Google wrapper lands (set expectation via `sync_status`).
- Cosmetic: `syncStudioEventToCalDAV` is generically capable but "studio"-named; reusing it from Assist is logically fine.

**Smallest safe next build:**
- Wire the proposal executor to call `syncEventToCalDAV(memberId, eventId)` **fire-and-forget after the INSERT** (CalDAV only), under Studio/Assist scope. ~2 lines, reusing a fully-built, failure-safe function that already degrades safely when no calendar is connected (`sync_status='not_connected'`, local row intact). Verify end-to-end against a real CalDAV connection. Defer the Google wrapper and update-sync to follow-ups.

---

## Why outer coherence is constitutive (the outer-coherence principle)

Making a life less complicated and more organized is not a convenience layer bolted onto inner work — it is constitutive of it. **Inner coherence cannot be *lived* through a chaotic outer life.** Friction (the Slack/email/options/demands spiral) fragments the very attention coherence requires; a person can have deep self-insight and still lose access to it when missed appointments, unpaid bills, dropped commitments, and administrative chaos keep the nervous system under chronic load. So the relationship is **reciprocal** — a virtuous cycle: inner coherence → better choices → greater outer coherence; outer coherence → less load → more capacity for inner coherence. The precise claim is **inner coherence requires *sufficient* outer coherence** — not *resonance* (one can resonate with an unhealthy system) and not *maximal* order. **Sufficient** is load-bearing: it bounds the target from below (chaos consumes attention) and from above (an over-optimized, rigid life re-consumes the attention it was meant to free — coherence become a cage). The aim is *enough order that the soul has room to breathe*. MAIA Assist exists to reach and hold that band — not to maximize organization.

Three guards keep this consistent with the rest of the canon:

1. **Organize the mechanics, never the priorities.** Assist reduces *logistical* friction — scheduling, reminders, follow-through, the tedious and the dropped. It does not decide what deserves attention. *Less complicated* must never become *someone else deciding what your life contains* — what matters stays the person's ([Meaning Sovereignty](../canon/MAIA_CONSENT_GATES.md)). Outer support clears the noise so the person's *own* orientation can be enacted.
2. **Build capacity, not dependence (gym, not residence).** Success is the person keeping their *own* life in better order over time — not being unable to stay organized without MAIA. The decreasing-necessity metric applies to organization too: reduce the friction; do not become the thing that holds it back.

3. **Sufficient, not maximal.** Order serves free attention; past the sufficiency band, more organization becomes a new friction (managing the system). Never optimize organization as a metric — measure, don't optimize.

**Studio is the architecture of outer coherence — not a productivity suite.** Productivity completes tasks; coherence lets a life express who someone is. Each function is an outer act in service of an inner value: calendar protects what matters · tasks honor commitments · messaging keeps relationships congruent · organization makes room to breathe.

**Positioning:** as fewer people define themselves primarily through work, the personal/professional line softens — life itself becomes the practice. Across family, creative work, clients, finances, and relationships the purpose is one: *build a life structurally capable of holding the person someone is becoming.*

> MAIA helps you discover what matters. Studio helps your life reflect it.
> Inner coherence. Outer coherence. One life.

Scope: personal and professional outer life (the Studio); never the inward companion.

### Outer coherence is developmental necessity, not convenience

Insight is not sustained by insight alone — change survives only when practices, relationships, and environment reinforce it (basic developmental psychology). So an inward-only architecture quietly recreates the very failure this canon exists to prevent: **the therapeutic engagement loop** — life fragments → reflect with MAIA → feel coherent → return to fragmented tools → fragment again → return. No one intends it; it arises because the architecture stops at the boundary of reflection. Outer coherence breaks the loop: reflection → understanding → outer support → the life itself holds better → need for intervention *falls*. MAIA cultivates the seed; Studio tends the soil; a seedling transplanted into toxic soil fails by environment, not by seed.

**Falsifier (the sharpest one):** does the *frequency of return-for-repair* fall over time? Falling → development (the life is becoming a better container). Flat or rising → a rescue loop, however good the conversations feel. This is the decreasing-necessity metric made measurable.

**Orchestrate, don't own.** MAIA need not own every tool — and shouldn't, because replacing a person's ecosystem is its own capture (lock-in). The mandate is only that the tools a person uses *reinforce* the coherence they're developing. Serve that by making their **existing** environment cohere — e.g., writing to their *real* calendar (the external-sync path), tending the soil they already live in — not by transplanting them into MAIA's pot.

### Design language — protect a value, not manage an object

Every Studio surface is understood by the human value it protects, not the object it manages. Implementation identical; ontology different.

| Surface | Manages an object | Protects a value |
|---|---|---|
| Calendar | appointments | what matters |
| Tasks | work | commitments (integrity) |
| Messages | communications | relationships |
| Notes | information | what deserves remembering |
| Projects | deliverables | a home for meaningful work |

The framing is the tool's *telos* — never MAIA editorializing the person's life. The calendar protects what *they* decide matters ([Meaning Sovereignty](../canon/MAIA_CONSENT_GATES.md)); it does not tell them what to protect.

### The objective function — and the friction it must not remove

A productivity system has no natural stopping point (more org → more tracking → more dashboards → endless). Outer coherence does: **the objective is maximum available *attention for life*, not maximum organization.** Free attention peaks at *sufficiency*; past it, more order consumes the very attention it was meant to free. Stopping question: *is there enough order that attention is no longer consumed by unnecessary friction?* If yes, stop.

But **"unnecessary" is load-bearing.** Not all friction is environmental noise. Some is **generative** — the hard conversation, the costly-but-kept commitment, the discomfort of follow-through. That friction *is* the developmental work. Studio removes **environmental** friction (the lost email, the double-booking, administrative chaos) so attention is freed *for* the generative kind — it must never smooth the generative friction away. A frictionless life is not coherent; it is anesthetized, and a Studio that removed the friction of saying no or sending the hard message would be a comfort-engine — a subtler capture. So *care for relationships* means supporting the hard, congruent message, not making messaging effortless; *honor commitments* includes the friction of keeping the costly ones.

### The governing criterion (the heart)

> **AI may support what constitutes a person, but never constitute it on their behalf.** *(Aspiration: remove what obscures, preserve what constitutes. Operative test: is MAIA helping the person perform this act, or performing it instead?)*

This is the common criterion for *every* Studio feature. It does not say what to build; it says how to tell whether a build serves the mission or quietly undermines it. The distinction it rests on — **environmental friction vs. developmental friction** — is often confused and nearly opposite:

| Environmental friction (remove) | Developmental friction (preserve) |
|---|---|
| searching for information | speaking the difficult truth |
| double-booking | keeping a costly commitment |
| lost passwords | saying no with integrity |
| administrative chaos | grieving a loss |
| tool fragmentation | creating something worthwhile |
| remembering logistics | becoming more courageous |

One steals attention; the other transforms the person. **Remove friction that consumes development; preserve friction that creates it.**

**Operational test (per feature):** *If this friction disappeared, would the person become more capable or less?* More available for life → remove. The system now performing their growth → don't. (Scheduling conflicts: remove. Birthdays: help. The difficult apology: never automate. The vulnerable message: help clarify, never eliminate the choosing and sending. What matters: never.)

**Three rules keep the test honest:**
1. **Friction-in-context, not the feature.** The same friction is environmental for one person and developmental for another, or flips by life-stage; one surface (messaging) holds both at once.
2. **At the edges, the person classifies their own growth edge.** Whether a friction is developmental for *them* is a fact about *their* becoming (Meaning Sovereignty) — the system defaults, never decrees.
3. **Preserve under uncertainty.** Risks are asymmetric: wrongly leaving environmental friction is a minor annoyance; wrongly removing developmental friction performs a person's growth for them. When unsure, don't remove.

**Already embodied by the consent gate.** The gate is the line where Studio's *preparing* ends and the person's *constituting* act begins — pressing confirm *is* the preserved developmental act. The assistant never becomes the one who keeps the promise; it becomes the environment in which the person keeps it.

**The bottleneck reframe.** Most software assumes the bottleneck is *execution*; this architecture assumes it is *available human attention* (execution downstream, attention upstream). So the design question is never "can we automate this?" but **"what kind of attention does this require?"** — administrative attention Studio removes; relational attention it prepares and protects; moral, existential, and creative attention it leaves with the person. The aim is never a frictionless life — it is a life where attention is no longer wasted on needless complexity, so it is fully available for the beautiful, difficult, irreplaceably human work of becoming.
