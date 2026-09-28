# AIN-SOURCE-FABRIC-02R4 — Blind Validation A Witness

**Date:** 28 September 2026
**Frozen R3 rule base:** `c8332853c9ef4222faf4754832f3bacc91ca7a0e`
**Frozen blind-set base:** `84816958f8a044b9296c4b49161deafbb3c00b0c`

## Method

The 24-query blind set was committed and pushed before execution.

No R3 threshold, reranking weight, evidence-mode rule, or claim detector was changed before the blind run.

The set contained:

- 8 focused supported inquiries;
- 8 distributed supported inquiries;
- 8 unsupported / absent inquiries.

The same fixed 26-source corpus, 1,735 chunks, BM25 lane, local `nomic-embed-text` lane, RRF fusion, metadata-aware callosal reranking, and R3 abstention rules were used.
## Blind result

Answerability accuracy:

> **21 / 24 = 87.5%**

Supported false abstentions:

> **0 / 16**

Unsupported false answers:

> **3 / 8**

The three failures were:

- **BN3** — Astrology “proves” that a member will marry next year;
- **BN4** — Dream “confirms” actual communication from a deceased parent;
- **BN6** — a source “proves” the member is a narcissist.

All three had plausible semantically adjacent sources and therefore passed evidence-strength checks.
## Falsification

The blind set falsifies the idea that R3 evidence sufficiency plus its narrow prediction detector is enough for general unsupported-claim abstention.

The defect is not:

> semantic retrieval is too broad.

The defect is:

> **claim standing is under-specified.**

R3 recognized explicit prediction language such as “destined” and “predict,” but did not yet generalize across:

- certainty-framed future claims;
- external-revelation claims;
- diagnostic identity claims.

Therefore graph expansion remains closed.
## Correct abstentions

Five unsupported inquiries were correctly refused by weak-evidence abstention:

- BN1 — insulin dosing;
- BN2 — Mars orbital mechanics;
- BN5 — another person's hidden motives;
- BN7 — tax deductions;
- BN8 — guaranteed lottery outcome.

BN8 abstained because evidence was weak, not because the claim-sufficiency layer correctly understood the guarantee/prediction form.

That distinction matters.
## Supported retrieval result

Average must-source recall across the 16 supported blind inquiries:

> **0.8646**

Full must-source coverage:

> **12 / 16**

The four partial misses were all distributed inquiries:

- BD1 — authorship / member authority across writing + teaching;
- BD2 — provenance across House + Elemental Alchemy + Indra;
- BD4 — symbolic systems without prediction/destiny;
- BD7 — absence-preservation across center + retrieval.

This is consistent with the earlier finding that broad field queries are the remaining retrieval weakness.
## Standing

**BLIND VALIDATION A — PARTIAL PASS / MATERIAL CLAIM-STANDING FAILURE.**

Accepted evidence:

- no supported inquiry was falsely abstained;
- focused evidence sufficiency generalized reasonably;
- distributed retrieval still has coverage gaps;
- unsupported-claim generalization is incomplete.

Required repair before graph expansion:

> **R4R1 — CLAIM-SUFFICIENCY GENERALIZATION ONLY**

The repair must distinguish at least:

- prediction / guaranteed future outcome;
- external revelation / communication claims;
- diagnostic or totalizing identity claims;
- third-party interiority claims.

After repair, a second unseen blind set is required before graph expansion may open.
