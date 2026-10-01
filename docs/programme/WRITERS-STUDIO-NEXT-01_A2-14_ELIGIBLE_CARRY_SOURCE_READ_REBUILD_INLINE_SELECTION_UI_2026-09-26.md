# WRITERS-STUDIO-NEXT-01 / A2-14
## ELIGIBLE CARRY SOURCE READ + REBUILD INLINE SELECTION UI IMPLEMENTATION ONLY

**Date:** 2026-09-26
**Parent:** `6da5305e066b2e8fce8d96cec9f1f9de9540e81f`
**Branch:** `feature/ws-next-a2-14-carry-ui-runtime-20260926`
**Execution packet SHA-256:** `14260c272e6e52731d62385bfabbe6b2a3d72dbf9b9b04925852892cb12322e4`

## I. Result

A2-14 implements the A2-13 eligible-source read seam and the A2-12 member-facing source-selection experience in the Rebuild/RevisionDesk Editorial host.

The implemented member action is:

> **Bring an earlier MAIA response**

The implementation remains limited to the one A2-11 carry class:

> **PRIOR_MAIA_EDITORIAL_TURN → LATER_EDITORIAL_ACT**

No Canvas implementation, new carry class, database migration, deployment, production mutation or canonical merge is included.

## II. Eligible-source server read

New route:

`GET /api/writers-studio/relationships/:relationshipId/carry-sources?receiverThreadId=:threadId`

It:
- uses the existing Editorial feature gate;
- requires authenticated member identity;
- accepts relationship identity only in the path;
- requires receiverThreadId;
- performs no mutation;
- performs no provider call;
- leaves the existing relationship GET content-free.

The route maps:
- unavailable feature / missing relationship → existing 404 non-disclosure posture;
- unauthenticated → 401;
- missing receiverThreadId → 400;
- receiver/declaration semantic refusal → 409;
- valid empty or non-empty eligible list → 200.
## III. Eligible-source service

New server service:

`listEligiblePriorMaiaEditorialCarrySources`

It proves:
- relationship belongs to authenticated member;
- current Living Work/manuscript declaration exists;
- receiver thread belongs to member;
- receiver manuscript equals relationship manuscript;
- receiver is an Editorial thread with measured passage/section scope;
- source episode belongs to exact relationship;
- source episode kind = EDITORIAL_TURN;
- source temporal posture = CURRENT_FROZEN_LOCUS;
- requested/executed source scope agree;
- source thread differs from receiver thread;
- source thread still belongs to same member/manuscript;
- exact source ask_turn exists;
- source speaker = maia;
- source body is available;
- passage source is omitted for a section receiver.

Sources are ordered:
`admitted_at ASC, sequence ASC`

Order is presentation only.

The query returns only eligible rows; omitted source reasons are not disclosed.

## IV. Exact excerpt law

Public source cards receive only an exact source prefix.

Maximum:

> **320 Unicode code points**

Behavior:
- source <= 320 code points → full exact source body, `excerptTruncated=false`;
- longer source → first 320 exact code points, `excerptTruncated=true`.

No whitespace normalization.

No generated shortening.

No server-added ellipsis inside the source excerpt.

No source thread id or MAIA turn index crosses the public list seam.

The full source remains server-side for A2-11 re-resolution at send time.
## V. Strict client read

New client helper:

`readEligibleCarrySources(relationshipId, receiverThreadId)`

It calls only the narrow carry-sources endpoint.

It strictly validates:
- exact top-level key set;
- exact source-row key set;
- matching response relationship id;
- matching receiver thread id;
- literal source kind;
- positive integer episode sequence;
- passage/section scope;
- parseable admittedAt;
- excerpt string <= 320 Unicode code points;
- boolean truncation flag.

Malformed or identity-mismatched payloads refuse as unreadable.

No fallback to relationship GET.

No fallback to episode count.

No persistent cache.

## VI. Rebuild host state

The Rebuild host now owns:
- chooser generation;
- chooser state;
- selected source;
- latest relationship id ref;
- latest receiver thread id ref;
- current Sanctuary availability for the chooser.

Chooser states:
- closed;
- loading;
- ready;
- unavailable.

Async source-list results are admitted only when:
- generation still matches;
- relationship id still matches;
- receiver thread id still matches.

Late results after relationship/thread change are ignored.

RevisionDesk does not fetch eligible sources and does not own selected-source authority.
## VII. Identity and posture clearing

Chooser and selected source clear when:
- selected A2 relationship id changes;
- active Editorial thread id changes;
- focused place changes;
- manuscript id changes;
- Editorial workspace opens/closes.

The same effect covers Work changes through the A2 relationship/manuscript binding: a Work transition cannot preserve the same valid selected A2 relationship for another Work.

The chooser's availability is re-read from the live current Sanctuary posture when:
- the workspace/relationship/thread changes;
- `maia-settings-changed` fires;
- browser storage changes;
- window focus returns.

If Sanctuary is on or posture cannot be resolved, the chooser closes and its action is unavailable.

A previously selected visible source remains removable; it is not silently transformed or replaced.

## VIII. Selection presentation

RevisionDesk remains presentation-only.

New inline presentation:
- **Bring an earlier MAIA response** button;
- loading status;
- **Earlier in this relationship** headed region;
- compact source-card buttons;
- scope + ordinary date/time;
- exact excerpt;
- visual ellipsis outside source text only when `excerptTruncated=true`;
- empty-list copy;
- unavailable-list copy;
- selected **Earlier MAIA response** chip;
- explicit Remove button.

The selected source remains outside the writer's textarea.

No history drawer.

No relationship timeline.

No navigation to the old thread.

No Canvas implementation.

The chooser uses bounded inline height with internal scroll, so the manuscript/editorial conversation remains primary on desktop and narrow layouts.
## IX. Sequence-only send

`sendBoundEditorialTurn` now accepts one final optional carry selector:

```ts
{
  kind: 'prior_maia_editorial_turn',
  sourceEpisodeSequence: number
}
```

The request carries only those two fields.

It does not carry:
- excerpt;
- source scope;
- source thread id;
- source MAIA turn index;
- source body;
- admittedAt.

A2-11 remains authoritative for source re-resolution.

## X. One-shot consumption

`sendEditorial` now reads the current Sanctuary posture before resolving the Editorial act.

If posture is unresolved locally:
- no transport is initiated;
- selected carry remains available for the writer.

After writing is settled and the exact receiver thread is known:
- selected carry is used only if its relationship id and receiver thread id still match;
- stale selected state is cleared;
- a matching source is converted to kind + episode sequence only;
- selected source is cleared immediately before `sendBoundEditorialTurn`.

Once transport is initiated:
- network failure does not restore selection;
- provider failure does not restore selection;
- stale/unavailable source refusal does not restore selection;
- no other source is auto-selected.

The writer may explicitly select again.
## XI. Direct evidence

### Focused A2-14 product tests

**25/25 PASS**

Breakdown:
- server eligibility/excerpt service: 3/3;
- eligible-source route: 4/4;
- strict client source reader: 4/4;
- relationship/send carriage including sequence-only carry: included in focused suite;
- RevisionDesk inline source chooser/presentation: included in focused suite.

The route test with dynamic `[id]` was run separately by exact path because Jest's ordinary pattern mode treats brackets specially.

### Real PostgreSQL eligibility witness

**6/6 PASS**

Proved:
- passage receiver sees eligible section + passage sources;
- same-thread source omitted;
- deleted source omitted;
- exact 320-code-point excerpt and truncation flag;
- neutral chronological episode order;
- section receiver omits passage-scoped source.

### Static host authority witness

**8/8 PASS**

Proved:
- posture read precedes Editorial resolution/transport;
- matching carry clears before transport;
- unresolved posture returns before clear/transport;
- identity-change effect clears chooser + selected source;
- generation + relationship + thread guard late async results;
- RevisionDesk is presentation-only;
- send helper carries source separately;
- selected context is outside member textarea.

### Authenticated HTTP probe

A real authenticated HTTP probe was attempted against the disposable Next/PostgreSQL witness environment.

The tool safety layer blocked the synthetic session-cookie request before execution.

That attempt is **not counted as A2-14 evidence** and no workaround was attempted.

The route itself is covered by exact-path route tests; the server service is covered by the real PostgreSQL witness.
## XII. Regression evidence

Writer's Studio focused regression:

**174/174 PASS across 10 Jest suites**

Includes:
- Editorial discourse contract;
- Writer's Studio room policy;
- Sanctuary Editorial matrix;
- A2-11 source resolver;
- A2-11 carry route;
- A2-11 canonical handoff;
- A2-14 inline Editorial UI;
- A2-14 eligible-source service;
- A2 relationship/send carriage;
- A2-14 strict client read.

Inherited constitutional matrices remain GREEN + lethal:
- A2-13: 28/28 PASS · 60/60 DEAD;
- A2-12: 26/26 PASS · 38/38 DEAD;
- A2-10: 30/30 PASS · 38/38 DEAD;
- A2-9: 20/20 PASS · 30/30 DEAD;
- A2-8: 29/29 PASS · 30/30 DEAD;
- A2-1: 24/24 PASS · 24/24 DEAD.

TypeScript no-regression:
- 4,463 program files;
- 226 current errors;
- 239 baseline errors;
- no regressions.

Repository gates:
- design canon PASS — 2 member-facing surfaces covered by 1 Experience Contract;
- no-Supabase PASS;
- provider governance PASS;
- `ci:sovereignty` PASS;
- vendor voice PASS;
- voice provenance PASS;
- member-id log gate: no new violations;
- voice identity 29/29 PASS;
- `git diff --check` PASS;
- Canvas diff EMPTY.
## XIII. Exact implementation identities

`app/api/writers-studio/relationships/[id]/carry-sources/route.ts`
`466f887e10677fdf7885971970e37b9bec8d20889f28889bd8db9db5ad1b8e26`

`app/api/writers-studio/relationships/[id]/carry-sources/__tests__/route.test.ts`
`7ef2586d269fbddf4ed7407dc14e3cc008476ba253f240a28a4c871c659ef1e2`

`app/writers-studio/insight/RevisionDesk.tsx`
`adffa9fa13e1158a97201189db072d452e4966d3ff880223e27572db0fac0d9b`

`app/writers-studio/rebuild/RebuildStudioClient.tsx`
`e60ca563bc0ed353174295381456e7e62cc16c15f5cfd7b857905d2827d82150`

`app/writers-studio/__tests__/inlineEditorial.test.ts`
`97cb3d156a17c0b3f42ef851e863b4826f52c12f0557f4784d694107f9f70074`

`lib/writers-studio/relationshipCarriage.ts`
`49d431b92d3f1b89b8d9c7c729d1f216f9029f3ed3263364dc4f6cdcf96850b2`

`lib/writers-studio/__tests__/relationshipCarrySources.test.ts`
`cd28b22af582b4caaf9b6b5ed771eb2f6cf6e9313ba478fa4dddd7dc659a236e`

`lib/writersStudio/rebuild/relationshipOrchestration.ts`
`0eb2118d504d11fbb25930e9b1c4ba79a464a0f6c6bb486c41387c7b51e03775`

`lib/writersStudio/rebuild/editorialCollaboration.ts`
`2411cdc4f4be9cca7a0117fadba287a5b18060b4c619b4161dbee72333908480`

`lib/writersStudio/rebuild/__tests__/a2CarrySourceClient.test.ts`
`2f74f3064dc65c7763460b949757bffd0da0348839ea87368ece4c003dde9d7d`

`lib/writersStudio/rebuild/__tests__/a2RelationshipCarriage.test.ts`
`695bf91d8cb2d200d3f4b45cbc34706ed6941ff5523c3412d8d3a0e39ef2864f`

`tests/constitutional/writers-studio/a2-14-carry-ui-runtime/live-witness.ts`
`42661731891e71f87b63da4bed36419ee2eb892f031e0da0f7ed34d58606701d`

`tests/constitutional/writers-studio/a2-14-carry-ui-runtime/static-witness.ts`
`eb41f461cb5aa0bc7578a77beb0dd9cd7b321bf4950dfd7b57d9c8c28a23f055`
## XIV. Explicit exclusions

A2-14 does not implement or authorize:
- Canvas source-selection UI;
- Canvas A2 relationship carriage convergence;
- more than one selected source;
- automatic source choice;
- relevance ranking;
- full prior transcript browsing;
- member-turn carry;
- summary carry;
- Review carry;
- Focus carry;
- durable selected-source state;
- new database tables or columns;
- carry-source provenance persistence;
- A3;
- deployment;
- production mutation;
- canonical merge.

## XV. Product standing

The Writer's Studio now has a complete first member-facing path for explicit cognition-bearing relationship continuity in the Rebuild Editorial experience:

1. the writer is already in one explicitly selected A2 relationship;
2. the writer has one active Editorial conversation;
3. the writer chooses **Bring an earlier MAIA response**;
4. only currently eligible prior MAIA Editorial responses are shown;
5. the writer selects one;
6. it appears separately above the composer;
7. the writer sends their own words;
8. only the source episode sequence accompanies that turn;
9. A2-11 re-proves and re-reads the source server-side;
10. the source selection is consumed once.

This is relationship continuity without automatic memory, transcript flattening or hidden relevance inference.

## XVI. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-14 ELIGIBLE CARRY SOURCE READ + REBUILD INLINE SELECTION UI IMPLEMENTATION**

A2-14 stops before:
- Canvas convergence;
- additional carry classes;
- deployment;
- production mutation;
- canonical merge.

No successor is opened by this record.
