'use client';

/**
 * What is alive now — the current sky meeting this natal chart.
 *
 * JARVIS-ASTROLOGY-SOUL-JOURNEY-01 · T1 (field) · T2 (Major / Minor / All)
 * · T3 (whole-chart + human expression) · T4 (field + activation timelines)
 * · T5 (bidirectional wheel link) · T6 (member-authored Reflection).
 *
 * Layering is the law of this surface:
 *   calculated geometry  →  symbolic tradition  →  member meaning
 * Calculated facts come only from lib/astrology/transitField.ts. The symbolic
 * layer is labelled as tradition and phrased as possibility. Nothing here is
 * sent to MAIA except by the member's explicit gesture.
 */

import { useEffect, useMemo, useState } from 'react';
import { apiFetch, apiUrl } from '@/lib/http/apiBase';
// Type-only: the ephemeris engine stays on the server.
import type { NatalPointInput, TransitActivation, TransitField } from '@/lib/astrology/transitField';
import {
  fieldContextLines,
  fieldTimelineRange,
  natalWebLinks,
  possibleHumanExpressions,
  transitTradition,
  type NatalAspectInput,
} from '@/lib/astrology/transitJourney';
import styles from './what-is-alive-now.module.css';

type Lens = 'major' | 'minor' | 'all';

const GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃',
  Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', Ascendant: 'AC', Midheaven: 'MC',
};

/** Degrees → `0°24′` (mirrors formatOrb in lib/astrology/transitField.ts). */
function formatOrb(deg: number): string {
  let d = Math.floor(deg);
  let m = Math.round((deg - d) * 60);
  if (m === 60) { d += 1; m = 0; }
  return `${d}°${String(m).padStart(2, '0')}′`;
}

function shortDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function describeWindow(a: TransitActivation): string {
  const { windowStart, windowEnd, openStart, openEnd } = a.timing;
  const start = openStart ? 'before this view' : shortDate(windowStart);
  const end = openEnd ? 'beyond this view' : shortDate(windowEnd);
  return `active ${start} – ${end}`;
}

function describeExact(a: TransitActivation): string {
  if (a.deviation <= 1 / 60) return 'Exact now';
  if (a.timing.nextExact) return `Exact ${shortDate(a.timing.nextExact)}`;
  if (a.timing.lastExact) return `Was exact ${shortDate(a.timing.lastExact)}`;
  return 'Comes close without perfecting';
}

function contactLabel(a: TransitActivation): string {
  return `${a.transiting.body} ${a.aspect.symbol} natal ${a.natal.point}`;
}

function phaseOf(a: TransitActivation): string {
  if (a.deviation <= 1 / 60) return 'exact';
  if (a.motion === 'applying') return a.deviation <= 1 ? 'intensifying' : 'entering';
  return a.deviation <= 1 ? 'separating' : 'completing';
}

export interface WhatIsAliveNowProps {
  natal: NatalPointInput[];
  natalAspects?: NatalAspectInput[];
  /** Opens a wheel-selected contact back inside this field. */
  focusActivationId?: string | null;
  /** Present only for an authenticated member who can keep their own words. */
  reflectionContext?: {
    zodiacMode: 'tropical' | 'sidereal';
    houseSystem: string;
    ayanamsa?: string | null;
  };
  /** Verified activations, lifted so the House Wheel can draw the same field. */
  onField?: (field: TransitField | null) => void;
  /** Member asks to see an activation on the wheel. */
  onShowOnWheel?: (activation: TransitActivation) => void;
  /** Member explicitly brings this activation into a MAIA conversation. */
  onBringToMaia?: (text: string) => void;
}

export function WhatIsAliveNow({
  natal,
  natalAspects = [],
  focusActivationId = null,
  reflectionContext,
  onField,
  onShowOnWheel,
  onBringToMaia,
}: WhatIsAliveNowProps) {
  const [field, setField] = useState<TransitField | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lens, setLens] = useState<Lens | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const natalKey = useMemo(() => JSON.stringify(natal), [natal]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    fetch(apiUrl('/api/astrology/transit-field'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: natalKey.length > 2 ? JSON.stringify({ natal: JSON.parse(natalKey) }) : '{}',
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => {
        if (cancelled) return;
        if (!json?.success || !json.field) throw new Error('no field');
        setField(json.field);
        setStatus('ready');
        onField?.(json.field);
      })
      .catch(() => {
        if (cancelled) return;
        setField(null);
        setStatus('error');
        onField?.(null);
      });
    return () => { cancelled = true; };
    // onField is a parent callback; re-run only when the natal input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natalKey]);

  const activations = useMemo(() => field?.activations ?? [], [field]);
  const strongest = activations.slice(0, 4);
  const listed = lens ? activations.filter((a) => lens === 'all' || a.scale === lens) : [];
  const selected = activations.find((a) => a.id === selectedId) ?? null;

  useEffect(() => {
    if (!focusActivationId || !activations.some((a) => a.id === focusActivationId)) return;
    const frame = requestAnimationFrame(() => {
      setSelectedId(focusActivationId);
      document.getElementById('alive-now-deepening')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusActivationId, activations]);

  function open(a: TransitActivation) {
    setSelectedId(a.id);
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        document.getElementById('alive-now-deepening')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  return (
    <section className={styles.field} aria-label="What is alive now">
      <div className={styles.paper}>
        <header className={styles.head}>
          <div>
            <small>CURRENT SKY{field ? ' · ' + longDate(field.calculatedAt).toUpperCase() : ''}</small>
            <h2>What is alive now</h2>
          </div>
          <p>
            The current sky meeting your natal field. A temporal aperture — activation, not destiny.
          </p>
        </header>

        {status === 'loading' ? (
          <p className={styles.status}>Calculating which bodies are contacting your chart…</p>
        ) : status === 'error' ? (
          <p className={styles.status}>The current sky could not be calculated just now. Nothing is inferred in its place.</p>
        ) : activations.length === 0 ? (
          <p className={styles.status}>
            No body in the current sky is within orb of your admitted natal points today. That, too, is a calculated fact.
          </p>
        ) : (
          <>
            <div className={styles.sectionLabel}>
              <span>STRONGEST ACTIVATIONS TODAY</span>
              <em>{field?.orderingRule}</em>
            </div>
            <ul className={styles.rows}>
              {strongest.map((a) => (
                <ActivationRow key={a.id} a={a} selected={a.id === selectedId} onOpen={() => open(a)} />
              ))}
            </ul>

            {field ? <FieldTimeline field={field} onOpen={open} /> : null}

            <div className={styles.lenses} role="group" aria-label="Transit lens">
              <LensButton
                active={lens === 'major'}
                onClick={() => setLens(lens === 'major' ? null : 'major')}
                title="Major transits"
                count={field?.counts.major ?? 0}
                note="Slower bodies — longer developmental arcs"
              />
              <LensButton
                active={lens === 'minor'}
                onClick={() => setLens(lens === 'minor' ? null : 'minor')}
                title="Minor transits"
                count={field?.counts.minor ?? 0}
                note="Faster bodies — shorter, subtler movements"
              />
              <LensButton
                active={lens === 'all'}
                onClick={() => setLens(lens === 'all' ? null : 'all')}
                title="Whole field"
                count={field?.counts.all ?? 0}
                note="Every calculated contact"
              />
            </div>

            {lens ? (
              listed.length ? (
                <ul className={styles.rows}>
                  {listed.map((a) => (
                    <ActivationRow key={a.id} a={a} selected={a.id === selectedId} onOpen={() => open(a)} />
                  ))}
                </ul>
              ) : (
                <p className={styles.status}>No {lens} contacts are within orb today.</p>
              )
            ) : null}

            {selected && field ? (
              <Deepening
                key={selected.id}
                a={selected}
                field={field}
                natalAspects={natalAspects}
                reflectionContext={reflectionContext}
                onClose={() => setSelectedId(null)}
                onShowOnWheel={onShowOnWheel}
                onBringToMaia={onBringToMaia}
              />
            ) : null}
          </>
        )}

        {field ? (
          <details className={styles.method}>
            <summary>How this field is calculated</summary>
            <p>
              Positions are calculated from a full ephemeris ({field.frame}). A contact is listed when a body is within
              its orb of an exact Ptolemaic aspect to one of your natal planets, Ascendant or Midheaven. Timing is
              searched in the ephemeris and stated to the day.
            </p>
            <table>
              <thead><tr><th>Body</th><th>Scale</th><th>Orb</th><th>Sextile</th></tr></thead>
              <tbody>
                {field.orbTable.map((row) => (
                  <tr key={row.body}>
                    <td>{row.body}</td>
                    <td>{row.scale}</td>
                    <td>{row.orb}°</td>
                    <td>{row.sextileOrb}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {field.excluded.map((item) => (
              <p key={item.point}><b>Held out — {item.point}.</b> {item.reason}</p>
            ))}
          </details>
        ) : null}
      </div>
    </section>
  );
}

function LensButton(props: { active: boolean; onClick: () => void; title: string; count: number; note: string }) {
  return (
    <button
      type="button"
      aria-pressed={props.active}
      className={props.active ? styles.lensActive : styles.lens}
      onClick={props.onClick}
    >
      <small>{props.title.toUpperCase()}</small>
      <b>{props.count} active</b>
      <span>{props.note}</span>
    </button>
  );
}

function ActivationRow({ a, selected, onOpen }: { a: TransitActivation; selected: boolean; onOpen: () => void }) {
  return (
    <li className={selected ? styles.rowSelected : styles.row}>
      <div className={styles.rowContact}>
        <span className={styles.glyph} aria-hidden="true">{GLYPHS[a.transiting.body]}</span>
        <div>
          <strong>{a.transiting.body} {a.aspect.name} natal {a.natal.point}</strong>
          <small>{a.transiting.sign} {a.transiting.degree.toFixed(1)}°{a.transiting.retrograde ? ' ℞' : ''} → {a.natal.sign} {a.natal.degree.toFixed(1)}°</small>
        </div>
      </div>
      <div className={styles.rowOrb}>
        <strong>{formatOrb(a.deviation)}</strong>
        <small>{a.deviation <= 1 / 60 ? 'exact' : a.motion}</small>
      </div>
      <div className={styles.rowTime}>
        <strong>{describeExact(a)}</strong>
        <small>{describeWindow(a)}</small>
      </div>
      <div className={styles.rowScale}>
        <span className={a.scale === 'major' ? styles.tagMajor : styles.tagMinor}>{a.scale}</span>
      </div>
      <button type="button" className={styles.explore} onClick={onOpen} aria-label={`Explore ${contactLabel(a)}`}>
        Explore →
      </button>
    </li>
  );
}

function FieldTimeline({ field, onOpen }: { field: TransitField; onOpen: (a: TransitActivation) => void }) {
  const now = Date.parse(field.calculatedAt);
  const range = fieldTimelineRange(field.activations, now);
  const span = Math.max(range.end - range.start, 1);
  const pct = (t: number) => `${Math.max(0, Math.min(100, ((t - range.start) / span) * 100)).toFixed(2)}%`;

  return (
    <section className={styles.fieldTimeline} aria-label="Whole transit field timeline">
      <div className={styles.fieldTimelineHead}>
        <div>
          <small>WHOLE FIELD IN TIME</small>
          <h3>Different clocks, one present moment</h3>
        </div>
        <p>Each band is the calculated activation window. Dots mark exact passes or closest approaches.</p>
      </div>
      <div className={styles.fieldTimelineRows}>
        {field.activations.map((a) => {
          const start = a.timing.windowStart ? Date.parse(a.timing.windowStart) : range.start;
          const end = a.timing.windowEnd ? Date.parse(a.timing.windowEnd) : range.end;
          return (
            <button type="button" key={a.id} className={styles.fieldTimelineRow} onClick={() => onOpen(a)}>
              <span className={styles.fieldTimelineLabel}>
                <b>{a.transiting.body}</b>
                <em>{a.aspect.symbol} {a.natal.point}</em>
              </span>
              <span className={styles.fieldTimelineTrack}>
                <span
                  className={styles.fieldTimelineWindow}
                  style={{ left: pct(start), right: `${(100 - parseFloat(pct(end))).toFixed(2)}%` }}
                />
                {a.timing.passes.map((pass) => (
                  <span
                    key={pass.at}
                    className={pass.perfects ? styles.fieldTimelinePass : styles.fieldTimelineNearPass}
                    style={{ left: pct(Date.parse(pass.at)) }}
                    title={(pass.perfects ? 'Exact ' : 'Closest approach ') + longDate(pass.at)}
                  />
                ))}
                <span className={styles.fieldTimelineToday} style={{ left: pct(now) }} />
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.fieldTimelineRange}>
        <span>{range.clippedStart ? 'earlier ←' : shortDate(new Date(range.start).toISOString())}</span>
        <b>today</b>
        <span>{range.clippedEnd ? '→ later' : shortDate(new Date(range.end).toISOString())}</span>
      </div>
    </section>
  );
}

function Timeline({ a, nowIso }: { a: TransitActivation; nowIso: string }) {
  const now = Date.parse(nowIso);
  const startMs = a.timing.windowStart ? Date.parse(a.timing.windowStart) : null;
  const endMs = a.timing.windowEnd ? Date.parse(a.timing.windowEnd) : null;
  const passes = a.timing.passes.map((p) => Date.parse(p.at));
  const anchors = [now, ...passes, ...(startMs ? [startMs] : []), ...(endMs ? [endMs] : [])];
  const span = Math.max(...anchors) - Math.min(...anchors) || 86400_000;
  const lo = (startMs ?? Math.min(...anchors) - span * 0.12);
  const hi = (endMs ?? Math.max(...anchors) + span * 0.12);
  const pct = (t: number) => `${(((t - lo) / (hi - lo)) * 100).toFixed(2)}%`;

  return (
    <div className={styles.timeline} aria-label="Activation timeline">
      <div className={styles.track}>
        <div
          className={styles.window}
          style={{ left: '0%', right: '0%' }}
          data-open-start={a.timing.openStart}
          data-open-end={a.timing.openEnd}
        />
        {a.timing.passes.map((p) => (
          <span
            key={p.at}
            className={p.perfects ? styles.pass : styles.nearPass}
            style={{ left: pct(Date.parse(p.at)) }}
            title={(p.perfects ? 'Exact ' : 'Closest approach ') + longDate(p.at)}
          />
        ))}
        <span className={styles.today} style={{ left: pct(now) }}><em>today</em></span>
      </div>
      <div className={styles.timelineLabels}>
        <span>{a.timing.openStart ? 'began before this view' : 'enters ' + shortDate(a.timing.windowStart)}</span>
        <span>{a.timing.openEnd ? 'continues beyond this view' : 'leaves ' + shortDate(a.timing.windowEnd)}</span>
      </div>
      {a.timing.passes.length > 1 ? (
        <p className={styles.timelineNote}>
          {a.timing.passes.length} passes in this window — the body turns retrograde and back, revisiting the contact.
        </p>
      ) : null}
    </div>
  );
}

function Deepening({
  a,
  field,
  natalAspects,
  reflectionContext,
  onClose,
  onShowOnWheel,
  onBringToMaia,
}: {
  a: TransitActivation;
  field: TransitField;
  natalAspects: NatalAspectInput[];
  reflectionContext?: WhatIsAliveNowProps['reflectionContext'];
  onClose: () => void;
  onShowOnWheel?: (a: TransitActivation) => void;
  onBringToMaia?: (text: string) => void;
}) {
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [keptHref, setKeptHref] = useState<string | null>(null);
  const tradition = transitTradition(a);
  const expressions = possibleHumanExpressions(a);
  const natalWeb = natalWebLinks(a.natal.point, natalAspects);
  const currentFieldContext = fieldContextLines(a, field.activations);

  function bring() {
    const lines = [
      'I am explicitly bringing one calculated transit from my chart into this conversation.',
      `Transit: ${a.transiting.body} ${a.aspect.name} natal ${a.natal.point}.`,
      `Geometry: ${a.transiting.body} at ${a.transiting.sign} ${a.transiting.degree.toFixed(1)}°${a.transiting.retrograde ? ' (retrograde)' : ''}; natal ${a.natal.point} at ${a.natal.sign} ${a.natal.degree.toFixed(1)}°; ${formatOrb(a.deviation)} from exact, ${a.motion}.`,
      `Timing: ${describeExact(a)}; ${describeWindow(a)}.`,
      reflectionText.trim() ? `My own words: ${reflectionText.trim()}` : null,
      'Please keep the calculated facts distinct from symbolic interpretation. Offer possibilities, not predictions or identity claims, and ask what I recognize in my own life.',
    ].filter((line): line is string => Boolean(line));
    onBringToMaia?.(lines.join('\n\n'));
  }

  async function keepReflection() {
    const text = reflectionText.trim();
    if (!text || !reflectionContext || reflectionSaving || keptHref) return;
    setReflectionSaving(true);
    setReflectionError(null);
    try {
      const response = await apiFetch('/api/astrology/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          zodiacMode: reflectionContext.zodiacMode,
          houseSystem: reflectionContext.houseSystem,
          ayanamsa: reflectionContext.ayanamsa ?? null,
          scope: 'transit',
          activation: { id: a.id, label: contactLabel(a) },
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || 'Could not keep this reflection');
      setKeptHref(typeof body?.href === 'string' ? body.href : null);
    } catch (error) {
      setReflectionError(error instanceof Error ? error.message : 'Could not keep this reflection');
    } finally {
      setReflectionSaving(false);
    }
  }

  return (
    <article id="alive-now-deepening" className={styles.deepening} aria-label={contactLabel(a)}>
      <header className={styles.deepHead}>
        <div>
          <small>CURRENT ACTIVATION · {phaseOf(a).toUpperCase()}</small>
          <h3>{a.transiting.body} {a.aspect.name} natal {a.natal.point}</h3>
          <p>
            {a.transiting.sign} {a.transiting.degree.toFixed(1)}° → {a.natal.sign} {a.natal.degree.toFixed(1)}° ·{' '}
            {formatOrb(a.deviation)} {a.deviation <= 1 / 60 ? 'exact' : a.motion}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close this activation">Close</button>
      </header>

      <div className={styles.layers}>
        <section className={styles.layer}>
          <small>CALCULATED</small>
          <ul>
            <li>{a.aspect.symbol} {a.aspect.name} ({a.aspect.angle}°), {formatOrb(a.deviation)} from exact within a {a.allowedOrb}° orb.</li>
            <li>
              {a.transiting.body} is {a.transiting.stationary ? 'near a station' : a.transiting.retrograde ? 'retrograde' : 'direct'},
              moving {Math.abs(a.transiting.speedPerDay).toFixed(Math.abs(a.transiting.speedPerDay) > 1 ? 1 : 3)}° per day.
            </li>
            <li>{describeWindow(a).replace(/^a/, 'A')}.</li>
            {a.timing.passes.length === 0 ? <li>{describeExact(a)}.</li> : null}
            {a.timing.passes.map((p) => (
              <li key={p.at}>{p.perfects ? 'Exact' : 'Closest approach'} {longDate(p.at)}{p.perfects ? '' : ` (${formatOrb(p.deviation)})`}.</li>
            ))}
          </ul>
          <Timeline a={a} nowIso={field.calculatedAt} />
        </section>

        <section className={styles.layer}>
          <small>WHY THIS IS SURFACED</small>
          <ul>{a.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>

        <section className={styles.layer}>
          <small>SYMBOLIC TRADITION</small>
          <p>{tradition}</p>
          <p className={styles.boundary}>This is a traditional symbolic lens, not a prediction and not a claim about your life.</p>
        </section>

        <section className={styles.layer}>
          <small>WITHIN YOUR WHOLE CHART</small>
          {currentFieldContext.map((line) => <p key={line}>{line}</p>)}
          {natalWeb.length ? (
            <>
              <p>Natal {a.natal.point} is already woven into these natal relationships:</p>
              <ul className={styles.natalWeb}>
                {natalWeb.map((link) => (
                  <li key={`${link.otherPoint}-${link.type}`}>
                    <b>{link.type} {link.otherPoint}</b> · {formatOrb(link.orb)}
                    {link.coreQuestion ? <span> — {link.coreQuestion}</span> : null}
                  </li>
                ))}
              </ul>
              <p className={styles.boundary}>These links come from the natal aspect library. They describe the birth chart, not the transit itself.</p>
            </>
          ) : currentFieldContext.length === 0 ? (
            <p>No additional natal-aspect link is available in the current chart data for this point. That is absence of context, not evidence that the point is isolated.</p>
          ) : null}
        </section>

        <section className={styles.layer}>
          <small>POSSIBLE HUMAN EXPRESSION</small>
          <ul>{expressions.map((line) => <li key={line}>{line}</li>)}</ul>
          <p className={styles.boundary}>These are possibilities for recognition, not forecasts, diagnoses or identity statements.</p>
        </section>

        <section className={styles.layer}>
          <small>YOUR MEANING</small>
          <p>What do you recognize here — including what does not fit?</p>
          <textarea
            className={styles.meaningTextarea}
            value={reflectionText}
            onChange={(event) => {
              setReflectionText(event.target.value);
              setReflectionError(null);
            }}
            maxLength={4000}
            placeholder="Write what is actually true for you…"
            aria-label="Your meaning for this transit"
          />
          {reflectionContext ? (
            <div className={styles.saveRow}>
              <button type="button" disabled={!reflectionText.trim() || reflectionSaving || Boolean(keptHref)} onClick={keepReflection}>
                {reflectionSaving ? 'Keeping…' : keptHref ? 'Kept as Reflection' : 'Keep my words as a Reflection'}
              </button>
              {keptHref ? <a className={styles.keptLink} href={keptHref}>Open this Reflection →</a> : null}
            </div>
          ) : null}
          {reflectionError ? <p className={styles.saveError}>{reflectionError}</p> : null}
          <div className={styles.actions}>
            {onShowOnWheel ? (
              <button type="button" onClick={() => onShowOnWheel(a)}>Show on the House Wheel</button>
            ) : null}
            {onBringToMaia ? (
              <button type="button" className={styles.primary} onClick={bring}>Bring this activation to MAIA →</button>
            ) : null}
          </div>
          <p className={styles.consent}>
            Your words stay here until you choose an action. Keeping stores only your words; bringing shares this activation and, if present, your words with MAIA.
          </p>
        </section>
      </div>
    </article>
  );
}

export default WhatIsAliveNow;
