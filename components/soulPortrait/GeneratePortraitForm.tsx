'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Practitioner draft generator form. Collects birth data → POST /api/soul-portrait/generate
 * → redirects to the private preview. Generation takes ~1 minute (deep-tier).
 *
 * Birth coordinates are entered directly for now (lat/lng/timezone); place-name
 * geocoding is a later nicety.
 */
export function GeneratePortraitForm() {
  const router = useRouter();
  const [f, setF] = useState({
    name: '',
    mode: 'gift',
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
  const [people, setPeople] = useState<{ id: string; name: string }[]>([]);
  const [subjectPersonId, setSubjectPersonId] = useState<string>('');

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

  const ready =
    f.name.trim() && f.date && f.time && f.lat && f.lng && f.timezone.trim() && !isNaN(Number(f.lat)) && !isNaN(Number(f.lng));

  async function generate() {
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
          subjectPersonId: subjectPersonId || undefined,
          age: f.age ? Number(f.age) : undefined,
          isMinor: f.isMinor,
          birthPlace: f.place.trim() || undefined,
          birthData: {
            date: f.date,
            time: f.time,
            location: { lat: Number(f.lat), lng: Number(f.lng), timezone: f.timezone.trim() },
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
          <Field label="Birth date"><input style={inp} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Birth time (24h)"><input style={inp} type="time" value={f.time} onChange={(e) => set('time', e.target.value)} /></Field>
        </Row>
        <Row><Field label="Birth place (for display)"><input style={inp} value={f.place} onChange={(e) => set('place', e.target.value)} placeholder="New York, NY" /></Field></Row>
        <Row>
          <Field label="Latitude"><input style={inp} value={f.lat} onChange={(e) => set('lat', e.target.value)} placeholder="40.7128" /></Field>
          <Field label="Longitude"><input style={inp} value={f.lng} onChange={(e) => set('lng', e.target.value)} placeholder="-74.0060" /></Field>
          <Field label="Timezone"><input style={inp} value={f.timezone} onChange={(e) => set('timezone', e.target.value)} placeholder="America/New_York" /></Field>
        </Row>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: '#4A5568', margin: '4px 0 20px' }}>
          <input type="checkbox" checked={f.isMinor} onChange={(e) => set('isMinor', e.target.checked)} /> Subject is a minor
        </label>

        <button onClick={generate} disabled={busy || !ready} style={btn(busy || !ready)}>
          {busy ? 'Generating… (~1 min)' : 'Generate Draft'}
        </button>
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
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#4A5568', marginBottom: 5 };

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
