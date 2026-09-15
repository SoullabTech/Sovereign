# JARVIS-KP-01 · ACT 7 — EVIDENCE-INHERITANCE AUTHORITY CENSUS

**Lane:** `JARVIS-KP-01` — Shared Operational Knowledge Plane
**Act:** ACT 7 — inheritance-authority census, discovery only (opened by founder act, 2026-09-15)
**Date:** 2026-09-15
**Performed by:** Claude (agent)
**Predecessors:** ACT 1 `cc902341` · Dispositions `4baf1c2e` · ACT 2 `7940e252` · ACT 3 `8a6bc0bbd` (principal reading **superseded by ACT 4**) · ACT 4 `cd6969aa6` · ACT 5 `7c1a334ad` · ACT 6 `8adca3d2c`

---

## 0. Standing, custody, and the operating constraint

**Question:** *Does existing canon or programme law already require a downstream actor to inherit the
proof limits attached to evidence it relies upon?*
⛔ **Not:** how to implement inheritance.

```
ACT CUSTODY ........ ⚠️ NONCONFORMING — branch refused by committed policy; core.hooksPath unset
AUTHORITY STANDING . ⛔ not increased by this commit or push
```

### ⛔ The failure this act must not commit

> ACT 7 **fails** if it concludes: *"no agent-facing instruction exists, therefore agents are
> required to inherit boundaries."*

⭐ That would manufacture normativity from an implementation absence — the mirror of the error
ACT 3 nearly made with the shallow clone, and of the one ACT 5 was built to refuse. **Where no rule
is found, this act records that no rule was found, and nothing more.**

### Two distinctions preserved throughout

- **Retention ≠ repetition.** ACT 6 falsified the equivalence: the typecheck boundary is retained
  through citation form without ever being restated. ⭐ **So this act searched for rules governing
  *semantic* inheritance, not rules requiring copied wording.**
- **Discharge ≠ deletion.** A limit that new evidence has satisfied has stopped applying to that
  bounded claim. The test is: *if standing widened, what new evidence licensed it?*

---

## 1. The doctrines found

### D1 · ⭐⭐⭐ `CLAIM_STATE_AUTHORITY.md` rule 6 — *Evidence provenance travels with movement*

| Field | |
|---|---|
| **Source** | `docs/canon/CLAIM_STATE_AUTHORITY.md` §6 |
| **Standing** | ✅ **Ratified canon** |
| **Subject** | a **claim** being promoted or downgraded |
| **Rule** | four things remain recoverable: **Subject** (bound to a specific commit or artifact) · **Instrument** (at which version) · **Observation** — *"the actual result, **including its invalidity conditions**"* · **State**. *"A promotion whose provenance is not recoverable is not a promotion. It is an assertion."* |
| **Transfer scope** | **movement of a claim along the claim-state axis.** ⚠️ Not stated to cover a third party citing the evidence elsewhere |
| **Enforcement** | ⛔ prose |
| **Does not establish** | ⛔ that a later record reusing this evidence inherits anything. The governed motion is *the claim moving*, not *the evidence being borrowed*. |

⭐⭐ *"including its invalidity conditions"* is the closest thing in ratified canon to a proof
boundary travelling. It requires the limit to remain **recoverable**, not restated — which is
exactly the semantic-inheritance form ACT 6 observed.

### D2 · `CLAIM_STATE_AUTHORITY.md` rule 4 — *Downgrade is mandatory when warrant is absent*

| Field | |
|---|---|
| **Standing** | ✅ Ratified canon |
| **Subject** | a claim whose warrant lapsed, was never established, or has not been re-probed |
| **Rule** | it **must be downgraded** — *"without waiting for a decision to downgrade it"* |
| **Transfer scope** | the claim itself, over time |
| **Enforcement** | ⛔ prose |
| **Does not establish** | ⛔ that a later record's silence about a limit re-imposes it. The duty falls on the **claim's** standing, not on a citing author. |

⭐ This is the nearest ratified analogue to *"absence of limitation in a later record does not erase
it"* — the claim falls back by operation of the rule, not by anyone noticing.

### D3 · `CLAIM_STATE_AUTHORITY.md` rule 3 — *No discretionary promotion*

| Field | |
|---|---|
| **Standing** | ✅ Ratified canon |
| **Rule** | *"Absence of required evidence cannot be overridden — not by founder, developer, operator, reviewer, or document prose. **A sentence asserting a state does not create it. Neither does a merged PR**…"* |
| **Transfer scope** | any promotion |
| **Does not establish** | ⛔ what *does* establish a state in any given case |

⭐⭐ **This is `repetition does not increase standing`, ratified.** ACT 6's Co-Lab case is this rule's
worked failure and repair: a total repeated until it read as measured.

### D4 · `VERIFICATION_STATES.md` — *nothing moves by declaration*

| Field | |
|---|---|
| **Standing** | ✅ Ratified canon (2026-07-01) |
| **Subject** | a **capability**'s health state |
| **Rule** | *"Nothing changes from WARNING to LIVE by declaration. Nothing changes from PENDING to LIVE by intent. **Only by resolving the underlying obligation.**"* |
| **Transfer scope** | the capability-health axis |
| **Enforcement** | ⛔ prose |
| **Does not establish** | ⛔ anything about evidence cited between records |

⭐ This is `standing may widen only with new evidence`, ratified — for one axis.

### D5 · ⭐ `THREE_AUTHORITY_CHAINS.md` — the substitution rule

| Field | |
|---|---|
| **Standing** | ⏳ **Recorded, not ratified** |
| **Subject** | **evidence itself**, crossing between authority chains |
| **Rule** | *"Evidence produced for one authority chain cannot substitute for evidence required by another authority chain, even though it may be a prerequisite for it."* Each level *"consumes the previous one without replacing it."* |
| **Transfer scope** | ⭐ **the closest found to record-to-record transfer** — but bounded to the three named chains |
| **Enforcement** | ⛔ prose |
| **Does not establish** | ⛔ a general rule for evidence reuse outside the three chains; ⛔ and it cannot supply one — it is unratified, and its own `⏳ unruled` blanks stand |

### D6 · `MARKETING_CLAIM_DISCIPLINE.md` — *the word may not outrun the ladder*

| Field | |
|---|---|
| **Standing** | ✅ Ratified canon |
| **Subject** | an **outward claim** |
| **Rule** | *"The marketing word is the public face of the engineering ladder; **it may not outrun it**."* Plus the **Failure Test**: strip the Designed and Vision layers — does the story survive? |
| **Transfer scope** | public speech, derived from capability state |
| **Does not establish** | ⛔ anything about internal record-to-record citation |

⭐ This is `evidence may not establish more downstream than upstream`, ratified — for speech.

### D7 · `CHANGES_SECTION_EPISTEMIC_DISCIPLINE.md` — *do not interpret faster than you understand*

| Field | |
|---|---|
| **Standing** | ✅ Canon |
| **Subject** | **MAIA's interpretive output to a member** |
| **Rule** | *"The system must not interpret the user faster than it understands them."* A synthesis reaching past what the evidence supports *"trains the reader away from trusting their own signal — a sovereignty violation, not a quality issue."* Named failure modes include **pseudo-convergence** (internal agreement treated as external authority) and **guidance on unstable ground** |
| **Transfer scope** | one synthesis surface, named explicitly |
| **Does not establish** | ⛔ anything about evidence between governance records |

### D8 · `epistemic-guard.mjs` — the executable family

| Field | |
|---|---|
| **Standing** | ✅ founder ruling 2026-08-16; ✅✅ **blocking CI** |
| **Subject** | a **submitted claim** about what the running system does |
| **Rule** | `WEAK_KINDS` never sufficient alone · `G2` two endpoint proofs do not make an edge · `G7` liveness must declare `deployed_exercised` vs `in_use_by_members` |
| **Transfer scope** | ⛔ claims submitted to `.ain/claims` only — **ACT 4 established the jurisdiction** |
| **Does not establish** | ⛔ any obligation on records outside that substrate |

---

## 2. ⭐⭐ The pattern across D1–D8

The same operator — **an output may not exceed the evidence beneath it** — is **ratified in at least
four domains**, each with a different subject:

| Subject | Governing rule |
|---|---|
| a claim's **state** | D1 · D2 · D3 |
| a **capability**'s health | D4 |
| an **outward claim** | D6 |
| **MAIA's interpretation of a member** | D7 |
| a **submitted system claim** | D8 (executable) |
| evidence **crossing authority chains** | D5 (unratified) |

⛔ **In none of them is the subject *a later record, or an agent, reusing an earlier record's
evidence*.**

⭐⭐ This is ACT 2's lesson recurring at the level of law rather than vocabulary: **the same operator,
applied to different subjects, is different law** — and the project's own discipline is not to
collapse subjects. D1 governs a claim moving. It does not, on its face, govern evidence being
borrowed by someone else.

---

## 3. Direct search for citation-reuse doctrine

| Concept sought | Instances |
|---|---|
| `citation inherit…` | **0** |
| `reuse of evidence` | **0** |
| `when citing` | **0** |
| `inherits its evidentiary / proof / epistemic …` | **0** |
| `cited evidence` | 3 (incidental, not normative) |

⛔ **No rule was found whose subject is a downstream actor reusing evidence.**

### ⭐ Two practice instances — design, not doctrine

- **`PHI_GATE_REPAIR_2026-08-09.md`**: *"Aliasing, destructuring, computed access, helper functions,
  and serialization all exceed a line-oriented regex scanner. **The success message says so inline,
  so the limit travels with the signal rather than living only in documentation.**"*
  ⭐⭐ The clearest articulation found of ACT 6's structural-carry mechanism — and it is an
  engineering decision in one ops record, **not a rule requiring anyone else to do likewise**.
- **The typecheck citation convention** (`229 vs baseline 239 · 0 regressions`) — the same mechanism,
  arrived at independently, ⛔ nowhere stated as a requirement.

---

## 4. Verdict

| Option | Verdict |
|---|---|
| **A · inheritance already required by existing authority** | ⚠️ **PARTIALLY — for one subject only.** D1 requires an observation's invalidity conditions to remain recoverable **when a claim moves**. That is ratified inheritance. It is not addressed to a citing third party. |
| **B · required only in bounded domains** | ⭐⭐ **PRINCIPAL ANSWER.** Six bounded domains, four ratified, each with its own subject (§2). |
| **C · no such normative rule found** | ⭐ **TRUE OF THE SPECIFIC SUBJECT** — downstream record-to-record or agent reuse of evidence. Searched directly (§3): zero. |
| **D · evidence insufficient to tell** | ⚠️ **TRUE OF ONE QUESTION, and it is the decisive one:** whether D1's *"invalidity conditions remain recoverable"* **already reaches** a later record citing that evidence is a question of interpretation. ⛔ This census cannot answer it — reading D1 either way is an act of authority, not a finding. |

**Composite answer: B, with C for the unnamed subject and D on whether the ratified rules already
reach it.**

---

## 5. ⛔ What this census does NOT establish

- ⛔⛔ **That agents are required to inherit boundaries.** No rule addressed to that subject was
  found. **An absence establishes no obligation in either direction** — it does not create a duty,
  and it does not license ignoring one.
- ⛔ **That agents are NOT required to inherit them.** D1 may already reach the case; see verdict D.
  ⚠️ The honest position is that the question is **unanswered**, not answered negatively.
- ⛔ **That the bounded domains should be generalized.** Four ratified rules sharing an operator is
  evidence of a consistent instinct, ⛔ not authority to extend any of them.
- ⛔ **That the search was exhaustive.** Eight concept forms plus eight documents. Doctrine phrased
  otherwise is **not counted and not absent**.
- ⛔ **That `CRP-001`'s form is required anywhere.** Not generalized; ACT 6 established it has never
  been stressed by downstream reuse.
- ⛔ **That prose enforcement means these rules are weak.** D3 is prose and caught the Co-Lab drift;
  the repair happened.

---

## 6. Standing

```
JARVIS-KP-01 · ACT 7 — EVIDENCE-INHERITANCE AUTHORITY CENSUS ....... COMPLETE

Doctrines located .................................................. 8
  ratified ......................................................... 6 (D1 D2 D3 D4 D6 D7)
  recorded, not ratified ........................................... 1 (D5)
  executable ....................................................... 1 (D8, bounded to .ain)
Domains in which the operator is ratified .......................... 4, four different subjects
Rules whose subject is downstream evidence reuse ................... ⛔ 0
Practice instances of structural carry by design ................... 2 (PHI_GATE · typecheck)

VERDICT ............................................................ B principally
                                                                      C for the unnamed subject
                                                                      D on whether D1 already reaches it
⛔ NORMATIVITY NOT MANUFACTURED FROM ABSENCE

⛔ NO inheritance doctrine authored · NO CLAUDE.md / AGENTS.md change · NO template
⛔ NO parser · NO registry · NO citation-format change · NO .ain change · NO CI
⛔ NO classifier · NO automated enforcement · NO retroactive rewriting
⛔ CRP-001 NOT generalized · D5 NOT promoted · D1 NOT extended by reading
⛔ NO source file modified outside this record

ACT CUSTODY ........................................................ ⚠️ NONCONFORMING, DISCLOSED
EMBEDDED SYSTEM CLAIM IN GOVERNANCE ACT ............................ ⏳ REMAINS UNRULED
MECHANISM NEED ..................................................... ⛔ NOT ADJUDICATED

STOP CONDITION: census returned. Awaiting founder adjudication.
```

⭐ **What ACT 7 establishes.** The normative instinct is not missing — it is ratified four times over,
in four different domains, with unusual precision each time. What is missing is a rule whose subject
is *the motion ACT 6 actually observed*: evidence leaving the record that declared its limits.

⭐⭐ **And the decisive question is narrower than the lane expected.** It is not *should we write an
inheritance rule* — it is: **does `CLAIM_STATE_AUTHORITY` §6 already cover it?** *"The actual result,
including its invalidity conditions"* must remain recoverable when a claim moves. Whether a later
record citing that result is a movement of the claim, or something the rule does not speak to, is a
question of what the ratified words already mean.

⛔ **This act does not read them either way.** Both readings are available, both are defensible, and
choosing between them is an interpretation of ratified canon — which is a founder act, not a census
finding.
