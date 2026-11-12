'use client';

/**
 * ASTRO-PRO-03 — interactive chart geometry, not a psychological classifier.
 * Aspect chords, houses and placements derive solely from the calculator.
 * We display a verification caveat until astronomy acceptance tests pass.
 */
import { useMemo } from 'react';
import { MAJOR_ASPECTS, type BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import {
  SIGN_GLYPHS, SIGNS, ASPECT_COLOR, chartBodies, aspectEndpointLongitudes,
  normalizeLongitude, radialPoint, toEclipticLongitude, layoutChartMarkers,
} from '@/lib/astrology/proChartGeometry';
import type { TransitBody } from '@/lib/astrology/proTransits';
import styles from './astrology-pro-preview.module.css';

interface Props {
  chart: BirthChart;
  focusedBody: string;
  onFocusBody: (name: string) => void;
  showAspects: boolean;
  showHouseLines: boolean;
  maxAspectOrb?: number | null;
  /** Optional outer ring (e.g. transits) drawn outside the zodiac band. */
  outerBodies?: readonly TransitBody[];
  outerLabel?: string;
  /** Optional second outer ring, for a triwheel. */
  outerBodies2?: readonly TransitBody[];
  outerLabel2?: string;
  /** The words in the wheel's centre. Defaults to "Your chart"; Pro passes the
   *  client's label when a saved (client) chart is open. */
  centreLabel?: string;
}

/** Fits a label into the centre circle: shorter labels stay large, longer ones shrink, then truncate. */
function centreText(label: string): { text: string; size: number } {
  const clean = label.trim() || 'Your chart';
  if (clean.length <= 13) return { text: clean, size: 30 };
  if (clean.length <= 19) return { text: clean, size: 22 };
  return { text: `${clean.slice(0, 18).trimEnd()}…`, size: 22 };
}

const OUTER_RADIUS = 352;
const OUTER_MIN_SPACING = 8; // degrees between outer glyphs at this radius

/** Spreads outer glyphs so none overlap; true positions stay marked by ticks. */
function isFocused(aspect: { planet1: string; planet2: string }, name: string): boolean {
  return aspect.planet1 === name || aspect.planet2 === name;
}

function layoutOuter(bodies: readonly TransitBody[]) {
  const ordered = [...bodies].sort((a, b) => a.longitude - b.longitude);
  const placed: Array<{ body: TransitBody; display: number }> = [];
  for (const body of ordered) {
    const prior = placed[placed.length - 1];
    const display = prior && body.longitude - prior.display < OUTER_MIN_SPACING
      ? prior.display + OUTER_MIN_SPACING : body.longitude;
    placed.push({ body, display });
  }
  return placed;
}

const center = 350;

export function CelestialChartWheel({
  chart,
  focusedBody,
  onFocusBody,
  showAspects,
  showHouseLines,
  maxAspectOrb = null,
  outerBodies,
  outerLabel = 'Outer ring',
  outerBodies2,
  outerLabel2 = 'Second ring',
  centreLabel = 'Your chart',
}: Props) {
  const centre = centreText(centreLabel);
  const outerMarkers = useMemo(() => outerBodies?.length ? layoutOuter(outerBodies) : [], [outerBodies]);
  const outerMarkers2 = useMemo(() => outerBodies2?.length ? layoutOuter(outerBodies2) : [], [outerBodies2]);
  const hasOuter = outerMarkers.length > 0;
  const hasOuter2 = hasOuter && outerMarkers2.length > 0;
  const ascendant = toEclipticLongitude(chart.ascendant.sign, chart.ascendant.degree);
  const bodies = useMemo(() => chartBodies(chart), [chart]);
  const bodyMap = useMemo(() => new Map(bodies.map((body) => [body.name, body])), [bodies]);
  const endpoints = useMemo(() => aspectEndpointLongitudes(chart), [chart]);
  // The whole aspect web, as in a professional chart, including aspects to the
  // Ascendant and Midheaven; the focused body's aspects are drawn on top and stronger.
  const aspects = useMemo(
    () => (chart.aspects || []).filter(
      (aspect) => Number.isFinite(aspect.orb) && aspect.orb >= 0 &&
        (maxAspectOrb === null || aspect.orb <= maxAspectOrb) &&
        endpoints.has(aspect.planet1) && endpoints.has(aspect.planet2),
    ).sort((x, y) => Number(isFocused(x, focusedBody)) - Number(isFocused(y, focusedBody))),
    [chart, focusedBody, endpoints, maxAspectOrb],
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
        viewBox={hasOuter2 ? '-110 -110 920 920' : hasOuter ? '-60 -60 820 820' : '0 0 700 700'}
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
          const a = endpoints.get(aspect.planet1);
          const b = endpoints.get(aspect.planet2);
          if (a === undefined || b === undefined) return null;
          const start = radialPoint(a, ascendant, 156);
          const end = radialPoint(b, ascendant, 156);
          const focused = isFocused(aspect, focusedBody);
          const minor = !MAJOR_ASPECTS.has(aspect.type);
          return (
            <line key={index}
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke={ASPECT_COLOR[aspect.type] || '#a8b6be'}
              strokeDasharray={minor ? '4 3' : undefined}
              strokeWidth={focused ? 2 : minor ? 0.8 : 1.1} opacity={focused ? 0.95 : 0.5}
              data-aspect={aspect.planet1 + '-' + aspect.type + '-' + aspect.planet2}
              data-focused={focused || undefined}
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

        {hasOuter && (
          <g aria-label={outerLabel}>
            <circle cx={center} cy={center} r="330" fill="none" stroke="#8fa9b6" strokeWidth="1" opacity=".55" />
            <circle cx={center} cy={center} r="376" fill="none" stroke="#8fa9b6" strokeWidth="1" opacity=".35" />
            {outerMarkers.map(({ body, display }) => {
              const tickIn = radialPoint(body.longitude, ascendant, 318);
              const tickOut = radialPoint(body.longitude, ascendant, 332);
              const glyph = radialPoint(display, ascendant, OUTER_RADIUS);
              return (
                <g key={body.name}>
                  <line x1={tickIn.x} y1={tickIn.y} x2={tickOut.x} y2={tickOut.y} stroke="#9fd0d8" strokeWidth="2" />
                  <text x={glyph.x} y={glyph.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="20" fill="#9fd0d8">
                    <title>{outerLabel + ': ' + body.name + ' · ' + body.position.sign + ' ' +
                      body.position.degree.toFixed(2) + '°' + (body.position.motionStatus === 'retrograde' ? ' ℞' : '')}</title>
                    {body.glyph}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {hasOuter2 && (
          <g aria-label={outerLabel2}>
            <circle cx={center} cy={center} r="424" fill="none" stroke="#c3a7d8" strokeWidth="1" opacity=".35" />
            {outerMarkers2.map(({ body, display }) => {
              const tickIn = radialPoint(body.longitude, ascendant, 376);
              const tickOut = radialPoint(body.longitude, ascendant, 386);
              const glyph = radialPoint(display, ascendant, 400);
              return (
                <g key={body.name}>
                  <line x1={tickIn.x} y1={tickIn.y} x2={tickOut.x} y2={tickOut.y} stroke="#c3a7d8" strokeWidth="2" />
                  <text x={glyph.x} y={glyph.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="20" fill="#c3a7d8">
                    <title>{outerLabel2 + ': ' + body.name + ' · ' + body.position.sign + ' ' +
                      body.position.degree.toFixed(2) + '°' + (body.position.motionStatus === 'retrograde' ? ' ℞' : '')}</title>
                    {body.glyph}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* The centre label would cover aspect lines that cross the middle,
            so it shows only when aspects are hidden. */}
        {!showAspects && (
          <g data-centre-label>
            <circle cx={center} cy={center} r="111" fill="#0b1c2d" stroke="#627989" strokeWidth="1.5" opacity=".94" />
            <text x={center} y="323" textAnchor="middle" fontSize="11" fill="#cbb88f" letterSpacing="3">SOULLAB</text>
            <text x={center} y="359" textAnchor="middle" fontSize={centre.size} fontFamily="Georgia,serif" fill="#f2e7d5">{centre.text}</text>
            <text x={center} y="388" textAnchor="middle" fontSize="12" fill="#a7b5be">Not a verdict</text>
          </g>
        )}
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
