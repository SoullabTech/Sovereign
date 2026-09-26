# WRITERS-STUDIO-NEXT-01 / A2-13
## ELIGIBLE CARRY SOURCE READ SEAM + INLINE SELECTION UI IMPLEMENTATION CONTRACT

**Date:** 2026-09-26
**Parent:** `45494df0734a52faf751e5f8af4953612a144af4`
**Branch:** `feature/ws-next-a2-13-carry-ui-contract-20260926`
**Execution packet SHA-256:** `cdaa4e61878d60751114675de33ea0291a49582d6b9c22ad9aebd1c1b855edad`

## I. Result

A2-13 converts the accepted A2-12 experience into an exact implementation contract without changing product code.

The first UI implementation remains confined to the Rebuild/RevisionDesk Editorial host.

No parallel Canvas implementation is admitted.

## II. Eligible-source endpoint

Future endpoint:

`GET /api/writers-studio/relationships/:relationshipId/carry-sources?receiverThreadId=:threadId`

Contract:
- GET only;
- existing Editorial feature gate;
- verified member identity;
- relationship id appears only in the path;
- receiverThreadId is required;
- no mutation;
- no provider call;
- current relationship GET remains content-free.

Successful response:

```ts
{
  relationshipId: string;
  receiverThreadId: string;
  sources: [{
    kind: 'prior_maia_editorial_turn';
    sourceEpisodeSequence: number;
    sourceScope: 'passage' | 'section';
    admittedAt: string;
    excerpt: string;
    excerptTruncated: boolean;
  }]
}
```

The endpoint does not expose source thread ids, source MAIA turn indexes, long full bodies, generated titles/summaries, relevance scores, or omitted-source refusal reasons.
## III. Eligibility and excerpt law

Each returned choice must satisfy the A2-11 source laws:
- exact relationship ownership;
- current Work/manuscript declaration;
- exact receiver Editorial thread and measurable scope;
- source episode in same relationship;
- source kind EDITORIAL_TURN;
- CURRENT_FROZEN_LOCUS source;
- source thread differs from receiver thread;
- source thread still belongs to same member/manuscript;
- exact source MAIA turn exists;
- source body remains available;
- source/receiver scope relation is lawful.

Ineligible sources are omitted.

Excerpt limit:

> **320 Unicode code points**

Excerpt is an exact prefix of the source MAIA body.

No normalization.
No generated shortening.
No server-inserted ellipsis.

`excerptTruncated` tells presentation whether to add a visual truncation marker outside source text.

The full source body remains server-side and is re-resolved by A2-11 only after the writer sends the selected episode sequence.

## IV. Ordering

Eligible choices may be ordered:

`admitted_at ASC, sequence ASC`

Chronological order is presentation only.

It grants no default, recommendation, recency, or selection authority.
## V. Client read seam

Future client helper:

`readEligibleCarrySources(relationshipId, receiverThreadId)`

It strictly validates the response.

It must not:
- infer malformed fields;
- cache across relationship identity;
- cache across receiver-thread identity;
- use persistent browser storage;
- fall back to the relationship GET;
- fall back to episode count.

## VI. Authority-bearing state ownership

The Rebuild host owns carry chooser and selected-source state because it already owns:
- selected A2 relationship;
- active Editorial thread;
- current place;
- send gesture.

RevisionDesk remains presentation-only.

Canvas does not receive a parallel implementation in the first act.

Chooser states:
- closed;
- loading with exact relationship/thread/generation;
- ready with exact sources and identities;
- unavailable.

Selected state contains only the chosen source-list card data and exact relationship/thread identities.

It is ephemeral React host state only.

No localStorage.
No sessionStorage.
No relationship return.
No place return.
## VII. Async race law

Opening chooser:
1. increments generation;
2. captures current relationship id + receiver thread id;
3. enters loading;
4. reads eligible sources;
5. admits result only if generation, relationship id and receiver thread id all still match.

Late results after relationship/thread change are ignored.

Opening does not select anything.

Closing chooser does not clear an already selected source.

## VIII. Selection law

The writer explicitly selects one current ready source card.

Selection:
- maximum one;
- visible;
- removable;
- separate from member textarea;
- does not navigate;
- does not persist.

Selecting a second source explicitly replaces the first.

Selection clears immediately when:
- relationship changes;
- receiver thread changes;
- current Editorial thread is released by place change;
- manuscript/Work changes;
- relationship is left;
- workspace closes and releases the thread;
- reload occurs.

No matching by excerpt or episode sequence across identity changes.
## IX. Send integration

Future `sendBoundEditorialTurn` may add one final optional parameter:

```ts
carry?: {
  kind: 'prior_maia_editorial_turn';
  sourceEpisodeSequence: number;
}
```

The host sends carry only when selected source identities equal the current:
- relationship id;
- receiver thread id.

The request sends only:
- kind;
- sourceEpisodeSequence.

It does not send excerpt, source scope, source body, source thread id, date or source turn index.

A2-11 re-resolves the exact full source server-side.

## X. One-shot consumption timing

A selected source represents one member act.

Send sequence:
1. read current Sanctuary posture;
2. if posture is unresolved locally, do not initiate transport and preserve selection;
3. snapshot selected carry if identities match;
4. clear selected carry locally;
5. initiate HTTP request;
6. render outcome.

Once transport is initiated, selection is not automatically restored.

Therefore:
- network failure does not silently repeat the member's source-selection act;
- provider failure does not restore it;
- stale/unavailable source refusal does not restore it;
- no automatic replacement source is chosen.

The writer may explicitly select again.
## XI. Member copy and presentation

Action:
> **Bring an earlier MAIA response**

Chooser:
> **Earlier in this relationship**

Selected:
> **Earlier MAIA response**

Unavailable list:
> **Earlier MAIA responses could not be checked just now. Nothing has been selected.**

Empty list:
> **No earlier MAIA Editorial responses are available to bring into this conversation.**

Stale selected source:
> **That earlier MAIA response is no longer available to bring forward. Nothing from it was added. Choose another response if you want to try again.**

Desktop:
- inline above composer;
- compact single-column list;
- internal scroll after roughly 240–320 px;
- no history page or side rail.

Mobile:
- anchored sheet/popover permitted if necessary;
- returns to same composer;
- no route change;
- no navigation destination.

Accessibility:
- button action;
- chooser heading/region;
- source-card buttons with excerpt + scope/date accessible labels;
- selected state programmatically exposed;
- explicit Remove button;
- polite loading/failure status;
- focus return on close/select.
## XII. Evidence

Suite-first unsafe implementation design:

**0/28 PASS**

Lawful A2-13 implementation contract:

**28/28 PASS**

Named implementation defeats:

**60/60 DEAD**

Inherited:
- A2-12: **26/26 PASS · 38/38 DEAD**
- A2-10: **30/30 PASS · 38/38 DEAD**
- A2-9: **20/20 PASS · 30/30 DEAD**
- A2-8: **29/29 PASS · 30/30 DEAD**
- A2-1: **24/24 PASS · 24/24 DEAD**

TypeScript no-regression:
- 4,462 program files;
- 226 current errors;
- 239 baseline errors;
- no regressions.

Repository gates:
- design canon PASS;
- no-Supabase PASS;
- provider governance PASS;
- `ci:sovereignty` PASS;
- voice identity 29/29 PASS;
- `git diff --check` PASS;
- product/runtime/schema/UI diff ZERO.

## XIII. Exact artifact identities

`model.ts` — `6cce51b2a423858c6f3f53758a98e4afeb98bc79895599c3a78d0b277d2cd1ee`

`laws.ts` — `f84e63c2f12f735be7e8c92ce24fad989614ee9e0221171312a91ef9a96ef2c1`

`contract.ts` — `0fc5de877278efe7c0f090e4076fe500851fa0f410bf04c20ce3b6b76e4dfcc3`

`candidates.ts` — `b755e530703909051e7827dc409544b76e39cc7c2094182557c523b6a21b6993`

`matrix.ts` — `30982933e7098222f3cf576b3f034f38596fbe3affa53b84e080610d1b63469d`

`tsconfig.ws-next-a2-13.json` — `5b22abb3246c8507ac1df1d996506886aa2376ebd9de90105e901472bfb4870a`
## XIV. What A2-13 does not implement

No:
- eligible-source API route;
- source-list SQL;
- client helper;
- Rebuild host state;
- RevisionDesk controls;
- CSS;
- mobile sheet;
- send signature change;
- Canvas implementation;
- database mutation;
- new carry class;
- deployment;
- production mutation;
- canonical merge.

## XV. Recommended successor

If accepted:

> **WRITERS-STUDIO-NEXT-01 / A2-14 — ELIGIBLE CARRY SOURCE READ + REBUILD INLINE SELECTION UI IMPLEMENTATION ONLY**

A2-14 may implement exactly this contract:
- narrow source-list API;
- strict client helper;
- Rebuild host state machine;
- RevisionDesk presentation;
- sequence-only carry send;
- one-shot clearing.

It must stop before Canvas convergence, broader carry classes, deployment or production mutation.

## XVI. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-13 ELIGIBLE CARRY SOURCE READ SEAM + INLINE SELECTION UI IMPLEMENTATION CONTRACT**

A2-13 authorizes no product implementation.

No A2-14 work has been opened.
