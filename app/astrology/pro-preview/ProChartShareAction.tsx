'use client';

/**
 * ASTRO-PRO-CHART-SHARE-01 — the private client link for one saved chart.
 *
 * Keeping a chart (permission to hold the birth details) is not the same as
 * sharing it, so the first link asks the owner to confirm the person agreed to
 * have their chart shared by link. The owner chooses what the link adds — the
 * Elemental Alchemy overview, and Ask MAIA (optionally "offered by" a name) —
 * and can change either, or turn the link off, at any time.
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import styles from './pro-saved-charts.module.css';

interface Options { elemental: boolean; ask: boolean; offeredBy: string }

type State =
  | { kind: 'loading' }
  | { kind: 'ask'; agreed: boolean; options: Options }
  | { kind: 'live'; url: string; copied: boolean; options: Options; saved: Options; used: number; limit: number }
  | { kind: 'error'; message: string };

const NO_OPTIONS: Options = { elemental: false, ask: false, offeredBy: '' };

function payload(o: Options) {
  return { includeElemental: o.elemental, includeAskMaia: o.ask, askMaiaOfferedBy: o.offeredBy.trim() || null };
}

function same(a: Options, b: Options) {
  return a.elemental === b.elemental && a.ask === b.ask && a.offeredBy.trim() === b.offeredBy.trim();
}

function OptionFields({ label, options, onChange }: { label: string; options: Options; onChange: (o: Options) => void }) {
  return (
    <>
      <label>
        <input type="checkbox" checked={options.elemental} onChange={(e) => onChange({ ...options, elemental: e.target.checked })} />
        {' '}Include the Elemental Alchemy overview.
      </label>
      <label>
        <input type="checkbox" checked={options.ask} onChange={(e) => onChange({ ...options, ask: e.target.checked })} />
        {' '}Let {label} ask MAIA about this chart. MAIA answers from this chart only, as MAIA, and keeps nothing.
      </label>
      {options.ask && (
        <label className={styles.offeredBy}>
          Offered by (optional — your name or practice)
          <input value={options.offeredBy} maxLength={80} placeholder="e.g. Your practice name"
            onChange={(e) => onChange({ ...options, offeredBy: e.target.value })} />
        </label>
      )}
    </>
  );
}

/** Opened from a chart's "Share link" button; shown on its own row under the chart. */
export default function ProChartSharePanel({ chartId, label, onClose }: {
  chartId: string; label: string; onClose: () => void;
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const endpoint = `/api/astrology/pro/charts/${chartId}/share`;

  function live(share: {
    path: string; includeElemental?: boolean; includeAskMaia?: boolean; askMaiaOfferedBy?: string | null;
    askMaiaQuestions?: number; askMaiaLimit?: number;
  }): State {
    const options = { elemental: share.includeElemental === true, ask: share.includeAskMaia === true, offeredBy: share.askMaiaOfferedBy ?? '' };
    return {
      kind: 'live', url: new URL(share.path, window.location.origin).toString(), copied: false,
      options, saved: options, used: share.askMaiaQuestions ?? 0, limit: share.askMaiaLimit ?? 0,
    };
  }

  useEffect(() => { void open(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function open() {
    try {
      const reply = await apiFetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (!reply.ok) throw new Error('unavailable');
      const data = await reply.json();
      setState(data?.share?.path ? live(data.share) : { kind: 'ask', agreed: false, options: NO_OPTIONS });
    } catch {
      setState({ kind: 'error', message: 'Sharing is unavailable right now.' });
    }
  }

  async function make(options: Options) {
    setState({ kind: 'loading' });
    try {
      const reply = await apiFetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentAttested: true, ...payload(options) }),
      });
      if (!reply.ok) throw new Error('not_created');
      setState(live((await reply.json()).share));
    } catch {
      setState({ kind: 'error', message: 'The link could not be made. Please try again.' });
    }
  }

  async function save(options: Options) {
    try {
      const reply = await apiFetch(endpoint, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(options)),
      });
      if (!reply.ok) throw new Error('not_updated');
      setState(live((await reply.json()).share));
    } catch {
      setState({ kind: 'error', message: 'The link could not be changed. Please try again.' });
    }
  }

  async function turnOff() {
    setState({ kind: 'loading' });
    try {
      const reply = await apiFetch(endpoint, { method: 'DELETE' });
      if (!reply.ok) throw new Error('not_revoked');
      onClose();
    } catch {
      setState({ kind: 'error', message: 'The link could not be turned off. Please try again.' });
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setState((s) => (s.kind === 'live' ? { ...s, copied: true } : s));
    } catch { /* the link stays visible to copy by hand */ }
  }

  if (state.kind === 'loading') return <span className={styles.shareBox} role="status">Working…</span>;
  if (state.kind === 'error') {
    return (
      <span className={styles.shareBox} role="alert">
        {state.message} <button type="button" onClick={onClose}>Close</button>
      </span>
    );
  }
  if (state.kind === 'ask') {
    return (
      <span className={styles.shareBox} role="group" aria-label={`Share ${label}’s chart`}>
        <span>A private link shows {label} this chart and its transits, view-only, with no account needed. You can turn it off any time.</span>
        <label>
          <input type="checkbox" checked={state.agreed} onChange={(e) => setState({ ...state, agreed: e.target.checked })} />
          {' '}{label} agreed to have their chart shared by link.
        </label>
        <OptionFields label={label} options={state.options} onChange={(options) => setState({ ...state, options })} />
        <span>
          <button type="button" disabled={!state.agreed} onClick={() => void make(state.options)}>Make link</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </span>
      </span>
    );
  }
  const dirty = !same(state.options, state.saved);
  return (
    <span className={styles.shareBox} role="group" aria-label={`Link to ${label}’s chart`}>
      <input readOnly value={state.url} onFocus={(e) => e.currentTarget.select()} aria-label="Private chart link" />
      <OptionFields label={label} options={state.options} onChange={(options) => setState({ ...state, options })} />
      {state.saved.ask && <small>Ask MAIA: {state.used} of {state.limit} questions used.</small>}
      <span>
        {dirty && <button type="button" onClick={() => void save(state.options)}>Save changes</button>}
        <button type="button" onClick={() => void copy(state.url)}>{state.copied ? 'Copied' : 'Copy'}</button>
        <a href={state.url} target="_blank" rel="noopener noreferrer">View</a>
        <button type="button" onClick={() => void turnOff()}>Turn off</button>
        <button type="button" onClick={onClose}>Close</button>
      </span>
    </span>
  );
}
