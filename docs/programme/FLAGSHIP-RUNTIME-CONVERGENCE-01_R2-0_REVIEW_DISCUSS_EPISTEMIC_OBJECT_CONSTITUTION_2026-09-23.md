# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-0 — Review Discuss Epistemic-Object Constitution

**Date**: 2026-09-23
**Act**: R2-0 (founder-authorized after R1-2 PASS · CLOSED @ `829a3e225` and R1-2A CLOSED @ `ed8510aa9`)
**Starting head**: `ed8510aa9` on `fix/flagship-ec1-contract-reconciliation-20260923` · **freshness merge** of canonical `840194ba8` → `0ac39341f` (one canonical document, zero product delta, zero overlap with FS3 / R1-2 / R1-2A / flagship / manuscript / disclosure / contract / witness surfaces) · **R1-2 semantic authority** `829a3e225` preserved · **FS3** `9682dda96` governing
**Lineage**: merge `0ac39341f` → suite `e3f651adc` (RED: reference 1/18, 15 candidates cannot load) → contract + record (this commit)
**Nature**: a constitution and NON-EXECUTING boundary-contract act. ⛔ No Review Discuss runtime · no model/provider traffic · no thread creation · no capability moved (`discuss` stays `false`) · no schema · no FS4 · production untouched. ⛔ STOPPED for founder adjudication. R2-1 and R2-2 NOT opened.

## 0. Standing at the top

The repository can now answer, structurally and constitutionally, the nine stop-boundary questions of §XXIV (see §11). The answers are typed in `tests/constitutional/writers-studio/flagship-r2-0/contract.ts` (imported by nothing in `app/`, `lib/`, `components/` or `middleware.ts`) and proved by a suite whose type-level laws compile ILLEGAL objects against the contract and hold only when the compiler refuses them. **18/18 laws · 15/15 defeat candidates dead · LETHAL + DISCRIMINATING.**

The central anti-collapse law (§IV) is now the shape of the object: `recoverEvidence` (what the reader actually read, digest-verified) ≠ `locateCurrent` (does the live section still match the frozen digest) ≠ loading current Work prose (what is in the Work now). No one may masquerade as another; no runtime may satisfy missing historical evidence by reading current prose; no runtime may claim then-versus-now without possessing both objects distinctly; `current` location status is never proof that current prose has entered cognition.

## 1. The epistemic object (§II)

What is MAIA discussing when a writer discusses a durable Review finding? The exact reading-local finding, at a declared temporal posture, with what the original reader saw held apart from what the Work says now:

```text
durable finding  +  passage as read  +  relationship to passage as it now is
```

Those components never enter cognition together by default. The lawful postures are distinguished by SHAPE, and an omitted posture is not a member of the Review Discuss object type at all.

## 2. The three postures (§III) — typed, not aliased

| Posture | Object | Law | Standing |
|---|---|---|---|
| **A · `AS_READ`** | durable finding + digest-verified historical evidence | historical evidence REQUIRED · finding REQUIRED · current-location state MAY be declared (as provenance metadata) · current prose FORBIDDEN (`now?: never`) | inherits the developmental path's *no current-text substitution*, now explicit R2 law |
| **B · `THEN_VS_NOW`** | durable finding + digest-verified passage as read + separately loaded, separately authorized passage as it now is | THEN and NOW both REQUIRED and distinct by role; current prose never replaces historical evidence; historical evidence never represented as current | **ratified as lawful ontology · ⛔ not runnable substrate** — retrieval, disclosure crossing, prompt composition and runtime belong to later acts |
| **C · `CURRENT_TEXT_ONLY`** | current manuscript passage, no finding as governing object (`finding?: never`) | recognized category, **⛔ OUTSIDE Review Discuss**; belongs to current-passage cognition (C1C1 or a later governed successor) | the boundary rejects or hands off explicitly (`admitReviewDiscuss` → `handOff: 'current-passage-cognition'`); it may never silently perform it |

If current prose enters an `AS_READ` act, the act is invalid. The type makes it impossible to construct.

## 3. Temporal state law (§V)

`CurrentLocation` (`current | superseded | unmeasured`, digest-based, whole-section granular) is accepted as constitutional input. It is not prose, not a reread, not an assessment. **It never escalates posture**: `postureUnderLocation(declared, location) === declared` for all nine combinations. `AS_READ + superseded` is still `AS_READ` (disclose that the location differs, if lawfully surfaced; do not load current text). `AS_READ + current` does not assume current prose entered cognition. `THEN_VS_NOW` requires its own lawful admission of current prose. ⛔ No automatic `AS_READ → THEN_VS_NOW`.

## 4. Finding identity and thread binding (§VI, §VII, §XIII)

Ratified: the binding identity of the finding under discussion is `{ on: 'observation', readingId, observationKey }` — the address the substrate already carries (`AskAnchor`'s observation member; `ask_authorization_acts` keyed by `(reading_id, observation_key)`; standing events on the same reading-local identity; `ask_threads_no_repoint` freezing anchor and reading identity). A thread opened against `reading=A · o7` remains about `reading=A · o7` for its lifetime; a newer reading, a similar observation, a reread of the same section, a revision elsewhere, or changed current text is a **different epistemic object** requiring a new binding. The contract exports no repoint, migrate or rebind; `bindThread` returns a frozen binding.

**`observation_id`** is provenance identity only, not member-action or thread-binding authority. This remains governed by `WRITERS-STUDIO-OBSERVATION-ADDRESS-01` (established, never opened for execution; `observation.standing.by-id` gated in the capability registry; `observation_id` not unique-enforced in the database). R2-0 does not modify that lane and confers no R3 member-action authority.

## 5. Input classes and the mixed-input crossing law (§VIII, §IX)

The current receipt vocabulary (`source_class = work`, `authorized_by = member`) and the provider-governance capability table cannot distinguish MAIA's prior developmental output from member text; the developmental Ask route already sends the frozen observation text to cognition with receipts minted only for Work sections. R2-0 constitutes three semantic input classes and requires the crossing to declare every one actually entering cognition, by role and authorship:

| Class | Meaning | Role(s) | Authored by |
|---|---|---|---|
| `MEMBER_WORK_TEXT` | member-authored Work prose — the recovered historical excerpt AND current prose, when lawfully admitted; member material even when retrieved from an immutable revision; requires the applicable member-disclosure authority | `THEN`, `NOW` | member |
| `DURABLE_READING_OUTPUT` | MAIA's prior developmental cognition preserved in the durable reading (the finding text, its `doesNotEstablish`, its lens); not member text; never receipted as if the member wrote it; nevertheless declared | `FINDING` | maia |
| `READING_PROVENANCE` | reading identity, observation key, evidence refs, revision identity, digests, code-point bounds, input fingerprint, current-location classification | `PROVENANCE` | system |

`AS_READ` crosses `FINDING + THEN + PROVENANCE`; a future lawful `THEN_VS_NOW` crosses `FINDING + THEN + NOW + PROVENANCE` with THEN and NOW distinguishable by role. ⛔ No implementation may mint a receipt saying merely `source_class = work` while a finding rides along undeclared. R2-0 constitutes this law and does not mutate provider-governance or disclosure runtime.

## 6. Relationship to the developmental Ask and to C1C1 (§X–§XII)

**Closest prior ontology: the developmental Ask path**, which already carries observation anchoring, historical evidence recovery, authorization acts, disclosure receipts, non-repointing reading identity and the prohibition on current-text substitution. R2-0 uses it as precedent; it does not declare that runtime to be Review Discuss, and future acts must prove which pieces may lawfully be reused.

**Correction to R1-2A carried context.** R1-2A §10.14 input 3 (record at `ed8510aa9`) conflated the S3 developmental-Ask path with C1C1. C1C1 is the **editorial-runtime** seam: thread open via `POST /api/writers-studio/rebuild/editorial/thread` and turn via `POST /api/writers-studio/editorial/turn`, a held current passage, version-checked at open, `expectedText` frozen on the proposal chain, no reading identity, no S3 authorization act, no disclosure receipt, neither boundary value. The developmental Ask path separately carries the S3 authorization-act and disclosure-receipt machinery. The closed R1-2A record is preserved unaltered; **this is the governing correction for subsequent R2 work.** It is also typed, so it cannot drift back into prose: `SEAMS.C1C1 = { seam: 'editorial-runtime', carriesS3AuthorizationAct: false, carriesDisclosureReceipt: false, carriesReadingIdentity: false }`; `SEAMS.DEVELOPMENTAL_ASK` the reverse; candidate D13 (the conflation) dies on L13.

The schema already separates the ontologies: `ask_threads_one_subject` (exactly one of `anchor`, `proposal_chain_id`) and `ask_threads_editorial_has_no_reading`. An editorial thread cannot carry a reading; an observation-anchored thread cannot be editorial. **Reuse plumbing where lawful; do not reuse ontology by convenience.**

**Founder ruling (§XII): Review Discuss is its own cognition act.** Not C1C1 with a finding attached. Its governing subject is the exact durable reading-local finding; its temporal posture determines what manuscript text cognition may receive; infrastructure may be reused later only where contracts are proven compatible. Typed as `SEAMS.REVIEW_DISCUSS = { ontology: 'own', isC1C1WithAFindingAttached: false, closestPriorOntology: 'DEVELOPMENTAL_ASK' }`.

## 7. Discussion does not mutate the reading (§XIV, §XV)

Conversation about a durable finding does not itself modify that finding, its reading, or any standing. A turn may question · clarify · contest · explore meaning · compare (compare only in `THEN_VS_NOW`). It does not delete or rewrite the finding, change standing, record agreement or disagreement, create a member observation, supersede the reading, commission a reread, or repoint the thread — `CONVERSATIONAL_EFFECTS` is frozen with every entry `false`. **The disagreement law is NOT ratified here**; it is carried explicitly as R3 governance (*evidence may revise a reading · disagreement does not delete it · disagreement does not automatically win*). R2-0 establishes only that conversational disagreement has no durable effect by itself. The durable semantics of "I agree" · "I don't see this" · "Here's what I meant" · "My own observation is…" remain unopened.

## 8. The typed boundary contract (§XVI, §XVII)

`tests/constitutional/writers-studio/flagship-r2-0/contract.ts` — non-executing; imports nothing; imported by nothing in runtime (L16 proves both); no route, provider, persistence or UI connection. A discriminated union, not optional fields: `ReviewDiscussObject = AsReadObject | ThenVsNowObject`; `CurrentTextOnlyObject` is a separate recognized type admitted to the boundary only so it can be refused explicitly. Brands (`ReadingId`, `ObservationKey`, `SectionId`, `Sha256`) stop a test passing one identity for another. Pure declarations: `admitReviewDiscuss`, `declareCrossing`, `postureUnderLocation`, `threadKeyOf`, `bindThread`, `sameSubject`, `actAdmissible`, `CONVERSATIONAL_EFFECTS`, `SEAMS`. ⛔ No runtime validator, no retrieval, no prompt assembly — the point is to type the law before building the machine (the S3 B-i precedent).

## 9. Suite, defeat candidates, lethality (§XVIII)

**Suite first**: `e3f651adc` landed L0–L17, fifteen wrong-contract candidates and eleven illegal fixtures on `0ac39341f`; reference **1/18** (only L17 product-unchanged), 15/15 candidates unable to load. After the contract: **reference 18/18 · 15/15 dead · LETHAL + DISCRIMINATING** (`npm run matrix:ws-flagship-r2-0`).

| Candidate | Dies on | Classified collateral (irreducible) |
|---|---|---|
| D1 posture omitted → `posture?:` | L1 | — |
| D2 AS_READ accepts current prose in the evidence slot | L2 | — |
| D3 AS_READ carries optional `now` | L3 | — |
| D4 THEN_VS_NOW `then?:` | L4 | — |
| D5 THEN_VS_NOW `now?:` | L5 | — |
| D6 THEN and NOW in one `text` field | L6 | L0: the lawful object (distinct THEN and NOW) cannot be expressed against a collapsed type — refusing it IS the collapse |
| D7 CURRENT_TEXT_ONLY admitted as Review Discuss | L7 | — |
| D8 anchor carries `observationId`; key uses it | L8 | — |
| D9 mutable anchor + `repointThread` | L9 | — |
| D10 finding classified `MEMBER_WORK_TEXT` | L10 | L12: two classes where three enter — the hidden class IS the misclassification |
| D11 member prose classified `READING_PROVENANCE` | L11 | L12: same |
| D12 crossing declares only `work` | L12 | L6 · L10 · L11: hiding inputs is one error with three observable absences |
| D13 `SEAMS.C1C1` carries S3 act + receipt | L13 | — |
| D14 contest records disagreement and changes standing | L14 | — |
| D15 AS_READ + superseded → THEN_VS_NOW | L15 | — |

**How the type-level laws kill.** Each illegal fixture (`fixtures/illegal/f01…f11`) imports `@r2-0/contract`, which the matrix binds to the subject's contract file through a generated `tsconfig` `paths` entry; the law holds iff `tsc` reports ≥ 1 diagnostic in that fixture, and L0 requires the contract and the lawful fixture to report 0. A wrong contract that admits the illegal object compiles it, and dies.

**⚠️ Two instrument defects, found by the matrix and repaired before any candidate was credited.** (1) The generated `tsconfig` lived outside the repository, so `types: ["node"]` could not resolve, `tsc` aborted with a global TS2688 before checking any file, and every illegal fixture reported zero diagnostics — while L0 read that silence as a pass. Repaired by pinning `typeRoots` to the repository and making L0 and every type-level law FAIL on any file-less diagnostic: *an instrument that never ran must never read as green.* (2) Type-level candidates replaced one type but re-exported the reference's boundary functions typed over the reference's types, so the lawful fixture failed against every such candidate on signature mismatch — an artifact of candidate construction, not a consequence of the constitutional error. Repaired by candidate isolation: each wrong contract carries its own boundary functions over its own (wrong) types; L6 narrowed to role distinctness (L11 owns the class). Only then were the three remaining collaterals classified.

`npm run typecheck:ws-flagship-r2-0` (strict + `noUncheckedIndexedAccess`; illegal fixtures excluded by design; zero product files in the graph): **PASS**.

## 10. Closing proof (§XXI)

| Proof | Result |
|---|---|
| R2-0 constitutional laws | 18/18 GREEN |
| R2-0 defeat candidates | 15/15 DEAD, collateral classified |
| typed boundary contract strict typecheck | PASS |
| runtime import count | 0 (L16: contract imports nothing; nothing in `app/ lib/ components/ middleware.ts` imports `flagship-r2-0`) |
| runtime behaviour diff | ZERO (L17: `git diff --stat ed8510aa9 HEAD -- app lib components database middleware.ts` empty) |
| FS3 | UNCHANGED (`verify:flagship-freeze` exit 0, 102/102) |
| product blobs | UNCHANGED |
| production | UNTOUCHED |
| ancestry | `840194ba8` · `ed8510aa9` · `829a3e225` · `9682dda96` all in ancestry of the R2-0 head |
| `check:design-canon` (tree and `--branch`) · `ci:sovereignty` · `check:no-supabase` · `check:no-openai` · `npm run typecheck` (ship) · `git diff --check` | see §12 |

No browser or runtime witness was manufactured: there is no R2 runtime to witness.

## 11. The stop-boundary questions (§XXIV), answered by the repository

| Question | Answer | Where |
|---|---|---|
| What finding is being discussed? | exact `(readingId, observationKey)` | `FindingAnchor`, `threadKeyOf`, L8 |
| At what temporal posture? | `AS_READ` / `THEN_VS_NOW` / `CURRENT_TEXT_ONLY`, declared, never omitted | `Posture`, the union discriminant, L1 |
| What did the original reader actually see? | digest-verified historical evidence | `HistoricalEvidence` (`verified: 'digest-verified'`, revision + section digests), L2, L4 |
| Has the section changed? | `CurrentLocation` metadata | `ReadingProvenance.location`, L15 |
| Is current prose entering cognition? | only under an explicitly lawful posture | `now?: never` on `AS_READ`; `now` required on `THEN_VS_NOW`; L3, L5, L15 |
| Whose material is each input? | declared input classes by role and authorship | `declareCrossing`, L10–L12 |
| Can the discussion migrate to another finding? | no | frozen `ThreadBinding`, no repoint export, L9 |
| Can discussion itself alter the reading? | no | `CONVERSATIONAL_EFFECTS` all false, L14 |
| Is `CURRENT_TEXT_ONLY` Review Discuss? | no | `admitReviewDiscuss` → hand-off, L7 |

## 12. Gates on the R2-0 head

Recorded in the closing commit message and reproduced here after the run: R2-0 matrix LETHAL · R2-0 typecheck PASS · `verify:flagship-freeze` exit 0 · design-canon GREEN (tree and branch scope) · `ci:sovereignty` GREEN · `check:no-supabase` GREEN · `check:no-openai` GREEN · ship typecheck 0 regressions · `git diff --check` clean.

## 13. Not authorized, not done (§XXIII)

Discuss button activation · `discuss=true` · thread creation or persistence · provider calls · prompt construction · current-text loading for Review · historical evidence retrieval at runtime · `THEN_VS_NOW` runtime · `CURRENT_TEXT_ONLY` runtime · Ask MAIA · reread · commissioning · member observations · agreement/disagreement persistence · Keeps · standing writes · schema migration · FS4 · deployment · production mutation. The disagreement law is unratified (R3). `OBSERVATION-ADDRESS-01` unmodified.

**Standing: R2-0 ✅ CONSTITUTED · TYPED AT THE BOUNDARY · MATRIX LETHAL · NON-EXECUTING · FS3 GOVERNING · R1-2 @ `829a3e225` · R1-2A @ `ed8510aa9` · STOPPED for founder adjudication. Next possible act: `R2-1 — PURE REVIEW DISCUSS ACT CONTRACT`, unopened.**
