/**
 * Transit Field — T0 truth witnesses (JARVIS-ASTROLOGY-SOUL-JOURNEY-01).
 *
 * Every timing claim the "What is alive now" field may render is checked here
 * against an independent instrument, never against the module's own output:
 *   - exact-pass times vs astronomy-engine's SearchSunLongitude,
 *   - every perfecting pass vs the raw ephemeris at that instant,
 *   - applying/separating vs the finite derivative of deviation,
 *   - window edges vs the configured orb.
 * Plus one falsifier for the legacy `diff < angle` applying rule.
 */
import * as Astronomy from 'astronomy-engine';
import {
  bodyLongitude,
  bodySpeed,
  calculateTransitField,
  deviationFromAspect,
  formatOrb,
  normalize,
  separation,
  EXACT_THRESHOLD,
  TRANSIT_ASPECTS,
} from '@/lib/astrology/transitField';

const NOW = new Date('2026-10-01T12:00:00Z');
const HOUR = 3600_000;

function natalAt(point: string, longitude: number) {
  return { point, longitude: normalize(longitude) };
}

describe('transit field geometry', () => {
  it('separation is acute and symmetric across 0°', () => {
    expect(separation(359, 1)).toBeCloseTo(2, 10);
    expect(separation(10, 190)).toBeCloseTo(180, 10);
    expect(separation(200, 20)).toBeCloseTo(180, 10);
  });

  it('formats orbs as degrees and arcminutes', () => {
    expect(formatOrb(0.4)).toBe('0°24′');
    expect(formatOrb(1.9999)).toBe('2°00′');
  });
});

describe('exact-pass times (independent witness: SearchSunLongitude)', () => {
  it('a natal point 1° ahead of the Sun perfects when the Sun reaches it', () => {
    const sunNow = bodyLongitude('Sun', NOW);
    const target = normalize(sunNow + 1);
    const field = calculateTransitField([natalAt('Venus', target)], NOW);
    const act = field.activations.find((a) => a.id === 'sun-conjunction-venus');
    expect(act).toBeDefined();
    expect(act!.motion).toBe('applying');

    const witness = Astronomy.SearchSunLongitude(target, Astronomy.MakeTime(NOW), 10);
    expect(witness).not.toBeNull();
    const diffMs = Math.abs(Date.parse(act!.timing.nextExact!) - witness!.date.getTime());
    expect(diffMs).toBeLessThan(5 * 60_000);
  });

  it('a natal point 1° behind the Sun reports a past exact and separating motion', () => {
    const sunNow = bodyLongitude('Sun', NOW);
    const target = normalize(sunNow - 1);
    const field = calculateTransitField([natalAt('Mars', target)], NOW);
    const act = field.activations.find((a) => a.id === 'sun-conjunction-mars')!;
    expect(act.motion).toBe('separating');
    expect(act.timing.nextExact).toBeNull();

    const witness = Astronomy.SearchSunLongitude(
      target, Astronomy.MakeTime(new Date(NOW.getTime() - 5 * 24 * HOUR)), 10,
    );
    const diffMs = Math.abs(Date.parse(act.timing.lastExact!) - witness!.date.getTime());
    expect(diffMs).toBeLessThan(5 * 60_000);
  });
});

describe('every rendered claim is backed by the raw ephemeris', () => {
  // A synthetic chart placed so that slow and fast bodies all make contacts.
  const natal = [
    natalAt('Sun', bodyLongitude('Saturn', NOW) + 90.8),
    natalAt('Moon', bodyLongitude('Jupiter', NOW) - 120.5),
    natalAt('Mercury', bodyLongitude('Mars', NOW) + 0.7),
    natalAt('Venus', bodyLongitude('Pluto', NOW) + 179.2),
    natalAt('Ascendant', bodyLongitude('Uranus', NOW) - 1.4),
    natalAt('Midheaven', bodyLongitude('Neptune', NOW) + 60.3),
    natalAt('Chiron', 12), // not admitted
  ];
  const field = calculateTransitField(natal, NOW);

  it('finds the planted contacts', () => {
    const ids = field.activations.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining([
      'saturn-square-sun',
      'jupiter-trine-moon',
      'mars-conjunction-mercury',
      'pluto-opposition-venus',
      'uranus-conjunction-ascendant',
      'neptune-sextile-midheaven',
    ]));
  });

  it('never admits an approximated point', () => {
    expect(field.ignoredNatalPoints).toContain('Chiron');
    expect(field.activations.some((a) => a.natal.point === 'Chiron')).toBe(false);
  });

  it('every perfecting pass is exact in the raw ephemeris at that instant', () => {
    for (const act of field.activations) {
      for (const pass of act.timing.passes.filter((p) => p.perfects)) {
        const lon = bodyLongitude(act.transiting.body, new Date(pass.at));
        const dev = deviationFromAspect(lon, act.natal.longitude, act.aspect.angle);
        expect(dev).toBeLessThanOrEqual(EXACT_THRESHOLD);
      }
    }
  });

  it('applying/separating agrees with the derivative of deviation', () => {
    for (const act of field.activations) {
      const later = deviationFromAspect(
        bodyLongitude(act.transiting.body, new Date(NOW.getTime() + 10 * 60_000)),
        act.natal.longitude,
        act.aspect.angle,
      );
      if (Math.abs(later - act.deviation) < 1e-7) continue; // effectively stationary
      expect(act.motion).toBe(later < act.deviation ? 'applying' : 'separating');
    }
  });

  it('closed window edges sit at the configured orb (to the hour)', () => {
    for (const act of field.activations) {
      for (const edge of [act.timing.windowStart, act.timing.windowEnd]) {
        if (!edge) continue;
        const speed = Math.abs(bodySpeed(act.transiting.body, new Date(edge)));
        const maxHourMotion = Math.max(speed, 1e-4) * 1.5 / 24;
        const dev = deviationFromAspect(
          bodyLongitude(act.transiting.body, new Date(edge)),
          act.natal.longitude,
          act.aspect.angle,
        );
        expect(dev).toBeLessThanOrEqual(act.allowedOrb);
        expect(act.allowedOrb - dev).toBeLessThanOrEqual(maxHourMotion);
      }
    }
  });

  it('orders by the stated rule: major before minor, then closest to exact', () => {
    const acts = field.activations;
    for (let i = 1; i < acts.length; i++) {
      const [a, b] = [acts[i - 1], acts[i]];
      if (a.scale === b.scale) expect(a.deviation).toBeLessThanOrEqual(b.deviation);
      else expect(a.scale).toBe('major');
    }
    expect(field.counts.all).toBe(acts.length);
  });

  it('every activation carries visible reasons and calculated authority', () => {
    for (const act of field.activations) {
      expect(act.reasons.length).toBeGreaterThan(0);
      expect(act.authority).toBe('calculated');
    }
  });
});

describe('falsifier: the legacy applying rule', () => {
  it('`diff < angle` misreports a contact that the ephemeris shows separating', () => {
    // A natal point 89.5° ahead of the Sun: the Sun is moving toward the point,
    // so separation shrinks and the square (90°) is being LEFT behind. The
    // legacy rule (applying iff separation < angle) calls this applying.
    const sunNow = bodyLongitude('Sun', NOW);
    const natalLon = normalize(sunNow + 89.5);
    const field = calculateTransitField([natalAt('Moon', natalLon)], NOW);
    const act = field.activations.find((a) => a.id === 'sun-square-moon')!;
    const legacyApplying = separation(sunNow, natalLon) < 90;
    expect(act.motion).toBe('separating');
    expect(legacyApplying).toBe(true);
  });
});

describe('aspect table', () => {
  it('admits exactly the five Ptolemaic aspects', () => {
    expect(TRANSIT_ASPECTS.map((a) => a.angle)).toEqual([0, 60, 90, 120, 180]);
  });
});
