'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { HOUSE_GROUPS, HOUSE_PLACES, placeById, type HousePlaceId } from '@/lib/house/catalog';
import { defaultHousePreferences, parseHouseSnapshot, sameHouseOwner, visibleHouseCenter, visibleHouseShortcuts,
  type HousePreferences, type HousePreferenceSnapshot } from '@/lib/house/preferences';
import { PassingThrough } from './PassingThrough';
import { DecisionAccessNotice } from './DecisionAccessNotice';
import type { PassingQuote } from './passingContext';
import house from './house.module.css';
import styles from './house-preferences.module.css';

type ArrangeTarget = 'center' | 'quick';
interface ArrangeIntent { placeId: HousePlaceId; target: ArrangeTarget }
interface ContextValue {
  active: HousePreferenceSnapshot | null;
  open: (intent?: ArrangeIntent) => void;
  message: string;
}
const Context = createContext<ContextValue | null>(null);
function useHousePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error('HOUSE_PREFERENCES_PROVIDER_REQUIRED');
  return value;
}

async function requestPreferences(options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('/api/house/preferences', {
      ...options, signal: controller.signal, credentials: 'same-origin', cache: 'no-store',
    });
    const body = await response.text();
    return new Response(body, { status: response.status, headers: response.headers });
  } finally { window.clearTimeout(timeout); }
}

export function HousePreferencesProvider({ initial, children }: { initial: HousePreferenceSnapshot; children: ReactNode }) {
  const [active, setActive] = useState<HousePreferenceSnapshot | null>(initial);
  const [base, setBase] = useState(initial);
  const [draft, setDraft] = useState<HousePreferences>(initial.preferences);
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [restore, setRestore] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [pendingCenter, setPendingCenter] = useState<HousePlaceId | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const replaceRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const owner = useRef(initial.tag);
  const alive = useRef(true);
  const loadSequence = useRef(0);

  const clear = useCallback(() => {
    loadSequence.current += 1;
    setActive(null); setIsOpen(false); setBusy(false); setSaving(false);
    setDraft(defaultHousePreferences([])); setMessage('Your session changed. Reload House to continue.');
  }, []);

  const reload = useCallback(async (reapply = false, editing = false, announceReapply = false) => {
    const sequence = ++loadSequence.current;
    setBusy(true); setMessage('');
    try {
      const response = await requestPreferences();
      if (!alive.current || sequence !== loadSequence.current) return;
      if (response.status === 401) { clear(); return; }
      if (!response.ok) throw new Error('LOAD_FAILED');
      const next = parseHouseSnapshot(await response.json());
      if (!alive.current || sequence !== loadSequence.current) return;
      if (!sameHouseOwner(owner.current, next.tag)) { clear(); return; }
      setActive(next);
      if (editing) {
        setBase(next); setConflict(false);
        if (!reapply) {
          setDraft({
            ...next.preferences,
            center: next.preferences.center.filter(id => next.eligibleIds.includes(id)),
            shortcuts: next.preferences.shortcuts.filter(id => next.eligibleIds.includes(id)),
          });
        } else {
          setDraft(current => ({
            ...current,
            center: current.center.filter(id => next.eligibleIds.includes(id)),
            shortcuts: current.shortcuts.filter(id => next.eligibleIds.includes(id)),
          }));
          if (announceReapply)
            setMessage('Latest saved choices loaded. Your draft is still here; review it and Save when ready.');
        }
      }
    } catch {
      if (alive.current && sequence === loadSequence.current)
        setMessage('Your saved House choices could not be loaded. Please try again.');
    } finally {
      if (alive.current && sequence === loadSequence.current) setBusy(false);
    }
  }, [clear]);

  useEffect(() => {
    alive.current = true;
    const pagehide = () => clear();
    const pageshow = () => void reload();
    const storage = (event: StorageEvent) => {
      if (!event.key || ['beta_user','memberId','maia_session_token','maia_session_version'].includes(event.key)) clear();
    };
    const visible = () => { if (document.visibilityState === 'visible' && !dialog.current?.open) void reload(); };
    window.addEventListener('pagehide', pagehide); window.addEventListener('pageshow', pageshow);
    window.addEventListener('storage', storage); document.addEventListener('visibilitychange', visible);
    return () => {
      alive.current = false; loadSequence.current += 1;
      window.removeEventListener('pagehide', pagehide); window.removeEventListener('pageshow', pageshow);
      window.removeEventListener('storage', storage); document.removeEventListener('visibilitychange', visible);
    };
  }, [clear, reload]);

  useEffect(() => {
    if (isOpen && !dialog.current?.open) dialog.current?.showModal();
    if (!isOpen && dialog.current?.open) { dialog.current.close(); opener.current?.focus(); }
  }, [isOpen]);

  useEffect(() => {
    if (!pendingCenter) return;
    window.requestAnimationFrame(() => replaceRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  }, [pendingCenter]);

  function begin(intent?: ArrangeIntent) {
    if (!active || busy) return;
    opener.current = document.activeElement as HTMLElement;
    const next: HousePreferences = {
      ...active.preferences,
      center: active.preferences.center.filter(id => active.eligibleIds.includes(id)),
      shortcuts: active.preferences.shortcuts.filter(id => active.eligibleIds.includes(id)),
    };
    let pending: HousePlaceId | null = null;
    if (intent && active.eligibleIds.includes(intent.placeId)) {
      if (intent.target === 'quick' && !next.shortcuts.includes(intent.placeId)) next.shortcuts = [...next.shortcuts, intent.placeId];
      if (intent.target === 'center' && !next.center.includes(intent.placeId)) {
        if (next.center.length < 5) next.center = [...next.center, intent.placeId];
        else pending = intent.placeId;
      }
    }
    setPendingCenter(pending); setBase(active); setDraft(next); setRestore(false); setConflict(false);
    setMessage(pending ? 'Your Center already has five places. Choose one to replace before saving.' : '');
    setIsOpen(true);
    void reload(!!intent, true, false);
  }

  function cancel() {
    if (!saving) {
      loadSequence.current += 1; setBusy(false); setPendingCenter(null); setIsOpen(false); setMessage('');
    }
  }
  function toggleQuick(id: HousePlaceId) {
    setDraft(current => ({ ...current, shortcuts: current.shortcuts.includes(id)
      ? current.shortcuts.filter(key => key !== id) : [...current.shortcuts, id] }));
  }
  function toggleCenter(id: HousePlaceId) {
    setDraft(current => {
      if (current.center.includes(id)) {
        setPendingCenter(null); setMessage('');
        return { ...current, center: current.center.filter(key => key !== id) };
      }
      if (current.center.length < 5) {
        setPendingCenter(null); setMessage('');
        return { ...current, center: [...current.center, id] };
      }
      setPendingCenter(id);
      setMessage('Your Center already has five places. Choose one to replace before saving.');
      return current;
    });
  }
  function replaceCenter(removeId: HousePlaceId) {
    if (!pendingCenter) return;
    setDraft(current => ({ ...current, center: current.center.map(id => id === removeId ? pendingCenter : id) }));
    setPendingCenter(null); setMessage('');
  }
  function move(list: 'center' | 'shortcuts', id: HousePlaceId, direction: -1 | 1) {
    setDraft(current => {
      const order = [...current[list]], index = order.indexOf(id), next = index + direction;
      if (index < 0 || next < 0 || next >= order.length) return current;
      [order[index], order[next]] = [order[next], order[index]];
      return { ...current, [list]: order };
    });
  }
  async function save() {
    if (busy || !active) return;
    setBusy(true); setSaving(true); setMessage(''); setConflict(false);
    const sequence = ++loadSequence.current;
    const intended = { ...draft, center: [...draft.center], shortcuts: [...draft.shortcuts] };
    try {
      const response = await requestPreferences({
        method:'PUT', headers:{'Content-Type':'application/json','If-Match':base.tag},
        body:JSON.stringify({ expectedRevision:base.revision, preferences:intended }),
      });
      if (!alive.current || sequence !== loadSequence.current) return;
      if (response.status === 401) { clear(); return; }
      if (response.status === 409 || response.status === 403) {
        const refusal = await response.json().catch(() => null);
        if (refusal?.code === 'HOUSE_CONTEXT_CHANGED') { clear(); return; }
        setConflict(true); setMessage('Your saved choices, account, or available places changed. Your draft is still here. Reload before saving.'); return;
      }
      if (!response.ok) throw new Error('SAVE_FAILED');
      const saved = parseHouseSnapshot(await response.json());
      if (!alive.current || sequence !== loadSequence.current) return;
      if (!sameHouseOwner(base.tag, saved.tag)) { clear(); return; }
      if (saved.revision !== base.revision + 1 || JSON.stringify(saved.preferences) !== JSON.stringify(intended))
        throw new Error('UNCONFIRMED_SAVE');
      setActive(saved); setBase(saved); setPendingCenter(null); setIsOpen(false); setMessage('House choices saved.');
    } catch {
      if (alive.current && sequence === loadSequence.current) {
        setConflict(true); setMessage('The save could not be confirmed. Your draft is still here. Reload saved choices before trying again.');
      }
    } finally {
      if (alive.current && sequence === loadSequence.current) { setBusy(false); setSaving(false); }
    }
  }

  const centerEligible = HOUSE_PLACES.filter(place => place.centerEligible && base.eligibleIds.includes(place.id));
  const quickEligible = HOUSE_PLACES.filter(place => base.eligibleIds.includes(place.id));

  return <Context.Provider value={{ active, open: begin, message: isOpen ? '' : message }}>
    {children}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="house-arrange-title"
      onCancel={event => { event.preventDefault(); cancel(); }}>
      <div className={styles.panel}>
        <p className={styles.marker}>ARRANGE MY HOUSE</p>
        <h2 id="house-arrange-title">What would you like to keep close?</h2>
        <p className={styles.intro}>Placement changes distance, not permission or contents.</p>

        <fieldset disabled={busy} className={styles.choices}>
          <legend>Center · up to five</legend>
          <p className={styles.help}>These are the five large thresholds in the opening.</p>
          {centerEligible.map(place => {
            const index = draft.center.indexOf(place.id);
            return <div className={styles.choice} key={place.id}>
              <label><input type="checkbox" checked={index !== -1} aria-label={`Center: ${place.label}`}
                onChange={() => toggleCenter(place.id)} />
                <span className={styles.symbol} data-place={place.id} aria-hidden="true">{place.mark}</span>{place.label}</label>
              {index !== -1 && <span className={styles.reorder}>
                <button type="button" disabled={index === 0} aria-label={`Move ${place.label} center left`} onClick={() => move('center', place.id, -1)}>←</button>
                <button type="button" disabled={index === draft.center.length - 1} aria-label={`Move ${place.label} center right`} onClick={() => move('center', place.id, 1)}>→</button>
              </span>}
            </div>;
          })}
        </fieldset>

        {pendingCenter && <div ref={replaceRef} className={styles.replace} role="group" aria-label="Choose a center place to replace">
          <p>Center already has five places. Replace which one with <strong>{placeById(pendingCenter)?.label}</strong>?</p>
          <div>{draft.center.map(id => <button key={id} type="button" onClick={() => replaceCenter(id)}>{placeById(id)?.label}</button>)}</div>
          <button type="button" className={styles.quiet} onClick={() => { setPendingCenter(null); setMessage(''); }}>Keep center unchanged</button>
        </div>}

        <fieldset disabled={busy} className={styles.choices}>
          <legend>HERE · NOW</legend>
          <p className={styles.help}>Independent shortcuts. A place may also be in your Center.</p>
          {quickEligible.map(place => {
            const index = draft.shortcuts.indexOf(place.id);
            return <div className={styles.choice} key={place.id}>
              <label><input type="checkbox" checked={index !== -1} aria-label={`Here Now: ${place.label}`}
                onChange={() => toggleQuick(place.id)} />
                <span className={styles.symbol} data-place={place.id} aria-hidden="true">{place.mark}</span>{place.label}</label>
              {index !== -1 && <span className={styles.reorder}>
                <button type="button" disabled={index === 0} aria-label={`Move ${place.label} up`} onClick={() => move('shortcuts', place.id, -1)}>↑</button>
                <button type="button" disabled={index === draft.shortcuts.length - 1} aria-label={`Move ${place.label} down`} onClick={() => move('shortcuts', place.id, 1)}>↓</button>
              </span>}
            </div>;
          })}
        </fieldset>
        <DecisionAccessNotice available={base.eligibleIds.includes('decisions')} />

        <fieldset disabled={busy} className={styles.passing}>
          <legend>Passing through</legend>
          <label><input type="radio" name="house-passing" checked={draft.passingThrough === 'shared'}
            onChange={() => setDraft(current => ({ ...current, passingThrough:'shared' }))} />A passage from the shared reading shelf</label>
          <label><input type="radio" name="house-passing" checked={draft.passingThrough === 'quiet'}
            onChange={() => setDraft(current => ({ ...current, passingThrough:'quiet' }))} />Keep this part of the House quiet</label>
          <p>These are display choices, not permission to learn from your private material.</p>
        </fieldset>

        <div className={styles.restore}>
          <button type="button" className={styles.quiet} disabled={busy} onClick={() => setRestore(true)}>Restore House defaults</button>
          {restore && <div role="group" aria-label="Confirm restoring defaults">
            <p>Restore only House placement choices? Nothing you have written or kept will change. Save is still required.</p>
            <button type="button" disabled={busy} onClick={() => { setDraft(defaultHousePreferences(base.eligibleIds)); setRestore(false); }}>Use default arrangement</button>
            <button type="button" disabled={busy} onClick={() => setRestore(false)}>Keep my draft</button>
          </div>}
        </div>
        {isOpen && message && <p className={styles.message} role="status">{message}</p>}
        {conflict && <div className={styles.conflict}>
          <button type="button" disabled={busy} onClick={() => void reload(false, true)}>Reload saved choices</button>
          <button type="button" disabled={busy} onClick={() => void reload(true, true, true)}>Reload and keep my draft</button>
        </div>}
        {(pendingCenter || restore) && <p className={styles.saveHold} role="status">
          {pendingCenter
            ? 'Choose which Center place to replace, or keep the Center unchanged, before saving.'
            : 'Finish or cancel Restore defaults before saving.'}
        </p>}
        <div className={styles.actions}>
          <button type="button" disabled={saving} onClick={cancel}>Cancel</button>
          <button type="button" className={styles.save} disabled={busy || conflict || restore || !!pendingCenter}
            title={pendingCenter ? 'Choose a Center replacement first' : restore ? 'Finish Restore defaults first' : undefined}
            onClick={() => void save()}>{busy ? 'Please wait…' : pendingCenter ? 'Choose what to replace' : 'Save House choices'}</button>
        </div>
      </div>
    </dialog>
  </Context.Provider>;
}

export function HouseMemberControls({ name }: { name: string }) {
  const { active, open, message } = useHousePreferences();
  return <span className={`${house.member} ${styles.member}`}><span>{name}</span>
    <button type="button" className={styles.arrange} disabled={!active} onClick={() => open()}>Arrange my House</button>
    {message && <span className={styles.notice} role="status">{message}{!active && <> <Link href="/house">Reload House</Link></>}</span>}
  </span>;
}

export function HouseCenter() {
  const { active, open } = useHousePreferences();
  if (!active) return null;
  const places = visibleHouseCenter(active.preferences, active.eligibleIds);
  return <section className={house.worlds} aria-label="Your center">
    {places.map(place => <Link href={place.href} className={house.world} key={place.id} data-place={place.id}>
      <span className={`${house.worldMark} ${styles.placeMark}`} data-tone={place.tone} data-place={place.id} aria-hidden="true">{place.mark}</span>
      <strong>{place.label}</strong><small>{place.purpose}</small>
    </Link>)}
    {places.length < 5 && <button type="button" className={styles.centerEmpty} onClick={() => open()}>+ Choose a place</button>}
  </section>;
}

export function HouseQuickAccess() {
  const { active } = useHousePreferences();
  return <div className={house.quick}><p>HERE · NOW</p>
    {active ? visibleHouseShortcuts(active.preferences, active.eligibleIds).map(place =>
      <Link href={place.href} key={place.id} data-place={place.id} aria-label={place.label}>
        <span className={styles.symbol + ' ' + styles.quickMark} data-place={place.id} aria-hidden="true">{place.mark}</span>
        <span>{place.label}</span>
      </Link>)
      : <span className={styles.notice}>Reload House to confirm your choices.</span>}
    {active && <DecisionAccessNotice available={active.eligibleIds.includes('decisions')} />}
  </div>;
}

export function HouseDirectory() {
  const { active, open } = useHousePreferences();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const eligible = new Set(active?.eligibleIds ?? []);
  const matches = useMemo(() => HOUSE_PLACES.filter(place => !q || [place.label, place.purpose, ...place.aliases]
    .some(value => value.toLowerCase().includes(q))), [q]);
  return <section className={styles.directory} aria-label="All places">
    <div className={styles.directoryHead}>
      <div><p className={styles.marker}>ALL PLACES</p><h3>Find what you came for.</h3>
        <p>Plain access to the House. The deeper architecture remains underneath.</p></div>
      <label className={styles.search}>Find a tool or space
        <input type="search" value={query} onChange={event => setQuery(event.target.value)}
          placeholder="Decisions, journal, astrology…" /></label>
    </div>
    {HOUSE_GROUPS.map(group => {
      const items = matches.filter(place => place.group === group.id);
      if (!items.length) return null;
      return <div className={styles.directoryGroup} key={group.id}>
        <header><h4>{group.label}</h4><p>{group.line}</p></header>
        <div className={styles.directoryGrid}>{items.map(place => {
          const available = eligible.has(place.id);
          const inCenter = !!active?.preferences.center.includes(place.id);
          const inQuick = !!active?.preferences.shortcuts.includes(place.id);
          return <article className={styles.placeCard} key={place.id} data-place={place.id}>
            <span className={styles.catalogMark} data-tone={place.tone} aria-hidden="true">{place.mark}</span>
            <div><h5>{place.label}</h5><p>{place.purpose}</p></div>
            <div className={styles.placeActions}>
              {available ? <Link href={place.href}>Open</Link> : <Link href="/studio">Set up Studio</Link>}
              {available && place.centerEligible && <button type="button" onClick={() => open({placeId:place.id,target:'center'})}>{inCenter ? 'In center' : 'Show in center'}</button>}
              {available && <button type="button" onClick={() => open({placeId:place.id,target:'quick'})}>{inQuick ? 'In Here · Now' : 'Add to Here · Now'}</button>}
            </div>
          </article>;
        })}</div>
      </div>;
    })}
    {!matches.length && <p className={styles.noMatch}>No House place matches that search.</p>}
  </section>;
}

export function HousePassingThrough({ quote }: { quote: PassingQuote | null }) {
  const { active } = useHousePreferences();
  return active?.preferences.passingThrough === 'shared' ? <PassingThrough initialQuote={quote} /> : null;
}
