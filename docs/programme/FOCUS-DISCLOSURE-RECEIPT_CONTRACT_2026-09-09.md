# FOCUS DISCLOSURE RECEIPT — minimal contract

**2026-09-09 · STEP 5 — RATIFIED** (founder, same day, with four amendments and
one tightening, recorded inline below and marked ⚖️). `#1275` remains frozen until
the substrate exists **and** the Writer's Studio surface carries the visible
Focus-withheld behaviour of §3a.

> ⚖️ **THE IMPLEMENTATION GATE**
> *MAIA may see the writer's Focus only when the writer authorized the crossing,
> the system can account for it, and the writer can tell whether the crossing
> actually happened.*

> **Disclosure without accountability is not authorized. Accountability without a
> disclosure must never pretend that one occurred.**

Step 4 ruling: a **dedicated** substrate. Not `memory_transition_records`, not
`runtime_consent_state`, not `conversation_memory_uses`, not `audit_logs`, not
either `conversation_turns` column. Its only semantic job:

> Record that member-owned context crossed a defined boundary into cognition.

---

## 1 · The failure posture

| | |
|---|---|
| Accountability storage unavailable **before** crossing | ⛔ **the disclosure does not proceed.** MAIA converses without the Work context. |
| Accountability storage fails **after** crossing | ⭐ the crossing stands and the record says so: the row remains in an **unresolved** state that is permanent, queryable, and loud. |
| The conversation | **never blocked.** Accountability blocks the optional disclosure only. |

*Accountability may block the optional disclosure. It must not unnecessarily block
the conversation.*

## 2 · Protocol — one row, minted before, confirmed after, advancing only forward

```text
 1  MINT          state='attempted'   synchronous · blocking on the disclosure
      │           written BEFORE the context reaches the cognition boundary
      │           mint fails → NO DISCLOSURE. Fall back to conversation without Work context.
      ▼
 2  CROSS         the assembled context is handed to cognition
      │
      ▼
 3  CONFIRM       state='crossed'     one-way transition, idempotent
                  confirm fails → row STAYS 'attempted' → permanent anomaly + loud error
```

**`attempted` does not mean "nothing crossed".** It means *a crossing may have
occurred and confirmation was not recorded.* The record must state this in its
table comment, and no reader may read it as absence. *Unknown stays unknown.*

**Immutability is monotonic, not frozen.** Every identifying field is fixed at
mint; only `state` may advance, once, in one direction. A trigger permits exactly
`attempted → crossed` (§3 — and no other target state exists in v1) and refuses every other
UPDATE — no reversal, no rescope, no re-attempt. This is the
`runtime_consent_state` immutability pattern widened by exactly one lawful
transition, and no more.

**Idempotency.** A `disclosure_id` is minted per disclosure attempt and is UNIQUE.
Retry of the mint is `ON CONFLICT DO NOTHING`; retry of the confirm is a no-op
when already `crossed`. ⛔ A retry can therefore neither duplicate a crossing nor
contradict a recorded one.

## 3 · ⚖️ `withheld` — **OUT for v1** (amendment 1)

v1 has two states and no third:

```text
attempted  = receipt minted; crossing not conclusively recorded
crossed    = crossing conclusively recorded
```

A `withheld` state would assert *"did not cross"* — a negative **the database
cannot prove**. If mint succeeds and something aborts before cognition, the row
stays `attempted`. Conservative, and true.

> ⚖️ **Unknown may be noisy. False certainty is worse.**

⛔ `withheld` may be added later **only** if the boundary architecture yields a
*structural* proof of non-crossing — never on an application branch that merely
says so. The trigger's lawful transition set is therefore exactly
`attempted → crossed`, and nothing else.

## 3a · ⚖️ The writer must know when Focus was not disclosed (amendment 3 — MANDATORY)

An explicitly Focus-scoped act — *Ask MAIA* while the writer has placed attention
on a passage — **may not be silently downgraded into an ordinary MAIA question.**

```text
mint fails
   ↓
Focus is NOT disclosed
Focus-scoped cognition does NOT run
the writer is TOLD what happened
ordinary conversation remains available
```

Copy of the shape the founder gave:

> *I couldn't bring this Focus into MAIA just now. Nothing from the passage was
> sent. You can try again or continue without Focus.*

Three truths preserved at once: the writer knows MAIA did not see the passage;
the platform does not imply the answer is about it; the conversation stays usable.

> ⚖️ **A scoped request may fail visibly. It may not succeed under a different
> scope without the writer knowing.**

⛔ This is a law bound to the **surface**, not to the table. The substrate lane
does not discharge it, and `#1275` stays frozen until the surface carries it.

## 4 · Shape — admitted, and refused

**Falsifier:** *if possessing the receipt materially helps reconstruct what the
writer selected, the receipt contains too much.*

**ADMITTED**

| Field | Why it is not a representation of the Work |
|---|---|
| `disclosure_id` | opaque idempotency key |
| `member_id` | required for governed deletion (§5) |
| `request_ref` | ⚖️ **the temporal anchor** (amendment 4). The disclosure occurs *within the serving request*, whether or not a conversation turn is ever persisted. Also joins to `runtime_consent_state` — the posture is **referenced, never copied**: three truths, three authorities. |
| `boundary` | closed vocabulary, e.g. `writers_studio.focus → maia_cognition` |
| `work_ref` | the Work's identity — authored, not derived from the selection |
| `scope_kind` | closed: `whole_work \| section \| passage` — the **shape** of the selection, not its location |
| `section_ref` | ⭐ **only when `scope_kind = 'section'`**, where the reference *is* the disclosure. For `passage`, omitted — see below. |
| `authorized_by` + `gesture` | ⚖️ **`member` is the only v1 value** (tightening). Closed gesture vocabulary; the gesture kind, never its content. |
| `state`, `attempted_at`, `crossed_at` | the crossing itself — two states only (§3) |
| `policy_version` | which disclosure contract governed |

**REFUSED — each is a surrogate copy or a locator**

- passage text · excerpt · summary · embedding — self-evident.
- ⭐⭐ **content hash / fingerprint of the selection.** A digest leaks nothing
  *without* the Work — but the Work is exactly what anyone auditing this system
  holds. **A hash of a passage, held next to the manuscript, is a selection
  locator**: candidate spans can simply be checked against it. It fails the
  falsifier completely.
- character offsets, ranges, line numbers — these *are* the selection; recovery is
  exact.
- length in characters or words — a strong locator against a known Work, and
  itself a content-derived measure.
- selection geometry, scroll position, viewport coordinates — same, by another route.

**On `section_ref` for a passage disclosure.** Recording the containing section
narrows a reconstruction from *the Work* to *this section*. That is materially
helpful, so the falsifier excludes it. What auditing a crossing actually requires
is: **that** it occurred, **when**, across **which** boundary, from **which**
Work, at what **scope kind**, under which **policy**, and by **whose act** — never
what the passage said. ⚠️ The cost is real and should be stated rather than
smoothed over: an audit of a passage disclosure cannot identify the passage.

⚖️ **Ruled (amendment 2): keep it out.** That limitation is not a defect in the
audit trail — it states what this receipt exists to prove:

> ⚖️ **The receipt proves the governed crossing, not the identity of the content
> that crossed.**

⛔ If forensic reconstruction of an exact passage is ever needed, that is a
different custody system with a different threat model. **We do not quietly turn
this receipt into it.**

## 5 · Custody — stated, never inherited

```text
ordinary transcript pruning     DOES NOT touch the receipt (no age-based pruning at all)
Sanctuary                       receipt PERMITTED · disclosed content FORBIDDEN
account deletion                receipt DELIBERATELY DELETED (named in GOVERNED_CONTENT)
governed member purge           deleted when the encounter is within scope
future audit-retention limit    must be separately ratified — no TTL now
restore                         must honour deletion manifests + tombstones
```

*Sanctuary may retain the fact of a disclosure. It may not retain the disclosed
thing.* §4's refusals are what make that safe: with no text, excerpt, embedding,
fingerprint or offset, there is nothing in the row for Sanctuary to forbid.

The substrate must be **named in `GOVERNED_CONTENT`** in
`app/api/members/delete-account/route.ts` with a member-legible label. It must
never survive account deletion the way `audit_logs` does — *by nobody having
listed it.* The `deletion_manifests` / `provenance_tombstones` layer retains the
content-free fact that the deletion occurred; the table name is nameable in a
`deletion_manifest_scopes` row and its ids tombstonable with no change to S5.

Table comment must state the lifecycle as constitution, in the
`runtime_consent_state` manner: *content-free by constitution; identifying fields
immutable at mint with one lawful forward transition; no automatic pruning;
deliberately deleted with the member's account; restores honour manifests and
tombstones; `attempted` means unresolved, never absent.*

## 6 · ⚖️ Ratified shape — the substrate lane implements this

```sql
focus_disclosure_receipts(
  id uuid pk,
  disclosure_id text UNIQUE NOT NULL,
  member_id  text NOT NULL,
  request_ref text NOT NULL,              -- temporal anchor; joins runtime_consent_state
  boundary   text NOT NULL CHECK (boundary IN (...)),
  work_ref   text NOT NULL,
  scope_kind text NOT NULL CHECK (scope_kind IN ('whole_work','section','passage')),
  section_ref text CHECK (section_ref IS NULL OR scope_kind = 'section'),
  authorized_by text NOT NULL CHECK (authorized_by = 'member'),   -- v1: member only
  gesture    text NOT NULL CHECK (gesture IN (...)),
  policy_version text NOT NULL,
  state      text NOT NULL CHECK (state IN ('attempted','crossed')),
  attempted_at timestamptz NOT NULL DEFAULT now(),
  crossed_at   timestamptz,
  CHECK ((state = 'crossed') = (crossed_at IS NOT NULL))
)
-- + trigger: every identifying field immutable at mint; the ONLY lawful UPDATE is
--   attempted → crossed. Every other UPDATE, and every DELETE outside governed
--   custody, is refused.
```

⛔ **Still refused**: passage text · summary · embedding · hash or fingerprint ·
offsets · length · geometry · a passage-level `section_ref`.

⛔ **Gone from the draft**: `encounter_ref` (amendment 4) and
`initiated_by = 'system'` (tightening).

## 7 · ⚖️ Amendments ruled — what is closed, what is bound elsewhere

| # | Question the draft raised | Ruling |
|---|---|---|
| 1 | `withheld` in or out | **OUT for v1.** Unknown may be noisy; false certainty is worse. |
| 2 | `section_ref` on a passage disclosure | **OUT.** The receipt proves the crossing, not the identity of what crossed. |
| 3 | Does the writer learn Focus was withheld | **MANDATORY, §3a** — bound to the surface, not this table. |
| 4 | `encounter_ref` → a prunable turn row | **REMOVED.** *Do not make durable audit identity depend on a routinely pruned content object.* `request_ref` is the cleaner anchor. If a first-class encounter object emerges, add its reference then — do not invent one to fill a field. |
| ⚖️ | `initiated_by = 'system'` | **REMOVED.** Visible Focus is writer-owned. **The system may assemble what the member authorized. Assembly is not authorization.** A lawful ambient Work-context policy, if it ever exists, is its own authority class — not an enum value available from day one. |

**Standing: Step 5 RATIFIED · substrate lane OPEN (migration + triggers + store +
custody tests first) · Writer's Studio surface owes §3a · `#1275` FROZEN until
both exist.**

---

## 8 · Substrate lane — IMPLEMENTED (2026-09-09)

| Artifact | |
|---|---|
| `database/migrations/20260909000001_focus_disclosure_receipts.sql` | table · CHECKs · two indexes (one being the unresolved-crossing anomaly query) · `focus_disclosure_receipt_monotonic()` trigger · lifecycle stated in the table comment |
| `lib/writers-studio/disclosure/focusDisclosureReceipt.ts` | `mintDisclosureAttempt` (fail-closed) · `confirmDisclosureCrossed` (idempotent, loud on failure) · `unresolvedCrossings` |
| `app/api/members/delete-account/route.ts` | the table named in `GOVERNED_CONTENT`, label *"records of when your writing was shown to MAIA"* |
| `lib/writers-studio/disclosure/__tests__/focusDisclosureReceipt.test.ts` | 29 falsifiers, F1–F5 |

⭐ The store carries a `RefusedReceiptField` type naming every field that has ever
turned a receipt into a shadow copy, so a caller reaching for one is refused at
compile time rather than in review.

⭐ `mintDisclosureAttempt` refuses a `sectionRef` on a passage scope **in the
application as well as at the CHECK** — a caller passing it is holding a locator,
and the honest response is to refuse the disclosure, not to drop the field and
proceed.

**Gates:** `typecheck` 228 vs baseline 239 · 0 regressions · `check:no-supabase`
clean · disclosure suite **29 passed · 0 failed**.

⚠️ **Honest scope.** The falsifiers bind the store's protocol and the substrate's
authored shape. The trigger's refusal of an unlawful transition is asserted as
authored SQL, **not executed** — an executable trigger witness is owed when the
migration first runs against a disposable shadow.

⚠️ **Instrument fault, found and fixed before reading the verdict**: the first
draft scanned the raw migration and failed its own *no TTL* ban on the header
sentence *"No TTL now."* — prose documenting an absence matched as evidence of
the presence. Comments are stripped before every ban scan. *A prose ban must never
read as the banned thing returning.*

⛔ **Still owed before `#1275` unfreezes:** the Writer's Studio surface behaviour
of §3a — a scoped request may fail visibly, but it may not succeed under a
different scope without the writer knowing. **The substrate does not discharge it.**
