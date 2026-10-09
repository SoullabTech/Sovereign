# Jev first live experiment — founder approval brief (plain language)

**Status: a brief, not an approval. Nothing here is authorized. Execution is off, no credential has been touched, no provider is registered, nothing has been spent.**

## What would be done
One short, controlled test: send **31 tiny synthetic requests** to TypeSafe's Jev model asking one question ("is this structurally risky?") about invented work-unit descriptions, to find out whether the connection works and what Jev returns. It measures plumbing and cost. It does **not** measure whether Jev's judgment is good, and its answers do not steer any MAIA or JARVIS decision.

## What is ready
A tested wrapper that refuses unless every condition below is met. It has run only against a local mock with a dummy key. It stops at the first failure, never retries, never resends, and keeps two independent records so a crash is detectable. A real-provider run accepts no stand-in transport and no test clock; the storage layout is re-verified before every attempt and again immediately before each send; and a behaviour-only test (not tied to any one implementation's wording) checks those boundaries. Independent Mac/T7 verification of the reconciled commit (`baa5dc363`) is complete: 20 of 20 checks, protected files unchanged, run on your Mac Studio with the T7 drive (receipt kept on that machine). Still to do before activation: verification of the separate activation candidate (below).

**Exact bytes:** see `JARVIS-JEV-01_JEV-INT-05_WORKED_PAYLOAD_AND_BOUNDARIES_2026-10-08.md` — the first request, all 31 bodies, headers, accepted response, what leaves, what stays, what stops the run, all derived from the real code (loopback capture, placeholder key).

## Decisions only you can make
1. **Governance.** (a) Ratify the J1R5-WIRE amendment (a reopening of the frozen J1 contract; it adds only the fixed question carrier). (b) Admit the Route A records. Caveat: the provider assignment is a *standing* assignment; the *scope of this experiment* lives only in the execution grant. (c) Authorize a fresh execution grant naming the operator, the authorizer and a window of at most 7 days — **only after** the activation candidate has been reviewed and independently verified, because the grant binds that candidate's exact hashes (see "Grant identity must follow the final reviewed activation candidate" below). The checked-in template is a `DRAFT` shape, not a grant.
2. **Data disclosure.** Each request contains exactly: six synthetic packet fields, the model id, the fixed question wording, and ordinary connection metadata plus your API-key identity. **No repository text, no member data, nothing from MAIA.** Approve this exact list or narrow it.
3. **Provider terms.** TypeSafe says it does not train on inputs, but its customer agreement permits processing, storage and telemetry — this is **not zero-retention**. I have not verified the agreement, data-processing terms, or billing terms; you or counsel should. Because the data is synthetic, the exposure is small, but the *precedent* (a first external judgment provider) is the real decision.
4. **Spending.** Ceiling **$1.00**, a reserve of $0.005 per attempt, expected cost about **$0.0004** (31 requests at roughly 300 input tokens, $0.042 per million). The run stops at the ceiling, at the attempt count, or at expiry.
5. **The activation candidate.** A separate reviewed code change (opening the response-shape gate, plus any schema or table-version correction the real service requires) is made **before** any grant is derived, and is independently verified as an exact commit. Approving this brief neither makes nor authorizes that change; it should be made only after items 1–4 and the Mac/T7 verification of the reconciled candidate, and the grant in item 1(c) follows it, never the reverse.
6. **Operational.** Name the operator; provide an external drive for the second record; decide who holds the key and rotates it afterward.

## Grant identity must follow the final reviewed activation candidate
The checked-in grant template is intentionally still `DRAFT`. Its current `table_hash` belongs to the committed **closed** response-shape candidate. Because `QUESTION_TABLE` includes `RESPONSE_SHAPE`, changing `witnessed` (or changing the schema witness/table version) changes the table identity. **Do not promote the current template unchanged.** If you ever choose to proceed, first create and independently verify the exact activation candidate; then derive the table/fixture/schema hashes from those bytes; then populate and authorize a fresh grant for that exact candidate. Any later identity-affecting code change invalidates that grant. Opening a source gate by itself never grants execution authority.

## Residual risks recorded for your evaluation before any activation
- **Same-device directory replacement.** The verified wrapper detects a store moving to a different device, a link in place of a directory, or the two records disagreeing. It does **not** notice a directory being swapped for a fresh one on the *same* device (new directory identity, same volume). The hash chain and the independent checkpoint still catch changed *content*, and device independence is intact, so this is defence-in-depth rather than a known hole; a stricter variant exists and was deliberately left out of this candidate. Decide before activation whether you want it; it would be made *before* the activation candidate so that candidate stays a gate-opening change only.
- **Stop reasons are generic at the send boundary.** A storage or record-agreement refusal at the instant of sending is reported as a transport error in the summary (the ledger records an unknown crossing either way, conservatively). This is an observability limit, not a safety one.
- **Still untested:** real TLS/DNS/TypeSafe behaviour, power loss, Windows/NFS volumes, a coordinated rollback of both records. The behavioural checks have now been run with the external drive; the one safeguard still without a physical witness is the device-identity pin (it needs a third device or disposable disk images).

## What "approve" would and would not mean
Would: one named operator may run this 31-request synthetic test inside the window and ceiling. Would not: any use of real data, any additional requests or retries, any lowering of computational effort based on Jev, any change to J1 beyond the carrier, or a later live use. Each of those needs its own decision.

## Stop conditions you can rely on
Any failed or unclear request halts the run permanently pending human inspection; a crossing of unknown outcome is never resent; the committed code refuses everything until you choose otherwise. If the storage layout changes, or the two records stop agreeing, the next request is not written.

## Recommendation
Go/no-go can be taken in this order; nothing later is started until everything before it is decided:

1. **While the code stays closed:** Mac/T7 verification of the reconciled candidate → provider terms/data-processing/retention/billing read → governance records (J1R5-WIRE, Route A) → disclosure approved → operator, credential custody, recovery role, mounts and spend decided.
2. **Reviewed activation code** — a separate candidate (gate-opening change plus any schema or table-version correction), which this brief does not authorize.
3. **Independent verification of that exact activation candidate** (all proofs, matrices, the behavioural differential, the frozen-file custody checks).
4. **Exact hashes derived from those verified bytes** (table, fixture-list, schema).
5. **Grant authorization** by you for the named experiment, operator, window and caps; then the operator echoes the grant's own SHA-256.
6. Only then, **the first real request**, counted as attempt 1 of 31, inspected before continuing.

A "no" or "not yet" at any step costs nothing; the wrapper simply stays off. Any identity-affecting code change after step 4 voids the grant and returns to step 3. (Earlier versions of this brief placed the grant before the activation code; that order is withdrawn.)
