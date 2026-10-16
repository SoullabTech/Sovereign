# RGR-GRM-A02 — Adversarial Source Review and Defeat Conditions

**Date:** October 16, 2026
**Review class:** assistant-authored source/methodology challenge; NOT independent human verification or Founder adjudication
**Base:** exact GRM-A01 commit `1cc463da4d660a6bbf351df5847c4108d8166d4e`, stacked under draft PR #1833
**Disposition:** DOCUMENTARY DESIGN CANDIDATE / RETURN_FOR_SPECIFICATION; no empirical or preregistration standing

## Adversarial findings and required negative controls

| ID | Challenge | What the A02 toy actually establishes | What remains to defeat before a real experiment |
|---|---|---|---|
| D01 | A01 label tracked components/reciprocity rather than a difficult relation | Same untyped adjacency and zero reciprocity in both A02 worlds | Any cheap typed-graph feature may still perfectly solve the proxy |
| D02 | Changed edge-label totals could reveal the answer | P and Q are checkerboard-switched with equal global label counts | A prose renderer could leak by length, syntax or other label-specific cues |
| D03 | Per-vertex typed degree could give away the class | Exactly equal per-vertex in/out typed-degree histograms | Endpoint-specific 2-hop relations can still reveal the class |
| D04 | Bag of typed two-hop motifs could classify without global composition | Global typed 2-hop-label histogram is equal | Richer 2-hop endpoint-conditioned graph models are valid competitors, not "cheats" |
| D05 | A trivial graph parser gets exact access to edges | An exact 3-step typed path solver is a clear privileged graph ceiling | Train/validation-learned text-to-graph parsing must be a fair same-text competitor |
| D06 | New family is merely RGR-04 with a renamed label | A02 uses six nodes, nine arcs, typed 3-hop predicate; RGR-04 D2C-01 is six-node/eight-edge directed 2-step | Must preserve RGR-04 seeds, thresholds, releases, TEST and REPLICATION without contamination |
| D07 | One fixed hand-crafted network cannot support transfer | The graph verifies finite possibility of a matched pair, not a population | Must show at least two independently reviewed families / held-out templates, before data generation |
| D08 | Meaning vocabulary exceeds artificial graph task | Only a typed message-routing proxy is asserted | No leap to living meaning, client report, dream interpretation or psychological diagnosis |
| D09 | Multiple paraphrases give subspace an unfair input advantage | Study law requires equal view count/text access for vector, multiview, graph and Grassmann candidates | Same encoder, training labels, augmentation, compute and tuning budgets must be verified |
| D10 | Same label family on both train and test could leak renderer syntax | Future split is root/template/domain grouped; none materialized now | Unknown cross-domain surface/structure feasibility and independence remain unresolved |
| D11 | Positive evidence could be selected after looking at scores | No model scoring, dataset, sample count, margin or TEST has been executed | Precommit threshold, uncertainty, comparison multiplicity, stop/no-rescue and replication |
| D12 | Source traditions or proprietary methods might be borrowed too strongly | RGR-01/02/03, A01 and named Sophontic/academic strands kept distinct | Human research/attribution review and future rights/licensing checks |
| D13 | A graph's return edge could be marketed as literal human Flow | t→s is a toy directed return arc, not a physical mechanism | Keep AIN FLOW_D derived and typed; Weather/Elements out of labels |
| D14 | A strong symbolic rival trivially wins | This is explicitly allowed as a scientific outcome | Do not claim geometry necessary or "novel" when ordinary representation solves the task |

## Mathematical reference invariants to verify

The source includes precisely **two explicit, hand-authored graphs**, a positive G+ and negative G− on the same vertices s,a,b,c,d,t and identical nine directed edges. Each is typed, not weighted or temporal.

Required exact test conditions:
- Nine edges and six named vertices with no loops/duplicates; graph arc set **exactly identical**.
- All six vertices are mutually reachable by directed paths; no reciprocal arc pairs in either world.
- Same typed incoming/outgoing degree vector at each named vertex.
- Same global edge-label counts; same canonical token bag of one clause per arc.
- Same **global multiset** of two-hop adjacent label pairs.
- Both worlds contain the two separate fragments OPEN→P and P→ACK.
- G+ has exactly **one** source s to target t 3-hop route of labels OPEN,P,ACK; G− has **zero**.
- Partial switch of one edge label alone fails the matched typed-degree invariant.
- Coherent node relabelings preserve every invariant and change no target; edge reorder does not change a count.
- Source files and canonical RGR-06/RGR-04 records remain byte-identical to the exact parent.
- No records containing member/private/clinical data, benchmark results, model state or provider calls.

**Important**: the two-hop histogram is aggregated over the graph and omits endpoint identities. Its equality **follows algebraically** from fixed per-node typed incoming/outgoing degrees (for labels i,j, sum over vertices of indegree_i times outdegree_j). It is not a second independent invariance discovery. Do not silently widen this claim to equality of all anchored two-hop subgraphs; source-anchored OPEN,P walks end at different vertices in the two worlds. The exact three-hop test is a small discrete graph fact, not geometry or machine learning.

## Scientific review and possible dispositions

This challenge should ordinarily receive **RETURN_FOR_SPECIFICATION** until its target validity is supported by multiple topology/template families, a renderer/split feasibility protocol, and an actually competitive same-text symbolic baseline. A perfect oracle on latent graphs is not a fair learned competitor. A grammar-aware parser built using the renderer's hidden rules needs explicit privilege labels.

Potential next review outcomes:
- **RETAIN_AS_CALIBRATION_ONLY:** this checkerboard is a useful proof of local-vs-compositional distinctions but too easy for confirmatory learned-model geometry claims.
- **RETURN_FOR_STRONGER_FORMAL_TARGET:** improve the mathematical family or task while retaining old records and documenting exactly which invariant was relaxed.
- **DESIGN_BASIS_ACCEPTABLE_ONLY:** authorize preparation of a separately named/preregistered *multi-template* protocol, but **not execution**.

No independent human review, new RGR gate, Founder authorization, generator installation, model benchmark, or product change follows from this assessment.

## Specific source lineage

- Canonical RGR-00: relation is inquiry; geometry is candidate.
- RGR-01: subspace/Grassmann as one of several approaches, with serious analogy/graph/symbolic alternatives and no metaphysical proof.
- RGR-02: typed contextual ten-heading scaffold, no Flow primitive #11.
- RGR-03: relation-preserved under surface change AND relation-broken at matched surface; matched information-access requirements.
- RGR-04/06: frozen September D2C benchmark plus confirmatory implementation lock; H-RT1 unestablished.
- RGR-05A/05B October: derived first-class Flow and separate frozen-budget sampler failure; no rescue by reusing a new toy.
- RGR-CF01/RGR-EVAL-CAUSAL-01 October 12: different governed intakes, not automatically amended.
- GRM-01 PR #1832: noncanonical formal synthesis, 13 hand-authored/document tests.
- GRM-A01 PR #1833: simple cycle-calibration design, 15 hand-authored/document tests and a separate method review.
- **A02 candidate**: direct mathematical source construction, not a method copied from Sophontic, Zhou et al. or Burger. Sophontic model-internal geometric reasoning remains a separate corporate source program.

**Final epistemic rule:** finding a graph contrast invisible to selected local marginals does **not** mean "meaning has been geometrically proven". The chosen three-hop rule is an explicit symbolic relation; a meaningful geometry claim needs later, separately authorized comparison that survives the strongest simple explanations.
