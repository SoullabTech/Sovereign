# WS2-07 · PREREQUISITE — the save contract after conversion

```text
LANE       JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
UNIT       SECTION-ADDRESSABLE DRAFT LIVENESS · requirement C
STATUS     RULED 2026-09-02 · Option 3 ratified · D1–D9 frozen
AUTHORIZES A + B + D + E as one vertical slice, on
           feature/ws2-section-addressable-draft-liveness
DATE       2026-09-02
```

✅ **RULED. A/B/D/E are authorized as one vertical slice.** The reasoning below is preserved as
it was put, with the ruling and its three amendments recorded in §6.

⛔ *(as written before the ruling)* **No implementation. A/B/D/E are held until C is ruled**, because C decides what the writable
object *is* after conversion, and the other four inherit that decision:

```text
A conversion    → what representation conversion creates
B typed refusal → what the save route requires from the client
D new drafts    → what form a new draft begins in
E witness       → what ordinary member writing actually exercises
```

---

## 1 · What exists today

```text
PUT .../draft   body { content: string, checkpoint?, note? }
                + idempotencyKey + baseRevisionId  (readGuard)
                writes manuscript_working_drafts.content and, on checkpoint,
                working_draft_revisions. Touches NO sections.

concurrency     version (bigint, string at the driver) · idempotency key +
                op + payload hash + stored response · conflict reasons today
                are `stale_base` and `idempotency_key_reuse`

enforcement     two DEFERRED constraint triggers, both directions, raising when
                a converted draft's content is not the exact flattening of its
                sections
```

**So the current route cannot write a converted draft at all.** It sends `content` and no section
state; the flattening check raises at commit. That is the liveness defect — not decay.

---

## 2 · The three shapes

### Option 1 — whole document, boundaries inferred

```text
client sends content → server diffs against stored sections
                     → server guesses split / merge / move / edit
```

⛔ **Reject.** It is precisely the heuristic identity reassignment requirement C forbids. Diff
attribution is ambiguous in exactly the cases that matter — a paste that replaces a boundary, a
deletion spanning two sections — and a wrong guess silently transfers a durable identity that
authored structure and developmental evidence both depend on. The corruption is invisible at write
time and surfaces much later as evidence pointing at the wrong prose.

### Option 2 — whole document plus a declared boundary map

```text
client sends content + ordered section ids + exact ranges + declared changes
```

Explicit, and therefore not disqualified. But it asks a monolithic text editor to maintain
invisible boundary offsets correctly through paste, multi-section deletion, undo/redo and IME
composition. Every one of those is a place where the map and the string can disagree, and **when
they disagree the server cannot tell which is right** — the ranges are the only evidence of intent
and they are the thing that drifted. Viable; higher drift risk; the risk lands on durable
identity.

### Option 3 — section-native state, topology by explicit command **(recommended)**

```text
ordinary save    { sections: [{ id, text }] (ordered), baseRevisionId,
                   idempotencyKey, checkpoint?, note? }

split / merge /  separate explicit member commands, never inferred from content
move
```

The client holds ordered section nodes with stable ids; ordinary typing updates text *inside* a
node; boundary changes are their own acts. The server never guesses, because the client never asks
it to.

> **"Section-native" describes the contract and the authority, not the interface.** The surface
> can remain one continuous manuscript. This is a statement about what the client sends, not about
> drawing a card per section.

---

## 3 · Recommendation, and the first slice

**Recommended: Option 3 — section-native state for ordinary writing; explicit commands for
topology; no inferred boundary mutation.**

The first live slice does **not** need split, merge and move:

```text
ordinary edits inside existing sections    SUPPORTED
section ids and order                      PRESERVED
implicit boundary change via ordinary save REFUSED, typed, zero writes
split / merge / move gestures              ABSENT until explicitly designed
```

Refusing an undeclared boundary change is honest rather than incomplete: it says *this act needs a
name* instead of guessing which name it had.

### The ordinary save transaction

```text
validate ownership + version + idempotency        (existing precheck, unchanged)
→ validate section ids known and topology unchanged
→ update section texts
→ flatten THOSE EXACT TEXTS into draft.content
→ advance version / idempotency state
→ append checkpoint revision when requested
→ commit once
```

`content` is **derived, never supplied**, on a converted draft. That is what makes the deferred
triggers satisfiable by construction rather than by the client getting two representations to
agree.

---

## 4 · The decisions this memo asks to freeze

**D1 · Write authority after conversion.** On a converted draft, section text is authoritative and
`content` is its flattening. The client may not send `content`.

**D2 · Ordinary save payload.** Ordered `[{ id, text }]` covering every section of the draft, plus
the existing `baseRevisionId` + `idempotencyKey` guard. A partial list is a topology change.

**D3 · Topology boundary.** Adding, removing, reordering or duplicating ids through the ordinary
save path is refused. Only explicit commands change topology.

**D4 · Stable-id survival rules** — decided here rather than by whichever implementation lands
first:

```text
split   the original id CONTINUES on the FIRST resulting section;
        the later section receives a NEW server-minted id
merge   the FIRST section's id SURVIVES; the second is RETIRED
        and never reused for this draft
move    ids unchanged; only order changes
```

Rationale: reading order is the Work's own order, so "first" is the stable referent a member would
name. A retired id is never reused, so a stale reference resolves to nothing rather than to
someone else's prose — the same rule DECIDE's INV-4 applies to observation keys.

**D5 · Legacy conversion policy.** Auto-convert only where the current draft maps losslessly onto
known source boundaries. Otherwise `boundary_confirmation_required`. ⛔ No heading match, text
similarity or fresh re-partition may assign stable identities.

**D6 · New-draft initialization.** Working draft, immutable first revision, and source-derived
partition created **atomically**, so new drafts begin section-addressable once the write path can
maintain that truth. No later witness-only conversion.

**D7 · Checkpoint interaction.** A checkpoint still appends one `working_draft_revisions` row
holding the flattened whole-draft content — unchanged, and the store BUILD-07A will later locate
into. The checkpoint is part of the same single transaction as the section write.

**D8 · Typed refusals.** Every one of these is a typed response with zero writes, never a database
exception surfacing as a 500:

```text
section_state_required                  a content-only save against a converted draft
topology_change_requires_explicit_command  ids added, removed, reordered or duplicated
unknown_section_id                      an id not in this draft
boundary_confirmation_required          conversion cannot establish identity losslessly
```

They sit alongside the existing `stale_base` and `idempotency_key_reuse` rather than replacing
them.

---

## 5 · What is NOT decided here

```text
the split / merge / move member gestures and their UX
whether the editor is one field or many
BUILD-07A's section→revision locator (resumes after this prerequisite)
any repair of FIND's F1
```

**Once C is ruled, A + B + D + E build as one vertical slice** rather than four pieces waiting to
learn what they mean.


---

## 6 · RULING — 2026-09-02

```text
SECTION-NATIVE CLIENT STATE
+ SERVER-DERIVED WHOLE-DRAFT CONTENT
+ EXPLICIT TOPOLOGY COMMANDS
+ NO INFERRED BOUNDARY MUTATION
```

**Option 3 ratified. D1–D8 ratified with three amendments, and D9 added.**

Options 1 and 2 are not selected. Inferred boundaries are prohibited outright. A monolithic editor
plus a hidden offset map stays admissible in theory and is not the chosen architecture, because
**the offset map becomes a second fallible claim about the same text.**

### Amendment 1 — "lossless" means mechanically exact

Automatic conversion of an existing draft is allowed **only** where the server can compose the
source-derived partition and prove, byte for byte:

```text
current draft content  ==  flatten(source-derived section slices)
```

Anything needing heading matching, similarity, inferred boundaries or diff attribution returns
`boundary_confirmation_required`. ⛔ **No heuristic may be described as "lossless."** A
member-assisted boundary-confirmation experience remains possible later; it is not required for
this slice.

### Amendment 2 — a partial section list is never a deletion

The ordinary save is a **complete-state** payload: every current section present exactly once, in
current order. Omission does **not** mean the member asked to remove a section — it means the
payload is incomplete or is attempting a topology change this endpoint cannot perform. **Refuse
with zero writes. Never infer intent from absence.**

### Amendment 3 — "first" means document order

```text
split   the original id stays with the LEADING slice in pre-command document order;
        the trailing slice receives a new server-minted id
merge   the EARLIER section in document order survives; the later id is retired
move    identities do not change
```

Contracts for the later explicit topology commands. **Split, merge and move are not part of this
slice.**

### D9 — the section-native LOAD contract

The client cannot hold section-native state unless the server first gives it the identities.

```ts
type DraftRepresentation =
  | { sectionAddressable: false; content: string }
  | { sectionAddressable: true;
      sections: readonly { id: string; text: string }[];
      content: string }   // derived display projection only
```

Names may vary; these rules may not:

```text
the server supplies stable section ids
the client never invents or re-derives them
a converted save sends sections, never content
a request supplying BOTH writable content AND sections is refused
legacy unconverted drafts stay writable under their existing contract
conversion is never smuggled into an ordinary content save
```

### The UI boundary

A visually continuous manuscript remains the desired experience. But **a single textarea plus an
invisible offset ledger is Option 2 wearing Option 3's name.** The implementation needs real
section nodes in client state beneath one continuous-looking page. Section-native is not
permission to draw a card around every section, and it is not satisfied by hiding an offset map
behind one field.
