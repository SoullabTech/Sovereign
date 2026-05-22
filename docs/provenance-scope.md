# Astrology Provenance Layer

**Status:** scoped, not started
**Sequence:** before any ephemeris swap (Swiss/JPL)
**Origin:** the Chiron diagnostic thread of 2026-05-22

## The architectural line

> **Ephemeris accuracy fixes wrong placements. Provenance fixes wrong trust.**

These are two different problems that look identical until you separate them.

## Why this exists

The 2026-05-22 thread surfaced that MAIA's chart-reading layer was operating
**without provenance, in both directions**:

1. When a broken Chiron stub returned `Aquarius 16°` for a Dec 1966 birth (real
   ephemeris: Pisces ~21°), the system treated the stub output as authoritative
   and produced confident interpretive language on it.
2. When the user then asserted *"my Chiron is in Libra 7th"* (also wrong per real
   ephemeris), the system capitulated immediately and produced equally confident
   interpretive language on the assertion.

Two opposite errors, same underlying failure: the interpretive layer had access
to placements but no access to where those placements came from or how much to
trust them. The hidden governing invariant was *maintain coherence with the
currently dominant signal* — not verify truth conditions.

## What the layer is

A `provenance` field attached to every `BodyPosition`, surfaced into MAIA's
prompt context, with response rules conditioned on it.

```ts
interface BodyPosition {
  longitude: number;
  sign: string;
  house: number;
  // ...
  provenance: {
    source:
      | 'astronomy-engine'      // JPL-grade, planets/Sun/Moon
      | 'keplerian-j2000'       // Keplerian propagation, current Chiron/asteroids
      | 'linear-stub'           // legacy linear approximation (should be 0 after this)
      | 'user-assertion'        // claimed by the user, not computed
      | 'swiss-ephemeris';      // future: after sweph swap
    confidence:
      | 'verified'              // matches authoritative source within tolerance
      | 'approximate'           // Keplerian with verified J2000 reference
      | 'unverified'            // Keplerian with unverified reference epoch
      | 'asserted';             // user claim, never auto-trusted
    error_bound_deg?: number;   // estimated max error in degrees
    as_of_epoch?: string;       // reference epoch (e.g., 'J2000.0')
  };
}
```

## Deliverables

1. **Add `provenance` to `BodyPosition`** — type-level change in
   `lib/astrology/ephemerisCalculator.ts`. All call sites that construct
   `PlanetPosition` (or whatever the concrete shape is named) get provenance
   too.

2. **Tag each body by source**:
   - Sun, Moon, Mercury → Pluto, Nodes: `astronomy-engine` / `verified`
   - Chiron: `keplerian-j2000` / `approximate` / error_bound ≈ 1°
   - Ceres: `keplerian-j2000` / `approximate` / error_bound ≈ 2°
   - Pallas, Juno, Vesta: `keplerian-j2000` / `unverified` / error_bound unknown
   - Lilith: `keplerian-j2000` / `approximate` (lunar apogee precession)

3. **Add confidence levels** (see interface above). Confidence is independent
   of source — e.g., a `swiss-ephemeris` source can still be `asserted` if it
   came from a user claim.

4. **Make `formatChartContextForMAIA()` surface provenance clearly**. The
   prompt that goes to MAIA should explicitly label uncertain placements,
   e.g.:
   ```
   Saturn: Pisces 23° (House 7)  [verified]
   Chiron: Pisces 23° (House 7)  [approximate, ±1°]
   Pallas: Libra 7°  [unverified — reference epoch uncertain]
   ```

5. **Add response rule**:
   - `verified` → interpret normally
   - `approximate` → interpret cautiously; acknowledge the tolerance if asked
     about exact degrees
   - `unverified` → name the uncertainty before interpreting; offer to verify
     against an external source if it matters to the user
   - `asserted` → **never auto-accept**. Always compare against computed placement.
     If they disagree, name the disagreement and ask the user to verify
     externally before interpreting.

6. **Add regression test for the assertion-capitulation case**. This is the
   load-bearing test — without it, the rule in #5 stays aspirational.
   - Compute a chart with a known placement (e.g., Chiron at Pisces for a
     1966 birth).
   - Inject a user assertion that contradicts the computation (e.g., "my
     Chiron is in Libra").
   - Assert that MAIA's response **does not capitulate** — it must surface
     the disagreement and ask for external verification.
   - This test should fail before any provenance code lands, then pass after.
     Build the *before* before you build the *after*.

## Entry point for the next session

Drop into this repo and say *"start the provenance thread."*

Open with:
- The architectural line above
- The `BodyPosition` shape above
- The regression test from deliverable #6, failing

Build forward from there.

## Related backlog (not part of this scope, but adjacent)

- **Pallas / Juno / Vesta M0 calibration** against verified J2000 mean longitudes
  (currently `unverified`). Calibrating these would flip their confidence from
  `unverified` → `approximate`. Same shape of fix as the Ceres calibration in
  commit `ec3750604`.

- **Swiss Ephemeris / `sweph` swap**. After provenance lands, swapping the
  ephemeris is a contained upgrade: provenance source flips from
  `keplerian-j2000` → `swiss-ephemeris`, `error_bound_deg` shrinks, nothing
  else downstream changes.

- **Licensing verification** for Swiss Ephemeris. The official Astrodienst page
  now describes the open license as **AGPL or Professional License** (older
  references say GPLv2 — exactly why licensing should be a checked dependency,
  not memory). Verify current terms against MAIA's distribution model before
  committing to the swap.
