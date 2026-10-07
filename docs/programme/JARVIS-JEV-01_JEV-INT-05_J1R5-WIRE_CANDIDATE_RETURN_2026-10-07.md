# JARVIS-JEV-01 / JEV-INT-05 — J1R5-WIRE Candidate Return

**Date:** 2026-10-07 · **Status:** ⭐ TESTED CANDIDATE · ⛔ **OFF · NOT RATIFIED · AUTHORIZES NOTHING**
Builds on the R1 proposal (`…WIRE_AMENDMENT_AND_SYNTHETIC_CONNECTION_TEST_PROPOSAL_2026-10-07.md`).
**No credential retrieved · no provider registered or assigned · no authorization record merged ·
no spend · no inference call · no human labelling · PILOT-01 untouched.**

## 1 · What was built (additive; the frozen J1 host and suite are unedited)

| File | Role |
|---|---|
| `scripts/builder/jev-wire-v1.mjs` | The candidate: wire-body construction and verification, frozen question table, the 31-attempt allowlist, durable ledger, native-observation runner. No network client, no environment reads, no credential handling; transport is injected and none is supplied. |
| `scripts/builder/__tests__/jev-wire-v1-proof.mjs` | 26 checks (W1–W26) against a fake transport. |
| `scripts/builder/__tests__/jev-wire-v1-matrix.mjs` | 26 defeat candidates: the smallest wrong edit of the module, each of which must die on its named check. |
| `scripts/builder/__tests__/jev-wire-variant-lib.mjs` | Test helper: makes temp copies of the module with edits; never edits the committed file. |
| `package.json` | `proof:jarvis-jev-wire`, `matrix:jarvis-jev-wire`. |

Design points: `questions` is a keyed object with exactly one entry whose key must equal
`state.question_id` · `state` is byte-for-byte a J1 packet · wording and model live only in a hashed
table · body hash and a durable reservation are written **before** any send · no automatic retry ·
a timeout is `attempted / crossing unknown` and **halts** the experiment, retaining its reservation ·
the runner accepts an **attempt id only**, never a state, packet or body · results are **native
observations**, never routed through `admitJevResponse`.

## 2 · Results (local, fake transport; run in this container)

```text
proof:   26 / 26 PASS
matrix:  reference clean · 26 / 26 candidates killed on their named check · 0 survived · 0 wrong-death
frozen J1 freeze verifier:   0 violations (FREEZE INTACT)
J1 host membrane proof (jev-judgment-host-v1-proof.mjs):   PASS
```

⛔ **Not run here:** the frozen J1 TypeScript matrix (63/63) and typecheck — no `node_modules`/`tsx`
in this container. The freeze verifier proves its blobs are unedited; **the founder-side run is the
evidence of record for the TS matrix.**

### What the matrix found in the first suite (repaired in the suite, not in the candidate)

1. `DC-KEY-MISMATCH-TOLERATED` **survived**: the test used a key not in the table, so another rule
   refused it and the mismatch rule was never exercised. Fixed with a case whose key *is* in the table
   but differs from `state.question_id`.
2. `DC-CORRUPT-LEDGER-TOLERATED` **survived**: the mutation was masked by an unrelated parse failure.
   The candidate was rewritten as the honest wrong design (tolerate a missing newline) and the test now
   covers a complete record with no terminating newline (an ambiguous tail, refused).
3. `DC-FIXTURE-DRIFT` **died on the wrong check** (a hash pin, not a content check). Fixed by asserting
   each of the 19 fixtures' content independently of the module.

Collateral deaths are expected and irreducible for two candidates (array questions, non-canonical
hash): the allowlist itself is built through the same function, so the pipeline cannot run at all.

## 3 · Corrections carried in (L2)

`contains_sensitive: true` is **valid under the unchanged host** (it constructs, verifies, and builds a
wire body). It is excluded only by the experiment's allowlist: `isAllowlistedBody` refuses any body not
byte-identical to a frozen fixture, and `runAttempt` has no path that takes a state. W9 proves both
halves. The host was not touched.

## 4 · Hashes (git blob ids at this commit; all content-free)

```text
question table (canonical JSON, sha256)   fb20b2855cf1111051ab71bb17b95b5d6668316bd8b76737e8b5aa87d0c532f3
fixture list   (id + body hash, sha256)   a0f4a26cea085527783a62c8875fdf60f2fed93d1f4ff48d2285ab5288c24f60
scripts/builder/jev-wire-v1.mjs                       70c9935062e017bdc54a96b24565b3abb2cafa2c
scripts/builder/__tests__/jev-wire-v1-proof.mjs       (see git; pinned by the commit that carries this record)
scripts/builder/jev-judgment-host-v1.mjs              8138beeb387b1264ce386163ea7468108f2d7451  (UNCHANGED)
```

Changing wording, model, any fixture, or the response-shape descriptor changes these hashes and is a
new table version.

## 5 · What the candidate refuses to do until a human step happens

1. **Response shape is unwitnessed.** `RESPONSE_SHAPE.witnessed` is `false` in the committed module, and
   `runAttempt` refuses every send while it is (W20; the flag is flipped only inside temp test copies).
   The response paths in the table are **assumptions**: this container's egress proxy blocks
   `api.typesafe.ai`, so I could not read the live OpenAPI. A founder-run schema witness must replace
   the descriptor, set the flag, and bump the table version (which changes the table hash).
2. **No transport exists.** Without an injected transport the result is `TRANSPORT_NOT_CONNECTED`.
3. **Ledger is fail-closed.** An unreadable or ambiguous ledger refuses all sends.

## 6 · Route A — what it does and does not grant

Per the existing process an assignment needs a **ratified** Class-A record, admitted to canonical
**before** the assignment candidate. The record format's identity is only
`{instrument, status, tier, provider, capability}`; it has **no scope field**.

Consequently, Route A makes the pair `lab / typesafe-jev / repository_derived_metadata` a **standing**
assignment, not an experiment-scoped one. The restriction to "these frozen synthetic requests, this
experiment, this budget" can only live in the **separate execution grant**
(`provider.execute:typesafe-jev`, with `network.external`, `provider.spend`,
`disclosure.repository_derived_metadata`), whose scope must name: table hash, fixture-list hash, model
`jev-1.13.0`, endpoint, one experiment id, the $1 / 31-attempt caps, and expiry on completion. If you
want the assignment itself to expire, that needs a format change to the record, which is a rules
change, so I have not proposed it.

Draft record body (**not placed under `docs/governance/provider-assignments/`**; writing
`"status": "ratified"` there would assert a ratification that has not happened):

```json
{
  "instrument": "repository-provider-assignment/v1",
  "status": "<set to ratified only by founder act>",
  "tier": "lab",
  "provider": "typesafe-jev",
  "capability": "repository_derived_metadata"
}
```

Also still required before it could be cited: registration of `typesafe-jev` in the lab tier
(INT-03R1 D2/D3: capability `benchmark`), then the later assignment candidate citing the record's
path, blob and commit.

## 7 · Remaining approvals and open items (nothing here is done)

| Item | State |
|---|---|
| J1R5-WIRE ratification as a J1 reopening (INT-03R1 §6 route b) | **Open — founder constitutional act.** Development was authorized; ratification was not. |
| Live OpenAPI schema witness (request field names, response paths, usage field, model field) | **Open — founder-side.** |
| Route A: ratified Class-A record, canonical admission, registration, later assignment candidate | **Open.** |
| Execution grant, `network.external`, `provider.spend`, disclosure authority | **Open.** |
| TypeSafe retention / telemetry / DPA / customer-agreement review (INT-04 §9.7) | **Open.** Not zero-retention. |
| Credential and account billing terms | **Open — founder.** Not touched. |
| Reservation and cap persistence at runtime | Implemented as a fsynced append-only ledger; **the ledger location and a durable-store ruling are not chosen.** |
| Real-work shadow evaluation / INT-04 §9.5 freeze | **Outside this act.** |

⛔ Nothing in this record claims Jev's judgment is valid. The experiment, if later authorized, shows
that the connection, record, accounting and failure handling behave as specified.
