# FOCUS DISCLOSURE RECEIPT — minimal contract

**2026-09-09 · STEP 5, DESIGN ONLY.** No migration authored. No implementation.
No `#1275` wiring. The DDL sketch in §6 is illustrative and is **not** a migration.

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
`attempted → crossed` (and `attempted → withheld`, §3) and refuses every other
UPDATE — no reversal, no rescope, no re-attempt. This is the
`runtime_consent_state` immutability pattern widened by exactly one lawful
transition, and no more.

**Idempotency.** A `disclosure_id` is minted per disclosure attempt and is UNIQUE.
Retry of the mint is `ON CONFLICT DO NOTHING`; retry of the confirm is a no-op
when already `crossed`. ⛔ A retry can therefore neither duplicate a crossing nor
contradict a recorded one.

## 3 · `withheld` — recommended, with its risk named

A third terminal state for *"minted, then deliberately not disclosed"* (cognition
refused, tier fell back, the writer moved on). Without it, every such case decays
into `attempted` and the unresolved-crossing signal drowns in noise — the anomaly
must stay rare to stay meaningful.

⛔ **Its risk, stated plainly:** `withheld` is a way to be wrong. A bug on a path
that *did* reach the boundary would record a non-crossing. It is therefore
writable **only from a path that provably did not reach cognition**, never as a
catch-all for an error whose position is unknown — an error of unknown position
must leave the row `attempted`. **Founder adjudication owed**: include `withheld`,
or accept a noisier `attempted`.

## 4 · Shape — admitted, and refused

**Falsifier:** *if possessing the receipt materially helps reconstruct what the
writer selected, the receipt contains too much.*

**ADMITTED**

| Field | Why it is not a representation of the Work |
|---|---|
| `disclosure_id` | opaque idempotency key |
| `member_id` | required for governed deletion (§5) |
| `encounter_ref` | which encounter the crossing served |
| `request_ref` | joins to `runtime_consent_state`. ⭐ The posture is **referenced, never copied** — three truths, three authorities. |
| `boundary` | closed vocabulary, e.g. `writers_studio.focus → maia_cognition` |
| `work_ref` | the Work's identity — authored, not derived from the selection |
| `scope_kind` | closed: `whole_work \| section \| passage` — the **shape** of the selection, not its location |
| `section_ref` | ⭐ **only when `scope_kind = 'section'`**, where the reference *is* the disclosure. For `passage`, omitted — see below. |
| `initiated_by` + `gesture` | `member` / `system` and the gesture kind — distinguishes a member's selecting act from a system assembly. The gesture kind, never its content. |
| `state`, `attempted_at`, `crossed_at` | the crossing itself |
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
smoothed over: an audit of a passage disclosure cannot identify the passage. That
is the intended trade, and the founder may rule otherwise.

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

## 6 · Illustrative shape — ⛔ NOT A MIGRATION, NOT AUTHORIZED

```sql
-- SKETCH. No migration file is authored by this step.
focus_disclosure_receipts(
  id uuid pk, disclosure_id text UNIQUE NOT NULL,
  member_id text NOT NULL, encounter_ref text NOT NULL, request_ref text,
  boundary text NOT NULL CHECK (boundary IN (...)),
  work_ref text NOT NULL,
  scope_kind text NOT NULL CHECK (scope_kind IN ('whole_work','section','passage')),
  section_ref text CHECK (section_ref IS NULL OR scope_kind = 'section'),
  initiated_by text NOT NULL CHECK (initiated_by IN ('member','system')),
  gesture text NOT NULL, policy_version text NOT NULL,
  state text NOT NULL CHECK (state IN ('attempted','crossed','withheld')),
  attempted_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz,
  CHECK ((state = 'attempted') = (resolved_at IS NULL))
)
-- + trigger: identifying fields immutable; state may advance only
--   attempted → crossed | withheld; every other UPDATE refused.
```

## 7 · Owed before implementation opens

1. **`withheld`: in or out** (§3) — a rarer, more meaningful anomaly versus one
   fewer way to record a falsehood.
2. **`section_ref` on a passage disclosure** (§4) — the audit cost is real.
3. ⭐ **Does the writer learn that their Focus was withheld?** A mint failure
   leaves MAIA answering *as though she had not been given the passage* — which
   she was not. ⛔ But if the writer is not told, they will read her answer as a
   response to the passage. **That is an interface-humility defect, not a storage
   question**, and it belongs to the Writer's Studio surface, not to this table.
4. Whether `encounter_ref` may reference a `conversation_turns.id` at all, given
   that turn rows are pruned by age while receipts are not — **a dangling
   reference is honest; a resurrected one would not be.**

**Standing: Step 5 DESIGN DRAFTED · not ratified · no migration · no
implementation · `#1275` frozen.**
