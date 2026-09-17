# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8 Production Witness

**Date:** 2026-09-17
**Deployed repair SHA:** `145d2c13cc787187af101a5c19081592616ee4d3`
**Production route:** `/api/sovereign/app/maia/list`
**Witness member:** existing production `Tester` account via verified `auth_sessions` credential; credential not recorded.
**Disposition:** J8 remains **STOP**. FAST and CORE pass; DEEP retrieval/admission passes but downstream DEEP cognition does not produce a source-grounded response.

## 1. Deployment proof

The governed immutable-SHA deploy completed successfully from `145d2c13cc787187af101a5c19081592616ee4d3`.

- built image provenance: `GIT_COMMIT=145d2c13c` equals asserted target;
- running container provenance: `printenv` equals `Config.Env` equals asserted target;
- `maia-sovereign` healthy after swap;
- no pending SQL migration was applied;
- `/api/health`, `/api/version`, `/api/ready`, main page, build-route locks, and constitutional verification all passed.

## 2. Canonical member-turn witness

All three witnesses used the actual authenticated production `/maia/list` route, non-Sanctuary posture, fresh session/exchange ids, and the deployed repair SHA. A body-supplied member id was not used; route identity was resolved through a valid production session credential.

| Path | HTTP | Governed retrieval | Canonical producer | Shadow | Cognition result | Verdict |
|---|---:|---|---|---|---|---|
| FAST | 200 | 3 hits, `elemental-alchemy`, max similarity `0.787` | `retrieved.governed_knowledge` ADMITTED, 6000 chars | `zeroDiff:true` | 1,584-char Elemental Alchemy answer | PASS |
| CORE | 200 | 3 hits, `elemental-alchemy`, max similarity `0.799` | `retrieved.governed_knowledge` ADMITTED, 6000 chars | `zeroDiff:true` | 3,082-char Elemental Alchemy answer; explicit governed-knowledge injection log | PASS |
| DEEP | 200 | 3 hits, `elemental-alchemy`, max similarity `0.822` | `retrieved.governed_knowledge` ADMITTED, 6000 chars | `zeroDiff:true` | 18-char fallback: `Im here with you.` | STOP |

## 3. FAST evidence

Exchange `109537bb-021c-4118-81f6-d419c30675d5` selected `FAST`.

The production log reported:

- `[AIN Governed] retrieved=3 sources=elemental-alchemy maxSimilarity=0.787`;
- canonical manifest `buildSha=145d2c13c`;
- `retrieved.governed_knowledge` disposition `ADMITTED`, class `retrieved`, authority `situate`, chars `6000`;
- `[MAIA/shadow] ... zeroDiff:true`.

The returned answer materially discussed fire, water, earth, and air as modes of consciousness in Elemental Alchemy.

## 4. CORE evidence

Exchange `698af351-8ea7-4cdd-88c7-d7b0c659adce` selected `CORE`.

The production log reported:

- `[AIN Governed] retrieved=3 sources=elemental-alchemy maxSimilarity=0.799`;
- `retrieved.governed_knowledge` ADMITTED at `6000` chars;
- `[MAIA/shadow] ... zeroDiff:true`;
- `📚 [Governed Knowledge] Exact-source retrieval injected (6000 chars)`.

The returned answer materially discussed each elemental mode across perception, relationship, embodiment, and transformation.

## 5. DEEP stop

Exchange `3e9da32a-0ca8-470c-b894-80a31dfcadcc` selected `DEEP`.

The authority/retrieval boundary passed:

- `[AIN Governed] retrieved=3 sources=elemental-alchemy maxSimilarity=0.822`;
- `retrieved.governed_knowledge` ADMITTED at `6000` chars;
- `[MAIA/shadow] ... zeroDiff:true`.

The downstream DEEP consciousness stage did not complete successfully. Production logs show local engine failures including HTTP 404 for configured models such as `deepseek-r1:latest`, `llama3.1:8b-instruct-q8_0`, `mistral:7b-instruct-q8_0`, `nous-hermes2-mixtral:8x7b`, and `llama3.1:70b-instruct-q4_k_m`, followed by:

- `[DEEP] Skipping local consciousness stage (slow/unavailable): consciousness-stage-timeout`;
- `Using fallback initial response`;
- Claude consultation disabled;
- final DEEP response length `18` chars.

Therefore this witness proves governed retrieval and canonical admission reach the DEEP boundary, but it does **not** prove that a successful DEEP cognition path consumed the governed source in a substantive response.

## 6. Corpus invariance after witness

After all three production member turns:

- rows: `1238`;
- distinct sources: `1`;
- chunk indexes: `0..1237`;
- vector dimensions: `768`.

The governed retrieval call does not pass a `userId` into `RetrievalService`; the analytics INSERT path is conditional on `userId`, so canonical governed retrieval remains read-only with respect to retrieval analytics.

## 7. Gate disposition

J8 is **not closed** by this witness.

- FAST canonical retrieval/composition: **PASS**.
- CORE canonical retrieval/composition: **PASS**.
- DEEP governed retrieval + canonical admission: **PASS**.
- DEEP successful governed-knowledge cognition: **STOP** because the configured local DEEP engine set is unavailable at runtime.

J9 and J10 remain closed. No provider/model installation, configuration change, corpus rewrite, or additional production repair is authorized by this record.
