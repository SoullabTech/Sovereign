# SOULLAB WRITER'S STUDIO
# Failure, Recovery + Concurrency Canon v1

Status: FLAGSHIP PRODUCT / INTERACTION AUTHORITY  
Purpose: define how Writer's Studio behaves when requests fail, responses arrive late, the member moves while MAIA is working, or authored state changes underneath an observation or proposal.

This canon is additive to:
- Flagship Experience Canon
- Durable Place + Observation Address Canon
- Intent-First Entry + First Ten Minutes
- First Arrival + Onboarding
- existing constitutional / authority / mutation law

It does not authorize implementation, schema changes, deployment, or provider changes.

---

# 1. North Star

> **Failure must never make the writer wonder what happened to their Work.**

The member should always know:

- what MAIA was trying to do;
- whether it finished;
- what it was attached to;
- whether the Work changed;
- whether anything was written;
- how to recover;
- how to return.

---

# 2. Core Promise

Even under failure:

> **Your Work remains where you left it.**

And:

> **MAIA's response belongs only to the exact Work, version, locus, observation, and request that produced it.**

No response may drift to a different passage because the member moved.

---

# 3. Every Async Action Has an Identity

Every asynchronous action conceptually binds:

```text
request id
Work id
Work version/read version
locus/address
observation id where relevant
conversation seam
action type
member intent
requested scope
created time
```

Examples:
- read this chapter
- explain this observation
- generate alternatives
- teach this technique
- refresh stale reading
- find related passages

The implementation may use different technical objects.

The product law is:

> **A response without matching identity does not attach to the current UI merely because it arrived.**

---

# 4. Async States

Every model/network action needs explicit states:

## IDLE
Nothing is running.

## PENDING
Request accepted and bound to exact identity.

## STREAMING
Partial response is arriving.

## SUCCEEDED
Complete response admitted for the same identity.

## CANCELLED
Member or system cancelled before completion.

## FAILED_RECOVERABLE
Request failed; retry is lawful.

## FAILED_FINAL
Cannot complete under current conditions.

## STALE_RESULT
Response completed but target Work/locus/version changed.

## SUPERSEDED
A newer request for the same seam replaced it.

These states must be distinguishable internally.

---

# 5. Late Response Law

Example:

```text
member holds Passage A
→ asks MAIA
→ request A starts
→ member moves to Passage B
→ request A finishes
```

Correct behavior:

- request A remains attached to Passage A / its conversation seam;
- it does not appear as though MAIA is speaking about Passage B;
- if surfaced, it is clearly tied to A;
- the member may return to A;
- or dismiss it.

Never:
> put A's answer beside B because B is currently visible.

This is a trust-critical bug.

---

# 6. Changed-Locus Law

If the member edits the target passage while MAIA is responding:

The response may complete as an observation about the version it actually saw.

Then show, where material:

> **This response is based on the passage before your latest edit.**

Actions:
- View the earlier wording
- Ask MAIA about the current passage
- Keep this response
- Dismiss

No silent re-anchoring.

---

# 7. Navigation During Reading

A member may leave while MAIA reads.

Navigation should not be blocked unless the action itself requires a safe mutation boundary.

If they leave:

- reading may continue if lawful;
- destination remains usable;
- completion notification is quiet;
- returning to the reading restores exact context.

Example:

> **MAIA finished reading Chapter 6.**

Action:
> View

Not:
> modal interruption over the member's current writing.

---

# 8. Cancel

If cancellation is technically possible, make it meaningful.

`Cancel` means:
- stop/abandon current request where possible;
- no result becomes admitted as if complete;
- partial copy does not become a finding;
- no mutation occurs;
- current Work remains unchanged.

If provider cancellation is not technically possible:
- UI may stop listening to the result;
- late result is marked discarded/superseded;
- do not imply the upstream request physically stopped unless it did.

Capability honesty applies to Cancel too.

---

# 9. Streaming

Streaming text is provisional.

While streaming:
- do not treat partial text as admitted observation;
- do not enable Apply on an incomplete proposal;
- do not persist partial finding as complete;
- do not calculate final provenance claims from incomplete content.

If stream fails:
> **MAIA couldn't finish that response.**

Actions:
- Try again
- Keep writing
- Return to passage

Optional:
- show partial response only if clearly labelled incomplete and useful.

---

# 10. Retry

Retry must preserve the original intent without pretending it is the same request.

A retry receives a new request identity.

If Work/locus changed since the original failure:
- re-evaluate scope;
- do not blindly retry against stale state.

Copy:

> **This passage changed since that request failed. Try again with the current passage?**

---

# 11. Duplicate Request Law

Repeated clicks/taps must not create uncontrolled duplicate model calls.

Possible lawful behaviors:
- disable exact duplicate while pending;
- coalesce;
- explicitly start a new request and supersede old.

Never allow accidental double-click to produce:
- two findings;
- two proposals;
- two mutations;
- conflicting conversation messages.

---

# 12. Observation Admission

A model response is not automatically an admitted observation.

Before admission it still must satisfy:
- evidence;
- exact address;
- provenance;
- coverage;
- non-conclusion law;
- copy law;
- current/historical identity.

Failure at admission:

> **MAIA couldn't turn that reading into a supported observation.**

Do not fabricate a softer unsupported version to fill the card.

---

# 13. Proposal Concurrency

Example:

```text
proposal P1 generated for passage version N
member edits passage manually → version N+1
member clicks Apply P1
```

Required:

> **This passage changed since this possibility was created. Read it in context again before applying.**

Apply is disabled until re-contextualized.

No stale proposal writes over new authorship.

---

# 14. Apply Boundary

Apply must be atomic from the member's perspective.

On Apply:

1. verify Work / version / locus;
2. verify proposal is complete and authorized;
3. create mutation;
4. produce post-apply version;
5. create truthful receipt/history;
6. update UI.

If any required step fails before mutation:
> **Nothing was changed.**

If mutation succeeds but receipt/history write fails:
- do not tell the member nothing changed;
- surface a critical reconciliation state;
- preserve exact mutation evidence;
- stop further mutation until reconciled if necessary.

Never lie about the Work state.

---

# 15. Undo Boundary

Undo must target the exact applied mutation.

Repeated Undo clicks must not walk history unexpectedly unless the UI explicitly says it will.

After Undo:
> **Your previous wording is back.**

History retains:
- proposal;
- Apply;
- Undo/revert relationship.

If current passage changed after Apply and before Undo:
- do not blindly restore old bytes;
- require a safe reconciliation path.

---

# 16. Network Loss While Writing

Writing should remain as resilient as the actual persistence architecture allows.

If local/pending text is not durable:
- do not show "Saved."

Use precise states:
- Saving…
- Saved
- Not saved
- Offline
- Reconnecting…

If the product has no offline persistence:
> **You're offline. Keep this window open until the connection returns.**

Do not imply offline safety that does not exist.

---

# 17. Network Loss During MAIA Request

Show:

> **Connection lost while MAIA was responding. Your Work was not changed.**

Actions:
- Try again
- Keep writing

Restore exact locus.

No generic:
> Something went wrong.

when the system knows more.

---

# 18. Provider / Model Unavailable

Do not degrade silently to a provider/model whose authority, privacy tier, or behavior differs.

If fallback is governed and authorized:
- apply existing routing law;
- preserve capability truth.

If no lawful fallback:
> **MAIA can't complete that reading right now.**

No fake success.

---

# 19. Empty Success vs Failure

These remain distinct:

## SUCCESS — NOTHING FOUND
> MAIA read this chapter for continuity and didn't find a break she could support with evidence.

## NOT READ
> MAIA hasn't read this chapter for continuity yet.

## FAILED
> MAIA couldn't finish that reading.

## INSUFFICIENT COVERAGE
> MAIA hasn't read enough of the Work to answer that yet.

Never collapse these into:
> No results.

---

# 20. Stale Reading Refresh

Refreshing a stale reading is a new reading act.

While pending:
- old reading remains visible as historical;
- label current state clearly;
- do not blank the Review room.

Example:

> **Reading the current version…**
>
> Earlier findings remain available below.

When complete:
- new reading gets new identity;
- old reading remains historical where retention law requires;
- changed/disappeared findings are not silently overwritten.

---

# 21. Finding Disappears After Re-Read

If an old finding is not supported in the new version:

Do not say:
> Fixed.

Do not say:
> Resolved.

Prefer:
> **MAIA did not make this observation in the current reading.**

The old finding remains historically attributable to the earlier version where lawful.

The writer decides what that means.

---

# 22. Mobile Sheet Dismissal

If MAIA is responding in a mobile sheet and the member dismisses it:

- the request identity remains intact;
- result does not jump into manuscript flow;
- a quiet indicator may show completion;
- reopening restores the same seam.

Dismissal is not automatically cancellation.

If Cancel is desired, it must be explicit.

---

# 23. Browser Refresh / Session Loss

The UI must distinguish durable from ephemeral state.

After refresh:
- durable member observations return;
- durable history returns;
- durable readings return where product retains them;
- ephemeral open drawers need not;
- unsent input only returns if actually persisted.

Do not fake continuity for ephemeral state.

---

# 24. Multi-Tab / Multi-Device

If simultaneous editing is supported or possible:

The product must define conflict semantics.

At minimum:
- detect Work version drift before mutation;
- stale Apply is blocked;
- show that another edit occurred;
- refresh/reconcile deliberately.

Do not silently last-write-wins over authored text unless product law explicitly permits it.

---

# 25. Related-Passage Request Race

Example:

```text
finding O44
→ request related passages
→ member opens O51
→ O44 related results arrive
```

O44 results remain O44 results.

They cannot populate O51's Related panel.

Observation identity must key the state.

---

# 26. Intent-First Race

Example:

```text
member says "I'm losing the thread"
MAIA proposes read Chapters 5–6
member changes to "just this chapter"
```

The original broad scope is cancelled/superseded.

Only the final agreed scope may produce an admitted reading.

The system should persist the authorized scope, not merely the first suggested one.

---

# 27. Error Language Canon

Prefer exact, calm, agency-preserving copy.

### Reading failed
> **MAIA couldn't finish that reading. Your Work was not changed.**

### Proposal failed
> **MAIA couldn't finish those possibilities. Your original is unchanged.**

### Apply blocked by changed passage
> **This passage changed since this possibility was created. Read it in context again before applying.**

### Observation can't be re-located
> **Writer's Studio can't confidently place this observation in the current draft.**

### Offline
> **You're offline. Your latest change is not confirmed saved yet.**

### Stale response
> **This response is based on an earlier version of the passage.**

Avoid:
- Oops!
- Something went wrong
- Try again later

when a more truthful state is known.

---

# 28. No Blame

Never frame system failure as member error unless it actually is.

Avoid:
> You did something wrong.

Prefer:
> Writer's Studio couldn't complete that action.

If input is invalid:
> **This file type isn't supported yet.**

Not:
> Invalid user upload.

---

# 29. Recovery Always Returns to the Work

After any failure, the obvious safe actions include one or more of:

- Keep writing
- Return to passage
- Back to Review
- Try again
- Choose a smaller scope
- View earlier reading

Failure must not strand the member in an error room.

---

# 30. Critical Trust Failures

Treat as BLOCKING:

- response attached to wrong passage;
- stale proposal overwrites newer text;
- Apply succeeds but UI says nothing changed;
- Apply fails but UI says applied;
- Undo restores wrong version;
- MAIA silently re-reads after failure;
- historical evidence silently updated;
- member observation changes provenance;
- navigation causes unapproved commission;
- system claims Saved when not durable;
- late response leaks across Work/member/session.

---

# 31. Mechanical Falsifiers

### D-C1
Passage A request returns after member moves to B; answer appears on B.

### D-C2
Double-click Ask creates duplicate observations.

### D-C3
Partial stream is persisted as a complete finding.

### D-C4
Proposal generated at version N applies to N+1 without recheck.

### D-C5
Undo after intervening manual edit blindly restores N.

### D-C6
Stale reading refresh overwrites historical evidence.

### D-C7
Mobile sheet dismissal moves MAIA response into manuscript.

### D-C8
Offline state still displays Saved.

### D-C9
Failed reading and read/nothing-found render identically.

### D-C10
Related passages for O44 appear under O51 after navigation.

### D-C11
Changed agreed scope still executes original broader read.

### D-C12
Provider failure silently routes to an unauthorized provider.

---

# 32. Acceptance Gates

## C1 — REQUEST IDENTITY
Every async request binds exact Work/version/locus/intent.

## C2 — RESPONSE IDENTITY
Result attaches only to matching seam.

## C3 — VERSION SAFETY
Changed Work invalidates unsafe mutation assumptions.

## C4 — LATE RESULT SAFETY
Late responses never migrate to current locus.

## C5 — DUPLICATE SAFETY
Repeated input cannot create accidental duplicate acts.

## C6 — STREAMING TRUTH
Partial output never masquerades as complete admission.

## C7 — APPLY ATOMICITY
Mutation state and receipt state cannot contradict silently.

## C8 — UNDO TRUTH
Undo restores exact authorized prior state or stops for reconciliation.

## C9 — FAILURE DISTINCTION
not-read / nothing-found / failed / insufficient-coverage are distinct.

## C10 — NAVIGATION FREEDOM
Members can move without corrupting request identity.

## C11 — MOBILE DISMISSAL
Dismiss ≠ cancel unless explicitly stated.

## C12 — PERSISTENCE TRUTH
Saved/offline/session-only language matches actual durability.

## C13 — RECOVERY TO WORK
Every failure has an obvious path back to the Work.

## C14 — PROVIDER HONESTY
No unauthorized silent fallback.

## C15 — CROSS-SESSION ISOLATION
No result leaks to wrong Work/member/session.

---

# 33. Required Engineering Witnesses

For each relevant feature, simulate:

- response after passage change;
- response after chapter change;
- response after Review finding change;
- response after MAIA dismissal;
- network failure;
- retry;
- duplicate click;
- stale Apply;
- Apply then intervening manual edit then Undo;
- reading refresh while navigating;
- mobile dismissal;
- browser refresh;
- simultaneous version drift where relevant.

Record:
- exact request id;
- Work/version;
- locus;
- final attachment;
- mutation status;
- user-visible copy.

---

# 34. Human Witness Questions

1. When something failed, did you know whether your Work changed?
2. Did you know what MAIA had been trying to do?
3. Could you get back to where you were?
4. Did any response feel like it belonged to the wrong passage?
5. Did Retry feel safe?
6. Did you ever wonder whether something saved?
7. Did stale information look current?
8. Did dismissing MAIA behave the way you expected?
9. Did any error feel blaming or technical?
10. Did you remain confident the Work was yours?

---

# 35. Product Principle

> **Writer's Studio should become more trustworthy when something goes wrong, not less.**

The quality of recovery is part of the flagship experience.

---

# 36. Spirit of Soullab

Failure should still feel like:

> My Work is safe.
>
> I know what happened.
>
> MAIA did not jump ahead.
>
> Nothing attached itself to the wrong place.
>
> Nothing was silently rewritten.
>
> I can try again.
>
> Or I can keep writing.
>
> I know how to get back.

**A deeper you. A more human world.**
