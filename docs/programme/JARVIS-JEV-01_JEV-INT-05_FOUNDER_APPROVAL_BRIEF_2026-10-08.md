# Jev first live experiment — founder approval brief (plain language)

**Status: a brief, not an approval. Nothing here is authorized. Execution is off, no credential has been touched, no provider is registered, nothing has been spent.**

## What would be done
One short, controlled test: send **31 tiny synthetic requests** to TypeSafe's Jev model asking one question ("is this structurally risky?") about invented work-unit descriptions, to find out whether the connection works and what Jev returns. It measures plumbing and cost. It does **not** measure whether Jev's judgment is good, and its answers do not steer any MAIA or JARVIS decision.

## What is ready
A tested wrapper that refuses unless every condition below is met. It has run only against a local mock with a dummy key. It stops at the first failure, never retries, never resends, and keeps two independent records so a crash is detectable. Still to do before activation: a final independent Mac verification of the exact commit.

## Decisions only you can make
1. **Governance.** (a) Ratify the J1R5-WIRE amendment (a reopening of the frozen J1 contract; it adds only the fixed question carrier). (b) Admit the Route A records. Caveat: the provider assignment is a *standing* assignment; the *scope of this experiment* lives only in the execution grant. (c) Issue the execution grant (template provided) naming the operator, the authorizer, a window of at most 7 days.
2. **Data disclosure.** Each request contains exactly: six synthetic packet fields, the model id, the fixed question wording, and ordinary connection metadata plus your API-key identity. **No repository text, no member data, nothing from MAIA.** Approve this exact list or narrow it.
3. **Provider terms.** TypeSafe says it does not train on inputs, but its customer agreement permits processing, storage and telemetry — this is **not zero-retention**. I have not verified the agreement, data-processing terms, or billing terms; you or counsel should. Because the data is synthetic, the exposure is small, but the *precedent* (a first external judgment provider) is the real decision.
4. **Spending.** Ceiling **$1.00**, a reserve of $0.005 per attempt, expected cost about **$0.0004** (31 requests at roughly 300 input tokens, $0.042 per million). The run stops at the ceiling, at the attempt count, or at expiry.
5. **Opening the switch.** A reviewed code change flips the off-switch. That change is separate from approving this brief and should be made only after items 1–4 and the Mac verification.
6. **Operational.** Name the operator; provide an external drive for the second record; decide who holds the key and rotates it afterward.

## What "approve" would and would not mean
Would: one named operator may run this 31-request synthetic test inside the window and ceiling. Would not: any use of real data, any additional requests or retries, any lowering of computational effort based on Jev, any change to J1 beyond the carrier, or a later live use. Each of those needs its own decision.

## Stop conditions you can rely on
Any failed or unclear request halts the run permanently pending human inspection; a crossing of unknown outcome is never resent; the committed code refuses everything until you choose otherwise.

## Recommendation
Go/no-go can be taken in this order: Mac verification → provider terms read → governance records → grant → code change → run. A "no" or "not yet" at any step costs nothing; the wrapper simply stays off.
