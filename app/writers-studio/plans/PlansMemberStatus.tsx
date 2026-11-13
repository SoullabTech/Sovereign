'use client';

/**
 * The member's own standing on the plans page, and the one way to ask for Pro (steps C1 + C4).
 *
 * Founder rulings 2026-11-13: "Ask about Pro", no price, answered personally; declining costs nothing; no follow-up
 * sequence. Beta writers see that Pro is included in their beta, with its end date when it has one (#1800 rulings).
 * Reads only the member's own standing; shows nothing it cannot confirm (an unknown answer shows nothing).
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import styles from './plans.module.css';

type Standing =
  | { kind: 'unknown' }
  | { kind: 'beta'; until: string | null }
  | { kind: 'free'; askOpen: boolean; asked: boolean };

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

export function PlansMemberStatus() {
  const [standing, setStanding] = useState<Standing>({ kind: 'unknown' });
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const access = await apiFetch('/api/sovereign/writers-studio/beta-access', { cache: 'no-store' });
        const body = (await access.json().catch(() => ({}))) as Record<string, unknown>;
        if (!live || !access.ok) return;
        if (body.eligible === true) {
          setStanding({ kind: 'beta', until: typeof body.expiresAt === 'string' ? body.expiresAt : null });
          return;
        }
        const ask = await apiFetch('/api/sovereign/writers-studio/pro-request', { cache: 'no-store' });
        const askBody = (await ask.json().catch(() => ({}))) as { asked?: unknown };
        if (!live) return;
        setStanding({ kind: 'free', askOpen: ask.ok, asked: ask.ok && askBody.asked === true });
      } catch { /* unknown: show nothing */ }
    })();
    return () => { live = false; };
  }, []);

  async function askAboutPro() {
    setSending(true);
    setError(null);
    try {
      const res = await apiFetch('/api/sovereign/writers-studio/pro-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(note.trim() ? { note: note.trim() } : {}),
      });
      if (res.ok) setStanding({ kind: 'free', askOpen: true, asked: true });
      else setError('Your request could not be recorded just now. Please try again.');
    } catch {
      setError('Your request could not be recorded just now. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (standing.kind === 'unknown') return null;

  if (standing.kind === 'beta') {
    return (
      <section className={styles.standing} aria-label="Your plan">
        <p className={styles.kicker}>Your plan</p>
        <p>
          Pro is included in your beta{standing.until ? ` until ${formatDate(standing.until)}` : ''}. When it ends, every
          Work stays yours, and you keep writing on Free.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.standing} aria-label="Your plan">
      <p className={styles.kicker}>Your plan · Free</p>
      {standing.asked ? (
        <p role="status">Thank you for asking about Pro. We answer each request personally.</p>
      ) : standing.askOpen ? (
        <>
          <p>Pro isn’t for sale yet. If you’d like it, ask — we answer each request personally. Nothing changes until you hear from us.</p>
          <label className={styles.noteLabel} htmlFor="pro-note">Anything you’d like us to know (optional)</label>
          <textarea id="pro-note" className={styles.note} maxLength={500} rows={2} value={note}
            onChange={(e) => setNote(e.target.value)} />
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="button" className={styles.ask} onClick={askAboutPro} disabled={sending}>
            {sending ? 'Sending…' : 'Ask about Pro'}
          </button>
        </>
      ) : (
        <p>Pro isn’t open yet.</p>
      )}
    </section>
  );
}
