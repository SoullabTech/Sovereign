# Practitioner Client Note — Governing Ruling (2026-08-02)

**Status:** RULED by Kelly, 2026-08-02. Governs the Client Note build.
**Scope:** `practitioner_client_notes` and the surfaces that author, retrieve, and carry it forward.
**This document rules. It does not authorize a PR.** Implementation is scoped in §9.

---

## 0. The load-bearing sentence

> **One neutral underlying record with practitioner-selectable templates. The structure belongs to the platform; the vocabulary belongs to the practitioner.**

**Do not make SOAP the ontology.**

---

## 1. Templates are VIEWS, not types

A template organizes the **writing surface**. It does not change what the underlying note
fundamentally **is**.

Offered as optional views:

- Free note
- Session reflection
- Coaching review
- SOAP — for practitioners who genuinely use it
- Spiritual direction
- Mentoring
- Executive coaching
- Custom practitioner template

**Structure is opt-in.** It is *not* an equally weighted first decision every time someone begins
writing. Most practitioners begin with a blank note and add structure only when useful.

⛔ A template must never become a discriminator on the record. `kind` already exists and is closed
(`note | commitment | recognition | detail`, ruled 2026-07-31). A template selection is presentation
state, not a fifth kind and not a `note_type` revival.

---

## 2. Lifecycle — four INDEPENDENT axes

⛔ **Do not compress these into one status field.** A completed note can still be private; a draft
can still carry retention obligations.

| Dimension | Question |
|---|---|
| **Lifecycle** | Is this a draft, completed note, correction, or addendum? |
| **Visibility** | Practitioner only, shared with client, or supervisory access? |
| **Retention** | How long is it kept, and under what policy? |
| **Clinical status** | Clinical documentation, coaching documentation, or neither? |

**Initial slice: practitioner-only, `draft → completed`.** Sharing, supervision, and regulatory
retention remain **separate later capabilities** — not columns reserved in advance.

⚠️ **Naming collision, resolved at implementation level:** the existing `status` column is
commitment-lifecycle only (`alive | completed | released`, required when `kind='commitment'`, NULL
otherwise — see `20260731000001` and the constraint repair in `20260801000003`). The note lifecycle
axis is a **different column**. It must not overload `status`.

---

## 3. Session linkage — verified substrate, not a new concept

The ruling requires: *verify what session linkage already exists before adding schema.*

**Verified on `origin/clean-main-no-secrets`, 2026-08-02:**

`sessions` (migration `20260118_portal_services_tables.sql`) already carries the exact join:

```
sessions.practitioner_id  → practitioners(id)      ON DELETE CASCADE
sessions.client_id        → practitioner_clients(id) ON DELETE SET NULL
sessions.scheduled_start / scheduled_end
sessions.status            scheduled | confirmed | in_progress | completed | cancelled | no_show
```

⭐ **Same FK parents as `practitioner_client_notes`.** Linking a note to a session is therefore a
**join to an existing identifier**, not a duplicate concept. No new session table is warranted.

### ⚠️ FINDING — `sessions` already holds two plaintext free-text columns

```
sessions.notes              TEXT
sessions.practitioner_notes TEXT
```

Free text about an identified client is **PHI by default**
(`docs/security/free-text-phi-doctrine.md`). `practitioner_client_notes` was built
encrypted-from-birth precisely on that doctrine. These two columns are an **unencrypted competing
surface for the same material**, and `sessions.practitioner_notes` is a name-level collision with
the feature.

⛔ Not resolved here. Recorded as a finding requiring its own ruling — it is a PHI question, not a
notes-feature question.

### What the practitioner should see on entering the next session

- the most recent session note
- open commitments
- recognitions and important details carried forward
- unresolved practitioner questions
- earlier notes **without losing chronology**

Note context is `pre-session | in-session | post-session`, plus an optional title/orientation.

---

## 4. Retrieval BEFORE interpretation

Build retrieval first:

- search a client's notes
- filter by date and kind
- find references to a subject
- show notes from a particular period
- retrieve what was carried forward **and where it came from**
- show the source session note **beside** the carried-forward record

### ⛔⛔ The AI boundary

MAIA may **retrieve and organize what the practitioner wrote**. It must not silently diagnose the
client, create a clinical formulation, or pronounce what matters.

| Permitted | Refused |
|---|---|
| *"You noted this concern in three sessions. Would you like to review those notes?"* | *"This is the client's central issue."* |

Consistent with the 2026-07-31 ruling: **the practitioner remains the witness; the system becomes
the memory of the relationship.**

---

## 5. Preparation and follow-through — after the basic loop is solid

**Before a session:** review last note · see living commitments · recall important details · add a
private preparation note · mark a question to revisit.

**After a session:** capture the session note · carry something forward intentionally · add an
addendum · create a follow-up action · prepare what should be visible next session.

---

## 6. History, correction, audit integrity

⛔ **No silent destructive editing.** Distinguish:

- correcting a typo shortly after entry
- revising a draft
- altering a **completed** note
- adding a later clarification
- appending an **addendum**

At minimum:

- preserve **who** changed it and **when**
- make completed-note changes **legible**
- **never rewrite provenance**
- **never let Carry Forward mutate the source**
- test the **exact** database constraint or refusal being claimed — not merely that "some error
  happened"

---

## 7. Operational safeguards — before the feature is called complete

- export a client's notes in a legible format
- define deletion **and restoration** behavior
- define retention policies
- ensure backups include encrypted content
- verify key rotation and decryption paths
- test access after practitioner/client status changes
- test multi-practitioner ambiguity explicitly
- accessibility labels on selected states (commitment status, Carry Forward destination)
- verify mobile note entry and long-note performance

---

## 8. Substrate audit — what this ruling meets, 2026-08-02

Verified against `origin/clean-main-no-secrets`. ⚠️ Merged ≠ walked ≠ accepted.

| Ruling requirement | State |
|---|---|
| Free note is the default | ✅ `kind TEXT NOT NULL DEFAULT 'note'` |
| No clinical category inferred | ✅ no `note_type`; `case_notes`' clinical enum deliberately not copied |
| No framework imposed | ✅ no template concept exists to impose one |
| Note connected to client + date | ✅ `client_id`, `note_date` (#844, `88ebddd97`) |
| Carry Forward intentional, source-preserving | ✅ human-directed; `promoted_from` provenance; source unchanged |
| Encryption, scope, provenance intact | ✅ encrypted-from-birth; session-derived auth; 404 not 403 |
| Ordering expresses ontology per kind | ✅ per-kind comparators, ruled 2026-07-31 |
| **Optional templates as views** | ❌ **not built** |
| **Lifecycle axis (draft → completed)** | ❌ **not built** — `status` is commitment-only |
| **Draft survives leave and return** | ❌ **not built** — compose is create-or-discard |
| **Session linkage (`session_id`)** | ❌ **not built** — substrate exists, unused (§3) |
| Retrieval: search / filter / period | ❌ not built |
| Edit history, addenda, audit trail | ❌ not built — edit is a destructive `UPDATE` |
| Visibility · retention · clinical status | ⛔ deliberately unbuilt — unruled policy |
| Export · deletion/restoration · key rotation · a11y · mobile | ❌ unverified |

---

## 9. The smallest next slice

> A practitioner can open a client, write a free-form session note, save and return to it, then
> intentionally carry selected material into continuity **without changing the original note**.

**Definition of done**

- [x] Free note is the default
- [ ] Optional structure can be applied without changing the underlying ontology
- [x] The note is connected to the correct client and session/date
- [ ] **Draft content survives leave and return**
- [ ] **Completion is explicit**
- [x] Carry Forward remains intentional and source-preserving
- [x] No clinical category is inferred
- [x] No framework is imposed
- [ ] Mobile entry is usable *(unverified)*
- [x] Encryption, scope, and provenance remain intact

⭐ **Seven of ten are already met.** The genuine remainder is the **lifecycle axis**: draft
persistence and explicit completion. Everything else in this ruling sequences *after* it.

**Then, in order:** practitioner-selectable templates (§1) → pre-session preparation (§5).

⛔ That sequence makes the Client Note useful immediately **without prematurely turning it into a
clinical records system or a taxonomy-management surface.**

---

## 10. Open, not resolved by this ruling

1. **`sessions.notes` / `sessions.practitioner_notes` plaintext PHI** (§3) — needs its own ruling.
2. **Client of record** — `practitioner_clients` vs `practitioner_cases` remains unjoined and
   unruled. This ruling does not settle it.
3. **Draft storage shape** — a `draft` row in `practitioner_client_notes` vs client-side persistence.
   A draft of PHI is PHI; client-side persistence would place unencrypted client material in browser
   storage. ⛔ Do not decide by implementation.
