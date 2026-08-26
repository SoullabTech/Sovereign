# NW-A01 — PRACTICE FIELD PROMPT AUTHORITY AUDIT

**Unit**: NW-A01 · **Date**: 2026-08-26 · **Mode**: audit only.
**No behavior changed. No schema. No prompt edits. No field re-classified in code.**

> **Governing question (founder, 2026-08-26)**: not *"does this field pass the corpus gate?"* but
> **"what authority permits this sentence to govern MAIA?"**

---

## THE COMPOSITION PATH

```
practice_fields row (by slug, from the REQUEST)
  → getPracticeFieldBySlug()        practiceFieldService.ts:376
      SELECT * FROM practice_fields WHERE field_slug = $1     ← no status/containment filter
  → formatFieldContextForRoom()     practiceFieldService.ts:288
      288  corpusIsComposable(field) → ALWAYS false           ← the one hard gate
      292  about_practice            → "About this practice: …"
      293  how_we_work_together      → "How this practice works: …"
      294  how_maia_supports         → "How you (MAIA) support it here: …"
      295  professional_practice     → "The practitioner: …"
      296  renderFieldGuidance(maia_guidance)                 ← sanitized + subordinated
  → resolveFieldBlock()             roomComposition.ts:108
  → composeRoomTurnPrompt()         roomComposition.ts (floor FIRST, field between)
  → the model
```

## THE AUDIT TABLE

| | `about_practice` | `how_we_work_together` | `how_maia_supports` | `professional_practice` | `maia_guidance` | corpus (`active_field_content`) |
|---|---|---|---|---|---|---|
| **Who can author** | any authenticated member, for their own field, via `POST /api/practitioner/practice-field` | same | same | same | same | same |
| **Stored** | `practice_fields` TEXT | TEXT | TEXT | TEXT | JSONB | TEXT + `active_field_updated_at` |
| **Kind** | practitioner-authored; **demo seed in dev** | practitioner-authored | practitioner-authored | practitioner-authored | practitioner-authored (structured) | practitioner-authored source material |
| **Provenance class** | **UNKNOWN per row** — no column records it | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| **Ratified?** | **No mechanism exists** | none | none | none | none | none — the gate is a hard `false`, not a ratification state |
| **Save-time gate** | 🔴 **none** | 🔴 **none** | 🔴 **none** | 🔴 **none** | ✅ `validateFieldGuidance()` (narrow-only; rejects widening/override) at `practiceFieldService.ts:341` | none needed — cannot compose |
| **Compose-time gate** | 🔴 **none** | 🔴 **none** | 🔴 **none** | 🔴 **none** | ✅ `renderFieldGuidance()` — re-sanitizes and wraps in a constitution-subordinating header | ✅ `corpusIsComposable()` → `false`, unconditional |
| **Enters prompt at** | line 292 | 293 | 294 | 295 | 296 | withheld |
| **Reaches production rooms?** | **Yes** — any room entered with the slug | Yes | Yes | Yes | Yes (sanitized) | No |
| **Revocation / version path** | `practice_field_revisions` records every save; **composition reads the current row only.** No approved-revision pointer, no rollback affordance, no revocation | same | same | same | same | n/a |
| **Protected by tests?** | 🔴 partial and incidental (see below) | 🔴 **none** | 🔴 **none** | 🔴 **none** | ✅ `fieldGuidance.test.ts` | ✅ `corpusAuthorityGate.test.ts` |
| **CLASSIFICATION** | **REQUIRES RATIFICATION** | **REQUIRES RATIFICATION** | 🔴 **SHOULD NOT COMPOSE** as free text | 🔴 **SHOULD NOT COMPOSE** unratified | **ALLOWED TO COMPOSE** (already gated) | **REQUIRES RATIFICATION** (correctly withheld today) |

---

## FINDINGS

### A01-F1 — Containment governs going live. It does not govern composing.

`getPracticeFieldBySlug()` is `SELECT * FROM practice_fields WHERE field_slug = $1`. **No filter on
`status`, none on `containment_status`, none on `effective_live`.**

The 2026-08-09 governance-containment migration builds a careful, well-reasoned model —
*"readiness is modeled, containment is not"*, `effective_live := status='live' AND
containment_status='none'`, GC-1/2/3 forbidding computation from clearing an explicit governance
act. **It governs invitations and liveness. Nothing in it reaches the composition path.**

So a field that is `status='pending'` **and** `containment_status='contained'` — a field an
explicit governance act is holding shut — **still composes its text into MAIA's system prompt** for
any room entered with its slug. The migration records that field `8be895ad` is under an active
containment for exactly this class of reason.

**This is the central A01 finding**, and it is a wider version of the one that started the unit:
the corpus gate is not the only place the boundary leaks. *The governance layer models whether a
practitioner may go live, and never asks whether their text may govern the model.*

### A01-F2 — The authority spectrum is inverted at its most sensitive point

`maia_guidance` is **double-guarded**: validated at save (narrow-only — it may specify or narrow,
never widen or override) and re-sanitized at compose inside a header that subordinates it to the
constitution. Its own header states the reason: *"so guidance written to the DB by another path can
never emit raw override text into the prompt."* That is defense in depth, and it is well done.

**`how_maia_supports` is free text with no guard at either end** — and it is the column whose
entire purpose is to tell MAIA how to behave. It composes verbatim as *"How you (MAIA) support it
here: …"*.

**Two channels carry the same authority. One is validated, neutralized and tested. The other is a
raw string.** Anything `validateFieldGuidance` would reject in `maia_guidance` can be written in
prose into `how_maia_supports` and reach the prompt untouched. The guard is real and it is
routed around by design of the schema, not by intent.

### A01-F3 — Four of six channels have no gate at either end

`about_practice`, `how_we_work_together`, `how_maia_supports`, `professional_practice`: no
validation at save (`upsertPracticeField` writes them straight through), no neutralization at
compose, no length bound, no provenance column, no ratification state.

### A01-F4 — Composition consults neither membership nor the invitation allowlist

The room takes `body.fieldContext` from the request, sanitizes it to `[a-z0-9_-]`, and looks it up.
**There is no check that the requesting member belongs to that field.** `AUTHORIZED_FIELD_CONTEXTS`
gates *registration* at `/now-what/arrive` — it is not consulted at composition.

Any authenticated member can compose any practice field's text into their own room prompt by
passing its slug. The exposure is practitioner configuration, not member material or PHI — but the
*authority* consequence is real: a field's governing sentences are not scoped to its own members.

### A01-F5 — Versioning exists; revocation does not

`practice_field_revisions` records full Layers 1–4 plus status on every save, attributed to the
saving member. Good substrate. **But composition reads the live row.** There is no approved-revision
pointer, no "compose the ratified version" path, no rollback, and no way to revoke a sentence that
has already been governing rooms. Version history without a revocation path is an audit trail, not
a control.

### A01-F6 — Test coverage protects two of six channels, and the founder's question exposes it

*Which tests would actually fail if an unratified practitioner claim re-entered a prompt-bearing
field?*

| Channel | What fails |
|---|---|
| corpus | ✅ `corpusAuthorityGate.test.ts` — several tests |
| `maia_guidance` (override attempt) | ✅ `fieldGuidance.test.ts` — neutralization + validation |
| `about_practice` | ⚠️ **only** `now-what-flourishing-vocabulary.test.ts`, **only for the seed file**, and **only the three exact phrases pinned by NW-D01.5 R2**. A *different* unratified claim passes silently. |
| `how_we_work_together` | 🔴 **nothing** |
| `how_maia_supports` | 🔴 **nothing** |
| `professional_practice` | 🔴 **nothing** |

Applying the negative-control discipline honestly: **the R2 test proves one sentence stays out of
one file. It does not protect the boundary.** I should not have let its green reassure anyone,
including me, about anything wider — and this row is why the founder asked the question.

---

## `professional_practice` — the ruling this unit was asked to inform

The founder's provisional ruling: *"Unratified descriptions of a named practitioner must not enter
prompt-bound `professional_practice`."* **The audit supports it and sharpens why.**

That column's *declared* purpose in the base migration is narrow and specific:

```sql
professional_practice  TEXT,  -- jurisdictional declarations (required for LIVE)
```

**Jurisdictional declarations.** Not biography, not method, not positioning. The seed currently
puts a prose description of a real named person there — *"Larry Closs — executive coach and
consultant developing an approach that integrates executive leadership with positive psychology…"* —
and it composes as *"The practitioner: …"*.

Two distinct problems, and only the first is what the founder named:
1. **Unratified claim about a real person** entering the model's governing context.
2. **Field-purpose drift** — a column intended for jurisdictional declarations is carrying free-form
   practitioner marketing. That matters beyond provenance: **NW-D01-F5 established that Larry's
   professional standing, credentials and referral obligations are unknown**, and this is precisely
   the column where a jurisdictional declaration would live. It is currently occupied by prose that
   makes no jurisdictional claim at all.

**Recommended replacement, pending the ruling**: neutral and purpose-honest, e.g. *"Demo
practitioner profile — no jurisdictional declaration on file."* **Not changed by this unit.**

---

## WHAT THIS UNIT DOES NOT RECOMMEND

**Do not put the five neighbours behind `corpusIsComposable()`.** The founder flagged this and the
audit confirms the instinct: the six channels are not one kind of thing.

- `maia_guidance` is **explicit configuration** — bounded, structured, validated, subordinated. Its
  model works and should be the template, not the exception.
- The corpus is **authored source material** — a body of work whose composition is a licensing and
  ratification question.
- The four identity/relationship layers are **self-description** — and they are the awkward middle:
  legitimate for a practitioner to write, and currently ungoverned.

A single gate across all six would be the wrong shape. **The question each needs answered is
different**, and A01's recommendation is only that each be answered:

| Channel | The question it actually poses |
|---|---|
| `maia_guidance` | *Is the narrowing bound correct?* — mechanism already exists |
| corpus | *Is this material licensed and ratified?* — Attachment A's question |
| `how_maia_supports` | *Why is instruction-to-MAIA allowed through an unvalidated channel at all?* |
| `professional_practice` | *What is a jurisdictional declaration, and who verifies it?* |
| `about_practice` / `how_we_work_together` | *May a practitioner's self-description govern the model, and does it need ratification or only bounds?* |

## DECISIONS REQUIRED (founder)

1. **Rule A01-F1** — should composition consult `status` / `containment_status`? A contained field
   composing is either a defect or an intended separation; the audit cannot tell which, and the
   containment migration does not say.
2. **Rule `professional_practice`** (above), including whether the column returns to its declared
   jurisdictional purpose.
3. **Rule A01-F2** — whether `how_maia_supports` should be bounded like `maia_guidance`, merged
   into it, or stop composing.
4. **Rule A01-F4** — whether composition should require membership in the field.
5. **Note A01-F6** — any future "the boundary is protected" claim needs tests that fail on a
   *class* of violation, not on three pinned phrases.

## STILL OPEN — unchanged by this unit

Production query **UNKNOWN** · NW-D02 **hypothesis only** · Larry scope/referral **awaiting the
sitting** · safety-content floor **awaiting its own sign-off**.

## STOP
