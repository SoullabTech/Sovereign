# Doctrine Contradiction Map

**Between:** `docs/canon/CIRCLE_FIELD_DOCTRINE.md` (unmodified, byte-identical) · the substrate as
built · the Research Supplement · the draft Constitution.

⛔ **This map does not resolve anything.** Each row states the divergence and names the founder
ruling that would close it. `CIRCLE_FIELD_DOCTRINE.md` is canon and is not edited by this lane.

**Three kinds of divergence, kept apart:**
- **D — doctrine vs. code** · **R — doctrine vs. research** · **S — doctrine vs. itself / silence**

---

| # | Kind | Doctrine says | Reality | Closes with |
|---|---|---|---|---|
| **C-01** | S | *"Feel → Contribute → Browse. Never reversed. Never collapsed."* Stated as governing Circle participation generally | The **research now contradicts the general reading** (R4): compulsory contribution before witnessing is unsupported, and peripheral participation is a legitimate posture. The **implementation** applies it to inquiries only — **closer to correct than the doctrine wording** | **A-06** — scope the wording to structured inquiry, or amend |
| **C-02** | D | (same) | `listFeed` has no contribution precondition | folded into **A-06.** ⚠️ **DISCOVER-v1 called this a 🔴 defect. Corrected: the code is not the thing that is wrong here.** |
| **C-03** | D | *"No counts, percentages, or scores in any circle surface"* | `listInquiries` returns `response_count::int` | **B-06** — needs a doctrine reading (is a count the system holds but does not render a violation?) |
| **C-04** | D | *"MAIA inside a circle is a steward of coherence, not a content generator"* | **MAIA has zero presence in a Circle.** No call sites | **A-12** — and it is an honest absence, not a false claim |
| **C-05** | R | *"She does not summarize… She reflects the field back to itself"* — reads as a blanket prohibition on synthesis | The Habermas Machine evidence shows AI mediation **can** improve deliberation and incorporate minority critique. **A blanket prohibition would be a claim the evidence contradicts** | **A-12** — resolve as *default Field Witness, invoked Mediator*, not as a prohibition |
| **C-06** | S | *"2-member minimum for theme surfacing (anonymity threshold)"* | The mechanism it governs was **removed** by the 2026-07-17 ruling; signals are hardcoded empty. The constraint is unreachable | founder note — the constraint outlived its object |
| **C-07** | S | *"One inquiry at a time per circle (prevents fragmentation)"* | Sound today. But **R6's differentiation lifecycle** implies a Circle may legitimately hold two live inquiries **as the signal that a birth is emerging.** The rule may be enforcing the very state it should surface | **A-07 / A-08** |
| **C-08** | S | Facilitator philosophy is listed as an **open question the doctrine itself never answered** | Meanwhile `helper` and `facilitator` roles are **implemented and load-bearing** (only they may open inquiries). **Implementation has been standing in for doctrine** | **A-10** |
| **C-09** | S | *"Reversible at all times"* | An inquiry response **cannot be withdrawn**; `field_synthesis` cannot be edited | **A-06b** |
| **C-10** | S | *"Circles develop distinct character through accumulated memory and inquiry — never through configuration"* | Emergent identity has **no substrate**: no Circle-level memory, and `field_synthesis` is a single free-text field written by one person at close | **A-07**, then CIRCLE-05 |
| **C-11** | R | *"A circle should feel more like entering weather than opening a chat room"* | Supported — and now given a competitive edge: Circle.so and Mighty optimize *connections → retention*; Discourse and Reddit optimize *scalable Commons*. **None constitutes a bounded field.** The doctrine's felt-quality language is the product thesis | no ruling needed; record as strategic |
| **C-12** | S | Doctrine has **no concept of rupture**. Its Open Questions cover tone, facilitation, MAIA's voice, and observation — **conflict is absent entirely** | R5: rupture is multi-directional, affects non-parties, and increases with subgroup formation. **The doctrine is silent on the thing most likely to end a Circle** | **A-11** — a genuine gap, not a contradiction |
| **C-13** | S | Doctrine has **no lifecycle**. No rest, completion, birth, or separation | R6 supplies one, founder-authored | **A-07** |
| **C-14** | D | *"Manual sharing only (consent is structural)"* | ✅ **Enforced.** `shareArtifact` throws `CONSENT_REQUIRED`. No divergence — recorded so the map is not read as all-negative | — |
| **C-15** | S | Doctrine speaks only of **Circle**. It has no Constellation, no Commons relation, no Co-Lab bridge | Amendment B supplies the surrounding ontology | **A-03** |

---

## The pattern

Three distinct things are happening, and they should not be repaired the same way:

1. **The doctrine was written for one field, alone.** C-12, C-13, C-15 are *absences* — rupture,
   lifecycle, and the surrounding ontology were never in scope. **Additions, not corrections.**
2. **Implementation has quietly stood in for doctrine** where doctrine left questions open — most
   sharply at C-08, where roles the doctrine never defined are already load-bearing in code.
   ⛔ **Ratifying the implementation is one of the three launderings this lane forbids.**
3. **Two doctrine statements are now contradicted by evidence**, not by code: C-01 (the general
   reading of the interaction order) and C-05 (the blanket reading of "does not summarize").
   Both are **over-broad statements of principles that are right in their proper scope.**

**None of these makes the doctrine wrong.** It was written from observation, for a smaller
question, and it named its own open questions honestly. The lane's job is to widen it by founder
act — never by drift.
