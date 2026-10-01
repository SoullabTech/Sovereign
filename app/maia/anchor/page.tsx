'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HouseRoomThreshold } from '@/components/house/HouseRoomThreshold';
import { cabinReturnPath, isCabinOrigin } from '@/lib/cabin/doorway';
import { apiFetch } from '@/lib/http/apiBase';
import { todayISODate } from '@/lib/maia/dailyAnchor';
import styles from './anchor-room.module.css';
import { FacetCarryNotice, type FacetCarryRef } from '@/components/house/FacetCarryNotice';
import { FacetOriginTrail } from '@/components/house/FacetOriginTrail';

function dayLabel(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-').map(Number);
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function clockLabel(value: Date | string | null): string {
  if (!value) return '';
  const dt = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function daypart(value: Date): string {
  const hour = value.getHours();
  if (hour < 5) return 'Late tonight';
  if (hour < 12) return 'This morning';
  if (hour < 17) return 'This afternoon';
  if (hour < 22) return 'Tonight';
  return 'Late tonight';
}

function heldPhrase(value: string | null): string {
  if (!value) return 'Held for today';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return 'Held for today';
  const hour = dt.getHours();
  const part = hour < 5 ? 'late tonight' : hour < 12 ? 'this morning' : hour < 17 ? 'this afternoon' : 'tonight';
  return 'Held ' + part + ' · ' + clockLabel(dt);
}

function wasRevisited(createdAt: string | null, updatedAt: string | null): boolean {
  if (!createdAt || !updatedAt) return false;
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  return Number.isFinite(created) && Number.isFinite(updated) && updated - created > 60000;
}

interface YesterdayAnchor {
  date: string;
  prompt: string;
  response: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function AnchorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCabin = isCabinOrigin(searchParams);
  const fromHouse = searchParams?.get('from') === 'house';
  const returnTarget = fromCabin ? cabinReturnPath() : fromHouse ? '/house' : '/maia';
  const returnLabel = fromCabin ? 'Return to Cabin →' : fromHouse ? 'Return to House →' : 'Return to MAIA →';
  const sourceFacet = searchParams?.get('sourceFacet');
  const sourceRefId = searchParams?.get('sourceRefId');
  const crossingId = searchParams?.get('crossingId');
  const carrySourceRef: FacetCarryRef | null =
    (sourceFacet === 'changes' || sourceFacet === 'decisions' || sourceFacet === 'reflections' || sourceFacet === 'dream') && sourceRefId && crossingId
      ? { sourceFacet, sourceRefId, crossingId }
      : null;
  const [arrivedAt] = useState(() => new Date());
  const [date, setDate] = useState('');
  const [prompt, setPrompt] = useState('');
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [carrySourceReady, setCarrySourceReady] = useState<boolean | null>(
    carrySourceRef ? null : true,
  );
  const [carryApplied, setCarryApplied] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showYesterday, setShowYesterday] = useState(false);
  const [yesterday, setYesterday] = useState<YesterdayAnchor | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const iso = todayISODate();
    setDate(iso);
    void (async () => {
      try {
        const res = await apiFetch('/api/anchor/today?date=' + encodeURIComponent(iso), { method: 'GET' });
        if (!res.ok) throw new Error('anchor');
        const data = await res.json();
        setPrompt(data.prompt || '');
        setAnchorId(typeof data.anchorId === 'string' ? data.anchorId : null);
        setCreatedAt(typeof data.createdAt === 'string' ? data.createdAt : null);
        setUpdatedAt(typeof data.updatedAt === 'string' ? data.updatedAt : null);
        if (typeof data.response === 'string' && data.response.length > 0) {
          setResponse(data.response);
          setSaved(true);
        }
      } catch {
        setError('This daily place could not open just now.');
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!editing && saved) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, 150) + 'px';
  }, [response, editing, saved]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const onHold = useCallback(async () => {
    const trimmed = response.trim();
    if (!trimmed || busy || (carrySourceRef && carrySourceReady !== true)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/anchor/today', {
        method: 'POST',
        body: JSON.stringify({
          date,
          response: trimmed,
          sourceRef: carrySourceRef ?? undefined,
        }),
      });
      if (!res.ok) throw new Error('anchor');
      const data = await res.json().catch(() => ({}));
      setResponse(trimmed);
      setAnchorId(typeof data.anchorId === 'string' ? data.anchorId : anchorId);
      setCreatedAt(typeof data.createdAt === 'string' ? data.createdAt : createdAt);
      setUpdatedAt(typeof data.updatedAt === 'string' ? data.updatedAt : updatedAt);
      setSaved(true);
      setEditing(false);
      if (carrySourceRef) setCarryApplied(true);
    } catch {
      setError('That did not save. Your words are still here.');
    } finally {
      setBusy(false);
    }
  }, [date, response, busy, createdAt, updatedAt, anchorId, carrySourceRef, carrySourceReady]);

  const onToggleYesterday = useCallback(async () => {
    if (yesterday !== null) {
      setShowYesterday((state) => !state);
      return;
    }
    const value = new Date();
    value.setDate(value.getDate() - 1);
    const yIso = [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-');

    try {
      const res = await apiFetch('/api/anchor/today?date=' + encodeURIComponent(yIso), { method: 'GET' });
      if (!res.ok) throw new Error('yesterday');
      const data = await res.json();
      setYesterday({
        date: yIso,
        prompt: data.prompt || '',
        response: typeof data.response === 'string' ? data.response : '',
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : null,
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
      });
    } catch {
      setYesterday({ date: yIso, prompt: '', response: '', createdAt: null, updatedAt: null });
    }
    setShowYesterday(true);
  }, [yesterday]);

  const showEditor = !saved || editing;
  const revisited = wasRevisited(createdAt, updatedAt);

  return (
    <main className={styles.page}>
      <HouseRoomThreshold room="DAILY ANCHOR" />

      <section className={styles.room} aria-labelledby="daily-anchor-heading">
        <header className={styles.arrival}>
          <div className={styles.temporal}>
            <p>DAILY ANCHOR</p>
            <time dateTime={date || undefined}>{dayLabel(date)}</time>
            <span>{daypart(arrivedAt)} · {clockLabel(arrivedAt)}</span>
          </div>
          <p className={styles.orientation}>
            One small place to return to yourself. No streak. No score. Nothing to complete.
          </p>
        </header>

        {busy && !prompt ? (
          <div className={styles.loading} aria-label="Opening today's anchor"><span /></div>
        ) : !prompt ? (
          <div className={styles.unavailable}>
            <p>{error || 'This daily place could not open just now.'}</p>
            <button type="button" onClick={() => router.push(returnTarget)}>{returnLabel}</button>
          </div>
        ) : showEditor ? (
          <section className={styles.practice}>
            <p className={styles.daypart}>{daypart(arrivedAt)}</p>
            <h1 id="daily-anchor-heading">{prompt}</h1>

            {carrySourceRef ? (
              <div className="mt-9 mb-2 max-w-2xl">
                <FacetCarryNotice
                  targetFacet="anchor"
                  sourceRef={carrySourceRef}
                  onResolved={(source) => setCarrySourceReady(Boolean(source))}
                />
              </div>
            ) : null}

            <textarea
              ref={textareaRef}
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              aria-label="Your anchor for today"
              placeholder="A few words are enough."
              rows={5}
            />

            <div className={styles.keepRow}>
              <button
                type="button"
                className={styles.keep}
                disabled={
                  busy ||
                  response.trim().length === 0 ||
                  (carrySourceRef ? carrySourceReady !== true : false)
                }
                onClick={() => void onHold()}
              >
                {busy ? 'Keeping…' : 'Keep this with me today'}
              </button>
              {saved && editing ? (
                <button type="button" className={styles.quietAction} onClick={() => setEditing(false)}>
                  Leave it as it was
                </button>
              ) : null}
            </div>

            {error ? <p className={styles.error} role="alert">{error}</p> : null}
          </section>
        ) : (
          <section className={styles.held}>
            <p className={styles.heldLabel}>YOUR ANCHOR TODAY</p>
            <p className={styles.heldPrompt}>{prompt}</p>
            <blockquote>{response}</blockquote>

            {carrySourceRef && !carryApplied ? (
              <div className="mt-8 max-w-2xl">
                <FacetCarryNotice
                  targetFacet="anchor"
                  sourceRef={carrySourceRef}
                  onResolved={(source) => setCarrySourceReady(Boolean(source))}
                />
              </div>
            ) : null}

            {anchorId ? (
              <FacetOriginTrail
                targetFacet="anchor"
                targetRefId={anchorId}
                className="mt-8 max-w-2xl"
              />
            ) : null}

            <div className={styles.heldMeta}>
              <span>{heldPhrase(createdAt)}</span>
              {revisited && updatedAt ? <span>Revisited · {clockLabel(updatedAt)}</span> : null}
            </div>
            <button type="button" className={styles.revisit} onClick={() => setEditing(true)}>
              Revisit this
            </button>
          </section>
        )}

        <section className={styles.continuity} aria-label="Daily Anchor continuity">
          <div className={styles.continuityHead}>
            <button type="button" onClick={() => void onToggleYesterday()}>
              {showYesterday ? 'Hide yesterday' : 'Yesterday'}
            </button>
            <button type="button" onClick={() => router.push(fromCabin ? '/maia/anchor/history?from=cabin' : '/maia/anchor/history')}>
              Earlier anchors →
            </button>
          </div>

          {showYesterday && yesterday ? (
            <article className={styles.yesterday}>
              <div>
                <p>YESTERDAY</p>
                <time dateTime={yesterday.date}>{dayLabel(yesterday.date)}</time>
              </div>
              {yesterday.response ? (
                <>
                  <p className={styles.yesterdayPrompt}>{yesterday.prompt}</p>
                  <blockquote>{yesterday.response}</blockquote>
                  {yesterday.createdAt ? <span>{heldPhrase(yesterday.createdAt)}</span> : null}
                </>
              ) : (
                <p className={styles.noYesterday}>Nothing was held yesterday.</p>
              )}
            </article>
          ) : null}
        </section>

        <footer className={styles.footer}>
          <span>One thread is enough.</span>
          <button type="button" onClick={() => router.push(returnTarget)}>
            {returnLabel}
          </button>
        </footer>
      </section>
    </main>
  );
}
