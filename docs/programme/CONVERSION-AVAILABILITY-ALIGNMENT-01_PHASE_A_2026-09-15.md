# CONVERSION-AVAILABILITY-ALIGNMENT-01 · PHASE A — READ-ONLY FINDINGS

**Canonical** `14efac449`. ⛔ No conversion-semantic change, no taxonomy change,
no automatic conversion, no schema change, no Phase-B merge.

> **The question:** what fact authoritatively establishes that the conversion
> act may actually be **offered** to the member?

---

## 1 · ⭐⭐ THE DECISIVE FINDING — there are TWO `planConversion` functions

```
lib/manuscript/draftSections.ts        planConversion  ← the MEMBER'S act runs THIS
lib/manuscript/sections/convertDraft.ts planConversion  ← the STATE is aligned with THIS
```

| | predicate | reached by |
|---|---|---|
| **the state** `resolveDraftWriteState` | `classifyDraft` ⇒ `PRISTINE` ∨ `LEGACY_COMPOSER_VARIANT` ∨ (`EDITED` ∧ `otherHeadingDiff === 0` ∧ `resolved === boundaries`) | `/write-state` → the notice |
| **the act the member takes** — `draftSections.planConversion` | ⭐ **BYTE-IDENTITY** with `composeDraftSlices(source)` — the CURRENT composer only | `POST /draft {convert:true}` ← **the button** |
| the other `planConversion` — `convertDraft.planConversion` | the same predicate as the state, plus offset checks | `develop/preparation` **only** |

⭐⭐ **So the Studio's availability gate is aligned with a conversion
implementation the member's button does not call.** That is the whole defect, and
it is sharper than "an execution precondition belongs in the read."

⛔ Neither implementation is wrong on its own terms. `draftSections.ts` states its
law plainly — *"LOSSLESS MEANS MECHANICALLY EXACT… heading matching, similarity,
inferred boundaries and diff attribution are not weaker evidence of the same
thing — they are a different claim"* — and it is the one guarding the member's
draft. `convertDraft.ts` serves developmental preparation, a different job.

---

## 2 · The disagreement band, characterized exactly

A draft is **offered an act that refuses** when `classifyDraft` says:

| class | state says | the button's door says |
|---|---|---|
| `PRISTINE` | available | ✅ **agrees** — byte-identical to the current composer |
| ⚠️ **`LEGACY_COMPOSER_VARIANT`** | available | ⛔ **REFUSES** — byte-identical to the **legacy** composer, not the current one |
| ⚠️ **`EDITED` with every boundary resolved** | available | ⛔ **REFUSES** — not byte-identical to anything |
| `EDITED` with a moved boundary | unavailable | ✅ agrees |
| `WITHHELD` · `NO_SOURCE` | unavailable | ✅ agrees |

⭐ **The band is two classes, and the first one is the consequential one.**
`LEGACY_COMPOSER_VARIANT` means *"exact match against the legacy `# ` composer"* —
i.e. **manuscripts imported under the older composer**. That is not an exotic
edge; it is a population, and it is precisely what my Phase-B fixture
accidentally constructed when it wrote `# One`.

⚠️ The witness refusal — `boundary_confirmation_required · source 76 bytes, draft
78 bytes` — is the strict door reporting that the **current**-composer
composition differs from a **legacy**-composed draft by exactly the `# ` prefixes.

---

## 3 · What kind of disagreement is it?

Of the four possibilities named in the charter:

| | verdict |
|---|---|
| intentional distinction | ⭐ **partly, and legitimately** — the two functions serve different jobs with different standards of proof, and `draftSections.ts` argues its stricter one explicitly |
| stale taxonomy | ⛔ no — `classifyDraft` is a correct **description** of the draft |
| ⭐ **overly broad UI availability** | ⭐⭐ **YES — this is it.** The notice treats a *classification* as an *authorization* |
| execution precondition belonging in the read | ⛔ **no, and importing it would be the wrong repair** — see §5 |

> ⭐⭐ **`resolveDraftWriteState` is right about what the draft IS and was never
> an availability predicate for the member's act.** The charter's distinction
> holds exactly: *classify this draft* ≠ *authorize displaying this act.*

---

## 4 · Does the mismatch predate `e0eefe042`?

⭐ **Yes.** The gate `writeState?.mode === 'continuous'` was introduced by
**`17832de5b` · "WS2-NAV-01: R1 gate the act on write state"**, long before this
lane. Phase B **relocated** that gate; it did not create it.

⚠️ **But the founder's reason for holding stands and is not weakened by that.**
Phase B moves the invitation from a dismissible side panel into the primary
writing field, where it is more central and reads as more authoritative. A
pre-existing defect made more prominent is a defect this act would be
responsible for.

---

## 5 · The smallest existing authoritative predicate

⭐ **It already exists, and it is the door itself.** `draftSections.planConversion`
is pure: `(currentContent, sourceSections) → ConversionPlan`. It takes no
connection, performs no write, and is the *same function* the POST executes.

```
may this act be offered?  ==  planConversion(content, sourceSections).status !== 'refused'
```

⛔ **And the repair is NOT to widen `classifyDraft` or narrow it.** Distorting a
correct description so a button is easy to gate is the move this programme keeps
refusing — and it would make the *census* and the *preparation* path wrong to fix
a notice.

⭐ The clean shape the charter anticipated is the one the evidence supports:

```
draft state      what kind of draft is this?          resolveDraftWriteState   ✅ correct today
conversion fit   is conversion actually offerable?    planConversion           ✅ exists, unused by the read
member consent   make this structure durable?         the member's gesture     ✅ built in Phase B
```

⚠️ **Two things Phase B would need, and neither is authorized here:**

1. the **fit** answer must reach the notice — which means the read carries it, or
   the notice asks for it. That is a seam decision, not a semantics change;
2. ⭐ the **refused-but-classified** case needs its own truthful sentence. Today
   there are two member-facing sentences (act available / no act). This band is a
   third thing: *the draft is convertible in principle and cannot be converted
   mechanically*. `draftSections.ts` already anticipates it — *"A member-assisted
   boundary confirmation may later serve the refused case"* — and ⛔ that
   capability does not exist.

⛔ **Do not let that third sentence become "conversion failed."** It is not a
failure; it is a draft whose boundaries a machine cannot prove without the
member's help.

---

## 6 · Standing

**CONVERSION-AVAILABILITY-ALIGNMENT-01 · PHASE A COMPLETE · READ-ONLY · ⛔ NO
REPAIR TAKEN · ⛔ `WRITING-STATE-ANNOUNCE-01` PHASE B REMAINS HELD.**

The half of the design ruling that is not yet true — *Soullab determines whether
structural conversion is genuinely available* — has a named cause: **the notice
asks a classifier a question only the door can answer**, and the door is a pure
function already sitting one import away.
