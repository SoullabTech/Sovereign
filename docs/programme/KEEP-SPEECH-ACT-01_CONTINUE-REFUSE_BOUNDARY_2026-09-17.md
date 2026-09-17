# KEEP-SPEECH-ACT-01 — CONTINUE / REFUSE Speech-Act Boundary

**Date:** 2026-09-17
**Class:** Class A — consent / sovereignty recognition boundary
**Governing authority:** Founder Keep ruling of 2026-08-28 as preserved in J10 seam C; J11 grant/effect falsification; founder continuation act of 2026-09-17
**Current gate:** bounded implementation + falsification; merge/deploy remain separate governed acts
**Evidence subject:** `lib/consciousness/keepIntent.ts`, its focused tests, and the existing Keep wiring it selects
**Stop boundary:** no new CONTINUE classifier; no server filing-parser change; no persistence redesign; no schema/migration; no deployment; no production-state claim

---

## 1. The governing contract

The founder's 2026-08-28 Keep ruling separates three authorities:

> **UNDERSTAND** recognizes Keep intent.
> **FACILITATE** surfaces a visible, reversible gesture.
> **COMMIT** requires the member's own confirmation before persistence.

This lane repairs **UNDERSTAND only**. It does not enlarge that grant.

A Keep recognizer may identify an unambiguous Keep request. It may not decide that a different speech act is Keep merely because the verb *keep* occurs inside it. It also may not solve that defect by inventing a new durable or selective `continue` authority.

**Law:** a different or uncertain act fails closed to **NONE** and remains ordinary conversation.

---

## 2. Defect reproduced on canonical

Canonical base for the repair census:

`12f136634ac848e320b7ed04f36cf2790fcc68ae`

`detectKeepIntent(...)` used substring recognition. That caused two distinct member acts to be converted into `keep_material`:

### 2.1 CONTINUE → KEEP

Examples reproduced before repair:

- `keep this question open`
- `let's keep this question open`
- `keep this conversation going`
- `keep this thread alive`
- `keep this inquiry open`
- `keep this possibility open`
- `keep this work going`

The effect is not merely lexical. `OracleConversation` consumes `keep_material` by preventing the ordinary send and opening the Keep capture surface. Recognition therefore changes what happens to the member's turn.

### 2.2 REFUSE → KEEP

Examples reproduced before repair:

- `don't keep this`
- `do not keep this`
- `I don't want to keep this`
- `please don't keep this`
- `never keep this`
- `don't open Keep`
- `please do not open the Keep`

A refusal being converted into the refused action is a direct consent-boundary failure.

### 2.3 Control: the server filing parser did not reproduce the defect

`lib/psyche/conversational-keep.ts` uses a whole-utterance generic Keep rule. Against the declared CONTINUE / REFUSE population it returned `null` before this repair.

Therefore the defect locus is the client recognizer's substring semantics, not the server parser.

---

## 3. Falsifier first

Before changing the matcher, the test population was extended with:

- 10 CONTINUE utterances that must return `kind: null`;
- 7 REFUSE utterances that must return `kind: null`;
- mixed-turn controls proving that a blocked first occurrence does not poison a later explicit Keep.

**Pre-repair result:** the 17 declared CONTINUE / REFUSE negatives failed. The test could therefore distinguish the defect from the repaired behavior.

---

## 4. Bounded repair

Only `lib/consciousness/keepIntent.ts` changes behavior.

The recognizer now evaluates individual phrase occurrences against three local blockers:

1. **existing false friends** — e.g. `keep going`, `keep in mind`, `keep this between us`;
2. **negation / refusal** in the local clause — e.g. `don't keep this`;
3. **continuation constructions** beginning with the candidate occurrence — e.g. `keep this question open`, `keep this conversation going`.

A blocked occurrence is skipped rather than poisoning the whole member turn. This preserves mixed turns such as:

- `don't keep this — actually, keep this`;
- `keep this question open — actually, can we keep this moment?`;
- `don't open Keep; actually, open Keep`.

### What was deliberately not added

- no `continue` intent kind;
- no classifier that assigns CONTINUE semantics;
- no new persistence action;
- no server filing-parser edit;
- no UI redesign;
- no change to member confirmation / COMMIT authority.

The repair **subtracts false authority**. It does not create new authority.

---

## 5. Evidence on the candidate

### 5.1 Matcher suite

`npx jest lib/consciousness/__tests__/keepIntent.test.ts --runInBand`

**60 / 60 PASS.**

This includes the new CONTINUE / REFUSE falsifiers, existing true Keep phrases, existing false friends, and mixed-turn controls.

### 5.2 Bounded Keep acceptance population

```
npx jest \
  lib/consciousness/__tests__/keepIntent.test.ts \
  components/__tests__/keepIntentWiring.test.ts \
  app/api/capsules/__tests__/keepOpenNonPersistent.test.ts \
  --runInBand
```

**3 suites · 91 / 91 tests PASS.**

This proves the recognizer contract, its `OracleConversation` wiring, and the non-persistent `/api/capsules?mode=open` boundary remain coherent.

### 5.3 Cross-parser control

For all eight sampled CONTINUE / REFUSE controls, the repaired client recognizer and the untouched server filing parser agree:

`client = null · server = null`

### 5.4 Repository gates

- `npm run typecheck` → **229 errors vs baseline 239 · 0 regressions**
- `npm run check:no-supabase` → **PASS**
- `git diff --check` → **PASS**

### 5.5 Adjacent pre-existing Sanctuary test debt

`components/__tests__/sanctuaryCaptureRefusal.test.ts` currently fails one source-string assertion looking for the literal token `{!isSanctuary &&` in `OracleConversation.tsx`.

That same failure was independently reproduced on untouched base `12f13663`: **1 failed / 5 passed**. Neither the test nor `OracleConversation.tsx` is modified by this lane. It is therefore baseline debt, not a regression introduced by KEEP-SPEECH-ACT-01.

This record does **not** infer from that stale assertion that the runtime Sanctuary boundary is broken or safe. That requires its own current behavioral witness.

---

## 6. UNDERSTAND → FACILITATE → COMMIT after repair

| Layer | Standing after this repair |
|---|---|
| **UNDERSTAND** | May recognize an unambiguous explicit Keep/Open-Keep request. CONTINUE, REFUSE, false friends, and uncertainty return NONE. |
| **FACILITATE** | Existing visible reversible Keep affordance remains unchanged. The member can inspect/act rather than the recognizer silently deciding a different act. |
| **COMMIT** | Untouched by this repair. No persistence authority is added or moved. |

The important result is asymmetrical: **the recognizer knows less, and the member retains more authority.**

---

## 7. Separate standing observation — not repaired here

The repository still contains the older feature-flagged server conversational-Keep filing path in canonical MAIA / Oracle routes. This lane established only that its parser does not reproduce the CONTINUE / REFUSE substring defect.

This lane did **not** establish:

- the current production value of `CONVERSATIONAL_KEEP_ENABLED`;
- the complete current Sanctuary control flow around direct filing;
- whether that separate path fully satisfies the 2026-08-28 FACILITATE / COMMIT contract in production.

Those questions remain a separately named Class A census/repair locus if opened. They are not silently folded into this recognizer repair.

---

## 8. Standing

```text
CONTINUE → KEEP defect ............ CLOSED on candidate
REFUSE → KEEP defect .............. CLOSED on candidate
New CONTINUE authority ............ NONE
Matcher tests ..................... 60 / 60 PASS
Bounded Keep population ........... 91 / 91 PASS
Server parser control ............. null / null on declared negatives
typecheck ......................... 229 vs 239 · 0 regressions
check:no-supabase ................. PASS
git diff --check .................. PASS
Adjacent Sanctuary source test .... PRE-EXISTING 1 / 6 failure · not repaired
Schema / migration ................ NONE
Persistence / server parser ....... UNTOUCHED
Deployment ........................ NOT AUTHORIZED BY THIS RECORD
Production state .................. NOT CLAIMED
```

**Candidate standing: repair evidence complete; return to merge gate.**
