# JARVIS-JEV-01 / JEV-INT-05 — Wire-Amendment Proposal and Synthetic Connection-Test Plan (R1)

**Date:** 2026-10-07 · **Revision:** R1 (supersedes `33a5fab10`, which stays in git history)
**Status:** ⭐ PROPOSAL FOR FOUNDER REVIEW · ⛔ **NOTHING IN THIS RECORD IS AUTHORIZED**
**Content-free:** synthetic values only; no repository text, no label, no PILOT-01 judgment.

> **Authorizes nothing.** No provider registration, credential retrieval, inference call, spend,
> frozen-contract edit, J1 amendment, merge, or deployment. Each is a separate founder act (§10).
> PILOT-01 stays DEFERRED; its P and partial F material is not used.

## 0 · What changed from the first draft, and why

| # | Change | Reason |
|---|---|---|
| 1 | **`Q_RISK` only.** `Q_DEPTH` removed from this act | `Q_DEPTH` is a **Score** in the host; reframing it as P(yes of a binary proposition) changes the question and its answer meaning. 0.9 there is not "90% depth". TypeSafe has a separate Score primitive; no need to convert. |
| 2 | `questions` is a **keyed object with exactly one entry**, not an array | Public OpenAPI specifies a map of name → question object (reported by founder; see §9). |
| 3 | **Native observation vs admitted advice are separated**; the connection test produces observations only | The first draft said the response contract was unchanged (§2) and also proposed null confidence (§4). Those conflicted: the host requires numeric `confidence ∈ [0,1]` and rejects null. |
| 4 | Budget is **token-based**, with a $1 ceiling | Published pricing is per input token (§6). |
| 5 | **D-5 removed** from this act | Real-work evaluation is a separate later decision. |
| 6 | Synthetic data-class question resolved against the full rules, **not assumed exempt** | Canon classifies the J1 packet as `repository_derived_metadata` and states no synthetic exemption (§7). |
| 7 | Corrected phrasing: the pilot deferral is a **blocked prerequisite**, not a "dependency cycle"; "raise-only cannot cause harm by construction" withdrawn | The pilot → freeze → evaluation order is linear, and a displayed warning can still anchor a human. |

## 1 · Carried decisions (not reopened)

Development-provider canon ratified and the 2026-09-20 interim hold lifted (INT-01R3;
`scripts/provider-policy.json`) · provider id `typesafe-jev`, tier `lab`, standing `benchmark`,
data class `repository_derived_metadata` only (INT-03R1 D2–D4) · no registration exists and
`repository_assignment_authorizations` is empty · the JARVIS advisory seam (#1756) is raise-only
with no transport connected.

## 2 · The amendment is a J1 reopening (route b)

INT-03R1 §6 allows a hosted call only if (a) TypeSafe accepts the exact packet as the sole
application payload (it does not), or (b) a **separate founder constitutional act reopens J1**.
INT-03 rules `state/model/questions` to be application payload, not neutral transport. The wire
carrier is therefore a **named J1 reopening**, candidate **J1R5-WIRE**, not an engineering detail.

```text
OutboundRepresentation := WireBody
WireBody := {
  state:     JudgmentPacket                      // exactly the frozen J1R4 six-member packet
  model:     "jev-1.13.0"                        // pinned versioned id; ⛔ no "latest" alias
  questions: { "Q_RISK": FixedQuestion }         // keyed object, EXACTLY ONE entry
}
FixedQuestion := { type: "noul", instructions: <fixed wording from the frozen table> }
```

Binding properties (each needs a named falsifier **and a defeat candidate** before it is law):

1. `state` is byte-for-byte a valid J1R4 packet; the J1 suite (63/63) is untouched.
2. The single `questions` key must equal `state.question_id` (here `Q_RISK`). Zero or ≥2 entries,
   or a key mismatch → construction failure, nothing sent.
3. Question wording lives only in a **frozen, versioned, hashed table**. It is constant across all
   packets and carries no per-unit text; per-request wording is a prompt channel and is refused.
4. `model` is part of the same table; a different model id is a new table version.
5. **Wire-body hash computed and recorded before send**, and carried in every record.
6. A timeout is `attempted / crossing unknown`, never "nothing was sent".
7. One question per call, **no automatic retries**, including SDK retries (TypeSafe SDKs retry by
   default, so the call is made through a minimal client with retries off).

Candidate wording v1 (**unapproved; for review**): the J1R4 sentence verbatim, *"Does this appear to
cross a structural-risk boundary?"* Any added explanation of the packet fields is a wording change and
needs its own review.

I1 (authority invariance), I3 (absence is identity), I4 (confidence advice-only), the host membrane
and the existing response validator are **unchanged by this act**.

## 3 · Response semantics — observation only, validator untouched

Noul returns the model's estimated **probability of "yes"**; no separate confidence value.

```text
NativeObservation := {
  wire_body_hash, table_version, model_requested, model_returned,
  p_yes, billable_input_tokens, latency_ms,
  provider_confidence_supplied: false, outcome: ok | timeout_crossing_unknown | error
}
```

- Stored in a **separate observation sidecar**. It is **never** passed through, or coerced to fit,
  the J1 `YesNo` admission path. No `answer`, no `confidence`, no threshold τ.
- Consequently the old validator is **not weakened** and no admitted advice is produced; the Work
  Unit, route, authority and lifecycle are not touched (INT-04 R1.3).
- A **later, separate** act may specify how a native probability becomes admitted advice (including
  `confidence` absent by contract). Recommendation then: absent, not derived from p. Not decided here.

## 4 · What `Q_RISK` can and cannot show

Its inputs are largely flags JARVIS already reads deterministically (`migration`, `auth`,
`production`). The test can show that the **connection, record, accounting and failure handling work**.
It **cannot** show that Jev adds risk judgment beyond JARVIS's existing rules, and nothing here
claims it. Usefulness is a separate, later evaluation.

## 5 · Exact finite fixture list (31 attempts planned)

All packets: `packet_version "jev-3"`, `question_id "Q_RISK"`, `contains_sensitive false`.
`requires_external_info` false and `file_count` 1 unless stated. Shapes are the six J5.v1 members.

| IDs | Description | Sends |
|---|---|---|
| F01–F06 | baseline: each of the six shapes, `migration/auth/production` all false | 6 |
| F07 | `CODE_GROUNDED`, `migration true` | 1 |
| F08 | `CODE_GROUNDED`, `auth true` | 1 |
| F09 | `CODE_GROUNDED`, `production true` | 1 |
| F10 | `CODE_GROUNDED`, `requires_external_info true` | 1 |
| F11–F13 | `CODE_GROUNDED`, `file_count` 0 / 10 / 10000 | 3 |
| F14–F19 | each of the six shapes with `migration + auth + production` all true | 6 |
| R1–R3 | **stability repeats:** F01, F10, F14 each sent 4 more times (5 total each) | 12 |
| **Total planned** | | **31** |
| L1 | `file_count 10001` → **construction refusal, local only, zero sends** | 0 |
| L2 | `contains_sensitive true` → expected **ineligible, local only, zero sends** (to be confirmed against the host membrane before inclusion) | 0 |

Failure handling (timeout, error, malformed or extra-field response, model-id drift, id mismatch,
deterministic route ⇒ zero calls) is exercised against a **fake transport, with zero provider calls**.
Live calls are used only for F01–F19 and R1–R3.

## 6 · Budget (proposed; not granted)

Published rates (reported by the founder from TypeSafe's public documentation; **I could not
independently verify them from this container**): `jev-1.13.0`, **$0.042 per million input tokens**
($42 per billion), output tokens free, billed per input token not per call. Illustration, not
measurement: 120 calls × 2,000 input tokens ≈ **$0.01**.

- **Ceiling: $1.00 API usage and at most 120 attempted calls, whichever is reached first.**
  Failed requests, timeouts and every repetition count as attempts.
- **Accounting:** record the response's reported billable input tokens × the published rate. A call
  that returns no usage is charged a **reserved allowance of $0.005** (≈ 119k tokens, far above any
  request here) and never assumed free; `120 × $0.005 = $0.60`, so the reserve alone cannot breach the cap.
- **Reserve before send:** the next call is not sent unless `spent + reserved + $0.005 ≤ $1.00`.
- **No automatic retries.** Kill switch on the first stop condition (§8).
- Account-specific billing terms are not checked; the payment method and key are the founder's act.

## 7 · Data classification of the complete outgoing payload

`DEVELOPMENT_PROVIDER_GOVERNANCE` (canon) states: *"The ratified J1 Jev packet is
`repository_derived_metadata`."* `PROVIDER_GOVERNANCE.md` requires a provider to receive that class only
under a **separately ratified, machine-readable authorization record already admitted to the canonical
base before the assignment candidate**. Neither states a synthetic-fixture exemption.

Classification of every outgoing member:

| Member | Class |
|---|---|
| `state` (six packet fields, synthetic values) | shaped as `repository_derived_metadata`; values are invented, no repository state |
| `model` id | adapter configuration; no repository data |
| fixed question wording | authored adapter configuration; must be reviewed to contain no repository text, canon, or paths |
| connection metadata (IP, key identity, timing) | operational metadata, disclosed to the provider |

Two lawful routes; the founder picks one:

- **Route A — existing assignment route.** Author a Class-A authorization record, adjudicate and admit
  it to canonical, then a separate assignment candidate. Slow; also unlocks later real-work use.
- **Route B — explicitly bounded synthetic-only exception.** A founder ruling scoped to: the hashed
  fixture list (§5), the hashed question table, the provider `typesafe-jev`, the §6 caps, and **expiring
  when the test ends**. It creates no standing for `repository_derived_metadata` and no precedent for
  real-work disclosure. Recommended for the connection test only, because the payload contains no
  repository-derived value.

Either way registration, a credential and `provider.execute:typesafe-jev` remain separate acts.

## 8 · Test plan and stop conditions (after approvals; not before)

1. Freeze the fixture list and the question table; record both hashes.
2. For each fixture: build the wire body, verify it against the table, **record its hash, then send**.
3. Witnesses, each with a defeat candidate: body equals recorded hash; `state` is a valid J1 packet;
   key mismatch / extra entry refused unsent; timeout recorded `attempted / crossing unknown`; provider
   error → recorded failure; extra-field or malformed response refused; raw `p_yes` stored; Work Unit
   byte-identical before and after; zero calls on a deterministic route; spend never exceeds the cap.
4. Observations only: latency, `p_yes` repeat spread (R1–R3), returned vs pinned model id, tokens.
5. **Stop** (record, no retry) on: any sent/unsent ambiguity, model-id drift, response shape outside
   this proposal, cap or reserve breach, or any fixture sending something other than its hashed body.

## 9 · What I verified and what I did not

- Verified from canonical: the host requires numeric `confidence` and rejects null; `Q_DEPTH` is a
  Score and `Q_RISK` a YesNo; the J1 packet is classed `repository_derived_metadata`; assignment needs
  a prior-admitted authorization record; the six task shapes.
- **Not verified here:** the TypeSafe OpenAPI shape, pricing and SDK retry default (this container's
  proxy returns 403 for `api.typesafe.ai`; these are taken from your report and the cited public
  documentation); the exact `noul` question field names; account-specific terms; whether the host
  membrane marks `contains_sensitive true` ineligible (L2).
- The DPA / retention review (INT-04 §9.7) remains open. TypeSafe's customer agreement permits
  processing and storage for service delivery and telemetry; this is not zero-retention.

## 10 · Decisions for the founder

| # | Decision | Recommendation |
|---|---|---|
| D-1 | Commission **J1R5-WIRE** as a J1 reopening, falsifier-first | Yes |
| D-2 | First test asks **`Q_RISK` only**; `Q_DEPTH` unchanged and out of scope | Yes |
| D-3 | Connection test records **observations only**; admitted-advice mapping is a later act | Yes |
| D-4 | Budget: **$1 ceiling, 120 attempts, token accounting, $0.005 reserve, no retries**; 31 planned | Approve as proposed |
| D-6a | Data-class route: **A** (assignment) or **B** (bounded synthetic exception) | B for this test |
| D-6b | Provider registration, credential, `provider.execute:typesafe-jev` for the test only | After D-1…D-4, D-6a and the DPA review |

Sequence: D-1 → amendment built falsifier-first (lethality proved before implementation) → D-6a/b and
terms review → synthetic test. Real-work evaluation and the §9.5 freeze question are **outside this
act** and remain governed as they stand.
