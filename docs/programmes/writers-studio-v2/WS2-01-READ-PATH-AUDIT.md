# WS2-01 — owner → work → manuscript → section → content

Audit of every read path in the Writer's Studio, done 2026-08-27 against
`c9b0574db`. Scope: `app/writers-studio/**`, `app/api/sovereign/manuscripts/**`,
`app/api/sovereign/studio/**`, and the `/press/manuscript` surface the Studio
links out to. (`app/api/studio/**` is the practitioner Studio — different
product, not this chain.)

The invariant under test is D-008: **an identity failure may never masquerade
as successful retrieval.** A path passes only if a named-but-unavailable
identity produces an explicit failure and ZERO substitute content.

## Chain, layer by layer

| Leg | Verdict | Basis |
|---|---|---|
| owner → manuscript | SOUND | every `[id]` route gates `WHERE id = $1 AND member_id = $2` and 404s; existence is never leaked |
| manuscript → section | SOUND | section reads are scoped by `manuscript_id` *after* the ownership gate |
| section → content | SOUND | draft and render read only within the gated manuscript |
| selected manuscript → rendered Canvas | SOUND | every downstream panel derives from `manuscript.id`; there is no second source |
| **work → manuscript** | **HOLE** | F-1 |

The server side is clean. Every hole found is on the client, in the handoff
between a control the member clicks and the identity that control emits.

## Findings

### F-1 · LIVE · a shelf work with no manuscript opens someone else's writing
`app/writers-studio/HomeView.tsx:396`

```tsx
href={canvasForManuscript(CANVAS_HREF, manuscriptIdOf(w))}
```

`manuscriptIdOf` returns `null` for a work with no manuscript expression.
`canvasForManuscript(base, null)` returns the bare href. The Canvas then sees
no ask, takes `manuscripts[0]`, and renders the most recent manuscript under
the clicked work's title. That is the founder-caught 2026-08-14 defect exactly,
at a different site, still live.

Reachable: work creation and manuscript declaration are not atomic
(`page.tsx:62-72` and `82-85` create the work, then the manuscript, then
declare). A failure in either later step leaves a work with zero expressions,
and that work lands in `shelf` via `unwritten`.

Not reachable through the CONTINUE hero (`:346`) — `arrivalFor` only promotes
works whose `writtenAt > 0`, which requires a manuscript id. The hero is safe
by construction, not by guard.

### F-2 · CONTRACT ROT · the identity contract governs neither side
`app/writers-studio/canvasIdentity.ts:52-61`

`selectManuscript` still ends `return manuscripts[0] ?? null`, and
`identityHonoured` documents the substitution as an acceptable degradation.
Neither function is called by the Canvas any more — `canvas/page.tsx` carries
its own inline refusal. So the file whose header says "ONE definition, both
sides" now defines a rule nothing runs, and that rule contradicts D-008.

`__tests__/canvasIdentity.test.ts:74` asserts the fallback is correct
behaviour. A test currently pins the opposite of the invariant.

### F-3 · PRODUCER HOLE · "I named nothing" and "my name was lost" are the same string
`app/writers-studio/canvasIdentity.ts:28` — `if (!manuscriptId) return base;`

A producer that intended to name a work and had `null` emits a URL
indistinguishable from a bare visit. The consumer cannot refuse what it was
never told was asked. F-1 is this hole being exercised; the hole itself is the
general case and is the producer-side mirror of D-008.

### F-4 · PARAM DRIFT · the param name is inlined again in two places
`app/writers-studio/canvas/MaterialsDrawer.tsx:485` and
`app/writers-studio/canvas/page.tsx:58` build `&m=` by hand rather than
importing `CANVAS_MANUSCRIPT_PARAM`, which the contract file explicitly forbids
("Do not inline this string anywhere"). Both are correct today. Both are
unpinned, and this exact drift is what shipped the original defect.

### F-5 · `/press/manuscript` adopts an id it never checked
`app/press/manuscript/page.tsx:284`

```tsx
setActive((cur) => cur ?? requested ?? (list.length > 0 ? list[0].id : null))
```

Two problems. `requested` is adopted without confirming it is in the member's
list, so a stale id becomes `active` and fails downstream instead of failing
where it was named. And `cur ??` means once something is active, a later change
to `?m=` is ignored — a stale identity survives a navigation that was meant to
replace it. This is the target of `SOURCE_HREF`, so the Studio links into it.

### F-6 · VESTIGIAL · a "current manuscript" that is only the most recent
`app/writers-studio/useCurrentManuscript.ts:56` sets and exports `manuscript`
as `list[0]`. No consumer reads it. It is named like an identity and computed
like a position — an attractive nuisance for the next reader.

## Disposition

F-1 is a live D-008 violation and must be fixed inside WS2-01. F-2, F-3 and F-4
are the machinery that let F-1 exist and let it recur. F-5 is real and adjacent;
F-6 is hygiene.

Fixes are deliberately NOT pushed yet: F-1 changes the click path, and the
two-writing click witness is a measurement of that path. Moving it mid-
measurement would leave the witness proving something about code no longer
in the branch. Fix lands after the witness, with the regression pin.
