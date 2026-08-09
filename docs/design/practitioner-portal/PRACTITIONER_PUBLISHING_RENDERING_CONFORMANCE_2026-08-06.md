# Practitioner Publishing — Rendering Conformance Specification & Test Matrix (candidate)

**Status: CANDIDATE — design only.** ⛔ No schema, no migration, no code, no route. The last
enforcement surface before implementation could honestly begin, per founder direction 2026-08-06.

Companion to
[`…EVENT_SPECIFICATION…`](PRACTITIONER_PUBLISHING_EVENT_SPECIFICATION_2026-08-06.md) §3 and §8.4.

---

## 0. The gap this closes

Every check built so far inspects **rows**. None can see this:

```
Canonical fact:   Larry attested that he heard Kelly say X.
Rendered:         You said X.
```

⭐ **The row is valid. The authority violation is in the sentence.** Schema constraints, permission
checks, the write-time refusal list, and the Co-Lab boundary gate all pass. The member reads a
declaration they never made, attributed to themselves, produced by a system that recorded the
distinction correctly and then discarded it at the last inch.

> ⭐⭐⭐ **A rendering that asserts more than the canonical fact is a defect, not copy.**

This document makes that testable.

---

## 1. Enforcement architecture — the precondition

⚠️ **Conformance is untestable unless rendering is a pure function.** If event sentences are
assembled inline across components, there is no surface to assert against, and the suite degenerates
into "some text appeared."

**Required shape:**

```
renderEvent(event, viewer, redactionState) -> RenderedFact
```

- **Pure** — no I/O, no current-state lookup. It reads the row, ⛔ never the world. (A renderer that
  re-derives authority at read time reintroduces exactly the retroactive-authorization failure the
  `authority_snapshot` closes.)
- **Total** — every `(act, viewer)` pair in the vocabulary resolves to a registered template or
  throws. ⛔ No fallback string, no `default:` branch, no `?? ''`.
- **Sole path** — a static check asserts no component composes publishing-event prose outside the
  renderer. ⛔ String concatenation of a party name with an act verb anywhere else is a violation.
- ⭐ **Deterministic** *(founder, 2026-08-06)* — **referentially transparent.** The same inputs
  produce the same sentence, always. ⛔ Not a function of: current time · locale defaults · feature
  flags · model output · network state · user preferences · experiment assignment · rollout cohort.

⭐ **Why determinism is a constitutional property, not a quality bar.** If identical inputs can
produce a different sentence tomorrow than today, rendering becomes a laundering surface in its own
right: the assertion that passed at test time no longer describes what the member reads, and no
audit of the row can recover what was actually said to them. A conformance suite over a
non-deterministic renderer proves nothing.

Practical consequence: ⛔ **no relative time in a fact sentence.** "3 days ago" is a function of
*now*; `{date}` is a function of the row. Relative time may appear as a **separate, non-fact
affordance** beside the sentence — ⛔ never inside it.

⭐ These four are not a testing convenience. They are the only architecture in which the prohibition
can be enforced rather than reviewed.

## 2. Template grammar

Every rendering is produced from a **registered template**: a fixed skeleton with typed slots.

**Permitted slots** — `{party}` (display name) · `{title}` (Work/Arrangement title) · `{date}` ·
`{count}` *(only where §5.C permits)*.

⛔ **Forbidden in every template:**

| Forbidden | Why |
|---|---|
| free interpolation of member or practitioner **prose** into a fact sentence | the sentence would assert whatever the text says |
| a second-person verb of speech or declaration for an act the viewer did not perform | the author-swap laundering path |
| any predicate the canonical fact does not contain | overclaim by construction |
| conditional text keyed on **absence** of a row | invented condition |
| pluralization or aggregation across members | statistical judgment (**N8**) |

⭐ Templates are **literal**, not generative. Conformance asserts the exact skeleton, not that a
match exists somewhere in the output.

### ⭐⭐⭐ The consequence worth stating outright

> **A language model may never be the final author of a historical fact.**

Fixed skeletons with typed slots make this structural rather than a policy anyone must remember.
MAIA may draft surrounding prose, summarize a document, or hold the conversation — ⛔ but the
mechanism that states **what happened, to whom, on whose authority** is a registered template
reading a row, and nothing else.

The reason is not distrust of the model's fluency; it is that a generated sentence has **no
authority instance**. It cannot be checked against `authority_snapshot`, it cannot be reproduced
from the row, and it inherits its apparent authorship from whatever surface it appears on. ⭐ This
generalizes well past Practitioner Publishing: *generation is for language, never for record.*

## 3. The binding table

Each event type binds to seven dimensions (founder-specified). `P` = practitioner, `M` = member.

### `placed` / `placement_withdrawn`

| | |
|---|---|
| **Canonical fact** | *P placed OBJECT@v into the commitment with M on DATE, as SHARE/RECOMMEND/ASSIGN* |
| **Practitioner rendering** | `You shared {title} with {party}` · `You asked {party} to work with {title}` (assign) · `You withdrew {title}` |
| **Member rendering** | `{party} shared {title} with you` · `{party} asked you to work with {title}` · `{party} withdrew {title}` |
| **Prohibited overclaims** | ⛔ `{party} assigned you…` rendered with any status · ⛔ "due" · ⛔ "pending" · ⛔ "awaiting your response" · ⛔ "new" as a state rather than a recency label |
| **Visibility** | both parties; ⛔ no third party |
| **Erasure rendering** | `{party} shared something with you on {date}` — ⛔ title omitted, ⛔ never a placeholder implying content |
| **Absent-state rendering** | n/a — a placement either occurred or has no row |

### `attested` ⭐ the highest-risk type

| | |
|---|---|
| **Canonical fact** | *P recorded that P heard M say STATEMENT on DATE* |
| **Practitioner rendering** | `You recorded: {party} told you …` |
| **Member rendering** | ⭐ `{party} recorded that you told him/them …` — **exact skeleton, mandatory** |
| **Prohibited overclaims** | ⛔ `You said …` · ⛔ `You declared …` · ⛔ `You confirmed …` · ⛔ `Your update:` · ⛔ any list header grouping attestations under "Your declarations" · ⛔ any MAIA utterance treating the statement as member-sourced |
| **Visibility** | both parties only |
| **Erasure rendering** | `{party} recorded something you told him/them on {date}` — statement erased |
| **Absent-state rendering** | ⭐ unconfirmed renders as **unconfirmed**, ⛔ never as disputed, ⛔ never as accepted |

### `taken_up` / `set_down`

| | |
|---|---|
| **Canonical fact** | *M declared they are working with / set down OBJECT@v on DATE* |
| **Practitioner rendering** | `{party} said they're working with {title}` · `{party} set {title} down` |
| **Member rendering** | `You're working with {title}` · `You set {title} down` |
| **Prohibited overclaims** | ⛔ "started" · ⛔ "in progress" · ⛔ "completed" · ⛔ percent · ⛔ streak · ⛔ any duration-derived state |
| **Visibility** | P only where P placed the object; otherwise member-only |
| **Erasure rendering** | tombstone: `A declaration was made on {date} and later erased` |
| **Absent-state rendering** | ⭐ **nothing, or `Nothing recorded`** — ⛔ never "not started" |

### `attestation_confirmed` / `attestation_disputed`

| | |
|---|---|
| **Canonical fact** | *M confirmed / disputed P's attestation E on DATE* |
| **Practitioner rendering** | `{party} confirmed this` · `{party} said this isn't right` |
| **Member rendering** | `You confirmed this` · `You said this isn't right` |
| **Prohibited overclaims** | ⛔ silence rendered as either · ⛔ confirmation of one attestation licensing "You said…" on another |
| **Visibility** | both parties |
| **Erasure rendering** | as `attested` |
| **Absent-state rendering** | ⭐ `Not confirmed` — a neutral fact about the record, ⛔ not about the member |

### `practitioner_visibility_withdrawn`

| | |
|---|---|
| **Canonical fact** | *M ended P's access to THREAD on DATE* |
| **Practitioner rendering** | ⭐ `{party} withdrew access` — ⛔ no content, ⛔ no title, ⛔ no reason, ⛔ no count of withdrawals |
| **Member rendering** | `You withdrew {party}'s access` |
| **Prohibited overclaims** | ⛔ any framing as a signal about the member ("{party} has been withdrawing more often") · ⛔ any prompt to the practitioner to ask about it |
| **Visibility** | ⭐ the **fact only** to P; full to M |
| **Erasure rendering** | the fact persists; ⛔ nothing to erase, because nothing was disclosed |
| **Absent-state rendering** | n/a |

### `work_authored` / `work_revised` / `work_ratified` / `work_deratified` / `arrangement_*`

| | |
|---|---|
| **Canonical fact** | *P authored / revised / ratified / de-ratified OBJECT@v on DATE* |
| **Practitioner rendering** | `You ratified {title}` · `{title} is no longer available to place` |
| **Member rendering** | ⭐ **none — not rendered at all.** The practitioner's authoring history is not the member's business |
| **Prohibited overclaims** | ⛔ "updated for you" · ⛔ any implication that a revision reached the member (**N10** — revision proves change, nothing more) |
| **Visibility** | P only |
| **Erasure rendering** | P-side only |
| **Absent-state rendering** | n/a |

### Custodial acts

| | |
|---|---|
| **Canonical fact** | *Custodian C acted under mandate MANDATE on DATE* |
| **Renderings** | ⭐ **none to either party.** Custodial log only |
| **Prohibited overclaims** | ⛔ appearance in the relationship's shared story in any form, including "system" entries in a timeline |
| **Visibility** | custodial log |

## 4. The four laundering paths

Each prohibition class closes a distinct route by which a valid row becomes a false sentence:

| Path | Mechanism | Closed by |
|---|---|---|
| **Wrong author** | attribution shifts from attester to subject | §3 `attested` exact skeleton |
| **Invented condition** | absence rendered as a state | §5 absent-state rules |
| **Statistical judgment** | counts rendered as norms | §2 forbidden slots + **N8** |
| **Leaked observation** | a row rendered to a party whose visibility excludes it | §6 visibility conformance |

## 5. Absence, counts, and unknown

**A. Absence.** ⭐ Where the member has declared nothing, the honest rendering is **nothing** or
`Nothing recorded`. ⛔ Forbidden: "not started" · "no response" · "not opened" · "awaiting" ·
"incomplete" · "0 of 3" · any empty-state illustration captioned with a member-state noun.

**B. Unknown ≠ negative.** `Not confirmed` describes the **record**. `Has not confirmed` describes
the **person**. ⭐ Only the first is permitted.

**C. Counts.** `{count}` is permitted only for a practitioner counting **their own acts**
("You've shared 4 things with {party}"). ⛔ Never for member acts, ⛔ never across members, ⛔ never
as a ratio, ⛔ never with a denominator.

## 6. Visibility conformance

Rendering conformance is also an **authorization** test. For every `(row, viewer)` pair where
`visibility` excludes the viewer, `renderEvent` must **throw**, ⛔ never return a redacted string —
a redacted string is still a disclosure that the row exists.

⭐ **Exception, and the only one:** `practitioner_visibility_withdrawn` renders the *fact* to the
practitioner by design. That is a disclosure the member's own act creates.

## 7. The mutation matrix

⚠️ **Not a snapshot suite.** Snapshots bless whatever the UI currently says — they would have
recorded "You said X" as the expected output. Each case below asserts against the **specification**,
and is written as a mutation the implementation must fail.

| # | Mutation | Concrete form | Why schema tests miss it | Assertion |
|---|---|---|---|---|
| **1** | ⭐ attestation as member declaration | member view of `attested` renders `You said X` | row is valid; only the string changed | member rendering **must match** `{party} recorded that you told …`; **must not contain** `You said` · `You declared` · `You confirmed` · `Your update` |
| **2** | absence as state | no `taken_up` row → `Not started` | there is no row to be invalid | for zero rows, output ∈ {∅, `Nothing recorded`}; forbidden-substring set on the whole surface |
| **3** | count as norm | `2 of 5 clients took this up` | rows all valid individually | ⛔ no template accepts a denominator or a cross-member set; renderer rejects a member-act array spanning >1 member |
| **4** | wrong-party disclosure | `attested` row rendered to a third practitioner in the Co-Lab | permission layer passed a *list* filter | `renderEvent` **throws** for viewers outside `visibility`; ⛔ never returns a redacted string |
| **5** | ⭐ erased content reconstructed | key destroyed, but title / summary / topic label / embedding survives and is rendered | erasure "succeeded" — the key really is gone | after key destruction: rendering contains no `{title}`, no derived label; and a store-level assertion that `library_chunks` / `library_distillates` / any index derived from the erased content return zero rows |
| **6** | custodial act in the shared story | timeline shows `System accessed this record` | the custodial log is correct | ⛔ no `(custodial_act, party_viewer)` pair resolves to any template; renderer throws |
| **7** | revision implying delivery | `{party} updated {title} for you` on a `work_revised` row | revision genuinely happened | member view of `work_revised` renders **nothing** (**N10**) |
| **8** | withdrawal as signal | `{party} has withdrawn access 3 times` | each withdrawal row is valid | ⛔ no template accepts a count over `practitioner_visibility_withdrawn` |
| **9** | assign as obligation | `Due Friday` beside an assign placement | placement is valid; force is `assign` | ⛔ no template slot for date-as-deadline; forbidden-substring set: `due` · `overdue` · `late` · `pending` |
| **10** | unregistered path | a component builds `${name} completed ${title}` inline | never reaches the renderer | static check: ⛔ no publishing-event prose outside the renderer module |
| **11** | MAIA restating an attestation | MAIA says *"you mentioned you've been practising X"* from an `attested` row | not a UI string at all | the ledger is ⛔ not a MAIA context source; assertion that no publishing-event row reaches prompt composition |
| **12** | silence as confirmation | unconfirmed attestation shown under `Confirmed` | confirmation row absent | unconfirmed renders `Not confirmed`; ⛔ never grouped under a confirmed heading |
| **13** | time-relative fact | `{party} shared this 3 days ago` inside the fact sentence | renders correctly on the day it is written | render the same row at two clock values; ⛔ output must be byte-identical |
| **14** | environment-varying fact | sentence differs by locale default, feature flag, or experiment arm | each variant reads fine in isolation | render under varied environment; ⛔ output must be byte-identical. Registry holds one template per `(act, viewer)` — ⛔ no variants |
| **15** | ⭐ model-authored fact | a generated sentence replaces or "improves" the template output | reads better than the template, and is often accurate | ⛔ no rendering path accepts model output; assert every emitted sentence is reproducible from `(row, template registry)` alone |

⭐ Cases **1, 2, 5, 11, 15** are the ones that produce a *false statement about a person*. If the
suite is ever cut for time, those five are the floor.

## 8. Where it runs

- Unit-level, over the pure renderer — no browser, no fixtures beyond event rows.
- **Plus a surface-level forbidden-substring sweep** over rendered publishing surfaces, because
  case 2 and case 9 are usually committed by *surrounding* copy, ⛔ not by the renderer.
- Joins the Co-Lab release gate (`scripts/verify-colab-boundaries.ts`, 31/31 in production before
  any tester wave) as additional checks, alongside a standalone conformance suite.
- ⛔ Never resolve a failure by widening an allowlist — the standing rule already pinned in
  `__tests__/practitioner-authority-boundaries.test.ts`.

## 9. What this cannot catch

⭐ Stated so the suite is not over-trusted:

- **Tone.** A conformant sentence can still be delivered in a way that pressures. Conformance is
  necessary, ⛔ not sufficient.
- **Layout.** Two conformant strings placed adjacently can imply a third claim.
- **Voice output.** Spoken renderings need their own bindings; ⛔ not covered here.
- **Translation.** The exact-skeleton assertions are English-bound. ⚠️ Invariant 14 (cultural
  sovereignty) applies — a translated template is a new template needing its own binding, ⛔ not a
  string substitution.

## 10. Not authorized

⛔ Schema, migration, code, route, UI · ⛔ any open ruling (attestation-content erasure · delegation
grant · custodial mandate instrument · MAIA read access) · ⛔ lifting the ontology's implementation
block — a founder act.
