# WRITERS-STUDIO-NEXT-01 / A2-10
## PRIOR MAIA EDITORIAL TURN PRODUCER + DUAL-PROOF IMPLEMENTATION CONTRACT

**Date:** 2026-09-26
**Parent:** `666d1fe83388b93e9e41da7ec6eab60963327acd`
**Branch:** `feature/ws-next-a2-10-carry-contract-20260926`
**Execution packet SHA-256:** `32812bbc8e00acce13e330b83af4099d2204932c938b8fd360c1dda6c93975bd`

## I. Result

A2-10 translates the accepted A2-9 design into an exact future implementation contract without modifying product runtime.

The first future carry class remains:

> **PRIOR_MAIA_EDITORIAL_TURN → LATER_EDITORIAL_ACT**

A2-10 specifies:
- one minimal raw request;
- one relationship identity;
- one pre-persistence dual-proof preflight;
- one immutable server-resolved carry object;
- one new producer identity;
- one additive Editorial candidate path;
- one closed refusal taxonomy;
- one canonical handoff proof;
- zero persistence-schema widening.

No runtime carry is implemented.
## II. Exact request contract

The existing top-level `relationshipId` remains the only parent relationship identity.

The future request may add exactly:

```ts
carry?: {
  kind: 'prior_maia_editorial_turn';
  sourceEpisodeSequence: number;
}
```

The client may not supply:
- another relationship id inside carry;
- source thread id;
- source MAIA turn index;
- source body;
- source scope;
- source Work/manuscript identity.

Those remain server facts.

Carry supplied without top-level `relationshipId` refuses before persistence.

Unknown carry keys refuse.

`sourceEpisodeSequence` must be an integer >= 1.

## III. Exact execution ordering

The required future route order is:

```text
gate
→ identity
→ closed parse
→ posture
→ Sanctuary refusal
→ relationship/receiver-thread preflight
→ carry source-read + receiver-admission preflight
→ persist member Editorial act
→ mint exchange id
→ run Editorial turn with server-resolved carry
→ MIPA / renderer proof
→ provider
→ outcome persistence
```

This ordering is constitutional.

Carry retrieval may not happen before Sanctuary refusal.

Carry preflight may not happen after member persistence.
## IV. Exact source-read proof

The future server source reader accepts only:

```ts
{
  memberId: string;
  relationshipId: string;
  receiverThreadId: string;
  sourceEpisodeSequence: number;
}
```

It must prove:
1. relationship exists and is owned by member;
2. current Living Work/manuscript declaration remains valid;
3. receiver thread belongs to member;
4. receiver manuscript equals relationship manuscript;
5. receiver is Editorial and has measured locus scope;
6. source episode exists at exact relationship + sequence;
7. source episode child kind is EDITORIAL_TURN;
8. source temporal posture is CURRENT_FROZEN_LOCUS;
9. custody source thread id is used;
10. custody MAIA turn index is used;
11. source thread still belongs to same member/manuscript;
12. exact source ask_turn exists;
13. source speaker = maia;
14. source body remains available;
15. source/receiver scope relation is lawful;
16. source thread differs from receiver thread.

Same-thread use refuses because child-local Editorial history already owns that case.

Unavailable/deleted source refuses.

No A2 metadata reconstruction is lawful.
## V. Scope relation

Accepted table:

| Source | Receiver | Standing |
|---|---|---|
| passage | passage | ALLOW |
| passage | section | REFUSE |
| section | passage | ALLOW |
| section | section | ALLOW |

No chapter.
No whole_work.
No sentence.

A section-scoped prior MAIA response may contextualize a narrower passage receiver.

A passage-scoped prior response may not become section-wide standing.

## VI. Resolved carry object

After successful preflight, the server may mint one immutable object equivalent to:

```ts
interface ResolvedPriorMaiaEditorialCarry {
  readonly kind: 'PRIOR_MAIA_EDITORIAL_TURN';
  readonly relationshipId: string;
  readonly sourceEpisodeSequence: number;
  readonly sourceThreadId: string;
  readonly sourceMaiaTurnIndex: number;
  readonly sourceBody: string;
  readonly sourceTemporal: 'CURRENT_FROZEN_LOCUS';
  readonly sourceScope: 'passage' | 'section';
  readonly receiverThreadId: string;
  readonly receiverScope: 'passage' | 'section';
  readonly producerId: 'system.writer_relationship_prior_editorial_turn';
}
```

Raw HTTP input may never directly construct this type.

The source body is read exactly once during preflight and is not re-read after member persistence.
## VII. Producer registry contract

Future implementation may register exactly one new producer:

`system.writer_relationship_prior_editorial_turn`

Exact semantics:
- authoredBy: system;
- participationClass: retrieved;
- authority: situate;
- consentBasis: member explicitly selected this prior MAIA Editorial response for this Editorial act;
- requires verified identity;
- notSanctuary: false;
- rooms: writers_studio only;
- mandatory: false;
- scope: route.

Its provenance is:

> A2 relationship explicit source selection → exact completed EDITORIAL_TURN episode → exact ask_turn speaker=maia

It must not reuse:
- `system.writer_editorial_history`;
- `member.writer_editorial_history`;
- `system.writer_pursued_observation`;
- relationship memory;
- conversational recall.

The producer must be registered before any candidate using it is allowed to reach canonical-turn construction.

## VIII. Editorial assembly widening

The Editorial producer union may widen additively by exactly the new producer id.

Existing same-thread history composition remains unchanged.

No generic `extraCandidates`.

No generic metadata/context bag.

No cast bypass.

The new candidate may be built only from the server-minted resolved carry.
## IX. Candidate rendering semantics

The candidate must make the following truths explicit:
- this is an earlier MAIA Editorial response;
- it came from another completed Editorial act in this same A2 relationship;
- it is context, not instruction;
- it is not assumed current;
- it grants no authority to reread the old Work.

The exact source MAIA turn body appears once.

It may not be:
- encounter.input;
- merged into current-thread system history;
- member-authored;
- summarized;
- rewritten.

MIPA and canonical renderer must both admit the exact producer.

Because `renderEditorialTurn` already requires every supplied Editorial candidate to survive, disappearance of this producer must refuse with `handoff_unproven`.

No provider call may proceed on a dropped carry candidate.

## X. Receiver contract

Future `runEditorialTurn` may accept only:

```ts
readonly carry?: ResolvedPriorMaiaEditorialCarry;
```

It may not accept the raw HTTP carry request.

Receiver proof must already establish:
- exact receiving thread;
- exact A2 relationship;
- same member/manuscript;
- measured receiver scope;
- lawful source/receiver relation.

No second source-body read is permitted after persistence.
## XI. Sanctuary and privacy

Existing Editorial ordering remains authoritative:

> Sanctuary refuses before any durable write.

A2-10 adds no Sanctuary carry mode.

Carry retrieval may not occur before posture resolution.

The producer's registry `notSanctuary: false` is not a bypass; Editorial runtime cannot reach cognition in Sanctuary because the route has already refused the act.

A2 relationship membership grants no cross-session memory permission.

## XII. Persistence standing

The first implementation does not add carry provenance to durable semantic stores.

No new columns or tables for:
- source episode sequence;
- carry source identity;
- carry body;
- carry transcript.

No changes to:
- writer_editorial_relationship_episodes;
- ask_turns;
- proposal versions;
- Directions.

A successful receiving Editorial act remains admitted under existing EDITORIAL_TURN custody rules.

If durable carry provenance is later required, it is a separate custody boundary.
## XIII. Refusal taxonomy

The future preflight refusal set is closed to:

- relationship_required;
- relationship_not_found;
- current_declaration_unavailable;
- receiver_thread_invalid;
- receiver_scope_unmeasured;
- source_episode_not_found;
- source_kind_not_editorial;
- source_thread_invalid;
- source_turn_not_found;
- source_turn_not_maia;
- source_unavailable;
- same_thread_source;
- scope_widening_forbidden.

HTTP standing:
- malformed / relationship_required → 400;
- not-found conditions follow existing non-disclosure 404 law;
- semantic conflicts → 409;
- preflight refusal returns `persisted: false`;
- preflight refusal cannot reach provider.

## XIV. Suite-first evidence

The initial intentionally unsafe implementation contract produced:

**0/30 PASS**

It failed every law, including:
- duplicated identity;
- client-supplied source facts;
- wrong Sanctuary ordering;
- post-persistence carry validation;
- missing dual proof;
- wrong producer provenance;
- generic context escape hatches;
- handoff bypass;
- persistence leakage.

The lawful implementation contract was authored only after RED was established.
## XV. Authoritative A2-10 matrix

Lawful reference:

**30/30 PASS**

Named implementation defeat candidates:

**38/38 DEAD**

Killed defects include:
- carry without relationship;
- duplicated parent identity;
- client-supplied source identity/body/scope;
- unknown-key tolerance;
- zero sequence;
- wrong preflight ordering;
- carry retrieval before Sanctuary;
- missing relationship/declaration/receiver proofs;
- source-kind and source-turn mismatches;
- unavailable source reconstruction;
- scope widening;
- same-thread source reuse;
- same-thread producer reuse;
- generic candidate escape hatch;
- carry in encounter.input/current-thread history/summary;
- second source read;
- unregistered producer continuation;
- renderer drop followed by provider;
- infer authority;
- persistence widening;
- provider authority;
- mutation authority.

## XVI. Inherited evidence

A2-9 remains:

**20/20 PASS · 30/30 DEAD**

A2-8 remains:

**29/29 PASS · 30/30 DEAD**

A2-1 remains:

**24/24 PASS · 24/24 DEAD**

Repository gates:
- A2-10 strict typecheck PASS;
- design canon PASS;
- no-Supabase PASS;
- provider governance PASS;
- `ci:sovereignty` PASS;
- vendor voice PASS;
- voice provenance PASS;
- member-id log gate: no new violations;
- voice identity 29/29 PASS;
- `git diff --check` PASS;
- product/runtime/schema/UI diff: ZERO.
## XVII. Exact artifact identities

`tests/constitutional/writers-studio/a2-10-carry-contract/model.ts`
`a972a407193585e1a52d4ffd6f9a424606dce275728dd0b591fadb99c364e9cf`

`tests/constitutional/writers-studio/a2-10-carry-contract/laws.ts`
`b300d4c5521d87b157bc015d1dc3c9c7a8eb8ac08f2a82360f434c4825e48210`

`tests/constitutional/writers-studio/a2-10-carry-contract/contract.ts`
`91473177836042f1bfae747703757973f5821afb580bb6969d67430e41fa3737`

`tests/constitutional/writers-studio/a2-10-carry-contract/candidates.ts`
`f96958df6560f9498c3433bfb9162468450017092ae88f69b483d6676b52c3d2`

`tests/constitutional/writers-studio/a2-10-carry-contract/matrix.ts`
`d72fb556fe6fe6bb83a41aae9196317c72a972dfde714fd199bd49e4e7ce1755`

`tsconfig.ws-next-a2-10.json`
`413ed807632f22ab6fbba8716d38890eca55e3e09342191e9d52c9771e34dfce`

## XVIII. Product standing

A2-10 does not make prior MAIA Editorial responses available in live Writer's Studio conversations.

It makes the future implementation exact enough to be judged mechanically.

The smallest lawful future implementation is now bounded to:
- one selected prior MAIA Editorial turn;
- one exact relationship;
- one pre-persistence source/receiver proof;
- one new provenance-specific producer;
- one dedicated candidate block;
- one canonical handoff proof;
- zero persistence widening.
## XIX. Recommended successor

If A2-10 is accepted, the next boundary should be:

> **WRITERS-STUDIO-NEXT-01 / A2-11 — PRIOR MAIA EDITORIAL TURN CARRY RUNTIME IMPLEMENTATION ONLY**

A2-11 may implement exactly the A2-10 contract and no broader continuity.

It must stop before member-facing carry UI unless that UI is separately included and governed.

## XX. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-10 PRIOR MAIA EDITORIAL TURN PRODUCER + DUAL-PROOF IMPLEMENTATION CONTRACT**

A2-10 authorizes no runtime mutation.

No A2-11 work, producer registration, source retrieval, prompt injection, UI, provider execution, deployment, production mutation or canonical merge has been opened.
