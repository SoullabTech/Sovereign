# F5 — ERASURE TRACE ADJUDICATION

**Standing: TRACE COMPLETE · ERASURE CONFORMANCE FAIL / STOP**

Bind this adjudication to the read-only F5 trace executed against:

`a5834c94656a461dd89ea2dec044e9418f355717`

No production behavior, schema, deletion logic, UI, or storage was modified during the trace.

---

## 0 · BINDING AND CUSTODY

| | |
|---|---|
| Branch at trace | `claude/festive-sagan-apvfs5` |
| HEAD at trace | `a5834c94656a461dd89ea2dec044e9418f355717` |
| Tree at trace | clean — `git status --porcelain` → 0 lines |
| Trace type | read-only evidence trace |
| Instrumentation | ⛔ **none created** — static trace over source, schema and call graph |
| Database read | ⛔ **none** — no production or shadow read was performed |
| Frozen prior inputs | D9-A `b16d2eea` · D9-B `4b4b9b55` · D9-C `a5834c94` — ⛔ none modified |

**Custody note.** The F5 trace was conducted in conversation and adjudicated by the founder. This
document records that adjudication. ⛔ It adds no finding of its own: §§1–8 are the founder's
ruling; §9 is the evidence the trace produced, recorded so the ruling can be verified without
re-running it. Where §9 and §§1–8 describe the same fact, §§1–8 govern.

---

## 1 · RULING

F5 succeeded as an evidence obligation: the current erasure organism is now sufficiently traced to
adjudicate.

The organism does **not** presently satisfy a trustworthy sovereign-erasure boundary.

Therefore:

**F5 TRACE — COMPLETE**

**F5 ERASURE CONFORMANCE — FAIL / STOP**

**SPM IMPLEMENTATION — REMAINS CLOSED**

⛔ Discovery of these failures does not itself authorize repair.

---

## 2 · LOAD-BEARING FINDINGS

The member-facing account-deletion route is not an authoritative map of the storage graph.

242 distinct tables carry foreign keys to `members(id)`, while the route explicitly governs only
43 tables. The remainder are disposed through implicit database behavior:

* **161 CASCADE**,
* **24 RESTRICT**,
* **43 NO ACTION**,
* **30 SET NULL**,

with additional member-linked stores carrying no foreign key at all.

⭐ Implicit CASCADE is not itself a violation. The failure is that the governed erasure process
cannot presently account explicitly for the complete resulting disposition.

Major Writer's Studio and related stores use RESTRICT while remaining absent from
`GOVERNED_CONTENT`. A member can therefore pass the explicit preflight and subsequently encounter
an FK failure inside the deletion transaction, producing rollback and a generic 500 rather than a
governed retained-content refusal.

`developmental_memories` appears in both `GOVERNED_CONTENT` and `OPTIONAL_CLEANUP`. Where
developmental material exists, preflight refuses deletion, making the cleanup branch unreachable
precisely when there would be material to clean.

Thirty SET NULL relationships preserve content while removing direct attribution. This may or may
not be a legitimate retention policy; ⛔ F5 does not infer otherwise. The current erasure process,
however, does not govern or explain this class as a retention disposition.

Several member-associated stores have no FK relationship to `members(id)` and therefore survive
deletion unless separately governed.

---

## 3 · D9-C CONSEQUENCE — ORPHANED AUTHORITY

`circle_memberships.member_id` and `shared_artifacts.shared_by` can survive account deletion
without a governing FK.

D9-C established that `circle_memberships.consent_mode` is an audience-indexed representation
warrant: changing it can cause already-published representations to cease without changing the
underlying material, provenance, or present standing.

Account deletion can therefore produce a state in which:

> **the representation survives → its warrant survives → the warrant-holder has been erased →
> the ordinary revocation act can no longer be exercised.**

⭐⭐ This is an **orphaned authority state**.

F5 therefore earns the following invariant:

> ## **Deletion may not convert revocable member authority into irrevocable surviving authority.**

⛔ This invariant does not determine whether surviving representation should be deleted, revoked,
anonymized, retained as history, or handled by another governed disposition.

It requires only that erasure not strand an operative representation under authority the erased
sovereign can no longer exercise.

---

## 4 · MEMBER-VISIBLE TRUTH

The account-deletion API has a governed 409 refusal containing:

* a truthful message,
* retained content,
* `accountChanged: false`,
* and a next step.

The current Account Settings client handles `res.ok` only and does not read or render that
response body.

Therefore the server-side refusal exists but does not reach the member.

The same surface provides no governed explanation for a generic 500 caused by an unenumerated
RESTRICT / NO ACTION dependency.

F5 earns the following requirement:

> ## **An erasure refusal is not complete merely because the server knows why it refused. The member must receive the governed reason and an unambiguous statement of whether anything changed.**

---

## 5 · POSITIVE FINDINGS

No active `mem0` importer was found.

Vector embeddings examined in this trace reside with their owning rows rather than in a separately
evidenced off-system store.

`member_memory_atoms` and `interpretive_ledger` are presently covered by member-linked cascade
behavior.

⚠️ These findings narrow the repair problem but do not cure the incomplete erasure contract.

---

## 6 · F5-DERIVED ACCEPTANCE REQUIREMENTS

The subsequent combined D9 + F5 falsification contract must preserve at least these distinctions:

**Identity** — who holds deletion authority.

**Content disposition** — every governed class that is erased, retained, blocked, anonymized, or
otherwise transformed.

**Lineage** — retained content must not lose attribution or derivation meaning accidentally.

**Present standing** — withdrawal/deletion must not silently restore or preserve current influence
contrary to the member's act.

**Crossing / representation authority** — deletion must not leave an active crossing under an
authority its erased holder can no longer exercise.

**Member-visible truth** — success, refusal, retention, rollback, and no-change outcomes must be
rendered accurately to the member.

**Manifestability** — the erasure outcome must be explainable from the governed erasure mechanism
itself rather than reconstructed from incidental FK behavior after the fact.

⛔ These are falsification requirements, not implementation instructions.

---

## 7 · NOT AUTHORIZED

This adjudication does not authorize:

* FK changes,
* cascade changes,
* schema changes,
* new erasure tables,
* UI repair,
* Writer's Studio deletion,
* Circles deletion or revocation repair,
* `developmental_memories` repair,
* backfills,
* SPM implementation.

⭐ **F5 failure does not mean "delete absolutely everything."** Some evidence, audit records,
relationship history, or de-identified material may legitimately survive. The failure is that
today the system cannot give a coherent, complete, member-visible account of **what survives, why
it survives, what authority survives with it, and whether the member can still exercise that
authority.**

---

## 8 · STANDING

```
D9                        ✅ CLOSED — qualified boundary established
F5 TRACE                  ✅ COMPLETE
F5 ERASURE CONFORMANCE    ⛔ FAIL / STOP — current erasure boundary does not conform
SPM IMPLEMENTATION        ⛔ CLOSED
REPAIR                    ⛔ NOT YET AUTHORIZED
NEXT AUTHORIZED ACT       construct the combined D9 + F5 falsification contract
                          from the evidence already earned
```

⛔ **Do not begin repair until that contract has been adjudicated.**

---

## 9 · EVIDENCE APPENDIX

⛔ **Not adjudication.** The trace's own evidence, recorded so §§1–8 can be verified without
re-running it. Line numbers are orientation for a reader at this SHA; the **operation** cited is
the identity of the evidence.

### 9.1 · Entry point

`app/api/members/delete-account/route.ts` (292 lines), reachable from
`components/account/AccountSettings.tsx:827`. It is the only member-facing account-erasure path
found. The manuscript/vault lane (`lib/manuscript/source/eraseManuscript.ts` →
`vault_erasure_queue`) is per-artifact, member-initiated, and **never invoked by account deletion**.

The route carries the 2026-07-28 containment repair: `CONTAINMENT_POSTURE = 'refuse'`, a
**43-entry** `GOVERNED_CONTENT` preflight collapsed into **9** member-legible labels, a 3-entry
`OPTIONAL_CLEANUP`, and a 409 carrying `accountChanged: false`.

### 9.2 · FK census over `members(id)`

Method: per-migration `awk` associating each `REFERENCES members(id)` clause with its enclosing
`CREATE TABLE`, deduplicated to distinct (table × action) pairs across
`database/migrations/*.sql`.

| Action | Distinct tables |
|---|---|
| CASCADE | 161 |
| NO ACTION (implicit) | 43 |
| SET NULL | 30 |
| RESTRICT | 24 |
| **Total distinct tables with an FK to `members(id)`** | **242** |

### 9.3 · RESTRICT — blocks `DELETE FROM members`, none in `GOVERNED_CONTENT`

`ask_authorization_acts` · `ask_threads` · `developmental_observation_standing_events` ·
`living_work_expressions` · `living_work_material_considerations` · `living_work_visuals` ·
`living_works` · `manuscript_collections` · `manuscript_keeps` · `manuscript_renders` ·
`manuscript_revision_authorizations` · `manuscript_revision_offers` ·
`manuscript_source_arrivals` · `manuscript_working_drafts` · `member_manuscripts` ·
`practice_fields` · `proposal_chains` · `relationship_space_artifacts` ·
`relationship_space_messages` · `relationship_space_notes` · `relationship_spaces` ·
`working_draft_revisions` · `writer_studio_chapter_review_runs`

### 9.4 · SET NULL — content survives, attribution removed

`admin_access_log` · `admin_role_grants` · `bug_reports` · `commons_contributions` ·
`comms_threads` · `contribution_levels` · `definitions` · `encounter_moments` ·
`encounter_participants` · `event_attendees` · `field_activity_log` · `field_decisions` ·
`field_kanban_cards` · `focus_garden_sessions` · `guidance_signals` · `invites` · `observations` ·
`onboarding_events` · `practice_field_containment_events` ·
`practitioner_client_reconciliation` · `practitioner_clients` · `protocol_observations` ·
`recognitions` · `relationship_spaces` · `sliding_scale_requests` · `spiralogic_reports` ·
`sponsorship_pool` · `studio_pattern_protocols` · `system_voice_profile`

### 9.5 · No FK to `members(id)` — survive unless separately governed

`circle_memberships` (`member_id UUID NOT NULL`) · `shared_artifacts` (`shared_by UUID NOT NULL`) ·
`audit_logs` · `memory_transition_records` · `memory_cut1_trace_runs` · `runtime_consent_state` ·
`agent_runs` · `integration_passes` · `selflet_nodes` / `selflet_messages` /
`selflet_reinterpretations` / `selflet_metamorphosis`.

⭐ `context_disclosure_receipts` is of this shape and **is** named in `GOVERNED_CONTENT`, on the
route's own stated reasoning: *"Retention may be shared by decision. It may not be shared by
accident."* It is the one table of this class caught deliberately.

### 9.6 · Cascaded but unnamed

`member_memory_atoms` (`member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE`) and
`interpretive_ledger` and its two sibling tables (same clause) are erased by cascade and appear in
neither `GOVERNED_CONTENT` nor `OPTIONAL_CLEANUP`, so they are neither counted by the preflight nor
named in the response.

### 9.7 · The two refusal regimes

* **Governed** — `governedContentFor()` is read-only; on any non-zero count the route returns 409
  with `error: 'deletion_incomplete_unavailable'`, a plain-language `message`, `accountChanged:
  false`, `nextStep: 'contact_support'`, and `retained[]`.
* **Ungoverned** — a RESTRICT / NO ACTION dependency raises inside `transaction()`, the whole
  transaction rolls back (including the session revocation, so the account survives intact), and
  the outer `catch` returns `{ error: 'Failed to delete account' }` with status 500.

### 9.8 · The client

`deleteAccount()` in `components/account/AccountSettings.tsx` branches on `res.ok` only. The
response body is never read — `res.json()` appears **zero** times in that function — and no
`deleteError`, `retained`, `accountChanged` or `deletion_incomplete` identifier exists anywhere in
the file. Both the 409 and the 500 fall through to `finally { setDeleting(false) }`.

### 9.9 · Negative findings

`lib/memory/mem0.ts` is imported only by `lib/vectors/soulIndex.ts` and `lib/semantic/index.ts`,
neither of which has any importer — no reachable off-system copy. Vector embeddings encountered in
this trace are columns on their owning rows (`developmental_memories.vector_embedding`,
`selflet_nodes.essence_embedding`, the 1536-dim session-memory columns); the `query_embedding`
occurrences in `20241202000001_create_session_memory_tables.sql` are **function parameters**, not
stored rows.

---

> *The route was repaired so the member would hear the truth at the moment they are most entitled
> to it. Server-side the repair is real. It is not rendered — and beyond it, a warrant can outlive
> the person who holds it.*

**STOP.**
