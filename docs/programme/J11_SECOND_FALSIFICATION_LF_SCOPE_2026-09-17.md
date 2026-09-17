# J11 SECOND FALSIFICATION — CELL 1: LF-SCOPE-01

**Date:** 2026-09-17
**Status:** ✅ CANDIDATE SURVIVES LF-SCOPE CELL · ⚠️ BOUNDED HISTORICAL-AUTHORSHIP UNKNOWN
**Class:** Class C — documentary falsification only
**Governing authority:** `FOUNDER RULING — TAKE BOUNDED` at canonical `12f136634ac848e320b7ed04f36cf2790fcc68ae`
**Current gate:** falsify the bounded grant/effect candidate against current canonical LF-SCOPE-01
**Evidence subject:** canonical LF-SCOPE implementation and governing containment records at `12f136634ac848e320b7ed04f36cf2790fcc68ae`
**Stop boundary:** no repair, implementation change, schema, migration, deployment, production claim, or universality claim

---

## 1. Candidate under test

The founder-authorized working candidate is:

> **Authority existence ≠ authority consumption ≠ authority sufficiency. A governed effect must consume sufficient authority for that effect and remain inside the scope of the grant.**

This cell asks whether those terms keep the same meanings when applied to the current canonical LF-SCOPE-01 seam.

The test is falsification, not implementation design.

---

## 2. Current canonical subject

Canonical head inspected:

`12f136634ac848e320b7ed04f36cf2790fcc68ae`

The LF-SCOPE executable surface is unchanged since its canonical integration merge `a6820a05aab763d2708d6475131bd515ee18736d`.

A direct compare from `a6820a05` to `12f13663` found **zero changed files** in the LF-SCOPE executable/documentary dependency surface searched:

- `lib/maia/living-field/*`
- LF-SCOPE programme records
- `member_memory_atoms` substrate
- `memoryAtomsLoader`
- `workbench/sources/keep`

Therefore this cell speaks about the same executable LF-SCOPE mechanism that crossed canonical in #1346, now observed at current canonical.

---

## 3. Exact governed grant

The LF-SCOPE containment record maps P1-C §I to six required proofs:

1. personal member Keeps still appear;
2. non-personal atoms do not contribute to counts;
3. non-personal atoms cannot appear in gathering/detail;
4. practitioner observations do not masquerade as member Keeps;
5. existing legitimate personal behaviour remains intact;
6. no schema or writes are changed by the containment act.

The record also carries the member's rejection boundary: material whose `member_response_status = 'rejected'` must not resurface.

For this falsification, the grant is therefore not "filter metadata however convenient."

The governed grant is:

> **A personal Living Field read may expose the member's own eligible personal kept material, while excluding non-personal scope, practitioner-authored observations presented as the member's Keeps, member-rejected observations, sanctuary material, and pre-existing protected/archived classes — without mutating the underlying atoms or affinities.**

---

## 4. Governed effects

Three member-facing effects consume the LF-SCOPE predicate:

| Effect | Canonical consumer | Consequence |
|---|---|---|
| Count / denominator | `app/api/maia/living-field/route.ts` | what the field says has gathered |
| Gathered list | `app/api/maia/living-field/[fieldKey]/gathering/route.ts` | what the member can open under the gathered-Keeps surface |
| MAIA cognition | `lib/maia/living-field/encounterContext.ts` | what gathered atoms can enter Living Field encounter/refine context |

The effect is **visibility / eligibility for a personal Living Field read**, not row existence, deletion, corpus admission, or write authority.

---

## 5. Authority consumption

All three effects consume the same shared predicate:

`lib/maia/living-field/atomEligibility.ts → livingFieldAtomGuards(...)`

Current canonical predicate includes:

- `memory_scope = 'personal'`
- `source_type <> 'practitioner_observation'`
- imported `PRACTITIONER_ATTRIBUTION_GUARD`
- `member_response_status IS DISTINCT FROM 'rejected'`
- `posture_at_creation IS DISTINCT FROM 'sanctuary'`
- pre-existing protected / sacred guards

The focused suite was re-run independently on a detached worktree at exact canonical `12f13663`:

```text
PASS lib/maia/living-field/__tests__/livingFieldScopeContainment.test.ts

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
```

The suite uses unfiltered canned DB rows, so it passes only if the SQL predicate actually reaches the read path. It verifies the shared guard reaches counts, gathered content, denominator, and encounter context.

**Consumption is therefore mechanically present.**

---

## 6. Substitution cell A — scope representation

### Hold constant

- member;
- atom content;
- affinity to the same Living Field dimension;
- requested Living Field read.

### Substitute

Only:

`memory_scope = 'personal'` → `memory_scope = 'client'`

### Governed substrate

`memory_scope` is not an unconstrained label.

The canonical schema:

- restricts values to `personal | colab | client | encounter`;
- requires a team for every non-personal scope;
- requires a client relation for client scope;
- requires an encounter relation for encounter scope.

### Effect

The personal row is eligible; the client-scoped row is not.

### Result

✅ **CANDIDATE SURVIVES.**

The governed effect changes because the grant explicitly authorizes scope standing to bound personal visibility, and the effect consumes that standing through a schema-coherent scope axis.

Same meanings preserved:

- grant = personal-scope containment;
- effect = Living Field visibility;
- consumption = predicate reads the governed scope state;
- sufficiency = scope state is structurally coherent for this effect;
- scope = personal read only.

---

## 7. Substitution cell B — practitioner-authorship representation

### Hold constant

- member;
- atom body;
- personal memory scope;
- Living Field affinity.

### Substitute

Only the authorship/source representation between an ordinary member-facing source type and:

`source_type = 'practitioner_observation'`

### Governed substrate

Practitioner provenance has a dedicated substrate:

- `facilitator_id`;
- explicit `practitioner_observation` source type;
- canonical attribution guard;
- current LF-SCOPE exclusion of practitioner observations from the member-Keep effect.

The current LF-SCOPE effect is deliberately stricter than the generic loader for this surface: **even an attributed practitioner observation is excluded from copy and cognition that say "Keeps you have held."**

### Effect

An ordinary eligible personal Keep can enter the Living Field effect; a practitioner observation cannot.

### Result

✅ **CANDIDATE SURVIVES AS A NEGATIVE AUTHORSHIP BOUNDARY.**

The effect consumes an explicit grant: practitioner-authored material may exist, but may not silently acquire the member-authored Keep effect on this surface.

This does **not** prove that every non-`practitioner_observation` row has positive member-authorship attestation. That separate ceiling is tested in §9.

---

## 8. Substitution cell C — member rejection

### Hold constant

- atom identity and content;
- personal scope;
- source representation;
- affinity.

### Substitute

Only the member's response:

`member_response_status = NULL` → `member_response_status = 'rejected'`

### Governed substrate

The canonical response migration states:

- the system never sets `member_response_status`;
- the value moves only through an explicit authenticated member action;
- `rejected` releases the observation from surfacing;
- response status and response timestamp are coherence-bound.

### Effect

A rejected row is excluded from the Living Field effect.

### Result

✅ **CANDIDATE SURVIVES.**

This is the strongest cell in the seam:

- authority exists in an explicit member act;
- the Living Field effect consumes it;
- the authority is sufficient for exclusion;
- the effect remains inside the member's refusal.

The representation does not manufacture authority; it records a member-authored authority act.

---

## 9. Defeater pressure — historical positive authorship

LF-SCOPE deliberately does **not** require:

`generated_by = 'member-gesture'`

The canonical test pins this departure so a future tidy cannot introduce it silently.

Why:

- the provenance migration assigned all pre-provenance atoms `generated_by = 'unattributed-historical'`;
- requiring the literal Workbench allowlist would hide the entire historical set;
- the containment act was explicitly forbidden from destroying existing legitimate personal behaviour.

New atoms cannot mint as `unattributed-historical` except through a governed restore lane: the S5 trigger requires new mints to state a generation source.

### Substitution

Hold an otherwise eligible historical personal row constant and substitute:

`generated_by = 'member-gesture'` ↔ `generated_by = 'unattributed-historical'`

### Current effect

**No change.** LF-SCOPE intentionally ignores this field.

### What this proves

It does **not** prove a leak.

It proves a narrower epistemic ceiling:

> Current LF-SCOPE can mechanically prove its negative containment boundaries, but it does not mechanically prove positive member-authorship provenance for every historical row it preserves.

The historical rows may be legitimate member Keeps. The current substrate cannot derive positive provenance merely from their survival.

Therefore:

⚠️ **HISTORICAL POSITIVE-AUTHORSHIP SUFFICIENCY = UNATTESTED / UNKNOWN**

This is not silently converted into FAIL and is not silently converted into PASS.

The original LF-SCOPE §3(a) founder decision remains real: whether to take the literal `generated_by = 'member-gesture'` allowlist and knowingly hide pre-provenance Keeps.

This second-falsification cell does not decide that product/constitutional tradeoff.

---

## 10. Candidate adjudication for LF-SCOPE

The same meanings of the candidate terms survived the seam:

| Term | LF-SCOPE meaning |
|---|---|
| grant | bounded personal-read / authorship / refusal authority |
| effect | eligibility and visibility in personal Living Field counts, list, and cognition |
| consumption | shared predicate applied on every atom-reading path |
| sufficiency | enough governed standing to justify that specific visibility decision |
| scope | the exact personal Living Field read effect; no mutation or general authority |

No term had to be stretched into a different concept.

The candidate correctly distinguishes:

1. **authority existence** — P1-C / founder containment grant and member refusal exist;
2. **authority consumption** — all three read effects consume the shared predicate;
3. **authority sufficiency** — scope and rejection are mechanically sufficient; practitioner exclusion is sufficient as a negative boundary; positive historical authorship remains unproven.

### Cell verdict

> ✅ **J11 TAKE-BOUNDED CANDIDATE SURVIVES LF-SCOPE-01.**

With one bounded caveat:

> ⚠️ **Historical positive member-authorship sufficiency remains UNKNOWN because LF-SCOPE intentionally preserves `unattributed-historical` rows without requiring `generated_by = 'member-gesture'`.**

That caveat is evidence *for* the candidate's distinction between authority consumption and authority sufficiency; it is not authority to repair the seam.

---

## 11. Explicit non-effects

This record authorizes none of the following:

- ⛔ changing `livingFieldAtomGuards`;
- ⛔ adopting the literal `generated_by = 'member-gesture'` allowlist;
- ⛔ changing `indexAtom.ts`;
- ⛔ changing Keep / CONTINUE semantics;
- ⛔ schema, migration, data backfill, or production read/write;
- ⛔ deployment;
- ⛔ production witness claims;
- ⛔ promotion of the J11 candidate to universal law.

The LF-SCOPE implementation is **observed, not repaired**.

---

## Standing

```text
J11 founder ruling                 TAKE BOUNDED
second falsification               OPEN

LF-SCOPE cell                      ✅ COMPLETE
candidate                          ✅ SURVIVES THIS CELL
scope grant consumed               ✅ YES
scope sufficiency                  ✅ ATTESTED
member-rejection sufficiency       ✅ ATTESTED
practitioner exclusion             ✅ ATTESTED AS NEGATIVE BOUNDARY
historical positive authorship     ⚠️ UNKNOWN / UNATTESTED

universality                       ⛔ NOT ESTABLISHED
repair                             ⛔ CLOSED
implementation                     ⛔ CLOSED
runtime / deployment / production  ⛔ CLOSED
```

**Next authorized cell:** Temporal memory — salience / decay representation.
