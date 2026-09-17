# MAIA-MAVEN-T1A — J2 KEEP AUTHORITY RECONCILIATION

**Status:** J2 RECONCILIATION COMPLETE · **STOP — CONTRADICTIONS FOUND** · **J3 NOT OPENED** · ⛔ **NO IMPLEMENTATION AUTHORIZATION**  
**Date:** 2026-09-17  
**Evidence base:** `849550548da2af194a63ef0bfc2e92b4f78de117`  
**J1 record:** `docs/programme/MAIA-MAVEN-T1A_J1_KEEP_OBJECT_AND_INVOCATION_CENSUS_2026-09-17.md`  
**Parent charter:** `docs/programme/MAIA-MAVEN-T1_TRUTHFUL_AWARENESS_CHARTER_2026-09-17.md`

---

## 0. Purpose

J1 established that the repository does not contain one Keep object or one Keep authority seam.
J2 asks the constitutional question:

> **Which existing laws govern each Keep lineage, which differences are lawful specialization,
> and where does the implementation contradict the stronger authority already present?**

This record reconciles. It does not repair.

---

# 1. Authority stack used by this reconciliation

J2 does not treat every sentence containing the word *Keep* as equal authority.

The relevant stack is:

1. **The Clearing** — architecture protects the member's inexhaustibility and relational presence.
2. **MAIA Sovereignty Invariants** — constitutional, immediate and irrevocable; sovereignty wins over system coherence.
3. **Sanctuary invariant 6** — absolute non-retention, including when the member asks during Sanctuary.
4. **Right to Remain Unpossessed** — non-formation and member permission precede system memory claims.
5. **Specific founder rulings embodied in governed seams** — especially `KEEP-OPEN-NONPERSISTENT-01`
   and `KEEP-INTENT-01`, both ruled 2026-08-28.
6. **Domain-specific mature ancestors** — Press Keeps, member-marked episodic moments, Field declaration,
   portfolio formation and Workbench Keep discrimination.
7. **Maven / NODE synthesis** — downstream of stronger existing laws by its own derivation index.

The Maven derivation index already states the applicable method: when an ancestor is more precise
and more structurally enforced, **the ancestor governs**.

---

# 2. J1 denominator correction — there are more than three Keep lineages

J1 correctly rejected the idea that `member_memory_atoms` and Press Keeps are the same object, but
its three-family summary was incomplete.

The evidence base contains at least these live or declared Keep lineages:

| Lineage | Durable substrate | Member act | Present standing |
|---|---|---|---|
| **Press Keep** | `manuscript_keeps` | literal **Keep** button on a verified manuscript passage | LIVE specialized object |
| **Portfolio / Field Keep** | `member_memory_atoms`, `generated_by='member-gesture'` | portfolio candidate button, Field declaration, or conversational bridge | LIVE mixed-quality invocation paths |
| **Reflection Capsule Keep** | `reflection_capsules` | **CONFIRM KEEP** after zero-write preview | LIVE artifact Keep |
| **Marked Moment Keep** | `episodic_memories`, `marked_by_member=TRUE` | **Keep this moment** button attached to one exact member turn | LIVE specialized object |
| **House Keeps experience** | `/maia/keep-capture` + conversational Keep doorway | surface/orchestration, not one storage object | LIVE surface spanning multiple concepts |
| **Personal Wisdom Library governed Keep intent** | no live writer found | pure intent → governed-state interpreter | DESIGNED / UNWIRED |

Therefore:

> **Keep is a family concept in repository language. It is not a table name.**

That statement does **not** authorize unioning every lineage into one read capability.

J1 remains unchanged as the historical census that discovered the first ambiguity. This record is
its denominator correction.

---

# 3. The apparent conflict: “record immediately” vs “confirm before persistence”

`MAIA_SOVEREIGNTY_INVARIANTS.md` Invariant 11 says:

> member-declared significance outranks system-inferred significance.

It also permits the system to record a declared-significant moment immediately, while warning that
protection boundaries govern eligibility first.

The later Keep-specific rulings of 2026-08-28 say:

```text
OPEN KEEP     = zero persistence
PREPARE KEEP  = zero durable write
CONFIRM KEEP  = persistence permitted
```

and:

```text
UNDERSTAND   recognition only
FACILITATE   surface/open member-controlled gesture
COMMIT       only the member's confirmation persists
```

These are **not contradictory once the member act is distinguished from system recognition**.

## 3.1 Direct exact-object gestures

A member clicking **Keep** on a manuscript passage, **Keep this moment** beside one exact authored
turn, or **Keep this for me** beside one exact portfolio candidate is already performing a bounded,
object-addressed member act.

There is no need to manufacture a second confirmation ceremony merely for its own sake.

Invariant 11 permits immediate recording **after that exact member act**.

## 3.2 Conversational recognition

Natural-language recognition such as:

```text
keep this
remember this
hold onto this
```

is different. The system must first determine what object *this* refers to. `KEEP-INTENT-01` was
created specifically because relational speech must not silently collapse into persistence.

Thus the resolving distinction is:

> **Immediate persistence may follow an already exact member gesture. Recognition of a possible
> gesture is not itself permission to guess the object and persist it.**

This preserves both the general constitutional permission and the later, more specific Keep law.

**Classification:** CONSISTENT after scope distinction. No canon amendment required.

---

# 4. Press Keep

The Press path is a mature specialized ancestor:

- the member sees one candidate passage;
- the member clicks **Keep**;
- the server re-reads the member-owned manuscript section;
- the passage must exist verbatim;
- stored text remains the submitted characters;
- the read path orders only by the member's act and never selects by system relevance.

The act, object and provenance are sufficiently bound for the Press domain.

Its table lacks a separate `generated_by`-style field, so a naked database row is not by itself a
cryptographic proof of the UI gesture. That is a provenance limitation, not evidence that the live
product path violates the Keep law.

**Classification:** CONSISTENT · STRONG SPECIALIZED ANCESTOR.

Press Keep remains Press-qualified. Nothing in T1-A may silently redefine all Personal Keeps as
manuscript passages.

---

# 5. Marked Moment Keep

J2 finds a second mature specialized ancestor that J1 omitted.

`components/OracleConversation.tsx` renders **Keep this moment** only beside a member-authored turn.
The click sends that exact turn's verbatim text and session provenance to
`POST /api/sovereign/episodes/mark`.

The route:

- requires authenticated member ownership;
- requires a resolvable source session;
- rejects Sanctuary-origin marks server-side;
- stores exact member words;
- sets `marked_by_member=TRUE` only on this explicit member action;
- leaves interpretive columns null;
- separates marking from later recall consent.

This is an important precedent because it shows how an immediate Keep can be lawful:

```text
visible exact object
      ↓
member clicks Keep
      ↓
server proves source + boundary
      ↓
write
```

No model needs to infer what *this* meant.

**Classification:** CONSISTENT · STRONG SPECIALIZED ANCESTOR.

Marked Moments are not automatically T1-A Personal Field Keeps merely because the UI verb is
*Keep*. Their storage, recall policy and object type remain episodic-domain owned.

---

# 6. Reflection Capsule Keep

The August 28 Keep repair established another mature law:

```text
OPEN KEEP     → UI/navigation only
PREPARE KEEP  → ephemeral preview
CONFIRM KEEP  → create reflection_capsule
```

The confirming POST explicitly states that what the member reviewed is what gets written; the
server does not re-distill between preview and persistence.

This is a **Keep artifact**, but Member Field canon independently rules:

> being saved is not being declared.

A Reflection Capsule therefore remains a source artifact until a separate Field declaration act.
Saving the capsule must not silently mint a Field Object.

**Classification:** CONSISTENT · STRONG HOUSE AUTHORITY ANCESTOR.

This distinction prevents T1-A from treating every confirmed Reflection Capsule as a Portfolio /
Field Keep unless the member also performed the governed Field declaration.

---

# 7. Portfolio / Field Keep identity

J1 found the strongest existing generic discriminator in `lib/workbench/sources/keep.ts`:

```text
generated_by = 'member-gesture'
```

The adapter correctly says:

> “Atom” and “Keep” are not the same claim.

That distinction is sound and should be preserved.

But J2 sharpens it:

> **`generated_by='member-gesture'` is necessary evidence of a generic Keep origin; it is not,
> by itself, proof that the governing member act was lawful.**

Why: `keepSource()` hardcodes `generated_by='member-gesture'` for every caller that reaches it.
The stamp records what the writer *claims* the generation class was. It does not record which
member gesture, route, object binding or confirmation satisfied that claim.

The older conversational server path can therefore mint the same `member-gesture` stamp while
bypassing the later Keep authority contract.

**Classification:** GENERIC DISCRIMINATOR VALID · PROVENANCE SUFFICIENCY GAP.

This is not a reason to discard `generated_by`. It is the opposite: it is the correct first gate,
but not the complete evidence chain.

---

# 8. `/maia` server conversational Keep — CONTRADICTION

The canonical `/maia` surface posts to `/api/sovereign/app/maia/list`.

That route contains a feature-flagged conversational Keep writer introduced before the August 28
Keep rulings. When enabled, a high-confidence `parseFilingInstruction()` result such as:

```text
keep this
```

immediately calls `applyConversationalKeepResult()` and then `keepSource()` before the response
reaches the client.

The history matters:

- conversational atom filing existed by June 5, 2026;
- `KEEP-OPEN-NONPERSISTENT-01` landed August 28;
- `KEEP-INTENT-01` landed immediately after it on August 28 and explicitly ruled that recognition
  does not commit and only the member-controlled confirmation persists.

No later ruling found in this evidence base re-authorizes the older immediate-write semantics.
Later modifications to the large route do not themselves constitute re-ratification of that seam.

Therefore the older route is downstream of a later, specific founder ruling and does not regain
standing merely because the code remains present.

**Classification:** ⛔ **CONTRADICTION.**

The contradiction exists in the implementation whether or not the environment flag is enabled.
Flag state affects runtime exposure; it does not change constitutional standing.

⛔ J2 does not authorize deleting, disabling or rewriting this path.

---

# 9. Conversational referent — unresolved object boundary

The same server parser records the current utterance as its `excerpt`.

For destination `keep`, the writer can transform:

```text
member utterance: “keep this”
```

into a spontaneous atom whose title and body are themselves:

```text
“keep this”
```

The path does not establish whether *this* means:

- MAIA's prior sentence;
- the member's prior turn;
- one quoted passage;
- the whole exchange;
- a draft shown elsewhere;
- or another bounded object.

The member act is real. The object is underdetermined.

The direct Press and Marked Moment ancestors demonstrate the missing property: **object binding is
mechanical before persistence.**

The August Keep preview path demonstrates another lawful solution: **show the proposed object and
let the member confirm it.**

**Classification:** ⛔ **UNRESOLVED AUTHORITY BOUNDARY.**

It becomes a contradiction whenever the under-resolved command is allowed to persist an object
without a lawful binding step.

---

# 10. Sanctuary server path — CONTRADICTION

Sanctuary requires no new ruling.

The authority is already explicit:

> Nothing from a Sanctuary session can be saved, extracted, inferred, or converted into long-term
> memory, under any circumstances, including by user request during the session.

The canonical route already computes `isSanctuary` and uses it to suppress multiple durable paths.
But the conversational Keep condition does not include `!isSanctuary`.

If reached, `keepSource()` stamps the new atom:

```text
posture_at_creation = 'normal'
```

rather than carrying the actual turn posture.

That creates a structurally reachable path by which a Sanctuary utterance could be laundered into
a normal-posture durable atom.

**Classification:** ⛔ **CONTRADICTION against absolute constitutional boundary.**

Production feature-flag state was not inspected by J1 or J2. Runtime incidence remains unclaimed.
The code-path contradiction does not depend on incidence.

---

# 11. `/maia/keep-capture` read truth — NON-CONFORMANCE

The House Keeps room reads `member_memory_atoms` through `listAtoms()`.

That reader does not select or filter `generated_by`.

The UI explicitly separates `practitioner_observation` rows into **Shared with you**, which is good,
but every other atom is placed in the member's **Kept** section.

The schema permits other origins:

```text
member-gesture
member-utterance
inference
synthesis
derivation
practitioner-observation
unattributed-historical
```

Because the response object does not carry `generated_by`, the surface cannot mechanically prove
that every non-practitioner row it calls **Kept** is a member-gesture Keep.

**Classification:** ⚠️ **NON-CONFORMANCE — representation wider than proof.**

The Workbench Keep adapter is the stronger ancestor here because it actually requires
`generated_by='member-gesture'`, personal scope and non-Sanctuary posture.

---

# 12. MAIA atom prompt loader — NON-CONFORMANCE

`loadMemberMemoryAtomsForPrompt()` already carries eligible atom material into MAIA cognition under
return-preference gates.

Its projector partitions only practitioner observations from everything else. Every non-
practitioner atom is rendered under:

```text
# MEMBER-PLACED PORTFOLIO
```

with the claim that the member explicitly kept it and that it is not system-inferred.

But the loader does not read or filter `generated_by`.

The schema's permitted origins make that authorship claim structurally unproven.

**Classification:** ⚠️ **NON-CONFORMANCE — producer/authorship claim exceeds the reader's evidence.**

This is not merely a future T1-A issue. It is an existing read-path truth issue discovered while
reconciling T1-A.

J2 names it and does not widen scope into repair.

---

# 13. Personal Wisdom Library Keep interpreter

`lib/library/keepIntent.ts` contains a coherent designed seam:

- `intent='keep'` maps to member/private/kept;
- default usage authority is `only_when_i_ask`;
- guidance authority is never granted by default;
- underdetermined choices are refused rather than guessed;
- the module is pure and imports nothing.

An exhaustive consumer search at the evidence base found no live consumers outside its tests.

**Classification:** DESIGNED / UNWIRED.

Its principles are compatible with the mature Keep laws, but the module does not become live
runtime authority merely because its design is sound.

---

# 14. T1-A object ruling — not silently decided by J2

The parent charter names T1-A:

> **Personal Keeps READ**

J2 now has enough evidence to reject two shortcuts:

1. **Personal Keeps ≠ Press Keeps by default.** Press is a qualified manuscript object.
2. **Personal Keeps ≠ every object whose UI uses the word Keep.** Marked Moments and Reflection
   Capsules have independent object models and consent semantics.

The strongest candidate meaning for T1-A is therefore:

> **Personal Field / Portfolio Keeps — personal-scope `member_memory_atoms` whose origin is a
> lawful member Keep gesture.**

But `generated_by='member-gesture'` alone is not yet sufficient proof of *lawful* origin because the
older conversational writer can mint that stamp without the later confirmation seam.

Therefore J2 records this as the **recommended object ruling**, not as a founder act silently taken
by the reconciliation.

---

# 15. Reconciliation table

| J1/J2 area | Classification | Governing authority / consequence |
|---|---|---|
| Keep as a family term | **REFINEMENT** | multiple qualified live lineages; do not collapse |
| Press Keep | **CONSISTENT** | mature domain-specific member selection |
| Marked Moment Keep | **CONSISTENT** | exact-object member gesture + provenance + Sanctuary refusal |
| Reflection Capsule Keep | **CONSISTENT** | Aug-28 open/prepare/confirm authority seam |
| Saved capsule → Field Object | **CONSISTENTLY SEPARATE** | Field declaration canon: saved ≠ declared |
| Portfolio generic discriminator | **VALID BUT INCOMPLETE** | `generated_by='member-gesture'` necessary, not sufficient |
| Direct exact-object Keep may write immediately | **CONSISTENT** | Invariant 11 + mature specialized ancestors |
| Conversational recognition = immediate commit | ⛔ **CONTRADICTION** | later specific `KEEP-INTENT-01` governs |
| Deictic “this” object binding | ⛔ **UNRESOLVED BOUNDARY** | no guessing; exact object must be established |
| Sanctuary conversational filing | ⛔ **CONTRADICTION** | absolute invariant 6 |
| House `/maia/keep-capture` “Kept” read | ⚠️ **NON-CONFORMANCE** | reader drops `generated_by` |
| MAIA atom “MEMBER-PLACED” prompt claim | ⚠️ **NON-CONFORMANCE** | authorship claim exceeds SQL evidence |
| KeepAffordance | **DESIGNED / UNWIRED** | cannot cure server contradiction while unconsumed |
| Personal Wisdom Library intent seam | **DESIGNED / UNWIRED** | useful design precedent, no live standing |
| T1-A generic object | ⚠️ **FOUNDER RULING OWED** | strongest candidate = lawful Personal Field Keep |

---

# 16. Founder docket — exact rulings J3 would need

J2 recommends the following rulings for explicit founder adjudication.

## R-A — Keep is a family; T1-A gets one qualified object

Recommended:

> **Keep is the family concept. T1-A Personal Keeps READ means Personal Field / Portfolio Keeps,
> not Press Keeps, Marked Moments, Reflection Capsules, or an automatic union of every Keep-
> labelled artifact.**

The T1-A identifier stays. The qualifying definition belongs in its authority record; no parallel
T1-A lane is created.

## R-B — Exact act law

Recommended:

> **A Keep becomes durable only through a member act bound to a knowable object. An already exact
> UI gesture may itself be the confirming act. System recognition of relational language is not
> the confirming act.**

This reconciles immediate member-mark flows with the Aug-28 House law.

## R-C — Deictic referent law

Recommended:

> **“This,” “that,” and similar references may authorize persistence only after the referenced
> object is mechanically resolved without guessing. If resolution is ambiguous, the system must
> clarify or show the proposed object for confirmation; it must not choose the referent.**

## R-D — Provenance law

Recommended:

> **`generated_by='member-gesture'` is necessary to call an atom a generic Keep, but the field is
> not sufficient evidence that the member act satisfied current Keep authority. A truthful reader
> must not upgrade uncertain historical origin into confirmed member authorship.**

## R-E — Reader truth law

Recommended:

> **Any surface or prompt producer that says “Keep,” “kept by the member,” or “member-placed” must
> mechanically prove the origin it names. A broader atom reader may remain broad only if it labels
> each origin truthfully instead of collapsing them into member authorship.**

## R-F — Qualified Keeps remain qualified

Recommended:

> **Press Keeps, Marked Moments and Reflection Capsule Keeps retain their existing domain identity
> and consent semantics. T1-A does not absorb them merely because they share the family verb.**

## R-G — Sanctuary is already decided

No new founder discretion is required:

> **Sanctuary cannot create a durable Keep, even on explicit in-session request.**

J3 would inherit this; it would not reconsider it.

---

# 17. What J3 must not do yet

Because J2 found contradictions, **J3 is not opened by this record**.

In particular, do not yet:

- wire `/api/sovereign/keeps` into `/maia`;
- union Press Keeps + Marked Moments + Capsules + atoms;
- edit the sacred `/maia` surface;
- repair the conversational server writer;
- change `keepSource()`;
- migrate `member_memory_atoms`;
- backfill provenance;
- reinterpret historical atoms as member-confirmed;
- modify Sanctuary behavior;
- wire `KeepAffordance` merely because it exists;
- create a new capability-registry entry.

The next gate is founder adjudication of R-A through R-F. R-G is inherited law.

---

# 18. J2 closure

**J2 constitutional reconciliation: COMPLETE.**

The core result is:

```text
KEEP IS A FAMILY, NOT A TABLE

exact member gesture + exact object + lawful posture
        → may authorize durable Keep

system recognition / ambiguous referent
        → may facilitate
        → may NOT silently become durable Keep

member_memory_atom
        ≠ Keep

generated_by='member-gesture'
        = necessary generic discriminator
        ≠ complete proof of lawful invocation
```

Two implementation contradictions are now named:

1. the older `/maia` server conversational writer can commit before the later specific Keep
   confirmation boundary; and
2. that same writer lacks the absolute Sanctuary guard while stamping normal posture.

Two existing reader non-conformances are also named:

1. `/maia/keep-capture` can call broader atom origins **Kept** without carrying generation
   provenance; and
2. MAIA's atom prompt projection can call broader atom origins **member-placed** without proving
   member-gesture origin.

No source, test, schema, migration, route, prompt, capability registry, production state, or
`/maia` member-facing surface is changed by this record.

**J3 NOT OPENED. STOP for founder adjudication.**
