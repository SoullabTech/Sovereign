# Universal Session Capture (USC)

**Programme:** JARVIS-USC-01
**Status:** USC-00 census complete · USC-01/02/03/04 built (branch, unverified in production)
**Canonical at census:** `origin/clean-main-no-secrets` @ `950ea33`
**Canonical at rebase:** `origin/clean-main-no-secrets` @ `14f426a` (re-verified; lane replayed onto it)
**Ruling:** Founder, 2026-08-25 — capture serves *both* practitioners and solo members;
Layer 1 substrate + Session Room convergence built now, mobile/watch specified not implemented.

> One session. One timeline. Any device. Capture without leaving the human encounter.

---

## 1. Governing problem

The act "remember this moment for me" was fragmented across three unrelated systems, none
reachable from a phone or a wrist. The goal is not a Watch notes app; it is **continuity of
attention** — desktop for reflection, phone for capture, wrist for marking presence without
leaving it, MAIA for reconstitution afterward.

---

## 2. Provenance layers (the load-bearing distinction)

```
L0  EVENT               timestamp / marker / source / modality
L1  RAW HUMAN CAPTURE   text / voice / transcript          ← immutable
L2  ORGANIZED MATERIAL  kind / tags / elemental lenses     ← member-assigned only
L3  INTERPRETATION      MAIA synthesis / approved note     ← lives elsewhere entirely
```

**L3 may never masquerade as L1.** This is enforced structurally, not by convention:

| Enforcement | Mechanism |
|---|---|
| System cannot author a capture | `captured_by TEXT CHECK (captured_by = 'member')` |
| Raw material cannot be rewritten | `session_captures_protect_raw_trg` blocks UPDATE of L0/L1 fields |
| No derived column exists to abuse | Table carries no synthesis field; post-create shape check refuses plaintext content columns |
| Derived notes reference, never replace | `GET /api/capture/timeline` returns L0–L2 only |

---

## 3. USC-00 — Canonical architecture census

### 3.1 What already existed

| Domain | Implementation | State |
|---|---|---|
| Session Room | `app/studio/session-room/page.tsx` (1,724 LOC), `lib/studio/RecordingContext.tsx` | Live |
| In-room markers | `scribe_markers` + `POST /api/scribe/mark` | Live |
| Session substrate | `scribe_sessions` (container, consent, memory_policy, participants) | Live |
| Transcription | Self-hosted Faster-Whisper (`whisper:8000`), SSE stream, `/api/supervision/transcript/stream` | Live |
| Devlog capture | `capture_sessions` / `capture_notes`, tags `ship\|fix\|decision\|blocked\|next` | Live, unrelated purpose |
| Personal memory | `member_memory_atoms` — "The Keep/Capture Portfolio", consent via `return_preference` | Live (Cat 6) |
| Identity | `lib/scribe/scribeAuth.ts` — cookie or `x-session-token`; `apiFetch` adds headers on native | Live |
| Consent | `POST /api/scribe/consent`; `mark` refuses unless active **and** `consent_status='confirmed'` | Live |
| iOS | Capacitor (`ios/App`, `scripts/build-ios.sh`) | Live |
| Apple Watch | `mobile/AppleWatch/` — 408 LOC HealthKit/HRV coherence scaffold; no RN build present | **Dormant, wrong shape** |

### 3.2 Findings

1. **The capture/note separation was already shipped.** Session Room derives the note from
   markers while preserving them. The architecture did not need inventing — it needed reach.
2. **Three note systems already existed** — the exact fragmentation to avoid multiplying.
3. **Four things blocked capture-from-anywhere:** no active-session resolution endpoint;
   no `source`/`modality`; no idempotency key (queued replay double-inserts);
   `scribe_markers.session_id NOT NULL` left unbound captures homeless.
4. **A capture is not a keep.** `member_memory_atoms` rules: *"material becomes portfolio
   memory only when the member keeps it."* Routing raw taps into atoms would convert a reflex
   into a consent act.
5. **Founder ruling 2026-08-02** (migrations README, coach-field retirement) forbids plaintext
   content-bearing fields in new foundations. Capture content is therefore **encrypted at
   birth** — there is no plaintext lane to migrate later.
6. **Watch is out of the current pipeline.** Capacitor emits no watchOS target.

---

## 4. USC-01 — Capture domain contract

`lib/capture/sessionCapture.ts`

```ts
CaptureInput {
  clientCaptureId  // device-stamped; makes offline replay idempotent
  source           // web | iphone | ipad | watch | siri | unknown
  modality         // marker | text | voice | photo | task
  content?         // L1 — encrypted at rest, AAD-bound
  transcript?      //  "
  mediaPath?
  capturedAtMs?    // device time, server-clamped to a sane window
  kind?            // L2 — insight | emotion | body | pattern | question | follow_up
  tags?  elementalLenses?  visibility?
  sessionId?       // omit → server resolves; null → force inbox
}
```

### Session binding

```
capture arrives
   ├── explicit sessionId, still active + consented → bind
   ├── member has an active + CONSENTED session     → bind
   └── otherwise                                    → personal inbox
```

**Ingestion never creates a session.** A wrist tap must not manufacture the consent moment
Session Room requires. This is the single most important refusal in the design.

### Idempotency

`UNIQUE (member_id, client_capture_id)`. A replayed capture returns the original row with
`created: false` and HTTP 200; a new moment returns 201. `tap → local save → haptic → queued
sync` is therefore safe by contract, not by client discipline.

---

## 5. USC-02/03 — What was built

| Unit | Artifact |
|---|---|
| USC-02 | `database/migrations/20260825000001_session_captures.sql` |
| USC-02 | `lib/capture/sessionCapture.ts` — contract, encryption, binding, ingestion |
| USC-02 | `POST/GET /api/capture` — ingest + personal inbox |
| USC-02 | `GET /api/capture/active-session` — "where would a capture land right now?" |
| USC-03 | `GET /api/capture/timeline?sessionId=` — merged Session Room timeline |

### Convergence debt (named, with a gate)

`scribe_markers` is **not** migrated. Two write paths, one read model:

```
scribe_markers   ─┐
                  ├──→ GET /api/capture/timeline ──→ Session Room
session_captures ─┘
```

**Gate to fold markers into captures:** a capture from a non-web surface surfacing in Session
Room under real member use. Until that is observed, the live practitioner surface is not
migrated. Devlog Capture Mode (`capture_notes`) stays separate — different purpose, not a
convergence target.

---

## 6. Open decisions (require a ruling)

### 6.1 Promotion — **RULED 2026-08-25, built**

> Capture promotion uses `member_memory_atoms` only as a source registry. Add
> `source_type='capture'`, reference the canonical encrypted capture by `source_id`, keep
> `body` NULL, and never decrypt/copy capture content into the atom.

Promotion means *"MAIA is permitted to remember/reference this source"* — not *"copy this
source into another memory table."* The atom is an index entry; the capture remains the source
of truth.

```
encrypted capture
    │
    ├── raw content stays encrypted in session_captures   ← source of truth
    │
    └── member_memory_atom
          source_type = 'capture'
          source_id   = capture.id
          body        = NULL
```

Implemented as `database/migrations/20260825000002_memory_atoms_capture_source.sql`
(widens one CHECK by one value; no historical rewrite; rollback documented in the file) plus
`promoteCapture()` and `POST /api/capture/[id]/promote`.

**Stop-conditions checked before building:** `body` is nullable (not NOT NULL); `source_id` is
a bare polymorphic UUID with no FK; `sourcing_discipline` is satisfied by a non-null
`source_id`. None blocked registry-only atoms, so the unit proceeded rather than stopping.

**No automatic promotion.** A capture existing is never authority to remember it. `title` is
member-authored and is never derived from capture content — deriving it would launder L1
content into a plaintext column by another route; the fallback label uses L0 metadata only.

**Downstream safety:** `lib/maia/memoryAtomsLoader.ts` already forces `body → NULL` for every
source type other than `spontaneous`/`practitioner_observation`, so a promoted capture surfaces
to MAIA as title + provenance only, e.g. `- "Something shifted" — kept 2 hours ago`.

### 6.1b Original collision (resolved, retained for lineage)

The consent bridge capture → memory was designed but withheld. `member_memory_atoms.body` is
**plaintext** and no PHI encryption wave covers it. Promoting a capture would decrypt L1
content and write it into a plaintext column — a security downgrade performed in the name of
a consent feature.

The atoms design already points at the fix: atoms are a *registry*, not a content store —
*"This table does NOT duplicate source content. The source remains in its native table."*

**Recommendation:** add `'capture'` to the `source_type` CHECK; promotion creates an atom with
`source_id = capture.id` and `body IS NULL`. Content stays encrypted in `session_captures`;
the atom records only that the member kept it. Requires altering a CHECK constraint on a live
table — hence a ruling, not a silent migration.

### 6.2 Sealed sessions

`memory_policy='sealed'` captures currently persist like any other. Whether sealed captures
should be ineligible for promotion (or purged at session end) is a Sanctuary-adjacent question
not settled by existing code.

---

## 7. USC-04/05/06 — Mobile and Apple surfaces (specified, NOT implemented)

All surfaces are **clients of the contract above**. No device gets its own note architecture.

### USC-04 — iPhone quick capture — **BUILT**

`components/capture/QuickCapture.tsx`, `lib/capture/captureQueue.ts`, `app/maia/capture`.

| Gesture | Call |
|---|---|
| Tap | `POST /api/capture` `{modality:'marker', source:'iphone'}` |
| Hold | record → `{modality:'voice', mediaPath}`; transcript attached by USC-07 |
| Type | `{modality:'text', content}` |
| Follow-up | `{modality:'task'}` |

Session state banner polls `GET /api/capture/active-session`. Copy names the destination
("Saved to *Morning session*" / "Saved to your captures") — the member always knows where a
capture went. Offline: the capture is written to local storage and acknowledged with a haptic
*before* any network call; the queue flushes on reconnect and on foreground. Idempotency makes
duplicate flushes harmless. A capture leaves the queue only on a definitive server outcome —
transport failure keeps it queued, and a stuck queue is surfaced ("N waiting to sync") rather
than hidden.

SPEAK uses on-device speech recognition and sends a transcript. Audio upload and server-side
Whisper transcription remain USC-07 — this unit deliberately does not open a second recording
path ahead of that. Where recognition is unavailable the control disables itself rather than
pretending to listen.

### USC-05 — Apple system surfaces

App Intents / Shortcuts / Siri, Lock Screen + Home Screen widgets, Smart Stack. `"Make a
Soullab note: …"` maps to a single `POST /api/capture` with `source:'siri'`. Interactive
widgets act through App Intents.

### USC-06 — Apple Watch V1

```
┌─────────────────┐
│   SESSION 32:14 │   ← GET /api/capture/active-session
│                 │
│    ◎  MARK      │   ← POST /api/capture {modality:'marker', source:'watch'}
│                 │
│    🎙 SPEAK     │   ← presentAudioRecorderController → {modality:'voice'}
└─────────────────┘
```

`tap → local save → haptic → queued sync`. WatchConnectivity `transferUserInfo` for queued
background delivery when the phone is unreachable; `sendMessage` when it is. No categorization
UI in V1 — presence outranks metadata.

**Prerequisite (not a detail):** this requires a native watchOS target. The Capacitor pipeline
does not produce one, and `mobile/AppleWatch/` is a dormant HealthKit scaffold, not a base.
Treat USC-06 as new native work with its own build lane. Do not scope the Action button —
Apple restricts third-party Watch Action-button intents largely to workout/dive.

---

## 7b. Programme status

```
PROMOTION      GREEN
USC-04 CODE    BUILT
USC-04 DB      GREEN
USC-04 TESTS   GREEN   (44 automated: offline/idempotent path + contract pinning)
USC-04 DEVICE  UNVERIFIED

PR #1093       OPEN / WATCH
MERGE          HOLD
USC-05/06      HOLD
#1085          UNTOUCHED
```

USC-04 is **not GREEN** until the device pass in `docs/ops/USC_04_DEVICE_ACCEPTANCE.md`
is completed on real hardware. The DB and queue layers are proven; the surface they exist to
serve is not. Merge gate for #1093 = that sheet, filled in and pasted into the PR.

**Title-leak boundary (founder, 2026-08-25):** plaintext metadata can leak encrypted content
as effectively as a plaintext body. The atom `title` therefore stays member-authored or derived
only from non-content metadata. This generalizes beyond promotion — any future surface that
labels, summarizes, or indexes a capture inherits the same constraint.

## 8. Verification state

**Nothing here is verified in production.** Built on branch, typechecked. Per project
discipline: *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.*

| Stage | Gate |
|---|---|
| Reachable | migration applied, `POST /api/capture` returns 201 under an authenticated member |
| Wired | a capture appears in `GET /api/capture/timeline` beside markers |
| Live | a capture from a non-web surface surfaces in Session Room under real use |

Migrations `…000001` and `…000002` were executed against PostgreSQL 16 locally: apply,
idempotent re-apply, data preserved, documented rollback replayed on a clone. Promotion proofs
cover backward compatibility (all ten original source types still insert), registry-only atoms
(`body IS NULL` accepted), no-plaintext-copy, and no historical rewrite.

Only the third unlocks the marker-convergence gate in §5.

---

## 9. Growth-obligation answers (CLAUDE.md)

**Uncertainty introduced, and how preserved.** Capture records what was marked, never why it
mattered. `capture_kind` is null unless the member sets it; the system never infers. A marker
with no note stays a bare timestamp — the ambiguity is the honest record.

**Provenance and ownership boundaries.** L0–L3 separation enforced by CHECK, trigger, and the
absence of a synthesis column. Content is AAD-bound to `(table, column, rowId, ownerId)`, so
ciphertext cannot be relocated between rows or members.

**New responsibility created.** Capture from a wrist is frictionless in a room containing
another person. The system must therefore never let a capture reach memory without a member
act (§6.1), never create the consent moment on the member's behalf (§4), and always name the
destination on the capturing surface (§7).
