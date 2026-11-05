'use client';

/**
 * ASTRO-PRO-CHART-SHARE-01 — the private client link for one saved chart.
 *
 * Keeping a chart (permission to hold the birth details) is not the same as
 * sharing it, so the first link asks the owner to confirm the person agreed to
 * have their chart shared by link. The link can be turned off at any time.
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import styles from './pro-saved-charts.module.css';

type State =
  | { kind: 'loading' }
  | { kind: 'ask'; agreed: boolean; elemental: boolean }
  | { kind: 'live'; url: string; copied: boolean; elemental: boolean }
  | { kind: 'error'; message: string };

/** Opened from a chart's "Share link" button; shown on its own row under the chart. */
export default function ProChartSharePanel({ chartId, label, onClose }: {
  chartId: string; label: string; onClose: () => void;
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const endpoint = `/api/astrology/pro/charts/${chartId}/share`;

  function live(share: { path: string; includeElemental?: boolean }): State {
    return {
      kind: 'live', url: new URL(share.path, window.location.origin).toString(),
      copied: false, elemental: share.includeElemental === true,
    };
  }

  useEffect(() => { void open(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function open() {
    try {
      const reply = await apiFetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (!reply.ok) throw new Error('unavailable');
      const data = await reply.json();
      setState(data?.share?.path ? live(data.share) : { kind: 'ask', agreed: false, elemental: false });
    } catch {
      setState({ kind: 'error', message: 'Sharing is unavailable right now.' });
    }
  }

  async function make(elemental: boolean) {
    setState({ kind: 'loading' });
    try {
      const reply = await apiFetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentAttested: true, includeElemental: elemental }),
      });
      if (!reply.ok) throw new Error('not_created');
      const data = await reply.json();
      setState(live(data.share));
    } catch {
      setState({ kind: 'error', message: 'The link could not be made. Please try again.' });
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

  async function setElemental(url: string, elemental: boolean) {
    try {
      const reply = await apiFetch(endpoint, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeElemental: elemental }),
      });
      if (!reply.ok) throw new Error('not_updated');
      setState({ kind: 'live', url, copied: false, elemental });
    } catch {
      setState({ kind: 'error', message: 'The link could not be changed. Please try again.' });
    }
  }

  async function copy(url: string, elemental: boolean) {
    try {
      await navigator.clipboard.writeText(url);
      setState({ kind: 'live', url, copied: true, elemental });
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
          <input type="checkbox" checked={state.agreed}
            onChange={(e) => setState({ ...state, agreed: e.target.checked })} />
          {' '}{label} agreed to have their chart shared by link.
        </label>
        <label>
          <input type="checkbox" checked={state.elemental}
            onChange={(e) => setState({ ...state, elemental: e.target.checked })} />
          {' '}Include the Elemental Alchemy overview.
        </label>
        <span>
          <button type="button" disabled={!state.agreed} onClick={() => void make(state.elemental)}>Make link</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </span>
      </span>
    );
  }
  return (
    <span className={styles.shareBox} role="group" aria-label={`Link to ${label}’s chart`}>
      <input readOnly value={state.url} onFocus={(e) => e.currentTarget.select()} aria-label="Private chart link" />
      <label>
        <input type="checkbox" checked={state.elemental}
          onChange={(e) => void setElemental(state.url, e.target.checked)} />
        {' '}Include the Elemental Alchemy overview.
      </label>
      <span>
        <button type="button" onClick={() => void copy(state.url, state.elemental)}>{state.copied ? 'Copied' : 'Copy'}</button>
        <a href={state.url} target="_blank" rel="noopener noreferrer">View</a>
        <button type="button" onClick={() => void turnOff()}>Turn off</button>
        <button type="button" onClick={onClose}>Close</button>
      </span>
    </span>
  );
}
