# `WRITERS-STUDIO-OBSERVATION-IDENTITY-01` — Law, Contract, and Lethality Proof

**Status** ⭐ **RATIFIED (founder, 2026-09-21)** · contract specified · ⭐ **MATRIX LETHAL**
**Artifacts** `tests/constitutional/writers-studio/{observationContract,candidates,testA,matrix}.ts`
· `tsconfig.ws-observation-identity.json` · `npm run typecheck:ws-observation-identity` ·
`npm run matrix:ws-observation-identity`

The ruling accepts the TESTING-01 finding that facet conformance could not be established against
`ReaderClaimDraft`, which carries `text · refs · doesNotEstablish` and **no id**.

---

## The law, as ratified

> ⭐⭐ **One observation → one identity → three possible expressions.**

```
  READING  →  CANONICAL OBSERVATIONS  →  { GUIDED | LEARNING | DIRECT }
```

⛔ Not three readers producing three claim sets that happen to look alike — **that architecture
fails FACETS-01.** ⛔ A facet renderer has no authority to invoke a fresh developmental reading in
order to render an existing observation.

**§II identity** — opaque, minted at admission · ⛔ independent of presentation · ⛔ independent of
facet · ⛔ never derived from rendered text · ⭐ stable while rendered, discussed, proposed against
or revisited · ⭐ shared by every facet expression.
⭐ It means *this admitted observation from this reading*. ⛔ Not every semantically similar
observation MAIA may ever make; ⛔ cross-reading reconciliation is a separate act.

**§III basis fingerprint** — deterministic over the immutable basis; an **integrity witness** and a
guard against evidence drift. ⛔ **It is not the identity.**

**§IV canonical claim** — preserved, natural language, ⛔ never an input to identity, ⛔ never
replaced by a facet with a new reading.

---

## ⭐ Three things the act left open, answered here and witnessed

### 1 · An observation has no manuscript position until one is defined (§VI)

`refs` is a **NonEmptyArray**, so an observation cites several places. ⛔ Left undefined, an
implementation picks one by accident and *manuscript order* quietly means *whatever the first ref
happened to be.*

> ⭐ **Defined: the position of an observation is the EARLIEST position across its refs, ordered by
> `(sectionPosition, codePointStart ?? 0)`.**

⭐ Evidence already carries code-point ranges (BUILD-07A froze `(revisionNumber, code-point range,
digest)`), so order resolves **below section granularity** — which makes genuine ties rare rather
than routine. Witnessed by `A4-position-is-earliest-ref` against a fixture whose refs are listed
out of order.

### 2 · The tie-break, defined and witnessed as §VI requires

> ⭐ **`admissionIndex`** — the order in which the reading admitted the observation.

⛔ Non-evaluative by construction: it records **when** a thing entered the record, never how much it
matters. ⭐ And because the suite asserts the **defined** order, it kills **every** alternative
tie-break, not merely one particular severity function — which is stronger than the act requires.

### 3 · ⚠️ Minting at admission has one structural consequence

Identity originates in an **event**, not in content. ⭐ That is what makes the §III falsifier
satisfiable. ⚠️ It also means **admission must be the single point at which an observation comes
into existence** — two admission paths would mint two identities for one observation, and nothing
downstream could tell. Recorded now, because implementation will meet it.

---

## ⭐ The §IX prompt boundary, located precisely

`lib/manuscript/developmentalReader/read.ts` sends `messages: [{ role: 'user', content:
renderRequest(request) }]`. ⭐ **The entire prompt is a pure function of `DevelopmentalReaderRequest`**,
which carries exactly `commissionedLens · evidence · recovered`.

⭐ So the Compass separation is stronger by shape than any behavioural check: **if the request type
cannot carry a declaration, the prompt cannot either.** The guard must cover `renderRequest`'s
inputs, ⛔ never the `evidence` field alone — which is exactly what **D7** exploits.

---

## Lethality proof — ⭐ MATRIX LETHAL

Reference **16/16 PASS**. All six named candidates and D7 **die on their named check**.

| Candidate | Named kill | ⭐ Result |
|---|---|---|
| D1 text-derived identity | `A0-identity-minted-at-admission` | KILLED |
| D2 evidence-only identity | `A0-required-falsifier` | KILLED |
| D3 per-facet rereading | `A3-no-reading-on-render` | KILLED |
| D4 Guided helpful expansion | `A1-set-equals-admitted` | KILLED |
| D5 hidden reachability difference | `A1-set-invariant` | KILLED |
| D6 positional ranking disguise | `A4-manuscript-order` | KILLED |
| D7 Compass in the prompt | `A7-kills-D7` | KILLED |

### ⚠️ Two collateral entries adjudicated rather than papered over

The first run reported them **UNCLASSIFIED**, and the S3 rule is that unclassified collateral is an
isolation defect. Both were examined; ⭐ **one was a defect in the suite, not the candidate.**

- **D2 also trips `A0-identity-minted-at-admission`.** ⭐ My check was misnamed: it detects **any
  content-derived identity**, not only a text-derived one, because a content-derived identity is
  stable across admissions **by construction**. The check is right and its name was wrong —
  **renamed**, then classified. ⛔ Narrowing D2 to spare it would mean no longer using the basis as
  identity, i.e. no longer being D2.
- **D3 also trips `A3-authorship-facet-invariant`.** Re-reading per facet mints fresh ids per facet,
  and proposals are keyed on the observation, so what MAIA may author diverges. ⛔ Narrowing it
  would mean not re-reading, i.e. no longer being D3. **Classified.**

⭐ Both are irreducible under the ruling's own test: removing the collateral would require the
candidate to cease embodying its constitutional error.

### Instrument

`tsc -p tsconfig.ws-observation-identity.json` — **strict + `noUncheckedIndexedAccess`**, exit 0 ·
matrix exit 0. ⚠️ Run here with TypeScript, tsx and `@types/node` resolved from a scratchpad, since
this container has no project `node_modules`; the commands are repository-defined, so ⭐ **the
founder's run is the evidence of record** (S3 precedent). ⛔ Neither command widens
`tsconfig.ship.json` or can move the typecheck baseline.

---

## §X Learning-quality boundary — held

> **Learning describes technique rather than prescribing quality**
> ⭐ **UNKNOWN — REQUIRES HUMAN WITNESS**

⛔ Not proved, ⛔ not proxied. Mechanical testing may establish only structural facts: teaching is
optional · attached to the same canonical observation · changes no evidence · changes no
observation set. ⛔ The suite asserts nothing further and reports nothing further.

---

## Standing

**⭐ DELIVERED** — canonical observation object specified · identity and basis-fingerprint contract ·
TESTING-01 Test A **writable and written** · lethality proved for all seven candidates.
⛔ The reference is a **test double, not an implementation**, and ⛔ **never a seed**: an
implementation derived from it would smuggle storage decisions out of an object that has no table,
no reader and no durability.

**⛔ NOT AUTHORIZED BY THIS ACT** — convergence steps 2–8 · production mutation · Editorial Reading
implementation · pass implementation · ranking · new teaching capability · semantic observation
reconciliation across readings · wiring this contract into the live reader.

⛔ **PRODUCTION UNTOUCHED.** No `lib/`, no `app/`, no `database/` file was modified.

> ⭐ **The next lane may move**: one canonical observation is now mechanically provable to remain
> one observation across GUIDED · LEARNING · DIRECT.
