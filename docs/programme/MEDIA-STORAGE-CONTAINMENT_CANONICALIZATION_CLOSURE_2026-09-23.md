# MEDIA-STORAGE-CONTAINMENT — CANONICALIZATION CLOSURE

**Date:** 2026-09-23
**Disposition:** **CLOSED · PASS**
**Scope:** durable closure record for the bounded media path-containment repair admitted by PR #1496.

⛔ **This record closes and records. It does not edit the admitted repair.** The governing implementation identity is the exact adjudicated repair commit preserved in canonical history. Nothing here widens the five-file repair, changes its semantics, authorizes deployment, or claims production reachability.

## 1 · Canonical admission identity

```text
original finding        d1c57a4518de81e83ba099199743553235c751a4
original repair         66c0ee6666b54c6ca517bd4a9bc48515ddfcdbb8
admission witness       4f37b612c502895c953a8ad855c35b8a231bed26
reconciliation record   ed7407844ef83e1a7e85929ca20b45272943b229
adjudicated repair      60126fd159f5bf299610c8a353303191fc2a946c
pre-merge canonical     675bc8ae3951dc91e18d67815c65d7d88e961625
canonical merge         6d745a4d3d90afe155854891780fcf494d56327a
canonicalization PR     #1496
```

The canonical merge has exactly two parents: pre-merge canonical `675bc8ae…` and exact adjudicated repair `60126fd1…`. The repair was neither squashed nor rebased; exact commit identity survives in canonical ancestry.

## 2 · Mechanical custody witness

Against canonical `6d745a4d3d90afe155854891780fcf494d56327a`, the first-parent merge delta is exactly:

```text
A  lib/media/pathContainment.ts
M  lib/media/storage.ts
A  tests/constitutional/media-storage-containment/containment-falsifiers.mjs
A  tests/constitutional/media-storage-containment/regression-falsifier.mjs
A  tests/constitutional/media-storage-containment/run-regression.sh
```

The canonical blobs are:

```text
lib/media/pathContainment.ts
ebfb7a08be6bc5a2045b65b6d87de5c410af97af

lib/media/storage.ts
0e322fe0e74e247e0aed097d4203d18ef65bb135

tests/constitutional/media-storage-containment/containment-falsifiers.mjs
6a1d2f1b93a61c215128df9c1d35cd37b1309fc9
```

```text
tests/constitutional/media-storage-containment/regression-falsifier.mjs
788ab013a190b05db8b847b05eb158748dfe5370

tests/constitutional/media-storage-containment/run-regression.sh
a196a4de1ee43de74eef60ae17eff4893feccc6c
```

The witnessed `storage.ts` blob therefore survives byte-exact in canonical.

## 3 · Evidence admitted with closure

The repair entered canonical only after the following evidence chain:

- source witness: **9/9 green**;
- containment falsification: **18/18 green**;
- regression falsification against the real patched code: **4/4 green**;
- local TypeScript no-regression gate: **0 new diagnostic identities**;
- reconciled-tree TypeScript no-regression gate: **0 new diagnostic identities**;
- PR #1496 CI: **9 observed check runs, 9 success** on exact head `60126fd1…`;
- the protected branch's required contexts — `build`, `check-diagrams`, `sovereignty`, and `Axis 1 — authoritative adjudication` — were among the successful runs.

The earlier raw program-file and diagnostic totals were readings against a stale recorded baseline. They remain observational inherited drift; no re-baselining was taken and no candidate regression was inferred from those totals.

## 4 · Historical evidence custody

The three documentary evidence objects below were not introduced by PR #1496 and are not silently promoted by this closure:

```text
finding record blob
6b4191fafbf10cb30437cf65fc738b1436357166

admission witness record blob
11368d6664aad6c9c8a7cd63dc45215151e65519

canonical reconciliation record blob
ada8e37d8888381074096e7ff26de5de46212457
```

They remain evidence for the stages they actually witnessed. This closure records their exact identities rather than rewriting their historical claims.

## 5 · Reconciliation observations preserved

- `exports/[exportId]/download/route.ts` remains a **previously unenumerated consumer**, not additional repair scope.
- `processors.ts` uses server-derived hard-coded filenames and did not expose a newly discovered hostile-input surface in this act.
- `lib/workbench/intake.ts` was a witness-classification correction and is not a media-storage consumer.
- The original finding is not retroactively rewritten to include knowledge obtained later during reconciliation.

## 6 · Explicitly unresolved and out of scope

```text
Finding #1             UNTOUCHED
filename collision     OPEN · OUT OF SCOPE
HTTP route witness     UNWITNESSED
production reach       UNWITNESSED
filesystem permissions UNWITNESSED
re-baseline            NOT TAKEN
deployment             NOT AUTHORIZED
production mutation    NONE
```

The filename-collision class predates this repair; sanitization widens that class but does not create the path-escape defect. Its remedy, if opened, is a separate storage-naming act.

The practitioner-identity Finding #1 likewise remains a separate authorization problem and is not repaired, narrowed, or interpreted by this closure.

## 7 · Canonical standing

```text
MEDIA-STORAGE-CONTAINMENT   CLOSED · PASS
repair                     CANONICAL
canonical merge            6d745a4d3d90afe155854891780fcf494d56327a
exact repair identity      PRESERVED AS MERGE PARENT
five-file population       VERIFIED
witnessed blobs            VERIFIED
CI                         GREEN ON EXACT 60126fd1 HEAD
deployment                 UNAUTHORIZED
production                 UNTOUCHED
```

## 8 · Lane closure

The bounded media path-containment repair lane is **CLOSED**.

Canonicalization establishes durable repository custody of the repair. It does not establish production reachability, route-level reproduction, deployment, or organism-wide security completeness. Any deployment, Finding #1 repair, filename-uniqueness repair, or further media-security work requires a separately opened authority-bearing act.

**STOP.**
