# JARVIS-KP-01 · ACT 4 — EPISTEMIC SUBSTRATE ADOPTION / JURISDICTION CENSUS

**Lane:** `JARVIS-KP-01` — Shared Operational Knowledge Plane
**Act:** ACT 4 — read-only jurisdiction and adoption census (opened by founder act, 2026-09-15)
**Date:** 2026-09-15
**Performed by:** Claude (agent)
**Predecessors:** ACT 1 `cc902341` · Dispositions `4baf1c2e` · ACT 2 `7940e252` · ACT 3 `8a6bc0bbd`

---

## 0. Standing and custody

**Question:** *What was `.ain/claims` + `.ain/epistemic-ledger.jsonl` actually intended and required to
govern, and why do later authority-bearing acts appear outside it?*
⛔ **Not:** how to replace, improve, or force adoption of it.

```
ACT CUSTODY ........ ⚠️ NONCONFORMING — branch refused by committed policy; core.hooksPath unset
AUTHORITY STANDING . ⛔ not increased by this commit or push
```

### Provenance-horizon constraint — carried forward as ruled

> **Failure to recover an authority-changing act is not evidence that no such act exists until the
> applicable repository-history horizons are established.**

| Horizon | Boundary | Status in this act |
|---|---|---|
| Clone depth | shallow by default | ✅ crossed (deepened to 5,851 commits) |
| Repository root | `clean-main-no-secrets` @ 2025-11-23, secrets-scrubbed | ⛔ **not crossable from here** |
| PR / review bodies | GitHub | ⚠️ **not read in this act** |

⛔ `VERIFICATION_STATES.md` remains *"ratification act not recovered"* — **not** *"unratified."*

---

## 1. ⚠️ Correction to ACT 3's principal finding

ACT 3 recorded: *"the machine-readable authority substrate this lane was reaching toward already
exists."*

⛔ **That is wrong, and the evidence for why is ACT 2's own lesson applied to my own finding: the
subject is different.**

The substrate adjudicates **claims about what the running system does.** Every guard is a
system-behaviour guard:

| Guard | Fires on |
|---|---|
| G1 `CANONICAL-PATH` | *is this route/endpoint the canonical, live, traffic-carrying one?* |
| G2 `EDGE-PROOF` | *does X actually reach / govern / propagate to Y?* |
| G4 `INDEX-LIVENESS` | *is the semantic / vector index actually populated?* |
| G5 `STATUS-EVIDENCE` · `STATUS-PROMOTION` | *does the evidence support the claimed epistemic state?* |
| G6 `CORRECTION-ANATOMY` | *does a correction carry all seven rungs?* |
| G7 `LIVENESS-SCOPE` | *`deployed_exercised` or `in_use_by_members`?* |

And the guard states its own failure mode:

> *"a guard that fails to fire costs **a false LIVE**."*

⭐⭐ **The substrate governs ACT 2's V1/V2/V3 axes — capability health, claim layer, engineering
realization. It does not govern V4/V6 — governance-artifact lifecycle and document ratification
standing, which is what JARVIS-KP-01 has been examining.**

### The decisive structural fact

`founder_ruling` and `ratified_canon` appear in `AUTHORITY_KINDS` as **evidence kinds a
system-behaviour claim may cite** — never as **acts the ledger records**.

```
founder ruling ──► INPUT to a claim about the system
founder ruling ──✗ SUBJECT of a ledger transition
```

⛔ So a founder ruling, a canon ratification, or a lane closure was **never within this substrate's
jurisdiction**. ACT 3 saw the vocabulary overlap (`ratified_canon`, `founder_ruling`) and read it as
subject overlap. **Same word, different subject — the exact error ACT 2 documented five homograph
sets of.**

---

## 2. Jurisdiction, as declared

| Question | Answer | Source |
|---|---|---|
| What is a claim *about*? | what the running system does | guard subject detectors + all seven guards |
| Does it govern thinking? | ⛔ no — *"`HYPOTHESIS` requires no evidence — the guard governs **promotion**, not thinking"* | `JARVIS_EPISTEMIC_GUARDRAILS_2026-08-11.md` |
| Declared enforced scope | *"Axis 1 enforced in authoritative CI against submitted, well-formed claim records"* | workflow + `epistemic-ci.mjs` |
| Explicitly NOT established | that claims are true · that fabricated evidence is detected (*evidence fields are self-declared; form and class are checked, not veracity*) · that inadmissible claims cannot enter by another route | both files |
| Are governance acts in scope? | ⛔ **no** — no guard, detector, or evidence kind takes a governance act as subject | this census |

⭐ The substrate is an **anti-inflation instrument for system-behaviour claims** — the same drift
`MARKETING_CLAIM_DISCIPLINE` fights, mechanised. It is not, and was not built as, a governance
authority ledger.

---

## 3. ⭐⭐⭐ The enforcement boundary — the question that dissolves the puzzle

**Does CI require every governance act to have a claim, or validate claims only when they exist?**

Answered in the adjudicator's own source, `epistemic-ci.mjs`:

```js
// R4 — zero new claims is NOT a failure. #1054 scopes Axis 1 to claims actually
// submitted; demanding one per PR would manufacture epistemic activity. A rule
// that certain changes MUST submit a claim belongs in a separate classifier, not
// smuggled into the adjudicator.
```

and its own exit message:

```
✅ PASS / NOT_APPLICABLE — this PR submits no new claim record and appends no ledger row.
   Axis 1 governs submitted claims; it does not require every PR to invent one.
```

⭐⭐⭐ **It is a validator, not a requirer.** `missing claim` blocks only where a proposed ledger
delta references a claim that is absent — a delta/claim integrity check, never a participation
requirement.

**Therefore the two-row ledger is not a guard failure, not a bypass, and not evidence that anyone
evaded a control.** ⭐ The control worked exactly as specified on every PR since 2026-08-16: it
returned `PASS / NOT_APPLICABLE`.

### ⭐⭐ The real structural finding

The design **explicitly named the missing component and deliberately placed it elsewhere**:

> *"A rule that certain changes MUST submit a claim belongs in a **separate classifier**, not
> smuggled into the adjudicator."*

⛔ **That separate classifier was never built.** No file in the repository determines which changes
must submit a claim.

⭐ The architectural judgment was sound — *demanding one per PR would manufacture epistemic
activity* is the same refusal this project applies everywhere. The consequence is that adjudication
is enforced and **entry is entirely voluntary**, which is not a defect in the adjudicator and is not
adoption failure by its users. **It is a two-part design of which one part exists.**

---

## 4. The adoption path — censused, not invented

| Possible path | Present? |
|---|---|
| Claim-authoring command / script / generator | ⛔ **none** |
| Template or schema file | ⛔ **none** |
| CLAUDE.md instruction | ⛔ **`.ain` appears 0 times** |
| `AGENTS.md` · `.claude/project-context.md` · `PROJECT_CONTEXT.md` · `.claude/AGENTS_MANUAL.md` | ⛔ **0 mentions each** |
| PR template requirement | ⛔ none found |
| Worked example | ⚠️ exactly 1 — the admission claim about the guard itself |
| Documentation | ✅ 2 ops records (`…GUARDRAILS_2026-08-11.md`, `…CLAIM_DELTA_CORRECTION_2026-08-16.md`) |
| CI feedback inviting participation | ⚠️ only the `NOT_APPLICABLE` line, which reads as *nothing required* |

⭐ **Only two files in the repository touch `.ain/claims`: `epistemic-ci.mjs` and its proof harness.
Both are readers. Nothing in the repository writes a claim record.**

⛔ The sole practical route to participate is to know the JSON shape exists and hand-author it —
and **no agent-facing orientation surface mentions it.** An agent following every instruction it is
given would never learn the substrate exists.

---

## 5. Post-genesis species sample

| Species | Instance | In jurisdiction? | Claim required? | Claim created? | Would CI reject absence? | Path discoverable? |
|---|---|---|---|---|---|---|
| Founder ruling | `bff7e0b18` *ratify the class split* | ⛔ **NO** — governance act | ⛔ no | no | ⛔ no | n/a |
| Canon ratification | `CLAIM_STATE_AUTHORITY.md` promoted 2026-09-05 | ⛔ **NO** | ⛔ no | no | ⛔ no | n/a |
| Lane closure | `S3-ROUTE-INTEGRATION_CLOSURE_2026-09-14` | ⛔ **NO** | ⛔ no | no | ⛔ no | n/a |
| Acceptance verdict | WS2-08 `BUILD-08A` ACCEPTED | ⚠️ **the act NO; its embedded production findings YES** | ⛔ no | no | ⛔ no | ⛔ no |
| Production witness | `S3-O1_PRODUCTION_WITNESS_2026-09-14` | ⭐ **YES — squarely** | ⛔ **no** | no | ⛔ no | ⛔ no |
| Architectural assertion | `S3` route-integration design | ⚠️ partly | ⛔ no | no | ⛔ no | ⛔ no |
| Ordinary implementation | `dfa521ef feat(w4-schema)` | ⛔ NO unless it asserts liveness | ⛔ no | no | ⛔ no | n/a |

### The in-subject population

Of **177** programme records dated after genesis, **68** assert a production or liveness fact —
the guard's own subject domain. **Claim records authored in that window: 1** (the admission claim).

⚠️ **This is a subject-domain count, not a violation count, and must not be read as one.** Several
of those 68 apply *stricter* discipline in prose than the guard encodes — `S3-O1`'s
**WITNESSED vs ENTAILED** split is a finer instrument than `G7 LIVENESS-SCOPE`. ⛔ Nothing required
any of them to submit, so none is a bypass.

---

## 6. Verdict against the five permitted outcomes

| Outcome | Verdict |
|---|---|
| **A · Narrow by design** | ⭐⭐ **PRINCIPALLY THIS.** Jurisdiction is system-behaviour claims. Governance acts — rulings, ratifications, closures, acceptances — were never within it. Two authority systems exist, addressing different subjects. |
| **B · Required but inaccessible** | ⛔ **NO.** Nothing was required (§3). The path *is* inaccessible (§4), but inaccessibility to a non-requirement is not this defect. |
| **C · Optional substrate** | ✅ **TRUE AS STATED, by design.** Prose governance remained constitutionally valid because the substrate never claimed that jurisdiction. |
| **D · Bypass** | ⛔ **NO — and it is important that this be refused explicitly.** Bypass presupposes a requirement. §3 shows, from the adjudicator's own source, that none existed. The empty ledger is the specified behaviour of a validator nobody was obliged to invoke. |
| **E · Mixed** | ⭐ **TRUE IN PART, on one seam only:** 68 post-genesis records make claims inside the guard's subject domain and none entered it. ⛔ Not a violation — no requirement, no authoring path, no orientation surface naming it. |

---

## 7. Acceptance criterion

> *distinguish `not represented because outside scope` from `not represented despite being in scope`
> from `scope itself was never ruled clearly enough to tell`.*

| Category | Finding |
|---|---|
| **Outside scope** | ⭐ **The large majority.** All governance acts. Established from the guard's subjects, its declared purpose, and the placement of `founder_ruling` as evidence-kind rather than subject. |
| **In scope, not represented** | ⭐ **A real, bounded population: the ~68 system-behaviour claims**, chief among them production witnesses. ⛔ Not required, not reachable, not a violation. |
| **Scope never ruled clearly enough** | ⚠️ **One locus.** The boundary between *a governance record* and *the system-behaviour claims embedded inside it* is nowhere ruled. An acceptance verdict citing `33 passed · 0 failed` is a governance act **containing** an in-jurisdiction claim. No document says whether the claim inside travels into jurisdiction with the act that carries it. ⛔ Not answered here. |

---

## 8. Standing

```
JARVIS-KP-01 · ACT 4 — SUBSTRATE JURISDICTION / ADOPTION CENSUS ..... COMPLETE

Jurisdiction ....................................... system-behaviour claims (V1/V2/V3)
Governance acts in jurisdiction .................... ⛔ NO — never were
Enforcement architecture ........................... VALIDATOR, not requirer (ruled, #1054)
Required-submission classifier ..................... ⛔ NAMED IN DESIGN, NEVER BUILT
Adoption path ...................................... ⛔ none — 0 writers, 0 orientation mentions
Post-genesis records in subject domain ............. 68 of 177
Claim records authored post-genesis ................ 1
Outcome ............................................ A principally · C true as designed · E on one seam
Outcome D (bypass) ................................. ⛔ REFUSED WITH EVIDENCE
ACT 3 principal finding ............................ ⚠️ CORRECTED (§1)

⛔ .ain/ UNTOUCHED — no claim authored, no ledger row, no schema read as authority to write one
⛔ NO classifier built · NO mandatory claim creation · NO CI repair · NO enforcement design
⛔ NO frontmatter · registry · provenance ontology · V6 fill · transition-authority change

STOP CONDITION: census returned. Awaiting founder adjudication.
```

⭐ **What ACT 4 establishes.** The repository did not build a way for Jarvis to read authority and
then govern itself elsewhere. It built an **anti-inflation instrument for claims about the running
system**, correctly scoped it, deliberately declined to make participation mandatory, and named the
component that would do so as belonging somewhere else. Governance standing was never its subject.

⛔ **So JARVIS-KP-01's question is still open, and is now better posed:** governance standing has no
machine-readable substrate — not because one was built and abandoned, but because **the one that
exists was built for a different subject**, and the project's own axis discipline says that is
exactly the distinction not to collapse.

⚠️ **One thing worth holding before any grammar is designed.** The existing substrate's most
transferable feature is not its schema. It is that it **declares what a green run does not
establish**. Whatever comes next, that property is the one worth carrying — ⛔ and naming it here is
not authorization to carry it.
