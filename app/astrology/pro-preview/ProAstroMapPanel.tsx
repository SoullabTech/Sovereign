'use client';

/**
 * ASTRO-PRO-ASTROMAP-01 — astro map and relocated chart for the open chart.
 *
 * The map is an equirectangular latitude/longitude grid with bundled
 * public-domain Natural Earth land outlines and secondary reference cities.
 * Click anywhere, or search a place,
 * to relocate the chart there. Only the subject and the chosen coordinates
 * are sent.
 */
import { useMemo, useState } from 'react';
import { usePanelState } from './panelMemory';
import { apiFetch } from '@/lib/http/apiBase';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { hasValidChartGeometry } from '@/lib/astrology/proChartGeometry';
import { MAP_BODIES, astroMapLines, type AstroMapInput, type MapBody } from '@/lib/astrology/proAstroMap';
import { WORLD_LAND_110M_SEGMENTS, worldLandPath } from '@/lib/astrology/worldLand110m';
import { CelestialChartWheel } from './CelestialChartWheel';
import styles from './pro-transit-panel.module.css';
import mapStyles from './pro-astromap.module.css';

const W = 1000;
const H = 500;
const COLORS: Record<MapBody, string> = {
  Sun: '#f2c94c', Moon: '#d9dde3', Mercury: '#9fd0d8', Venus: '#e8a5c4', Mars: '#e7735f',
  Jupiter: '#c9a46b', Saturn: '#a59a86', Uranus: '#7fc8b9', Neptune: '#7d9fe0', Pluto: '#b48ad1',
};
const DASH: Record<string, string | undefined> = { MC: undefined, IC: '2 4', ASC: '8 4', DSC: '1 3' };

// Reference cities [name, lat, lng] — orientation only.
const CITIES: Array<[string, number, number]> = [
  ['New York', 40.71, -74.01], ['Los Angeles', 34.05, -118.24], ['Chicago', 41.88, -87.63], ['Mexico City', 19.43, -99.13],
  ['Toronto', 43.65, -79.38], ['Vancouver', 49.28, -123.12], ['Honolulu', 21.31, -157.86], ['Anchorage', 61.22, -149.9],
  ['Bogotá', 4.71, -74.07], ['Lima', -12.05, -77.04], ['São Paulo', -23.55, -46.63], ['Buenos Aires', -34.6, -58.38],
  ['Reykjavík', 64.15, -21.94], ['London', 51.51, -0.13], ['Paris', 48.86, 2.35], ['Madrid', 40.42, -3.7],
  ['Rome', 41.9, 12.5], ['Berlin', 52.52, 13.4], ['Stockholm', 59.33, 18.07], ['Athens', 37.98, 23.73],
  ['Istanbul', 41.01, 28.98], ['Moscow', 55.76, 37.62], ['Cairo', 30.04, 31.24], ['Lagos', 6.52, 3.38],
  ['Nairobi', -1.29, 36.82], ['Johannesburg', -26.2, 28.05], ['Dubai', 25.2, 55.27], ['Tehran', 35.69, 51.39],
  ['Mumbai', 19.08, 72.88], ['Delhi', 28.61, 77.21], ['Bangkok', 13.76, 100.5], ['Singapore', 1.35, 103.82],
  ['Beijing', 39.9, 116.4], ['Shanghai', 31.23, 121.47], ['Hong Kong', 22.32, 114.17], ['Tokyo', 35.68, 139.69],
  ['Seoul', 37.57, 126.98], ['Manila', 14.6, 120.98], ['Sydney', -33.87, 151.21], ['Perth', -31.95, 115.86],
  ['Auckland', -36.85, 174.76], ['Jakarta', -6.21, 106.85],
];

const x = (lng: number) => ((lng + 180) / 360) * W;
const y = (lat: number) => ((90 - lat) / 180) * H;
const LAND_PATHS = WORLD_LAND_110M_SEGMENTS.map((segment) => worldLandPath(segment, W, H));

export default function ProAstroMapPanel({ subjectId, chartLabel, houseSystem }: {
  subjectId: string; chartLabel: string; houseSystem: string;
}) {
  const [map, setMap] = usePanelState<AstroMapInput | null>('astromap.map', null);
  const [hidden, setHidden] = useState<Set<MapBody>>(new Set());
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [relocated, setRelocated] = usePanelState<{ chart: BirthChart; lat: number; lng: number; label: string } | null>('astromap.relocated', null);
  const [focus, setFocus] = usePanelState('astromap.focus', 'Sun');
  const [query, setQuery] = usePanelState('astromap.query', '');

  const lines = useMemo(() => map ? astroMapLines(map) : [], [map]);

  async function request(body: Record<string, unknown>) {
    const reply = await apiFetch('/api/astrology/pro/place?houseSystem=' + encodeURIComponent(houseSystem), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify(body),
    });
    if (!reply.ok) throw new Error('unavailable');
    return reply.json();
  }

  async function draw() {
    setStatus('loading');
    try {
      const body = await request({ subject: subjectId });
      setMap(body.map);
      setStatus('idle');
    } catch { setStatus('error'); }
  }

  async function relocate(lat: number, lng: number, label: string) {
    setStatus('loading');
    try {
      const body = await request({ subject: subjectId, lat, lng });
      if (!hasValidChartGeometry(body?.relocated?.data)) throw new Error('invalid');
      setMap(body.map);
      setRelocated({ chart: body.relocated.data, lat, lng, label });
      setStatus('idle');
    } catch { setStatus('error'); }
  }

  async function search() {
    if (query.trim().length < 2) return;
    try {
      const reply = await apiFetch('/api/astrology/geocode?q=' + encodeURIComponent(query.trim()), { method: 'GET', cache: 'no-store' });
      const body = await reply.json();
      const first = Array.isArray(body?.data) ? body.data[0] : null;
      if (!first) { setStatus('error'); return; }
      await relocate(Number(first.lat), Number(first.lon), String(first.display_name || query));
    } catch { setStatus('error'); }
  }

  function onMapClick(event: React.MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const lng = ((event.clientX - rect.left) / rect.width) * 360 - 180;
    const lat = 90 - ((event.clientY - rect.top) / rect.height) * 180;
    if (Math.abs(lat) > 66) return; // beyond the calculator's tested latitude
    void relocate(Number(lat.toFixed(3)), Number(lng.toFixed(3)), `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`);
  }

  return (
    <div className={styles.panel} aria-labelledby="pro-astromap-title">
      <div className={styles.controls}>
        <h3 id="pro-astromap-title">Astro map &amp; relocation</h3>
        <button onClick={() => void draw()} disabled={status === 'loading'}>{status === 'loading' ? 'Calculating…' : map ? 'Redraw' : 'Draw astro map'}</button>
        <label>Relocate to
          <input value={query} placeholder="City, country" onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void search(); } }} />
        </label>
        <button onClick={() => void search()} disabled={status === 'loading'}>Relocate</button>
      </div>
      {status === 'error' && <p role="alert" className={styles.alert}>That could not be calculated. Relocation works between 66° N and 66° S.</p>}

      {map && (
        <>
          <div className={styles.controls} style={{ marginTop: 10 }}>
            {MAP_BODIES.map((b) => (
              <button key={b} aria-pressed={!hidden.has(b)} style={{ color: COLORS[b] }}
                onClick={() => setHidden((h) => { const n = new Set(h); if (n.has(b)) n.delete(b); else n.add(b); return n; })}>{b}</button>
            ))}
          </div>
          <div className={mapStyles.viewport}>
            <svg viewBox={`0 0 ${W} ${H}`} className={mapStyles.map}
              role="img" aria-label={`Astro map for ${chartLabel}`} onClick={onMapClick}>
              <rect width={W} height={H} fill="#06141f" />
              <g className={mapStyles.land} aria-hidden="true">
                {LAND_PATHS.map((d, index) => <path key={`land-${index}`} d={d} />)}
              </g>
              {Array.from({ length: 13 }, (_, i) => -180 + i * 30).map((lng) => (
                <line key={'v' + lng} x1={x(lng)} x2={x(lng)} y1={0} y2={H} stroke="rgba(160,175,186,.12)" />
              ))}
              {Array.from({ length: 7 }, (_, i) => -90 + i * 30).map((lat) => (
                <g key={'h' + lat}>
                  <line x1={0} x2={W} y1={y(lat)} y2={y(lat)} stroke={lat === 0 ? 'rgba(160,175,186,.3)' : 'rgba(160,175,186,.12)'} />
                  <text x={4} y={y(lat) - 3} fontSize="10" fill="#6f838b">{lat}°</text>
                </g>
              ))}
              {lines.filter((l) => !hidden.has(l.body)).map((line) => {
                let d = '';
                let pen = false;
                for (const p of line.points) {
                  if (!p) { pen = false; continue; }
                  d += (pen ? 'L' : 'M') + x(p[0]).toFixed(1) + ' ' + y(p[1]).toFixed(1) + ' ';
                  pen = true;
                }
                return <path key={line.body + line.angle} d={d} fill="none" stroke={COLORS[line.body]}
                  strokeWidth="1.6" strokeDasharray={DASH[line.angle]}>
                  <title>{line.body} on the {line.angle}</title>
                </path>;
              })}
              {CITIES.map(([name, lat, lng]) => (
                <g key={name} pointerEvents="none">
                  <circle cx={x(lng)} cy={y(lat)} r="2.2" className={mapStyles.cityDot} />
                  <text x={x(lng) + 4} y={y(lat) - 3} className={mapStyles.cityLabel}>{name}</text>
                </g>
              ))}
              {relocated && <circle cx={x(relocated.lng)} cy={y(relocated.lat)} r="6" fill="none" stroke="#f6e3b5" strokeWidth="2" pointerEvents="none" />}
            </svg>
          </div>
          <p className={styles.note}>Solid: MC · short dash: IC · long dash: Ascendant · dotted: Descendant. Click the map to relocate the chart to that spot.</p>
        </>
      )}

      {relocated && (
        <>
          <p className={styles.note}>{chartLabel} relocated to {relocated.label}: same moment, houses and angles for the new place.</p>
          <CelestialChartWheel chart={relocated.chart} focusedBody={focus} onFocusBody={setFocus} showAspects showHouseLines />
        </>
      )}
    </div>
  );
}
