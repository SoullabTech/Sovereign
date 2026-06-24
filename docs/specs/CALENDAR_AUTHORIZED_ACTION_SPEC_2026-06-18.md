# Calendar Authorized Action — External Executor Spec

- **Date**: 2026-06-18
- **Status**: **DRAFT — does not authorize implementation.** No external calendar write until this spec is reviewed.
- **Gate**: Gate 0 **answered** (§1.2); §1.3 hardening — **Option 1 implemented in code 2026-06-18** (working tree, uncommitted; not merged/deployed). Internal-loop boundary closed *in code*; external executor remains spec-only and **not authorized**.
- **Class**: Frozen plan (Cat 5). Spec-only; describes a design, grants no runtime authority.

---

## 0. Constitutional Authority

This spec derives from, and may not exceed:

- **`docs/canon/MAIA_CONSENT_GATES.md` Art. 2** — MAIA may only *construct* a proposal (`propose_*`, never `create_*`); a single consent-gated route is the sole path to the sole writer; MAIA can never call the writer.
- **Art. 3** — reactive source (the member's request this turn), member-scoped; never an inferred observation of the person.
- **The 6 LOCKED Authorized Action invariants** (the LAW): **Authorship · Consent · Faithful Execution · No Substitution · Revocability · Legibility.** The Constitution states the law once; each executor supplies its *own* evidence for it. This spec defines the **calendar external executor's** evidence — it introduces no new philosophy.
- **Derived Principle — Non-transferable Authority** (§2): a theorem from the six, not a seventh invariant.
- **Meta-law**: *irreversibility requires an appropriate warrant; a commitment is warranted only by authorship.*

---

## 1. GATE 0 — Establish the Execution Boundary (prerequisite to everything below)

> **Gate 0.** Before any calendar executor work proceeds, determine whether an internal calendar action can produce external side effects — directly, or through synchronization.
>
> Until this boundary is verified, the internal calendar loop **cannot** be classified as "internal-only" and **cannot** inherit the lower-warrant model.

This is an engineering question, not a philosophical one. Answering it first simplifies everything downstream — and a good specification exposes where reality is still unknown before implementation begins.

### 1.1 Why it gates everything

The entire two-surface model — *internal = reversible, lighter warrant* vs *external = shared-state, spec-first* — rests on the internal loop being genuinely free of external side effects. If it is not, the warrant classification is wrong and the sequencing changes.

### 1.2 Verified answer (2026-06-18, working tree)

- **Direct escape via the proposal path — NO.** `lib/maia/proposals/executor.ts` only `INSERT`s into `calendar_events` and logs; it never calls `syncEventToCalDAV`. There is **no DB trigger, NOTIFY/LISTEN, cron, or background sweep** on `calendar_events`. The sole sync caller is the studio route.
- **Indirect escape — YES, reachable.** `calendar_events` is a **shared table**. `app/api/studio/calendar/events/route.ts` fires fire-and-forget CalDAV sync on **POST / PATCH / DELETE**. A proposal-created row that is later **created/edited/deleted through the studio UI** propagates externally. The schema default `calendar_disclosure = 'generic'` means it escapes as **"Busy"** by default (not `private`/local-only).

**Conclusion:** internal-only is a **write-path convention, not a structural guarantee.** The internal loop does not escape *on its own*, but it lives in a table whose sibling write-path syncs externally, with an externally-disclosing default.

### 1.3 Required structural hardening (precondition for step (b) certification)

The internal loop may inherit the lighter-warrant model **only if** internal-only is made structural, not conventional. At minimum one of:

1. Proposal/internal writes pinned to `sync_status = 'local_only'` **and** `calendar_disclosure = 'private'` at INSERT (today the executor sets neither, so both take the externally-leaning table defaults).
2. A structural guarantee that the internal/proposal surface can never reach `syncEventToCalDAV` (separate code path, or an explicit local-only flag the sync function honors regardless of caller).
3. (If neither holds) reclassify the internal loop as *external-capable* and route it through this spec, not the lighter-warrant track.

Until 1.3 holds, **"reversible, no third party" is false** the moment a member touches the event in Studio.

**Implemented (2026-06-18, working tree, uncommitted — Option 1):** `lib/maia/proposals/executor.ts` now pins `sync_status='local_only'` + `calendar_disclosure='private'` at INSERT. Verified: (a) the pin is present (executor.ts:83); (b) `syncEventToCalDAV()` short-circuits and returns on `calendar_disclosure === 'private'` (existing backstop guard); (c) the studio route never writes `calendar_disclosure` (its UPDATE touches only title/description/times/all_day/location), so a private proposal row stays private through Studio edits; (d) no CalDAV/sync call exists anywhere in the proposal path; typecheck clean. **Runtime row-value proof** (an actual `local_only`/`private` row) lands when the front-half executes under step (b) — code-hardened now, runtime-confirmed then. Belongs on `feature/consent-gated-calendar-proposal` (executor.ts is currently untracked on `feature/rapport-pilot-v1`).

---

## 2. The constitutional surface email never raised

Email = delivery to a recipient's **attention**. An external calendar write = a claim on a third party's **time and commitments** — it can bind others, generate obligations, and fire notifications to people who never consented to MAIA.

### Derived Principle — Non-transferable Authority

> Authorized Action permits execution only within the authority possessed by the authorizing member. MAIA cannot acquire authority the member does not possess.

This is **not a seventh invariant** — it is a **theorem derived from the existing six** (Authorship + No Substitution). A member may authorize MAIA to act **on their behalf**; a member cannot authorize MAIA **on behalf of another person.** The member's authorship can *invite* an attendee; it can never *consent for* them. Each attendee's own calendar system — not MAIA, not the member — mediates the attendee's consent. The constitution does not grow; the consequence is named.

---

## 3. Internal calendar row vs external calendar write (the boundary)

| | Internal row | External write |
|---|---|---|
| Mechanism | `INSERT` into `calendar_events`, member-scoped | CalDAV / provider write |
| Third party | none | possible (attendees, shared calendars) |
| Notifications | none | invites / updates may fire |
| Reversibility | full (delete row) | partial — *side effects* (others saw it, planned around it, were notified) survive cancellation |

**This table is true only under §1.3.** As of the Gate 0 answer (§1.2), the boundary is conventional: the same table escapes externally via the studio route, default disclosure `generic` (= syncs as "Busy"). Treat the left column as *aspirational until hardened*.

---

## 4. Explicit human authorship & consent

- MAIA may only **propose** (write-incapable tool). The member **authors**. Execution reaches the sole writer only through a consent-gated, member-authenticated confirm action.
- For **external** writes, authorship must be **re-affirmed at the external boundary** — not inherited from the internal confirm — because the footprint now reaches third parties.

---

## 5. Semantic footprint disclosure (before confirm)

The confirm UI must display, **before** the member confirms, the full footprint. Nothing the executor does may exceed what was displayed: **displayed footprint ⊇ actual footprint.**

- **calendar target** — which calendar; personal vs shared
- **attendees** — who will be invited / who can see
- **invite/notification behavior** — will invites be sent? to whom? now or scheduled?
- **timezone** — resolved value, with any assumption shown for correction
- **reminders** — default alerts that will fire
- **visibility** — public / private / busy-only (note: maps to `calendar_disclosure`)
- **recurrence** — single vs repeating; how far it extends
- **cancel/delete behavior** — what happens, and who is notified, on revoke

---

## 6. Predictability test (certification instrument)

Pre-confirm (member-facing + reviewer):

- **intended footprint** — what the member meant
- **displayed footprint** — what the UI showed
- **actual footprint** — what the executor actually did
- **confidence rating** — the member's pre-confirm confidence the action will do what they think

Post-execution (free-text, immediately after the action):

- **"Was anything different from what you expected?"**

This free-text answer is the **first member-facing instrument for the Footprint Inspector.** The member often won't know *why* something felt off — the unstructured answer is frequently more valuable than any structured delta. Capture it verbatim.

**Pass condition:** intended ≈ displayed = actual; the post-execution answer surfaces no surprise; confidence calibrated. This extends email's A/B because calendar's footprint is richer — certification must prove *footprint accuracy*, not just send/revoke.

---

## 7. Revocation semantics

**The law (constitutional):**

> Third parties should not be surprised by revocation.

This stays above implementation. Calendar *may* satisfy it through notifications; another executor may satisfy it differently. Do not encode a calendar mechanism as constitutional default.

**Calendar's implementation of the law:**

- **before creation** — cancel the proposal; nothing written; no trace beyond local UI state.
- **after creation (internal-only)** — delete row; fully reversible (subject to §1.3).
- **after creation (external)** — **delete vs cancel-with-notification.** Deleting may silently drop the event from others' calendars or leave stale copies; cancel-with-notification informs attendees. The member must be told which occurs. Calendar implements the law via **cancel-with-notification when attendees exist** — but that is *executor policy*, not constitution.
- Revocation is itself a **first-class, audited** action.

---

## 8. Audit evidence (per-executor; mirrors email's `provider_message_id`)

Each executed external action records:

- **event id** — provider / CalDAV UID; the idempotency + recovery anchor (*event-id, not message-id*; the schema already carries `external_event_id`)
- **calendar target**
- **attendees**
- **timestamps** — proposed, confirmed, executed (schema carries `last_synced_at`)
- **consent** — the member-confirmed warrant (`consent_confirmed`)
- **revocation/cancel audit** — when, by whom, whether notification was sent

Evidence is the **immutable, recoverable artifact** a verification claim attaches to. New executor = new evidence, never new philosophy.

---

## 9. Dependency: Email UI A/B certification

Executor #1 (email) is **not yet certified** — its UI A/B is pending. So:

- The general **Authorized Action → Executor interface must NOT be extracted** until #1 is certified **and** this external loop is certified. *Two instances reveal the abstraction only if the first is validated.*
- This spec's certification instrument (A = propose→confirm→write preserves authorship + consent; B = revoke proves reversibility) must be **cross-checked against email's A/B** once email passes — so shared invariants are *proven*, not assumed.

---

## 10. Liveness ladder (target — external executor)

```
External Calendar Authorized Action
Built        ✗
Wired        ✗
Merged       ✗
Deployed     ✗
Surfacing    ✗
Certified    ✗
```
*(Internal back-half: Built ✓; all else ✗ — addressed by step (b), certified separately, gated on §1.3.)*

---

## 11. What this spec does NOT authorize

- No implementation.
- **No external calendar write until this spec is reviewed.**
- No modification of the internal loop.
- No extraction of a general executor interface.

---

## 12. Open questions / frontiers

- **§1.3 hardening choice** — which of the three options makes internal-only structural (pin local-only/private at INSERT, isolate the path, or reclassify). Decide before step (b).
- **Attendee consent model** — issuing an *invite* reaches a third party; is "invite" still within "propose-only," or does it need its own gate? (Bounded by §2 Non-transferable Authority.)
- **Recurrence footprint** — how to make "every Tuesday, indefinitely" predictable and revocable.
- **Disclosure default** — whether the Authorized-Action path should invert the table default to `private` (safe-by-default) rather than inherit `generic`.
- **Tier gating** — whether external writes ship to builder/practitioner tier first before general availability.
