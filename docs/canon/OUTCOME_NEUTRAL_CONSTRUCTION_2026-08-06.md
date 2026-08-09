# Outcome-Neutral Construction — AIN governance instrument

*(Working name during drafting: "Deciding by Construction" — retained here once, since earlier
documents in this lane link and quote it under that name. This document is the canonical text.)*

**Status: RATIFIED — 2026-08-09.** A **construction constraint** on design and implementation
artifacts, ⛔ not a constitutional principle in itself and ⛔ not an authority-granting instrument.
Recorded at founder observation 2026-08-06, generalized from a single rendering-layer case because
the pattern is ⛔ not specific to rendering; ratified 2026-08-09 following the adversarial test in §9.

> ## Founder Ratification — Outcome-Neutral Construction
>
> I ratify Outcome-Neutral Construction as an AIN governance instrument.
>
> When a genuinely open, load-bearing governance decision has not been made, implementation must not
> encode one possible resolution such that the construction is correct only if that resolution later
> becomes the ruling.
>
> Reversibility and outcome-neutrality are independent properties. Ease of undoing an implementation
> does not authorize it to prejudge an open decision, and difficulty of undoing an implementation
> does not by itself make that implementation non-neutral.
>
> Outcome-neutrality is not an unlimited obligation to absorb disproportionate engineering cost,
> complexity, or architectural distortion. When maintaining neutrality would impose such a burden,
> the proper response is to surface the burden and escalate the open question for governance
> decision. Engineering cost may establish the need for a ruling; it may not supply the ruling.
>
> Once the relevant governance decision has been made, this instrument no longer governs that
> question. Implementation may then faithfully encode the settled ruling.
>
> The authority of this instrument rests in the founding cases and scope established in the
> instrument itself. Projected examples remain illustrative rather than constitutive.
>
> The adversarial test dated 2026-08-09 is accepted as supporting evidence for this ratification,
> including its initial identification of two ambiguities and the successful rerun of those same
> cases following amendment.
>
> **Status: RATIFIED — 2026-08-09**

> ⭐⭐⭐ **PROVENANCE OF AUTHORITY — cite it this way, ⛔ never as a general principle.**
> *"This constraint was generalized from one near-miss and one correct application in the
> practitioner publishing lane (2026-08-06): a rendering binding table that would have settled the
> event-home ruling by construction, and an ontology section deliberately shaped to survive either
> outcome of an unruled question."*
>
> ⛔ Its authority is **earned by §3 and extends no further.** ⛔ Do not strip the cases out to leave
> only the rule.

---

## 1. The rule

> ⭐⭐⭐ **An implementation artifact must not encode the outcome of an unresolved governance
> decision.**

Restated as the obligation it creates:

> ⭐ **Within the scope of an open decision, an artifact must be outcome-neutral — or it must wait.**

⛔ An artifact that cannot be built outcome-neutrally is ⛔ not blocked by caution; it is **inside the
decision** and has no authorization to exist yet.

⭐ **What "encode" means, precisely** — the rule hangs entirely on this word:

> **An artifact encodes an outcome when its structure, vocabulary, bindings, schema, defaults, or
> required assumptions are only correct under one possible resolution of an unresolved decision.**

⛔ Mentioning an open decision, discussing it, or naming it as a dependency does not encode it —
§3's Ontology §9 does all three and remains compliant, precisely because it does not commit to an
answer. ⭐ Encoding happens when the artifact stops working, or stops being true, the moment a
different resolution is chosen.

⭐⭐ **What the rule protects, said positively:** outcome-neutral construction preserves governance's
ability to decide later **without first undoing implementation.** ⛔ The alternative — build toward
the likely answer, unwind if wrong — quietly moves the cost of being wrong from before the ruling to
after it, which is exactly backwards for a decision no one has made yet.

## 2. ⭐⭐ Relation to dependency-based authorization — ⛔ they are not the same rule

They govern different moments, and ⛔ neither substitutes for the other:

| Rule | Governs | Question |
|---|---|---|
| **Dependency-based authorization** | ⭐ **when** a workstream may begin | *are this workstream's prerequisites satisfied?* |
| **Deciding by Construction** (this rule) | ⭐ **what** an authorized workstream may contain | *does this construction settle something still open?* |

⭐⭐⭐ **The gap between them is the whole reason this instrument exists.** A workstream can be
correctly authorized — every prerequisite satisfied — and still contain a construction that decides
an unruled question. Authorization is granted at the **workstream** boundary; encoding happens at the
**artifact** boundary. ⛔ Passing the first gate does not clear the second.

## 3. The cases this rule is earned from

**The near-miss (violation, caught before commission).** Track 3's rendering harness workstream is
authorized — its enforcement architecture, template grammar, and mutation matrix depend on none of
the four open rulings. But [Rendering Conformance §3](../design/practitioner-portal/PRACTITIONER_PUBLISHING_RENDERING_CONFORMANCE_2026-08-06.md)'s
**binding table** names event types whose home is ruling 4 (Commitment Event Home). ⭐ A rendering
architecture that shipped a populated binding table would have **made ruling 4** — silently, by
construction, inside an artifact that was legitimately authorized to exist.
→ [Track 3 Workstream Charter §3.2](../design/practitioner-portal/PRACTITIONER_PUBLISHING_TRACK_3_WORKSTREAM_CHARTER_2026-08-06.md)

**The correct application.** [Ontology §9](../design/practitioner-portal/PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md)
records that the §7 crossing rule and MAIA awareness classes A/B/C are unruled, and that §6 *"is
shaped to be compatible with any outcome; it does not anticipate one."* ⭐ That is this rule, applied
before it had a name — the section was written **outcome-neutral** so it could stand whichever way
the question is later ruled.

## 3a. ⚠️ Where this document's authority sits

⭐ **The authority of this instrument comes from §3, ⛔ not from §4.** §4 is illustrative — it shows
the pattern generalizes — but it is not evidence the pattern has occurred elsewhere. ⛔ If §3's two
cases were ever found to be misread, the instrument's authority is gone regardless of how plausible
§4 still reads.

## 4. Projected instances — ⚠️ named, ⛔ not observed

Founder-identified 2026-08-06 as the same pattern in other layers. ⚠️ These are **projections from
this lane's open decisions**, ⛔ not measured occurrences — no artifact has committed them:

| Construction | Would silently decide |
|---|---|
| a **populated binding table** before the event home is ruled | ruling 4 — ⭐ *observed near-miss, §3* |
| a **database schema** that assumes an unresolved authority model | ruling 2 (custodial as fifth source) |
| a **permission matrix** that presumes a delegation instrument | the delegation grant — an absent instrument |
| a **UI** that presents a commitment container before its jurisdiction is settled | ruling 1 |

⭐ In each, the implementation would decide **by construction** what governance has not decided
**explicitly**.

## 4a. ⭐⭐⭐ What the rule is actually protecting — optionality

Founder observation, 2026-08-06. §1 states the rule negatively. Stated positively, it protects a
single thing:

> ⭐⭐⭐ **An artifact that remains compatible with multiple future rulings keeps governance free to
> decide. An artifact that functions under only one interpretation has already narrowed the decision
> space.**

Three consequences worth holding separately:

1. ⭐ **Intent is irrelevant.** The narrowing happens *"even if nobody intended it to."* ⛔ An
   artifact does not escape this rule by having been written in good faith, and ⛔ a reviewer may not
   clear it by consulting the author's intent.
2. ⭐ **It is a property of the artifact, ⛔ not of the process that produced it.** This is what makes
   the rule checkable by someone who was not in the room, months later, without institutional
   memory — the same standard the lane holds elsewhere.
3. ⭐ **The harm is to governance, ⛔ not to the code.** A narrowed decision space costs nothing
   technically and everything constitutionally: the ruling, when it comes, arrives to find its own
   range already reduced.

### ⚠️ On "measurable" — what it would actually take

The property **is** mechanically checkable, ⛔ but only against an **enumerated register of open
decisions**:

> for each decision still open, does the artifact function under **every** live outcome?

⛔ Without that register the check degrades into judgment, and this instrument becomes another thing
a careful reader does and a hurried one skips. ⚠️ **No consolidated open-decision register exists for
this lane as of 2026-08-06** — it is distributed across
[Phase Record §4](../design/practitioner-portal/PUBLISHING_PHASE_RECORD_2026-08-06.md) (4 governance +
3 ontological) and [Ontology §9](../design/practitioner-portal/PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md)
(6 carried). ⭐ Consolidating them is the precondition for calling this measured rather than assessed;
⛔ this document does not claim it is measured today.

## 5. The test

> ⭐ **Could a reader recover the outcome of the open decision from this artifact alone?**

If yes, the artifact has decided it.

⛔⛔ **This test applies only to decisions whose governing ruling is genuinely open.** Stated as an
exclusion so it cannot be misapplied: an artifact that recovers the outcome of a **settled** ruling
has not violated anything — it is simply downstream design doing its job. ⛔ Do not run this test
against settled rulings, open questions that are merely unresolved-but-not-load-bearing for the
artifact, or product decisions that carry no constitutional weight. Running it unscoped would make
every downstream design impossible, which is not this instrument's purpose.

## 6. The three legitimate responses — and the one that is not

| # | Response | When |
|---|---|---|
| 1 | **Redesign outcome-neutral** | the artifact's purpose survives without the encoding — ⭐ preferred, ⚠️ but not unconditionally — see §6.2 |
| 2 | **Defer the encoding part** | the neutral portion is independently useful (⭐ harness yes, bindings no) |
| 3 | **Escalate for the ruling** | the artifact is inert without it, **or** §6.2 applies — refer it to whoever holds the decision |

⛔ **Not legitimate: pick the likely outcome and label it provisional.** ⭐ A provisional construction
becomes precedent the moment anything is built against it, and the later ruling arrives to find the
question already answered in code. ⛔ "We can change it if the ruling goes the other way" is a cost
estimate, ⛔ never an authorization.

### 6.1 ⭐⭐⭐ Reversibility and outcome-neutrality are independent properties

Patched 2026-08-09, following the adversarial test (§9), Case 4.

> ⭐⭐⭐ **Reversibility and outcome-neutrality are independent properties. Neither implies the other.**

⛔ **Cheap reversibility does not excuse encoding.** A prototype that is trivially deletable can still
be constitutionally improper — if it renders, persists against, or asserts one unresolved outcome as
though it were settled, it has encoded, regardless of how little it costs to delete. "It's just a
throwaway branch" is not a defense; it is the same cost-estimate reasoning §6 already rejects, applied
to deletion cost instead of rework cost.

⛔ **Expensive irreversibility does not itself establish non-neutrality.** A structure that would be
difficult to unwind can still be genuinely outcome-neutral — if it continues to function correctly
under every live resolution of the open decision, its cost of reversal is irrelevant to whether it
encodes anything. Difficulty of reversal is a property of the artifact's *cost*; encoding is a
property of the artifact's *correctness under each live outcome* (§1). They are measured on different
axes and must not be substituted for one another.

⭐ **The test remains §1's, unchanged:** does the artifact's structure, vocabulary, bindings, schema,
defaults, or required assumptions hold under every live resolution? Reversibility — of either kind —
answers a different question and settles nothing here.

### 6.2 ⭐⭐⭐ Outcome-neutrality is not an unlimited engineering obligation

Patched 2026-08-09, following the adversarial test (§9), Case 6.

> ⭐⭐⭐ **This instrument does not require supporting every possible future at arbitrary engineering
> cost.** When preserving neutrality would impose disproportionate complexity, cost, or architectural
> distortion, construction should **stop**, and the genuinely open, load-bearing governance question
> should be **escalated for ruling** — not resolved implicitly through implementation, in either
> direction.

⭐ **This resolves the response-ordering left open in §6.** High neutrality-cost is not a reason to
encode (redesign-neutral does not become optional merely because it is expensive) — it is a signal
that response 3 (escalate) is likely to cost less than response 1 (build and maintain a polymorphic
workaround). ⛔ Response 1 remains preferred **when neutrality is achievable at proportionate cost**;
§6.2 governs the case where it is not.

⭐⭐ **The discipline stays sharp, and asymmetric, on purpose:**

1. ⭐ **The engineer may identify and evidence the cost.** Naming that genuine neutrality is expensive,
   and showing the evidence, is normal design work — the same kind of measurement this lane requires
   everywhere else.
2. ⛔ **The engineer may not convert that cost into an unauthorized substantive ruling.** Choosing the
   cheaper-looking resolution *because* neutrality was expensive is exactly the encoding this
   instrument forbids — cost pressure does not open a side door around §1.
3. ⭐ **Once governance settles the question, §5 removes it from this instrument's scope entirely.**
   The escalation in §6.2 is not a delay tactic; it is the path back to §5's exclusion — a settled
   ruling is no longer a live outcome to encode against, and downstream design proceeds normally.

⛔ **What this does not authorize:** stopping work indefinitely by *claiming* disproportionate cost
without evidencing it, or treating "this is expensive" as itself a ruling. The cost claim is subject
to the same scrutiny as any other measurement in this lane.

## 7. Relation to other instruments

| Instrument | Relation |
|---|---|
| [Authorization-and-Responsibility Trace](AUTHORIZATION_AND_RESPONSIBILITY_TRACE_2026-08-06.md) | ⭐ **complementary** — the trace catches a decision that cites **no** ruling; this catches one that cites a ruling **that does not exist yet** |
| [Evidence Scope Rule](EVIDENCE_SCOPE_RULE_2026-08-06.md) | runs **before** — you cannot know a decision is open without measuring what already governs |
| [Substrate Disposition Test](SUBSTRATE_DISPOSITION_TEST_2026-08-06.md) | runs **before** — ⛔ adapting an incompatible substrate is itself a construction that decides |
| [Constitutional Direction of Authority](CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md) | ⭐ the same prohibition one layer up — ⛔ authority may not be manufactured by skipping a layer, and construction is one of the ways skipping happens |

## 8. ⛔ Not authorized by this document

⛔ Any constitutional ruling · ⛔ schema, migration, code · ⛔ use as a reason to defer work that is
genuinely outcome-neutral · ⛔ further expansion of the doctrine beyond what the Founder Ratification
above states.

## 9. Adversarial test

📌 [`OUTCOME_NEUTRAL_CONSTRUCTION_ADVERSARIAL_TEST_2026-08-09.md`](OUTCOME_NEUTRAL_CONSTRUCTION_ADVERSARIAL_TEST_2026-08-09.md)
stress-tests §1, §3a, §5, and §6 against six cases. First pass (2026-08-09): four resolved
unambiguously; two (Cases 4 and 6) exposed real gaps in §6. ⭐ Both gaps are patched above — §6.1
(Case 4: reversibility ≠ outcome-neutrality) and §6.2 (Case 6: neutrality is not an unlimited
obligation; disproportionate cost escalates rather than encodes). The rerun of Cases 4 and 6 against
the patched text, in the same test document, cleared both: **6 of 6 cases resolve unambiguously.**

⭐ **Accepted as supporting evidence for ratification**, per the Founder Ratification above — including
the initial identification of the two ambiguities and the successful rerun following amendment.
