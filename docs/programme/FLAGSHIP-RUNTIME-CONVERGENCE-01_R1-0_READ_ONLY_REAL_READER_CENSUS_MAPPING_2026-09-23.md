# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-0 — Read-Only Real-Reader Census + Pure Mapping

**Date**: 2026-09-23
**Act**: R1-0 — census + pure mapping only
**Base**: `88f84c04a09b7fa3ba9e858182d3d2632f249a49`
**Active branch**: `fix/flagship-ec1-contract-reconciliation-20260923`
**Canonical at opening**: `3f63ca65349165ca6ffe6c539e444f0aed749f70`
**Freshness**: 11 canonical descendants from `4d6cc6789`, provider/JEV governance only; zero Writer’s Studio overlap.
**FS1**: 57/57 frozen artifacts remain blob-identical to `4dade9a68`.
**Live Review mount**: NOT authorized, NOT performed.
**Production**: untouched.

## 1. Existing read seams

R1-0 verified and reused the existing read-only boundaries:

- `GET /api/sovereign/manuscripts/[id]/readings`
  - verified session identity;
  - ownership checked server-side;
  - lists existing frozen readings only.
- `GET /api/sovereign/manuscripts/[id]/readings/[readingId]`
  - verified session identity;
  - member-scoped reading lookup;
  - path manuscript must equal reading.manuscript;
  - returns the stored frozen reading, current assessment, and current section ids/headings.

The commission seam remains separate and forbidden:
- `POST /api/sovereign/manuscripts/[id]/readings`
- `requestDevelopmentalReading`
- `commissionReading`

The R1-0 mapper imports or invokes none of them.

## 2. ReviewView field census

| ReviewView field | R1-0 standing | Source |
|---|---|---|
| `work` | OUT OF R1-0 / host fact | lawful live Work metadata |
| `kind` | OUT OF R1-0 / host fact | lawful Work metadata |
| `scope` | host fact, validated against reading scope | `reading.scope.bodyScope` + host |
| `freshness` | READ-ONLY DERIVED when current | assessment + `frozenAt` |
| `coverage` | READ-ONLY DERIVED | stored coverage + frozen section topology |
| `findings` | EXISTING CANONICAL CONSTRUCTOR | stored observations → `observe()` |
| `citations` | NOT AVAILABLE for moved findings | GET lacks exact frozen Work prose required by `CitationState` |
| `lenses` | READ-ONLY DERIVED for the selected reading only | commissioned lens + reading outcome |
| `map` | NOT AVAILABLE IN R1-0 | no governed real-reader → ContinuityMap mapping |
| `changed` | NOT AVAILABLE IN R1-0 | detailed Work-change itemization is not in this GET payload |
| `context` | OUT OF R1-0 / host fact | current manuscript prose/place supplied by future host |
| `selectedFindingId` | OUT OF R1-0 | future presentation state |

R1-0 therefore proves a **one selected stored reading → truthful ReviewView** mapping.
It does not decide how multiple readings/lenses become one live “Everything” Review.
## 3. Observation mapping law

For each representable observation:

- `view.finding.id` = canonical `observationId` (`dobs_…`);
- durable sidecar retains `readingId + observationKey + observationId`;
- `codePointStart` is retained from the frozen manuscript position;
- full canonical `doesNotEstablish` vocabulary is retained in the sidecar;
- the frozen Review finding receives only limits its frozen type can express;
- exact frozen `evidenceRefs` are retained;
- evidence labels reuse `describeRef()`;
- finding construction reuses the governed `observe()` constructor;
- findings are sorted with `compareAdmitted()`: manuscript position, then admission index.

No array index, UI order, text hash, label, section position, or React key becomes identity.

## 4. Explicit fail-closed findings

R1-0 does not fabricate around substrate/presentation mismatches:

1. **Stale citation prose unavailable.**
   The GET returns frozen addresses/digests and the current assessment, but not the exact frozen member prose required by Review `CitationState.moved/removed`.
   A superseded finding returns `frozen_citation_text_unavailable`.

2. **Structural-only observation has no prose address.**
   Canonical developmental observations may lawfully carry `position:null`.
   Frozen Review findings require a prose return section.
   R1-0 returns `observation_address_unavailable` rather than inventing one.

3. **Coherence is not representable in frozen DevelopDomain.**
   The canonical reader includes the `coherence` lens; the frozen Review finding domain does not.
   Coherence findings return `presentation_refused` rather than being cast into another domain.
4. **Full developmental limit vocabulary exceeds the frozen finding vocabulary.**
   R1-0 preserves every canonical non-conclusion in the durable sidecar and does not silently discard it.

5. **Detailed changed-Work summary is unavailable.**
   R1-0 does not invent counts such as “2 sections moved” or “3 paragraphs changed.”

6. **Multi-reading aggregation remains undecided.**
   The accepted fixture Review shows findings across multiple domains, but R1-0 maps one explicitly selected frozen reading.
   No rule was invented for “newest per lens”, cross-reading reconciliation, or which readings constitute one live Review.

These are evidence boundaries for the future live-mount act, not defects repaired under R1-0.

## 5. Suite-first evidence

Suite commit:

`a2ee6f6dcf5ffad73bb7ca2c909d604152e5c10a`

Before mapper implementation:

```text
FS1 gate        PASS
reference       7/14
candidates      12/12 killed on named laws
matrix          RED
```

After implementation and instrument correction:

```text
reference       14/14
candidates      12/12 dead
each candidate  dies on its named law only
matrix          LETHAL
```
The one suite correction was an instrument defect: L13 initially looked for
`editorial-consequence` on the wrong fixture observation. The law was corrected to
inspect the complete durable sidecar across the reading.

## 6. Strict typecheck

`typecheck:ws-flagship-r1-readonly` is additive and does not modify the frozen FS1 runner.

It allows diagnostics only in three pre-existing neighbors, each first proven blob-identical
to exact R1-0 base `88f84c04a`:

- `app/writers-studio/studioTheme.ts` — 24 inherited diagnostics;
- `lib/manuscript/development/readState.ts` — 7;
- `lib/manuscript/draftSections.ts` — 10.

Any movement of those blobs fails the runner before TypeScript acceptance.
Result: **PASS — zero diagnostics outside blob-pinned inherited allowances.**

## 7. DB-backed read-only witness

Disposable local PostgreSQL witness database:
`r10_real_reader_witness` on a local Unix-socket Homebrew PostgreSQL cluster.

Repository bootstrap + migration runner completed with **548 migrations recorded**.
The database was dropped after the closing witness.

All synthetic readings were inserted before the measured window.
No reading was created through the commission route.
Measured cases:

```text
W0  capture exact member-scoped state digest
W1  GET list          → 200 · existing reading only
W2  GET one           → 200 · exact reading + observationId + current assessment + section label
    pure mapper       → ready · durable (readingId, observationKey) preserved
W3  no reading        → distinct no-reading
    stored none       → ready · 0 findings · read-nothing-noticed
W4  missing reading   → 404
    wrong Work        → 404
    malformed payload → mapper malformed_payload
W5  stale reading     → assessment superseded
    mapper            → frozen_citation_text_unavailable
W6  after-state digest == before-state digest
```

The measured digest includes member/session, manuscripts, drafts, draft sections,
working revisions, developmental readings, standing events and Keeps for the synthetic member.

**7/7 witness checks PASS.**
The before/after digest was byte-identical.
The identity resolver itself is read-only and does not bump session `last_active_at`.

## 8. Closing gates

```text
verify:flagship-freeze        57/57 INTACT
matrix:ws-flagship            13/13 · 8/8 dead
matrix:ws-flagship-c1a        9/9 · 8/8 dead · golden intact
matrix:ws-flagship-c1b        10/10 · 9/9 dead
matrix:ws-flagship-c1c1       19/19 · 16/16 dead
matrix:ws-flagship-r1-readonly 14/14 · 12/12 dead
typecheck:ws-flagship-r1-readonly PASS
check:design-canon            PASS
ci:sovereignty                PASS · 29/29 voice identity test
check:no-supabase             PASS
check:no-openai               PASS
git diff --check              PASS
```
## 9. Live-mount blockers carried forward

R1-0 does **not** establish that the frozen `ReviewRoom` can be mounted live unchanged.

Before R1-1, Founder adjudication must account for these current facts:

- stale/moved Review citations need frozen Work prose not returned by the existing reading GET;
- coherence findings cannot inhabit the frozen `DevelopDomain`;
- structural-only observations have no prose return address;
- the full “Everything” Review needs an explicit multi-reading aggregation rule;
- `ReviewView.changed` detailed itemization is not supported by the current payload;
- the frozen `ReviewRoom` currently renders member/action affordances such as
  Ask MAIA, Discuss/Explore, commission offers, and OwnObservation fixture UI.
  R1-0 neither wired nor authorized those acts.

If a live mount requires changing any FS1-frozen presentation or acceptance artifact,
that is a STOP and a separately authorized freeze-amendment/re-freeze act.

## 10. Standing

R1-0 establishes:

> existing durable developmental-reading GETs
> → pure, identity-preserving, non-ranking mapping
> → frozen ReviewView where representable
> → typed unavailable state where truth is not representable.

No live Review route, navigation, cognition, member mutation, commission, standing write,
proposal, adoption, revision write, Develop change, or production change occurred.

**R1-0 is BUILT AND WITNESSED ON CANDIDATE · STOPPED for Founder adjudication.**

No R1-1 authority is conferred by this record.
