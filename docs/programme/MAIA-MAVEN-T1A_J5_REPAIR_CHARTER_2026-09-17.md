# MAIA-MAVEN-T1A — J5 BOUNDED REPAIR CHARTER

**Status:** OPEN · bounded repair  
**Authority:** R9–R11 founder ruling, 2026-09-17  
**Base:** `2b3f6092cf33`  
**Production:** untouched

---

## 0. Required five-field preamble — reconstructed after stale-canonical discovery

> **Procedural nonconformance, preserved rather than rewritten:** canonical commit
> `680097e0c` made the five-field lane preamble mandatory at 2026-09-17 16:04:39 EDT.
> This repair lane opened at `69fbeffa6` at 16:12:19 EDT on a stale canonical base and therefore
> acted before carrying the newly required declaration. The preamble is reconstructed here
> before publication / PR. Per the manual, the preamble is declarative and does not create
> authority; the specific founder R9–R11 ruling already supplied the substantive authority.

```text
Class: Class A — memory handling / member sovereignty / consent boundary
Governing authority: MAIA-MAVEN-T1A J4 §§3,5–7 + founder rulings R9, R10, R11
Current gate: J5 bounded repair / technical evidence
Evidence subject: branch feature/maia-maven-t1a-repair-20260917; J5 correction base 2b3f6092; exact repair artifacts and tests named in the evidence record
Stop boundary: no merge, deploy, J6 witness, legacy-consent reinterpretation, or capability widening beyond R9–R11
```

**Consequence:** the missing preamble is a process defect, not an authority grant supplied after
the fact. It must be visible in the record, and the repaired lane must reconcile to current
canonical and rerun decisive evidence before a PR head can be treated as a Class A candidate.

---

## 1. Defects admitted

### NC-6 — selector substitution

`keep_material` currently becomes `reflection_mark`; selecting that doorway invokes
`handleCaptureSpirit`, which chooses the last sixteen turns and asks a model to distill title,
summary, gold lines, decisions, next steps, practices, patterns, signals and tags.

That is an interpretive proposal, not exact-referent resolution.

### NC-8 / NC-2 — persistence implies return

`member_memory_atoms.return_preference` currently defaults to `contextual_doorway`; `keepSource`
does not override it; ambient retrieval admits that value. The row does not record whether the
value came from the schema default or an explicit member gesture.

---

## 2. Authorized repair surface

### R9 repair

- `lib/types/ai.ts`
- `components/OracleConversation.tsx`
- existing Keep-intent evidence tests

Required behavior:

1. `keep_material` must not call or offer the Reflection Capsule distiller.
2. It may surface a clarification/exact-selection doorway only.
3. `open_keep` must open the Keep room, not prepare an interpretive capsule.
4. Sanctuary refusal remains first.
5. No persistence occurs until an existing exact member gesture is exercised.
6. MAIA-authored exact-message adoption remains withheld in this cut.

### R10 repair

- one additive database migration;
- `lib/psyche/types.ts` and `lib/psyche/portfolio.ts`;
- `lib/maia/memoryAtomsLoader.ts`;
- directly affected tests/witnesses.

Required behavior:

1. Add durable `return_authority` provenance with three states:
   - `legacy_ambiguous`
   - `default_private`
   - `member_explicit`
2. Existing rows receive `legacy_ambiguous`.
3. New atoms are written `member_pulled + default_private` regardless of schema drift.
4. `set_return_preference` records `member_explicit` in the same UPDATE.
5. Ambient retrieval requires both an eligible return preference **and**
   `return_authority = 'member_explicit'`.
6. Legacy ambiguous rows fail closed; no bulk conversion to explicit consent.
7. Stored-count observability remains truthful: ambiguous rows count as stored, not eligible.

---

## 3. Negative controls

The repair must prove:

- `keep_material` ↛ Reflection Capsule preparation;
- `open_keep` ↛ Reflection Capsule preparation;
- `keep_material` ↛ persistence;
- new KEEP ↛ ambient REOPEN eligibility;
- schema default cannot silently grant REOPEN;
- only `set_return_preference` can move a member atom to `member_explicit` return authority;
- `legacy_ambiguous + contextual_doorway` ↛ ambient retrieval;
- Sanctuary remains a refusal before any Keep action.

---

## 4. Explicitly out of scope

No generic Keep unification · no START_FRESH · no CONTINUE · no new relevance selector · no
Reflection Capsule deletion · no legacy-consent guessing · no J6 · no production.

---

## 5. Exit condition

Repair closes only when:

1. the bounded source/tests are green;
2. the original six J5 suites remain green;
3. the new negative controls are green;
4. diff containment shows no unrelated product surface;
5. a J5 repair evidence record is written.

Only then may J6 founder witness be opened.
