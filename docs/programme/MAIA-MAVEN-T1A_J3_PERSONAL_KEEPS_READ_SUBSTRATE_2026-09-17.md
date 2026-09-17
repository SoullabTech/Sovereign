# MAIA-MAVEN-T1A — J3 PERSONAL KEEPS READ SUBSTRATE

**Status:** J3 SUBSTRATE AUDIT COMPLETE · **J4 NOT OPENED** · ⛔ **NO IMPLEMENTATION AUTHORIZATION**  
**Date:** 2026-09-17  
**Evidence base:** `e2fd1eae7d563c6e6c5cd5cf1ec2ca233052042b`  
**Founder authority:** `MAIA-MAVEN-T1A_FOUNDER_ADJUDICATION_2026-09-17.md`

---

## 0. J3 question

With T1-A now defined as **Personal Field / Portfolio Keeps READ**, what is the smallest existing substrate that can support a lawful explicit read by MAIA without importing Book Studio semantics, broad atom ambiguity, ambient retrieval, or an unaccounted crossing into cognition?

J3 inventories. It does not build.

---

# 1. Result in one sentence

> **The repository already has a truthful Personal-Keep selector, but it does not yet have a governed Personal-Keep-to-MAIA cognition crossing.**

The selector is `lib/workbench/sources/keep.ts`. The crossing is absent because the stronger disclosure boundary currently admits only `source_class='work'`.

Therefore T1-A is **not** “wire an endpoint.” Its missing layer is a governed invocation + disclosure crossing around an already-good read primitive.

---

# 2. The strongest existing read primitive

`lib/workbench/sources/keep.ts` is the strongest generic Personal Keep reader found. Its SQL requires:

```text
member_id = calling member
generated_by = 'member-gesture'
status IN ('active', 'still_alive')
memory_scope = 'personal'
posture_at_creation IS DISTINCT FROM 'sanctuary'
```

It also refuses unattributed practitioner observations and is read-only. Its test suite asserts the actual emitted SQL guards rather than simulating them in mocks.

This is materially stronger than:

- `/maia/keep-capture`, which reads broader atoms without `generated_by`; and
- `loadMemberMemoryAtomsForPrompt()`, which is an ambient return-eligible atom reader and likewise does not prove generic Keep origin.

**Classification:** REUSE CANDIDATE — strongest generic Personal Keep selection primitive.

---

# 3. Do not reuse the Book Studio shelf endpoint as MAIA's Keep API

`GET /api/book-studio/workbench/shelf` can expose the Keep adapter to an authenticated member, but it carries Workbench-specific concerns:

- arranger role;
- source-set ceilings by Workbench role;
- Book Studio route vocabulary;
- fan-out and card sorting across source adapters.

Those concerns are not the authority T1-A needs. Reusing the route would couple MAIA's Personal Keeps READ to a Studio transport simply because both happen to need the same source adapter.

The reusable object is the **guarded read logic**, not the Workbench HTTP surface.

**Classification:** DO NOT REUSE AS INVOCATION ROUTE.

---

# 4. The adapter proves Keep identity but has a content-depth limit

The Workbench adapter selects:

```text
id, title, body, source_type, status, kept_at, is_breakthrough
```

It does not select `source_id`. Its `resolve()` returns `body ?? ''`.

That matters because sourced portfolio atoms deliberately keep their source content in the native source table. For many source types the atom body is null.

So the adapter can truthfully answer an **inventory-level** question such as:

```text
What have I kept?
Show me my Keeps.
Which Keeps mention grief?
```

with Keep identity/title/time, but it cannot by itself reconstruct the full contents of every sourced Keep.

A future full-content read would need a source-native resolver with the same ownership/provenance discipline. Only capsule currently has a mature source-specific resolver in the psyche service.

**J3 boundary:** do not pretend “we can identify the Keep” means “we can lawfully reconstruct every source behind it.”

---

# 5. Existing MAIA recall detection is not a T1-A invocation seam

`lib/sovereign/maiaService.ts` has a broad `isMemoryRecallQuestion` regular expression. When it matches, it tells the model to inspect already-loaded **recent conversation** context.

It does not:

- recognize Personal Keeps as a distinct requested source;
- call the Keep adapter;
- establish Keep-specific authority;
- bind a Keep object to the request;
- account for a Keep disclosure; or
- distinguish member-pulled Keeps from ambient continuity.

Likewise `detectKeepIntent()` governs **creating/opening Keep**, not reading existing Personal Keeps. `intentRouter.ts` has no Personal Keeps READ intent.

**Finding:** the explicit conversational invocation seam is genuinely absent.

---

# 6. Ambient atom recall cannot substitute for explicit Personal Keeps READ

The canonical route already loads some atoms through `loadMemberMemoryAtomsForPrompt()`, but only when their stored `return_preference` permits ambient return.

T1-A is different. The member is explicitly asking for their own Keeps now.

A Personal Keep may legitimately remain `member_pulled`. That means:

```text
ambient return preference = restrictive
current explicit member request = one-shot authority to read now
```

The explicit request must not silently mutate `return_preference` or convert a one-time read into standing permission for future surfacing.

The Workbench adapter already contains the right member-side posture: it deliberately does **not** filter by `return_preference`, because a private atom is private from ambient MAIA initiative, not from its member.

For T1-A, MAIA would be acting as the member's explicitly invoked reader, not as an ambient memory selector.

**Classification:** AMBIENT LOADER CANNOT SUBSTITUTE.

---

# 7. The stronger crossing law blocks a direct wire

`lib/disclosure/disclosureBoundary.ts` states the mature law:

> Resolve authority first. Prove it exists. Account for the disclosure. Then let the context cross.

It returns permission; it does not itself hand content to cognition.

`lib/disclosure/contextDisclosureReceipt.ts` explicitly names **Keep** as an intended future source class in its architectural axis, but v1 currently admits only:

```text
DisclosureSourceClass = 'work'
```

The constituted boundaries are likewise Writer's Studio boundaries only, and the admitted participation basis is `member_invoked`.

This is decisive. A future T1-A implementation may not simply call `keepSource.search()` inside `/api/sovereign/app/maia/list` and concatenate the result into the prompt. That would create the very unaccounted context crossing the disclosure law exists to forbid.

**Classification:** GOVERNED CROSSING MISSING.

---

# 8. What already fits T1-A perfectly in the disclosure model

Several parts of the existing disclosure constitution already match the intended T1-A act:

```text
participation basis: member_invoked
authority first:      required
accountability:        required before crossing
source identity:       explicit, never derived from content
content in receipt:    forbidden
ordinary conversation: continues if optional disclosure refuses
```

The missing pieces are vocabulary/contract extensions for a Keep crossing — not a new philosophy.

The intended future source axis in the receipt file already lists `keep`; that comment is design evidence, not live authority. J3 does not promote it by implication.

---

# 9. Smallest lawful future cut identified by J3

J3 does **not authorize** this build. It identifies its minimum shape.

A lawful Personal Keeps READ requires four separable acts:

```text
1. INVOCATION
   member explicitly asks to read/search their Personal Keeps

2. SELECTION
   guarded member-gesture/personal/non-Sanctuary Keep reader

3. DISCLOSURE AUTHORITY
   one request-bound, member-invoked Keep disclosure receipt

4. CROSSING
   only the authorized selected material enters MAIA cognition
```

No step may imply the next one occurred.

The repository already substantially provides #2 and the generic mechanism behind #3. #1 is absent. #3 lacks Keep vocabulary/boundary authority. #4 therefore cannot lawfully be opened yet.

---

# 10. Candidate invocation semantics for J4 witness

J3 finds the following distinction mechanically supportable for the future experience contract:

### Explicit inventory request

```text
“What have I kept?”
“Show me my Keeps.”
“Which of my Keeps mention grief?”
```

This is a request to read member-owned Keep objects. It may authorize one bounded Personal Keeps READ for that response.

### Not an invocation

```text
“This reminds me of something.”
“I've been thinking about grief again.”
“Something from before feels relevant.”
```

Those may justify ordinary continuity behavior under existing law, but they are not authority for a T1-A Personal Keeps READ.

### Navigation request

```text
“Open Keeps.”
“Show me the Keeps room.”
```

This is House navigation, not authorization to send Keep content into cognition. Existing `open_keep` / House destination behavior should remain distinct.

J4 should witness these distinctions in human experience before any code is opened.

---

# 11. Source-depth rule for the first cut

Because generic source dereferencing is not yet governed across all atom source types, the smallest truthful first read should not silently promise full source content.

The substrate supports a bounded inventory projection containing only fields the qualifying Keep row itself proves, such as:

```text
keep id
title
source type
kept at
status
member-gesture provenance gate
```

For spontaneous Keeps, the stored body may also be directly available.

For sourced Keeps, deeper content should remain unavailable until a source-specific member-owned resolver is constituted for that source type.

This is a capability limit, not a reason to weaken the provenance boundary.

---

# 12. Negative controls J5 must eventually prove

Before T1-A could claim LIVE, an implementation would need falsifiers proving at least:

1. a non-`member-gesture` atom cannot be returned as a Personal Keep;
2. another member's Keep cannot be read;
3. a Sanctuary-origin object cannot cross;
4. ambient conversation cannot invoke Personal Keeps READ accidentally;
5. an explicit one-shot read does not mutate `return_preference`;
6. no Keep content crosses if disclosure authority cannot be established;
7. a refusal to disclose does not prevent ordinary conversation;
8. the receipt contains identity/authority metadata, never Keep content or a content locator;
9. sourced Keep detail is not invented when the source resolver is absent;
10. Press Keeps, Marked Moments and Reflection Capsules do not enter the generic read by family-name accident.

These are future build/proof obligations only.

---

# 13. J3 verdict

| Question | Finding |
|---|---|
| Truthful generic Keep selector exists? | **YES** — Workbench Keep adapter |
| Member-scoped? | **YES** |
| Proves `member-gesture`? | **YES** |
| Excludes Sanctuary posture? | **YES** |
| Read-only? | **YES** |
| Full source content for every Keep? | **NO** |
| Explicit Personal Keeps READ intent exists? | **NO** |
| Existing generic memory-recall detector sufficient? | **NO** |
| Ambient atom loader sufficient? | **NO** |
| Governed Keep disclosure source class exists? | **NO — intended, not admitted** |
| Governed Keep→MAIA boundary exists? | **NO** |
| Can T1-A be implemented as a direct wire today? | **NO** |

---

# 14. J3 closure

**J3 substrate audit: COMPLETE.**

The minimum architecture is now visible without inventing a new memory system:

```text
member asks for Personal Keeps
        ↓
explicit invocation recognized
        ↓
member-scoped lawful Keep selector
        ↓
governed disclosure authority + receipt
        ↓
selected Keep projection crosses once
        ↓
MAIA answers from exactly that material
```

The selection substrate largely exists. The missing work is the **invocation and accounted crossing**, plus source-native detail resolution if the capability later goes deeper than inventory-level Keep truth.

No source, test, schema, migration, route, prompt, capability registry, production state, or member-facing `/maia` surface has been changed by this record.

**J4 NOT OPENED.** The next legitimate gate is the founder/member experience contract for what an explicit Personal Keeps READ should feel like and what scope its first cut is allowed to return.
