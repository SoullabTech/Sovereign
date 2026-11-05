'use client';

/**
 * ASTRO-PRO-CHART-SHARE-01 — the private client link for one saved chart.
 *
 * Keeping a chart (permission to hold the birth details) is not the same as
 * sharing it, so the first link asks the owner to confirm the person agreed to
 * have their chart shared by link. The link can be turned off at any time.
 */
import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import styles from './pro-saved-charts.module.css';

type State =
  | { kind: 'closed' }
  | { kind: 'loading' }
  | { kind: 'ask'; agreed: boolean }
  | { kind: 'live'; url: string; copied: boolean }
  | { kind: 'error'; message: string };

export default function ProChartShareAction({ chartId, label }: { chartId: string; label: string }) {
  const [state, setState] = useState<State>({ kind: 'closed' });
  const endpoint = `/api/astrology/pro/charts/${chartId}/share`;

  function live(path: string): State {
    return { kind: 'live', url: new URL(path, window.location.origin).toString(), copied: false };
  }

  async function open() {
    setState({ kind: 'loading' });
    try {
      const reply = await apiFetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (!reply.ok) throw new Error('unavailable');
      const data = await reply.json();
      setState(data?.share?.path ? live(data.share.path) : { kind: 'ask', agreed: false });
    } catch {
      setState({ kind: 'error', message: 'Sharing is unavailable right now.' });
    }
  }

  async function make() {
    setState({ kind: 'loading' });
    try {
      const reply = await apiFetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentAttested: true }),
      });
      if (!reply.ok) throw new Error('not_created');
      const data = await reply.json();
      setState(live(data.share.path));
    } catch {
      setState({ kind: 'error', message: 'The link could not be made. Please try again.' });
    }
  }

  async function turnOff() {
    setState({ kind: 'loading' });
    try {
      const reply = await apiFetch(endpoint, { method: 'DELETE' });
      if (!reply.ok) throw new Error('not_revoked');
      setState({ kind: 'closed' });
    } catch {
      setState({ kind: 'error', message: 'The link could not be turned off. Please try again.' });
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setState({ kind: 'live', url, copied: true });
    } catch { /* the link stays visible to copy by hand */ }
  }

  if (state.kind === 'closed') return <button type="button" onClick={() => void open()}>Share link</button>;
  if (state.kind === 'loading') return <span className={styles.shareBox} role="status">Working…</span>;
  if (state.kind === 'error') {
    return (
      <span className={styles.shareBox} role="alert">
        {state.message} <button type="button" onClick={() => setState({ kind: 'closed' })}>Close</button>
      </span>
    );
  }
  if (state.kind === 'ask') {
    return (
      <span className={styles.shareBox} role="group" aria-label={`Share ${label}’s chart`}>
        <span>A private link shows {label} this chart, view-only, with no account needed. You can turn it off any time.</span>
        <label>
          <input type="checkbox" checked={state.agreed} onChange={(e) => setState({ kind: 'ask', agreed: e.target.checked })} />
          {' '}{label} agreed to have their chart shared by link.
        </label>
        <span>
          <button type="button" disabled={!state.agreed} onClick={() => void make()}>Make link</button>
          <button type="button" onClick={() => setState({ kind: 'closed' })}>Cancel</button>
        </span>
      </span>
    );
  }
  return (
    <span className={styles.shareBox} role="group" aria-label={`Link to ${label}’s chart`}>
      <input readOnly value={state.url} onFocus={(e) => e.currentTarget.select()} aria-label="Private chart link" />
      <span>
        <button type="button" onClick={() => void copy(state.url)}>{state.copied ? 'Copied' : 'Copy'}</button>
        <a href={state.url} target="_blank" rel="noopener noreferrer">View</a>
        <button type="button" onClick={() => void turnOff()}>Turn off</button>
        <button type="button" onClick={() => setState({ kind: 'closed' })}>Close</button>
      </span>
    </span>
  );
}
