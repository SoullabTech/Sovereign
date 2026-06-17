# MAIA Assist — Capability Map

**Purpose:** one accurate, legible place that states what MAIA can do in the world on a
person's behalf, and what it cannot do yet. No hidden capabilities; no overclaiming.
Surface: **`/studio/assist`**.

Every Assist function is an **Authorized Action**: the human authors it, explicitly consents,
and the system executes exactly that — audited, and revocable before execution. MAIA never
originates an action. (See `MAIA_ASSIST_SCOPE_2026-06-17.md` and the Authorized Action
constitution: Authorship · Consent · Faithful Execution · No Substitution · Revocability · Legibility.)

## Status labels (the promotion ladder, made user-facing)

| Label | Meaning |
|---|---|
| **Live** | Certified end-to-end (execute + revoke) and in production use. |
| **Pending Certification** | Machinery works in production; the human UI A/B certification has not been run. |
| **In Build** | Being built; not exposed as an action yet. |
| **Blocked** | Cannot be exposed until an external/compliance condition is met. |
| **Not Available** | Not present. |

## Capability matrix

| Function | Status | Current state | Needed next |
|---|---|---|---|
| **Email** | Pending Certification | Delivery rail live in prod (worker → managed Resend → inbox, audited). UI at `/studio/scheduled-sends` deployed. | Run the UI A/B certification (A: author→consent→send; B: author→consent→revoke). |
| **Calendar** | In Build | Booking/calendar substrate exists (`/api/studio/calendar/events`, CalDAV sync, `/studio/calendar`). No consent-gated Authorized-Action event executor. | Build as executor #2, reusing the same constitutional spine; run the identical A/B certification. |
| **Text / SMS** | Blocked | Provider code exists (`lib/comms/providers/TwilioProvider.ts`, WhatsApp) but is **not exposed**. | Resolve SMS consent + A2P / carrier compliance before any exposure. |

## Per-function detail

### Email — Pending Certification
- **Live:** scheduled send via the due-send worker (`/api/cron/scheduled-sends`), managed Resend, full audit (`status`, `sent_at`, `provider`, `provider_message_id`, `attempts`). Linux scheduler installed (1-min cron). Production self-send delivered + audited.
- **UI actions (`/studio/scheduled-sends`):** schedule an email · view scheduled & sent · cancel a pending email · send a test to yourself.
- **Not yet certified:** the *human UI path*. The verified self-send was operator-inserted (machinery proof). Certification = a person authoring through the UI (proves Authorship, Consent) and revoking one before it fires (proves Revocability).

### Calendar — In Build
- The existing calendar is for **booking / availability**, not an Authorized Action executor.
- The executor (consent-gated create/schedule/cancel event) is **executor #2**: it reuses the consent/audit/revoke spine; only the executor-specific **evidence** differs (event id, attendees, start/end, calendar audit — there is no `provider_message_id`; calendar's semantic success is *state creation*, not delivery).
- No event actions are exposed on `/studio/assist` until built and certified.

### Text / SMS — Blocked
- Intentionally not exposed. SMS carries consent semantics email does not (TCPA / A2P 10DLC). Provider code present but **no callers exposed** through Assist.
- Unblocks only after carrier consent + A2P/compliance are resolved.

## Discipline
- **No autonomous outreach.** Every action is human-authored and human-consented.
- **No SMS exposure** until compliance is resolved.
- A function moves to **Live** only by passing the execute-and-revoke certification against the six invariants. New channels are added at the **executor** layer; the constitutional model does not change.

## Architecture Under Observation

This section records architecture we *expect* but have **not yet earned the right to build**. It obeys the same promotion ladder the system does: every item is tagged by status, and each hypothesis lists the **evidence that would justify promoting it**. Nothing here is decided. If you are reading a sketch below six months from now, it is an *active hypothesis intentionally waiting for evidence* — not a plan that was forgotten, and not an architecture that was decided.

**Lifecycle states (formalized across the project — do not collapse them):**

| State | Meaning | Promotion requirement |
|---|---|---|
| **Implemented** | Running in production | Operational verification |
| **Certified** | Passed its Definition of Done | Certification evidence (execute + revoke) |
| **Planned** | Approved to build | Explicit design decision |
| **Under Observation** | Interesting hypothesis | Empirical evidence |
| **Rejected** | Tested and disproven | Preserved as institutional learning (not deleted) |

Today: Email = **Implemented** (delivery rail), **Certified-pending** (UI A/B). Calendar = **Planned** (executor #2). Hypotheses A & B below = **Under Observation**. Rejected = none yet.

### Hypothesis A — Authorized Action becomes the shared object across executors
*Closer to earned (one executor today; soon two).* Email and Calendar appear to share one concept — an **Authorized Action** (authored · consented · executed · audited · revocable), with the channel as an implementation detail. If so, `/studio/assist` evolves to **MAIA Assist → Authorized Actions → Executors (Email · Calendar · Text)**, with a unified pending-actions view as the operational heart of Commit.

**Evidence required to promote (i.e. to build it):**
- Calendar executor implemented (executor #2).
- The *identical* execute-and-revoke certification passes for calendar — the six invariants unchanged.
- A shared action/audit shape emerges that fits both executors **without bending the six** — the difference lands in the *evidence* layer (email `provider_message_id`, calendar event id), not the *law*.

**Falsifier:** calendar forces a change to one of the six invariants → the abstraction was email-shaped; revise the law before generalizing.

### Hypothesis B — Members organize around intentions, not executors
*Richer hypothesis.* People may think "follow up with Nathan" / "remind me tomorrow," not "use email." If so, the surface organizes by **intention** (e.g. Communicate · Time · Reminders) with executors hidden beneath. Deliberately **not** folded into Hypothesis A: we have *observed* that Email and Calendar share "Authorized Action"; we have **not** observed that intentions are the primary organizing principle.

**Evidence required to promote (i.e. to build it):**
- Usage observations — what members actually ask MAIA to do.
- Interview data and navigation behavior.
- Email + Calendar coexisting long enough to see whether an intention grouping is natural.
- A stable intention vocabulary emerging (does "Communicate" hold? does "Time" appear? does "Reminders" acquire a real executor — it has none today?).

**Falsifier:** a different organizing principle emerges from usage → adopt that instead. The taxonomy is a hypothesis, not a decision.

**Until promoted:** `/studio/assist` stays the accurate capability surface above. No UI refactor — the member sees real capabilities, not aspirational structure.

### Rejected — institutional memory (none yet)

When evidence **disproves** a hypothesis, it is not deleted — it is recorded here, so the project keeps organizational *memory* instead of organizational *amnesia*. A rejected belief is still a finding. Format:

> **We believed** X. **[Calendar / usage] demonstrated** Y. **Therefore** X was rejected — *(date)*.

Nothing has been rejected yet. The first live candidate is Hypothesis A's shape: if Calendar (executor #2) bends one of the six invariants, the "the abstraction was email-shaped" belief is rejected and recorded here — with what calendar actually demonstrated — before any generalization is attempted.
