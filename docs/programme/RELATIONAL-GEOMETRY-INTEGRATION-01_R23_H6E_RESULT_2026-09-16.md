# RELATIONAL-GEOMETRY-INTEGRATION-01 — R23 / H6e Result

**Status:** EXECUTED · FORMAL DYNAMICS PASS  
**Date:** 2026-09-16  
**Authority:** offline deterministic research only

## Question

Can configuration topology change system behavior beyond the meanings and strengths of its component relations?

Five H6d topology-collision pairs were simulated. Within each matched trial the two graphs had:

- the same node set;
- the same multiset of relation operators;
- the same sampled operator strengths;
- the same initial node state;
- the same update law.

Only **incidence topology** differed.

The update rule was a bounded local interaction model, not a psychological model:

```text
x[t+1] = tanh(0.72*x[t] + 0.32*weighted-neighbor-influence)
```
## Result

500 matched trials were run for each of five topology-collision pairs (2,500 total).

| Collision family | Final-state divergence rate |
| --- | ---: |
| cross-constraint topology | 99.0% |
| resonant topology | 98.8% |
| optional/focal topology | 84.6% |
| polarity-mediation topology | 99.0% |
| balanced-cross topology | 75.2% |

Mean divergence rate across families: **91.32%**.

All five pairs had positive mean final-state distance. A bag-only representation, forced to make the same prediction for two graphs with identical operator inventories, therefore carries irreducible error on this formal benchmark.

Topology also changed which node became dominant in roughly **18%–53%** of trials depending on family, and changed final sign pattern in roughly **24%–74%**.

## Interpretation

H6e supports the narrow formal proposition:

> **Under a fixed local interaction law, incidence topology can alter global trajectory even when relation types and strengths are unchanged.**

This is the behavioral counterpart to H6d's representational result. H6d showed that configuration identity cannot be recovered from the inventory of component relation types alone; H6e shows that the missing incidence geometry can matter dynamically as well.
