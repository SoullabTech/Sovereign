# JARVIS-JEV-01 / JEV-INT-05 — Wire-Amendment Proposal and Synthetic Connection-Test Plan

**Date:** 2026-10-07 · **Status:** ⭐ PROPOSAL FOR FOUNDER REVIEW · ⛔ **NOTHING IN THIS RECORD IS AUTHORIZED**
**Authors:** Claude (prepared at founder direction) · **Content-free:** synthetic examples only; no repository text, no label, no PILOT-01 judgment.

> **Authorizes nothing.** No provider registration, credential retrieval, inference call, spend,
> frozen-contract edit, J1 amendment, merge, or deployment. Each is a separate founder act (§9).
> PILOT-01 stays DEFERRED; its P and partial F material is not used here.

---

## 0 · Intended first destination (founder direction)

**#1: bounded, raise-only Jev advice.** Cost-saving authority (lowering reasoning) is deferred and is
not designed here. The completed decisions are carried, not reopened:

| Settled (canonical `f05a2e689`) | Source |
|---|---|
| Development-provider canon ratified; 2026-09-20 interim hold lifted | INT-01R3; `scripts/provider-policy.json` |
| Provider id `typesafe-jev`, tier `lab`, standing `benchmark`, data class `repository_derived_metadata` only | INT-03R1 D2–D4 (design law) |
| No `typesafe-jev` registration; `repository_assignment_authorizations` empty | `scripts/provider-policy.json` |
| JARVIS-side advisory seam, raise-only human delivery, transport injected, none connected | INT-04 / #1756 |

## 1 · The one finding that shapes the proposal

INT-03R1 §6 gives exactly two ways to a hosted call: (a) TypeSafe independently offers an interface
where the exact `JudgmentPacket` is the sole application payload (not available today), or
(b) **J1 itself is reopened by a separate founder constitutional act.**

INT-03 §2 also rules that `state / model / questions` are **application payload, not neutral transport
metadata**. So the "narrow wire amendment" **is** route (b): a J1 reopening, however small. It must be
named as one. It is not a transport detail an engineer may add.

## 2 · Proposed amendment (candidate "J1R5-WIRE"; not drafted into any frozen file)

```text
OutboundRepresentation := WireBody
WireBody := {
  state:     JudgmentPacket          // EXACTLY the frozen six-member J1R4 packet, unchanged
  model:     PinnedModelId           // one exact id observed from TypeSafe's inventory; ⛔ no "latest" alias
  questions: [ FixedQuestion ]       // length exactly 1 in the connection test
}
FixedQuestion := one entry of a FROZEN, VERSIONED, HASHED question table
                 (id, version, wording, answer-type); constant across all packets
```

Binding properties (each needs a named falsifier + defeat candidate before it is law):

1. `state` is byte-for-byte a valid J1R4 packet; the J1 packet suite (63/63) stays green and untouched.
2. `questions[0].id` must equal `state.question_id`; mismatch is a construction failure, nothing sent.
3. Question wording lives only in the frozen table (J1R4 §4.2 "adapter configuration"). It is constant,
   hashed, and contains no per-work-unit text. A per-request wording is a prompt channel and is refused.
4. `model` is a pinned constant in the same table; a changed model id is a new table version.
5. **Wire-body hash computed and recorded before send**; every advisory record carries it.
6. A timeout is `attempted / crossing unknown`, never "nothing was sent" (INT-04 §9.3).
7. One question per call (instrument property; avoids batching effects on the answer).

The amendment widens *what J1 permits as the carrier* and nothing else: authority invariance (I1),
absence-is-identity (I3), confidence advice-only (I4), the response contract, and the host membrane
are unchanged.

## 3 · Which questions the permitted inputs can support

The packet is content-free: `task_shape`, `contains_sensitive`, `requires_external_info`,
`change_scope{file_count, migration, auth, production}`. Per question:

| Question | Verdict for the first test | Reason |
|---|---|---|
| `Q_RISK` | **Include** | Yes/no maps natively to Noul; raise-only (`true` may escalate, `false` changes nothing). Caveat: its inputs are largely the flags JARVIS already reads deterministically, so expect low incremental value. That is a finding the test should surface, not hide. |
| `Q_DEPTH` | **Include, reframed** | Noul returns P(yes), not a 0–1 score. Ask the binary form ("requires more than routine deliberation?") and treat P(yes) as the raise signal. J1 supplies no depth anchors (LABEL-01 open item); the test records the raw probability and asserts no depth meaning. |
| `Q_SUFFICIENT` | **Omit** | A content-free packet cannot carry whether state is sufficient; the answer would be a guess dressed as judgment. |
| `Q_LLM_NEEDED` | **Omit** | Its only actionable direction (`false`) is the cost-saving use, which is deferred. |

## 4 · Response mapping (needs founder decision D-3)

TypeSafe documents Noul output as the model's estimated **probability of "yes"**, with **no separate
confidence field**. J1 `YesNo` requires `{answer, confidence}`. Proposed mapping:

```text
p = Noul P(yes)                      // recorded raw, always
answer     = (p >= τ)                // τ fixed in the question table; for the test τ = 0.5 and NOT used for any action
confidence = null → records "not provided by provider"   // ⛔ do not synthesize |2p−1| as "confidence"
```

This requires a small J1 response amendment (`confidence` optional / provider-absent) or a ruling that
`|2p−1|` is a declared derived field, labelled as such. Recommendation: the former (don't invent
confidence). Calibration of p against outcomes is exactly what is **unmeasured**; the connection test
makes no claim about it.

## 5 · One representative synthetic request (plain language)

All values invented; no repository data.

```json
{
  "state": {
    "packet_version": "jev-3",
    "question_id": "Q_RISK",
    "task_shape": "<one member of the frozen J5.v1 enum>",
    "contains_sensitive": false,
    "requires_external_info": false,
    "change_scope": { "file_count": 12, "migration": true, "auth": false, "production": false }
  },
  "model": "<pinned id, TBD from live inventory>",
  "questions": [ { "<field names per live OpenAPI, unverified here>": "Q_RISK v1 fixed wording" } ]
}
```

- **What leaves the system:** the six synthetic packet fields, the pinned model id, the fixed question
  text, and ordinary connection metadata (our IP, the API key's account identity, request timing).
  **Nothing derived from the repository.** Because no repository data crosses, the
  `repository_derived_metadata` assignment is not engaged by the synthetic test. *This is my reading;
  it must be confirmed against `PROVIDER_GOVERNANCE.md` (§ on assignment), which I have not read in
  full.* The registration / execution act and a credential are still required.
- **What Jev answers:** "Does this appear to cross a structural-risk boundary?" as P(yes).
- **How it is interpreted:** raw p recorded; at most a *raise-only* advisory flag in sidecar evidence.
- **What it may never change:** the routed Work Unit, authority, lifecycle, the route digest,
  `execution_authorized`; lowering advice is never delivered (INT-04 R1.3–R1.4).

## 6 · Synthetic connection-test plan (after approvals; not before)

Goal: show the **connection and the record are correct**, not that Jev is good.

1. **Cell grid, not sampled data:** enumerate synthetic packets covering each `task_shape`, each boolean
   flag on/off, and `file_count` ∈ {0, small, large}, for `Q_RISK` and the reframed `Q_DEPTH`.
   Hard cap on calls stated up front (§7).
2. **Pre-send:** build wire body → verify against frozen table → record hash → only then send.
3. **Witnesses (each with a defeat candidate):** wire body equals hash; `state` is a valid J1 packet;
   id-mismatch refused unsent; timeout recorded `attempted / crossing unknown`; provider error becomes an
   admitted abstention; a malformed/extra-field response is refused; raw p is stored; no Work Unit byte
   changes; zero calls when the route is deterministic.
4. **Observations only:** stability of p across identical repeated calls (a few, within the cap),
   response latency, model id actually returned vs pinned (the returned model may differ from an alias).
5. **Stop conditions:** any unsent-vs-sent ambiguity, any model-id drift, cap reached, any response
   shape outside the amendment → stop, record, no retry beyond the plan.

## 7 · Budget and terms (needs founder input; I do not have the numbers)

- **Spend cap:** `N_calls_max × unit_price`. I have not verified TypeSafe's current pricing; the
  founder (or the vendor's price page) supplies `unit_price`. Proposed shape: `N_calls_max ≤ 120`
  (≈ 2 questions × ≈ 60 cells), zero automatic retries, kill switch on first stop condition.
- **Unresolved provider terms:** the public policy says input is not used for training, but the
  customer agreement permits processing/storage for service delivery and telemetry/fraud/legal
  purposes. Not zero-retention. DPA / retention review (INT-04 §9.7) is **open**. For *synthetic*
  packets the exposure is low; the review still gates registration and any later real-work use.

## 8 · The existing gate before real-work use

INT-04 §9.5: **LABEL-01 instrument freeze before real-unit shadow evaluation.** "Raise-only" does not
waive it. Two facts make a clean passage impossible as written:

- LABEL-01 §11.2 orders **pilot → freeze → prospective gold**. The pilot is deferred, so the instrument
  cannot freeze, so real-unit shadow evaluation cannot start. This is a dependency cycle, not an
  oversight.
- The freeze's central measure (under-deliberation upper bounds) exists to protect against *lowering*
  reasoning. A raise-only advisory cannot cause premature cognitive closure by construction, but it can
  cause other harms: alarm fatigue, anchoring the human, and clarification stalls.

**Proposed narrowing (explicit departure; needs founder ruling D-5, not a quiet bypass):**
amend INT-04 §9.5 so the freeze requirement *attaches to any use that can lower deliberation*, and
require raise-only real-work shadow evaluation to carry its **own predeclared measure** instead:
escalation precision against human-adjudicated outcomes, escalation burden (rate per unit and per
shape), agreement with the deterministic floors, and stability. Delivery stays sidecar-only until that
measure has a predeclared threshold. Lowering advice remains blocked by the original §9.5 unchanged.
The deferred pilot is untouched; reopening it later remains a separate decision.

PR #1765 (read-only calibration surfaces, open, unmerged) could display these measures, but it has no
writer and is not a prerequisite.

## 9 · Decisions this proposal puts to the founder (understandable scope, disclosure, budget)

| # | Decision | My recommendation |
|---|---|---|
| D-1 | Treat the wire carrier as a **J1 reopening** (route b) and commission J1R5-WIRE with falsifiers | Yes |
| D-2 | First test questions: `Q_RISK` + reframed `Q_DEPTH`; omit the other two | Yes |
| D-3 | `confidence`: provider-absent (null), not derived from p | Yes |
| D-4 | Synthetic-only connection test: spend cap, kill switch, call cap (numbers needed from you) | Set after you read the price |
| D-5 | Narrow INT-04 §9.5 to lowering use; require a separate predeclared raise-only measure | Yes, before any real-work shadow |
| D-6 | Provider registration + credential + `provider.execute:typesafe-jev` for the synthetic test only | Only after D-1…D-4 and the DPA review |

Sequence: D-1 → falsifier-first amendment build (lethality proved before implementation) → D-6 and
terms review → synthetic test → *separately* D-5 and real-work shadow.

## 10 · Unverified / not done

- TypeSafe's live request field names beyond `state/model/questions` and the `noul` question shape:
  **not witnessed here** (the container proxy refuses `api.typesafe.ai`). A fresh wire/schema witness is
  required before J1R5-WIRE is finalized.
- Current pricing and model inventory: unknown to me.
- `PROVIDER_GOVERNANCE.md` assignment rules read in part only.
- No code, test, frozen file, provider policy, or PILOT-01 artifact was changed.
