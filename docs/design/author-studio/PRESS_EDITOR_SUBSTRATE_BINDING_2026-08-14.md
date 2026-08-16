# Press Editor — Substrate Binding

> ```text
> STATUS ............................ BINDING DESIGN RECORD
> EPISTEMIC CLASS ................... SOURCE RESOLUTION (code-read)
> FOUNDER RULING .................... YES — the six rulings in §2 are founder-issued,
>                                     2026-08-14, on this source resolution
> IMPLEMENTATION .................... NONE — this record builds nothing
> RELEASE EVIDENCE .................. NONE — this record proves nothing about runtime
> W8 RELEASE GATE ................... OPEN; complete authenticated W1 walk required
> MEMBER RELEASE .................... NOT AUTHORIZED
> ```
>
> **What this record is**: the resolution of the one architectural boundary that blocked
> route creation on the Writer's Studio member upgrade lane — *is Press Editor a new
> publishing system, or does one already exist?* — together with the founder rulings issued
> on that resolution.
>
> **What this record is not**: implementation, an implementation authorization, or evidence
> that anything works at runtime. Build authority for the Writer's Studio upgrade was
> reopened by founder directive 2026-08-14 and is not granted, widened, or narrowed here.
>
> **Referents**: canonical `origin/clean-main-no-secrets` @ `c8bab43aa`; lane
> `feature/writers-studio-member-upgrade-2026-08-14` @ `94bf07958`.
> **Evidence class**: code-read. This establishes what the code *says*. It is not a runtime
> trace, and no claim below may be cited as production behavior.

---

## 1. The finding

**There is no second publishing system to collide with. There are two different things
wearing the word "render", and only one of them is a substrate.**

### 1.1 The member publishing substrate — real, member-scoped, working

`POST /api/sovereign/manuscripts/[id]/render`

- **Authenticated**: `getMemberIdFromRequest`; returns 401 without a member.
- **Member-scoped**: loads the manuscript `WHERE id = $1 AND member_id = $2`.
- **Parameterized**: `format: 'pdf' | 'epub'`, validated before work begins.
- **Engine**: `lib/manuscript/render/renderMemberBook.ts` — pandoc + Paged.js,
  `print-book.css`, `epub-book.css`, `canonical-plates.lua`, `center-images.lua`.
- **Provenance**: writes a `manuscript_renders` row (`format`, `source_section_count`,
  `source_hash`, `page_count`, `authorized_at`) — an *authorization* record, not an artifact
  store. Bytes are streamed and the temp file deleted.
- Its own header already holds the constitutional position: *"The author's own words, set as
  a book — their sections, in order, verbatim. Nothing generated, woven, or interpreted."*

### 1.2 Book Studio's render — not a publishing system

`POST /api/book-studio/render`

- Takes **no parameters**.
- Reads **no member id**; performs **no ownership check**.
- Reads one hardcoded path from disk:
  `docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md`.
- Writes **no provenance row**.

It renders one specific manuscript checked into the repository. It is not multi-tenant, has
no member scoping to remove, and cannot serve a second member or a second book without being
rewritten.

### 1.3 The risk inverts

The danger is **not** that Press Editor duplicates Book Studio. It is that Press Editor
duplicates `sovereign/manuscripts/[id]/render` — the one that actually works for members —
while looking at Book Studio for inspiration and mistaking a **design reference** for a
**substrate**. Those are two different files, and only one of them may be extended.

---

## 2. Binding rulings (founder, 2026-08-14)

### 2.1 Book Studio is not the member publishing substrate

`/api/book-studio/render` is founder-operated · tied to one hardcoded manuscript · unscoped
by member or work · without parameters or provenance. It is useful to Writer's Studio **only
as a reference for spatial grammar and typography**.

⛔ **It must not be generalized, extended, or treated as the basis of Press Editor.**

### 2.2 Press Editor must reuse the sovereign manuscript renderer

The existing member-capable publishing substrate is `/api/sovereign/manuscripts/[id]/render`.

Press Editor **may orchestrate and present** that capability. It **must not create**:

- a parallel render endpoint;
- a second PDF/EPUB pipeline;
- a separate authorization model;
- another provenance store.

> The risk is duplication of the sovereign renderer, not collision with Book Studio.

### 2.3 Edition requires no schema migration

An Edition is represented as:

```text
living_work_expressions
  expression_type = 'edition'
  expression_id   = working_draft_revisions.id
```

The **immutable revision is the edition's textual referent**. The expression row declares its
relationship to the Living Work.

Source support for this shape:

| Requirement from the division ruling | Existing substrate |
|---|---|
| "a form the Work has taken" | `living_work_expressions (living_work_id, expression_type, expression_id, declared_by, declared_at)` |
| "derived from a **declared revision**" | `working_draft_revisions (draft_id, revision_number, content, saved_by, note)` — immutable rows |
| "the Working Draft remains intact" | `manuscript_working_drafts` is a separate row; revisions never mutate it |
| "newer drafts are **offered**, never synced" | falls out structurally: the edition binds an immutable revision |

`living_work_expressions.expression_id` is `UUID NOT NULL` with no foreign key and no type
discriminator — a deliberately polymorphic pointer. Binding a revision id therefore requires
**no schema change**.

This makes the central rule **structural rather than disciplinary**:

> **Transfer creates an expression of the Work; it does not replace the Work.**

Later writing cannot silently rewrite an already-created edition, because the edition points
at a revision that cannot change.

### 2.4 The polymorphic pointer requires refusal tests

Because the database does not constrain `expression_id` by expression type, application logic
must refuse **at least**:

1. an `edition` pointing to a manuscript rather than a revision;
2. an `edition` pointing to a revision outside the member's work;
3. an `edition` pointing to a revision the member does not own;
4. render attempts against an edition whose revision/work relationship cannot be proven;
5. replacement or mutation of an existing edition pointer under the guise of re-transferring;
6. creation of an edition from an unpersisted or mutable draft state.

> **No migration is needed, but the absence of a foreign-key distinction is not permission to
> leave the invariant implicit.**

Each refusal must be a **two-sided** test — a case that is refused and a case that is
permitted. A test that cannot fail proves nothing.

### 2.5 Access mapping is mandatory at route creation

Every new Press Editor route must be entered **explicitly** in `config/accessMatrix.ts` with:

```text
minTier: 'free'
no role gate
not public
```

⛔ The permissive unmapped-route default must never be relied upon (#717).

This is **part of implementation completeness, not release cleanup**. Precedent:
`AUTHOR_STUDIO_THREE_LAYER_RULING.md` §3.2 — both Studio routes first shipped as
`public: true` and had to be corrected on 2026-07-31. Book Studio's render route is the
counter-example to copy *from*, not the pattern to copy.

### 2.6 W8 remains open

```text
Original defects ........ repaired in code
Authenticated walk ...... never restarted from W1
W8 release gate ......... OPEN
Evidence of live defect . NOT ESTABLISHED
```

Neither the old failed walk nor the later code repairs constitute current release evidence.
**Only a new complete authenticated W1–W8 walk can close the gate.**

---

## 3. Decision status

```text
C3 — Press Editor / Book Studio organ boundary .... RESOLVED
C3 — publishing substrate selection ............... RESOLVED
C3 — Edition persistence model .................... RESOLVED
Schema migration .................................. NOT REQUIRED
/book-studio route absorption ..................... DEFERRED / NONBLOCKING
Member release .................................... NOT AUTHORIZED
```

`/book-studio` route absorption is downstream of **C1** (Studio house naming, still
`AWAITING_AUTHORITY`) and does not block route creation.

---

## 4. Implementation order for the first Press Editor slice (ruled)

Establish, **in this order**:

1. the route;
2. explicit `config/accessMatrix.ts` entries;
3. ownership checks;
4. immutable Edition creation;
5. the refusal tests of §2.4;

**before** any visual borrowing from Book Studio.

> This order prevents the typography reference from quietly becoming architectural authority.

---

## 5. What this record does not do

It authorizes no deployment · proves no runtime behavior · closes no release gate · rules no
part of C1 · does not absorb, rename, or retire `/book-studio` · does not widen or narrow the
build authority reopened by founder directive on 2026-08-14.
