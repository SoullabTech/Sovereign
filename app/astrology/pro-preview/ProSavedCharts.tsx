'use client';

/**
 * ASTRO-PRO-SAVED-CHARTS-01 — make and keep charts for other people.
 *
 * The owner types the birth details and confirms they have the person's
 * permission to keep them. The server stores only those inputs and
 * recalculates the chart on every open. Delete is permanent.
 */
import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, ChevronRight, Search } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import styles from './pro-saved-charts.module.css';
import ProSoulPortraitPanel from './ProSoulPortraitPanel';
import ProChartSharePanel from './ProChartShareAction';

export interface SavedChartSummary {
  id: string;
  label: string;
  birthDate: string;
  birthTime: string;
  placeLabel: string | null;
  createdAt: string;
}

type PlaceOption = { name: string; lat: number; lng: number; timezone: string };

const ERRORS: Record<string, string> = {
  permission_attestation_required: 'Please confirm you have permission to keep these birth details.',
  label_invalid: 'Give the chart a name of 1 to 80 characters.',
  INVALID_BIRTH_DATE: 'Check the birth date.',
  INVALID_BIRTH_TIME: 'Check the birth time (24-hour, e.g. 14:30).',
  INVALID_COORDINATES: 'Choose a birthplace from the search results.',
  TIMEZONE_REQUIRED: 'A timezone is needed.',
  TIMEZONE_INVALID: 'That timezone is not recognised. Pick one from the list, e.g. America/New_York.',
  TIME_AMBIGUOUS: 'That local time happened twice (a clock change). The chart cannot be calculated exactly.',
  TIME_NONEXISTENT: 'That local time did not exist in that timezone (a clock change). Check the time.',
  TIME_HISTORICAL_OFFSET_PRECISION_UNVERIFIED: 'This historical timezone uses an offset the chart engine cannot yet calculate exactly.',
  LATITUDE_UNVERIFIED: 'Birthplaces beyond 66° latitude are not yet supported.',
  saved_chart_limit_reached: 'You have reached the limit of 500 saved charts.',
};

function timezoneList(): string[] {
  try {
    const list = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export default function ProSavedCharts({
  openChartId, opening, onOpen, onDeleted,
}: {
  openChartId: string | null;
  opening: boolean;
  onOpen: (chart: SavedChartSummary) => void;
  onDeleted: (chartId: string) => void;
}) {
  const [charts, setCharts] = useState<SavedChartSummary[]>([]);
  const [listStatus, setListStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [places, setPlaces] = useState<PlaceOption[]>([]);
  const [place, setPlace] = useState<PlaceOption | null>(null);
  const [timezone, setTimezone] = useState('');
  const [permission, setPermission] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null);
  const [portrait, setPortrait] = useState<string | null>(null);
  const zones = useMemo(timezoneList, []);

  async function refresh() {
    try {
      const reply = await apiFetch('/api/astrology/pro/charts', { method: 'GET', cache: 'no-store' });
      if (!reply.ok) throw new Error('list_unavailable');
      const body = await reply.json();
      setCharts(Array.isArray(body?.charts) ? body.charts : []);
      setListStatus('ready');
    } catch {
      setListStatus('unavailable');
    }
  }

  useEffect(() => { void refresh(); }, []);

  function resetForm() {
    setLabel(''); setBirthDate(''); setBirthTime(''); setPlaceQuery('');
    setPlaces([]); setPlace(null); setTimezone(''); setPermission(false);
  }

  async function searchPlaces() {
    const q = placeQuery.trim();
    if (q.length < 2) return;
    setSearching(true);
    setMessage(null);
    try {
      const reply = await apiFetch('/api/astrology/geocode?q=' + encodeURIComponent(q), { method: 'GET', cache: 'no-store' });
      const body = await reply.json().catch(() => ({}));
      const options: PlaceOption[] = (Array.isArray(body?.data) ? body.data : [])
        .map((r: { display_name?: unknown; lat?: unknown; lon?: unknown; timezone?: unknown }) => ({
          name: typeof r.display_name === 'string' ? r.display_name : '',
          lat: Number(r.lat), lng: Number(r.lon),
          timezone: typeof r.timezone === 'string' ? r.timezone : '',
        }))
        .filter((p: PlaceOption) => p.name && Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .slice(0, 6);
      setPlaces(options);
      if (options.length === 0) setMessage('No places found. Try adding the region or country.');
    } catch {
      setMessage('Place search is unavailable right now.');
    } finally {
      setSearching(false);
    }
  }

  function choosePlace(option: PlaceOption) {
    setPlace(option);
    setPlaceQuery(option.name);
    setPlaces([]);
    // The search suggests a zone from coordinates only; the member confirms it.
    if (!timezone) setTimezone(option.timezone.startsWith('Etc/') ? '' : option.timezone);
  }

  async function save() {
    if (saving) return;
    if (!place) { setMessage(ERRORS.INVALID_COORDINATES); return; }
    setSaving(true);
    setMessage(null);
    try {
      const reply = await apiFetch('/api/astrology/pro/charts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({
          label, birthDate, birthTime,
          latitude: place.lat, longitude: place.lng,
          timezone: timezone.trim(), placeLabel: place.name.slice(0, 160),
          permissionAttested: permission,
        }),
      });
      const body = await reply.json().catch(() => ({}));
      if (!reply.ok) {
        setMessage(ERRORS[body?.error] || 'The chart could not be saved. Please try again.');
        return;
      }
      resetForm();
      setFormOpen(false);
      await refresh();
      if (body?.chart) onOpen(body.chart as SavedChartSummary);
    } catch {
      setMessage('The chart could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(chartId: string) {
    setMessage(null);
    try {
      const reply = await apiFetch('/api/astrology/pro/charts/' + encodeURIComponent(chartId), {
        method: 'DELETE', cache: 'no-store',
      });
      if (!reply.ok && reply.status !== 404) throw new Error('not_deleted');
      setConfirmDelete(null);
      onDeleted(chartId);
      await refresh();
    } catch {
      setMessage('The chart could not be deleted. Please try again.');
    }
  }

  return (
    <section id="saved-charts" className={styles.panel} aria-labelledby="saved-charts-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>CHARTS FOR OTHER PEOPLE</span>
          <h2 id="saved-charts-title">Saved charts</h2>
          <p>Make a chart from anyone’s birth details and keep it here. Only you can see your saved charts. MAIA reads one only when you start a Soul Portrait from it, and a client sees theirs only if you share a link.</p>
        </div>
        {!formOpen && (
          <button className={styles.primary} onClick={() => { setFormOpen(true); setMessage(null); }}>
            <Plus size={17} aria-hidden="true" /> New chart
          </button>
        )}
      </div>

      {formOpen && (
        <form className={styles.form} onSubmit={(event) => { event.preventDefault(); void save(); }}>
          <label>Name
            <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} required placeholder="e.g. Sam, or Client A" />
          </label>
          <div className={styles.row}>
            <label>Birth date
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
            </label>
            <label>Birth time (local)
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required />
            </label>
          </div>
          <label>Birthplace
            <div className={styles.search}>
              <input value={placeQuery} placeholder="City, region, country"
                onChange={(e) => { setPlaceQuery(e.target.value); setPlace(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void searchPlaces(); } }} />
              <button type="button" onClick={() => void searchPlaces()} disabled={searching}>
                <Search size={15} aria-hidden="true" /> {searching ? 'Searching…' : 'Search'}
              </button>
            </div>
          </label>
          {places.length > 0 && (
            <ul className={styles.places} aria-label="Matching places">
              {places.map((option) => (
                <li key={`${option.lat},${option.lng},${option.name}`}>
                  <button type="button" onClick={() => choosePlace(option)}>{option.name}</button>
                </li>
              ))}
            </ul>
          )}
          {place && <p className={styles.note}>Chosen: {place.name} ({place.lat.toFixed(3)}, {place.lng.toFixed(3)})</p>}
          <label>Timezone at birth
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} list="pro-timezones" required placeholder="e.g. America/New_York" />
            <datalist id="pro-timezones">{zones.map((zone) => <option key={zone} value={zone} />)}</datalist>
          </label>
          <p className={styles.note}>Check the timezone. It is suggested from the map location and can be wrong near borders.</p>
          <label className={styles.check}>
            <input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} />
            I have this person’s permission to keep their birth details here.
          </label>
          {message && <p role="alert" className={styles.alert}>{message}</p>}
          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={saving || !permission}>
              {saving ? 'Saving…' : 'Save and open chart'}
            </button>
            <button type="button" onClick={() => { resetForm(); setFormOpen(false); setMessage(null); }}>Cancel</button>
          </div>
        </form>
      )}

      {!formOpen && message && <p role="alert" className={styles.alert}>{message}</p>}
      {listStatus === 'loading' && <p role="status">Loading saved charts…</p>}
      {listStatus === 'unavailable' && <p role="status">Saved charts are unavailable right now.</p>}
      {listStatus === 'ready' && charts.length === 0 && !formOpen && <p className={styles.note}>No saved charts yet.</p>}
      {charts.length > 0 && (
        <ul className={styles.list}>
          {charts.map((chart) => (
            <li key={chart.id} className={chart.id === openChartId ? styles.open : ''}>
              <div>
                <strong>{chart.label}</strong>
                <span>{chart.birthDate} · {chart.birthTime}{chart.placeLabel ? ` · ${chart.placeLabel}` : ''}</span>
              </div>
              <div className={styles.itemActions}>
                {confirmDelete === chart.id ? (
                  <>
                    <span>Delete permanently?</span>
                    <button onClick={() => void remove(chart.id)} className={styles.danger}>Delete</button>
                    <button onClick={() => setConfirmDelete(null)}>Keep</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => onOpen(chart)} disabled={opening}>
                      {chart.id === openChartId ? 'Open' : 'Open chart'} <ChevronRight size={15} aria-hidden="true" />
                    </button>
                    <button onClick={() => setSharing(sharing === chart.id ? null : chart.id)}
                      aria-expanded={sharing === chart.id}>Share link</button>
                    <button onClick={() => setPortrait(portrait === chart.id ? null : chart.id)}
                      aria-expanded={portrait === chart.id}>Soul Portrait</button>
                    <button onClick={() => setConfirmDelete(chart.id)} aria-label={`Delete ${chart.label}`}>
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
              {portrait === chart.id && (
                <div className={styles.shareRow}>
                  <ProSoulPortraitPanel source={chart.id} label={chart.label}
                    chartLine={`${chart.label} · ${chart.birthDate} · ${chart.birthTime}${chart.placeLabel ? ` · ${chart.placeLabel}` : ''}`}
                    birthDate={chart.birthDate} onClose={() => setPortrait(null)} />
                </div>
              )}
              {sharing === chart.id && (
                <div className={styles.shareRow}>
                  <ProChartSharePanel chartId={chart.id} label={chart.label} onClose={() => setSharing(null)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
