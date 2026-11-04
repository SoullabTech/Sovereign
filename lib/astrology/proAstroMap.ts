/**
 * ASTRO-PRO-ASTROMAP-01 — astrocartography lines for a chart's instant.
 *
 * For each body, where on Earth it was on the MC, IC, Ascendant or
 * Descendant at that instant. Uses the body's apparent right ascension and
 * declination of date and Greenwich apparent sidereal time:
 *   MC line:  longitude = RA − GAST           (body on the local meridian)
 *   IC line:  MC + 180°
 *   ASC/DSC:  hour angle H0 with cos H0 = −tan φ · tan δ (rising: −H0, setting: +H0)
 * Geometry only; no interpretation.
 */
import * as Astronomy from 'astronomy-engine';

export const MAP_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;
export type MapBody = typeof MAP_BODIES[number];

export interface MapBodyPosition { body: MapBody; ra: number; dec: number } // degrees
export interface AstroMapInput { gast: number; bodies: MapBodyPosition[] } // gast in degrees

export interface AstroMapLine {
  body: MapBody;
  angle: 'MC' | 'IC' | 'ASC' | 'DSC';
  /** [longitude, latitude] pairs; a new segment starts after a null. */
  points: Array<[number, number] | null>;
}

export function astroMapInput(utc: string): AstroMapInput {
  const date = new Date(utc);
  if (!Number.isFinite(date.getTime())) throw new Error('invalid_instant');
  const time = Astronomy.MakeTime(date);
  const toDate = Astronomy.Rotation_EQJ_EQD(time);
  const bodies = MAP_BODIES.map((body) => {
    const eq = Astronomy.EquatorFromVector(Astronomy.RotateVector(toDate, Astronomy.GeoVector(Astronomy.Body[body], time, true)));
    return { body, ra: Number((eq.ra * 15).toFixed(5)), dec: Number(eq.dec.toFixed(5)) };
  });
  return { gast: Number((Astronomy.SiderealTime(time) * 15).toFixed(5)), bodies };
}

/** Wraps a longitude into −180…180. */
export function wrapLongitude(lon: number): number {
  return ((lon + 180) % 360 + 360) % 360 - 180;
}

export function astroMapLines(input: AstroMapInput, latStep = 2): AstroMapLine[] {
  const lines: AstroMapLine[] = [];
  const rad = Math.PI / 180;
  for (const { body, ra, dec } of input.bodies) {
    const mc = wrapLongitude(ra - input.gast);
    lines.push({ body, angle: 'MC', points: [[mc, -85], [mc, 85]] });
    lines.push({ body, angle: 'IC', points: [[wrapLongitude(mc + 180), -85], [wrapLongitude(mc + 180), 85]] });
    for (const angle of ['ASC', 'DSC'] as const) {
      const points: Array<[number, number] | null> = [];
      let prevLon: number | null = null;
      for (let lat = -84; lat <= 84; lat += latStep) {
        const cosH = -Math.tan(lat * rad) * Math.tan(dec * rad);
        if (cosH < -1 || cosH > 1) { // circumpolar or never rises at this latitude
          if (points.length && points[points.length - 1] !== null) points.push(null);
          prevLon = null;
          continue;
        }
        const h0 = Math.acos(cosH) / rad;
        const lon = wrapLongitude(mc + (angle === 'ASC' ? -h0 : h0));
        if (prevLon !== null && Math.abs(lon - prevLon) > 180) points.push(null); // date line
        points.push([Number(lon.toFixed(3)), lat]);
        prevLon = lon;
      }
      lines.push({ body, angle, points });
    }
  }
  return lines;
}
