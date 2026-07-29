# Commitments — schema and link contract

**Status: PROPOSAL. Design only — not canon, not ratified architecture.**
Class: *Designed*, not *Live*, under `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`. Commitments does not exist.

⚠️ **The five decisions in §7 are unresolved.** Merging this document records the proposal; it does **not** ratify those decisions and confers no more authority on them than they presently have. Implementation requires each to be adjudicated explicitly. Per `feedback_constitutional_governance_lifecycle`: Candidate → Reconcile → Ratify → Living. This is at **Candidate**.

**Founder review 2026-07-28 (recorded, not closing):** §2.1 `authorship` — provisional approval, refinement applied below. §2.1 no `maia`/`system` value — **approved**. §4.2 `member_connected` — **approved for R1**, framing corrected. §7.2 preference vocabulary — **resolved** by `CONSENT_VOCABULARY_CONSOLIDATION.md` (canonical: `surface_preference`; its *default* remains undecided). §7.4 sheet vs route — strong preference for sheet, but the product reason must lead; recorded below.

**Blocked on:** PR #793 (journal session-identity) merging. Ruling 9 of 2026-07-28 is an ordering gate: the journal auth findings resolve before capability implementation proceeds. Commitments links *to* journal entries, so building on that surface first would create new code against an ownership model already known to be unsafe.

**Governing documents:** `docs/canon/THE_HOUSE.md` (ratified direction) · `docs/architecture/CAPABILITY_ACCESS_MODEL_PROPOSAL.md` · `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`.

**Scope ruling (Kelly, 2026-07-28 eve):** *"Shared infrastructure only; no speculative Becoming implementation."* This document specifies Commitments in full, plus **only** the shared infrastructure Commitments genuinely requires and Becoming will later reuse. Becoming's own schema is deliberately absent — see `BECOMING_IMPLEMENTATION_GATE.md`.

---

## 1. What a commitment is

> **Commitments — *How will I respond?*** Choice. What the member decides to carry forward, in their own words. — `THE_HOUSE.md`

A commitment is **not** a task, a goal score, a habit streak, a notification trigger, an accountability metric, or evidence that the member is progressing. It is a thing a member said they would carry, recorded in their language, with a history they own.

**Release-1 loop (the smallest honest one):** create → optionally connect an origin → record a return → revise / pause / complete / release → revisit history.

---

## 1a. The name — audited, kept, and namespaced

**Ruled 2026-07-29.** The Becoming gate refused `practice` partly because the word was already spent
eight ways in-repo. That audit had never been run for `commitment`. It has now.

**"Commitment" is already live, practitioner-side, meaning a different object:**

| Existing use | What it is |
|---|---|
| `components/practitioner/dashboard/CommitmentCards.tsx:17` → wired at `app/practitioner/dashboard/page.tsx:282` | counts drawn from **`rl_containers`** (relational containers: active/paused/closing/inquiry) |
| `v_rl_practice_commitments` (`20260120000001_relational_ledger.sql:606`) | a rollup view over the same containers |
| `threshold_events.event_type = 'commitment'` (`20260210000001_threshold_events.sql:22`) | *"pledged to a direction"* — an event type, not an entity |

**Ruling: the room remains Commitments.** The collision is real but is a vocabulary-governance problem,
not grounds to abandon a clear human destination. The two surfaces address different human
relationships — commitments *within a practitioner's relational work* versus commitments *a member
chooses to carry forward in their own life*. The governing question for the member room is unchanged:
**How will I respond?**

⛔ **The namespace is therefore load-bearing:**

- House Commitments are **member-owned** commitments. Say so in domain language and in code.
- Practitioner relational containers must **not** become the schema or conceptual model for this room.
- Do **not** reuse `rl_containers` or `v_rl_practice_commitments`.
- Do **not** use a bare `commitments` table, route segment, or type name where namespace ambiguity
  would result. Member-owned objects carry the `member_` prefix already used across this contract.

**Do not rename the room merely to make the database vocabulary easier.**

---

## 2. `member_commitments`

```
id              UUID PK DEFAULT gen_random_uuid()
member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE
title           TEXT NOT NULL                    -- the member's own words
description     TEXT
why             TEXT                             -- why it matters, member-authored
status          TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','paused','completed','released','archived'))
timeframe_type  TEXT NOT NULL DEFAULT 'open'
                CHECK (timeframe_type IN ('open','date'))
target_date     DATE                             -- NULL unless timeframe_type='date'
authorship      TEXT NOT NULL
                CHECK (authorship IN ('member_authored','member_adopted'))
surface_preference TEXT NOT NULL      -- NO DEFAULT. Ruled 2026-07-29; see 2.2b
                CHECK (surface_preference IN ('member_pulled','contextual_doorway','ritual_review_opt_in'))
                -- Name is canonical per CONSENT_VOCABULARY_CONSOLIDATION.md.
                -- RULED 2026-07-29: no DEFAULT. The two live tables deliberately
                -- differ (atoms 'contextual_doorway' because keeping is itself
                -- the consent act; anchors 'member_pulled' because answering a
                -- prompt is not) and Commitments must inherit neither by
                -- imitation. The application layer supplies the value on every
                -- insert; the migration refuses omission rather than silently
                -- encoding product policy. State the reasoning for whichever
                -- value is chosen in the migration header. See 2.2b.
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
completed_at    TIMESTAMPTZ
released_at     TIMESTAMPTZ
archived_at     TIMESTAMPTZ

CHECK (timeframe_type = 'date') = (target_date IS NOT NULL)
```

### 2.1 `authorship` — the authority boundary enforced in schema

This is the load-bearing column, and it is **not** the brief's `authored_by = member`.

`member_id` already records *whose* commitment it is. What `authorship` records is *how the words came to exist*:

| Value | Meaning |
|---|---|
| `member_authored` | The member wrote it. |
| `member_adopted` | MAIA proposed language; the member explicitly accepted it. |

**There is deliberately no `system`, `maia`, or `inferred` value.** A row cannot be written without one of these two, so *the schema itself refuses a MAIA-created commitment* — the constraint that Invariant 16 and THE_HOUSE's governing principle require is a CHECK, not a code convention that a later refactor can quietly drop. MAIA may offer language; it can never become the recorded originator of a commitment.

**What `authorship` records — the decisive act, not word provenance.**

`authorship` names **the act by which the commitment entered canonical form**. It is not a forensic account of where the words came from, and must never be implemented or described as one.

This matters because real cases sit on a spectrum: MAIA language accepted verbatim · MAIA language heavily rewritten by the member · member language lightly refined by MAIA. A binary would flatten that spectrum if read as a claim about word origin. Read correctly it does not, because the question it answers is *"what act made this canonical?"* — and there are only two answers: the member wrote it, or the member accepted it.

A member who takes MAIA's draft and rewrites it substantially has **authored** it; `member_adopted` is for language that entered canonical form *by the act of acceptance*. Implementations must not compute this from diff ratios or word overlap. If the spectrum later proves to need more resolution, that is a schema ruling on evidence, not a reason to add values now.

⚠️ **Decision needed (§7.1):** the repo's existing `authored_by` is split — a TEXT role string in `personal_living_fields`, a `UUID REFERENCES members(id)` in `encounters` and `recognitions`. Neither expresses the member-authored/member-adopted distinction. This proposes a **third, differently-named** column rather than overloading a name that already means two things.

### 2.1a `authorship` already exists — this extends a live vocabulary

**Correction (trunk re-audit, 2026-07-29).** An earlier reading of this section treated `authorship` as a
column Commitments introduces. It does not. `member_field_note_threads.authorship` is **live in
production**, written by three routes with an identical `saveThread()`:
`app/api/now-what/field-note/route.ts:128`, `app/api/maia/vision-studio/field-note/route.ts:111`,
`app/api/maia/field-lab/field-note/route.ts:125`.

Its live values and the act each records:

| Live value | `is_directly_stated` | `member_decision` | The decisive act |
|---|---|---|---|
| `member_authored` | `true` | `create` / `split` | the member wrote it |
| `member_confirmed` | `false` | `keep` / `revise` | the member **adopted** MAIA-proposed language |

`member_confirmed` and this document's `member_adopted` are **the same semantic**, under two names.

**Ruled 2026-07-29: rename the authorship value `member_confirmed` → `member_adopted`.**
A deliberate semantic correction, not a new vocabulary. Commitments therefore **extends and clarifies a
shared vocabulary**, and does not introduce one — a materially different review question.

**Migration cost is zero today.** Production holds 6 rows in `member_field_note_threads`, all
`member_authored`/`create`; **zero rows carry `member_confirmed`**. The window closes the first time a
member keeps a MAIA proposal. Scope: one union type and two literals in each of the three routes.

⛔ **Explicitly out of scope — do NOT perform a broad token rename.** Four unrelated things share the
token and must be left untouched:

| Leave alone | What it is |
|---|---|
| `member_field_note_threads.member_confirmed` | a **BOOLEAN column**, hardcoded `TRUE` on every insert |
| `consent_state = 'member-confirmed-memory'` | consent vocabulary (see `CONSENT_VOCABULARY_CONSOLIDATION.md`) |
| `field_program_positions.member_confirmed_at` | position lane |
| `statedBy = 'member_confirmed'` | position lane |

The rename disambiguates three of these by removing the fourth meaning from the token.

### 2.2 Lifecycle

```
active ⇄ paused
active | paused → completed   (sets completed_at)
active | paused → released    (sets released_at)
any               → archived  (sets archived_at)
```

- **`released` is not failure.** It is a member deciding this is no longer theirs to carry. UI and copy must not rank it below `completed`.
- **No state is ever set by the system.** No inactivity timer completes, releases, or archives anything. `target_date` passing changes nothing — there is no `overdue`.
- **History is preserved, never overwritten.** Status transitions and edits append; they do not destroy the prior record.
- **Retention is UNRESOLVED — `archived` does not settle it.** (Founder ruling, 2026-07-28; scope of the
  separation ruled 2026-07-29 — see **§2.2a**, which governs.)

  > **Commitment lifecycle is proposed; member withdrawal and deletion semantics remain undecided and must not be inherited silently from Journal.**

  ⚠️ The first draft of this document said *"no hard delete in Release 1; `archived` is the terminal state,"* justified by matching `studio_changes`. That reasoning **inherited Journal's permanence posture by imitation rather than deciding it** — and Journal was subsequently found to offer members no delete at all. Copying a gap is not the same as choosing a policy.

  **Three semantics that must not be conflated:**

  | Layer | Question it answers |
  |---|---|
  | **Lifecycle** | What happened to the commitment? (`active` → `completed` / `released`) |
  | **Visibility** | Should it remain in the active experience? (`archived`) |
  | **Retention** | May the system continue to store it at all? (**undecided**) |

  `archived` answers **visibility only**. Conflating these is how *"archived"* quietly becomes *"kept forever."*

  A commitment is a declared orientation, not a record of inner expression — so it may warrant a different retention posture than a journal entry. That is a decision to take deliberately, with its own confirmation semantics and a truthful account of what withdrawal removes, once the propagation inventory for member-authored content exists. Account deletion cascades via `member_id`; that is the only removal path this design currently assumes, and it is not a substitute for per-object member authority.

### 2.2a Retention is independent of lifecycle — RULED 2026-07-29

The two questions do not answer each other, and R1 answers only the first:

| | Governs |
|---|---|
| **Lifecycle** | how the commitment participates in the member's experience |
| **Retention** | whether the system continues storing it at all |

A commitment can be `active`, `paused`, `completed`, `released`, or `archived` **without any of those
saying whether the member wants it retained.**

**Ruled:**

- ⛔ Do **not** infer Journal's retention policy. Journal was found to offer members no delete at all;
  copying that is inheriting a gap, not choosing a posture.
- ⛔ Do **not** introduce automatic deletion of any kind.
- ✅ **Leave retention unresolved in R1** rather than encoding an assumption into the schema.
- If a placeholder is ever required, it must be one that **preserves future flexibility**, never one
  that silently establishes product policy.

`archived` therefore remains a **visibility** state and nothing more. Account deletion cascades via
`member_id`; that remains the only removal path this design assumes, and it is not a substitute for
per-object member authority.

### 2.2b `surface_preference` has NO DEFAULT — RULED 2026-07-29

`surface_preference` is a **consent** question, not a schema convenience.

The two live tables deliberately differ — memory atoms default `contextual_doorway` because the act of
keeping is itself the consent act; daily anchors default `member_pulled` because answering a prompt is
not. **Commitments is a different kind of member-owned object and must not inherit either by imitation.**

**Ruled: define no DEFAULT.** The column is `NOT NULL` with no default, so the application layer must
supply the value intentionally on every insert.

> The migration **refuses omission** instead of silently encoding product policy.

The specific value Commitments should carry is an implementation-time decision to be taken explicitly
and recorded — not settled here, and not settled by whichever value is easiest to write.

### 2.3 Prohibited vocabulary

Not in schema, API, copy, or logs: `overdue` · `failed` · `on track` · `behind` · `adherence` · `streak` · `completion rate` · `performance` · `success`. Counts are arithmetic and unqualified.

---

## 3. `commitment_returns`

A member-authored record of returning to a commitment. Not a check-in, not a completion tick.

```
id            UUID PK DEFAULT gen_random_uuid()
commitment_id UUID NOT NULL REFERENCES member_commitments(id) ON DELETE CASCADE
member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE
note          TEXT                               -- optional; a return may be wordless
occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() -- member may backdate
authorship    TEXT NOT NULL CHECK (authorship IN ('member_authored','member_adopted'))
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

`member_id` is denormalized deliberately: every ownership predicate binds on the row being read, so no query depends on a join to be safe.

**A return is only ever created by an explicit member gesture.** Nothing infers one from a conversation, a journal entry, or elapsed time.

---

## 4. The shared link contract — `member_object_links`

This is **the** piece of shared infrastructure. Becoming will reuse it unchanged; nothing about it is Becoming-specific.

### 4.1 Why not `memory_links`

`memory_links` (`20251231_memory_architecture_enhancements.sql`) has the right *shape* — polymorphic `from_table`/`from_id` → `to_table`/`to_id` with a `link_type`. It has the wrong *identity lane*:

- scoped by `user_id TEXT`, not `member_id UUID REFERENCES members(id)` — no FK, no cascade;
- `created_by` defaults to `'system'`, the inverse of what this capability requires;
- its `link_type` vocabulary (`supports`, `contradicts`, `evolves`, `repeats`, `triggers`, `derives_from`) is **interpretive** — those are claims about meaning, which is exactly what the member alone may author.

Extending it means adding a member FK, flipping the provenance default, and adding a non-interpretive link type — close to the cost of a correct table, while leaving the legacy lane's semantics attached.

⚠️ **Decision needed (§7.3).** Recommendation: new table, and leave `memory_links` to the legacy synthesis lane.

### 4.2 Shape

```
id            UUID PK DEFAULT gen_random_uuid()
member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE
from_type     TEXT NOT NULL          -- e.g. 'commitment'
from_id       UUID NOT NULL
to_type       TEXT NOT NULL          -- see the allowlist below
to_id         TEXT NOT NULL          -- TEXT: source PKs are not uniformly UUID
relation      TEXT NOT NULL DEFAULT 'member_connected'
              CHECK (relation IN ('member_connected'))
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()

UNIQUE (member_id, from_type, from_id, to_type, to_id)
INDEX (member_id, from_type, from_id)
INDEX (member_id, to_type, to_id)
```

**`relation` has exactly one value — a deliberately non-semantic link.**

The correct reading (founder, 2026-07-28): this is **not** a claim that the connection is meaningless. It has meaning to the member. *The system declines to name that meaning.*

The row records the member's **act** of joining two objects. It does not encode causation, resolution, development, or psychological significance. The moment a second value exists — `caused`, `resolves`, `evolves` — the platform is making an ontological claim about someone's life. Richer interpretation, where it is wanted, belongs in **member-authored language** (the commitment's `why`, a return's `note`), not in a system-owned vocabulary.

If a richer set is ever proposed, the member must supply the words, and it is a separate ruling.

### 4.3 Source allowlist

`to_type` is a closed set, enforced in application code against a single registry (not a CHECK — it will grow):

| `to_type` | Table | Owner column | Verified |
|---|---|---|---|
| `to_type` | Table | Ownership predicate | Verified |
|---|---|---|---|
| `journal_entry` | `quick_journal_entries` | `user_id` ⚠️ TEXT, legacy lane + alias expansion | ✅ after #793 (merged + deployed `471bdf85c`) |
| `change` | `studio_changes` | ⚠️ **dual-owner — see 4.3a** | ❌ **not eligible under a table-level rule** |
| `commitment` | `member_commitments` | `member_id` | new |
| `memory_atom` | `member_memory_atoms` | `member_id` | ✅ |
| `episodic_mark` | `episodic_memories` | `user_id` + `marked_by_member = TRUE` | ✅ (6 rows, founder-only, 2026-07-29) |

### 4.3a `studio_changes` is dual-owner — an allowlisted table is not an allowlisted row

**Ruled 2026-07-29.** The row above previously read `member_id` ✅. That is unsafe.
`studio_changes` (`database/migrations/20260212000001_studio_changes.sql:12`) carries **two nullable
ownership columns**: `practitioner_id REFERENCES practitioners(id)` **or**
`member_id REFERENCES members(id)`, with two parallel route families reading it —
`app/api/changes/**` filters `member_id`, `app/api/studio/changes/**` filters `practitioner_id`.

Naming `member_id` as *the* owner column would let a **practitioner-owned** row enter a member's link
graph. This is the same class as the middleware role-trust lane: authorization inferred from a column
that is not always the owner.

Required for any `studio_changes` link:

- `member_id = <authenticated member>`; **and**
- `practitioner_id IS NULL`, unless a separately governed relationship explicitly authorizes otherwise;
- server-side ownership verification at **both** link creation **and** link retrieval;
- any row with ambiguous ownership is **rejected**, not resolved by precedence.

**Preferred alternative:** resolve `change` links through a member-only view or resolver, so the generic
link layer never queries the dual-owner table directly.

> **The principle, general to the registry: an allowlisted table is not an allowlisted row.
> Ownership must be proven for the specific object.**

This is a **security requirement for R1**, not a schema footnote.

**Every link write ownership-checks the target independently.** Holding a commitment does not authorize linking to an arbitrary id — the target row must resolve to the same session member. A registry entry supplies the table, the owner column, and the predicate; there is no generic "trust the id" path.

⚠️ `quick_journal_entries.user_id` is TEXT on the legacy lane with the username/`{username}-nezat` aliases. The ownership predicate must reuse the same alias expansion #793 preserved. **This is the concrete reason Commitments waits for #793.**

### 4.3b R1 boundary — the smallest provenance primitive, justified by Commitments alone

**Ruled 2026-07-29.** Source provenance stays in R1: a member must be able to make a commitment
directly, **or** from a Journal entry, a Change, or another explicitly supported member-owned source.

This does **not** authorize a universal graph. The R1 rule:

> Build the smallest member-owned provenance link primitive required to show **where a commitment came
> from** and to preserve **explicit adoption**. Nothing more.

⛔ Not authorized in R1:

- arbitrary many-to-many graph traversal;
- synthesized cross-room intelligence;
- inferred relationships;
- Becoming-specific link types;
- a generic ontology for every future House object.

The primitive may prove reusable later — the Becoming gate §5 anticipates exactly that — but it must be
**justified completely by Commitments today**. The governing test is unchanged: *does Commitments need
this to ship?* If no, it is speculative work regardless of how reusable it looks.

### 4.4 Missing and deleted sources

A link whose target no longer resolves renders as *"a linked entry that is no longer available"* and is never silently dropped — the member connected something, and that act is theirs. Read paths must tolerate a dangling target without failing the whole view.

---

## 5. API surface

**Guard: `getMemberIdFromRequest` on every route**, ownership bound in the SQL `WHERE`, so a foreign id affects zero rows and returns 404 rather than leaking existence. Model: `app/api/anchor/[id]/surface-preference/route.ts`.

Named gesture endpoints, not a generic PATCH — the same reason the anchor route is shaped that way: each endpoint states what act it performs, and lifecycle transitions cannot be smuggled through a field update.

```
GET    /api/commitments                      list (status filter)
POST   /api/commitments                      create        { title, description?, why?, timeframe, authorship }
GET    /api/commitments/[id]                 detail + returns + links
PATCH  /api/commitments/[id]                 edit title/description/why/timeframe only
POST   /api/commitments/[id]/pause
POST   /api/commitments/[id]/resume
POST   /api/commitments/[id]/complete
POST   /api/commitments/[id]/release
POST   /api/commitments/[id]/archive
POST   /api/commitments/[id]/returns         record a return { note?, occurred_at? }
DELETE /api/commitments/[id]/returns/[rid]   member corrects their own record
POST   /api/commitments/[id]/links           { to_type, to_id }  — target ownership-checked
DELETE /api/commitments/[id]/links/[lid]
POST   /api/commitments/[id]/surface-preference
```

`authorship` is set by the client to `member_adopted` **only** on the adoption path (§6) and is otherwise `member_authored`. It is never inferred server-side.

---

## 6. Adoption — reuse, do not rebuild

The primitive exists: **`keepSource()`** (`lib/psyche/portfolio.ts:340`, *"Arrival ≠ keeping"*) with **`lib/psyche/keep-governor.ts`** governing whether an offer may be made at all (pause posture, decline streaks). These already express the boundary this capability needs; Commitments adopts them rather than introducing a parallel concept.

**The rule:** MAIA-proposed language is a *suggestion* until an explicit member gesture accepts it. On acceptance the row is written with `authorship = 'member_adopted'`. There is no code path from a model response to a persisted commitment without that gesture.

---

## 7. Decisions required before implementation

| # | Decision | Recommendation |
|---|---|---|
| 7.1 | `authorship` as a new column vs overloading `authored_by` | **New column.** `authored_by` already means two incompatible things in-repo (role string / member FK) and neither carries the authored-vs-adopted distinction. |
| 7.2 | Consent column name: `surface_preference` (anchors) or `return_preference` (atoms) | ✅ **RESOLVED — see `CONSENT_VOCABULARY_CONSOLIDATION.md`.** Canonical: **`surface_preference`**. Commitments adopts it. ⚠️ Its **default** is a separate decision requiring its own stated reasoning — the two live tables deliberately differ (atoms `contextual_doorway`, anchors `member_pulled`), and the default must not be inherited by copy-paste. |
| 7.3 | New `member_object_links` vs extending `memory_links` | **New table** (§4.1). |
| 7.4 | Sheet vs route | See §7.4a — the product reason must lead. |
| 7.5 | Whether `episodic_mark` ships in the Release-1 allowlist given zero rows exist | **Include in the registry, ship the UI affordance dark.** Costs nothing and avoids a schema change when the first mark arrives. |

### 7.4a Sheet vs route — architecture leads, packaging follows

⚠️ **Correction to this document's first draft** (founder, 2026-07-28). The original recommendation led with the iOS build evidence. That inverts the reasoning: **the native-build constraint is implementation evidence and must not silently decide the product ontology.**

The product question comes first:

- A **sheet** is right when Commitments is a *contextual House surface* — entered and left, without becoming a separate destination in the member's mental model.
- A **route** is right when it carries substantial internal navigation, deep-linking, browser history, or independent return behaviour.

**Present reading: Commitments is likely a House sheet** — it is entered from the House, its detail view is one level deep, and leaving it returns the member to where they were. Changes, its nearest sibling, is a sheet for the same reasons.

If that holds, architecture and packaging converge, and the iOS evidence becomes *confirming* rather than *deciding*. If a future need for deep-linking or independent history emerges, the product reason changes and the packaging constraint must be solved another way — not used to refuse the requirement.

**Packaging evidence, recorded as secondary:** `capacitor-patch-routes.sh:56` sets `MOBILE_MAIA_KEEP=()`, stripping every `app/maia/*` sub-route from the iOS bundle; Changes survives on device because it is a sheet inside the retained `/maia` root page. A sheet therefore reaches PWA and iOS in one build. Implementation cost: one `HouseDestination` entry, widening `HouseSheetId` (currently `'changes'` only), an `onOpenCommitments` prop, and the three navigation drift guards passing.

---

## 8. Explicitly NOT in Release 1

Named so they do not become hidden prerequisites:

- **Reminders / notifications.** No governed member notification system exists (`api/sovereignty/notifications` has no auth and no member scoping). Standing ruling: do not build them here.
- **Analytics.** `lib/analytics/track.ts` is a `console.log` stub. Room-opened/object-created events wait for a real system; nothing derived (no adherence, stage, quality, or flourishing inference) is ever permitted.
- **Audit trail.** No general member-object mutation audit exists; `runtime_events` is content-free substrate observability. Lifecycle history lives in the object's own columns and its returns for Release 1. A general audit facility is its own lane.
- **Practitioner or shared-field visibility.** Default private; any sharing surface is a separate ruling.
- **Member deletion / withdrawal semantics.** Explicitly undecided (§2.2), not deferred-by-silence. Depends on the member-sovereignty retention lane.
- **Becoming.** See the gate document.

---

## 9. MAIA's boundary in this room

> **MAIA may open doors. It may not describe what is on the other side of one in the member's own life.** — `THE_HOUSE.md`

**May:** help articulate language; offer to save language the member accepted; retrieve and display the member's own linked material; report dates and direct counts; ask whether the member wants to carry something forward; offer a doorway to another room.

**May not:** create a commitment; infer one from a journal entry or conversation; attach material silently; decide completion or release; characterize progress, growth, or identity; describe repeated returns as evidence of who the member has become; route the member to a "next" room on inferred readiness.

Allowed: *"You've returned to this nine times, most recently Tuesday."*
Refused: *"You're becoming someone who follows through."*

**Doorways are offers.** Declining has no effect — no re-prompting, no scoring, no recorded reluctance.

---

## 10. The invariant Commitments exists to satisfy

Sharpened by founder ruling, 2026-07-28, from the earlier *"remove the Decisions doorway"*:

> **No member surface may read, render, count, or navigate practitioner Decisions merely because the member also happens to be a practitioner.**

**Why the earlier wording was insufficient.** PR #785 removed the Decisions *doorway* from the House registry, but a caller survived: `components/journal/UnifiedJournalView.tsx:281` still calls `/api/studio/decisions`, and the member Journal page renders a Decisions count from it. The doorway went; the capability relationship did not.

**The defect this names.** *The member Journal currently changes behaviour according to an unrelated practitioner entitlement.* It works for a member who is also a practitioner and degrades for one who is not — a refusal, a missing tab, or an inconsistent surface depending on an entitlement that has nothing to do with being a member. A member surface must not have a practitioner-shaped hole in it.

**The correction, in order:**

1. Remove the practitioner Decisions dependency from the member Journal. This is a *removal*, and it does not wait for Commitments.
2. Replace it with `commitments.member` **only once that capability actually exists**.
3. Until then, **do not disguise the practitioner object as a member capability** — an empty room is honest; a borrowed one is not.

**Test for any member surface, including every surface this document proposes:** does what a member sees depend on any entitlement other than being that member? If yes, it does not ship.
