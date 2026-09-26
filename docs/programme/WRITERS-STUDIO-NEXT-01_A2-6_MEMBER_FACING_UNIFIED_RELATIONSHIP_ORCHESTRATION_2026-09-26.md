# WRITERS-STUDIO-NEXT-01 / A2-6
## MEMBER-FACING UNIFIED RELATIONSHIP ORCHESTRATION + SCOPE TRANSITIONS

**Date:** 2026-09-26
**Parent candidate:** 4f5f05069892948a23c0cfd477412d72b6ac950a
**Packet:** 651c15a7624bde226bff0e8c70c5d7f176b2317017fad398b260cf50e812e598 · 6,923 bytes · 219 lines
**Cross-episode cognition carry:** NONE
**Focus:** UNCHANGED / EXCLUDED
**Deployment:** NONE

## I. Result

A2-6 makes the A2 parent relationship explicit in the current Writer’s Studio member experience.

The writer can:
- begin one relationship with MAIA for the exact current Living Work + manuscript;
- choose one existing parent explicitly;
- see that one relationship is active;
- leave it without deleting it;
- carry its exact identity through Editorial and Review gestures;
- move between currently supported child contexts without reminting the parent.
## II. No-auto-selection law

No A2 parent is selected merely because it exists.

The Studio does not:
- choose the only relationship;
- choose latest;
- choose first;
- infer from Editorial child thread;
- infer from Review reading;
- infer from session;
- create on mount;
- create on first child gesture.

No relationship query parameter means no A2 parent is selected.

A parent becomes active only through:
- explicit Begin relationship with MAIA; or
- explicit choice of one exact existing relationship.
## III. Parent relationship address

Canonical Canvas parameter:

relationship

The parameter is an exact address for the member’s selected A2 parent.

It is not:
- server authorization;
- a current/latest selector;
- durable manuscript place;
- child thread identity.

Section navigation preserves it.
Editorial child-thread open/clear preserves it.
Changing parent replaces only it.
Leaving parent removes only it.

The selected parent is also held in current component state at the choosing gesture because same-document replaceState is an address update, not a reactive search-param authority.
## IV. Work-context gate

A2 parent orchestration is available only when Writer’s Studio has exactly one member-declared Living Work for the manuscript.

Work context:
- exact one Work → relationship Begin/Choose available;
- no Work → blocked with truthful declaration guidance;
- multiple Works → blocked; Studio refuses to guess which Work;
- unresolved Work context → blocked while context is established.

A selected URL parent is validated by exact server read against the current Work + manuscript.

A foreign, stale, or mismatched parent address is not adopted and is repaired out of the URL.
## V. Member-facing control

One compact Relationship with MAIA control now lives at the top of the MAIA companion panel, above Chapter Review / Passage Work.

Unselected state:
- clearly says no MAIA relationship is selected;
- offers Begin relationship with MAIA;
- lists existing relationships as explicit choices when any exist.

Selected state:
- says one relationship is being continued across Editorial and Review;
- allows Change;
- allows Begin another relationship;
- allows Leave this relationship · nothing is deleted.

This does not enlarge or redesign the manuscript canvas.
## VI. Parent versus child relationship identity

The new A2 parent is not the existing Editorial child thread.

Existing Rebuild relationshipChoices remain:
- Editorial revision conversations about one exact locus;
- independently selectable;
- subordinate child objects.

The member-facing naming distinguishes:
- Relationship with MAIA = A2 parent continuity;
- revision conversation = Editorial child thread.

Changing or clearing an Editorial child thread does not clear the selected A2 parent.
## VII. Child carriage

When a parent is selected:

Editorial:
- sendBoundEditorialTurn carries the exact relationshipId.

Review Discuss:
- commissionReviewDiscuss carries the exact relationshipId.

When no parent is selected:
- both helpers omit relationshipId entirely;
- existing child behavior is unchanged.

No A2 parent identity is sent to Focus, Ask, Interpret, Explore, or any non-authorized child seam in this act.
## VIII. Scope transitions

The same selected A2 parent survives current member transitions such as:
- Chapter Review → Passage Work;
- Passage Work → Chapter Review;
- section navigation;
- Editorial child-thread open/clear.

The parent does not convert one child subject into another.

Review remains finding-scoped.
Editorial remains locus-scoped.

No chapter/whole-Work/sentence cognition capability is claimed by the relationship selector or by its URL identity.
## IX. Parent list/read/create substrate

Server list API:
GET /api/writers-studio/relationships?livingWorkId=...&manuscriptId=...

It returns all matching owned parent relationships, content-free and unranked for selection.

The presentation order may be chronological, but no row is marked:
- default;
- current;
- suggested;
- most recent winner.

Existing:
- POST /api/writers-studio/relationships
- GET /api/writers-studio/relationships/[id]

remain the explicit create and exact-address read boundaries.
## X. A2-6 evidence

Address law:
**7/7 PASS**

Proves:
- exact relationship param round-trip;
- no fallback;
- preservation beside manuscript, section and Editorial child-thread ids;
- section movement preserves parent;
- child-thread open/clear preserves parent;
- leaving parent removes only parent address.

Child helper carriage:
**4/4 PASS**

Proves:
- Editorial selected id carried exactly;
- Editorial absence omits the field;
- Review selected id carried exactly;
- Review absence omits the field.
## XI. Real browser member witness

A2-6 member orchestration witness:
**14/14 PASS**

Real:
- Next.js;
- PostgreSQL;
- auth session;
- current Rebuild Studio UI;
- A2 relationship APIs.

Proved:
1. zero parents starts unselected;
2. Begin is explicit;
3. Begin creates and selects exactly one parent;
4. Passage Work preserves parent;
5. Chapter Review preserves parent;
6. Leave removes address but not durable parent;
7. one existing parent is not auto-selected;
8. explicit existing choice restores exact id;
9. Begin another creates a distinct parent;
10. multiple existing parents remain unselected;
11. exact chosen parent wins;
12. foreign/tampered URL parent is inactive and repaired;
13. ambiguous Work context blocks Begin/select;
14. absent Work declaration blocks Begin/select.
## XII. Witness correction record

First browser run: 10/14.

The four failures shared one cause: assertions sampled after the shell’s unselected state rendered but before asynchronous relationship listing/address validation reached ready state.

No member action failed.

The witness was repaired to wait on observable ready conditions:
- Begin control present;
- relationship choices populated;
- invalid parent address removed.

The complete witness was then rerun from a fresh disposable database and passed 14/14.

This timing repair changed witness observation, not product semantics.
## XIII. Inherited evidence

A2-5R3 live server carriage:
**21/21 PASS**

A preliminary regression invocation pointed that witness at ws_a26_regression_20260926.
The witness correctly refused because its safety guard requires a database named as an A2-5R3 witness.

It was rerun against a fresh database named:
ws_a25r3_witness_20260926

Final result:
**21/21 PASS**

The refusal was a witness safety condition, not a semantic regression.
Further inherited standing:
- A2-5R2 scope witness 11/11 PASS;
- A2-4 custody witness 19/19 PASS;
- canonical empty-DB reconstruction 5/5 PASS;
- A2-5R1 18/18 GREEN · 18/18 DEAD;
- A2-3 37/37 GREEN · 35/35 DEAD;
- A2-2 55/55 GREEN · 30/30 DEAD;
- A2-1 24/24 GREEN · 24/24 DEAD;
- R2-2 17/17 GREEN;
- Editorial runtime lethal · 0 failures;
- proposal/selection 35/35 PASS;
- Sanctuary Editorial 22/22 PASS;
- Focus 64/64 PASS.
## XIV. Repository gates

TypeScript no-regression:
- 4,459 program files;
- 226 current errors;
- 239 baseline errors;
- 13 errors fixed;
- no regressions.

Design canon:
PASS · one member-facing surface covered by an Experience Contract.

Other gates:
- no-Supabase PASS;
- provider governance PASS;
- ci:sovereignty PASS;
- voice identity 29/29 PASS;
- git diff --check PASS.

Focus diff: EMPTY.
## XV. Exact implementation identities

app/api/writers-studio/relationships/route.ts
839041f5b49a037165372c0aad920c750ef25e84e8cac4671158df7510f4c523

app/writers-studio/canvasIdentity.ts
77ff72ad1f974818e4b620b57463e71e3fd222df6a1b7b23c7cde31dfc398d2b

app/writers-studio/rebuild/RebuildStudioClient.tsx
b02796b29bab0f6bdce425868c519e0b7d417f37faccd40a9312c56b21bef03e

app/writers-studio/__tests__/a2RelationshipAddress.test.ts
58578106ad2bb44fd1e278a6cef8be69a5ca67e1c54e8490040091abea58966c
lib/writers-studio/relationshipCustody.ts
cfe670b19dd80973ef542735aa27e9071a7b2c0be512093ece4d314f069faa36

lib/writersStudio/rebuild/editorialCollaboration.ts
5b3094728472477444fb4b8ae336b53dede2ca9bc3cef00b74055ee79dcd6284

lib/writersStudio/rebuild/reviewDiscuss.ts
e4edcc635ab2fa30de6bfffb31fe8349bf780fe51805f13598a334b8754528a0

lib/writersStudio/rebuild/relationshipOrchestration.ts
feaad4a2ea609f0d0cb6ab941eb868f8b49979e6b3fde19ad801048943d80065
lib/writersStudio/rebuild/__tests__/a2RelationshipCarriage.test.ts
09c6a4a2386133680434ca597ddc224a9711351820ab06ce3886b0e858169254

tests/constitutional/writers-studio/a2-6-orchestration/live-witness.ts
36d7e5225444fca217d2d26e159457107da09d9f26170add4c3e447c48104709

## XVI. Product standing

The Writer’s Studio surface can now explicitly hold one A2 parent relationship while moving through current Editorial and Review child acts.

What A2-6 does NOT establish:
- child content carried into later cognition;
- durable cursor/scroll/active-section place across sessions;
- Focus participation;
- chapter/whole-Work/sentence cognition;
- A3 revision-loop completion;
- deployment.

The URL preserves the explicit relationship identity on reload, but A2 durable-place law remains separate.
## XVII. Recommended successor

> **WRITERS-STUDIO-NEXT-01 / A2-7 — DURABLE RELATIONSHIP RETURN + CROSS-SESSION PLACE INTEGRATION ONLY**

A2-7 should reconcile the now-explicit parent relationship address with the still-unclosed durable place boundary.

It must not turn the relationship id itself into place.

A2-7 is recommended, not opened.

## XVIII. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-6 MEMBER-FACING UNIFIED RELATIONSHIP ORCHESTRATION + SCOPE TRANSITIONS**

A2-6 STOPS BEFORE A2-7, FOCUS, CROSS-EPISODE COGNITION, DEPLOYMENT OR A3.
