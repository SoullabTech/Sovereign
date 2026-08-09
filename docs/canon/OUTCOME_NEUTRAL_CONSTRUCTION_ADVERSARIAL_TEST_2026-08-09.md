# Outcome-Neutral Construction — Adversarial Test

**Status: EVIDENCE — accepted in the Founder Ratification of 2026-08-09.** This document did not
itself ratify [Outcome-Neutral Construction](OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md) — that
remained a founder act throughout — but its two-pass result, including the initial identification of
two ambiguities and their successful rerun after amendment, is named as supporting evidence in that
ratification. This document reports whether the instrument gives an unambiguous verdict on six
adversarial cases — and, where it did not on first pass, names the gap rather than papering over it.

**Two passes.** Pass 1 (below, unchanged from 2026-08-09) tested the instrument as originally
tightened. It found four clean verdicts and two gaps, both in §6. Those gaps were then patched
(§6.1, §6.2) directly in the instrument. **Pass 2** (§"Rerun," below) re-tests Cases 4 and 6 only,
against the patched text — Cases 1, 2, 3, and 5 did not depend on §6 and are not rerun.

> ⭐⭐⭐ **The metric for every case below is the line under test:** *governance must remain able to
> decide later without first undoing implementation.* A verdict counts as unambiguous only if it
> follows from the instrument's existing text — §1 (the encode test), §3a (authority sits in §3, not
> §4), §5 (the exclusion), or §6 (the three responses) — ⛔ not from reasoning invented to make the
> case come out clean.

---

## Result — Pass 1 (original text)

**4 of 6 cases: clean, unambiguous verdict from existing text. 2 of 6: real gaps.**

| # | Case | Verdict | Clean? |
|---|---|---|---|
| 1 | Settled ruling later inconvenient | out of scope (§5 exclusion) | ✅ clean |
| 2 | Open, non-load-bearing question | out of scope (§5 exclusion) | ✅ clean |
| 3 | Schema/default privileging one unresolved ontology | violation (§1 encode test) | ✅ clean |
| 4 | Reversible UI experimentation | **depends on a distinction the text doesn't make** | ⚠️ gap |
| 5 | Migration expensive to recover from | violation regardless of degree (§6) | ✅ clean |
| 6 | Neutrality itself costly to build | **§6 doesn't say cost affects which response, only that it can't buy exemption** | ⚠️ gap |

⭐ Both gaps are in the same place: **§6's three responses aren't ordered by a rule for choosing among
them.** The instrument correctly says redesign-neutral is "preferred," but doesn't say what "preferred"
yields to, or when.

---

## Case 1 — A settled ruling that later becomes inconvenient

**Grounding.** `0fa544bc4` — *"Default kept atoms to contextual return"* — is a shipped, settled
ruling. Suppose a future workstream finds it inconvenient (say, a UX flow that would read more simply
under private-by-default) and an artifact is built assuming the *opposite* default.

**Applying the text.** §5: *"This test applies only to decisions whose governing ruling is genuinely
open... an artifact that recovers the outcome of a settled ruling has not violated anything."*
`0fa544bc4` is settled. The artifact contradicting it is not an Outcome-Neutral Construction problem
at all.

**Verdict: ✅ out of scope — unambiguous.** ⚠️ **But note what this means:** the artifact is still
*wrong* — it silently overrides a ruling instead of un-ruling it. That is a real defect, just not
*this* instrument's defect. This case is the proof that the exclusion is doing exactly the job it was
built for in the tightening pass: keeping "outcome neutrality" from metastasizing into a reason to
re-litigate anything inconvenient. The wrongness here belongs to
[Deciding by Construction](OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md)'s sibling problem —
un-authorized departure from a settled ruling — not to this one.

## Case 2 — An open but non-load-bearing design question

**Grounding.** [Ontology §9](../design/practitioner-portal/PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md)
item 6: *"Larry's own domain language — only he can supply it; all names above are placeholders at
the universal layer."* This is genuinely open and genuinely unresolved.

**Applying the text.** §1's encode test: is the artifact "only correct under one possible resolution"
of the naming question? No — using a placeholder name doesn't privilege any eventual vocabulary; the
artifact functions identically whichever name Larry supplies later, because nothing about its
*structure* depends on the name chosen. §5's exclusion further requires the decision be **load-bearing**
for the artifact — naming is cosmetic here, not structural.

**Verdict: ✅ out of scope — unambiguous.** ⭐ This is the useful negative case: it shows the rule does
not fire on every open question, only on ones the artifact's correctness actually depends on.

## Case 3 — A schema/default that quietly privileges one unresolved ontology

**Grounding.** Hypothetical, since Placement is unbuilt (blocked by design). Suppose Placement's
`container_id` column is declared `NOT NULL REFERENCES practitioner_clients(id)` before ruling 1
(Commitment Authority) decides whether the container is `practitioner_clients` or
`relationship_spaces`.

**Applying the text.** §1's encode definition: *"structure... only correct under one possible
resolution of an unresolved decision."* A foreign key naming one specific table is structurally
correct under exactly one of the two live outcomes of ruling 1, and structurally broken under the
other.

**Verdict: ✅ violation — unambiguous.** This is the paradigm case the instrument exists for, and it
is the same shape as the founding near-miss in §3 (the rendering binding table), one layer earlier in
the pipeline. §6 response 1 (redesign outcome-neutral — e.g. a nullable, polymorphic, or
not-yet-typed container reference) or response 3 (escalate for ruling 1) both apply cleanly.

## Case 4 — Reversible UI experimentation ⚠️ gap

**Grounding.** [`NOW_WHAT_LARRY_PRACTICE_WORKSPACE_UIUX_SPECIFICATION.md`](../specs/NOW_WHAT_LARRY_PRACTICE_WORKSPACE_UIUX_SPECIFICATION.md)
(commit `7b868d8f3`, explicitly titled *"draft, not ruled"*) is a real, shipped artifact of exactly
this kind: UI/UX design work proceeding while the underlying object model is unruled.

**Applying the text.** The instinct is to say "it's just UI, it's cheap to change, so it's fine" —
but §6 already forbids exactly that reasoning for constructions in general: *"'We can change it if the
ruling goes the other way' is a cost estimate, ⛔ never an authorization."* So reversibility-as-excuse
is already closed. The real question §1's encode test asks is narrower: **does the artifact's
correctness depend on one resolution?** A UI spec that renders synthetic/mock data, is not wired to
persistence, and does not present any resolved-looking domain fact to a member is not *claiming*
anything about the open question — it fails the "correct under only one resolution" test not because
it is reversible, but because it never asserted a resolution to be correct or incorrect under.

**Where the text runs out.** The instrument does not currently say this. It says what encoding *is*
(§1) and forbids using reversibility as a defense for a construction that *does* encode (§6) — but it
never states the boundary condition that separates "reversible code that nonetheless encodes" (a
prototype that renders live `practitioner_clients` rows as if the container question were settled,
even in a disposable branch) from "reversible code that structurally cannot encode anything" (a
mockup built on fixture data with no claim to represent a ruled fact). ⚠️ **Reversibility of the
artifact and outcome-neutrality of the artifact are different axes**, and the current text uses them
near each other (§6) in a way that could be misread as one implying the other in either direction.

**Verdict: ⚠️ ambiguous as written.** The Larry Practice Workspace spec itself would likely pass —
it's explicitly a UX draft, not wired to a data model — but a reader applying only the instrument's
current text has to reconstruct the reasoning above; it is not spelled out. This is a genuine gap.

**Proposed patch (not yet applied to the instrument):** add to §1, after the encode definition —
*"Reversibility of the artifact and outcome-neutrality of the artifact are independent properties.
A cheap-to-delete prototype still encodes if it renders or asserts a specific resolution against real
or production-representative data; an expensive migration can still be outcome-neutral if its
structure holds under every live resolution. Do not use ease of reversal, in either direction, as a
proxy for this test."*

## Case 5 — A migration whose shape makes one future governance choice expensive to recover from

**Grounding.** This one is not hypothetical — it is already measured. [Phase Record §5](../design/practitioner-portal/PUBLISHING_PHASE_RECORD_2026-08-06.md)
item 3: *"Per-subject cryptographic architecture — present but incompatible: one `k1` protects 16,647
rows. §7 erasure is unimplementable, ⛔ never to be approximated with deletion."* A single shared key
across 16,647 rows makes per-subject erasure (whatever ruling eventually governs it) **expensive to
the point of practical impossibility**, without being technically irreversible — the rows could, in
principle, be re-encrypted per-subject at high cost.

**Applying the text.** §6 already rejects magnitude-of-cost as a defense: the instrument doesn't
distinguish "impossible to recover from" from "extremely expensive to recover from" — both are framed
as the same failure, because §4a states the harm is to governance's freedom, and *"the ruling, when
it comes, arrives to find its own range already reduced"* regardless of whether reduction is total or
severe.

**Verdict: ✅ violation regardless of degree — unambiguous.** ⭐ This case is stronger evidence for the
instrument than a hypothetical would be: it shows the failure mode **already occurred** in production,
predating the instrument, which is exactly why Track 2's ruling order requires Attestation Governance
before the erasure question can even be addressed. The instrument would have flagged this construction
had it existed when the crypto architecture was chosen.

## Case 6 — A case where neutrality itself imposes substantial implementation cost ⚠️ gap

**Grounding.** Hypothetical, continuing Case 3. Suppose the only way to make Placement's container
reference genuinely outcome-neutral under ruling 1 is a polymorphic association (dual-write shims, an
abstract lookup layer, extra migration complexity) — materially more engineering than picking either
table directly.

**Applying the text.** §6 offers three responses — redesign neutral, defer the encoding part,
escalate for the ruling — and marks response 1 "preferred." It does not say **preferred regardless of
cost**, nor does it give a threshold past which high neutrality-cost should tip the choice toward
response 3 (escalate) instead of response 1 (pay the engineering cost of genuine neutrality).

**Where the text runs out.** Two readings are both defensible from the current text, and it does not
choose between them:

- **Reading A:** cost is irrelevant to whether the rule binds (consistent with Case 5's rejection of
  "we can change it later" as a defense) — so build the polymorphic version regardless of cost,
  because paying engineering cost to preserve governance's freedom is exactly what the instrument
  protects.
- **Reading B:** high cost of achieving genuine neutrality is itself a signal that the underlying
  question is cheap to rule and expensive to work around — so escalate for ruling 1 instead of
  building the polymorphic shim, since ruling is faster than engineering around not-ruling.

⭐ Both readings are internally consistent with the rest of the document; **the document does not
adjudicate between them**, and a reviewer applying only the existing text could reach either.

**Verdict: ⚠️ ambiguous as written — a genuine gap**, not resolvable without adding text.

**Proposed patch (not yet applied to the instrument):** add to §6 —
*"Cost is not a legitimate reason to choose encoding (per the rejection above), but it is a legitimate
input to choosing among the three responses. When outcome-neutral construction would cost
substantially more than a single resolution, that cost is a signal to prefer response 3 (escalate for
the ruling) over response 1 (pay to stay neutral) — a cheap ruling is usually less costly than an
expensive workaround for the absence of one. This is a preference, not a rule: the workstream may
still choose to build the neutral version if the ruling is not imminent and the cost is bearable."*

---

## Rerun — Pass 2 (patched text, Cases 4 and 6 only)

Applied: [§6.1](OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md#61--reversibility-and-outcome-neutrality-are-independent-properties)
(reversibility ≠ outcome-neutrality) and [§6.2](OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md#62--outcome-neutrality-is-not-an-unlimited-engineering-obligation)
(neutrality is not an unlimited obligation; disproportionate cost escalates). Cases 1, 2, 3, and 5 are
unaffected by these patches and are not rerun — their verdicts stood on §1, §3a, and §5, none of
which changed.

### Case 4, rerun — Reversible UI experimentation

**Re-applying the text.** §6.1 now states the distinction directly: *"cheap reversibility does not
excuse encoding"* and *"expensive irreversibility does not itself establish non-neutrality."* Applied
to the Larry Practice Workspace spec (`7b868d8f3`): the artifact renders no live `practitioner_clients`
or `relationship_spaces` data, asserts no resolution of ruling 1, and its correctness under §1's
encode test does not depend on which way ruling 1 goes. Its reversibility (cheap — it is a draft
spec) is now explicitly irrelevant to that conclusion rather than doing the load-bearing work.

**Verdict: ✅ clean — no longer ambiguous.** The gap was that a reader had to reconstruct why
reversibility didn't decide the case; §6.1 now says so directly, and the verdict itself is unchanged
(the spec was always going to pass) but no longer depends on unstated reasoning. A **contrasting**
instance now also resolves cleanly under the same text: a UI wired to real `practitioner_clients` rows
and shipped behind a flag would **fail** §1 regardless of how easily the flag could be turned back
off — exactly the asymmetry §6.1 states.

### Case 6, rerun — Neutrality itself costly to build

**Re-applying the text.** §6.2 now directly addresses the case: *"When preserving neutrality would
impose disproportionate complexity, cost, or architectural distortion, construction should stop, and
the... question should be escalated for ruling."* Applied to the hypothetical polymorphic Placement
container: if the dual-write shim / abstract lookup layer is disproportionate relative to simply
ruling 1, §6.2 now names response 3 (escalate) as the one the cost signal points toward — response 1
remains available and is not forbidden, but is no longer the undifferentiated default once cost is
disproportionate.

**Verdict: ✅ clean — no longer ambiguous.** Reading A and Reading B from the original test (cost is
irrelevant vs. cost should tip toward escalation) are no longer both defensible: §6.2 adopts Reading B
explicitly, while preserving the Case-5 discipline that cost can never be spent to *choose an outcome*
(§6.2's three-part split: evidence the cost / do not rule by cost / a settled ruling exits via §5).
⚠️ **What §6.2 does not remove:** the workstream still exercises judgment on what counts as
"disproportionate" — the instrument gives a decision procedure (evidence → escalate-if-disproportionate
→ exits via §5 once ruled), not a numeric threshold. That is judgment applied *within* a rule, not the
absence of one — the same kind of bounded discretion §6 already leaves in choosing between responses
1 and 2.

### Pass 2 result

| # | Case | Pass 1 | Pass 2 |
|---|---|---|---|
| 4 | Reversible UI experimentation | ⚠️ ambiguous | ✅ clean |
| 6 | Neutrality itself costly | ⚠️ ambiguous | ✅ clean |

**6 of 6 cases now resolve unambiguously.** Both patches did what they were written to do, tested
against the same concrete grounding (the Larry Practice Workspace spec for Case 4; the hypothetical
Placement container for Case 6) used in Pass 1 — the rerun did not substitute easier cases.

---

## What the two passes together establish

⭐ **Establishes:** all six adversarial cases now resolve unambiguously against the patched
instrument — §1's encode test, §3a's authority scoping, §5's exclusion, and §6/§6.1/§6.2's response
discipline hold across six structurally distinct cases without hand-waving, including one drawn from
measured production history rather than hypothesis (Case 5, the `k1` finding) and two that required
patching before they resolved (Cases 4 and 6).

⭐ **Establishes, specifically:** the Pass-1 gaps traced to one root cause — the text conflated an
artifact's *reversibility* with its *outcome-neutrality*. §6.1 and §6.2 separate those axes explicitly
rather than papering over the conflation, and the rerun confirms the separation is what closed both
cases, not merely restating the original conclusions with more words.

⛔ **Does not establish:** that six adversarial cases exhaust the space. A clean pass on six
constructed and historical cases raises confidence; it is not a proof the instrument has no further
gaps, only that this particular stress test found none after patching.

✅ **Superseded by event:** the paragraph above described this test's relationship to a ratification
decision not yet made. The founder has since ratified
[Outcome-Neutral Construction](OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md) (2026-08-09), naming this
test's two-pass result as supporting evidence. This document remains the evidentiary record, not the
ratifying act — the act itself is recorded in the instrument's own header.

## Not authorized by this document

⛔ Any constitutional ruling beyond what the Founder Ratification names · ⛔ retroactively expanding
what this test is evidence for.
