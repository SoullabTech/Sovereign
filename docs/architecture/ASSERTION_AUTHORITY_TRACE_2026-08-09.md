# Assertion Authority — Read-Only Trace

**Date**: 2026-08-09
**Status**: **investigation complete · awaiting founder ruling · no code, spec, projection, loader, migration, or wiring changed**
**Requested by**: founder, 2026-08-09
**Trigger**: `docs/specs/APER_EPISTEMIC_PROJECTION_TABLE_2026-08-09.md` §7

---

## 1. The prose contract — provenance

### 1.1 Where it lives

`lib/maia/memoryAtomsLoader.ts:428-436`, inside `formatAtomsForPrompt`, rendered into every prompt that surfaces a practitioner observation:

> *"These are NOT statements of fact about the member — they are practitioner-witnessed observations with their own epistemic standing. Phrase accordingly: 'A practitioner observed…', 'It was noted in a session that…', 'A facilitator's impression was…'. Never collapse these into 'You are…' or 'You have…' without the member confirming it as their own truth."*

Paired with a per-record attribution function, `epistemicFraming` (`:496-506`), which maps all five `EpistemologicalStatus` values to attribution phrases — *"observed by a practitioner in session"*, *"reported by the member during a session"*, *"inferred from session patterns — provisional"*, etc.

And with a matching member-side rule (`:376-379`): *"These are **member-placed**, not system-inferred… each atom stands as the member declared it."*

### 1.2 When, and under what authority

| Commit | Date | Author | Message |
|---|---|---|---|
| `d7886fd75` | **2026-06-24** | **Kelly Nezat** | feat(rapport-pilot): With Me governed bridge + **epistemic provenance in atoms** |
| `21d172d36` | 2026-06-24 | Kelly Nezat | fix(atoms): add Selection rule to practitioner-observation block |
| `20e1b98fe` | 2026-06-24 | Kelly Nezat | test(atoms): maximal-salience Selection rule |
| `6df8b12d9` | 2026-06-24 | Kelly Nezat | fix(atoms): practitioner attribution guard — facilitator_id is canonical |

**Founder-authored, same day as the migration that created the vocabulary**, and reinforced three times within that day. The migration (`20260624000001`) states the same rule in its header as *"constitutional intent."*

**Status assessment**: this is **evidence of an existing semantic contract with founder provenance**, deliberately authored, tested, and defended. It is **not** filed in `docs/canon/` and has no ratification record, so per the instruction it is **not automatically canon**. It is a founder-authored operative contract awaiting a status ruling — §9 Q1.

### 1.3 It is not the only expression

Two further independent statements of the same invariant, in different subsystems, different words, no shared type:

- `lib/studio/leadership/situationTypes.ts:250` — *"Source: practitioner — observe for possible projection; treat as hypothesis-generating rather than confirmed fact."*
- `lib/studio/changes/changeTypes.ts:288` — *"Source: practitioner — hypothesis-generating, not confirmed fact."*

**Three independent prose expressions of one rule.** That is the signature of a constitutional capability that was never propagated into the typed architecture — each subsystem re-derived it locally.

### 1.4 One place it *is* typed

`lib/bookStudio/mirrorSources.ts:160-161` enforces authorship structurally in SQL:

```
AND facilitator_id IS NULL                    -- positive member-authorship marker
AND source_type <> 'practitioner_observation' -- belt-and-suspenders denylist
```

So the distinction **is** partly propagated — as an *exclusion* (keep practitioner material out of a member-authorship surface), never as a *graded permission*. That asymmetry is the shape of the gap.

---

## 2. What it governs, and which runtime paths receive it

`formatAtomsForPrompt` is the sole renderer. Four call sites:

| Call site | Path |
|---|---|
| `app/api/sovereign/app/maia/list/route.ts:859` | **the live main route** |
| `app/api/oracle/conversation/route.ts:2450` | oracle conversation |
| `app/api/between/chat/route.ts:1889` | Between |
| `lib/maia/roomComposition.ts:186` | vision-studio interview · now-what interview |

Downstream, the block travels as `atomsAddendum` through `maiaService` — reaching **FAST** (`:1246`) and **DEEP-repair** (`:2221`).

**Record classes governed**: `member_memory_atoms` only. Practitioner observations are partitioned from member-placed atoms by `sourceType`, then attributed per-record by `epistemologicalStatus`.

**Distinctions the prose makes**: author (practitioner vs. member) · attribution (required, with example phrasings) · observation vs. fact (explicitly) · inference (via `epistemicFraming` for `inferred`/`provisional`) · **and it forbids the collapse to factual assertion by name** (*"Never collapse these into 'You are…'"*).

It does **not** distinguish the *subject of the proposition* — see §4.

---

## 3. Runtime contradictions

Four found. None is a leak; all are authority defects.

**C1 — DEEP-primary does not receive the framing.**
`maiaService.ts:2215-2218` states the DEEP-primary `consciousnessOrchestrator` path *"remains unwired — observability-only there"* (per `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.C). The atoms addendum reaches FAST and DEEP-**repair**. On DEEP-primary the practitioner framing is absent. Whether practitioner content reaches that path by any other route was **not** established here and is the first thing to check if this is taken up.

**C2 — enforcement is model compliance, not structure.**
The invariant is an instruction. Nothing detects or prevents a response that says *"You are avoidant."* There is no post-generation check, no attribution assertion, no test that the rendered output preserved attribution. The strongest constitutional rule in this area is the least mechanically enforced.

**C3 — `authorityOf()` contradicts the prose.**
`lib/ain/portable/projectKeep.ts:343` returns `may_assert` for any non-derived, consent-open record. Under APER's Option D correction (`observed → declared`), a **practitioner observation would return `may_assert`** — precisely the collapse the prose forbids by name. The prose says *not* assertable as fact; the typed function says assertable. **The typed abstraction is strictly weaker than, and in conflict with, the prose contract.**

**C4 — four of five vocabulary values have no writer.**
`app/api/studio/with-me/sessions/[sessionId]/route.ts:141-150` is the only producer of practitioner atoms, and it writes **hardcoded literals**:

```
epistemological_status = 'observed'
primary_register       = 'witnessed'
registers              = ARRAY['witnessed']
```

`reported`, `claimed`, `inferred`, `provisional` have **no writer anywhere**. The five-value vocabulary is, in production, a one-value vocabulary. `epistemicFraming` has four unreachable branches.

**This substantially changes the 5→3 question.** The mapping was analysed as though five live categories needed projecting into three. In reality **one** value is produced (`observed`), plus `NULL` for member-placed atoms. The real live partition is **member-authored vs. practitioner-authored** — an *authorship* distinction, which is exactly the founder's diagnosis that authorship had been collapsed into epistemic status.

---

## 4. The authority matrix

Six cases × six distinctions. **P** = the proposition the record carries.

| # | Case | Representable in APER today? | May assert P | May assert *"A declared P"* | Contextual evidence | Inference input | Attribution required |
|---|---|---|---|---|---|---|---|
| 1 | Member declares P about self | **yes** — `authoredBy.ref === subject`, `about` empty | **yes** (as member statement) | yes | yes | yes | soft — P *is* the member's |
| 2 | Member declares P about another person | **NO** — indistinguishable from case 1 | **no** | yes | yes | **restricted** — third party has no consent here | **yes** |
| 3 | Practitioner declares/observes P about member | yes — `authoredBy.ref !== subject`, `role=practitioner` | **no** ← *the prose rule* | yes, with attribution | yes | yes, as hypothesis | **yes, always** |
| 4 | Practitioner declares P about own experience | **NO** — `subject` would be the practitioner; refused by scope guard | n/a | n/a | n/a | n/a | n/a |
| 5 | MAIA/system generates interpretation about member | yes — `derived` | **no** | **see F3 below** | yes | yes | **yes** |
| 6 | Impersonal registration of an event | **no producer exists** (§3 C4) | yes (that it occurred) | n/a — no author | yes | yes | method only |

**Cases 2, 4, and 6 are not representable.** Case 2 is the serious one: a member's declaration *about another person* projects identically to a declaration about themselves, because `about[]` is always empty for Keeps. **`about[]` being unpopulated is load-bearing for authority, not a cosmetic v1 gap.**

---

## 5. `authorityOf()` — caller blast radius

**Zero production callers.** Total references: 6, all within `lib/ain/portable/` (1 definition, 1 type, 4 in its own test file). `lib/ain/portable/` is untracked — created this session.

**Blast radius of changing it: nil.** Nothing in retrieval, prompting, presentation, or persistence consumes it.

**The consequential blast radius is elsewhere.** The live authority decision is made by `formatAtomsForPrompt` across the four call sites in §2. `authorityOf` is a *parallel, weaker, unused* re-derivation of a decision production already makes better.

**Chronology settles §7's question**: the prose predates `authorityOf` by ~6 weeks (2026-06-24 vs. 2026-08-09). `authorityOf` **postdates** it and was **not** an attempt to encode it — it was written from the APER spec alone, without consulting the existing contract. That is itself an instance of the Convenience-Representation Hazard operating on *rules* rather than data.

---

## 6. Falsification of the candidate invariant

> *"The system may assert that an identified author made a declaration without thereby gaining authority to assert the declaration's object as fact."*

Attempts drawn from existing AIN semantics, not hypotheticals.

**F1 — Vacuous where author = subject.** *"You said you were afraid of X"* and *"you were afraid of X"* are pragmatically near-identical for a first-person mental-state claim. **Not a falsification** — the invariant holds formally but does no work in case 1. Consistent with the prose, which imposes attribution only on the practitioner block.

**F2 — Attribution can carry the harm the rule guards against.** *"A practitioner observed you avoid intimacy"* is fully permitted, and a member may receive it as the claim. **Not a falsification, but proof of insufficiency**: the invariant governs epistemic authority, not relational impact. The existing prose already compensates with a separate rule — surface *"descriptive and invitational,"* never *"a verdict"* — which is a **different axis the invariant does not cover.**

**F3 — Self-attribution by the system collapses the distinction. ← the real one.** For a `derived` record the author *is* MAIA. *"I noticed you tend to…"* is formally an assertion of attribution and functions as an assertion of the object. When speaker and attributed author are the same, attributing adds no epistemic distance — **it manufactures it**. The invariant as written permits this.
**Required amendment**: *the system may not assert its own attributions as a means of asserting the object.* Attribution creates distance only when the author is someone other than the speaker.

**F4 — Attribution presupposes surfacing.** Asserting *"A declared P"* requires surfacing the record. If consent forbids surfacing, the invariant must not license the attribution. **Not a falsification**, but an ordering requirement: consent gates precede authority evaluation. `authorityOf` already orders correctly (`marked`/`visibility`/`circulation` first).

**F5 — Third-party consent (case 2).** *"You said your brother is manipulative"* is permitted by the invariant. The brother is not a member and never consented. **Not a falsification of the epistemic rule**, but it shows the invariant is silent on an axis AIN cares about.

**Verdict: the invariant survives, with one required amendment (F3) and two named insufficiencies (F2, F5).** It is necessary, not sufficient.

---

## 7. Minimum sufficient inputs

The founder's hypothesis was `f(epistemicStatus, author, subject, provenance/source, scope/context)`. Tested against the six cases:

| Input | Verdict | Evidence |
|---|---|---|
| `epistemicStatus` | **required** | separates 5 from 1/2/3 |
| `authoredBy.role` | **required** | separates 3 from 1 |
| `authoredBy.ref` vs `subject` | **required** | self-declaration vs. declaration-about-another; **computable from fields that already exist** |
| `about[]` | **required, currently unpopulated** | the only way to separate case 2 from case 1 |
| `visibility` / `circulation` / `marked` | **required** (gate, evaluated first) | F4 |
| `speakerIsAuthor` | **required, not currently derivable** | F3 — the system must know whether *it* is the attributed author |
| `provenance` / `source` | **not required** for the verdict | `sourceType` adds nothing once role and status are known; §3 C4 shows it is currently a proxy for role |
| `scope` / `context` | **not required** for the verdict | already handled as a refusal gate upstream, not a permission input |

**Minimum sufficient set (6)**: `epistemicStatus` · `authoredBy.role` · `authoredBy.ref` vs `subject` · `about[]` · consent triple · `speakerIsAuthor`.

Two of the six are **absent today**: `about[]` is never populated, and `speakerIsAuthor` has no representation.

**`authoredBy.role` alone is confirmed insufficient** — the founder's caution was correct. It cannot separate case 1 from case 2 (same role, different object), which needs `about[]`.

**Assertion authority is derived, not stored.** Every input is either already on the envelope or computable from it. Nothing supports adding a stored authority field, and doing so would create a value that could drift from the facts it summarizes — a new laundering surface.

---

## 8. Smallest coherent correction

Ranked. **None performed.**

1. **Change `AuthorityVerdict` from an ordinal enum to a permission set.** The single verdict is the shape error: the six distinctions in §4 are **independent permissions**, not points on a scale. A record can permit attribution-assertion while forbidding fact-assertion — inexpressible today. This is the root fix and everything else follows.
2. **Amend the invariant per F3**: exclude self-attribution by the system.
3. **Populate `about[]`, or refuse to answer case 2.** Until subjects are representable, an authority function cannot distinguish declarations about self from declarations about others — and should return "insufficient information," not a permissive default.
4. **Represent `speakerIsAuthor`.** Derivable at evaluation time from the caller's identity; needs a defined home.
5. **Reconcile `authorityOf` with the prose contract, or delete it.** It currently contradicts production (C3) and has no callers. Deleting is cheaper than fixing if APER is not proceeding.
6. **Then, and only then**, the APER Option D projection change — which remains blocked, as ruled.

**Not proposed here**: unifying the three prose expressions (§1.3), fixing C1, adding output-side attribution enforcement (C2), or touching the with-me writer (C4). Each is a separate lane requiring its own authorization.

---

## 9. Questions requiring founder ruling

- **Q1 — Status of the prose contract.** Founder-authored 2026-06-24, thrice-reinforced, governing production, not in `docs/canon/`, no ratification record. Is it canon, operative-pending-ratification, or implementation detail? Everything downstream inherits this answer.
- **Q2 — C4.** Four of five `epistemological_status` values have no writer. Is the vocabulary aspirational (keep, await producers), or should it contract to what is produced?
- **Q3 — C1.** Does practitioner content reach DEEP-primary by any path? If yes, the framing is missing there and it is a live defect, not a wiring gap.
- **Q4 — F2/F5.** The invariant is silent on relational impact and third-party consent. Separate rules, or extend this one?

---

## 10. State

**Changed**: nothing. This document only.
**`projectKeep`**: unwired, 0 callers, 33/33 tests passing, unmodified.
**`authorityOf`**: unmodified, 0 production callers.
**APER projection, loader, migrations, prose blocks**: untouched.

The founder's framing is the finding this trace supports:

> *"Truth and assertability aren't identical. AIN doesn't necessarily need to decide whether the practitioner's observation is true. It needs to know what it can responsibly say given the evidence it possesses."*

Production already implements a version of that rule — in prose, founder-authored, unenforced structurally, and contradicted by the one typed abstraction that tried to restate it.
