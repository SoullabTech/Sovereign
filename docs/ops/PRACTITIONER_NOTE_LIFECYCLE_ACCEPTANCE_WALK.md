# Acceptance Walk — Practitioner Note Lifecycle (PR #890)

**Status:** protocol prepared, **not yet performed.**
**Disposition of #890 until this completes:** *written and unit-tested; migration and member experience not yet accepted.*

⛔ **#888 and #889 landing does not imply this.** Those cleared prerequisites — the ruling is
canonical, and the PHI inventory now covers `practitioner_client_notes`. Neither proves the Class A
behaviour. No merge may be inferred from them.

---

## 0. What this walk is for

Fourteen criteria, each of which must be **observed**, not reasoned about. The unit tests already
show the validators behave; they cannot show that a practitioner's writing survives a real
navigation, that a real stale write is refused, or that nothing was written to their browser.

### Evidence discipline — required for every criterion

| Field | Meaning |
|---|---|
| **UI action** | what was actually done in the real interface |
| **Request / response** | method, path, status, body (DevTools Network) |
| **DB before / after** | `fixture inspect` output either side of the action |
| **Expected code** | the specific status or error being tested |
| **Discrimination** | *does this observation separate the intended rule from an unrelated failure?* |

⛔ **"Something failed" is not evidence.** For every refusal test, capture the **exact** status and
error string. A 404 because a row does not exist proves nothing about scope enforcement; a 409 from
a network blip proves nothing about optimistic concurrency. The discrimination field exists to force
that question to be answered in writing rather than assumed.

⭐ Record **NOT EXERCISED** where a criterion could not be reached. A gap named is evidence; a gap
quietly skipped turns the whole walk into a claim it cannot support.

---

## 1. Environment — establish before the referent

This must run against a **production-shaped copy**: the migration applied, real schema, real auth.

⚠️ The local dev database has historically held **0 `practitioner_clients`**, which makes the Studio
client page render as though the feature were missing. That is an environment fact, not a defect —
see `feedback_verify_the_environment_before_the_referent`.

```bash
# 1. Confirm which database you are about to walk
psql "$DATABASE_URL" -c "SELECT current_database(), inet_server_addr();"

# 2. Confirm the migration is applied — all five columns must be present
psql "$DATABASE_URL" -c "\d practitioner_client_notes" | grep -E 'lifecycle|completion_mode|completed_at|version|session_id'

# 3. Confirm the four constraints exist
psql "$DATABASE_URL" -c "
  SELECT conname FROM pg_constraint
   WHERE conrelid = 'practitioner_client_notes'::regclass
     AND conname LIKE '%lifecycle%' OR conname LIKE '%completion_mode%'
      OR conname LIKE '%completed_at%' OR conname LIKE '%draft_kind%';"
```

⛔ If the migration is not applied, **stop**. Every criterion below would fail for one uninteresting
reason and tell you nothing about the feature.

### Identity precondition — record it first

🔴 Production has held **three practitioner rows named "Kelly Nezat" on three different
`member_id`s**. Notes are scoped to `practitioner_id`. A note written under one account is invisible
under another, and that reads as *"my notes disappeared"* — a false defect report that has cost time
before.

**Before writing anything**, sign in as the fixture practitioner and record which row
`getCurrentPractitioner()` actually resolves to:

```sql
SELECT id, name, email, status FROM practitioners WHERE id = '<fixture practitioner id>';
```

---

## 2. Fixture

```bash
npx tsx scripts/walk/practitioner-note-lifecycle-fixture.ts setup
```

Creates a disposable practitioner, client, session, **and a second practitioner + client** for the
cross-scope tests. Records exact baseline counts. Prints the walk URL.

⭐ The second practitioner exists so criterion 13 is meaningful. Probing a random UUID returns 404
for the trivial reason that nothing is there — that observation cannot distinguish *scope enforced*
from *row absent*. The refusal must be tested against a row that genuinely exists elsewhere.

### Harness state — exercised 2026-08-02 against the local dev database

The fixture itself has been run. What that established, and what it did not:

| | |
|---|---|
| ✅ setup creates practitioner + client + second practitioner + second client | verified |
| ✅ transactional — a mid-setup failure leaves **nothing** behind | verified by an induced failure |
| ✅ teardown restores **exact** baseline on all four counted tables | verified |
| ⚠️ **session fixture NOT created** — `sessions.team_id` is `NOT NULL` with no default, and the `teams` table does not exist on the local dev database | see below |
| ⛔ `inspect` / `plaintext-scan` **not exercised** — the migration is unapplied locally, so the lifecycle columns do not exist | must be re-verified on the walk database |

⚠️ **Before the walk, supply `sessions.team_id`.** On the production-shaped database, either a team
row exists to reference or one must be added to the fixture. Until then the script self-reports and
**criterion 13's session arm is NOT EXERCISED — not passed.**

⭐ Running the harness found three defects in it that reading it did not: a CHECK constraint
introspection cannot see (`practitioner_clients_pending_reachable`), a `GENERATED ALWAYS` column that
rejects any supplied value (`normalized_invitation_email`), and a non-transactional setup that left
an orphan practitioner behind on first failure. A walk harness that has never been run is not a
harness — it is a proposal.

**Choose a sentinel** — a distinctive string typed into the note body, used by the storage probe:

```
WALK890-<something-unique>
```

Commands available throughout:

| Command | Use |
|---|---|
| `fixture inspect` | full row state for the fixture client — the before/after for every criterion |
| `fixture baseline` | re-print baseline counts |
| `fixture plaintext-scan "<sentinel>"` | criterion 3, database half |
| `fixture teardown` | criterion 14 |

---

## 3. The fourteen criteria

### 1 — Opening the composer creates no note row

**Action:** open the client page, click **Add note**, type nothing. Wait 5s (> the 1.5s debounce).
**Expect:** no POST fires. `inspect` shows zero rows.
**Discrimination:** wait past the debounce. Checking immediately would pass even if the code did
create a row on open.

### 2 — First durable save creates exactly one encrypted draft

**Action:** type the sentinel. Wait for **Saved**.
**Expect:** one `POST …/notes` → **201**, body `lifecycle: "draft"`, `completion_mode: null`,
`version: 1`.
`inspect` → exactly **one** row, `ciphertext_len > 0`.
**Discrimination:** exactly one. Two rows would mean each keystroke burst created a note.

### 3 — No note body in browser or plaintext DB

**Browser half** — paste `scripts/walk/practitioner-note-storage-probe.js` into DevTools:

```js
confirmSentinelOnScreen("<sentinel>")
await probeClientNoteStorage("<sentinel>")
```

Run at **three moments**: (a) composer open with unsaved text, (b) right after **Saved**,
(c) after navigating away and back.
⭐ **(a) is the load-bearing run.** A probe only after reload passes trivially — in-memory text is
gone by then, so finding nothing proves nothing. The claim is that the text was *never written
down*.

**Database half:**

```bash
npx tsx scripts/walk/practitioner-note-lifecycle-fixture.ts plaintext-scan "<sentinel>"
```

**Expect:** no plaintext-capable column on `practitioner_client_notes`; zero hits in
`sessions.notes` / `sessions.practitioner_notes`.
⚠️ Those two columns are the **unruled plaintext PHI finding** (ruling §3). This walk checks the note
did not leak into them; it does not resolve them.

### 4 — Autosave is actually debounced

**Action:** type continuously for ~10s without pausing.
**Expect:** in Network, **far fewer** PATCHes than keystrokes — roughly one per pause, not a stream.
**Discrimination:** count requests against typing duration. "Feels fine" is not the observation;
a request count is.

### 5 — Blur flush

**Action:** type, then click outside the textarea **before** 1.5s elapses.
**Expect:** PATCH fires immediately on blur, state → **Saved**.
**Discrimination:** must be *before* the debounce would have fired, or you are watching the timer,
not the blur handler.

### 6 — Tab-hide / pagehide flush

**Action:** type, then within 1.5s switch browser tabs (fires `visibilitychange`); separately, type
and navigate away (fires `pagehide`).
**Expect:** PATCH fires on each.
**Discrimination:** test both. `visibilitychange` and `pagehide` fire in different situations —
notably on iOS Safari, a backgrounded tab may never get an unload event at all.

### 7 — Stale write returns 409 and does not overwrite

**Action:** open the same draft in two tabs. Save in tab A (version → N+1). Then type and save in
tab B, which still holds version N.
**Expect:** tab B → **409**, body `"This note changed somewhere else…"`.
`inspect` shows tab A's content **intact**.
**Discrimination:** ⭐ the critical one. Capture the **exact 409 body** and confirm the stored
content is A's, not B's. A 409 alone does not prove the newer content survived — verify the row.

### 8 — Leave and return restores exact draft content

**Action:** type a multi-line body, wait for **Saved**, navigate fully away, return.
**Expect:** composer reopens with the draft, **byte-identical** including newlines. Draft does
**not** appear in the chronological list.
**Discrimination:** compare exactly, not by eye. Trailing-whitespace or newline loss is a real
defect that a glance forgives.

### 9 — Completion requires an explicit act

**Action:** with an unsaved-but-autosaving draft, confirm it never self-completes; then click
**Complete note**.
**Expect:** before the click, `lifecycle` stays `draft` indefinitely. After: PATCH with
`lifecycle: "completed"` → 200.
**Also confirm:** the composer states the lock **before** the click. The ruling permits locking only
*"provided the UI says so before the practitioner completes it."*

### 10 — `completion_mode='practitioner_declared'` is what locks

**Action:** after completion, attempt to edit the note.
**Expect:** `inspect` → `lifecycle=completed`, `completion_mode=practitioner_declared`,
`completed_at` non-null. No edit affordance; a direct PATCH of `content` → **409**
`"This note was completed and can no longer be edited."`
**Discrimination:** ⭐ then run this — the whole point of the named field:

```sql
UPDATE practitioner_client_notes SET completed_at = NULL
 WHERE id = '<note id>' AND practitioner_id = '<fixture practitioner id>';
```

The constraint should **refuse** it (`completed_at` must be non-null when
`practitioner_declared`). That refusal is itself the evidence that the timestamp is not load-bearing
and the named field is. Record the exact constraint name in the error.

### 11 — Backfilled notes remain editable

**Action:** create a note that simulates a pre-migration row, scoped to the fixture practitioner:

```sql
UPDATE practitioner_client_notes
   SET lifecycle = 'completed', completion_mode = 'backfilled', completed_at = NULL
 WHERE id = '<a fixture note id>' AND practitioner_id = '<fixture practitioner id>';
```

**Expect:** the note **is** editable — pencil affordance present, PATCH of `content` → 200.
**Discrimination:** this and criterion 10 differ **only** by `completion_mode`. Both are
`lifecycle='completed'`. If both lock, or neither does, the axis is not doing its work.

### 12 — Continuity kinds and Carry Forward unchanged

**Action:** Carry Forward from a completed note → commitment (status `alive`), recognition, detail.
Then edit a commitment's content and move its status `alive → completed`.
**Expect:** all succeed. Source note **unchanged** (`updated_at` and ciphertext identical before and
after). `promoted_from` set on the new item.
**Discrimination:** ⭐ commitment `status='completed'` must **not** lock the item. That is the
lifecycle/status collapse this whole slice exists to prevent — if a completed *commitment* becomes
uneditable, the two axes have merged.

### 13 — Cross-scope and session-mismatch refusals

| Probe | Expect |
|---|---|
| GET/PATCH a fixture note while signed in as the **other** practitioner | **404**, not 403 — existence not disclosed |
| POST a note to the **other** practitioner's client id | **404** |
| POST with `session_id` belonging to the other practitioner | **400** `"session_id must reference a session with this client"` |
| POST with a well-formed but nonexistent `session_id` | **400**, same message |
| POST with `session_id: "not-a-uuid"` | **400** `"session_id must be a uuid"` |

**Discrimination:** ⛔ each refusal must be attributable to the rule under test. The first two rows
use a client that genuinely exists — that is what separates *scope enforced* from *row absent*. If
the session fixture could not be created, record the session rows **NOT EXERCISED**.

### 14 — Migration rollback and exact fixture cleanup

**Rollback** — on a disposable copy, never the walked database if you still need it:

```sql
ALTER TABLE practitioner_client_notes
  DROP CONSTRAINT IF EXISTS practitioner_client_notes_completed_at_check,
  DROP CONSTRAINT IF EXISTS practitioner_client_notes_completion_mode_check,
  DROP CONSTRAINT IF EXISTS practitioner_client_notes_draft_kind_check,
  DROP CONSTRAINT IF EXISTS practitioner_client_notes_lifecycle_check,
  DROP CONSTRAINT IF EXISTS practitioner_client_notes_session_fk;
DROP INDEX IF EXISTS idx_practitioner_client_notes_draft;
DROP INDEX IF EXISTS idx_practitioner_client_notes_session;
ALTER TABLE practitioner_client_notes
  DROP COLUMN IF EXISTS lifecycle,
  DROP COLUMN IF EXISTS completion_mode,
  DROP COLUMN IF EXISTS completed_at,
  DROP COLUMN IF EXISTS version,
  DROP COLUMN IF EXISTS session_id;
```

**Expect:** succeeds; pre-existing notes still readable and editable afterwards.
⚠️ **Any `lifecycle='draft'` row is LOST on rollback** — the prior schema cannot represent a draft.
Drain drafts before rolling back, or unfinished writing disappears. Confirm this is understood, not
merely noted.

**Cleanup:**

```bash
npx tsx scripts/walk/practitioner-note-lifecycle-fixture.ts teardown
```

**Expect:** every counted table returns to its **exact** baseline. The script exits non-zero and
retains its state file if not — a near-match is a failure.

---

## 4. Disposition

On completion, #890 receives exactly one of:

| Outcome | Meaning |
|---|---|
| **ready to merge** | all fourteen observed and passing |
| **additive correction required** | a defect fixable within the ruling, no new authority needed |
| **founder ruling required** | the walk surfaced a question the ruling does not answer |

⛔ Until then the honest disposition stands: *written and unit-tested; migration and member
experience not yet accepted.*

⭐ A criterion that could not be exercised is recorded **NOT EXERCISED** and counts against
readiness. It is not a pass.
