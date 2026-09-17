# SPM · D9-A — ADJUDICATION RECORD

Bound to `docs/programme/SPM-D9_REPRESENTATION-BOUNDARY-CENSUS_2026-09-17.md`
@ `8b80ec21060a102ee2007d12f3182049c7c6ad43`.

**Adjudication only. ⛔ D9-B not begun. ⛔ No repair. ⛔ No implementation. Freeze is a founder act, not taken here.**

---

## 1 · SURVIVED

Distinctions the evidence did **not** break, with the strongest witness for each.

| Distinction | Standing | Witness |
|---|---|---|
| authority for one purpose ≠ authority for another | **ENFORCED, 3 independent instances** | `practitionerProjection` (no column to be reached by) · `CHECK (crossing_allowed = FALSE)` · `ask_authorization_acts` six-way binding + expiry in the claim predicate |
| interpretation ≠ member standing | **ENFORCED** | `developmental_observation_standing_events`: append-only, CAS, UNSET is zero events, owner not derived from the reading's owner |
| adoption ≠ authorship — **as acts** | **ENFORCED** | authorization names ONE EXACT VERSION; changed wording cannot change what an existing authorization permits |
| historical validity ≠ present standing | **ENFORCED on the confirmation path** | `refusedReason = 'withdrawn_by_member'`; *"Correction is not temporary disagreement."* Scoped exception: T-6 |
| knowledge ≠ representation authority | **survives at admission only** | ENFORCED by `not_registered_for_room` / `memberAboutAllowed` / `inferenceCap`; see §2 for where it fails |
| first-person drafting ≠ member authorship | **survives as a gate** | no wording enters the Work without an authorization row; see §2 for the artifact |

---

## 2 · FALSIFIED

Not *"the norm is wrong."* **The organism does not represent these, and at three sites inverts them.**

| Claim under test | Verdict | Evidence |
|---|---|---|
| The candidate ladder is a single spine | **FALSIFIED** | `pdc-1` separates `authoredBy` / `participationClass` / `authority` by ruling, explicitly against the prior scalar. Same rung, opposite authorship and weight: `retrieved.conversational_recall` (member/situate) vs `retrieved.relationship_memory` (system/infer) |
| INQUIRY is a rung | **FALSIFIED** | `ask_authorization_acts` is a capability — bound, expiring, single-use, claim and completion as separate positive facts, no stored `interrupted` |
| CONFIRMATION and ADOPTION are one rung | **FALSIFIED** | disjoint tables, vocabularies, refusal families, consumers |
| MEMBER-STANDING CLAIM is a rung | **FALSIFIED** | it is an append-only event log; `investigate` was excluded *because it is a different axis* — the same objection, already ruled once, in code |
| PURPOSE-SPECIFIC REPRESENTATION is a terminus | **FALSIFIED** | every ENFORCED boundary decides **at its own reach** — an absent column, an unwritten join, an always-false CHECK, a claim predicate that yields no row. None is downstream of anything |
| knowledge ≠ representation authority, **at representation** | **FALSIFIED** | `render.ts` emits `p.text` only. The axes govern admission and are absent at the boundary they would matter at |
| repetition ≠ confirmation | **INVERTED** | Cut-1: `recall_count` (system retrieval) max 0.10 vs `confirmed_by_user` max 0.0225 — ≈4.4× the wrong way |
| persistence ≠ adoption | **INVERTED at the atoms loader** | `member_response_status IS DISTINCT FROM 'rejected'` — never-confirmed and confirmed satisfy it identically. Persisting *is* surfacing |
| adoption ≠ authorship, **at the artifact** | **FALSIFIED** | `manuscript_draft_sections` has no authorship column. The organism can prove *that* the member authorized the wording and cannot say, from the book, *whose wording it is* |

---

## 3 · NEWLY REQUIRED

States and axes the evidence demands and the candidate model does not contain.

1. **WITHDRAWAL** — `valid_to`, `'rejected'`, `'dismiss'`, `declined_at`, `withdrawn_by_member` are all real and ENFORCED where reachable. A monotonic ladder cannot express a member taking something back.
2. **REFUSAL, with its unprovable middle** — `BoundaryOutcome` excludes `minted` from its refusal arm *by type*; `MintOutcome` distinguishes `attempted` from `crossed` — *a crossing MAY have occurred and was not confirmed.* The model needs a position for *nothing crossed* and a separate one for *we cannot prove it did not*.
3. **PURPOSE / CONSUMER as a dimension of consent** — not a property of material. Every conversational gate is ON/OFF (`conversational_recall_enabled`) or MODE (`return_preference`); none is keyed to a consumer. P-1 is what that absence costs.
4. **WARRANT BOUND TO AN EXACT OBJECT** — not to a standing. New wording requires a new authorization; conviction is irrelevant. `manuscript_revision_authorizations` is the witness.
5. **THE SEPARATION OF RETRIEVAL WARRANT FROM REPRESENTATION WARRANT** — forced by §5 below, and not yet cleanly evidenced. This is D9-B's target.

---

## 4 · UNKNOWN

| # | Question | Why it matters here |
|---|---|---|
| K1 | Are the retrieval-warrant cases (E1/E2/E3) warrants over **reach** or over **representation**? | The census cannot separate them. §5's ruling rests on two cases that can |
| K2 | Is X10 (`borrowed_first_person`) evidence about the live organism, or only about what its designers concluded when they looked at this question directly? | It is the sharpest discriminator and it sits in an unawaited, env-gated, allowlisted shadow |
| K3 | Are T-6 and S-2 operative or latent in production? | No database read was performed. Both remain repository facts only |
| K4 | Is `vision-studio/interview` member-reachable? | Decides whether P-1 is one room or two |
| K5 | Did the unrecorded D9-A charter impose obligations beyond §§A1–A6? | The charter is not in the repository |

---

## 5 · THE RULING ON THE QUESTION PUT

> *Does the evidence support representation as a terminal level of epistemic authority, or does
> representation require an independent, purpose-bound warrant regardless of how strong the
> underlying epistemic standing becomes?*

### 5.1 · The terminal-level reading was tested first, and it has real support

Three sites behave exactly as a terminal-level model predicts: the recall consents are single
booleans, so standing-once-established flows to every consumer (P-1); the atoms loader treats
persisted material as surfaceable (X9); and the Writer's Studio revision path does run as a clean
ladder (§9.8). **This is not a strawman — it is how much of the organism actually behaves.**

### 5.2 · What defeats it

**Every one of those three sites is a site the census found ungoverned or scope-confined.**
P-1 is the purpose-travel defect. X9 is the finding that confirmation confers no standing.
§9.8's ladder is confined to one room and terminates in a **mutation**, not a representation.

Against that, **every deliberately governed boundary in the organism is a warrant**, and two of
them are decisive because the knowledge in question is already lawfully and fully held:

* **E4 — adoption.** MAIA authored the offer and lawfully holds the text. Placing it in the Work
  requires a separate authorization naming **one exact version**. Strengthening standing does
  nothing; *changing the wording voids the authorization.* Warrant is bound to object and act,
  never to conviction.
* **X10 — `refuseBorrowedFirstPerson`.** The refusal fires on lawfully derived content
  **"even when metadata is honest."** This is representation refused *at maximal epistemic
  standing*, on the ground of how it would be voiced. A terminal-level model has no way to
  produce this refusal at all.

And the inverse case is as strong: **E1** withholds the client's own material — the highest
possible epistemic standing, member-authored, member-owned, present, valid — from a practitioner,
structurally. If representation were terminal on standing, E1 could not exist.

### 5.3 · Ruling

**The evidence supports the second reading. Representation requires an independent warrant.**
It does not support representation as a terminal level of epistemic authority.

**⚠️ Supported, not yet decisive, and the gap is named.** Of the cases that defeat the terminal
reading, **E1/E2/E3 are warrants over reach** — they may be evidence about retrieval, not
representation (K1). The two that cleanly separate held-knowledge from permission-to-represent
are **E4** and **X10**, and X10 lives in a shadow (K2). *One live discriminator and one shadow
discriminator is enough to rule and not enough to constitutionalize.*

**⛔ Therefore: this ruling is adjudicated, not ratified as canon.** Constitutionalizing it
requires D9-B to survive §6.3.

---

## 6 · REVISED BOUNDARY HYPOTHESIS

### 6.1 · The hypothesis

> **Epistemic standing and representational warrant are independent axes.**
>
> **Standing** answers *how well is this known, and on whose authority.* It is monotonic, it can
> strengthen, it travels with the material — and **it never terminates in permission.**
>
> **Warrant** answers *may this be placed here, now, for this purpose.* It is non-monotonic,
> purpose-bound, object-bound, time-bound and single-use — and **it confers no standing.**
>
> No quantity of standing produces a warrant. No warrant improves standing.

### 6.2 · Corollaries the evidence already supports

| # | Corollary | Witness |
|---|---|---|
| C1 | A warrant is bound to *(actor, purpose, exact object, time)* — never to material | `ask_authorization_acts`; `manuscript_revision_authorizations` |
| C2 | Warrants do not compose | T-8: the offer records the **reading** warrant; there is no second field for representing |
| C3 | Withdrawal and refusal are **warrant-side**, not standing-side | §3.1, §3.2 |
| C4 | Standing may travel with material; a warrant must not | P-1 is what happens when it does |
| C5 | A refusal is not an occasion to disclose | `minted` excluded from the refusal arm by type; `reading_unknown` conflates "not yours" with "does not exist" |
| C6 | The organism governs **crossings**, not products | T-9: enforced at the act, absent at the artifact |

### 6.3 · What D9-B must attack

⛔ Not a list of repairs. The falsifiers the revised model must survive.

1. **The K1 discriminator.** Build the case that separates retrieval warrant from representation
   warrant: knowledge already lawfully held, representation independently refused, **live, not in
   a shadow.** If no such case can be constructed against the organism, C2 collapses and the two
   are one warrant at two reaches.
2. **The E4 generalization.** E4 governs a *mutation of an artifact*. Attack whether it
   generalizes to *speech*, or whether the Writer's Studio governs a different kind of act
   entirely (census Q6). If it does not generalize, the hypothesis is true of Works and unproven
   of conversation — which is most of MAIA.
3. **The X10 promotion.** Determine whether `borrowed_first_person` is a representation law or a
   rendering convention that happens to be enforced. If the latter, the ruling loses its sharpest
   witness.
4. **The terminal-level defence, run properly.** Try to save the terminal reading by arguing that
   E1/E2/E3 are *scope* and E4 is *mutation*, so nothing in the organism actually refuses
   representation at high standing. **If that argument wins, §5.3 is withdrawn.**
5. **Monotonicity.** Attack C3: find a site where withdrawal or refusal is represented on the
   standing axis rather than the warrant axis. One would break the clean split.

---

## 7 · STANDING

```
D9-A CENSUS        ✅ COMPLETE
D9-A ADJUDICATION  ✅ DELIVERED — survived · falsified · newly required · unknown · revised hypothesis
RULING ON Q        ✅ INDEPENDENT PURPOSE-BOUND WARRANT — adjudicated, ⛔ NOT constitutionalized
D9-A FREEZE        ⛔ NOT TAKEN — founder act
D9-B               ⛔ NOT BEGUN — targets fixed at §6.3
F5                 ⛔ HOLD
SPM                ⛔ CLOSED
REPAIR             ⛔ NOT AUTHORIZED
PRODUCTION         ⛔ UNTOUCHED — no database read, no runtime observation
SOURCE             ⛔ UNCHANGED
```

> *Standing is earned and accumulates. Warrant is granted and is spent.
> The census found an organism that enforces the second wherever it was designed,
> and assumes the first wherever it drifted.*

**STOP.**
