'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PORTRAIT_THEMES, DEFAULT_PORTRAIT_THEME, type PortraitThemeKey } from '@/lib/soulPortrait/schema';
import { parseTransitReport } from '@/lib/soulPortrait/generator/transitReportParser';

/**
 * Practitioner draft generator form. Collects birth data → POST /api/soul-portrait/generate
 * → redirects to the private preview. Generation takes ~1 minute (deep-tier).
 *
 * Birthplace is the primary input: it resolves to coordinates + timezone via the
 * existing /api/astrology/geocode endpoint. Coordinates stay editable as a fallback
 * and accept both decimal (43.23) and ephemeris notation (43N14) — the format a
 * practitioner holding a printed chart will actually have in hand.
 *
 * Nothing here is ever silently disabled: every unmet requirement is named inline.
 */

/**
 * Parse a coordinate in decimal ("43.2342", "-86.25") or ephemeris notation
 * ("43N14", "86W15", "43 N 14.5"). Returns signed decimal degrees, or null if
 * unparseable / out of range / wrong axis (an N/S value in the longitude field).
 */
export function parseCoord(raw: string, kind: 'lat' | 'lng'): number | null {
  const s = raw.trim().toUpperCase();
  if (!s) return null;
  const max = kind === 'lat' ? 90 : 180;

  if (/^[-+]?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    return Math.abs(n) <= max ? n : null;
  }

  // Ephemeris style: degrees + hemisphere letter + optional minutes (43N14, 86 W 15.5)
  const m = s.match(/^(\d{1,3})\s*([NSEW])\s*(\d{1,2}(?:\.\d+)?)?$/);
  if (!m) return null;
  const deg = Number(m[1]);
  const hemi = m[2];
  const min = m[3] ? Number(m[3]) : 0;
  if (min >= 60) return null;
  const isLatHemi = hemi === 'N' || hemi === 'S';
  if (isLatHemi !== (kind === 'lat')) return null;
  const val = deg + min / 60;
  if (val > max) return null;
  return hemi === 'S' || hemi === 'W' ? -val : val;
}

type GeoResult = {
  display_name: string;
  lat: string;
  lon: string;
  timezone: string;
};

export function GeneratePortraitForm() {
  const router = useRouter();
  const [f, setF] = useState({
    name: '',
    mode: 'gift',
    theme: DEFAULT_PORTRAIT_THEME as PortraitThemeKey,
    date: '',
    time: '',
    place: '',
    lat: '',
    lng: '',
    timezone: 'America/New_York',
    age: '',
    isMinor: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitReport, setTransitReport] = useState('');
  const [people, setPeople] = useState<{ id: string; name: string }[]>([]);
  const [subjectPersonId, setSubjectPersonId] = useState<string>('');

  // Birthplace lookup state
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [geoFilled, setGeoFilled] = useState(false);

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  // Load the practitioner's Co-Lab people for the subject selector. Optional — an
  // unlinked draft is still valid. Preselects ?personId when present (the regenerate flow).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/studio/people', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const list: { id: string; name: string }[] = Array.isArray(data?.people)
          ? data.people.map((p: any) => ({ id: String(p.id), name: String(p.name ?? '') }))
          : [];
        if (cancelled) return;
        setPeople(list);
        const pre = new URLSearchParams(window.location.search).get('personId');
        if (pre && list.some((p) => p.id === pre)) {
          setSubjectPersonId(pre);
          const match = list.find((p) => p.id === pre);
          if (match) setF((prev) => ({ ...prev, name: prev.name || match.name }));
        }
      } catch {
        /* people list is optional; the portrait can still be generated unlinked */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function lookupPlace() {
    const q = f.place.trim();
    if (q.length < 2) {
      setGeoError('Type a birthplace first (e.g. "Muskegon, MI").');
      return;
    }
    setGeoBusy(true);
    setGeoError(null);
    setGeoResults([]);
    try {
      const res = await fetch(`/api/astrology/geocode?q=${encodeURIComponent(q)}`, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setGeoError(data.error || 'Location search is unavailable right now — enter coordinates below instead.');
        return;
      }
      const results: GeoResult[] = Array.isArray(data.data) ? data.data : [];
      if (results.length === 0) {
        setGeoError('No match found — try a broader name, or enter coordinates below.');
        return;
      }
      setGeoResults(results.slice(0, 5));
    } catch {
      setGeoError('Location search failed — enter coordinates below instead.');
    } finally {
      setGeoBusy(false);
    }
  }

  function pickPlace(r: GeoResult) {
    setF((prev) => ({
      ...prev,
      lat: String(Math.round(parseFloat(r.lat) * 10000) / 10000),
      lng: String(Math.round(parseFloat(r.lon) * 10000) / 10000),
      timezone: r.timezone || prev.timezone,
    }));
    setGeoResults([]);
    setGeoFilled(true);
  }

  // Live transit-data preview: the same parser the generator uses, so the
  // practitioner sees exactly what will (and won't) be extracted. DATA only —
  // the report's interpretive text never leaves this request.
  const transitParse = transitReport.trim() ? parseTransitReport(transitReport) : null;
  const transitBlocksGenerate = transitParse !== null && transitParse.transits.length === 0;

  async function readReportFile(file: File | undefined) {
    if (!file) return;
    try {
      setTransitReport(await file.text());
    } catch {
      setError('Could not read that file — paste the report text instead.');
    }
  }

  const latParsed = parseCoord(f.lat, 'lat');
  const lngParsed = parseCoord(f.lng, 'lng');
  const latInvalid = f.lat.trim() !== '' && latParsed === null;
  const lngInvalid = f.lng.trim() !== '' && lngParsed === null;

  // Name every unmet requirement — the button is never silently disabled.
  const missing: string[] = [];
  if (!f.name.trim()) missing.push('name');
  if (!f.date) missing.push('birth date');
  if (!f.time) missing.push('birth time');
  if (latParsed === null) missing.push(latInvalid ? 'a valid latitude' : 'latitude');
  if (lngParsed === null) missing.push(lngInvalid ? 'a valid longitude' : 'longitude');
  if (!f.timezone.trim()) missing.push('timezone');
  if (transitBlocksGenerate) missing.push('a readable transit report (or clear the Year Ahead field)');
  const ready = missing.length === 0;

  async function generate() {
    if (latParsed === null || lngParsed === null) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/soul-portrait/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: f.name.trim(),
          mode: f.mode,
          theme: f.theme,
          subjectPersonId: subjectPersonId || undefined,
          age: f.age ? Number(f.age) : undefined,
          isMinor: f.isMinor,
          transitReport: transitReport.trim() || undefined,
          birthPlace: f.place.trim() || undefined,
          birthData: {
            date: f.date,
            time: f.time,
            location: { lat: latParsed, lng: lngParsed, timezone: f.timezone.trim() },
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) setError('Please sign in to generate a portrait.');
      else if (!res.ok) setError(data.error || 'Generation failed — please try again.');
      else if (data.previewUrl) {
        router.push(data.previewUrl);
        return;
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f6f1', padding: '48px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: '#1A2F24', margin: '0 0 8px' }}>Generate a Soul Portrait</h1>
        <p style={{ color: '#718096', fontSize: 14, margin: '0 0 28px' }}>
          Creates a private draft for your review. Nothing is published or shared. Generation takes about a minute.
        </p>

        {people.length > 0 && (
          <Row>
            <Field label="Client (from your Co-Lab)">
              <select
                style={inp}
                value={subjectPersonId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSubjectPersonId(id);
                  const match = people.find((p) => p.id === id);
                  if (match) set('name', match.name);
                }}
              >
                <option value="">— None (unlinked draft) —</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
          </Row>
        )}
        <Row><Field label="Name"><input style={inp} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Client's name" /></Field></Row>
        <Row>
          <Field label="Kind">
            <select style={inp} value={f.mode} onChange={(e) => set('mode', e.target.value)}>
              <option value="gift">Gift</option>
              <option value="self">Self</option>
              <option value="parent-child">Parent–child</option>
              <option value="legacy">Legacy</option>
            </select>
          </Field>
          <Field label="Age (optional)"><input style={inp} value={f.age} onChange={(e) => set('age', e.target.value)} inputMode="numeric" placeholder="34" /></Field>
        </Row>
        <Row>
          <Field label="Page theme">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                style={{ ...inp, flex: 1 }}
                value={f.theme}
                onChange={(e) => set('theme', e.target.value as PortraitThemeKey)}
              >
                {Object.values(PORTRAIT_THEMES).map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ThemeSwatch themeKey={f.theme} />
            </div>
            <Hint tone="ok">{PORTRAIT_THEMES[f.theme].description} You can regenerate with a different theme later.</Hint>
          </Field>
        </Row>
        <Row>
          <Field label="Birth date"><input style={inp} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Birth time (24h)"><input style={inp} type="time" value={f.time} onChange={(e) => set('time', e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Birth place">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...inp, flex: 1 }}
                value={f.place}
                onChange={(e) => {
                  set('place', e.target.value);
                  setGeoFilled(false);
                  setGeoError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    lookupPlace();
                  }
                }}
                placeholder="Muskegon, MI"
              />
              <button type="button" onClick={lookupPlace} disabled={geoBusy} style={lookupBtn(geoBusy)}>
                {geoBusy ? 'Searching…' : 'Find'}
              </button>
            </div>
            {geoError && <Hint tone="warn">{geoError}</Hint>}
            {geoFilled && !geoError && (
              <Hint tone="ok">Coordinates and timezone filled from birthplace — please verify the timezone below.</Hint>
            )}
            {geoResults.length > 0 && (
              <div style={resultsBox}>
                {geoResults.map((r, i) => (
                  <button key={i} type="button" onClick={() => pickPlace(r)} style={resultRow}>
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
          </Field>
        </Row>
        <Row>
          <Field label="Latitude">
            <input style={{ ...inp, ...(latInvalid ? inpBad : null) }} value={f.lat} onChange={(e) => { set('lat', e.target.value); setGeoFilled(false); }} placeholder="43.2342 or 43N14" />
            {latInvalid && <Hint tone="warn">Use decimal (43.2342) or chart notation (43N14).</Hint>}
          </Field>
          <Field label="Longitude">
            <input style={{ ...inp, ...(lngInvalid ? inpBad : null) }} value={f.lng} onChange={(e) => { set('lng', e.target.value); setGeoFilled(false); }} placeholder="-86.2484 or 86W15" />
            {lngInvalid && <Hint tone="warn">Use decimal (-86.2484, West is negative) or chart notation (86W15).</Hint>}
          </Field>
          <Field label="Timezone">
            <input style={inp} value={f.timezone} onChange={(e) => set('timezone', e.target.value)} placeholder="America/New_York" />
          </Field>
        </Row>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: '#4A5568', margin: '4px 0 20px' }}>
          <input type="checkbox" checked={f.isMinor} onChange={(e) => set('isMinor', e.target.checked)} /> Subject is a minor
        </label>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1A2F24', margin: '0 0 4px' }}>
            The Year Ahead (Part II) — optional
          </h2>
          <p style={{ color: '#718096', fontSize: 13, margin: '0 0 12px' }}>
            Paste the client&apos;s 12-month transit report (Astrograph format). Only the transit
            data is extracted — bodies, aspects, and dates. The report&apos;s interpretive text is
            copyrighted and is discarded unread; every word of the Year Ahead is written fresh.
          </p>
          <Field label="Transit report text">
            <textarea
              style={{ ...inp, minHeight: 140, fontFamily: 'inherit', resize: 'vertical' }}
              value={transitReport}
              onChange={(e) => setTransitReport(e.target.value)}
              placeholder={'Transiting Pluto in opposition with natal Jupiter\nMarch 4, 2026 until January 10, 2027\nThis transit is exact on April 2, 2026 …'}
            />
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <label style={{ fontSize: 13, color: '#2C5530', cursor: 'pointer', textDecoration: 'underline' }}>
              Upload a .txt file instead
              <input
                type="file"
                accept=".txt,text/plain"
                style={{ display: 'none' }}
                onChange={(e) => readReportFile(e.target.files?.[0])}
              />
            </label>
            {transitReport.trim() && (
              <button
                type="button"
                onClick={() => setTransitReport('')}
                style={{ fontSize: 13, color: '#718096', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Clear
              </button>
            )}
          </div>
          {transitParse && transitParse.transits.length > 0 && (
            <Hint tone="ok">
              {transitParse.transits.length} transit{transitParse.transits.length === 1 ? '' : 's'} detected
              {transitParse.warnings.length > 0 ? ` (${transitParse.warnings.length} without dates)` : ''} — the
              draft will include a Year Ahead.
            </Hint>
          )}
          {transitBlocksGenerate && (
            <Hint tone="warn">
              No transit lines recognized — expected lines like &ldquo;Transiting Pluto in opposition with natal
              Jupiter&rdquo; followed by dates. Fix the paste, or clear the field to generate Part I only.
            </Hint>
          )}
        </div>

        <button onClick={generate} disabled={busy || !ready} style={btn(busy || !ready)}>
          {busy ? `Generating… (~${transitParse ? 2 : 1} min)` : 'Generate Draft'}
        </button>
        {!ready && !busy && (
          <p style={{ color: '#718096', fontSize: 13, marginTop: 10 }}>
            To generate: add {missing.join(', ')}.
          </p>
        )}
        {error && <p style={{ color: '#c53030', fontSize: 14, marginTop: 16 }}>{error}</p>}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 8,
  border: '1px solid #cbd5e0',
  fontSize: 15,
  boxSizing: 'border-box',
};
const inpBad: React.CSSProperties = { border: '1px solid #c53030' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#4A5568', marginBottom: 5 };
const resultsBox: React.CSSProperties = {
  marginTop: 6,
  border: '1px solid #cbd5e0',
  borderRadius: 8,
  background: '#fff',
  overflow: 'hidden',
};
const resultRow: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '10px 13px',
  border: 'none',
  borderBottom: '1px solid #edf2f7',
  background: 'transparent',
  fontSize: 13,
  color: '#2d3748',
  cursor: 'pointer',
};

/** Tiny preview of a theme (dark register): page ground, card surface, accent. */
function ThemeSwatch({ themeKey }: { themeKey: PortraitThemeKey }) {
  const v = PORTRAIT_THEMES[themeKey].dark;
  const dot = (bg: string): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: bg,
    border: '1px solid rgba(0,0,0,0.15)',
  });
  return (
    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }} aria-hidden>
      <span style={dot(v['--sp-ground'])} />
      <span style={dot(v['--sp-surface'])} />
      <span style={dot(v['--sp-accent'])} />
    </span>
  );
}

function Hint({ tone, children }: { tone: 'warn' | 'ok'; children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12.5, marginTop: 6, marginBottom: 0, color: tone === 'warn' ? '#c05621' : '#2C5530' }}>
      {children}
    </p>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
function btn(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '14px',
    borderRadius: 8,
    border: 'none',
    background: disabled ? '#94a3b8' : 'linear-gradient(135deg,#1A2F24,#2C5530)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
  };
}
function lookupBtn(busy: boolean): React.CSSProperties {
  return {
    padding: '0 18px',
    borderRadius: 8,
    border: '1px solid #2C5530',
    background: busy ? '#edf2f7' : '#fff',
    color: '#2C5530',
    fontSize: 14,
    fontWeight: 600,
    cursor: busy ? 'default' : 'pointer',
    whiteSpace: 'nowrap',
  };
}
