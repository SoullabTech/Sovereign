# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8-R1 SELECTIVE Founder Ruling

**Date:** 2026-09-17
**Status:** ✅ **FOUNDER RULING — GRANT SELECTIVE**
**Authority class granted:** `SELECTIVE`
**Contract:** `J8-R1-EA-SELECTIVE-v1`
**Contract SHA-256:** `cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928`
**Effect scope:** `current_turn_retrieved_evidence_membership`
**Canonical base at custody:** `12f136634ac848e320b7ed04f36cf2790fcc68ae`

## Founder act

> **GRANT SELECTIVE — For J8 governed retrieval only, after J6 source authority and the exact J8 model/corpus attestations pass, contract `J8-R1-EA-SELECTIVE-v1` at SHA-256 `cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928` may use the attested local embedding representation to determine membership in the bounded current-turn retrieved-evidence result. This grant does not alter source identity, corpus admission, rights, validity, eligibility, or continued corpus standing; domain/categories remain descriptive. Any change to the contract digest or any failed authority/attestation condition invalidates the grant until re-adjudicated.**

## Effect of the ruling

This act grants the exact attested SELECTIVE contract authority to decide membership only in the bounded evidence set used for one current MAIA turn.

The grant is effective only after all upstream conditions required by the contract pass:

1. J6 runtime source authority names the exact governed source path + SHA;
2. the SELECTIVE contract recomputes to the exact SHA-256 above;
3. the running local embedding model matches the contract's exact model artifact digest;
4. source applicability passes;
5. the stored corpus text/vector attestation passes;
6. chunk selection remains inside the exact contract policy.

Failure of any condition yields no governed retrieval and does not alter upstream source standing.

## Explicit non-effects

This founder act does **not**:

- authorize a different contract digest;
- make embeddings, similarity, taxonomy, classification, or table membership AUTHORITATIVE upstream;
- change source identity, rights, admission, validity, eligibility, or continued corpus standing;
- make `domain` or `categories` authority-bearing on the governed path;
- admit another source;
- authorize corpus, Library, schema, or production writes;
- authorize merge of a stale or different Class A head;
- authorize deployment;
- close J8;
- establish that production member turns currently use governed EA retrieval.

## Consequence for the candidate

`GovernedSelectionGrant.ts` may change only from `PENDING_FOUNDER_GRANT` to `GRANTED` and bind `founderRulingRef` to this record. The contract id, contract digest, authority class, effect scope, model/corpus attestations, applicability policy, and chunk-selection policy remain unchanged.

After that exact mutation, the candidate must rerun its complete Class A evidence population on the new exact head. Green evidence makes the head eligible for a **separate founder merge ruling**; it does not authorize merge by inference.

## Standing

```text
SELECTIVE grant                  ✅ GRANTED
contract id                      J8-R1-EA-SELECTIVE-v1
contract SHA                     cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928
effect scope                     current-turn retrieved-evidence membership only
merge                            ⛔ NOT AUTHORIZED BY THIS RULING
deploy                           ⛔ NOT AUTHORIZED BY THIS RULING
J8                               ⛔ STOP pending merge/deploy + J8-R2 production witness
```
