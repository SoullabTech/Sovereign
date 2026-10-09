# JEV-INT-05 — worked payload and data boundaries (derived from the implementation)

**Documentation only. Jev is OFF. Nothing here authorizes a request.** No code changed, no provider contacted, no credential used (placeholders only), the committed switch is still `witnessed: false` (capture reports `committed_switch_witnessed: false`).

## 0. How this was derived (not reconstructed)
`scripts/builder/__tests__/jev-wire-payload-capture.mjs` runs the **real** frozen modules — `planAttempt` (wire body), the reviewed HTTP adapter (headers, framing), the real runner and ledger — against a **loopback capture server** with the placeholder key `<API-KEY-PLACEHOLDER>`. The switch is opened only in a temporary copy of the wire module (as the test suites do). Raw output: `docs/programme/evidence/jev-int05-payload-capture-20261008/payload-capture.json` (SHA-256 in `SHA256SUMS.txt`). Checks recorded: 31 attempts captured; every captured body is byte-identical to the planned body (`all_bodies_match_plan: true`); 19 distinct bodies (the other 12 are deliberate repeats of F01, F10, F14 to observe consistency).

**Identities, stated precisely (corrected 2026-10-09).**
- Fixture-list hash `a0f4a26cea085527783a62c8875fdf60f2fed93d1f4ff48d2285ab5288c24f60` — unaffected by the switch.
- Question-table hash of the **committed, closed** candidate: `6bb269d84c674d14730ecd0519ef48caef430e764fde9e32eb2f1f267610064e` (this is what the DRAFT grant template carries).
- This capture ran in a temporary copy that differs from the committed module **only** by `witnessed: true`. The table hash includes the response-shape gate, so that copy's table hash is different: `4b953ff148e209d4c2518647a39868d793d96faaaf8477732ab4043095d2f6dc`. The first version of this document printed that value as if it were the table hash; it is the hash of an illustrative open-switch copy, not of any committed artifact.
- **Neither value is a grant identity.** A grant must bind the table, fixture and schema hashes of the *final reviewed activation candidate's own bytes* (sequencing law: `…FINAL_MAC_HARNESS_REVERIFICATION_AND_GRANT_SEQUENCE_2026-10-08.md` on branch `fix/jev-int05-live-wrapper-hardening-20261007`). The request bytes in §1–§2 do not contain the response-shape gate and are identical in both copies (same fixture-list hash).

## 1. The first request, exactly (attempt F01 — 1 of 31)
```
POST /v1/systemone HTTP/1.1
content-type: application/json
content-length: 359
accept: application/json
authorization: Bearer <API-KEY-PLACEHOLDER>
connection: close
user-agent: jev-wire-adapter/1
Host: <HOST>

{"model":"jev-1.13.0","questions":{"Q_RISK":{"instructions":"Does this appear to cross a structural-risk boundary?","type":"noul"}},"state":{"change_scope":{"auth":false,"file_count":1,"migration":false,"production":false},"contains_sensitive":false,"packet_version":"jev-3","question_id":"Q_RISK","requires_external_info":false,"task_shape":"CODE_GROUNDED"}}
```
- Body: 359 bytes, canonical JSON (sorted keys, no whitespace), sent exactly as planned; SHA-256 `1f97669a0301af2fe349f1121c68e61c42a87d9dd969d6956c544057b525b97a`.
- Remote target would be `https://api.typesafe.ai/v1/systemone` (pinned in code; any other host is refused). `<HOST>` above is the capture server's address; on the real call it is `api.typesafe.ai`. Over TLS only the protocol framing differs.
- The bearer value is the operator's API key. **In this document it is a placeholder; the key is never written to the repository, the ledger, or the summary.**

### What each body field means
| Field | Value in F01 | Source |
|---|---|---|
| `model` | `jev-1.13.0` | pinned model id |
| `questions.Q_RISK` | `type: noul`, fixed English sentence *"Does this appear to cross a structural-risk boundary?"* | frozen question table (`jev-wire-q2`) |
| `state.packet_version` | `jev-3` | J1 packet version |
| `state.question_id` | `Q_RISK` | the one question |
| `state.task_shape` | `CODE_GROUNDED` | one of the J1 task shapes |
| `state.change_scope.file_count` | `1` | a number |
| `state.change_scope.migration / auth / production` | `false` | booleans |
| `state.requires_external_info`, `state.contains_sensitive` | `false` | booleans |

The **attempt id (F01), experiment id, ledger data, operator name, repository text, file paths, member data and any MAIA content are not in the body.** The fixture packets are invented configurations of those six fields.

## 2. All 31 requests (bodies are fixed; nothing is generated at run time)
| Attempt | task_shape | file_count | flags set | bytes | body SHA-256 (prefix) |
|---|---|---|---|---|---|
| F01 | CODE_GROUNDED | 1 | none | 359 | `1f97669a0301` |
| F01.r1 | CODE_GROUNDED | 1 | none | 359 | `1f97669a0301` |
| F01.r2 | CODE_GROUNDED | 1 | none | 359 | `1f97669a0301` |
| F01.r3 | CODE_GROUNDED | 1 | none | 359 | `1f97669a0301` |
| F01.r4 | CODE_GROUNDED | 1 | none | 359 | `1f97669a0301` |
| F02 | ARCHITECTURE_REASONING | 1 | none | 368 | `0584088c4794` |
| F03 | ADVERSARIAL_FALSIFICATION | 1 | none | 371 | `f3d44dbffd4c` |
| F04 | LONG_HORIZON_DECOMPOSITION | 1 | none | 372 | `87547252e4f7` |
| F05 | EVIDENCE_SYNTHESIS | 1 | none | 364 | `5d0dfca30b84` |
| F06 | FRONTIER_UNKNOWN | 1 | none | 362 | `e2d8d2e2de9a` |
| F07 | CODE_GROUNDED | 1 | migration | 358 | `6a5a50b329be` |
| F08 | CODE_GROUNDED | 1 | auth | 358 | `a47a352b0fe2` |
| F09 | CODE_GROUNDED | 1 | production | 358 | `d2500ca8a975` |
| F10 | CODE_GROUNDED | 1 | external-info | 358 | `f2cc5793b358` |
| F10.r1 | CODE_GROUNDED | 1 | external-info | 358 | `f2cc5793b358` |
| F10.r2 | CODE_GROUNDED | 1 | external-info | 358 | `f2cc5793b358` |
| F10.r3 | CODE_GROUNDED | 1 | external-info | 358 | `f2cc5793b358` |
| F10.r4 | CODE_GROUNDED | 1 | external-info | 358 | `f2cc5793b358` |
| F11 | CODE_GROUNDED | 0 | none | 359 | `0eda17dca00f` |
| F12 | CODE_GROUNDED | 10 | none | 360 | `b1b71dfed371` |
| F13 | CODE_GROUNDED | 10000 | none | 363 | `b89500f1b60a` |
| F14 | CODE_GROUNDED | 1 | migration+auth+production | 356 | `b719a1d1c8f3` |
| F14.r1 | CODE_GROUNDED | 1 | migration+auth+production | 356 | `b719a1d1c8f3` |
| F14.r2 | CODE_GROUNDED | 1 | migration+auth+production | 356 | `b719a1d1c8f3` |
| F14.r3 | CODE_GROUNDED | 1 | migration+auth+production | 356 | `b719a1d1c8f3` |
| F14.r4 | CODE_GROUNDED | 1 | migration+auth+production | 356 | `b719a1d1c8f3` |
| F15 | ARCHITECTURE_REASONING | 1 | migration+auth+production | 365 | `e9e28e814668` |
| F16 | ADVERSARIAL_FALSIFICATION | 1 | migration+auth+production | 368 | `bedd18b01262` |
| F17 | LONG_HORIZON_DECOMPOSITION | 1 | migration+auth+production | 369 | `ebfeca6d9b50` |
| F18 | EVIDENCE_SYNTHESIS | 1 | migration+auth+production | 361 | `63e41aec02b9` |
| F19 | FRONTIER_UNKNOWN | 1 | migration+auth+production | 359 | `0a0864a698dc` |

Every body has the same shape as F01; only the six packet values differ. Bodies range 356–372 bytes (≈10.9 KiB in total).

## 3. The response the code accepts
Expected (OpenAPI snapshot sha256 `a191f8a7…c0360d5`):
```json
{"model":"jev-1.13.0","usage":{"input_tokens":300,"output_tokens":5},"answers":{"Q_RISK":{"type":"noul","noul":0.25}}}
```
`noul` is read as the probability of "yes"; there is no confidence field (the code records `provider_confidence_supplied: false`). The parser is strict: unknown or missing members, wrong types, non-integer or negative token counts, a probability outside 0–1, or a non-JSON / incomplete / oversized (default cap) / redirected / non-2xx response are **refused**, which halts the experiment. (A *different model id* is parsed, recorded, and then halts the run as model drift.) The first real response is the first time the real service's actual shape is seen; any difference stops the run rather than being adapted around. (The example above is the loopback mock's reply, not TypeSafe's.)

## 4. Boundaries
### What leaves our system
1. The request body above (≈0.36 KB, six synthetic fields + model id + fixed question).
2. Implicit connection data: the **API key** (identifies the account), our public source IP, request time and size, TLS metadata, the header `user-agent: jev-wire-adapter/1`. These are not in the body but TypeSafe necessarily receives them.
3. Nothing else: no repository content, no member or MAIA data, no labels, no ledger or checkpoint content, no operator identity.

### What stays local
Credential (held by the operator, requested by callback only at send time, never logged or stored by the wrapper), the grant document, the attempt/experiment ids, the ledger and checkpoint, and every comparison with expectations.

### What is recorded locally (content-light)
Per attempt, in the hash-chained ledger and the independent checkpoint: `reserved` (attempt id, body hash, reserve amount) → `observed` (p_yes, model returned, token counts, latency, **the full canonical response text** and its SHA-256) → `settled` (cost). Observed records are *observations only*: they never pass through the J1 admission path and drive no JARVIS decision. The caller's summary is content-free.

### Conditions that immediately stop execution (each is permanent until a human inspects)
- Off-switch closed, no valid grant, grant hash not confirmed by the operator, grant outside its window/caps, or — for a real-provider grant — an injected stand-in transport or test clock (before anything is created).
- Storage unsafe at start, or **changed at any later point** (checked before every attempt and again just before each send) → a `STORAGE_<check>` stop (e.g. `STORAGE_CHECKPOINT_DIR`); the two records are also required to agree immediately before each send.
- Attempt cap (grant, ≤31), spend cap (grant, ≤ $1.00 incl. a $0.005 reservation per attempt), grant expiry mid-run.
- Any non-ok outcome: transport error, **30 s deadline**, HTTP error, redirect, wrong content type, oversized/incomplete body, a response the parser refuses, model drift, usage above the reservation → recorded as halted; **no retry and no resend**.
- A crossing of unknown outcome (request may have left, no valid answer) halts permanently and is never resent.
- Ledger/checkpoint unavailable or disagreeing → structured stop (`HISTORY_UNAVAILABLE`, `STORES_DISAGREE`); nothing is repaired automatically.

## 5. Not established by this document
- What TypeSafe does with the request after receipt (retention, logging, telemetry, sub-processors): **terms not yet reviewed** — to be added to the brief by the reviewer.
- The real service's actual response, headers, rate limits or TLS behaviour: untested. The loopback capture proves what *we send*, not what *they return*.
- Whether the invented fixture combinations are the right test of Jev's judgment: not evaluated; this experiment measures the connection and cost only.
