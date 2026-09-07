# Writer's Studio launch census — Gate 2 · DISCOVER

**Source SHA:** `3027ceaff` · **Read-only.** No repairs, no fixes.
**Classification:** A LIVE · B CONTEXTUALLY INAPPLICABLE · C HONESTLY UNAVAILABLE · D CLAIM FAILURE

## Authority

`app/writers-studio/studioMap.ts` — `STUDIO_MAP` is the single source of truth.
`availability: 'available' | 'later'`, plus `requiresManuscript`. `shellDestinations()`
resolves `actionable`; `StudioRail.tsx` renders an unavailable destination as a
`<span>` with no href, `aria-disabled`, `data-actionable="false"` — **honest by
construction, not by discipline.** Map `count` values are stripped deliberately.

## Rail — 16 destinations

```text
GROUP        ID              MAP           GATE                CLASS
work-space   home            available     —                   A
             manuscript      available     requiresManuscript  A / B without a Work
             materials       later         satisfiedInRoom     B in canvas · C elsewhere
             structure       later         satisfiedInRoom     B in canvas · C elsewhere
             notes           later         —                   C
             versions        later         —                   C  (see D-01)
             goals           later         —                   C
maia         conversations   later         situatedHrefs       B — needs a declared Work
             discover        later         —                   C
             insights        later         —                   C
             suggestions     later         —                   C
tools        find-replace    later         —                   C  ← launch candidate
             statistics      later         —                   C
             timeline        later         —                   C
             word-web        later         —                   C
             export          available     requiresManuscript  A / B without a Work
```

**Three `available`. Everything else is `later` and renders inert.** The dimness
seen in screenshots is B (context) for materials/structure/conversations/manuscript/export
and C (unbuilt) for the rest — the distinction that made an earlier screenshot
reading wrong.

## Modes

```text
write available A · develop available A · explore later C · review later C · publish later C
```

Develop is reachable from the mode bar. `HomeView.tsx` links only Import and
Canvas — no `DEVELOP_HREF`. Confirmed identical at `e535e6246` and `3027ceaff`.

## D-01 — CLAIM FAILURE · Versions

`app/writers-studio/canvas/page.tsx:329`

```ts
setRevisions(r.kind === 'ok' ? r.revisions : null);
```

**A failed read and an in-flight read are the same state.** `StudioLowerBand.tsx:99`
renders `revisions === null` as `reading…`, so a failure shows "reading…"
permanently — the panel promises results that are not coming.

Worse, `page.tsx:456`:

```ts
railCounts.versions = revisions?.length ?? 0;
```

A failed read renders as **Versions 0** — not a missing fact but a false one. The
member is told they have no versions kept when the truth is that we could not find out.

**Not established:** whether the read is currently failing in production. Two
screenshots show `reading…` persisting; one showed `Versions 1`, which means it
does sometimes resolve. The defect is the *conflation*, which is real in source
regardless of current firing rate.

Repair shape (NOT authorized): distinguish `null` loading from an error state, and
never render a count derived from a failed read.

## Launch reading

```text
FIND        C — honestly unavailable · the launch candidate
VERSIONS    D-01 · fix or make honest — currently it can assert a false zero
all other C affordances ship as-is; they claim nothing
```

## Not covered

Develop-room internals beyond reachability; Explore/Review/Publish; runtime
confirmation of D-01. This is a source census at one SHA.
