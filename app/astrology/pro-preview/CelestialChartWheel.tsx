'use client';

/**
 * ASTRO-PRO-03 — interactive chart geometry, not a psychological classifier.
 * Aspect chords, houses and placements derive solely from the calculator.
 * We display a verification caveat until astronomy acceptance tests pass.
 */
import { useMemo } from 'react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import {
  SIGN_GLYPHS, SIGNS, ASPECT_COLOR, chartBodies,
  normalizeLongitude, radialPoint, toEclipticLongitude, selectedRelationships, layoutChartMarkers,
} from '@/lib/astrology/proChartGeometry';
import styles from './astrology-pro-preview.module.css';

interface Props {
  chart: BirthChart;
  focusedBody: string;
  onFocusBody: (name: string) => void;
  showAspects: boolean;
  showHouseLines: boolean;
  maxAspectOrb?: number | null;
}

const center = 350;

export function CelestialChartWheel({
  chart,
  focusedBody,
  onFocusBody,
  showAspects,
  showHouseLines,
  maxAspectOrb = null,
}: Props) {
  const ascendant = toEclipticLongitude(chart.ascendant.sign, chart.ascendant.degree);
  const bodies = useMemo(() => chartBodies(chart), [chart]);
  const bodyMap = useMemo(() => new Map(bodies.map((body) => [body.name, body])), [bodies]);
  const aspects = useMemo(
    () => selectedRelationships(chart, focusedBody).filter(
      (aspect) => Number.isFinite(aspect.orb) && aspect.orb >= 0 &&
        (maxAspectOrb === null || aspect.orb <= maxAspectOrb) &&
        bodyMap.has(aspect.planet1 as typeof bodies[number]['name']) &&
        bodyMap.has(aspect.planet2 as typeof bodies[number]['name']),
    ),
    [chart, focusedBody, bodyMap, maxAspectOrb],
  );

  const visualMarkers = useMemo(() =>
    ascendant === null ? [] : layoutChartMarkers(bodies, ascendant),
    [bodies, ascendant],
  );

  if (ascendant === null) {
    return <p role="status">This chart has no valid Ascendant; the wheel cannot be plotted.</p>;
  }

  return (
    <div className={styles.wheelFrame}>
      <svg
        className={styles.wheelSvg}
        viewBox="0 0 700 700"
        role="group"
        aria-label="Interactive natal chart. Select a planet to explore its calculated position and relationships."
      >
        <defs>
          <radialGradient id="astroProChartGround">
            <stop offset="0" stopColor="#1b3347" />
            <stop offset="0.75" stopColor="#0e2034" />
            <stop offset="1" stopColor="#091827" />
          </radialGradient>
          <linearGradient id="astroProWheelRim" x1="0%" x2="100%" y1="20%" y2="80%">
            <stop offset="0%" stopColor="#e5cfa2" />
            <stop offset="48%" stopColor="#6d8999" />
            <stop offset="100%" stopColor="#a99677" />
          </linearGradient>
        </defs>

        <circle cx={center} cy={center} r="322" fill="url(#astroProChartGround)" />
        <circle cx={center} cy={center} r="318" fill="none" stroke="url(#astroProWheelRim)" strokeWidth="2" />
        <circle cx={center} cy={center} r="273" fill="none" stroke="#697c8a" strokeWidth="1" opacity=".7" />
        <circle cx={center} cy={center} r="239" fill="none" stroke="#778e9b" strokeWidth="1" opacity=".5" />
        <circle cx={center} cy={center} r="163" fill="none" stroke="#a9a086" strokeWidth="1" opacity=".2" />

        {SIGNS.map((sign, index) => {
          const start = radialPoint(index * 30, ascendant, 273);
          const end = radialPoint(index * 30, ascendant, 318);
          const marker = radialPoint(index * 30 + 15, ascendant, 295);
          return (
            <g key={sign}>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#97a8ae" opacity=".43" />
              <text x={marker.x} y={marker.y} textAnchor="middle" dominantBaseline="central"
                fontFamily="'Apple Symbols', 'Segoe UI Symbol', serif" fontSize="27" fill="#d7c19a">
                {SIGN_GLYPHS[index] + '\uFE0E'}
              </text>
            </g>
          );
        })}

        {showHouseLines && chart.houses.map((longitude, index) => {
          const inner = radialPoint(longitude, ascendant, 163);
          const outer = radialPoint(longitude, ascendant, 273);
          const next = chart.houses[(index + 1) % chart.houses.length];
          const middle = normalizeLongitude(longitude + normalizeLongitude(next - longitude) / 2);
          const number = radialPoint(middle, ascendant, 255);
          return (
            <g key={index}>
              <line
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke={index % 3 === 0 ? '#d9c3a0' : '#778f9d'}
                strokeWidth={index % 3 === 0 ? 1.6 : 0.8}
                opacity={index % 3 === 0 ? '.8' : '.45'}
              />
              <text x={number.x} y={number.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fill="#9fb0b8">
                {index + 1}
              </text>
            </g>
          );
        })}

        {showAspects && aspects.map((aspect, index) => {
          const a = bodyMap.get(aspect.planet1 as typeof bodies[number]['name']);
          const b = bodyMap.get(aspect.planet2 as typeof bodies[number]['name']);
          if (!a || !b) return null;
          const start = radialPoint(a.longitude, ascendant, 156);
          const end = radialPoint(b.longitude, ascendant, 156);
          return (
            <line key={index}
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke={ASPECT_COLOR[aspect.type] || '#a8b6be'}
              strokeWidth="1.7" opacity=".85"
            />
          );
        })}

        {visualMarkers.map((point) => {
          const body = bodyMap.get(point.name);
          if (!body) return null;
          const isSelected = body.name === focusedBody;
          return (
            <g key={body.name}>
              <line
                x1={point.anchorX} y1={point.anchorY}
                x2={point.x} y2={point.y}
                stroke={isSelected ? '#f6e3b5' : '#d8bd91'}
                strokeWidth={isSelected ? 1.8 : 1}
                opacity={isSelected ? '.9' : '.58'}
                pointerEvents="none"
              />
              <circle cx={point.anchorX} cy={point.anchorY} r="2.8"
                fill="#f4e0bd" pointerEvents="none" />
              <circle
                className={styles.wheelBody}
                role="button"
                tabIndex={0}
                aria-label={'Select ' + body.name + ' in ' + body.position.sign +
                  ', house ' + body.position.house +
                  (point.displaced ? '; glyph moved slightly to avoid overlap' : '')}
                aria-pressed={isSelected}
                cx={point.x}
                cy={point.y}
                r={isSelected ? 24 : 22}
                fill={isSelected ? '#c6aa7c' : '#10263a'}
                stroke={isSelected ? '#f6e3b5' : '#a0afba'}
                strokeWidth={isSelected ? 2.6 : 1.2}
                onClick={() => onFocusBody(body.name)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onFocusBody(body.name);
                  }
                }}
              >
                <title>{body.name + ' · ' + body.position.sign + ' ' +
                  body.position.degree.toFixed(2) + '°, house ' + body.position.house +
                  (point.displaced ? ' · glyph offset for clarity' : '')}</title>
              </circle>
              <text x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central"
                pointerEvents="none"
                fontSize={isSelected ? '23' : '21'} fill={isSelected ? '#172638' : '#e8d7b5'}>
                {body.glyph}
              </text>
            </g>
          );
        })}

        <circle cx={center} cy={center} r="111" fill="#0b1c2d" stroke="#627989" strokeWidth="1.5" opacity=".94" />
        <text x={center} y="323" textAnchor="middle" fontSize="11" fill="#cbb88f" letterSpacing="3">SOULLAB</text>
        <text x={center} y="359" textAnchor="middle" fontSize="30" fontFamily="Georgia,serif" fill="#f2e7d5">Your chart</text>
        <text x={center} y="388" textAnchor="middle" fontSize="12" fill="#a7b5be">Not a verdict</text>
      </svg>
      <p className={styles.wheelCaption}>
        Anchor dots and aspect lines mark calculated longitudes; glyphs can move slightly to avoid overlap. Independent astronomical precision verification remains pending.
      </p>
      <p className={styles.wheelMobileHelp}>
        On a small screen, use the full-size planet buttons below the wheel for easier selection.
      </p>
    </div>
  );
}
