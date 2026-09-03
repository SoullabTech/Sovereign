# CMT-01 · Participation Disposition Contract (`pdc-1`)

**Lane**: CMT-01 — Canonical MAIA Turn Construction · **Owner**: CMT-01
**Ruling**: founder, 2026-09-03 · type contract only · no behaviour change · no live caller until M1
**Typed form**: `lib/maia/canonical-turn/participationDisposition.ts` · **pinned by** its `__tests__` sibling
**Bound into**: `MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md` §5.2 (axes), §6.1/§6.3 (dispositions), §7.2 (manifest rows), §14.2 (resolved)
**Depended on by**: CDPI (parked) — depends on `HELD`; may not define it

> Not the seam. Fixes the closed vocabulary MIPA (§6) adjudicates into, so M1's constructor
> imports it rather than redeclaring it. Nothing here is refined further before the seam runs.

## Provenance is three axes, not one scalar

The scalar epistemic class conflated authorship, participation mechanism and authority.

```text
authoredBy           house | member | practitioner | system | collective
participationClass   constitutional | authored | placed | marked | declared |
                     retrieved | computed | inferred | collective
authority            situate | compute | infer
```

The eleven pre-ruling scalar classes map onto the axes (`LEGACY_EPISTEMIC_CLASS_TO_AXES`) so the
§5.3 seed transcribes without re-deciding a row. `system_inferred` → `{system, inferred, infer}` —
the cell CDPI would one day produce into.

## The five dispositions

```text
AVAILABLE   entered adjudication; not yet finally dispositioned.
            Never "quietly withheld". A completed turn leaves nothing here.
HELD        legitimately considered; deliberately kept out of this turn's encounter.
OFFERED     only a disclosure-safe doorway may enter the speaking context.
ADMITTED    the governed representation may participate in cognition / composition.
EXCLUDED    lacks provenance, authority, permission or other eligibility.
```

```text
          AVAILABLE
              ↓
  HELD | OFFERED | ADMITTED | EXCLUDED
```

`REFUSED` (spec §6.3) is turn-level, not a candidate disposition; it stays where it is.

**`HELD` ≠ `EXCLUDED`.** Excluded: *not constitutionally eligible.* Held: *may be legitimate, does
not belong in the encounter now.* Held is ephemeral, implies no persistence, adds no authority,
and a later turn may reconsider it. Held content never reaches the speaking model — which is
what makes this different from suppression-by-prompt.

## Every final disposition has a machine-readable basis

`OFFERED` is a permission-bearing disclosure act and `ADMITTED` a participation act; both must
be provable afterwards (member invocation vs conferred doorway vs product policy vs accident).
So all four final states carry a reason from a **closed, disjoint family** — enumerated, never
prose. The v1 families in the module are a seed; MIPA implementation grows them. What is fixed
is the shape: one family per state, no overlap, no free text, no `"because": "…"` ever.

## Manifest rows — inherit CC-A's constitution verbatim

Identity (three axes) · `producerId` · disposition · reason · `itemCount?` · and, for rendered
dispositions only, `chars` + `blockDigest`. No body field exists; unknown keys are refused;
`HELD`/`EXCLUDED` may not carry `chars`/`blockDigest` because nothing was rendered.

## Under Reading B (CDPI, parked)

```text
DATABASE                     TURN MANIFEST
✅ observations              ✅ { system, inferred, infer } · HELD · reason
✅ evidence relations        ❌ hypothesis body
❌ PatternHypothesis row
```

## Open — deliberately, and not to be worked now

Durable manifest (§7.3 · custody review) · exact reason codes beyond the seed · seam topology
details already adjudicated as Candidate C.
