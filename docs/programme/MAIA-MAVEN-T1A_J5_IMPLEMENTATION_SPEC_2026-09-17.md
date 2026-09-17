# MAIA-MAVEN-T1A — J5 CONTAINED IMPLEMENTATION SPECIFICATION

**Status:** J5 SPECIFICATION COMPLETE · **BUILD AUTHORIZATION PENDING** · ⛔ NO IMPLEMENTATION IN THIS RECORD  
**Date:** 2026-09-17  
**Evidence base:** `b3b38b6367d489b783a0d8fe2707cd2525ef1b58`  
**Founder witness:** `MAIA-MAVEN-T1A_J4_FOUNDER_WITNESS_2026-09-17.md`

---

## 0. Build question

Implement **Personal Keeps READ v1** exactly as ratified at J4:

> A member may explicitly ask MAIA to inspect their Personal Field / Portfolio Keeps. MAIA may receive at most five qualifying Keep projections for that response, in member-Keep chronology, under response-scoped authority. Navigation is not disclosure; ambient mention is not invocation; deeper source use is deferred.

The implementation must reuse earned substrate rather than create a second memory system.

---

# 1. Non-negotiable architecture

```text
member utterance
    ↓
PURE INVOCATION CLASSIFICATION
    ↓
NAVIGATE | READ | OFFER_PERMISSION | NONE
    ↓                    READ only
                    require consent state
                           ↓
                  select qualifying Keep REFS
                           ↓
               mint one receipt PER Keep ref
                           ↓
                 resolve bounded projections
                           ↓
               construct Personal Keeps block
                           ↓
                 response-producing cognition
                           ↓
                 true handoff signal fires
                           ↓
                confirm every crossed receipt
                           ↓
                         answer
```

No content may cross merely because it was available.

---

# 2. Cut A — invocation recognizer

Add a pure deterministic recognizer dedicated to **reading existing Personal Keeps**. It must not share semantics with creation/opening recognition in `lib/consciousness/keepIntent.ts`.

Candidate module:

```text
lib/consciousness/personalKeepsReadIntent.ts
```

Closed outcome vocabulary:

```text
navigate_keeps
read_keeps
read_keeps_filtered
ambiguous_keeps_reference
none
```

Requirements:

1. No I/O, model calls, database access, persistence or side effects.
2. “Open Keeps / take me to Keeps” = navigation only.
3. “What have I kept / show me my Keeps / list my Keeps” = read.
4. “Which Keeps mention X / do I have a Keep about X” = filtered read with the member's explicit filter text.
5. “Something in my Keeps might be relevant” = ambiguous reference; offer permission, no read.
6. Ordinary uses of *keep* and generic memory language must not invoke Personal Keeps READ.
7. “Show me more” is not independently sufficient unless the same turn carries a valid Personal-Keeps continuation context; continuation is Cut G below.

The recognizer classifies the member's act. It never performs the act.

---

# 3. Cut B — one canonical Personal Keep selector

Do not import the Book Studio shelf endpoint into MAIA.

Extract or expose the existing guarded SQL semantics from `lib/workbench/sources/keep.ts` as one domain-level selector, then make the Workbench adapter consume that same selector so there is still **one source of Keep truth**.

Candidate domain module:

```text
lib/psyche/personalKeepsRead.ts
```

Required eligibility:

```text
member_id = authenticated member
generated_by = 'member-gesture'
memory_scope = 'personal'
posture_at_creation IS DISTINCT FROM 'sanctuary'
status IN ('active', 'still_alive')
NOT unattributed practitioner observation
```

`return_preference` MUST NOT participate in this explicitly member-invoked read.

The selector has two phases:

### B1 — select identities

Return at most **six refs** ordered by:

```text
kept_at DESC, id DESC
```

Five are eligible to cross; the sixth proves `hasMore=true` without exposing a sixth object to cognition.

For a filtered request, filtering may inspect only fields already lawfully in the Personal Keep substrate (`title` and stored `body`). It must not dereference native source tables.

Identity selection returns only the minimum values needed to govern the later act (Keep id plus ordering/cursor material). It does not construct prompt content.

### B2 — resolve projection

After disclosure receipts are authorized, resolve each admitted Keep ref under the same guards into a bounded projection:

```text
id
title
sourceType
status
keptAt
bodySnippet?   // spontaneous body only; bounded
```

For sourced Keeps whose body is not owned by the atom, body is absent. No source reconstruction occurs.

---

# 4. Cut C — disclosure vocabulary widening, one axis at a time

The existing disclosure constitution is reused. Do not create a Keeps-specific receipt table.

T1-A requires four vocabulary additions to `context_disclosure_receipts`, each as its own additive governed migration, following the S3 precedent that one axis must not smuggle another.

### C1 — source class

Add exactly:

```text
keep
```

so:

```text
DisclosureSourceClass = 'work' | 'keep'
```

### C2 — boundary

Add exactly:

```text
maia.personal_keeps_read->maia_cognition
```

### C3 — scope kind

Add exactly:

```text
object
```

`section_ref` remains NULL for Keep objects. Existing section-only constraint remains unchanged.

### C4 — gesture

Add exactly:

```text
read_personal_keeps
```

Definition:

> the member explicitly authorized MAIA to read qualifying Personal Keeps for this response.

One member read gesture may yield several object-scoped receipts, exactly as one `authorize_sections` act may yield several section receipts.

No other disclosure vocabulary is widened.

---

# 5. Cut D — authority-before-selection

The canonical `/api/sovereign/app/maia/list` route already owns:

```text
exchangeId
TurnPosture
member identity
session identity
```

But its ordinary consent audit row is currently established later inside `getMaiaResponse()` via fire-and-forget `recordConsentState()`.

That timing is insufficient for Personal Keeps READ because Keep selection must be governed before content is assembled.

For a recognized Personal Keeps READ only:

1. resolve the existing `TurnPosture` once;
2. use the existing canonical `exchangeId` as `requestId`;
3. call the existing awaited, fail-closed `requireConsentState()` **before any Personal Keep selector runs**;
4. on failure, do not query Keep material and do not mint disclosure receipts;
5. ordinary conversation remains available through a truthful boundary-unavailable response path.

This does not replace or widen `recordConsentState()` for ordinary conversation. The precondition is invoked only because this optional disclosure requires it.

Sanctuary therefore fails before Keep selection, not after.

---

# 6. Cut E — one receipt per Keep object

A five-item inventory is one member act but up to five distinct disclosures.

Therefore the build MUST NOT mint one vague batch receipt.

For each of the first five selected Keep refs, mint one disclosure attempt under the same:

```text
request_ref          = exchangeId
boundary             = maia.personal_keeps_read->maia_cognition
source_class         = keep
participation_basis  = member_invoked
scope_kind           = object
authorized_by        = member
gesture              = read_personal_keeps
source_ref            = exact Keep atom id
```

Each receipt gets its own fresh `disclosure_id`.

All required receipts must be minted before any selected Keep projection is constructed for cognition. If any mint refuses, **none of the selected Keep content crosses**. Already-minted receipts remain `attempted`, which truthfully records authorized attempts that did not cross.

Empty result: no source object exists to disclose, so no disclosure receipt is minted. The consent precondition may still exist for the request.

---

# 7. Cut F — typed server-only Keep context, never client meta authority

Do not let raw request-body `meta` become a Personal Keeps authority channel.

Add a typed, server-internal top-level input to `getMaiaResponse()` for the already-authorized Keep projection, analogous in trust posture to the existing top-level `writerStudio` input.

Candidate shape:

```ts
personalKeepsRead?: {
  projection: PersonalKeepProjection[];
  hasMore: boolean;
  posture: TurnPosture;
  onHandoff?: () => void;
} | null
```

The service must not accept an equivalent client-supplied `meta.personalKeepsRead` field as cognition authority.

The projection renderer is deterministic. It contains no ranking language and no hidden source dereference.

---

# 8. Cut F2 — true cognition handoff

The existing `writerStudio.onHandoff` precedent proves the required timing:

> fire only after the response-producing call is invoked, never merely because `getMaiaResponse()` was entered.

Normal `/maia` FAST / CORE / DEEP paths do not presently expose a general handoff callback.

T1-A therefore owes one minimal **server-only true-handoff signal** for `personalKeepsRead`.

The implementation must locate the real response-producing call in every routing tier that may consume the Personal Keeps projection and signal **after invocation, before awaiting the model result**, matching the Writer's Studio H1 law.

A tier that cannot prove the projection reached its response-producing path must not claim a crossing and must not confirm receipts.

Do not treat “prompt string constructed,” “service entered,” or “provider chosen” as handoff.

---

# 9. Cut F3 — receipt confirmation

The route holds the set of disclosure ids that authorized the projection.

When the true handoff callback fires:

1. confirm **every** receipt corresponding to a Keep actually in the projection;
2. use the existing `confirmDisclosureCrossed()` semantics;
3. a failed confirmation is a governance anomaly and must be surfaced in evidence; it must never be silently re-labelled as success.

Receipt confirmation does not mean the answer succeeded. It means the governed material reached response-producing cognition.

If generation fails after handoff, receipts correctly remain `crossed`.

---

# 10. Cut G — five-item ceiling and continuation

The initial selection requests six refs:

```text
first 5 → eligible for receipts + crossing
6th     → existence proof only; never crosses
```

This yields truthful:

```text
hasMore = true | false
```

J4 ratified “show me more” as another explicit member act. The first implementation must not infer a continuation cursor from model prose.

A lawful continuation context must therefore be a server-owned structured object, not natural-language memory of what the model happened to say.

Minimum continuation identity:

```text
prior Personal Keeps read request
filter text, if any
last admitted kept_at + id cursor
```

The continuation state must be scoped to the same authenticated member and conversation/session and must confer no standing authority beyond the next explicit “show me more” act.

If that continuation substrate cannot be implemented without broad new persistence, J5 MUST split:

```text
J5-A initial five-item read
J5-B explicit continuation
```

and T1-A may not claim the ratified continuation behavior LIVE until J5-B closes.

No silent widening is permitted merely to finish the feature in one commit.

---

# 11. Response contract

For a successful inventory read, MAIA may answer only from the authorized Personal Keeps projection.

The injected block must explicitly instruct:

```text
- these are Personal Field / Portfolio Keeps selected by the member in the past;
- list or answer the member's inventory question only;
- chronology is member-act order, not importance;
- do not infer why a Keep mattered;
- do not synthesize patterns across Keeps;
- do not claim source detail that is absent;
- do not treat this read as permission for future surfacing;
- if hasMore, say more exist without describing them.
```

The first response must not pull in Press Keeps, Marked Moments or Reflection Capsules under the generic Keep label.

---

# 12. Existing contradictions carried beside, not smuggled into this build

J2 named defects in the older conversational **Keep creation** sidecar and broader atom readers.

T1-A J5 is a READ lane. Therefore:

- do not repair the older immediate-write conversational Keep path in this implementation;
- do not redesign `/maia/keep-capture`;
- do not repair the ambient atom loader here;
- do not backfill or reinterpret historical atoms;
- do not wire `KeepAffordance` as a side effect;
- do not alter Press Keeps, Marked Moments or Capsules.

Those contradictions remain separately owed. If any of them blocks the T1-A read path mechanically, STOP and name the dependency rather than absorbing repair scope.

---

# 13. Required tests before implementation may be called complete

## Invocation falsifiers

- navigation phrases never invoke read;
- ambiguous Keep-domain mentions never invoke read;
- ordinary “keep” language never invokes read;
- explicit inventory phrases do invoke read;
- filter extraction cannot turn arbitrary conversation into an ambient search.

## Selector falsifiers

- non-`member-gesture` atom dies;
- wrong member dies;
- non-personal scope dies;
- Sanctuary posture dies;
- protected / archived / set-aside rows die under the frozen status policy;
- practitioner observation cannot enter by source-type accident;
- return preference cannot exclude an explicitly member-pulled Keep;
- sixth result never appears in the cognition projection.

## Disclosure falsifiers

- no consent row → selector never runs;
- one receipt per admitted Keep ref;
- no batch source ref;
- any receipt refusal → zero Keep projection handoff;
- receipt contains no Keep title/body/filter text;
- wrong boundary/source class/scope/gesture dies at schema or type gate;
- no receipt confirmation before true cognition handoff;
- handoff failure leaves receipt attempted;
- generation failure after handoff leaves receipt crossed.

## Experience falsifiers

- result count ≤ 5;
- order is kept chronology, never model ranking;
- no source dereference for non-spontaneous Keep;
- empty Personal Keeps does not claim the member never kept anything elsewhere;
- no `/maia` visual redesign required;
- read does not mutate `return_preference`;
- later ordinary turn receives no standing permission from the prior read;
- Sanctuary cannot execute Personal Keeps READ.

---

# 14. Proposed implementation file envelope

Expected existing files touched only where mechanically necessary:

```text
lib/consciousness/personalKeepsReadIntent.ts                  NEW
lib/consciousness/__tests__/personalKeepsReadIntent.test.ts  NEW
lib/psyche/personalKeepsRead.ts                              NEW
lib/psyche/__tests__/personalKeepsRead.test.ts               NEW
lib/workbench/sources/keep.ts                                REUSE via shared selector
lib/disclosure/contextDisclosureReceipt.ts                   vocabulary types only
lib/disclosure/__tests__/*                                   extend doctrine/falsifiers
app/api/sovereign/app/maia/list/route.ts                     contained invocation + authority orchestration
lib/sovereign/maiaService.ts                                 typed Personal Keeps context + true handoff only
```

Plus **four additive one-axis migrations** for source class, boundary, scope kind and gesture.

A continuation microcut may add one narrowly-scoped server-owned continuation module if required by Cut G. It must not become a general memory/session-state framework.

No member-facing component file is expected in the initial cut.

---

# 15. Explicit non-scope

J5 does not authorize:

```text
CAPABILITY_REGISTRY work
new Keeps room
/maia redesign
new sidebar/rail items
Keep recommendation
Keep relevance ranking
cross-Keep synthesis
source-native detail retrieval
Press Keep union
Marked Moment union
Reflection Capsule union
ambient Personal Keep retrieval
automatic return-preference changes
historical provenance backfill
Sanctuary exception
creation-path repair
broad memory redesign
```

---

# 16. Build sequencing if authorized

The build should proceed as evidence-sized cuts, not one opaque feature commit:

```text
J5-0  falsifiers + invocation contract
J5-1  shared Personal Keep selector
J5-2  four-axis disclosure vocabulary widening
J5-3  request authority + per-object receipt orchestration
J5-4  typed cognition projection + true handoff + confirmation
J5-5  initial five-item experience integration
J5-6  continuation microcut if needed
J5-7  adversarial suite + founder witness candidate
```

Each cut must be independently reviewable. A failure in a later cut does not retroactively authorize widening an earlier one.

---

# 17. Stop conditions

STOP before code or during implementation if any of these becomes true:

1. Personal Keeps READ would require using the broad atom loader instead of the member-gesture selector.
2. Keep content must be placed in client-forgeable `meta` to reach cognition.
3. a true cognition handoff cannot be identified for a routing tier that would receive Keep content.
4. a multi-Keep response cannot account for each object separately.
5. a filtered read requires dereferencing source tables not authorized by J4.
6. “show me more” requires broad new persistence or standing memory authority.
7. the build begins repairing Keep creation, House UI, or ambient memory in order to make READ work.
8. schema widening cannot remain additive and one-axis-at-a-time.
9. Sanctuary must be weakened to make the feature function.

A STOP is a valid J5 result. Scope creep is not.

---

# 18. J5 specification verdict

The implementation is now bounded enough to build without guessing:

```text
EXPLICIT READ
  → awaited consent precondition
  → Personal Keep refs only
  → one receipt per admitted Keep
  → bounded projection only after receipt authority
  → typed server-only cognition input
  → true handoff
  → receipt confirmation
  → ≤5 chronological inventory answer
  → authority expires
```

The significant implementation obligation is **not retrieval**. Retrieval already exists.

It is the truthful custody chain between the member's present request and the moment their prior Keep crosses into response-producing cognition.

**J5 SPECIFICATION COMPLETE. BUILD NOT AUTHORIZED BY THIS RECORD.**
