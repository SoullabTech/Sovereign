# Writer's Studio — Semantic Field 01 R1 Production Witness
## 2026-10-02

Programme: `WRITERS-STUDIO-SEMANTIC-FIELD-01`

Status: PRODUCTION DEPLOYMENT OBSERVED / POST-DEPLOY WITNESS

## 1. Canonical admission

Semantic Field R1 was admitted through:

- PR #1706 — `feat(writers-studio): pace MAIA insight with the writer`
- canonical merge: `a2681a07772202d19d62595144e50e47574620f0`
- current canonical observed during witness: `56cc22f01`

The implementation commit admitted by #1706 was `e08af5cc4`.

Production is running a production-lineage projection commit:

- `12b461bd8 — feat(writers-studio): pace MAIA insight with the writer`

The patch-id of `12b461bd8` is byte-semantically identical to the patch-id of canonical implementation commit `e08af5cc4`:

`67b466b5d6d9cd99daf4bab16b56b9e64469009c`

This witness does not claim the commit ancestry is identical; it records the exact patch equivalence and the deployed production-lineage identity.

## 2. Included tester experience

The deployed R1 surface includes:
- Working Style **Pace**: Intimate / Guided / Mapped
- Working Style **Explanation**: Plain / Guided / Craft / Deep / Expert
- default style: Intimate + Guided
- live MAIA wording preview for explanation depth
- Themes candidates reframed as provisional **Noticings**
- primary Noticing actions: **Talk about this / Keep nearby / Let rest**
- explicit Theme governance retained as secondary authority
- explanation register carried into anchored ObservationDialogue
- revision latitude and paragraph-removal authority left unchanged

The implementation preserves the distinction between presentation preference and editorial authority.

## 3. Focused implementation witness

Against exact production projection commit `12b461bd8`:

```text
PASS app/writers-studio/__tests__/p4r1IsolatedEditorialRoom.test.ts
PASS app/writers-studio/__tests__/p4r1SemanticField.test.ts

Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total
```

PR #1706 additionally recorded:
- focused Jest: 38 passed
- TypeScript no-regression: 222 current vs 239 baseline
- sovereignty pre-commit: PASS
- build: PASS
- sovereignty CI: PASS
- TypeScript no-regression gate: PASS
- empty database reconstruction: PASS
- GitGuardian: PASS

## 4. Production provenance witness

Production container `maia-sovereign` reported:

```text
GIT_COMMIT=12b461bd8
DEPLOY_LANE=deploy-lane
status=running
health=healthy
restarts=0
```

Observed start time:

`2026-10-02T10:23:24.908594285Z`

The running image identity observed was:

`sha256:c743fe6f8ac54e445ebb55714b88cc4e7179b0f1df243bd8b76228d6ee22af16`
## 5. Public routing witness

From production:

```text
https://soullab.life/                -> 200
https://soullab.life/writers-studio -> 307 to sign-in when unauthenticated
```

From inside `maia-sovereign`:

```text
http://127.0.0.1:3000/               -> 200
http://127.0.0.1:3000/writers-studio -> 307 when unauthenticated
```

This establishes application reachability and preservation of the Writer's Studio authentication boundary. It does not substitute for an authenticated human product walk.

## 6. Deployed feature-bundle witness

The running Next.js bundle contains the R1 user-facing vocabulary, including:

```text
Intimate
Mapped
Plain
Expert
Talk about this
Keep nearby
Let rest
```

This establishes that the deployed image includes the intended Semantic Field R1 presentation bundle. It does not by itself establish visual quality or authenticated interaction behavior.

## 7. Remaining human gate

The remaining tester/founder witness is experiential:

> Does this help the writer remain in relationship with the work rather than making them manage the system?

The first authenticated human walk should verify:
- Intimate mode feels quiet rather than crowded;
- Guided explanation is understandable without professional writing knowledge;
- Plain materially simplifies language without flattening the insight;
- Mapped gives advanced writers the wider field intentionally;
- Talk about this carries the exact Noticing into conversation;
- Keep nearby / Let rest do not force premature classification;
- manuscript remains visually primary.

No further production deployment is required to begin that witness unless a defect is found.
