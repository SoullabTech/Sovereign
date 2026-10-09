# JEV-INT-05 — final Mac harness reverification + grant sequencing

**Date:** 2026-10-08 EDT
**Engineering candidate:** `bd5b60f0fb9a2373e1b07fafc96546357fa42153`
**Status:** VERIFIED ENGINEERING EVIDENCE ONLY · **OFF** · NOT RATIFIED · NO LIVE EXECUTION AUTHORIZED

## Scope

This record closes the bounded verification-harness repair requested after the independent Mac review. It does **not** authorize TypeSafe access, provider registration, credentials, spend, execution, merge, deploy, J1 reopening, PILOT-01, or member data.

The repair keeps the production storage law intact. The proof may select an explicit test-only second device through `JEV_TEST_SECOND_DEVICE_ROOT`; the production wrapper never reads that variable and still requires distinct devices plus a verified mount point for `EXTERNAL_PINNED` execution.

The defeat matrix now requires a normal, complete named assertion death. A timeout, signal, spawn error, non-1 abnormal exit, missing final proof summary, or multiple/misnamed failures cannot count as a kill. Five direct classifier regressions cover: one valid named death and four invalid cases (timeout, signal, spawn error, incomplete output).

## Exact-source verification

A detached clean worktree was created at exactly:

```text
bd5b60f0fb9a2373e1b07fafc96546357fa42153
```

Mac local storage device: `16777230`.
Explicit second test device: `/Volumes/T7 Shield`, device `16777244`.
The devices were distinct. The T7 was used only for disposable loopback/mock test storage.

Fresh results on the exact commit:

| Check | Result |
|---|---:|
| live-wrapper proof run 1 | 16/16 |
| live-wrapper proof run 2 | 16/16 |
| live-wrapper proof run 3 | 16/16 |
| harness classifier regression fixtures | 5/5 |
| live-wrapper defeat matrix | 41/41 named kills, 0 problems |
| old live-wrapper negative control | 11 pass / 5 expected failures |
| HTTP adapter proof / matrix | 18/18 · 23/23 |
| checkpoint proof / matrix | 16/16 · 28/28 |
| wire proof / matrix | 37/37 · 49/49 |
| original findings, old candidate | 8/8 reproduced |
| original findings, repaired candidate | 0/8 reproduced |
| J1 freeze verifier | 0 violations · freeze intact |
| J1 host proof | 26/26 |
| J1 constitutional matrix | 63/63 named kills · 0 survivors |
| J1-specific TypeScript | PASS |

The first detached TypeScript invocation could not resolve `@types/node` because the detached worktree intentionally had no `node_modules`. The already-installed locked project `node_modules` was then bound by an ignored symlink, the J1-specific typecheck passed, and the symlink was removed. No source bytes changed and the detached worktree returned clean.

Evidence receipt:

```text
/Users/soullab/.maia-evidence/jev-int05-final-verification-bd5b60f0f-zw_w1t4s/receipt.json
sha256 c15dacdd98110735e49c339ec9adf68b0e7a57c92bb79236670e5b916d771848
```

Grant-sequencing diagnostic:

```text
/Users/soullab/.maia-evidence/jev-int05-final-verification-bd5b60f0f-zw_w1t4s/grant-sequencing.json
sha256 78f5585798a6b97a2a2b6b3783fde200934369ee5f731f2d031b9cad0bb609a6
```

## Frozen custody

Relative to wrapper base `41caa8f79af488fd8ea82442fe3586f03b13d15e`, these files remain byte-identical through the verified candidate:

```text
scripts/builder/jev-wire-v1.mjs
sha256 16ba1e3bcec8fd5bc8a68077ab634a6faedd39877c58b98f206d1e3bcc7904f0

scripts/builder/jev-wire-checkpoint-v1.mjs
sha256 e03c37c5cf663c1d68b610f5dfda728d9d96ff227ea289fbe657254322c5e704

scripts/builder/jev-wire-http-adapter-v1.mjs
sha256 c7b52e22714c116a641ead404e70736e2b9701a98b3fe57d34bb31b2958e75ac

scripts/builder/jev-judgment-host-v1.mjs
sha256 751d473df62eac31347d2a471e054e9cd5f851ac449e9086e147ba641b3e897b
```

The J1 freeze verifier is clean. No `PILOT-01` path changed in the hardening series. `RESPONSE_SHAPE.witnessed` remains `false`. `JEV-INT-05_EXECUTION_GRANT_TEMPLATE.json` remains `state: DRAFT`.

## Final-code / grant-hash sequencing law

The execution grant must bind the **final reviewed execution candidate**, not the currently closed code and not a prospective guess about the activation patch.

Reason: `QUESTION_TABLE` includes `RESPONSE_SHAPE`, and `questionTableHash()` hashes the complete table. The current closed candidate has:

```text
RESPONSE_SHAPE.witnessed = false
question table hash = 6bb269d84c674d14730ecd0519ef48caef430e764fde9e32eb2f1f267610064e
```

A test-only copy differing only by `witnessed = true` produces:

```text
question table hash = 4b953ff148e209d4c2518647a39868d793d96faaaf8477732ab4043095d2f6dc
```

Therefore the current DRAFT template's table hash is a hash of the **closed** candidate. It must **not** be promoted unchanged into an authorized live grant.

Required future order, if the Founder later chooses to proceed:

1. Keep the present candidate closed while governance, provider terms/DPA/retention/billing, disclosure, operator, credential custody, recovery role, storage mounts and spend decisions are reviewed.
2. Produce a **separate reviewed activation candidate**. Any required schema witness, response-shape correction, table-version change, and the explicit gate-opening source change must already be present in those exact candidate bytes.
3. Re-run the required engineering and constitutional verification on that exact activation candidate. A gate-open candidate is still not execution authority.
4. Compute `table_hash`, `fixture_list_hash`, and `schema_sha256` from those exact verified activation-candidate bytes.
5. Populate a fresh execution grant from those exact identities. Keep it DRAFT until the Founder actually authorizes the named experiment, operator, authorizer, disclosure, endpoint/network, mounts, time window and caps.
6. After authorization, hash the exact grant. The operator must echo that grant SHA-256. No code, table, fixture, schema, provider, endpoint or scope change may occur after the grant identity is fixed; any such change invalidates the grant and returns the process to review.
7. Only when **both** the exact reviewed code candidate and exact authorized grant agree, plus all independent governance/operations conditions hold, may a separately authorized operator consider the first real request. That first request counts as attempt 1. Nothing in this record authorizes it.

This sequence deliberately prevents a grant from authorizing a different code identity than the one actually capable of sending.

## Engineering disposition

The bounded harness-repair objective is satisfied as engineering evidence at `bd5b60f0f`:

- portable explicit test-volume fixture on Mac/T7 without weakening production storage law;
- abnormal harness deaths rejected;
- direct classifier regressions present;
- original 33 live-wrapper candidates plus eight later hardening candidates all die on named checks;
- declared retained suite passes against exact repaired source;
- frozen J1/wire/adapter/checkpoint custody preserved;
- gate remains closed and grant remains DRAFT.

**Recommended integration standing:** engineering candidate is ready for code-review/integration consideration **independently of** TypeSafe execution authorization. Integration or merge remains a separate explicit act. Live execution remains closed.
