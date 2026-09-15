# CONVERSION-AVAILABILITY-ALIGNMENT-01 · PHASE B — THE SURFACE ASKS THE DOOR

**Base** `e0eefe042` (WRITING-STATE-ANNOUNCE-01 Phase B, held) on canonical
`14efac449`. **Status: BUILT · WITNESSED 35/0 · BOTH ACTS HELD PENDING A
COMBINED RULING · PRODUCTION UNTOUCHED.**

⛔ Neither `planConversion` changed. ⛔ `classifyDraft` unchanged. ⛔ No
preparation-path change. ⛔ No automatic conversion. ⛔ No schema change.

---

## 1 · The three facts, now genuinely separate

```
classification   what kind of draft is this?        resolveDraftWriteState   descriptive, untouched
offerability     can the MEMBER'S door succeed?     draftSections.planConversion  ← now asked
consent          make this structure durable?       the member's gesture     unchanged
```

⭐⭐ **The offerability fact comes FROM THE DOOR, not from a copy of its rule.**
`/write-state` imports `planConversion` from `lib/manuscript/draftSections` — the
same pure function `POST /draft { convert: true }` executes — and returns

```ts
conversionOfferable: plan.status !== 'refused'
```

⛔ **A boolean, never the refusal.** The refusal words are instrumentation and
this lane's own rule keeps them off the screen: the surface needs to know
**whether**, not **why**.

⛔ **And the UI does not re-implement the predicate.** Fixing a mismatch by
copying the strict rule into the surface would replace one divergence with two
identical predicates free to diverge again. A source obligation forbids the
surface from carrying any composer, byte comparison or classification name.

⚠️ `conversionOfferable` is **optional**, and the surface tests `=== true`.
⛔ **Absence is not permission** — an older server omits the field, and a draft
must never be offered an act because a response was silent about it.

---

## 2 · The third sentence

For a draft classified convertible whose door refuses:

> **This draft has section structure, but the Studio cannot safely make that
> structure durable from the draft as it stands. You can keep writing normally.**

Three things, and nothing more: there **is** structure here; the Studio cannot
presently prove the durable transformation safely; she is **not blocked**.

⛔ Not *"conversion failed"* — no act occurred and none was attempted.
⛔ Not *"confirm the boundaries"* — there is no member act that does that today,
and a surface must not advertise tomorrow's machinery. Both are pinned by
obligations.

---

## 3 · Witness — 35 passed · 0 failed, real Chromium

⭐⭐ **The legacy-composer fixture is now a permanent obligation**, and it is the
production-shaped case the original witness missed:

- **S5** the legacy draft is **also** classified `continuous`
- **L2** ⭐⭐ and the member's own door says it is **not offerable**
- **L3** while the pristine draft **is** — the two are distinguished
- **L5** ⛔ **no control is shown** — classification alone never authorizes it
- **L7–L9** the third sentence appears, ⛔ is not called a failure, ⛔ advertises nothing
- **L10** writing remains available

**The acceptance law, witnessed in both directions:**

```
X-pristine   control shown (true)  IFF the door says offerable (true)
X-legacy     control shown (false) IFF the door says offerable (false)
```

Plus the five states re-witnessed unchanged, and `T1–T3` — structure becomes
durable **because she asked**.

---

## 4 · ⚠️ Three instrument defects of my own

1. ⚠️ **THE C21 CLASS, EIGHTH OCCURRENCE — three times in one file.** Every new
   prohibition fired on the prose stating it: the notice names `planConversion`
   while explaining it must not re-implement it; the route names
   `sections/convertDraft` while explaining it does not import it; the copy says
   ⛔ NOT *"conversion failed"* while forbidding that phrase. Comments are now
   stripped before every prohibition scan — the remedy used since C6.
2. **The acceptance-law leg reused a converted Work.** It ran after the act leg,
   which had deliberately converted that Work, so it asked whether a control
   appears on a draft that is no longer `continuous`. Each leg now has its own
   Work.
3. **TypeScript narrowed a callback-assigned `let` to `never`.** The observed
   responses are collected in an array, which is the honest shape anyway: it
   records what was seen rather than what was expected.

---

## 5 · Obligations amended, and how

⭐ **Two assertions were amended and BOTH became stricter**, not looser:

| | was | now |
|---|---|---|
| `gates the button on the WRITE STATE` | `mode === 'continuous'` — a classification | the member's own door |
| `does not alter conversion behaviour` (a guard from another act) | gated on the write state | gated on the door, which is **stricter** |

⛔ Neither was deleted, and neither law was weakened. Five new obligations were
added: the door is the gate · absence is not permission · the UI does not
re-implement the predicate · the server takes the answer from the door the member
uses · the refusal words stay off the screen · the band has its own sentence.

---

## 6 · Gates

- browser witness → **35 passed · 0 failed**
- Writer's Studio suites → **893 passed · 53 suites · 0 failed**
- `npm run typecheck` → **229 vs baseline 239 · 0 regressions · exit 0**

⚠️ `lib/manuscript/development/__tests__/evidenceCannotAct.test.ts` remains RED
**on canonical** — recorded earlier, ⛔ not this lane's, ⛔ not repaired.

---

## 7 · Standing

**CONVERSION-AVAILABILITY-ALIGNMENT-01 · PHASE B BUILT · WITNESSED ·
⛔ MERGE NOT AUTHORIZED.**

This branch carries **both** acts — the announcement and the alignment — because
the alignment gates the surface the announcement built. Their combined evidenced
tree is what a merge ruling would act on.

> The half of the design ruling that was not yet true is now true: **Soullab
> determines whether structural conversion is genuinely available, by asking the
> door the member would actually walk through.** Kelly still decides whether to
> take it.
