# FLAGSHIP-RUNTIME-CONVERGENCE-01 / EC1 — Experience Contract Reconciliation

**Date**: 2026-09-23
**Act**: EC1 — governance/documentation reconciliation only
**Against flagship head**: `71c15ec884b55c61998345d350cba4a2c12594a6`
**Canonical at opening**: `4d6cc6789342284e833db67e111c6a5c3d691cce`
**Disposition**: NARROW, DO NOT REWRITE
**Product source changes**: none
**Production**: untouched

## 1. Contradiction found

Before EC1, `writers-studio-rebuild.md` claimed:

> three permanent regions — the Work’s own shape, the authored material, and MAIA

while `flagship-studio.md` governed the mounted flagship surface with MAIA as an
anchored, dismissible contextual layer, never a permanent pane.

The contradiction was jurisdictional as well as textual: the rebuild contract claimed
`app/writers-studio/rebuild/**`, while the flagship contract explicitly claimed five files
inside that same directory.
## 2. Why rewriting was refused

The rebuild contract records a real 2026-09-16 witness of the legacy composition.
Its three-region language was true of the surface that was actually walked then.

Rewriting that contract to make it sound as though it had always described the later
flagship composition would corrupt historical evidence.

EC1 therefore preserves the witnessed wording, marks its route-level composition law as
historical/superseded for the currently mounted route, and narrows current surface
jurisdiction instead of rewriting history.

## 3. Exact /rebuild census before EC1

| File | Rebuild contract | Flagship contract |
|---|---|---|
| `DiscussLayer.tsx` | broad glob | explicit |
| `FlagshipWriteHost.tsx` | broad glob | explicit |
| `RebuildAuthoredBody.tsx` | broad glob | — |
| `RebuildStudioClient.tsx` | broad glob | — |
| `RebuildWritingBoundary.tsx` | broad glob | — |
| `discussAct.ts` | broad glob | explicit |
| `flagshipWriteHost.css` | broad glob | explicit |
| `page.tsx` | broad glob | explicit |
| `rebuild.css` | broad glob | — |

Before EC1: **5 contradictory overlaps** inside `/rebuild`.

A repository-wide Experience Contract ownership census found no third contract claiming
any of these nine files.

## 4. Current jurisdiction after EC1

The broad rebuild glob is removed.

The legacy rebuild contract now owns inside `/rebuild` only:

- `app/writers-studio/rebuild/RebuildStudioClient.tsx`
- `app/writers-studio/rebuild/rebuild.css`

These are the unmounted legacy composition artifact and its historical stylesheet.
The contract's other already-named Develop, Insight, Canvas, Sources, Studio and Work-context
surfaces remain unchanged.
The flagship contract now owns the mounted `/writers-studio/rebuild` composition:

- `app/writers-studio/rebuild/page.tsx`
- `app/writers-studio/rebuild/FlagshipWriteHost.tsx`
- `app/writers-studio/rebuild/DiscussLayer.tsx`
- `app/writers-studio/rebuild/discussAct.ts`
- `app/writers-studio/rebuild/flagshipWriteHost.css`
- `app/writers-studio/rebuild/RebuildWritingBoundary.tsx`
- `app/writers-studio/rebuild/RebuildAuthoredBody.tsx`

The last two are the shared authorship substrate actually mounted by the live flagship
host. EC1 gives them composition jurisdiction only; it changes none of their writing,
save, version or concurrency authority.

## 5. Historical/current distinction

`writers-studio-rebuild.md` now states explicitly that its 2026-09-16 three-region
composition and canonical-cutover language are **HISTORICAL LEGACY WITNESS**.

For the currently mounted `/writers-studio/rebuild` route, that composition law is
superseded. The sole current Experience Contract is `flagship-studio.md`.
The flagship contract now states this route authority explicitly without changing its
existing composition law:

- manuscript primary;
- MAIA contextual;
- MAIA anchored;
- MAIA dismissible;
- MAIA not a permanent pane.

Legacy screenshots remain evidence of the legacy witness. Flagship screenshots remain
evidence of the flagship candidate. Neither set was relabelled.

## 6. Mechanical proof

After EC1, the exact nine-file `/rebuild` census reports:

```text
DiscussLayer.tsx             → flagship only
FlagshipWriteHost.tsx        → flagship only
RebuildAuthoredBody.tsx      → flagship only
RebuildStudioClient.tsx      → legacy only
RebuildWritingBoundary.tsx   → flagship only
discussAct.ts                → flagship only
flagshipWriteHost.css        → flagship only
page.tsx                     → flagship only
rebuild.css                  → legacy only
```
Result:

```text
contradictory overlap = 0
unowned /rebuild files = 0
```

`npm run check:design-canon`:

```text
PASS
Design canon: no member-facing UI surfaces in working-tree changes.
```

`git diff --check`: PASS.

## 7. Standing

EC1 changes documentation/governance only.

No product source, tests, flagship suites, goldens, browser witnesses, schema, migrations,
routes, feature flags or production state changed.

**Standing**:

> EC1 reconciled. The mounted flagship route has one current composition authority.
> The legacy rebuild contract remains intact as historical evidence for its real witness.

The separately governed next act is
`FLAGSHIP-RUNTIME-CONVERGENCE-01 / FS1 — FLAGSHIP ACCEPTANCE-SUITE FREEZE`.

No FS1 authority is created by this record.
